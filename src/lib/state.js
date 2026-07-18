import { ACHIEVEMENTS, MISSION_UNLOCK_THRESHOLD } from '../data/gamification.js';
import { CARDS } from '../data/cards.js';
import { STAGES, MISSIONS } from '../data/taxonomy.js';
import { WORD_LOOKUP } from '../data/lookup.js';

// Compute state of each stage based on user progress.
//
// Sequential unlock: Stage N+1 unlocks when Stage N is COMPLETE. A stage is
// complete when all of its cards are LEARNED (seen at least once in a guided
// session) — mastery is NOT required to advance. This matches the mission
// model (a mission completes when all its cards are seen) so that, e.g.,
// 150/150 learned in Stage 1 immediately unlocks Stage 2 even with 0 cards
// matured.
//
// We keep the legacy "≥70% matured" path as an OR fallback so that any user
// who already unlocked the next stage under the old mastery-based rule is
// never re-locked after this change (do-not-regress safeguard).
//
// Stages below the user's placement-test startedStage are always considered
// UNLOCKED (maxUnlockedStage starts at startedStage). They are NOT auto-matured:
// placement writes progress only for the sampled cards the user ticked as known
// (App.jsx markCardsKnown), so the rest of a skipped stage's cards stay unseen.
// (Wave 10 corrected this comment — the old "auto-matured" claim was false.)
export function getStageState(stats, progress) {
  const safeProgress = progress && typeof progress === 'object' ? progress : {};
  const startedStage = stats.startedStage || 1;
  const stages = STAGES.map(S => {
    const stageCards = CARDS.filter(c => (c.stage || 1) === S.id);
    const total = stageCards.length;
    const seen = stageCards.filter(c => safeProgress[c.id]).length;
    const mature = stageCards.filter(c => safeProgress[c.id] && safeProgress[c.id].interval >= 21).length;
    // Primary rule: all cards learned. Fallback: legacy ≥70% matured (so
    // pre-existing unlocks survive). Mastery is never *required* to advance.
    const learnedComplete = total > 0 && seen >= total;
    const matureComplete = total > 0 && (mature / total) >= MISSION_UNLOCK_THRESHOLD;
    const complete = learnedComplete || matureComplete;
    const seenPct = total === 0 ? 0 : Math.round((seen / total) * 100);
    const maturePct = total === 0 ? 0 : Math.round((mature / total) * 100);
    return { ...S, total, seen, mature, complete, learnedComplete, seenPct, maturePct };
  });

  // Sequential unlock: walk stages from startedStage upward; each contiguous
  // complete stage unlocks the next one.
  let maxUnlockedStage = startedStage;
  for (const s of stages) {
    if (s.id < startedStage) continue;
    if (s.complete) maxUnlockedStage = Math.min(STAGES.length, s.id + 1);
    else break;
  }

  // Current stage = first incomplete stage at or after startedStage.
  let currentStage = stages.length;
  for (let i = 0; i < stages.length; i++) {
    if (stages[i].id < startedStage) continue;
    if (stages[i].total > 0 && !stages[i].complete) { currentStage = stages[i].id; break; }
  }

  const stagesWithLock = stages.map(S => ({
    ...S,
    unlocked: S.id <= maxUnlockedStage,
  }));

  return { stages: stagesWithLock, currentStage, maxUnlockedStage };
}

// Build a placement test by sampling 2 cards per stage. Skip cards with empty
// phonetic (user can't assess "do you know this" without it).
export function buildPlacementCards() {
  const out = [];
  for (let stage = 1; stage <= 8; stage++) {
    const stageCards = CARDS.filter(c => (c.stage || 1) === stage && c.ph && c.ph.trim());
    if (stageCards.length === 0) continue;
    const shuffled = [...stageCards].sort(() => Math.random() - 0.5);
    const word = shuffled.find(c => c.type === 'w');
    const phrase = shuffled.find(c => c.type === 's' || c.type === 'p');
    if (word) out.push(word);
    if (phrase && phrase !== word) out.push(phrase);
    else if (shuffled[1] && shuffled[1] !== word) out.push(shuffled[1]);
  }
  return out.slice(0, 14);
}

// Auto-generate breakdown from phonetic using WORD_LOOKUP
export function autoBreakdown(phonetic, lookup = WORD_LOOKUP) {
  if (!phonetic) return null;
  const safeLookup = (lookup && typeof lookup === 'object') ? lookup : {};
  const cleaned = phonetic.replace(/[?!.,]+$/, '').trim();
  const words = cleaned.split(/\s+/);
  const result = [];
  let i = 0;
  while (i < words.length) {
    let matched = false;
    for (let span = Math.min(3, words.length - i); span >= 1; span--) {
      const phrase = words.slice(i, i + span).join(' ').toLowerCase();
      const key = Object.keys(safeLookup).find(k => k.toLowerCase() === phrase);
      if (key) {
        result.push({ ph: words.slice(i, i + span).join(' '), thai: safeLookup[key].thai, en: safeLookup[key].en });
        i += span;
        matched = true;
        break;
      }
    }
    if (!matched) {
      result.push({ ph: words[i], thai: '—', en: '?' });
      i++;
    }
  }
  const hits = result.filter(r => r.en !== '?').length;
  if (hits / result.length < 0.5) return null;
  return result;
}

export function checkAchievements(stats, progress, achievements = ACHIEVEMENTS) {
  return achievements.map(a => ({ ...a, unlocked: a.check(stats, progress) }));
}

// Mission state for Stage 1. Launch sessions complete when every card in the
// current mission has been reviewed/seen. SRS maturity is tracked separately
// so the UI can show learned progress and mastered progress side by side.
export function getMissionState(progress) {
  const safeProgress = progress && typeof progress === 'object' ? progress : {};
  const s1Cards = CARDS.filter(c => (c.stage || 1) === 1);
  const missions = MISSIONS.map(M => {
    const cards = s1Cards.filter(c => c.mission === M.id);
    const total = cards.length;
    const seen = cards.filter(c => safeProgress[c.id]).length;
    const mature = cards.filter(c => safeProgress[c.id] && safeProgress[c.id].interval >= 21).length;
    const seenPct = total === 0 ? 0 : Math.round((seen / total) * 100);
    const maturePct = total === 0 ? 0 : (mature / total) * 100;
    const complete = total > 0 && seen >= total;
    return { ...M, total, seen, mature, seenPct, maturePct, complete, cardIds: cards.map(c => c.id) };
  });

  // Lock state: M1 always unlocked; M(N+1) unlocked when M(N) is complete.
  const withLock = missions.map((m, i) => ({
    ...m,
    unlocked: i === 0 || missions[i - 1].complete,
  }));

  // Determine current mission = first non-complete mission, or M6 if all done
  let currentMission = withLock[withLock.length - 1].id;
  for (const m of withLock) {
    if (!m.complete) { currentMission = m.id; break; }
  }

  // Stage 1 is "complete" when all 6 missions are complete (i.e. M6 complete)
  const stage1Complete = withLock[withLock.length - 1].complete;

  return { missions: withLock, currentMission, stage1Complete };
}
