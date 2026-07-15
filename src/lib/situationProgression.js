// ─────────────────────────────────────────────────────────────────────────────
// SITUATION PROGRESSION + THE FREE DAILY RECOMMENDER (progression.md §2.2;
// engagement.md §2.1). Pure: no React, no DOM, no storage, no I/O — so every
// rule below is unit-checkable (scripts/check-situation-sequence.mjs).
//
// This module authors ZERO Thai. It only reads the existing catalog
// (situations.js), the existing entitlement model (config/entitlements.js), and
// the existing "seen" signal (mastery.js isTaught). Every English string here is
// UI annotation, never content.
//
// TWO DIFFERENT QUESTIONS, KEPT APART (this is the whole point of the file):
//   • ORDER — "where does a situation sit for THIS learner?" Answered by
//     situations.js getSituationOrder(path): a PURE, reweight-only permutation of
//     all 16 (FOUNDATION §3: never a fork, never a gate). It stays untouched here.
//   • OFFERABILITY — "can we hand it to this learner as their next free lesson
//     today?" Answered below. It NEVER removes anything from the order; it only
//     annotates. Dropping a situation from `order` would itself be gating.
//
// The free-tier caveat this implements is engagement.md:94 verbatim: the identity
// weighting genuinely ranks sit-dating high, but for free users it appears as a
// locked/preview card, NOT their next free lesson (it is Super-only and 100%
// native-review pending, so the free daily recommender resolves past it) — so the
// honest promise is "boosted in your order", not "your next lesson."
//
// Dependency direction (no cycles): situationProgression.js → { situations.js,
// mastery.js, entitlements.js }. Nothing imports this file except UI + validators.
// ─────────────────────────────────────────────────────────────────────────────

import {
  SITUATIONS, getSituation, isSituationId, getSituationOrder, priority,
  cardsInSituation, situationReadiness, SITUATION_CARD_COUNTS,
} from './situations.js';
import { canUseFeature } from '../config/entitlements.js';
import { isTaught } from './mastery.js';

// ── Why a situation is not offerable today ───────────────────────────────────
// A closed vocabulary so the UI can render an honest reason instead of a silent
// lock. Multiple reasons can apply at once (sit-dating carries all three for a
// free user); `reason` is the first that applies, in this declaration order.
export const LOCK_REASON = Object.freeze({
  SUPER: 'super',              // gated by a real, shipped Super entitlement
  ADULT: '18+',                // needs the device-local 18+ attestation
  COMING_SOON: 'coming-soon',  // owns no lesson content yet — nothing to teach
});

// Short English annotations for each reason (UI copy, not learning content).
export const LOCK_LABEL = Object.freeze({
  [LOCK_REASON.SUPER]: 'Super-only — boosted in your order, not your next lesson',
  [LOCK_REASON.ADULT]: 'Requires 18+ confirmation',
  [LOCK_REASON.COMING_SOON]: 'Coming soon — no lessons written for it yet',
});

// Situation → the entitlement feature that gates it. Exactly ONE situation is
// gated today (entitlements.js: datingRealTalk is the only AVAILABLE Super-access
// feature that owns content), and the check is delegated to canUseFeature so
// entitlement logic is never reimplemented here. The other 15 are free forever
// (progression.md §7: progression sells nothing).
const SITUATION_FEATURE = Object.freeze({ 'sit-dating': 'datingRealTalk' });

// Situations behind the 18+ attestation. The attestation itself is device-local
// (storage.js loadAdultConfirmed) and never reaches this pure module, so the
// requirement is annotated as a STANDING lock: sit-dating is never handed out as
// a free daily lesson, and the UI resolves the actual confirmation at the door.
const ADULT_ONLY = Object.freeze(['sit-dating']);

// Every reason this situation cannot be THIS learner's next free lesson. Empty
// array = offerable. Note what is NOT in here: review status. The whole deck is
// draft (reviewStatus.js: nothing is approved, no situation is review-complete),
// so gating on approval would return "coming soon" for all 16 forever. Draft
// content ships WITH the mandatory draft badge — that is the UI's contract, not a
// lock — while `tagged` (situations.js:79) is the approval-INDEPENDENT signal for
// "does this situation own any real cards to teach at all?".
export function lockReasons(sitId, stats) {
  const s = getSituation(sitId);
  if (!s) return [LOCK_REASON.COMING_SOON]; // unknown id → fail closed
  const reasons = [];
  const feature = SITUATION_FEATURE[sitId];
  if (feature && !canUseFeature(feature, stats)) reasons.push(LOCK_REASON.SUPER);
  if (ADULT_ONLY.includes(sitId)) reasons.push(LOCK_REASON.ADULT);
  if (!s.tagged) reasons.push(LOCK_REASON.COMING_SOON);
  return reasons;
}

// The per-situation model the UI renders: catalog facts + this learner's priority
// + why it is (not) offerable. `readiness` is carried through verbatim so a
// surface can never claim a situation is approved — it reads 'coming-soon' for
// all 16 today and only a human native reviewer can change that.
function describeSituation(sitId, path, stats) {
  const s = getSituation(sitId);
  const reasons = lockReasons(sitId, stats);
  return {
    sitId,
    name: s ? s.name : sitId,
    order: s ? s.order : null,          // §2 catalog order (NOT this learner's rank)
    base: s ? s.base : 0,
    content: s ? s.content : null,      // curriculum.md §4.2 tier
    tagged: !!(s && s.tagged),
    cardCount: SITUATION_CARD_COUNTS[sitId] || 0,
    priority: priority(sitId, path),    // base × §3 weight for this path
    readiness: situationReadiness(sitId),
    offerable: reasons.length === 0,
    reasons,
    reason: reasons[0] || null,
    lockLabel: reasons.length ? LOCK_LABEL[reasons[0]] : null,
  };
}

// ── The free daily recommender (engagement.md §2.1) ──────────────────────────
// getSituationRecommendation(stats) → { order, upNext, lockedPreviews, comingSoon }
//   order          — ALL 16 ids, the pure §3 reweighting for this learner's path.
//                    Never filtered, never truncated, never forked.
//   upNext         — the highest-priority situation actually offerable to THIS
//                    learner as a free lesson, or null if none is. The recommender
//                    "resolves past" everything locked instead of dropping it.
//   lockedPreviews — every situation in `order` that is not offerable, in order,
//                    each annotated with WHY, so the UI renders a locked/preview
//                    card rather than a hole in the list.
//   comingSoon     — the subset of lockedPreviews with no content yet. These are
//                    the SAME entry objects (a convenience view, not a copy).
// An unknown/absent identityPath falls back to 'path-none' (all-N weights, §3),
// which yields exactly the §2 catalog order.
export function getSituationRecommendation(stats) {
  const path = (stats && stats.identityPath) || 'path-none';
  const order = getSituationOrder(path);
  const entries = order.map((sitId) => describeSituation(sitId, path, stats));
  const lockedPreviews = entries.filter((e) => !e.offerable);
  return {
    path,
    order,
    upNext: entries.find((e) => e.offerable) || null,
    lockedPreviews,
    comingSoon: lockedPreviews.filter((e) => e.reasons.includes(LOCK_REASON.COMING_SOON)),
  };
}

// ── Sequential unlock along the learner's linearized rail (progression.md §2.2)
// The EXACT shape of getMiniUnitProgressState (miniUnitSequence.js:15-57) so the
// same invariants hold and a consumer written against that lib works unchanged:
//   - the first situation is always unlocked;
//   - a situation unlocks when the immediately-previous one is completed;
//   - completed situations stay 'complete' (reviewable);
//   - exactly ONE incomplete-but-unlocked situation is 'current' (the frontier);
//   - everything past the frontier is 'locked';
//   - all complete → pathComplete true and the current pointer is null.
// This is a per-learner LINEARIZATION, not a branching graph: the order is one
// deterministic sequence given `path`, so the rail stays strictly linear.
//
// `completedSituations` is an INPUT ledger (mirroring completedMiniUnits) — this
// module never derives completion, so it can never grant one.
//
// The result carries both namings on purpose: `units`/`currentUnitId` mirror
// miniUnitSequence.js, `situations`/`currentSituationId` match progression.md
// §2.2. They are the same array / the same id.
export function getSituationProgressState(order, completedSituations = [], currentSituationId = null) {
  const list = (Array.isArray(order) ? order : []).filter((id) => isSituationId(id));
  // Defensive: ignore malformed (non-string / falsy) completed ids.
  const completed = new Set(
    (Array.isArray(completedSituations) ? completedSituations : []).filter(id => typeof id === 'string' && id)
  );

  let frontierFound = false;
  const out = list.map((sitId, i) => {
    const s = getSituation(sitId);
    const isComplete = completed.has(sitId);
    let status;
    if (isComplete) {
      status = 'complete';
    } else {
      const prevComplete = i === 0 || completed.has(list[i - 1]);
      if (prevComplete && !frontierFound) {
        status = 'current';
        frontierFound = true;
      } else {
        status = 'locked';
      }
    }
    return {
      ...s,
      sitId,
      status,
      unlocked: status !== 'locked',
      isCurrent: status === 'current',
      // "Continue" vs "Start": the current situation is in progress when the
      // user's active situation pointer matches it.
      inProgress: status === 'current' && currentSituationId != null && currentSituationId === sitId,
    };
  });

  const current = out.find(s => s.status === 'current') || null;
  const currentId = current ? current.sitId : null;
  const completedCount = out.filter(s => s.status === 'complete').length;
  return {
    units: out,
    situations: out,
    currentUnitId: currentId,
    currentSituationId: currentId,
    pathComplete: out.length > 0 && completedCount === out.length,
    completedCount,
    totalCount: out.length,
  };
}

// ── Taught-before-tested (progression.md §4.1/§6.2, foundation §4) ────────────
// The cards of a situation that this learner may be TESTED on: the situation's
// existing cards intersected with the derived `taught` set (mastery.js isTaught —
// an SRS rating / markCardsKnown wrote progress[id], OR the card belongs to a
// completed mini-unit). A situation's graded surface can therefore never reach a
// card the learner has not been taught, and an untaught learner's pool is empty.
// Reads only; never marks anything taught.
export function situationTestPool(sitId, { progress, completedMiniUnits } = {}) {
  return cardsInSituation(sitId)
    .filter((c) => isTaught(c.id, progress, completedMiniUnits))
    .map((c) => c.id);
}

// Is there anything in this situation the learner has actually been taught yet?
// The honest enable-condition for any "test me on this situation" affordance.
export function isSituationTestable(sitId, learner) {
  return situationTestPool(sitId, learner).length > 0;
}

// Convenience for list surfaces: the same annotated entry for every situation in
// §2 catalog order (not the learner's order) — e.g. a "all situations" browser.
export function describeAllSituations(stats) {
  const path = (stats && stats.identityPath) || 'path-none';
  return SITUATIONS.map((s) => describeSituation(s.id, path, stats));
}
