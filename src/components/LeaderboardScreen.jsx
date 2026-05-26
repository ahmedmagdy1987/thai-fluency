import React from 'react';
import { Crown, Trophy, Lock, Users, Flame } from 'lucide-react';

// Placeholder leaderboard. No real ranking infrastructure exists. The page
// exists because the sidebar surfaces a Leaderboard entry — dead buttons
// are forbidden by the spec, so this renders a polished "Coming soon" view
// that explains the intent.
export default function LeaderboardScreen({ stats, onOpenSuper }) {
  const streak = stats?.streak || 0;
  const totalXp = stats?.totalXp || 0;

  return (
    <div className="tab-content leaderboard-screen">
      <header className="leaderboard-hero">
        <div className="leaderboard-hero-icon"><Trophy size={28} /></div>
        <div className="leaderboard-hero-body">
          <div className="leaderboard-hero-eyebrow">Leaderboard preview</div>
          <h1 className="leaderboard-hero-title">Friendly competition is on the way</h1>
          <p className="leaderboard-hero-sub">
            Compete weekly with other Thai learners by total XP earned. Climb
            divisions, earn gems, and keep your streak alive.
          </p>
        </div>
      </header>

      <div className="leaderboard-preview-card">
        <div className="leaderboard-preview-row leaderboard-preview-row-self">
          <div className="leaderboard-preview-rank">You</div>
          <div className="leaderboard-preview-avatar" aria-hidden="true">🐘</div>
          <div className="leaderboard-preview-name">You</div>
          <div className="leaderboard-preview-stat">
            <Flame size={12} /> <span>{streak}</span>
          </div>
          <div className="leaderboard-preview-xp">{totalXp} XP</div>
        </div>
        <div className="leaderboard-preview-row leaderboard-preview-row-placeholder">
          <div className="leaderboard-preview-rank">2</div>
          <div className="leaderboard-preview-avatar" aria-hidden="true">🦎</div>
          <div className="leaderboard-preview-name">Learner preview</div>
          <div className="leaderboard-preview-stat"><Flame size={12} /> <span>0</span></div>
          <div className="leaderboard-preview-xp">0 XP</div>
        </div>
        <div className="leaderboard-preview-row leaderboard-preview-row-placeholder">
          <div className="leaderboard-preview-rank">3</div>
          <div className="leaderboard-preview-avatar" aria-hidden="true">🐒</div>
          <div className="leaderboard-preview-name">Learner preview</div>
          <div className="leaderboard-preview-stat"><Flame size={12} /> <span>0</span></div>
          <div className="leaderboard-preview-xp">0 XP</div>
        </div>
      </div>

      <div className="leaderboard-lock">
        <Lock size={14} />
        <span>Leaderboards require Level 2 progress, opt-in profile sharing, and weekly totals. Super unlocks some competitive features early when it opens.</span>
        {onOpenSuper && (
          <button type="button" className="leaderboard-super-link" onClick={onOpenSuper}>
            <Crown size={13} /> See Super
          </button>
        )}
      </div>

      <div className="leaderboard-future">
        <Users size={20} />
        <div>
          <div className="leaderboard-future-title">Private by default</div>
          <div className="leaderboard-future-sub">
            You will choose whether to appear. Display name only. No email or streak data without consent.
          </div>
        </div>
      </div>
    </div>
  );
}
