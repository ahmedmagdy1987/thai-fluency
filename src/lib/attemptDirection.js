// Anti-peek direction lock — pure core (no React), so it can be unit-tested by
// scripts/check-direction-lock.mjs.
//
// THE EXPLOIT this defends against: a flashcard shows one side (the prompt) and
// hides the other (the answer). The direction toggle (English-first vs Thai-
// first) chooses which side is the prompt. If the CURRENT, unanswered card
// re-rendered its faces from the LIVE preference, a user could flip the toggle
// to swap the hidden answer onto the prompt face — reading the answer for free —
// then flip back and rate "Easy" for full XP/streak/quest credit without ever
// recalling it. Toggling twice reveals the answer with no mistake.
//
// THE FIX: the current card's faces are ALWAYS derived from `attemptDirection` —
// an immutable snapshot taken when the card became the active attempt — never
// from the live preference. A toggle during an active attempt only (a) updates
// the saved preference for the NEXT card and (b) marks THIS attempt `assisted`
// so scoring can downgrade it. The visible faces never change mid-attempt, so
// the answer can never be exposed by toggling.

export function normalizeDirection(d) {
  return d === 'th-first' ? 'th-first' : 'en-first';
}

// The single source of truth for which face is the prompt. Callers MUST derive
// their `isEnglishFirst` from this (passing the frozen attempt direction), never
// from the live preference — that is exactly what the validator enforces.
export function faceIsEnglishFirst(attemptDirection) {
  return normalizeDirection(attemptDirection) !== 'th-first';
}

// Decide the next {attemptDirection, assisted} after a direction toggle.
// INVARIANT: attemptDirection is returned UNCHANGED — the live toggle only ever
// applies to the next card. `assisted` latches true when the user flips to the
// opposite side while the current attempt is still active (unrevealed/
// unanswered), i.e. a peek attempt; the frozen faces neutralize the peek in the
// UI and this flag lets the scoring path cap the reward centrally.
export function applyDirectionToggle({ attemptDirection, assisted, next, active }) {
  const frozen = normalizeDirection(attemptDirection);
  const willAssist = !!active && normalizeDirection(next) !== frozen;
  return { attemptDirection: frozen, assisted: !!assisted || willAssist };
}
