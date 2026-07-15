// Validation for the situation rail: the per-learner order, the free daily
// recommender, and sequential unlock (src/lib/situationProgression.js).
//
// Proves, on every run, the three rules the rail must never break:
//   (1) TAUGHT-BEFORE-TESTED — a situation's test pool is the intersection of its
//       cards with the derived `taught` set (mastery.js isTaught), so an untaught
//       learner has an empty pool and no untaught card can ever be tested;
//   (2) NO PATH GATING — for EVERY path, getSituationOrder(path) is a PERMUTATION
//       of the 16 canonical ids (no drops, no dupes, no forks — FOUNDATION §3
//       reweights order only), and the recommender never removes a situation from
//       `order`; it annotates locked previews instead (engagement.md §2.1);
//   (3) 0 APPROVED — no situation resolves approved, situationReadiness is never
//       'ready', and even the recommended "up next" is still draft content.
//
// Plus the sequential-unlock invariants of getMiniUnitProgressState mirrored onto
// getSituationProgressState (progression.md §2.2): first always unlocked, unlock
// on previous complete, exactly one 'current', everything past it locked.

import {
  SITUATIONS, SITUATION_IDS, PATHS, getSituationOrder, priority,
  cardsInSituation, situationReadiness, situationReviewComplete,
} from '../src/lib/situations.js';
import {
  getSituationRecommendation, getSituationProgressState, situationTestPool,
  isSituationTestable, lockReasons, LOCK_REASON,
} from '../src/lib/situationProgression.js';
import { isTaught, taughtCardIds } from '../src/lib/mastery.js';
import { isApproved } from '../src/lib/reviewStatus.js';
import { MINI_UNITS } from '../src/data/miniUnits.js';

let failures = 0;
const ok = (name) => console.log(`OK   ${name}`);
const fail = (name, detail) => { console.log(`FAIL ${name}  ${detail}`); failures++; };
const assert = (name, cond, detail = '') => (cond ? ok(name) : fail(name, detail));

const FREE = { identityPath: 'path-none' };
const SUPER = { identityPath: 'path-partner', tier: 'super' };
const sorted = (a) => [...a].sort();

// ---- 1. No path gating: every path's order is a permutation of the 16 ---------
for (const path of PATHS) {
  const order = getSituationOrder(path);
  const uniq = new Set(order);
  assert(`${path}: order is a permutation of the 16 canonical situations`,
    order.length === 16 && uniq.size === 16
    && JSON.stringify(sorted(order)) === JSON.stringify(sorted(SITUATION_IDS)),
    `${order.length} ids, ${uniq.size} unique`);
  const priorities = order.map((id) => priority(id, path));
  assert(`${path}: order is sorted descending by priority(sit, path)`,
    priorities.every((p, i) => i === 0 || priorities[i - 1] >= p), priorities.join(','));
}
assert('path-none (all-N weights) reproduces the §2 catalog order exactly',
  JSON.stringify(getSituationOrder('path-none')) === JSON.stringify([...SITUATION_IDS]));
assert('an unknown path still yields all 16 (unknown → all-N, never a fork)',
  getSituationOrder('path-bogus').length === 16);

// ---- 2. The recommender annotates, never drops -------------------------------
for (const path of PATHS) {
  for (const [tier, stats] of [['free', { identityPath: path }], ['super', { identityPath: path, tier: 'super' }]]) {
    const rec = getSituationRecommendation(stats);
    assert(`${path}/${tier}: recommendation.order is the untouched getSituationOrder(path)`,
      JSON.stringify(rec.order) === JSON.stringify(getSituationOrder(path)));
    assert(`${path}/${tier}: nothing is dropped from order (all 16 present)`,
      rec.order.length === 16
      && JSON.stringify(sorted(rec.order)) === JSON.stringify(sorted(SITUATION_IDS)));
    assert(`${path}/${tier}: every locked preview is still present in order`,
      rec.lockedPreviews.every((e) => rec.order.includes(e.sitId)));
    assert(`${path}/${tier}: every situation is either offerable or a locked preview`,
      rec.order.every((id) => lockReasons(id, stats).length === 0
        || rec.lockedPreviews.some((e) => e.sitId === id)));
    assert(`${path}/${tier}: sit-dating is NEVER up next`,
      !rec.upNext || rec.upNext.sitId !== 'sit-dating', rec.upNext && rec.upNext.sitId);
    const dating = rec.lockedPreviews.find((e) => e.sitId === 'sit-dating');
    assert(`${path}/${tier}: sit-dating is a locked preview annotated with a reason`,
      !!dating && dating.reasons.length > 0 && !!dating.lockLabel,
      dating && dating.reasons.join('+'));
    assert(`${path}/${tier}: up next is offerable and comes from order`,
      !!rec.upNext && rec.upNext.offerable && rec.order.includes(rec.upNext.sitId));
    // "Resolves past" (engagement.md:94): everything ranked ABOVE up next is
    // locked — the recommender skips it, it never deletes it.
    const upIdx = rec.upNext ? rec.order.indexOf(rec.upNext.sitId) : rec.order.length;
    assert(`${path}/${tier}: recommender resolves PAST higher-ranked locks (never deletes them)`,
      rec.order.slice(0, upIdx).every((id) => rec.lockedPreviews.some((e) => e.sitId === id)));
  }
}
{
  const free = getSituationRecommendation({ identityPath: 'path-partner' });
  const dating = free.lockedPreviews.find((e) => e.sitId === 'sit-dating');
  assert('free + path-partner: sit-dating is locked as Super (the §2.1 honest caveat)',
    !!dating && dating.reason === LOCK_REASON.SUPER
    && dating.reasons.includes(LOCK_REASON.ADULT), dating && dating.reasons.join('+'));
  const superRec = getSituationRecommendation(SUPER);
  const superDating = superRec.lockedPreviews.find((e) => e.sitId === 'sit-dating');
  assert('super + path-partner: sit-dating drops the super lock but keeps 18+ / coming-soon',
    !!superDating && !superDating.reasons.includes(LOCK_REASON.SUPER)
    && superDating.reasons.includes(LOCK_REASON.ADULT), superDating && superDating.reasons.join('+'));
  assert('coming-soon is the subset of locked previews that owns no content yet',
    superRec.comingSoon.every((e) => e.reasons.includes(LOCK_REASON.COMING_SOON) && !e.tagged)
    && superRec.comingSoon.length === SITUATIONS.filter((s) => !s.tagged).length,
    superRec.comingSoon.map((e) => e.sitId).join(','));
  assert('up next owns real cards (tagged), so the promise is deliverable',
    !!superRec.upNext && superRec.upNext.tagged && superRec.upNext.cardCount > 0);
}

// ---- 3. Sequential unlock (mirrors getMiniUnitProgressState) ------------------
{
  const order = getSituationOrder('path-none');
  const fresh = getSituationProgressState(order);
  assert('fresh learner: first situation is current, everything else locked',
    fresh.units[0].status === 'current'
    && fresh.units.slice(1).every((s) => s.status === 'locked'));
  assert('fresh learner: shape mirrors getMiniUnitProgressState',
    fresh.currentUnitId === order[0] && fresh.currentSituationId === order[0]
    && fresh.units === fresh.situations && fresh.completedCount === 0
    && fresh.totalCount === 16 && fresh.pathComplete === false);

  const three = getSituationProgressState(order, order.slice(0, 3), order[3]);
  assert('a situation unlocks when the previous one is complete',
    three.units.slice(0, 3).every((s) => s.status === 'complete')
    && three.units[3].status === 'current' && three.units[4].status === 'locked');
  assert('completedCount tracks the ledger; current is in progress when pointed at',
    three.completedCount === 3 && three.currentUnitId === order[3]
    && three.units[3].inProgress === true);

  const gap = getSituationProgressState(order, [order[2]]);
  assert('an out-of-sequence completion never opens a second frontier',
    gap.units.filter((s) => s.status === 'current').length === 1
    && gap.units[0].status === 'current' && gap.units[3].status === 'locked');
  assert('exactly one current in every state (or none when complete)',
    [fresh, three, gap].every((st) => st.units.filter((s) => s.isCurrent).length === 1));

  const done = getSituationProgressState(order, order);
  assert('all complete → pathComplete, no current pointer',
    done.pathComplete === true && done.currentUnitId === null
    && done.currentSituationId === null && done.completedCount === 16);
  assert('progress state never invents or drops a situation',
    JSON.stringify(fresh.units.map((s) => s.sitId)) === JSON.stringify(order));
}

// ---- 4. Taught-before-tested (mastery.js isTaught is the only signal) ---------
{
  assert('untaught learner: every situation test pool is empty',
    SITUATION_IDS.every((id) => situationTestPool(id, {}).length === 0)
    && SITUATION_IDS.every((id) => !isSituationTestable(id, {})));

  const greetCards = cardsInSituation('sit-greet');
  const seed = greetCards[0];
  const progress = { [seed.id]: { reviews: 1 } };
  assert('a card is testable only once taught (SRS ladder)',
    JSON.stringify(situationTestPool('sit-greet', { progress })) === JSON.stringify([seed.id])
    && isSituationTestable('sit-greet', { progress }), `seed ${seed.id}`);
  assert('teaching one situation never opens another situation for testing',
    SITUATION_IDS.filter((id) => id !== 'sit-greet')
      .every((id) => situationTestPool(id, { progress }).length === 0));

  // Both "seen" ladders, together: SRS progress ∪ completed mini-units. The pool
  // must equal (situation cards ∩ taught) exactly — no untaught leak, no drop.
  const unitIds = MINI_UNITS.slice(0, 3).map((u) => u.unitId);
  const learner = { progress, completedMiniUnits: unitIds };
  const taught = taughtCardIds(progress, unitIds);
  assert('test pool === situation cards ∩ taught, for every situation (both ladders)',
    SITUATION_IDS.every((id) => JSON.stringify(situationTestPool(id, learner))
      === JSON.stringify(cardsInSituation(id).map((c) => c.id).filter((cid) => taught.has(cid)))));
  assert('no untaught card ever enters a test pool',
    SITUATION_IDS.every((id) => situationTestPool(id, learner)
      .every((cid) => isTaught(cid, progress, unitIds) === true)));
  assert('a test pool never leaks a card from another situation',
    SITUATION_IDS.every((id) => {
      const own = new Set(cardsInSituation(id).map((c) => c.id));
      return situationTestPool(id, learner).every((cid) => own.has(cid));
    }));
}

// ---- 5. Nothing is approved — not even what we recommend ----------------------
assert('NO situation readiness is "ready" (nothing approved to surface)',
  SITUATIONS.every((s) => situationReadiness(s.id) === 'coming-soon'));
assert('NO situation is review-complete', SITUATION_IDS.every((id) => situationReviewComplete(id) === false));
assert('NO card in any situation resolves approved',
  SITUATION_IDS.every((id) => cardsInSituation(id).every((c) => !isApproved(c))));
{
  const rec = getSituationRecommendation(FREE);
  assert('every recommended entry carries readiness coming-soon (draft badge stays)',
    rec.upNext.readiness === 'coming-soon'
    && rec.lockedPreviews.every((e) => e.readiness === 'coming-soon'));
  assert('up next is offerable WITHOUT being approved (offerable ≠ approved)',
    rec.upNext.offerable === true && situationReadiness(rec.upNext.sitId) === 'coming-soon',
    rec.upNext.sitId);
}

console.log('');
if (failures > 0) {
  console.log(`Situation sequence check FAILED (${failures} failure(s)).`);
  process.exit(1);
}
console.log(`Situation sequence check passed (${PATHS.length} paths × 16 situations, 0 approved, 0 dropped).`);
