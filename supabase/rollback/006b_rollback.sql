-- ============================================================================
-- Migration 006B — ROLLBACK
-- ============================================================================
-- Restores the pre-Phase-B privilege model: blanket UPDATE on user_stats for
-- authenticated (i.e. the client may again write total_xp / today_xp / etc.).
--
-- Use this if Phase B breaks a client that is still writing XP columns. It is
-- safe and non-destructive (privilege change only; no data touched). After
-- rollback, the award_reward RPC from Phase A still exists and still works — only
-- the column lock is lifted.

grant update on public.user_stats to authenticated;
