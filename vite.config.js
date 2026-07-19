import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      // ── WAVE 15: never serve a STALE index.html ───────────────────────────
      // With the default config the service worker PRECACHES index.html and
      // serves it for every navigation, so a returning user gets the PREVIOUS
      // deploy's HTML — and therefore the previous deploy's JS bundle — on their
      // next launch. The repo's own architecture assessment calls this "one
      // version behind per launch".
      //
      // That is not a cosmetic lag: it is a delivery channel for already-fixed
      // crashes. A user whose cached HTML pointed at the Wave 13 bundle kept
      // getting the Wave 14 TDZ crash after it had been fixed and deployed —
      // which is exactly what a paying customer hit on the checkout return, and
      // why a hard refresh (which bypasses the SW) "fixed" it.
      //
      // Fix: HTML is NETWORK-FIRST. Online, a navigation always fetches the
      // current index.html, so a deploy is picked up on the very next load and a
      // hotfix can actually reach users. Offline, it falls back to the last good
      // copy in the runtime cache, so the PWA stays installable and usable.
      // Hashed assets are still precached and immutable, so this costs one small
      // HTML request, not the offline experience.
      workbox: {
        cleanupOutdatedCaches: true,
        // Do not answer navigations from the precache.
        navigateFallback: null,
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'html-shell',
              networkTimeoutSeconds: 4,   // slow network → fall back, don't hang
              expiration: { maxEntries: 8, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      // OneSignal's worker lives at public/OneSignalSDKWorker.js — it ships
      // separately from this PWA SW. Merging it via workbox.importScripts
      // didn't work in production (OneSignal v16 still tried to fetch its own
      // worker path and 404'd). The two SWs coexist ONLY because they hold
      // different scopes: this worker owns '/' (offline caching), OneSignal's
      // is registered at '/push/onesignal/' (see src/lib/onesignal.js init —
      // one registration per scope is a hard browser rule, so same-scope
      // "coexistence" is impossible and used to break both intermittently).
      manifest: {
        name: 'Tuk Talk Thai',
        short_name: 'Tuk Talk',
        description: 'Real Thai for real life in Thailand. Speak from day one.',
        theme_color: '#0F3D2E',
        background_color: '#F5F0E5',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  server: {
    host: true,
    port: 5173
  }
})
