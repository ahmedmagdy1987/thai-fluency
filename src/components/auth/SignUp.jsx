import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase.js';

export default function SignUp({ onBack, onSignIn, onSuccess, prefilledEmail }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState(prefilledEmail || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { display_name: name.trim() } },
      });
      if (signUpError) {
        setError(signUpError.message);
        return;
      }
      // The handle_new_user trigger created the profile row; set display_name on it.
      if (data.user) {
        await supabase
          .from('profiles')
          .update({ display_name: name.trim() })
          .eq('id', data.user.id);
      }
      onSuccess && onSuccess(data);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
              minLength={8}
              placeholder="8 characters or more"
              autoComplete="new-password"
            />
          </label>
          {error && <div className="auth-error">{error}</div>}
          <button type="submit" className="btn-primary auth-submit" disabled={loading || !name.trim() || !email.trim() || password.length < 8}>
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
