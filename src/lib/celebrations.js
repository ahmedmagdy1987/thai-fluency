// Pure helpers for the celebration / reward-feedback system. No React, no DOM,
// no side effects — just celebration-ID construction and the repeat-prevention
// ledger logic. Unit-checked by scripts/check-celebrations.mjs.
//
// Repeat prevention: a celebration fires at most once per stable ID. Daily
// quest IDs are date-keyed (so they recur each day); milestone IDs (stage
// complete) are durable. `stats.celebratedIds` is the ledger (localStorage +
// profiles.settings). A one-time baseline seeds all currently-satisfied IDs so
// users who already met conditions before this feature shipped are NOT
// retroactively celebrated.

import { getLocalDateKey, previousLocalDateKey } from './stats.js';

// Maps evaluateDailyQuests() result keys → quest celebration slug + title.
export const QUEST_CELEBRATIONS = [
  { slot: 'daily', key: 'daily-xp-goal', title: 'Hit your daily XP goal' },
  { slot: 'cards', key: 'practice-10', title: 'Practice 10 cards today' },
  { slot: 'due', key: 'reviews-cleared', title: 'Review your due cards' },
  { slot: 'streak', key: 'streak-alive', title: 'Keep your streak alive' },
];

export function questCelebrationId(key, date = getLocalDateKey()) {
  return `quest:${key}:${date}`;
}
export function allQuestsCelebrationId(date = getLocalDateKey()) {
  return `quests:all-complete:${date}`;
}
export function stageCompleteCelebrationId(stageId) {
  return `stage-complete:${stageId}`;
}
// Global "finished every guided mini-unit" milestone (durable, versioned).
export function courseCompleteCelebrationId() {
  return 'course-complete:v1';
}
export function challengePerfectCelebrationId(stageId, date = getLocalDateKey()) {
  return `challenge-perfect:stage-${stageId}:${date}`;
}
// XP idempotency ledger IDs. A Stage Challenge pays XP at most once per stage per
// day, and the Tone Challenge at most once per day — so replaying a quiz ("Try
// again") can no longer farm XP. Date-keyed so legitimate daily practice still
// earns. Checked with hasCelebrated / recorded with markCelebrated, which already
// dedups across refresh, back-nav, double-click, and multiple tabs and syncs to
// profiles.settings.
export function challengeRewardId(stageId, date = getLocalDateKey()) {
  return `challenge-xp:stage-${stageId}:${date}`;
}
export function toneQuizRewardId(date = getLocalDateKey()) {
  return `tone-quiz-xp:${date}`;
}
// Gems idempotency for a PASSED Stage Challenge: award gems at most once per
// stage per day. Kept separate from challengeRewardId (the XP ledger) so a
// fail-then-pass on the same day still pays the pass gems exactly once — the XP
// ledger is marked on the first completion regardless of pass/fail, but gems
// should only fire on the pass.
export function challengeGemsId(stageId, date = getLocalDateKey()) {
  return `challenge-gems:stage-${stageId}:${date}`;
}
export function superCtaId(date = getLocalDateKey()) {
  return `super-cta:${date}`;
}

export function hasCelebrated(celebratedIds, id) {
  return Array.isArray(celebratedIds) && celebratedIds.includes(id);
}

const DATE_SUFFIX = /:(\d{4}-\d{2}-\d{2})$/;

// Keep the ledger small: drop date-keyed IDs older than yesterday; keep all
// durable (non-date) IDs forever (e.g. stage-complete:3).
export function pruneCelebrated(ids, today = getLocalDateKey(), yesterday = previousLocalDateKey()) {
  if (!Array.isArray(ids)) return [];
  return ids.filter((id) => {
    const m = String(id).match(DATE_SUFFIX);
    if (!m) return true;
    return m[1] === today || m[1] === yesterday;
  });
}

// Add one or more IDs to the ledger (idempotent + pruned). Returns the same
// array reference when nothing changed, so callers can skip redundant writes.
export function withCelebrated(ids, idOrIds, today = getLocalDateKey(), yesterday = previousLocalDateKey()) {
  const base = Array.isArray(ids) ? ids : [];
  const add = (Array.isArray(idOrIds) ? idOrIds : [idOrIds]).filter(Boolean);
  const missing = add.filter((id) => !base.includes(id));
  if (missing.length === 0) return base;
  return pruneCelebrated([...base, ...missing], today, yesterday);
}

// All currently-satisfied "persistent / today" celebration IDs — used to seed
// the baseline (so existing completions are not retroactively celebrated). Does
// NOT include event-only celebrations (perfect challenge), which fire from the
// completion handler, not from steady-state conditions.
export function activeCelebrationIds({ quests, stageState, courseComplete = false, today = getLocalDateKey() } = {}) {
  const ids = [];
  if (quests) {
    QUEST_CELEBRATIONS.forEach((q) => {
      if (quests[q.slot] && quests[q.slot].done) ids.push(questCelebrationId(q.key, today));
    });
    if (allQuestsComplete(quests)) ids.push(allQuestsCelebrationId(today));
  }
  ((stageState && stageState.stages) || []).forEach((s) => {
    if (s.complete && s.total > 0) ids.push(stageCompleteCelebrationId(s.id));
  });
  // Seed the global course-complete milestone so a user who already finished
  // every mini-unit before this feature shipped is NOT retroactively celebrated.
  if (courseComplete) ids.push(courseCompleteCelebrationId());
  return ids;
}

export function allQuestsComplete(quests) {
  return !!(quests && quests.daily && quests.daily.done && quests.cards.done && quests.due.done && quests.streak.done);
}
