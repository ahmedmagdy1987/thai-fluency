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
  futureDragDropSentence: {
    sourceCardId: 330,
    status: 'deferred',
    note: 'Use approved Thai token boundaries before enabling drag-and-drop.',
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
