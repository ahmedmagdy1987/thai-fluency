// OneSignal Web Push service worker. OneSignal's SDK fetches this file
// at /OneSignalSDKWorker.js by default; we keep the standard path so the
// SDK works without overriding serviceWorkerPath. The file is copied to
// the dist root by Vite during build (anything in public/ ships as-is).
//
// We don't merge OneSignal's worker into our vite-plugin-pwa-generated
// sw.js anymore — that approach (workbox.importScripts) didn't satisfy
// OneSignal v16, which insists on registering a worker at its own path.
// The two service workers coexist: OneSignal's handles push, ours
// handles PWA offline caching.
importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');
