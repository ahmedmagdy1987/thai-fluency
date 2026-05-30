#!/usr/bin/env node
//
// Code-level QA for the Stage 1 mini-unit sequential-unlock logic
// (lib/miniUnitSequence.js). Verifies the unlock rules, completed/current/locked
// states, all-complete, malformed-input safety, and consistency with the real
// Stage-1 unit list. Exits non-zero on any failure.

import { getMiniUnitProgressState } from '../src/lib/miniUnitSequence.js';
import { getMiniUnitsForStage } from '../src/data/miniUnits.js';

const UNITS = [
  { unitId: 'u1', title: 'Unit 1' },
  { unitId: 'u2', title: 'Unit 2' },
  { unitId: 'u3', title: 'Unit 3' },
  { unitId: 'u4', title: 'Unit 4' },
  { unitId: 'u5', title: 'Unit 5' },
];
const statusOf = (state, id) => state.units.find(u => u.unitId === id)?.status;

let failures = 0;
function check(label, cond, extra = '') {
  if (cond) console.log(`OK   ${label}`);
  else { failures += 1; console.error(`FAIL ${label}${extra ? ' — ' + extra : ''}`); }
}

console.log('Mini-unit sequence check');

// ── Nothing complete: Unit 1 current, Unit 2 locked ──────────────────────────
{
  const s = getMiniUnitProgressState(UNITS, []);
  check('none complete: Unit 1 is current', statusOf(s, 'u1') === 'current');
  check('none complete: Unit 2 is locked', statusOf(s, 'u2') === 'locked');
  check('none complete: Units 3-5 locked', ['u3', 'u4', 'u5'].every(id => statusOf(s, id) === 'locked'));
  check('none complete: currentUnitId is u1', s.currentUnitId === 'u1');
  check('none complete: not pathComplete', s.pathComplete === false);
  check('none complete: completedCount 0 / total 5', s.completedCount === 0 && s.totalCount === 5);
}

// ── Unit 1 complete: Unit 1 complete, Unit 2 current, Unit 3 locked ──────────
{
  const s = getMiniUnitProgressState(UNITS, ['u1']);
  check('u1 complete: Unit 1 marked complete', statusOf(s, 'u1') === 'complete');
  check('u1 complete: Unit 2 unlocked (current)', statusOf(s, 'u2') === 'current');
  check('u1 complete: Unit 3 still locked', statusOf(s, 'u3') === 'locked');
  check('u1 complete: currentUnitId is u2', s.currentUnitId === 'u2');
  check('u1 complete: completedCount 1', s.completedCount === 1);
}

// ── Units 1-2 complete: Unit 3 current, Unit 4 locked ────────────────────────
{
  const s = getMiniUnitProgressState(UNITS, ['u1', 'u2']);
  check('u1+u2 complete: Unit 3 is current', statusOf(s, 'u3') === 'current');
  check('u1+u2 complete: Unit 4 is locked', statusOf(s, 'u4') === 'locked');
  check('u1+u2 complete: exactly one current', s.units.filter(u => u.status === 'current').length === 1);
}

// ── All complete: path complete, no current ──────────────────────────────────
{
  const s = getMiniUnitProgressState(UNITS, ['u1', 'u2', 'u3', 'u4', 'u5']);
  check('all complete: pathComplete true', s.pathComplete === true);
  check('all complete: currentUnitId null', s.currentUnitId === null);
  check('all complete: every unit complete', s.units.every(u => u.status === 'complete'));
  check('all complete: completedCount 5', s.completedCount === 5);
}

// ── Continue vs Start: inProgress flag on the current unit ───────────────────
{
  const start = getMiniUnitProgressState(UNITS, ['u1'], null);
  check('current unit not in progress when no active id', start.units.find(u => u.unitId === 'u2').inProgress === false);
  const cont = getMiniUnitProgressState(UNITS, ['u1'], 'u2');
  check('current unit in progress when active id matches', cont.units.find(u => u.unitId === 'u2').inProgress === true);
  check('a locked/complete unit never reports inProgress', cont.units.find(u => u.unitId === 'u1').inProgress === false && cont.units.find(u => u.unitId === 'u3').inProgress === false);
}

// ── Malformed / defensive inputs do not throw and degrade gracefully ─────────
{
  check('malformed completed ids ignored (null/number/undefined)',
    getMiniUnitProgressState(UNITS, [null, 5, undefined, 'u1']).completedCount === 1);
  check('non-array completed input -> nothing complete, Unit 1 current',
    statusOf(getMiniUnitProgressState(UNITS, 'nope'), 'u1') === 'current');
  check('empty units -> not pathComplete, currentUnitId null',
    (() => { const s = getMiniUnitProgressState([], ['u1']); return s.pathComplete === false && s.currentUnitId === null && s.totalCount === 0; })());
  check('unknown completed id does not unlock anything',
    statusOf(getMiniUnitProgressState(UNITS, ['does-not-exist']), 'u2') === 'locked');
}

// ── Consistency with the real Stage-1 unit catalogue ─────────────────────────
{
  const realUnits = getMiniUnitsForStage(1);
  check('real Stage-1 units exist (>= 5)', realUnits.length >= 5);
  const sNone = getMiniUnitProgressState(realUnits, []);
  check('real units, none complete: first unit is current', sNone.units[0].status === 'current');
  check('real units, none complete: rest locked', sNone.units.slice(1).every(u => u.status === 'locked'));
  const firstId = realUnits[0].unitId;
  const sOne = getMiniUnitProgressState(realUnits, [firstId]);
  check('real units, first complete: second unit unlocks', sOne.units[1].status === 'current');
  check('real units, first complete: first is complete', sOne.units[0].status === 'complete');
}

// ── Sequence logic works for EVERY stage that ships mini-units ────────────────
{
  let anyStage = false;
  for (let st = 1; st <= 8; st++) {
    const units = getMiniUnitsForStage(st);
    if (units.length === 0) continue;
    anyStage = true;
    const none = getMiniUnitProgressState(units, []);
    check(`stage ${st}: none complete -> exactly one current, rest locked`,
      none.units.filter(u => u.status === 'current').length === 1 &&
      none.units.filter(u => u.status === 'locked').length === units.length - 1);
    if (units.length >= 2) {
      const firstDone = getMiniUnitProgressState(units, [units[0].unitId]);
      check(`stage ${st}: first complete -> second unlocks`, firstDone.units[1].status === 'current');
    }
    const allDone = getMiniUnitProgressState(units, units.map(u => u.unitId));
    check(`stage ${st}: all complete -> pathComplete`, allDone.pathComplete === true && allDone.currentUnitId === null);
  }
  check('at least one stage has mini-units', anyStage === true);
}

if (failures > 0) {
  console.error(`\nMini-unit sequence check FAILED: ${failures} assertion(s) failed.`);
  process.exit(1);
}
console.log('\nMini-unit sequence check passed.');
