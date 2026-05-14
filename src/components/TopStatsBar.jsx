import React from 'react';
import { Flame, Zap, Gem, Heart } from 'lucide-react';

// Phase 1 stats bar: streak + XP come from real state. Gems and hearts are
// visual placeholders for the future economy — they show zero/full but no
// gameplay code reads or writes them yet. The point is to lock the layout
// in so later phases plug values in without touching positioning.
export default function TopStatsBar({ stats, dashboardStats, onOpenShop }) {
  const streak = stats?.streak || 0;
  const totalXp = stats?.totalXp || 0;
  const due = dashboardStats?.due || 0;

  // Placeholder reward values. Real values land when the wallet / hearts
  // tables exist (see docs/app-shell-rewards-roadmap.md).
  const gems = stats?.gems ?? 0;
  const hearts = stats?.hearts ?? 5;
  const heartsMax = 5;

  const onShopClick = (e) => {
    e.preventDefault();
    if (onOpenShop) onOpenShop();
  };

  return (
    <div className="topstats-bar">
      {due > 0 && (
        <div className="topstats-pill topstats-pill-due" title={`${due} card${due === 1 ? '' : 's'} due`}>
          <Flame size={13} />
          <span>{due} due</span>
        </div>
      )}
      <div className="topstats-pill topstats-pill-streak" title={`${streak} day streak`}>
        <span className="topstats-icon-emoji">🔥</span>
        <span>{streak}</span>
      </div>
      <button
        type="button"
        className="topstats-pill topstats-pill-gems"
        onClick={onShopClick}
        title="Gems — coming soon"
      >
        <Gem size={13} />
        <span>{gems}</span>
      </button>
      <button
        type="button"
        className="topstats-pill topstats-pill-hearts"
        onClick={onShopClick}
        title="Hearts — coming soon"
      >
        <Heart size={13} fill="currentColor" />
        <span>{hearts}<span className="topstats-hearts-of">/{heartsMax}</span></span>
      </button>
      <div className="topstats-pill topstats-pill-xp" title="Total XP">
        <Zap size={13} />
        <span>{totalXp}</span>
      </div>
    </div>
  );
}
