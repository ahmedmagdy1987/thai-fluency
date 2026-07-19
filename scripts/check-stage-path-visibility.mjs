// STAGE PATH VISIBILITY — the "no hidden completion conditions" guard (Wave 11).
//
// THE BUG THIS EXISTS TO PREVENT (reproduced by the owner on production):
// the Learn trail rendered one node per guided lesson and, once all of them
// were done, announced "Stage 1 path complete" — while the next stage stayed
// locked. getStageState opens a stage when every CARD in it has been seen, and
// Stage 1's 5 lessons teach only 37 of its 150 cards. The remaining 113 were a
// completion condition with NO representation anywhere on the path: the user
// finished 100% of what he was shown and was still blocked, with no next
// action.
//
// THE INVARIANT: for every stage, the set of steps the trail SHOWS is the set
// of things unlocking REQUIRES.
//   (1) completing every visible step ALWAYS opens the next stage — no hidden
//       condition may exist outside the step list;
//   (2) every input the unlock predicate reads is represented by a step — the
//       card requirement must be a visible step with the stage's real total;
//   (3) the lesson steps are exactly the stage's units — none hidden, none
//       invented;
//   (4) the path must NOT report itself finished while the gate is still shut
//       (the owner's exact state: all lessons done, stage locked).
//
// Everything is proved by SIMULATION against the real libs (lib/stagePath.js,
// which the trail renders verbatim, and lib/state.js, which owns the gate), so
// this cannot drift from either the UI or the rule.

import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { CARDS } from '../src/data/cards.js';
import { STAGES } from '../src/data/taxonomy.js';
import { MINI_UNITS, getMiniUnitsForStage } from '../src/data/miniUnits.js';
import { getStageState } from '../src/lib/state.js';
import { getStagePathSteps, STEP_KIND } from '../src/lib/stagePath.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

let failures = 0;
const ok = (n) => console.log(`OK   ${n}`);
const fail = (n, d = '') => { console.log(`FAIL ${n}  ${d}`); failures++; };
const assert = (n, c, d) => (c ? ok(n) : fail(n, d));

const stageCards = (id) => CARDS.filter((c) => (c.stage || 1) === id);
const seeAll = (cards) => {
  const progress = {};
  for (const c of cards) progress[c.id] = { interval: 1, reviews: 1, lapses: 0, nextDue: Date.now() + 86400000 };
  return progress;
};

for (const S of STAGES) {
  const units = getMiniUnitsForStage(S.id);
  const cards = stageCards(S.id);
  if (cards.length === 0) continue;               // stage with no content: nothing to gate

  // A learner standing ON this stage (startedStage = S.id keeps it the frontier
  // without needing every earlier stage simulated too).
  const baseStats = { startedStage: S.id, completedMiniUnits: [] };

  // ── (3) lesson steps are EXACTLY the stage's units ────────────────────────
  const emptyState = getStageState(baseStats, {});
  const emptyPath = getStagePathSteps(S.id, { stageState: emptyState, stats: baseStats });
  const shownLessonIds = emptyPath.lessonSteps.map((s) => s.id);
  const realUnitIds = units.map((u) => u.unitId);
  assert(`stage ${S.id}: trail shows exactly the stage's ${realUnitIds.length} lessons (none hidden, none invented)`,
    shownLessonIds.length === realUnitIds.length && shownLessonIds.every((id, i) => id === realUnitIds[i]),
    `shown=[${shownLessonIds.join(',')}] real=[${realUnitIds.join(',')}]`);

  // ── (2) the card requirement is REPRESENTED, with the gate's real total ───
  const wordsStep = emptyPath.wordsStep;
  assert(`stage ${S.id}: the card requirement is a visible step`,
    !!wordsStep && wordsStep.kind === STEP_KIND.WORDS,
    'no words step — the unlock condition would be invisible again');
  assert(`stage ${S.id}: the words step counts the SAME cards the gate counts (${cards.length})`,
    !!wordsStep && wordsStep.total === cards.length
      && wordsStep.total === (emptyState.stages.find((s) => s.id === S.id)?.total || 0),
    `step total=${wordsStep?.total} gate total=${emptyState.stages.find((s) => s.id === S.id)?.total} cards=${cards.length}`);

  // ── (4) THE OWNER'S STATE: every lesson done, cards untouched ─────────────
  // The path must not claim to be finished, and it must offer the actionable
  // remaining step rather than a dead end.
  const lessonsOnlyStats = { startedStage: S.id, completedMiniUnits: realUnitIds };
  const lessonsOnlyProgress = seeAll(cards.filter((c) => {
    // Only the cards the lessons themselves teach (what completing every
    // lesson actually gets you).
    const taught = new Set();
    for (const u of units) {
      (u.vocabCardIds || []).forEach((i) => taught.add(i));
      if (u.sentenceCardId) taught.add(u.sentenceCardId);
      (u.challengeCardIds || []).forEach((i) => taught.add(i));
    }
    return taught.has(c.id);
  }));
  const lessonsOnlyState = getStageState(lessonsOnlyStats, lessonsOnlyProgress);
  const lessonsOnlyPath = getStagePathSteps(S.id, { stageState: lessonsOnlyState, stats: lessonsOnlyStats });
  const gateOpenOnLessonsAlone = !!lessonsOnlyState.stages.find((s) => s.id === S.id)?.complete;

  if (!gateOpenOnLessonsAlone) {
    assert(`stage ${S.id}: lessons-done-but-gate-shut is NOT reported as a finished path`,
      lessonsOnlyPath.allSatisfied === false,
      'the trail would claim "complete" while the next stage stays locked — the exact reported bug');
    assert(`stage ${S.id}: that state surfaces the remaining work as the CURRENT step`,
      lessonsOnlyPath.wordsStep?.status === 'current' && lessonsOnlyPath.wordsStep?.remaining > 0,
      `words status=${lessonsOnlyPath.wordsStep?.status} remaining=${lessonsOnlyPath.wordsStep?.remaining}`);
  } else {
    // A stage whose lessons happen to cover its whole deck: then the path IS
    // legitimately finished and must say so.
    assert(`stage ${S.id}: lessons cover the whole deck, so the path reports finished`,
      lessonsOnlyPath.allSatisfied === true);
  }

  // ── (1) COMPLETING EVERY VISIBLE STEP OPENS THE NEXT STAGE ────────────────
  const doneStats = { startedStage: S.id, completedMiniUnits: realUnitIds };
  const doneProgress = seeAll(cards);
  const doneState = getStageState(doneStats, doneProgress);
  const donePath = getStagePathSteps(S.id, { stageState: doneState, stats: doneStats });
  const thisStage = doneState.stages.find((s) => s.id === S.id);
  const nextStage = doneState.stages.find((s) => s.id === S.id + 1);

  assert(`stage ${S.id}: finishing every visible step satisfies the path`,
    donePath.allSatisfied === true,
    `steps unsatisfied: ${donePath.steps.filter((s) => !s.satisfied).map((s) => s.id).join(',')}`);
  assert(`stage ${S.id}: a satisfied path means the stage is COMPLETE (no hidden condition)`,
    thisStage?.complete === true);
  if (nextStage) {
    assert(`stage ${S.id}: a satisfied path OPENS stage ${S.id + 1}`,
      nextStage.unlocked === true && doneState.maxUnlockedStage >= S.id + 1,
      `unlocked=${nextStage.unlocked} maxUnlocked=${doneState.maxUnlockedStage}`);
  }
}

// ── Course completion stays reachable ───────────────────────────────────────
// Every unit must belong to a stage the path can render, or Course Complete
// (all 96) could never be satisfied through the UI.
const renderableUnitIds = new Set(STAGES.flatMap((S) => getMiniUnitsForStage(S.id).map((u) => u.unitId)));
const orphanUnits = MINI_UNITS.filter((u) => !renderableUnitIds.has(u.unitId)).map((u) => u.unitId);
assert('every mini-unit belongs to a stage the trail can render (Course Complete reachable)',
  orphanUnits.length === 0, `orphans: ${orphanUnits.join(',')}`);

// ─────────────────────────────────────────────────────────────────────────────
// WAVE 12, ROOT CAUSE 2 — NO SECOND DEFINITION OF "THE STAGE PATH IS COMPLETE".
//
// Wave 11 made lib/stagePath.js canonical, but App.jsx kept its OWN derivation
// for the reward screen — `stageUnits.every(u => completed.includes(u.unitId))`,
// lessons only, words step ignored. So the reward screen announced "Stage N Path
// Complete" in the same moment the trail rendered "… words to go". The gate was
// right; the duplicate derivation lied.
//
// Two guards below: (A) simulate the REWARD SCREEN itself — the surface the old
// validator never modelled — and (B) statically ban the duplicate-derivation
// shape anywhere outside the canonical module.
// ─────────────────────────────────────────────────────────────────────────────

// ── (A) Reward-screen simulation ────────────────────────────────────────────
// Replays App.jsx handleMiniUnitProgressChange's decision for the owner's exact
// state: every guided lesson of a stage done, stage cards still outstanding.
for (const S of STAGES) {
  const units = getMiniUnitsForStage(S.id);
  if (units.length === 0) continue;
  const cards = stageCards(S.id);
  if (cards.length === 0) continue;

  // All lessons complete, NO cards seen — the state that used to lie.
  const statsLessonsOnly = { completedMiniUnits: units.map((u) => u.unitId) };
  const stateLessonsOnly = getStageState(statsLessonsOnly, {});
  const pathLessonsOnly = getStagePathSteps(S.id, { stageState: stateLessonsOnly, stats: statsLessonsOnly });

  const lessonsAllDone = pathLessonsOnly.lessonSteps.length > 0
    && pathLessonsOnly.lessonSteps.every((s) => s.satisfied);
  assert(`stage ${S.id}: reward screen — all lessons ARE recognised as done`,
    lessonsAllDone === true);
  // THE REGRESSION: the reward screen's "path complete" flag is allSatisfied,
  // so with cards outstanding it must be FALSE.
  assert(`stage ${S.id}: reward screen does NOT claim "Path Complete" while words remain`,
    pathLessonsOnly.allSatisfied === false,
    `allSatisfied=${pathLessonsOnly.allSatisfied} wordsRemaining=${pathLessonsOnly.wordsStep?.remaining}`);
  assert(`stage ${S.id}: reward screen can state how many words remain`,
    (pathLessonsOnly.wordsStep?.remaining || 0) > 0);

  // The reward screen and the trail must agree — they now read the same object.
  const gateOpen = (stateLessonsOnly.stages.find((s) => s.id === S.id) || {}).complete === true;
  assert(`stage ${S.id}: reward screen agrees with the unlock gate`,
    pathLessonsOnly.allSatisfied === gateOpen,
    `path=${pathLessonsOnly.allSatisfied} gate=${gateOpen}`);

  // Everything done → the reward screen MAY claim Path Complete, and the gate agrees.
  const statsAll = { completedMiniUnits: units.map((u) => u.unitId) };
  const stateAll = getStageState(statsAll, seeAll(cards));
  const pathAll = getStagePathSteps(S.id, { stageState: stateAll, stats: statsAll });
  const gateAll = (stateAll.stages.find((s) => s.id === S.id) || {}).complete === true;
  assert(`stage ${S.id}: with lessons AND words done the reward screen may claim Path Complete`,
    pathAll.allSatisfied === true && gateAll === true,
    `path=${pathAll.allSatisfied} gate=${gateAll}`);
}

// ── (B) No duplicate derivation outside the canonical module ────────────────
// The banned shape is "decide stage-path completion from the lesson list alone":
// an `.every(...)` over a stage's units tested against completedMiniUnits.
{
  const SRC_DIRS = ['src'];
  const files = [];
  const walk = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (/\.(js|jsx)$/.test(e.name)) files.push(p);
    }
  };
  for (const d of SRC_DIRS) walk(join(ROOT, d));

  const CANONICAL = join(ROOT, 'src', 'lib', 'stagePath.js');
  const offenders = [];
  for (const f of files) {
    if (f === CANONICAL) continue;                       // the canonical module may derive it
    const src = readFileSync(f, 'utf8');
    const lines = src.split(/\r?\n/);
    lines.forEach((line, i) => {
      if (line.trim().startsWith('//') || line.trim().startsWith('*')) return;   // comments may describe it
      // getMiniUnitsForStage(...) result tested with .every(... completedMiniUnits ...)
      const everyOverUnits = /\.every\(\s*\(?\s*\w+\s*\)?\s*=>[^)]*completedMiniUnits/.test(line)
        || /\.every\(\s*\(?\s*\w+\s*\)?\s*=>[^)]*completed(Units|MiniUnits)?\.includes/.test(line);
      if (everyOverUnits) offenders.push(`${f.replace(ROOT + '\\', '').replace(ROOT + '/', '')}:${i + 1}: ${line.trim().slice(0, 120)}`);
    });
  }
  assert('no file outside lib/stagePath.js derives stage-path completion from the lesson list',
    offenders.length === 0,
    offenders.length ? `\n      ${offenders.join('\n      ')}` : '');

  // And the reward screen must actually CALL the canonical module.
  const app = readFileSync(join(ROOT, 'src', 'App.jsx'), 'utf8');
  assert('App.jsx imports the canonical stage-path module',
    /from '\.\/lib\/stagePath\.js'/.test(app));
  assert("App.jsx's reward screen decides Path Complete from getStagePathSteps(...).allSatisfied",
    /stagePathNowComplete\s*=\s*!!stagePathAfter\s*&&\s*stagePathAfter\.allSatisfied/.test(app),
    'the reward screen must read allSatisfied, not recompute completion');
}

console.log('');
if (failures > 0) {
  console.log(`Stage path visibility check FAILED (${failures} failure(s)).`);
  console.log('The Learn path is showing a different set than unlocking requires — a hidden completion condition.');
  process.exit(1);
}
console.log('Stage path visibility check passed (what the trail shows == what unlocking requires, for all stages).');
