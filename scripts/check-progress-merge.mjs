// Regression guard for the sign-in local↔cloud merge (M2). Drives the REAL
// mergeProgress / mergeStats / mergeCloudSettings from src/lib/progressMerge.js
// through the 12 required scenarios. The core guarantees under test: no learning
// progress is lost, review/lapse counts never decrease, a graduated card never
// un-graduates, XP is never additively double-counted, and Super can never come
// from local state. Exits non-zero on any failure.

import {
  mergeProgress, mergeStats, mergeCloudSettings, mergeCard, mergeMasteryRank,
  STATS_MAX, STATS_OR, STATS_UNION, STATS_CLOUD_AUTH,
} from '../src/lib/progressMerge.js';
import { PATHS } from '../src/lib/situations.js';

let failures = 0;
const check = (label, cond, extra = '') => {
  if (cond) console.log(`OK   ${label}`);
  else { failures += 1; console.error(`FAIL ${label}${extra ? ' — ' + extra : ''}`); }
};

const card = (o = {}) => ({ ease: 2.5, interval: 0, reviews: 0, lapses: 0, learning: true, nextDue: 0, lastReview: 0, ...o });

// 1. Empty cloud + local progress → local preserved.
{
  const local = { 10: card({ reviews: 3, interval: 8, learning: false }) };
  const m = mergeProgress(local, {});
  check('1 empty cloud: local card preserved', !!m[10] && m[10].reviews === 3 && m[10].learning === false);
}

// 2. Cloud progress + empty local → cloud preserved.
{
  const cloud = { 20: card({ reviews: 4, interval: 12, learning: false }) };
  const m = mergeProgress({}, cloud);
  check('2 empty local: cloud card preserved', !!m[20] && m[20].reviews === 4);
}

// 3. Local learned card + older cloud card → learned state preserved.
{
  const local = { 30: card({ reviews: 6, interval: 20, learning: false, lapses: 1, lastReview: 2000 }) };
  const cloud = { 30: card({ reviews: 1, interval: 1, learning: true, lastReview: 1000 }) };
  const m = mergeProgress(local, cloud);
  check('3 local learned beats older cloud', m[30].reviews === 6 && m[30].learning === false && m[30].lapses === 1);
}

// 4. Cloud learned card + older local card → cloud learned state preserved.
{
  const local = { 40: card({ reviews: 1, interval: 1, learning: true }) };
  const cloud = { 40: card({ reviews: 5, interval: 15, learning: false }) };
  const m = mergeProgress(local, cloud);
  check('4 cloud learned beats older local', m[40].reviews === 5 && m[40].learning === false);
}

// 5. Same card, different review counts → higher safe progress preserved.
{
  const local = { 50: card({ reviews: 2, interval: 4, lapses: 3 }) };
  const cloud = { 50: card({ reviews: 7, interval: 18, lapses: 1 }) };
  const m = mergeProgress(local, cloud);
  check('5 higher review count preserved', m[50].reviews === 7);
  check('5 lapse history preserved (max)', m[50].lapses === 3);
  check('5 interval preserved (max)', m[50].interval === 18);
}

// 5b. Graduation is sticky: either side graduated → merged graduated.
{
  const local = { 51: card({ reviews: 3, interval: 10, learning: false }) };   // graduated
  const cloud = { 51: card({ reviews: 4, interval: 1, learning: true }) };      // re-lapsed, more reps
  const m = mergeProgress(local, cloud);
  check('5b graduated stays graduated even if other side has more reps', m[51].learning === false && m[51].reviews === 4);
}

// 6. Missions completed locally, not in cloud → preserved (union), no reward replay.
{
  const local = { completedMiniUnits: ['s1-u1', 's1-u2'], builderRewardedUnits: ['s1-u1'] };
  const cloud = { completedMiniUnits: ['s1-u2', 's1-u3'] };
  const merged = mergeCloudSettings(local, cloud);
  check('6 missions unioned (completed wins)', ['s1-u1', 's1-u2', 's1-u3'].every(u => merged.completedMiniUnits.includes(u)));
  check('6 builder-rewarded ledger preserved (no reward replay)', merged.builderRewardedUnits.includes('s1-u1'));
}

// 7. Achievements unlocked locally, not in cloud → preserved (union), no reward replay.
{
  const local = { unlockedAchievements: ['first-word', 'streak-7'] };
  const cloud = { unlockedAchievements: ['streak-7', 'stage-2'] };
  const merged = mergeStats(local, cloud);
  check('7 achievements unioned (unlocked wins)', ['first-word', 'streak-7', 'stage-2'].every(a => merged.unlockedAchievements.includes(a)));
}

// 8. Cloud subscription Super + local free → Super comes from entitlement, not merge.
//    mergeStats must NOT carry tier; the caller applies entitlement separately.
{
  const local = { tier: 'free', totalXp: 10 };
  const cloud = { tier: 'free', totalXp: 100 };
  const merged = mergeStats(local, cloud);
  check('8 mergeStats never emits tier (entitlement is separate/cloud-only)', !('tier' in merged));
}

// 9. Local forged Super + cloud free → local Super ignored by the merge.
{
  const local = { tier: 'super', superUntil: '2099-01-01', totalXp: 5 };
  const cloud = { tier: 'free', superUntil: null, totalXp: 50 };
  const merged = mergeStats(local, cloud);
  check('9 forged local Super stripped', !('tier' in merged) && !('superUntil' in merged));
}

// 10. Local XP and cloud XP both present → no additive double-count (cloud authority).
{
  const local = { totalXp: 400, streak: 9, gems: 999, todayXp: 300, dailyGoalsHit: 20, streakFreezes: 5 };
  const cloud = { totalXp: 120, streak: 3, gems: 40, todayXp: 25, dailyGoalsHit: 4, streakFreezes: 1 };
  const merged = mergeStats(local, cloud);
  check('10 totalXp = cloud (no addition)', merged.totalXp === 120);
  check('10 streak = cloud (local clock cannot raise)', merged.streak === 3);
  check('10 gems = cloud (currency authority)', merged.gems === 40);
  check('10 todayXp = cloud', merged.todayXp === 25);
  check('10 dailyGoalsHit = cloud (not inflated)', merged.dailyGoalsHit === 4);
  check('10 streakFreezes = cloud (local cannot inflate)', merged.streakFreezes === 1);
}

// 10b. Monotonic display counters take the max (never lose progress, non-rewarding).
{
  const local = { totalReviews: 500, challengeAttempts: 30, bestChallengeScore: 9, currentStage: 4, tonesQuizPassed: true };
  const cloud = { totalReviews: 120, challengeAttempts: 10, bestChallengeScore: 5, currentStage: 2, tonesQuizPassed: false };
  const merged = mergeStats(local, cloud);
  check('10b totalReviews = max', merged.totalReviews === 500);
  check('10b bestChallengeScore = max', merged.bestChallengeScore === 9);
  check('10b currentStage = max', merged.currentStage === 4);
  check('10b tonesQuizPassed = OR (sticky true)', merged.tonesQuizPassed === true);
}

// 11. Sign-in after anonymous study does not wipe local learning progress.
{
  const localAnon = { 60: card({ reviews: 4, learning: false }), 61: card({ reviews: 2 }) };
  const cloudAccount = { 62: card({ reviews: 9, learning: false }) };
  const m = mergeProgress(localAnon, cloudAccount);
  check('11 anonymous cards survive sign-in', !!m[60] && !!m[61] && m[60].reviews === 4);
  check('11 existing cloud cards also kept', !!m[62] && m[62].reviews === 9);
}

// 12. Same-tab user switch does not inherit previous user's merged state.
//     (Merge is a pure function of its two inputs — it holds no cross-call state.
//     User B's merge sees only B's local (reset/empty after M3) + B's cloud.)
{
  const userA_result = mergeProgress({ 70: card({ reviews: 5 }) }, { 71: card({ reviews: 3 }) });
  check('12a user A merged has A cards', !!userA_result[70] && !!userA_result[71]);
  // User B signs in: local was cleared by M3 session reset; B has only their cloud.
  const userB_result = mergeProgress({}, { 80: card({ reviews: 1 }) });
  check('12b user B merge has ONLY B cards (no A leakage)', !userB_result[70] && !userB_result[71] && !!userB_result[80]);
}

// Extra: merge is a no-op grant-wise — mergeCard never invents reviews/xp.
{
  const c = mergeCard(card({ reviews: 0, learning: true }), undefined);
  check('extra: mergeCard with one side returns that side untouched', c.reviews === 0 && c.learning === true);
}

// 13. masteryRank (Pass 4) merges element-wise MAX (monotonic, non-rewarding) and never touches tier.
{
  const local = { masteryRank: { 10: 2, 11: 1, 13: 3 }, tier: 'free' };
  const cloud = { masteryRank: { 10: 1, 11: 3, 12: 2 }, tier: 'free' };
  const direct = mergeMasteryRank(local.masteryRank, cloud.masteryRank);
  check('13 masteryRank element-wise max (existing card, local higher)', direct[10] === 2);
  check('13 masteryRank element-wise max (existing card, cloud higher)', direct[11] === 3);
  check('13 masteryRank union keeps cloud-only card', direct[12] === 2);
  check('13 masteryRank union keeps local-only card', direct[13] === 3);
  check('13 masteryRank never downgrades', mergeMasteryRank({ 5: 3 }, { 5: 0 })[5] === 3);
  const merged = mergeStats(local, cloud);
  check('13 mergeStats carries merged masteryRank', merged.masteryRank[10] === 2 && merged.masteryRank[11] === 3);
  check('13 mergeStats never emits tier from mastery merge', !('tier' in merged));
}

// 14. identityPath (engagement.md §2.1/§9) is class CLOUD-AUTH: an account-level
//     preference, cloud wins, never MAX/OR/UNION, never a reward, never tier.
{
  check('14 identityPath is declared cloud-auth', STATS_CLOUD_AUTH.includes('identityPath'));
  check('14 identityPath is NOT in MAX / OR / UNION',
    !STATS_MAX.includes('identityPath') && !STATS_OR.includes('identityPath') && !STATS_UNION.includes('identityPath'));
  check('14 the cloud-auth class is disjoint from MAX / OR / UNION',
    STATS_CLOUD_AUTH.every(k => !STATS_MAX.includes(k) && !STATS_OR.includes(k) && !STATS_UNION.includes(k)),
    STATS_CLOUD_AUTH.filter(k => STATS_MAX.includes(k) || STATS_OR.includes(k) || STATS_UNION.includes(k)).join(','));

  // Cloud wins for every path pairing, and the merged value is always a real path.
  let cloudWins = true;
  let alwaysAPath = true;
  for (const local of PATHS) {
    for (const cloud of PATHS) {
      const m = mergeStats({ identityPath: local }, { identityPath: cloud });
      if (m.identityPath !== cloud) cloudWins = false;
      if (!PATHS.includes(m.identityPath)) alwaysAPath = false;
    }
  }
  check('14 identityPath = cloud for every local×cloud path pairing', cloudWins);
  check('14 merged identityPath is always a member of PATHS', alwaysAPath);

  // Class proof by behaviour: MAX would coerce the string (NaN/0), OR would emit a
  // boolean, UNION an array. A plain cloud string proves none of those ran.
  const m = mergeStats({ identityPath: 'path-worker' }, { identityPath: 'path-tourist' });
  check('14 identityPath is never MAX/OR/UNION-merged (stays a plain cloud string)',
    typeof m.identityPath === 'string' && m.identityPath === 'path-tourist');

  // Cloud-auth is DEFAULT-BY-OMISSION: when cloud has no identityPath the patch
  // must omit the key entirely (not undefined), so spreading it never clobbers an
  // anonymous learner's local choice.
  const noCloud = mergeStats({ identityPath: 'path-expat' }, { totalXp: 5 });
  check('14 cloud without identityPath omits the key (local preference survives the spread)',
    !('identityPath' in noCloud));
  check('14 merged identityPath is a PATHS member or undefined',
    noCloud.identityPath === undefined || PATHS.includes(noCloud.identityPath));

  // It is a preference, never an entitlement input.
  const withTier = mergeStats({ identityPath: 'path-partner', tier: 'super' }, { identityPath: 'path-partner', tier: 'free' });
  check('14 identityPath never carries tier', !('tier' in withTier) && withTier.identityPath === 'path-partner');
}

if (failures > 0) {
  console.error(`\nProgress-merge check FAILED: ${failures} assertion(s) failed.`);
  process.exit(1);
}
console.log('\nProgress-merge check passed.');
