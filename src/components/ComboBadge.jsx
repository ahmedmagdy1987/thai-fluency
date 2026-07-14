import React, { useEffect, useRef, useState } from 'react';
import { Flame } from 'lucide-react';
import ConfettiBurst from './ConfettiBurst.jsx';
import { playAchievement, playMilestone, playCelebration } from '../lib/sounds.js';

// Small combo pill that sits beside the "N of M" progress pill on a graded
// surface (spec 04 §3). It reuses ONLY existing assets: sounds.js cues +
// ConfettiBurst. No new art, no new sound file, no dependency.
//
//   <ComboBadge combo={combo} onMilestone={(tier) => coach.react('celebrating', ...)} />
//
// On a NEW milestone (3 / 5 / 10) it fires an existing sound cue (and confetti
// at 10), then calls onMilestone(tier) so the surface can add its own coach
// reaction. The combo hook (useSessionCombo) sets combo.milestone to the tier
// ONLY on the register() that crossed it, and every crossing is separated by a
// 0, so keying the effect on combo.milestone fires exactly once per crossing.

function prefersReducedMotion() {
  return typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export default function ComboBadge({ combo, onMilestone }) {
  const current = combo?.current || 0;
  const milestone = combo?.milestone || 0;
  const [showConfetti, setShowConfetti] = useState(false);
  // Read reduced-motion once, like FirstLessonFlow: motion (confetti) is gated,
  // the sound cues are left to sounds.js' own opt-out + first-gesture gating.
  const reducedMotionRef = useRef(prefersReducedMotion());

  useEffect(() => {
    if (!milestone) return;
    if (milestone >= 10) {
      playCelebration();
      if (!reducedMotionRef.current) setShowConfetti(true);
    } else if (milestone >= 5) {
      playMilestone();
    } else {
      playAchievement();
    }
    if (typeof onMilestone === 'function') onMilestone(milestone);
    // Depend only on milestone: it is 0 between crossings, so each 3/5/10 is a
    // fresh transition and never double-fires on an unrelated re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [milestone]);

  const confetti = showConfetti
    ? <ConfettiBurst variant="strong" onDone={() => setShowConfetti(false)} />
    : null;

  // Don't flash a "1" pill on the first correct answer — only show once a real
  // run (2+) is going. Confetti (from a just-reached 10) can still be mid-flight.
  if (current < 2) return confetti;

  const hot = current >= 5;
  return (
    <>
      {confetti}
      <span
        className={[
          'combo-pill',
          hot ? 'combo-pill-hot' : '',
          milestone ? 'combo-pill-pop' : '',
        ].filter(Boolean).join(' ')}
        role="status"
        aria-label={`Combo: ${current} correct in a row`}
      >
        <Flame size={13} aria-hidden="true" className="combo-pill-icon" />
        <span className="combo-pill-count">{current}</span>
        <span className="combo-pill-label">combo</span>
      </span>
    </>
  );
}
