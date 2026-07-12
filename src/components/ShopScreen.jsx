import React from 'react';
import { Gem, Heart, Crown, Check } from 'lucide-react';
import { HEART_MAX, REFILL_COST_GEMS } from '../lib/economy.js';

// The Shop is now REAL and minimal — it only wires what the columns support
// (migration 009: user_stats.hearts / gems). Today there is exactly one honest
// purchase: refill hearts to full with gems. Hearts are Challenge-only "lives";
// the free learning path is never gated by gems. A small upsell card points
// Super at /plans (Super = unlimited hearts). No fake balances, prices, or
// "coming soon" placeholders.
export default function ShopScreen({ hearts = HEART_MAX, gems = 0, isSuper = false, onRefillHearts, onOpenSuper }) {
  const heartsFull = isSuper || hearts >= HEART_MAX;
  const canAfford = gems >= REFILL_COST_GEMS;
  // The refill item is disabled when the user is Super (already unlimited),
  // already full, or can't afford it — each with an honest reason line.
  const refillDisabled = isSuper || heartsFull || !canAfford;
  const refillReason = isSuper
    ? 'You have unlimited hearts with Super.'
    : heartsFull
      ? 'Your hearts are already full.'
      : !canAfford
        ? `You need ${REFILL_COST_GEMS} gems. You have ${gems}.`
        : `Spend ${REFILL_COST_GEMS} gems to refill to ${HEART_MAX} hearts.`;

  return (
    <div className="tab-content shop-screen">
      <header className="shop-header">
        <div className="shop-header-titles">
          <div className="shop-header-eyebrow">Shop</div>
          <h1 className="shop-header-title">Spend your gems</h1>
          <p className="shop-header-sub">
            Earn gems by hitting your daily goal, finishing Stage 1 missions, and passing Challenges. Spend them here.
            Hearts are only used in the Challenge — practice and lessons are always free.
          </p>
        </div>
        <div className="shop-balance" aria-label={`You have ${gems} gems`}>
          <Gem size={16} aria-hidden="true" />
          <span className="shop-balance-val">{gems}</span>
          <span className="shop-balance-label">gems</span>
        </div>
      </header>

      <div className="shop-items">
        <article className="shop-item">
          <div className="shop-item-icon shop-item-icon-hearts" aria-hidden="true">
            <Heart size={24} fill="currentColor" />
          </div>
          <div className="shop-item-body">
            <div className="shop-item-title">Refill hearts</div>
            <div className="shop-item-desc">
              {isSuper
                ? 'Super includes unlimited hearts.'
                : `Top your hearts back up to ${HEART_MAX} to keep taking Challenges.`}
            </div>
            <div className="shop-item-status">
              {isSuper ? (
                <span className="shop-item-status-super"><Crown size={12} aria-hidden="true" /> Unlimited with Super</span>
              ) : (
                <span className="shop-item-status-hearts" aria-label={`Hearts: ${hearts} of ${HEART_MAX}`}>
                  {Array.from({ length: HEART_MAX }).map((_, i) => (
                    <Heart
                      key={i}
                      size={13}
                      className={i < hearts ? 'shop-heart-full' : 'shop-heart-empty'}
                      fill={i < hearts ? 'currentColor' : 'none'}
                      aria-hidden="true"
                    />
                  ))}
                  <span className="shop-item-status-count">{hearts}/{HEART_MAX}</span>
                </span>
              )}
            </div>
            <div className="shop-item-reason">{refillReason}</div>
          </div>
          <button
            type="button"
            className="btn-primary shop-item-buy"
            onClick={() => onRefillHearts && onRefillHearts()}
            disabled={refillDisabled}
          >
            {heartsFull && !isSuper ? (
              <><Check size={14} aria-hidden="true" /> Full</>
            ) : (
              <><Gem size={14} aria-hidden="true" /> {REFILL_COST_GEMS}</>
            )}
          </button>
        </article>

        {!isSuper && (
          <article className="shop-upsell">
            <div className="shop-upsell-icon" aria-hidden="true"><Crown size={22} /></div>
            <div className="shop-upsell-body">
              <div className="shop-upsell-title">Super = unlimited hearts</div>
              <div className="shop-upsell-desc">
                Never run out mid-Challenge. Super also unlocks the 18+ Dating &amp; Real Talk section.
              </div>
            </div>
            <button type="button" className="btn-secondary shop-upsell-cta" onClick={() => onOpenSuper && onOpenSuper()}>
              <Crown size={14} aria-hidden="true" /> Go Super
            </button>
          </article>
        )}
      </div>
    </div>
  );
}
