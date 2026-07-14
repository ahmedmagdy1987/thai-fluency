// ─────────────────────────────────────────────────────────────────────────────
// CANONICAL CONTENT REVIEW STATUS — the single vocabulary + adapters for the
// "nothing unreviewed ships as approved" pipeline (FOUNDATION README §9,
// curriculum.md §5).
//
// This file is a LEAF PRIMITIVE: it imports nothing (no cards, no situations),
// so it can be imported safely from anywhere — data files, lib logic, UI, and
// the validators — without an import cycle. `situations.js` builds ON TOP of
// this file; this file never depends on `situations.js`.
//
// ── THE TWO LEGACY CONVENTIONS THIS UNIFIES ──────────────────────────────────
//   1. Main deck (src/data/cards.js): a boolean `needsReview:true` on 95 cards.
//      There is NO `reviewStatus` field anywhere on the 4,791 cards.
//   2. Dating pack (src/data/datingPhrases.js): a string `reviewStatus:'pending'`
//      on all 60 phrases, gated by `DATING_REVIEW_COMPLETE = false`.
//
// The adapter below (`reviewStatusOf`) maps BOTH onto one vocabulary WITHOUT
// rewriting a single card: the 95 legacy `needsReview:true` cards resolve to
// 'needs-review'; everything with no status resolves to the default 'pending'.
// No byte of cards.js changes.
//
// ── THE APPROVAL RULE (do not violate) ───────────────────────────────────────
// 'approved' is NEVER derived, defaulted, or inferred. It exists ONLY when a
// HUMAN — the named native-speaker reviewer (still an open owner-launch input;
// that reviewer does not exist yet) — explicitly sets `reviewStatus:'approved'`
// on an item AND flips that item's situation flag in SITUATION_REVIEW_COMPLETE
// (or DATING_REVIEW_COMPLETE for the Dating pack). Until then, absence of a
// status means 'pending', never 'approved'. `reviewStatusOf` can therefore only
// ever RETURN 'approved' if a human already wrote it into the data — this module
// itself marks nothing approved.
//
// ── DERIVATIONS ARE NEVER APPROVALS ──────────────────────────────────────────
// Auto-derived content is a transform of source content, not a native sign-off,
// and MUST inherit the source item's status — it may never independently claim
// 'approved' or drop the draft badge (FOUNDATION §9, curriculum.md §5.5):
//   • the voice.js M/F flip (displayCard / displayLine / displayBuilder),
//   • sentence-builder token decomposition,
//   • the tone-from-`ph` parse (toneFromPh output),
//   • any other runtime derivation.
// These are DERIVATIONS: `reviewStatusOf(derived)` must be called on the SOURCE
// card, and the derived surface inherits that status verbatim.
// ─────────────────────────────────────────────────────────────────────────────

// Canonical review-status vocabulary — EXACTLY these three, ordered draft→final.
// The validators assert this set is closed (no fourth status is ever introduced).
export const REVIEW_STATE = Object.freeze({
  PENDING: 'pending',            // default; author-entered, not native-checked
  NEEDS_REVIEW: 'needs-review',  // flagged for re-check (legacy needsReview:true)
  APPROVED: 'approved',          // a NAMED native reviewer signed off (human-only)
});

// The closed vocabulary as an array (validator checks this is exactly the set).
export const REVIEW_STATUSES = Object.freeze([
  REVIEW_STATE.PENDING,
  REVIEW_STATE.NEEDS_REVIEW,
  REVIEW_STATE.APPROVED,
]);

// The mandatory draft badge label rendered on ANY 'pending' or 'needs-review'
// surface (FOUNDATION §9; exercise-types.md §0.3). Shared so UI + validators
// agree on one exact string. Uses an em dash to match the foundation verbatim.
export const DRAFT_BADGE_LABEL = 'Draft content — pending native-speaker review';

// Byte-safe adapter: resolve any content item to a canonical review status
// WITHOUT editing the item.
//   • explicit `reviewStatus` (Dating phrases, future authored cards) wins;
//   • legacy `needsReview:true` (95 main-deck cards) → 'needs-review';
//   • everything else → 'pending' (the default — absence never means approved).
// This is the ONLY place the two legacy conventions are reconciled.
export function reviewStatusOf(item) {
  if (!item) return REVIEW_STATE.PENDING;
  if (item.reviewStatus) return item.reviewStatus;
  return item.needsReview ? REVIEW_STATE.NEEDS_REVIEW : REVIEW_STATE.PENDING;
}

// True only when a human already wrote 'approved' into the data. Never derives.
export function isApproved(item) {
  return reviewStatusOf(item) === REVIEW_STATE.APPROVED;
}

// True for anything that must still render the draft badge (pending OR flagged).
export function isDraft(item) {
  const s = reviewStatusOf(item);
  return s === REVIEW_STATE.PENDING || s === REVIEW_STATE.NEEDS_REVIEW;
}

// Membership test used by validators / defensive callers.
export function isValidReviewStatus(status) {
  return REVIEW_STATUSES.includes(status);
}

// Badge model for a status. Draft states carry the mandatory pending label;
// 'approved' carries no draft badge (badge removed once a human signs off).
// Mirrors the Dating REVIEW_STATUS shape (src/lib/datingQuiz.js:35-40) so the
// two surfaces stay visually consistent.
export function reviewBadge(status) {
  switch (status) {
    case REVIEW_STATE.APPROVED:
      return { label: 'Native approved', cls: 'review-approved', isDraft: false };
    case REVIEW_STATE.NEEDS_REVIEW:
      return { label: DRAFT_BADGE_LABEL, cls: 'review-needs', isDraft: true };
    case REVIEW_STATE.PENDING:
    default:
      return { label: DRAFT_BADGE_LABEL, cls: 'review-pending', isDraft: true };
  }
}

// ── Per-situation review completion flag ─────────────────────────────────────
// Mirrors `DATING_REVIEW_COMPLETE = false` (src/data/datingContent.js:168) with
// one entry per canonical situation (FOUNDATION README §2; curriculum.md §5.3).
// EVERY value is `false` and stays false until the NAMED native reviewer flips
// the specific situation after signing off — a human action, never code here.
//
// The gate (extends check-dating-quiz's existing invariant to all situations):
//   No item in situation S may resolve to 'approved' while
//   SITUATION_REVIEW_COMPLETE[S] === false.
//
// The 16 ids are the canonical situation ids VERBATIM from FOUNDATION README §2,
// in §2 order. `situations.js` owns the same id list; the validator
// (scripts/check-situation-review.mjs) cross-checks that these keys deep-equal
// SITUATIONS.map(s => s.id) so the two files can never drift — that keeps this
// leaf primitive free of any import of the (card-heavy) situations module.
export const SITUATION_REVIEW_COMPLETE = Object.freeze({
  'sit-greet': false,
  'sit-store': false,
  'sit-food': false,
  'sit-money': false,
  'sit-transport': false,
  'sit-directions': false,
  'sit-market': false,
  'sit-smalltalk': false,
  'sit-delivery': false,
  'sit-housing': false,
  'sit-pharmacy': false,
  'sit-work': false,
  'sit-dating': false,
  'sit-admin': false,
  'sit-emergency': false,
  'sit-formal': false,
});

// Is situation S allowed to expose 'approved' content yet? False for all today.
// Absence / unknown situation is treated as NOT complete (fail-closed).
export function situationReviewComplete(sitId) {
  return SITUATION_REVIEW_COMPLETE[sitId] === true;
}
