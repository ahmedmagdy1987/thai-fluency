import React from 'react';
import { Flame, Zap } from 'lucide-react';

// Header stats bar: streak + XP come from real state and are the only chips
// shown. Gems and hearts were visual placeholders for a future economy that
// isn't built yet, so they're hidden (no fake balances). When the wallet /
// hearts tables exist (see docs/app-shell-rewards-roadmap.md), re-introduce
// those chips with real values.
//
// Each pill shows an icon, a short name, and its value. The name is a visible
// label on desktop/tablet and is hidden on small phones to avoid horizontal
// overflow — but it is ALWAYS available to assistive tech via aria-label and
// the numeric value is never hidden.
export default function TopStatsBar({ stats, dashboardStats }) {
  const streak = stats?.streak || 0;
  const totalXp = stats?.totalXp || 0;
  const due = dashboardStats?.due || 0;

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
