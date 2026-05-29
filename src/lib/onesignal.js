// OneSignal Web SDK wrapper. The SDK is loaded LAZILY via dynamic import the
// first time any helper is called — NOT at module top level. Reason:
// statically importing `react-onesignal` at the top of this file triggered
// a "Cannot access 'qa' before initialization" TDZ error in production
// builds, which crashed the whole app to a blank screen. The error came
// from a circular dependency inside react-onesignal's bundling that
// Vite's tree-shaking exposed. Dynamic import isolates the SDK chunk and
// avoids the static-import init order entirely.
//
// The App ID is public by design (security comes from domain restriction
// in the OneSignal dashboard). The REST API Key NEVER appears in client
// code — it lives only in Supabase Edge Function secrets and is used
// server-side.

const APP_ID = import.meta.env.VITE_ONESIGNAL_APP_ID || '';
export const hasOneSignalConfig = !!APP_ID;

// Push notifications are a best-effort enhancement, never load-bearing. SDK
// hiccups (version drift, missing methods, blocked permission) must NEVER
// surface as scary console errors in production. `debug` logs only in dev so
// we keep visibility while developing without spamming users' consoles.
const IS_DEV = !!(import.meta.env && import.meta.env.DEV);
function debug(...args) {
  if (IS_DEV) console.info('[onesignal]', ...args);
}

let OneSignal = null;
let initPromise = null;
let initialized = false;

// Lazy-loads react-onesignal AND calls OneSignal.init() on first invocation.
// Subsequent calls return the cached promise. Returns true if the SDK is
// usable, false otherwise (missing config, init error, network error).
async function ensureLoaded() {
  if (!hasOneSignalConfig) return false;
  if (initialized) return true;
  if (initPromise) {
    await initPromise;
    return initialized;
  }
  initPromise = (async () => {
    try {
      const mod = await import('react-onesignal');
      OneSignal = (mod && mod.default) || mod;
      if (!OneSignal || typeof OneSignal.init !== 'function') {
        throw new Error('react-onesignal did not expose an init() method');
      }
      await OneSignal.init({
        appId: APP_ID,
        // Worker lives at /OneSignalSDKWorker.js (public/ folder, copied to
        // dist root by Vite). That's OneSignal v16's default path, so no
        // serviceWorkerPath override is needed. OneSignal's SW coexists with
        // our vite-plugin-pwa SW — separate scripts, both at scope '/'.
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
        allowLocalhostAsSecureOrigin: true,
        welcomeNotification: { disable: true },
        notifyButton: { enable: false },
      });
      initialized = true;
    } catch (e) {
      const message = String(e?.message || e || '');
      // An "already initialized" SDK is a non-fatal no-op, not an error.
      if (/already initialized/i.test(message)) {
        initialized = true;
        return;
      }
      debug('init skipped', message);
      OneSignal = null;
      initialized = false;
      initPromise = null;
    }
  })();
  await initPromise;
  return initialized;
}

export async function initOneSignal() {
  return ensureLoaded();
}

export async function promptForPushPermission() {
  if (!(await ensureLoaded())) return false;
  try {
    if (typeof OneSignal?.Slidedown?.promptPush !== 'function') {
      debug('prompt unavailable on this SDK build');
      return false;
    }
    await OneSignal.Slidedown.promptPush();
    return true;
  } catch (e) {
    debug('prompt failed', e?.message || e);
    return false;
  }
}

export async function getPushSubscription() {
  const fallback = { id: null, optedIn: false, permission: 'unsupported' };
  if (!(await ensureLoaded())) return fallback;
  try {
    const sub = OneSignal.User.PushSubscription;
    const permission = typeof Notification !== 'undefined' ? Notification.permission : 'unsupported';
    return {
      id: sub?.id || null,
      optedIn: !!sub?.optedIn,
      permission,
    };
  } catch {
    return fallback;
  }
}

export async function setExternalUserId(userId) {
  if (!userId) return;
  if (!(await ensureLoaded())) return;
  // Guard the API surface: a `login` method missing on the loaded build is
  // exactly what produced the "OneSignal login failed TypeError" in prod.
  // Treat it as a non-fatal no-op rather than throwing/warning.
  if (typeof OneSignal?.login !== 'function') {
    debug('login() unavailable on this SDK build — skipping user link');
    return;
  }
  try {
    await OneSignal.login(String(userId));
  } catch (e) {
    debug('login failed', e?.message || e);
  }
}

export async function clearExternalUserId() {
  if (!(await ensureLoaded())) return;
  if (typeof OneSignal?.logout !== 'function') {
    debug('logout() unavailable on this SDK build — skipping');
    return;
  }
  try {
    await OneSignal.logout();
  } catch (e) {
    debug('logout failed', e?.message || e);
  }
}

export async function onSubscriptionChange(callback) {
  if (!(await ensureLoaded())) return () => {};
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

export async function setPushOptIn(optIn) {
  if (!(await ensureLoaded())) return;
  const sub = OneSignal?.User?.PushSubscription;
  if (!sub || typeof sub.optIn !== 'function' || typeof sub.optOut !== 'function') {
    debug('PushSubscription opt-in/out unavailable on this SDK build');
    return;
  }
  try {
    if (optIn) await sub.optIn();
    else await sub.optOut();
  } catch (e) {
    debug('opt-in/out failed', e?.message || e);
  }
}

// Browser-side IANA timezone detection. Synchronous; safe to call without
// loading the SDK. Used by the smart-timing logic when saving the user's TZ.
export function detectTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || null;
  } catch {
    return null;
  }
}
