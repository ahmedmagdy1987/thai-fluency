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
// it for the new user); a stale cloud-init claim is discarded (see claimCloudInit
// below — a late release from the discarded init is identity-checked, so dropping
// it here is race-free). Missing/undefined refs are skipped, so this is safe to
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
  setFlag(refs.cloudInitClaimRef, null);
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

// ── Cloud-init in-flight guard, scoped by user id ───────────────────────────
//
// The cloud-init effect must not run twice concurrently FOR THE SAME USER, but a
// stale in-flight init from a PREVIOUS user must never block the next user (the
// old boolean guard did exactly that: user A's slow init left `true` behind, the
// ref write triggered no render, and user B's init never started). A claim is an
// identity token: the reset above discards it on user change, and release is
// identity-checked so the discarded init's late `finally` cannot clobber the new
// user's live claim.

// Try to claim the cloud-init slot for `userId`. Returns the claim token to pass
// to releaseCloudInit, or null when that same user's init is already in flight.
export function claimCloudInit(ref, userId) {
  if (!ref) return null;
  if (ref.current && ref.current.userId === userId) return null;
  const claim = { userId };
  ref.current = claim;
  return claim;
}

// Release a claim. No-op unless `claim` is still the live claim, so a stale init
// finishing late can never free (or corrupt) a newer user's claim.
export function releaseCloudInit(ref, claim) {
  if (ref && claim && ref.current === claim) ref.current = null;
}

// ── Local-cache wipe decision on identity change ────────────────────────────
//
// handleSignOut wipes in-memory progress/stats and the localStorage blob
// ("server-of-truth: this device is no longer authorized"), but a session can
// also end WITHOUT that handler running — token revocation, refresh failure,
// remote sign-out. In that case the departed user's cloud-loaded data is still
// in memory/localStorage, and the next sign-in could seed it into the new user's
// account (the empty-cloud auto-upload) or sync it under the new id.
//
// Wipe exactly when a signed-in user whose CLOUD data was loaded (cloudReady) is
// replaced by a different identity (or by no identity). cloudReady is never true
// for anonymous or unconfirmed sessions, so local anonymous progress is never
// wiped by this rule, and a token refresh (same id) never triggers it.
export function shouldWipeLocalOnIdentityChange(prevUserId, nextUserId, cloudReady) {
  return !!(prevUserId && prevUserId !== nextUserId && cloudReady);
}
