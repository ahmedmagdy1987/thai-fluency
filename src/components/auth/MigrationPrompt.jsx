import React, { useState } from 'react';
import { Cloud, AlertTriangle } from 'lucide-react';

// Shown right after sign-in when we detect local-only progress that hasn't
// been migrated yet. Two outcomes:
//   - "Save to my account" → upload local to cloud, then continue with cloud state
//   - "Skip and start fresh" → discard local, pull whatever's in cloud (likely defaults)
// Either way the prompt resolves and the app transitions to cloud-sync mode.
export default function MigrationPrompt({ cardCount, totalXp, streak, onMigrate, onSkip }) {
  const [busy, setBusy] = useState(false);
  const [confirmSkip, setConfirmSkip] = useState(false);
  const [error, setError] = useState(null);

  const handleMigrate = async () => {
    setError(null);
    setBusy(true);
    try {
      await onMigrate();
    } catch (e) {
      setError('Upload failed: ' + (e?.message || 'unknown error') + '. Try again, or skip to start fresh.');
      setBusy(false);
    }
  };

  const handleSkip = async () => {
    setBusy(true);
    try {
      await onSkip();
    } catch (e) {
      setError('Something went wrong. Try again.');
      setBusy(false);
    }
  };

  return (
    <div className="onboard-root">
      <div className="onboard-card auth-card migration-card">
        <div className="migration-icon"><Cloud size={40} /></div>
        <div className="onboard-eyebrow">Existing progress detected</div>
        <h1 className="onboard-title">Save your progress to the cloud?</h1>
        <p className="onboard-sub">
          We found progress saved on this device. Upload it to your account so it
          syncs across all your devices.
        </p>

        <div className="migration-stats">
          <div className="migration-stat">
            <div className="migration-stat-num">{cardCount}</div>
            <div className="migration-stat-label">cards reviewed</div>
          </div>
          <div className="migration-stat">
            <div className="migration-stat-num">{totalXp}</div>
            <div className="migration-stat-label">XP earned</div>
          </div>
          <div className="migration-stat">
            <div className="migration-stat-num">{streak}</div>
            <div className="migration-stat-label">day streak</div>
          </div>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <div className="migration-actions">
          <button
            className="btn-primary auth-cta"
            onClick={handleMigrate}
            disabled={busy}
          >
            {busy ? 'Saving…' : 'Save to my account'}
          </button>
          {!confirmSkip ? (
            <button
              className="auth-link migration-skip-link"
              onClick={() => setConfirmSkip(true)}
              disabled={busy}
              type="button"
            >
              Skip. Start fresh
            </button>
          ) : (
            <div className="migration-skip-confirm">
              <div className="migration-skip-warning">
                <AlertTriangle size={14} />
                <span>This will discard your {cardCount} cards of progress.</span>
              </div>
              <div className="migration-skip-buttons">
                <button type="button" className="btn-secondary migration-skip-cancel" onClick={() => setConfirmSkip(false)} disabled={busy}>
                  Keep my progress
                </button>
                <button type="button" className="btn-secondary migration-skip-confirm-btn" onClick={handleSkip} disabled={busy}>
                  {busy ? 'Skipping…' : 'Yes, discard'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
