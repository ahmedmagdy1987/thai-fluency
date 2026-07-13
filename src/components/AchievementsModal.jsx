import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function AchievementsModal({ achievements, unlocked, onClose }) {
  // Close on Escape, matching every other modal (SettingsModal pattern).
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && onClose) onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const noneYet = unlocked.length === 0;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-eyebrow">Your collection</div>
            <div className="modal-title">Achievements</div>
            <div className="modal-sub">{unlocked.length} of {achievements.length} unlocked</div>
          </div>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="modal-body">
          {noneYet && (
            <p className="achievement-empty-hint">
              None unlocked yet — complete your first lesson and review a few cards to earn your first achievement.
            </p>
          )}
          <div className="achievement-grid">
            {achievements.map(a => {
              const isUnlocked = unlocked.includes(a.id);
              return (
                <div key={a.id} className={`achievement-card ${isUnlocked ? 'achievement-unlocked' : 'achievement-locked'}`}>
                  <div className="achievement-icon">{isUnlocked ? a.icon : '🔒'}</div>
                  <div className="achievement-name">{a.name}</div>
                  <div className="achievement-desc">{a.desc}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
