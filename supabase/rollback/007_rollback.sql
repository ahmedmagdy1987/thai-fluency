-- Rollback for 007_billing_entitlements.sql
-- Safe: the table is additive and unreferenced by app logic until the client PR lands.
drop trigger if exists trg_subscriptions_touch on public.subscriptions;
drop function if exists public.subscriptions_touch_updated_at();
drop table if exists public.subscriptions;
