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
// HUMAN — the named native-speaker reviewer (REVIEWER_OF_RECORD below) — records
// a sign-off, on two tracks that both trace to that human:
//   • Main deck: the reviewer adds a situation (or per-card) entry to the manifest
//     src/data/nativeReviewSignoff.js; src/data/cards.js then stamps
//     `reviewStatus:'approved'` on each SIGNED-OFF card that also clears the
//     eligibility floor. The situation's SITUATION_REVIEW_COMPLETE flag is a
//     SEPARATE, coarser signal (see below) — a card can be approved before its
//     whole situation completes.
//   • Dating pack: the reviewer sets each phrase's `reviewStatus:'approved'` in
//     datingPhrases.js and flips DATING_REVIEW_COMPLETE (all-or-nothing).
// The Internal Thai Review Team completed its review on 2026-07-16 (first native
// sign-off). Absence of a status still means 'pending', never 'approved', and
// `reviewStatusOf` can only RETURN 'approved' where a human already wrote it —
// this module marks nothing approved.
//
// ── HOW THE HUMAN RECORDS THAT DECISION: THE MANIFEST ────────────────────────
// The reviewer's "explicit set" is made ONCE, in ONE machine-readable place:
// src/data/nativeReviewSignoff.js. Adding an entry there IS the act of approval;
// src/data/cards.js reads it in the export pipeline and stamps the item. Nothing
// else grants approval, and no code may add an entry on the reviewer's behalf.
//
// The manifest is intersected with an ELIGIBILITY FLOOR (non-empty `ph`, not
// quarantined, no internal contradiction, not flagged needs-review). Understand
// the asymmetry or this whole pipeline is theatre: those four gates are
// STRUCTURAL COMPLETENESS checks — NOT ONE OF THEM READS THE THAI. A card can
// have a perfectly well-formed `ph` and still be wrong Thai; catching that is
// exactly what native review is for and exactly what eligibility cannot see.
// Eligibility is therefore a NECESSARY PRECONDITION, never sufficient evidence:
// the human sign-off is the evidence, and eligibility may only ever WITHHOLD an
// approval the human already granted — it can never grant one.
//     approved  ⟺  (signed off in the manifest)  AND  (eligible)
// As of 2026-07-16 the manifest signs off the 7 content-bearing situations, so
// their eligible cards are approved (946) while the empty-`ph` (335) and
// quarantined (7) holdouts stay 'needs-review' — withheld by the floor until a
// human supplies the missing Thai. That withholding is the floor doing its one
// job, not a bug.
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

// ── The reviewer of record ───────────────────────────────────────────────────
// The ONE named party whose sign-off can move an item to 'approved' (the open
// owner-launch input, now closed). A name here is an accountability anchor, not
// a grant: this constant approves nothing by existing. It is the value stamped
// into `reviewedBy`, and the validators assert every approved item carries
// EXACTLY this string — an approval attributed to nobody, or to some other name,
// is an approval nobody can be asked to stand behind.
export const REVIEWER_OF_RECORD = 'Tuk Talk Thai — Internal Thai Review Team';

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

// ── The approval provenance fields ───────────────────────────────────────────
// An 'approved' item carries TWO more fields, stamped together with the status
// and never apart (src/data/cards.js is the only writer):
//
//   reviewedBy: REVIEWER_OF_RECORD   // WHO signed off — always the name above
//   reviewedAt: 'YYYY-MM-DD'         // WHEN, copied VERBATIM from the manifest
//                                    // entry's `signedOffAt` — never Date.now(),
//                                    // never "today". A stamp-time clock records
//                                    // when the BUILD ran, not when the human
//                                    // reviewed, and would silently re-date every
//                                    // approval on every rebuild.
//
// These are provenance, not permission: writing them does not make an item
// approved, and reading them proves nothing on an item that is not. They exist so
// an approval can be audited back to a person and a date.
export const REVIEW_PROVENANCE_FIELDS = Object.freeze(['reviewedBy', 'reviewedAt']);

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
// A value flips to `true` only when the NAMED native reviewer confirms 100% of the
// situation is approved — a human action, never code here. EVERY value is still
// `false` today: each of the 7 signed-off situations retains a few empty-`ph`
// holdouts, so none is 100% yet (they wait on the missing Thai, not on review).
//
// WHAT THE FLAG MEANS (not a per-card gate):
//   SITUATION_REVIEW_COMPLETE[S] === true  ⟹  every card in S is approved.
// It gates situationReadiness (whether S may surface as a 'ready', badge-free unit),
// NOT per-card approval — individual eligible cards are approved via the manifest
// and may carry 'approved' before the whole situation completes. The flip-never-
// ahead-of-approval direction is enforced by check-situation-review.mjs
// (flagRunsAhead); the Dating pack's DATING_REVIEW_COMPLETE is the same idea,
// all-or-nothing over its 60 phrases.
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
