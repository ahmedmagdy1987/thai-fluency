#!/usr/bin/env node
//
// Code-level QA for the celebration repeat-prevention ledger (lib/celebrations.js).
// Verifies: ID construction, the has/with/prune ledger semantics, baseline
// enumeration, and a baseline→fire simulation proving (a) existing completions
// are NOT retroactively celebrated and (b) celebrations don't repeat. Exits
// non-zero on any failure.

import { getLocalDateKey, previousLocalDateKey } from '../src/lib/stats.js';
import {
  QUEST_CELEBRATIONS,
  questCelebrationId,
  allQuestsCelebrationId,
  allQuestsComplete,
  stageCompleteCelebrationId,
  challengePerfectCelebrationId,
  superCtaId,
  hasCelebrated,
  withCelebrated,
  pruneCelebrated,
  activeCelebrationIds,
} from '../src/lib/celebrations.js';

const today = getLocalDateKey();
const yesterday = previousLocalDateKey();
const OLD = '2020-01-01';

let failures = 0;
function check(label, cond, extra = '') {
  if (cond) console.log(`OK   ${label}`);
  else { failures += 1; console.error(`FAIL ${label}${extra ? ' — ' + extra : ''}`); }
}

console.log(`Celebrations check — today=${today}, yesterday=${yesterday}`);

// ── ID construction ──────────────────────────────────────────────────────────
check('quest id is date-keyed', questCelebrationId('practice-10', today) === `quest:practice-10:${today}`);
check('all-quests id is date-keyed', allQuestsCelebrationId(today) === `quests:all-complete:${today}`);
check('stage id is durable (no date)', stageCompleteCelebrationId(3) === 'stage-complete:3');
check('challenge-perfect id includes stage + date', challengePerfectCelebrationId(2, today) === `challenge-perfect:stage-2:${today}`);
check('super-cta id is date-keyed', superCtaId(today) === `super-cta:${today}`);

// ── hasCelebrated / withCelebrated ───────────────────────────────────────────
{
  let ids = [];
  check('hasCelebrated false initially', hasCelebrated(ids, 'stage-complete:2') === false);
  ids = withCelebrated(ids, 'stage-complete:2', today, yesterday);
  check('withCelebrated adds id', hasCelebrated(ids, 'stage-complete:2') === true);
  const same = withCelebrated(ids, 'stage-complete:2', today, yesterday);
  check('withCelebrated idempotent (same ref when unchanged)', same === ids);
  const multi = withCelebrated(ids, ['stage-complete:3', 'stage-complete:4'], today, yesterday);
  check('withCelebrated accepts arrays', hasCelebrated(multi, 'stage-complete:3') && hasCelebrated(multi, 'stage-complete:4'));
  check('hasCelebrated handles null', hasCelebrated(null, 'x') === false);
}

// ── pruneCelebrated: drop stale date IDs, keep durable + today/yesterday ─────
{
  const ids = [
    'stage-complete:2',                       // durable -> keep
    `quest:practice-10:${today}`,             // today -> keep
    `quest:streak-alive:${yesterday}`,        // yesterday -> keep
    `quest:daily-xp-goal:${OLD}`,             // stale -> drop
    `challenge-perfect:stage-1:${OLD}`,       // stale -> drop
    `quests:all-complete:${OLD}`,             // stale -> drop
  ];
  const pruned = pruneCelebrated(ids, today, yesterday);
  check('prune keeps durable stage id', pruned.includes('stage-complete:2'));
  check('prune keeps today + yesterday quest ids', pruned.includes(`quest:practice-10:${today}`) && pruned.includes(`quest:streak-alive:${yesterday}`));
  check('prune drops stale date ids', !pruned.includes(`quest:daily-xp-goal:${OLD}`) && !pruned.includes(`challenge-perfect:stage-1:${OLD}`) && !pruned.includes(`quests:all-complete:${OLD}`));
  check('withCelebrated prunes on add', !withCelebrated(ids, 'stage-complete:9', today, yesterday).includes(`quests:all-complete:${OLD}`));
}

// ── allQuestsComplete ────────────────────────────────────────────────────────
{
  const allDone = { daily: { done: true }, cards: { done: true }, due: { done: true }, streak: { done: true } };
  const partial = { daily: { done: true }, cards: { done: false }, due: { done: true }, streak: { done: true } };
  check('allQuestsComplete true when all done', allQuestsComplete(allDone) === true);
  check('allQuestsComplete false when partial', allQuestsComplete(partial) === false);
  check('allQuestsComplete false on undefined', allQuestsComplete(undefined) === false);
}

// ── activeCelebrationIds (baseline enumeration) ──────────────────────────────
{
  const quests = { daily: { done: true }, cards: { done: false }, due: { done: true }, streak: { done: true } };
  const stageState = { stages: [
    { id: 1, complete: true, total: 150 },
    { id: 2, complete: true, total: 120 },
    { id: 3, complete: false, total: 100 },
    { id: 8, complete: true, total: 0 }, // no content -> excluded
  ] };
  const ids = activeCelebrationIds({ quests, stageState, today });
  check('baseline includes done quests only', ids.includes(questCelebrationId('daily-xp-goal', today)) && ids.includes(questCelebrationId('reviews-cleared', today)) && ids.includes(questCelebrationId('streak-alive', today)) && !ids.includes(questCelebrationId('practice-10', today)));
  check('baseline excludes all-complete when partial', !ids.includes(allQuestsCelebrationId(today)));
  check('baseline includes complete stages with content', ids.includes(stageCompleteCelebrationId(1)) && ids.includes(stageCompleteCelebrationId(2)));
  check('baseline excludes incomplete + empty stages', !ids.includes(stageCompleteCelebrationId(3)) && !ids.includes(stageCompleteCelebrationId(8)));
}

// ── Simulation: baseline never retro-celebrates; no repeat after refresh ─────
{
  // Existing user: stages 1-2 already complete BEFORE the feature. Baseline
  // seeds them; firing logic must then NOT celebrate them.
  const stageState = { stages: [ { id: 1, complete: true, total: 150 }, { id: 2, complete: true, total: 120 }, { id: 3, complete: false, total: 100 } ] };
  const quests = { daily: { done: false }, cards: { done: false }, due: { done: false }, streak: { done: false } };
  let ledger = withCelebrated([], activeCelebrationIds({ quests, stageState, today }), today, yesterday);
  const stage2WouldFire = !hasCelebrated(ledger, stageCompleteCelebrationId(2));
  check('SIM existing user: completed stage 2 NOT retro-celebrated after baseline', stage2WouldFire === false);

  // Now the user completes stage 3 in-session: it is not in the ledger -> fires.
  const fireStage3 = !hasCelebrated(ledger, stageCompleteCelebrationId(3));
  check('SIM new completion (stage 3) fires once', fireStage3 === true);
  ledger = withCelebrated(ledger, stageCompleteCelebrationId(3), today, yesterday);
  check('SIM after firing, refresh does NOT repeat stage 3', hasCelebrated(ledger, stageCompleteCelebrationId(3)) === true);

  // Quest fires once, then is suppressed on re-evaluation (refresh / re-open Quests).
  const qid = questCelebrationId('practice-10', today);
  check('SIM quest toast eligible first time', hasCelebrated(ledger, qid) === false);
  ledger = withCelebrated(ledger, qid, today, yesterday);
  check('SIM quest toast suppressed after marking (no repeat on refresh)', hasCelebrated(ledger, qid) === true);
}

check('QUEST_CELEBRATIONS covers the 4 daily quests', QUEST_CELEBRATIONS.length === 4 && QUEST_CELEBRATIONS.every(q => q.slot && q.key && q.title));

if (failures > 0) {
  console.error(`\nCelebrations check FAILED: ${failures} assertion(s) failed.`);
  process.exit(1);
}
console.log('\nCelebrations check passed.');
