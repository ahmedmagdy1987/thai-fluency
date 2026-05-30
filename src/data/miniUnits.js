export const STAGE_1_MINI_UNIT_PILOT = {
  unitId: 'stage-1-introductions-politeness',
  stageId: 1,
  missionId: 1,
  title: 'Your first polite introduction',
  subtitle: 'Say hello, introduce yourself, and recognize yes/no politely.',
  estimatedMinutes: 10,
  characterId: 'elephant',
  vocabCardIds: [3396, 1, 1661, 2, 3, 251, 250, 2815],
  sentenceCardId: 330,
  challengeCardIds: [3396, 330, 251],
  // Sentence builder pilot — tap-to-build. Tokens are the existing pieces of
  // sentence card 330 (thai 'ผมชื่อ ___ ครับ', ph 'phǒm chûe ___ khráp') split on
  // the card's own space-separated phonetic, with meanings taken from the app's
  // WORD_LOOKUP (phǒm→ผม, chûe→ชื่อ, khráp→ครับ). No new Thai content is invented:
  // every token already appears in card 330 and the vocab cards (ids 1, 2). The
  // name slot '___' is a non-Thai placeholder tile, not invented content.
  sentenceBuilder: {
    sourceCardId: 330,
    prompt: 'Build this Thai sentence',
    english: 'My name is ___ (polite, male)',
    thai: 'ผมชื่อ ___ ครับ',
    // tokens are listed in the CORRECT order; `answer` is their ids in order.
    tokens: [
      { id: 'phom', thai: 'ผม', ph: 'phǒm', en: 'I (male)' },
      { id: 'chue', thai: 'ชื่อ', ph: 'chûe', en: 'name' },
      { id: 'name', thai: '(your name)', ph: '___', en: 'your name', isBlank: true },
      { id: 'khrap', thai: 'ครับ', ph: 'khráp', en: 'polite (male)' },
    ],
    answer: ['phom', 'chue', 'name', 'khrap'],
  },
  // Native HTML5 drag-and-drop remains deferred (tap-to-build is the shipped,
  // mobile-safe pilot). Enable drag only after touch-drag is proven safe.
  futureDragDropSentence: {
    sourceCardId: 330,
    status: 'deferred',
    note: 'Tap-to-build pilot is live via sentenceBuilder; native drag still deferred.',
  },
  introText: 'Start with one clear path: learn the words, see the sentence, then try a tiny challenge.',
  recapText: [
    'You learned the core pieces of a polite first exchange.',
    'Hello, I, name, and the polite particle build your intro sentence.',
    'You also practiced you, yes, no/not, and thanks.',
    'Those pieces support the sentence My name is ___.',
  ],
  previewText: [
    'Next units can add what your name is, where you are from, and what you need.',
    'Mini-lessons between units can explain why polite particles matter.',
    'A future sentence builder can let you arrange the Thai pieces yourself.',
  ],
  unlockMessage: 'Cards help you remember. Challenge helps you test yourself. Learn keeps you moving forward.',
};

export const MINI_UNITS = [STAGE_1_MINI_UNIT_PILOT];

export function getMiniUnit(unitId) {
  return MINI_UNITS.find(unit => unit.unitId === unitId) || null;
}
