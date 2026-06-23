-- ============================================================================
-- Migration 006C — award_reward becomes IDEMPOTENCY-ONLY (Phase-A correction)
-- ============================================================================
-- PENDING — apply per docs/migration-006-staged-rollout-runbook.md ("Phase A
-- correction"). Apply BEFORE flipping SERVER_REWARDS_ENABLED = true.
--
-- WHY: an adversarial review found that the original 006 award_reward ALSO wrote
-- user_stats.total_xp/today_xp server-side. With 006B unapplied, the client still
-- writes total_xp (grantXp + uploadStats), AND local-only reward paths (dialogue /
-- first-lesson / mini-unit) keep writing it. Two uncoordinated writers to total_xp
-- can double-count (a cloud download adopting the RPC's server write inside the
-- award's async window) or clobber un-synced rewards. There is no safe client-only
-- fix while the RPC also writes total_xp.
--
-- FIX: make award_reward an IDEMPOTENCY GATE + amount oracle ONLY. It records the
-- event (unique per user+key) and returns the server-clamped xp_awarded + status,
-- but does NOT touch user_stats. The client remains the SINGLE total_xp writer
-- (grantXp) and grants xp_awarded once, on 'awarded'. Cross-device / refresh /
-- multi-tab / retry idempotency comes from reward_events' UNIQUE(user_id,event_key).
--
-- This is a `create or replace function` only — additive/idempotent, no data change,
-- no table/RLS/grant change. reward_events and its policies are unchanged (006A).
--
-- NOTE (known transition nuance): review XP here is a flat 3 for new_card_learned /
-- due_review_completed, vs the client's rating-based 1/2/3/5. Signed-in users thus
-- see flat-3 review XP until a later phase passes the rating in the payload. Fixed
-- rewards (mission 35, course 250) and score-based (challenge*5, tone*4) match the
-- client constants. Achievement / stage are 0 XP (event record only).

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
  v_score integer;
  v_tot   integer;
  v_ts    timestamptz;
begin
  if v_uid is null then
    raise exception 'unauthorized' using errcode = '28000';
  end if;
  if p_event_type is null or p_event_key is null or length(p_event_key) > 200 then
    raise exception 'invalid_event';
  end if;
  v_ts := nullif(p_payload->>'at','')::timestamptz;
  if v_ts is not null and v_ts > now() + interval '5 minutes' then
    raise exception 'future_dated_event';
  end if;

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
  v_xp := least(greatest(coalesce(v_xp,0), 0), 500);

  -- Idempotency gate: first writer wins; a duplicate key is a no-op.
  insert into public.reward_events (user_id, event_type, event_key, xp_awarded, payload)
  values (v_uid, p_event_type, p_event_key, v_xp, p_payload)
  on conflict (user_id, event_key) do nothing;
  if not found then
    return jsonb_build_object('status','duplicate','xp_awarded',0);
  end if;

  -- IDEMPOTENCY-ONLY: deliberately NO user_stats write. The client applies
  -- xp_awarded exactly once (on 'awarded') and remains the single total_xp writer.
  return jsonb_build_object('status','awarded','event_type',p_event_type,'xp_awarded',v_xp);
end;
$$;

revoke all on function public.award_reward(text,text,jsonb) from public, anon;
grant execute on function public.award_reward(text,text,jsonb) to authenticated;
