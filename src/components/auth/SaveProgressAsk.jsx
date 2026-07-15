import React from 'react';
import { Flame, Sparkles, Zap } from 'lucide-react';

// The conversion ask (engagement.md §1.3) — INVEST BEFORE ASK, at the peak.
//
// WHERE THIS LANDS, AND WHY IT IS HERE AND NOWHERE ELSE:
// the anonymous learner has just finished the full first lesson, banked real XP
// and started a real Day-1 streak, and tapped Continue on
// MissionCompleteRewardScreen. That reward-screen BOUNDARY is the insertion
// point the spec names, precisely because the alternative — asking inside the
// lesson — would mean rewording FirstLessonFlow, whose "Complete Stage 1 to
// unlock daily quests." is protected by check-pedagogy-regression. The ask is
// therefore a sibling of the reward screen, never a patch to the lesson.
//
// HONESTY CONSTRAINT (engagement.md:66, do not violate):
// "The learner already owns their local progress, so we must not pretend it will
// vanish. Conversion pressure comes from the reward already earned, not from a
// false threat." So:
//   • The pressure is the RECAP — XP and streak they can see they earned.
//   • "Keep going without an account" is a first-class, equally reachable choice,
//     not a greyed-out afterthought, and it leads into the real app.
//   • No copy here may imply loss, expiry, or risk. The footnote states the
//     opposite outright, because it is true: saveState already wrote this to
//     localStorage before this screen rendered, and progressMerge.js carries it
//     into the account intact if they DO sign up. Nothing is being held hostage.
//
// The numbers are INTERPOLATED, never hardcoded: the spec's copy reads "60 XP"
// and "Day 1 streak" because that is what the first lesson pays today
// (FIRST_LESSON_REWARD_XP), but a screen that recaps the reward must recap the
// REAL reward — a hardcoded 60 would become a lie the moment the constant moves.
//
// Reuses the reward screen's own backdrop/panel/summary CSS so the ask reads as
// the same moment continuing, not a new surface interrupting it.
export default function SaveProgressAsk({ xpEarned = 0, streak = 0, onCreateAccount, onContinueWithout }) {
  return (
    <div
      className="reward-screen-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="save-ask-title"
    >
      <section className="reward-screen-panel">
        <div className="reward-screen-icon" aria-hidden="true">
          <Sparkles size={36} />
        </div>
        <div className="reward-screen-eyebrow">Saved on this device</div>
        <h1 id="save-ask-title" className="reward-screen-title">
          You just learned your first Thai. Keep it.
        </h1>
        <p className="reward-screen-sub">
          You earned <strong>{xpEarned} XP</strong> and started a <strong>Day {streak} streak</strong>.
          Create a free account to save it and sync across devices — it takes a few seconds.
        </p>

        {/* The recap IS the ask. Same cells as the reward screen the learner just
            saw, so the two numbers carry over rather than being re-asserted. */}
        <div className="reward-summary-grid save-ask-grid">
          <div className="reward-summary-item">
            <Zap size={18} />
            <span>{xpEarned}</span>
            <em>XP earned</em>
          </div>
          <div className="reward-summary-item">
            <Flame size={18} />
            <span>{streak}</span>
            <em>day streak</em>
          </div>
        </div>

        <div className="reward-screen-actions">
          <button type="button" className="btn-primary reward-continue-btn" onClick={onCreateAccount}>
            Save my progress
          </button>
          <button type="button" className="btn-secondary reward-secondary-btn" onClick={onContinueWithout}>
            Keep going without an account
          </button>
        </div>

        {/* The anti-coercion guarantee, stated plainly rather than implied. This
            sentence is the reason the secondary button is safe to take. */}
        <p className="save-ask-note">
          Either way, your progress stays saved on this device. An account adds syncing
          across devices — you can create one later from any screen.
        </p>
      </section>
    </div>
  );
}
