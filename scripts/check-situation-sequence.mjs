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
//       'ready', and even the recommended "up next" is still draft content;
//   (4) NO AFFORDANCE THAT LIES — the rail now ships a real Start, so `startable`
//       must mean it: a startable situation's pool is non-empty, holds only cards
//       that situation actually owns, only cards with a real phonetic (A3 — we
//       filter, we never synthesize), and only cards inside the learner's
//       unlocked stage window (a situation is a CROSS-STAGE tag, and the reused
//       mission scope filters by cardIds and so bypasses the stage window on its
//       own). Plus the rail partition (startable/previews/deferred) covers all 16
//       exactly once, and sit-dating is never swept out of the previews.
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
  isSituationTestable, lockReasons, LOCK_REASON, situationStartPool,
  situationTeachableCards, hasTeachableContent, isAlwaysPreview,
  DEFAULT_STAGE_WINDOW, MIN_FIRST_SESSION_SIZE,
} from '../src/lib/situationProgression.js';
import { isTaught, taughtCardIds } from '../src/lib/mastery.js';
import { isApproved } from '../src/lib/reviewStatus.js';
import { hasPhonetic } from '../src/lib/phonetics.js';
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
    // skipped, never deleted. upNext is the first LAUNCHABLE AND substantial
    // situation (>= MIN_FIRST_SESSION_SIZE), so a higher-ranked entry is skipped
    // for one of two legitimate reasons: it is not startable, OR it is startable
    // but too small to be a first session (a 2-card teaser is deferred, not
    // offered first). Either way it stays in `order` — nothing is dropped.
    const upIdx = rec.upNext ? rec.order.indexOf(rec.upNext.sitId) : rec.order.length;
    assert(`${path}/${tier}: recommender resolves PAST higher-ranked situations (never deletes them)`,
      rec.order.slice(0, upIdx).every((id) => {
        const e = rec.entries.find((x) => x.sitId === id);
        return e && rec.order.includes(id)
          && (!e.startable || e.startCount < MIN_FIRST_SESSION_SIZE);
      }));
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

// ---- 2b. The Start is real: startable ⇒ launchable -----------------------------
// The rail shipped in Wave 3 with no CTA because no flow existed. Now it has one,
// so every one of these is the difference between a Start and a lie.
{
  const WINDOWS = [
    DEFAULT_STAGE_WINDOW,
    { startedStage: 1, maxUnlockedStage: 1 },
    { startedStage: 1, maxUnlockedStage: 8 },
    { startedStage: 3, maxUnlockedStage: 5 },
    { startedStage: 8, maxUnlockedStage: 8 },
  ];

  // The content signal behind COMING_SOON. `tagged` says "owns cards";
  // hasTeachableContent says "owns cards we can actually teach". They agree on
  // today's deck — asserted, not assumed, so a future empty-`ph` situation is
  // caught rather than advertised.
  assert('hasTeachableContent agrees with `tagged` on today\'s deck (7 teachable)',
    SITUATIONS.every((s) => hasTeachableContent(s.id) === s.tagged)
    && SITUATIONS.filter((s) => hasTeachableContent(s.id)).length === 7,
    SITUATIONS.filter((s) => hasTeachableContent(s.id)).map((s) => s.id).join(','));

  // A3: the teachable pool NEVER contains an empty-`ph` card, and we never
  // invented one to fill the gap — the pool only ever shrinks.
  assert('teachable cards all carry a REAL phonetic (A3: filtered, never synthesized)',
    SITUATION_IDS.every((id) => situationTeachableCards(id).every(hasPhonetic)));
  assert('teachable ⊆ owned (filtering only ever removes cards, never adds one)',
    SITUATION_IDS.every((id) => {
      const owned = new Set(cardsInSituation(id).map((c) => c.id));
      return situationTeachableCards(id).every((c) => owned.has(c.id))
        && situationTeachableCards(id).length <= cardsInSituation(id).length;
    }));

  for (const w of WINDOWS) {
    const tag = `[${w.startedStage}-${w.maxUnlockedStage}]`;
    // THE stage-leak guard. The mission scope filters by explicit cardIds and so
    // bypasses the stage window; every situation spans stages 1-8, so an
    // unclamped pool would teach a stage-1 learner stage-8 vocabulary.
    assert(`${tag}: no start pool ever leaks a card outside the unlocked stage window`,
      SITUATION_IDS.every((id) => situationStartPool(id, w).every((cid) => {
        const card = cardsInSituation(id).find((c) => c.id === cid);
        const s = card.stage || 1;
        return s >= w.startedStage && s <= w.maxUnlockedStage;
      })), 'STAGE LEAK');
    assert(`${tag}: a start pool only ever holds cards that situation owns`,
      SITUATION_IDS.every((id) => {
        const own = new Set(cardsInSituation(id).map((c) => c.id));
        return situationStartPool(id, w).every((cid) => own.has(cid));
      }));
    assert(`${tag}: no start pool holds an empty-\`ph\` card`,
      SITUATION_IDS.every((id) => {
        const byId = new Map(cardsInSituation(id).map((c) => [c.id, c]));
        return situationStartPool(id, w).every((cid) => hasPhonetic(byId.get(cid)));
      }));
    assert(`${tag}: an untagged situation can never produce a start pool`,
      SITUATIONS.filter((s) => !s.tagged).every((s) => situationStartPool(s.id, w).length === 0));
    assert(`${tag}: start pools have no duplicate ids (session size is truthful)`,
      SITUATION_IDS.every((id) => {
        const p = situationStartPool(id, w);
        return new Set(p).size === p.length;
      }));

    for (const [tier, base] of [['free', {}], ['super', { tier: 'super' }]]) {
      for (const path of PATHS) {
        const rec = getSituationRecommendation({ ...base, identityPath: path }, w);
        // The headline: a Start button renders iff this is true, so it must mean
        // "we can hand you a real, non-empty session right now".
        assert(`${tag} ${path}/${tier}: startable ⇒ the pool it launches is non-empty`,
          rec.startable.every((e) => situationStartPool(e.sitId, w).length > 0
            && e.startCount === situationStartPool(e.sitId, w).length),
          rec.startable.map((e) => `${e.sitId}:${e.startCount}`).join(','));
        assert(`${tag} ${path}/${tier}: startable ⇒ offerable (no lock is ever bypassed)`,
          rec.startable.every((e) => e.offerable && e.reasons.length === 0));
        assert(`${tag} ${path}/${tier}: startCount never overstates the situation`,
          rec.entries.every((e) => e.startCount <= e.teachableCount
            && e.teachableCount <= e.cardCount));
        // The rail partition covers all 16 exactly once: the UI filters the VIEW,
        // it never loses a situation.
        const parts = [...rec.startable, ...rec.previews, ...rec.deferred].map((e) => e.sitId);
        assert(`${tag} ${path}/${tier}: startable+previews+deferred partition all 16 exactly once`,
          parts.length === 16 && new Set(parts).size === 16
          && JSON.stringify(sorted(parts)) === JSON.stringify(sorted(SITUATION_IDS)),
          `${parts.length} ids`);
        assert(`${tag} ${path}/${tier}: `
          + 'the partition is disjoint (nothing is both startable and deferred)',
          rec.deferred.every((e) => !e.startable) && rec.previews.every((e) => !e.startable));
        // sit-dating owns 0 cards, so the content filter WOULD sweep it into the
        // collapsed backlog. It must stay a surfaced, locked preview instead —
        // a real entitlement surface is not an empty advert (engagement.md:94).
        assert(`${tag} ${path}/${tier}: sit-dating stays a surfaced preview, never collapsed`,
          rec.previews.some((e) => e.sitId === 'sit-dating')
          && !rec.deferred.some((e) => e.sitId === 'sit-dating')
          && !rec.startable.some((e) => e.sitId === 'sit-dating'));
        assert(`${tag} ${path}/${tier}: sit-dating is NEVER startable and never up next`,
          !rec.upNext || rec.upNext.sitId !== 'sit-dating');
        // The collapsed rows are exactly the ones with nothing to teach and
        // nothing to sell — we never collapse a situation that has content.
        assert(`${tag} ${path}/${tier}: deferred ⇒ zero teachable content (we hide only what is empty)`,
          rec.deferred.every((e) => !hasTeachableContent(e.sitId) && !e.tagged
            && e.reasons.includes(LOCK_REASON.COMING_SOON) && !isAlwaysPreview(e.sitId)),
          rec.deferred.map((e) => e.sitId).join(','));
        assert(`${tag} ${path}/${tier}: the 8 collapsed + dating account for all 9 empty situations`,
          rec.deferred.length === 8 && rec.comingSoon.length === 9,
          `deferred=${rec.deferred.length} comingSoon=${rec.comingSoon.length}`);
        // Surfaced rows are ordered by the untouched §3 order — the view filters,
        // it never re-sorts (that would make the identity promise unverifiable).
        const surfaced = rec.entries.filter((e) => e.startable || rec.previews.includes(e))
          .map((e) => e.sitId);
        const expected = rec.order.filter((id) => surfaced.includes(id));
        assert(`${tag} ${path}/${tier}: surfaced rows keep the untouched §3 order`,
          JSON.stringify(surfaced) === JSON.stringify(expected));
      }
    }
  }

  // Every tagged situation is startable for EVERY legal window — otherwise the
  // rail would show a situation whose Start we suppress, which is the Wave 3
  // failure in a new costume.
  for (let lower = 1; lower <= 8; lower++) {
    for (let upper = lower; upper <= 8; upper++) {
      const w = { startedStage: lower, maxUnlockedStage: upper };
      assert(`window [${lower}-${upper}]: every tagged situation still has a startable pool`,
        SITUATIONS.filter((s) => s.tagged).every((s) => situationStartPool(s.id, w).length > 0),
        SITUATIONS.filter((s) => s.tagged && situationStartPool(s.id, w).length === 0)
          .map((s) => s.id).join(','));
    }
  }

  // Fail closed: a caller that forgets the window must UNDER-offer (stage 1),
  // never leak. A default of "no filter" would silently hand out stage-8 cards.
  assert('an omitted stage window defaults to stage 1 only (under-offer, never leak)',
    SITUATION_IDS.every((id) => JSON.stringify(situationStartPool(id))
      === JSON.stringify(situationStartPool(id, { startedStage: 1, maxUnlockedStage: 1 })))
    && DEFAULT_STAGE_WINDOW.maxUnlockedStage === 1);
  assert('a malformed/null stage window still fails closed to stage 1',
    JSON.stringify(situationStartPool('sit-greet', null))
      === JSON.stringify(situationStartPool('sit-greet', { startedStage: 1, maxUnlockedStage: 1 })));
  assert('an unknown situation id yields an empty start pool (never throws)',
    situationStartPool('sit-bogus', { startedStage: 1, maxUnlockedStage: 8 }).length === 0
    && hasTeachableContent('sit-bogus') === false);
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

// ---- 5. Approvals have landed, but the RAIL still gates on the flag ------------
// The first native sign-off approved eligible cards (2026-07-16), but no situation
// is 100% approved (every tagged one has empty-`ph` holdouts), so no flag flips —
// situationReadiness therefore stays 'coming-soon' and the rail keeps its draft
// badge. These assertions prove the rail never runs ahead of full sign-off.
assert('NO situation readiness is "ready" (none is 100% review-complete yet)',
  SITUATIONS.every((s) => situationReadiness(s.id) === 'coming-soon'));
assert('NO situation is review-complete (none is 100% approved)',
  SITUATION_IDS.every((id) => situationReviewComplete(id) === false));
assert('no review-complete situation has an unapproved card (flag never runs ahead of approval)',
  SITUATION_IDS.every((id) => !situationReviewComplete(id)
    || cardsInSituation(id).every((c) => isApproved(c))));
{
  const rec = getSituationRecommendation(FREE);
  assert('every recommended entry carries readiness coming-soon (draft badge stays)',
    rec.upNext.readiness === 'coming-soon'
    && rec.lockedPreviews.every((e) => e.readiness === 'coming-soon'));
  assert('up next is offerable WITHOUT being approved (offerable ≠ approved)',
    rec.upNext.offerable === true && situationReadiness(rec.upNext.sitId) === 'coming-soon',
    rec.upNext.sitId);
  // The new signal must not become a back door to approval. `startable` says
  // "we can teach you these cards today"; it says NOTHING about native review.
  // A startable situation may now hold approved CARDS (post-2026-07-16 sign-off),
  // but the SITUATION is still draft (not 100% review-complete), so its readiness
  // stays 'coming-soon' and the rail's mandatory draft badge renders on every row.
  assert('startable ≠ review-complete: every startable situation is still a draft situation',
    rec.startable.length === 7
    && rec.startable.every((e) => e.readiness === 'coming-soon'
      && situationReviewComplete(e.sitId) === false),
    rec.startable.map((e) => e.sitId).join(','));
  assert('every SURFACED row (startable + previews) is draft, so the badge always renders',
    [...rec.startable, ...rec.previews].every((e) => e.readiness === 'coming-soon'));
}

console.log('');
if (failures > 0) {
  console.log(`Situation sequence check FAILED (${failures} failure(s)).`);
  process.exit(1);
}
console.log(`Situation sequence check passed (${PATHS.length} paths × 16 situations, `
  + '0 approved, 0 dropped, 0 stage leaks, 0 empty Starts).');
