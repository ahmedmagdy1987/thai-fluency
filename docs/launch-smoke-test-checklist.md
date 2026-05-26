# Launch Smoke Test Checklist

Run this checklist on the launch domain before public beta. Mark one result per row.

## Production Domain Checks

| Check | Pass | Fail | Notes |
| --- | --- | --- | --- |
| `tuktalkthai.com` resolves to the production deployment. | [ ] | [ ] |  |
| `www.tuktalkthai.com` redirects correctly or loads correctly. | [ ] | [ ] |  |
| HTTPS works without browser warnings. | [ ] | [ ] |  |
| Direct routes work after hard refresh. | [ ] | [ ] |  |
| Legal pages work at `/privacy`, `/terms`, `/support`, and `/delete-account`. | [ ] | [ ] |  |
| `/OneSignalSDKWorker.js` returns the worker script. | [ ] | [ ] |  |
| `/manifest.webmanifest` returns the PWA manifest if present. | [ ] | [ ] |  |
| Mobile landing renders cleanly on a real phone or device emulator. | [ ] | [ ] |  |
| Sign-up and sign-in work on the production domain. | [ ] | [ ] |  |
| First guided lesson works on the production domain. | [ ] | [ ] |  |

## Domain Check

| Check | Pass | Fail | Notes |
| --- | --- | --- | --- |
| Final domain resolves to the deployed Tuk Talk Thai app. | [ ] | [ ] |  |
| HTTPS works without browser warnings. | [ ] | [ ] |  |
| Refreshing a deep link returns the app, not a 404. | [ ] | [ ] |  |

## Landing Page

| Check | Pass | Fail | Notes |
| --- | --- | --- | --- |
| Landing page loads while logged out. | [ ] | [ ] |  |
| Primary CTA opens the welcome/auth flow. | [ ] | [ ] |  |
| Sign-in CTA opens sign in. | [ ] | [ ] |  |
| Footer links open Privacy, Terms, Support, and Account Deletion. | [ ] | [ ] |  |

## Sign Up

| Check | Pass | Fail | Notes |
| --- | --- | --- | --- |
| New user can create an account with valid credentials. | [ ] | [ ] |  |
| Password validation is clear. | [ ] | [ ] |  |
| Email confirmation behavior matches Supabase settings. | [ ] | [ ] |  |

## Sign In

| Check | Pass | Fail | Notes |
| --- | --- | --- | --- |
| Existing user can sign in. | [ ] | [ ] |  |
| Wrong password shows a useful error. | [ ] | [ ] |  |
| Password reset flow sends the user to email reset. | [ ] | [ ] |  |

## Sign Out

| Check | Pass | Fail | Notes |
| --- | --- | --- | --- |
| Signed-in user can sign out. | [ ] | [ ] |  |
| Signed-out user returns to the public/welcome surface. | [ ] | [ ] |  |
| Local protected learning state is not exposed after sign out. | [ ] | [ ] |  |

## Guided First Lesson

| Check | Pass | Fail | Notes |
| --- | --- | --- | --- |
| New account sees the guided first lesson. | [ ] | [ ] |  |
| Lesson can be completed on mobile and desktop. | [ ] | [ ] |  |
| Completion unlocks the main learning app. | [ ] | [ ] |  |

## Cards

| Check | Pass | Fail | Notes |
| --- | --- | --- | --- |
| Cards page loads. | [ ] | [ ] |  |
| Review buttons work. | [ ] | [ ] |  |
| Due/new counts update after review. | [ ] | [ ] |  |

## Challenge

| Check | Pass | Fail | Notes |
| --- | --- | --- | --- |
| Challenge page loads. | [ ] | [ ] |  |
| User can complete a challenge round. | [ ] | [ ] |  |
| Score/result state appears correctly. | [ ] | [ ] |  |

## Pronunciation Audio

| Check | Pass | Fail | Notes |
| --- | --- | --- | --- |
| Landing phrase audio plays after tap/click. | [ ] | [ ] |  |
| Lesson/card speaker buttons play Thai audio. | [ ] | [ ] |  |
| Audio speed setting affects playback. | [ ] | [ ] |  |

## Sound Effects Toggle

| Check | Pass | Fail | Notes |
| --- | --- | --- | --- |
| Sound effects can be turned off in Settings. | [ ] | [ ] |  |
| Feedback/celebration sounds stay muted after toggle. | [ ] | [ ] |  |
| Toggle persists after refresh/sign-in sync. | [ ] | [ ] |  |

## Character Toggle

| Check | Pass | Fail | Notes |
| --- | --- | --- | --- |
| Lesson characters can be turned off in Settings. | [ ] | [ ] |  |
| Cards/lesson UI remains usable with characters off. | [ ] | [ ] |  |
| Toggle persists after refresh/sign-in sync. | [ ] | [ ] |  |

## Settings Persistence

| Check | Pass | Fail | Notes |
| --- | --- | --- | --- |
| Theme persists after refresh. | [ ] | [ ] |  |
| Voice/perspective persists after refresh. | [ ] | [ ] |  |
| Audio and character preferences persist. | [ ] | [ ] |  |
| Settings sync on another signed-in device/session. | [ ] | [ ] |  |

## OneSignal Notification Test

| Check | Pass | Fail | Notes |
| --- | --- | --- | --- |
| Test device can opt in to notifications. | [ ] | [ ] |  |
| Profile notification status updates. | [ ] | [ ] |  |
| Test notification is received on the target device/browser. | [ ] | [ ] |  |
| Opt-out or browser permission block is handled clearly. | [ ] | [ ] |  |

## Mobile Layout

| Check | Pass | Fail | Notes |
| --- | --- | --- | --- |
| Landing page fits small mobile width without overlap. | [ ] | [ ] |  |
| Bottom nav is usable. | [ ] | [ ] |  |
| Lesson cards and buttons fit without clipping. | [ ] | [ ] |  |
| Public legal/support pages are readable on mobile. | [ ] | [ ] |  |

## Dark Mode

| Check | Pass | Fail | Notes |
| --- | --- | --- | --- |
| Dark mode can be enabled. | [ ] | [ ] |  |
| Core learning screens remain readable. | [ ] | [ ] |  |
| Public legal/support pages remain readable. | [ ] | [ ] |  |

## Direct Routes

| Route | Pass | Fail | Notes |
| --- | --- | --- | --- |
| `/learn` | [ ] | [ ] |  |
| `/cards` | [ ] | [ ] |  |
| `/challenge` | [ ] | [ ] |  |
| `/shop` | [ ] | [ ] |  |
| `/privacy` | [ ] | [ ] |  |
| `/terms` | [ ] | [ ] |  |
| `/support` | [ ] | [ ] |  |
| `/delete-account` | [ ] | [ ] |  |
