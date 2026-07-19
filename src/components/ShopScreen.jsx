import React, { useState } from 'react';
import { Gem, Heart, Crown, Check, Snowflake } from 'lucide-react';
import { HEART_MAX, REFILL_COST_GEMS, FREEZE_COST_GEMS, MAX_BANKED_FREEZES, freezePurchaseState } from '../lib/economy.js';
import { useHeartRegen } from '../hooks/useHeartRegen.js';

// Two-step confirmation for any gem spend (Wave 12). Gems are earned over days;
// spending them was previously a single unconfirmed click, which is how 31
// freezes (930 gems) left in one sitting. The confirm step states the exact cost
// and what the user ends up with, so no spend is ever a surprise.
function BuyButton({ label, cost, disabled, onConfirm, confirmTitle, confirmBody }) {
  const [confirming, setConfirming] = useState(false);
  if (disabled) {
    return (
      <button type="button" className="btn-primary shop-item-buy" disabled>
        {label}
      </button>
    );
  }
  if (!confirming) {
    return (
      <button
        type="button"
        className="btn-primary shop-item-buy"
        onClick={() => setConfirming(true)}
      >
        {label}
      </button>
    );
  }
  return (
    <div className="shop-item-confirm" role="group" aria-label={confirmTitle}>
      <div className="shop-item-confirm-text">
        <strong>{confirmTitle}</strong>
        <span>{confirmBody}</span>
      </div>
      <div className="shop-item-confirm-actions">
        <button
          type="button"
          className="btn-primary shop-item-confirm-yes"
          onClick={() => { setConfirming(false); onConfirm && onConfirm(); }}
        >
          <Gem size={13} aria-hidden="true" /> Spend {cost}
        </button>
        <button
          type="button"
          className="btn-secondary shop-item-confirm-no"
          onClick={() => setConfirming(false)}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// The Shop is REAL and minimal — it only wires what the columns support
// (migration 009: user_stats.hearts / gems / streak_freezes). Gems are the FREE
// user's earned currency, spent on TWO things: refilling Challenge hearts AND
// buying streak freezes — so gems are never a circular hearts-only currency
// (E4). Hearts are Challenge-only "lives"; the free learning path is never gated
// by gems. A small upsell points Super at /plans. No fake balances or prices.
export default function ShopScreen({ stats, hearts = HEART_MAX, gems = 0, isSuper = false, streakFreezes = 0, onRefillHearts, onBuyFreeze, onOpenSuper }) {
  const heartsFull = isSuper || hearts >= HEART_MAX;
  // Wave 11: the free way to get a heart back is to wait — say so here, where
  // the paid way (gems) is being offered. Refilling is a choice, not the only
  // route, and the countdown makes that honest.
  const regen = useHeartRegen(stats, isSuper);
  const canAfford = gems >= REFILL_COST_GEMS;
  // The cap and its reason come from the ECONOMY, not from local UI arithmetic —
  // the same function the purchase path enforces, so the button and the rule can
  // never disagree (Wave 12, root cause 2).
  const freeze = freezePurchaseState({ gems, streakFreezes });
  const freezeReason = freeze.reason;
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
            {!isSuper && regen.countdown && (
              <div className="shop-item-regen">Next heart free in {regen.countdown}</div>
            )}
          </div>
          {/* Wave 12: a Super user has unlimited hearts, so this item is NOT a
              purchase for them — showing "50 gems" priced something they can
              never need. It renders as satisfied, not for sale. */}
          {isSuper ? (
            <div className="shop-item-included" aria-label="Included with Super">
              <Crown size={14} aria-hidden="true" /> Included
            </div>
          ) : (
            <BuyButton
              label={heartsFull
                ? <><Check size={14} aria-hidden="true" /> Full</>
                : <><Gem size={14} aria-hidden="true" /> {REFILL_COST_GEMS}</>}
              cost={REFILL_COST_GEMS}
              disabled={refillDisabled}
              confirmTitle={`Refill hearts for ${REFILL_COST_GEMS} gems?`}
              confirmBody={`You'll go to ${HEART_MAX}/${HEART_MAX} hearts and have ${Math.max(0, gems - REFILL_COST_GEMS)} gems left.`}
              onConfirm={() => onRefillHearts && onRefillHearts()}
            />
          )}
        </article>

        <article className="shop-item">
          <div className="shop-item-icon shop-item-icon-freeze" aria-hidden="true">
            <Snowflake size={24} />
          </div>
          <div className="shop-item-body">
            <div className="shop-item-title">Buy a streak freeze</div>
            <div className="shop-item-desc">
              A freeze protects your streak on a day you can’t study. You also earn one free every 7 study days.
            </div>
            <div className="shop-item-status">
              <span className="shop-item-status-count">
                <Snowflake size={13} aria-hidden="true" /> {streakFreezes} of {MAX_BANKED_FREEZES} banked
              </span>
            </div>
            <div className="shop-item-reason">{freezeReason}</div>
          </div>
          <BuyButton
            label={freeze.atCap
              ? <><Check size={14} aria-hidden="true" /> Full</>
              : <><Gem size={14} aria-hidden="true" /> {FREEZE_COST_GEMS}</>}
            cost={FREEZE_COST_GEMS}
            disabled={!freeze.canBuy}
            confirmTitle={`Buy a streak freeze for ${FREEZE_COST_GEMS} gems?`}
            confirmBody={`You'll have ${streakFreezes + 1} of ${MAX_BANKED_FREEZES} banked and ${Math.max(0, gems - FREEZE_COST_GEMS)} gems left.`}
            onConfirm={() => onBuyFreeze && onBuyFreeze()}
          />
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
