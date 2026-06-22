import React from 'react';
import { canUseFeature } from '../config/entitlements.js';
import LockedPremiumCard from './LockedPremiumCard.jsx';

// Single premium FEATURE gate. Renders children only when the user can actually
// USE the feature (free, or Super AND actually shipped). Otherwise renders the
// locked premium card. Gating the CONTENT (not just nav visibility) means a
// coming-soon premium feature is never exposed, even via a deep link.
export default function PremiumGate({
  featureId,
  stats,
  title,
  description,
  badge,
  note,
  onUpgrade,
  children,
}) {
  if (canUseFeature(featureId, stats)) return children;
  return (
    <LockedPremiumCard
      featureId={featureId}
      title={title}
      description={description}
      badge={badge}
      note={note}
      onUpgrade={onUpgrade}
    />
  );
}
