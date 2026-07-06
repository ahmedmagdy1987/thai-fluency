import { XP_REWARDS, DEFAULT_DAILY_GOAL } from '../data/gamification.js';
import { DEFAULT_VOICE, DEFAULT_VIEW_MODE, DEFAULT_CARD_DIRECTION } from './voice.js';

export const DEFAULT_STATS = {
  streak: 0,
  lastStudy: null,
  totalReviews: 0,
  dailyNewLimit: 10,
  totalXp: 0,
  todayXp: 0,
  todayDate: null,
  lastXpActivityAt: null,
  dailyGoal: DEFAULT_DAILY_GOAL,
  dailyGoalsHit: 0,
  lastGoalHit: null,
  tonesQuizPassed: false,
  tonesQuizBest: 0,
  quizzesPassed: 0,
  perfectQuizzes: 0,
  challengeAttempts: 0,
  challengeCorrect: 0,
  challengeWrong: 0,
  lastChallengeDate: null,
  bestChallengeScore: 0,
  bestChallengeTotal: 0,
  dialoguesCompleted: [],
  unlockedAchievements: [],
  currentStage: 1,
  startedStage: 1,
  knownCardIds: [],
  hasOnboarded: false,
  firstLessonCompleted: false,
  firstLessonProgress: null,
  activeMiniUnitId: null,
  miniUnitProgress: null,
  completedMiniUnits: [],
  // Units whose sentence-builder step has already paid out its one-time XP
  // (prevents replay/refresh from farming the builder reward).
  builderRewardedUnits: [],
  superPromptLastShownAt: null,
  // Premium entitlement tier. See src/config/entitlements.js. Defaults to 'free';
  // the REAL tier is overwritten at load by the server-authoritative entitlement
  // (subscriptions.super_until, written only by the Stripe webhook) via
  // cloudStorage.downloadEntitlement(). Intentionally NOT in the cloud-sync
  // whitelist — it is fetched separately and never trusted from client state.
  tier: 'free',
  // Celebration repeat-prevention ledger (see lib/celebrations.js). Date-keyed
  // quest IDs + durable milestone IDs. baselineDone seeds existing completions
  // once so they aren't retroactively celebrated.
  celebratedIds: [],
  celebrationBaselineDone: false,
  voice: DEFAULT_VOICE,
  viewMode: DEFAULT_VIEW_MODE,
  cardDirection: DEFAULT_CARD_DIRECTION,
  theme: 'light',
  audioRate: 0.8,
  audioAutoPlay: false,
  soundEffects: true,
  streakFreezes: 1,
  lastFreezeGrant: null,
  // Hearts + gems economy (see src/lib/economy.js + migration 009). Hearts are
  // gentle "lives" used ONLY in the Challenge (never in flashcard review or the
  // guided path); they regenerate over time and are unlimited for Super users.
  // Gems are earned currency spent in the Shop to refill hearts. heartsUpdatedAt
  // anchors the regeneration clock (mapped from the hearts_updated_at column).
  hearts: 5,
  gems: 0,
  heartsUpdatedAt: null,
  // Lesson preferences. showCharacters and soundEffects default ON; signed-in
  // users also sync these through profiles.settings when available.
  showCharacters: true,
  // First-run guided tutorial: shown once automatically on the Learn screen,
  // replayable from Settings. Persists locally + (signed-in) via profiles.settings.
  tutorialSeen: false,
  // Stage ids whose completion cinematic has already played, so a reward video
  // never replays after refresh. The cinematic itself never grants rewards.
  cinematicsWatched: [],
};

export function getLocalDateKey(date = new Date()) {
  const local = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(local.getTime())) return null;
  const year = local.getFullYear();
  const month = String(local.getMonth() + 1).padStart(2, '0');
  const day = String(local.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function previousLocalDateKey(date = new Date()) {
  const local = date instanceof Date ? new Date(date.getTime()) : new Date(date);
  if (Number.isNaN(local.getTime())) return null;
  local.setDate(local.getDate() - 1);
  return getLocalDateKey(local);
}

export function dateKeyFromValue(value) {
  if (!value) return null;
  if (typeof value === 'string') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : getLocalDateKey(parsed);
  }
  return getLocalDateKey(value);
}

// Count distinct cards the user has practiced (reviewed / learned / marked
// known) in the current local day, derived live from the progress object. Each
// card carries a `lastReview` ms timestamp that reviewCard/markCardsKnown set
// on every touch, so this counts each card once (no double-counting) regardless
// of how many times it was reviewed today. Covers new learning, due reviews,
// and stage-review replays alike — no new persistence is required.
export function countCardsPracticedToday(progress, today = getLocalDateKey()) {
  const safe = progress && typeof progress === 'object' ? progress : {};
  return Object.values(safe).filter(
    (c) => c && c.lastReview && getLocalDateKey(new Date(c.lastReview)) === today
  ).length;
}

export function hasStatsLearningActivity(stats = {}) {
  return (
    (stats.totalXp || 0) > 0 ||
    (stats.totalReviews || 0) > 0 ||
    (stats.quizzesPassed || 0) > 0 ||
    (stats.perfectQuizzes || 0) > 0 ||
    (stats.dailyGoalsHit || 0) > 0 ||
    (stats.tonesQuizBest || 0) > 0 ||
    stats.tonesQuizPassed === true ||
    (stats.currentStage || 1) > 1 ||
    (stats.startedStage || 1) > 1 ||
    (stats.stage1CelebrationShown === true) ||
    (Array.isArray(stats.knownCardIds) && stats.knownCardIds.length > 0) ||
    (Array.isArray(stats.dialoguesCompleted) && stats.dialoguesCompleted.length > 0) ||
    (Array.isArray(stats.unlockedAchievements) && stats.unlockedAchievements.length > 0)
  );
}

export function migrateStats(stats) {
  const migrated = { ...DEFAULT_STATS, ...stats };
  migrated.todayDate = dateKeyFromValue(migrated.todayDate);
  migrated.lastStudy = dateKeyFromValue(migrated.lastStudy);
  migrated.lastChallengeDate = dateKeyFromValue(migrated.lastChallengeDate);
  // Normalize cached audio rates from older Settings selectors onto the
  // current, slower beginner-tuned spread (0.65 / 0.8 / 1.0). Owner feedback:
  // the previous "Natural" 0.95 was too fast for beginner review.
  if (migrated.audioRate === 0.85 || migrated.audioRate === 0.95) migrated.audioRate = 0.8;
  if (migrated.audioRate === 0.7) migrated.audioRate = 0.65;
  if (migrated.audioRate === 1 || migrated.audioRate === 1.15) migrated.audioRate = 1.0;
  if (migrated.cardDirection !== 'th-first' && migrated.cardDirection !== 'en-first') {
    migrated.cardDirection = DEFAULT_CARD_DIRECTION;
  }
  if (!migrated.firstLessonCompleted && hasStatsLearningActivity(migrated)) {
    migrated.firstLessonCompleted = true;
  }
  return migrated;
}

const STREAK_DAY_MS = 24 * 60 * 60 * 1000;

// Pure streak-rollover decision, shared by grantXp. Keys on `lastStudy` (the last
// day XP was actually earned) — NOT `todayDate`, which the day-rollover effect
// pre-sets to today on load before the user studies. Returns the new streak and
// whether a freeze was consumed.
//   • same day again        → unchanged.
//   • studied yesterday      → +1.
//   • gap ≤ 2 days + freeze  → +1, freeze consumed.
//   • longer gap / no freeze → reset to 1.
export function computeStreak(s, today, yesterday, nowMs = Date.now()) {
  if ((s.lastStudy || null) === today) {
    return { streak: s.streak || 0, usedFreeze: false };
  }
  if (s.lastStudy === yesterday) {
    return { streak: (s.streak || 0) + 1, usedFreeze: false };
  }
  const daysSince = s.lastStudy
    ? Math.floor((nowMs - new Date(s.lastStudy).getTime()) / STREAK_DAY_MS)
    : 999;
  if (daysSince <= 2 && (s.streakFreezes || 0) > 0) {
    return { streak: (s.streak || 0) + 1, usedFreeze: true };
  }
  return { streak: 1, usedFreeze: false };
}

export function startStudyDay(s, today, newStreak, amount, usedFreeze) {
  const isNewDay = s.todayDate !== today;
  const baseTodayXp = isNewDay ? 0 : (s.todayXp || 0);
  const newTodayXp = baseTodayXp + amount;
  const wasUnderGoal = baseTodayXp < s.dailyGoal;
  const nowOverGoal = newTodayXp >= s.dailyGoal;
  const goalsHit = (wasUnderGoal && nowOverGoal) ? (s.dailyGoalsHit || 0) + 1 : (s.dailyGoalsHit || 0);
  const goalBonus = (wasUnderGoal && nowOverGoal) ? XP_REWARDS.dailyGoalBonus : 0;
  return {
    ...s,
    streak: newStreak,
    lastStudy: today,
    todayDate: today,
    todayXp: newTodayXp + goalBonus,
    totalXp: (s.totalXp || 0) + amount + goalBonus,
    lastXpActivityAt: new Date().toISOString(),
    dailyGoalsHit: goalsHit,
    lastGoalHit: (wasUnderGoal && nowOverGoal) ? today : s.lastGoalHit,
    streakFreezes: usedFreeze ? Math.max(0, (s.streakFreezes || 0) - 1) : (s.streakFreezes || 0),
  };
}
