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
  const canceled = isSuper && !!stats?.cancelAtPeriodEnd;
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
