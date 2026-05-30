#!/usr/bin/env node
//
// Code-level QA for the global course-completion logic (lib/courseCompletion.js)
// and its celebration-ledger ID. Verifies completion math, safe handling of
// unknown/duplicate IDs, stage-completion counting, and that the durable
// celebration ID matches the celebrations lib. Exits non-zero on any failure.

import { MINI_UNITS } from '../src/data/miniUnits.js';
import { getCourseCompletion, COURSE_COMPLETE_CELEBRATION_ID } from '../src/lib/courseCompletion.js';
import { courseCompleteCelebrationId } from '../src/lib/celebrations.js';

let failures = 0;
function check(label, cond, extra = '') {
  if (cond) console.log(`OK   ${label}`);
  else { failures += 1; console.error(`FAIL ${label}${extra ? ' — ' + extra : ''}`); }
}

const allIds = MINI_UNITS.map((u) => u.unitId);
const totalUnits = MINI_UNITS.length;
const stageIds = [...new Set(MINI_UNITS.map((u) => u.stageId || 1))];

console.log(`Course-completion check — ${totalUnits} mini-units across ${stageIds.length} stage(s)`);

// ── totalUnits matches the data ──────────────────────────────────────────────
{
  const r = getCourseCompletion(MINI_UNITS, []);
  check('totalUnits matches MINI_UNITS length', r.totalUnits === totalUnits, `${r.totalUnits} vs ${totalUnits}`);
  check('totalStages matches distinct stageIds', r.totalStages === stageIds.length, `${r.totalStages} vs ${stageIds.length}`);
}

// ── 0 completed → not complete ───────────────────────────────────────────────
{
  const r = getCourseCompletion(MINI_UNITS, []);
  check('0 completed → not complete', r.courseComplete === false);
  check('0 completed → completedUnits 0', r.completedUnits === 0);
  check('0 completed → stagesComplete 0', r.stagesComplete === 0);
  check('0 completed → buildersCompleted 0', r.buildersCompleted === 0);
}

// ── partial completed → not complete ─────────────────────────────────────────
{
  const partial = allIds.slice(0, Math.max(1, Math.floor(totalUnits / 2)));
  const r = getCourseCompletion(MINI_UNITS, partial);
  check('partial completed → not complete', r.courseComplete === false);
  check('partial completed → completedUnits matches', r.completedUnits === partial.length, `${r.completedUnits} vs ${partial.length}`);
}

// ── all known completed → complete ───────────────────────────────────────────
{
  const r = getCourseCompletion(MINI_UNITS, [...allIds]);
  check('all completed → complete', r.courseComplete === true);
  check('all completed → completedUnits === totalUnits', r.completedUnits === totalUnits);
  check('all completed → stagesComplete === totalStages', r.stagesComplete === stageIds.length, `${r.stagesComplete} vs ${stageIds.length}`);
  check('all completed → buildersCompleted === buildersTotal', r.buildersCompleted === r.buildersTotal && r.buildersTotal > 0, `${r.buildersCompleted}/${r.buildersTotal}`);
}

// ── unknown completed IDs ignored ────────────────────────────────────────────
{
  const r = getCourseCompletion(MINI_UNITS, ['not-a-real-unit', 'stage-99-nope', '', null, undefined, 42]);
  check('unknown/malformed completed IDs ignored (completedUnits 0)', r.completedUnits === 0);
  check('unknown completed IDs do not make course complete', r.courseComplete === false);
  // all real + junk still completes, junk does not inflate the count
  const r2 = getCourseCompletion(MINI_UNITS, [...allIds, 'junk-1', 'junk-2', 123]);
  check('all-real + junk → complete with exact count', r2.courseComplete === true && r2.completedUnits === totalUnits, `${r2.completedUnits}`);
}

// ── duplicate completed IDs handled ──────────────────────────────────────────
{
  const dupes = [...allIds, ...allIds, allIds[0], allIds[0]];
  const r = getCourseCompletion(MINI_UNITS, dupes);
  check('duplicate completed IDs counted once', r.completedUnits === totalUnits, `${r.completedUnits} vs ${totalUnits}`);
  check('duplicates → still complete', r.courseComplete === true);
}

// ── stagesComplete count correct (one full stage only) ───────────────────────
{
  const firstStage = stageIds[0];
  const firstStageUnits = MINI_UNITS.filter((u) => (u.stageId || 1) === firstStage).map((u) => u.unitId);
  const r = getCourseCompletion(MINI_UNITS, firstStageUnits);
  check('one full stage completed → stagesComplete === 1', r.stagesComplete === 1, `${r.stagesComplete}`);
  check('one full stage completed → course not complete (more stages exist)', r.courseComplete === (stageIds.length === 1));

  // Half of a stage's units → that stage is NOT counted complete.
  if (firstStageUnits.length >= 2) {
    const half = firstStageUnits.slice(0, firstStageUnits.length - 1);
    const rh = getCourseCompletion(MINI_UNITS, half);
    check('partial stage → stagesComplete 0', rh.stagesComplete === 0, `${rh.stagesComplete}`);
  }
}

// ── empty / malformed units arg handled ──────────────────────────────────────
{
  const r = getCourseCompletion([], ['x']);
  check('empty units → not complete (totalUnits 0)', r.courseComplete === false && r.totalUnits === 0);
  const r2 = getCourseCompletion(MINI_UNITS, null);
  check('null completed arg handled', r2.courseComplete === false && r2.completedUnits === 0);
}

// ── celebration ID helper matches the celebrations lib ───────────────────────
{
  check('COURSE_COMPLETE_CELEBRATION_ID is course-complete:v1', COURSE_COMPLETE_CELEBRATION_ID === 'course-complete:v1');
  check('courseCompleteCelebrationId() matches the constant', courseCompleteCelebrationId() === COURSE_COMPLETE_CELEBRATION_ID);
}

if (failures > 0) {
  console.error(`\nCourse-completion check FAILED: ${failures} assertion(s) failed.`);
  process.exit(1);
}
console.log('\nCourse-completion check passed.');
