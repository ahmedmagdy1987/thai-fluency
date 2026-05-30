// Pure sequential-unlock logic for the Stage 1 mini-unit path. No React / DOM —
// derives each unit's status (complete / current / locked) from the user's
// completedMiniUnits, so it is fully unit-checkable (scripts/check-mini-unit-
// sequence.mjs) and existing users with already-completed units automatically
// see the correct next unit unlocked.
//
// Rules:
//   - The first unit is always unlocked.
//   - A unit unlocks when the immediately-previous unit is completed.
//   - Completed units stay 'complete' (reviewable).
//   - Exactly ONE incomplete-but-unlocked unit is 'current' (the frontier).
//   - Everything past the frontier is 'locked'.
//   - If every unit is complete, pathComplete is true and currentUnitId is null.

export function getMiniUnitProgressState(units, completedMiniUnits = [], currentMiniUnitId = null) {
  const list = Array.isArray(units) ? units : [];
  // Defensive: ignore malformed (non-string / falsy) completed ids.
  const completed = new Set(
    (Array.isArray(completedMiniUnits) ? completedMiniUnits : []).filter(id => typeof id === 'string' && id)
  );

  let frontierFound = false;
  const out = list.map((u, i) => {
    const isComplete = completed.has(u.unitId);
    let status;
    if (isComplete) {
      status = 'complete';
    } else {
      const prevComplete = i === 0 || completed.has(list[i - 1]?.unitId);
      if (prevComplete && !frontierFound) {
        status = 'current';
        frontierFound = true;
      } else {
        status = 'locked';
      }
    }
    return {
      ...u,
      status,
      unlocked: status !== 'locked',
      isCurrent: status === 'current',
      // "Continue" vs "Start": the current unit is in progress when the user's
      // active mini-unit pointer matches it.
      inProgress: status === 'current' && currentMiniUnitId != null && currentMiniUnitId === u.unitId,
    };
  });

  const current = out.find(u => u.status === 'current') || null;
  const completedCount = out.filter(u => u.status === 'complete').length;
  return {
    units: out,
    currentUnitId: current ? current.unitId : null,
    pathComplete: out.length > 0 && completedCount === out.length,
    completedCount,
    totalCount: out.length,
  };
}
