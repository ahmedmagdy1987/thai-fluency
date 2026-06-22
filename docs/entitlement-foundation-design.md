# Premium entitlement foundation — server-authoritative design

Status: **DESIGN / APPROVAL PACKAGE. No migration applied. No checkout implemented.
No prices set. No secrets added.** This defines the server-authoritative entitlement
model and the provider-neutral contract so billing can be wired safely later.

Builds on the client-side central model from the previous sprint
(`src/config/entitlements.js`: `tier`, `FEATURES`, `PLANS`, `canUseFeature`) and the
blockers in `docs/payment-readiness.md`.

---

## 1. Current state (audit)
- `src/config/entitlements.js` defines `tier` (default `'free'`), the free/premium/
  coming-soon `FEATURES` catalog, `PLANS` (prices `null` → "Pricing coming soon"),
  and `canUseFeature()` (premium returns false until a feature is actually shipped).
- `tier` lives **only in client `stats`** and is **not synced** (deliberately — it is
  a placeholder). There is **no entitlement column anywhere in Supabase**
  (`profiles`/`user_stats` have none).
- `/plans` reads the config and is honest (Coming soon, no checkout).
- **Gap:** nothing server-side can grant or verify Premium. Today a user could set
  `stats.tier = 'super'` in localStorage; it grants nothing real (every premium
  feature is `coming-soon`, so `canUseFeature` still returns false) — but the moment a
  real benefit ships, client-only tier would be forgeable. **Entitlement must become
  server-authoritative before any paid benefit exists.**

Principle: **the frontend may DISPLAY entitlement state but must never GRANT Premium
by changing localStorage or client state.** Grants come only from a verified webhook.

---

## 2. Server-authoritative entitlement model

States required: `free`, `super`, `trial`, `canceled`, `past_due`, plus a **grace
period** (a window on `past_due`/`canceled` where access is retained).

### State machine
```
free ──checkout(trial)──▶ trial ──trial ends + paid──▶ super
free ──checkout(paid)───▶ super
super ─payment fails────▶ past_due ──recovered──▶ super
                                   └─grace expires─▶ canceled ─period end─▶ free
super ─user cancels─────▶ canceled (access until current_period_end) ─▶ free
```

### Access derivation (server is source of truth)
```
is_entitled =
     status = 'super'
  OR status = 'trial'                              and trial_end       > now()
  OR (status = 'past_due'  and grace_end          > now())   -- dunning grace
  OR (status = 'canceled'  and current_period_end > now())   -- paid-through
```
The client computes the same from the values it reads, but only for **display**; any
real gate (`canUseFeature` once features ship) also re-checks server-provided state.

---

## 3. Migration approval package (entitlements)

> Do not apply automatically. File as `supabase/migrations/007_entitlements.sql`
> when approved.

### 3a. Exact SQL migration

```sql
-- Migration 007: server-authoritative premium entitlement

create table if not exists public.user_entitlements (
  user_id uuid primary key references auth.users(id) on delete cascade,
  status text not null default 'free'
    check (status in ('free','super','trial','canceled','past_due')),
  current_period_end timestamptz,        -- access end for super/canceled
  trial_end          timestamptz,        -- access end for trial
  grace_end          timestamptz,        -- access end while past_due (dunning)
  cancel_at_period_end boolean not null default false,
  provider text,                         -- 'stripe' | 'paddle' | 'play' | 'appstore'
  provider_customer_id text,
  provider_subscription_id text,
  source text default 'system',          -- 'webhook' | 'admin' | 'system'
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_entitlements enable row level security;

-- Owner may READ their entitlement. NO client write policy: only the service role
-- (the webhook Edge Function) and SECURITY DEFINER admin paths may write.
drop policy if exists "entitlements select own" on public.user_entitlements;
create policy "entitlements select own" on public.user_entitlements
  for select using (auth.uid() = user_id);

drop trigger if exists set_user_entitlements_updated_at on public.user_entitlements;
create trigger set_user_entitlements_updated_at
  before update on public.user_entitlements
  for each row execute function public.set_updated_at();

-- Seed a 'free' row for each new user (extend the existing signup trigger).
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, created_at)
    values (new.id, new.email, now()) on conflict (id) do nothing;
  insert into public.user_stats (user_id) values (new.id) on conflict (user_id) do nothing;
  insert into public.user_entitlements (user_id) values (new.id) on conflict (user_id) do nothing;
  return new;
end; $$;

-- Read-only entitlement view for the client (derives is_entitled server-side).
create or replace function public.current_entitlement()
returns jsonb language sql security definer set search_path = public stable as $$
  select jsonb_build_object(
    'status', e.status,
    'is_entitled',
        e.status = 'super'
     or (e.status = 'trial'    and coalesce(e.trial_end, 'epoch'::timestamptz)          > now())
     or (e.status = 'past_due' and coalesce(e.grace_end, 'epoch'::timestamptz)          > now())
     or (e.status = 'canceled' and coalesce(e.current_period_end,'epoch'::timestamptz)  > now()),
    'current_period_end', e.current_period_end,
    'trial_end', e.trial_end,
    'grace_end', e.grace_end,
    'cancel_at_period_end', e.cancel_at_period_end
  )
  from public.user_entitlements e
  where e.user_id = auth.uid();
$$;
revoke all on function public.current_entitlement() from public, anon;
grant execute on function public.current_entitlement() to authenticated;

-- Service-role-only writer used by the webhook (runs with the service key, which
-- bypasses RLS; defined here for clarity/audit and to centralize state transitions).
create or replace function public.apply_entitlement_event(
  p_user_id uuid, p_status text, p_current_period_end timestamptz,
  p_trial_end timestamptz, p_grace_end timestamptz,
  p_cancel_at_period_end boolean, p_provider text,
  p_customer_id text, p_subscription_id text
) returns void language plpgsql security definer set search_path = public as $$
begin
  insert into public.user_entitlements as e
    (user_id, status, current_period_end, trial_end, grace_end,
     cancel_at_period_end, provider, provider_customer_id, provider_subscription_id, source)
  values
    (p_user_id, p_status, p_current_period_end, p_trial_end, p_grace_end,
     coalesce(p_cancel_at_period_end,false), p_provider, p_customer_id, p_subscription_id, 'webhook')
  on conflict (user_id) do update set
    status = excluded.status,
    current_period_end = excluded.current_period_end,
    trial_end = excluded.trial_end,
    grace_end = excluded.grace_end,
    cancel_at_period_end = excluded.cancel_at_period_end,
    provider = excluded.provider,
    provider_customer_id = coalesce(excluded.provider_customer_id, e.provider_customer_id),
    provider_subscription_id = coalesce(excluded.provider_subscription_id, e.provider_subscription_id),
    source = 'webhook';
end; $$;
revoke all on function public.apply_entitlement_event(uuid,text,timestamptz,timestamptz,timestamptz,boolean,text,text,text) from public, anon, authenticated;
-- callable only by the service role (the webhook), never the client.
```

### 3b. RLS findings / policies
- `user_entitlements`: **select own only**. No client INSERT/UPDATE/DELETE → a user
  cannot self-grant Premium. The webhook writes via the service-role key (bypasses
  RLS) calling `apply_entitlement_event`.
- `current_entitlement()` (SECURITY DEFINER, `authenticated`): the client's read path.
- `apply_entitlement_event(...)`: execute revoked from `authenticated`/`anon`.

### 3c. Rollback SQL
```sql
-- Rollback migration 007
drop function if exists public.apply_entitlement_event(uuid,text,timestamptz,timestamptz,timestamptz,boolean,text,text,text);
drop function if exists public.current_entitlement();
drop table if exists public.user_entitlements;
-- (restore prior handle_new_user without the user_entitlements insert)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, created_at)
    values (new.id, new.email, now()) on conflict (id) do nothing;
  insert into public.user_stats (user_id) values (new.id) on conflict (user_id) do nothing;
  return new;
end; $$;
```

### 3d. Data-backfill impact
- Non-destructive. New table; all existing users are implicitly `free` (no row yet)
  — `current_entitlement()` returns null → client treats as free. Optionally backfill
  one `free` row per existing user (`insert ... select id from auth.users`), but not
  required.

### 3e. Client changes required (after approval, separate PR)
1. On sign-in, call `current_entitlement()`; store `status` + `is_entitled` in state.
2. Derive `tier` from server state; **remove any path that lets the client set
   `tier='super'`**. `canUseFeature` consults the server-derived flag.
3. Display-only: badges/plans reflect status; never grant.

---

## 4. Provider-neutral contract (no implementation yet)

A thin server-side layer (Supabase Edge Functions) with a **provider-neutral
interface**; concrete adapters (Stripe / Paddle / RevenueCat for Play+App Store)
implement it. **No secrets here**; the webhook signing secret and provider API key
live only in Edge Function secrets (never `VITE_*`, never the client bundle).

```ts
// Provider-neutral entitlement/billing contract (interface only — not implemented)
interface BillingProvider {
  // Web checkout: create a hosted checkout session for (user, plan). Returns a URL
  // the client redirects to. Maps Supabase user_id ↔ provider customer id.
  createCheckoutSession(userId: string, planId: string): Promise<{ url: string }>;

  // Verify a webhook's signature using the provider secret (Edge Function env).
  verifyWebhook(rawBody: string, signature: string): boolean;

  // Translate a verified provider event into our entitlement transition, then call
  // apply_entitlement_event(...) with the service-role client.
  activateSubscription(event: ProviderEvent): Promise<void>;   // → 'super' | 'trial'
  cancelSubscription(event: ProviderEvent):   Promise<void>;   // → 'canceled' (keep period end)
  handlePaymentFailed(event: ProviderEvent):  Promise<void>;   // → 'past_due' + grace_end
  restorePurchase(userId: string): Promise<void>;              // re-sync from provider/store
  syncEntitlement(userId: string): Promise<void>;              // reconcile on demand
}
```

Edge Function endpoints to add later (each maps to the above):
- `POST /billing/checkout` → `createCheckoutSession` (auth required; `checkout_started`
  analytics fires at the client click).
- `POST /billing/webhook` → `verifyWebhook` then route to activate/cancel/failed;
  `subscription_activated` analytics fires here.
- `POST /billing/restore` → `restorePurchase`.

Cross-device entitlement sync: because entitlement is one server row read via
`current_entitlement()` on every sign-in, Super follows the **account**, not the
device. Store-billed mobile purchases (Play/App Store) must be reconciled to the
Supabase user (RevenueCat or store server-notifications → `apply_entitlement_event`)
so web and mobile share one truth.

---

## 5. Remaining payment decisions (owner)
Carried from `docs/payment-readiness.md`, still open:
1. Provider + model (Stripe vs merchant-of-record; web-only vs store IAP).
2. Monthly + yearly **prices** and **currencies** (fill `PLANS`; today `null`).
3. Trial length / intro offer (drives the `trial` state).
4. Grace-period length for `past_due` (drives `grace_end`).
5. App Store / Google Play billing strategy + reconciliation (RevenueCat?).

## 6. Migration required: **YES** (table `user_entitlements` + functions above).
Stop for approval before applying. Rollback in §3c. No checkout, prices, or secrets
are introduced by this design.
