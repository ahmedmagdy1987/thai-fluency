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
  dailyGoal: DEFAULT_DAILY_GOAL,
  dailyGoalsHit: 0,
  lastGoalHit: null,
  tonesQuizPassed: false,
  tonesQuizBest: 0,
  quizzesPassed: 0,
  perfectQuizzes: 0,
  dialoguesCompleted: [],
  unlockedAchievements: [],
  currentStage: 1,
  startedStage: 1,
  knownCardIds: [],
  hasOnboarded: false,
  voice: DEFAULT_VOICE,
  viewMode: DEFAULT_VIEW_MODE,
  theme: 'light',
  audioRate: 0.85,
  audioAutoPlay: false,
  streakFreezes: 1,
  lastFreezeGrant: null,
};

export function migrateStats(stats) {
  return { ...DEFAULT_STATS, ...stats };
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
    dailyGoalsHit: goalsHit,
    lastGoalHit: (wasUnderGoal && nowOverGoal) ? today : s.lastGoalHit,
    streakFreezes: usedFreeze ? Math.max(0, (s.streakFreezes || 0) - 1) : (s.streakFreezes || 0),
  };
}
