# Migration 006 — pre-flight review & STOP report

Status: **NOT APPLIED. STOPPED before applying, as required.** Two independent
reviews (manual + an adversarial agent audit) agree: the proposed SQL is structurally
valid but **needs corrections** before it is safe to apply. There is also a hard
environment blocker (below).

Reviewed at commit `aebc04c`. Safety tag pushed: `before-server-reward-migration-006`.

---

## 0. Environment blocker — cannot apply from here

This environment has **no privileged access to the live Supabase database**:
- Supabase CLI is installed (v2.107.0) but the project is **not linked** (no
  `supabase/config.toml`).
- No `SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_URL`, `SUPABASE_SERVICE_ROLE_KEY`, or
  `DATABASE_URL`; `psql` is not installed.
- `.env.local` contains only the **public anon/publishable key** (`VITE_SUPABASE_KEY`),
  which runs under RLS as `anon`/`authenticated` and **cannot execute DDL**
  (`CREATE`/`ALTER`/`REVOKE`/`GRANT`) or bypass RLS.

The documented apply path (per `supabase/schema.sql`) is a **manual paste into the
Supabase SQL Editor**, which requires the owner's dashboard login. Therefore steps 2
(live backup/introspection), 3 (apply), and 5 (live security tests) **must be run by
the owner**; this doc provides the exact queries/procedure to do so.

> Validation note: I could only validate against the **committed** schema
> (`schema.sql` + migrations 001–005), not a live introspection. Run §4's queries to
> confirm the live schema matches before applying — especially that **migration 005
> is actually applied in prod** (it added `today_xp`, `challenge_*`, etc.).

---

## 1. Schema review result

| Check | Result |
|---|---|
| All referenced tables/columns exist (vs `schema.sql` + `005`) | ✅ Yes — no missing/mismatched |
| Any data deleted/reset (DROP/DELETE/TRUNCATE/UPDATE at migration time) | ✅ None — only CREATE/INDEX/POLICY/FUNCTION + REVOKE/GRANT |
| Existing XP grandfathered | ✅ Yes — `total_xp` only changes additively, per-call, inside the RPC |
| Reward event keys unique per user | ✅ `UNIQUE(user_id, event_key)` + `on conflict do nothing` + `NOT FOUND` check |
| RPC uses `auth.uid()` only (no user id from request) | ✅ Yes — cannot award to another user; raises `unauthorized` on null |
| Client write access to reward columns removed | ⚠️ Yes, but **over-broad** — see Correction 1 |
| Preference/non-reward fields remain writable | ❌ **No** — grant list is incomplete; see Correction 1 |
| Rollback SQL complete | ✅ Yes — restores blanket UPDATE, drops function + table |
| **Overall verdict** | **needs-corrections** |

---

## 2. Required corrections (STOP — re-approve before applying)

### Correction 1 — Grant-back list is incomplete → freezes legitimate stat sync (**blocking**)
The migration does `revoke update on user_stats from authenticated; grant update (<list>)`.
Postgres column privileges are grant-based, so the granted list must enumerate **every**
column the client legitimately writes. The doc's list omits these columns that
`cloudStorage.js → uploadStats` writes and that the RPC **never** sets:

```
total_reviews, daily_goals_hit, tones_quiz_passed, tones_quiz_best, quizzes_passed,
perfect_quizzes, challenge_attempts, challenge_correct, challenge_wrong,
last_challenge_date, best_challenge_score, best_challenge_total
```

After the migration these would be writable by **no role** (the doc's comment that they
become "writable ONLY by `award_reward`" is inaccurate — the RPC writes none of them),
so they would silently **freeze at defaults** → cross-device regression of review
counts, challenge history, and tone-quiz stats.

**Fix:** add them to the grant list (keep client-writable; they grant 0 XP and only feed
achievements, which Tier-2 will server-verify), **or** migrate them to RPC ownership in
the *same* change. Recommended for Tier-1: keep them client-writable (see §3).

### Correction 2 — Migration/client sequencing breaks the live client (**blocking**)
Applying 006 immediately makes the **current** `uploadStats` upsert fail with a
column-privilege error (it writes `total_xp`/`today_xp`/`current_streak`/etc., no longer
grantable to `authenticated`). **Fix:** ship the updated client (which stops sending the
RPC-owned columns and routes rewards through `award_reward`) in the **same release
window** as the migration, or stage so the live client is never broken between steps.

### Correction 3 — Streak-freeze regression (**behavioral**)
Client `grantXp` (App.jsx ~L800–813) extends the streak using `streak_freezes` when the
gap ≤ 2 days and a freeze is available. The RPC ignores `streak_freezes` and resets
`current_streak` to 1 on any gap > 1 day. If the RPC becomes the sole streak writer, a
2-day gap that a freeze would have covered now resets the streak. **Fix:** either port
freeze consumption into the RPC, **or** keep streak client-managed in Tier-1 (recommended
— see §3) and defer streak authority to Tier-2.

### Correction 4 — Timezone divergence (**behavioral**)
The RPC computes "today"/streak in **UTC**; the client uses `getLocalDateKey()` (local
time). Once the RPC owns the day-bucket, daily-XP and streak boundaries shift for
non-UTC users. **Fix:** pass the client's local date in the payload (`local_date`,
validated to be within ±1 day of the server date to prevent abuse) and use it for the
day bucket, **or** store a per-user timezone.

---

## 3. Recommended corrected migration (Tier-1: XP-ledger authority only)

The lowest-risk Tier-1 scope makes **only XP authoritative** and leaves streak + stat
counters client-managed (closing the high-severity "mint unlimited XP" hole while
avoiding Corrections 3 & 4 entirely). RPC-owned (revoked) columns are exactly:
`total_xp, today_xp, today_xp_date, last_xp_activity_at`.

```sql
-- Migration 006 (CORRECTED, Tier-1: XP authority only). REQUIRES OWNER APPROVAL.
-- Apply together with the matching client change (Correction 2).

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

create or replace function public.award_reward(
  p_event_type text, p_event_key text, p_payload jsonb default '{}'::jsonb
) returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_xp integer; v_total integer; v_score integer; v_tot integer; v_ts timestamptz;
  v_today date;
begin
  if v_uid is null then raise exception 'unauthorized' using errcode='28000'; end if;
  if p_event_type is null or p_event_key is null or length(p_event_key) > 200 then
    raise exception 'invalid_event'; end if;
  -- local-day bucket (Correction 4): trust client local date only within +/-1 day
  v_today := coalesce(nullif(p_payload->>'local_date','')::date, (now() at time zone 'utc')::date);
  if abs(v_today - (now() at time zone 'utc')::date) > 1 then
    v_today := (now() at time zone 'utc')::date; end if;
  v_ts := nullif(p_payload->>'at','')::timestamptz;
  if v_ts is not null and v_ts > now() + interval '5 minutes' then
    raise exception 'future_dated_event'; end if;

  v_score := greatest(coalesce((p_payload->>'score')::int,0),0);
  v_tot   := greatest(coalesce((p_payload->>'total')::int,0),0);
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
  if v_xp is null then raise exception 'unknown_event_type:%', p_event_type; end if;
  v_xp := least(greatest(coalesce(v_xp,0),0), 500);

  insert into public.reward_events (user_id, event_type, event_key, xp_awarded, payload)
  values (v_uid, p_event_type, p_event_key, v_xp, p_payload)
  on conflict (user_id, event_key) do nothing;
  if not found then
    select total_xp into v_total from public.user_stats where user_id = v_uid;
    return jsonb_build_object('status','duplicate','xp_awarded',0,'total_xp',coalesce(v_total,0));
  end if;

  update public.user_stats set
    total_xp = coalesce(total_xp,0) + v_xp,
    today_xp = case when today_xp_date = v_today then coalesce(today_xp,0)+v_xp else v_xp end,
    today_xp_date = v_today,
    last_xp_activity_at = now(),
    updated_at = now()
  where user_id = v_uid
  returning total_xp into v_total;

  return jsonb_build_object('status','awarded','event_type',p_event_type,
                            'xp_awarded',v_xp,'total_xp',v_total);
end; $$;
revoke all on function public.award_reward(text,text,jsonb) from public, anon;
grant execute on function public.award_reward(text,text,jsonb) to authenticated;

-- Make the RPC the only writer of the XP-ledger columns. Revoke blanket UPDATE,
-- then grant back EVERY other client-written column (Correction 1).
revoke update on public.user_stats from authenticated;
grant update (
  current_streak, longest_streak, last_active_date,           -- streak stays client-managed (Tier-1)
  current_stage, started_stage, total_reviews, daily_goal, daily_goals_hit,
  tones_quiz_passed, tones_quiz_best, quizzes_passed, perfect_quizzes,
  challenge_attempts, challenge_correct, challenge_wrong, last_challenge_date,
  best_challenge_score, best_challenge_total, streak_freezes, last_freeze_grant,
  last_seen_mission, stage1_celebration_shown, dialogues_completed, known_card_ids,
  cards_seen, cards_mastered
) on public.user_stats to authenticated;
-- RPC-owned (now writable only by award_reward / definer): total_xp, today_xp,
-- today_xp_date, last_xp_activity_at.
```

**Rollback (unchanged, still complete):**
```sql
grant update on public.user_stats to authenticated;
drop function if exists public.award_reward(text,text,jsonb);
drop table if exists public.reward_events;
```

Required client change in the same release (Correction 2): `uploadStats` must stop
sending `total_xp, today_xp, today_xp_date, last_xp_activity_at`; the daily-goal bonus
(currently added to `today_xp` client-side) must be re-issued as its own
`award_reward` event (e.g. `daily_goal_bonus:{local_date}`) or recomputed from the
RPC's returned `today_xp`. Rewards route through `award_reward` with the existing
`celebrations.js` ledger IDs as `event_key`.

**Option B (full authority, later):** also revoke `current_streak/longest_streak/
last_active_date/streak_freezes` and port the streak-freeze consumption + local-date
into the RPC; plus the Tier-2 server-verified achievements and counters. More work,
more risk — defer past Tier-1.

---

## 4. Owner runbook — backup, inspect, apply, verify (run in Supabase SQL Editor)

**A. Record migration history** (which migrations are live):
```sql
select * from supabase_migrations.schema_migrations order by version;  -- if managed by CLI
-- else confirm by columns: select column_name from information_schema.columns
--   where table_name='user_stats' and column_name='today_xp';  -- proves 005 applied
```

**B. Export current definitions for affected objects** (no personal data):
```sql
-- table columns
select table_name, column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema='public'
  and table_name in ('user_stats','user_progress','user_missions','user_achievements','reward_events')
order by table_name, ordinal_position;
-- RLS policies
select schemaname, tablename, policyname, cmd, qual, with_check
from pg_policies where schemaname='public'
  and tablename in ('user_stats','user_progress','user_missions','user_achievements','reward_events');
-- grants
select table_name, grantee, privilege_type
from information_schema.role_table_grants
where table_schema='public'
  and table_name in ('user_stats','user_progress','user_missions','user_achievements');
-- functions
select proname, pg_get_functiondef(oid) from pg_proc
where pronamespace='public'::regnamespace and proname in ('award_reward','handle_new_user');
```

**C. Safe aggregate counts only (no PII):**
```sql
select count(*) users, sum(total_xp) total_xp_sum, max(total_xp) max_xp,
       avg(total_xp)::int avg_xp, max(current_streak) max_streak
from public.user_stats;
select count(*) progress_rows from public.user_progress;
select count(*) mission_rows  from public.user_missions;
select count(*) achv_rows     from public.user_achievements;
-- after migration: select count(*) from public.reward_events;  (should start at 0)
```

**D. Apply** the corrected §3 SQL (with the matching client release). **Do not** run
any other migration. **Do not** run destructive/reset commands.

**E. Verify post-apply:**
```sql
-- award path works + idempotent (run twice with same key → second is 'duplicate')
select public.award_reward('mission_completed','mission:1:1','{}'::jsonb);
select public.award_reward('mission_completed','mission:1:1','{}'::jsonb);
-- forged amount ignored (no amount param accepted); unknown type rejected
select public.award_reward('hack','x','{"xp":999999}'::jsonb);   -- expect: unknown_event_type
-- direct reward-column write must FAIL for a normal user
update public.user_stats set total_xp = total_xp + 1000 where user_id = auth.uid();  -- expect: permission denied
-- legitimate preference write still works
update public.user_stats set daily_goal = 60 where user_id = auth.uid();             -- expect: ok
```

---

## 5. Decisions for the owner
1. Approve the **corrected** §3 SQL (Tier-1 XP authority) — or request Option B.
2. Keep streak + stat counters client-managed for Tier-1 (recommended), accepting they
   are forgeable but grant 0 XP until Tier-2 server-verification?
3. Confirm migration 005 is live in prod (query §4A).
4. Schedule the coordinated migration + client release (Correction 2).

**Migration applied: NO.** Blocked by (a) required corrections needing re-approval, and
(b) no privileged DB access in this environment. Rollback is ready (§3). Nothing was
applied, deployed, or changed in the database or client reward code.
