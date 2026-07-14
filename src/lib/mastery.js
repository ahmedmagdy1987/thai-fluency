// Mastery overlay (Roadmap Pass 4 · foundation README §6 · progression.md §4).
//
// A DERIVED, PARALLEL, NEVER-GATING achievement track laid on top of the
// existing SRS. It adds NO scheduler and NO write to the SRS card object. It is
// a read-time derivation (`taught`) plus one monotonic per-card counter
// (`masteryRank`, a sibling map in stats — NEVER inside the srsState object).
//
//   taught ──▶ recognized ──▶ produced ──▶ spoken
//     0            1              2            3
//
// HARD RULES honored here (see README §6 / progression.md §4):
//   • Only `taught` (the existing "seen" signal) advances the path. recognized/
//     produced/spoken NEVER gate or unlock anything — this module intentionally
//     exposes nothing that getStageState/state.js could consume as a gate.
//   • `masteryRank` is MAX-monotonic: it only ever rises. A wrong answer, lapse,
//     or SRS reschedule NEVER lowers it (skill is retained).
//   • `spoken` is structurally unreachable on iOS Safari / Firefox / Capacitor
//     (no Web Speech), so it may never be required for "completion" — the UI
//     marks it optional/device-dependent.
//   • Pure: no React, no I/O, no side effects. The only import is static content
//     data (MINI_UNITS) used to resolve completed-unit card sets.

import { MINI_UNITS, STAGE_1_MINI_UNIT_PILOT } from '../data/miniUnits.js';

// Canonical rank values. RANK[level] maps an exercise signal to a numeric rank.
export const RANK = { taught: 0, recognized: 1, produced: 2, spoken: 3 };

// Rank-indexed short state names (state = MASTERY_STATES[rank]). These are the
// values masteryStateOf returns (plus null = untaught). NOTE: these are the
// short states from the fixed MASTERY-SIGNAL CONTRACT, not the `mastery-*` ids.
export const MASTERY_STATES = ['taught', 'recognized', 'produced', 'spoken'];

// ── Completed-unit → card-id resolution ──────────────────────────────────────
// A card counts as `taught` if it belongs to a completed mini-unit (§4.1 union),
// so we need each unit's full card set: vocab ∪ {sentence} ∪ challenge. Built
// once at module load (the mini-unit catalog is static). The pilot is already
// inside MINI_UNITS, but we defensively fold it in and dedupe by unitId.
function unitCardIds(unit) {
  const ids = [];
  if (Array.isArray(unit?.vocabCardIds)) ids.push(...unit.vocabCardIds);
  if (unit?.sentenceCardId != null) ids.push(unit.sentenceCardId);
  if (Array.isArray(unit?.challengeCardIds)) ids.push(...unit.challengeCardIds);
  return ids.map(Number).filter(Number.isFinite);
}

const UNIT_CARD_IDS = (() => {
  const map = new Map(); // unitId → Set<number>
  const all = [STAGE_1_MINI_UNIT_PILOT, ...(Array.isArray(MINI_UNITS) ? MINI_UNITS : [])];
  for (const unit of all) {
    if (!unit || unit.unitId == null || map.has(unit.unitId)) continue;
    map.set(unit.unitId, new Set(unitCardIds(unit)));
  }
  return map;
})();

// ── advanceMastery: pure, MAX-monotonic ──────────────────────────────────────
// Returns a NEW map with map[cardId] = max(existing, rank). Never mutates the
// input; never downgrades. Called ONLY on a correct graded answer (the caller's
// App.jsx handleMastery routes recognized/produced/spoken here). An invalid rank
// is ignored (the map is returned unchanged).
export function advanceMastery(masteryRank, cardId, rank) {
  const map = masteryRank && typeof masteryRank === 'object' ? masteryRank : {};
  const next = Number(rank);
  if (!Number.isFinite(next)) return map;
  const existing = Number(map[cardId]) || 0;
  if (next <= existing) return map; // already at/above this depth — no downgrade
  return { ...map, [cardId]: next };
}

// ── isTaught: reconcile the two existing "seen" ladders ───────────────────────
// TRUE when progress[cardId] exists (an SRS rating / markCardsKnown wrote it —
// App.jsx grantXp ladder) OR the card belongs to a completed mini-unit (the
// guided-lesson ledger stats.completedMiniUnits). This is the ONLY signal that
// advances the path; it deliberately does not read masteryRank.
export function isTaught(cardId, progress, completedMiniUnits) {
  if (progress && typeof progress === 'object' && progress[cardId]) return true;
  if (!Array.isArray(completedMiniUnits) || completedMiniUnits.length === 0) return false;
  const id = Number(cardId);
  for (const unitId of completedMiniUnits) {
    const set = UNIT_CARD_IDS.get(unitId);
    if (set && set.has(id)) return true;
  }
  return false;
}

// Build the full set of taught card ids once (progress keys ∪ completed-unit
// card sets). Useful for list/aggregate surfaces (BrowseTab, MasterySummary) so
// they do not rebuild the union per card. Returns a Set<number>.
export function taughtCardIds(progress, completedMiniUnits) {
  const out = new Set();
  if (progress && typeof progress === 'object') {
    for (const key of Object.keys(progress)) out.add(Number(key));
  }
  if (Array.isArray(completedMiniUnits)) {
    for (const unitId of completedMiniUnits) {
      const set = UNIT_CARD_IDS.get(unitId);
      if (set) for (const id of set) out.add(id);
    }
  }
  return out;
}

// ── masteryStateOf: derive the display state for one card ─────────────────────
// Returns 'taught' | 'recognized' | 'produced' | 'spoken' | null (null =
// untaught). A recorded rank (>0) implies the card was engaged, so it counts as
// at least taught — this keeps the overlay monotonic even for a card recognized
// via a free listen round that never wrote SRS progress.
export function masteryStateOf(cardId, { progress, masteryRank, completedMiniUnits } = {}) {
  const rank = Number(masteryRank?.[cardId]) || 0;
  const taught = rank > 0 || isTaught(cardId, progress, completedMiniUnits);
  if (!taught) return null;
  return MASTERY_STATES[Math.min(rank, MASTERY_STATES.length - 1)];
}

// ── Display labels ────────────────────────────────────────────────────────────
const STATE_LABELS = {
  taught: 'Taught',
  recognized: 'Recognized',
  produced: 'Produced',
  spoken: 'Spoken',
};

export function masteryLabel(state) {
  if (!state) return 'Not started';
  return STATE_LABELS[state] || 'Not started';
}

export function masteryRankLabel(rank) {
  const r = Number(rank);
  if (!Number.isFinite(r) || r < 0) return 'Not started';
  return masteryLabel(MASTERY_STATES[Math.min(r, MASTERY_STATES.length - 1)]);
}

/* ────────────────────────────────────────────────────────────────────────────
 * SELF-CHECK (illustrative; not executed at runtime). Demonstrates the contract.
 *
 *   advanceMastery({}, 5, RANK.recognized)      // → { 5: 1 }               (rises)
 *   advanceMastery({ 5: 2 }, 5, RANK.recognized) // → { 5: 2 } (SAME ref)    (never downgrades)
 *   advanceMastery({ 5: 1 }, 5, RANK.spoken)     // → { 5: 3 } (NEW map)     (MAX-monotonic)
 *   const before = { 5: 1 }; advanceMastery(before, 5, RANK.produced);
 *   // before still === { 5: 1 }                                            (pure: input untouched)
 *
 *   isTaught(1, { 1: {} }, [])                    // → true   (progress ladder)
 *   isTaught(3396, {}, ['stage-1-introductions-politeness']) // → true (completed-unit ladder)
 *   isTaught(999999, {}, [])                      // → false  (untaught)
 *
 *   masteryStateOf(999999, {})                                  // → null
 *   masteryStateOf(1, { progress: { 1: {} } })                  // → 'taught'
 *   masteryStateOf(1, { progress: { 1: {} }, masteryRank: { 1: 2 } }) // → 'produced'
 *   masteryStateOf(1, { masteryRank: { 1: 1 } })                // → 'recognized' (rank implies taught)
 *
 *   masteryLabel('spoken')     // → 'Spoken'
 *   masteryRankLabel(2)        // → 'Produced'
 * ──────────────────────────────────────────────────────────────────────────── */
