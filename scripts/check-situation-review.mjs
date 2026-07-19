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
//   • approvals EXIST and are earned: main-deck cards resolve to 'approved' only
//     where a situation sign-off in nativeReviewSignoff.js also clears the
//     eligibility floor, and the Dating pack is approved as a whole pack;
//   • SITUATION_REVIEW_COMPLETE holds all 16 canonical situations (§2 order); its
//     flags mean "100% of this situation is approved" and are still all false,
//     because every situation retains some withheld (empty-`ph`/quarantined) cards;
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
// Primitives for re-deriving the eligibility floor WITHOUT the production
// predicate — see §3. Importing these is the whole point: the guard must reach
// the same conclusion by a different route than the code it is guarding.
import { hasPhonetic } from '../src/lib/phonetics.js';
import { QUARANTINED_CARD_IDS } from '../src/data/contentFlags.js';

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
// RE-DERIVED FROM PRIMITIVES ON PURPOSE — do NOT call isEligibleForApproval here.
// That is the function the pipeline used to DECIDE these approvals, so asking it
// again only asks the same oracle that made the call: if it wrongly returns true,
// the stamp and the check are wrong together and the assertion passes anyway.
// (Verified: with the phonetic gate removed from isEligibleForApproval, 4 empty-ph
// cards were stamped approved and the old self-referential form still said OK.)
// Restating the floor independently — hasPhonetic + the quarantine id set +
// the two needs-review conventions — is what gives this assertion teeth.
const eligibleIndependently = (c) => hasPhonetic(c)
  && !QUARANTINED_CARD_IDS.has(c.id)
  && c.needsReview !== true
  && c.reviewStatus !== REVIEW_STATE.NEEDS_REVIEW;
const ineligibleApproved = approvedAll.filter((c) => !eligibleIndependently(c));
assert('NOTHING INELIGIBLE IS APPROVED (empty ph / quarantined / contradiction / needs-review)',
  ineligibleApproved.length === 0,
  `${ineligibleApproved.length} ineligible card(s) approved: ${ineligibleApproved.slice(0, 8).map((c) => c.id).join(',')}`);
// The production predicate must AGREE with the independent floor on every card.
// This is what catches isEligibleForApproval itself drifting, rather than trusting it.
const floorDrift = ALL_CARDS.filter((c) => isEligibleForApproval(c) !== eligibleIndependently(c));
assert('isEligibleForApproval agrees with the independently-derived floor on every card',
  floorDrift.length === 0,
  `${floorDrift.length} card(s) disagree: ${floorDrift.slice(0, 8).map((c) => c.id).join(',')}`);
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

// ---- 3b. First native sign-off has landed — the POSITIVE invariants ------------
// RETIRED (2026-07-16): the "nothing is approved yet" block that carried the weight
// while the manifest was empty. The first real sign-off happened in the same commit
// that deleted it — exactly as its header instructed. §3 above now does the real
// work (it proves nothing INELIGIBLE is approved, re-derived from primitives); the
// assertions here prove the RIGHT things ARE approved and that no completion flag
// was flipped ahead of its approvals. Do NOT relax these to keep a build green.
const approvedCards = CARDS.filter(isApproved);
assert('main-deck approvals exist (the first native sign-off has landed)',
  approvedCards.length > 0, `${approvedCards.length} approved`);
// Flag honesty: a situation may claim SITUATION_REVIEW_COMPLETE only when 100% of
// its cards are approved. Every tagged situation still has empty-`ph` holdouts, so
// none flips today — this asserts none was flipped while any card is unapproved.
const flagRunsAhead = SITUATION_IDS.filter((id) =>
  situationReviewComplete(id) && cardsInSituation(id).some((c) => !isApproved(c)));
assert('every review-complete situation has 100% of its cards approved (flag never runs ahead of approval)',
  flagRunsAhead.length === 0, flagRunsAhead.join(','));
// A situation is 'ready' to surface approved content only when its flag is true;
// no situation is 100% today, so all stay 'coming-soon' and keep the draft badge.
assert('no situation surfaces as "ready" while any of its cards is unapproved',
  SITUATIONS.every((s) => situationReadiness(s.id) === 'coming-soon'));
// The Dating pack is all-or-nothing: the flag is honest only if every phrase is
// approved. It is now legitimately true (90058 resolved → all 60 eligible+approved).
assert('DATING_REVIEW_COMPLETE ⟹ every dating phrase is approved',
  !DATING_REVIEW_COMPLETE || DATING_PHRASES.every((p) => p.reviewStatus === 'approved'));
assert('the Dating pack is approved (flag true AND all 60 phrases approved)',
  DATING_REVIEW_COMPLETE && DATING_PHRASES.every((p) => p.reviewStatus === 'approved'));

// ---- 4. Situation completion flags --------------------------------------------
const keys = Object.keys(SITUATION_REVIEW_COMPLETE);
assert('SITUATION_REVIEW_COMPLETE has all 16 canonical situations in §2 order',
  keys.length === 16 && JSON.stringify(keys) === JSON.stringify(SITUATION_IDS), JSON.stringify(keys));
assert('every SITUATION_REVIEW_COMPLETE flag is a boolean',
  Object.values(SITUATION_REVIEW_COMPLETE).every((v) => typeof v === 'boolean'));
// Flag→approval honesty is enforced in §3b (flagRunsAhead). No situation is 100%
// approved today, so all 16 flags are still false — asserted here so a premature
// flip is caught, not by hard-coding "false" (which would fight the first real flip).
assert('no situation flag is true while the situation has unapproved cards',
  SITUATION_IDS.every((id) => !situationReviewComplete(id)
    || cardsInSituation(id).every((c) => isApproved(c))));

// ---- 5. Mandatory draft badge -------------------------------------------------
assert('draft badge label matches the foundation string exactly',
  DRAFT_BADGE_LABEL === 'Draft content — pending native-speaker review', DRAFT_BADGE_LABEL);
assert('pending/needs-review are drafts (render the badge); approved is not',
  isDraft({}) && isDraft({ needsReview: true }) && !isDraft({ reviewStatus: 'approved' }));

// ---- 6. Tagging overlay sanity (non-brittle) ----------------------------------
const tagged = SITUATIONS.filter((s) => s.tagged).map((s) => s.id).sort();
// A situation is `tagged` IFF it owns ≥1 card. Wave 7 added a per-card tag layer
// (situationTags.js SITUATION_CARD_TAGS) that populated 7 formerly-empty
// situations, so the tagged set is now derived, not a hard-coded 7 — but the
// tagged⟺owns-cards invariant is exactly what keeps it honest.
assert('a situation is tagged IFF it owns ≥1 card',
  SITUATIONS.every((s) => s.tagged === (cardsInSituation(s.id).length > 0)),
  SITUATIONS.filter((s) => s.tagged !== (cardsInSituation(s.id).length > 0)).map((s) => s.id).join(','));
// The 7 original category-tagged situations must never lose their tag.
const CORE_TAGGED = ['sit-directions', 'sit-food', 'sit-greet', 'sit-housing',
  'sit-money', 'sit-pharmacy', 'sit-smalltalk'];
assert('the 7 core category-tagged situations are still tagged',
  CORE_TAGGED.every((id) => tagged.includes(id)), tagged.join(','));
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
console.log(`Situation review check passed (${SITUATIONS.length} situations, ${CARDS.length} cards, ${CARDS.filter(isApproved).length} approved).`);
