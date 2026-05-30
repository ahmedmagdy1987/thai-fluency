// Pure daily-quest evaluation — one source of truth for the four daily quests
// so the UI can never show contradictory states (e.g. XP goal done while the
// streak quest claims no study happened today). Extracted from QuestsScreen so
// it can be unit-checked (see scripts/check-quest-logic.mjs).
//
// All four quests key off today-scoped, Supabase-backed signals:
//   - todayXp / todayDate / lastStudy  (user_stats, reset daily on the client)
//   - progress[].lastReview timestamps (user_progress) → cards practiced today
//   - dashboardStats.due / .seen       (derived live from progress)

import { DEFAULT_DAILY_GOAL } from '../data/gamification.js';
import { getLocalDateKey, countCardsPracticedToday } from './stats.js';

export const CARDS_TARGET = 10;

export function evaluateDailyQuests({ stats, dashboardStats, progress, today = getLocalDateKey() } = {}) {
  const s = stats && typeof stats === 'object' ? stats : {};
  const dash = dashboardStats && typeof dashboardStats === 'object' ? dashboardStats : {};

  const goal = s.dailyGoal || DEFAULT_DAILY_GOAL;
  // Date-guard today's XP: only count it if the stored day is today (defensive
  // against the brief window before the client's day-rollover reset runs).
  const todayXp = (s.todayDate === today) ? (s.todayXp || 0) : 0;

  const due = dash.due || 0;
  const seen = dash.seen || 0;

  // Distinct cards practiced today (new learning, due reviews, or stage-review
  // replays) — a real count from progress timestamps, never an XP estimate.
  const practicedToday = countCardsPracticedToday(progress, today);

  // "Studied today" = any valid learning activity today: earned XP today
  // (lastStudy is set by grantXp on learn/due/challenge/mission/mini-unit) OR
  // practiced any card today (covers 0-XP stage-review). This — NOT the
  // multi-day streak counter — drives the "Keep your streak alive" quest.
  const studiedToday = (s.lastStudy === today) || practicedToday > 0;
  const streakCount = s.streak || 0;

  return {
    today,
    goal,
    todayXp,
    practicedToday,
    studiedToday,
    streakCount,
    daily: {
      id: 'daily-goal',
      todayXp,
      goal,
      pct: Math.min(100, Math.round((todayXp / goal) * 100)),
      done: todayXp >= goal,
    },
    cards: {
      id: 'cards-ten',
      practicedToday,
      target: CARDS_TARGET,
      pct: Math.min(100, Math.round((practicedToday / CARDS_TARGET) * 100)),
      done: practicedToday >= CARDS_TARGET,
    },
    due: {
      id: 'due-cards',
      due,
      seen,
      pct: seen > 0 ? Math.min(100, Math.round(((seen - due) / seen) * 100)) : 0,
      done: due === 0 && seen > 0,
    },
    streak: {
      id: 'streak',
      studiedToday,
      streakCount,
      pct: studiedToday ? 100 : 0,
      done: studiedToday,
    },
  };
}
