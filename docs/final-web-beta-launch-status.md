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
