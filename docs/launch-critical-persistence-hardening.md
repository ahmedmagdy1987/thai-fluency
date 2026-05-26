# Launch-Critical Persistence Hardening

Date: May 26, 2026

## Summary

This pass removed the user-facing Reset all progress flow and hardened launch-visible persistence for signed-in users. No Thai card content, SRS algorithm, Challenge question logic, auth provider configuration, OneSignal app config, payments, ads, or destructive account deletion flow was changed.

## User-Facing Features And Persistence

| Feature | Current persistence | Notes |
| --- | --- | --- |
| Account/profile | Supabase Auth + `public.profiles` | User-scoped RLS. |
| Email confirmation | Supabase Auth | Client still blocks unconfirmed sessions from the main app. |
| SRS card progress | `public.user_progress` | Per-user rows for ease, interval, reps, lapses, learning state, and due date. |
| Total XP/streak/stage | `public.user_stats` | Client-authored, acceptable for solo beta. |
| Today XP/daily goal progress | `public.user_stats.today_xp`, `today_xp_date`, `last_xp_activity_at`, `daily_goal` | Added in migration `005_launch_persistence_hardening.sql`. Anonymous/demo users remain local-only. |
| Settings/preferences | `public.profiles.settings` plus `public.user_stats.daily_goal` | Learning mode, audio rate, auto-play, sound effects, show characters, theme, voice, first lesson state, and mini-unit resume state sync for signed-in users. |
| Selected voice | `public.profiles.selected_voice` and `profiles.settings.voice` | Settings changes now update both the compatibility column and JSON setting. |
| Guided first lesson | `profiles.settings.firstLessonCompleted` and `firstLessonProgress` | New users can resume after refresh before completion. |
| Mini-unit progress | `profiles.settings.activeMiniUnitId`, `miniUnitProgress`, `completedMiniUnits` | Mid-unit refresh can resume the active guided unit. |
| Challenge aggregates | `public.user_stats.challenge_attempts`, `challenge_correct`, `challenge_wrong`, `last_challenge_date`, `best_challenge_score`, `best_challenge_total` | Per-question attempt history is not stored yet. |
| Achievements | `public.user_achievements` | Client-authored beta state. |
| Missions | `public.user_missions` plus `user_stats.last_seen_mission` | Stage 1 mission completion events only. |
| Feedback | Mailto to `support@tuktalkthai.com` | Honest beta flow; no database collection. |
| Account deletion request | Support email workflow | No destructive deletion was implemented. |
| Gems/hearts/shop/inventory | Preview-only UI | Shop purchase buttons are disabled and labelled as not available yet. |
| Leaderboard | Preview-only UI | No competitive persistence is active. |

## Fixes Made

- Removed the `Reset all progress` button and reset callback from the Settings UI.
- Removed the reset prop from `TodayTab` and `SettingsModal`.
- Added additive `user_stats` columns for today XP and Challenge aggregate persistence.
- Synced theme and voice settings through `profiles.settings`; voice also updates `profiles.selected_voice`.
- Added first-lesson progress resume state through `profiles.settings.firstLessonProgress`.
- Added mini-unit resume/completion state through `profiles.settings`.
- Added Challenge aggregate updates when a Challenge round completes.
- Added `supabase/.temp/` to `.gitignore` so CLI link/cache files are not committed.
- Repaired live Supabase migration history for already-present migrations `001`, `003`, and `004`, then pushed migration `005`.
- Rotated `NOTIFICATION_WEBHOOK_SECRET` without printing or committing the value.
- Updated the Edge Function secret, Vault secret used by cron, and database webhook headers.

## Migrations And RLS

Migration added:

`supabase/migrations/005_launch_persistence_hardening.sql`

Columns added to `public.user_stats`:

| Column | Type | Purpose |
| --- | --- | --- |
| `today_xp` | integer | XP earned for the current local day. |
| `today_xp_date` | date | Local day key for `today_xp`. |
| `last_xp_activity_at` | timestamptz | Last XP activity timestamp. |
| `challenge_attempts` | integer | Completed Challenge round count. |
| `challenge_correct` | integer | Aggregate correct Challenge answers. |
| `challenge_wrong` | integer | Aggregate wrong Challenge answers. |
| `last_challenge_date` | date | Last Challenge completion date. |
| `best_challenge_score` | integer | Best Challenge score numerator. |
| `best_challenge_total` | integer | Best Challenge score denominator. |

No new tables were added. Existing `public.user_stats` RLS remains enabled with own-row policies:

| Policy type | Predicate |
| --- | --- |
| SELECT | `auth.uid() = user_id` |
| INSERT | `auth.uid() = user_id` |
| UPDATE | `auth.uid() = user_id` |
| DELETE | `auth.uid() = user_id` |

## Notification Secret Rotation

Rotation status: complete.

Verification results:

| Check | Result |
| --- | --- |
| Edge Function unauthenticated POST | `401` |
| Edge Function authenticated no-op webhook POST | `200` |
| Database webhook trigger statements using `X-Tuk-Notification-Secret` | `3` |
| Database webhook trigger statements using `Authorization` or `Bearer` | `0` |
| Vault secret named `notification_webhook_secret` | `1` |
| Cron job command contains bearer auth | `false` |

The generated value was written only to temporary files outside the repo and removed after use. No secret value was printed or committed.

## Test Results

| Test | Result |
| --- | --- |
| `npm.cmd run build` before live DB work | Pass |
| Migration `005` applied to linked Supabase project | Pass |
| New live `user_stats` columns visible | Pass |
| `user_stats` RLS enabled | Pass |
| `user_stats` own-row policies present | Pass |
| Notification webhook secret rotation checks | Pass |
| `npm.cmd run build` final | Pass |

Build warning: Vite still reports the existing large JS chunk warning. No risky lazy-loading refactor was attempted in this persistence pass.

## Intentionally Preview-Only Or Manual

| Area | Status |
| --- | --- |
| Feedback reports | Mailto-only. Add `feedback_reports` only if in-app triage/storage is approved. |
| Account deletion requests | Manual support workflow only. Automated in-app deletion remains future work. |
| Gems/hearts/energy | Preview-only, not spendable. |
| Shop purchases/inventory | Disabled preview. |
| Character unlocks/selected character | Static/preview only until ownership tables exist. |
| Subscriptions/paid packs/ads removal | Not implemented. |
| Challenge attempt history | Aggregate-only for beta; no per-question history table. |

## Remaining Owner Actions

1. Confirm `support@tuktalkthai.com` exists and is monitored.
2. Approve Privacy Policy and Terms of Use.
3. Run a real signed-in smoke test on two browsers/devices to verify cross-device today XP, settings, guided first lesson resume, and Challenge aggregate continuity.
4. Provide one subscribed OneSignal test device and run a controlled push test.
5. Approve whether future reset/delete functionality is ever needed. It is intentionally absent from the app now.
