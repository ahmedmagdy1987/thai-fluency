-- Migration 003: Push notification support
--
-- Adds:
--   profiles.onesignal_player_id    — OneSignal subscription ID per device
--   profiles.notification_preferences — per-user toggles by notification type
--   profiles.timezone               — user's local timezone (e.g. "Asia/Bangkok")
--   user_stats.typical_study_hour   — 0-23, computed from activity, defaults 19
--   user_stats.last_notification_sent_at — anti-spam window
--
-- Paste this into the Supabase SQL Editor and click Run.

alter table public.profiles
  add column if not exists onesignal_player_id text,
  add column if not exists notification_preferences jsonb default '{
    "daily_reminder": true,
    "streak_warning": true,
    "milestone": true,
    "new_content": true,
    "re_engagement": true
  }'::jsonb,
  add column if not exists timezone text;

alter table public.user_stats
  add column if not exists typical_study_hour integer default 19 check (typical_study_hour between 0 and 23),
  add column if not exists last_notification_sent_at timestamptz;

-- Partial index for the worker queries that need "users with a player ID".
create index if not exists idx_profiles_onesignal
  on public.profiles (onesignal_player_id)
  where onesignal_player_id is not null;

-- Index for the worker queries that filter by last_active_date and last_notification_sent_at.
create index if not exists idx_user_stats_last_active
  on public.user_stats (last_active_date);
