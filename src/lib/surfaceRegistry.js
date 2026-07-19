// ─────────────────────────────────────────────────────────────────────────────
// FULL-SCREEN SURFACE REGISTRY — one ordered policy, replacing pairwise guards.
//
// ── WHY THIS FILE EXISTS (Wave 12, root cause 3) ─────────────────────────────
// Mutual exclusion between full-screen surfaces used to be hand-maintained at
// each render site as a chain of negations: `{streakRecovery && !rewardScreen &&`,
// `{celebration && !showStage1Celebration &&`, and so on. Every new surface meant
// remembering to edit N existing call sites, and that memory kept failing:
//
//   • `stageCinematic` (App.jsx) rendered with NO guard at all, while being set in
//     the SAME synchronous branch as setCelebration — so an opaque black video
//     overlay (z-index 1300) painted over a live celebration (z-index 260) that
//     stayed mounted with aria-modal="true" underneath. Two modals, one visible,
//     focus order broken. Not hypothetical: clips ship for stages 1, 2, 4, 5, 6, 7.
//   • `streakRecovery` guarded only `!rewardScreen`, omitting celebration,
//     stage-1, upgradePrompt and the cinematic.
//   • The most complete chain in the file (the guided tutorial) listed EIGHT
//     negations and still missed three surfaces.
//
// The class of bug is "exclusion is a per-site convention". This file makes it a
// property of the system instead: ONE ordered list, ONE resolver, and exactly one
// exclusive surface visible BY CONSTRUCTION. Adding a surface means adding a row
// here — there is no second place to forget.
//
// ── QUEUED, NOT DROPPED ─────────────────────────────────────────────────────
// Suppression here is purely a RENDERING decision. A lower-priority surface whose
// state atom is set stays set; it simply is not rendered while something higher
// is up, and appears the moment that clears. This is the same "wait, don't drop"
// behaviour the celebration ledger already relied on, generalised — no surface is
// ever silently discarded, and no extra queue state is needed.
//
// ── SCOPE ───────────────────────────────────────────────────────────────────
// This changes RENDERING EXCLUSION ONLY. It does not restructure App.jsx's state
// model — every atom keeps its own useState and its own setters. That larger
// rewrite is deliberately out of scope.
// ─────────────────────────────────────────────────────────────────────────────

// Ordered HIGHEST priority first. `exclusive: true` means "a full-screen surface
// that owns the viewport" — at most one may render. `exclusive: false` marks
// status/toast layers that are designed to coexist (they do not trap focus and do
// not cover the screen).
export const SURFACES = Object.freeze([
  {
    id: 'stage1Celebration',
    exclusive: true,
    why: 'The one-time Stage 1 milestone. Highest priority: it is a rare, first-run moment and every other reward surface already treated it as the winner.',
  },
  {
    id: 'stageCinematic',
    exclusive: true,
    why: 'An opaque full-screen video. It must play OVER the celebration that launches it in the same branch — the celebration then renders when the clip is dismissed.',
  },
  {
    id: 'celebration',
    exclusive: true,
    why: 'Stage/course/quest celebrations. Supersedes the smaller per-lesson reward screen.',
  },
  {
    id: 'rewardScreen',
    exclusive: true,
    why: 'The per-lesson / per-mission recap. Yields to any celebration.',
  },
  {
    id: 'achievementToast',
    exclusive: true,
    why: 'Achievement unlocked modal — shares the reward backdrop, so it must not stack with one.',
  },
  {
    id: 'saveProgressAsk',
    exclusive: true,
    why: 'Anonymous-learner save prompt. Never interrupt a reward moment with an account ask.',
  },
  {
    id: 'streakRecovery',
    exclusive: true,
    why: 'Streak-break recovery card. Lower than rewards so a win is never buried by a loss notice.',
  },
  {
    id: 'upgradePrompt',
    exclusive: true,
    why: 'Super upsell. Lowest of the modal family — it must never pre-empt earned feedback.',
  },
  {
    id: 'guidedTutorial',
    exclusive: true,
    why: 'First-run coach marks. Only when nothing else owns the screen.',
  },
  // ── Non-exclusive status layers ────────────────────────────────────────────
  {
    id: 'superActivation',
    exclusive: false,
    why: 'A bottom-anchored status strip (role="status"), not a modal. It must stay visible DURING a reward moment — a purchase activating is exactly the thing the user is waiting on.',
  },
  {
    id: 'questToasts',
    exclusive: false,
    why: 'Transient quest toasts; they do not trap focus or cover the screen.',
  },
]);

export const EXCLUSIVE_SURFACE_IDS = SURFACES.filter(s => s.exclusive).map(s => s.id);
export const SURFACE_IDS = SURFACES.map(s => s.id);

// Priority index: lower number = higher priority.
const PRIORITY = new Map(EXCLUSIVE_SURFACE_IDS.map((id, i) => [id, i]));
export function surfacePriority(id) {
  return PRIORITY.has(id) ? PRIORITY.get(id) : Number.MAX_SAFE_INTEGER;
}

/**
 * The single exclusion decision.
 *
 * @param present an object keyed by surface id whose values are truthy when that
 *                surface WANTS to be on screen (its state atom is set).
 * @returns the id of the one exclusive surface that may render, or null.
 *
 * Exactly one exclusive surface can ever come back, for any combination of
 * inputs — that is what makes stacking structurally impossible rather than
 * conventionally avoided. Unknown ids are ignored so a stray key cannot win.
 */
export function resolveActiveSurface(present) {
  if (!present || typeof present !== 'object') return null;
  for (const id of EXCLUSIVE_SURFACE_IDS) {
    if (present[id]) return id;
  }
  return null;
}

/** True when `id` is the exclusive surface allowed to render right now. */
export function isSurfaceVisible(id, present) {
  const surface = SURFACES.find(s => s.id === id);
  if (!surface) return false;
  if (!surface.exclusive) return !!(present && present[id]);
  return resolveActiveSurface(present) === id;
}

/**
 * Surfaces that WANT the screen but are being held back. They are queued, not
 * dropped: their state is untouched and they render as soon as they win.
 * Exposed mainly so tests and future debug tooling can assert nothing is lost.
 */
export function queuedSurfaces(present) {
  const active = resolveActiveSurface(present);
  return EXCLUSIVE_SURFACE_IDS.filter(id => present && present[id] && id !== active);
}
