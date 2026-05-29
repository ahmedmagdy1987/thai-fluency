#!/usr/bin/env node
//
// Code-level QA for the stage-scoped Challenge (lib/challengeQuestions.js).
// Exercises the REAL buildChallenge / countChallengePool against the real card
// data and asserts the scoping + learned-card invariants required by the spec:
//
//   1. A Stage N Challenge only uses cards whose stage === N (correct + every
//      distractor), for BOTH directions.
//   2. Completed stage -> may use the whole stage.
//   3. In-progress stage -> only cards the user has learned (seen); never
//      unseen cards, never another stage's cards.
//   4. Unlocked but 0 learned -> zero questions (UI shows a Learn-first state).
//   5. Distractors never duplicate the correct answer and never cross stages.
//
// Randomised generation is run many times per scenario so a rare distractor
// tier leak would still be caught. Exits non-zero on any failure.

import { CARDS } from '../src/data/cards.js';
import {
  buildChallenge,
  countChallengePool,
  MIN_CHALLENGE_POOL,
} from '../src/lib/challengeQuestions.js';

const ITERATIONS = 40;
const DIRECTIONS = ['thai-to-en', 'en-to-thai'];

let failures = 0;
function check(label, cond, extra = '') {
  if (cond) {
    console.log(`OK   ${label}`);
  } else {
    failures += 1;
    console.error(`FAIL ${label}${extra ? ' — ' + extra : ''}`);
  }
}

const stageOf = (c) => c.stage || 1;
const stageIds = [...new Set(CARDS.map(stageOf))].sort((a, b) => a - b);

// Pick two distinct stages that each have enough cards to build a question.
const usableStages = stageIds.filter(
  (s) => CARDS.filter((c) => stageOf(c) === s && c.thai && c.en).length >= MIN_CHALLENGE_POOL
);
if (usableStages.length < 2) {
  console.error('FAIL setup — need >=2 stages with enough cards to test scoping');
  process.exit(1);
}
const stageA = usableStages[0]; // e.g. Stage 1
const stageB = usableStages[1]; // e.g. Stage 2

console.log(`Challenge scope check — stages with content: [${stageIds.join(', ')}], testing A=${stageA} B=${stageB}`);

// Helper: run buildChallenge a given way and aggregate all option/correct ids.
function buildMany({ stageId, progress, stageComplete }) {
  const out = { correctIds: new Set(), optionIds: new Set(), totalQuestions: 0, dupOptionRounds: 0, missingCorrectRounds: 0, poolSize: 0 };
  for (let i = 0; i < ITERATIONS; i++) {
    for (const type of DIRECTIONS) {
      const built = buildChallenge({ type, stageId, voice: 'male', progress, stageComplete });
      out.poolSize = built.poolSize;
      for (const q of built.questions) {
        out.totalQuestions += 1;
        out.correctIds.add(q.correct.id);
        const ids = q.options.map((o) => o.id);
        if (new Set(ids).size !== ids.length) out.dupOptionRounds += 1; // duplicate option card
        if (!ids.includes(q.correct.id)) out.missingCorrectRounds += 1; // correct not present
        ids.forEach((id) => out.optionIds.add(id));
      }
    }
  }
  return out;
}

const idsInStage = (stage) => new Set(CARDS.filter((c) => stageOf(c) === stage).map((c) => c.id));

// ── Scenario 1 + 5: completed stage uses only its own stage (both stages) ─────
for (const stage of [stageA, stageB]) {
  const r = buildMany({ stageId: stage, progress: {}, stageComplete: true });
  const stageSet = idsInStage(stage);
  const otherStageOption = [...r.optionIds].find((id) => !stageSet.has(id));
  check(`S1/S5 Stage ${stage} (complete): built questions`, r.totalQuestions > 0, `got ${r.totalQuestions}`);
  check(`S1/S5 Stage ${stage} (complete): every correct card is stage ${stage}`,
    [...r.correctIds].every((id) => stageSet.has(id)));
  check(`S1/S5 Stage ${stage} (complete): every option card is stage ${stage}`,
    otherStageOption === undefined, otherStageOption ? `leaked card id ${otherStageOption}` : '');
  check(`S1/S5 Stage ${stage} (complete): no duplicate option in any round`, r.dupOptionRounds === 0);
  check(`S1/S5 Stage ${stage} (complete): correct answer always present`, r.missingCorrectRounds === 0);
}

// Cross-stage explicit: no Stage A card in Stage B challenge and vice versa.
{
  const a = buildMany({ stageId: stageA, progress: {}, stageComplete: true });
  const b = buildMany({ stageId: stageB, progress: {}, stageComplete: true });
  const aSet = idsInStage(stageA);
  const bSet = idsInStage(stageB);
  check(`S5 no Stage ${stageB} card appears in Stage ${stageA} Challenge`,
    [...a.optionIds].every((id) => !bSet.has(id)));
  check(`S5 no Stage ${stageA} card appears in Stage ${stageB} Challenge`,
    [...b.optionIds].every((id) => !aSet.has(id)));
}

// ── Scenario 2: in-progress stage uses only LEARNED cards ─────────────────────
{
  const stageBCards = CARDS.filter((c) => stageOf(c) === stageB && c.thai && c.en);
  // Simulate a partially-learned stage: learn ~half (at least MIN_CHALLENGE_POOL,
  // and strictly fewer than the whole stage so "unseen exists").
  const learnCount = Math.max(MIN_CHALLENGE_POOL, Math.min(stageBCards.length - 1, Math.floor(stageBCards.length / 2)));
  const learnedCards = [...stageBCards].sort((a, b) => a.id - b.id).slice(0, learnCount);
  const learnedSet = new Set(learnedCards.map((c) => c.id));
  const progress = {};
  learnedCards.forEach((c) => { progress[c.id] = { reviews: 1, interval: 1, nextDue: 0 }; });

  const r = buildMany({ stageId: stageB, progress, stageComplete: false });
  const unseenStageBOption = [...r.optionIds].find((id) => !learnedSet.has(id));
  check(`S2 Stage ${stageB} (in-progress, ${learnCount} learned): built questions`, r.totalQuestions > 0);
  check(`S2 Stage ${stageB} (in-progress): every correct card is LEARNED`,
    [...r.correctIds].every((id) => learnedSet.has(id)));
  check(`S2 Stage ${stageB} (in-progress): every option card is LEARNED (no unseen, no other stage)`,
    unseenStageBOption === undefined, unseenStageBOption ? `leaked unseen/other id ${unseenStageBOption}` : '');
  check(`S2 Stage ${stageB} (in-progress): pool size == learned eligible count`,
    r.poolSize <= learnCount && r.poolSize > 0, `poolSize=${r.poolSize}, learned=${learnCount}`);
  check(`S2 countChallengePool matches`,
    countChallengePool({ stageId: stageB, voice: 'male', progress, stageComplete: false }) === r.poolSize);
}

// ── Scenario 3: unlocked but 0 learned -> no questions, empty state ───────────
{
  const built = buildChallenge({ type: 'thai-to-en', stageId: stageB, voice: 'male', progress: {}, stageComplete: false });
  const poolCount = countChallengePool({ stageId: stageB, voice: 'male', progress: {}, stageComplete: false });
  check(`S3 Stage ${stageB} (unlocked, 0 learned): zero questions`, built.questions.length === 0, `got ${built.questions.length}`);
  check(`S3 Stage ${stageB} (unlocked, 0 learned): poolSize 0`, built.poolSize === 0);
  check(`S3 Stage ${stageB} (unlocked, 0 learned): countChallengePool 0 (UI shows Learn-first)`, poolCount === 0);
}

// ── Scenario 4: distractor quality already asserted above (no dup, no cross-
//    stage). Also confirm a too-small learned pool yields a clear empty result
//    rather than silently borrowing other-stage cards. ────────────────────────
{
  const stageBCards = CARDS.filter((c) => stageOf(c) === stageB && c.thai && c.en).sort((a, b) => a.id - b.id);
  const tiny = stageBCards.slice(0, 2); // only 2 learned -> below MIN_CHALLENGE_POOL
  const progress = {};
  tiny.forEach((c) => { progress[c.id] = { reviews: 1 }; });
  const poolCount = countChallengePool({ stageId: stageB, voice: 'male', progress, stageComplete: false });
  const built = buildChallenge({ type: 'thai-to-en', stageId: stageB, voice: 'male', progress, stageComplete: false });
  const tinySet = new Set(tiny.map((c) => c.id));
  check(`S4 too-few-learned (2 cards): below MIN_CHALLENGE_POOL`, poolCount < MIN_CHALLENGE_POOL, `poolCount=${poolCount}`);
  check(`S4 too-few-learned: never borrows another stage (all options within the 2 learned, if any)`,
    built.questions.every((q) => q.options.every((o) => tinySet.has(o.id))));
}

if (failures > 0) {
  console.error(`\nChallenge scope check FAILED: ${failures} assertion(s) failed.`);
  process.exit(1);
}
console.log('\nChallenge scope check passed.');
