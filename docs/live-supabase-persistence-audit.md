# Live Supabase Persistence Audit

Date: May 26, 2026

Project: Tuk Talk Thai  
Supabase project ref: `fkebzcywofzloaqeghtn`

## Scope

This started as a read-only persistence audit. The follow-up launch hardening pass applied one additive migration, repaired migration history for already-present migrations, and rotated the notification webhook secret. User row contents were not dumped, and no production user data was modified.

One important audit exception: an initial trigger metadata query returned a live webhook header value inside `information_schema.triggers.action_statement`. That value is not included in this document or committed files. The secret was rotated on May 26, 2026.

## Launch Hardening Update

| Item | Result |
| --- | --- |
| Reset all progress | Removed from user-facing UI/actions. |
| Migration history | Remote history repaired for already-present `001`, `003`, `004`; `005` pushed. |
| Migration `005` | Added current-day XP and Challenge aggregate columns to `public.user_stats`. |
| RLS | Existing `user_stats` own-row RLS protects new columns. |
| Settings | Theme, voice, first lesson progress, mini-unit progress, and completed mini-units now sync through `profiles.settings`. |
| Notification secret | Edge Function secret, Vault secret, and DB webhook headers rotated together. |
| Webhook auth check | Unauthenticated POST returned `401`; authenticated no-op webhook POST returned `200`; webhook triggers have `X-Tuk-Notification-Secret` and no `Authorization`/`Bearer`. |

## CLI And Link Status

| Item | Result | Notes |
| --- | --- | --- |
| Supabase CLI | Pass | `npx.cmd supabase --version` returned `2.101.0`. PowerShell blocks `npx.ps1`, so `npx.cmd` was used. |
| Login | Pass | CLI query access worked through the linked project. |
| Project link | Pass | `npx.cmd supabase link --project-ref fkebzcywofzloaqeghtn` completed successfully. |
| Link confirmation | Pass | `supabase/.temp/project-ref` contains `fkebzcywofzloaqeghtn`. This CLI cache folder is untracked and was not committed. |
| Production data writes | Pass | Only additive schema/migration-history writes and notification-secret rotation were performed during hardening. No user rows were modified or dumped. |
| Secrets committed | Pass | No secret files were committed. Tracked env files are only `.env.example` and `.env.local.example`. |

## Live Tables Found

Public app tables:

| Table | Rows | RLS | Purpose |
| --- | ---: | --- | --- |
| `public.profiles` | 4 | Enabled | Profile identity, onboarding flag, selected voice, settings JSON, OneSignal subscription data, notification preferences. |
| `public.user_stats` | 4 | Enabled | Aggregate learning/gamification stats. |
| `public.user_progress` | 43 | Enabled | Per-card SRS state. |
| `public.user_missions` | 0 | Enabled | Mission completion event rows for notifications. |
| `public.user_achievements` | 4 | Enabled | Achievement unlock rows. |

Other visible schemas:

| Schema | Objects Observed | Notes |
| --- | --- | --- |
| `auth` | Supabase Auth tables | `auth.users` has 4 estimated rows. No user row contents were queried. |
| `storage` | Supabase Storage tables | No app bucket usage found in this audit. |
| `cron` | `cron.job`, `cron.job_run_details` | One active app cron job exists. |
| `net` | pg_net queue/response tables and functions | Used by notification cron. |
| `vault` | `vault.secrets`, `vault.decrypted_secrets` | One Vault secret exists. Secret values were not queried. |
| `supabase_functions` | `hooks`, migrations | Hook/request metadata exists; no public table hook rows were selected. |

## Public Columns Summary

| Table | Key columns |
| --- | --- |
| `profiles` | `id`, `email`, `display_name`, `onboarding_completed`, `selected_voice`, `settings`, `onesignal_player_id`, `notification_preferences`, `timezone`, timestamps |
| `user_stats` | `user_id`, `total_xp`, `current_streak`, `longest_streak`, `last_active_date`, `cards_seen`, `cards_mastered`, `current_stage`, `started_stage`, `total_reviews`, `today_xp`, `today_xp_date`, `last_xp_activity_at`, `daily_goal`, `daily_goals_hit`, tone/challenge aggregate fields, `challenge_attempts`, `challenge_correct`, `challenge_wrong`, `last_challenge_date`, `best_challenge_score`, `best_challenge_total`, `streak_freezes`, `last_seen_mission`, `stage1_celebration_shown`, `dialogues_completed`, `known_card_ids`, `typical_study_hour`, `last_notification_sent_at`, timestamps |
| `user_progress` | `user_id`, `card_id`, `ease`, `interval`, `reps`, `lapses`, `learning`, `next_review`, `last_review`, timestamps |
| `user_missions` | `user_id`, `stage`, `mission`, `completed`, `completed_at`, `created_at` |
| `user_achievements` | `user_id`, `achievement_id`, `unlocked_at` |

## Indexes And Constraints

Key live indexes:

| Table | Indexes |
| --- | --- |
| `profiles` | Primary key on `id`; partial index on `onesignal_player_id` where not null |
| `user_stats` | Primary key on `id`; unique `user_id`; index on `last_active_date` |
| `user_progress` | Primary key on `id`; unique `(user_id, card_id)`; indexes on `user_id` and `(user_id, next_review)` |
| `user_missions` | Primary key on `id`; unique `(user_id, stage, mission)`; index on `user_id` |
| `user_achievements` | Primary key on `id`; unique `(user_id, achievement_id)`; index on `user_id` |

Foreign keys point user-owned rows back to `auth.users(id)` with cascade behavior in the local schema and equivalent live constraints observed by name.

## RLS Summary

RLS is enabled on all five public app tables.

| Table | Policies |
| --- | --- |
| `profiles` | `select`, `insert`, `update`, `delete` own row where `auth.uid() = id` |
| `user_stats` | `select`, `insert`, `update`, `delete` own rows where `auth.uid() = user_id` |
| `user_progress` | `select`, `insert`, `update`, `delete` own rows where `auth.uid() = user_id` |
| `user_missions` | `select`, `insert`, `update`, `delete` own rows where `auth.uid() = user_id` |
| `user_achievements` | `select`, `insert`, `update`, `delete` own rows where `auth.uid() = user_id` |

Risk note: the policies allow users to delete their own progress/stat rows. That is not cross-user data exposure, but it means all user-owned learning state is client-authorable. This is acceptable for solo beta learning, but not for competitive leaderboards, trusted rewards, or paid entitlements.

## Functions, Triggers, Cron, Vault

Public functions observed:

| Function | Security | Purpose |
| --- | --- | --- |
| `public.email_exists(check_email text)` | SECURITY DEFINER | Allows sign-in UX to distinguish no-account from wrong-password cases. |
| `public.handle_new_user()` | SECURITY DEFINER | Creates profile rows after `auth.users` insert. |
| `public.rls_auto_enable()` | SECURITY DEFINER | Present in live DB; not called by app code. |
| `public.set_updated_at()` | Invoker | Maintains `updated_at` on update. |
| `public.tick_notifications()` | SECURITY DEFINER | Cron entry point for notification fan-out using Vault-backed secret lookup. |

Triggers observed:

| Table | Trigger | Event | Action summary |
| --- | --- | --- | --- |
| `auth.users` | `on_auth_user_created` | after insert | `handle_new_user()` |
| `public.profiles` | `set_profiles_updated_at` | before update | `set_updated_at()` |
| `public.user_progress` | `set_user_progress_updated_at` | before update | `set_updated_at()` |
| `public.user_stats` | `set_user_stats_updated_at` | before update | `set_updated_at()` |
| `public.user_stats` | `stats_update_notify` | after update | Database webhook to `send-notification`, headers redacted |
| `public.user_missions` | `mission_complete_notify` | after insert/update | Database webhook to `send-notification`, headers redacted |

Cron:

| Job | Schedule | Active | Command |
| --- | --- | --- | --- |
| `tuk-talk-notification-tick` | `5 * * * *` | true | `select public.tick_notifications();` |

Vault:

| Object | Count | Notes |
| --- | ---: | --- |
| `vault.secrets` | 1 | Secret values were not queried. Local migration indicates this should be `notification_webhook_secret`. |

Notification webhook metadata:

- Database webhook triggers are present on `user_stats` and `user_missions`.
- The trigger headers were rotated and now use `X-Tuk-Notification-Secret`.
- Sanitized verification found zero `Authorization` or `Bearer` strings in the two notification webhook trigger statements.
- Cron uses `public.tick_notifications()`, which reads the webhook secret from Vault and avoids embedding the cron secret directly in the cron command.

## App-To-DB Wiring Summary

| Area | Current wiring | Assessment |
| --- | --- | --- |
| Auth/session | Supabase Auth client with custom storage key `tuk-talk-thai-auth` | Good. No service-role key in frontend. |
| Profile | `profiles` fetched after confirmed session; display name editable; onboarding flag written after placement | Good, user-scoped by RLS. |
| Progress | `user_progress` downloaded on cloud init, uploaded on debounced local changes | Good for normal sync. Reset/delete semantics are incomplete. |
| Stats | `user_stats` downloaded/uploaded with aggregate fields, current-day XP fields, and Challenge aggregate fields | Good for aggregate beta stats. |
| Achievements | `user_achievements` upserted and downloaded | Good for beta; client-authorable. |
| Missions | `user_missions` upserted when Stage 1 mission advances | Good for notification events; not a full mission-state store. |
| Settings | selected keys sync to `profiles.settings`; daily goal syncs through `user_stats` | Good for visible beta settings. |
| First lesson | `firstLessonCompleted` and `firstLessonProgress` sync through `profiles.settings` | Good; mid-lesson refresh can resume. |
| Mini-units | active unit/progress/completed unit IDs sync through `profiles.settings` | Good for beta resume behavior. |
| OneSignal | profile stores one `onesignal_player_id`, `notification_preferences`, `timezone`; Edge Function uses service role server-side only | Good enough for single-device beta. Multi-device push can overwrite the player ID. |
| Feedback | mailto-only | Intentional, no DB write. |
| Account deletion | support workflow only | Intentional for web beta; automate later. |
| Shop/rewards/payments/ads | disabled or placeholder-only | No production tables yet; do not enable without schema and secure server-side mutations. |

## Persistence Matrix

Full machine-readable matrix: `docs/database-persistence-matrix.json`.

High-signal summary:

| Feature group | Persistence status |
| --- | --- |
| Account/profile/email confirmation | Supabase Auth + `profiles` |
| SRS progress, due cards, seen/mastered derivation | `user_progress` |
| Total XP, streak, stage, daily goal, today XP, aggregate challenge stats | `user_stats` |
| First lesson, mini-unit resume state, and visible settings | `profiles.settings` |
| OneSignal subscription/preferences/timezone | `profiles` |
| Challenge attempt history | aggregate only; no per-question history table |
| Feedback reports/account deletion requests | support/mailto placeholder only |
| Gems/hearts/energy/shop/inventory/character unlocks/subscriptions/paid packs/ads removal | placeholder or not implemented |

## Launch-Critical Gaps

### Must Fix Before Public Beta

No known launch-critical persistence gaps remain after the hardening pass.

Reset all progress was removed instead of trying to support a destructive reset flow. Today XP, visible settings, guided lesson resume state, mini-unit resume state, and Challenge aggregate state are now cloud-backed for signed-in users.

### Should Fix Soon After Beta

1. Add a `user_push_subscriptions` table if multi-device notifications matter. One `profiles.onesignal_player_id` can be overwritten by another device/browser.
2. Add historical daily activity rows if analytics need day-by-day XP history beyond the current-day aggregate.
3. Add `user_challenge_attempts` if per-question Challenge analytics or history is needed.
4. Either maintain or deprecate `user_stats.cards_seen` and `cards_mastered`; current app derives these from `user_progress` and does not update the aggregate columns.
5. Narrow client delete policies if accidental self-deletion or untrusted client mutation becomes a concern.

### Future Monetization/Rewards Tables

Create these only when those features are ready:

| Table | Purpose |
| --- | --- |
| `user_wallets` | Gems, hearts, energy, balance timestamps. |
| `user_inventory` | Consumables, boosts, owned items. |
| `shop_items` | Public shop catalog. |
| `user_shop_purchases` | Purchase ledger for shop transactions. |
| `user_daily_quests` | Server-tracked daily quest progress/rewards. |
| `user_character_unlocks` | Character/skin ownership. |
| `user_selected_character` | Active character selection. |
| `subscriptions`, `entitlements`, `purchases` | Paid plans, provider purchases, and access control. |
| `feedback_reports` | Optional in-app feedback storage/triage. |
| `user_challenge_attempts`, `user_challenge_stats` | Challenge history, best scores, analytics, rewards. |
| `pronunciation_attempts`, `speech_practice_sessions` | Future voice/pronunciation practice, after privacy review. |

## Owner Actions

1. Run one controlled notification test with a subscribed test device.
2. Confirm support mailbox monitoring remains in place for feedback and deletion requests.
3. Approve legal/support copy before public launch.
4. Before monetization/rewards, approve a server-side mutation model. Do not let the frontend directly award spendable gems, hearts, inventory, or entitlements.
