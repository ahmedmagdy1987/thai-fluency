# Final Web Beta Launch Status

Date: May 26, 2026

## Final Readiness Score

**88/100: technically ready for a controlled public web/PWA beta, pending owner-only checks.**

The production domain, public routes, legal/support pages, PWA manifest, public assets, OneSignal worker, and build all pass technical smoke checks. The remaining risk is owner-controlled: legal approval, support mailbox confirmation, a real test account/inbox pass, and one controlled OneSignal device test.

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
| Backend webhook auth exposure | Not changed | Local Edge Function code requires `X-Tuk-Notification-Secret` for POST paths. Prior audit docs still note live webhook metadata should be reviewed for bearer-token exposure before relying on automated notification cron at scale. |

## Fixed Issues

- Updated centralized `siteUrl` to the confirmed production primary: `https://www.tuktalkthai.com`.
- Updated launch checklist with production pass/fail/owner-verification status.
- Updated owner inputs to mark domain connected and support email pending confirmation.

No learning logic, Thai card content, SRS scheduling, auth implementation, OneSignal config, database schema, migrations, rewards, payments, or ads were changed.

## Remaining Owner Actions

1. Confirm `support@tuktalkthai.com` exists, receives mail, and is monitored.
2. Approve Privacy Policy and Terms of Use with the final legal/business name.
3. Create or provide one fresh production test account and inbox access for sign-up/email-confirmation/password-reset testing.
4. Complete one returning-user sign-in/sign-out smoke test.
5. Complete one guided first lesson on a fresh account and confirm unlock into the main app.
6. Provide a subscribed OneSignal test device/browser and approve one controlled push notification test.
7. Approve final app icon assets and launch screenshots.
8. Confirm launch date and beta support availability.
9. Have a native speaker do one launch-critical pass over visible Thai phrases and audio.

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
| Open Settings | Sound effects, characters, audio speed, Privacy, Terms, Support, and Account Deletion are reachable. |
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
| Avoid claims of perfect translation or pronunciation. | Ready |
| Ask testers to report incorrect Thai content. | Ready |
| Ask testers to use Chrome/Edge/Safari and try Add to Home Screen. | Ready |
| Prepare a short known-issues note: notifications need opt-in, billing is not active, app-store versions are not live yet. | Ready |
