import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import ConfettiBurst from './ConfettiBurst.jsx';
import { playMilestone } from '../lib/sounds.js';

// The 10-card "Getting Started" achievement is paired with a light confetti
// burst, a "tin tin" sound, and a more motivational headline. Other
// achievements use the plain toast.
const MILESTONE_ID = 'ten-cards';

export default function AchievementToast({ achievement, onClose }) {
  const isMilestone = achievement.id === MILESTONE_ID;
  const [showConfetti, setShowConfetti] = useState(isMilestone);

  useEffect(() => {
    if (isMilestone) playMilestone();
    const t = setTimeout(onClose, isMilestone ? 5000 : 4000);
    return () => clearTimeout(t);
  }, [onClose, isMilestone]);

  return (
    <>
      {showConfetti && <ConfettiBurst variant="light" onDone={() => setShowConfetti(false)} />}
      <div className={`toast toast-achievement${isMilestone ? ' toast-milestone' : ''}`} onClick={onClose}>
        <div className="toast-icon">{isMilestone ? '🎉' : achievement.icon}</div>
        <div className="toast-body">
          <div className="toast-eyebrow">
            {isMilestone ? 'Nice momentum!' : 'Achievement Unlocked'}
          </div>
          <div className="toast-title">
            {isMilestone ? 'You’ve completed 10 cards' : achievement.name}
          </div>
          <div className="toast-desc">
            {isMilestone ? 'Keep going — you’re building real Thai fluency.' : achievement.desc}
          </div>
        </div>
      </div>
    </>
  );
}
