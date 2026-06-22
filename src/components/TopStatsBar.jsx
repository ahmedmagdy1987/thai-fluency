import React from 'react';
import { Flame, Zap, Gem, Heart } from 'lucide-react';

// Phase 1 stats bar: streak + XP come from real state. Gems and hearts are
// visual placeholders for the future economy — they show zero/full but no
// gameplay code reads or writes them yet. The point is to lock the layout
// in so later phases plug values in without touching positioning.
//
// Each pill shows an icon, a short name, and its value. The name is a visible
// label on desktop/tablet and is hidden on small phones to avoid horizontal
// overflow — but it is ALWAYS available to assistive tech via aria-label and
// to pointer users via title, and the numeric value is never hidden.
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
    <div className="topstats-bar" data-tutorial="stats">
      {due > 0 && (
        <div
          className="topstats-pill topstats-pill-due"
          title={`${due} card${due === 1 ? '' : 's'} due for review`}
          aria-label={`${due} card${due === 1 ? '' : 's'} due for review`}
        >
          <Flame size={13} aria-hidden="true" />
          <span className="topstats-val topstats-due-count">{due}</span>
          <span className="topstats-label topstats-due-label">due</span>
        </div>
      )}
      <div
        className="topstats-pill topstats-pill-streak"
        title="Day streak"
        aria-label={`Streak: ${streak} day${streak === 1 ? '' : 's'}`}
      >
        <span className="topstats-icon-emoji" aria-hidden="true">🔥</span>
        <span className="topstats-label">Streak</span>
        <span className="topstats-val">{streak}</span>
      </div>
      <button
        type="button"
        className="topstats-pill topstats-pill-gems"
        onClick={onShopClick}
        title="Gems — open shop"
        aria-label={`Gems: ${gems}. Open shop`}
      >
        <Gem size={13} aria-hidden="true" />
        <span className="topstats-label">Gems</span>
        <span className="topstats-val">{gems}</span>
      </button>
      <button
        type="button"
        className="topstats-pill topstats-pill-hearts"
        onClick={onShopClick}
        title="Hearts — open shop"
        aria-label={`Hearts: ${hearts} of ${heartsMax}. Open shop`}
      >
        <Heart size={13} fill="currentColor" aria-hidden="true" />
        <span className="topstats-label">Hearts</span>
        <span className="topstats-val">{hearts}<span className="topstats-hearts-of">/{heartsMax}</span></span>
      </button>
      <div
        className="topstats-pill topstats-pill-xp"
        title="Total XP earned"
        aria-label={`XP: ${totalXp}`}
      >
        <Zap size={13} aria-hidden="true" />
        <span className="topstats-label">XP</span>
        <span className="topstats-val">{totalXp}</span>
      </div>
    </div>
  );
}
