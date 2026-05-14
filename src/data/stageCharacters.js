// Stage → character mapping. Frontend-only config. The owner is preparing
// original Tuk Talk Thai character art separately; until those assets land
// we render a polished emoji placeholder with a per-character accent color.
// Each entry is keyed by stage id (1-8) so it composes cleanly with
// taxonomy.js without touching that file.
//
// To swap a stage's character later, edit only this file:
//   - placeholderEmoji  →  art `${id}.png` from /public/characters/ (future)
//   - accent            →  per-character brand accent
//   - vibe              →  one-line tone used in the Learn path subtitle

export const CHARACTERS = {
  elephant: {
    id: 'elephant',
    name: 'Chang',
    placeholderEmoji: '🐘',
    accent: '#5BAF7C',
    vibe: 'patient, steady, never forgets a word',
  },
  gecko: {
    id: 'gecko',
    name: 'Jingjok',
    placeholderEmoji: '🦎',
    accent: '#7B5BA3',
    vibe: 'curious, quick, hears every tone',
  },
  monkey: {
    id: 'monkey',
    name: 'Ling',
    placeholderEmoji: '🐒',
    accent: '#E0823B',
    vibe: 'playful — perfect for daily life lessons',
  },
  muayThai: {
    id: 'muay-thai',
    name: 'Khun Suk',
    placeholderEmoji: '🥊',
    accent: '#A03B2C',
    vibe: 'disciplined — pushes you to mastery',
  },
  buffalo: {
    id: 'buffalo',
    name: 'Kwai',
    placeholderEmoji: '🐃',
    accent: '#6B4F2E',
    vibe: 'strong, dependable — your fluency anchor',
  },
  hippo: {
    id: 'hippo',
    name: 'Hippo',
    placeholderEmoji: '🦛',
    accent: '#2563A8',
    vibe: 'cool under pressure — natural Thai flow',
  },
};

// Stage id → character id. Easy to change per owner's intent.
export const STAGE_CHARACTER_MAP = {
  1: 'elephant',   // Survival Thai → Chang
  2: 'monkey',     // Daily Essentials → Ling
  3: 'muayThai',   // Getting Around → Khun Suk
  4: 'elephant',   // Real Conversations → Chang
  5: 'gecko',      // Social Confidence → Jingjok
  6: 'buffalo',    // Intermediate Power → Kwai
  7: 'hippo',      // Natural Thai → Hippo
  8: 'muayThai',   // Thai Mastery → Khun Suk
};

// Safe lookup. Returns a neutral fallback if the stage isn't mapped or the
// character id is unknown — so the UI never crashes when art assets are
// missing or the map is mid-edit.
export function getStageCharacter(stageId) {
  const charId = STAGE_CHARACTER_MAP[stageId];
  const char = charId ? CHARACTERS[charId] : null;
  if (char) return char;
  return {
    id: 'fallback',
    name: 'Tuk Talk',
    placeholderEmoji: '✨',
    accent: '#C9A961',
    vibe: 'your guide on the path',
  };
}
