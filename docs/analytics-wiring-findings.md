# Analytics wiring — investigation findings (launch-unblock pass, 2026-07-12)

**Question investigated:** `docs/payment-readiness.md` listed "analytics wiring
(CHECKOUT_STARTED / SUBSCRIPTION_ACTIVATED)" as remaining work before real
charges. What does that actually entail, and is any of it still missing?

## Finding 1 — the named gap is already closed

Both funnel events named by the payment-readiness doc are **already wired** at
real call sites:

| Event | Fires when | Call site |
|---|---|---|
| `checkout_started` | Stripe Embedded Checkout mounts in front of the user | `src/components/SuperCheckoutModal.jsx` (after `checkout.mount`) |
| `subscription_activated` | Server-confirmed Super on the `?super=success` checkout return | `src/App.jsx` checkout-return effect |

The stale claims saying otherwise (`src/lib/analytics.js` header comment on the
two events; the `payment-readiness.md` "Remaining" line) were corrected in this
pass. The other four funnel events (`plans_viewed`, `premium_feature_tapped`,
`upgrade_modal_shown`, `upgrade_modal_dismissed`) were already wired and remain
untouched.

## Finding 2 — what is genuinely missing: a cloud sink

`src/lib/analytics.js` is a deliberate first-party, no-SDK design. Its only
sinks are:

1. `console.debug` in dev builds, and
2. a bounded 50-event ring buffer in `localStorage`
   (`tuk-talk-thai-events-v1`).

Events therefore **never leave the user's device**. At launch the owner will
collect zero funnel data (how many users view /plans, open checkout, convert),
even though every event fires correctly client-side.

## What a cloud sink would require (NOT done in this pass)

Draining the ring buffer to a first-party store needs, at minimum:

1. **A new Supabase table** (e.g. `public.events`) with an insert-only RLS
   policy for authenticated users (and a decision about anonymous events) —
   **this is a DB migration**, which is out of scope under this pass's hard
   rules (no DB changes, no migrations).
2. A small client drain in `analytics.js` (batch-insert recent events,
   best-effort, never blocking the app) — trivial once the table exists.
3. Owner decisions: retention window, whether to record anonymous
   pre-signup events, and whether a dashboard (Supabase SQL / Studio) is
   enough for reading the funnel.

Per the task rule ("implement ONLY if purely local/client-side with zero new
services"), **no sink was implemented**. The stale-comment corrections above
are the only code touched.

## Recommendation

Before Live Mode, schedule a small follow-up: one migration for
`public.events` (insert-only RLS) + a ~30-line drain in `analytics.js`. Until
then, funnel data can be inspected per-device via
`getRecentEvents()` in the console or the `tuk-talk-thai-events-v1`
localStorage key.
