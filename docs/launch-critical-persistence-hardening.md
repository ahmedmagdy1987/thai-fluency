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
- Removed the blocking local XP/progress migration prompt. Signed-in users now auto-upload local anonymous progress only when the cloud account has no learning state.
- Added additive `user_stats` columns for today XP and Challenge aggregate persistence.
- Synced theme and voice settings through `profiles.settings`; voice also updates `profiles.selected_voice`.
- Added first-lesson progress resume state through `profiles.settings.firstLessonProgress`.
- Added mini-unit resume/completion state through `profiles.settings`.
- Added Challenge aggregate updates when a Challenge round completes.
- Scoped mission-started card sessions to the current mission's card IDs. Mission 1 is 29 cards and cannot continue into the broader Stage 1 deck.
- Changed mission completion to all mission cards reviewed/seen. SRS mastery remains separate and visible.
- Updated Stage progress UI to show learned/seen progress alongside mastered progress, so a completed mission visibly affects Stage 1.
- Locked rating and skip actions immediately after one action and added duplicate review guards so repeated Easy clicks cannot farm XP.
- Kept skip actions XP-free. Mission completion rewards and achievement unlocks are guarded to fire once.
- Made OneSignal initialization idempotent when the SDK has already been initialized during the page lifecycle.
- Fixed the hard-refresh `Object.keys` crash by guarding null lookup/progress inputs and giving `autoBreakdown()` a safe default lookup.
- Added `supabase/.temp/` to `.gitignore` so CLI link/cache files are not committed.
- Repaired live Supabase migration history for already-present migrations `001`, `003`, and `004`, then pushed migration `005`.
- Rotated `NOTIFICATION_WEBHOOK_SECRET` without printing or committing the value.
- Updated the Edge Function secret, Vault secret used by cron, and database webhook headers.

## Mission And XP Rules

| Area | Rule |
| --- | --- |
| Mission card sessions | Starting a mission opens only that mission's card IDs. A mission session ends when those cards are exhausted. |
| Mission 1 size | 29 cards. The session count cannot continue past 29 inside Mission 1. |
| Mission completion | A mission completes when all its cards have been reviewed/seen. Mastered remains the SRS long-interval count. |
| Stage progress | Stage cards now show learned/seen progress and mastered progress, avoiding a misleading `0/150 mastered`-only state. |
| Card XP | One rating action per card per session. Rating buttons lock immediately. |
| Easy farming | Repeated Easy clicks on the same revealed card are ignored after the first accepted rating. |
| Skip | Marks the card known where supported, but awards no XP. |
| Mission bonus | Awarded once per mission. |
| Achievements | Unlock toasts are guarded so each achievement fires once. |
| Local sync | Local anonymous progress auto-syncs once only when the signed-in cloud account is empty; there is no blocking prompt. |
| OneSignal | SDK initialization treats an already-initialized SDK as success instead of repeatedly logging scary warnings. |

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
| Local preview direct route smoke for `/`, `/learn`, `/cards`, `/challenge`, `/premium`, `/shop`, `/privacy` | Pass |
| Local preview route script including legal/support/feedback/worker/manifest routes | Pass |
| Mission 1 scoped queue count check | Pass: 29 cards |
| Mission 1 completion state check | Pass: 29/29 seen advances to Mission 2 and Stage 1 shows 29 learned / 150 |

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

## Progression Correctness & Anti-Rushing Pass (May 29, 2026)

Production testing surfaced a core progression bug: a user who finished Stage 1
saw **150/150 learned, 0/150 mastered** but Stage 2 did not clearly unlock, and
the app could be rushed through by pressing **Easy** repeatedly. This pass fixes
stage unlock, clarifies learned vs mastered, adds lightweight anti-rushing XP
rules, improves the Practice empty state, and cleans up two console issues. No
Thai card content, payments, ads, subscriptions, or major UI was changed, and no
database migration was applied (all changes are client-side).

### Learned vs Mastered (definitions)

| Term | Meaning | Source of truth |
| --- | --- | --- |
| **Learned / seen** | Card was completed once in a guided session/review. | `progress[cardId]` exists (`getStats.seen`). |
| **Mastered** | Card was retained through long-term SRS review (interval ≥ 21 days). | `progress[cardId].interval >= 21` (`getStats.mature`). |

Mastery is a long-term review outcome, not a gate. The UI now says
"`N` mastered through review" instead of framing "0/150 mastered" as a blocker.

### Stage unlock rule (fixed)

- A stage is **complete** when **all of its cards are learned** (seen at least
  once). Previously completion required ≥70% of cards *matured*, which left
  users with 150/150 learned but 0 matured permanently stuck on Stage 1.
- Stage N+1 unlocks when Stage N is complete by **learned/mission** progress.
  **Mastery is never required to advance.**
- For Stage 1 this is equivalent to all six missions complete: the 150 Stage 1
  cards are fully partitioned across missions 1–6 (29/26/24/24/28/19), so
  `seen >= total` ⇔ `stage1Complete`.
- **Do-not-regress safeguard:** completion is `learnedComplete OR legacy
  matureComplete (≥70% matured)`, so any user who already unlocked the next
  stage under the old mastery rule is never re-locked.
- Implemented in `src/lib/state.js` `getStageState`. The stage is recomputed
  from `progress` on every load, so existing users with 150/150 learned unlock
  Stage 2 immediately on next open.

### Learned vs mastered UX (fixed)

- `LearnPath` stage rows: "`seen`/`total` learned · `mature` mastered through
  review"; a completed stage shows a "Complete" tag plus "Stage N complete —
  every word learned. Keep reviewing to master them."
- A freshly-unlocked, not-yet-started stage shows an explicit **Start Stage N**
  call-to-action so a completed stage never feels like a dead end.
- Footnote now reads: "Learn every word in a stage to unlock the next one.
  Mastery comes later, through review."

### Anti-rushing XP rules

- XP per rating is unchanged for honest pace: Again 1 / Hard 2 / Good 3 / Easy 5;
  Challenge correct 5; mission completion 35; "I already know this — Skip" stays
  **0 XP**.
- `App.jsx` `reviewOne` now detects **blind Easy/Good spam**: high-value ratings
  (Good/Easy) entered faster than **1300 ms** apart count toward a run; once the
  run exceeds **5 consecutive** rushed ratings, XP for those ratings is **capped
  at 1**. Any slower rating, or any low rating (Again/Hard), resets the run, so
  normal pace is never penalised.
- A gentle coach message appears on a throttled rating: *"Quick pass saved.
  Review again later to master it."*
- SRS scheduling, learned/seen counts, and stage unlocks are **unaffected** —
  only the XP currency is throttled. Mastery still requires real spaced review,
  so rushing cannot meaningfully "finish" the app.
- Undo reverses the **exact XP awarded** (throttled or not) and rolls back the
  rush bookkeeping, so the undo path stays accurate.
- Mission completion rewards continue to fire exactly once (existing
  `missionRewardLocksRef` guard), and require all mission cards seen.

### Practice empty state (fixed)

`CardsTab` no longer dead-ends when there are no due cards:

- Mission session finished → "Mission complete" + **Continue your path**.
- Reviews available later but nothing due now → "No reviews due right now.
  Continue your learning path, or try a Challenge." with **Continue your path**
  (→ Learn) and **Try a Challenge** (→ Challenge) buttons.
- Everything in the deck seen → "You're caught up. Come back later to review and
  master what you learned."

### OneSignal console cleanup

- `setExternalUserId`/`clearExternalUserId`/`setPushOptIn`/
  `promptForPushPermission` now guard the SDK surface with `typeof` checks
  before calling (`login`, `logout`, `optIn`/`optOut`, `Slidedown.promptPush`).
  A missing `login` method was the source of the "OneSignal login failed
  TypeError" — it is now a non-fatal no-op.
- All `console.warn` noise was downgraded to a dev-only `debug()` logger, so
  production consoles are no longer spammed. "Already initialized" remains a
  non-fatal no-op. The notification permission flow is unchanged.

### AudioContext console cleanup

- `src/lib/sounds.js` no longer creates or resumes an `AudioContext` on page
  load. A capture-phase first-gesture listener
  (`pointerdown`/`mousedown`/`touchstart`/`keydown`) sets a flag; `getCtx()`
  returns `null` until then, so the browser "AudioContext was not allowed to
  start" warning no longer fires. The listener itself creates nothing.
- Because pointer/touch/key gestures fire before the `click` handlers that
  request sound, the first legitimate sound (card reveal, reward flow) still
  plays. Sound effects OFF is still respected, and the reward screen already
  suppresses celebration audio under `prefers-reduced-motion`.

### Verification

- `npm run build` passes (pre-existing large-chunk warning only).
- Simulated `getStageState` across scenarios: 150/150 learned (0 mastered) →
  Stage 2 unlocks; legacy 105 seen+matured/45 unseen → Stage 2 stays unlocked
  (no regression); 100/150 learned → Stage 2 stays locked; placement at Stage 3
  → Stages 1–3 unlocked; `getMissionState.stage1Complete` agrees.
- Routes smoke-checked locally: `/learn`, `/cards`, `/challenge`, `/premium`,
  `/shop`.
