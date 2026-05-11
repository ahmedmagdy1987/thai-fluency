import React, { useState } from 'react';
import { ChevronLeft, UserPlus } from 'lucide-react';
import { supabase } from '../../lib/supabase.js';

export default function SignIn({ onBack, onSignUp, onForgot, onSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  // error: null OR { kind: 'wrong-password' | 'no-account' | 'unconfirmed' | 'other', message }
  const [error, setError] = useState(null);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  const handleResendConfirmation = async () => {
    setResending(true);
    setResent(false);
    try {
      await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
        options: { emailRedirectTo: window.location.origin + '/' },
      });
      setResent(true);
    } catch { /* ignore */ }
    setResending(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInError) {
        // Supabase's "Email not confirmed" message is returned when the user
        // tries to sign in before clicking the confirmation link.
        if (/email\s*not\s*confirmed/i.test(signInError.message)) {
          setError({ kind: 'unconfirmed', message: 'Please confirm your email before signing in. Check your inbox for the link we sent when you signed up.' });
          return;
        }
        // Supabase returns the same "Invalid login credentials" for both
        // wrong password and no account, by design. We probe the public
        // email_exists RPC to give the user the right next step.
        if (signInError.message === 'Invalid login credentials') {
          try {
            const { data: exists, error: rpcError } = await supabase
              .rpc('email_exists', { check_email: email.trim() });
            if (rpcError) throw rpcError;
            if (exists) {
              setError({ kind: 'wrong-password', message: 'Invalid credentials. Please check your password.' });
            } else {
              setError({ kind: 'no-account', message: 'No account found with this email.' });
            }
          } catch {
            setError({ kind: 'other', message: signInError.message });
          }
        } else {
          setError({ kind: 'other', message: signInError.message });
        }
        return;
      }
      // Defense: if Supabase let an unconfirmed user sign in (it shouldn't
      // when Confirm Email is ON, but project settings vary), reject the
      // session client-side and prompt the user to confirm their email.
      if (data.user && !data.user.email_confirmed_at) {
        try { await supabase.auth.signOut(); } catch { /* ignore */ }
        setError({ kind: 'unconfirmed', message: 'Please confirm your email before signing in. Check your inbox for the confirmation link.' });
        return;
      }
      onSuccess && onSuccess(data);
    } catch (err) {
      setError({ kind: 'other', message: 'Something went wrong. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const goSignUpWithEmail = () => {
    onSignUp(email.trim());
  };

  return (
    <div className="onboard-root">
      <div className="onboard-card auth-card">
        <button className="onboard-back-btn" onClick={onBack} type="button">
          <ChevronLeft size={18} /> Back
        </button>
        <div className="onboard-eyebrow">Welcome back</div>
        <h1 className="onboard-title">Sign in</h1>
        <p className="onboard-sub">Pick up where you left off.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="auth-label">
            <span>Email</span>
            <input
              className="auth-input"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
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
              autoComplete="current-password"
            />
          </label>

          {error && error.kind === 'no-account' && (
            <div className="auth-error-block">
              <div className="auth-error">{error.message}</div>
              <button type="button" className="auth-suggest-cta" onClick={goSignUpWithEmail}>
                <UserPlus size={16} /> Create an account with this email →
              </button>
            </div>
          )}
          {error && error.kind === 'wrong-password' && (
            <div className="auth-error-block">
              <div className="auth-error">{error.message}</div>
              <button type="button" className="auth-link auth-error-link" onClick={onForgot}>
                Forgot password? →
              </button>
            </div>
          )}
          {error && error.kind === 'unconfirmed' && (
            <div className="auth-error-block">
              <div className="auth-error">{error.message}</div>
              {resent ? (
                <span className="auth-resend-confirm">✓ Sent again. Check your inbox.</span>
              ) : (
                <button
                  type="button"
                  className="auth-link auth-error-link"
                  onClick={handleResendConfirmation}
                  disabled={resending}
                >
                  {resending ? 'Resending…' : 'Resend confirmation email →'}
                </button>
              )}
            </div>
          )}
          {error && error.kind === 'other' && (
            <div className="auth-error">{error.message}</div>
          )}

          <button type="submit" className="btn-primary auth-submit" disabled={loading || !email.trim() || !password}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="auth-footer-row">
          <button type="button" className="auth-link" onClick={onForgot}>Forgot password?</button>
          <button type="button" className="auth-link" onClick={() => onSignUp()}>Create an account</button>
        </div>
      </div>
    </div>
  );
}
