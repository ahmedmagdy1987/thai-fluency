# Server reward integrity — design + migration approval package

Status: **DESIGN / APPROVAL PACKAGE. No migration has been applied.** Do not run any
SQL below until the owner approves. This document is the approval package: exact
SQL, RLS, rollback, backfill impact, client changes, and security rationale.

Audited at commit `ea62210`. Backend: Supabase (`supabase/schema.sql`, migrations
001–005). Client writes: `src/lib/cloudStorage.js`.

---

## 1. Current client-trust vulnerabilities

The backend trusts the client for every reward value. RLS enforces **ownership**
(`auth.uid() = user_id`) but never **validity of values**. The Supabase anon key in
`VITE_SUPABASE_KEY` is public by design (correct) — but it lets any signed-in user
call the database client directly, bypassing every client-side guard shipped in the
last sprint (the challenge/tone ledger, per-card daily guard, and direction lock all
live in the browser).

| # | Vulnerability | Where | Severity | Reachable how |
|---|---|---|---|---|
| V1 | **Arbitrary `total_xp` / `today_xp` / streak.** `uploadStats` upserts these straight from client values; RLS only checks ownership. | `user_stats` + `cloudStorage.js:63` | **High** | `supabase.from('user_stats').upsert({user_id:ME, total_xp:9_999_999})` in devtools |
| V2 | **Forged achievements.** Client inserts any `achievement_id`. | `user_achievements` + `cloudStorage.js:149` | Medium | `upsert({user_id:ME, achievement_id:'xp-2000'})` |
| V3 | **Forged SRS maturity.** Client writes arbitrary `interval`/`reps`/`next_review`, inflating maturity achievements (`mature-50/150/300`, `sentences-25`). | `user_progress` + `cloudStorage.js:11` | Medium | upsert progress rows with `interval:999` |
| V4 | **Forged mission/challenge stats.** `total_reviews`, `perfect_quizzes`, `best_challenge_score`, `quizzes_passed`, `tones_quiz_passed`, `challenge_*` all client-written; they feed achievements. | `user_stats` | Medium | upsert with inflated counters |
| V5 | **Forged mission completion.** Client marks any `user_missions` row completed (gates content unlock client-side). | `user_missions` | Low–Med | upsert completed=true |
| V6 | **localStorage tampering → cloud.** `loadState` parses `thai-fluency-state-v1` unconditionally; an edited blob's XP is then synced up by V1. | `storage.js` + sync | High (feeds V1) | edit localStorage, reload |
| V7 | **No idempotency at the server.** Refresh / multi-tab / offline-retry can re-submit the same logical reward; nothing server-side dedups XP. | all writes | Medium | replay an upload |

gems/hearts have **no columns** and are never persisted — no server abuse vector yet,
but any future economy MUST be server-authoritative from day one (see §6).

**Net:** client-side fixes reduce *casual* farming in the UI, but XP/achievements are
**not defensible**. Any motivated user can set any totals. This blocks leaderboards
and any paid/competitive feature.

---

## 2. Target design — one atomic server-side reward path

A single `SECURITY DEFINER` RPC `award_reward(event_type, event_key, payload)` becomes
the **only** writer of XP and streak. It:

1. **validates the authenticated user** — `auth.uid()`; rejects `null` (anon/expired).
2. **validates the reward type** — allowlist of the 8 required event types; else error.
3. **calculates/clamps XP server-side** — amounts live in the function (a `CASE`), not
   in the request. Payload-driven rewards (challenge/tone) are bounded
   (`score` clamped to `[0,total]`, total capped, hard ceiling 500), so a forged
   score can't mint XP.
4. **uses a unique event key** — `reward_events(user_id, event_key)` UNIQUE; the insert
   is the idempotency gate.
5. **awards each event once** — a duplicate `event_key` (refresh, double-click, two
   tabs, two devices, offline retry) is a no-op that returns the current total.
6. **updates XP + streak + day bucket atomically** — all inside the function's single
   transaction.
7. **rejects duplicated / malformed / future-dated / unauthorized events** — see the
   guards in the SQL.
8. **is safe across refresh, double-click, multiple tabs, multiple devices** — because
   the UNIQUE constraint is enforced in one place (Postgres), races resolve to exactly
   one award (`on conflict do nothing` + `FOUND` check).

Required event types (and server XP source):

| event_type | XP (server-owned) | Idempotency `event_key` example |
|---|---|---|
| `new_card_learned` | 3 (first learn only) | `card:{cardId}:learned` |
| `due_review_completed` | 3, once/card/day | `review:{cardId}:{YYYY-MM-DD}` |
| `mission_completed` | 35 | `mission:{stage}:{mission}` |
| `challenge_completed` | `clamp(score,0,total)*5` | `challenge:{stage}:{YYYY-MM-DD}` |
| `tone_challenge_completed` | `clamp(score,0,total)*4` | `tone:{YYYY-MM-DD}` |
| `achievement_unlocked` | 0 (server-verified) | `achv:{achievementId}` |
| `stage_completed` | 0 | `stage:{stageId}` |
| `course_completed` | 250 | `course:v1` |

These event keys mirror the client-side ledger IDs already added in `celebrations.js`,
so the model is consistent end to end.

---

## 3. Migration approval package (TIER 1 — XP + streak authoritative)

> Do not apply automatically. Paste into the Supabase SQL editor only after approval.
> File this as `supabase/migrations/006_server_reward_integrity.sql` when approved.

### 3a. Exact SQL migration

```sql
-- Migration 006: server-authoritative XP + reward idempotency (Tier 1)

-- 1) Idempotent reward ledger. One row per (user, event_key); the RPC is the only
--    writer. No client INSERT/UPDATE/DELETE policy → clients cannot forge rows.
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
-- intentionally NO insert/update/delete policy (only the SECURITY DEFINER RPC writes)

-- 2) The single atomic reward path.
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
  v_today date := (now() at time zone 'utc')::date;
  v_yest  date := ((now() at time zone 'utc')::date - 1);
  v_total integer;
  v_streak integer;
  v_last  date;
  v_score integer;
  v_tot   integer;
  v_ts    timestamptz;
begin
  -- (a) auth
  if v_uid is null then
    raise exception 'unauthorized' using errcode = '28000';
  end if;
  -- (b) shape
  if p_event_type is null or p_event_key is null or length(p_event_key) > 200 then
    raise exception 'invalid_event';
  end if;
  -- (c) reject future-dated events (optional client timestamp, small skew allowed)
  v_ts := nullif(p_payload->>'at','')::timestamptz;
  if v_ts is not null and v_ts > now() + interval '5 minutes' then
    raise exception 'future_dated_event';
  end if;

  -- (d) server-side XP by type; client never chooses the amount
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
  v_xp := least(greatest(coalesce(v_xp,0), 0), 500);   -- hard ceiling, never negative

  -- (e) idempotency: first writer wins; a duplicate key is a no-op
  insert into public.reward_events (user_id, event_type, event_key, xp_awarded, payload)
  values (v_uid, p_event_type, p_event_key, v_xp, p_payload)
  on conflict (user_id, event_key) do nothing;
  if not found then
    select total_xp into v_total from public.user_stats where user_id = v_uid;
    return jsonb_build_object('status','duplicate','xp_awarded',0,'total_xp',coalesce(v_total,0));
  end if;

  -- (f) atomic XP + day-bucket + streak update
  select current_streak, last_active_date into v_streak, v_last
    from public.user_stats where user_id = v_uid for update;

  if v_last is distinct from v_today then
    if v_last = v_yest then v_streak := coalesce(v_streak,0) + 1;
    else v_streak := 1; end if;
  end if;

  update public.user_stats set
    total_xp       = coalesce(total_xp,0) + v_xp,
    today_xp       = case when today_xp_date = v_today then coalesce(today_xp,0) + v_xp else v_xp end,
    today_xp_date  = v_today,
    current_streak = v_streak,
    longest_streak = greatest(coalesce(longest_streak,0), v_streak),
    last_active_date = v_today,
    last_xp_activity_at = now(),
    updated_at     = now()
  where user_id = v_uid
  returning total_xp into v_total;

  return jsonb_build_object('status','awarded','event_type',p_event_type,
                            'xp_awarded',v_xp,'total_xp',v_total,'streak',v_streak);
end;
$$;

revoke all on function public.award_reward(text,text,jsonb) from public, anon;
grant execute on function public.award_reward(text,text,jsonb) to authenticated;

-- 3) Make the RPC the ONLY writer of reward columns. Remove the blanket UPDATE and
--    re-grant only the non-reward (preference / display-continuity) columns.
revoke update on public.user_stats from authenticated;
grant update (
  current_stage, started_stage, daily_goal, dialogues_completed, known_card_ids,
  stage1_celebration_shown, last_seen_mission, streak_freezes, last_freeze_grant
) on public.user_stats to authenticated;
-- total_xp, today_xp(_date), current_streak, longest_streak, last_active_date,
-- total_reviews, perfect_quizzes, quizzes_passed, tones_quiz_*, challenge_*,
-- best_challenge_* are now writable ONLY by award_reward / SECURITY DEFINER paths.
```

### 3b. RLS policies (summary)
- `reward_events`: **select own only**; no client write policy (RPC writes as definer).
- `user_stats`: keep the existing select/insert/update/delete-own RLS, but **column
  privileges** now restrict client `UPDATE` to the non-reward columns above. The
  signup trigger (`handle_new_user`, SECURITY DEFINER) still seeds the row at 0.
- `award_reward`: `execute` granted to `authenticated` only; revoked from `anon`.

### 3c. Rollback SQL

```sql
-- Rollback migration 006
grant update on public.user_stats to authenticated;   -- restore blanket client write
drop function if exists public.award_reward(text,text,jsonb);
drop table if exists public.reward_events;
```

(Reverting restores the pre-migration behavior exactly: client-authoritative stats.)

### 3d. Data-backfill impact
- **No destructive change.** Existing `user_stats` rows are untouched; existing
  `total_xp` values (possibly already client-inflated) are **grandfathered**. Going
  forward, only `award_reward` can change XP.
- `reward_events` starts empty; legitimate users simply begin event-sourcing on their
  next reward. No backfill is required for correctness.
- **Optional hardening job (separate approval):** a one-time admin recompute that
  caps each user's `total_xp` to a plausible maximum derived from `user_progress`
  (reviews) + completed `user_missions`. Recommended before launching a leaderboard;
  not required to stop new abuse.

### 3e. Client changes required (after approval, separate PR)
1. `cloudStorage.uploadStats` must **stop sending reward columns** (total_xp, today_xp,
   streak, longest_streak, last_active_date, total_reviews, perfect_quizzes,
   quizzes_passed, tones_quiz_*, challenge_*, best_challenge_*) — otherwise the upsert
   is rejected by the new column privileges. Send only preference/continuity columns.
2. Replace each `grantXp(...)` reward with a call to `award_reward(event_type,
   event_key, payload)`; use the existing celebration/ledger IDs as `event_key`.
   `downloadStats` continues to read `total_xp`/streak for display.
3. Keep the client-side guards as a UX layer (instant feedback), but treat the RPC
   result (`total_xp`) as authoritative and reconcile local state to it.
4. Offline: queue `award_reward` calls and flush on reconnect — idempotency makes
   retries safe.

These client changes are **out of scope for this doc** (no behavior changed yet) and
must not ship before the migration is applied, or rewards would silently fail.

### 3f. TIER 2 (recommended, separate package) — full integrity
- `unlock_achievement(achievement_id)` RPC that **re-derives eligibility server-side**
  from authoritative state before inserting `user_achievements`; revoke client insert.
- Server-recompute (or RPC-own) `total_reviews` / `perfect_quizzes` / challenge stats
  so forged display counters can't feed achievements.
- Move `user_missions.completed` behind a verifying RPC.

### 3g. Security rationale
- **Single writer + SECURITY DEFINER**: the only code path that can change XP is one
  reviewed function; the client role literally lacks the privilege to write the
  columns (defense in depth beyond app logic).
- **Server-owned amounts + clamps**: the request cannot pick a value; payload inputs
  are bounded, so even a forged `score` is capped.
- **UNIQUE event_key**: idempotency is enforced by the database, not the app, so it
  holds across refresh, double-click, multi-tab, multi-device, and offline retry.
- **auth.uid() inside the definer**: the function acts for the caller's own row only;
  `user_id` is never taken from the request, so a forged user id is impossible.
- **No new secrets, no service key in client**: everything runs under the user's JWT;
  the RPC's elevated rights come from `SECURITY DEFINER`, owned by the DB.

---

## 4. Cross-device / abuse test matrix

Modeled against the current schema and the proposed migration. "Now" = current prod.

| Scenario | Now (client-authoritative) | After migration 006 |
|---|---|---|
| Same reward submitted twice simultaneously | Both can write; XP can double | UNIQUE(event_key) + `on conflict do nothing` → exactly one award (atomic) |
| Same account, two browsers | Each tab upserts XP independently | RPC idempotent per event_key; XP server-owned |
| Same account, two devices | Same as two browsers | Same — server-authoritative, last legitimate award wins, no double |
| Modified XP amount | **Accepted verbatim** (V1) | Impossible — client can't write XP column; RPC computes/clamps |
| Forged user ID | **Already blocked** by RLS (`auth.uid() = user_id`) on writes | Still blocked; RPC ignores any request user_id, uses `auth.uid()` |
| Expired / anonymous session | Writes already fail (no `auth.uid()`), but no value enforcement | RPC raises `unauthorized` on null uid; reads still gated by RLS |
| Offline retry after reconnect | Re-send may double XP (V7) | event_key idempotency dedups the retry |
| Timezone / daily-reset boundary | Client computes "today"; cloud trusts it | RPC computes the day server-side (UTC); consistent across devices |
| localStorage tampering | Inflated XP syncs up (V6→V1) | Tampered totals can't be written; RPC is the only XP writer |

**Already protected today:** forged user ID (RLS ownership), and writes from a fully
anonymous/expired session (RLS needs `auth.uid()`).
**Requires migration 006:** modified XP amount, simultaneous/duplicate awards,
multi-tab/multi-device XP doubling, offline-retry doubling, timezone consistency,
localStorage-tamper persistence, forged achievements/stats (Tier 2).

---

## 5. Migration required: **YES**
Server reward enforcement cannot be done in client code alone. It requires the new
`reward_events` table, the `award_reward` RPC, and the column-privilege change above.
**Stop here for owner approval before applying.** Rollback is provided in §3c.
