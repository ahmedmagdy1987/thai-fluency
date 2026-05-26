import React from 'react';
import { Crown, X } from 'lucide-react';

const REASON_COPY = {
  'first-lesson': 'You finished your first guided lesson. Super will make the full path faster to explore when it opens.',
  mission: 'You completed a mission. Super will unlock more practice flexibility when it opens.',
  'mini-unit': 'You completed a guided mini-unit. Super will add more early access paths when it opens.',
  locked: 'This is part of the progressive path. Super will unlock some paths early when it opens.',
};

export default function SuperUpgradePrompt({ reason = 'mission', onClose, onSeeSuper }) {
  return (
    <div className="super-prompt-backdrop" role="dialog" aria-modal="true" aria-labelledby="super-prompt-title">
      <section className="super-prompt-card">
        <button type="button" className="super-prompt-close" onClick={onClose} aria-label="Close Super prompt">
          <X size={18} />
        </button>
        <div className="super-prompt-icon" aria-hidden="true"><Crown size={26} /></div>
        <div className="super-prompt-eyebrow">Coming soon</div>
        <h2 id="super-prompt-title" className="super-prompt-title">Tuk Talk Thai Super</h2>
        <p className="super-prompt-copy">
          {REASON_COPY[reason] || REASON_COPY.mission}
        </p>
        <div className="super-prompt-actions">
          <button type="button" className="btn-primary super-prompt-primary" onClick={onSeeSuper}>
            See Super
          </button>
          <button type="button" className="btn-secondary super-prompt-secondary" onClick={onClose}>
            Maybe later
          </button>
        </div>
      </section>
    </div>
  );
}
