// Deterministic, conservative merge of LOCAL and CLOUD state at sign-in (M2).
//
// The bug this fixes: on sign-in the app replaced local state with cloud
// (`setProgress(cloud)` + spreading cloud stats over local). A user who studied
// anonymously/offline and then signed into an account that already had cloud data
// silently lost their local SRS progress, completed lessons, achievements, etc.
//
// SAFETY INVARIANTS (this file never violates them):
//   • Merging NEVER grants a reward. It only combines already-earned state; XP is
//     awarded exclusively through the gameplay reward paths, never at load. So a
//     merge can never create a reward_event or bump XP by itself.
//   • XP / currency / streak / today stay CLOUD-authoritative — local values are
//     never added on top (no double-count) and a forged-high local value can never
//     raise them.
//   • Super/entitlement is NOT handled here at all. Tier comes only from
//     subscriptions.super_until (applied separately by the caller). Merged output
//     deliberately omits tier/superUntil so local can never grant Super.
//   • Learning progress is preserved from BOTH sides: no card is dropped, review
//     counts and lapse history never decrease, a graduated card never un-graduates,
//     and completed lessons/achievements are unioned (completed/unlocked wins).

function num(v) { return Number.isFinite(v) ? v : 0; }
function unionIds(a, b) {
  return [...new Set([...(Array.isArray(a) ? a : []), ...(Array.isArray(b) ? b : [])])];
}

// ── Mastery-rank merge (class MAX, per-card) ─────────────────────────────────
// `masteryRank` is a NEW sibling map in stats ({ [cardId]: 0|1|2|3 }) recording
// the derived mastery overlay (taught→recognized→produced→spoken). It lives
// OUTSIDE the SRS card object (mergeCard is untouched). Merge = element-wise
// Math.max over the union of card ids: monotonic and non-rewarding, so a merge
// can never grant a reward or a tier and never downgrades a learner's depth —
// identical policy to interval/reviews/currentStage (the STATS_MAX counters).
// Never routed through tier (mergeStats deletes tier/superUntil below).
export function mergeMasteryRank(localMap, cloudMap) {
  const l = localMap && typeof localMap === 'object' ? localMap : {};
  const c = cloudMap && typeof cloudMap === 'object' ? cloudMap : {};
  const out = {};
  const ids = new Set([...Object.keys(l), ...Object.keys(c)]);
  for (const id of ids) out[id] = Math.max(num(l[id]), num(c[id]));
  return out;
}

// ── Per-card SRS merge ───────────────────────────────────────────────────────
// "More advanced" is ordered by review count, then interval (mastery / how far
// out it is scheduled), then most-recent study. The dominant entry supplies the
// coherent SRS schedule (ease/interval/nextDue/lastReview); review count and lapse
// history are taken as the max of both sides so neither can decrease; and the card
// is treated as graduated if EITHER side had graduated it.
function advancementScore(e) {
  return [num(e.reviews), num(e.interval), num(e.lastReview)];
}
function dominant(a, b) {
  const sa = advancementScore(a);
  const sb = advancementScore(b);
  for (let i = 0; i < sa.length; i++) {
    if (sa[i] !== sb[i]) return sa[i] > sb[i] ? a : b;
  }
  return a; // fully tied → local (a) is fine; fields below are symmetric anyway
}
export function mergeCard(local, cloud) {
  if (!local) return cloud;
  if (!cloud) return local;
  const dom = dominant(local, cloud);
  // Graduated = has been reviewed at least once and is no longer in the learning
  // phase. If either side graduated the card, the merged card stays graduated.
  const graduated = (num(local.reviews) > 0 && local.learning === false)
    || (num(cloud.reviews) > 0 && cloud.learning === false);
  return {
    ease: dom.ease ?? 2.5,
    interval: Math.max(num(local.interval), num(cloud.interval)),
    reviews: Math.max(num(local.reviews), num(cloud.reviews)),
    lapses: Math.max(num(local.lapses), num(cloud.lapses)),
    learning: graduated ? false : !!dom.learning,
    // Keep the later due date: the more-advanced schedule wins and reviews/lapses
    // are preserved independently, so a later nextDue never erases reviewed state.
    nextDue: Math.max(num(local.nextDue), num(cloud.nextDue)),
    lastReview: Math.max(num(local.lastReview), num(cloud.lastReview)),
  };
}

// Merge two whole progress maps ({ [cardId]: srsState }). Union of card ids; each
// shared card merged by mergeCard. Never drops a card from either side.
export function mergeProgress(local, cloud) {
  const safeLocal = local && typeof local === 'object' ? local : {};
  const safeCloud = cloud && typeof cloud === 'object' ? cloud : {};
  const out = {};
  const ids = new Set([...Object.keys(safeLocal), ...Object.keys(safeCloud)]);
  for (const id of ids) out[id] = mergeCard(safeLocal[id], safeCloud[id]);
  return out;
}

// ── Stats merge ──────────────────────────────────────────────────────────────
// Field rules, grouped by policy. Anything not listed defaults to CLOUD authority.
//
//   CLOUD-authoritative (never raised by local — reward/currency/date/streak):
//     totalXp, streak, todayXp, todayDate, lastStudy, lastXpActivityAt,
//     dailyGoal, dailyGoalsHit, streakFreezes, lastFreezeGrant, lastChallengeDate,
//     hearts, gems, heartsUpdatedAt, startedStage
//   MAX (monotonic, non-rewarding display/aggregate counters — never lose progress):
//     longestStreak, totalReviews, currentStage, lastSeenMission, tonesQuizBest,
//     quizzesPassed, perfectQuizzes, challengeAttempts, challengeCorrect,
//     challengeWrong, bestChallengeScore, bestChallengeTotal
//   OR (sticky once-true milestones):
//     tonesQuizPassed, tutorialSeen, stage1CelebrationShown
//   UNION (set-valued learning/state ledgers — completed/unlocked wins):
//     dialoguesCompleted, knownCardIds, unlockedAchievements
const STATS_MAX = ['longestStreak', 'totalReviews', 'currentStage', 'lastSeenMission',
  'tonesQuizBest', 'quizzesPassed', 'perfectQuizzes', 'challengeAttempts',
  'challengeCorrect', 'challengeWrong', 'bestChallengeScore', 'bestChallengeTotal'];
const STATS_OR = ['tonesQuizPassed', 'tutorialSeen', 'stage1CelebrationShown'];
const STATS_UNION = ['dialoguesCompleted', 'knownCardIds', 'unlockedAchievements'];

// Merge cloud stats INTO local stats. Cloud is the authority base; local only
// contributes MAX counters, OR flags, and UNION ledgers. Returns a stats patch to
// spread over the current stats. Never includes tier/superUntil (entitlement is
// applied separately by the caller). `cloud` is the object from downloadStats().
export function mergeStats(local, cloud) {
  const l = local && typeof local === 'object' ? local : {};
  const c = cloud && typeof cloud === 'object' ? cloud : {};
  // Start from cloud so every cloud-authoritative field wins by default.
  const out = { ...c };
  for (const k of STATS_MAX) out[k] = Math.max(num(l[k]), num(c[k]));
  for (const k of STATS_OR) out[k] = !!l[k] || !!c[k];
  for (const k of STATS_UNION) out[k] = unionIds(l[k], c[k]);
  // Mastery overlay: per-card MAX merge (monotonic, non-rewarding). Only emit a
  // merged map when either side actually has one, so untouched stats stay clean.
  if ((l.masteryRank && typeof l.masteryRank === 'object') || (c.masteryRank && typeof c.masteryRank === 'object')) {
    out.masteryRank = mergeMasteryRank(l.masteryRank, c.masteryRank);
  }
  // Guard: entitlement fields must never be carried by a stats merge.
  delete out.tier;
  delete out.superUntil;
  delete out.cancelAtPeriodEnd;
  return out;
}

// ── Cloud profile-settings merge ─────────────────────────────────────────────
// profiles.settings holds account-level preferences AND a few learning ledgers.
// UI preferences are account-synced (cloud wins, existing behavior). Learning
// ledgers must UNION (a completed lesson/watched cinematic is never un-completed),
// and once-true flags OR. Returns a patch to spread over local stats.
const SETTINGS_UNION = ['completedMiniUnits', 'builderRewardedUnits', 'celebratedIds', 'cinematicsWatched'];
const SETTINGS_OR = ['firstLessonCompleted', 'celebrationBaselineDone', 'tutorialSeen'];
export function mergeCloudSettings(localStats, cloudSettings) {
  const l = localStats && typeof localStats === 'object' ? localStats : {};
  const c = cloudSettings && typeof cloudSettings === 'object' ? cloudSettings : {};
  const out = { ...c }; // UI prefs: cloud (account) wins
  for (const k of SETTINGS_UNION) {
    if (Array.isArray(l[k]) || Array.isArray(c[k])) out[k] = unionIds(l[k], c[k]);
  }
  for (const k of SETTINGS_OR) {
    if (k in l || k in c) out[k] = !!l[k] || !!c[k];
  }
  return out;
}
