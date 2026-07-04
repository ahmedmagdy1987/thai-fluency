-- Rollback for 010_guard_user_stats.sql
drop trigger if exists trg_guard_user_stats on public.user_stats;
drop function if exists public.guard_user_stats();
