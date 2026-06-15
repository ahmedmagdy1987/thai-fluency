import React from 'react';
import { Trophy, Lock, Users } from 'lucide-react';

// The leaderboard is not live yet — there is no ranking backend. This renders a
// clean, honest "Coming soon" state: no real user data and no upsell. The
// preview rows are obviously inert placeholders. When it does launch it will
// show each player's chosen username / nickname only — never a real name,
// email, or streak data without explicit opt-in.
const PREVIEW_ROWS = [
  { rank: 1, avatar: '🐘', name: 'Player one' },
  { rank: 2, avatar: '🦎', name: 'Player two' },
  { rank: 3, avatar: '🐒', name: 'Player three' },
];

export default function LeaderboardScreen() {
  return (
    <div className="tab-content leaderboard-screen">
      <header className="leaderboard-hero">
        <div className="leaderboard-hero-icon"><Trophy size={28} /></div>
        <div className="leaderboard-hero-body">
          <div className="leaderboard-hero-eyebrow">Coming soon</div>
          <h1 className="leaderboard-hero-title">Leaderboards are coming soon</h1>
          <p className="leaderboard-hero-sub">
            Soon you&apos;ll compete with other Thai learners by weekly XP. We&apos;re
            still building it — check back after an update.
          </p>
        </div>
      </header>

      <div className="leaderboard-preview-card" aria-hidden="true">
        {PREVIEW_ROWS.map(row => (
          <div className="leaderboard-preview-row leaderboard-preview-row-placeholder" key={row.rank}>
            <div className="leaderboard-preview-rank">{row.rank}</div>
            <div className="leaderboard-preview-avatar">{row.avatar}</div>
            <div className="leaderboard-preview-name">{row.name}</div>
            <div className="leaderboard-preview-xp">— XP</div>
          </div>
        ))}
      </div>

      <div className="leaderboard-lock">
        <Lock size={14} />
        <span>When leaderboards launch, joining will be opt-in and weekly.</span>
      </div>

      <div className="leaderboard-future">
        <Users size={20} />
        <div>
          <div className="leaderboard-future-title">Private by default</div>
          <div className="leaderboard-future-sub">
            Leaderboards will show your chosen username only — never your real name,
            email, or streak data. You&apos;ll opt in before you appear.
          </div>
        </div>
      </div>
    </div>
  );
}
