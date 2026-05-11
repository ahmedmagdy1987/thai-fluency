import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      workbox: {
        // OneSignal needs a service worker to deliver push notifications. Rather
        // than register a second SW (which would compete for scope / with this
        // one), we import OneSignal's worker code into our existing SW. This is
        // OneSignal's recommended pattern for sites with an existing SW.
        importScripts: ['https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js'],
      },
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
