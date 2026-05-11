import React, { useState } from 'react';
import { ChevronLeft, Mail } from 'lucide-react';
import { supabase } from '../../lib/supabase.js';

export default function ForgotPassword({ onBack }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin + '/',
      });
      if (resetError) {
        setError(resetError.message);
        return;
      }
      setSent(true);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="onboard-root">
        <div className="onboard-card auth-card">
          <div className="auth-sent-icon"><Mail size={36} /></div>
          <h1 className="onboard-title">Check your email</h1>
          <p className="onboard-sub">
            We sent a password reset link to <strong>{email}</strong>. Click the link to set a new password.
          </p>
          <button className="btn-primary auth-submit" onClick={onBack}>Back to sign in</button>
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
        <h1 className="onboard-title">Reset your password</h1>
        <p className="onboard-sub">Enter your email and we'll send a reset link.</p>

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
          {error && <div className="auth-error">{error}</div>}
          <button type="submit" className="btn-primary auth-submit" disabled={loading || !email.trim()}>
            {loading ? 'Sending…' : 'Send reset link'}
          </button>
        </form>
      </div>
    </div>
  );
}
