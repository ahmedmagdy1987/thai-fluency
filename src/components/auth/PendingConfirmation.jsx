import React, { useState } from 'react';
import { Mail, LogOut, RotateCw } from 'lucide-react';
import { supabase } from '../../lib/supabase.js';

// Shown when a session exists but email_confirmed_at is null. The user
// signed up (or has an account in a pre-confirmation-required state) but
// hasn't clicked the email link. Belt-and-suspenders gate — blocks app
// access on the client even if Supabase server-side mis-issues a session.
export default function PendingConfirmation({ email, onSignOut }) {
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [resendError, setResendError] = useState(null);

  const handleResend = async () => {
    setResending(true);
    setResent(false);
    setResendError(null);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: { emailRedirectTo: window.location.origin + '/' },
      });
      if (error) setResendError(error.message);
      else setResent(true);
    } catch (e) {
      setResendError('Could not resend. Try again in a moment.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="onboard-root">
      <div className="onboard-card auth-card pending-confirmation-card">
        <div className="auth-sent-icon"><Mail size={40} /></div>
        <div className="onboard-eyebrow">One more step</div>
        <h1 className="onboard-title">Confirm your email</h1>
        <p className="onboard-sub">
          We sent a confirmation link to <strong>{email}</strong>. Click the link
          to activate your account, then refresh this page.
        </p>
        <p className="auth-confirm-note">
          The link expires after a short while. Check your spam folder if you
          don't see it.
        </p>

        <div className="pending-actions">
          <button
            type="button"
            className="btn-primary auth-submit"
            onClick={() => window.location.reload()}
          >
            <RotateCw size={14} /> I confirmed — reload
          </button>

          <div className="auth-resend-row">
            {resent ? (
              <span className="auth-resend-confirm">✓ Sent again. Check your inbox.</span>
            ) : resendError ? (
              <span className="auth-error pending-resend-error">{resendError}</span>
            ) : (
              <button
                type="button"
                className="auth-link"
                onClick={handleResend}
                disabled={resending}
              >
                {resending ? 'Resending…' : "Didn't get it? Resend the email"}
              </button>
            )}
          </div>

          <button type="button" className="auth-link pending-signout" onClick={onSignOut}>
            <LogOut size={12} /> Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
