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

## Fixed Issues

- Updated centralized `siteUrl` to the confirmed production primary: `https://www.tuktalkthai.com`.
- Updated launch checklist with production pass/fail/owner-verification status.
- Updated owner inputs to mark domain connected and support email pending confirmation.
- Added beta feedback/report issue route and checklist entries for post-deploy smoke testing.
- Removed Reset all progress from Settings.
- Added signed-in persistence for today XP, visible settings, guided first lesson progress, mini-unit progress, and Challenge aggregates.
- Rotated notification webhook auth and verified unauthenticated POST `401`, authenticated no-op webhook POST `200`, no bearer trigger headers, and no bearer cron command.

No learning logic, Thai card content, SRS scheduling, auth implementation, OneSignal app config, rewards, payments, or ads were changed. The only schema change was additive `user_stats` persistence columns for launch hardening.

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
