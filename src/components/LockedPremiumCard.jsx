import React from 'react';
import { Lock, Crown } from 'lucide-react';
import { isComingSoon } from '../config/entitlements.js';

// Reusable inline "locked premium" surface. Presents a feature as gated behind
// Super with an HONEST Coming Soon state (never a fake unlock). `onUpgrade` should
// route to the plans page through the central handler (handleOpenPremium).
export default function LockedPremiumCard({
  featureId,
  title,
  description,
  badge,            // optional extra flag, e.g. '18+'
  note,             // optional small print under the description
  onUpgrade,
  children,
}) {
  const comingSoon = featureId ? isComingSoon(featureId) : true;
  return (
    <section className="locked-premium-card" role="group" aria-label={`${title} — premium feature`}>
      <div className="locked-premium-icon" aria-hidden="true"><Lock size={22} /></div>
      <div className="locked-premium-badges">
        <span className="locked-premium-badge locked-premium-badge-super"><Crown size={12} aria-hidden="true" /> Super</span>
        {badge && <span className="locked-premium-badge locked-premium-badge-flag">{badge}</span>}
        {comingSoon && <span className="locked-premium-badge locked-premium-badge-soon">Coming soon</span>}
      </div>
      <h3 className="locked-premium-title">{title}</h3>
      {description && <p className="locked-premium-desc">{description}</p>}
      {children}
      {note && <p className="locked-premium-note">{note}</p>}
      {onUpgrade && (
        <button type="button" className="btn-primary locked-premium-cta" onClick={onUpgrade}>
          See Super
        </button>
      )}
    </section>
  );
}
