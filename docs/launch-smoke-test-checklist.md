# Launch Smoke Test Checklist

Run this checklist on the launch domain before public beta. Mark one result per row.

Latest technical smoke run: May 26, 2026 against `https://www.tuktalkthai.com` and `https://tuktalkthai.com`.

## Production Domain Checks

| Check | Pass | Fail | Notes |
| --- | --- | --- | --- |
| `tuktalkthai.com` resolves to the production deployment. | [x] | [ ] | Apex redirects to `https://www.tuktalkthai.com/` with HTTP 307. |
| `www.tuktalkthai.com` redirects correctly or loads correctly. | [x] | [ ] | Primary production domain loads with HTTP 200. |
| HTTPS works without browser warnings. | [x] | [ ] | Route smoke checks completed over HTTPS. |
| Direct routes work after hard refresh. | [x] | [ ] | Smoke script passed `/learn`, `/cards`, `/challenge`, `/shop`, and public pages. Re-run after feedback deployment to include `/feedback`. |
| Legal pages work at `/privacy`, `/terms`, `/support`, and `/delete-account`. | [x] | [ ] | All returned HTTP 200 on `www`; mobile/desktop screenshots checked. |
| `/OneSignalSDKWorker.js` returns the worker script. | [x] | [ ] | HTTP 200, `application/javascript`. |
| `/manifest.webmanifest` returns the PWA manifest if present. | [x] | [ ] | HTTP 200, `application/manifest+json`; name, short name, theme color, and icons checked. |
| Mobile landing renders cleanly on a real phone or device emulator. | [x] | [ ] | Checked with 390px Chromium viewport; real-device owner check still recommended. |
| Sign-up and sign-in work on the production domain. | [ ] | [ ] | Owner/test-account verification still required because inbox confirmation and account credentials are needed. |
| First guided lesson works on the production domain. | [ ] | [ ] | Owner/test-account verification still required with a fresh account. |

## Domain Check

| Check | Pass | Fail | Notes |
| --- | --- | --- | --- |
| Final domain resolves to the deployed Tuk Talk Thai app. | [x] | [ ] | `https://www.tuktalkthai.com` is production primary. |
| HTTPS works without browser warnings. | [x] | [ ] | Confirmed by route smoke checks. |
| Refreshing a deep link returns the app, not a 404. | [x] | [ ] | Direct route smoke checks passed. |

## Landing Page

| Check | Pass | Fail | Notes |
| --- | --- | --- | --- |
| Landing page loads while logged out. | [x] | [ ] | HTTP and screenshot verified. |
| Primary CTA opens the welcome/auth flow. | [x] | [ ] | Auth welcome route loads; owner should click through once on phone. |
| Sign-in CTA opens sign in. | [ ] | [ ] | Owner/test-account verification still required. |
| Footer links open Privacy, Terms, Support, Feedback, and Account Deletion. | [ ] | [ ] | Re-check after the feedback page deploys. |

## Feedback and Support

| Check | Pass | Fail | Notes |
| --- | --- | --- | --- |
| Feedback page loads at `/feedback`. | [ ] | [ ] | Re-check after deployment with the production smoke script. |
| Feedback mailto opens to `support@tuktalkthai.com`. | [ ] | [ ] | Confirm on desktop and mobile; no feedback is stored in the database. |
| Support page links to Feedback. | [ ] | [ ] | Re-check after deployment. |
| Settings/Profile/Mobile More links open Feedback while signed in. | [ ] | [ ] | Owner/test account required. |
| Support email is confirmed and monitored. | [ ] | [ ] | Owner action: confirm `support@tuktalkthai.com` exists and receives mail. |

## Sign Up

| Check | Pass | Fail | Notes |
| --- | --- | --- | --- |
| New user can create an account with valid credentials. | [ ] | [ ] | Owner/test inbox required. |
| Password validation is clear. | [ ] | [ ] | Owner/test-account verification still required. |
| Email confirmation behavior matches Supabase settings. | [ ] | [ ] | Owner/test inbox required. |

## Sign In

| Check | Pass | Fail | Notes |
| --- | --- | --- | --- |
| Existing user can sign in. | [ ] | [ ] | Owner/test account required. |
| Wrong password shows a useful error. | [ ] | [ ] | Owner/test account required. |
| Password reset flow sends the user to email reset. | [ ] | [ ] | Owner/test inbox required. |

## Sign Out

| Check | Pass | Fail | Notes |
| --- | --- | --- | --- |
| Signed-in user can sign out. | [ ] | [ ] | Owner/test account required. |
| Signed-out user returns to the public/welcome surface. | [ ] | [ ] | Owner/test account required. |
| Local protected learning state is not exposed after sign out. | [ ] | [ ] | Owner/test account required. |

## Guided First Lesson

| Check | Pass | Fail | Notes |
| --- | --- | --- | --- |
| New account sees the guided first lesson. | [ ] | [ ] | Fresh test account required. |
| Lesson can be completed on mobile and desktop. | [ ] | [ ] | Fresh test account required. |
| Completion unlocks the main learning app. | [ ] | [ ] | Fresh test account required. |

## Cards

| Check | Pass | Fail | Notes |
| --- | --- | --- | --- |
| Cards page loads. | [x] | [ ] | Direct route returns app shell; interactive review still needs signed-in smoke test. |
| Review buttons work. | [ ] | [ ] | Owner/test account required. |
| Due/new counts update after review. | [ ] | [ ] | Owner/test account required. |

## Challenge

| Check | Pass | Fail | Notes |
| --- | --- | --- | --- |
| Challenge page loads. | [x] | [ ] | Direct route returns app shell; interactive challenge still needs signed-in smoke test. |
| User can complete a challenge round. | [ ] | [ ] | Owner/test account required. |
| Score/result state appears correctly. | [ ] | [ ] | Owner/test account required. |

## Pronunciation Audio

| Check | Pass | Fail | Notes |
| --- | --- | --- | --- |
| Landing phrase audio plays after tap/click. | [ ] | [ ] | Real browser/manual audio check required. |
| Lesson/card speaker buttons play Thai audio. | [ ] | [ ] | Owner/test account required. |
| Audio speed setting affects playback. | [ ] | [ ] | Owner/test account required. |

## Sound Effects Toggle

| Check | Pass | Fail | Notes |
| --- | --- | --- | --- |
| Sound effects can be turned off in Settings. | [ ] | [ ] | Owner/test account required. |
| Feedback/celebration sounds stay muted after toggle. | [ ] | [ ] | Owner/test account required. |
| Toggle persists after refresh/sign-in sync. | [ ] | [ ] | Owner/test account required. |

## Character Toggle

| Check | Pass | Fail | Notes |
| --- | --- | --- | --- |
| Lesson characters can be turned off in Settings. | [ ] | [ ] | Owner/test account required. |
| Cards/lesson UI remains usable with characters off. | [ ] | [ ] | Owner/test account required. |
| Toggle persists after refresh/sign-in sync. | [ ] | [ ] | Owner/test account required. |

## Settings Persistence

| Check | Pass | Fail | Notes |
| --- | --- | --- | --- |
| Theme persists after refresh. | [ ] | [ ] | Owner/test account required. |
| Voice/perspective persists after refresh. | [ ] | [ ] | Owner/test account required. |
| Audio and character preferences persist. | [ ] | [ ] | Owner/test account required. |
| Settings sync on another signed-in device/session. | [ ] | [ ] | Owner/test account required. |

## OneSignal Notification Test

| Check | Pass | Fail | Notes |
| --- | --- | --- | --- |
| Test device can opt in to notifications. | [ ] | [ ] | Owner must provide a subscribed test browser/device. |
| Profile notification status updates. | [ ] | [ ] | Owner/test device required. |
| Test notification is received on the target device/browser. | [ ] | [ ] | Do one controlled send only, no mass notification. |
| Opt-out or browser permission block is handled clearly. | [ ] | [ ] | Owner/test device required. |

## Mobile Layout

| Check | Pass | Fail | Notes |
| --- | --- | --- | --- |
| Landing page fits small mobile width without overlap. | [x] | [ ] | 390px Chromium screenshot checked. |
| Bottom nav is usable. | [ ] | [ ] | Owner/test account required. |
| Lesson cards and buttons fit without clipping. | [ ] | [ ] | Owner/test account required. |
| Public legal/support pages are readable on mobile. | [x] | [ ] | 390px Chromium screenshot checked. |

## Dark Mode

| Check | Pass | Fail | Notes |
| --- | --- | --- | --- |
| Dark mode can be enabled. | [ ] | [ ] | Owner/test account required. |
| Core learning screens remain readable. | [ ] | [ ] | Owner/test account required. |
| Public legal/support pages remain readable. | [ ] | [ ] | Owner/test account required. |

## Direct Routes

| Route | Pass | Fail | Notes |
| --- | --- | --- | --- |
| `/learn` | [x] | [ ] | HTTP 200 on `www`; apex redirects to `www`. |
| `/cards` | [x] | [ ] | HTTP 200 on `www`; apex redirects to `www`. |
| `/challenge` | [x] | [ ] | HTTP 200 on `www`; apex redirects to `www`. |
| `/shop` | [x] | [ ] | HTTP 200 on `www`; apex redirects to `www`. |
| `/privacy` | [x] | [ ] | HTTP 200 on `www`; apex redirects to `www`. |
| `/terms` | [x] | [ ] | HTTP 200 on `www`; apex redirects to `www`. |
| `/support` | [x] | [ ] | HTTP 200 on `www`; apex redirects to `www`. |
| `/feedback` | [ ] | [ ] | Re-run production smoke after deployment. |
| `/delete-account` | [x] | [ ] | HTTP 200 on `www`; apex redirects to `www`. |
