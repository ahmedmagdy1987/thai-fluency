-- ============================================================================
-- Migration 006B — lock down XP columns (PHASE B: RUN ONLY AFTER CLIENT VERIFIED)
-- ============================================================================
-- PENDING — DO NOT APPLY until BOTH are true (see runbook):
--   1. Phase A (006a) is applied, AND
--   2. the RPC client transition (SERVER_REWARDS_ENABLED = true) is deployed and
--      verified in production — i.e. the live client no longer writes total_xp /
--      today_xp / today_xp_date / last_xp_activity_at via uploadStats.
--
-- Applying this BEFORE the updated client is live would break the old client's
-- uploadStats upsert (column-privilege deny). With the updated client already in
-- production (which omits those columns), this is a no-op for live traffic → zero
-- downtime.
--
-- Effect: total_xp, today_xp, today_xp_date, last_xp_activity_at become writable
-- ONLY by award_reward / SECURITY DEFINER. Every other user_stats field the app
-- still writes is re-granted. Streak-freeze and local-day logic are UNCHANGED
-- (the streak columns remain client-writable; the RPC does not own them yet).

-- 1) Remove the blanket UPDATE privilege...
revoke update on public.user_stats from authenticated;

-- 2) ...and re-grant UPDATE on EVERY legitimate non-XP column the app writes.
--    (Omitted on purpose — now RPC-only: total_xp, today_xp, today_xp_date,
--    last_xp_activity_at.)
grant update (
  -- streak (client-managed for now: keeps streak-freeze + local-day behavior)
  current_streak, longest_streak, last_active_date, streak_freezes, last_freeze_grant,
  -- progression / preferences
  current_stage, started_stage, daily_goal, last_seen_mission,
  stage1_celebration_shown, dialogues_completed, known_card_ids,
  -- display / achievement-feed counters (Tier-2 will server-verify these later)
  total_reviews, daily_goals_hit, tones_quiz_passed, tones_quiz_best,
  quizzes_passed, perfect_quizzes, challenge_attempts, challenge_correct,
  challenge_wrong, last_challenge_date, best_challenge_score, best_challenge_total,
  cards_seen, cards_mastered
) on public.user_stats to authenticated;

-- Row-level security is unchanged: the existing "user_stats update own" policy
-- still restricts updates to the caller's own row. Column privileges narrow WHICH
-- columns; RLS still restricts WHICH rows.
