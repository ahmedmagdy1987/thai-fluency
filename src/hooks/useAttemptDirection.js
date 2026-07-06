import { useState, useRef, useEffect } from 'react';
import { normalizeDirection, applyDirectionToggle } from '../lib/attemptDirection.js';

// Centralized per-attempt direction lock shared by every flashcard/lesson screen
// (CardsTab, MiniUnitFlow, FirstLessonFlow, DemoMode). See lib/attemptDirection.js
// for the security rationale.
//
//   attemptDirection  frozen snapshot; render the CURRENT card's faces from THIS.
//   assisted          true once the user flips direction mid-attempt (a peek).
//   changeDirection   call from the toggle. Re-freezing to the live preference
//                     happens on the NEXT card (when `attemptKey` changes).
//   markAssisted      explicit escape hatch for other assist signals.
//
// `attemptKey` must uniquely identify the active card/attempt (e.g.
// `${sessionKey}:${cardId}` or `${step}:${index}`). When it changes, the lock
// re-freezes to the current live preference and clears `assisted`.
export function useAttemptDirection(livePreference, attemptKey) {
  const liveRef = useRef(normalizeDirection(livePreference));
  liveRef.current = normalizeDirection(livePreference);
  const [attemptDirection, setAttemptDirection] = useState(liveRef.current);
  const [assisted, setAssisted] = useState(false);

  // Re-freeze the faces to the current preference and clear the assist flag
  // whenever a new card/attempt becomes active.
  useEffect(() => {
    setAttemptDirection(liveRef.current);
    setAssisted(false);
  }, [attemptKey]);

  // Toggle handler. `active` = the attempt is still in progress (not yet
  // revealed/answered) — a flip then is a peek attempt → mark assisted. The
  // faces stay frozen regardless. `applyLive` persists the user's preference so
  // it takes effect on the next card.
  const changeDirection = (next, { active = true, applyLive } = {}) => {
    setAssisted(prev => applyDirectionToggle({ attemptDirection, assisted: prev, next, active }).assisted);
    if (applyLive) applyLive(normalizeDirection(next));
  };

  const markAssisted = () => setAssisted(true);

  return { attemptDirection, assisted, changeDirection, markAssisted };
}
