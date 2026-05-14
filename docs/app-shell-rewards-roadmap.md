# App Shell + Rewards Roadmap

Phase 1 establishes the visual scaffold for a character-driven, dopamine-friendly Thai-learning app. **No economy logic, no database changes, no push-notification changes.** The work is intentionally cosmetic + structural so future phases can plug real systems into a known UI.

## Implemented in Phase 1

### New files

| File | Purpose |
| --- | --- |
| `src/components/AppShell.jsx` | Responsive layout wrapping: desktop sidebar + top stats bar + mobile bottom nav |
| `src/components/SidebarNav.jsx` | Desktop-only left sidebar (≥1024px) — Learn / Practice / Quests / Shop / Leaderboard / Browse / Quiz / Guide / Profile / Settings |
| `src/components/MobileNav.jsx` | Mobile bottom nav (5 slots) + "More" bottom sheet for overflow destinations |
| `src/components/TopStatsBar.jsx` | Streak / gems (placeholder) / hearts (placeholder) / XP / due-count pills |
| `src/components/LearnPath.jsx` | New Learn screen: hero "Continue" CTA, daily goal ring, S1 mission rail, full 8-stage path with per-stage character |
| `src/components/ShopScreen.jsx` | Polished Shop placeholder (Hearts, Power-ups, Character previews) |
| `src/components/QuestsScreen.jsx` | Daily quests view tied to real progress (XP, streak, due, reviews) — rewards are placeholders |
| `src/components/LeaderboardScreen.jsx` | Leaderboard placeholder explaining future opt-in model |
| `src/data/stageCharacters.js` | Frontend-only stage→character mapping w/ emoji placeholders and accent colors |
| `docs/app-shell-rewards-roadmap.md` | This file |

### Modified files

- `src/App.jsx`
  - Default tab now `learn` (was `today`)
  - Render path wrapped in `<AppShell>`; old header + bottom nav replaced
  - New routes added: `learn`, `quests`, `shop`, `leaderboard`
  - Existing routes preserved: `today`, `cards`, `browse`, `quiz`, `guide`
  - All existing state (progress, stats, stageState, missionState, session, profile, achievement toasts, mission toasts, settings modal, profile page, auth gate, demo mode, placement onboarding) is unchanged
- `src/styles/app.css`
  - Appended ~280 lines for shell + screens
  - Original `.app-header` / `.app-nav` rules untouched; shell hides them via `.app-shell-root` scope only when active

### Behaviors preserved

- AuthGate / SignIn / SignUp / ForgotPassword / pending email confirmation
- DemoMode (5-card, no progress saved)
- PlacementOnboarding (skill-level → placement test)
- CardsTab review loop + reviewOne / undoLastReview / markCardKnown
- BrowseTab / QuizTab / GuideTab content
- TodayTab still rendered when the `today` route is active (accessible via mobile "More" sheet and via internal CTAs that pass `setTab('today')`)
- Achievement / Stage-up / Mission-complete toasts
- Stage 1 complete celebration modal
- Settings modal
- ProfilePage overlay
- OneSignal init + linking + permission prompt
- Cloud sync (download/upload progress, stats, achievements)
- Migration prompt for local-only → cloud
- Sequential stage unlock (`maxUnlockedStage` filter)
- Mission unlock + auto-fired toasts via `getMissionState`

## What is placeholder only

| Surface | What is real | What is placeholder |
| --- | --- | --- |
| Top stats bar | streak, XP, due-count | gems (always 0), hearts (always 5/5) |
| Shop screen | character preview list | every price + every button is disabled. No transactions occur. |
| Quests screen | quest progress (XP, streak, due-count, reviewed-today derived from `todayXp`) | reward strings ("+15 gems", "streak freeze drop") are not awarded |
| Leaderboard | none — placeholder rows only | every entry, ranking, period |
| Character art | emoji placeholders + accent colors | original Tuk Talk Thai character art (owner is preparing assets separately) |

The placeholder values for gems/hearts are read with `??` fallbacks so the layout works even when no `stats.gems` / `stats.hearts` keys exist in storage.

## What still needs database work (future phases)

The intent is for the next phase to introduce these tables. **Do not create them yet** — each is listed only for planning. Every table needs RLS policies before going live.

### Proposed tables

#### `user_wallets`
- `user_id uuid primary key references auth.users(id) on delete cascade`
- `gems integer not null default 0`
- `hearts integer not null default 5`
- `hearts_max integer not null default 5`
- `last_heart_refill timestamptz`
- `updated_at timestamptz default now()`

RLS: `select` / `update` where `auth.uid() = user_id`. No `insert` from clients — populate via trigger on `auth.users` insert. No `delete` from clients.

#### `user_inventory`
- `id bigint generated always as identity primary key`
- `user_id uuid not null references auth.users(id) on delete cascade`
- `item_id text not null references shop_items(id)`
- `qty integer not null default 1`
- `expires_at timestamptz` (for time-limited power-ups)
- `created_at timestamptz default now()`
- Index on `(user_id, item_id)`

RLS: `select` where `auth.uid() = user_id`. `insert` / `update` should be routed through an Edge Function (`purchase-item`) that also debits `user_wallets.gems`. Clients never write directly.

#### `user_daily_quests`
- `id bigint generated always as identity primary key`
- `user_id uuid not null references auth.users(id) on delete cascade`
- `quest_date date not null`
- `quest_id text not null` (matches a frontend `QUESTS` definition)
- `progress integer not null default 0`
- `target integer not null`
- `completed boolean not null default false`
- `claimed boolean not null default false`
- `created_at timestamptz default now()`
- Unique on `(user_id, quest_date, quest_id)`

RLS: `select` where `auth.uid() = user_id`. `insert` / `update` via Edge Function that validates the progress delta against the actual user activity. Reward issuance (gems → `user_wallets`) handled inside the function.

#### `shop_items`
- `id text primary key`
- `kind text not null` (`hearts`, `power_up`, `character_skin`)
- `name text not null`
- `description text`
- `price_gems integer`
- `price_cents integer` (for future IAP)
- `active boolean default true`
- `metadata jsonb default '{}'::jsonb`

RLS: `select` to all authenticated. `insert` / `update` / `delete` admin-only.

#### `character_unlocks`
- `id bigint generated always as identity primary key`
- `user_id uuid not null references auth.users(id) on delete cascade`
- `character_id text not null` (matches `stageCharacters.js`)
- `unlocked_at timestamptz default now()`
- Unique on `(user_id, character_id)`

RLS: `select` where `auth.uid() = user_id`. `insert` via Edge Function (validate against wallet / progression). No client direct write.

#### `user_selected_character`
- `user_id uuid primary key references auth.users(id) on delete cascade`
- `character_id text not null`
- `updated_at timestamptz default now()`

RLS: `select` / `update` where `auth.uid() = user_id`. Only allow selection of `character_id` that exists in `character_unlocks` for that user — enforce via trigger.

### Proposed first migration

Suggested name when this phase ships: `005_economy_foundation.sql`.

Order of operations:
1. Create `shop_items` and seed initial rows (hearts refill, unlimited-hearts boost, streak freeze, double-XP boost).
2. Create `user_wallets` + trigger to insert a row on `auth.users` insert.
3. Create `user_inventory`, `user_daily_quests`, `character_unlocks`, `user_selected_character`.
4. Backfill `user_wallets` for existing users.
5. Add Edge Functions: `purchase-item`, `record-quest-progress`, `select-character`.
6. Wire UI (replace placeholders in `TopStatsBar`, `ShopScreen`, `QuestsScreen`).

### Hearts mechanics — explicitly deferred

The current learning engine does **not** deduct hearts on wrong answers, and **must not** until:
- `user_wallets` exists.
- A regeneration policy is decided (timed regen, gem refill, or hybrid).
- A "no hearts" lockout UX is designed (do not punish the user mid-mission without forewarning).
- Tests cover the deduct/regen edge cases.

## Risks and follow-up steps

- **Risk: tab key collisions.** New tabs (`learn`, `quests`, `shop`, `leaderboard`) join existing string keys (`today`, `cards`, `browse`, `quiz`, `guide`). All routing in `App.jsx` and the navs is centralized through a single `tab` string — no children carry their own router. Adding tabs in the future is one entry per nav file plus one `tab ===` branch in App.jsx.
- **Risk: dark mode coverage.** The new shell uses CSS variables (`--card-bg`, `--cream-warm`, `--line`, etc.) so it inherits dark mode for free. A few accent colors (e.g. `#FFB7C2` for shop hearts pill) are hard-coded — review on dark mode pass.
- **Risk: mobile horizontal scroll.** `.app-shell-root` uses `min-width: 0` on the main column; the `learn-path-node-btn` uses `grid-template-columns: 72px 1fr 24px` to keep flex children bounded. Confirm on iPhone SE (375px) before shipping.
- **Risk: missing character art.** `stageCharacters.js` returns a safe fallback (`✨ Tuk Talk`) if a stage is unmapped — UI will never crash. When real art lands, swap `placeholderEmoji` → `<img src="/characters/${id}.png" />` in `LearnPath.jsx` and `ShopScreen.jsx`.
- **Risk: TodayTab discoverability.** Today is no longer the default tab and no longer in primary nav. It's reachable from the mobile "More" sheet, but desktop users would need a sidebar Explore item or a Learn-screen link. Recommend adding "Today" as a desktop sidebar Explore entry in Phase 2 once we decide whether TodayTab survives long-term or gets folded into LearnPath.
- **Follow-up: Profile sidebar entry vs. account dropdown.** The desktop sidebar already includes a Profile entry that calls `onOpenProfile`. The header keeps `UserMenu` for parity with mobile users who go through "More". If both feel redundant after user testing, remove the header user menu on desktop only.
- **Follow-up: route persistence.** Tabs are not URL-backed. If browser-back / shareable links matter, introduce React Router in a future phase — would not have been worth it in Phase 1.
- **Follow-up: real progression-based quest seeding.** `QuestsScreen` currently derives `reviewsToday` from `todayXp / XP_REWARDS.good`. That is an approximation, not a count. Track real per-day review counts in `stats` (e.g. `reviewsToday` + `reviewsTodayDate`) when wiring the real quest system.
- **Follow-up: leaderboard privacy review.** Anything that surfaces other users' data needs an explicit consent flow + sign-off from legal text (`src/components/legal`). Do not enable leaderboard reads without that.
