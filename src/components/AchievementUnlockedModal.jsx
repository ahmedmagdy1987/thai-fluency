import React, { useEffect } from 'react';
import { ChevronRight, Sparkles } from 'lucide-react';
import { playAchievement } from '../lib/sounds.js';

// A short motivational line per achievement family (keeps the modal feeling
// personal without editing the achievement data). Falls back to a generic line.
function motivationFor(achievement) {
  const id = achievement?.id || '';
  if (id.startsWith('streak')) return 'Consistency is how fluency sticks. Keep it going.';
  if (id.startsWith('xp')) return 'You’re building real momentum.';
  if (id.startsWith('mature') || id.startsWith('sentences')) return 'Real mastery, locked in through review.';
  if (id.startsWith('stage')) return 'New ground unlocked. Onward.';
  if (id.includes('dialogue')) return 'Real conversations are getting closer.';
  if (id.includes('quiz') || id.includes('perfect')) return 'Sharp work under pressure.';
  if (id.includes('cards')) return 'Every card moves your Thai forward.';
  if (id.includes('goal')) return 'Daily habits beat cramming. Nice.';
  return 'Nice work — keep the momentum going.';
}

// Level 2 feedback: a centered, polished modal for a newly-unlocked
// achievement. One reward sound; no confetti (that is reserved for Level 3).
// Dedup/queueing is owned by App.jsx, so this never re-shows after refresh.
export default function AchievementUnlockedModal({ achievement, onContinue }) {
  useEffect(() => {
    playAchievement();
  }, [achievement?.id]);

  if (!achievement) return null;

  return (
    <div
      className="reward-screen-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="achievement-modal-title"
    >
      <section className="reward-screen-panel reward-screen-panel-compact achievement-modal">
        <div className="achievement-modal-sparkle" aria-hidden="true"><Sparkles size={18} /></div>
        <div className="achievement-modal-badge" aria-hidden="true">{achievement.icon || '🏅'}</div>
        <div className="reward-screen-eyebrow">Achievement unlocked</div>
        <h1 id="achievement-modal-title" className="reward-screen-title">{achievement.name}</h1>
        {achievement.desc && <p className="achievement-modal-desc">{achievement.desc}</p>}
        <p className="reward-screen-sub">{motivationFor(achievement)}</p>
        <button type="button" className="btn-primary reward-continue-btn" onClick={onContinue}>
          Continue <ChevronRight size={17} />
        </button>
      </section>
    </div>
  );
}
