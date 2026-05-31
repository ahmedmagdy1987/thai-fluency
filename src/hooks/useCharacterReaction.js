import { useCallback, useEffect, useRef, useState } from 'react';
import { pickLine } from '../data/characters.js';

// Transient reaction state machine for the CharacterCoach.
//
// Pattern:
//   - Most states (correct, wrong, celebrating, choiceSelected, speaking,
//     greeting) are *transient*: they auto-revert to the resting state
//     after a duration.
//   - The resting state is configurable (`restingState`, default 'idle').
//   - `react(state, opts)` switches in; the hook clears the previous
//     timer so back-to-back reactions don't pile up.
//   - `setRestingState` lets the caller change the long-term mood (e.g.
//     'thinking' once the card has been revealed).
//
// The hook intentionally avoids triggering on every render — `react`
// is a stable callback and message generation is gated on actual state
// transitions, not on render passes.

const DEFAULT_DURATIONS = {
  greeting:       1800,
  thinking:       null,   // sticky until cleared
  choiceSelected: 700,
  correct:        1600,
  wrong:          1800,
  celebrating:    2200,
  speaking:       1800,   // covers typical TTS duration
};

export function useCharacterReaction({
  characterId,
  initialState = 'idle',
  // 'review' (default) → SRS self-rating copy (CardsTab).
  // 'quiz'             → multiple-choice copy (future QuizTab).
  mode = 'review',
} = {}) {
  const [state, setState] = useState(initialState);
  const [message, setMessage] = useState(null);
  const restingRef = useRef(initialState);
  const timerRef = useRef(null);
  const messageNonceRef = useRef(0);
  const lastCharRef = useRef(characterId);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  // When the character changes, reset to its default resting state so we
  // don't carry a "wrong" face into a new lesson coach.
  useEffect(() => {
    if (lastCharRef.current !== characterId) {
      lastCharRef.current = characterId;
      clearTimer();
      setState(restingRef.current || 'idle');
      setMessage(null);
    }
  }, [characterId]);

  // Clean up on unmount.
  useEffect(() => () => clearTimer(), []);

  const setRestingState = useCallback((next) => {
    restingRef.current = next;
    // Only adopt immediately when no transient reaction is running.
    if (!timerRef.current) setState(next);
  }, []);

  const react = useCallback((nextState, opts = {}) => {
    clearTimer();
    const duration = opts.duration ?? DEFAULT_DURATIONS[nextState] ?? 1400;

    // Generate a bubble message. opts.message wins; opts.silent suppresses
    // any bubble entirely; otherwise pull a line for this state.
    setState(nextState);
    if (opts.silent) {
      // Explicit silence: hide the bubble.
      setMessage(null);
    } else {
      const nextMessage = opts.message !== undefined
        ? opts.message
        : pickLine(characterId, nextState, mode);
      // Only swap in real text. If a state has no line, KEEP the previous
      // bubble rather than blanking it, so the coach is never shown with an
      // empty bubble (the bare-coach / no-text glitch).
      if (nextMessage) {
        messageNonceRef.current += 1;
        setMessage(nextMessage);
      }
    }

    if (duration && duration > 0) {
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        // Revert the FACE to the resting state, but keep the last bubble text
        // visible until the next action replaces it. This keeps messages
        // readable (no sub-2s flash) and avoids a bare coach with no bubble.
        setState(restingRef.current || 'idle');
      }, duration);
    }
  }, [characterId, mode]);

  const clearMessage = useCallback(() => setMessage(null), []);

  return {
    state,
    message,
    react,
    setRestingState,
    clearMessage,
    isReacting: !!timerRef.current,
  };
}
