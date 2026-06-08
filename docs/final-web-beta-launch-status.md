# Final Web Beta Launch Status

Date: May 26, 2026

## Final Readiness Score

**91/100: technically ready for a controlled public web/PWA beta, pending owner-only checks.**

The production domain, public routes, legal/support pages, PWA manifest, public assets, OneSignal worker, persistence hardening, and build all pass technical smoke checks. The remaining risk is owner-controlled: legal approval, support mailbox confirmation, a real test account/inbox pass, and one controlled OneSignal device test.

## Production Domain Status

| Item | Result | Notes |
| --- | --- | --- |
| Production primary | Pass | `https://www.tuktalkthai.com` loads with HTTP 200. |
| Apex domain | Pass | `https://tuktalkthai.com` redirects to `https://www.tuktalkthai.com/` with HTTP 307. |
| Old Vercel domain | Pass | `https://thai-fluency.vercel.app` redirects to `https://www.tuktalkthai.com/` with HTTP 308. |
| HTTPS | Pass | Smoke checks completed over HTTPS without route failures. |

## Smoke Test Results

Command run:

```bash
node scripts/smoke-production-routes.mjs https://www.tuktalkthai.com
node scripts/smoke-production-routes.mjs https://tuktalkthai.com
node scripts/smoke-production-routes.mjs https://thai-fluency.vercel.app
```

| Route | `www` result | Apex result | Old Vercel result |
| --- | --- | --- | --- |
| `/` | 200 | 307 -> `www`, final 200 | 308 -> `www`, final 200 |
| `/learn` | 200 | 307 -> `www`, final 200 | 308 -> `www`, final 200 |
| `/cards` | 200 | 307 -> `www`, final 200 | 308 -> `www`, final 200 |
| `/challenge` | 200 | 307 -> `www`, final 200 | 308 -> `www`, final 200 |
| `/shop` | 200 | 307 -> `www`, final 200 | 308 -> `www`, final 200 |
| `/privacy` | 200 | 307 -> `www`, final 200 | 308 -> `www`, final 200 |
| `/terms` | 200 | 307 -> `www`, final 200 | 308 -> `www`, final 200 |
| `/support` | 200 | 307 -> `www`, final 200 | 308 -> `www`, final 200 |
| `/feedback` | Pending deployment re-smoke | Pending deployment re-smoke | Pending deployment re-smoke |
| `/delete-account` | 200 | 307 -> `www`, final 200 | 308 -> `www`, final 200 |
| `/OneSignalSDKWorker.js` | 200 | 307 -> `www`, final 200 | 308 -> `www`, final 200 |
| `/manifest.webmanifest` | 200 | 307 -> `www`, final 200 | 308 -> `www`, final 200 |

## PWA Readiness

| Item | Result | Notes |
| --- | --- | --- |
| Manifest | Pass | `application/manifest+json`, name `Tuk Talk Thai`, short name `Tuk Talk`, display `standalone`. |
| Theme color | Pass | `#0F3D2E`, matches brand green. |
| Background color | Pass | `#F5F0E5`. |
| Icons | Pass | `pwa-192x192.png`, `pwa-512x512.png`, `apple-touch-icon.png`, and `favicon.svg` load on production. |
| Service worker assets | Pass | PWA build generates `sw.js`; OneSignal worker remains separate at `/OneSignalSDKWorker.js`. |
| Icon approval | Owner action | If final icon art is not approved, approve at least 192x192 PNG, 512x512 PNG, 512x512 maskable PNG, Apple touch icon, and favicon SVG before broad marketing. |

## OneSignal Production Check

| Item | Result | Notes |
| --- | --- | --- |
| Worker route | Pass | `/OneSignalSDKWorker.js` returns HTTP 200 and JavaScript on `www`. |
| Notification settings UI | Code/static pass | UI is present in Profile and handles not configured, unsupported, denied, default, and granted states. |
| Edge Function health | Pass | `GET https://fkebzcywofzloaqeghtn.supabase.co/functions/v1/send-notification` returned `{"ok":true,"configured":true}`. |
| Mass notification safety | Pass | No POST/send operation was run. |
| Controlled push test | Owner action | Requires a real subscribed test device/browser on `https://www.tuktalkthai.com`. Send one controlled test only after the device subscription is visible. |
| Backend webhook auth exposure | Pass | `NOTIFICATION_WEBHOOK_SECRET` was rotated. DB webhook triggers use `X-Tuk-Notification-Secret`; sanitized verification found zero Authorization/Bearer trigger headers. Cron calls `public.tick_notifications()` and its command has no bearer auth. |

## Beta Feedback Status

| Item | Result | Notes |
| --- | --- | --- |
| Feedback route | Ready pending deployment | `/feedback` is a public route using the existing public-page navigation pattern. |
| Feedback categories | Ready pending deployment | Covers bugs, incorrect Thai content, audio/pronunciation issues, account/login issues, and general feedback. |
| Email feedback flow | Ready pending deployment | Opens `mailto:support@tuktalkthai.com` with a beta feedback subject and issue template. |
| Storage/data changes | Pass | No database tables, external services, schema changes, or feedback persistence were added. |
| Support mailbox | Owner action | Confirm `support@tuktalkthai.com` exists, receives mail, and is monitored before inviting testers. |

## Reward and Premium Motivation Status

| Item | Result | Notes |
| --- | --- | --- |
| Mission Complete reward | Ready pending deployment | Full-screen reward appears after guided first lesson completion, Stage 1 mission completion, and mini-unit completion. |
| XP count-up | Ready pending deployment | XP animates from 0 to the earned amount and respects reduced-motion preferences. |
| XP sound | Ready pending deployment | Short generated tick sound plays only when Sound effects are enabled. |
| Super page | Ready pending deployment | `/premium` presents Tuk Talk Thai Super as coming soon/founder offer coming soon, with no checkout or payment claim. |
| Upgrade prompt | Ready pending deployment | Shows only after positive/intentional moments and is capped at once per day through `profiles.settings` or localStorage fallback. |
| Locked messaging | Ready pending deployment | First lesson, locked stages, Quests, Shop, and Leaderboard now explain progressive unlocks or preview status more clearly. |

## Persistence Hardening Status

| Item | Result | Notes |
| --- | --- | --- |
| Reset all progress | Pass | Removed from user-facing Settings UI/actions. |
| Today XP | Pass | Signed-in users sync `today_xp`, `today_xp_date`, and `last_xp_activity_at` through `public.user_stats`. |
| Visible settings | Pass | Learning mode, audio rate, auto-play, sound effects, show characters, theme, voice, and daily XP goal persist for signed-in users. |
| Guided first lesson | Pass | Completion and in-progress step state sync through `profiles.settings`. |
| Mini-unit progress | Pass | Active unit, current step state, and completed unit IDs sync through `profiles.settings`. |
| Challenge aggregates | Pass | Attempts, correct/wrong answers, last challenge date, and best score sync through `public.user_stats`. |
| Feedback/deletion | Pass | Mailto/support workflow remains honest; no fake in-app storage. |
| Shop/economy | Pass | Shop and leaderboard remain preview-only; purchase buttons are disabled. |
| Migration | Pass | `005_launch_persistence_hardening.sql` applied to live Supabase project. |
| RLS | Pass | New `user_stats` columns are protected by existing own-row RLS policies. |

## P0 Stability Update

| Item | Result | Notes |
| --- | --- | --- |
| Hard-refresh white screen | Fixed pending deployment verification | `autoBreakdown()` and progress helpers now guard null/undefined inputs before `Object.keys` access. |
| OneSignal double init warning | Fixed pending deployment verification | SDK init now treats an already-initialized SDK as success and does not repeatedly log `[onesignal] init failed`. |
| Mission-scoped practice | Fixed | Starting from a mission now opens only that mission's card IDs. Mission 1 is 29 cards and cannot continue into unrelated Stage 1 cards. |
| Stage progress clarity | Fixed | Stage UI shows learned/seen progress plus mastered progress. Mission 1 completion visibly changes Stage 1 to 29 learned / 150 even when mastered remains 0. |
| XP farming | Fixed | Rating buttons lock immediately, duplicate review guards ignore repeated clicks, skip gives no XP, mission bonuses and achievement unlocks fire once. |
| Local XP sync prompt | Removed | Local anonymous progress auto-syncs only when the signed-in cloud account is empty; no blocking transfer prompt is shown. |
| Local production preview | Pass | `npm.cmd run build`, local route smoke, and Playwright screenshots for `/`, `/learn`, `/cards`, `/challenge`, `/premium`, `/shop`, `/privacy` passed. |

## Fixed Issues

- Updated centralized `siteUrl` to the confirmed production primary: `https://www.tuktalkthai.com`.
- Updated launch checklist with production pass/fail/owner-verification status.
- Updated owner inputs to mark domain connected and support email pending confirmation.
- Added beta feedback/report issue route and checklist entries for post-deploy smoke testing.
- Added Mission Complete reward screen with XP count-up and sound-effects-aware tick audio.
- Added Tuk Talk Thai Super coming-soon page, once-per-day upgrade prompt, and clearer progressive unlock copy.
- Removed Reset all progress from Settings.
- Added signed-in persistence for today XP, visible settings, guided first lesson progress, mini-unit progress, and Challenge aggregates.
- Removed the local XP/progress migration prompt and replaced it with safe automatic sync when cloud state is empty.
- Fixed the null `Object.keys` hard-refresh crash path.
- Made OneSignal initialization idempotent.
- Scoped mission card sessions and added anti-XP-farming guards.
- Clarified learned vs mastered Stage progress.
- Rotated notification webhook auth and verified unauthenticated POST `401`, authenticated no-op webhook POST `200`, no bearer trigger headers, and no bearer cron command.

No Thai card content, SRS scheduling, Challenge answer generation, auth implementation, OneSignal app config, payments, or ads were changed. The only schema change was additive `user_stats` persistence columns for launch hardening. The reward/premium layer is motivational and coming-soon only; it does not add paid entitlements or real shop purchases.

## Remaining Owner Actions

1. Confirm `support@tuktalkthai.com` exists, receives mail, and is monitored.
2. Send one test feedback email from `/feedback` on desktop and mobile after deployment.
3. Approve Privacy Policy and Terms of Use with the final legal/business name.
4. Create or provide one fresh production test account and inbox access for sign-up/email-confirmation/password-reset testing.
5. Complete one returning-user sign-in/sign-out smoke test.
6. Complete one guided first lesson on a fresh account and confirm unlock into the main app.
7. Provide a subscribed OneSignal test device/browser and approve one controlled push notification test.
8. Approve final app icon assets and launch screenshots.
9. Confirm launch date and beta support availability.
10. Have a native speaker do one launch-critical pass over visible Thai phrases and audio.

## Go/No-Go Recommendation

**Conditional GO for a controlled public web/PWA beta after the owner-only checks above are completed.**

Do not run a broad launch campaign until support email, legal approval, fresh account flow, first lesson completion, and one controlled OneSignal device test are confirmed.

## Manual Phone Test

Run these on a real mobile device before posting publicly:

| Test | Expected Result |
| --- | --- |
| Open `https://www.tuktalkthai.com` | Landing page fits without horizontal scroll or overlap. |
| Tap phrase audio buttons | Audio plays after tap. |
| Tap Get started | Welcome/auth flow opens. |
| Create a fresh account | Signup works and email confirmation behavior is correct. |
| Complete first guided lesson | Main app unlocks after completion. |
| Open More menu | Browse, Guide, Leaderboard, Profile, Settings are reachable. |
| Open Settings | Sound effects, characters, audio speed, Privacy, Terms, Support, Feedback, and Account Deletion are reachable. |
| Open Feedback | Email feedback button opens a draft to `support@tuktalkthai.com`. |
| Complete a reward event | Mission Complete screen appears; Sound effects OFF suppresses XP tick audio. |
| Open Super | `/premium` loads and clearly says coming soon with no payment flow. |
| Review one Card | Card reveal and rating buttons work. |
| Complete one Challenge round | Options, feedback, and result state work. |
| Sign out and sign in | Returning-user state loads correctly. |
| Enable notifications on test device | Permission prompt and profile notification state behave correctly. |

## Beta Launch Message Checklist

Before posting:

| Item | Status |
| --- | --- |
| Final URL is `https://www.tuktalkthai.com`. | Ready |
| Positioning says web/PWA beta, not native app-store launch. | Ready |
| Mention free beta unless monetization decision changes. | Owner confirm |
| Include support email `support@tuktalkthai.com`. | Pending mailbox confirmation |
| Ask testers to use the Feedback page or Report an issue link for bugs, content mistakes, audio issues, and login issues. | Ready after deployment |
| Avoid claims of perfect translation or pronunciation. | Ready |
| Ask testers to report incorrect Thai content. | Ready |
| Ask testers to use Chrome/Edge/Safari and try Add to Home Screen. | Ready |
| Prepare a short known-issues note: notifications need opt-in, billing is not active, app-store versions are not live yet. | Ready |

## Progression QA & Anti-Rushing Fix Pass (May 29, 2026)

A production-testing pass fixed the launch-critical progression issues. Details
and definitions live in `docs/launch-critical-persistence-hardening.md`
("Progression Correctness & Anti-Rushing Pass"). Summary of what changed and the
QA performed:

### Issues fixed

| Issue found in testing | Fix |
| --- | --- |
| Stage 1 showed 150/150 learned, 0/150 mastered, but Stage 2 did not unlock. | Stage completion now keys off **learned (all cards seen)**, not mastery. `getStageState` recomputes on load, so existing 150/150 users unlock Stage 2 immediately. Legacy ≥70%-matured unlock is kept as an OR so no one is re-locked. |
| App could be rushed by pressing **Easy** repeatedly. | Anti-rushing XP throttle: >5 consecutive high-value ratings faster than 1300 ms cap XP at 1, with a gentle "Quick pass saved" nudge. SRS/learned/unlock are unaffected; mastery still needs real review. Skip stays 0 XP; mission reward fires once. |
| Learned vs mastered was confusing. | Copy clarified everywhere: "`N` learned · `N` mastered through review"; completed stage shows "Stage N complete — keep reviewing to master them"; mastery is no longer framed as a blocker. |
| Practice page could dead-end at "no cards due". | Empty state now offers **Continue your path** and **Try a Challenge**, or "You're caught up" when the whole deck is seen. |
| Console: "OneSignal login failed TypeError". | SDK calls guarded with `typeof` checks; warnings downgraded to dev-only `debug()`. Non-fatal, notification flow intact. |
| Console: AudioContext created/resumed before a user gesture. | `AudioContext` is created only after the first real user gesture; no warning on load; first legitimate sound still plays. |

### Routes / states tested

| Check | Result |
| --- | --- |
| `npm run build` | Pass (pre-existing large-chunk warning only) |
| `/learn`, `/cards`, `/challenge`, `/premium`, `/shop` | Load and render |
| Stage 1 complete state (150/150 learned) | Shows "Complete" + Start Stage 2 |
| Stage 2 unlock | Unlocks on learned completion; simulated across 6 scenarios |
| Rapid Easy spam | XP throttled to 1 after the run threshold; gentle nudge shown |
| Practice empty state | Continue-path / Challenge CTAs (no dead end) |
| Sound effects ON/OFF | Honored; no AudioContext on load |
| OneSignal console | No TypeError; quiet in production |

No Thai card content, payments, ads, subscriptions, or major UI was changed, and
no database migration was applied.

## Challenge Stage Scoping (update — May 30, 2026)

The Challenge is now **stage-scoped** with a learned/unlocked-card rule:

- A Stage N Challenge uses **only Stage N cards** — for the question's correct
  answer and all distractors. Distractors are drawn from the same scoped pool,
  so they can never come from another stage.
- **Completed stages** can be challenged on their whole deck (mastery review).
- **In-progress stages** challenge **only cards the user has already learned
  (seen)** — never random unseen future cards.
- **Unstarted stages** (unlocked, 0 learned) show a Learn-first empty state:
  "Start Stage N in Learn first, then come back for a Challenge." If a stage has
  too few learned cards to build a question, a "learn a few more" message shows
  instead of borrowing cards from another stage.
- Both directions (Thai → English, English → Thai) honor the same stage +
  learned filter.

Selection logic lives in `src/lib/challengeQuestions.js`. Verified by
`node scripts/check-challenge-scope.mjs` (stage scope, learned-only, cross-stage
exclusion, empty states, distractor scope) — all assertions pass. `npm run
build` passes (pre-existing large-chunk warning only).

## Quests, Streak & Achievements Sync (update — May 30, 2026)

Fixed a contradiction where "Keep your streak alive" stayed incomplete while the
XP-goal / practice / due-review quests were complete (and vice-versa: it could
show complete on a fresh day with no activity).

Root cause: the streak quest used `done = stats.streak > 0` — the multi-day
streak COUNTER — which is decoupled from "did the user study today," is reset
only by `grantXp` (not the day-rollover effect), and is overwritten by cloud on
sign-in. It is the wrong signal for a daily quest.

What powers each quest now (one source of truth — `src/lib/dailyQuests.js`):

- **Hit your daily XP goal** — `today_xp >= daily_goal` (today_xp date-guarded).
- **Practice 10 cards today** — real count of distinct cards with `lastReview`
  today (new learning, due reviews, or stage-review), not an XP estimate; no
  double-count.
- **Review your due cards** — live `due === 0 && seen > 0`.
- **Keep your streak alive** — completes on ANY valid activity today:
  `last_active_date === today` (earned XP via learn/due/challenge/mission/
  mini-unit) **or** any card practiced today. NOT the streak counter. Resets at
  local day-rollover; lifetime streak count is still shown.

Supabase-backed signals (all per-user, RLS-protected, in `user_stats` /
`user_progress`): `today_xp`, `today_xp_date`, `last_active_date` (lastStudy),
`current_streak`, `daily_goal`, plus card `last_review` timestamps. Quests are
derived from these, so they persist through refresh and sync across devices.

Achievements: per-user in `user_achievements`; fire once (session lock +
persisted `unlockedAchievements`); no XP reward is tied to an unlock (no
double-grant). Fixed a sign-in bug where cloud achievements OVERWROTE local —
now unioned (`new Set([...local, ...cloud])`) so offline-earned achievements are
never lost or duplicated.

Verified by `node scripts/check-quest-logic.mjs` (fresh day, one card, ten cards,
challenge-only, 0-XP stage-review, no-contradiction, new-day reset, distinct
count) — all assertions pass. `npm run build` passes.

Known limitation (unchanged, documented): cloud `user_stats`/`user_progress`
merge on sign-in is last-writer / cloud-authoritative with no timestamp
reconciliation; the streak COUNTER display can briefly trail after a cross-device
sign-in before the next sync. Quest completion itself is correct because it is
derived from today-scoped fields. A timestamp-aware merge would need approval.

## Celebration Feedback System (update — May 30, 2026)

Added a three-level celebration/achievement feedback system (full detail in
`docs/reward-and-premium-strategy.md`):

- **Level 1** — `QuestCompleteToast`: each daily quest completing (tiny tick).
- **Level 2** — `AchievementUnlockedModal`: a newly-unlocked achievement
  (reuses the existing per-user, fire-once achievement queue).
- **Level 3** — `CelebrationOverlay`: all daily quests complete, a stage
  completing (≥2; Stage 1 keeps its existing celebration), and a perfect Stage
  Challenge — confetti + XP count-up + forward CTAs + a soft, once-per-day Super
  line.

Repeat prevention via `src/lib/celebrations.js` + `stats.celebratedIds`
(date-keyed daily IDs, durable stage IDs) and a one-time baseline so existing
completions are never retro-celebrated; nothing re-fires on refresh. Sounds
respect the Sound-effects setting and the first-gesture AudioContext guard;
animations respect reduced motion. No Thai content, SRS, Learn/Practice, Stage
Challenge filtering, schema, payments, ads, or subscriptions were touched.

Verified: `node scripts/check-celebrations.mjs` (27 assertions),
`check-quest-logic.mjs`, and `check-challenge-scope.mjs` pass; `npm run build`
passes; adversarial multi-agent review found no confirmed bugs.

## Mini-Unit Sentence Builder (update — May 30, 2026)

Added a tap-to-build Sentence Builder step to the guided mini-unit flow (full
detail in `docs/course-structure-roadmap.md`). New order:
`intro → vocab → sentence card → sentence builder → mini challenge → recap →
complete`. The builder is **required** before unit completion.

- `src/components/SentenceBuilder.jsx` (+ pure `src/lib/sentenceBuilder.js`):
  mobile-first tap-to-build (no drag), keyboard-usable buttons, icon+text
  feedback (not color-only), `aria-live`, tiles wrap, dark-mode covered.
- **Data:** uses the existing pilot sentence card 330 via an explicit
  `sentenceBuilder` field on the pilot unit — tokens taken from the card +
  `WORD_LOOKUP`; **no Thai card content changed or invented**.
- **XP:** +5 once per unit (guarded by persisted `builderRewardedUnits`, no
  farming); the +45 unit-completion reward is unchanged. Resume returns to the
  builder step on refresh.
- Onboarding `FirstLessonFlow` unchanged; builder is in the repeatable
  mini-unit only.

No Practice review-only, Stage Challenge filtering, Quests, Celebrations,
schema, payments, ads, or subscriptions were touched. Verified:
`node scripts/check-sentence-builder.mjs` (18 assertions) + the three existing
checks pass; `npm run build` passes.

## Stage 1 Mini-Units Expansion (update — May 30, 2026)

Stage 1 now has a clearer guided path of **5 mini-units** (was 1 pilot), all
using existing Stage-1 card ids — full detail in
`docs/course-structure-roadmap.md`:

1. Your first polite introduction (pilot) · 2. Greetings & courtesy ·
3. Yes, no & easy replies · 4. Asking where things are · 5. Prices & shopping.

- **Sentence builders on 4 of 5 units** (cards 330/312/853/850), each built only
  from the source card's own tokens (token phonetics reconstruct the card's
  phonetic; non-blank tiles are real Stage-1 words). Unit 3 omits its builder
  (single-lexical-chunk sentence). **No Thai card content changed or invented.**
- `LearnPath` lists the Stage-1 units (when in Stage 1); each launches via the
  existing mini-unit flow (`getMiniUnit`/`handleStartMiniUnit`), with a
  Completed/Review state. The onboarding `FirstLessonFlow` is unchanged.
- New `scripts/check-mini-units.mjs` validates card existence, Stage-1
  membership, intra-unit duplicates, and builder→source-card fidelity.

No SRS, Practice review-only, Stage Challenge filtering, Quests, Celebrations,
schema/migrations, payments, ads, or subscriptions were touched. Verified: all
five check scripts (`check-mini-units`, `check-sentence-builder`,
`check-celebrations`, `check-quest-logic`, `check-challenge-scope`) and the build
pass.

## Stage 1 Mini-Unit Sequencing (update — May 30, 2026)

Stage 1 mini-units now **unlock sequentially** (Unit 1 by default; Unit N
unlocks when Unit N-1 is completed) — full detail in
`docs/course-structure-roadmap.md`.

- New pure `src/lib/miniUnitSequence.js` (`getMiniUnitProgressState`) derives
  complete / current / locked from the existing `completedMiniUnits` list — **no
  new persisted field, no migration**. Existing users (pilot completed via
  onboarding) auto-see Unit 2 unlocked.
- `LearnPath` shows status badges (Complete / Current / Locked) + matching
  actions (Review / Start / Continue / disabled Locked) with clear copy; locked
  units cannot be launched.
- **Replay is XP-safe**: completion (+45) and builder (+5) rewards are guarded by
  persisted lists and the mini-unit flow grants no XP itself, so reviewing a
  completed unit farms nothing. `handleStartMiniUnit` resumes only genuine
  mid-flow saves; completed/other units start fresh.

New `scripts/check-mini-unit-sequence.mjs` validates the unlock rules
(single-frontier, all-complete, malformed-input safety, Continue-vs-Start) and
passes alongside the other 5 checks; build passes. No Thai card content,
mini-unit content, SRS, Practice review-only, Stage Challenge filtering, Quests,
Celebrations, Sentence Builder, schema, payments, ads, or subscriptions were
touched.

## Mini-Units Across All Stages (update — May 30, 2026)

The guided mini-unit system now spans **all 8 stages** (18 units total; full
detail in `docs/course-structure-roadmap.md`). LearnPath shows the **current
stage's** unit path with the same sequential unlock / completed-review / resume
behavior already shipped for Stage 1.

- 13 new themed units (2 per stage for stages 2-7, 1 for stage 8), using **only
  existing cards of each stage** (`cards.js` unchanged). **17 of 18 units** have
  a sentence builder; every builder's tokens were derived from the source
  card's own phonetic via `autoBreakdown`/`WORD_LOOKUP`, so **no Thai was
  invented** (validated by `check-mini-units.mjs` builder→source fidelity).
- `LearnPath` uses `getMiniUnitsForStage(currentStage)`; sequencing, XP-safe
  replay, and resume are unchanged. Stage unlock still follows learned/complete
  stage logic. Stage 1 is untouched.
- Coverage is intentionally partial (core themed vocab per stage); the rest of
  each deck stays available via Practice and the Stage Challenge.

`check-mini-units.mjs` (now all-stages + coverage report) and
`check-mini-unit-sequence.mjs` (per-stage sequencing) pass, alongside
`check-sentence-builder`, `check-celebrations`, `check-quest-logic`,
`check-challenge-scope`; build passes. No SRS, Practice review-only, Stage
Challenge filtering, Quests, Celebrations, schema, payments, ads, or
subscriptions touched.

## Stage 2 Deepened + Native-Review Matrix (update — May 30, 2026)

Stage 2 expanded from **2 → 10 guided mini-units** (**16 → 76** vocab cards
covered, **2 → 6** sentence builders), all using existing Stage 2 cards — detail
in `docs/course-structure-roadmap.md`. A **native-review matrix** for the
owner/native speaker is at `docs/stage-2-content-review-matrix.md` (per-unit
vocab, sentence, builder tokens, confidence, needs-review flag, plus skipped
candidates with reasons).

- 8 new themed units (talking/thinking, out & about, everyday actions II, sizes &
  speeds, skills & qualities, feelings, counting, connectors & questions);
  Stage 2's clean vocab is verb/adjective-heavy, so units group those rather than
  forcing the food/shopping themes (those cards live in later stages).
- Builders added **only when safe** (3-token, auto-derived from the source card's
  own phonetic via WORD_LOOKUP); adjective/number/connector units skip the
  builder (2-token / no clean sentence) — all skips documented.
- `LearnPath` already drives the unit list from the current stage, so Stage 2
  shows its 10-unit sequential path when Stage 2 is current; sequencing, XP-safe
  replay, and resume are unchanged.

`check-mini-units.mjs` (all-stages, Stage 2 now 76/269 covered) and the other 5
check scripts pass; build passes. No Thai card content, SRS, Practice
review-only, Stage Challenge filtering, Quests, Celebrations, schema, payments,
ads, or subscriptions touched.

## Stage 3 Deepened + Native-Review Matrix (update — May 30, 2026)

Stage 3 expanded from **2 → 12 guided mini-units** (**16 → 96** vocab cards
covered, **2 → 9** sentence builders), all using existing Stage 3 cards — detail
in `docs/course-structure-roadmap.md`. A **native-review matrix** for the
owner/native speaker is at `docs/stage-3-content-review-matrix.md` (per-unit
vocab, sentence, builder tokens, confidence, needs-review flag, plus skipped
candidates with reasons).

- 10 new themed units (people & family, everyday verbs I/II/III, describing
  things II, qualities & states, time & sequence, connectors & particles, home &
  places, animals); Stage 3's clean vocab is dominated by single-syllable verbs/
  adjectives/nouns, so units group those rather than forcing the "Getting Around"
  travel taxonomy (transport/directions cards are scarce at this stage).
- Builders added **only when safe** (3-token, auto-derived from the source card's
  own phonetic via WORD_LOOKUP, verified against the runtime CARDS); the time/
  home/animals units skip the builder (2-token / no clean split / no theme
  sentence) — all skips documented.
- `LearnPath` already drives the unit list from the current stage, so Stage 3
  shows its 12-unit sequential path when Stage 3 is current; sequencing, XP-safe
  replay, and resume are unchanged (verified, no logic change).

`check-mini-units.mjs` (all-stages, Stage 3 now 96/423 covered) and the other 5
check scripts pass; build passes. No Thai card content, SRS, Practice
review-only, Stage Challenge filtering, Quests, Celebrations, schema, payments,
ads, or subscriptions touched.

## Stage 4 Deepened + Native-Review Matrix (update — May 30, 2026)

Stage 4 expanded from **2 → 14 guided mini-units** (**16 → 112** vocab cards
covered, **2 → 12** sentence builders), all using existing Stage 4 cards — detail
in `docs/course-structure-roadmap.md`. A **native-review matrix** is at
`docs/stage-4-content-review-matrix.md` (per-unit vocab, sentence, builder tokens,
confidence, needs-review flag, plus skipped candidates with reasons).

- 12 new themed conversational units (small talk & people, plans & free time, out
  and about, distance & directions, feelings & reactions, knowing & saying,
  everyday verbs I/II, at home, describing states, leaving & going, food &
  dishes). Stage 4 is sentence-rich, so most units carry a genuine conversational
  builder (what-work, are-you-free, where-going, is-it-far, I'm-cold,
  I-understand-now, I-forgot, no-longer-needed, I'm-free, I'm-going-now).
- Builders added **only when safe** (3- and 4-token, auto-derived from the source
  card's own phonetic via WORD_LOOKUP, verified against the runtime CARDS); the
  home unit shows a sentence without a builder and food is vocab-only — all
  documented.
- `LearnPath` already drives the unit list from the current stage, so Stage 4
  shows its 14-unit sequential path when Stage 4 is current; sequencing, XP-safe
  replay, and resume are unchanged (verified, no logic change).

`check-mini-units.mjs` (all-stages, Stage 4 now 112/575 covered) and the other 5
check scripts pass; build passes. No Thai card content, SRS, Practice
review-only, Stage Challenge filtering, Quests, Celebrations, schema, payments,
ads, or subscriptions touched.

## Stage 5 Deepened + Native-Review Matrix (update — May 30, 2026)

Stage 5 expanded from **2 → 14 guided mini-units** (**16 → 112** vocab cards
covered, **2 → 14** sentence builders), all using existing Stage 5 cards — detail
in `docs/course-structure-roadmap.md`. A **native-review matrix** is at
`docs/stage-5-content-review-matrix.md` (per-unit vocab, sentence, builder tokens,
confidence, needs-review flag, plus skipped candidates with reasons).

- 12 new themed "Social Confidence" units (family & people, emotions & feelings,
  health & the body, weather & seasons, days & time, food & drink, ordering &
  money, asking & giving, compliments & praise, around town, wants & plans,
  everyday social verbs). Stage 5 is the most sentence-rich stage, so **all 12
  new units carry a genuine conversational builder** (where-from, very-happy,
  not-well, very-hot-today, what-day, want-coffee, take-this-one, water-please,
  you're-beautiful, beautiful-here, want-to-go-home, just-arrived).
- Builders added **only when safe** (3- and 4-token, auto-derived from the source
  card's own phonetic via WORD_LOOKUP, verified against the runtime CARDS). Six
  clean leftover sentences held back as one-builder-per-unit extras — documented.
- `LearnPath` already drives the unit list from the current stage, so Stage 5
  shows its 14-unit sequential path when Stage 5 is current; sequencing, XP-safe
  replay, and resume are unchanged (verified, no logic change).

`check-mini-units.mjs` (all-stages, Stage 5 now 112/701 covered) and the other 5
check scripts pass; build passes. No Thai card content, SRS, Practice
review-only, Stage Challenge filtering, Quests, Celebrations, schema, payments,
ads, or subscriptions touched.

## Stage 6 Deepened + Native-Review Matrix (update — May 30, 2026)

Stage 6 expanded from **2 → 14 guided mini-units** (**14 → 110** vocab cards
covered, **2 → 13** sentence builders), all using existing Stage 6 cards — detail
in `docs/course-structure-roadmap.md`. A **native-review matrix** is at
`docs/stage-6-content-review-matrix.md` (per-unit vocab, sentence, builder tokens,
confidence, needs-review flag, plus skipped candidates with reasons).

- 12 new themed "Intermediate Power" units (people & family, days & dates, times &
  waiting, at a restaurant, rest & home, out in town, banking & paperwork,
  emotions & moods, learning & ability, everyday verbs, explaining & confirming,
  describing qualities). 11 of the 12 carry a genuine builder — including longer
  4-/5-token intermediate lines (see-you-again, yesterday-went-to-market,
  wait-a-moment, menu-please, want-to-rest, come-back-again, can-you-come-today,
  take-care, speak-Thai, eaten-yet, some-more); the adjectives unit is vocab-only.
- Builders added **only when safe** (3- to 5-token, auto-derived from the source
  card's own phonetic via WORD_LOOKUP, verified against the runtime CARDS). Two
  clean leftover sentences held back as one-builder-per-unit extras — documented.
- `LearnPath` already drives the unit list from the current stage, so Stage 6
  shows its 14-unit sequential path when Stage 6 is current; sequencing, XP-safe
  replay, and resume are unchanged (verified, no logic change).

`check-mini-units.mjs` (all-stages, Stage 6 now 110/804 covered) and the other 5
check scripts pass; build passes. No Thai card content, SRS, Practice
review-only, Stage Challenge filtering, Quests, Celebrations, schema, payments,
ads, or subscriptions touched.

## Stage 7 Deepened + Native-Review Matrix (update — May 30, 2026)

Stage 7 expanded from **2 → 14 guided mini-units** (**16 → 112** vocab cards
covered, **2 → 12** sentence builders), all using existing Stage 7 cards — detail
in `docs/course-structure-roadmap.md`. A **native-review matrix** is at
`docs/stage-7-content-review-matrix.md` (per-unit vocab, sentence, builder tokens,
confidence, needs-review flag, plus skipped candidates with reasons).

- 12 new themed "Natural Thai" units (places around town, directions & position,
  talking & discussing, meeting people, conversation flow, feelings & reactions,
  plans & times of day, days & schedule, dining out, everyday actions, describing
  things, nature & outdoors). 10 of the 12 carry a genuine builder — including
  long natural lines (to-the-airport, stop-up-ahead, you-speak-English-well,
  glad-to-meet-you, say-it-again, thanks-for-everything, tomorrow-go-to-work,
  what-time-arrive, split-the-bill, take-me-here); the describing/nature units are
  vocab-only.
- Builders added **only when safe** (3- to 6-token, auto-derived from the source
  card's own phonetic via WORD_LOOKUP, verified against the runtime CARDS). Two
  clean leftover sentences held back as one-builder-per-unit extras — documented.
- `LearnPath` already drives the unit list from the current stage, so Stage 7
  shows its 14-unit sequential path when Stage 7 is current; sequencing, XP-safe
  replay, and resume are unchanged (verified, no logic change).

`check-mini-units.mjs` (all-stages, Stage 7 now 112/877 covered) and the other 5
check scripts pass; build passes. No Thai card content, SRS, Practice
review-only, Stage Challenge filtering, Quests, Celebrations, schema, payments,
ads, or subscriptions touched.

## Stage 8 Deepened — Course Structure Sprint COMPLETE (update — May 30, 2026)

Stage 8 expanded from **1 → 13 guided mini-units** (**6 → 102** vocab cards
covered, **1 → 13** sentence builders), all using existing Stage 8 cards — detail
in `docs/course-structure-roadmap.md`. A **native-review matrix** is at
`docs/stage-8-content-review-matrix.md`. **This completes the sprint: all 8 stages
now have guided mini-unit paths (96 units, 752 vocab covered, 83 builders).**

- 12 new "Thai Mastery" units (people & family, everyone & no one, months of the
  year, days & when, places in town, directions & distance, travel & activities,
  connectors & nuance, home & documents, decisions & opinions, likes &
  impressions, society & ideas). **All 12 carry a genuine builder** — Stage 8 is
  the most sentence-rich stage (526 sentence/phrase cards, 33 with a clean
  breakdown).
- Builders added **only when safe** (3- to 5-token, auto-derived from the source
  card's own phonetic via WORD_LOOKUP, verified against the runtime CARDS). ~20
  extra clean builders held back as one-builder-per-unit extras — documented.
- `LearnPath` already drives the unit list from the current stage, so Stage 8
  shows its 13-unit sequential path when Stage 8 is current; sequencing, XP-safe
  replay, and resume are unchanged (verified, no logic change). A per-stage
  `pathComplete` state exists; a global course-complete celebration is deferred.

`check-mini-units.mjs` (all-stages, Stage 8 now 102/992 covered) and the other 5
check scripts pass; build passes. No Thai card content, SRS, Practice
review-only, Stage Challenge filtering, Quests, Celebrations, schema, payments,
ads, or subscriptions touched.

## Course Structure Sprint COMPLETE — Native Review Pack added (update — May 30, 2026)

The Course Structure Sprint is **complete**: all 8 stages have guided mini-unit
paths — **96 mini-units, 752 guided vocab cards, 83 sentence builders** — validated
by `check-mini-units.mjs` + the other 5 check scripts, with the build passing.

**Native / owner review is now the next required content-QA step.** A complete
review package has been added so the Thai phrasing, sentence builders, tokenization,
phonetics, and meanings can be reviewed safely:

- `docs/native-review-master-checklist.md` — owner/native-friendly checklist
  (what to review, decision options, HIGH/MEDIUM/LOWER priorities).
- `docs/native-review-stage-summary.md` — at-a-glance per-stage table (units,
  guided vocab, builders, risk, review-doc links, recommended action).
- `docs/native-review-issues.md` — issue/decision tracker (template rows + the four
  already-documented medium-confidence units).
- `scripts/report-native-review-coverage.mjs` — read-only coverage report (run with
  `node scripts/report-native-review-coverage.mjs`).
- Per-stage detail remains in `docs/stage-2..8-content-review-matrix.md` (Stage 1 in
  `docs/course-structure-roadmap.md`).

**Remaining limitation:** content is **not final** until a native speaker approves
(or logs fixes for) at least the HIGH-priority stages (1–2) and MEDIUM stages (3–5).
This pack is docs + a read-only report only — no Thai card content, product logic,
schema, payments, ads, or subscriptions were touched.

## Global Course Complete celebration + state (update — May 30, 2026)

Implemented the major end-of-course milestone now that all 8 stages have guided
paths. Completion is derived purely (`src/lib/courseCompletion.js`,
`getCourseCompletion()`) from `completedMiniUnits` — `courseComplete` = every one
of the 96 guided mini-units is complete. No schema, no migration, no card changes.

- **Celebration:** when `courseComplete` transitions false→true, a one-time
  Level-3 `CelebrationOverlay` fires — "Course Complete / You completed the Tuk
  Talk Thai path." — with a progress summary (8 stages, 96 mini-units, sentence
  builders) and a one-time **+250 XP** count-up. Primary CTA "Review due cards",
  secondary "Try a Stage Challenge", soft Super line (no payment claim).
- **LearnPath state:** a persistent "Course path complete" banner appears at the
  top of Learn (Review due cards / Challenge), and the stage/unit path stays
  visible so completed units remain reviewable.
- **Repeat-prevention:** durable ledger ID `course-complete:v1` (localStorage +
  `profiles.settings.celebratedIds`) + a per-session arming snapshot. Fires once;
  refresh never repeats it; users already course-complete before this feature are
  not retro-celebrated. The +250 XP is guarded by the same ledger ID so it cannot
  be replayed/farmed (the per-unit +45 still applies to the final unit).
- **Reduced motion / sound:** inherited from the existing `CelebrationOverlay`
  (confetti/XP count-up are reduced-motion aware; sound respects Sound-effects OFF).

`scripts/check-course-completion.mjs` (24 assertions) passes; all existing check
scripts + the native-review report pass; build passes; local preview smoke passes.
No Practice review-only, Stage Challenge filtering, payments, ads, or subscriptions
touched; Quests untouched (course completion is independent of the quest system).

### Known limitations
- Course completion tracks **guided mini-units** (752 of ~4,790 cards), not 100% of
  the SRS deck — by design; the rest stays in Practice and the Stage Challenge.
- The celebration fires only on a live false→true transition in an open session
  (or the first session after completing); it intentionally does not retro-fire.
- No separate "course-complete" achievement badge was added (overlay + XP + banner
  only); a badge could be added later via the existing achievements system.

## Mobile App Foundation (Capacitor) — added May 30, 2026

The Web/PWA is now wrapped for native iOS/Android via **Capacitor 8** without
changing any product logic or Thai content. The web app remains the source of
truth and still builds/deploys unchanged.

### Capacitor setup status
- **Installed (v8.3.4 lockstep):** `@capacitor/core`, `@capacitor/cli`,
  `@capacitor/android`, plus plugins `@capacitor/app`, `@capacitor/browser`,
  `@capacitor/haptics`, `@capacitor/preferences`, `@capacitor/splash-screen`,
  `@capacitor/status-bar`. None are imported in `src/` yet (foundation only), so the
  web bundle is unaffected — `npm run build` still passes.
- **Config:** `capacitor.config.json` — `appId: com.tuktalkthai.app`,
  `appName: Tuk Talk Thai`, `webDir: dist`, splash (#0F3D2E, 1200ms, no spinner),
  status bar (dark style). No secrets.
- **Scripts:** `mobile:sync`, `mobile:android`, `mobile:ios`, `mobile:open:android`,
  `mobile:open:ios` (existing `dev`/`build`/`preview` untouched). `npx cap sync`
  validated (copies `dist`).

### Android / iOS readiness
- **Android:** project **scaffolded and committed** (`android/`, source only —
  build artifacts, `local.properties`, copied web assets, and generated config are
  gitignored). `applicationId`/`namespace` = `com.tuktalkthai.app`; 6 Capacitor
  plugins registered. **Building the APK/AAB is blocked on this machine:** needs
  **JDK 17** (only Java 8 present) and the **Android SDK / Android Studio**
  (`ANDROID_HOME` unset, no Gradle). Build on a tooled machine or CI.
  - **Re-verified May 30, 2026:** toolchain still absent — Java 8 **JRE** only (no
    `javac`/JDK 17), no Android SDK, no Android Studio, no `adb`/`gradle`,
    `JAVA_HOME`/`ANDROID_HOME`/`ANDROID_SDK_ROOT` unset. The debug-APK build was
    **not attempted** (Gradle wrapper would fail on the Java version + missing SDK);
    no app code changed. Exact one-time install steps are in
    `docs/mobile-app-launch-checklist.md` → "Android build environment setup". Web
    build + all 8 validation scripts still pass.
- **iOS:** **not generated** — requires **macOS + Xcode** (cannot be created on
  Windows). On a Mac: `npx cap add ios && npx cap open ios`. Config is ready.

### Mobile UX audit (no redesign needed)
The existing CSS already handles mobile: `viewport-fit=cover` + apple meta tags in
`index.html`; bottom navs and modals use `env(safe-area-inset-bottom)`; `overflow-x`
is clipped and media are `max-width:100%` (no horizontal overflow). The
Course-Complete banner uses wrapping flex actions. No CSS changes were made.

### Remaining mobile blockers (documented, not done here)
- **Auth deep links:** bundled-app `window.location.origin` is `localhost`, so email
  confirm / reset links won't return to the app until deep links (custom scheme or
  Universal/App Links) + Supabase redirect URLs are configured. See
  `docs/mobile-auth-notes.md`.
- **Native push:** web push doesn't work in a native WebView; needs APNs/FCM +
  OneSignal native plugin. See `docs/mobile-push-notes.md`.
- **Branded icon/splash:** Android currently uses default Capacitor art — replace
  before submission. See `docs/mobile-app-launch-checklist.md`.

### Real-device testing needed
TTS/audio behavior, safe areas, tap targets, persistence across restarts, the
Course-Complete celebration, push, and Android back-button behavior must be
verified on real device builds (full list in `docs/mobile-app-launch-checklist.md`).
No store submission was attempted. No Supabase schema, payments, ads, subscriptions,
or secrets were touched.

## Headless Android Build Toolchain + first debug APK (update — May 31, 2026)

The Android debug APK now **builds end-to-end on this Windows machine without
Android Studio**, via a command-line-only toolchain installed from official
sources (no `winget`/`choco`/`scoop` were present).

- **Key correction:** Capacitor 8 requires **JDK 21**, not JDK 17. JDK 17 was
  installed first but the build failed at
  `:capacitor-android:compileDebugJavaWithJavac` with `invalid source release: 21`
  (Capacitor's generated Gradle files pin `JavaVersion.VERSION_21`). Installing
  **Microsoft OpenJDK 21.0.11** fixed it.
- **Installed:** Microsoft OpenJDK 21 (`aka.ms`); Android cmdline-tools
  (`dl.google.com`) → `sdkmanager` v12.0; `platform-tools` (`adb`),
  `platforms;android-36`, `build-tools;36.0.0` (AGP also pulled `build-tools;35.0.0`);
  Gradle 8.14.3 run directly (wrapper download was flaky). AGP 8.13.0.
- **Result:** `npm run build` → `npx cap sync android` → `gradle assembleDebug` →
  **BUILD SUCCESSFUL** (1m 28s), producing
  `android\app\build\outputs\apk\debug\app-debug.apk` (~5.94 MB). The APK is a
  gitignored artifact and was **not committed**. No device/emulator was connected,
  so it was built but not installed.
- **Verified after build:** all 8 validation scripts pass; web build passes.
- **Untouched:** Thai card content, app learning logic, Supabase schema/migrations,
  payments, ads, subscriptions, secrets. The only working-tree changes were the two
  Capacitor-generated gradle files' line endings (restored).

**Caveat / next step:** the toolchain lives under the user profile and
`JAVA_HOME`/`ANDROID_HOME` are not persisted (a Deep Freeze restore wipes it) —
re-run the headless install after a restore or persist with `setx`. Reproducible
commands + exact paths are in `docs/mobile-app-launch-checklist.md`. Release/store
upload still needs a signing config (AAB) — an owner action. Android Studio is
**not** required for debug builds.

## Headless emulator run — WORKING (update — May 31, 2026)

USB device wasn't detected, so the debug APK was run on a **command-line emulator**
(no Android Studio). **The app installs, launches, renders, and is interactive.**
- **Accelerator:** **AEHD v2.2** (Android Emulator Hypervisor Driver) installed via
  its INF — **no reboot**. This box is legacy BIOS with no VBS/Hyper-V, so AEHD (not
  WHPX) is correct. `emulator -accel-check` → "AEHD … usable".
- **Image/AVD:** `system-images;android-36;google_apis;x86_64` + AVD
  `TukTalkThai_API36` (hand-authored; `avdmanager` can't parse the API-36 v4 SDK XML).
- **Result:** booted (`sys.boot_completed=1`, ~96 s) → `adb install` **Success** →
  `MainActivity` foregrounded, **0 app FATAL/ANR**. Renders the real landing UI
  (Thai phrase cards, not a white screen); tapping "Get started" → sign-up screen.
  Emulator internet works. Full email sign-up + deeper routes need a real test
  account + not-yet-wired mobile auth deep links (owner action). USB path still
  unresolved.

Details in `docs/mobile-app-launch-checklist.md` → "Headless emulator — WORKING".
8/8 validation scripts pass; no product code, Thai content, Supabase, payments, ads,
subscriptions, or secrets touched.

## Mobile APK UX and Audio Fix Pass (May 31, 2026)

A round of launch-critical fixes for the Android debug APK (and matching mobile
web) found during manual sideload testing. No Thai card content, app learning
logic, Supabase schema, payments, ads, subscriptions, or secrets were touched.
The web build passes, all 8 validation scripts pass, `cap sync` registers the new
plugin, and the debug APK rebuilds (now about 6.3 MB, up from about 5.94 MB
because of the native TTS module).

**Status bar / safe area (Android edge-to-edge).** Android targetSdk 36 enforces
edge-to-edge, so the system status bar drew over the header. Added
`src/lib/native.js` (`initNativeUi`, called once on mount, no-op on web) which on
native calls `StatusBar.setOverlaysWebView({ overlay: false })`, `setStyle`, and
`setBackgroundColor` (brand dark green). Added `env(safe-area-inset-top)` padding
to the top bars (`.landing-topbar`, `.app-header`, `.app-shell-header`,
`.onboard-root`); the bottom navs already used `env(safe-area-inset-bottom)`. On
normal web the inset is 0, so layouts are unchanged.

**Pronunciation audio in the APK.** Web Speech is unreliable inside the Android
WebView, so `src/lib/audio.js` now routes through the device TTS engine on native
via `@capacitor-community/text-to-speech@8.0.0` (Capacitor 8 compatible) and keeps
the hardened browser SpeechSynthesis path on web/PWA. `speakThai` now returns a
Promise that always resolves (on success, failure, or a safety timeout) so a
caller can reset a button state without it sticking. Pronunciation is independent
of the Sound-effects setting (that setting only gates game/reward blips in
`sounds.js`). Audio plays only on a user tap (no autoplay on load).

**Sound button state.** The landing phrase audio button stayed green on touch
because its `:hover` rule was not gated. Wrapped it in
`@media (hover: hover) and (pointer: fine)` and added an `:active` press state, so
it no longer sticks on mobile.

**Speaker buttons in Challenge.** Added a speaker button to the Quiz feedback row
(plays the correct Thai in both directions). Cards, first lesson, mini-units, the
demo, and the sentence builder already had speaker buttons; all use the same
`speakThai` helper.

**Landing chips.** "Smart review / Quick challenges / Device sync" now center and
wrap cleanly on narrow phones instead of one chip dropping awkwardly.

**Footer.** On mobile the public footer links now use a two-column grid, so
"Account deletion" is paired with "Super" instead of orphaned on its own line.

**Elephant coach.** The speech bubble now keeps its text until the next action
(instead of vanishing after under two seconds) and never blanks to an empty bubble
(the bare-coach glitch): `useCharacterReaction` only swaps in real text and the
auto-revert now changes the face only, not the message.

**Locked stage cards.** Replaced the cramped sentence with a clean stacked block:
"Locked", "Complete earlier stages to unlock.", and a smaller "Super early access
coming soon." (no claim that Super is active).

**Theme switching.** Light/dark now flips instantly: App.jsx adds a
`theme-switching` class to `<html>` for about 140 ms during the change and the CSS
suppresses transitions for that window, so buttons, cards, and nav recolor
together instead of lagging behind.

**Long dashes.** Removed em and en dashes from visible UI strings (six component
strings plus one course-complete subtitle in App.jsx). Remaining occurrences are
code comments and one em-dash sentinel comparison in CardsTab (it filters a
placeholder out of display and is not user-visible); data and content files were
left untouched per scope.

### Demo navigation
The demo now has a clear way back to the public landing page. App.jsx passes
`onBackToHome` to `DemoMode`, which adds a "Back to home" action on both the demo
card and the demo-complete screen (alongside Create account and Sign in). No
refresh or storage clear is needed and the auth flow is unchanged.

**Browser/mobile Back from the demo (May 31, 2026).** Starting the demo pushes a
dedicated `/demo` history entry ON TOP of the screen it was launched from (the
`/welcome` auth gate), without disturbing the entries beneath it. The browser Back
button and the Android WebView Back gesture therefore exit the demo to `/welcome`,
and Back again goes to `/get-started`, preserving the real journey through the
existing popstate router, with no full reload and no trap. `/demo` is a real route
in `getRouteForPath` and `applyRouteState`; any non-demo route turns demo mode off,
and signed-in users who land on `/demo` are redirected to Learn. The visible "Back
to home" link still returns straight to the landing (`/get-started`) by replacing
the `/demo` entry.

## Web QA Polish Pass (June 1, 2026)

A fast launch QA review (parallel reviews of the public, learn, cards/challenge,
celebrations, shell, and CSS surfaces) found the web/PWA flow clean overall. A few
small, safe CSS-only fixes were applied (no app logic, Thai content, schema,
payments, ads, subscriptions, or features touched):

- **Dark mode:** `.auth-input` used a hardcoded `background: white`, leaving sign-in
  and sign-up boxes white (and hard to read) in dark mode. Switched to the
  theme-aware `var(--card-bg)`.
- **Demo completion:** the "Back to home" link (`.demo-end-home`) had no CSS rule
  and rendered inconsistently; it now shares the centered, full-width style of the
  sign-in link.
- **Buttons:** added a `:disabled` state (used by the Quiz "Check" button) plus
  keyboard `:focus-visible` and an `:active` press state to
  `.btn-primary`/`.btn-secondary`, and a `:disabled` state to the sentence-builder
  Clear button.
- **Challenge:** tightened the stage-selector chips at 430px and below so an 8-stage
  picker wraps neatly.

Reviewed and intentionally left as-is (verified not bugs): the milestone toasts
already cap their width with `max-width: 90%` (no horizontal overflow); the reward
XP number stays large by design (XP values are short, no overflow); the "N left" and
"Tap to reveal" labels and the Stage 1 crown emoji are acceptable. No visible em or
en dashes remain in UI copy. Web build, all 8 validation scripts, and a 13-route
smoke pass; the debug APK rebuilds.

### Still needs manual on-device retest (no emulator/USB this pass)
The APK was rebuilt but could not be installed this pass (emulator deferred, USB
unreliable). After sideloading the new APK, please verify on the phone:
- Status bar no longer overlaps the header (top of landing and the main app).
- Pronunciation audio plays in landing, first lesson, Cards, and Challenge. If the
  device has no Thai TTS voice installed, audio will be silent (the button still
  resets); install a Thai voice under Android Settings, Text-to-speech if needed.
- Sound buttons never stay green.
- Footer, landing chips, locked stage cards, and the elephant bubble look clean.
- Light and dark switch feels instant.

## First Lesson Pedagogy + Gamified Feedback (June 8, 2026)

The first ~10 minutes were upgraded (pilot: Stage 1 Mission 1 only). Full
write-up + Thai accuracy notes: [first-lesson-pedagogy-notes.md](first-lesson-pedagogy-notes.md).
- Male-default learner perspective is now explicit (config + intro + primer);
  female toggle is future work.
- A short **Thai Basics Primer** (~2 min, skippable) and a 5-question **quick
  check** run before the first cards in the guided starter lesson.
- Correct/wrong answers get soft Web Audio cues (`playCorrect`/`playWrong`, gated
  by the Sound Effects setting) plus a green glow / soft nudge that respect
  `prefers-reduced-motion`.
- A motivational **mission recap** shows on the first-lesson complete screen.
- Quiz wording clarified to "word" vs "sentence" (no logic/scope change).
- TTS prefers a male Thai voice when the device exposes one; safe fallback
  otherwise (voice gender depends on installed device voices).

After sideloading the new APK, also verify: primer + quick check appear before
the first cards; correct/wrong sound + visual fire; recap shows on completion.

## Stage 1 mission intros + recaps (June 8, 2026)

Extended the guided-teaching style to the rest of Stage 1 (Stage 1 only). Full
notes: [first-lesson-pedagogy-notes.md](first-lesson-pedagogy-notes.md).
- Every Stage 1 mini-unit now shows a short, friendly **lesson intro** before the
  cards (You will learn / Why it matters / Listen for / Notice).
- The 4 remaining Stage 1 missions now show a motivational **recap** on
  completion (mission-specific headline + "now you can..." bullets). Reuses the
  existing completion sound; no extra confetti/sound on mini-units.
- The **Thai Basics primer can be re-opened** anytime via an "Open Thai basics"
  modal on the Learn path (resolves the earlier "no way to revisit" limitation).
- No Thai card content changed; new copy uses only words each unit teaches.

Manual checks after sideloading: later Stage 1 missions show intros before cards
(unlock them by finishing the prior unit); recaps show on completion; "Open Thai
basics" opens/closes; no overflow at 360-430px; Sound Effects OFF still silent.

## Stage 2 mission intros + recaps (June 8, 2026)

Extended the guided-teaching style to all of Stage 2 (Stage 2 only). Full notes:
[first-lesson-pedagogy-notes.md](first-lesson-pedagogy-notes.md);
review grid: [stage-2-content-review-matrix.md](stage-2-content-review-matrix.md).
- All 10 Stage 2 mini-units now show a short, friendly **lesson intro** before the
  cards (You will learn / Why it matters / Listen for / Notice).
- All 10 Stage 2 missions now show a motivational **recap** on completion
  (mission-specific headline + "now you can..." bullets). Reuses the existing
  completion sound; no extra confetti/sound on mini-units.
- Metadata only: no Thai card content changed; new copy uses only words each unit
  already teaches, with glosses aligned to the card data. No culture/stats, no
  fluency claims, no em/en dashes, no money symbols. Machine-linted and
  adversarially reviewed; grammar generalizations logged for native review.
- No schema, payments, ads, subscriptions, or secrets touched. APK is a build
  artifact and is not committed.

Manual checks after sideloading: Stage 2 first unlocked mission shows its intro
before the cards; Stage 2 mission completion shows the recap; later Stage 2 units
unlock sequentially; no overflow at 360-430px; Sound Effects OFF still silent;
Stage 1 primer and intros/recaps still work.

**APK status (rebuilt June 8, 2026):** the Android toolchain was installed on this
machine from official sources (Microsoft OpenJDK 21 at
`C:\Users\bdstd\toolchain\jdk-21.0.11+10`; Android SDK cmdline-tools + platform-tools
+ platforms;android-36 + build-tools;36.0.0 at `%LOCALAPPDATA%\Android\Sdk`; Gradle
8.14.3 at `C:\Users\bdstd\toolchain\gradle-8.14.3`). Web build, `npx cap sync
android`, all validation scripts, and the route smoke pass. The debug APK was rebuilt
via `scripts\android-build.cmd` (gradle assembleDebug, BUILD SUCCESSFUL):
`android\app\build\outputs\apk\debug\app-debug.apk`, last rebuilt 2026-06-08 19:25,
6,867,332 bytes (about 6.55 MB), from the latest master including the Stage 1-3
intros/recaps. The APK remains a gitignored build artifact and is not committed.

## Stage 3 mission intros + recaps (June 8, 2026)

Extended the guided-teaching style to all of Stage 3 (Stage 3 only). Full notes:
[first-lesson-pedagogy-notes.md](first-lesson-pedagogy-notes.md); review grid:
[stage-3-content-review-matrix.md](stage-3-content-review-matrix.md).
- All 12 Stage 3 mini-units now show a short, friendly **lesson intro** before the
  cards (You will learn / Why it matters / Listen for / Notice).
- All 12 Stage 3 missions now show a motivational **recap** on completion. Reuses
  the existing completion sound; no extra confetti/sound on mini-units.
- Metadata only: no Thai card content changed; new copy uses only words each unit
  already teaches, glosses aligned to the card data. No culture/stats, no fluency
  claims, no em/en dashes, no money symbols. Machine-linted and adversarially
  reviewed; grammar generalizations logged for native review.
- No schema, payments, ads, subscriptions, or secrets touched. APK rebuilt from the
  Stage 3 master (see the refreshed APK status note above); it stays gitignored and
  is not committed.

Manual checks after sideloading: Stage 3 first unlocked mission shows its intro
before the cards; Stage 3 mission completion shows the recap; later Stage 3 units
unlock sequentially; no overflow at 360-430px; Sound Effects OFF still silent;
Stage 1 and Stage 2 primer/intros/recaps still work.
