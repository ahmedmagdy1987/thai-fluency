# Push Notifications — Planning Document

**Status:** Planning only. Nothing implemented yet. This document captures everything needed to make an informed decision and the work required before code is written.

## Goal (from owner)

1. **Daily reminder**, max 1/day. Time-of-day configurable per user; default ~7pm local.
2. **Streak protection**: nudge users when their streak is at risk (study window closing).
3. **Upgrade prompts**: subtle, infrequent (not a feature for v1 — flagged for later).

---

## Service comparison

### Option A: OneSignal (recommended for v1)

**Strengths**
- Hosted, web push + iOS PWA + Android PWA all in one SDK
- Free tier: unlimited subscribers up to 10,000 web push, 10,000 mobile push
- Built-in segmentation, scheduling, A/B testing — useful if/when we want to test message variants
- Setup: ~30 minutes to working notifications
- Drop-in JS SDK; works with vite-plugin-pwa out of the box

**Weaknesses**
- Owner data lives on OneSignal's servers
- Branded "Powered by OneSignal" on free tier (small footer in opt-in dialog)
- Some PII implications — user must opt-in

**Free tier limits**
- Up to 10K subscribers (web) / 10K (mobile) free
- Unlimited notifications sent
- Pricing kicks in at "Growth" tier (~$9/mo) for >10K subscribers or advanced features

### Option B: Firebase Cloud Messaging (FCM)

**Strengths**
- Google-managed, very reliable delivery
- Free tier truly unlimited (no subscriber cap)
- Pairs well if we ever build an Android/iOS native shell via Capacitor
- More flexible — you implement scheduling yourself

**Weaknesses**
- More setup work: ~2-3 hours for first working notification
- Requires Firebase project + service worker glue
- iOS Safari support requires PWA installation (same as Web Push API)
- You manage scheduling/cron yourself (need a backend or scheduled function)
- Counter-intuitive: web setup is more complex than the native SDK

**Free tier limits**
- Truly unlimited for FCM specifically
- If you use Cloud Functions for scheduling: 2M invocations/month free, then $0.40/M

### Option C: Native Web Push API (no third party)

**Strengths**
- Zero third-party dependency, zero per-user cost
- Owner controls everything; user data never leaves us

**Weaknesses**
- **Much more code**: VAPID keys, push subscription persistence, server-side push triggering
- Requires a small backend (we have none yet — currently 100% client-side localStorage)
- Needs a daily scheduled job (cron, Vercel Cron, or similar) to trigger sends
- iOS support requires user to install the PWA (same restriction as A/B)
- Edge cases (subscription expiry, browser quirks) we have to handle ourselves

**Free tier limits**
- N/A — no service to limit. But we'd need:
  - Vercel Cron (free up to 1 job/day on hobby tier ✓ matches our needs exactly)
  - A small server function to persist subscriptions and trigger sends

---

## Recommendation: **OneSignal**

For Tuk Talk Thai's stage:
- Solo project, no backend yet — OneSignal removes the need to build one
- 30-min setup vs 2-3 hour FCM vs 1-2 day native — fastest path to "users get reminders"
- 10K free tier is far above realistic users for the foreseeable future
- Easy to migrate to FCM or native later if we outgrow OneSignal (the user-facing UX stays identical)

**If we expect to monetize and grow past 10K users in <1 year**, switch the recommendation to FCM (cheaper at scale, no vendor lock-in). For now, OneSignal.

---

## Required from owner BEFORE we can implement

1. **Create OneSignal account** at https://onesignal.com
   - Sign up with `journeypixofficial@gmail.com` (or whichever email is the project owner)
   - Create a new "Web Push" app named "Tuk Talk Thai"
   - Provide the production URL: `https://thai-fluency.vercel.app`
2. **OneSignal will generate these — copy them for me to use:**
   - `OneSignal App ID` (UUID string)
   - `Safari Web ID` (only if we want Safari desktop support)
3. **Decide consent UX:**
   - Bell prompt? (default OneSignal slidedown)
   - Or custom in-app prompt (better feel for the app, slightly more code)
   - **Recommendation**: custom prompt that fires after the user completes their first Mission 1 review session (high-intent moment)
4. **Decide default reminder time**
   - **Recommendation**: 7 PM user-local. Configurable from Settings.
5. **Approval to update privacy text**
   - Need a short blurb in Settings/onboarding: "We send daily review reminders. We never share your data. You can disable in Settings."

---

## Implementation architecture (once approved)

### Files affected
- `index.html` — add OneSignal SDK script tag
- `public/OneSignalSDKWorker.js` — service worker shim (OneSignal provides; one-line file)
- `src/lib/notifications.js` (NEW) — wrapper around OneSignal SDK; `requestPermission()`, `scheduleDaily(time)`, `setStreakAtRisk()`
- `src/components/NotificationOptIn.jsx` (NEW) — custom opt-in card shown after first session
- `src/components/SettingsModal.jsx` (EXISTING, modify) — add notification toggle + time picker
- `src/lib/stats.js` — add `notificationsEnabled: false` and `notificationTime: '19:00'` to DEFAULT_STATS

### Notification triggers
1. **Daily reminder**: scheduled in OneSignal dashboard via "User-time delivery" — fires at user's chosen local time every day
2. **Streak protection**: when user opens the app and `Date.now() - stats.lastStudy > 18 hours`, trigger an in-app warning + (if permission granted) send a push for 8 hours later
3. **Mission unlock** (bonus engagement): when a mission unlocks, send a one-time push 30 minutes later ("Try Mission 2 — At the Restaurant!")

### Message templates
- **Daily**: `สวัสดี · Your Thai is waiting. 5 cards due today.`
- **Streak risk**: `🔥 Your N-day streak resets in 6 hours. One quick review keeps it alive.`
- **Mission unlocked**: `🎉 Mission {N} unlocked: {name}. Tap to start.`

Variation will be needed eventually; OneSignal supports message A/B testing on the free tier.

### Privacy & opt-out
- Permission ALWAYS opt-in, never default-on
- Settings → Notifications has a single master toggle plus time picker
- Hitting "disable" removes the OneSignal user subscription via SDK call

---

## Estimated implementation time

Once owner provides OneSignal App ID:

| Task | Effort |
|---|---|
| OneSignal SDK integration + service worker | 30 min |
| Custom opt-in card component | 45 min |
| Settings UI (toggle + time picker) | 45 min |
| Wire daily-reminder schedule + streak-risk trigger | 60 min |
| Testing (desktop Chrome + iOS PWA + Android PWA) | 60 min |
| **Total** | **~4 hours** |

iOS testing requires installing the PWA via Safari ("Add to Home Screen") on a physical iPhone running iOS 16.4+. Desktop testing works in any modern browser.

---

## What we will NOT do in v1

- Push for marketing/upgrade prompts (owner specified "subtle, infrequent" — defer until after content milestones)
- Per-card review reminders (overwhelming)
- Marketing campaigns / re-engagement of churned users (defer)
- Rich-media notifications (images, action buttons) — possible later, not needed for v1

---

## Next action

Owner: create OneSignal account, return the App ID. Once we have it, we can implement notifications in a future session in ~4 hours of focused work.
