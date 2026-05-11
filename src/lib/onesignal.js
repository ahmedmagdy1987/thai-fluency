// OneSignal Web SDK wrapper. The SDK is a singleton; we lazy-init the first
// time any helper is called and reuse the same promise on subsequent calls.
//
// The App ID is public by design (security comes from domain restriction in
// the OneSignal dashboard). The REST API Key NEVER appears in client code —
// it lives only in Supabase Edge Function secrets and is used server-side.

import OneSignal from 'react-onesignal';

const APP_ID = import.meta.env.VITE_ONESIGNAL_APP_ID || '';
export const hasOneSignalConfig = !!APP_ID;

let initPromise = null;
let initialized = false;

export async function initOneSignal() {
  if (!hasOneSignalConfig) return null;
  if (initPromise) return initPromise;
  initPromise = (async () => {
    try {
      await OneSignal.init({
        appId: APP_ID,
        // Reuse the existing PWA service worker — workbox imports OneSignal's
        // worker code via importScripts (configured in vite.config.js), so a
        // single SW handles both PWA caching and push.
        serviceWorkerPath: 'sw.js',
        serviceWorkerParam: { scope: '/' },
        // We trigger the slide-down prompt manually after onboarding. No
        // auto-prompt on first visit.
        promptOptions: {
          slidedown: {
            prompts: [{
              type: 'push',
              autoPrompt: false,
              text: {
                actionMessage: "Get a daily nudge so you don't lose your streak.",
                acceptButton: 'Allow',
                cancelButton: 'Not now',
              },
            }],
          },
        },
        // Localhost is HTTP — the SDK refuses to register a SW unless we opt in.
        allowLocalhostAsSecureOrigin: true,
        // Welcome notification is turned off in the dashboard; redundant but explicit.
        welcomeNotification: { disable: true },
        // Hide the OneSignal-branded floating bell — we have our own UI in Profile.
        notifyButton: { enable: false },
      });
      initialized = true;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('[onesignal] init failed', e);
      initPromise = null;
      initialized = false;
    }
  })();
  return initPromise;
}

// Show OneSignal's slide-down asking permission. If the user accepts in the
// slide-down, the SDK then triggers the browser's native permission dialog.
export async function promptForPushPermission() {
  if (!hasOneSignalConfig) return false;
  await initOneSignal();
  if (!initialized) return false;
  try {
    await OneSignal.Slidedown.promptPush();
    return true;
  } catch (e) {
    console.warn('[onesignal] prompt failed', e);
    return false;
  }
}

// Read the current subscription state. id is the "OneSignal player ID" — the
// stable identifier we store on profiles.onesignal_player_id.
export async function getPushSubscription() {
  if (!hasOneSignalConfig) return { id: null, optedIn: false, permission: 'unsupported' };
  await initOneSignal();
  if (!initialized) return { id: null, optedIn: false, permission: 'unsupported' };
  try {
    const sub = OneSignal.User.PushSubscription;
    const permission = typeof Notification !== 'undefined' ? Notification.permission : 'unsupported';
    return {
      id: sub?.id || null,
      optedIn: !!sub?.optedIn,
      permission,
    };
  } catch {
    return { id: null, optedIn: false, permission: 'unsupported' };
  }
}

// Link the OneSignal subscription to the Supabase user. Lets us target the
// right device from the server using the Supabase user_id as external_id.
export async function setExternalUserId(userId) {
  if (!hasOneSignalConfig || !userId) return;
  await initOneSignal();
  if (!initialized) return;
  try {
    await OneSignal.login(String(userId));
  } catch (e) {
    console.warn('[onesignal] login failed', e);
  }
}

// Unlink on sign-out so this device stops receiving notifications for the
// previously-signed-in user.
export async function clearExternalUserId() {
  if (!hasOneSignalConfig) return;
  await initOneSignal();
  if (!initialized) return;
  try {
    await OneSignal.logout();
  } catch (e) {
    console.warn('[onesignal] logout failed', e);
  }
}

// Subscribe to subscription-id changes (fires when the user grants/revokes
// permission, or when the SDK rotates the token). Returns an unsubscribe fn.
export async function onSubscriptionChange(callback) {
  if (!hasOneSignalConfig) return () => {};
  await initOneSignal();
  if (!initialized) return () => {};
  const handler = (event) => {
    try {
      callback({
        id: event?.current?.id || null,
        optedIn: !!event?.current?.optedIn,
      });
    } catch { /* ignore */ }
  };
  try {
    OneSignal.User.PushSubscription.addEventListener('change', handler);
    return () => {
      try { OneSignal.User.PushSubscription.removeEventListener('change', handler); } catch { /* ignore */ }
    };
  } catch {
    return () => {};
  }
}

// Opt the user out of push without revoking browser permission. Useful for the
// per-type toggles when the user wants to keep notifications but mute one type
// — though we use server-side per-type gating via notification_preferences.
export async function setPushOptIn(optIn) {
  if (!hasOneSignalConfig) return;
  await initOneSignal();
  if (!initialized) return;
  try {
    if (optIn) await OneSignal.User.PushSubscription.optIn();
    else await OneSignal.User.PushSubscription.optOut();
  } catch (e) {
    console.warn('[onesignal] opt-in/out failed', e);
  }
}

// Detect the user's IANA timezone from the browser (e.g. "Asia/Bangkok").
// Used by the smart-timing logic to schedule notifications in local time.
export function detectTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || null;
  } catch {
    return null;
  }
}
