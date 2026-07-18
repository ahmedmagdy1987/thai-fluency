// Live heart-regeneration state for any surface that DISPLAYS hearts.
//
// WHY (Wave 11): regeneration has always accrued correctly from the moment
// hearts drop below the cap â€” regenCount() gates on `storedHearts < HEART_MAX`
// and spendHeart() stamps heartsUpdatedAt on EVERY spend, not only at zero. So
// a user at 4/5 is genuinely earning a heart back. But the countdown was
// rendered in exactly one place: QuizTab's out-of-hearts gate, which only
// exists at 0 hearts. Below the cap and above zero, a user saw a static "4/5"
// with no hint that a heart was coming or when â€” information they were owed
// and already had. This hook surfaces it wherever hearts appear.
//
// It is DISPLAY ONLY: it reads the same pure economy functions the gate uses
// and writes nothing. Rate and cap are untouched (1 per 30 min, cap 5), and no
// new heart source exists â€” the ticking is purely so the rendered value and
// countdown stay truthful between state changes (without it, the effective
// count is frozen at the last unrelated re-render).

import { useEffect, useState } from 'react';
import { HEART_MAX, regenState, formatCountdown } from '../lib/economy.js';

export function useHeartRegen(stats, isSuper = false) {
  // Super has unlimited hearts â€” nothing regenerates, nothing to tick.
  const [now, setNow] = useState(() => Date.now());
  const snapshot = isSuper ? null : regenState(stats || {}, now);
  const pending = !!snapshot && snapshot.hearts < HEART_MAX;

  useEffect(() => {
    if (isSuper || !pending) return undefined;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [isSuper, pending]);

  if (isSuper) {
    return { isSuper: true, hearts: Infinity, full: true, pending: false, nextRegenMs: 0, countdown: null, label: null };
  }

  const nextRegenMs = snapshot.nextRegenMs;
  const countdown = pending && nextRegenMs > 0 ? formatCountdown(nextRegenMs) : null;
  return {
    isSuper: false,
    hearts: snapshot.hearts,
    full: snapshot.hearts >= HEART_MAX,
    pending,
    nextRegenMs,
    countdown,
    // Short, quiet phrasing for inline display next to a hearts chip.
    label: pending ? (countdown ? `+1 in ${countdown}` : 'A heart is ready') : null,
  };
}

export default useHeartRegen;
