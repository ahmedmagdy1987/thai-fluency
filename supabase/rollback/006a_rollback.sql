-- ============================================================================
-- Migration 006A — ROLLBACK
-- ============================================================================
-- Reverts Phase A. Safe at any time: Phase A made no privilege changes and no
-- data changes, so this only drops the additive objects. Already-recorded
-- reward_events rows are removed with the table (they granted XP additively;
-- dropping them does NOT subtract already-awarded total_xp, which is the correct,
-- non-destructive behavior — existing totals are preserved).

drop function if exists public.award_reward(text,text,jsonb);
drop table if exists public.reward_events;
