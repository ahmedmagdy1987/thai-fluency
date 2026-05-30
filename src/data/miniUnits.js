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

// Additional Stage 1 mini-units. Every card id below is an EXISTING Stage 1
// card (see src/data/cards.js); no card content is changed and no Thai is
// invented. Sentence builders use only the source sentence card's own tokens
// (the card's space-separated phonetic split, meanings from existing cards /
// WORD_LOOKUP). Units are grouped by beginner theme, ~6–8 related cards each.

// Unit 2 — Greetings & courtesy (builder: card 312 "ขอบคุณมากครับ").
export const STAGE_1_UNIT_GREETINGS = {
  unitId: 'stage-1-greetings-courtesy',
  stageId: 1,
  missionId: 1,
  title: 'Greetings and courtesy',
  subtitle: 'Say hello, thank you, sorry, and "no worries" politely.',
  estimatedMinutes: 7,
  characterId: 'elephant',
  vocabCardIds: [3396, 2815, 3254, 5361, 5702, 100, 2],
  sentenceCardId: 312,
  challengeCardIds: [3396, 2815, 3254],
  introText: 'A handful of polite words covers most first encounters.',
  recapText: [
    'You practiced the core courtesy words: hello, thanks, sorry.',
    '"No worries" (ไม่เป็นไร) softens almost any situation.',
    'Add ครับ to stay polite (male form).',
  ],
  previewText: [
    'Next you can put these together in short replies.',
    'Politeness particles carry a lot of social weight in Thai.',
  ],
  sentenceBuilder: {
    sourceCardId: 312,
    prompt: 'Build this Thai sentence',
    english: 'Thank you very much (male)',
    thai: 'ขอบคุณมากครับ',
    tokens: [
      { id: 'khopkhun', thai: 'ขอบคุณ', ph: 'khàwp khun', en: 'thanks' },
      { id: 'mak', thai: 'มาก', ph: 'mâak', en: 'very' },
      { id: 'khrap', thai: 'ครับ', ph: 'khráp', en: 'polite (male)' },
    ],
    answer: ['khopkhun', 'mak', 'khrap'],
  },
};

// Unit 3 — Yes, no & easy replies. Sentence card shown, but NO sentenceBuilder:
// the sentence ไม่เป็นไร is a single lexical chunk (only ~2 safe tiles), too
// trivial to arrange — skipped until a longer safely-tokenizable reply exists.
export const STAGE_1_UNIT_YESNO = {
  unitId: 'stage-1-yes-no-replies',
  stageId: 1,
  missionId: 1,
  title: 'Yes, no and easy replies',
  subtitle: 'Answer yes/no, say "that\'s not it", and react politely.',
  estimatedMinutes: 6,
  characterId: 'elephant',
  vocabCardIds: [251, 250, 5703, 5709, 1273, 2, 4034],
  sentenceCardId: 313,
  challengeCardIds: [251, 250, 5703],
  introText: 'A few reply words let you respond to almost anything.',
  recapText: [
    'ใช่ = yes, ไม่ = no, ไม่ใช่ = "that\'s not it".',
    'เหรอ is a casual "really?" to keep a chat going.',
    'ครับ / ค่ะ keep your replies polite.',
  ],
  previewText: [
    'Combine these with the courtesy words for natural replies.',
    'Politeness particles change with male/female speakers.',
  ],
  // sentenceBuilder intentionally omitted (see comment above).
};

// Unit 4 — Asking where things are (builder: card 853 "ห้องน้ำอยู่ที่ไหนครับ").
export const STAGE_1_UNIT_WHERE = {
  unitId: 'stage-1-asking-where',
  stageId: 1,
  missionId: 3,
  title: 'Asking where things are',
  subtitle: 'Find the bathroom, ask where, and talk about going and coming.',
  estimatedMinutes: 8,
  characterId: 'elephant',
  vocabCardIds: [112, 164, 11, 13, 14, 174, 118, 110],
  sentenceCardId: 853,
  challengeCardIds: [112, 164, 13],
  introText: 'Asking "where" is one of the most useful survival skills.',
  recapText: [
    'ที่ไหน = where, อยู่ = to be located.',
    'ห้องน้ำอยู่ที่ไหน asks where the bathroom is.',
    'ไป / มา (go / come) help you move around.',
  ],
  previewText: [
    'Swap ห้องน้ำ for other places to ask where they are.',
    'Directions and transport build on these question words.',
  ],
  sentenceBuilder: {
    sourceCardId: 853,
    prompt: 'Build this Thai sentence',
    english: 'Where is the bathroom? (male)',
    thai: 'ห้องน้ำอยู่ที่ไหนครับ',
    tokens: [
      { id: 'hongnam', thai: 'ห้องน้ำ', ph: 'hông náam', en: 'bathroom' },
      { id: 'yuu', thai: 'อยู่', ph: 'yùu', en: 'to be at' },
      { id: 'thinai', thai: 'ที่ไหน', ph: 'thîi nǎi', en: 'where' },
      { id: 'khrap', thai: 'ครับ', ph: 'khráp', en: 'polite (male)' },
    ],
    answer: ['hongnam', 'yuu', 'thinai', 'khrap'],
  },
};

// Unit 5 — Prices & shopping (builder: card 850 "อันนี้เท่าไหร่ครับ").
export const STAGE_1_UNIT_PRICES = {
  unitId: 'stage-1-prices-shopping',
  stageId: 1,
  missionId: 4,
  title: 'Prices and shopping',
  subtitle: 'Ask how much, talk money, and tell cheap from expensive.',
  estimatedMinutes: 8,
  characterId: 'elephant',
  vocabCardIds: [116, 117, 176, 73, 72, 1746, 5701, 231],
  sentenceCardId: 850,
  challengeCardIds: [116, 176, 72],
  introText: 'Prices come up everywhere — markets, taxis, shops.',
  recapText: [
    'เท่าไหร่ = how much, เงิน = money.',
    'ถูก = cheap, แพง = expensive, ลด = reduce (discount).',
    'อันนี้เท่าไหร่ asks the price of this one.',
  ],
  previewText: [
    'Numbers let you understand the answer to "how much".',
    'Bargaining politely is a Stage 2 skill.',
  ],
  sentenceBuilder: {
    sourceCardId: 850,
    prompt: 'Build this Thai sentence',
    english: 'How much is this? (male)',
    thai: 'อันนี้เท่าไหร่ครับ',
    tokens: [
      { id: 'annii', thai: 'อันนี้', ph: 'annǐi', en: 'this one' },
      { id: 'thaorai', thai: 'เท่าไหร่', ph: 'thâo rài', en: 'how much' },
      { id: 'khrap', thai: 'ครับ', ph: 'khráp', en: 'polite (male)' },
    ],
    answer: ['annii', 'thaorai', 'khrap'],
  },
};

// Stage 1 guided path order. Unit 1 is the existing pilot.
export const MINI_UNITS = [
  STAGE_1_MINI_UNIT_PILOT,
  STAGE_1_UNIT_GREETINGS,
  STAGE_1_UNIT_YESNO,
  STAGE_1_UNIT_WHERE,
  STAGE_1_UNIT_PRICES,
];

export function getMiniUnit(unitId) {
  return MINI_UNITS.find(unit => unit.unitId === unitId) || null;
}

export function getMiniUnitsForStage(stageId) {
  return MINI_UNITS.filter(unit => (unit.stageId || 1) === stageId);
}
