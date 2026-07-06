# Proposal — Payment failure / dunning handling for Super

Status: **PROPOSAL ONLY. Not implemented. No DB, webhook, or Stripe changes applied.**
This documents the audit of how failed/expired/canceled subscriptions behave today
and proposes an optional dunning UX. It is for review; nothing here is deployed.

## Audit — how the shipped stack handles each state today

The webhook (`supabase/functions/stripe-webhook/index.ts`) writes entitlement via
`applySubscription()`, where `active = status === 'active' || 'trialing'` and
`super_until = active ? current_period_end : null`. The client
(`downloadEntitlement`) treats a user as Super only while `super_until > now`.

| Event / state | Handled? | Result today | Safe? |
|---|---|---|---|
| `invoice.payment_failed` | Not an explicit case (default no-op) | — | ✅ (covered indirectly, below) |
| Subscription → `past_due` | Yes, via `customer.subscription.updated` | `active=false` → `super_until=null` → Super removed **immediately** | ✅ conservative (never over-grants) |
| Subscription → `canceled` | Yes (`.updated` / `.deleted`) | `super_until=null` → Super removed | ✅ |
| `cancel_at_period_end` | Yes | `cancel_at_period_end=true`, `super_until` kept = period end (stays Super until then) | ✅ correct |
| `super_until` in the past | N/A (derived) | client `isActive = super_until > now` → free; webhook also nulls it | ✅ |

**Conclusion: the current behavior is SAFE and conservative — it can never leave a
non-paying user as Super.** `invoice.payment_failed` does not need an explicit
handler for correctness, because Stripe also emits `customer.subscription.updated`
(status → `past_due`) which is already handled.

## The one real gap (UX, not correctness)

On a **transient** card failure (e.g. an expired card on renewal), Stripe marks the
subscription `past_due` and Stripe Smart Retries will attempt the charge again over
several days. Our webhook, however, **drops Super immediately** on `past_due`, and
the client shows the user as Free with no explanation and no way to fix their card.
A paying customer with a temporary billing hiccup loses access and gets no "update
your payment method" path. There is also no Stripe billing portal wired up.

## Proposed enhancement (optional — needs infra changes, hence proposal-only)

1. **Grace window on `past_due`** (webhook change → `supabase functions deploy`,
   no DB migration): in `applySubscription`, treat `past_due` as a grace state —
   keep `super_until = current_period_end` (Super stays live through Stripe's retry
   window) instead of nulling it, while still writing `status='past_due'`. Only a
   terminal `canceled`/`unpaid` (or `super_until` genuinely elapsed) removes Super.
   This reuses existing columns — **no schema change**.
2. **Surface `status` to the client** (client change): App.jsx cloud-init currently
   merges only `tier`/`superUntil`/`cancelAtPeriodEnd` onto stats. Also merge
   `status` so the UI can show a gentle banner when `status === 'past_due'`:
   "There was a problem with your last payment — update your card to keep Super."
3. **Stripe Billing Portal** (new Edge Function `create-billing-portal-session` →
   `supabase functions deploy` + a "Manage billing / update card" button): gives
   the user a first-party way to fix the card. Requires enabling the Billing Portal
   in the Stripe Dashboard (test mode first).
4. **Dashboard**: subscribe the webhook endpoint to `invoice.payment_failed` (and
   optionally `customer.subscription.trial_will_end`) so retries/notifications can
   be reacted to. Dashboard change — owner action.

## Why this is proposal-only

A correct dunning experience needs (a) a webhook deploy, (b) a new billing-portal
Edge Function + Stripe Dashboard portal config, and (c) a Stripe Dashboard event
subscription — i.e. payment-infrastructure changes beyond safe client copy. Per the
task's guardrails ("if a proper fix needs dashboard event changes or database
changes, write a proposal only and stop"), none of it is implemented here.

## Recommendation

Ship the grace window (#1) + `status` plumbing (#2) + billing portal (#3) together
before Live Mode, since that is when a real card can actually fail. Until then the
conservative "remove Super on any non-active status" behavior is safe and no user
is currently on a live paid plan.
