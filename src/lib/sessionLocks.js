// Per-user session isolation for a single browser tab.
//
// App.jsx keeps several in-memory refs that dedupe or gate rewards for the
// CURRENT user: reward/mission/achievement locks and the baseline-arming flags.
// If a user signs out and a DIFFERENT user signs in in the same tab without a
// page reload, those refs would still hold user A's state — so user B could be
// (a) denied a legitimate mission reward + gems (the `mission:N` lock is still
// set), (b) missing achievement toasts (achievement lock still set), or (c) run
// with user A's course-complete baseline. This module clears all of that in one
// place so the next signed-in user starts clean.
//
// Called whenever the authenticated user id changes (including → null on sign-
// out). Anonymous users have no user id, so their local state is never disturbed
// by this; it only fires on an actual identity change.
//
// DELIBERATELY NOT reset here: the persisted, DEVICE-scoped anti-farm guards
// (rushGuardRef, reviewXpDayRef). Those live in localStorage on purpose so a user
// cannot reset their anti-rush / per-day review-XP caps by signing out and back
// in. They are day/device-scoped, not user-scoped, so they are left intact.

// Clear every user-scoped ref in place. Sets are emptied (identity preserved so
// any closure holding the Set keeps working); flag refs return to their initial
// value; the profile-settings mirror is emptied (the profile effect repopulates
// it for the new user). Missing/undefined refs are skipped, so this is safe to
// call with a partial bag (e.g. from the test harness).
export function resetUserScopedRefs(refs = {}) {
  const clearSet = (r) => {
    if (r && r.current && typeof r.current.clear === 'function') r.current.clear();
  };
  const setFlag = (r, value) => {
    if (r) r.current = value;
  };

  clearSet(refs.reviewLocksRef);
  clearSet(refs.missionRewardLocksRef);
  clearSet(refs.achievementLocksRef);
  setFlag(refs.celebrationsArmedRef, false);
  setFlag(refs.courseCompleteAtArmingRef, false);
  setFlag(refs.superSuccessHandledRef, false);
  setFlag(refs.oneSignalLinkedRef, false);
  setFlag(refs.notificationPromptFiredRef, false);
  setFlag(refs.profileSettingsRef, {});
}

// Pure model of App's "reward once per stable key" gate, extracted so the
// isolation test can prove the real semantics: first call for a key rewards and
// locks it; repeats are suppressed until the lock set is reset. Returns true when
// the reward should be granted.
export function tryLockedReward(lockSet, key) {
  if (!lockSet || lockSet.has(key)) return false;
  lockSet.add(key);
  return true;
}
