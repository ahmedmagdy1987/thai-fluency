import React, { useState, useMemo } from 'react';
import { ChevronLeft, Mail, Check, Circle } from 'lucide-react';
import { supabase } from '../../lib/supabase.js';

// Server-side password policy (set in Supabase dashboard):
//   - 12 chars min
//   - at least one lowercase, one uppercase, one digit
// Client-side validation mirrors these so users get inline feedback instead
// of a confusing post-submit error from the API.
const MIN_LEN = 12;
const PWD_CHECKS = [
  { id: 'length',    label: '12 characters or more', test: p => p.length >= MIN_LEN },
  { id: 'lowercase', label: 'Lowercase letter',      test: p => /[a-z]/.test(p) },
  { id: 'uppercase', label: 'Uppercase letter',      test: p => /[A-Z]/.test(p) },
  { id: 'digit',     label: 'Number',                test: p => /\d/.test(p) },
];

export default function SignUp({ onBack, onSignIn, onSuccess, prefilledEmail }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState(prefilledEmail || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  const checks = useMemo(
    () => PWD_CHECKS.map(c => ({ ...c, ok: c.test(password) })),
    [password]
  );
  const passwordValid = checks.every(c => c.ok);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!passwordValid) {
      setError('Password must meet all four requirements.');
      return;
    }
    setLoading(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { display_name: name.trim() },
          emailRedirectTo: window.location.origin + '/',
        },
      });
      if (signUpError) {
        setError(signUpError.message);
        return;
      }
      // Branch on whether the user's email is confirmed. Three cases:
      // 1. Confirmed user + session  → fully signed in (Confirm Email OFF, normal happy path)
      // 2. Unconfirmed user + null session → show "check your inbox" (Confirm Email ON, expected)
      // 3. Unconfirmed user + session    → DEFENSE: sign out and show "check your inbox" anyway.
      //    This guards against a Supabase quirk where signUp() returns a session despite
      //    Confirm Email being ON server-side. Without this, the unconfirmed user would
      //    appear "signed in" and bypass the email gate.
      const userConfirmed = !!(data.user?.email_confirmed_at);
      if (data.user && data.session && userConfirmed) {
        await supabase
          .from('profiles')
          .update({ display_name: name.trim() })
          .eq('id', data.user.id);
        onSuccess && onSuccess(data);
      } else if (data.user && !userConfirmed) {
        // If Supabase erroneously gave us a session for an unconfirmed user, drop it.
        if (data.session) {
          try { await supabase.auth.signOut(); } catch { /* ignore */ }
        }
        setNeedsConfirmation(true);
      } else {
        setError('Unexpected response from auth service. Try again.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setResent(false);
    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
        options: { emailRedirectTo: window.location.origin + '/' },
      });
      if (!resendError) setResent(true);
    } catch { /* ignore */ }
    setResending(false);
  };

  // "Check your inbox" screen — only renders when email confirmation is ON server-side.
  if (needsConfirmation) {
    return (
      <div className="onboard-root">
        <div className="onboard-card auth-card">
          <div className="auth-sent-icon"><Mail size={36} /></div>
          <div className="onboard-eyebrow">One more step</div>
          <h1 className="onboard-title">Check your email</h1>
          <p className="onboard-sub">
            We sent a confirmation link to <strong>{email.trim()}</strong>. Click the
            link to activate your account.
          </p>
          <p className="auth-confirm-note">
            The link expires in 24 hours. Don't forget to check your spam folder.
          </p>
          <button className="btn-primary auth-submit" onClick={onSignIn} type="button">
            Go to sign in
          </button>
          <div className="auth-resend-row">
            {resent ? (
              <span className="auth-resend-confirm">✓ Sent again. Check your inbox.</span>
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
        </div>
      </div>
    );
  }

  return (
    <div className="onboard-root">
      <div className="onboard-card auth-card">
        <button className="onboard-back-btn" onClick={onBack} type="button">
          <ChevronLeft size={18} /> Back
        </button>
        <div className="onboard-eyebrow">Get started</div>
        <h1 className="onboard-title">Create your account</h1>
        <p className="onboard-sub">
          Save progress to the cloud — pick up on any device. Free forever.
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="auth-label">
            <span>Your name</span>
            <input
              className="auth-input"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              autoFocus
              autoComplete="name"
            />
          </label>
          <label className="auth-label">
            <span>Email</span>
            <input
              className="auth-input"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </label>
          <label className="auth-label">
            <span>Password</span>
            <input
              className="auth-input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              aria-describedby="password-requirements"
            />
            {password.length > 0 && (
              <ul className="password-strength" id="password-requirements" aria-live="polite">
                {checks.map(c => (
                  <li key={c.id} className={c.ok ? 'pwd-check pwd-check-ok' : 'pwd-check'}>
                    {c.ok ? <Check size={14} /> : <Circle size={14} />}
                    <span>{c.label}</span>
                  </li>
                ))}
              </ul>
            )}
          </label>
          {error && <div className="auth-error">{error}</div>}
          <button
            type="submit"
            className="btn-primary auth-submit"
            disabled={loading || !name.trim() || !email.trim() || !passwordValid}
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <div className="auth-footer-text">
          Already have an account?{' '}
          <button type="button" className="auth-link" onClick={onSignIn}>Sign in</button>
        </div>
      </div>
    </div>
  );
}
