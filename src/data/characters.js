// Real character manifest. Keyed by the character id used in folder paths
// under /public/characters/ — so `elephant` resolves to
// /public/characters/elephant/idle.webp, etc.
//
// Eight stage mascots, drawn from four approved families (Elephant, Monkey,
// Hippo, Muay Thai). Four are base families with their own committed art; four
// are themed VARIANTS of those families (different identity, voice, and sound)
// used for the later stages. A variant renders its own art once its pack ships;
// until then it borrows its base family's art via `artId` so the UI is never
// broken — see `artId` below. Stage → character mapping lives in
// stageCharacters.js; this file owns the per-character manifest.
//
// To add / promote a character:
//   1. Drop the seven expression WebPs into /public/characters/<id>/
//   2. Set the character's `artId` to its own id (or drop it to default to id)
//   3. Point a stage at it in stageCharacters.js
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

const SOUND_PROFILE_MONKEY = {
  // Playful, bouncy, bright — quick and a little cheeky.
  select:    { notes: [659.25],          dur: [0.06], type: 'triangle', peak: 0.11 }, // E5
  correct:   { notes: [587.33, 880.00],  dur: [0.08, 0.16], type: 'triangle', peak: 0.16 }, // D5, A5
  wrong:     { notes: [440.00, 349.23],  dur: [0.12, 0.18], type: 'triangle', peak: 0.10 }, // A4, F4
  celebrate: { notes: [587.33, 739.99, 880.00, 1174.66], dur: [0.10, 0.10, 0.10, 0.30], type: 'triangle', peak: 0.19 },
};

const SOUND_PROFILE_HIPPO = {
  // Calm, mellow, rounded — unhurried and reassuring.
  select:    { notes: [349.23],          dur: [0.12], type: 'sine', peak: 0.11 }, // F4
  correct:   { notes: [493.88, 587.33],  dur: [0.12, 0.20], type: 'sine', peak: 0.15 }, // B4, D5
  wrong:     { notes: [329.63, 277.18],  dur: [0.18, 0.24], type: 'sine', peak: 0.09 }, // E4, C#4 (soft fall)
  celebrate: { notes: [493.88, 587.33, 698.46, 880.00], dur: [0.14, 0.14, 0.14, 0.32], type: 'sine', peak: 0.17 },
};

// The full manifest. `expressions` is built lazily from EXPRESSIONS so
// future-added expressions only need to be added in one place.
function buildExpressionMap(charId) {
  const out = {};
  EXPRESSIONS.forEach(e => { out[e] = assetPath(charId, e); });
  return out;
}

// Normalize a manifest config into a full character. `artId` is the folder the
// art lives in: defaults to the character's own id, but a variant can point at
// its base family's folder until its own pack ships (graceful fallback — the
// identity, voice, and sound are still the variant's; only the picture is
// borrowed). Flip `artId` to the variant's own id once its pack lands.
function makeCharacter(cfg) {
  const artId = cfg.artId || cfg.id;
  return {
    defaultExpression: 'idle',
    fallbackExpression: 'idle',
    ...cfg,
    artId,
    expressions: buildExpressionMap(artId),
  };
}

export const CHARACTERS = {
  // ---------------- Base families (own committed art) ----------------
  elephant: makeCharacter({
    id: 'elephant',
    displayName: 'Chang',
    role: 'Survival Thai coach — patient, steady, never forgets a word.',
    accentColor: '#5BAF7C',
    soundProfile: SOUND_PROFILE_ELEPHANT,
    // Voice-lines used by the speech bubble. Two pools per character:
    //
    //   review (top-level): used by CardsTab — an SRS self-rating flow.
    //     The learner reveals an answer, then rates how well they
    //     recalled it. Copy is reflective, not interrogative.
    //
    //   quiz: reserved for QuizTab — a multiple-choice flow where the
    //     coach reacts to a chosen answer. Copy is interrogative /
    //     adjudicative.
    lines: {
      idle:           ['Take your time.', 'Ready when you are.', 'No rush.'],
      thinking:       ['Did you remember it?', 'How well do you know it?', 'Be honest with yourself.'],
      choiceSelected: ['How did that feel?', 'Rate your recall.', 'Honest take?'],
      correct:        ['Locked in.', 'That\'ll stick.', 'Solid recall.', 'Keep it warm.'],
      wrong:          ['We\'ll see it again soon.', 'Tricky one — next time.', 'Keep it in mind.'],
      celebrating:    ['Look at you!', 'Outstanding work.', 'You\'ve earned this.'],
      speaking:       ['Listen closely.', 'Hear the tone?', 'Mirror the rhythm.'],
      greeting:       ['Sàwàtdee khráp!', 'Welcome back!', 'Let\'s warm up.'],
      quiz: {
        idle:           ['Pick when ready.', 'Take your time.'],
        thinking:       ['Hmm, which one?', 'Listen for the tone.', 'Picture it in your head.'],
        choiceSelected: ['Let me check.', 'Locked in.', 'Good. Let\'s see.'],
        correct:        ['Exactly right.', 'You got it.', 'Strong answer.'],
        wrong:          ['Almost. Try the next one.', 'Not quite. Listen for the tone.', 'That one is tricky.'],
        celebrating:    ['Strong run!', 'Crushed it.'],
        speaking:       ['Listen closely.', 'Hear the tone?'],
        greeting:       ['Ready for a challenge?', 'Let\'s test it.'],
      },
    },
  }),

  monkey: makeCharacter({
    id: 'monkey',
    displayName: 'Ling',
    role: 'Daily-life coach — playful, quick, full of everyday Thai.',
    accentColor: '#E0823B',
    soundProfile: SOUND_PROFILE_MONKEY,
    lines: {
      idle:           ['Whenever you\'re ready.', 'Let\'s play.', 'Quick one?'],
      thinking:       ['Got it yet?', 'How well do you know it?', 'Quick gut check.'],
      choiceSelected: ['How did that feel?', 'Rate it.', 'Honest?'],
      correct:        ['Nice one!', 'That\'ll stick.', 'Smooth.', 'Got it!'],
      wrong:          ['No worries, again soon.', 'Slippery one!', 'We\'ll catch it next time.'],
      celebrating:    ['Woohoo!', 'Look at you go!', 'Too easy for you.'],
      speaking:       ['Listen up.', 'Catch the tone?', 'Say it with me.'],
      greeting:       ['Sàwàtdee!', 'Hey, welcome back!', 'Let\'s have fun.'],
      quiz: {
        idle:           ['Pick when ready.', 'Let\'s go.'],
        thinking:       ['Which one?', 'Listen for the tone.'],
        choiceSelected: ['Let\'s see!', 'Locked in?', 'Ooh, bold.'],
        correct:        ['Yes!', 'Nailed it.', 'Smooth move.'],
        wrong:          ['Close! Next one.', 'Tricky — listen again.'],
        celebrating:    ['Great run!', 'Crushed it!'],
        speaking:       ['Catch the tone?', 'Say it with me.'],
        greeting:       ['Ready to play?', 'Let\'s test it!'],
      },
    },
  }),

  hippo: makeCharacter({
    id: 'hippo',
    displayName: 'Hippo',
    role: 'Conversation coach — calm, encouraging, keeps Thai flowing.',
    accentColor: '#2563A8',
    soundProfile: SOUND_PROFILE_HIPPO,
    lines: {
      idle:           ['No hurry at all.', 'Settle in.', 'Whenever you\'re ready.'],
      thinking:       ['Does it come back?', 'How well do you know it?', 'Take a breath, then rate it.'],
      choiceSelected: ['How did that feel?', 'Rate your recall.', 'Honest take?'],
      correct:        ['Lovely.', 'That\'ll stick.', 'Nice and steady.', 'Well held.'],
      wrong:          ['It\'ll come back around.', 'Gently does it.', 'We\'ll revisit it.'],
      celebrating:    ['Wonderful work.', 'Smooth and steady.', 'You\'ve earned this.'],
      speaking:       ['Listen closely.', 'Feel the rhythm.', 'Let it flow.'],
      greeting:       ['Sàwàtdee.', 'Good to see you.', 'Let\'s ease in.'],
      quiz: {
        idle:           ['Pick when ready.', 'No rush.'],
        thinking:       ['Which one feels right?', 'Listen for the tone.'],
        choiceSelected: ['Let\'s see.', 'Locked in.', 'Good.'],
        correct:        ['Lovely.', 'Just right.', 'Smooth.'],
        wrong:          ['Almost. Try again.', 'Not quite — listen once more.'],
        celebrating:    ['Beautifully done.', 'Steady run!'],
        speaking:       ['Feel the rhythm.', 'Let it flow.'],
        greeting:       ['Ready for a few?', 'Let\'s flow.'],
      },
    },
  }),

  'muay-thai': makeCharacter({
    id: 'muay-thai',
    displayName: 'Khun Suk',
    role: 'Travel & getting-around coach — disciplined, sharp, pushes you forward.',
    accentColor: '#A03B2C',
    soundProfile: SOUND_PROFILE_MUAY_THAI,
    lines: {
      idle:           ['Stay sharp.', 'Focus.', 'One round at a time.'],
      thinking:       ['Do you know it?', 'Honest answer.', 'Trust your gut.'],
      choiceSelected: ['How sharp was that?', 'Rate it honest.', 'Be straight with yourself.'],
      correct:        ['Clean.', 'Locked in.', 'That\'s a keeper.', 'Sharp recall.'],
      wrong:          ['Reset. We\'ll drill it again.', 'Shake it off.', 'Next round, that\'s yours.'],
      celebrating:    ['Champion form.', 'Round won.', 'You earned that.'],
      speaking:       ['Listen for the tone.', 'Match the rhythm.', 'Tone, then meaning.'],
      greeting:       ['Glove up.', 'Welcome to the gym.', 'Let\'s warm up.'],
      quiz: {
        idle:           ['Pick when ready.', 'Stay sharp.'],
        thinking:       ['Which one?', 'Trust your ear.'],
        choiceSelected: ['Let\'s see it.', 'Checking.', 'Good call.'],
        correct:        ['Sharp!', 'Clean answer.', 'That\'s the one.', 'Knockout!'],
        wrong:          ['Reset. Try the next.', 'Not quite. Shake it off.'],
        celebrating:    ['Champion form.', 'Round won.'],
        speaking:       ['Listen for the tone.', 'Match the rhythm.'],
        greeting:       ['Ready to drill?', 'Step in the ring.'],
      },
    },
  }),

  // ---------------- Themed variants (later stages) ----------------
  // Each keeps its base family's art (`artId`) until its own pack ships in the
  // asset pass; flip `artId` to the variant id then. Identity, voice, and sound
  // are already the variant's own.
  'monkey-social': makeCharacter({
    id: 'monkey-social',
    artId: 'monkey-social',
    displayName: 'Ling',
    role: 'Social-confidence coach — outgoing, expressive, great with small talk.',
    accentColor: '#E0823B',
    soundProfile: SOUND_PROFILE_MONKEY,
    lines: {
      idle:           ['Ready to chat?', 'Let\'s be social.', 'Whenever you\'re ready.'],
      thinking:       ['Would you say it out loud?', 'How well do you know it?', 'Honest gut check.'],
      choiceSelected: ['How did that feel?', 'Rate it.', 'Honest?'],
      correct:        ['Smooth talker!', 'That\'ll stick.', 'Confident!', 'Love it.'],
      wrong:          ['No worries, again soon.', 'Happens in real talk too.', 'We\'ll catch it.'],
      celebrating:    ['You\'re a natural!', 'So smooth!', 'Confidence unlocked.'],
      speaking:       ['Say it like you mean it.', 'Catch the tone?', 'With a smile.'],
      greeting:       ['Sàwàtdee!', 'Let\'s mingle.', 'Ready to charm?'],
    },
  }),

  'elephant-scholar': makeCharacter({
    id: 'elephant-scholar',
    artId: 'elephant-scholar',
    displayName: 'Chang',
    role: 'Intermediate-power coach — focused, thorough, building real depth.',
    accentColor: '#5BAF7C',
    soundProfile: SOUND_PROFILE_ELEPHANT,
    lines: {
      idle:           ['Let\'s build on it.', 'Ready when you are.', 'Steady focus.'],
      thinking:       ['Do you really know it?', 'How deep is it?', 'Be honest with yourself.'],
      choiceSelected: ['How solid was that?', 'Rate your recall.', 'Honest take?'],
      correct:        ['Strong.', 'That\'s real depth.', 'Locked in.', 'Built to last.'],
      wrong:          ['We\'ll reinforce it.', 'Tricky — we\'ll return.', 'Note it and move on.'],
      celebrating:    ['Real progress.', 'Powerful work.', 'You\'ve earned this.'],
      speaking:       ['Listen closely.', 'Hear the tone?', 'Mirror the rhythm.'],
      greeting:       ['Sàwàtdee khráp!', 'Welcome back.', 'Let\'s go deeper.'],
    },
  }),

  'hippo-zen': makeCharacter({
    id: 'hippo-zen',
    artId: 'hippo-zen',
    displayName: 'Hippo',
    role: 'Natural-Thai coach — calm, mindful, helps you sound effortless.',
    accentColor: '#2563A8',
    soundProfile: SOUND_PROFILE_HIPPO,
    lines: {
      idle:           ['Breathe. Begin when ready.', 'No hurry at all.', 'Let it come naturally.'],
      thinking:       ['Does it flow back?', 'How natural is it?', 'Take a breath, then rate it.'],
      choiceSelected: ['How natural was that?', 'Rate your recall.', 'Honest take?'],
      correct:        ['Effortless.', 'That\'ll stick.', 'Natural flow.', 'Beautifully held.'],
      wrong:          ['It\'ll settle in.', 'Gently does it.', 'We\'ll flow back to it.'],
      celebrating:    ['So natural.', 'Effortless work.', 'You\'ve earned this.'],
      speaking:       ['Feel the rhythm.', 'Let it flow.', 'Easy and natural.'],
      greeting:       ['Sàwàtdee.', 'Good to see you.', 'Let\'s flow.'],
    },
  }),

  // PENDING REGENERATION: the bespoke Khun Suk Champion art pack
  // (/public/characters/muay-thai-champion/) was REJECTED and is temporarily
  // disabled. The champion KEEPS its own identity, name, voice copy, and sound —
  // only the artwork borrows the approved base muay-thai pack via `artId` until a
  // moderation-safe Champion pack is regenerated (saved reference lives in
  // docs/asset-references/khun-suk/). Flip `artId` back to 'muay-thai-champion'
  // once the approved generation workflow ships the new pack.
  'muay-thai-champion': makeCharacter({
    id: 'muay-thai-champion',
    artId: 'muay-thai', // was 'muay-thai-champion' (rejected pack); borrows approved base art, identity/voice unchanged
    displayName: 'Khun Suk',
    role: 'Thai-mastery coach — a champion in your corner for the final push.',
    accentColor: '#A03B2C',
    soundProfile: SOUND_PROFILE_MUAY_THAI,
    lines: {
      idle:           ['Title round. Focus.', 'Stay sharp.', 'One round at a time.'],
      thinking:       ['Do you own it?', 'Champion-level honest.', 'Trust your gut.'],
      choiceSelected: ['How sharp was that?', 'Rate it honest.', 'Be straight with yourself.'],
      correct:        ['Championship form.', 'Locked in.', 'Mastery.', 'Untouchable.'],
      wrong:          ['Reset. Champions drill it again.', 'Shake it off.', 'Next round, that\'s yours.'],
      celebrating:    ['Champion!', 'Title earned.', 'You\'ve mastered it.'],
      speaking:       ['Listen for the tone.', 'Match the rhythm.', 'Tone, then meaning.'],
      greeting:       ['Glove up, champ.', 'Final rounds.', 'Let\'s warm up.'],
    },
  }),
};

// All character ids that have a real manifest. Anything not in this list must
// fall back through resolveCharacter(). (Art for variants resolves via `artId`.)
export const CHARACTERS_WITH_ART = Object.keys(CHARACTERS);

// The default coach used when a stage points at a character without a
// manifest (or no character at all). Elephant is the warm onboarding default.
export const DEFAULT_CHARACTER_ID = 'elephant';

// Safely resolves a character manifest. If the id is unknown OR the
// character has no manifest, we fall back to the default character.
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

// Pick a short message for a given (character, state, mode). `mode` is
// one of:
//   'review' (default) — CardsTab / SRS self-rating flow. Uses the
//     top-level entries on `character.lines`.
//   'quiz'             — QuizTab / multiple-choice flow. Uses
//     `character.lines.quiz.<state>` (falls back to the review pool when a
//     given variant has no quiz pool).
//
// Falls back to the idle pool of the same mode if the state is unknown.
// Returns null if the character has no entries at all.
export function pickLine(characterId, state, mode = 'review') {
  const char = resolveCharacter(characterId);
  if (!char.lines) return null;

  const pools = mode === 'quiz' && char.lines.quiz ? char.lines.quiz : char.lines;
  const candidate = pools[state];
  const pool = Array.isArray(candidate) ? candidate : null;
  const fallback = Array.isArray(pools.idle) ? pools.idle : null;

  const chosen = pool || fallback;
  if (!chosen || chosen.length === 0) return null;
  if (chosen.length === 1) return chosen[0];
  return chosen[Math.floor(Math.random() * chosen.length)];
}

// Whether a given character id has a manifest and can be used by the coach.
// stageCharacters.js uses this to decide if a stage-mapped character can be
// the active coach, or if we should fall back to the default character.
export function hasRealArt(characterId) {
  return CHARACTERS_WITH_ART.includes(characterId);
}
