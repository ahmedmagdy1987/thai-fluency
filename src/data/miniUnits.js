export const STAGE_1_MINI_UNIT_PILOT = {
  unitId: 'stage-1-introductions-politeness',
  stageId: 1,
  title: 'Introductions and polite basics',
  estimatedMinutes: 10,
  characterId: 'elephant',
  vocabCardIds: [1, 2, 1661, 3396, 2815, 3254, 5361, 5702],
  sentenceCardId: 330,
  challengeCardIds: [1, 2, 1661, 3396, 330, 2815, 3254, 5361, 5702],
  futureDragDropSentence: {
    sourceCardId: 330,
    status: 'deferred',
    note: 'Use approved Thai token boundaries before enabling drag-and-drop.',
  },
  introText: 'Practice the words that make a first Thai exchange feel polite and natural.',
  recapText: [
    'You learned the polite building blocks for a first exchange.',
    'The key pieces are I, name, and the polite particle.',
    'You also practiced hello, thanks, sorry, no worries, and see you.',
    'Those words support the sentence My name is ___.',
  ],
  previewText: [
    'Next, this pattern can expand into introductions with more personal details.',
    'You can add where you are from, what you like, or what you need.',
    'The future sentence builder should let you arrange the Thai pieces yourself.',
  ],
};

export const MINI_UNITS = [STAGE_1_MINI_UNIT_PILOT];

export function getMiniUnit(unitId) {
  return MINI_UNITS.find(unit => unit.unitId === unitId) || null;
}
