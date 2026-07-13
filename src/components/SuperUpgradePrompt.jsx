import React, { useEffect } from 'react';
import { Crown, X } from 'lucide-react';
import { getUpsellCopy } from '../config/entitlements.js';

export default function SuperUpgradePrompt({ reason = 'mission', onClose, onSeeSuper }) {
  // Close on Escape, matching every other modal (SettingsModal pattern).
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && onClose) onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="super-prompt-backdrop" role="dialog" aria-modal="true" aria-labelledby="super-prompt-title">
      <section className="super-prompt-card">
        <button type="button" className="super-prompt-close" onClick={onClose} aria-label="Close Super prompt">
          <X size={18} />
        </button>
        <div className="super-prompt-icon" aria-hidden="true"><Crown size={26} /></div>
        <div className="super-prompt-eyebrow">Go Super</div>
        <h2 id="super-prompt-title" className="super-prompt-title">Tuk Talk Thai Super</h2>
        <p className="super-prompt-copy">
          {getUpsellCopy(reason)}
        </p>
        <div className="super-prompt-actions">
          <button type="button" className="btn-primary super-prompt-primary" onClick={onSeeSuper}>
            Go Super
          </button>
          <button type="button" className="btn-secondary super-prompt-secondary" onClick={onClose}>
            Maybe later
          </button>
        </div>
      </section>
    </div>
  );
}
