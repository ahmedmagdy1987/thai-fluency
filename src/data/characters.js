// Real character manifest. Keyed by the character id used in folder paths
// under /public/characters/ — so `elephant` resolves to
// /public/characters/elephant/idle.webp, etc.
//
// To add a future character:
//   1. Drop the seven expression WebPs into /public/characters/<id>/
//   2. Add an entry below
//   3. Optionally point a stage at it in stageCharacters.js
//
// All consumers should go through `resolveCharacter(id)` and
// `getExpressionSrc(id, state)` — those handle missing characters,
// missing expressions, and unknown states with safe fallbacks.

export const EXPRESSIONS = [
  'idle',
  'happy',
  'thinking',
  'correct',
  'wrong',
  'celebrating',
  'speaking',
];

// State (the runtime coach state) → expression (the image file name).
// Multiple states can map to the same expression — this is intentional
// so we have room to add nuance without re-cutting art.
export const STATE_TO_EXPRESSION = {
  idle: 'idle',
  greeting: 'happy',
  thinking: 'thinking',
  choiceSelected: 'thinking',
  correct: 'correct',
  wrong: 'wrong',
  celebrating: 'celebrating',
  speaking: 'speaking',
};

const ASSET_EXT = 'webp';
const ASSET_BASE = '/characters';

function assetPath(charId, expression) {
  return `${ASSET_BASE}/${charId}/${expression}.${ASSET_EXT}`;
}

// Sound profile: per-character oscillator tuning so reactions feel
// distinct between coaches. Values are interpreted by sounds.js — keep
// the shape consistent (notes are Hz numbers, durations in seconds).
const SOUND_PROFILE_ELEPHANT = {
  // Warm, rounded, lower-toned — feels patient.
  select:    { notes: [392.00],          dur: [0.10], type: 'triangle', peak: 0.12 }, // G4
  correct:   { notes: [523.25, 659.25],  dur: [0.10, 0.18], type: 'sine', peak: 0.16 }, // C5, E5
  wrong:     { notes: [349.23, 293.66],  dur: [0.16, 0.22], type: 'sine', peak: 0.10 }, // F4, D4 (gentle fall)
  celebrate: { notes: [523.25, 659.25, 783.99, 1046.50], dur: [0.12, 0.12, 0.12, 0.30], type: 'sine', peak: 0.18 },
};

const SOUND_PROFILE_MUAY_THAI = {
  // Bright, energetic, punchier — like a sparring partner cheering you on.
  select:    { notes: [587.33],          dur: [0.06], type: 'square',   peak: 0.10 }, // D5
  correct:   { notes: [659.25, 880.00],  dur: [0.08, 0.16], type: 'triangle', peak: 0.16 }, // E5, A5
  wrong:     { notes: [392.00, 329.63],  dur: [0.12, 0.20], type: 'triangle', peak: 0.11 }, // G4, E4
  celebrate: { notes: [659.25, 783.99, 987.77, 1318.51], dur: [0.10, 0.10, 0.10, 0.32], type: 'triangle', peak: 0.20 },
};

// The full manifest. `expressions` is built lazily from EXPRESSIONS so
// future-added expressions only need to be added in one place.
function buildExpressionMap(charId) {
  const out = {};
  EXPRESSIONS.forEach(e => { out[e] = assetPath(charId, e); });
  return out;
}

export const CHARACTERS = {
  elephant: {
    id: 'elephant',
    displayName: 'Chang',
    role: 'Survival Thai coach — patient, steady, never forgets a word.',
    defaultExpression: 'idle',
    fallbackExpression: 'idle',
    accentColor: '#5BAF7C',
    expressions: buildExpressionMap('elephant'),
    soundProfile: SOUND_PROFILE_ELEPHANT,
    // Voice-lines used by the speech bubble. Short, motivational, generic
    // enough to fit any card. Picked randomly within each category.
    lines: {
      idle:           ['Take your time.', 'You got this.', 'Ready when you are.'],
      thinking:       ['Hmm, what could it be?', 'Picture it in your head.', 'Listen for the tone.'],
      choiceSelected: ['Let me check…', 'Good — let\'s see.', 'Showing the answer…'],
      correct:        ['Nice!', 'Yes — exactly right.', 'Sàwàtdee, fluency!', 'You\'re getting it.'],
      wrong:          ['Almost. Try again.', 'No worries — we\'ll get it.', 'That one\'s tricky.'],
      celebrating:    ['Look at you!', 'Mài bao róo… wait, you do!', 'Outstanding work.'],
      speaking:       ['Listen closely.', 'Hear the tone?', 'Repeat after the audio.'],
      greeting:       ['Sàwàtdee khráp!', 'Welcome back!', 'Let\'s get a few cards in.'],
    },
  },

  'muay-thai': {
    id: 'muay-thai',
    displayName: 'Khun Suk',
    role: 'Travel & mastery coach — disciplined, sharp, pushes you forward.',
    defaultExpression: 'idle',
    fallbackExpression: 'idle',
    accentColor: '#A03B2C',
    expressions: buildExpressionMap('muay-thai'),
    soundProfile: SOUND_PROFILE_MUAY_THAI,
    lines: {
      idle:           ['Focus.', 'One round at a time.', 'Stay sharp.'],
      thinking:       ['Think it through.', 'Trust your ear.', 'You\'ve seen this one.'],
      choiceSelected: ['Let\'s see it.', 'Good call.', 'Checking…'],
      correct:        ['Sharp!', 'Clean answer.', 'That\'s the one.', 'Knockout!'],
      wrong:          ['Reset. Try again.', 'Not quite — shake it off.', 'Get the tone next time.'],
      celebrating:    ['Champion form.', 'You earned that.', 'Round won.'],
      speaking:       ['Listen for the tone.', 'Match the rhythm.', 'Tone, then meaning.'],
      greeting:       ['Glove up. Let\'s train.', 'Welcome to the gym.', 'Ready to drill?'],
    },
  },
};

// All character ids that have real art committed to /public/characters.
// Anything not in this list must fall back through resolveCharacter().
export const CHARACTERS_WITH_ART = Object.keys(CHARACTERS);

// The default coach used when a stage points at a character without real
// art (or no character at all). Elephant is the warm onboarding default.
export const DEFAULT_CHARACTER_ID = 'elephant';

// Safely resolves a character manifest. If the id is unknown OR the
// character has no real art, we fall back to the default character.
export function resolveCharacter(characterId) {
  if (characterId && CHARACTERS[characterId]) return CHARACTERS[characterId];
  return CHARACTERS[DEFAULT_CHARACTER_ID];
}

// Returns the image src for a given (character, state). Falls back to the
// character's idle expression if the state or expression is missing.
export function getExpressionSrc(characterId, stateOrExpression) {
  const char = resolveCharacter(characterId);
  const expression = STATE_TO_EXPRESSION[stateOrExpression]
    || (EXPRESSIONS.includes(stateOrExpression) ? stateOrExpression : null);
  if (expression && char.expressions[expression]) return char.expressions[expression];
  return char.expressions[char.fallbackExpression] || char.expressions.idle;
}

// Pick a short message for a given (character, state). Falls back to the
// idle pool when the state has no entries. Returns null if the character
// is unknown — callers should treat null as "no bubble".
export function pickLine(characterId, state) {
  const char = resolveCharacter(characterId);
  const pool = (char.lines && char.lines[state]) || (char.lines && char.lines.idle) || null;
  if (!pool || pool.length === 0) return null;
  if (pool.length === 1) return pool[0];
  return pool[Math.floor(Math.random() * pool.length)];
}

// Whether a given character id has real art and should be used by the
// coach. stageCharacters.js uses this to decide if a stage-mapped
// character can be the active coach, or if we should fall back to the
// default character.
export function hasRealArt(characterId) {
  return CHARACTERS_WITH_ART.includes(characterId);
}
