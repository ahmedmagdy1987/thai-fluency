import React, { useMemo } from 'react';
import {
  MASTERY_STATES,
  masteryStateOf,
  masteryLabel,
  masteryRankLabel,
  taughtCardIds,
} from '../lib/mastery.js';

// MasteryTrack — a compact, purely-presentational 4-dot depth track for one card:
//
//   taught ─ recognized ─ produced ─ spoken
//
// It reuses existing design tokens (plain CSS classes in app.css; see the handoff
// note for `.mastery-*`). NO new design language, no icons library beyond text.
//
// The `spoken` dot is visibly marked OPTIONAL / device-dependent: browser speech
// is structurally unavailable on iOS Safari / Firefox / Capacitor, so `spoken` can
// never be required for completion. The "core" track completes at `produced`; the
// spoken dot is a bonus so those users never see a permanently-incomplete track.
//
// Accepts EITHER a precomputed `state` ('taught'|'recognized'|'produced'|'spoken'
// |null) OR `cardId` + the maps (`progress`, `masteryRank`, `completedMiniUnits`),
// in which case it derives the state via masteryStateOf. Passing `state` directly
// is preferred in long lists (the caller derives it once and avoids rebuilding the
// taught union per row).

const CORE_STATES = MASTERY_STATES.filter((s) => s !== 'spoken'); // taught/recognized/produced

export default function MasteryTrack({
  state,
  cardId,
  progress,
  masteryRank,
  completedMiniUnits,
  showLabels = false,
  className = '',
}) {
  const resolved = state !== undefined
    ? state
    : masteryStateOf(cardId, { progress, masteryRank, completedMiniUnits });

  const currentRank = resolved ? MASTERY_STATES.indexOf(resolved) : -1;
  const coreComplete = currentRank >= MASTERY_STATES.indexOf('produced');

  return (
    <div
      className={`mastery-track ${className}`.trim()}
      role="img"
      aria-label={resolved ? `Mastery: ${masteryLabel(resolved)}` : 'Mastery: not started'}
      title={resolved ? masteryLabel(resolved) : 'Not started'}
    >
      {MASTERY_STATES.map((s, rank) => {
        const reached = currentRank >= rank;
        const optional = s === 'spoken';
        const cls = [
          'mastery-dot',
          reached && 'mastery-dot-reached',
          rank === currentRank && 'mastery-dot-current',
          optional && 'mastery-dot-optional',
          optional && coreComplete && 'mastery-dot-optional-done',
        ].filter(Boolean).join(' ');
        return (
          <span key={s} className="mastery-dot-wrap">
            <span
              className={cls}
              aria-hidden="true"
              title={optional ? `${masteryRankLabel(rank)} — optional (needs device speech)` : masteryRankLabel(rank)}
            >
              {optional && <span className="mastery-dot-optional-mark" aria-hidden="true">✦</span>}
            </span>
            {showLabels && (
              <span className="mastery-dot-label">
                {masteryRankLabel(rank)}{optional ? ' (optional)' : ''}
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}

// MasterySummary — aggregate mastery counts across a deck. Purely presentational.
// Builds the taught set once (memoized) so it never rebuilds the union per card.
// Pass `cards` (array of card objects with numeric `id`) plus the maps.
export function MasterySummary({
  cards = [],
  progress,
  masteryRank,
  completedMiniUnits,
  className = '',
}) {
  const counts = useMemo(() => {
    const taughtSet = taughtCardIds(progress, completedMiniUnits);
    const ranks = masteryRank && typeof masteryRank === 'object' ? masteryRank : {};
    const tally = { taught: 0, recognized: 0, produced: 0, spoken: 0 };
    for (const card of cards) {
      const id = Number(card?.id);
      const rank = Number(ranks[id]) || 0;
      if (!(rank > 0 || taughtSet.has(id))) continue; // untaught → not counted
      const state = MASTERY_STATES[Math.min(rank, MASTERY_STATES.length - 1)];
      if (state in tally) tally[state] += 1;
    }
    return tally;
  }, [cards, progress, masteryRank, completedMiniUnits]);

  return (
    <div className={`mastery-summary ${className}`.trim()} aria-label="Mastery breakdown">
      {MASTERY_STATES.map((s) => (
        <div key={s} className={`mastery-summary-item mastery-summary-item-${s}`}>
          <span className="mastery-summary-count">{counts[s]}</span>
          <span className="mastery-summary-label">
            {masteryLabel(s)}{s === 'spoken' ? ' *' : ''}
          </span>
        </div>
      ))}
      <div className="mastery-summary-note">✦ Spoken is optional — it needs on-device speech.</div>
    </div>
  );
}
