# Push Notifications — Tuk Talk Thai

This document covers how the notification system works, how to deploy it, and how to use it as the admin.

---

## Architecture at a glance

```
┌─────────────────┐                ┌──────────────────────┐
│  React client   │  ─SDK init─►   │  OneSignal Web SDK   │
│ (browser / PWA) │  ←player_id─   │  (CDN-loaded)        │
└────────┬────────┘                └──────────────────────┘
         │ save player_id
         ▼
┌─────────────────┐                ┌──────────────────────┐
│  Supabase DB    │ ◄─trigger──    │ Database Webhooks    │
│  profiles       │                │ (configured in UI)   │
│  user_stats     │                └──────────┬───────────┘
│  user_missions  │                           │
└────────┬────────┘                           ▼
         │                          ┌──────────────────────┐
         │ pg_cron hourly tick ────►│ Edge Function:       │
         │ (mode: "tick")           │ send-notification    │
         │                          │ • picks variant      │
         └─Database Webhook─────────►│ • checks user prefs  │
           (mode: "send")           │ • anti-spam cooldown │
                                    │ • POSTs to OneSignal │
                                    └──────────┬───────────┘
                                               │
                                               ▼
                                    ┌──────────────────────┐
                                    │  OneSignal API       │
                                    │  → delivers push     │
                                    │  → user's device     │
                                    └──────────────────────┘
```

---

## The five notification types

| Type | Trigger | When it fires | Default message |
|---|---|---|---|
| `daily_reminder` | pg_cron hourly tick | 1 hour before user's typical study time (default 19:00 local), if they haven't studied today | "🌱 Your Thai practice is waiting." (3 variants rotated daily) |
| `streak_warning` | pg_cron hourly tick | At 22:00 local time, if user has 3+ day streak AND hasn't studied today | "🔥 Don't lose your N-day streak — quick 5-min review keeps it alive" |
| `milestone` (mission) | Database Webhook on `user_missions` insert/update | Immediately when `completed=true` is written | "🎉 Mission N complete! Tap to start the next one." |
| `milestone` (stage) | Database Webhook on `user_stats` UPDATE | Immediately when `current_stage` increments | "👑 Stage N complete! Onward — Stage N+1 unlocked." |
| `milestone` (XP) | Database Webhook on `user_stats` UPDATE | When `total_xp` crosses 100/500/1000/5000 | "✨ N XP earned! Your momentum is paying off." |
| `re_engagement` | pg_cron hourly tick | At typical study hour, if user hasn't been active in 7+ days | "We miss you 🇹🇭 — your Thai is waiting" (3 variants) |
| `new_content` | Admin manually from OneSignal dashboard | Whenever | Custom by admin |

All except `new_content` respect the user's per-type toggle in their Profile → Notifications panel.

---

## Smart timing

Per-user data:
- `profiles.timezone` — IANA TZ (e.g. `Asia/Bangkok`), auto-detected from browser on first sign-in
- `user_stats.typical_study_hour` — 0-23, defaults to 19 (7 PM)
- `user_stats.last_active_date` — when they last studied
- `user_stats.current_streak` — for streak warnings
- `user_stats.last_notification_sent_at` — anti-spam (60-min cooldown for non-milestone types)

The Edge Function `tick` handler converts UTC "now" to each user's local hour and matches against the trigger conditions per type. Non-matching users are skipped silently.

---

## ⚙️ One-time setup (do this in order)

### 1. Deploy the Edge Function

Two options:

**Option A — Supabase CLI:**
```bash
supabase functions deploy send-notification --project-ref fkebzcywofzloaqeghtn
```

**Option B — Dashboard paste:**
1. Supabase Dashboard → **Edge Functions** → **Create a new function**
2. Name: `send-notification`
3. Paste the contents of `supabase/functions/send-notification/index.ts` into the editor
4. Click **Deploy**

### 2. Set Edge Function secrets

Supabase Dashboard → **Edge Functions** → **Manage secrets** → add two secrets:

| Name | Value |
|---|---|
| `ONESIGNAL_APP_ID` | `9dff8341-a44c-4b22-a863-467baabd6f7d` |
| `ONESIGNAL_REST_API_KEY` | *(your OneSignal REST API Key — sensitive, never commit)* |

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are auto-injected by Supabase; don't add them manually.

### 3. Run migration 004 (with your service_role_key)

1. Get your service_role_key: **Project Settings → API → service_role** → Reveal → copy
2. Open `supabase/migrations/004_notification_scheduler.sql`
3. **Replace `YOUR_SERVICE_ROLE_KEY_HERE`** (appears twice) with the actual key
4. Paste the whole file into Supabase SQL Editor → **Run**

This:
- Enables `pg_net` + `pg_cron` extensions
- Stores the service_role_key in Vault
- Creates the `tick_notifications()` SQL helper
- Schedules the hourly cron job

Verify:
```sql
select jobname, schedule from cron.job where jobname = 'tuk-talk-notification-tick';
-- Should return one row with schedule '5 * * * *'
```

### 4. Configure Database Webhooks for milestone events

Supabase Dashboard → **Database** → **Webhooks** → **Create a new hook**.

**Webhook 1 — Mission completion:**
- Name: `mission_complete_notify`
- Table: `user_missions`
- Events: ✓ Insert, ✓ Update
- Type: HTTP Request
- Method: POST
- URL: `https://fkebzcywofzloaqeghtn.supabase.co/functions/v1/send-notification`
- HTTP Headers:
  - `Content-Type: application/json`
  - `Authorization: Bearer <service_role_key>` *(paste the same one from step 3)*
- HTTP Params: leave blank
- **Save**

**Webhook 2 — Stage / XP milestones:**
- Name: `stats_update_notify`
- Table: `user_stats`
- Events: ✓ Update (only)
- Type: HTTP Request
- Method: POST
- URL: same as above
- HTTP Headers: same as above
- **Save**

The Edge Function checks the payload internally to decide whether to send (e.g., it only sends for stage changes, not every user_stats update).

### 5. Verify end-to-end

After all the above, hit the function's health endpoint:
```bash
curl https://fkebzcywofzloaqeghtn.supabase.co/functions/v1/send-notification \
  -H "Authorization: Bearer <anon_key>"
```

Expected: `{"ok":true,"configured":true}`

If `configured: false`, one of the four required env vars is missing. Re-check step 2.

---

## 📣 Sending a manual broadcast (new_content)

For new-content announcements, **don't write code** — use OneSignal's dashboard:

1. Log in to https://onesignal.com → your "Tuk Talk Thai" app
2. **Messages** → **New Push** → **New Message**
3. Audience: **Subscribed Users** (or filter by segment if you have one)
4. Message:
   - Title: e.g. `New cards added: 50 Pimsleur vocab`
   - Body: e.g. `Tap to review the latest additions.`
   - Launch URL: `https://thai-fluency.vercel.app/`
5. **Delivery Schedule**:
   - Choose **"Send to each user at their typical timezone"** (avoid 11 PM - 7 AM)
   - Or **"Intelligent Delivery"** if you want OneSignal to learn from past opens
6. **Review & Send**

OneSignal handles delivery timing per user's timezone automatically.

---

## 🧪 Testing checklist

Reference: each test scenario the system needs to handle.

### Setup verification
- [ ] OneSignal SDK initialized — `OneSignal` available in browser console after sign-in
- [ ] Subscription ID saved — check `profiles.onesignal_player_id` is populated after the user grants permission
- [ ] Timezone saved — check `profiles.timezone` (should match the browser's `Intl.DateTimeFormat().resolvedOptions().timeZone`)
- [ ] Edge Function health check returns `{"ok":true,"configured":true}`
- [ ] Cron job is scheduled — `select * from cron.job` shows `tuk-talk-notification-tick`

### Permission flow
- [ ] First-time visitor → no permission prompt (only after onboarding)
- [ ] Just completed placement onboarding → slide-down appears 2.5s after landing on main app
- [ ] User clicks "Allow" → browser permission dialog → permission granted → subscription_id saved
- [ ] User clicks "Not now" → no prompt repeats this session
- [ ] User dismisses browser prompt → permission goes to `denied`; NotificationSettings shows "Blocked in browser settings"

### Per-type toggles (in Profile → Notifications)
- [ ] All 5 toggles default to ON (server default in `notification_preferences`)
- [ ] Toggling off saves to cloud within 600ms (debounced)
- [ ] After toggle off, a subsequent webhook/tick for that type returns `reason: "user_disabled"` and doesn't send

### Notification types — manual trigger via the test endpoint
Manually invoke the function via `curl` to verify each type:

```bash
# Replace USER_ID with a real subscribed user's UUID; KEY with the anon_key
curl -X POST \
  https://fkebzcywofzloaqeghtn.supabase.co/functions/v1/send-notification \
  -H "Authorization: Bearer <service_role_key>" \
  -H "Content-Type: application/json" \
  -d '{"mode":"send","user_id":"USER_ID","type":"daily_reminder","data":{}}'
```

- [ ] `daily_reminder` — phone receives notification with "🌱 Your Thai practice is waiting" (or one of 3 variants)
- [ ] `streak_warning` with `{"streak": 5}` — receives "🔥 Don't lose your 5-day streak..."
- [ ] `re_engagement` with `{"days": 9}` — receives "We miss you 🇹🇭" (or variant)
- [ ] `milestone_mission` with `{"n": 2}` — receives "🎉 Mission 2 complete!"
- [ ] `milestone_stage` with `{"n": 1, "next": 2}` — receives "👑 Stage 1 complete! Onward — Stage 2 unlocked."

### End-to-end flows
- [ ] Sign up new user → complete onboarding → grant push permission → review enough cards to complete Mission 1 → receive milestone notification within 30 seconds
- [ ] Wait 22 hours then check: streak warning fires (test in dev by manually backdating `user_stats.last_active_date`)
- [ ] Sign out → next sign-in re-links OneSignal subscription cleanly

### Platform-specific
- [ ] **Desktop Chrome**: subscribe, receive notification while tab is in background
- [ ] **Desktop Edge**: same
- [ ] **Desktop Firefox**: same
- [ ] **Android Chrome**: subscribe in Chrome browser, receive notification with app icon
- [ ] **Android Chrome installed as PWA**: same
- [ ] **iOS 16.4+ Safari**: open thai-fluency.vercel.app in Safari → Share → Add to Home Screen → open the PWA tile → sign up → grant permission → receive notification (requires the PWA to be opened at least once after permission grant)

### Negative cases
- [ ] Signed-out user → no notifications (no Supabase user_id = no `onesignal_player_id` linked)
- [ ] Demo-mode user → no notifications
- [ ] User who denied permission → no notifications, NotificationSettings shows "Blocked in browser settings"
- [ ] Two notifications fired within 60 minutes → second one returns `reason: "cooldown"` and doesn't send (only milestone bypasses this)
- [ ] Notification for a user with `notification_preferences.daily_reminder = false` → returns `reason: "user_disabled"`

---

## 🐞 Troubleshooting

### "Edge Function returned 401"
The Database Webhook's `Authorization` header isn't right. Re-check it's `Bearer <service_role_key>` with the **service_role** key from Project Settings → API.

### Cron job runs but no notifications send
Check Edge Function logs (Dashboard → Edge Functions → send-notification → Logs). Most common causes:
- `ONESIGNAL_REST_API_KEY` not set → look for OneSignal 401 response
- No user has `onesignal_player_id` populated yet → tick logs `{ sent: 0, checked: 0 }`

### "OneSignal subscription not saving"
Check the browser console for OneSignal errors. Common: the user is on iOS but hasn't installed the PWA, or they denied browser permission.

### Notification arrives but tapping doesn't open the app
The Launch URL in the OneSignal payload defaults to `https://thai-fluency.vercel.app/`. If you broadcast a custom URL, ensure it's on the same origin.

---

## 🔐 Security notes

- **REST API Key** lives only in Supabase Edge Function secrets and Vault. It is not in Git, not in Vercel env vars, not in the client bundle.
- **service_role_key** lives in Supabase Vault for cron jobs and in the Database Webhook headers (configured in dashboard, not exposed to clients).
- **App ID** is intentionally public — it's bundled in the client via `VITE_ONESIGNAL_APP_ID`. Security comes from OneSignal's domain restriction (only your Site URL can subscribe).
- **CSP**: vercel.json allows `cdn.onesignal.com` for the SDK and `*.onesignal.com` / `*.os.tc` for API + image CDN. Everything else is blocked.
- **Per-user opt-out**: NotificationSettings in the Profile page lets users disable any of the 5 types. The Edge Function checks `notification_preferences` before sending.
- **Per-user permission**: users can revoke browser permission anytime in their browser site settings. NotificationSettings shows "Blocked in browser settings" and stops sending.

---

## 📐 Tuning parameters

| Constant | Where | Default | Effect |
|---|---|---|---|
| `COOLDOWN_MINUTES` | Edge Function | 60 | No two non-milestone notifications within 60 min per user |
| `typical_study_hour` | `user_stats` column | 19 (7 PM) | Per-user; computed weekly is future work |
| Cron schedule | Migration 004 | `'5 * * * *'` (hourly :05) | Hourly tick |
| Daily reminder offset | Edge Function `dispatchTick` | `typical - 1` | Sends 1 hour before typical study time |
| Streak warning hour | Edge Function | `22` (10 PM local) | Late-evening reminder before midnight reset |
| Re-engagement window | Edge Function | `daysSinceActive >= 7` | Triggered after a full week of no activity |
| XP milestone thresholds | Edge Function `MESSAGES` / `handleWebhook` | 100, 500, 1000, 5000 | Edit `milestones` array |

---

## 🚀 Future improvements (deferred)

- **Server-side `typical_study_hour` computation**: nightly job that EMAs the user's actual study times.
- **Streak-protection notification**: instead of "you're losing your streak," offer to spend a streak freeze (we already grant these).
- **Re-engagement A/B**: track which variant has the highest open rate, deprioritize losers.
- **Quiet hours per user**: let users pick a "do not notify before" window in NotificationSettings.
- **Mission unlock previews**: when M3 unlocks, send a "Getting Around starts now" notification.
- **Confirmed delivery tracking**: OneSignal Pro feature; lets us know which notifications were actually delivered (vs queued).
- **Multi-stage missions**: currently only S1 has missions. When other stages get them, update the `stage` field in user_missions inserts.
