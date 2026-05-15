# Settings Audit Report

Date: 2026-05-15

## Scope

This audit covers the requested Settings controls only. Theme, Voice / Perspective, Legal, Streak protection, and Reset progress were not part of the requested control list, except where they share the same persistence path.

## Audit Table

| Setting | Current UI | Actually affects app | Persistence | User-specific | Issue found | Fix applied |
|---|---|---|---|---|---|---|
| Learning mode: Speak only / Speak + Read / Read mastery | Three vertically stacked selectable buttons with active state | Yes. `CardsTab` changes front-card layout by `viewMode`; `data-view-mode` also affects other display surfaces. Demo cards now use the same `viewMode`. | `localStorage` state. For confirmed signed-in users, also `profiles.settings.viewMode` in Supabase. | Yes in Supabase after this fix; local-only per browser when logged out. | Demo cards ignored learning mode. Cloud had an existing `profiles.settings` JSONB column but the app did not load/save this preference there. | Passed `viewMode` into `DemoMode`; added profile settings load/save for `viewMode`. |
| Audio text-to-speech speed: Slow / Natural / Fast | One "Pronunciation speed" selector with Slow, Natural, Fast | Yes. The selected `audioRate` is passed to Thai TTS in lesson cards, browse/dialogues, and demo cards. | `localStorage` state. For confirmed signed-in users, also `profiles.settings.audioRate` in Supabase. | Yes in Supabase after this fix; local-only per browser when logged out. | Old UI used subtle rates (`0.7`, `0.85`, `1`) and had a second confusing preview row. Demo TTS ignored the setting. | Replaced rates with `0.7`, `0.95`, `1.15`; normalized legacy `0.85 -> 0.95` and `1 -> 1.15`; passed `audioRate` into `DemoMode`. |
| Preview voice speed row: Slow / Natural / Fast | Removed as a duplicate row. Replaced by one "Preview selected speed" button. | Preview only. It plays `speakThai(previewText, audioRate)` using the selected pronunciation speed. | No independent persistence. It uses the persisted `audioRate`. | Same as `audioRate`. | Previous preview buttons played hard-coded rates but did not update or clearly reflect the saved setting. | Removed duplicate hard-coded preview controls; preview now uses selected speed. |
| Tap to play | "Audio playback" option: "Tap speaker to play" with helper text | Yes. Sets `audioAutoPlay` false, so audio plays only from speaker buttons. | `localStorage` state. For confirmed signed-in users, also `profiles.settings.audioAutoPlay` in Supabase. | Yes in Supabase after this fix; local-only per browser when logged out. | Label was vague and shared space with speed controls. | Split into its own playback group; added helper text and active state. |
| Auto-play new cards | "Audio playback" option: "Auto-play new cards" with helper text | Yes. Sets `audioAutoPlay` true; lesson and demo audio plays when the active card changes. | `localStorage` state. For confirmed signed-in users, also `profiles.settings.audioAutoPlay` in Supabase. | Yes in Supabase after this fix; local-only per browser when logged out. | Label/helper was unclear, and demo cards did not use the setting. | Split into its own playback group; added helper text; passed `audioAutoPlay` into `DemoMode`. |
| Show lesson characters: On / Off | Two selectable buttons with active state | Yes. `CardsTab` and `DemoMode` gate `CharacterCoach` rendering with `showCharacters`. | `localStorage` state. For confirmed signed-in users, also `profiles.settings.showCharacters` in Supabase. | Yes in Supabase after this fix; local-only per browser when logged out. | Demo back side did not show the coach when enabled, so the setting was not consistently visible through reveal. | Demo back side now renders the coach when enabled; Off hides characters in demo and lessons. |
| Daily XP goal: 25 / 50 / 100 / 200 XP | Four aligned goal buttons with active state | Yes. `dailyGoal` affects daily-goal progress and bonus threshold in `startStudyDay`, plus Today/Learn/Quests displays. | `localStorage` state and `user_stats.daily_goal` in Supabase via existing stats sync. | Yes in Supabase before and after this fix; local-only per browser when logged out. | Active visual state was overridden by `.setting-goal-btn`; `200 XP` could wrap on mobile. | Added goal-grid CSS and `.setting-goal-btn.setting-toggle-active`; forced one-line goal labels. |
| Current stage selection if present | Read-only Current stage panel | It is not a user-selectable setting. Stage is derived from onboarding/progress and unlock rules. | `localStorage` state and `user_stats.current_stage` / `user_stats.started_stage` in Supabase. | Yes in Supabase before and after this fix. | No functional bug. The copy could imply selection if read too quickly. | Kept read-only; clarified copy that stages are earned, not selected here. |

## Persistence Findings

- `localStorage`: The app stores the full local state under `thai-fluency-state-v1` through `src/lib/storage.js`. This includes `viewMode`, `audioRate`, `audioAutoPlay`, `showCharacters`, and `dailyGoal`.
- Supabase before this pass: `dailyGoal`, current stage, and other gamification stats were saved in `user_stats` through `uploadStats`. Non-gamification settings such as `viewMode`, `audioRate`, `audioAutoPlay`, and `showCharacters` were local-only even though `profiles.settings` already existed.
- Supabase after this pass: `viewMode`, `audioRate`, `audioAutoPlay`, and `showCharacters` are loaded from and saved to `profiles.settings` for confirmed signed-in users. `dailyGoal` remains in `user_stats.daily_goal`.
- User-specific behavior: Supabase-backed settings are tied to `auth.users.id` and protected by existing row-level security policies. LocalStorage remains browser-local and is not user-specific by itself, although sign-out clears the local app state.
- Same user on another device: after this pass, the listed profile settings and daily XP goal should follow the signed-in user. Progress and stats already synced through existing cloud tables.
- Logged-out demo user: Settings is not exposed in demo mode. Demo mode can consume existing local settings if present on the browser, but a logged-out demo user cannot change Settings from the demo UI.

## Database Notes

No migration was applied. The existing `profiles.settings jsonb default '{}'::jsonb` column is the safe user-preferences store used by this fix.

Recommended future work: add typed validation or generated documentation for the `profiles.settings` JSON shape, and decide whether out-of-scope controls such as Theme and Voice / Perspective should also move fully into cloud preferences.
