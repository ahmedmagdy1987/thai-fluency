// Stage → character mapping. Frontend-only config. Real art packs live under
// /public/characters/ for the four base families: `elephant`, `monkey`,
// `hippo`, and `muay-thai`. The four later stages use themed VARIANTS of those
// families (own identity + voice + sound; see characters.js). A variant renders
// its base family's art via `artId` until its own pack ships, then `artId`
// flips to the variant's own folder. These are character / mascot assets, never
// vocabulary content.
//
// Every stage has its own distinct mascot identity — there is no single global
// fallback mascot for normal stages. (`getStageCharacter` still returns a
// neutral object if the map is ever mid-edit, purely so the UI can't crash.)
//
// To swap a stage's character later, edit only this file:
//   - placeholderEmoji  →  emoji shown in the LearnPath badge before art loads
//   - accent            →  per-character brand accent
//   - vibe              →  one-line tone used in the LearnPath subtitle
//   - hasArt            →  true once real art lives at /public/characters/<artId>/
//   - artId             →  folder the art lives in (base family until the
//                          variant's own pack ships)

import { hasRealArt, DEFAULT_CHARACTER_ID } from './characters.js';

export const CHARACTERS = {
  // ---- Base families (own committed art) ----
  elephant: {
    id: 'elephant',
    artId: 'elephant',
    name: 'Chang',
    placeholderEmoji: '🐘',
    accent: '#5BAF7C',
    vibe: 'Patient, steady, and ready to help you remember.',
    hasArt: true,
  },
  monkey: {
    id: 'monkey',
    artId: 'monkey',
    name: 'Ling',
    placeholderEmoji: '🐒',
    accent: '#E0823B',
    vibe: 'Playful practice for daily life.',
    hasArt: true,
  },
  muayThai: {
    id: 'muay-thai',
    artId: 'muay-thai',
    name: 'Khun Suk',
    placeholderEmoji: '🥊',
    accent: '#A03B2C',
    vibe: 'Disciplined coaching for getting around.',
    hasArt: true,
  },
  hippo: {
    id: 'hippo',
    artId: 'hippo',
    name: 'Hippo',
    placeholderEmoji: '🦛',
    accent: '#2563A8',
    vibe: 'Calm practice for natural Thai conversation.',
    hasArt: true,
  },

  // ---- Themed variants for the later stages ----
  // `artId` borrows the base family's art until the variant pack ships.
  monkeySocial: {
    id: 'monkey-social',
    artId: 'monkey', // TODO(asset pass): → 'monkey-social'
    name: 'Ling',
    placeholderEmoji: '🐒',
    accent: '#E0823B',
    vibe: 'Outgoing practice for social confidence.',
    hasArt: true,
  },
  elephantScholar: {
    id: 'elephant-scholar',
    artId: 'elephant', // TODO(asset pass): → 'elephant-scholar'
    name: 'Chang',
    placeholderEmoji: '🐘',
    accent: '#5BAF7C',
    vibe: 'Focused power for intermediate Thai.',
    hasArt: true,
  },
  hippoZen: {
    id: 'hippo-zen',
    artId: 'hippo', // TODO(asset pass): → 'hippo-zen'
    name: 'Hippo',
    placeholderEmoji: '🦛',
    accent: '#2563A8',
    vibe: 'Calm flow for natural, effortless Thai.',
    hasArt: true,
  },
  muayThaiChampion: {
    id: 'muay-thai-champion',
    artId: 'muay-thai', // TODO(asset pass): → 'muay-thai-champion'
    name: 'Khun Suk',
    placeholderEmoji: '🥊',
    accent: '#A03B2C',
    vibe: 'Champion discipline for Thai mastery.',
    hasArt: true,
  },
};

// Stage id → character key (above). Eight stages, eight distinct identities,
// drawn from the four approved families (each as a base + a themed variant).
export const STAGE_CHARACTER_MAP = {
  1: 'elephant',          // Survival Thai → Chang
  2: 'monkey',            // Daily Essentials → Ling
  3: 'muayThai',          // Getting Around → Khun Suk
  4: 'hippo',             // Real Conversations → Hippo
  5: 'monkeySocial',      // Social Confidence → Ling (social)
  6: 'elephantScholar',   // Intermediate Power → Chang (scholar)
  7: 'hippoZen',          // Natural Thai → Hippo (zen)
  8: 'muayThaiChampion',  // Thai Mastery → Khun Suk (champion)
};

// Safe lookup for the LearnPath badge. Returns a neutral fallback if the
// stage isn't mapped or the character id is unknown — so the UI never
// crashes when the map is mid-edit. Normal stages always resolve to their
// own distinct mascot.
export function getStageCharacter(stageId) {
  const charId = STAGE_CHARACTER_MAP[stageId];
  const char = charId ? CHARACTERS[charId] : null;
  if (char) return char;
  return {
    id: 'fallback',
    artId: 'elephant',
    name: 'Tuk Talk',
    placeholderEmoji: '✨',
    accent: '#C9A961',
    vibe: 'A steady guide for the path.',
    hasArt: false,
  };
}

// Resolves the character id used for the lesson Coach for a given stage.
// Every mapped stage character now has a manifest in characters.js (art for
// variants resolves via `artId`), so this returns the stage's own character.
// Falls back to the default art character only if a stage is unmapped or its
// character somehow lacks a manifest.
export function resolveCoachIdForStage(stageId) {
  const entry = stageId ? CHARACTERS[STAGE_CHARACTER_MAP[stageId]] : null;
  if (entry && entry.hasArt && hasRealArt(entry.id)) return entry.id;
  return DEFAULT_CHARACTER_ID;
}
