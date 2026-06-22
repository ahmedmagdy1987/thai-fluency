# Payment readiness audit — Tuk Talk Thai "Super"

Status: **NOT payment-ready.** Everything monetization-facing today is a marketing
shell. No checkout exists, no payment is collected, and no premium feature actually
unlocks. This document lists exactly what is still required before real payments can
be turned on, so the work can be scoped and sequenced safely.

Hard rules (do not violate):
- **No payment secrets in frontend code.** API/secret keys, webhook signing
  secrets, and provider admin tokens live only in server-side env (Supabase Edge
  Function secrets / server env), never in `src/**`, never in `VITE_*` vars (those
  are embedded in the client bundle).
- **The client is never the authority** for entitlement. A paid tier must be set
  by a verified server-side webhook, not by the client. (Today client XP is
  already trusted verbatim by the cloud — see "Entitlement persistence".)
- **No real payment processing** is implemented until a provider is chosen and
  credentials are provisioned by the owner.

What already exists (so we build on it, not around it):
- Central entitlement model: `src/config/entitlements.js` (`tier`, `FEATURES`,
  `PLANS`, `canUseFeature`). `tier` defaults to `'free'` for everyone.
- Plans page `/plans` (config-driven, shows "Pricing coming soon").
- In-house analytics: `src/lib/analytics.js` with `checkout_started` /
  `subscription_activated` events defined but **not yet fired** (no checkout).
- Backend: Supabase (`profiles`, `user_stats`, `user_progress`, `user_missions`)
  with RLS; an existing DB-webhook → `send-notification` Edge Function pattern to
  copy for payment webhooks.
- Mobile: Capacitor (Android + iOS wrappers already build).

---

## Blockers / decisions required

### 1. Payment provider decision (OWNER)
Pick the model and provider before anything else; it determines every step below.
- **Web (PWA / desktop):** Stripe Billing (subscriptions) is the default
  recommendation — hosted Checkout + Customer Portal removes most PCI scope and
  gives cancellation/restore out of the box. Alternatives: Paddle / LemonSqueezy
  (merchant-of-record — they handle global tax/VAT, simpler compliance, higher fee).
- **Decision needed:** Stripe vs merchant-of-record (tax handling), and whether web
  and mobile share one entitlement or are billed separately (see §9).

### 2. Monthly and yearly prices (OWNER)
- `PLANS.superMonthly.price` and `PLANS.superYearly.price` are `null` →
  surfaces show "Pricing coming soon". **Do not invent prices.**
- Needed: monthly price, yearly price (and intended discount), any intro/trial
  offer, and the provider Price IDs once created. Fill `PLANS` only after this.

### 3. Supported currencies (OWNER)
- Decide the launch currency set (e.g. USD base; THB for the Thailand audience).
- Provider must have a Price object per currency, or use provider auto-conversion.
- Plans UI must format per the active currency (the price renderer is centralized
  in `PlanPriceTag`, so this is a one-place change).

### 4. Web checkout flow (ENGINEERING)
- Add a server endpoint (Supabase Edge Function) `create-checkout-session` that
  creates a provider Checkout Session for the signed-in user (maps Supabase
  `user_id` ↔ provider customer id). Client calls it, then redirects to the hosted
  checkout. Wire `trackEvent(checkout_started)` at that click.
- Add success/cancel return routes. **No card data touches our frontend or servers.**

### 5. Webhook verification (ENGINEERING — security critical)
- Add an Edge Function `payments-webhook` that **verifies the provider signature**
  using a secret stored only in Edge Function secrets. Handle
  `checkout.session.completed`, `customer.subscription.updated/deleted`,
  `invoice.payment_failed`, etc.
- On a verified active subscription → set the server-authoritative entitlement
  (§6). Reject unsigned/replayed events. This is the ONLY path allowed to grant
  premium.

### 6. Subscription entitlement persistence (ENGINEERING — schema change)
- **Requires a DB migration** (the only real one this work needs — flagged here,
  not done silently): add a server-authoritative entitlement to `profiles`, e.g.
  `premium_until timestamptz`, `subscription_status text`,
  `payment_customer_id text`. RLS: the row is readable by its owner but **writable
  only by the service role** (the webhook), never by the client.
- Client reads `premium_until` into state and derives `tier` (`isSuper` becomes
  `premium_until > now`). Add these fields to `cloudStorage` download (read-only on
  the client). Then flip the relevant `FEATURES[*].status` to `available` as each
  paid benefit actually ships.
- Related hardening (separate but recommended): server-side XP is currently trusted
  from the client (`uploadStats` upserts `total_xp` verbatim). Before money is
  involved, add a server clamp/recompute so a tampered client can't fabricate
  premium-adjacent state. (Tracked from the XP audit; not a payment blocker but do
  it before launch.)

### 7. Cancellation and restore flow (ENGINEERING + provider)
- **Cancel:** expose the provider Customer Portal (Stripe) or provider-hosted
  manage page; on `subscription.deleted` the webhook clears `premium_until`.
- **Restore:** purchases must restore on reinstall / new device. Web: entitlement
  is server-side, so sign-in restores it automatically. Mobile (§9): implement the
  store "Restore Purchases" flow.
- Grace handling: define behavior for `payment_failed` (grace window vs immediate
  downgrade) and dunning copy.

### 8. Cross-device access (ENGINEERING)
- Because entitlement is read from `profiles.premium_until` (server-authoritative)
  and the user signs in on each device, Super follows the account, not the device —
  no extra work for web once §6 lands.
- Caveat: store-billed mobile purchases (§9) are tied to the store account; they
  must be reconciled to the Supabase user so the same Super shows on web too.

### 9. App Store & Google Play billing strategy (OWNER + ENGINEERING)
- Apple/Google generally **require** their in-app purchase for digital
  subscriptions inside the app, taking ~15–30%. Options:
  - (a) **Store IAP in the mobile apps** (Capacitor IAP plugin / RevenueCat) and
    Stripe on web — then reconcile both to one `profiles.premium_until` via each
    store's server-to-server notifications. RevenueCat is recommended to unify
    receipts, restore, and webhooks across stores.
  - (b) **Web-only checkout** and keep the mobile apps free-to-use with no in-app
    purchase UI (must follow each store's "reader"/external-purchase rules to avoid
    rejection). Lower fees, more compliance care.
- **Decision needed:** (a) vs (b). This affects pricing parity, restore, and review
  risk. Until decided, the mobile apps must show Super only as "Coming soon" (no
  purchase UI), which is the current state.

---

## Pre-launch checklist (ordered)
1. [ ] OWNER: provider + model decided (§1, §9)
2. [ ] OWNER: monthly/yearly prices + currencies supplied → fill `PLANS` (§2, §3)
3. [ ] DB migration: server-authoritative entitlement on `profiles` (§6)
4. [ ] Edge Function: `create-checkout-session` + return routes (§4)
5. [ ] Edge Function: signature-verified `payments-webhook` → sets entitlement (§5, §6)
6. [ ] Client: read `premium_until` → `tier`; flip shipped `FEATURES` to available (§6)
7. [ ] Server-side XP clamp/recompute (hardening) (§6)
8. [ ] Cancel + restore + grace flows (§7)
9. [ ] Mobile store billing per §9 decision
10. [ ] Wire `checkout_started` (at checkout click) + `subscription_activated` (in webhook) analytics
11. [ ] Verify no secret/`VITE_*` key leaks into the client bundle
12. [ ] QA: purchase, cancel, restore, cross-device, failed-payment, refund

Until items 1–3 are done, **do not** implement real payment processing or fill any
price. The product can keep showing the Super teaser + "Pricing coming soon".
