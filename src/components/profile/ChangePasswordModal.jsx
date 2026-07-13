import React, { useState, useMemo, useEffect } from 'react';
import { X, Check, Circle, KeyRound } from 'lucide-react';
import { supabase } from '../../lib/supabase.js';

// Server-side password policy matches SignUp.jsx (Supabase dashboard setting).
const PWD_CHECKS = [
  { id: 'length',    label: '12 characters or more', test: p => p.length >= 12 },
  { id: 'lowercase', label: 'Lowercase letter',      test: p => /[a-z]/.test(p) },
  { id: 'uppercase', label: 'Uppercase letter',      test: p => /[A-Z]/.test(p) },
  { id: 'digit',     label: 'Number',                test: p => /\d/.test(p) },
];

export default function ChangePasswordModal({ email, onClose }) {
  const [current, setCurrent] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const checks = useMemo(() => PWD_CHECKS.map(c => ({ ...c, ok: c.test(newPw) })), [newPw]);
  const newPwValid = checks.every(c => c.ok);
  const passwordsMatch = !!newPw && newPw === confirm;

  // Close on Escape, matching every other modal (SettingsModal pattern).
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && onClose) onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!current) { setError('Enter your current password.'); return; }
    if (!newPwValid) { setError('New password must meet all four requirements.'); return; }
    if (!passwordsMatch) { setError('New passwords do not match.'); return; }
    if (newPw === current) { setError('New password must be different from your current one.'); return; }
    setLoading(true);
    try {
      // Re-authenticate to satisfy "Secure password change" — verifies the
      // current password without disrupting the existing session.
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password: current,
      });
      if (authError) {
        setError('Current password is incorrect.');
        return;
      }
      const { error: updateError } = await supabase.auth.updateUser({ password: newPw });
      if (updateError) {
        setError(updateError.message);
        return;
      }
      setSuccess(true);
    } catch {
      setError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal change-password-modal" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <div>
              <div className="modal-eyebrow">Done</div>
              <div className="modal-title">Password updated</div>
            </div>
            <button className="modal-close" onClick={onClose} aria-label="Close">
              <X size={20} />
            </button>
          </div>
          <div className="modal-body">
            <p className="profile-success-body">
              Your new password is now active. You'll need it the next time you sign in.
            </p>
            <button className="btn-primary auth-submit" onClick={onClose}>Done</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal change-password-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-eyebrow"><KeyRound size={11} /> Account</div>
            <div className="modal-title">Change password</div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit} className="auth-form">
            <label className="auth-label">
              <span>Current password</span>
              <input
                className="auth-input"
                type="password"
                value={current}
                onChange={e => setCurrent(e.target.value)}
                required
                autoFocus
                autoComplete="current-password"
              />
            </label>
            <label className="auth-label">
              <span>New password</span>
              <input
                className="auth-input"
                type="password"
                value={newPw}
                onChange={e => setNewPw(e.target.value)}
                required
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
              disabled={loading || !current || !newPwValid || !passwordsMatch}
            >
              {loading ? 'Updating…' : 'Update password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
