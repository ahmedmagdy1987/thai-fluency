# Migration 006 — zero-downtime staged rollout runbook

Status: **PREPARED. Nothing applied, nothing activated, nothing deployed.** This is
the owner runbook to roll out server-authoritative XP with no downtime, in the
correct order, each step independently reversible.

Prepared at commit (see PR). No service-role key is used or required by this repo —
all SQL is applied **manually by the owner in the Supabase SQL Editor**.

## Files created
| File | Purpose | Applied? |
|---|---|---|
| `supabase/migrations/006_reward_events_and_rpc.sql` | Phase A — additive: `reward_events` + `award_reward` RPC + RLS/grants | **APPLIED** (manually via SQL Editor; repaired into CLI history as version `006`) |
| `supabase/rollback/006a_rollback.sql` | Phase A rollback (kept OUT of `migrations/` so the CLI never treats it as a migration) | n/a |
| `supabase/migrations/006b_revoke_xp_columns.sql` | Phase B — revoke client XP-column writes | NO — intentionally CLI-ignored (non-`<timestamp>` name) until renamed to `007_…` and approved |
| `supabase/rollback/006b_rollback.sql` | Phase B rollback (kept OUT of `migrations/`) | n/a |

> **Reconciliation status (applied):** Phase A was applied manually and is now
> recorded in the CLI migration history as version `006` (`migration list` shows
> `006 | 006`; `db push --dry-run` = up to date). The rollback scripts live under
> `supabase/rollback/`. Phase B (`006b_revoke_xp_columns.sql`) remains intentionally
> ignored by the CLI until it is renamed to `007_revoke_xp_columns.sql` and approved.
> The client transition is still dormant (`SERVER_REWARDS_ENABLED = false`).
| `src/config/featureFlags.js` | `SERVER_REWARDS_ENABLED = false` (gates activation) | committed, dormant |
| `src/lib/serverRewards.js` | RPC wrapper + event keys + duplicate/fallback handling | committed, dormant |
| `docs/migration-006-staged-rollout-runbook.md` | this runbook | — |

The two client modules are imported by **no active code**, so they are tree-shaken
out of the production bundle — committing them changes nothing in production.

## Zero-downtime sequence (do these in order)
```
1. Apply Phase A (006a)            ── additive; old client keeps working, RPC unused
2. Verify Phase A                  ── RPC awards + idempotent + auth-guarded
3. Wire the client (App.jsx)       ── route the 8 grantXp sites through awardReward
4. Flip SERVER_REWARDS_ENABLED=true & deploy
5. Verify client in production     ── signed-in rewards go through the RPC; XP correct
6. Apply Phase B (006b)            ── lock XP columns; no-op for the new client
7. Verify Phase B                  ── direct XP write denied; legit writes ok
8. (Later) Final hardening         ── remove the local fallback once proven
```
Each step is safe to pause on; each has a rollback below. Steps 1–2 and 6–7 are DB
only; steps 3–5 are client only. The client (step 3–5) ships BEFORE the XP-column
revoke (step 6), which is what makes step 6 a no-op = zero downtime.

---

## Phase A — apply (Supabase SQL Editor)
1. Open Supabase → SQL Editor.
2. Confirm migration 005 is live (the RPC depends on `today_xp`, etc.):
   ```sql
   select count(*) from information_schema.columns
   where table_name='user_stats' and column_name in ('today_xp','today_xp_date','last_xp_activity_at');
   -- expect 3
   ```
3. Paste the entire contents of `006_reward_events_and_rpc.sql` and Run.

### Phase A — verification queries
```sql
-- reward_events exists + RLS on, no client write policy
select relrowsecurity from pg_class where relname='reward_events';            -- expect: t
select cmd from pg_policies where tablename='reward_events';                  -- expect: only SELECT
-- RPC exists and is execit-grantable to authenticated only
select proname, prosecdef from pg_proc where proname='award_reward';         -- prosecdef = t (definer)
-- award once, then duplicate (run twice, same key)
select public.award_reward('mission_completed','mission:1:1','{}'::jsonb);    -- status: awarded, xp 35
select public.award_reward('mission_completed','mission:1:1','{}'::jsonb);    -- status: duplicate, xp 0
-- unknown type rejected; forged amount ignored (no amount param exists)
select public.award_reward('hack','k1','{"xp":999999}'::jsonb);              -- error: unknown_event_type
-- existing client still works (NOT revoked in Phase A):
update public.user_stats set total_xp = total_xp where user_id = auth.uid(); -- expect: ok
-- aggregate sanity (no PII)
select count(*) from public.reward_events;
```
> Clean up the two test rows if desired:
> `delete from public.reward_events where event_key='mission:1:1';`
> (and the stray XP it added, if you used a real account, can be left or corrected).

### Phase A — failure / rollback
If anything is wrong, run `supabase/rollback/006a_rollback.sql` (drops the RPC + table). The old
client is unaffected because Phase A never changed its privileges. No data lost.

---

## Client activation (steps 3–5) — exact App.jsx integration
Apply as a **separate PR** (not in this prepared change). The pattern: add one gated
helper and route the 8 `grantXp(...)` reward sites through it. With the flag false it
is byte-for-byte the current behavior; with it true, signed-in users use the RPC.

```jsx
// imports
import { SERVER_REWARDS_ENABLED } from './config/featureFlags.js';
import { awardReward, REWARD_EVENTS, rewardKeys, serverRewardsActive } from './lib/serverRewards.js';

// one gated helper (replaces a bare grantXp at reward sites)
const awardXp = useCallback((eventType, eventKey, localXp, payload = {}) => {
  if (serverRewardsActive(session, isEmailConfirmed, hasSupabaseConfig)) {
    awardReward(eventType, eventKey, { ...payload, local_date: getLocalDateKey() })
      .then(res => {
        if (res.ok) {
          // authoritative: reconcile total_xp from the server (duplicate => no change)
          if (typeof res.totalXp === 'number') {
            setStats(s => ({ ...s, totalXp: res.totalXp }));
          }
          // NOTE: streak + daily-goal bonus remain client-managed in Phase A/B; keep
          // the existing streak/today-bucket bookkeeping running for those.
        } else {
          grantXp(localXp);                 // RPC unavailable → existing local path
        }
      })
      .catch(() => grantXp(localXp));
    return;
  }
  grantXp(localXp);                          // disabled OR anonymous → existing path
}, [session, isEmailConfirmed, grantXp]);
```

Route these 8 sites (event type → key builder → existing local XP):
| Site (App.jsx) | event type | key |
|---|---|---|
| `reviewOne` new card | `NEW_CARD_LEARNED` | `rewardKeys.newCard(cardId)` |
| `reviewOne` due review | `DUE_REVIEW_COMPLETED` | `rewardKeys.dueReview(cardId, getLocalDateKey())` |
| mission complete effect | `MISSION_COMPLETED` | `rewardKeys.mission(stage, mission)` |
| `recordQuizComplete` | `CHALLENGE_COMPLETED` | `rewardKeys.challenge(stage, today)` + `{score,total}` |
| `recordTonesQuiz` | `TONE_CHALLENGE_COMPLETED` | `rewardKeys.toneChallenge(today)` + `{score,total}` |
| achievement unlock effect | `ACHIEVEMENT_UNLOCKED` | `rewardKeys.achievement(id)` |
| stage complete | `STAGE_COMPLETED` | `rewardKeys.stage(stageId)` |
| course complete | `COURSE_COMPLETED` | `rewardKeys.course()` |

Also: when `serverRewardsActive(...)`, `uploadStats` should **stop sending** `total_xp,
today_xp, today_xp_date, last_xp_activity_at` (the RPC owns them). Until Phase B this
is a client-side choice; Phase B enforces it at the DB.

Then set `SERVER_REWARDS_ENABLED = true` and deploy.

### Client — verification (production, signed-in test account)
- Earn each reward type once → `reward_events` gets one row each; `total_xp` matches.
- Repeat an action (refresh / double-click / 2 tabs / 2 devices) → still one row, no
  double XP (`status:'duplicate'`).
- Sign out (anonymous) → rewards still work locally (fallback).
- Temporarily point at a project WITHOUT 006a (or before applying) → client falls
  back to the local path with no errors surfaced to the user.

### Client — failure / rollback
Set `SERVER_REWARDS_ENABLED = false` and redeploy. Instantly reverts to the existing
local reward path. No DB change needed. (Do NOT apply Phase B until the client is
verified, or the old path would be broken.)

---

## Phase B — apply (ONLY after client verified in production)
Pre-req: the live client has `SERVER_REWARDS_ENABLED = true`, is verified, and no
longer writes the XP columns via `uploadStats`.
1. Supabase → SQL Editor → paste `006b_revoke_xp_columns.sql` → Run.

### Phase B — verification queries
```sql
-- XP columns no longer client-updatable; non-XP columns still are
update public.user_stats set total_xp = total_xp + 1000 where user_id = auth.uid();  -- expect: permission denied
update public.user_stats set daily_goal = 55 where user_id = auth.uid();             -- expect: ok
update public.user_stats set perfect_quizzes = perfect_quizzes where user_id = auth.uid(); -- expect: ok
-- RPC still the XP writer
select public.award_reward('new_card_learned','card:99001:learned','{}'::jsonb);     -- expect: awarded, xp 3
-- grants reflect the column lock
select privilege_type, count(*) from information_schema.column_privileges
where table_name='user_stats' and grantee='authenticated' group by privilege_type;
```

### Phase B — failure / rollback
If a stale client errors on stat sync, run `supabase/rollback/006b_rollback.sql` (re-grants blanket
UPDATE). The RPC keeps working; you simply lose the column lock until re-applied
after all clients are updated.

---

## Final hardening (later, optional)
Once Phase B is stable and the RPC is proven, remove the local fallback in
`serverRewards.js`/App.jsx (the `grantXp(localXp)` branch) for signed-in users, and
migrate streak/daily-bonus + the achievement-feed counters to RPC ownership (Tier-2).
Until then the fallback is intentionally retained for safety.

## Data preservation summary
- Phase A: additive only — no DROP/DELETE/TRUNCATE; `total_xp` changes only
  additively per RPC call. Existing XP, progress, missions, achievements untouched.
- Phase B: privilege change only — touches no data.
- Both rollbacks: privilege/object changes only — no data loss.
