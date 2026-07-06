// Pure subscription-status formatting (no React, no supabase, no import.meta) so
// it is unit-testable under plain node (scripts/check-subscription-status.mjs)
// and shared by the useSubscriptionStatus hook. Entitlement is read-only here —
// this only turns the server-authoritative fields already on stats into copy.

// Free-plan blurb — one place so Settings and Profile read identically.
export const FREE_PLAN_BLURB = 'Super unlocks the 18+ Dating & Real Talk section.';

export const CANCEL_CONFIRM = 'Cancel your Super plan? It stops auto-renewing, but Super stays active until the end of your current billing period.';
export const CANCEL_ERROR = 'Could not cancel right now. Please try again, or contact support.';

export function formatSuperUntil(superUntil) {
  if (!superUntil) return null;
  const d = new Date(superUntil);
  return Number.isNaN(d.getTime()) ? null : d.toLocaleDateString();
}

// A standalone, capitalized sentence for the current Super state, or null when
// the user is on Free (the component renders the free CTA in that case).
export function subscriptionStatusText({ isSuper, canceled, untilLabel }) {
  if (!isSuper) return null;
  if (canceled) {
    return untilLabel
      ? `Canceled — stays active until ${untilLabel}. Auto-renew is off.`
      : 'Canceled — stays active until the end of your billing period. Auto-renew is off.';
  }
  return untilLabel
    ? `Renews on ${untilLabel}. Thanks for supporting Tuk Talk Thai!`
    : 'Active. Thanks for supporting Tuk Talk Thai!';
}
