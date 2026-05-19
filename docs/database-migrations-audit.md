# Database, migrations, RLS, and persistence audit

Date: 2026-05-19

Scope: local repo audit plus live-access readiness check. No migrations were applied. No schema was changed. No production data was read or modified.

Live database status: not audited from this machine. The Supabase CLI is not installed (`supabase` command not found), this checkout has no `supabase/config.toml` project link, and no read-only database connection string or Supabase access token is available locally. `.env.local` exists, but client publishable env vars are not sufficient for schema/RLS/cron/webhook verification.

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
| `supabase/migrations/002_*.sql` | Unknown. | Missing locally. Earlier project notes mention migrations 001, 002, 003, and 004 as applied, but the repo only contains 001, 003, and 004. Live comparison is required to know what 002 did, if anything. |
| `supabase/migrations/003_notifications.sql` | Adds notification columns/indexes to `profiles` and `user_stats`. | Present. Required by current OneSignal code. |
| `supabase/migrations/004_notification_scheduler.sql` | Enables `pg_net` and `pg_cron`, stores a service role key in Vault, creates `public.tick_notifications()`, and schedules hourly notification ticks. | Present. Contains the placeholder `YOUR_SERVICE_ROLE_KEY_HERE`; do not commit a real service role key. |

## Tables and columns found

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

Live RLS status: not verified. A live audit should query `pg_policies`, `pg_class.relrowsecurity`, and RLS behavior with at least two test users or a read-only schema dump plus controlled test credentials.

## Functions, triggers, extensions, cron, webhooks, and Edge Functions

### Database functions

| Function | Source | Purpose | Security notes |
| --- | --- | --- | --- |
| `public.handle_new_user()` | `supabase/schema.sql` | After Auth signup, inserts matching `profiles` and `user_stats` rows. | `SECURITY DEFINER`, `search_path = public`. |
| `public.set_updated_at()` | `supabase/schema.sql` | Updates `updated_at` on table updates. | Normal trigger function. |
| `public.email_exists(check_email text)` | `schema.sql`, `001_email_exists.sql` | Boolean lookup for sign-in UX. | `SECURITY DEFINER`, executable by `anon` and `authenticated`; email enumeration risk. |
| `public.tick_notifications()` | `004_notification_scheduler.sql` | Posts `{ "mode": "tick" }` to the notification Edge Function. | `SECURITY DEFINER`; depends on Vault secret `service_role_key`, `pg_net`, and Edge Function availability. |

### Triggers

| Trigger | Table | Function | Purpose |
| --- | --- | --- | --- |
| `on_auth_user_created` | `auth.users` | `public.handle_new_user()` | Auto-provision profile and stats row after signup. |
| `set_profiles_updated_at` | `public.profiles` | `public.set_updated_at()` | Maintain `profiles.updated_at`. |
| `set_user_stats_updated_at` | `public.user_stats` | `public.set_updated_at()` | Maintain `user_stats.updated_at`. |
| `set_user_progress_updated_at` | `public.user_progress` | `public.set_updated_at()` | Maintain `user_progress.updated_at`. |

### Extensions and cron

Migration 004 enables:

- `pg_net`
- `pg_cron`

Cron job:

- `tuk-talk-notification-tick`
- Schedule: `5 * * * *`
- SQL: `select public.tick_notifications();`

This cannot be verified live without DB access.

### Database webhooks

`NOTIFICATIONS.md` documents dashboard-configured webhooks, not SQL migrations:

- `mission_complete_notify`: table `user_missions`, insert/update, sends to `send-notification`.
- `stats_update_notify`: table `user_stats`, update, sends to `send-notification`.

These cannot be verified from the repo alone. Supabase dashboard access or live metadata access is required.

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

Cannot verify live schema from this machine.

Known local expectations that must be checked against production:

- Whether remote migrations include a migration 002 not present in the repo.
- Whether migration 003 columns exist remotely:
  - `profiles.onesignal_player_id`
  - `profiles.notification_preferences`
  - `profiles.timezone`
  - `user_stats.typical_study_hour`
  - `user_stats.last_notification_sent_at`
- Whether migration 004 is actually active remotely:
  - `pg_net`
  - `pg_cron`
  - Vault secret named `service_role_key`
  - `public.tick_notifications()`
  - cron job `tuk-talk-notification-tick`
- Whether dashboard webhooks from `NOTIFICATIONS.md` exist and point at the deployed Edge Function.
- Whether all five app tables still have RLS enabled and the expected owner-scoped policies.
- Whether remote schema contains dashboard/manual changes that are not represented in migrations.

## Security and RLS concerns

Top concerns from this audit:

1. Client-authored progress and rewards are not server-validated.
   - Current RLS protects user isolation, not data integrity.
   - A signed-in user can fabricate their own XP, streak, progress, mission completion, and achievement state by changing local state or direct REST calls.
   - This becomes launch-critical before leaderboards, rewards, paid unlocks, public rankings, or competitive streaks.

2. Mission and stats writes can trigger notifications.
   - `user_missions` and `user_stats` are client-writable for own rows.
   - Webhooks may send milestone notifications from fabricated own-row updates.
   - This is not cross-user data exposure, but it is notification abuse/noise risk.

3. `email_exists` is an intentional account-enumeration surface.
   - It returns only a boolean and not row data, but anonymous callers can test whether an email has a profile.
   - Consider rate limiting, CAPTCHA after repeated failures, or removing the RPC if the UX tradeoff changes.

4. Profile `settings` JSON has no documented shape or database-level validation.
   - Current app expects `viewMode`, `audioRate`, `audioAutoPlay`, `showCharacters`, and `soundEffects`.
   - Theme and post-onboarding voice changes are local-only despite being user preferences.
   - Future settings growth may make the JSON blob hard to reason about.

5. Notification player ID is stored as a single profile value.
   - If OneSignal returns different subscription IDs across devices/browsers, the latest write can overwrite the prior device.
   - If multi-device push matters, use a `user_push_subscriptions` table later.

6. `profiles.email` can become stale.
   - Signup trigger copies `auth.users.email` once.
   - No trigger or client sync was found for later email changes.

7. Own-row DELETE policies exist on all app tables.
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
- Server-side notification sending via Edge Function, if production cron/webhooks/secrets are configured as documented.

## Top missing tables/columns for launch readiness

Most important current gaps:

1. Preferences parity: `theme` and post-onboarding `voice` are local-only, while other settings sync through `profiles.settings`.
2. Daily quest/day state: `todayXp`, `todayDate`, `dailyNewLimit`, and `lastGoalHit` are local-only. Cross-device daily quest behavior can diverge.
3. Seen/mastered aggregate consistency: `cards_seen` and `cards_mastered` columns exist, but current cloud sync does not write or read them.
4. Multi-device notifications: one `profiles.onesignal_player_id` may not be enough for multiple browser/device subscriptions.
5. Challenge attempt history: only aggregate quiz counters persist.
6. Mini-unit progress: current mini-unit flow cannot resume or mark completion across devices.
7. Rewards economy: gems, hearts, inventory, shop purchases, character unlocks, and selected character have no real schema yet.

## Required access checklist for live audit

What can be audited from the repo alone:

- Local migration files and missing local migration numbers.
- Expected tables, columns, policies, triggers, functions, indexes, cron SQL, and Edge Function dependencies.
- Supabase client reads/writes in code.
- Which user features are persisted in Supabase, localStorage, session state, placeholders, or not implemented.
- Roadmap schema gaps and likely RLS model.

What is needed from the owner to audit live Supabase safely:

1. Confirm whether the Supabase CLI can be installed locally, or install it.
2. Provide Supabase CLI login access, preferably with an owner-approved access token that can inspect project metadata.
3. Link the project locally with project ref `fkebzcywofzloaqeghtn`, or provide permission to run `supabase link --project-ref fkebzcywofzloaqeghtn`.
4. Provide a read-only database connection string if available. Ideal: a dedicated read-only `audit_reader` role that can read `information_schema`, `pg_catalog`, `pg_policies`, `cron.job`, extension metadata, and schema definitions without reading user table data.
5. Provide dashboard access or exported metadata for Database Webhooks, because local SQL does not define those webhooks.
6. Provide Edge Function metadata access sufficient to verify deployed function names and secret names. Secret values are not needed.

Service role key is not needed for this audit unless the owner specifically wants a controlled Edge Function invocation test. Do not share it for schema/RLS review.

