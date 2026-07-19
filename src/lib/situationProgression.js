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
import { hasPhonetic } from './phonetics.js';

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

// ── WHAT A SITUATION CAN ACTUALLY TEACH (the honest basis for a Start button) ─
// `tagged` says a situation owns cards. It does NOT say we can teach them, and
// the gap between those two is exactly where a lying affordance would live. Two
// filters close it, in this order:
//
//   1. PHONETIC (review finding A3, phonetics.js). A card session renders `ph`,
//      so a card with an empty `ph` has nothing to pronounce and cannot be
//      taught by this flow. We FILTER those out — we never synthesize one: a
//      romanization is Thai content and a fabricated tone teaches a wrong word.
//      335 empty-`ph` cards live in the deck; hasPhonetic is the only real test
//      (`phNeedsGen`/`phReview` are trailing COMMENTS, not fields, and match
//      nothing at runtime).
//   2. STAGE WINDOW. This is the one that bites. Every tagged situation spans
//      stages 1-8 (sit-greet alone holds 37 stage-8 cards), because a situation
//      is a CROSS-STAGE tag, not a stage. The card-session scope we reuse filters
//      by explicit cardIds and therefore BYPASSES the stage window entirely — so
//      handing it a situation's whole pool would teach a fresh stage-1 learner
//      stage-8 vocabulary and silently break sequential stage unlock. The window
//      is the learner's existing [startedStage, maxUnlockedStage], reproduced
//      from the Cards-tab stage-window rule (the learn/practice scope filter in
//      CardsTab.jsx — cited by rule, not line, since line numbers drift);
//      situations reweight ORDER,
//      they were never a licence to jump the stage ladder.
//
// FAIL CLOSED: an omitted window means stage 1 only. A caller that forgets the
// window under-offers (recoverable); a default of "no filter" would leak locked
// stages silently, which is not.
export const DEFAULT_STAGE_WINDOW = Object.freeze({ startedStage: 1, maxUnlockedStage: 1 });

// A first recommended session should be a real lesson, not a 2-card teaser. The
// recommender steers `upNext` to the highest-priority situation whose in-window
// startable pool can fill at least this many cards (a fresh tourist's top-ranked
// situations — food/money/directions — own only ~2 stage-1 cards each, which read
// as a broken session; greet/pharmacy own 18/9). A smaller situation is still
// startable from the rail, just not offered as the learner's FIRST session.
//   • 8 sits just under the 10-card daily new-card limit, so the first lesson
//     fills a day without exceeding it.
//   • This RE-STAGES the choice only: it authors no Thai and never widens the
//     stage window (doing so would leak locked-stage vocab and break stage unlock).
export const MIN_FIRST_SESSION_SIZE = 8;

// Cards in a situation this flow could teach ANY learner (phonetic filter only).
// Learner-independent — the situation's real teachable size.
export function situationTeachableCards(sitId) {
  return cardsInSituation(sitId).filter(hasPhonetic);
}

// Does this situation own anything teachable at all? The approval-INDEPENDENT
// "is there something real behind a Start" test. Implies `tagged` (an untagged
// situation owns no cards, so its pool is empty either way).
export function hasTeachableContent(sitId) {
  return situationTeachableCards(sitId).length > 0;
}

// The exact card ids a Start launches for THIS learner: teachable ∩ stage window.
// This is the ONE function that builds a situation session's payload, so the UI
// and the launcher can never disagree about what "N cards ready" means.
export function situationStartPool(sitId, stageWindow = DEFAULT_STAGE_WINDOW) {
  const w = stageWindow || DEFAULT_STAGE_WINDOW;
  const lower = w.startedStage || 1;
  const upper = w.maxUnlockedStage || 1;
  return situationTeachableCards(sitId)
    .filter((c) => {
      const s = c.stage || 1;
      return s >= lower && s <= upper;
    })
    .map((c) => c.id);
}

// Teachable count per situation (all 16; untagged → 0). Learner-independent.
export const SITUATION_TEACHABLE_COUNTS = Object.freeze(
  SITUATIONS.reduce((acc, s) => {
    acc[s.id] = situationTeachableCards(s.id).length;
    return acc;
  }, {}),
);

// ── Situations that keep a full row even with zero content ───────────────────
// sit-dating owns 0 main-deck cards, so the content filter below would sweep it
// into the collapsed "more coming" affordance. It must NOT be swept: its row is
// a real, shipped entitlement surface (datingRealTalk), not an advert for
// unwritten lessons. engagement.md:94 requires free users see it as a
// locked/preview card, and the row carries all three reasons at once (Super +
// 18+ + coming-soon) so it can never be mistaken for ready content. Hiding it
// would delete the one honest upsell we have; the recommender still guarantees
// it is never `upNext` and never startable.
const ALWAYS_PREVIEW = Object.freeze(['sit-dating']);
export const isAlwaysPreview = (sitId) => ALWAYS_PREVIEW.includes(sitId);

// Every reason this situation cannot be THIS learner's next free lesson. Empty
// array = offerable. Note what is NOT in here: review status. No situation is
// review-complete yet (every SITUATION_REVIEW_COMPLETE flag is false, even though
// part of the deck is now approved), so gating on approval would return
// "coming soon" for all 16 until whole situations clear the floor. Draft
// content ships WITH the mandatory draft badge — that is the UI's contract, not a
// lock — while hasTeachableContent() is the approval-INDEPENDENT signal for
// "does this situation own any real cards we can actually teach at all?".
//
// COMING_SOON keys off hasTeachableContent, not the weaker `tagged`: a situation
// whose every card lacks a phonetic owns cards we cannot teach, and calling that
// anything but "no lessons yet" would advertise a Start that dies on arrival.
// The two agree on today's deck — but do NOT re-derive that from a card count:
// the tagged set has grown well past the original 7 and several tagged situations
// hold only a handful of phonetic cards. check-situation-sequence asserts the
// equivalence executably rather than trusting any number written here.
export function lockReasons(sitId, stats) {
  const s = getSituation(sitId);
  if (!s) return [LOCK_REASON.COMING_SOON]; // unknown id → fail closed
  const reasons = [];
  const feature = SITUATION_FEATURE[sitId];
  if (feature && !canUseFeature(feature, stats)) reasons.push(LOCK_REASON.SUPER);
  if (ADULT_ONLY.includes(sitId)) reasons.push(LOCK_REASON.ADULT);
  if (!hasTeachableContent(sitId)) reasons.push(LOCK_REASON.COMING_SOON);
  return reasons;
}

// The per-situation model the UI renders: catalog facts + this learner's priority
// + why it is (not) offerable. `readiness` is carried through verbatim so a
// surface can never claim a situation is approved — it reads 'coming-soon' for
// all 16 today and only a human native reviewer can change that.
//
// THREE COUNTS, DELIBERATELY DIFFERENT — do not collapse them:
//   cardCount      — every tagged card (includes empty-`ph`, includes locked
//                    stages). The catalog fact. NOT what a Start launches.
//   teachableCount — cardCount minus empty-`ph`. The situation's real size.
//   startCount     — teachableCount ∩ this learner's stage window. The ONLY
//                    number a Start button may claim, because it is the session.
// `startable` is the enable-condition for that button: content exists AND this
// learner has some of it open. It is NOT approval — nothing here is approved.
function describeSituation(sitId, path, stats, stageWindow) {
  const s = getSituation(sitId);
  const reasons = lockReasons(sitId, stats);
  const offerable = reasons.length === 0;
  // Only price a start pool for a situation we would actually offer: a locked
  // situation's pool is never launched, so computing one would be dead work and
  // an invitation to render a count next to a lock.
  const startCount = offerable ? situationStartPool(sitId, stageWindow).length : 0;
  return {
    sitId,
    name: s ? s.name : sitId,
    order: s ? s.order : null,          // §2 catalog order (NOT this learner's rank)
    base: s ? s.base : 0,
    content: s ? s.content : null,      // curriculum.md §4.2 tier
    tagged: !!(s && s.tagged),
    cardCount: SITUATION_CARD_COUNTS[sitId] || 0,
    teachableCount: SITUATION_TEACHABLE_COUNTS[sitId] || 0,
    startCount,
    startable: offerable && startCount > 0,
    priority: priority(sitId, path),    // base × §3 weight for this path
    readiness: situationReadiness(sitId),
    offerable,
    reasons,
    reason: reasons[0] || null,
    lockLabel: reasons.length ? LOCK_LABEL[reasons[0]] : null,
  };
}

// ── The free daily recommender (engagement.md §2.1) ──────────────────────────
// getSituationRecommendation(stats, stageWindow) → { order, upNext, … }
//   order          — ALL 16 ids, the pure §3 reweighting for this learner's path.
//                    Never filtered, never truncated, never forked.
//   entries        — all 16 annotated, sequenced by `order`.
//   upNext         — the highest-priority situation this learner can actually
//                    START today, or null if none. The recommender "resolves
//                    past" everything locked instead of dropping it.
//   lockedPreviews — every situation in `order` that is not offerable, in order,
//                    each annotated with WHY, so the UI renders a locked/preview
//                    card rather than a hole in the list.
//   comingSoon     — the subset of lockedPreviews with no content yet. These are
//                    the SAME entry objects (a convenience view, not a copy).
//
// ── THE RAIL PARTITION (this is the UI-layer content filter) ─────────────────
// startable / previews / deferred partition ALL 16 — every id lands in exactly
// one, nothing is invented, nothing is lost. This is where "don't advertise
// empty situations" is decided, and note WHERE it is not: `order` above is still
// the untouched, reweight-only permutation of all 16 (FOUNDATION §3). Filtering
// by mutating the order function would turn a reweighting into a fork and make
// the identity-path promise unverifiable; filtering the VIEW leaves the order
// intact and honest.
//   startable — offerable AND this learner has cards open. Gets a real Start.
//   previews  — not startable but deliberately surfaced anyway (sit-dating: a
//               shipped entitlement surface, see ALWAYS_PREVIEW).
//   deferred  — zero teachable content and nothing to sell. These are the rows
//               that used to read "No lessons written yet"; the UI collapses
//               them into ONE honest "more coming" affordance.
//
// An unknown/absent identityPath falls back to 'path-none' (all-N weights, §3),
// which yields exactly the §2 catalog order. An omitted stageWindow falls back to
// stage 1 only (DEFAULT_STAGE_WINDOW) — under-offer, never leak.
export function getSituationRecommendation(stats, stageWindow = DEFAULT_STAGE_WINDOW) {
  const path = (stats && stats.identityPath) || 'path-none';
  const order = getSituationOrder(path);
  const entries = order.map((sitId) => describeSituation(sitId, path, stats, stageWindow));
  const lockedPreviews = entries.filter((e) => !e.offerable);
  return {
    path,
    order,
    entries,
    // upNext must be LAUNCHABLE, not merely unlocked: it is offered as "your next
    // lesson", so a situation we could not actually start would make the
    // recommender itself the thing that lies. It is also steered to a REAL first
    // session (>= MIN_FIRST_SESSION_SIZE in-window cards) so a fresh tourist gets a
    // content-rich lesson instead of a 2-card teaser; falls back to any startable
    // situation so a learner whose only open situations are small still gets one.
    upNext: entries.find((e) => e.startable && e.startCount >= MIN_FIRST_SESSION_SIZE)
      || entries.find((e) => e.startable)
      || null,
    lockedPreviews,
    comingSoon: lockedPreviews.filter((e) => e.reasons.includes(LOCK_REASON.COMING_SOON)),
    startable: entries.filter((e) => e.startable),
    previews: entries.filter((e) => !e.startable && isAlwaysPreview(e.sitId)),
    // Written-but-stage-locked (Wave 7): the situation HAS teachable content, just
    // none in the learner's current stage window (e.g. a stage-1 learner and
    // sit-admin, whose cards are stage 3-8). Its lessons exist, so it is NOT
    // collapsed as "not written" — it surfaces as an upcoming row with its real
    // teachable count and becomes startable as the learner advances.
    upcoming: entries.filter((e) => !e.startable && !isAlwaysPreview(e.sitId) && hasTeachableContent(e.sitId)),
    // Truly empty — no teachable content at all. The honest "coming soon, not
    // written yet" collapsed backlog.
    deferred: entries.filter((e) => !e.startable && !isAlwaysPreview(e.sitId) && !hasTeachableContent(e.sitId)),
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
export function describeAllSituations(stats, stageWindow = DEFAULT_STAGE_WINDOW) {
  const path = (stats && stats.identityPath) || 'path-none';
  return SITUATIONS.map((s) => describeSituation(s.id, path, stats, stageWindow));
}
