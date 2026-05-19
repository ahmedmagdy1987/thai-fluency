# Database, migrations, RLS, and persistence audit

Date: 2026-05-19

Scope: local repo audit plus live Supabase metadata audit. No migrations were applied. No schema was changed. No production data was modified.

Live database status: audited read-only through Supabase CLI 2.100.0 using the linked project `fkebzcywofzloaqeghtn` (`tuk-talk-thai`). `supabase db dump` could not be used because Docker is not running on this machine, so live inspection used `supabase db query --linked` against catalog metadata only. No table data was queried except cron job metadata.

Important secret-handling note: live database webhook trigger definitions contain an inline service-role bearer token in the trigger metadata. The value is intentionally not copied into this report. Rotate the service-role key and reconfigure the webhooks with a safer secret pattern before wider access to schema dumps or metadata.

## Sources reviewed

- `supabase/schema.sql`
- `supabase/migrations/001_email_exists.sql`
- `supabase/migrations/003_notifications.sql`
- `supabase/migrations/004_notification_scheduler.sql`
- `supabase/functions/send-notification/index.ts`
- `src/lib/supabase.js`
- `src/lib/storage.js`
- `src/lib/cloudStorage.js`
- `src/lib/stats.js`
- `src/App.jsx`
- `src/components/profile/NotificationSettings.jsx`
- `src/components/SettingsModal.jsx`
- `src/components/ShopScreen.jsx`
- `src/components/QuestsScreen.jsx`
- `src/components/MiniUnitFlow.jsx`
- Roadmap and prior audit docs under `docs/`, plus `NOTIFICATIONS.md`, `SUPABASE_SETUP_PLAN.md`, `DATA_ISOLATION_AUDIT.md`, and `SECURITY_AUDIT_REPORT.md`

## Local migrations found

| File | Role | Status from repo |
| --- | --- | --- |
| `supabase/schema.sql` | Baseline manual schema. Creates core app tables, RLS policies, signup trigger, updated_at triggers, and `email_exists`. | Present. This is not a numbered migration. |
| `supabase/migrations/001_email_exists.sql` | Creates/replaces `public.email_exists(check_email text)` and grants execute to `anon` and `authenticated`. | Present. Duplicates the function already present in `schema.sql`. |
| `supabase/migrations/002_*.sql` | Unknown locally. Live DB contains an untracked `public.rls_auto_enable()` function plus `ensure_rls` event trigger that are not in local migrations. | Missing locally and not present in remote CLI migration history. This is the best live candidate for the missing 002 change, but it cannot be proven because the remote has no `supabase_migrations` history table. |
| `supabase/migrations/003_notifications.sql` | Adds notification columns/indexes to `profiles` and `user_stats`. | Present. Required by current OneSignal code. |
| `supabase/migrations/004_notification_scheduler.sql` | Enables `pg_net` and `pg_cron`, stores a service role key in Vault, creates `public.tick_notifications()`, and schedules hourly notification ticks. | Present. Contains the placeholder `YOUR_SERVICE_ROLE_KEY_HERE`; do not commit a real service role key. |

## Live migration history

Linked project verification:

- Project ref: `fkebzcywofzloaqeghtn`
- Project name: `tuk-talk-thai`
- Supabase CLI: `2.100.0`

Remote migration comparison:

```text
Local | Remote | Time (UTC)
------+--------+-----------
001   |        | 001
003   |        | 003
004   |        | 004
```

The live database does not have a `supabase_migrations` schema. A direct read of `supabase_migrations.schema_migrations` fails because the relation does not exist. Therefore:

- No CLI-tracked remote migration history exists.
- Remote migration `002` cannot be confirmed as an applied migration.
- Local migrations `001`, `003`, and `004` also do not appear as CLI-tracked remote migrations.
- The live schema clearly includes the effects of the local baseline, 003, and 004, so those changes were applied manually or by dashboard tooling outside Supabase CLI migration tracking.

### Missing 002 reconstruction note

This is documentation only. Do not apply automatically.

The only live object found in `public` that looks migration-like and is not represented in local migration files is:

- Function: `public.rls_auto_enable()`
- Event trigger: `ensure_rls` on `ddl_command_end`

Observed behavior: when new tables are created in the `public` schema, the event trigger calls `public.rls_auto_enable()` and attempts to run `alter table if exists <created table> enable row level security`.

Reconstruction note:

```sql
-- Reconstruction note only. Do not run without owner review.
-- Live-only object not present in local migrations.
create or replace function public.rls_auto_enable()
returns event_trigger
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  cmd record;
begin
  for cmd in
    select *
    from pg_event_trigger_ddl_commands()
    where command_tag in ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      and object_type in ('table', 'partitioned table')
  loop
    if cmd.schema_name is not null
       and cmd.schema_name in ('public')
       and cmd.schema_name not in ('pg_catalog', 'information_schema')
       and cmd.schema_name not like 'pg_toast%'
       and cmd.schema_name not like 'pg_temp%' then
      begin
        execute format('alter table if exists %s enable row level security', cmd.object_identity);
      exception
        when others then
          raise log 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      end;
    end if;
  end loop;
end;
$$;

create event trigger ensure_rls
on ddl_command_end
execute function public.rls_auto_enable();
```

## Tables and columns found

Live public tables found:

- `profiles`
- `user_achievements`
- `user_missions`
- `user_progress`
- `user_stats`

No extra public app tables were found during the live catalog audit. Live columns match the local baseline plus notification migration 003. Live constraints include the expected primary keys, foreign keys to `auth.users`, unique constraints, `profiles_selected_voice_check`, and `user_stats_typical_study_hour_check`.

### `public.profiles`

Purpose: one profile row per Supabase Auth user.

Columns from `schema.sql`:

- `id uuid primary key references auth.users(id) on delete cascade`
- `email text`
- `display_name text`
- `onboarding_completed boolean default false`
- `selected_voice text default 'male' check (selected_voice in ('male', 'female'))`
- `settings jsonb default '{}'::jsonb`
- `created_at timestamptz default now()`
- `updated_at timestamptz default now()`

Columns added by migration 003:

- `onesignal_player_id text`
- `notification_preferences jsonb default {"daily_reminder":true,"streak_warning":true,"milestone":true,"new_content":true,"re_engagement":true}`
- `timezone text`

Indexes:

- `idx_profiles_onesignal` on `onesignal_player_id` where not null

App usage:

- Read in `App.jsx` for profile, onboarding, notification, and settings state.
- Updated in `SignUp.jsx`, `ProfilePage.jsx`, `App.jsx`, `NotificationSettings.jsx`, and `cloudStorage.updateProfile`.
- Used by Edge Function to find `onesignal_player_id`, `notification_preferences`, and timezone.

### `public.user_stats`

Purpose: one aggregate stats row per user.

Columns from `schema.sql`:

- `id uuid primary key default gen_random_uuid()`
- `user_id uuid unique not null references auth.users(id) on delete cascade`
- `total_xp integer default 0`
- `current_streak integer default 0`
- `longest_streak integer default 0`
- `last_active_date date`
- `cards_seen integer default 0`
- `cards_mastered integer default 0`
- `current_stage integer default 1`
- `started_stage integer default 1`
- `total_reviews integer default 0`
- `daily_goal integer default 50`
- `daily_goals_hit integer default 0`
- `tones_quiz_passed boolean default false`
- `tones_quiz_best integer default 0`
- `quizzes_passed integer default 0`
- `perfect_quizzes integer default 0`
- `streak_freezes integer default 1`
- `last_freeze_grant timestamptz`
- `last_seen_mission integer default 1`
- `stage1_celebration_shown boolean default false`
- `dialogues_completed jsonb default '[]'::jsonb`
- `known_card_ids jsonb default '[]'::jsonb`
- `created_at timestamptz default now()`
- `updated_at timestamptz default now()`

Columns added by migration 003:

- `typical_study_hour integer default 19 check (typical_study_hour between 0 and 23)`
- `last_notification_sent_at timestamptz`

Indexes:

- `idx_user_stats_last_active` on `last_active_date`

App usage:

- `cloudStorage.uploadStats` writes most aggregate learning/gamification fields.
- `cloudStorage.downloadStats` reads those fields back.
- Edge Function reads `last_active_date`, `current_streak`, `typical_study_hour`, and `last_notification_sent_at`; it updates `last_notification_sent_at`.
- Code intentionally does not write `cards_seen` or `cards_mastered`; local comments say they can be computed from `user_progress`.

### `public.user_progress`

Purpose: per-card SRS state for each user.

Columns:

- `id uuid primary key default gen_random_uuid()`
- `user_id uuid not null references auth.users(id) on delete cascade`
- `card_id integer not null`
- `ease real not null default 2.5`
- `interval integer not null default 0`
- `reps integer not null default 0`
- `lapses integer not null default 0`
- `learning boolean not null default false`
- `next_review timestamptz not null`
- `last_review timestamptz`
- `created_at timestamptz default now()`
- `updated_at timestamptz default now()`
- unique `(user_id, card_id)`

Indexes:

- `idx_user_progress_user(user_id)`
- `idx_user_progress_due(user_id, next_review)`

App usage:

- `cloudStorage.uploadProgress` upserts SRS rows.
- `cloudStorage.downloadProgress` restores SRS state.

### `public.user_missions`

Purpose: explicit mission completion events.

Columns:

- `id uuid primary key default gen_random_uuid()`
- `user_id uuid not null references auth.users(id) on delete cascade`
- `stage integer not null`
- `mission integer not null`
- `completed boolean not null default false`
- `completed_at timestamptz`
- `created_at timestamptz default now()`
- unique `(user_id, stage, mission)`

Indexes:

- `idx_user_missions_user(user_id)`

App usage:

- `App.jsx` upserts Stage 1 mission completion rows when a mission advances.
- Edge Function treats completed mission rows as milestone notification events.

### `public.user_achievements`

Purpose: unlocked achievement IDs per user.

Columns:

- `id uuid primary key default gen_random_uuid()`
- `user_id uuid not null references auth.users(id) on delete cascade`
- `achievement_id text not null`
- `unlocked_at timestamptz default now()`
- unique `(user_id, achievement_id)`

Indexes:

- `idx_user_achievements_user(user_id)`

App usage:

- `cloudStorage.uploadAchievements` upserts IDs from `stats.unlockedAchievements`.
- `cloudStorage.downloadAchievements` restores achievement IDs.

## Local RLS and policy audit

From `supabase/schema.sql`, RLS is enabled on all five public app tables. Each table has select, insert, update, and delete policies scoped to the authenticated user's row.

| Table | SELECT | INSERT | UPDATE | DELETE | Ownership predicate |
| --- | --- | --- | --- | --- | --- |
| `profiles` | Present | Present | Present | Present | `auth.uid() = id` |
| `user_stats` | Present | Present | Present | Present | `auth.uid() = user_id` |
| `user_progress` | Present | Present | Present | Present | `auth.uid() = user_id` |
| `user_missions` | Present | Present | Present | Present | `auth.uid() = user_id` |
| `user_achievements` | Present | Present | Present | Present | `auth.uid() = user_id` |

Local findings:

- No public table read policies were found in local migrations.
- No cross-user broad table policy was found in local migrations.
- All app state tables allow users to delete their own rows. That is not cross-user exposure, but it is broader than the current UI needs.
- Update policies are written with `USING` ownership predicates. Add explicit `WITH CHECK (auth.uid() = user_id)` or `WITH CHECK (auth.uid() = id)` in a future RLS hardening migration for clarity and defense in depth.
- `email_exists` is `SECURITY DEFINER` and grants execution to `anon` and `authenticated`. It intentionally bypasses profile RLS to return a boolean. This improves sign-in UX but creates an email-enumeration surface.
- Users can write their own stats/progress/mission rows from the client. RLS prevents cross-user writes, but it does not prove the learning event is legitimate. This matters for XP, streaks, milestones, notification triggers, future leaderboards, and rewards.

Live RLS status: verified through `pg_class` and `pg_policies`.

| Table | Live RLS | Live policies | Live policy predicates |
| --- | --- | --- | --- |
| `profiles` | Enabled | SELECT, INSERT, UPDATE, DELETE | Own-row policies using `auth.uid() = id`; INSERT has `WITH CHECK`; UPDATE does not show a separate `WITH CHECK`. |
| `user_stats` | Enabled | SELECT, INSERT, UPDATE, DELETE | Own-row policies using `auth.uid() = user_id`; INSERT has `WITH CHECK`; UPDATE does not show a separate `WITH CHECK`. |
| `user_progress` | Enabled | SELECT, INSERT, UPDATE, DELETE | Own-row policies using `auth.uid() = user_id`; INSERT has `WITH CHECK`; UPDATE does not show a separate `WITH CHECK`. |
| `user_missions` | Enabled | SELECT, INSERT, UPDATE, DELETE | Own-row policies using `auth.uid() = user_id`; INSERT has `WITH CHECK`; UPDATE does not show a separate `WITH CHECK`. |
| `user_achievements` | Enabled | SELECT, INSERT, UPDATE, DELETE | Own-row policies using `auth.uid() = user_id`; INSERT has `WITH CHECK`; UPDATE does not show a separate `WITH CHECK`. |

Live RLS behavior was not tested with two real user sessions; this audit confirms catalog state, not runtime cross-user query attempts.

## Functions, triggers, extensions, cron, webhooks, and Edge Functions

### Database functions

| Function | Source | Purpose | Security notes |
| --- | --- | --- | --- |
| `public.handle_new_user()` | `supabase/schema.sql` | After Auth signup, inserts matching `profiles` and `user_stats` rows. | `SECURITY DEFINER`, `search_path = public`. |
| `public.set_updated_at()` | `supabase/schema.sql` | Updates `updated_at` on table updates. | Normal trigger function. |
| `public.email_exists(check_email text)` | `schema.sql`, `001_email_exists.sql` | Boolean lookup for sign-in UX. | `SECURITY DEFINER`, executable by `anon` and `authenticated`; email enumeration risk. |
| `public.tick_notifications()` | `004_notification_scheduler.sql` | Posts `{ "mode": "tick" }` to the notification Edge Function. | `SECURITY DEFINER`; depends on Vault secret `service_role_key`, `pg_net`, and Edge Function availability. |
| `public.rls_auto_enable()` | Live DB only | Event trigger helper that enables RLS on newly created `public` tables. | `SECURITY DEFINER`, `search_path = pg_catalog`; missing from local migration files. |

Live function status:

- All four local functions exist remotely.
- `public.rls_auto_enable()` also exists remotely and is not represented locally.
- `public.tick_notifications()` exists remotely.

### Triggers

| Trigger | Table | Function | Purpose |
| --- | --- | --- | --- |
| `on_auth_user_created` | `auth.users` | `public.handle_new_user()` | Auto-provision profile and stats row after signup. |
| `set_profiles_updated_at` | `public.profiles` | `public.set_updated_at()` | Maintain `profiles.updated_at`. |
| `set_user_stats_updated_at` | `public.user_stats` | `public.set_updated_at()` | Maintain `user_stats.updated_at`. |
| `set_user_progress_updated_at` | `public.user_progress` | `public.set_updated_at()` | Maintain `user_progress.updated_at`. |
| `mission_complete_notify` | `public.user_missions` | `supabase_functions.http_request(...)` | Dashboard webhook trigger for mission milestone notifications. |
| `stats_update_notify` | `public.user_stats` | `supabase_functions.http_request(...)` | Dashboard webhook trigger for stats milestone notifications. |

Live trigger status:

- `on_auth_user_created` exists and is enabled.
- `set_profiles_updated_at`, `set_user_stats_updated_at`, and `set_user_progress_updated_at` exist and are enabled.
- `mission_complete_notify` and `stats_update_notify` exist and are enabled.
- No `set_user_missions_updated_at` or `set_user_achievements_updated_at` trigger exists locally or remotely.
- The live webhook trigger definitions include an inline service-role bearer token in their `Authorization` header. This report redacts the value. Treat that token as exposed to anyone with enough database metadata visibility.

Live event triggers:

- `ensure_rls` calls `public.rls_auto_enable()` on `ddl_command_end`.
- Supabase-managed event triggers also exist for PostgREST, pg_net, pg_cron, and pg_graphql access maintenance.

### Extensions and cron

Migration 004 enables:

- `pg_net`
- `pg_cron`

Cron job:

- `tuk-talk-notification-tick`
- Schedule: `5 * * * *`
- SQL: `select public.tick_notifications();`

Live status:

- `pg_cron` is installed.
- `pg_net` is installed.
- `supabase_vault` is installed.
- Cron job `tuk-talk-notification-tick` exists, is active, runs as `postgres`, and executes `select public.tick_notifications();`.

### Database webhooks

`NOTIFICATIONS.md` documents dashboard-configured webhooks, not SQL migrations:

- `mission_complete_notify`: table `user_missions`, insert/update, sends to `send-notification`.
- `stats_update_notify`: table `user_stats`, update, sends to `send-notification`.

These cannot be verified from the repo alone. Supabase dashboard access or live metadata access is required.

Live status:

- `mission_complete_notify` exists as an enabled trigger on `public.user_missions` for insert/update.
- `stats_update_notify` exists as an enabled trigger on `public.user_stats` for update.
- Both call the deployed `send-notification` Edge Function URL.
- Both trigger definitions contain an inline service-role bearer token. Do not copy this token into files or logs; rotate it and reconfigure the webhook authentication.

### Edge Function

`supabase/functions/send-notification/index.ts` uses:

- `ONESIGNAL_APP_ID`
- `ONESIGNAL_REST_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Modes:

- Database webhook payloads for mission/stats milestones.
- Manual `{ "mode": "send" }`.
- Scheduled `{ "mode": "tick" }`.

The function reads profiles/stats using a service-role Supabase client, checks notification preferences, posts to OneSignal, and updates `user_stats.last_notification_sent_at`.

## Local app persistence audit

`localStorage['thai-fluency-state-v1']` remains the offline-first store for `{ progress, stats }`. Signed-in, confirmed users sync selected fields to Supabase. Demo mode uses separate localStorage keys and is not cloud synced.

| Feature | Current storage | Cloud synced | Notes |
| --- | --- | --- | --- |
| Auth account | Supabase Auth | Yes | Supabase handles sessions and password auth. |
| Email | Supabase Auth, copied to `profiles.email` at signup | Partly | Profile email can become stale if Auth email changes. |
| Display name | `profiles.display_name` plus auth metadata | Yes | Avatar is not implemented. |
| Password | Supabase Auth | Yes | No app table stores passwords. |
| Onboarding completed | `profiles.onboarding_completed`, local `stats.hasOnboarded` | Yes | Set after placement onboarding. |
| Selected voice from onboarding | `profiles.selected_voice`, local `stats.voice` | Partly | Later Settings voice changes update local stats only. |
| Theme | local `stats.theme` | No | Privacy copy says theme is collected, but `CLOUD_PROFILE_SETTING_KEYS` excludes it. |
| View/learning mode | `profiles.settings.viewMode`, local stats | Yes | Included in profile settings sync. |
| Pronunciation speed | `profiles.settings.audioRate`, local stats | Yes | Included in profile settings sync. |
| Auto-play setting | `profiles.settings.audioAutoPlay`, local stats | Yes | Included in profile settings sync. |
| Sound effects | `profiles.settings.soundEffects`, local stats | Yes | Included in profile settings sync. |
| Show characters | `profiles.settings.showCharacters`, local stats | Yes | Included in profile settings sync. |
| Daily XP goal | `user_stats.daily_goal`, local stats | Yes | Uploaded through periodic stats sync. |
| Today XP | local `stats.todayXp` and `stats.todayDate` | No | Quests use this locally; not restored cross-device. |
| XP total | `user_stats.total_xp`, local stats | Yes | Client-authored. |
| Streak | `user_stats.current_streak`, `longest_streak`, `last_active_date` | Yes | Client-authored. |
| Current stage | `user_stats.current_stage` | Yes | Client-authored from local stage state. |
| Started stage | `user_stats.started_stage` | Yes | Set by onboarding and synced. |
| Known/placement cards | `user_stats.known_card_ids` | Yes | JSON array. |
| Dialogues completed | `user_stats.dialogues_completed` | Yes | JSON array. |
| SRS progress | `user_progress` | Yes | Per-card ease/interval/reps/lapses/learning/next review. |
| Due cards | Derived from local/Supabase SRS progress | Yes | No separate due table. |
| Seen/mastered cards | Derived locally; `cards_seen`/`cards_mastered` columns exist | Partly | Columns exist but upload/download currently ignore them. |
| Mission progress | `user_stats.last_seen_mission`; `user_missions` for Stage 1 completions | Partly | Full multi-stage mission history is not modeled. |
| Quests | Derived locally from stats/dashboard state | No dedicated table | Rewards/chests are preview only. |
| Achievements | `user_achievements`; local `stats.unlockedAchievements` | Yes | Stores achievement IDs only. |
| Tones quiz | `user_stats.tones_quiz_passed`, `tones_quiz_best` | Yes | Aggregate only. |
| Challenge results | `user_stats.quizzes_passed`, `perfect_quizzes` | Partly | No per-attempt history or question history. |
| Mini-unit progress | React session state only | No | Pilot keeps SRS untouched and records no completion state. |
| Drag-and-drop progress | Not implemented | No | Planned/deferred in learning-flow docs. |
| OneSignal player/subscription ID | `profiles.onesignal_player_id` | Yes | One value per profile; multi-device semantics may overwrite. |
| Timezone | `profiles.timezone` | Yes | Set during OneSignal linking. |
| Notification preferences | `profiles.notification_preferences` | Yes | Five booleans. |
| Typical study hour | `user_stats.typical_study_hour` | No client writer found | Defaults to 19; no current code computes it. |
| Last notification sent | `user_stats.last_notification_sent_at` | Server only | Edge Function updates it. |
| Gems | Placeholder values in UI | No | `stats.gems ?? 0`; no schema. |
| Hearts | Placeholder values in UI | No | `stats.hearts ?? 5`; no schema. |
| Energy | Not implemented | No | No schema or state field found. |
| Shop purchases | Placeholder UI only | No | Buttons disabled. |
| Inventory | Not implemented | No | No schema. |
| Streak freeze count | `user_stats.streak_freezes`, `last_freeze_grant` | Yes | Client-authored. |
| Character unlocks | Static/stage-derived UI only | No | No user unlock table. |
| Selected character | Not implemented | No | No schema. |
| Subscription/paid plan | Not implemented | No | No schema. |
| Ads removal | Not implemented | No | No schema. |
| Paid card packs | Not implemented | No | No schema. |
| Voice recognition attempts | Not implemented | No | Pronunciation content exists, but no attempt tracking. |

Machine-readable details are in `docs/database-persistence-matrix.json`.

## Local vs live database status

Live schema was verified read-only through catalog queries.

Local/remote comparison:

| Area | Live status | Local status | Result |
| --- | --- | --- | --- |
| Project link | `fkebzcywofzloaqeghtn` (`tuk-talk-thai`) | `supabase/.temp/project-ref` points to same ref | Match. |
| CLI migration history | No `supabase_migrations` schema exists. `supabase migration list --linked` shows local `001`, `003`, `004` with blank remote entries. | Local migrations are `001`, `003`, `004`. | Mismatch: remote changes are untracked/manual. |
| Migration 002 | No remote migration history entry exists for `002`. | No local `002` file exists. | Cannot confirm as a migration. Live-only `rls_auto_enable`/`ensure_rls` are the likely missing change. |
| Core app tables | `profiles`, `user_stats`, `user_progress`, `user_missions`, `user_achievements` exist. | Defined in `schema.sql`. | Match. |
| Migration 003 columns | Notification columns exist on `profiles` and `user_stats`. | Defined in `003_notifications.sql`. | Match. |
| Migration 004 function/cron | `pg_net`, `pg_cron`, `tick_notifications()`, and active cron job exist. | Defined in `004_notification_scheduler.sql`. | Match, except actual Vault secret value was not read. |
| Dashboard webhooks | `mission_complete_notify` and `stats_update_notify` exist as enabled triggers. | Documented in `NOTIFICATIONS.md`; not in migrations. | Live-only/dashboard-managed. |
| RLS policies | RLS enabled and own-row policies exist for all five app tables. | Defined in `schema.sql`. | Match. |
| Live-only public function/event trigger | `public.rls_auto_enable()` and `ensure_rls` exist. | Not present locally. | Mismatch; add a migration note/file if owner wants local schema parity. |

The live schema supports the current app's production persistence needs, but migration tracking is not reliable because the remote migration ledger is absent. Future work should start by deciding whether to baseline the current live schema into a tracked migration history.

## Security and RLS concerns

Top concerns from this audit:

1. Live webhook trigger metadata contains an inline service-role bearer token.
   - `mission_complete_notify` and `stats_update_notify` call `supabase_functions.http_request(...)` with an inline `Authorization: Bearer ...` header.
   - The token is not copied into this report, but it was visible through database trigger metadata.
   - Rotate the service-role key, then reconfigure notification webhook auth so a full service-role JWT is not embedded in schema metadata.

2. Remote migration history is absent.
   - The live database has no `supabase_migrations` schema.
   - `supabase migration list --linked` reports local migrations but no remote versions.
   - This makes migration drift harder to audit and explains why a supposed migration `002` cannot be confirmed from the remote ledger.

3. Client-authored progress and rewards are not server-validated.
   - Current RLS protects user isolation, not data integrity.
   - A signed-in user can fabricate their own XP, streak, progress, mission completion, and achievement state by changing local state or direct REST calls.
   - This becomes launch-critical before leaderboards, rewards, paid unlocks, public rankings, or competitive streaks.

4. Mission and stats writes can trigger notifications.
   - `user_missions` and `user_stats` are client-writable for own rows.
   - Webhooks may send milestone notifications from fabricated own-row updates.
   - This is not cross-user data exposure, but it is notification abuse/noise risk.

5. `email_exists` is an intentional account-enumeration surface.
   - It returns only a boolean and not row data, but anonymous callers can test whether an email has a profile.
   - Consider rate limiting, CAPTCHA after repeated failures, or removing the RPC if the UX tradeoff changes.

6. Profile `settings` JSON has no documented shape or database-level validation.
   - Current app expects `viewMode`, `audioRate`, `audioAutoPlay`, `showCharacters`, and `soundEffects`.
   - Theme and post-onboarding voice changes are local-only despite being user preferences.
   - Future settings growth may make the JSON blob hard to reason about.

7. Notification player ID is stored as a single profile value.
   - If OneSignal returns different subscription IDs across devices/browsers, the latest write can overwrite the prior device.
   - If multi-device push matters, use a `user_push_subscriptions` table later.

8. `profiles.email` can become stale.
   - Signup trigger copies `auth.users.email` once.
   - No trigger or client sync was found for later email changes.

9. Own-row DELETE policies exist on all app tables.
   - This is not cross-user access.
   - If accidental client deletes are a concern, narrow delete policies to controlled account deletion flows later.

## Missing schema by roadmap phase

### Phase A: User preferences hardening

Recommended before soft launch:

| Proposed structure | Purpose | Key columns | User relationship | RLS | Timing |
| --- | --- | --- | --- | --- | --- |
| Documented `profiles.settings` JSON shape | Keep current JSON approach but make allowed keys explicit. | `viewMode`, `theme`, `voice`, `audioRate`, `audioAutoPlay`, `showCharacters`, `soundEffects` | `profiles.id = auth.uid()` | Existing profile owner policy plus optional app validation. | Needed before launch if cross-device preferences are part of launch quality. |
| Optional `user_preferences` table | Normalize settings if `profiles.settings` grows too broad. | `user_id`, `theme`, `voice`, `view_mode`, `audio_rate`, `audio_auto_play`, `sound_effects`, `show_characters`, `updated_at` | One row per user. | Owner select/insert/update/delete by `auth.uid() = user_id`. | Can wait unless settings need analytics, validation, or frequent writes. |
| Optional `user_push_subscriptions` table | Support multiple browsers/devices per user. | `id`, `user_id`, `onesignal_player_id`, `device_label`, `timezone`, `last_seen_at`, `enabled` | Many subscriptions per user. | Owner read/update/delete; service role can send. Unique `onesignal_player_id`. | Needed before launch only if multi-device push is a requirement. |

### Phase B: Challenge persistence

| Proposed table | Purpose | Key columns | User relationship | RLS | Timing |
| --- | --- | --- | --- | --- | --- |
| `user_challenge_attempts` | Store challenge sessions and scores. | `id`, `user_id`, `challenge_type`, `started_at`, `completed_at`, `score`, `total_questions`, `xp_awarded`, `source` | Many attempts per user. | Owner select/insert; updates only own incomplete attempts or service role finalization. | Can wait for soft launch unless challenge history/rewards are launch scope. |
| `user_challenge_stats` | Fast aggregate challenge stats. | `user_id`, `attempts`, `best_score`, `perfect_runs`, `last_completed_at`, `by_type jsonb` | One row per user. | Owner select; writes should be server-side or tightly validated. | Can wait; useful before leaderboards/rewards. |
| `user_question_history` | Track exposure and mistakes by card/question. | `id`, `user_id`, `card_id`, `question_type`, `answered_at`, `correct`, `latency_ms`, `attempt_id` | Many rows per user. | Owner select; insert own or server-side. | Can wait; useful for adaptive review. |

### Phase C: Mini-unit learning flow

| Proposed table | Purpose | Key columns | User relationship | RLS | Timing |
| --- | --- | --- | --- | --- | --- |
| `mini_units` | Catalog of guided mini-units if content moves out of code. | `id`, `stage_id`, `slug`, `title`, `status`, `sort_order`, `content_version` | Public content, not user-owned. | Public/auth read for published units; admin/service writes. | Can wait while mini-units are code-defined. |
| `mini_unit_steps` | Structured steps for each mini-unit. | `id`, `mini_unit_id`, `step_type`, `card_ids jsonb`, `prompt`, `sort_order` | Public content. | Public/auth read for published steps; admin/service writes. | Can wait. |
| `user_mini_unit_progress` | Save start/completion/resume state and scores. | `id`, `user_id`, `mini_unit_id`, `status`, `current_step`, `score`, `completed_at`, `last_seen_at` | Many rows per user. | Owner select/insert/update/delete. | Recommended before mini-units become a main launch learning path. |

### Phase D: Rewards economy

| Proposed table | Purpose | Key columns | User relationship | RLS | Timing |
| --- | --- | --- | --- | --- | --- |
| `user_wallets` | Gems/hearts/energy balances. | `user_id`, `gems`, `hearts`, `hearts_max`, `energy`, `updated_at` | One row per user. | Owner select; writes preferably server-side/RPC to prevent fabrication. | Needed before enabling real rewards/shop. |
| `user_inventory` | Owned consumables and boosts. | `id`, `user_id`, `item_id`, `quantity`, `expires_at` | Many items per user. | Owner select; writes server-side/RPC. | Needed before consumables. |
| `shop_items` | Public shop catalog. | `id`, `sku`, `item_type`, `price_gems`, `active`, `metadata jsonb` | Public content. | Auth/public read active items; admin/service writes. | Needed before shop transactions. |
| `user_shop_purchases` | Purchase ledger. | `id`, `user_id`, `shop_item_id`, `currency`, `price`, `purchased_at`, `source` | Many purchases per user. | Owner select; insert via secure RPC/service role. | Needed before shop transactions. |
| `user_daily_quests` | Claimable quest state. | `id`, `user_id`, `quest_date`, `quest_id`, `progress`, `target`, `completed_at`, `claimed_at` | Many rows per user. | Owner select; writes server-side/RPC if rewards matter. | Needed before real daily quest rewards. |
| `user_character_unlocks` | Character/skin ownership. | `id`, `user_id`, `character_id`, `skin_id`, `unlocked_at`, `source` | Many unlocks per user. | Owner select; writes server-side/RPC. | Needed before character unlocks. |
| `user_selected_character` | Active character/skin choice. | `user_id`, `character_id`, `skin_id`, `updated_at` | One row per user. | Owner select/update with check that unlock exists, ideally via RPC. | Needed before selectable characters. |

### Phase E: Monetization

| Proposed table | Purpose | Key columns | User relationship | RLS | Timing |
| --- | --- | --- | --- | --- | --- |
| `subscription_plans` | Public plan catalog. | `id`, `provider`, `provider_price_id`, `name`, `interval`, `active`, `features jsonb` | Public content. | Public/auth read active plans; service/admin writes. | Needed before subscriptions. |
| `user_subscriptions` | User subscription state. | `id`, `user_id`, `provider`, `provider_customer_id`, `provider_subscription_id`, `status`, `current_period_end`, `cancel_at_period_end` | Many records per user, one active. | Owner select; writes only from payment webhooks/service role. | Needed before subscriptions. |
| `entitlements` | Resolved access rights. | `id`, `user_id`, `entitlement_key`, `source`, `starts_at`, `ends_at` | Many entitlements per user. | Owner select; writes service role/payment webhook. | Needed before paid access checks. |
| `purchases` | One-time purchase ledger. | `id`, `user_id`, `provider`, `provider_purchase_id`, `amount`, `currency`, `status`, `purchased_at` | Many purchases per user. | Owner select; writes service role/payment webhook. | Needed before one-time purchases. |
| `paid_content_packs` | Paid card/content pack catalog. | `id`, `sku`, `title`, `content_version`, `active`, `metadata jsonb` | Public content. | Public/auth read active packs; admin/service writes. | Needed before paid packs. |
| `user_pack_access` | User access to paid packs. | `id`, `user_id`, `pack_id`, `source`, `granted_at`, `expires_at` | Many pack grants per user. | Owner select; writes service role/payment webhook. | Needed before paid packs. |

### Phase F: Ads/cross-promo

| Proposed table | Purpose | Key columns | User relationship | RLS | Timing |
| --- | --- | --- | --- | --- | --- |
| `ad_events` | Track ad impressions/clicks/rewards. | `id`, `user_id`, `provider`, `placement`, `event_type`, `reward_id`, `created_at`, `metadata jsonb` | Many events per user; anonymous support optional. | Owner select if exposed; inserts via server/client with anti-abuse checks. | Can wait until ads are added. |
| `cross_promo_events` | Track internal/outbound promotions. | `id`, `user_id`, `campaign_id`, `event_type`, `target_url`, `created_at` | Many events per user. | Owner select if exposed; service/client insert with validation. | Can wait. |
| `user_ad_preferences` | Ad personalization and opt-out state. | `user_id`, `personalized_ads`, `cross_promo_opt_out`, `updated_at` | One row per user. | Owner select/update. | Needed before personalized ads. |

### Phase G: Voice recognition future

| Proposed table | Purpose | Key columns | User relationship | RLS | Timing |
| --- | --- | --- | --- | --- | --- |
| `speech_practice_sessions` | Group pronunciation practice sessions. | `id`, `user_id`, `started_at`, `completed_at`, `mode`, `summary jsonb` | Many sessions per user. | Owner select/insert/update; server writes if scoring server-side. | Can wait. |
| `pronunciation_attempts` | Individual voice attempts. | `id`, `user_id`, `session_id`, `card_id`, `prompt_text`, `audio_ref`, `created_at` | Many attempts per user. | Owner select; inserts own; audio storage policy must match. | Needed before saving voice attempts. |
| `pronunciation_scores` | Scoring output for attempts. | `id`, `attempt_id`, `user_id`, `score`, `phoneme_scores jsonb`, `provider`, `model_version`, `created_at` | Many scores per user. | Owner select; writes should be service-side. | Needed before persistent voice scoring. |

## What the current database supports well

- Authenticated per-user profile rows.
- Offline-first progress with cloud sync for SRS card state.
- Aggregate XP/streak/stage stats.
- Placement/onboarding completion.
- Basic achievements.
- Stage 1 mission completion events.
- Notification preferences and OneSignal targeting.
- Server-side notification scheduling via `tick_notifications()` and active cron job. Webhook triggers are live, but their inline service-role token should be rotated and reconfigured.

## Top missing tables/columns for launch readiness

Most important current gaps:

1. Preferences parity: `theme` and post-onboarding `voice` are local-only, while other settings sync through `profiles.settings`.
2. Daily quest/day state: `todayXp`, `todayDate`, `dailyNewLimit`, and `lastGoalHit` are local-only. Cross-device daily quest behavior can diverge.
3. Seen/mastered aggregate consistency: `cards_seen` and `cards_mastered` columns exist, but current cloud sync does not write or read them.
4. Multi-device notifications: one `profiles.onesignal_player_id` may not be enough for multiple browser/device subscriptions.
5. Challenge attempt history: only aggregate quiz counters persist.
6. Mini-unit progress: current mini-unit flow cannot resume or mark completion across devices.
7. Rewards economy: gems, hearts, inventory, shop purchases, character unlocks, and selected character have no real schema yet.

## Required access checklist for future audits

Completed in this pass:

- Supabase CLI is installed and usable via `supabase.cmd`.
- Local project is linked to `fkebzcywofzloaqeghtn`.
- Live catalog metadata was queried through `supabase db query --linked`.
- Live tables, columns, indexes, constraints, RLS state, policies, functions, triggers, event triggers, extensions, and cron job metadata were audited.

Remaining limits:

- `supabase db dump --linked` is still blocked because Docker is not running, so no full `pg_dump` schema file was generated.
- Runtime RLS was not tested with two controlled user accounts; only catalog RLS state was verified.
- Edge Function deployment metadata and secret names were not queried; the database objects that call the function were verified.
- Vault secret value was not read, intentionally.

Needed only for deeper future verification:

1. Docker Desktop running, or a local `pg_dump`/`psql` client, if a full schema dump is required.
2. Two disposable test users if runtime cross-user RLS tests are required.
3. Dashboard or Management API access for Edge Function deployment metadata, if function deployment status and configured secret names need formal verification.

Service role key is not needed for schema/RLS review. Because the live webhook trigger metadata currently exposes a service-role bearer token, rotate that key before sharing schema dumps or broad metadata access.
