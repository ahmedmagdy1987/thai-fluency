import React from 'react';
import { ShoppingBag } from 'lucide-react';

// The reward economy (gems, hearts, power-ups, character unlocks) is NOT built
// yet, so the Shop is intentionally unlinked from the nav. This component stays
// in the codebase as the future home for that economy, but until it exists we
// show a simple, neutral "coming soon" placeholder — never fake balances,
// prices, or purchasable-looking items. No props are read.
export default function ShopScreen() {
  return (
    <div className="tab-content shop-screen">
      <section className="feature-lock-panel">
        <div className="feature-lock-icon" aria-hidden="true"><ShoppingBag size={28} /></div>
        <div className="feature-lock-eyebrow">Shop</div>
        <h1 className="feature-lock-title">Coming soon</h1>
        <p className="feature-lock-copy">
          A reward shop is on the way. For now, keep learning — every stage, mission,
          review and quiz is free.
        </p>
      </section>
    </div>
  );
}
