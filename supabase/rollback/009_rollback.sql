-- Rollback for 009_hearts_gems_cancel.sql (additive columns; safe to drop).
alter table public.user_stats drop column if exists hearts;
alter table public.user_stats drop column if exists gems;
alter table public.user_stats drop column if exists hearts_updated_at;
alter table public.subscriptions drop column if exists cancel_at_period_end;
