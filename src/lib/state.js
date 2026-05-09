import { ACHIEVEMENTS } from '../data/gamification.js';
import { CARDS } from '../data/cards.js';
import { STAGES } from '../data/taxonomy.js';

// Compute state of each stage based on user progress
export function getStageState(stats, progress) {
  const stages = STAGES.map(S => {
    const stageCards = CARDS.filter(c => (c.stage || 1) === S.id);
    const total = stageCards.length;
    const seen = stageCards.filter(c => progress[c.id]).length;
    const mature = stageCards.filter(c => progress[c.id] && progress[c.id].interval >= 21).length;
    const complete = total > 0 && mature >= Math.floor(total * 0.8); // 80% mature = stage complete
    const maturePct = total === 0 ? 0 : Math.round((mature / total) * 100);
    return { ...S, total, seen, mature, complete, maturePct };
  });

  // Determine current stage (first incomplete stage at or after user's startedStage)
  let currentStage = stages.length;
  const startedStage = stats.startedStage || 1;
  for (let i = 0; i < stages.length; i++) {
    if (stages[i].id < startedStage) continue;
    if (stages[i].total > 0 && !stages[i].complete) { currentStage = stages[i].id; break; }
  }

  const stagesWithLock = stages.map(S => ({
    ...S,
    unlocked: S.id >= startedStage,
  }));

  return { stages: stagesWithLock, currentStage };
}

// Build a placement test by sampling 2 cards per stage
export function buildPlacementCards() {
  const out = [];
  for (let stage = 1; stage <= 8; stage++) {
    const stageCards = CARDS.filter(c => (c.stage || 1) === stage);
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
