import React from 'react';

// Global error boundary at the app root (wired in main.jsx). Without it, any
// uncaught render exception unmounts the whole React tree and leaves a blank
// white page with no way out. The fallback is a friendly, theme-aware card
// with a reload button. Logging is LOCAL ONLY (console.error) — no external
// calls, no crash-reporting SDK, matching the app's no-third-party-beacons
// stance (see lib/analytics.js).
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    try {
      // eslint-disable-next-line no-console
      console.error('[ErrorBoundary] render error', error, info?.componentStack || '');
    } catch { /* logging must never throw */ }
  }

  render() {
    if (!this.state.error) return this.props.children;
    // The app mirrors the active theme onto <html data-theme> (App.jsx theme
    // effect), so it is still readable here even though the app tree crashed —
    // the fallback matches the user's light/dark preference. Reuses the
    // existing .config-error-* styles (CSS-variable driven, theme-aware).
    let theme = 'light';
    try {
      theme = document.documentElement.getAttribute('data-theme') || 'light';
    } catch { /* default to light */ }
    return (
      <div className="app-root" data-theme={theme}>
        <div className="config-error-root">
          <div className="config-error-card">
            <div className="config-error-icon">🛠️</div>
            <div className="config-error-eyebrow">Something went wrong</div>
            <h1 className="config-error-title">Tuk Talk Thai hit a snag</h1>
            <p className="config-error-body">
              Sorry about that — an unexpected error interrupted the app. Your learning progress
              is saved. Reloading usually fixes it.
            </p>
            <button
              type="button"
              className="btn-primary"
              onClick={() => { try { window.location.reload(); } catch { /* ignore */ } }}
            >
              Reload the app
            </button>
          </div>
        </div>
      </div>
    );
  }
}
