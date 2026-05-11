import { ACHIEVEMENTS, MISSION_UNLOCK_THRESHOLD } from '../data/gamification.js';
import { CARDS } from '../data/cards.js';
import { STAGES, MISSIONS } from '../data/taxonomy.js';

// Compute state of each stage based on user progress.
// Sequential unlock: Stage N+1 is unlocked when Stage N reaches the
// MISSION_UNLOCK_THRESHOLD (70%) mastery. Stages below the user's
// placement-test startedStage are always considered unlocked (they're
// auto-matured from the placement test or below the user's known floor).
export function getStageState(stats, progress) {
  const startedStage = stats.startedStage || 1;
  const stages = STAGES.map(S => {
    const stageCards = CARDS.filter(c => (c.stage || 1) === S.id);
    const total = stageCards.length;
    const seen = stageCards.filter(c => progress[c.id]).length;
    const mature = stageCards.filter(c => progress[c.id] && progress[c.id].interval >= 21).length;
    const complete = total > 0 && (mature / total) >= MISSION_UNLOCK_THRESHOLD; // 70% mature
    const maturePct = total === 0 ? 0 : Math.round((mature / total) * 100);
    return { ...S, total, seen, mature, complete, maturePct };
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
export function autoBreakdown(phonetic, lookup) {
  if (!phonetic) return null;
  const cleaned = phonetic.replace(/[?!.,]+$/, '').trim();
  const words = cleaned.split(/\s+/);
  const result = [];
  let i = 0;
  while (i < words.length) {
    let matched = false;
    for (let span = Math.min(3, words.length - i); span >= 1; span--) {
      const phrase = words.slice(i, i + span).join(' ').toLowerCase();
      const key = Object.keys(lookup).find(k => k.toLowerCase() === phrase);
      if (key) {
        result.push({ ph: words.slice(i, i + span).join(' '), thai: lookup[key].thai, en: lookup[key].en });
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

// Mission state for Stage 1. Each mission's progress is the % of its cards
// that are mature (SRS interval ≥ 21d). A mission is "complete" at the
// MISSION_UNLOCK_THRESHOLD (70%). Mission N+1 is unlocked when mission N is
// complete. Mission 1 is always unlocked.
export function getMissionState(progress) {
  const s1Cards = CARDS.filter(c => (c.stage || 1) === 1);
  const missions = MISSIONS.map(M => {
    const cards = s1Cards.filter(c => c.mission === M.id);
    const total = cards.length;
    const seen = cards.filter(c => progress[c.id]).length;
    const mature = cards.filter(c => progress[c.id] && progress[c.id].interval >= 21).length;
    const maturePct = total === 0 ? 0 : (mature / total) * 100;
    const complete = total > 0 && (mature / total) >= MISSION_UNLOCK_THRESHOLD;
    return { ...M, total, seen, mature, maturePct, complete };
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
