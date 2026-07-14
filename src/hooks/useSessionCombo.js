import { useCallback, useMemo, useState } from 'react';

// Transient, session-only combo counter for the engagement loop (spec 04 §3).
//
// A "combo" is the number of consecutive CORRECT graded answers in the current
// mounted session. It is pure UI momentum:
//   • NEVER persisted (no device storage, no cloud sync of any kind).
//   • Grants NO XP, NO gems, NO SRS, NO hearts, NO server-side rewards.
//   • Auto-resets on unmount (it is component state) and on identity change
//     (the owning component remounts) — so check-session-isolation needs no new
//     ref and check-economy sees no new currency source.
//
// It lives entirely in component state so a device without Web Speech still
// hits 3/5/10 by counting MCQ/builder answers (speech only decorates it).
//
// Contract (consumed by ComboBadge + the graded surfaces):
//   useSessionCombo() -> {
//     current, best, answered, correct, accuracy,
//     milestone,          // 0 | 3 | 5 | 10 — the tier newly reached on the LAST
//                         // register() call; 0 when the last answer crossed no tier.
//     register(isCorrect),
//     reset()
//   }

// Consecutive-correct tiers that fire a milestone. Because register() increments
// the run by exactly one, a growing combo always lands EXACTLY on each tier, so
// membership testing (not >=) is correct and each tier fires at most once per run.
const COMBO_TIERS = [3, 5, 10];

const INITIAL = { current: 0, best: 0, answered: 0, correct: 0, milestone: 0 };

export function useSessionCombo() {
  const [state, setState] = useState(INITIAL);

  const register = useCallback((isCorrect) => {
    setState((s) => {
      const answered = s.answered + 1;
      if (isCorrect) {
        const current = s.current + 1;
        const best = current > s.best ? current : s.best;
        // milestone reflects ONLY this register: the tier just crossed, else 0.
        const milestone = COMBO_TIERS.includes(current) ? current : 0;
        return { current, best, answered, correct: s.correct + 1, milestone };
      }
      // Wrong answer: reset the run silently (no shaming), keep totals + best.
      return { current: 0, best: s.best, answered, correct: s.correct, milestone: 0 };
    });
  }, []);

  const reset = useCallback(() => setState(INITIAL), []);

  const accuracy = state.answered > 0
    ? Math.round((state.correct / state.answered) * 100)
    : 0;

  // Stable object identity per state so consumers can depend on fields, not the
  // wrapper. (register/reset are already stable via useCallback.)
  return useMemo(() => ({
    current: state.current,
    best: state.best,
    answered: state.answered,
    correct: state.correct,
    accuracy,
    milestone: state.milestone,
    register,
    reset,
  }), [state, accuracy, register, reset]);
}

export default useSessionCombo;
