-- ============================================================================
-- Migration 006A — server reward foundation (PHASE A: ADDITIVE, ZERO-DOWNTIME)
-- ============================================================================
-- PENDING — DO NOT APPLY OUT OF SEQUENCE. Apply per
-- docs/migration-006-staged-rollout-runbook.md, Phase A only.
--
-- This phase is FULLY ADDITIVE and safe to apply BEFORE the client is updated:
--   • creates reward_events + RLS + index
--   • creates the award_reward RPC (idempotent, server-clamped XP)
--   • grants execute to authenticated; revokes from anon/public
--   • DOES NOT revoke any user_stats writes (existing client keeps working)
--   • DOES NOT change streak or timezone behavior (RPC touches only the XP
--     ledger columns; streak stays client-managed until a later phase)
--   • preserves ALL existing user data (no DROP/DELETE/TRUNCATE; total_xp only
--     changes additively, per RPC call)
--
-- Because the current production client never calls award_reward, applying this
-- phase alone has NO behavioral effect — the RPC simply exists, unused, until the
-- client transition is deployed.

-- 1) Idempotent reward ledger. One row per (user, event_key). Only the RPC writes.
create table if not exists public.reward_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null,
  event_key  text not null,
  xp_awarded integer not null default 0,
  payload    jsonb,
  created_at timestamptz not null default now(),
  unique (user_id, event_key)
);
create index if not exists idx_reward_events_user on public.reward_events (user_id);

alter table public.reward_events enable row level security;
drop policy if exists "reward_events select own" on public.reward_events;
create policy "reward_events select own" on public.reward_events
  for select using (auth.uid() = user_id);
-- Intentionally NO insert/update/delete policy: clients cannot forge ledger rows;
-- the SECURITY DEFINER RPC below is the only writer.

-- 2) The single atomic reward path. Server owns the XP amount; the client cannot
--    choose it. Idempotent per (user, event_key).
create or replace function public.award_reward(
  p_event_type text,
  p_event_key  text,
  p_payload    jsonb default '{}'::jsonb
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid   uuid := auth.uid();
  v_xp    integer;
  v_total integer;
  v_score integer;
  v_tot   integer;
  v_ts    timestamptz;
  v_today date;
begin
  -- (a) auth — never trust a request-supplied user id
  if v_uid is null then
    raise exception 'unauthorized' using errcode = '28000';
  end if;
  -- (b) shape
  if p_event_type is null or p_event_key is null or length(p_event_key) > 200 then
    raise exception 'invalid_event';
  end if;
  -- (c) local-day bucket — trust the client's local date only within +/-1 day of
  --     the server date (keeps the existing local-day semantics without letting a
  --     forged date shift buckets arbitrarily). Does NOT change streak behavior.
  v_today := coalesce(nullif(p_payload->>'local_date','')::date, (now() at time zone 'utc')::date);
  if abs(v_today - (now() at time zone 'utc')::date) > 1 then
    v_today := (now() at time zone 'utc')::date;
  end if;
  -- (d) reject future-dated events (optional client timestamp, small skew allowed)
  v_ts := nullif(p_payload->>'at','')::timestamptz;
  if v_ts is not null and v_ts > now() + interval '5 minutes' then
    raise exception 'future_dated_event';
  end if;

  -- (e) server-side XP by type; payload-driven amounts are clamped + hard-ceiled
  v_score := greatest(coalesce((p_payload->>'score')::int, 0), 0);
  v_tot   := greatest(coalesce((p_payload->>'total')::int, 0), 0);
  v_xp := case p_event_type
    when 'new_card_learned'         then 3
    when 'due_review_completed'     then 3
    when 'mission_completed'        then 35
    when 'challenge_completed'      then least(v_score, nullif(v_tot,0)) * 5
    when 'tone_challenge_completed' then least(v_score, nullif(v_tot,0)) * 4
    when 'achievement_unlocked'     then 0
    when 'stage_completed'          then 0
    when 'course_completed'         then 250
    else null end;
  if v_xp is null then
    raise exception 'unknown_event_type:%', p_event_type;
  end if;
  v_xp := least(greatest(coalesce(v_xp,0), 0), 500);   -- never negative, hard ceiling

  -- (f) idempotency: first writer wins; a duplicate key is a no-op (refresh,
  --     double-click, two tabs, two devices, offline retry all collapse to one)
  insert into public.reward_events (user_id, event_type, event_key, xp_awarded, payload)
  values (v_uid, p_event_type, p_event_key, v_xp, p_payload)
  on conflict (user_id, event_key) do nothing;
  if not found then
    select total_xp into v_total from public.user_stats where user_id = v_uid;
    return jsonb_build_object('status','duplicate','xp_awarded',0,'total_xp',coalesce(v_total,0));
  end if;

  -- (g) atomic XP + day-bucket update. PHASE A: streak columns are NOT touched
  --     (streak stays client-managed, including streak-freeze + local-day logic).
  update public.user_stats set
    total_xp            = coalesce(total_xp,0) + v_xp,
    today_xp            = case when today_xp_date = v_today then coalesce(today_xp,0) + v_xp else v_xp end,
    today_xp_date       = v_today,
    last_xp_activity_at = now(),
    updated_at          = now()
  where user_id = v_uid
  returning total_xp into v_total;

  return jsonb_build_object('status','awarded','event_type',p_event_type,
                            'xp_awarded',v_xp,'total_xp',v_total);
end;
$$;

revoke all on function public.award_reward(text,text,jsonb) from public, anon;
grant execute on function public.award_reward(text,text,jsonb) to authenticated;

-- NOTE: This phase does NOT revoke any user_stats UPDATE privilege. The current
-- client's uploadStats keeps working unchanged. The XP-column revoke happens only
-- in Phase B (006b), AFTER the RPC client is deployed and verified.
