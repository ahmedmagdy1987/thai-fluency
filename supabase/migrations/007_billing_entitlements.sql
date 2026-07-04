-- 007_billing_entitlements.sql
-- Server-authoritative subscription / entitlement state for Tuk Talk Thai "Super".
--
-- ADDITIVE + REVERSIBLE. Nothing in the current app reads or writes this table yet,
-- so applying it changes NO existing behavior. The Stripe webhook (a service_role
-- Edge Function) is the ONLY writer; clients may read ONLY their own row.
--
-- This is the single source of truth the app checks for "is this user Super right
-- now" — regardless of whether the payment came from Stripe (web), Apple IAP (iOS),
-- or Google Play Billing (Android). All three converge on `super_until`.

create table if not exists public.subscriptions (
  user_id                uuid primary key references auth.users(id) on delete cascade,
  plan                   text not null default 'free',      -- 'free' | 'super_monthly' | 'super_yearly'
  status                 text not null default 'inactive',   -- 'active' | 'trialing' | 'past_due' | 'canceled' | 'inactive'
  provider               text,                               -- 'stripe' | 'apple' | 'google'
  super_until            timestamptz,                        -- entitlement expiry; NULL or past = NOT Super
  stripe_customer_id     text,
  stripe_subscription_id text,
  current_period_end     timestamptz,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

comment on table public.subscriptions is
  'Server-authoritative Super entitlement. Written ONLY by the billing webhook (service_role). Clients read their own row. super_until is the single truth for Super access across web/iOS/Android.';

alter table public.subscriptions enable row level security;

-- Tight privileges: authenticated users may SELECT (RLS restricts to own row);
-- no INSERT/UPDATE/DELETE grant, and no write policy, so clients can never forge
-- entitlement. service_role bypasses RLS and is the sole writer (the webhook).
revoke all on public.subscriptions from anon, authenticated;
grant select on public.subscriptions to authenticated;

drop policy if exists subscriptions_select_own on public.subscriptions;
create policy subscriptions_select_own on public.subscriptions
  for select to authenticated
  using (auth.uid() = user_id);

-- updated_at maintenance. search_path pinned to '' to satisfy the DB linter
-- (avoids the "function_search_path_mutable" advisory).
create or replace function public.subscriptions_touch_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_subscriptions_touch on public.subscriptions;
create trigger trg_subscriptions_touch
  before update on public.subscriptions
  for each row execute function public.subscriptions_touch_updated_at();
