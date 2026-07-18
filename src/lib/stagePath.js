// The stage path: the ORDERED SET OF STEPS a learner must finish to open the
// next stage â€” the single source of truth shared by the Learn trail (what the
// user SEES) and scripts/check-stage-path-visibility.mjs (what unlocking
// REQUIRES).
//
// WHY THIS EXISTS (Wave 11 â€” the owner's "Stage 2 won't unlock" bug):
// the trail rendered one node per guided lesson and, when all of them were
// done, announced "Stage 1 path complete" â€” but nothing on the trail
// represented the actual unlock condition. getStageState opens the next stage
// when every CARD of the stage has been seen, and the 5 Stage-1 lessons only
// teach 37 of its 150 cards. So a learner could complete 100% of what the path
// showed and stay locked out, with no visible reason and no next action: the
// remaining 113 cards were a hidden completion condition.
//
// THE INVARIANT THIS RESTORES: what the user is shown IS what unlocking
// requires. Finishing every step returned here always opens the next stage,
// and every input the unlock predicate reads is represented by a step. The
// gate itself is unchanged (learn every word in the stage) â€” the card work is
// simply no longer invisible: it is the final step of the path, with live
// progress and a start action.
//
// Pure, React-free, DOM-free, so the validator can assert the equality by
// simulation rather than by scraping JSX.

import { getMiniUnitsForStage } from '../data/miniUnits.js';
import { getMiniUnitProgressState } from './miniUnitSequence.js';

export const STEP_KIND = Object.freeze({ LESSON: 'lesson', WORDS: 'words' });

// Step status vocabulary. Lessons reuse miniUnitSequence's states verbatim
// ('complete' | 'current' | 'locked'); the words step is never 'locked' â€” a
// learner may work on the stage's cards at any point â€” so it adds 'pending'
// (visible and startable, but not yet the frontier).
export const STEP_STATUS = Object.freeze({
  COMPLETE: 'complete',
  CURRENT: 'current',
  LOCKED: 'locked',
  PENDING: 'pending',
});

export function wordsStepId(stageId) {
  return `stage-${stageId}-words`;
}

/**
 * Build the visible == required step list for one stage.
 *
 * @param stageId  the stage whose path to build
 * @param stageState  the getStageState(...) result (provides seen/total/complete)
 * @param stats  the user's stats (completedMiniUnits, miniUnitProgress)
 * @returns { steps, lessonSteps, wordsStep, sequence, allSatisfied, stageComplete }
 */
export function getStagePathSteps(stageId, { stageState = null, stats = {} } = {}) {
  const units = getMiniUnitsForStage(stageId);
  const completed = Array.isArray(stats?.completedMiniUnits) ? stats.completedMiniUnits : [];
  const saved = stats?.miniUnitProgress;
  // Only a genuinely mid-flow save counts as "in progress" (a bare intro or a
  // finished save is a fresh start) â€” same rule the trail always used.
  const midFlowUnitId = (saved?.step && saved.step !== 'intro' && saved.step !== 'complete')
    ? saved.unitId
    : null;
  const sequence = getMiniUnitProgressState(units, completed, midFlowUnitId);

  const stage = (stageState?.stages || []).find((s) => s.id === stageId) || null;
  const total = stage?.total || 0;
  const seen = Math.min(stage?.seen || 0, total);
  // The unlock predicate itself, read verbatim from getStageState â€” never
  // re-derived here, so the two can never drift apart.
  const stageComplete = !!stage?.complete;

  const lessonSteps = sequence.units.map((u, i) => ({
    kind: STEP_KIND.LESSON,
    id: u.unitId,
    index: i,
    title: u.title,
    status: u.status,
    satisfied: u.status === STEP_STATUS.COMPLETE,
    unit: u,
  }));

  // The words step is the stage's card requirement made visible. It becomes the
  // frontier ('current') once the lessons are done â€” which is exactly the state
  // that used to read "path complete" while the stage stayed locked.
  const wordsStep = total > 0
    ? {
        kind: STEP_KIND.WORDS,
        id: wordsStepId(stageId),
        index: lessonSteps.length,
        title: `All Stage ${stageId} words`,
        status: stageComplete
          ? STEP_STATUS.COMPLETE
          : (sequence.pathComplete ? STEP_STATUS.CURRENT : STEP_STATUS.PENDING),
        satisfied: stageComplete,
        seen,
        total,
        remaining: Math.max(0, total - seen),
        pct: total === 0 ? 0 : Math.round((seen / total) * 100),
      }
    : null;

  const steps = wordsStep ? [...lessonSteps, wordsStep] : lessonSteps;

  return {
    steps,
    lessonSteps,
    wordsStep,
    sequence,
    stageComplete,
    // TRUE only when every visible step is done. The trail must not claim the
    // path is finished before this, and satisfying it always opens the next
    // stage (asserted by check-stage-path-visibility.mjs).
    allSatisfied: steps.length > 0 && steps.every((s) => s.satisfied),
  };
}
