import React, { useEffect, useMemo, useState } from 'react';
import { Check, Circle, KeyRound, Mail } from 'lucide-react';
import { supabase } from '../../lib/supabase.js';
import { friendlyAuthErrorMessage, stripAuthErrorParams } from '../../lib/authCallback.js';

// Set-new-password screen for the Supabase password-recovery flow. Reached via
// /reset-password, the redirectTo of the reset email (see ForgotPassword.jsx).
// Three modes, decided by the caller's props:
//   • hasSession (a recovery link signed the user in) → the new-password form,
//     submitting via supabase.auth.updateUser. Success keeps the session and
//     hands control back through onComplete.
//   • no session + linkError (expired/invalid link) → friendly error plus an
//     inline "send me a new link" form, so recovery never dead-ends.
//   • no session, no error → brief "checking your link…" grace state (covers
//     the moment before supabase-js consumes the URL tokens), then falls back
//     to the invalid-link state.
// Server-side password policy mirrors SignUp.jsx / ChangePasswordModal.jsx.
const PWD_CHECKS = [
  { id: 'length',    label: '12 characters or more', test: p => p.length >= 12 },
  { id: 'lowercase', label: 'Lowercase letter',      test: p => /[a-z]/.test(p) },
  { id: 'uppercase', label: 'Uppercase letter',      test: p => /[A-Z]/.test(p) },
  { id: 'digit',     label: 'Number',                test: p => /\d/.test(p) },
];

const LINK_CHECK_GRACE_MS = 6000;

export default function ResetPassword({ hasSession, linkError, onComplete }) {
  const [newPw, setNewPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  // Invalid-link fallback: inline "send a new link" mini-form.
  const [resendEmail, setResendEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendError, setResendError] = useState(null);
  const [resendSent, setResendSent] = useState(false);
  // Grace window: without a session or a captured error we may simply be ahead
  // of supabase-js consuming the URL tokens. Show "checking" briefly.
  const [graceOver, setGraceOver] = useState(!!linkError);

  useEffect(() => {
    // The captured error is now being displayed; clean the address bar so a
    // refresh doesn't re-parse a stale fragment.
    if (linkError) stripAuthErrorParams();
  }, [linkError]);

  useEffect(() => {
    if (hasSession || linkError) return undefined;
    const t = setTimeout(() => setGraceOver(true), LINK_CHECK_GRACE_MS);
    return () => clearTimeout(t);
  }, [hasSession, linkError]);

  const checks = useMemo(() => PWD_CHECKS.map(c => ({ ...c, ok: c.test(newPw) })), [newPw]);
  const newPwValid = checks.every(c => c.ok);
  const passwordsMatch = !!newPw && newPw === confirm;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!newPwValid) { setError('Your new password must meet all four requirements.'); return; }
    if (!passwordsMatch) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password: newPw });
      if (updateError) {
        setError(updateError.message);
        return;
      }
      setSuccess(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async (e) => {
    e.preventDefault();
    setResendError(null);
    setResendLoading(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(resendEmail.trim(), {
        redirectTo: window.location.origin + '/reset-password',
      });
      if (resetError) {
        setResendError(resetError.message);
        return;
      }
      setResendSent(true);
    } catch {
      setResendError('Something went wrong. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  // ── Success ──────────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="onboard-root">
        <div className="onboard-card auth-card">
          <div className="auth-sent-icon"><Check size={36} /></div>
          <h1 className="onboard-title">Password updated</h1>
          <p className="onboard-sub">
            Your new password is active and you're signed in. Use it the next time you sign in.
          </p>
          <button className="btn-primary auth-submit" onClick={onComplete}>Continue to the app</button>
        </div>
      </div>
    );
  }

  // ── Set-new-password form (recovery session established) ────────────────
  if (hasSession) {
    return (
      <div className="onboard-root">
        <div className="onboard-card auth-card">
          <div className="onboard-eyebrow"><KeyRound size={11} /> Password reset</div>
          <h1 className="onboard-title">Set a new password</h1>
          <p className="onboard-sub">You're verified. Choose a new password for your account.</p>

          <form onSubmit={handleSubmit} className="auth-form">
            <label className="auth-label">
              <span>New password</span>
              <input
                className="auth-input"
                type="password"
                value={newPw}
                onChange={e => setNewPw(e.target.value)}
                required
                autoFocus
                autoComplete="new-password"
              />
              {newPw.length > 0 && (
                <ul className="password-strength" aria-live="polite">
                  {checks.map(c => (
                    <li key={c.id} className={c.ok ? 'pwd-check pwd-check-ok' : 'pwd-check'}>
                      {c.ok ? <Check size={14} /> : <Circle size={14} />}
                      <span>{c.label}</span>
                    </li>
                  ))}
                </ul>
              )}
            </label>
            <label className="auth-label">
              <span>Confirm new password</span>
              <input
                className="auth-input"
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
                autoComplete="new-password"
              />
              {confirm.length > 0 && !passwordsMatch && (
                <div className="profile-field-hint profile-field-hint-warn">Passwords don't match</div>
              )}
            </label>
            {error && <div className="auth-error">{error}</div>}
            <button
              type="submit"
              className="btn-primary auth-submit"
              disabled={loading || !newPwValid || !passwordsMatch}
            >
              {loading ? 'Updating…' : 'Set new password'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── No session yet: checking, then invalid-link fallback ────────────────
  if (!graceOver) {
    return (
      <div className="onboard-root">
        <div className="onboard-card auth-card">
          <h1 className="onboard-title">Checking your link…</h1>
          <p className="onboard-sub">One moment while we verify your password-reset link.</p>
        </div>
      </div>
    );
  }

  const linkMessage = friendlyAuthErrorMessage(linkError)
    || 'This password-reset link is invalid or has expired.';

  if (resendSent) {
    return (
      <div className="onboard-root">
        <div className="onboard-card auth-card">
          <div className="auth-sent-icon"><Mail size={36} /></div>
          <h1 className="onboard-title">Check your email</h1>
          <p className="onboard-sub">
            We sent a fresh password-reset link to <strong>{resendEmail}</strong>. Open it on this
            device to set your new password.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="onboard-root">
      <div className="onboard-card auth-card">
        <div className="onboard-eyebrow"><KeyRound size={11} /> Password reset</div>
        <h1 className="onboard-title">This link didn't work</h1>
        <p className="onboard-sub">{linkMessage} Enter your email and we'll send a new one.</p>

        <form onSubmit={handleResend} className="auth-form">
          <label className="auth-label">
            <span>Email</span>
            <input
              className="auth-input"
              type="email"
              value={resendEmail}
              onChange={e => setResendEmail(e.target.value)}
              required
              autoFocus
              autoComplete="email"
            />
          </label>
          {resendError && <div className="auth-error">{resendError}</div>}
          <button type="submit" className="btn-primary auth-submit" disabled={resendLoading || !resendEmail.trim()}>
            {resendLoading ? 'Sending…' : 'Send a new reset link'}
          </button>
        </form>
      </div>
    </div>
  );
}
