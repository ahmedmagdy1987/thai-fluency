import React from 'react';
import { SITE_CONFIG } from '../config/site.js';

// Branded first-frame for the app's cold-load gates (auth resolution, profile
// check, cloud sync). These moments used to render a bare empty themed <div>,
// which reads as "broken/blank" on a slow connection. A quiet centered wordmark
// + spinner makes the same wait read as "loading". Theme-aware via the app-root
// data-theme so it never flashes the wrong background.
export default function AppBootScreen({ theme = 'light', viewMode }) {
  return (
    <div className="app-root" data-theme={theme} data-view-mode={viewMode}>
      <div className="app-boot" role="status" aria-live="polite">
        <div className="app-boot-mark">{SITE_CONFIG.siteName}</div>
        <div className="app-boot-spinner" aria-hidden="true" />
        <span className="sr-only">Loading…</span>
      </div>
    </div>
  );
}
