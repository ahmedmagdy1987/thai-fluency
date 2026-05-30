// Pure course-completion logic for the global "Course Complete" milestone. No
// React, no DOM, no side effects — derives everything from the mini-unit
// catalogue + the user's completedMiniUnits list, so it is fully unit-checkable
// (scripts/check-course-completion.mjs) and needs no database schema.
//
// "Course complete" = every known guided mini-unit has been completed. Unknown
// or malformed completed IDs are ignored (they can't make the course complete,
// and they don't inflate counts).

import { MINI_UNITS } from '../data/miniUnits.js';

// The durable celebration-ledger ID for the global course-complete milestone.
// Versioned so a future course expansion can re-celebrate under a new ID.
export const COURSE_COMPLETE_CELEBRATION_ID = 'course-complete:v1';

export function getCourseCompletion(units = MINI_UNITS, completedMiniUnits = []) {
  const list = Array.isArray(units) ? units : [];
  const known = new Set(list.map((u) => u.unitId));

  // Only count completed IDs that are real strings AND match a known unit.
  const completedSet = new Set(
    (Array.isArray(completedMiniUnits) ? completedMiniUnits : []).filter(
      (id) => typeof id === 'string' && id && known.has(id)
    )
  );

  const totalUnits = list.length;
  const completedUnits = completedSet.size;

  // Stages that have at least one unit, and how many of those are fully done.
  const stageIds = [...new Set(list.map((u) => u.stageId || 1))];
  const totalStages = stageIds.length;
  let stagesComplete = 0;
  for (const st of stageIds) {
    const stageUnits = list.filter((u) => (u.stageId || 1) === st);
    if (stageUnits.length > 0 && stageUnits.every((u) => completedSet.has(u.unitId))) {
      stagesComplete += 1;
    }
  }

  // Sentence-builder progress, derived purely from the data: a builder counts as
  // "completed" once its unit is completed.
  const buildersTotal = list.filter((u) => u.sentenceBuilder).length;
  const buildersCompleted = list.filter((u) => u.sentenceBuilder && completedSet.has(u.unitId)).length;

  const courseComplete = totalUnits > 0 && completedUnits === totalUnits;

  return {
    courseComplete,
    totalUnits,
    completedUnits,
    totalStages,
    stagesComplete,
    buildersTotal,
    buildersCompleted,
  };
}
