import React, { useState, useMemo } from 'react';
import { ChevronLeft, Pencil, LogOut, KeyRound, Trash2, LifeBuoy } from 'lucide-react';
import { supabase } from '../lib/supabase.js';
import ChangePasswordModal from './profile/ChangePasswordModal.jsx';
import NotificationSettings from './profile/NotificationSettings.jsx';

// Profile view — accessible from the header user menu. Edit display name
// inline, view account info, change password, sign out.
export default function ProfilePage({ profile, fullStats, session, stageState, onClose, onSignOut, onProfileRefresh, onOpenPublicPage }) {
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [nameError, setNameError] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const displayName = profile?.display_name
    || (session?.user?.email ? session.user.email.split('@')[0] : 'Account');
  const initials = useMemo(() => {
    if (!displayName) return '?';
    return displayName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(s => s[0])
      .join('')
      .toUpperCase();
  }, [displayName]);
  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Not available';
  const stagesComplete = stageState
    ? stageState.stages.filter(s => s.complete && s.total > 0).length
    : 0;

  const startEdit = () => {
    setNameDraft(profile?.display_name || displayName);
    setNameError(null);
    setEditingName(true);
  };

  const cancelEdit = () => {
    setEditingName(false);
    setNameError(null);
  };

  const saveName = async () => {
    const trimmed = nameDraft.trim();
    if (!trimmed) {
      setNameError('Name cannot be empty.');
      return;
    }
    if (trimmed.length > 60) {
      setNameError('Name is too long.');
      return;
    }
    if (trimmed === profile?.display_name) {
      setEditingName(false);
      return;
    }
    setSavingName(true);
    setNameError(null);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ display_name: trimmed })
        .eq('id', session.user.id);
      if (error) throw error;
      onProfileRefresh && await onProfileRefresh();
      setEditingName(false);
    } catch (e) {
      setNameError('Could not save. Try again.');
    } finally {
      setSavingName(false);
    }
  };

  const handleNameKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); saveName(); }
    else if (e.key === 'Escape') cancelEdit();
  };

  const openPublicPage = (path) => {
    if (onOpenPublicPage) {
      onOpenPublicPage(path);
      return;
    }
    window.location.assign(path);
  };

  return (
    <div className="profile-root">
      <div className="profile-page">
        <button className="profile-back-btn" onClick={onClose} type="button">
          <ChevronLeft size={18} /> Back
        </button>

        <div className="profile-header-card">
          <div className="profile-avatar" aria-hidden="true">{initials}</div>
          <div className="profile-identity">
            {editingName ? (
              <div className="profile-name-edit">
                <input
                  className="auth-input profile-name-input"
                  type="text"
                  value={nameDraft}
                  onChange={e => setNameDraft(e.target.value)}
                  onKeyDown={handleNameKeyDown}
                  autoFocus
                  maxLength={60}
                />
                <div className="profile-name-edit-row">
                  <button
                    type="button"
                    className="btn-secondary profile-name-cancel"
                    onClick={cancelEdit}
                    disabled={savingName}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn-primary profile-name-save"
                    onClick={saveName}
                    disabled={savingName || !nameDraft.trim()}
                  >
                    {savingName ? 'Saving…' : 'Save'}
                  </button>
                </div>
                {nameError && <div className="profile-field-hint profile-field-hint-warn">{nameError}</div>}
              </div>
            ) : (
              <div className="profile-name-row">
                <h1 className="profile-name">{displayName}</h1>
                <button
                  type="button"
                  className="profile-name-edit-btn"
                  onClick={startEdit}
                  aria-label="Edit display name"
                  title="Edit name"
                >
                  <Pencil size={14} />
                </button>
              </div>
            )}
            <div className="profile-email">{session?.user?.email}</div>
            <div className="profile-field-hint">Contact support to change email.</div>
            <div className="profile-meta">Member since {memberSince}</div>
          </div>
        </div>

        <div className="profile-section">
          <div className="profile-section-title">Your stats</div>
          <div className="profile-stats-grid">
            <div className="profile-stat">
              <div className="profile-stat-num">{fullStats.totalReviews || 0}</div>
              <div className="profile-stat-label">cards reviewed</div>
            </div>
            <div className="profile-stat">
              <div className="profile-stat-num">{fullStats.streak || 0}</div>
              <div className="profile-stat-label">day streak</div>
            </div>
            <div className="profile-stat">
              <div className="profile-stat-num">{fullStats.totalXp || 0}</div>
              <div className="profile-stat-label">XP earned</div>
            </div>
            <div className="profile-stat">
              <div className="profile-stat-num">{stagesComplete}<span className="profile-stat-of">/8</span></div>
              <div className="profile-stat-label">stages complete</div>
            </div>
          </div>
        </div>

        <NotificationSettings
          session={session}
          profile={profile}
          onProfileRefresh={onProfileRefresh}
        />

        <div className="profile-section">
          <div className="profile-section-title">Account</div>
          <div className="profile-actions">
            <button
              type="button"
              className="profile-action-btn"
              onClick={() => setShowPasswordModal(true)}
            >
              <KeyRound size={16} />
              <span className="profile-action-label">Change password</span>
              <ChevronLeft size={14} className="profile-action-chevron" />
            </button>
            <button
              type="button"
              className="profile-action-btn"
              onClick={() => openPublicPage('/support')}
            >
              <LifeBuoy size={16} />
              <span className="profile-action-label">Support</span>
              <ChevronLeft size={14} className="profile-action-chevron" />
            </button>
            <button
              type="button"
              className="profile-action-btn"
              onClick={onSignOut}
            >
              <LogOut size={16} />
              <span className="profile-action-label">Sign out</span>
              <ChevronLeft size={14} className="profile-action-chevron" />
            </button>
            <button
              type="button"
              className="profile-action-btn profile-action-danger"
              onClick={() => openPublicPage('/delete-account')}
            >
              <Trash2 size={16} />
              <span className="profile-action-label">Delete account</span>
              <ChevronLeft size={14} className="profile-action-chevron" />
            </button>
          </div>
        </div>

        <div className="profile-section">
          <div className="profile-section-title">Legal</div>
          <div className="settings-legal-links profile-legal-links">
            <button type="button" className="settings-legal-link" onClick={() => openPublicPage('/privacy')}>Privacy Policy</button>
            <span className="settings-legal-divider" aria-hidden="true">/</span>
            <button type="button" className="settings-legal-link" onClick={() => openPublicPage('/terms')}>Terms of Use</button>
            <span className="settings-legal-divider" aria-hidden="true">/</span>
            <button type="button" className="settings-legal-link" onClick={() => openPublicPage('/delete-account')}>Account Deletion</button>
          </div>
        </div>

        {showPasswordModal && (
          <ChangePasswordModal
            email={session.user.email}
            onClose={() => setShowPasswordModal(false)}
          />
        )}
      </div>
    </div>
  );
}
