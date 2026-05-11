import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      // OneSignal's worker lives at public/OneSignalSDKWorker.js — it ships
      // separately from this PWA SW. Merging it via workbox.importScripts
      // didn't work in production (OneSignal v16 still tried to fetch its own
      // worker path and 404'd). Two SWs coexist: OneSignal owns push, ours
      // owns offline caching.
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
