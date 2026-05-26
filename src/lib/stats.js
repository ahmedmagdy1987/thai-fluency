import { XP_REWARDS, DEFAULT_DAILY_GOAL } from '../data/gamification.js';
import { DEFAULT_VOICE, DEFAULT_VIEW_MODE } from './voice.js';

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
  voice: DEFAULT_VOICE,
  viewMode: DEFAULT_VIEW_MODE,
  theme: 'light',
  audioRate: 0.95,
  audioAutoPlay: false,
  soundEffects: true,
  streakFreezes: 1,
  lastFreezeGrant: null,
  // Lesson preferences. showCharacters and soundEffects default ON; signed-in
  // users also sync these through profiles.settings when available.
  showCharacters: true,
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
  // Legacy Settings used 0.85 as "Natural" and 1 as "Fast". Normalize old
  // cached values to the clearer speed spread used by the current selector.
  if (migrated.audioRate === 0.85) migrated.audioRate = 0.95;
  if (migrated.audioRate === 1) migrated.audioRate = 1.15;
  if (!migrated.firstLessonCompleted && hasStatsLearningActivity(migrated)) {
    migrated.firstLessonCompleted = true;
  }
  return migrated;
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
