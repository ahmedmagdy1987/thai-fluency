import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, ChevronRight, Flame, Sparkles, Zap } from 'lucide-react';
import ConfettiBurst from './ConfettiBurst.jsx';
import CharacterCoach from './CharacterCoach.jsx';
import { playCelebration, playXpTick } from '../lib/sounds.js';

function prefersReducedMotion() {
  return typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export default function MissionCompleteRewardScreen({
  title = 'Mission Complete',
  subtitle = 'You moved your Thai forward.',
  // Neutral default: this screen also celebrates mini-units and the first
  // lesson, where a hardcoded "Mission Complete" eyebrow contradicted the
  // title directly beneath it ("Mini-Unit Complete") — UX audit.
  eyebrow = 'Nice work',
  xpEarned = 0,
  streak = 0,
  nextStep = 'Keep practicing',
  achievements = [],
  characterId = null,
  onContinue,
}) {
  const reducedMotion = useMemo(() => prefersReducedMotion(), []);
  const [displayXp, setDisplayXp] = useState(reducedMotion ? xpEarned : 0);
  const [showConfetti, setShowConfetti] = useState(!reducedMotion);
  const tickRef = useRef(0);

  useEffect(() => {
    if (!reducedMotion) playCelebration();
  }, [reducedMotion]);

  useEffect(() => {
    if (reducedMotion || xpEarned <= 0) {
      setDisplayXp(xpEarned);
      return undefined;
    }

    const duration = 1250;
    const start = performance.now();
    let raf = 0;
    let lastTick = 0;

    const frame = (now) => {
      const pct = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - pct, 3);
      const nextXp = Math.round(xpEarned * eased);
      setDisplayXp(nextXp);

      if (now - lastTick > 85 && nextXp < xpEarned) {
        playXpTick(tickRef.current++);
        lastTick = now;
      }

      if (pct < 1) {
        raf = requestAnimationFrame(frame);
      } else {
        setDisplayXp(xpEarned);
      }
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [reducedMotion, xpEarned]);

  const pct = xpEarned > 0 ? Math.min(100, Math.round((displayXp / xpEarned) * 100)) : 100;

  return (
    <>
      {showConfetti && <ConfettiBurst variant="strong" onDone={() => setShowConfetti(false)} />}
      <div className="reward-screen-backdrop" role="dialog" aria-modal="true" aria-labelledby="reward-screen-title">
        <section className="reward-screen-panel">
          {characterId ? (
            <div className="reward-screen-coach">
              <CharacterCoach characterId={characterId} state="celebrating" compact />
            </div>
          ) : (
            <div className="reward-screen-icon" aria-hidden="true">
              <CheckCircle2 size={36} />
            </div>
          )}
          <div className="reward-screen-eyebrow">{eyebrow}</div>
          <h1 id="reward-screen-title" className="reward-screen-title">{title}</h1>
          <p className="reward-screen-sub">{subtitle}</p>

          {Array.isArray(achievements) && achievements.length > 0 && (
            <ul className="reward-achievements">
              {achievements.map((item, i) => (
                <li key={i} className="reward-achievement-item">
                  <CheckCircle2 size={15} aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="reward-xp-card" aria-live="polite">
            <div className="reward-xp-label">
              <Zap size={16} /> XP earned
            </div>
            <div className="reward-xp-number">+{displayXp}</div>
            <div className="reward-progress-track">
              <div className="reward-progress-fill" style={{ width: `${pct}%` }} />
            </div>
          </div>

          <div className="reward-summary-grid">
            <div className="reward-summary-item">
              <Flame size={18} />
              <span>{streak || 0}</span>
              <em>day streak</em>
            </div>
            <div className="reward-summary-item">
              <Sparkles size={18} />
              <span>Next</span>
              <em>{nextStep}</em>
            </div>
          </div>

          <button type="button" className="btn-primary reward-continue-btn" onClick={onContinue}>
            Continue <ChevronRight size={17} />
          </button>
        </section>
      </div>
    </>
  );
}
