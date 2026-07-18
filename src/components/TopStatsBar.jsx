import React from 'react';
import { Flame, Zap, Heart, Gem } from 'lucide-react';
import { HEART_MAX } from '../lib/economy.js';
import { useHeartRegen } from '../hooks/useHeartRegen.js';

// Header stats bar: streak + XP + due-count are joined by the REAL hearts + gems
// economy (migration 009). Hearts are Challenge-only "lives" (see economy.js);
// the value shown is the EFFECTIVE (regenerated) count passed from AppShell.
// Super users have unlimited hearts, so their hearts chip shows ∞ instead of a
// number. Gems are the earned/spent currency balance (stats.gems).
//
// Each pill shows an icon, a short name, and its value. The name is a visible
// label on desktop/tablet and is hidden on small phones to avoid horizontal
// overflow — but it is ALWAYS available to assistive tech via aria-label and
// the numeric value is never hidden. Chips never wrap on phones (nowrap CSS).
export default function TopStatsBar({ stats, dashboardStats, hearts, isSuper = false }) {
  const streak = stats?.streak || 0;
  const totalXp = stats?.totalXp || 0;
  const gems = stats?.gems || 0;
  const due = dashboardStats?.due || 0;
  // Effective hearts come from AppShell (regenerated + Super-aware). Fall back
  // to a safe full value if omitted, and clamp the numeric display to HEART_MAX.
  const heartsVal = Number.isFinite(hearts) ? Math.max(0, Math.min(HEART_MAX, hearts)) : HEART_MAX;
  // Wave 11: regen has always run below the cap, but the countdown only ever
  // appeared on the out-of-hearts gate. Show it here too, wherever hearts are
  // displayed, so a user at 4/5 can see a heart is coming and when.
  const regen = useHeartRegen(stats, isSuper);
  const heartsAria = isSuper
    ? 'Hearts: unlimited with Super'
    : `Hearts: ${heartsVal} of ${HEART_MAX}${regen.countdown ? `. Next heart in ${regen.countdown}` : ''}`;

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
        className="topstats-pill topstats-pill-hearts"
        title={isSuper
          ? 'Unlimited hearts with Super'
          : (regen.countdown ? `Hearts for the Challenge — next heart in ${regen.countdown}` : 'Hearts for the Challenge')}
        aria-label={heartsAria}
      >
        <Heart size={13} aria-hidden="true" />
        <span className="topstats-label">Hearts</span>
        {isSuper ? (
          <span className="topstats-val" aria-hidden="true">∞</span>
        ) : (
          <span className="topstats-val">
            {heartsVal}<span className="topstats-hearts-of">/{HEART_MAX}</span>
          </span>
        )}
        {/* Quiet, non-intrusive: a small monospaced timer that only exists
            while a heart is actually on its way. Not a nag — information. */}
        {!isSuper && regen.countdown && (
          <span className="topstats-hearts-regen" aria-hidden="true">+1 in {regen.countdown}</span>
        )}
      </div>
      <div
        className="topstats-pill topstats-pill-gems"
        title="Gems — earn them, spend them in the Shop"
        aria-label={`Gems: ${gems}`}
      >
        <Gem size={13} aria-hidden="true" />
        <span className="topstats-label">Gems</span>
        <span className="topstats-val">{gems}</span>
      </div>
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
