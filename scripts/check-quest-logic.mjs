#!/usr/bin/env node
//
// Code-level QA for daily-quest logic (lib/dailyQuests.js + lib/stats.js).
// Exercises the REAL evaluateDailyQuests / countCardsPracticedToday against
// synthetic stats/progress for the Part-7 scenarios. The central guarantee:
// "Keep your streak alive" completes on ANY valid learning activity today and
// never contradicts the XP / practice / review quests. Exits non-zero on fail.

import { getLocalDateKey, previousLocalDateKey, countCardsPracticedToday } from '../src/lib/stats.js';
import { evaluateDailyQuests, CARDS_TARGET } from '../src/lib/dailyQuests.js';
import { DEFAULT_DAILY_GOAL } from '../src/data/gamification.js';

const todayKey = getLocalDateKey();
const yKey = previousLocalDateKey();
const NOW = Date.now();
const OLD = NOW - 3 * 24 * 60 * 60 * 1000; // safely a previous local day

let failures = 0;
function check(label, cond, extra = '') {
  if (cond) console.log(`OK   ${label}`);
  else { failures += 1; console.error(`FAIL ${label}${extra ? ' — ' + extra : ''}`); }
}

// Build a progress object: `todayCount` cards reviewed today, `oldCount` cards
// reviewed on a previous day.
function makeProgress(todayCount, oldCount = 0) {
  const p = {};
  let id = 1;
  for (let i = 0; i < todayCount; i++) p[id++] = { lastReview: NOW, nextDue: NOW + 86400000, interval: 1, ease: 2.5, reviews: 1, lapses: 0, learning: false };
  for (let i = 0; i < oldCount; i++) p[id++] = { lastReview: OLD, nextDue: OLD + 86400000, interval: 1, ease: 2.5, reviews: 1, lapses: 0, learning: false };
  return p;
}

console.log(`Quest logic check — today=${todayKey}, yesterday=${yKey}`);

// ── Scenario 1: Fresh day, no activity (streak counter carried over) ─────────
{
  // Stale todayXp from yesterday + a multi-day streak counter, but no activity today.
  const stats = { dailyGoal: DEFAULT_DAILY_GOAL, todayXp: 999, todayDate: yKey, lastStudy: yKey, streak: 5 };
  const r = evaluateDailyQuests({ stats, dashboardStats: { due: 0, seen: 0 }, progress: makeProgress(0, 8) });
  check('S1 fresh day: today XP date-guarded to 0', r.todayXp === 0, `got ${r.todayXp}`);
  check('S1 fresh day: daily-goal incomplete', r.daily.done === false);
  check('S1 fresh day: practice-10 incomplete (0 practiced)', r.cards.done === false && r.practicedToday === 0);
  check('S1 fresh day: STREAK quest incomplete despite streakCount=5', r.streak.done === false, `studiedToday=${r.studiedToday}`);
  check('S1 fresh day: streak counter preserved for display', r.streakCount === 5);
}

// ── Scenario 2: Complete one Learn card today ────────────────────────────────
{
  const stats = { dailyGoal: DEFAULT_DAILY_GOAL, todayXp: 3, todayDate: todayKey, lastStudy: todayKey, streak: 1 };
  const r = evaluateDailyQuests({ stats, dashboardStats: { due: 2, seen: 1 }, progress: makeProgress(1) });
  check('S2 one card: today XP counts (3)', r.todayXp === 3);
  check('S2 one card: STREAK quest complete', r.streak.done === true);
  check('S2 one card: practice-10 increments (1) not done', r.practicedToday === 1 && r.cards.done === false);
  check('S2 one card: refresh-stable (recompute equal)', evaluateDailyQuests({ stats, dashboardStats: { due: 2, seen: 1 }, progress: makeProgress(1) }).streak.done === true);
}

// ── Scenario 3: Complete 10 cards today ──────────────────────────────────────
{
  const stats = { dailyGoal: DEFAULT_DAILY_GOAL, todayXp: 30, todayDate: todayKey, lastStudy: todayKey, streak: 2 };
  const r = evaluateDailyQuests({ stats, dashboardStats: { due: 0, seen: 10 }, progress: makeProgress(10, 3) });
  check('S3 ten cards: practice-10 complete', r.cards.done === true && r.practicedToday === 10);
  check('S3 ten cards: STREAK quest complete', r.streak.done === true);
  check('S3 ten cards: practicedToday ignores old cards (distinct today only)', r.practicedToday === 10);
}

// ── Scenario 4: Complete a Challenge only (XP, but no card reviews today) ─────
{
  const stats = { dailyGoal: DEFAULT_DAILY_GOAL, todayXp: 25, todayDate: todayKey, lastStudy: todayKey, streak: 0 };
  const r = evaluateDailyQuests({ stats, dashboardStats: { due: 0, seen: 12 }, progress: makeProgress(0, 12) });
  check('S4 challenge-only: STREAK complete (challenge XP counts as activity)', r.streak.done === true);
  check('S4 challenge-only: practice-10 NOT inflated (0 cards reviewed today)', r.practicedToday === 0 && r.cards.done === false);
}

// ── Scenario 5: Stage-review replays only, 0 XP today ────────────────────────
{
  // No XP earned today (lastStudy is yesterday), but 5 cards were touched today.
  const stats = { dailyGoal: DEFAULT_DAILY_GOAL, todayXp: 0, todayDate: todayKey, lastStudy: yKey, streak: 4 };
  const r = evaluateDailyQuests({ stats, dashboardStats: { due: 0, seen: 20 }, progress: makeProgress(5, 15) });
  check('S5 stage-review 0-XP: STREAK complete via practicedToday>0', r.streak.done === true);
  check('S5 stage-review 0-XP: practicedToday counts replays (5)', r.practicedToday === 5);
}

// ── Scenario 6: No contradictory states (Part 6) ─────────────────────────────
{
  // Daily goal hit -> streak must also be complete.
  const goalHit = evaluateDailyQuests({
    stats: { dailyGoal: DEFAULT_DAILY_GOAL, todayXp: DEFAULT_DAILY_GOAL, todayDate: todayKey, lastStudy: todayKey, streak: 1 },
    dashboardStats: { due: 1, seen: 20 }, progress: makeProgress(2),
  });
  check('S6 daily-goal done ⇒ streak done', !(goalHit.daily.done && !goalHit.streak.done));
  // Practice 10 done -> streak must also be complete (even if all were 0-XP).
  const tenDone = evaluateDailyQuests({
    stats: { dailyGoal: DEFAULT_DAILY_GOAL, todayXp: 0, todayDate: todayKey, lastStudy: yKey, streak: 0 },
    dashboardStats: { due: 0, seen: 30 }, progress: makeProgress(10, 5),
  });
  check('S6 practice-10 done ⇒ streak done', !(tenDone.cards.done && !tenDone.streak.done));
}

// ── Scenario 7: New-day reset keeps lifetime streak counter, resets done ─────
{
  const stats = { dailyGoal: DEFAULT_DAILY_GOAL, todayXp: 120, todayDate: yKey, lastStudy: yKey, streak: 9 };
  const r = evaluateDailyQuests({ stats, dashboardStats: { due: 5, seen: 40 }, progress: makeProgress(0, 40) });
  check('S7 new day: streak quest resets to incomplete', r.streak.done === false);
  check('S7 new day: lifetime streak counter preserved (9)', r.streakCount === 9);
  check('S7 new day: stale today XP not counted', r.todayXp === 0 && r.daily.done === false);
}

// ── countCardsPracticedToday: distinct, no double-count ──────────────────────
{
  // Same card object reviewed "twice today" is still one entry in progress, so
  // it counts once. Build 3 today + 4 old; expect 3.
  const p = makeProgress(3, 4);
  check('practiced count: distinct today only (3 of 7)', countCardsPracticedToday(p, todayKey) === 3, `got ${countCardsPracticedToday(p, todayKey)}`);
  check('practiced count: empty/invalid progress -> 0', countCardsPracticedToday(undefined, todayKey) === 0 && countCardsPracticedToday(null, todayKey) === 0);
  check('CARDS_TARGET is 10', CARDS_TARGET === 10);
}

if (failures > 0) {
  console.error(`\nQuest logic check FAILED: ${failures} assertion(s) failed.`);
  process.exit(1);
}
console.log('\nQuest logic check passed.');
