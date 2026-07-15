// Validation for the situation catalog + the unified content-review pipeline.
//
// Proves, on every run (extends check-dating-quiz's honesty rule to all situations):
//   • the review-status vocabulary is EXACTLY {pending, needs-review, approved};
//   • reviewStatusOf maps legacy needsReview:true → 'needs-review', explicit
//     reviewStatus wins, and everything else defaults to 'pending';
//   • NOTHING INELIGIBLE IS APPROVED — no approved item has an empty `ph`, is
//     quarantined, has an internal contradiction, or is flagged needs-review;
//   • every approved item is traceable to a manifest entry (no orphan approvals)
//     and carries reviewedBy === REVIEWER_OF_RECORD plus a reviewedAt date;
//   • NOTHING resolves to 'approved' anywhere (no main-deck card, no dating
//     phrase, no situation) — the named reviewer exists but has signed off nothing;
//   • SITUATION_REVIEW_COMPLETE holds all 16 canonical situations (§2 order) and
//     every flag is false; DATING_REVIEW_COMPLETE mirrors it (false);
//   • the mandatory draft badge string is exact;
//   • the situation tagging overlay is the 7 adequate situations, disjoint.

import {
  REVIEW_STATE, REVIEW_STATUSES, reviewStatusOf, isApproved, isDraft,
  DRAFT_BADGE_LABEL, SITUATION_REVIEW_COMPLETE, situationReviewComplete,
  REVIEWER_OF_RECORD,
} from '../src/lib/reviewStatus.js';
import {
  SITUATIONS, SITUATION_IDS, situationOf, cardsInSituation, situationReadiness,
} from '../src/lib/situations.js';
import {
  CARDS, ALL_CARDS, APPROVED_CARDS, isEligibleForApproval, signoffFor,
} from '../src/data/cards.js';
import { DATING_PHRASES } from '../src/data/datingPhrases.js';
import { DATING_REVIEW_COMPLETE } from '../src/data/datingContent.js';

let failures = 0;
const ok = (name) => console.log(`OK   ${name}`);
const fail = (name, detail) => { console.log(`FAIL ${name}  ${detail}`); failures++; };
const assert = (name, cond, detail = '') => (cond ? ok(name) : fail(name, detail));

// ---- 1. Closed vocabulary -----------------------------------------------------
const EXPECTED_VOCAB = ['pending', 'needs-review', 'approved'];
assert('review vocabulary is exactly {pending, needs-review, approved}',
  Array.isArray(REVIEW_STATUSES) && REVIEW_STATUSES.length === 3
  && EXPECTED_VOCAB.every((s, i) => REVIEW_STATUSES[i] === s), JSON.stringify(REVIEW_STATUSES));
assert('REVIEW_STATE enum matches the vocabulary',
  REVIEW_STATE.PENDING === 'pending' && REVIEW_STATE.NEEDS_REVIEW === 'needs-review'
  && REVIEW_STATE.APPROVED === 'approved');

// ---- 2. Byte-safe adapter -----------------------------------------------------
assert('reviewStatusOf default → pending',
  reviewStatusOf({}) === 'pending' && reviewStatusOf(undefined) === 'pending');
assert('reviewStatusOf legacy needsReview:true → needs-review',
  reviewStatusOf({ needsReview: true }) === 'needs-review');
assert('reviewStatusOf explicit reviewStatus wins over needsReview',
  reviewStatusOf({ reviewStatus: 'pending', needsReview: true }) === 'pending');
const legacy = CARDS.filter((c) => c.needsReview === true);
assert('every legacy needsReview card resolves to needs-review',
  legacy.length > 0 && legacy.every((c) => reviewStatusOf(c) === 'needs-review'),
  `${legacy.length} legacy cards`);
assert('cards with no review field default to pending',
  CARDS.filter((c) => !c.reviewStatus && !c.needsReview).every((c) => reviewStatusOf(c) === 'pending'));

// ---- 3. NOTHING INELIGIBLE IS APPROVED -----------------------------------------
// The durable invariant. It survives the first real sign-off, when the 0-approved
// assertion below retires: whatever IS approved must have cleared the eligibility
// floor. Vacuously true today (0 approvals) — that is exactly why the 0-approved
// assertion is still the thing doing the work, and why both must coexist for now.
const approvedAll = ALL_CARDS.filter(isApproved);
const ineligibleApproved = approvedAll.filter((c) => !isEligibleForApproval(c));
assert('NOTHING INELIGIBLE IS APPROVED (empty ph / quarantined / contradiction / needs-review)',
  ineligibleApproved.length === 0,
  `${ineligibleApproved.length} ineligible card(s) approved: ${ineligibleApproved.slice(0, 8).map((c) => c.id).join(',')}`);
assert('APPROVED_CARDS is exactly the approved set (the export cannot drift from the stamp)',
  APPROVED_CARDS.length === approvedAll.length
  && APPROVED_CARDS.every((c) => isApproved(c)));

// Provenance: an approval nobody is named on is an approval nobody can be asked
// to stand behind.
const badBy = approvedAll.filter((c) => c.reviewedBy !== REVIEWER_OF_RECORD);
assert('every approved card carries reviewedBy === REVIEWER_OF_RECORD',
  badBy.length === 0, `${badBy.length} approved card(s) not attributed to the reviewer of record`);
const badAt = approvedAll.filter((c) => !/^\d{4}-\d{2}-\d{2}$/.test(String(c.reviewedAt)));
assert('every approved card carries a reviewedAt date',
  badAt.length === 0, `${badAt.length} approved card(s) with no/!ISO reviewedAt`);

// Traceability: no orphan approvals. Every approved card must point back at a real
// human entry in src/data/nativeReviewSignoff.js, with a matching date. An approval
// that cannot be traced to a manifest entry was minted by code, which is the one
// thing this pipeline exists to prevent.
const orphans = approvedAll.filter((c) => {
  const s = signoffFor(c);
  return !s || s.signedOffAt !== c.reviewedAt;
});
assert('every approval traces to a manifest entry with a matching date (no orphan approvals)',
  orphans.length === 0,
  `${orphans.length} approval(s) with no matching sign-off entry: ${orphans.slice(0, 8).map((c) => c.id).join(',')}`);

// ---- 3b. Nothing is approved anywhere (RETIRES with the first real approval) ----
// RETIRE THIS BLOCK IN THE SAME COMMIT AS THE FIRST REAL SIGN-OFF. With 0 approvals
// the eligibility invariant above is vacuously true, so THIS is the assertion
// currently carrying the weight: it proves the manifest is empty and no code path
// has invented an approval. Once a human signs something off, this must fail — that
// is the signal to delete this block and let §3's invariants take over. Do NOT
// weaken it to keep a build green.
const approvedCards = CARDS.filter(isApproved);
assert('NO main-deck card resolves to approved', approvedCards.length === 0, `${approvedCards.length} approved`);
assert('NO dating phrase claims approved while review incomplete',
  DATING_REVIEW_COMPLETE || DATING_PHRASES.every((p) => p.reviewStatus !== 'approved'));
assert('NO situation is review-complete yet',
  SITUATION_IDS.every((id) => situationReviewComplete(id) === false));
assert('NO situation readiness is "ready" (nothing approved to surface)',
  SITUATIONS.every((s) => situationReadiness(s.id) === 'coming-soon'));

// ---- 4. Situation completion flags --------------------------------------------
const keys = Object.keys(SITUATION_REVIEW_COMPLETE);
assert('SITUATION_REVIEW_COMPLETE has all 16 canonical situations in §2 order',
  keys.length === 16 && JSON.stringify(keys) === JSON.stringify(SITUATION_IDS), JSON.stringify(keys));
assert('every SITUATION_REVIEW_COMPLETE flag is false',
  Object.values(SITUATION_REVIEW_COMPLETE).every((v) => v === false));
assert('DATING_REVIEW_COMPLETE mirrors situation flags (false)', DATING_REVIEW_COMPLETE === false);

// ---- 5. Mandatory draft badge -------------------------------------------------
assert('draft badge label matches the foundation string exactly',
  DRAFT_BADGE_LABEL === 'Draft content — pending native-speaker review', DRAFT_BADGE_LABEL);
assert('pending/needs-review are drafts (render the badge); approved is not',
  isDraft({}) && isDraft({ needsReview: true }) && !isDraft({ reviewStatus: 'approved' }));

// ---- 6. Tagging overlay sanity (non-brittle) ----------------------------------
const tagged = SITUATIONS.filter((s) => s.tagged).map((s) => s.id).sort();
const EXPECTED_TAGGED = ['sit-directions', 'sit-food', 'sit-greet', 'sit-housing',
  'sit-money', 'sit-pharmacy', 'sit-smalltalk'];
assert('exactly the 7 adequate situations are tagged in Pass 2',
  JSON.stringify(tagged) === JSON.stringify(EXPECTED_TAGGED), tagged.join(','));
assert('every tagged situation owns > 0 real cards',
  SITUATIONS.filter((s) => s.tagged).every((s) => cardsInSituation(s.id).length > 0));
assert('every untagged situation owns 0 cards',
  SITUATIONS.filter((s) => !s.tagged).every((s) => cardsInSituation(s.id).length === 0));
const perCard = CARDS.map(situationOf).filter(Boolean).length;
const perSit = SITUATIONS.reduce((a, s) => a + cardsInSituation(s.id).length, 0);
assert('tagging is disjoint (per-card sum === per-situation sum)', perCard === perSit, `${perCard} vs ${perSit}`);

console.log('');
if (failures > 0) {
  console.log(`Situation review check FAILED (${failures} failure(s)).`);
  process.exit(1);
}
console.log(`Situation review check passed (${SITUATIONS.length} situations, ${CARDS.length} cards, 0 approved).`);
