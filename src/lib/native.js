// Native (Capacitor) UI wiring. No-ops on web/PWA.
//
// Android (targetSdk 35+) enforces edge-to-edge, so the system status bar can
// draw OVER the WebView. We turn that off so app content starts below the
// status bar, and color the bar to match the brand header. Every call is
// guarded: the plugin is loaded only on native, and platform-specific calls
// (setBackgroundColor is Android-only) are wrapped so iOS never throws.

import { Capacitor } from '@capacitor/core';

const BRAND_DARK = '#0F3D2E';

export async function initNativeUi() {
  if (!Capacitor.isNativePlatform()) return;
  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar');
    // Push the WebView below the status bar (no overlap with the header).
    try { await StatusBar.setOverlaysWebView({ overlay: false }); } catch (_) {}
    // Dark bar with light icons, matching the dark-green app header.
    try { await StatusBar.setStyle({ style: Style.Dark }); } catch (_) {}
    try { await StatusBar.setBackgroundColor({ color: BRAND_DARK }); } catch (_) {}
  } catch (_) {
    // @capacitor/status-bar not available; nothing to do.
  }
}
