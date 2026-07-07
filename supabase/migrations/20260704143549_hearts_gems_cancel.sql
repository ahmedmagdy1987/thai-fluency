-- 009_hearts_gems_cancel.sql
-- (1) Real hearts + gems economy on user_stats (replaces the old fake placeholders).
--     hearts: gentle "lives" used ONLY in the Challenge; regenerate over time; Super = unlimited.
--     gems: earned from missions/quests; spent in the Shop (e.g. refill hearts).
-- (2) subscriptions.cancel_at_period_end: track a scheduled cancellation so the UI can show
--     "canceled — Super stays active until <period end>".
-- ADDITIVE + safe: sensible defaults; existing rows unaffected.

alter table public.user_stats
  add column if not exists hearts int not null default 5,
  add column if not exists gems int not null default 0,
  add column if not exists hearts_updated_at timestamptz;

alter table public.subscriptions
  add column if not exists cancel_at_period_end boolean not null default false;

comment on column public.user_stats.hearts is 'Gentle lives for the Challenge (max 5); regenerate over time; Super = unlimited.';
comment on column public.user_stats.gems is 'Earned currency (missions/quests); spent in the Shop (e.g. refill hearts).';
comment on column public.subscriptions.cancel_at_period_end is 'True when the user scheduled a cancellation; Super stays active until current_period_end/super_until.';
