import React from 'react';
import { X } from 'lucide-react';

export default function AchievementsModal({ achievements, unlocked, onClose }) {
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
