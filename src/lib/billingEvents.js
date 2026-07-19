// ─────────────────────────────────────────────────────────────────────────────
// BILLING EVENT SINK (Wave 13 item I) — the client half of purchase observability.
//
// THE PROBLEM: purchase telemetry landed only in a 50-entry localStorage ring
// buffer on the payer's own device, so the owner could not see a checkout start,
// an activation, or a failed activation — and the 50-cap could evict the
// activation event before anyone looked. At launch that is being blind to failed
// activations, double charges and refund disputes.
//
// The SERVER half needs no table: the Edge Functions now log CHECKOUT_STARTED /
// ENTITLEMENT / CANCEL_SCHEDULED / UNMAPPED SUBSCRIPTION lines that are readable
// in the Supabase Edge Function logs. This module adds the client-only funnel
// steps the server never sees.
//
// ── DEGRADES SILENTLY BY DESIGN ─────────────────────────────────────────────
// public.billing_events ships as an UNAPPLIED migration
// (supabase/migrations/20260720120000_billing_events.sql). Until the owner runs
// it, every insert here fails with "relation does not exist" and is swallowed.
// That is deliberate: this code can ship before the migration, and shipping it
// without the migration breaks nothing. Telemetry must never affect the product.
//
// PRIVACY: primitives only, strings capped — the same sanitising contract as
// lib/analytics.js. Never pass an email, a name, or anything Stripe-secret.
// ─────────────────────────────────────────────────────────────────────────────

import { supabase, hasSupabaseConfig } from './supabase.js';

// Only the events worth durable, owner-visible storage. Deliberately NOT the
// whole analytics surface — this table is for money, not for product curiosity.
export const BILLING_EVENTS = Object.freeze({
  CHECKOUT_STARTED: 'checkout_started',
  SUBSCRIPTION_ACTIVATED: 'subscription_activated',
  ACTIVATION_SLOW: 'activation_slow',
  ACTIVATION_TIMEOUT: 'activation_timeout',
  CHECKOUT_REJECTED_ALREADY_SUBSCRIBED: 'checkout_rejected_already_subscribed',
});

const ALLOWED = new Set(Object.values(BILLING_EVENTS));

function sanitize(props) {
  const out = {};
  if (!props || typeof props !== 'object') return out;
  for (const [k, v] of Object.entries(props)) {
    if (typeof v === 'string') out[k] = v.slice(0, 80);
    else if (typeof v === 'number' && Number.isFinite(v)) out[k] = v;
    else if (typeof v === 'boolean') out[k] = v;
  }
  return out;
}

/**
 * Append a billing event. Fire-and-forget: never awaited by the caller, never
 * throws, never blocks a purchase. A missing table, a missing session, or a
 * network failure all resolve to a no-op.
 */
export function recordBillingEvent(userId, name, props = {}) {
  try {
    if (!hasSupabaseConfig || !userId || !ALLOWED.has(name)) return;
    // Deliberately not awaited — a purchase must never wait on telemetry.
    supabase
      .from('billing_events')
      .insert({ user_id: userId, name, props: sanitize(props) })
      .then(({ error }) => {
        if (error && import.meta?.env?.DEV) {
          // Expected until the migration is applied; noisy only in dev.
          console.debug('[billingEvents] not recorded:', error.message);
        }
      }, () => { /* swallow */ });
  } catch { /* telemetry must never break the app */ }
}
