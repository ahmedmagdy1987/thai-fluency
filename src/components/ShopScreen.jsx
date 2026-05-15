import React from 'react';
import { Heart, Snowflake, Zap, Sparkles, Lock, ShoppingBag, Gem } from 'lucide-react';
import { CHARACTERS, STAGE_CHARACTER_MAP } from '../data/stageCharacters.js';
import { STAGES } from '../data/taxonomy.js';

// Phase 1 shop: visual scaffold only. None of these buttons spend gems,
// modify the database, or change gameplay. They exist so the future
// economy phase has a known target layout. Pricing strings are intentional
// placeholders; treat them as illustrative.
//
// IMPORTANT: do not wire purchase logic here without the supporting
// migrations + RLS policies (see docs/app-shell-rewards-roadmap.md).
const REFILL_ITEMS = [
  {
    id: 'refill-hearts',
    icon: Heart,
    iconColor: '#E0445C',
    title: 'Refill hearts',
    desc: 'Top up to full so you can keep learning without a break.',
    price: '350 gems',
    note: 'Purchases coming soon.',
  },
  {
    id: 'unlimited-hearts',
    icon: Sparkles,
    iconColor: '#C9A961',
    title: 'Unlimited hearts (1h)',
    desc: 'Practice as much as you want without losing hearts.',
    price: '500 gems',
    note: 'Purchases coming soon.',
  },
];

const POWERUP_ITEMS = [
  {
    id: 'streak-freeze',
    icon: Snowflake,
    iconColor: '#5B9CC4',
    title: 'Streak freeze',
    desc: 'Protects your streak for one missed day.',
    price: '200 gems',
    note: 'Earned through milestones. Purchases coming soon.',
  },
  {
    id: 'double-xp',
    icon: Zap,
    iconColor: '#E0823B',
    title: 'Double XP (15 min)',
    desc: 'Earn 2x XP on every review. Great for reaching your daily goal.',
    price: '250 gems',
    note: 'Purchases coming soon.',
  },
];

export default function ShopScreen({ stats }) {
  const gems = stats?.gems ?? 0;
  const hearts = stats?.hearts ?? 5;

  return (
    <div className="tab-content shop-screen">
      <header className="shop-hero">
        <div className="shop-hero-icon" aria-hidden="true"><ShoppingBag size={28} /></div>
        <div className="shop-hero-body">
          <div className="shop-hero-eyebrow">Tuk Talk Shop</div>
          <h1 className="shop-hero-title">A reward shop is on the way</h1>
          <p className="shop-hero-sub">
            Earn gems through daily practice. Spend them on power-ups, hearts,
            and original Tuk Talk Thai character unlocks.
          </p>
          <div className="shop-hero-wallet" aria-live="polite">
            <div className="shop-wallet-pill"><Gem size={14} /> <span>{gems}</span><em>gems</em></div>
            <div className="shop-wallet-pill shop-wallet-pill-hearts"><Heart size={14} fill="currentColor" /> <span>{hearts}/5</span><em>hearts</em></div>
          </div>
        </div>
      </header>

      <section className="shop-section">
        <div className="shop-section-header">
          <h2 className="shop-section-title">Hearts</h2>
          <span className="shop-section-badge">Preview</span>
        </div>
        <div className="shop-grid">
          {REFILL_ITEMS.map(item => (
            <ShopItem key={item.id} item={item} />
          ))}
        </div>
      </section>

      <section className="shop-section">
        <div className="shop-section-header">
          <h2 className="shop-section-title">Power-ups</h2>
          <span className="shop-section-badge">Preview</span>
        </div>
        <div className="shop-grid">
          {POWERUP_ITEMS.map(item => (
            <ShopItem key={item.id} item={item} />
          ))}
        </div>
      </section>

      <section className="shop-section">
        <div className="shop-section-header">
          <h2 className="shop-section-title">Character unlocks</h2>
          <span className="shop-section-badge">Preview</span>
        </div>
        <p className="shop-section-lead">
          Each stage features a Tuk Talk Thai character. In a future phase you
          will be able to choose a favorite or unlock skins. Original art coming soon.
        </p>
        <div className="shop-character-grid">
          {Object.values(CHARACTERS).map(c => {
            const stages = Object.entries(STAGE_CHARACTER_MAP)
              .filter(([, charId]) => charId === c.id)
              .map(([stageId]) => STAGES.find(s => s.id === Number(stageId)))
              .filter(Boolean);
            return (
              <article key={c.id} className="shop-character-card" style={{ '--char-accent': c.accent }}>
                <div className="shop-character-portrait" aria-hidden="true">{c.placeholderEmoji}</div>
                <div className="shop-character-name">{c.name}</div>
                <div className="shop-character-vibe">{c.vibe}</div>
                {stages.length > 0 && (
                  <div className="shop-character-stages">
                    {stages.map(s => (
                      <span key={s.id} className="shop-character-stage-chip">S{s.id} - {s.name}</span>
                    ))}
                  </div>
                )}
                <div className="shop-character-lock"><Lock size={12} /> Unlocks coming soon</div>
              </article>
            );
          })}
        </div>
      </section>

      <div className="shop-footnote">
        <Lock size={14} />
        <span>No purchases are processed yet. Phase 1 is visual only.</span>
      </div>
    </div>
  );
}

function ShopItem({ item }) {
  const Icon = item.icon;
  return (
    <article className="shop-item" style={{ '--shop-accent': item.iconColor }}>
      <div className="shop-item-icon"><Icon size={22} /></div>
      <div className="shop-item-body">
        <div className="shop-item-title">{item.title}</div>
        <div className="shop-item-desc">{item.desc}</div>
        <div className="shop-item-meta">
          <span className="shop-item-price">{item.price}</span>
          <span className="shop-item-note">{item.note}</span>
        </div>
      </div>
      <button type="button" className="shop-item-btn" disabled>
        <Lock size={14} /> Coming soon
      </button>
    </article>
  );
}
