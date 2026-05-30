# Mobile Push Notification Notes

_For the mobile foundation (Capacitor). Last updated: May 30, 2026._
_No OneSignal secrets were changed and no test pushes were sent by this task._

## Current state (web push)

- The web app uses **OneSignal** web push. Its service worker ships separately at
  `public/OneSignalSDKWorker.js` (it does NOT merge into the vite-plugin-pwa SW —
  two SWs coexist: OneSignal owns push, ours owns offline caching).
- Init + linking live in `src/lib/onesignal.js` and `src/App.jsx`
  (`initOneSignal`, `hasOneSignalConfig`, linked to the Supabase user once email is
  confirmed). App ID comes from `import.meta.env.VITE_ONESIGNAL_APP_ID` (no secret
  committed).
- The notification-preferences UI handles not-configured / unsupported / denied /
  default / granted states.
- The send path is an existing Supabase Edge Function (`send-notification`); this
  task did not touch it and sent nothing.

## What changes for native push (later work)

Web push (the Service Worker + browser Push API) does **not** work reliably inside
a native WebView. Native push uses APNs (iOS) and FCM (Android) and a native SDK:

1. **Add the OneSignal native plugin:** `onesignal-cordova-plugin` (works with
   Capacitor) — replaces/augments the web `react-onesignal` path when running
   natively. Gate initialization on `Capacitor.isNativePlatform()`.
2. **Android (FCM):**
   - Create/locate the Firebase project for `com.tuktalkthai.app`, download
     `google-services.json` into `android/app/` (gitignored by the Capacitor
     template — keep it out of version control).
   - Add the FCM Server Key / Service Account to OneSignal's Android settings.
3. **iOS (APNs):**
   - Enable the Push Notifications capability + an APNs key/cert in the Apple
     Developer account, upload to OneSignal's iOS settings.
   - Add the Notification Service Extension if rich pushes are wanted.
4. **Permission prompt:** request native notification permission at an intentional
   moment (the web app already gates the prompt; mirror that logic natively).
5. **Linking:** keep linking the device subscription (OneSignal external user id)
   to the Supabase user, same as web.

## What cannot be tested until real device builds

- Native push delivery (APNs/FCM) — requires a signed device build + real device
  (push does not work in the iOS simulator).
- Permission prompt UX on iOS/Android.
- Background/cold-start notification taps and deep-linking from a notification.
- Token registration and the OneSignal ↔ Supabase user link on native.

## Guardrails (unchanged by this task)
- Do **not** commit `google-services.json`, APNs keys, OneSignal REST API keys, or
  any secret. The Android `.gitignore` already excludes `google-services.json`.
- Do **not** trigger a mass/test send without a single, controlled subscribed test
  device (see `final-web-beta-launch-status.md` → OneSignal Production Check).

## Summary checklist (owner / later task)
- [ ] Add `onesignal-cordova-plugin`; gate native init on `isNativePlatform()`.
- [ ] Android: Firebase project + `google-services.json` (uncommitted) + FCM key in OneSignal.
- [ ] iOS: APNs key + Push capability + upload to OneSignal.
- [ ] Native permission prompt at an intentional moment.
- [ ] Real-device test: receive, tap, deep-link, and verify Supabase user link.
