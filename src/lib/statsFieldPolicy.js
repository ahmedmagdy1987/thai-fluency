// ─────────────────────────────────────────────────────────────────────────────
// STATS FIELD POLICY — the single, exhaustive registry of how every stats field
// resolves when LOCAL and CLOUD disagree.
//
// ── WHY THIS FILE EXISTS (Wave 12, root cause 1) ─────────────────────────────
// mergeStats used to build its result as `{ ...cloud }` and then overlay only
// the fields named in three lists (MAX / OR / UNION). Anything NOT in a list was
// cloud-authoritative BY OMISSION. That default is the bug generator: it is
// silent, it is invisible at the call site, and EVERY field added in the future
// inherits it. `gems` and `streakFreezes` were never listed, so a stale cloud
// row destroyed a completed purchase — 31 streak freezes bought for 930 gems,
// reverted to 933 gems / 0 freezes the moment an old row was merged back in.
//
// The class of bug is "the merge has no concept of which state is newer". This
// file plus the staleness check in progressMerge.js eliminates it:
//
//   1. EVERY field is classified HERE, explicitly. Nothing is classified by
//      omission ever again.
//   2. An UNREGISTERED field does not silently become cloud-authoritative — it
//      resolves as OWNED (the protective class). Forgetting to register a new
//      field can no longer lose user data; it can only be over-cautious.
//   3. scripts/check-merge-staleness.mjs fails CI if any field reachable from
//      DEFAULT_STATS or the cloud upload/download mappings is missing here, so
//      "unregistered" is a build error, not a runtime surprise.
//
// ── THE CLASSES ──────────────────────────────────────────────────────────────
//   CLOUD  — cloud always wins, even when the cloud row is stale. Reserved for
//            values a client must never be able to raise: earned XP and the
//            server-derived entitlement inputs. This is the anti-forgery class
//            and it is deliberately NOT weakened by the staleness check.
//   MAX    — numeric, monotonic, non-rewarding. max(local, cloud).
//   OR     — sticky once-true milestone flags.
//   UNION  — set-valued ledgers; membership never revoked.
//   OWNED  — user-owned value that a stale cloud row must never destroy:
//            currency, purchased goods, the live streak and its inputs, and
//            today's progress. Cloud wins normally; LOCAL wins when the cloud
//            row is provably stale (see progressMerge.isCloudStatsStale).
//   DEVICE — local-only; never uploaded, never downloaded. Excluded from the
//            merge result entirely so a cloud row cannot blank it.
//
// ── WHY "OWNED" DOES NOT OPEN A FORGERY HOLE ────────────────────────────────
// Local only wins for OWNED fields when the cloud row has NOT advanced since
// this device last synced — i.e. when the cloud demonstrably cannot contain the
// user's latest actions. Staleness is decided against `user_stats.updated_at`,
// which is written by the server trigger `set_user_stats_updated_at`
// (supabase/schema.sql:235-238) and CANNOT be set by a client: the trigger
// overwrites whatever value is sent. A forger therefore cannot manufacture the
// staleness condition.
//
// More fundamentally: the merge was never the forgery boundary. The client
// already uploads whatever it holds via uploadStats, and anyone with a token can
// POST to PostgREST directly without running our merge at all. Forgery is bounded
// server-side by `guard_user_stats` (20260704145648), which clamps every write —
// gems +1000/write max and >= 0, total_xp monotonic and +10000/write max, hearts
// 0..5, current_streak +1/write max. That trigger is UNCHANGED by Wave 12 and is
// what actually makes forgery impossible. `totalXp` additionally stays class
// CLOUD here, so the single highest-value forgery target never takes a local
// value under any condition.
// ─────────────────────────────────────────────────────────────────────────────

export const FIELD_CLASS = Object.freeze({
  CLOUD: 'cloud',
  MAX: 'max',
  OR: 'or',
  UNION: 'union',
  OWNED: 'owned',
  DEVICE: 'device',
});

// The protective default. An unregistered field resolves as OWNED so that
// forgetting to register something can never silently destroy it.
export const DEFAULT_CLASS = FIELD_CLASS.OWNED;

export const STATS_FIELD_POLICY = Object.freeze({
  // ── CLOUD (anti-forgery: never take a local value) ─────────────────────────
  // Earned XP is the forgery target the server ratchets; it stays cloud-only.
  totalXp: FIELD_CLASS.CLOUD,
  lastXpActivityAt: FIELD_CLASS.CLOUD,
  // Account-level preference synced through profiles.settings, never a reward.
  identityPath: FIELD_CLASS.CLOUD,
  dailyGoal: FIELD_CLASS.CLOUD,

  // ── OWNED (user value a stale row must never destroy) ──────────────────────
  gems: FIELD_CLASS.OWNED,                // earned currency; spent on purchases
  streakFreezes: FIELD_CLASS.OWNED,       // PURCHASED goods (30 gems each)
  lastFreezeGrant: FIELD_CLASS.OWNED,     // paired with streakFreezes
  hearts: FIELD_CLASS.OWNED,              // refillable for 50 gems
  heartsUpdatedAt: FIELD_CLASS.OWNED,     // the regen anchor; pairs with hearts
  streak: FIELD_CLASS.OWNED,              // the live streak — no DB decrease guard
  lastStudy: FIELD_CLASS.OWNED,           // computeStreak keys entirely on this
  todayXp: FIELD_CLASS.OWNED,             // today's daily-goal progress
  todayDate: FIELD_CLASS.OWNED,           // paired with todayXp (rollover zeroes it)
  dailyGoalsHit: FIELD_CLASS.OWNED,       // monotonic earned counter, feeds achievements
  lastChallengeDate: FIELD_CLASS.OWNED,   // gates the daily Challenge reward
  startedStage: FIELD_CLASS.OWNED,        // placement result; set once, never re-earned

  // ── MAX (monotonic, non-rewarding display/aggregate counters) ──────────────
  longestStreak: FIELD_CLASS.MAX,
  totalReviews: FIELD_CLASS.MAX,
  currentStage: FIELD_CLASS.MAX,
  lastSeenMission: FIELD_CLASS.MAX,
  tonesQuizBest: FIELD_CLASS.MAX,
  quizzesPassed: FIELD_CLASS.MAX,
  perfectQuizzes: FIELD_CLASS.MAX,
  challengeAttempts: FIELD_CLASS.MAX,
  challengeCorrect: FIELD_CLASS.MAX,
  challengeWrong: FIELD_CLASS.MAX,
  bestChallengeScore: FIELD_CLASS.MAX,
  bestChallengeTotal: FIELD_CLASS.MAX,

  // ── OR (sticky once-true milestones) ──────────────────────────────────────
  tonesQuizPassed: FIELD_CLASS.OR,
  tutorialSeen: FIELD_CLASS.OR,
  stage1CelebrationShown: FIELD_CLASS.OR,
  firstLessonCompleted: FIELD_CLASS.OR,
  celebrationBaselineDone: FIELD_CLASS.OR,
  // Flips true once, at the placement commit (App.jsx:821/1981), and never back.
  // Found UNREGISTERED by check-merge-staleness.mjs: it was cloud-authoritative by
  // omission, so a stale row reading false would have thrown an onboarded user
  // back to the onboarding screen (App.jsx:2940 gates the whole shell on it).
  hasOnboarded: FIELD_CLASS.OR,

  // ── UNION (set-valued ledgers) ────────────────────────────────────────────
  dialoguesCompleted: FIELD_CLASS.UNION,
  knownCardIds: FIELD_CLASS.UNION,
  unlockedAchievements: FIELD_CLASS.UNION,
  completedMiniUnits: FIELD_CLASS.UNION,
  builderRewardedUnits: FIELD_CLASS.UNION,
  celebratedIds: FIELD_CLASS.UNION,
  cinematicsWatched: FIELD_CLASS.UNION,

  // ── DEVICE (never synced; excluded from the merged patch) ─────────────────
  // Entitlement is applied by the caller from the server-authoritative
  // subscriptions row and must never ride along on a stats merge.
  tier: FIELD_CLASS.DEVICE,
  superUntil: FIELD_CLASS.DEVICE,
  cancelAtPeriodEnd: FIELD_CLASS.DEVICE,
  status: FIELD_CLASS.DEVICE,
  // Local-only UI/session state.
  masteryRank: FIELD_CLASS.DEVICE,        // merged separately by mergeMasteryRank
  superPromptLastShownAt: FIELD_CLASS.DEVICE,
  voice: FIELD_CLASS.DEVICE,
  viewMode: FIELD_CLASS.DEVICE,
  cardDirection: FIELD_CLASS.DEVICE,
  theme: FIELD_CLASS.DEVICE,
  audioRate: FIELD_CLASS.DEVICE,
  audioAutoPlay: FIELD_CLASS.DEVICE,
  soundEffects: FIELD_CLASS.DEVICE,
  showCharacters: FIELD_CLASS.DEVICE,
  dailyNewLimit: FIELD_CLASS.DEVICE,
  lastGoalHit: FIELD_CLASS.DEVICE,
  miniUnitProgress: FIELD_CLASS.DEVICE,
  activeMiniUnitId: FIELD_CLASS.DEVICE,
  firstLessonProgress: FIELD_CLASS.DEVICE,
});

export function classOf(field) {
  return STATS_FIELD_POLICY[field] || DEFAULT_CLASS;
}

export function fieldsOfClass(cls) {
  return Object.keys(STATS_FIELD_POLICY).filter(k => STATS_FIELD_POLICY[k] === cls);
}

export const OWNED_FIELDS = fieldsOfClass(FIELD_CLASS.OWNED);
export const CLOUD_FIELDS = fieldsOfClass(FIELD_CLASS.CLOUD);
export const DEVICE_FIELDS = fieldsOfClass(FIELD_CLASS.DEVICE);
export const REGISTERED_FIELDS = Object.keys(STATS_FIELD_POLICY);
