-- Migration 005: Launch-critical persistence hardening
--
-- Adds signed-in persistence for current-day XP and aggregate Challenge
-- continuity. These columns live on user_stats, which already has RLS
-- policies restricting rows to auth.uid() = user_id.

alter table public.user_stats
  add column if not exists today_xp integer default 0,
  add column if not exists today_xp_date date,
  add column if not exists last_xp_activity_at timestamptz,
  add column if not exists challenge_attempts integer default 0,
  add column if not exists challenge_correct integer default 0,
  add column if not exists challenge_wrong integer default 0,
  add column if not exists last_challenge_date date,
  add column if not exists best_challenge_score integer default 0,
  add column if not exists best_challenge_total integer default 0;
