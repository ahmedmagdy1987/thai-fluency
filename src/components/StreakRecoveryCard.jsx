import React from 'react';
import { Flame, ChevronRight, Snowflake } from 'lucide-react';
import { FREEZE_COST_GEMS } from '../lib/economy.js';

// Honest, non-shaming streak-recovery surface (spec 04 §5.2).
//
// Shown ONCE when a REAL streak break happens (the user returned after a gap
// with no freeze available, so computeStreak reset the streak to 1 — see
// lib/stats.js). It never shows a red "you lost your streak" shame screen and
// never fake-restores a streak the user did not earn: the break is stated
// plainly ("Day 1 again") and reframed forward.
//
// The secondary action is the honest free→Super bridge: buy a streak freeze for
// FREEZE_COST_GEMS (30) gems — the earned free currency — so the NEXT slip is
// protected. It is offered only when affordable. The actual purchase
// (buyStreakFreezeWithGems → setStats) is owned by the caller via onBuyFreeze;
// this component only imports the cost constant for display.
export default function StreakRecoveryCard({
  bestStreak = 0,
  gems = 0,
  onStudyNow,
  onBuyFreeze,
}) {
  const best = Math.max(0, Math.floor(Number(bestStreak) || 0));
  const hasBest = best >= 1;
  const canAffordFreeze = gems >= FREEZE_COST_GEMS;
  const showFreeze = typeof onBuyFreeze === 'function' && canAffordFreeze;

  return (
    <div className="streak-recovery-backdrop" role="dialog" aria-modal="true" aria-labelledby="streak-recovery-title">
      <section className="streak-recovery-card">
        <div className="streak-recovery-icon" aria-hidden="true">
          <Flame size={30} />
        </div>
        <div className="streak-recovery-eyebrow">Welcome back</div>
        <h2 id="streak-recovery-title" className="streak-recovery-title">
          Let's start a fresh streak today.
        </h2>
        <p className="streak-recovery-copy">
          {hasBest
            ? <>Your best was <strong>{best} {best === 1 ? 'day' : 'days'}</strong> — you can beat it. Today is Day 1 again.</>
            : <>Today is Day 1. Learn anything today and your streak begins.</>}
        </p>

        <div className="streak-recovery-actions">
          <button type="button" className="btn-primary streak-recovery-primary" onClick={onStudyNow}>
            Study now <ChevronRight size={16} />
          </button>
          {showFreeze && (
            <button type="button" className="btn-secondary streak-recovery-freeze" onClick={onBuyFreeze}>
              <Snowflake size={14} aria-hidden="true" /> Get a streak freeze ({FREEZE_COST_GEMS} gems)
            </button>
          )}
        </div>

        {showFreeze && (
          <p className="streak-recovery-hint">
            A freeze protects your streak the next time you miss a day.
          </p>
        )}
      </section>
    </div>
  );
}
