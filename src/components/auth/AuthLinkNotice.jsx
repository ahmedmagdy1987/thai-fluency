import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

// Friendly surface for Supabase email-link failures (expired/invalid signup
// confirmation or recovery links) that land the user back on a logged-out
// screen. Previously these errors were silently swallowed — the user clicked
// the emailed link and just saw the marketing page again with no explanation.
// Rendered as a dismissible notice above the landing / auth gate.
export default function AuthLinkNotice({ message, onSignIn, onRequestReset, onDismiss }) {
  return (
    <div className="auth-link-notice" role="alert">
      <div className="auth-link-notice-card">
        <span className="auth-link-notice-icon" aria-hidden="true"><AlertTriangle size={18} /></span>
        <div className="auth-link-notice-body">
          <strong className="auth-link-notice-title">That email link didn't work</strong>
          <p className="auth-link-notice-text">{message}</p>
          <p className="auth-link-notice-hint">
            Confirming a new account? Sign in and we'll offer to resend the confirmation email.
            Resetting a password? Request a fresh link.
          </p>
          <div className="auth-link-notice-actions">
            <button type="button" className="btn-primary auth-link-notice-btn" onClick={onSignIn}>
              Go to sign in
            </button>
            <button type="button" className="btn-secondary auth-link-notice-btn" onClick={onRequestReset}>
              New password-reset link
            </button>
          </div>
        </div>
        <button type="button" className="auth-link-notice-close" onClick={onDismiss} aria-label="Dismiss">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
