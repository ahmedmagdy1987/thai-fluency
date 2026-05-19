# Database Security Remediation Plan

Date: 2026-05-19

Scope: live Supabase security and migration findings for Tuk Talk Thai. This is a planning document only. Do not rotate keys, modify production data, apply migrations, or repair migration history until the owner explicitly starts that remediation step.

## Guardrails

- Do not print the current service-role key.
- Do not ask for the service-role key in chat.
- Do not write secret values into docs, migrations, scripts, issue trackers, or shell history.
- Do not commit `.env`, `.env.local`, schema dumps, or raw trigger metadata dumps.
- Do not run `supabase db push`, `supabase migration repair`, SQL `alter/drop/update/delete`, or webhook edits during planning.
- Treat database trigger definitions, schema dumps, and webhook exports as potentially secret-bearing until the webhook auth design is fixed.

## Current Findings

1. The live database has app schema in place, but it is not Supabase CLI migration-tracked.
   - The live project has no `supabase_migrations` schema.
   - Local migrations present today are `001_email_exists.sql`, `003_notifications.sql`, and `004_notification_scheduler.sql`.
   - Local migration `002` is missing.
   - The live schema appears to include the baseline, notification columns, scheduler objects, and a live-only `rls_auto_enable` event trigger, but there is no remote migration ledger proving how those changes were applied.

2. The live database webhook trigger metadata contains an inline service-role bearer token.
   - The token was not committed and is not copied here.
   - Because service-role credentials bypass row-level security and can read/write privileged data, treat the key as exposed to anyone with sufficient database metadata access.
   - The key must be rotated after notification webhook auth is redesigned and verified.

## Service-Role Risk Summary

The service-role credential is powerful enough to bypass RLS. It is appropriate inside trusted server-side runtime contexts, but it should not be embedded in database webhook trigger metadata, client code, Vercel public env vars, docs, migrations, or test commands.

Likely current or historical use points:

- Supabase Edge Function `send-notification`: uses `SUPABASE_SERVICE_ROLE_KEY` server-side to read profiles/stats and update `user_stats.last_notification_sent_at`.
- Supabase Database Webhooks:
  - `mission_complete_notify` on `public.user_missions`
  - `stats_update_notify` on `public.user_stats`
  - Current finding: these webhook trigger definitions include an inline service-role bearer token in request headers.
- Supabase Vault and `public.tick_notifications()`: migration `004_notification_scheduler.sql` stores a service-role key in Vault under `service_role_key` so pg_cron can call the Edge Function.
- Manual admin testing commands may have used service-role bearer auth.
- Vercel should not need the service-role key. Vercel should only have public client env such as Supabase URL, a publishable/anon client key, and the OneSignal app ID.
- OneSignal should not need the Supabase service-role key. OneSignal uses its own REST API key, which should live only in Supabase Edge Function secrets.

## Affected Systems Checklist

Review and update these during remediation:

- Supabase Dashboard, Project Settings, API keys:
  - Rotate/regenerate the service-role credential only after the webhook auth redesign is live.
  - If the public publishable/anon key changes as part of the rotation flow, update Vercel public env and redeploy.
- Supabase Edge Function `send-notification`:
  - Keep `SUPABASE_SERVICE_ROLE_KEY` only inside Supabase-managed function runtime.
  - Add a dedicated notification webhook secret for POST authorization.
  - Verify `ONESIGNAL_APP_ID` and `ONESIGNAL_REST_API_KEY` remain configured.
- Supabase Database Webhooks:
  - Replace service-role bearer auth with non-privileged platform auth plus a dedicated custom secret header.
  - Update both `mission_complete_notify` and `stats_update_notify`.
- Supabase Vault and pg_cron:
  - Stop using the service-role key for `tick_notifications()`.
  - Store only a public anon/publishable platform key if JWT verification remains enabled, plus the dedicated notification webhook secret.
  - Remove the obsolete `service_role_key` Vault entry after verification.
- Vercel:
  - Confirm there is no service-role key in any environment.
  - Update only public client env if the public client key changes.
- OneSignal:
  - No service-role update is expected.
  - Verify the OneSignal REST API key remains only in Supabase Edge Function secrets.

## Webhook Auth Options

### Option 1: Service-role bearer token in webhook metadata

Current pattern. It works because Edge Function JWT verification accepts the service-role bearer token and the function can execute privileged notification logic.

Do not keep this pattern.

Risks:

- The token appears in database trigger metadata.
- Schema dumps or privileged metadata queries can expose it.
- A leaked token has broad database impact, not just notification impact.
- Rotation is higher-risk because the credential is shared with other server-side Supabase use.

### Option 2: Dedicated webhook secret header

Database Webhooks send a header such as `X-Tuk-Notification-Secret`. The Edge Function validates the header before handling any POST request.

Benefits:

- The credential has a narrow purpose: invoke notification code.
- It can be rotated independently from Supabase service-role credentials.
- Leaking it does not grant direct database access.

Limitations:

- If stored directly in Dashboard webhook headers, it can still appear in trigger metadata or dumps.
- The Edge Function must validate it correctly on every POST path.
- Rotation should support a short overlap window or careful cutover.

### Option 3: Edge Function validates a custom shared secret

This is the implementation detail that makes option 2 effective. The function should reject every POST unless the shared secret matches.

Recommended behavior:

- Keep Supabase Edge Function JWT verification enabled if practical.
- Use `Authorization: Bearer <publishable_or_anon_key>` only as the platform JWT, not as the privileged credential.
- Add `X-Tuk-Notification-Secret: <dedicated_secret>` for webhooks, cron tick calls, and admin/manual send tests.
- In `send-notification`, require the secret for:
  - database webhook payloads,
  - `{ "mode": "tick" }`,
  - `{ "mode": "send" }`.
- Keep public `GET` health checks read-only and non-sensitive, or require the same secret if health status should be private.
- Optionally use two secrets later:
  - one for database webhook and cron calls,
  - one for manual/admin sends.

This keeps service-role use inside the Edge Function runtime only.

### Option 4: Move notification dispatch into a scheduled Edge Function

Instead of immediate database webhooks, a scheduled worker periodically scans an event/outbox table or computes due notifications.

Benefits:

- Removes Dashboard Database Webhook header secrets from trigger metadata.
- Centralizes auth at the scheduler/function boundary.
- Easier to retry and rate-limit with an explicit queue/outbox model.

Costs:

- Milestone notifications are no longer immediate unless a queue is written and polled frequently.
- Requires schema/code changes for an outbox or notification event ledger.
- More moving parts for the current app than a webhook-secret redesign.

### Recommendation

Use option 3 now: keep the Edge Function as the notification authority, stop putting service-role bearer tokens in webhook metadata, and require a dedicated `X-Tuk-Notification-Secret` on every POST path.

For this app, that is the safest practical next step because it preserves the current notification behavior, avoids broad service-role exposure, and requires only focused Edge Function, webhook, and cron auth changes. Revisit option 4 later if notifications need durable retries, delivery audit logs, or stricter separation from client-authored stats/mission writes.

## Safe Rotation Checklist

Do this in a controlled owner-led maintenance window after the auth redesign code is ready. Do not paste key values into chat.

1. Preflight inventory, values redacted:
   - Confirm the current function name is `send-notification`.
   - Confirm the live webhooks are `mission_complete_notify` and `stats_update_notify`.
   - Confirm the cron job is `tuk-talk-notification-tick`.
   - Confirm Vercel does not contain a service-role env var.
   - Confirm OneSignal REST API key is only in Supabase Edge Function secrets.

2. Prepare a dedicated notification secret:
   - In Supabase Dashboard, create a new Edge Function secret named `NOTIFICATION_WEBHOOK_SECRET`.
   - Generate the value in a password manager or secret manager.
   - Do not store the value in the repo or shell history.

3. Update and deploy the Edge Function in a future code change:
   - Validate `X-Tuk-Notification-Secret` for all POST requests.
   - Reject missing or invalid secrets with `401` or `403`.
   - Keep service-role database access only through the function runtime env.
   - Deploy the function only after review.

4. Update Database Webhooks manually in Supabase Dashboard:
   - For both notification webhooks, remove the service-role bearer token from the Authorization header.
   - Use non-privileged platform auth if JWT verification remains enabled:
     - `Authorization: Bearer <publishable_or_anon_key>`
   - Add:
     - `X-Tuk-Notification-Secret: <dedicated_notification_secret>`
     - `Content-Type: application/json`
   - Save both webhooks.

5. Update pg_cron and Vault manually:
   - Stop reading `service_role_key` from Vault in `tick_notifications()`.
   - Store the non-privileged platform key, if needed for Edge Function JWT verification.
   - Store the dedicated notification webhook secret.
   - Update `tick_notifications()` so the `net.http_post` call sends the non-privileged Authorization header plus `X-Tuk-Notification-Secret`.
   - Keep the old Vault `service_role_key` only until the new flow is verified, then remove it.

6. Verify the redesigned auth before rotating the service-role key:
   - Edge Function health check returns configured.
   - Manual notification test works for a disposable subscribed owner account.
   - Mission completion webhook test works.
   - Stats milestone webhook test works.
   - Cron tick test works or the next scheduled tick succeeds.
   - Function logs show no webhook `401` or `403` for valid webhook/cron calls.

7. Rotate the service-role credential in Supabase Dashboard:
   - Use Project Settings and the current Supabase key rotation UI.
   - If the UI rotates public client keys too, update Vercel public client env and redeploy.
   - Do not paste the new service-role value into docs, chat, migrations, or Vercel.
   - Confirm the Edge Function runtime sees the rotated service-role credential through Supabase-managed env. Redeploy or restart the function if the dashboard requires it.

8. Post-rotation cleanup:
   - Confirm no Database Webhook uses service-role bearer auth.
   - Confirm `tick_notifications()` no longer uses a service-role bearer token.
   - Remove obsolete service-role material from Vault.
   - Confirm no service-role key exists in Vercel.
   - Keep the old key invalidated. Do not reintroduce it for testing.

## Verification Checklist After Rotation

- App loads in production.
- Sign-in still works.
- A subscribed test user can receive a manual notification through the secured function.
- Mission completion sends one milestone notification.
- Stage or XP milestone sends one milestone notification.
- Hourly scheduler still calls the function successfully.
- Edge Function logs show successful OneSignal API responses.
- Edge Function logs do not print secret header values.
- Database webhook metadata no longer contains a service-role bearer token.
- Vercel env has no service-role key.
- Repo scan prints only filenames, not secret values.

## Rollback Considerations

Before service-role rotation:

- If the new function auth rejects valid webhooks, restore the previous function deployment or temporarily allow the old auth path while updating webhook headers.
- If webhook edits are wrong, disable the two notification webhooks temporarily. Core app usage continues; milestone notifications pause.
- If cron calls fail, disable or unschedule the notification cron temporarily. Daily reminders pause.

After service-role rotation:

- The old key should be invalid and must not be used for rollback.
- If the Edge Function loses database access, verify Supabase-managed `SUPABASE_SERVICE_ROLE_KEY` injection and redeploy/restart the function if required.
- If production client auth breaks because public client keys changed, update Vercel public env and redeploy.
- If notification delivery must be restored immediately, the owner may temporarily use the newly rotated service-role bearer token in webhook headers for a short emergency window, but this reintroduces the original risk and must be removed as soon as the custom-secret path is fixed.

## Migration Reconciliation Plan

Goal: preserve the current production schema exactly, create a trustworthy local migration history, and avoid destructive changes.

### Principles

- Do not run `supabase db push --linked` against production during reconciliation.
- Do not apply local migrations `001`, `003`, or `004` to production. The live schema already appears to include their effects.
- Do not run raw schema dumps into committed paths.
- Treat raw dumps as secret-bearing until reviewed and redacted.
- Review every generated SQL file for `drop`, `alter ... drop`, `truncate`, secret-bearing headers, Vault values, and webhook metadata before committing.
- Prefer a staging Supabase project for replaying the final migration set before touching live migration history.

### Baseline Snapshot

Recommended future sequence:

1. First remove service-role tokens from webhook metadata as described above.
2. Create a local ignored work directory for raw schema artifacts.
3. Dump the live schema into that ignored directory.
4. Scan the dump for secret-looking material.
5. Redact or omit any webhook trigger definitions that contain credentials.
6. Convert the sanitized schema into a baseline migration only after owner review.

Important: even after switching to a dedicated webhook secret, a raw dump may include that secret if it is stored directly in webhook metadata. The committed baseline should either omit dashboard-managed webhook triggers and document them separately, or include placeholders only.

### Missing Migration 002

Do not invent migration `002` without review.

Preferred handling:

1. Search old backups, previous machine state, and GitHub history for the real `002` file.
2. If found, restore the exact file and review it against live schema.
3. If not found, treat the live-only `public.rls_auto_enable()` function and `ensure_rls` event trigger as the candidate missing change.
4. Decide whether to keep that live-only behavior:
   - If yes, include it in the sanitized baseline or recreate a reviewed `002_rls_auto_enable.sql`.
   - If no, create a future explicit migration to remove it after staging verification.
5. If a placeholder `002` is created only to preserve numbering, it must explain why the original migration was unavailable and must not hide live schema drift.

### Recommended Reconciliation Strategy

Use a new sanitized live baseline as the source of truth, then mark it applied on live after verification.

Future owner-approved steps:

1. Create a sanitized baseline migration from live schema after webhook auth is fixed.
2. Move historical manual migrations out of the active migration path or convert them into legacy documentation so Supabase CLI does not try to apply them after the baseline.
3. Include or document the missing `002` live-only object explicitly.
4. Replay the active migration set on a fresh local or staging database.
5. Compare staging schema to production schema.
6. Only after the schemas match, repair the live migration ledger to mark the baseline as applied.
7. Create all future schema changes with `supabase migration new <name>` and apply through the reviewed migration workflow.

This avoids pushing old, partially overlapping migrations into production and gives the repo one clean starting point.

### Future Migration Workflow

- Create migrations with:

```powershell
supabase.cmd migration new <descriptive_name>
```

- Test locally or in staging first.
- Review generated SQL manually.
- Keep secret values out of SQL files.
- Avoid Dashboard-only schema changes unless they are documented and then backfilled into migrations.
- Before production deploy, run a read-only migration status check:

```powershell
supabase.cmd migration list --linked
```

- Apply to production only in an owner-approved release window.

## Commands Safe To Run Now

These commands are read-only or local-only and should not print secret values.

```powershell
git status --short --branch
```

```powershell
git check-ignore -v .env.local
```

```powershell
supabase.cmd --version
```

```powershell
supabase.cmd migration list --linked
```

Filename-only secret-surface scan. This prints matching filenames, not matching lines:

```powershell
rg -l --hidden --glob '!node_modules/**' --glob '!dist/**' --glob '!.git/**' --glob '!.env*' "service_role|SUPABASE_SERVICE_ROLE_KEY|ONESIGNAL_REST_API_KEY|Bearer " .
```

Local app build:

```powershell
npm.cmd run build
```

## Commands For Later, Not For This Planning Pass

Do not run these until the owner explicitly starts remediation.

Create an ignored raw snapshot directory:

```powershell
New-Item -ItemType Directory -Force .tmp\supabase-baseline
```

Dump schema after webhook auth has been fixed and secret-bearing metadata has been accounted for:

```powershell
supabase.cmd db dump --linked --schema public --file .tmp\supabase-baseline\live-public-schema.raw.sql
```

Scan raw artifacts by filename only:

```powershell
rg -l "Bearer |service_role|SUPABASE_SERVICE_ROLE_KEY|ONESIGNAL_REST_API_KEY|eyJ" .tmp\supabase-baseline
```

Create a future baseline migration:

```powershell
supabase.cmd migration new live_schema_baseline
```

Repair live migration history only after a reviewed baseline exists and staging comparison passes:

```powershell
supabase.cmd migration repair --linked --status applied <baseline_version>
```

Re-check remote tracking:

```powershell
supabase.cmd migration list --linked
```

## Owner Manual Steps

1. In Supabase Dashboard, create a dedicated `NOTIFICATION_WEBHOOK_SECRET` for `send-notification`.
2. Approve a code change that validates `X-Tuk-Notification-Secret` on all POST requests.
3. Deploy the updated `send-notification` Edge Function.
4. In Supabase Database Webhooks, update `mission_complete_notify` and `stats_update_notify`:
   - remove service-role bearer auth,
   - use non-privileged platform auth if JWT verification remains enabled,
   - add the dedicated notification secret header.
5. Update `tick_notifications()` and Vault so the cron path no longer uses service-role bearer auth.
6. Verify notifications end to end.
7. Rotate the service-role credential in Supabase.
8. Update Vercel only if the public client key changed.
9. Verify Edge Function database access after rotation.
10. Remove obsolete service-role material from Vault.
11. Generate and review a sanitized live baseline.
12. Choose the migration reconciliation strategy and repair migration tracking only after staging verification.

## Final Acceptance Checklist

- No current or rotated service-role key appears in the repo.
- No `.env` file is committed.
- No raw schema dump is committed.
- Database Webhooks no longer store service-role bearer auth.
- Edge Function validates a dedicated notification secret for every POST.
- Cron notification tick no longer uses service-role bearer auth.
- Service-role key is rotated after the redesigned auth path is verified.
- Vercel contains no service-role key.
- OneSignal REST API key remains only in Supabase Edge Function secrets.
- Live migration tracking is reconciled from a reviewed baseline, not by blindly pushing old migrations.
- Future migrations are created, reviewed, staged, and tracked through Supabase CLI.
