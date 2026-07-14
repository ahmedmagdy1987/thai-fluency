import { useState } from 'react';
import { supabase } from '../lib/supabase.js';
import { isSuper as isSuperFn } from '../config/entitlements.js';
import {
  FREE_PLAN_BLURB,
  CANCEL_CONFIRM,
  CANCEL_ERROR,
  formatSuperUntil,
  subscriptionStatusText,
} from '../lib/subscriptionStatus.js';

// Single source of truth for Super/subscription status wording, cancel-button
// visibility, and the cancel action — shared by SettingsModal and ProfilePage so
// the two can never drift (they previously duplicated this and had already
// diverged: "renews on" vs "Renews"). Pure formatting lives in
// lib/subscriptionStatus.js (unit-tested); this hook adds the cancel RPC + state.
//
// Entitlement is READ-ONLY and server-authoritative here: this only formats what
// cloudStorage.downloadEntitlement() already merged onto stats (tier / superUntil
// / cancelAtPeriodEnd) and drives the cancel-subscription Edge Function. It never
// grants or forges Super.

// Re-export the pure helpers so existing importers (Settings/Profile) are stable.
export { FREE_PLAN_BLURB, formatSuperUntil, subscriptionStatusText };

export function useSubscriptionStatus(stats, { onEntitlementRefresh } = {}) {
  const [canceling, setCanceling] = useState(false);
  const [cancelError, setCancelError] = useState(null);

  const isSuper = isSuperFn(stats);
  // Treat a provider-side canceled subscription as canceled too, not only the
  // app's own scheduled cancel (cancelAtPeriodEnd). A row with status='canceled'
  // and a future current_period_end is still Super (entitlement stays correct in
  // cloudStorage) but auto-renew is OFF — so the copy must NOT say "Renews on"
  // and the Cancel button must NOT show for an already-canceled sub (B5 copy).
  const canceled = isSuper && (!!stats?.cancelAtPeriodEnd || stats?.status === 'canceled');
  const untilLabel = isSuper ? formatSuperUntil(stats?.superUntil) : null;
  const statusText = subscriptionStatusText({ isSuper, canceled, untilLabel });
  // The cancel button only makes sense for an active, not-yet-canceled Super.
  const showCancel = isSuper && !canceled;

  const cancel = async () => {
    if (canceling) return;
    if (typeof window !== 'undefined' && !window.confirm(CANCEL_CONFIRM)) return;
    setCanceling(true);
    setCancelError(null);
    try {
      const { data, error } = await supabase.functions.invoke('cancel-subscription');
      if (error) throw error;
      if (data && data.ok === false) throw new Error(data.error || 'Cancellation failed');
      if (onEntitlementRefresh) await onEntitlementRefresh();
    } catch (e) {
      setCancelError(CANCEL_ERROR);
    } finally {
      setCanceling(false);
    }
  };

  return { isSuper, canceled, untilLabel, statusText, showCancel, cancel, canceling, cancelError };
}
