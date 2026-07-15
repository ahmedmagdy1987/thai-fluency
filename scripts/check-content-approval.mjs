// Validation for the manifest-driven content-approval routine (src/data/cards.js).
//
// WHY THIS EXISTS: nothing is approved today (the sign-off manifest is empty), so
// every live assertion about approval is vacuously true and the approval routine
// itself is never exercised by the real deck. It would ship untested, and the
// first time a human signs something off is the worst possible time to discover
// the intersection was wired backwards. So this script DRIVES the pure functions
// with SYNTHETIC card objects — never mutating the deck — and proves:
//
//   • signed off + eligible            → approved, with full provenance;
//   • signed off + empty `ph`          → NOT approved (no anchor to sign off on);
//   • signed off + quarantined         → NOT approved (corrupt-Thai group, C3);
//   • signed off + needs-review        → NOT approved (open question on the item);
//   • ELIGIBLE BUT NOT SIGNED OFF      → NOT approved  ← THE IMPORTANT ONE;
//   • a derived surface can never claim approved.
//
// That fifth case is the anti-derivation case and the reason for the whole design.
// Eligibility is a STRUCTURAL COMPLETENESS check — not one of its gates reads the
// Thai, so a card can pass all of them and still be wrong Thai. If eligibility ever
// GRANTED approval, every well-formed card in the deck would silently lose its
// draft badge without a native ever reading it. Eligibility may only WITHHOLD:
//
//     approved  ⟺  (signed off in the manifest)  AND  (eligible)
//
// The manifest is the evidence; the floor is a veto. Never the reverse.

import {
  approveContent, isEligibleForApproval, signoffFor, situationScopeOf,
  ALL_CARDS, APPROVED_CARDS,
} from '../src/data/cards.js';
import {
  REVIEWER_OF_RECORD, reviewStatusOf, isApproved, isDraft, reviewBadge,
} from '../src/lib/reviewStatus.js';
import { NATIVE_REVIEW_SIGNOFF } from '../src/data/nativeReviewSignoff.js';
import { DATING_PHRASES } from '../src/data/datingPhrases.js';
import { DATING_REVIEW_COMPLETE } from '../src/data/datingContent.js';

let failures = 0;
const ok = (name) => console.log(`OK   ${name}`);
const fail = (name, detail = '') => { console.log(`FAIL ${name}  ${detail}`); failures++; };
const assert = (name, cond, detail = '') => (cond ? ok(name) : fail(name, detail));

// ---- 0. Synthetic fixtures (the deck is never touched) -------------------------
// A situation the manifest can be pretended to cover, and a card id far outside
// the live id space. `cat:'greetings'` maps to 'sit-greet' via the overlay.
const SIT = 'sit-greet';
const SIGNED = { signedOffAt: '2026-07-15' };
// Synthetic cards. The `thai`/`ph` pair is COPIED VERBATIM from live card 2
// (ครับ / khráp, src/data/cards.js) and used as an OPAQUE fixture — this script
// asserts nothing about its content, only about status plumbing around it.
//
// NEVER hand-write a `ph` here, not even for a throwaway test object. A
// romanization is Thai content: its diacritic IS the tone, and the tone IS the
// word. An invented one is a wrong word that reads as authoritative — the exact
// failure this pipeline exists to prevent, committed inside its own guard. If you
// need another fixture, COPY an existing thai/ph pair off a live card.
const synthetic = (over = {}) => ({
  id: 999001, thai: 'ครับ', ph: 'khráp', en: 'test fixture', type: 'w', stage: 1, cat: 'greetings', ...over,
});

// A synthetic MANIFEST — not the real one, which stays empty. approveContent takes
// the manifest as an injectable parameter precisely so the signed-off branches get
// exercised for real: everything below drives the ACTUAL exported function, never a
// copy of its logic. (A re-implemented intersection here would pass forever while
// the real one was wired backwards — the exact failure this script exists to catch.)
const SIGNED_SITUATION = Object.freeze({
  situations: Object.freeze({ [SIT]: SIGNED }),
  dating: null,
  cards: Object.freeze({}),
});
const SIGNED_CARD = Object.freeze({
  situations: Object.freeze({}),
  dating: null,
  cards: Object.freeze({ 999001: SIGNED }),
});

// ---- 1. Signed off AND eligible → approved, with provenance --------------------
const approved = approveContent(synthetic(), SIGNED_SITUATION);
assert('signed off (situation scope) + eligible → approved',
  isApproved(approved) && approved.reviewStatus === 'approved', String(approved.reviewStatus));
assert('signed off (per-card scope) + eligible → approved',
  isApproved(approveContent(synthetic(), SIGNED_CARD)));
assert('per-card sign-off wins over the situation entry (narrower scope = more specific decision)',
  approveContent(synthetic(), Object.freeze({
    situations: Object.freeze({ [SIT]: { signedOffAt: '2026-01-01' } }),
    dating: null,
    cards: Object.freeze({ 999001: { signedOffAt: '2026-07-15' } }),
  })).reviewedAt === '2026-07-15');
assert('a sign-off on a DIFFERENT situation does not reach this card',
  !isApproved(approveContent(synthetic(), Object.freeze({
    situations: Object.freeze({ 'sit-food': SIGNED }), dating: null, cards: Object.freeze({}),
  }))));
assert('an approved card carries reviewedBy === REVIEWER_OF_RECORD',
  approved.reviewedBy === REVIEWER_OF_RECORD, String(approved.reviewedBy));
assert('an approved card carries reviewedAt copied VERBATIM from the manifest (not the build clock)',
  approved.reviewedAt === SIGNED.signedOffAt, String(approved.reviewedAt));
assert('an approved card is no longer a draft (badge drops only after a human signs off)',
  !isDraft(approved) && reviewBadge(reviewStatusOf(approved)).isDraft === false
  && reviewBadge(reviewStatusOf(approved)).label === 'Native approved');

// ---- 2. Eligibility WITHHOLDS — signed off is not enough ------------------------
const emptyPh = approveContent(synthetic({ ph: '' }), SIGNED_SITUATION);
assert('signed off + empty ph → NOT approved (no pronunciation anchor to sign off on)',
  !isApproved(emptyPh) && emptyPh.reviewStatus === undefined, String(emptyPh.reviewStatus));
const wsPh = approveContent(synthetic({ ph: '   ' }), SIGNED_SITUATION);
assert('signed off + whitespace-only ph → NOT approved',
  !isApproved(wsPh), String(wsPh.reviewStatus));
const quarantined = approveContent(synthetic({ quarantined: true }), SIGNED_SITUATION);
assert('signed off + quarantined → NOT approved (that set IS the corrupted-Thai/contradiction group, C3)',
  !isApproved(quarantined), String(quarantined.reviewStatus));
const legacyFlag = approveContent(synthetic({ needsReview: true }), SIGNED_SITUATION);
assert('signed off + legacy needsReview:true → NOT approved (open question on the item)',
  !isApproved(legacyFlag) && reviewStatusOf(legacyFlag) === 'needs-review');
const explicitFlag = approveContent(synthetic({ reviewStatus: 'needs-review' }), SIGNED_SITUATION);
assert('signed off + explicit reviewStatus:needs-review → NOT approved',
  !isApproved(explicitFlag) && reviewStatusOf(explicitFlag) === 'needs-review');
assert('a withheld card is returned UNTOUCHED (same reference — withholding never rewrites the item)',
  [synthetic({ ph: '' }), synthetic({ quarantined: true }), synthetic({ needsReview: true })]
    .every((c) => approveContent(c, SIGNED_SITUATION) === c));
assert('an undated manifest entry approves nothing (a sign-off with no date is not a decision)',
  !isApproved(approveContent(synthetic(), Object.freeze({
    situations: Object.freeze({ [SIT]: {} }), dating: null, cards: Object.freeze({}),
  }))));
assert('isEligibleForApproval agrees on every withheld shape',
  isEligibleForApproval(synthetic()) === true
  && isEligibleForApproval(synthetic({ ph: '' })) === false
  && isEligibleForApproval(synthetic({ quarantined: true })) === false
  && isEligibleForApproval(synthetic({ needsReview: true })) === false
  && isEligibleForApproval(synthetic({ reviewStatus: 'needs-review' })) === false
  && isEligibleForApproval(undefined) === false);

// ---- 3. THE ANTI-DERIVATION CASE: eligible but NOT signed off ------------------
// Driven through the REAL approveContent against the REAL (empty) manifest.
// If this ever passes-by-approving, eligibility has become a grant and every
// well-formed card in the deck loses its draft badge with no native sign-off.
const src = synthetic();
const unsigned = approveContent(src);
assert('ELIGIBLE BUT NOT SIGNED OFF → NOT approved (eligibility WITHHOLDS, it never grants)',
  !isApproved(unsigned) && unsigned.reviewStatus === undefined
  && unsigned.reviewedBy === undefined && unsigned.reviewedAt === undefined,
  'eligibility granted an approval no human recorded — the floor became evidence');
assert('the card is eligible — so it is the SIGN-OFF that is missing, not the structure',
  isEligibleForApproval(src) === true);
assert('a perfectly well-formed card is still only pending (structure is not evidence)',
  reviewStatusOf(unsigned) === 'pending' && isDraft(unsigned));
assert('approveContent returns the card UNTOUCHED (same reference) when unapproved',
  unsigned === src);
assert('signoffFor finds nothing in the empty manifest, for any scope',
  signoffFor(synthetic()) === null && signoffFor(synthetic({ situation: SIT })) === null
  && signoffFor(undefined) === null);
// An empty manifest must approve NOTHING no matter how clean the card is — the
// live-deck proof of the same rule is APPROVED_CARDS.length === 0 below.
assert('an empty manifest approves nothing, across every eligible live card',
  ALL_CARDS.filter(isEligibleForApproval).every((c) => !isApproved(approveContent(c))));

// ---- 4. Manifest hygiene --------------------------------------------------------
assert('the manifest is EMPTY today (0 approvals is the correct outcome, not a bug)',
  Object.keys(NATIVE_REVIEW_SIGNOFF.situations).length === 0
  && Object.keys(NATIVE_REVIEW_SIGNOFF.cards).length === 0
  && NATIVE_REVIEW_SIGNOFF.dating === null);
assert('the live deck has 0 approved cards (follows from the empty manifest)',
  APPROVED_CARDS.length === 0, `${APPROVED_CARDS.length} approved`);
assert('NO live card carries approval provenance without being approved',
  ALL_CARDS.every((c) => (c.reviewedBy === undefined && c.reviewedAt === undefined) || isApproved(c)));
// Every entry a human adds must be a real, dated sign-off — a bare `true` or a
// missing date is not a decision anyone can be audited on.
const entries = [
  ...Object.entries(NATIVE_REVIEW_SIGNOFF.situations),
  ...Object.entries(NATIVE_REVIEW_SIGNOFF.cards),
  ...(NATIVE_REVIEW_SIGNOFF.dating ? [['dating', NATIVE_REVIEW_SIGNOFF.dating]] : []),
];
const badEntries = entries.filter(([, v]) => !v || typeof v !== 'object'
  || !/^\d{4}-\d{2}-\d{2}$/.test(String(v.signedOffAt)));
assert('every manifest entry carries a real ISO signedOffAt date',
  badEntries.length === 0, badEntries.map(([k]) => k).join(','));
// Scope keys must resolve to something real, or a typo'd id is a silent no-op
// sign-off — the human believes they approved a situation and nothing happened.
const liveScopes = new Set(ALL_CARDS.map(situationScopeOf).filter(Boolean));
const deadScopes = Object.keys(NATIVE_REVIEW_SIGNOFF.situations).filter((s) => !liveScopes.has(s));
assert('no manifest situation key is a dead scope (a typo would be a silent no-op sign-off)',
  deadScopes.length === 0, deadScopes.join(','));
const liveIds = new Set(ALL_CARDS.map((c) => c.id));
const deadIds = Object.keys(NATIVE_REVIEW_SIGNOFF.cards).filter((id) => !liveIds.has(Number(id)));
assert('no manifest card key points at a card that does not exist',
  deadIds.length === 0, deadIds.join(','));

// ---- 5. Derivations can NEVER claim approved -----------------------------------
// A derivation is a transform of source content, not a native sign-off. It must
// inherit the SOURCE's status verbatim and may never independently claim approved.
const draftSource = synthetic();                       // pending, unsigned
const flip = { ...draftSource, thai: 'ครับ', ph: 'khráp' };        // voice.js M/F flip shape
assert('a voice-flipped derivation of a pending card is still pending, never approved',
  !isApproved(flip) && reviewStatusOf(flip) === 'pending' && isDraft(flip));
// A derived surface built from an APPROVED source inherits approved — but only
// because the SOURCE carries it. The derivation itself never mints it.
const derivedFromApproved = { ...approved };
assert('a derivation inherits its source status verbatim (it transforms, it never signs off)',
  reviewStatusOf(derivedFromApproved) === reviewStatusOf(approved));
// The sharp edge: a derived surface that lost its provenance must NOT read as
// approved just because it was built from something with a status string.
const tokenized = { thai: 'ครับ', ph: 'khráp', en: 'test fixture' }; // builder token shape
assert('a sentence-builder token carries no status of its own → pending, never approved',
  !isApproved(tokenized) && reviewStatusOf(tokenized) === 'pending');
assert('a bare tone-parse result cannot claim approval',
  !isApproved({ tone: 'rising' }) && !isApproved({}) && !isApproved(null) && !isApproved(undefined));

// ---- 6. Dating pack: signed off would FAIL CLOSED, never break the gate ---------
// check-dating-quiz.mjs:130 forbids any phrase claiming approval while
// DATING_REVIEW_COMPLETE is false. Phrase 90058 is 'needs-review' (its severity is
// the reviewer's open call), so the pack is at best 59/60 → the flag can never
// honestly flip → approving the other 59 would BREAK that gate. Resolution: the
// pack stays blocked until 90058 is confirmed. No code stamps dating phrases, and
// a dating sign-off that arrives early must REFUSE (fail closed), not proceed.
const datingIneligible = DATING_PHRASES.filter((p) => p.reviewStatus === 'needs-review');
assert('the Dating pack has a live blocker (90058 severity unconfirmed) — pack sign-off must stay refused',
  datingIneligible.length > 0 && datingIneligible.some((p) => p.id === 90058),
  'if 90058 is resolved, the pack can unblock — see docs/native-review-signoff.md');
assert('FAIL CLOSED: a dating sign-off while any phrase is ineligible approves NOTHING',
  NATIVE_REVIEW_SIGNOFF.dating === null || datingIneligible.length === 0,
  `dating sign-off recorded while ${datingIneligible.length} phrase(s) still need review `
  + '(90058) — REFUSED: approving the pack now would break check-dating-quiz.mjs:130. '
  + 'Confirm 90058 severity and flip DATING_REVIEW_COMPLETE first.');
assert('no dating phrase claims approval today (the :130 gate holds)',
  DATING_REVIEW_COMPLETE || DATING_PHRASES.every((p) => p.reviewStatus !== 'approved'));

console.log('');
if (failures > 0) {
  console.log(`Content approval check FAILED (${failures} failure(s)).`);
  process.exit(1);
}
console.log(`Content approval check passed (approval routine exercised on synthetic cards; ${APPROVED_CARDS.length} approved in the live deck — the manifest is empty).`);
