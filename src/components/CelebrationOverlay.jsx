import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronRight, Sparkles, Zap } from 'lucide-react';
import ConfettiBurst from './ConfettiBurst.jsx';
import CharacterCoach from './CharacterCoach.jsx';
import { playCelebration, playXpTick } from '../lib/sounds.js';

function prefersReducedMotion() {
  return typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Level 3 major celebration: a shared overlay for stage complete, all daily
// quests complete, and perfect Stage Challenge. Confetti + optional XP count-up
// (both reduced-motion aware), a primary CTA, an optional secondary CTA, and an
// optional SOFT Super line that appears AFTER the celebration (never gates it).
// Sound is gated in sounds.js (Sound effects OFF → silent).
export default function CelebrationOverlay({
  eyebrow = 'Complete',
  title,
  subtitle,
  xpEarned = 0,
  primaryLabel = 'Continue',
  onPrimary,
  secondaryLabel,
  onSecondary,
  superCtaText,
  onSuper,
  characterId = null,
}) {
  const reducedMotion = useMemo(() => prefersReducedMotion(), []);
  const [displayXp, setDisplayXp] = useState(reducedMotion ? xpEarned : 0);
  const [showConfetti, setShowConfetti] = useState(!reducedMotion);
  const tickRef = useRef(0);

  useEffect(() => {
    playCelebration();
  }, []);

  useEffect(() => {
    if (reducedMotion || xpEarned <= 0) {
      setDisplayXp(xpEarned);
      return undefined;
    }
    const duration = 1100;
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
      if (pct < 1) raf = requestAnimationFrame(frame);
      else setDisplayXp(xpEarned);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [reducedMotion, xpEarned]);

  return (
    <>
      {showConfetti && <ConfettiBurst variant="strong" onDone={() => setShowConfetti(false)} />}
      <div className="reward-screen-backdrop" role="dialog" aria-modal="true" aria-labelledby="celebration-title">
        <section className="reward-screen-panel">
          {characterId ? (
            <div className="reward-screen-coach">
              <CharacterCoach characterId={characterId} state="celebrating" compact />
            </div>
          ) : (
            <div className="reward-screen-icon" aria-hidden="true"><Sparkles size={34} /></div>
          )}
          <div className="reward-screen-eyebrow">{eyebrow}</div>
          <h1 id="celebration-title" className="reward-screen-title">{title}</h1>
          {subtitle && <p className="reward-screen-sub">{subtitle}</p>}

          {xpEarned > 0 && (
            <div className="reward-xp-card" aria-live="polite">
              <div className="reward-xp-label"><Zap size={16} /> XP earned</div>
              <div className="reward-xp-number">+{displayXp}</div>
              <div className="reward-progress-track">
                <div
                  className="reward-progress-fill"
                  style={{ width: `${xpEarned > 0 ? Math.min(100, Math.round((displayXp / xpEarned) * 100)) : 100}%` }}
                />
              </div>
            </div>
          )}

          <div className="reward-screen-actions">
            <button type="button" className="btn-primary reward-continue-btn" onClick={onPrimary}>
              {primaryLabel} <ChevronRight size={17} />
            </button>
            {secondaryLabel && onSecondary && (
              <button type="button" className="btn-secondary reward-secondary-btn" onClick={onSecondary}>
                {secondaryLabel}
              </button>
            )}
          </div>

          {superCtaText && onSuper && (
            <button type="button" className="reward-super-cta" onClick={onSuper}>
              {superCtaText}
            </button>
          )}
        </section>
      </div>
    </>
  );
}
