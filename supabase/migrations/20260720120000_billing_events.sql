-- ============================================================================
-- Migration 011 — billing_events (Wave 13 item I: purchase observability)
-- ============================================================================
-- STATUS: NOT APPLIED. The owner must apply this manually — see the runbook note
-- at the bottom. The client code that writes to this table is already deployed
-- and DEGRADES SILENTLY while the table is absent, so applying it is safe at any
-- time and skipping it breaks nothing.
--
-- WHY THIS EXISTS
-- Purchase telemetry previously landed ONLY in a 50-entry localStorage ring
-- buffer on the payer's own device (src/lib/analytics.js). The owner therefore
-- had no way to see a checkout start, an activation, or a failed activation —
-- and the 50-entry cap could evict the activation event before anyone looked.
-- At launch that means being blind to failed activations, double charges and
-- refund disputes.
--
-- The SERVER half of this is already solved without a table: the Edge Functions
-- now log CHECKOUT_STARTED / ENTITLEMENT / CANCEL_SCHEDULED / UNMAPPED lines that
-- are readable in the Supabase Edge Function logs. This table adds the CLIENT
-- half — the funnel steps the server never sees (the user reaching /plans, the
-- checkout modal mounting, an activation timing out client-side).
--
-- PRIVACY: no PII. `props` is restricted client-side to primitive values with
-- strings capped at 80 chars (analytics.js sanitize()). Never write an email,
-- a name, or a Stripe secret here.

create table if not exists public.billing_events (
  id          bigint generated always as identity primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  props       jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

-- Read pattern is "recent events, optionally for one user".
create index if not exists billing_events_created_at_idx on public.billing_events (created_at desc);
create index if not exists billing_events_user_idx on public.billing_events (user_id, created_at desc);

alter table public.billing_events enable row level security;

-- Clients may APPEND their own events and read their own back. They may never
-- update or delete, so the log is append-only from the client's side. The owner
-- reads the whole table via the dashboard / service_role, which bypasses RLS.
revoke all on public.billing_events from anon, authenticated;
grant select, insert on public.billing_events to authenticated;

drop policy if exists billing_events_insert_own on public.billing_events;
create policy billing_events_insert_own on public.billing_events
  for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists billing_events_select_own on public.billing_events;
create policy billing_events_select_own on public.billing_events
  for select to authenticated
  using (auth.uid() = user_id);

comment on table public.billing_events is
  'Append-only client-side purchase funnel events (Wave 13). Server-side billing telemetry lives in the Edge Function logs. No PII: props are primitives only, strings capped at 80 chars by the client.';

-- ── HOW THE OWNER APPLIES THIS ──────────────────────────────────────────────
-- Option A (recommended — matches how 006c/010 were applied):
--   Supabase Dashboard → SQL Editor → paste this file → Run.
-- Option B (CLI, from the repo root):
--   supabase db push
-- Both are safe to re-run: every statement is create-if-not-exists / drop-then-
-- create. Nothing in the app depends on this table existing.
