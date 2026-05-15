// Stage → character mapping. Frontend-only config. The owner has shipped
// real art for `elephant` and `muay-thai` (see /public/characters/). The
// remaining characters (monkey, gecko, buffalo, hippo) still ship with
// emoji placeholders for the LearnPath stage list. The lesson Coach
// only renders real art — when a stage points at a character without
// real art, the coach falls back to the default (elephant) via
// resolveCoachIdForStage() below.
//
// To swap a stage's character later, edit only this file:
//   - placeholderEmoji  →  emoji shown in the LearnPath badge
//   - accent            →  per-character brand accent
//   - vibe              →  one-line tone used in the LearnPath subtitle
//   - hasArt            →  true once real art lives at /public/characters/<id>/

import { hasRealArt, DEFAULT_CHARACTER_ID } from './characters.js';

export const CHARACTERS = {
  elephant: {
    id: 'elephant',
    name: 'Chang',
    placeholderEmoji: '🐘',
    accent: '#5BAF7C',
    vibe: 'Patient, steady, and ready to help you remember.',
    hasArt: true,
  },
  gecko: {
    id: 'gecko',
    name: 'Jingjok',
    placeholderEmoji: '🦎',
    accent: '#7B5BA3',
    vibe: 'Curious, quick, and sharp with tones.',
    hasArt: false,
  },
  monkey: {
    id: 'monkey',
    name: 'Ling',
    placeholderEmoji: '🐒',
    accent: '#E0823B',
    vibe: 'Playful practice for daily life.',
    hasArt: false,
  },
  muayThai: {
    id: 'muay-thai',
    name: 'Khun Suk',
    placeholderEmoji: '🥊',
    accent: '#A03B2C',
    vibe: 'Disciplined coaching for steady mastery.',
    hasArt: true,
  },
  buffalo: {
    id: 'buffalo',
    name: 'Kwai',
    placeholderEmoji: '🐃',
    accent: '#6B4F2E',
    vibe: 'Strong support for confident fluency.',
    hasArt: false,
  },
  hippo: {
    id: 'hippo',
    name: 'Hippo',
    placeholderEmoji: '🦛',
    accent: '#2563A8',
    vibe: 'Calm practice for natural Thai flow.',
    hasArt: false,
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

// Safe lookup for the LearnPath badge. Returns a neutral fallback if the
// stage isn't mapped or the character id is unknown — so the UI never
// crashes when art assets are missing or the map is mid-edit.
export function getStageCharacter(stageId) {
  const charId = STAGE_CHARACTER_MAP[stageId];
  const char = charId ? CHARACTERS[charId] : null;
  if (char) return char;
  return {
    id: 'fallback',
    name: 'Tuk Talk',
    placeholderEmoji: '✨',
    accent: '#C9A961',
    vibe: 'A steady guide for the path.',
    hasArt: false,
  };
}

// Resolves the character id used for the lesson Coach for a given stage.
// Differs from getStageCharacter: the coach can only use characters with
// real art committed. If the stage points at a no-art character (monkey,
// gecko, buffalo, hippo, or any unknown id), we fall back to the default
// art character (elephant). Returns the string id, not the manifest.
export function resolveCoachIdForStage(stageId) {
  const entry = stageId ? CHARACTERS[STAGE_CHARACTER_MAP[stageId]] : null;
  if (entry && entry.hasArt && hasRealArt(entry.id)) return entry.id;
  return DEFAULT_CHARACTER_ID;
}
