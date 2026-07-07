# Database Migration Ledger Reconciliation

**Status:** RESOLVED — audit complete and **Option A executed** on 2026-07-07 (see [Option A executed](#option-a-executed-2026-07-07)). The ledger and local files now match; `db push --dry-run` reports *"Remote database is up to date."*
**Date:** 2026-07-07 (audited at commit `8e29e8e`; Option A applied immediately after)
**Supabase project:** `fkebzcywofzloaqeghtn` (tuk-talk-thai)
**Scope:** investigation, documentation, and a git-only filename normalization. No SQL was applied; no ledger rows were changed; the production database was never written to.

> ⚠️ **DO NOT RUN `supabase db push`.** Nothing is pending — a push has nothing legitimate to do; run it only with explicit owner approval for a *new*, reviewed migration.
> ⚠️ **`supabase migration repair` is NOT needed** — Option A resolved the drift without touching the remote ledger. Do not run repair.
> ⚠️ **DO NOT APPLY 006B** — see the [006B section](#006b-confirmed-not-applied--preconditions-not-met); its preconditions are **not met** and applying it now would freeze XP accrual for every user.

---

## Option A executed (2026-07-07)

The owner approved Option A and it was carried out as a **git-only rename** — no database command that writes was run at any point.

**Renames performed (`git mv`, content unchanged byte-for-byte):**

| Old local file | New local file |
| --- | --- |
| `007_billing_entitlements.sql` | `20260704003139_billing_entitlements.sql` |
| `008_tutorial_seen_persistence.sql` | `20260704140529_tutorial_seen_persistence.sql` |
| `009_hearts_gems_cancel.sql` | `20260704143549_hearts_gems_cancel.sql` |
| `006c_award_reward_idempotency_only.sql` | `20260704145636_award_reward_idempotency_only.sql` |
| `010_guard_user_stats.sql` | `20260704145648_guard_user_stats.sql` |

`006b_revoke_xp_columns.sql` was **not renamed** — it stays deliberately CLI-invisible, deferred, and unapplied. The files in `supabase/rollback/` keep their original numbered names (they are not read by the CLI).

**Post-rename verification (read-only):**

- `supabase migration list` — all ten ledger rows now pair 1:1 with local files: `001/003/004/005/006` and `20260704003139/20260704140529/20260704143549/20260704145636/20260704145648`. No unmatched row in either direction. The only skip message remaining is 006b (intentional).
- `supabase db push --dry-run` — **"Remote database is up to date."** Zero pending migrations; nothing would be applied.
- Confirmed: **no DB write occurred** — the only remote interactions were `migration list` and `db push --dry-run`, both read-only.

The historical sections below are preserved as the audit record; Option B was never executed and is no longer needed.

---

## TL;DR verdict

**This is ledger bookkeeping drift only. There is no real schema drift.**

- All five "remote-only" timestamped ledger entries dated 2026-07-04 are the local migrations **007, 008, 009, 006c, 010** — mapped by ledger `name`, by recorded SQL content, and by deployed production objects. All five mappings are **HIGH confidence**.
- Every object that migrations 001–010 (+006c) should have created **exists in production and matches the local SQL**.
- **008 IS applied** (previously unclear) — `user_stats.tutorial_seen` exists in production with the exact definition in the local file.
- **006B is confirmed NOT applied** — by ledger absence *and* by deployed grants — and must stay unapplied for now.
- Production has exactly three objects with no local SQL source, all previously known/documented (see [Live-only objects](#live-only-objects-and-the-002-gap)).

---

## 1. Current migration list (as of 2026-07-07)

`supabase migration list` output:

| Local | Remote | Time |
| --- | --- | --- |
| 001 | 001 | 001 |
| 003 | 003 | 003 |
| 004 | 004 | 004 |
| 005 | 005 | 005 |
| 006 | 006 | 006 |
| 007 | — | 007 |
| 008 | — | 008 |
| 009 | — | 009 |
| 010 | — | 010 |
| — | 20260704003139 | 2026-07-04 00:31:39 |
| — | 20260704140529 | 2026-07-04 14:05:29 |
| — | 20260704143549 | 2026-07-04 14:35:49 |
| — | 20260704145636 | 2026-07-04 14:56:36 |
| — | 20260704145648 | 2026-07-04 14:56:48 |

The CLI also prints: `Skipping migration 006b_revoke_xp_columns.sql / 006c_award_reward_idempotency_only.sql (file name must match pattern "<timestamp>_name.sql")` — letter-suffixed files are invisible to the CLI by design.

`supabase db push --dry-run` reports: *"Remote migration versions not found in local migrations directory"* and suggests `migration repair --status reverted` for the five timestamped versions. **Do not follow that suggestion blindly** — it is the generic CLI hint, not a plan (see [Repair options](#5-proposed-repair--do-not-run-yet)).

## 2. Why the drift exists (two application regimes)

The ledger was written by two different tools at different times:

1. **CLI regime (plain-number versions 001–006).** On 2026-05-26 the ledger was seeded via `supabase migration repair --status applied` for 001/003/004 and `db push` for 005 (see `docs/database-migrations-audit.md`). 006 was applied manually in the SQL Editor and then recorded via `supabase migration repair 006 --status applied` on 2026-06-23 (commit `82a0dd7`). These entries use the local filename prefixes as versions and store SQL as CLI-split statement arrays.
2. **Dashboard regime (timestamp versions 20260704…).** On 2026-07-04 the owner applied five scripts via the dashboard SQL Editor's *"apply as migration"* flow, which stamps the version with the **application timestamp** (not the filename) and stores the pasted script as a single string. The pasted names, preserved in the ledger's `name` column, are exactly the local filenames.

Evidence of the regime split: ledger 001–006 entries contain CRLF, statement-boundary splits, and (for 004) the local file's `YOUR_NOTIFICATION_WEBHOOK_SECRET_HERE` placeholder — proving they record *file content via repair*, not executed SQL. The 20260704 entries are single LF strings in exact application order (006c at 14:56:36, 010 twelve seconds later at 14:56:48).

## 3. Timestamp → local mapping (definitive)

Mapping established from three independent evidence classes: (a) the ledger `name` column, (b) normalized diff of the ledger-recorded SQL against the local file, (c) presence and definition of the deployed objects in production.

| Remote version | Ledger `name` | Local file | Content match | Deployed objects verified | Confidence |
| --- | --- | --- | --- | --- | --- |
| 20260704003139 | `007_billing_entitlements` | `007_billing_entitlements.sql` | Statement-identical (comments stripped; one cosmetic table-comment sentence differs, see §3.1) | `subscriptions` table (11 cols), RLS + `subscriptions_select_own`, SELECT-only grant to authenticated, `trg_subscriptions_touch` | **HIGH** |
| 20260704140529 | `008_tutorial_seen_persistence` | `008_tutorial_seen_persistence.sql` | Statement-identical (comments stripped) | `user_stats.tutorial_seen boolean not null default false` | **HIGH** |
| 20260704143549 | `009_hearts_gems_cancel` | `009_hearts_gems_cancel.sql` | Statement-identical (comments stripped) | `user_stats.hearts/gems/hearts_updated_at`, `subscriptions.cancel_at_period_end` | **HIGH** |
| 20260704145636 | `006c_award_reward_idempotency_only` | `006c_award_reward_idempotency_only.sql` | Byte-identical (modulo an encoding artifact in a comment) | Live `award_reward` body matches 006c line-for-line: idempotency-only, **no** `user_stats` write; EXECUTE = authenticated only | **HIGH** |
| 20260704145648 | `010_guard_user_stats` | `010_guard_user_stats.sql` | Byte-identical (modulo an encoding artifact in a comment) | `guard_user_stats()` matches local body; `trg_guard_user_stats` BEFORE INSERT/UPDATE on `user_stats` | **HIGH** |

Applied/not-applied status of every local file:

| Local file | Remote ledger entry | Applied in production? |
| --- | --- | --- |
| 001_email_exists.sql | `001` | YES (verified) |
| 003_notifications.sql | `003` | YES (verified) |
| 004_notification_scheduler.sql | `004` | YES (verified; cron job `tuk-talk-notification-tick` active) |
| 005_launch_persistence_hardening.sql | `005` | YES (verified) |
| 006_reward_events_and_rpc.sql | `006` | YES (verified; `award_reward` body since **superseded by 006c** — see §6 hazard) |
| 006b_revoke_xp_columns.sql | **none** | **NO — intentionally deferred** (verified by deployed grants) |
| 006c_award_reward_idempotency_only.sql | `20260704145636` | YES (verified) |
| 007_billing_entitlements.sql | `20260704003139` | YES (verified) |
| 008_tutorial_seen_persistence.sql | `20260704140529` | **YES (verified — previously "unclear", now settled)** |
| 009_hearts_gems_cancel.sql | `20260704143549` | YES (verified) |
| 010_guard_user_stats.sql | `20260704145648` | YES (verified) |

### 3.1 The only content differences found (all cosmetic)

- **Ledger 001–006 vs local files:** identical except trailing semicolons stripped by the CLI's statement splitter.
- **Ledger 007/008/009 vs local files:** the pasted scripts had header/inline comments stripped and statements condensed to single lines; the executable DDL is statement-for-statement identical.
- **007 table comment:** the applied `comment on table public.subscriptions` string lacks the final sentence present in the local file (*"super_until is the single truth for Super access across web/iOS/Android."*). Comment metadata only; zero schema impact. May be re-asserted in a future migration if desired.
- **006c/010 ledger entries:** contain `â€”` where the files have `—` (UTF-8 read as CP1252 at paste time). Comment-only.

## 4. Deployed-schema verification summary

Full production introspection (read-only SELECTs, 2026-07-07) reconciled in **both directions**:

- **Remote → local:** all 7 tables (RLS enabled on all), 92 columns, 22 policies, 19 indexes, 1 cron job, and 8 of 8 public functions trace to `supabase/schema.sql` (pre-CLI baseline) or a local migration — except the three live-only objects below.
- **Local → remote:** every object defined by 001–010/006c exists in production with matching definition. Deferred 006b is (correctly) absent. Nothing pending.

### Live-only objects and the "002" gap

Three production objects have **no local SQL source** — all pre-existing and documented, none created by the 2026-07-04 session:

1. `public.rls_auto_enable()` (+ its `ensure_rls` event trigger) — the RLS safety net; best candidate for the never-created "002" slot. Already flagged in `docs/database-migrations-audit.md` and `docs/database-security-remediation-plan.md` (which proposes codifying it as a reviewed `002_rls_auto_enable.sql` after owner review).
2. Trigger `mission_complete_notify` on `user_missions` — dashboard-configured Database Webhook (see `NOTIFICATIONS.md`).
3. Trigger `stats_update_notify` on `user_stats` — dashboard-configured Database Webhook (see `NOTIFICATIONS.md`). Note: these webhook trigger definitions embed the notification secret in trigger metadata; rotation is already proposed in the security remediation plan (out of scope here).

**Migration "002" never existed** — no file, no ledger row, on any machine, at any commit. Do **not** fabricate a 002 ledger row.

## 5. Proposed repair — DO NOT RUN YET

Because the mapping is fully established, two safe reconciliation options exist. **Both require owner approval. Neither has been executed.**

### Option A — RECOMMENDED: rename local files to the remote versions (no remote commands at all)

Zero production risk: the remote ledger is never touched; only git-tracked filenames change so the CLI can match them.

```cmd
REM DO NOT RUN YET - owner approval required (git-only; no database commands)
cd /d C:\Users\User\Documents\thai-fluency
git mv supabase/migrations/007_billing_entitlements.sql            supabase/migrations/20260704003139_billing_entitlements.sql
git mv supabase/migrations/008_tutorial_seen_persistence.sql       supabase/migrations/20260704140529_tutorial_seen_persistence.sql
git mv supabase/migrations/009_hearts_gems_cancel.sql              supabase/migrations/20260704143549_hearts_gems_cancel.sql
git mv supabase/migrations/006c_award_reward_idempotency_only.sql  supabase/migrations/20260704145636_award_reward_idempotency_only.sql
git mv supabase/migrations/010_guard_user_stats.sql                supabase/migrations/20260704145648_guard_user_stats.sql
REM then verify (read-only):
supabase migration list
supabase db push --dry-run   & REM expect: "Remote database is up to date"
```

Notes: string ordering keeps `001`–`006` sorting before the `20260704*` versions, so a hypothetical fresh replay still runs 006 before 006c — correct. `006b` stays deliberately CLI-invisible. Update doc references to the renamed files afterwards. Undo = `git mv` back (or revert the commit).

### Option B — alternative: repair the remote ledger to the local numbering (bookkeeping-only CLI commands)

`repair --status reverted` **deletes ledger rows**; `repair --status applied` **inserts ledger rows**. Neither executes migration SQL — but Option B mutates the production ledger and has a partial-failure window, so Option A is preferred.

```cmd
REM DO NOT RUN YET - owner approval required
REM Step 1: delete the four timestamped rows that map to CLI-parseable local files
supabase migration repair --status reverted 20260704003139 20260704140529 20260704143549 20260704145648
REM Step 2: record the plain-numbered versions as applied (run IMMEDIATELY after step 1)
supabase migration repair --status applied 007 008 009 010
REM Step 3: verify (read-only)
supabase migration list
supabase db push --dry-run
```

**Limitations and hazards of Option B:**

- `006c` cannot be normalized this way: the CLI skips `006c_*.sql`, so a plain `006c` ledger row would immediately re-create "remote row with no local file" drift. Under Option B, **keep row `20260704145636` untouched** (it will keep showing as remote-only in `migration list`) or additionally rename the 006c file as in Option A.
- **Partial-failure window:** if Step 1 succeeds and Step 2 does not, a subsequent `db push` would try to replay 007–010. Those files are individually idempotent (`if not exists` / `create or replace`), so the worst case is benign — but this is exactly why `db push` stays forbidden until `migration list` is clean.
- Verify network stability first; this machine's GitHub/remote connectivity has been intermittent.

### Undo / rollback bookkeeping for repairs

- Undo Option A: revert the rename commit. Remote ledger was never touched.
- Undo Option B Step 1: `supabase migration repair --status applied 20260704003139 20260704140529 20260704143549 20260704145648` (re-inserts rows; note re-inserted rows will not carry the original recorded SQL statements).
- Undo Option B Step 2: `supabase migration repair --status reverted 007 008 009 010`.
- SQL rollback files for the *schema* itself (unrelated to ledger bookkeeping) remain in `supabase/rollback/` (006a/006b/006c/007/009/010).

### Required owner approval steps

1. Owner reads this document, especially §6.
2. Owner picks Option A (recommended) or Option B.
3. Owner (or Claude, with the owner watching) executes the chosen option's commands **exactly as written** — nothing improvised.
4. Verify: `supabase migration list` shows every remote row matched to a local file (except, intentionally, 006b — and 20260704145636 if Option B without the 006c rename), and `supabase db push --dry-run` reports up-to-date / nothing to push.
5. Commit the file renames (Option A) and update `docs/database-migrations-audit.md` to point at this reconciliation.

## 6. Standing hazards — read before ANY future migration work

1. **Never re-execute ledger 006's recorded SQL.** It contains the *original* `award_reward` that wrote `user_stats.total_xp/today_xp`. The deployed function is the 006c idempotency-only version. Re-running 006 after 006c (e.g. by marking 006 reverted and pushing, or by giving 006c a version that sorts before 006) would silently resurrect the dual-writer XP double-count bug while `SERVER_REWARDS_ENABLED=true` is live.
2. <a id="006b-confirmed-not-applied--preconditions-not-met"></a>**006B is confirmed NOT applied and its preconditions are NOT met.** Production evidence: `authenticated` (and `anon`) still hold blanket UPDATE on `user_stats`, including `total_xp`, `today_xp`, `today_xp_date`, `last_xp_activity_at`; no 006b ledger row exists. Do **not** mark 006b applied (it would hide a real security gap as "done") and do **not** execute it: the deployed `award_reward` deliberately does **not** write `user_stats`, so revoking client XP-column UPDATE today would leave XP writable by *no* code path — every user's XP accrual would freeze and `uploadStats` would start failing with column-privilege errors. 006B stays deferred until its runbook preconditions (a server-side XP writer + verified client transition) are live.
3. **`db push` stays forbidden** until the ledger is reconciled and the owner approves. Nothing is pending — a push has nothing legitimate to do.
4. **Leave the three live-only objects out of the ledger** (`rls_auto_enable`, `mission_complete_notify`, `stats_update_notify`). A diff-driven "sync" that treats them as drift to delete would remove the RLS safety net and silently kill milestone push notifications.

## 7. Evidence provenance

All evidence gathered 2026-07-07 with **read-only SELECT introspection** against production (`supabase_migrations.schema_migrations` ledger contents incl. recorded SQL; `information_schema` columns/grants/triggers; `pg_proc` function definitions via `pg_get_functiondef`; `pg_policies`; `pg_indexes`; `cron.job`), plus `supabase migration list`, `supabase db push --dry-run`, local file diffs, git history (`f3519be` 2026-05-26 repair+push; `82a0dd7` 2026-06-23 006 repair; `de4d690`/`c4e4ab3`/`f7b9f43`/`5f7f7b7` 2026-07-04 SQL-Editor applications; `4ab9add` 2026-07-06 go-live flag flip), and `docs/database-migrations-audit.md` / `docs/migration-006-staged-rollout-runbook.md`. No write of any kind was performed against the database or its ledger.
