// ─────────────────────────────────────────────────────────────────────────────
// NATIVE REVIEW SIGN-OFF MANIFEST — the human decision, in machine-readable form.
//
// THE HUMAN EDITS THIS FILE. Nothing else in the codebase grants approval.
//
// ── THIS FILE *IS* THE APPROVAL ──────────────────────────────────────────────
// Adding an entry below IS the act of approval. It is not a request for
// approval, not a hint to some other system, not a cache of a decision recorded
// elsewhere — the entry is the decision itself. src/data/cards.js reads this map
// in its export pipeline and stamps `reviewStatus:'approved'` on what it covers.
// There is no other path to 'approved' anywhere in the app.
//
// The named party whose sign-off this file records is REVIEWER_OF_RECORD in
// src/lib/reviewStatus.js — 'Tuk Talk Thai — Internal Thai Review Team'. Their
// worklist and instructions are docs/native-review-signoff.md.
//
// ── ELIGIBILITY CAN ONLY SUBTRACT FROM THIS FILE, NEVER ADD TO IT ────────────
// Every entry here is intersected with an ELIGIBILITY FLOOR (non-empty `ph`, not
// quarantined, no internal contradiction, not flagged needs-review):
//
//     approved  ⟺  (signed off here)  AND  (eligible)
//
// Sign off on an ineligible item and it stays UNapproved — the floor withholds,
// and that is the only power the floor has. It cannot approve anything on its
// own, because not one of those four gates reads the Thai. A card can have a
// well-formed `ph`, a clean note, and no flags, and still be wrong Thai. Only a
// human who reads Thai can catch that, which is why the entry below — not the
// structural check — is the evidence.
//
// ── NEVER ADD AN ENTRY ON SOMEONE'S BEHALF ──────────────────────────────────
// Do not add an entry because an item "looks fine", because the validators pass,
// because a batch was "probably reviewed", or because a deadline needs it. An
// entry is a claim that a named human read the Thai and vouched for it. Adding
// one for them forges that claim, and the forgery is invisible: an approved card
// ships with the draft badge REMOVED, so a learner has no way to tell a vouched
// word from a guessed one. In a tonal language that is a wrong word taught
// authoritatively. If you are an agent, a script, or anyone other than the
// reviewer: you may not write in this file.
//
// ── SHAPE ────────────────────────────────────────────────────────────────────
// `signedOffAt` is the ISO date (YYYY-MM-DD) the human reviewed the scope. It is
// copied verbatim onto `reviewedAt` — it is the review date, NOT the build date.
//
//   situations — sign off a whole situation's tagged cards at once, keyed by
//                canonical situation id (src/lib/situations.js SITUATION_IDS).
//   dating     — the 18+ Super pack, signed off as ONE pack (it has no per-phrase
//                scope). BLOCKED TODAY: see the note on the field below.
//   cards      — per-card sign-off, keyed by numeric card id. Wins over the
//                card's situation entry (a narrower scope is a more specific
//                decision). Use for cards a situation sign-off should not cover.
// ─────────────────────────────────────────────────────────────────────────────

export const NATIVE_REVIEW_SIGNOFF = Object.freeze({
  // Situation-scope sign-off: covers every card tagged to that situation.
  situations: Object.freeze({
    // 'sit-greet': { signedOffAt: '2026-07-15' },
  }),

  // Dating pack sign-off, or null. { signedOffAt: '…' } once the pack is signed off.
  //
  // DO NOT FILL THIS IN YET — it cannot honestly be filled in today, and the
  // system will refuse it (fail closed) rather than act on it:
  // phrase 90058's severity is still 'needs-review' (its mild/strong reading is
  // the reviewer's open call — src/data/datingPhrases.js:905-932), so the pack is
  // at best 59/60 reviewed and DATING_REVIEW_COMPLETE can never honestly flip.
  // scripts/check-dating-quiz.mjs:130 forbids any phrase claiming approval while
  // that flag is false, so approving the other 59 would break the very gate that
  // keeps the pack honest. Confirm 90058's severity FIRST; the pack unblocks with
  // it. Documented as the gating item in docs/native-review-signoff.md.
  dating: null,

  // Per-card sign-off: { <cardId>: { signedOffAt: 'YYYY-MM-DD' } }.
  cards: Object.freeze({
    // 5001: { signedOffAt: '2026-07-15' },
  }),
});
