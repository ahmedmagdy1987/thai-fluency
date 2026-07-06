// Regression guard for per-user session isolation (M3). Proves that after a user
// signs out and a different user signs in in the SAME browser tab, the new user
// cannot inherit the previous user's in-memory reward/mission/achievement locks
// or baseline-arming flags, and can earn rewards normally. Drives the REAL
// resetUserScopedRefs / tryLockedReward from src/lib/sessionLocks.js.

import {
  resetUserScopedRefs,
  tryLockedReward,
  claimCloudInit,
  releaseCloudInit,
  shouldWipeLocalOnIdentityChange,
} from '../src/lib/sessionLocks.js';

let failures = 0;
const check = (label, cond, extra = '') => {
  if (cond) console.log(`OK   ${label}`);
  else { failures += 1; console.error(`FAIL ${label}${extra ? ' — ' + extra : ''}`); }
};

// Build a fresh "App refs" bag exactly like App.jsx holds (each a { current }).
function makeRefs() {
  return {
    reviewLocksRef: { current: new Set() },
    missionRewardLocksRef: { current: new Set() },
    achievementLocksRef: { current: new Set() },
    celebrationsArmedRef: { current: false },
    courseCompleteAtArmingRef: { current: false },
    superSuccessHandledRef: { current: false },
    oneSignalLinkedRef: { current: false },
    notificationPromptFiredRef: { current: false },
    profileSettingsRef: { current: {} },
    // Device-scoped anti-farm guards — must survive the reset (a sentinel proves it).
    rushGuardRef: { current: { rushRun: 4, lastRatingAt: 123 } },
    reviewXpDayRef: { current: { date: '2026-07-06', ids: new Set([101, 102]) } },
  };
}

const refs = makeRefs();

// ── Step 1: user A signs in and creates locks ────────────────────────────────
check('A: first mission reward granted', tryLockedReward(refs.missionRewardLocksRef.current, 'mission:1:1') === true);
check('A: repeat mission reward suppressed (locked)', tryLockedReward(refs.missionRewardLocksRef.current, 'mission:1:1') === false);
check('A: first achievement toast granted', tryLockedReward(refs.achievementLocksRef.current, 'achv:stage-3') === true);
refs.reviewLocksRef.current.add('55:new');
refs.celebrationsArmedRef.current = true;
refs.courseCompleteAtArmingRef.current = true;
refs.profileSettingsRef.current = { cardDirection: 'th-first' };
check('A: locks/flags are populated', refs.missionRewardLocksRef.current.size === 1 && refs.achievementLocksRef.current.size === 1 && refs.celebrationsArmedRef.current === true);

// ── Step 2: user A signs out → the authenticated user id changes → reset ──────
resetUserScopedRefs(refs);

check('signout: review locks cleared', refs.reviewLocksRef.current.size === 0);
check('signout: mission locks cleared', refs.missionRewardLocksRef.current.size === 0);
check('signout: achievement locks cleared', refs.achievementLocksRef.current.size === 0);
check('signout: celebrationsArmed reset', refs.celebrationsArmedRef.current === false);
check('signout: courseCompleteAtArming reset', refs.courseCompleteAtArmingRef.current === false);
check('signout: superSuccessHandled reset', refs.superSuccessHandledRef.current === false);
check('signout: oneSignalLinked reset', refs.oneSignalLinkedRef.current === false);
check('signout: notificationPromptFired reset', refs.notificationPromptFiredRef.current === false);
check('signout: profileSettings emptied', Object.keys(refs.profileSettingsRef.current).length === 0);

// Device-scoped anti-farm guards MUST NOT be wiped (else sign-out/in farms them).
check('signout: rush guard preserved (device-scoped)', refs.rushGuardRef.current.rushRun === 4);
check('signout: per-day review-XP guard preserved (device-scoped)', refs.reviewXpDayRef.current.ids.has(101));

// ── Steps 3-5: user B signs in in the same tab and earns normally ────────────
// (In the app, the same reset also runs on the id → B transition; running it
// again here is idempotent.)
resetUserScopedRefs(refs);
check('B: SAME mission key rewards again (not inherited from A)', tryLockedReward(refs.missionRewardLocksRef.current, 'mission:1:1') === true);
check('B: SAME achievement toasts again (not inherited from A)', tryLockedReward(refs.achievementLocksRef.current, 'achv:stage-3') === true);
check('B: a different mission also rewards', tryLockedReward(refs.missionRewardLocksRef.current, 'mission:2:1') === true);
check('B: B now sees its own lock on repeat', tryLockedReward(refs.missionRewardLocksRef.current, 'mission:1:1') === false);
check('B: celebration baseline re-arms (armed=false at sign-in)', refs.celebrationsArmedRef.current === false);

// ── Anonymous safety: reset with a partial/empty bag must not throw ──────────
let threw = false;
try { resetUserScopedRefs({}); resetUserScopedRefs(undefined); } catch { threw = true; }
check('anonymous/partial bag reset is safe (no throw)', threw === false);

// ── Cloud-init claim guard: a stale init must never block the next user ───────
{
  const ref = { current: null };
  const claimA = claimCloudInit(ref, 'user-A');
  check('claim: user A gets a claim', claimA && claimA.userId === 'user-A');
  check('claim: same user re-claim blocked while in flight', claimCloudInit(ref, 'user-A') === null);
  // User B replaces A (identity change also discards A's claim via reset, but even
  // without that, a claim for a different user overwrites the slot rather than
  // being blocked by A's stale claim).
  const claimB = claimCloudInit(ref, 'user-B');
  check('claim: user B is NOT blocked by user A stale claim', claimB && claimB.userId === 'user-B');
  // A's late finally must not free B's live claim.
  releaseCloudInit(ref, claimA);
  check('release: stale claim A does not clear B live claim', ref.current === claimB);
  // B's own release clears it.
  releaseCloudInit(ref, claimB);
  check('release: live claim B clears the slot', ref.current === null);
}

// ── Identity-change local wipe decision ──────────────────────────────────────
{
  check('wipe: cloud-loaded A → B wipes', shouldWipeLocalOnIdentityChange('user-A', 'user-B', true) === true);
  check('wipe: cloud-loaded A → signed out wipes', shouldWipeLocalOnIdentityChange('user-A', null, true) === true);
  check('wipe: same user (token refresh) does NOT wipe', shouldWipeLocalOnIdentityChange('user-A', 'user-A', true) === false);
  check('wipe: fresh sign-in (no prev user) does NOT wipe', shouldWipeLocalOnIdentityChange(null, 'user-B', true) === false);
  check('wipe: anonymous (never cloudReady) does NOT wipe', shouldWipeLocalOnIdentityChange('user-A', 'user-B', false) === false);
}

if (failures > 0) {
  console.error(`\nSession-isolation check FAILED: ${failures} assertion(s) failed.`);
  process.exit(1);
}
console.log('\nSession-isolation check passed.');
