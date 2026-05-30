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

// ── Stages 2–8 mini-units ───────────────────────────────────────────────────
// Every card id below is an EXISTING card of that stage (validated by
// scripts/check-mini-units.mjs). No card content is changed and no Thai is
// invented. Each sentenceBuilder's tokens were derived from the source sentence
// card's own phonetic via the app's WORD_LOOKUP breakdown (autoBreakdown), so
// the token phonetics reconstruct the card phonetic exactly.

// helper to keep unit literals compact + consistent. Spreads the literal first,
// then robustly guarantees the fields MiniUnitFlow relies on (recapText /
// previewText must be non-empty arrays for the recap step's .map; characterId
// must resolve a coach) — even if a future unit omits or mis-types them.
function unit(u) {
  return {
    ...u,
    estimatedMinutes: u.estimatedMinutes ?? 7,
    characterId: u.characterId || 'elephant',
    introText: u.introText || 'Learn a few related words, see them in a sentence, then build it.',
    recapText: Array.isArray(u.recapText) && u.recapText.length
      ? u.recapText
      : ['Nice work — you practiced a focused set of related words.', 'Keep going to lock them in through review.'],
    previewText: Array.isArray(u.previewText) && u.previewText.length
      ? u.previewText
      : ['The next unit builds on what you just learned.', 'Each short unit moves your Thai forward.'],
  };
}

// Stage 2 — Daily Essentials.
export const STAGE_2_UNIT_ACTIONS = unit({
  unitId: 'stage-2-everyday-actions', stageId: 2,
  title: 'Everyday actions', subtitle: 'Common verbs: drink, buy, work, walk, open, close, love.',
  vocabCardIds: [16, 36, 39, 45, 56, 505, 506, 21], sentenceCardId: 814, challengeCardIds: [16, 36, 21],
  sentenceBuilder: {
    sourceCardId: 814, prompt: 'Build this Thai sentence', english: 'I love you (male)', thai: 'ผมรักคุณ',
    tokens: [
      { id: 'phom', thai: 'ผม', ph: 'phǒm', en: 'I (male)' },
      { id: 'rak', thai: 'รัก', ph: 'rák', en: 'to love' },
      { id: 'khun', thai: 'คุณ', ph: 'khun', en: 'you' },
    ], answer: ['phom', 'rak', 'khun'],
  },
});
export const STAGE_2_UNIT_DOING = unit({
  unitId: 'stage-2-getting-things-done', stageId: 2,
  title: 'Getting things done', subtitle: 'More verbs: meet, send, bring, stop, leave, see, hold.',
  vocabCardIds: [42, 500, 502, 509, 512, 514, 1609, 1672], sentenceCardId: 813, challengeCardIds: [42, 500, 512],
  sentenceBuilder: {
    sourceCardId: 813, prompt: 'Build this Thai sentence', english: 'I do not like it (male)', thai: 'ผมไม่ชอบ',
    tokens: [
      { id: 'phom', thai: 'ผม', ph: 'phǒm', en: 'I (male)' },
      { id: 'mai', thai: 'ไม่', ph: 'mâi', en: 'not' },
      { id: 'chop', thai: 'ชอบ', ph: 'chôp', en: 'to like' },
    ], answer: ['phom', 'mai', 'chop'],
  },
});
// Stage 2 — expanded coverage. Stage 2's clean vocabulary is verb- and
// adjective-heavy (the food/shopping cards the taxonomy names mostly live in
// later stages), so these units group verbs, adjectives, feelings, numbers, and
// connectors. Builders are added only for safe 3-token sentences.
export const STAGE_2_UNIT_TALK = unit({
  unitId: 'stage-2-talking-thinking', stageId: 2,
  title: 'Talking and thinking', subtitle: 'Chat, think, dream, guess, translate, hope, look, admire.',
  vocabCardIds: [2128, 2206, 2194, 3222, 2122, 2081, 1727, 1989], sentenceCardId: 818, challengeCardIds: [2128, 2206, 3222],
  sentenceBuilder: {
    sourceCardId: 818, prompt: 'Build this Thai sentence', english: 'I do not know (male)', thai: 'ผมไม่รู้',
    tokens: [
      { id: 'phom', thai: 'ผม', ph: 'phǒm', en: 'I (male)' },
      { id: 'mai', thai: 'ไม่', ph: 'mâi', en: 'not' },
      { id: 'ruu', thai: 'รู้', ph: 'rúu', en: 'to know' },
    ], answer: ['phom', 'mai', 'ruu'],
  },
});
export const STAGE_2_UNIT_AROUND = unit({
  unitId: 'stage-2-out-and-about', stageId: 2,
  title: 'Out and about', subtitle: 'Fly, park, flee, borrow, lift, put, throw away, play.',
  vocabCardIds: [2336, 2816, 2056, 2774, 1677, 1732, 1974, 1739], sentenceCardId: 5389, challengeCardIds: [2336, 2816, 2774],
  sentenceBuilder: {
    sourceCardId: 5389, prompt: 'Build this Thai sentence', english: 'Where did you go?', thai: 'ไปไหนมา',
    tokens: [
      { id: 'pai', thai: 'ไป', ph: 'bpai', en: 'to go' },
      { id: 'nai', thai: 'ไหน', ph: 'nǎi', en: 'where' },
      { id: 'maa', thai: 'มา', ph: 'maa', en: 'to come' },
    ], answer: ['pai', 'nai', 'maa'],
  },
});
export const STAGE_2_UNIT_DAILY2 = unit({
  unitId: 'stage-2-everyday-actions-2', stageId: 2,
  title: 'Everyday actions II', subtitle: 'Keep, wait, eat, endure, stretch, hit, suck, lead.',
  vocabCardIds: [1692, 2037, 2646, 2506, 5718, 2013, 2888, 3656], sentenceCardId: 4738, challengeCardIds: [1692, 2037, 2646],
  sentenceBuilder: {
    sourceCardId: 4738, prompt: 'Build this Thai sentence', english: 'Go ahead and do it', thai: 'ทำไปเลย',
    tokens: [
      { id: 'tham', thai: 'ทำ', ph: 'tham', en: 'to do / make' },
      { id: 'pai', thai: 'ไป', ph: 'bpai', en: 'to go' },
      { id: 'loei', thai: 'เลย', ph: 'loei', en: 'really / go on' },
    ], answer: ['tham', 'pai', 'loei'],
  },
});
export const STAGE_2_UNIT_SIZES = unit({
  unitId: 'stage-2-sizes-and-speeds', stageId: 2,
  title: 'Sizes and speeds', subtitle: 'Small, cool, fast, slow, thick, a little, large, every.',
  vocabCardIds: [63, 65, 78, 79, 2923, 2737, 1833, 1622], challengeCardIds: [63, 78, 79],
  // No sentenceBuilder: Stage 2 adjective sentences are 2 tokens (too short).
});
export const STAGE_2_UNIT_QUALITIES = unit({
  unitId: 'stage-2-skills-and-qualities', stageId: 2,
  title: 'Skills and qualities', subtitle: 'Skilled, done, sure, rich, used to it, gone, most, all.',
  vocabCardIds: [77, 1973, 2235, 5715, 3012, 2014, 1982, 1762], sentenceCardId: 5228, challengeCardIds: [77, 2235, 5715],
  // sentenceCard shown for context; no builder (เก่งมาก is 2 tokens — too short).
});
export const STAGE_2_UNIT_FEELINGS = unit({
  unitId: 'stage-2-feelings', stageId: 2,
  title: 'Feelings', subtitle: 'Afraid, shy, discouraged, awake, drunk, happiness.',
  vocabCardIds: [473, 477, 5731, 2532, 2969, 1747], sentenceCardId: 800, challengeCardIds: [473, 477, 1747],
  sentenceBuilder: {
    sourceCardId: 800, prompt: 'Build this Thai sentence', english: 'I am hungry (male)', thai: 'ผมหิวครับ',
    tokens: [
      { id: 'phom', thai: 'ผม', ph: 'phǒm', en: 'I (male)' },
      { id: 'hiu', thai: 'หิว', ph: 'hǐu', en: 'hungry' },
      { id: 'khrap', thai: 'ครับ', ph: 'khráp', en: 'polite (male)' },
    ], answer: ['phom', 'hiu', 'khrap'],
  },
});
export const STAGE_2_UNIT_NUMBERS = unit({
  unitId: 'stage-2-counting', stageId: 2,
  title: 'Counting', subtitle: 'Three, four, six, seven, ten, thousand.',
  vocabCardIds: [232, 233, 235, 236, 239, 241], challengeCardIds: [232, 233, 239],
  // No sentenceCard/builder: Stage 2 has no clean number sentence to tokenize.
});
export const STAGE_2_UNIT_CONNECTORS = unit({
  unitId: 'stage-2-connectors-questions', stageId: 2,
  title: 'Connectors and questions', subtitle: 'Must, with, or, let\'s, "right?", "and you?", is, from.',
  vocabCardIds: [256, 291, 292, 4038, 5704, 1275, 1625, 1598], sentenceCardId: 857, challengeCardIds: [256, 292, 5704],
  // sentenceCard shown for context; no builder (ใครครับ is 2 tokens — too short).
});

// Stage 3 — Getting Around.
export const STAGE_3_UNIT_DAILY = unit({
  unitId: 'stage-3-daily-verbs', stageId: 3,
  title: 'Daily verbs', subtitle: 'Pay, sit, stand, use, study, ask, receive, return.',
  vocabCardIds: [38, 47, 48, 49, 52, 54, 501, 511], sentenceCardId: 821, challengeCardIds: [38, 52, 54],
  sentenceBuilder: {
    sourceCardId: 821, prompt: 'Build this Thai sentence', english: 'I want to sleep (male)', thai: 'ผมอยากนอน',
    tokens: [
      { id: 'phom', thai: 'ผม', ph: 'phǒm', en: 'I (male)' },
      { id: 'yak', thai: 'อยาก', ph: 'yàak', en: 'to want to' },
      { id: 'non', thai: 'นอน', ph: 'nawn', en: 'to sleep' },
    ], answer: ['phom', 'yak', 'non'],
  },
});
export const STAGE_3_UNIT_DESCRIBE = unit({
  unitId: 'stage-3-describing-things', stageId: 3,
  title: 'Describing things', subtitle: 'Big, hot, new, easy, hard, busy, full, little.',
  vocabCardIds: [62, 64, 82, 84, 85, 89, 92, 1624], sentenceCardId: 804, challengeCardIds: [62, 64, 85],
  sentenceBuilder: {
    sourceCardId: 804, prompt: 'Build this Thai sentence', english: 'I am hot (male)', thai: 'ผมร้อนครับ',
    tokens: [
      { id: 'phom', thai: 'ผม', ph: 'phǒm', en: 'I (male)' },
      { id: 'ron', thai: 'ร้อน', ph: 'ráwn', en: 'hot' },
      { id: 'khrap', thai: 'ครับ', ph: 'khráp', en: 'polite (male)' },
    ], answer: ['phom', 'ron', 'khrap'],
  },
});
// Stage 3 deepening (Course Structure Sprint). Every id below is an EXISTING
// Stage 3 card; no card content is changed and no Thai is invented. Builders use
// only the source sentence card's own pieces (its space-separated phonetic split,
// meanings from WORD_LOOKUP) — verified by scripts/check-mini-units.mjs against
// the runtime CARDS. Stage 3 is a deep-vocabulary stage (heavy on single-syllable
// verbs/adjectives/"things"); units group the cleanest, most teachable cards by
// theme rather than forcing the "transport/directions" taxonomy, which Stage 3's
// clean vocab does not strongly support (documented in the review matrix).
export const STAGE_3_UNIT_PEOPLE = unit({
  unitId: 'stage-3-people-family', stageId: 3,
  title: 'People and family', subtitle: 'Father, mother, friend, doctor, uncle, grandparents.',
  vocabCardIds: [194, 195, 196, 198, 2788, 2836, 2964, 2359], sentenceCardId: 840, challengeCardIds: [194, 195, 196],
  sentenceBuilder: {
    sourceCardId: 840, prompt: 'Build this Thai sentence', english: 'What is your name?', thai: 'คุณชื่ออะไร',
    tokens: [
      { id: 'khun', thai: 'คุณ', ph: 'khun', en: 'you' },
      { id: 'chue', thai: 'ชื่อ', ph: 'chûe', en: 'name' },
      { id: 'arai', thai: 'อะไร', ph: 'àrai', en: 'what' },
    ], answer: ['khun', 'chue', 'arai'],
  },
});
export const STAGE_3_UNIT_VERBS1 = unit({
  unitId: 'stage-3-everyday-verbs-1', stageId: 3,
  title: 'Everyday verbs I', subtitle: 'Enter, should, invite, turn, practice, pull, press, ride.',
  vocabCardIds: [513, 1675, 2107, 2139, 2288, 2398, 2659, 3004], sentenceCardId: 4729, challengeCardIds: [513, 2288, 3004],
  sentenceBuilder: {
    sourceCardId: 4729, prompt: 'Build this Thai sentence', english: 'What are you doing?', thai: 'ทำอะไรอยู่',
    tokens: [
      { id: 'tham', thai: 'ทำ', ph: 'tham', en: 'to do' },
      { id: 'arai', thai: 'อะไร', ph: 'àrai', en: 'what' },
      { id: 'yu', thai: 'อยู่', ph: 'yùu', en: '(ongoing)' },
    ], answer: ['tham', 'arai', 'yu'],
  },
});
export const STAGE_3_UNIT_VERBS2 = unit({
  unitId: 'stage-3-everyday-verbs-2', stageId: 3,
  title: 'Everyday verbs II', subtitle: 'Pour, hide, dig, search, throw, smell, scrub, water.',
  vocabCardIds: [2441, 2726, 2904, 2912, 3247, 3296, 3614, 4068], sentenceCardId: 4767, challengeCardIds: [2441, 2912, 3247],
  sentenceBuilder: {
    sourceCardId: 4767, prompt: 'Build this Thai sentence', english: 'Why are you doing that?', thai: 'ทำไปทำไม',
    tokens: [
      { id: 'tham', thai: 'ทำ', ph: 'tham', en: 'to do' },
      { id: 'pai', thai: 'ไป', ph: 'bpai', en: '(away)' },
      { id: 'thammai', thai: 'ทำไม', ph: 'tham mai', en: 'why' },
    ], answer: ['tham', 'pai', 'thammai'],
  },
});
export const STAGE_3_UNIT_VERBS3 = unit({
  unitId: 'stage-3-everyday-verbs-3', stageId: 3,
  title: 'Everyday verbs III', subtitle: 'Write, tie, get up, wear, give, complain, bow, sign.',
  vocabCardIds: [2376, 2421, 2474, 2582, 2602, 2987, 3178, 5723], sentenceCardId: 819, challengeCardIds: [2421, 2582, 5723],
  sentenceBuilder: {
    sourceCardId: 819, prompt: 'Build this Thai sentence', english: 'I forgot already (male)', thai: 'ผมลืมแล้ว',
    tokens: [
      { id: 'phom', thai: 'ผม', ph: 'phǒm', en: 'I (male)' },
      { id: 'luem', thai: 'ลืม', ph: 'luem', en: 'to forget' },
      { id: 'laew', thai: 'แล้ว', ph: 'láew', en: 'already' },
    ], answer: ['phom', 'luem', 'laew'],
  },
});
export const STAGE_3_UNIT_DESCRIBE2 = unit({
  unitId: 'stage-3-describing-things-2', stageId: 3,
  title: 'Describing things II', subtitle: 'Ready, clear, complete, ill, dark, ripe, sleepy, worth it.',
  vocabCardIds: [1758, 2017, 2042, 2468, 2899, 3166, 3669, 5729], sentenceCardId: 803, challengeCardIds: [1758, 2468, 3669],
  sentenceBuilder: {
    sourceCardId: 803, prompt: 'Build this Thai sentence', english: 'I am sleepy (male)', thai: 'ผมง่วงครับ',
    tokens: [
      { id: 'phom', thai: 'ผม', ph: 'phǒm', en: 'I (male)' },
      { id: 'nguang', thai: 'ง่วง', ph: 'ngûang', en: 'sleepy' },
      { id: 'khrap', thai: 'ครับ', ph: 'khráp', en: 'polite (male)' },
    ], answer: ['phom', 'nguang', 'khrap'],
  },
});
export const STAGE_3_UNIT_QUALITIES = unit({
  unitId: 'stage-3-qualities-states', stageId: 3,
  title: 'Qualities and states', subtitle: 'Thin/some, exceed, lack, fast, urgent, fierce, confused, excellent.',
  vocabCardIds: [1613, 1793, 1809, 3022, 3097, 3123, 3169, 5716], sentenceCardId: 810, challengeCardIds: [1793, 3097, 3169],
  sentenceBuilder: {
    sourceCardId: 810, prompt: 'Build this Thai sentence', english: 'I am busy (male)', thai: 'ผมยุ่งครับ',
    tokens: [
      { id: 'phom', thai: 'ผม', ph: 'phǒm', en: 'I (male)' },
      { id: 'yung', thai: 'ยุ่ง', ph: 'yûng', en: 'busy' },
      { id: 'khrap', thai: 'ครับ', ph: 'khráp', en: 'polite (male)' },
    ], answer: ['phom', 'yung', 'khrap'],
  },
});
export const STAGE_3_UNIT_TIME = unit({
  unitId: 'stage-3-time-sequence', stageId: 3,
  title: 'Time and sequence', subtitle: 'Month, currently, before, when, occasion, era, soon, time.',
  vocabCardIds: [220, 254, 296, 1602, 2177, 2529, 2580, 2852], sentenceCardId: 4749, challengeCardIds: [220, 296, 2580],
  // sentenceCard shown for context (เดี๋ยวมา uses เดี๋ยว, a vocab card here);
  // no builder — "เดี๋ยวมา" is 2 tokens, too short to arrange.
});
export const STAGE_3_UNIT_CONNECTORS = unit({
  unitId: 'stage-3-connectors-particles', stageId: 3,
  title: 'Connectors and particles', subtitle: 'But, if, by, therefore, and casual sentence-final particles.',
  vocabCardIds: [293, 295, 1617, 1619, 4037, 5719, 5720, 5728], sentenceCardId: 817, challengeCardIds: [293, 295, 1619],
  sentenceBuilder: {
    sourceCardId: 817, prompt: 'Build this Thai sentence', english: 'I do not understand (male)', thai: 'ผมไม่เข้าใจ',
    tokens: [
      { id: 'phom', thai: 'ผม', ph: 'phǒm', en: 'I (male)' },
      { id: 'mai', thai: 'ไม่', ph: 'mâi', en: 'not' },
      { id: 'khaojai', thai: 'เข้าใจ', ph: 'khâo jai', en: 'to understand' },
    ], answer: ['phom', 'mai', 'khaojai'],
  },
});
export const STAGE_3_UNIT_HOME = unit({
  unitId: 'stage-3-home-places', stageId: 3,
  title: 'Home and places', subtitle: 'House, building, garden, stove, air-con, cabinet, broken.',
  vocabCardIds: [160, 1719, 2601, 2080, 3403, 1000, 2631, 1021], sentenceCardId: 1500, challengeCardIds: [160, 2601, 1000],
  // sentenceCard shown for context (แอร์เสีย uses แอร์, a vocab card here);
  // no builder — phonetic does not split cleanly into known word pieces.
});
export const STAGE_3_UNIT_ANIMALS = unit({
  unitId: 'stage-3-animals', stageId: 3,
  title: 'Animals', subtitle: 'Dog, snake, monkey, buffalo, cow, frog, ant, crab.',
  vocabCardIds: [2598, 3066, 2696, 3318, 2789, 3467, 3519, 2583], challengeCardIds: [2598, 3066, 2789],
  // No sentenceCard/builder: Stage 3 has no clean animal sentence to tokenize.
});

// Stage 4 — Real Conversations.
export const STAGE_4_UNIT_TRAVEL = unit({
  unitId: 'stage-4-actions-travel', stageId: 4,
  title: 'Out and about', subtitle: 'Read, sell, travel, drive, run, teach, answer, choose.',
  vocabCardIds: [31, 37, 41, 44, 46, 53, 55, 504], sentenceCardId: 936, challengeCardIds: [31, 44, 53],
  sentenceBuilder: {
    sourceCardId: 936, prompt: 'Build this Thai sentence', english: 'I am going traveling (male)', thai: 'ผมจะไปเที่ยว',
    tokens: [
      { id: 'phom', thai: 'ผม', ph: 'phǒm', en: 'I (male)' },
      { id: 'ja', thai: 'จะ', ph: 'jà', en: 'will (future)' },
      { id: 'pai', thai: 'ไป', ph: 'bpai', en: 'to go' },
      { id: 'thiao', thai: 'เที่ยว', ph: 'thîao', en: 'to travel' },
    ], answer: ['phom', 'ja', 'pai', 'thiao'],
  },
});
export const STAGE_4_UNIT_TASTE = unit({
  unitId: 'stage-4-tastes-describing', stageId: 4,
  title: 'Tastes and qualities', subtitle: 'Cold, sweet, salty, handsome, near, free, many, like.',
  vocabCardIds: [66, 69, 71, 75, 80, 88, 1621, 1680], sentenceCardId: 910, challengeCardIds: [69, 71, 80],
  sentenceBuilder: {
    sourceCardId: 910, prompt: 'Build this Thai sentence', english: 'It is very delicious (male)', thai: 'อร่อยมากครับ',
    tokens: [
      { id: 'aroi', thai: 'อร่อย', ph: 'aròi', en: 'delicious' },
      { id: 'mak', thai: 'มาก', ph: 'mâak', en: 'very' },
      { id: 'khrap', thai: 'ครับ', ph: 'khráp', en: 'polite (male)' },
    ], answer: ['aroi', 'mak', 'khrap'],
  },
});
// Stage 4 deepening (Course Structure Sprint) — the "Real Conversations" path.
// Every id below is an EXISTING Stage 4 card; no card content is changed and no
// Thai is invented. Builders use only the source sentence card's own pieces (its
// space-separated phonetic split, meanings from WORD_LOOKUP) — verified by
// scripts/check-mini-units.mjs against the runtime CARDS. Stage 4 is sentence-rich
// (151 sentence cards, 14 with a clean breakdown), so most units carry a genuine
// conversational builder; food stays vocab-only and the home unit shows a sentence
// without a builder (documented in the review matrix).
export const STAGE_4_UNIT_SMALLTALK = unit({
  unitId: 'stage-4-small-talk-people', stageId: 4,
  title: 'Small talk and people', subtitle: 'Husband, friend, child, grandchild, grandpa, family, how, you.',
  vocabCardIds: [1810, 2153, 2308, 2548, 4053, 2180, 115, 3539], sentenceCardId: 843, challengeCardIds: [1810, 2153, 2308],
  sentenceBuilder: {
    sourceCardId: 843, prompt: 'Build this Thai sentence', english: 'What do you do for work?', thai: 'คุณทำงานอะไร',
    tokens: [
      { id: 'khun', thai: 'คุณ', ph: 'khun', en: 'you' },
      { id: 'thamngan', thai: 'ทำงาน', ph: 'tham-ngaan', en: 'to work' },
      { id: 'arai', thai: 'อะไร', ph: 'àrai', en: 'what' },
    ], answer: ['khun', 'thamngan', 'arai'],
  },
});
export const STAGE_4_UNIT_PLANS = unit({
  unitId: 'stage-4-plans-free-time', stageId: 4,
  title: 'Plans and free time', subtitle: 'Morning, afternoon, minute, always, often, frequently, evening, then.',
  vocabCardIds: [215, 216, 223, 1715, 1825, 2060, 2740, 2792], sentenceCardId: 847, challengeCardIds: [215, 216, 2060],
  sentenceBuilder: {
    sourceCardId: 847, prompt: 'Build this Thai sentence', english: 'Are you free?', thai: 'คุณว่างไหม',
    tokens: [
      { id: 'khun', thai: 'คุณ', ph: 'khun', en: 'you' },
      { id: 'wang', thai: 'ว่าง', ph: 'wâang', en: 'free / available' },
      { id: 'mai', thai: 'ไหม', ph: 'mǎi', en: '? (yes/no)' },
    ], answer: ['khun', 'wang', 'mai'],
  },
});
export const STAGE_4_UNIT_OUT = unit({
  unitId: 'stage-4-out-and-about', stageId: 4,
  title: 'Out and about', subtitle: 'Market, temple, beach, shop, hall, sea, forest, sky.',
  vocabCardIds: [163, 172, 173, 1927, 3112, 608, 612, 606], sentenceCardId: 845, challengeCardIds: [163, 172, 1927],
  sentenceBuilder: {
    sourceCardId: 845, prompt: 'Build this Thai sentence', english: 'Where are you going?', thai: 'คุณจะไปไหน',
    tokens: [
      { id: 'khun', thai: 'คุณ', ph: 'khun', en: 'you' },
      { id: 'ja', thai: 'จะ', ph: 'jà', en: 'will (future)' },
      { id: 'pai', thai: 'ไป', ph: 'bpai', en: 'to go' },
      { id: 'nai', thai: 'ไหน', ph: 'nǎi', en: 'where' },
    ], answer: ['khun', 'ja', 'pai', 'nai'],
  },
});
export const STAGE_4_UNIT_DIRECTIONS = unit({
  unitId: 'stage-4-distance-directions', stageId: 4,
  title: 'Distance and directions', subtitle: 'Across, bus, canal, road, metre, zone, pier, fence.',
  vocabCardIds: [1755, 5724, 2559, 1910, 2585, 1937, 2276, 3290], sentenceCardId: 934, challengeCardIds: [1755, 1910, 5724],
  sentenceBuilder: {
    sourceCardId: 934, prompt: 'Build this Thai sentence', english: 'Is it far? (male)', thai: 'ไกลไหมครับ',
    tokens: [
      { id: 'glai', thai: 'ไกล', ph: 'glai', en: 'far' },
      { id: 'mai', thai: 'ไหม', ph: 'mǎi', en: '? (yes/no)' },
      { id: 'khrap', thai: 'ครับ', ph: 'khráp', en: 'polite (male)' },
    ], answer: ['glai', 'mai', 'khrap'],
  },
});
export const STAGE_4_UNIT_FEELINGS = unit({
  unitId: 'stage-4-feelings-reactions', stageId: 4,
  title: 'Feelings and reactions', subtitle: 'Kind, bored, fun, lonely, warm, bad, fear, mean.',
  vocabCardIds: [462, 475, 479, 3374, 3373, 2942, 2536, 2230], sentenceCardId: 805, challengeCardIds: [475, 479, 3374],
  sentenceBuilder: {
    sourceCardId: 805, prompt: 'Build this Thai sentence', english: 'I am cold (male)', thai: 'ผมหนาวครับ',
    tokens: [
      { id: 'phom', thai: 'ผม', ph: 'phǒm', en: 'I (male)' },
      { id: 'nao', thai: 'หนาว', ph: 'nǎao', en: 'cold' },
      { id: 'khrap', thai: 'ครับ', ph: 'khráp', en: 'polite (male)' },
    ], answer: ['phom', 'nao', 'khrap'],
  },
});
export const STAGE_4_UNIT_SAYING = unit({
  unitId: 'stage-4-knowing-saying', stageId: 4,
  title: 'Knowing and saying', subtitle: 'Believe, emphasize, argue, guess, tell, utter, recite, reflect.',
  vocabCardIds: [1720, 2142, 3546, 3585, 1801, 2835, 3430, 4313], sentenceCardId: 1590, challengeCardIds: [1720, 1801, 3546],
  sentenceBuilder: {
    sourceCardId: 1590, prompt: 'Build this Thai sentence', english: 'I understand now (male)', thai: 'ผมเข้าใจแล้ว',
    tokens: [
      { id: 'phom', thai: 'ผม', ph: 'phǒm', en: 'I (male)' },
      { id: 'khaojai', thai: 'เข้าใจ', ph: 'khâo jai', en: 'to understand' },
      { id: 'laew', thai: 'แล้ว', ph: 'láew', en: 'already / now' },
    ], answer: ['phom', 'khaojai', 'laew'],
  },
});
export const STAGE_4_UNIT_VERBS1 = unit({
  unitId: 'stage-4-everyday-verbs-1', stageId: 4,
  title: 'Everyday verbs I', subtitle: 'Wash, order, call, check, wipe, pick up, add, taste.',
  vocabCardIds: [517, 519, 1660, 2118, 3483, 2679, 2473, 3474], sentenceCardId: 1587, challengeCardIds: [517, 519, 3474],
  sentenceBuilder: {
    sourceCardId: 1587, prompt: 'Build this Thai sentence', english: 'I forgot (male)', thai: 'ผมลืมไปครับ',
    tokens: [
      { id: 'phom', thai: 'ผม', ph: 'phǒm', en: 'I (male)' },
      { id: 'luem', thai: 'ลืม', ph: 'luem', en: 'to forget' },
      { id: 'pai', thai: 'ไป', ph: 'bpai', en: '(already / off)' },
      { id: 'khrap', thai: 'ครับ', ph: 'khráp', en: 'polite (male)' },
    ], answer: ['phom', 'luem', 'pai', 'khrap'],
  },
});
export const STAGE_4_UNIT_HOME = unit({
  unitId: 'stage-4-at-home', stageId: 4,
  title: 'At home', subtitle: 'Sofa, table, key, wifi, repair, sound, quiet, kitchen.',
  vocabCardIds: [1004, 1005, 1012, 1017, 1022, 1027, 1029, 2930], sentenceCardId: 1503, challengeCardIds: [1004, 1005, 1012],
  // sentenceCard shown for context (ไฟดับ "the power is out" fits the home theme);
  // no builder — "ไฟดับ" does not split into known WORD_LOOKUP pieces.
});
export const STAGE_4_UNIT_VERBS2 = unit({
  unitId: 'stage-4-everyday-verbs-2', stageId: 4,
  title: 'Everyday verbs II', subtitle: 'Cut, catch, deposit, hire, remove, separate, plant, raise.',
  vocabCardIds: [1650, 1848, 2406, 2446, 2738, 1919, 1943, 1908], sentenceCardId: 4801, challengeCardIds: [1650, 1848, 2738],
  sentenceBuilder: {
    sourceCardId: 4801, prompt: 'Build this Thai sentence', english: 'It is no longer needed', thai: 'ไม่ต้องแล้ว',
    tokens: [
      { id: 'mai', thai: 'ไม่', ph: 'mâi', en: 'not' },
      { id: 'tong', thai: 'ต้อง', ph: 'tâwng', en: 'must / need to' },
      { id: 'laew', thai: 'แล้ว', ph: 'láew', en: 'already / now' },
    ], answer: ['mai', 'tong', 'laew'],
  },
});
export const STAGE_4_UNIT_STATES = unit({
  unitId: 'stage-4-describing-states', stageId: 4,
  title: 'Describing states', subtitle: 'Full, heavy, fat, thin, tight, dry, strange, excellent.',
  vocabCardIds: [1873, 1941, 3067, 3534, 2870, 2625, 2108, 2461], sentenceCardId: 809, challengeCardIds: [1873, 1941, 3534],
  sentenceBuilder: {
    sourceCardId: 809, prompt: 'Build this Thai sentence', english: 'I am free / available (male)', thai: 'ผมว่างครับ',
    tokens: [
      { id: 'phom', thai: 'ผม', ph: 'phǒm', en: 'I (male)' },
      { id: 'wang', thai: 'ว่าง', ph: 'wâang', en: 'free / available' },
      { id: 'khrap', thai: 'ครับ', ph: 'khráp', en: 'polite (male)' },
    ], answer: ['phom', 'wang', 'khrap'],
  },
});
export const STAGE_4_UNIT_LEAVING = unit({
  unitId: 'stage-4-leaving-going', stageId: 4,
  title: 'Leaving and going', subtitle: 'Retreat, emerge, make way, hurry, rush, drop, fall, wave.',
  vocabCardIds: [2997, 3347, 3491, 2721, 2893, 2849, 3470, 4016], sentenceCardId: 896, challengeCardIds: [2997, 2721, 4016],
  sentenceBuilder: {
    sourceCardId: 896, prompt: 'Build this Thai sentence', english: 'I am going to go now (male)', thai: 'ผมจะไปแล้ว',
    tokens: [
      { id: 'phom', thai: 'ผม', ph: 'phǒm', en: 'I (male)' },
      { id: 'ja', thai: 'จะ', ph: 'jà', en: 'will (future)' },
      { id: 'pai', thai: 'ไป', ph: 'bpai', en: 'to go' },
      { id: 'laew', thai: 'แล้ว', ph: 'láew', en: 'already / now' },
    ], answer: ['phom', 'ja', 'pai', 'laew'],
  },
});
export const STAGE_4_UNIT_FOOD = unit({
  unitId: 'stage-4-food-and-dishes', stageId: 4,
  title: 'Food and dishes', subtitle: 'Rice, vegetable, meat, chicken, shrimp, egg, snack, chili.',
  vocabCardIds: [130, 138, 139, 140, 143, 144, 149, 522], challengeCardIds: [130, 139, 140],
  // No sentenceCard/builder: Stage 4's clean food sentences are idiomatic or do
  // not tokenize cleanly; food is taught as vocab here, used in sentences later.
});

// Stage 5 — Social Confidence.
export const STAGE_5_UNIT_VERBS = unit({
  unitId: 'stage-5-useful-verbs', stageId: 5,
  title: 'Useful verbs', subtitle: 'Know, write, change, start, create, show, move, release.',
  vocabCardIds: [27, 32, 503, 507, 1685, 1704, 1901, 1907], sentenceCardId: 815, challengeCardIds: [27, 32, 507],
  sentenceBuilder: {
    sourceCardId: 815, prompt: 'Build this Thai sentence', english: 'I miss you (male)', thai: 'ผมคิดถึงคุณ',
    tokens: [
      { id: 'phom', thai: 'ผม', ph: 'phǒm', en: 'I (male)' },
      { id: 'khitthueng', thai: 'คิดถึง', ph: 'khít thǔeng', en: 'to miss' },
      { id: 'khun', thai: 'คุณ', ph: 'khun', en: 'you' },
    ], answer: ['phom', 'khitthueng', 'khun'],
  },
});
export const STAGE_5_UNIT_DESCRIBE = unit({
  unitId: 'stage-5-describing-more', stageId: 5,
  title: 'Describing more', subtitle: 'Bad, old, dirty, tired, short, wide, agree, interested.',
  vocabCardIds: [61, 83, 87, 90, 1860, 1931, 1972, 1779], sentenceCardId: 808, challengeCardIds: [83, 90, 1860],
  sentenceBuilder: {
    sourceCardId: 808, prompt: 'Build this Thai sentence', english: 'I am very tired (male)', thai: 'ผมเหนื่อยมาก',
    tokens: [
      { id: 'phom', thai: 'ผม', ph: 'phǒm', en: 'I (male)' },
      { id: 'nueai', thai: 'เหนื่อย', ph: 'nùeai', en: 'tired' },
      { id: 'mak', thai: 'มาก', ph: 'mâak', en: 'very' },
    ], answer: ['phom', 'nueai', 'mak'],
  },
});
// Stage 5 deepening (Course Structure Sprint) — the "Social Confidence" path.
// Every id below is an EXISTING Stage 5 card; no card content is changed and no
// Thai is invented. Builders use only the source sentence card's own pieces (its
// space-separated phonetic split, meanings from WORD_LOOKUP) — verified by
// scripts/check-mini-units.mjs against the runtime CARDS. Stage 5 is very
// sentence-rich (184 sentence cards, 18 with a clean breakdown), so all 12 units
// carry a genuine social/conversational builder (introductions, feelings, health,
// weather, time, food, compliments, requests, wants, everyday verbs).
export const STAGE_5_UNIT_PEOPLE = unit({
  unitId: 'stage-5-family-people', stageId: 5,
  title: 'Family and people', subtitle: 'Relative, wife, father, aunt, daughter, person, student, police.',
  vocabCardIds: [1730, 1735, 2395, 2515, 2677, 1886, 3325, 199], sentenceCardId: 841, challengeCardIds: [1730, 1735, 2395],
  sentenceBuilder: {
    sourceCardId: 841, prompt: 'Build this Thai sentence', english: 'Where are you from?', thai: 'คุณมาจากไหน',
    tokens: [
      { id: 'khun', thai: 'คุณ', ph: 'khun', en: 'you' },
      { id: 'maa', thai: 'มา', ph: 'maa', en: 'to come' },
      { id: 'jaknai', thai: 'จากไหน', ph: 'jàak nǎi', en: 'from where' },
    ], answer: ['khun', 'maa', 'jaknai'],
  },
});
export const STAGE_5_UNIT_EMOTIONS = unit({
  unitId: 'stage-5-emotions-feelings', stageId: 5,
  title: 'Emotions and feelings', subtitle: 'Happy, satisfied, miss, sad, jealous, angry, startled, glad.',
  vocabCardIds: [460, 467, 469, 471, 5717, 3587, 2855, 2358], sentenceCardId: 811, challengeCardIds: [460, 471, 3587],
  sentenceBuilder: {
    sourceCardId: 811, prompt: 'Build this Thai sentence', english: 'I am very happy (male)', thai: 'ผมดีใจมาก',
    tokens: [
      { id: 'phom', thai: 'ผม', ph: 'phǒm', en: 'I (male)' },
      { id: 'deejai', thai: 'ดีใจ', ph: 'dee jai', en: 'happy / glad' },
      { id: 'mak', thai: 'มาก', ph: 'mâak', en: 'very' },
    ], answer: ['phom', 'deejai', 'mak'],
  },
});
export const STAGE_5_UNIT_HEALTH = unit({
  unitId: 'stage-5-health-and-body', stageId: 5,
  title: 'Health and the body', subtitle: 'Nurse, breathe, doctor, wound, blood, nose, knee, shoulder.',
  vocabCardIds: [1215, 1220, 2205, 3043, 2387, 563, 3315, 3327], sentenceCardId: 807, challengeCardIds: [1215, 2205, 3043],
  sentenceBuilder: {
    sourceCardId: 807, prompt: 'Build this Thai sentence', english: 'I am not feeling well (male)', thai: 'ผมไม่สบายครับ',
    tokens: [
      { id: 'phom', thai: 'ผม', ph: 'phǒm', en: 'I (male)' },
      { id: 'maisabai', thai: 'ไม่สบาย', ph: 'mâi sàbaai', en: 'not well' },
      { id: 'khrap', thai: 'ครับ', ph: 'khráp', en: 'polite (male)' },
    ], answer: ['phom', 'maisabai', 'khrap'],
  },
});
export const STAGE_5_UNIT_WEATHER = unit({
  unitId: 'stage-5-weather-seasons', stageId: 5,
  title: 'Weather and seasons', subtitle: 'Weather, season, storm, snow, grass, island, kite, rock.',
  vocabCardIds: [600, 2470, 3500, 3644, 2623, 613, 4305, 3558], sentenceCardId: 891, challengeCardIds: [600, 2470, 3500],
  sentenceBuilder: {
    sourceCardId: 891, prompt: 'Build this Thai sentence', english: 'It is very hot today', thai: 'วันนี้ร้อนมาก',
    tokens: [
      { id: 'wannii', thai: 'วันนี้', ph: 'wan níi', en: 'today' },
      { id: 'ron', thai: 'ร้อน', ph: 'ráwn', en: 'hot' },
      { id: 'mak', thai: 'มาก', ph: 'mâak', en: 'very' },
    ], answer: ['wannii', 'ron', 'mak'],
  },
});
export const STAGE_5_UNIT_TIME = unit({
  unitId: 'stage-5-days-and-time', stageId: 5,
  title: 'Days and time', subtitle: 'Today, now, week, Monday, now, just, after, times.',
  vocabCardIds: [210, 213, 219, 2863, 3205, 258, 297, 279], sentenceCardId: 855, challengeCardIds: [210, 219, 2863],
  sentenceBuilder: {
    sourceCardId: 855, prompt: 'Build this Thai sentence', english: 'What day is today?', thai: 'วันนี้วันอะไร',
    tokens: [
      { id: 'wannii', thai: 'วันนี้', ph: 'wan níi', en: 'today' },
      { id: 'wan', thai: 'วัน', ph: 'wan', en: 'day' },
      { id: 'arai', thai: 'อะไร', ph: 'àrai', en: 'what' },
    ], answer: ['wannii', 'wan', 'arai'],
  },
});
export const STAGE_5_UNIT_FOOD = unit({
  unitId: 'stage-5-food-and-drink', stageId: 5,
  title: 'Food and drink', subtitle: 'Beer, papaya salad, tom yum, liquor, salt, lime, mango, banana.',
  vocabCardIds: [136, 147, 148, 155, 521, 524, 527, 528], sentenceCardId: 826, challengeCardIds: [147, 148, 527],
  sentenceBuilder: {
    sourceCardId: 826, prompt: 'Build this Thai sentence', english: 'I want to drink coffee (male)', thai: 'ผมอยากดื่มกาแฟ',
    tokens: [
      { id: 'phom', thai: 'ผม', ph: 'phǒm', en: 'I (male)' },
      { id: 'yak', thai: 'อยาก', ph: 'yàak', en: 'to want to' },
      { id: 'duem', thai: 'ดื่ม', ph: 'dùem', en: 'to drink' },
      { id: 'gafae', thai: 'กาแฟ', ph: 'gaafae', en: 'coffee' },
    ], answer: ['phom', 'yak', 'duem', 'gafae'],
  },
});
export const STAGE_5_UNIT_MONEY = unit({
  unitId: 'stage-5-ordering-and-money', stageId: 5,
  title: 'Ordering and money', subtitle: 'Menu, banknote, money, cash, prize, coin, sign, stop by.',
  vocabCardIds: [5711, 5726, 5727, 1107, 2597, 3033, 2784, 2995], sentenceCardId: 828, challengeCardIds: [5711, 1107, 5727],
  sentenceBuilder: {
    sourceCardId: 828, prompt: 'Build this Thai sentence', english: 'I will take this one (male)', thai: 'ผมเอาอันนี้ครับ',
    tokens: [
      { id: 'phom', thai: 'ผม', ph: 'phǒm', en: 'I (male)' },
      { id: 'ao', thai: 'เอา', ph: 'ao', en: 'to want / take' },
      { id: 'annii', thai: 'อันนี้', ph: 'annǐi', en: 'this one' },
      { id: 'khrap', thai: 'ครับ', ph: 'khráp', en: 'polite (male)' },
    ], answer: ['phom', 'ao', 'annii', 'khrap'],
  },
});
export const STAGE_5_UNIT_REQUESTS = unit({
  unitId: 'stage-5-asking-and-giving', stageId: 5,
  title: 'Asking and giving', subtitle: 'Advise, warn, hand out, feed, scoop, say, call out, inform.',
  vocabCardIds: [3632, 2555, 2767, 2837, 2982, 1786, 3070, 2257], sentenceCardId: 831, challengeCardIds: [3632, 2555, 1786],
  sentenceBuilder: {
    sourceCardId: 831, prompt: 'Build this Thai sentence', english: 'May I have some water (male)', thai: 'ขอน้ำหน่อยครับ',
    tokens: [
      { id: 'khaw', thai: 'ขอ', ph: 'khǎw', en: 'may I have / request' },
      { id: 'nam', thai: 'น้ำ', ph: 'náam', en: 'water' },
      { id: 'noi', thai: 'หน่อย', ph: 'nàwy', en: 'a little' },
      { id: 'khrap', thai: 'ครับ', ph: 'khráp', en: 'polite (male)' },
    ], answer: ['khaw', 'nam', 'noi', 'khrap'],
  },
});
export const STAGE_5_UNIT_COMPLIMENTS = unit({
  unitId: 'stage-5-compliments', stageId: 5,
  title: 'Compliments and praise', subtitle: 'Special, great, funny, comfortable, real, neat, pleasing, delighted.',
  vocabCardIds: [1826, 2404, 2732, 2154, 2241, 2551, 3270, 3531], sentenceCardId: 951, challengeCardIds: [1826, 2404, 3270],
  sentenceBuilder: {
    sourceCardId: 951, prompt: 'Build this Thai sentence', english: 'You are very beautiful (male speaker)', thai: 'คุณสวยมากครับ',
    tokens: [
      { id: 'khun', thai: 'คุณ', ph: 'khun', en: 'you' },
      { id: 'suai', thai: 'สวย', ph: 'sǔai', en: 'beautiful' },
      { id: 'mak', thai: 'มาก', ph: 'mâak', en: 'very' },
      { id: 'khrap', thai: 'ครับ', ph: 'khráp', en: 'polite (male)' },
    ], answer: ['khun', 'suai', 'mak', 'khrap'],
  },
});
export const STAGE_5_UNIT_TOWN = unit({
  unitId: 'stage-5-around-town', stageId: 5,
  title: 'Around town', subtitle: 'City, building, shore, sub-district, market, bridge, camp, train.',
  vocabCardIds: [1648, 2278, 2354, 2370, 4230, 2670, 2897, 2450], sentenceCardId: 952, challengeCardIds: [1648, 2278, 2670],
  sentenceBuilder: {
    sourceCardId: 952, prompt: 'Build this Thai sentence', english: 'It is very beautiful here', thai: 'ที่นี่สวยมาก',
    tokens: [
      { id: 'thinii', thai: 'ที่นี่', ph: 'thîi nîi', en: 'here' },
      { id: 'suai', thai: 'สวย', ph: 'sǔai', en: 'beautiful' },
      { id: 'mak', thai: 'มาก', ph: 'mâak', en: 'very' },
    ], answer: ['thinii', 'suai', 'mak'],
  },
});
export const STAGE_5_UNIT_WANTS = unit({
  unitId: 'stage-5-wants-and-plans', stageId: 5,
  title: 'Wants and plans', subtitle: 'Desire, prepare, schedule, postpone, withdraw, expect, connect, share.',
  vocabCardIds: [3130, 2044, 1787, 2021, 2616, 2541, 2467, 1958], sentenceCardId: 822, challengeCardIds: [2044, 1787, 2541],
  sentenceBuilder: {
    sourceCardId: 822, prompt: 'Build this Thai sentence', english: 'I want to go home (male)', thai: 'ผมอยากกลับบ้าน',
    tokens: [
      { id: 'phom', thai: 'ผม', ph: 'phǒm', en: 'I (male)' },
      { id: 'yak', thai: 'อยาก', ph: 'yàak', en: 'to want to' },
      { id: 'glapban', thai: 'กลับบ้าน', ph: 'glàp bâan', en: 'to go home' },
    ], answer: ['phom', 'yak', 'glapban'],
  },
});
export const STAGE_5_UNIT_VERBS2 = unit({
  unitId: 'stage-5-everyday-verbs', stageId: 5,
  title: 'Everyday social verbs', subtitle: 'Know, remember, hate, win, compete, exchange, wai, greet.',
  vocabCardIds: [1718, 2694, 3125, 2730, 2845, 3064, 2606, 3383], sentenceCardId: 895, challengeCardIds: [1718, 2694, 3383],
  sentenceBuilder: {
    sourceCardId: 895, prompt: 'Build this Thai sentence', english: 'I just arrived (male)', thai: 'ผมเพิ่งมาถึง',
    tokens: [
      { id: 'phom', thai: 'ผม', ph: 'phǒm', en: 'I (male)' },
      { id: 'pheung', thai: 'เพิ่ง', ph: 'phêung', en: 'just (recently)' },
      { id: 'maathueng', thai: 'มาถึง', ph: 'maa thǔeng', en: 'to arrive' },
    ], answer: ['phom', 'pheung', 'maathueng'],
  },
});

// Stage 6 — Intermediate Power.
export const STAGE_6_UNIT_WANTS = unit({
  unitId: 'stage-6-wants-and-plans', stageId: 6,
  title: 'Wants and plans', subtitle: 'Rest, need, make, can, try, treat, feel, travel.',
  vocabCardIds: [40, 50, 1614, 1659, 1683, 1745, 1759, 1823], sentenceCardId: 824, challengeCardIds: [50, 1759, 1823],
  sentenceBuilder: {
    sourceCardId: 824, prompt: 'Build this Thai sentence', english: 'I want to learn Thai (male)', thai: 'ผมอยากเรียนภาษาไทย',
    tokens: [
      { id: 'phom', thai: 'ผม', ph: 'phǒm', en: 'I (male)' },
      { id: 'yak', thai: 'อยาก', ph: 'yàak', en: 'to want to' },
      { id: 'rian', thai: 'เรียน', ph: 'rian', en: 'to learn' },
      { id: 'phasathai', thai: 'ภาษาไทย', ph: 'phaa-sǎa thai', en: 'Thai language' },
    ], answer: ['phom', 'yak', 'rian', 'phasathai'],
  },
});
export const STAGE_6_UNIT_HEALTH = unit({
  unitId: 'stage-6-health-and-body', stageId: 6,
  title: 'Health and body', subtitle: 'Headache, vomit, symptom, patient, heart, brain.',
  vocabCardIds: [1202, 1210, 1984, 2807, 2041, 2222], sentenceCardId: 914, challengeCardIds: [1202, 1984, 2807],
  sentenceBuilder: {
    sourceCardId: 914, prompt: 'Build this Thai sentence', english: 'I am allergic to seafood (male)', thai: 'ผมแพ้อาหารทะเล',
    tokens: [
      { id: 'phom', thai: 'ผม', ph: 'phǒm', en: 'I (male)' },
      { id: 'phae', thai: 'แพ้', ph: 'pháe', en: 'allergic to' },
      { id: 'seafood', thai: 'อาหารทะเล', ph: 'aahǎan thá-leh', en: 'seafood' },
    ], answer: ['phom', 'phae', 'seafood'],
  },
});
// Stage 6 deepening (Course Structure Sprint) — the "Intermediate Power" path.
// Every id below is an EXISTING Stage 6 card; no card content is changed and no
// Thai is invented. Builders use only the source sentence card's own pieces (its
// space-separated phonetic split, meanings from WORD_LOOKUP) — verified by
// scripts/check-mini-units.mjs against the runtime CARDS. Stage 6 is very
// sentence-rich (210 sentence cards, 13 with a clean breakdown); 11 of the 12 new
// units carry a builder, including several longer 4-/5-token intermediate lines.
export const STAGE_6_UNIT_PEOPLE = unit({
  unitId: 'stage-6-people-family', stageId: 6,
  title: 'People and family', subtitle: 'Man, woman, mother, son, daughter, brother, friend, girlfriend.',
  vocabCardIds: [191, 192, 2383, 2436, 2508, 3124, 3611, 3829], sentenceCardId: 897, challengeCardIds: [191, 192, 2436],
  sentenceBuilder: {
    sourceCardId: 897, prompt: 'Build this Thai sentence', english: 'See you again (male)', thai: 'เจอกันใหม่นะครับ',
    tokens: [
      { id: 'jergan', thai: 'เจอกัน', ph: 'jer gan', en: 'to meet / see each other' },
      { id: 'mai', thai: 'ใหม่', ph: 'mài', en: 'again / new' },
      { id: 'na', thai: 'นะ', ph: 'ná', en: '(softener)' },
      { id: 'khrap', thai: 'ครับ', ph: 'khráp', en: 'polite (male)' },
    ], answer: ['jergan', 'mai', 'na', 'khrap'],
  },
});
export const STAGE_6_UNIT_DAYS = unit({
  unitId: 'stage-6-days-and-dates', stageId: 6,
  title: 'Days and dates', subtitle: 'Tomorrow, yesterday, hour, date, week, holiday, calendar, tonight.',
  vocabCardIds: [211, 212, 222, 1864, 2632, 2762, 3743, 3996], sentenceCardId: 893, challengeCardIds: [211, 212, 2632],
  sentenceBuilder: {
    sourceCardId: 893, prompt: 'Build this Thai sentence', english: 'Yesterday I went to the market (male)', thai: 'เมื่อวานผมไปตลาด',
    tokens: [
      { id: 'mueawaan', thai: 'เมื่อวาน', ph: 'mêua waan', en: 'yesterday' },
      { id: 'phom', thai: 'ผม', ph: 'phǒm', en: 'I (male)' },
      { id: 'pai', thai: 'ไป', ph: 'bpai', en: 'to go' },
      { id: 'talat', thai: 'ตลาด', ph: 'talàat', en: 'market' },
    ], answer: ['mueawaan', 'phom', 'pai', 'talat'],
  },
});
export const STAGE_6_UNIT_TIMES = unit({
  unitId: 'stage-6-times-and-waiting', stageId: 6,
  title: 'Times and waiting', subtitle: 'Daytime, evening, Saturday, Wednesday, a moment, every time, still, occasion.',
  vocabCardIds: [2795, 3648, 3183, 4017, 5708, 3219, 1769, 3110], sentenceCardId: 876, challengeCardIds: [2795, 3648, 5708],
  sentenceBuilder: {
    sourceCardId: 876, prompt: 'Build this Thai sentence', english: 'Please wait a moment (male)', thai: 'รอสักครู่นะครับ',
    tokens: [
      { id: 'raw', thai: 'รอ', ph: 'raw', en: 'to wait' },
      { id: 'sakkhru', thai: 'สักครู่', ph: 'sàk khrûu', en: 'a moment' },
      { id: 'na', thai: 'นะ', ph: 'ná', en: '(softener)' },
      { id: 'khrap', thai: 'ครับ', ph: 'khráp', en: 'polite (male)' },
    ], answer: ['raw', 'sakkhru', 'na', 'khrap'],
  },
});
export const STAGE_6_UNIT_RESTAURANT = unit({
  unitId: 'stage-6-at-a-restaurant', stageId: 6,
  title: 'At a restaurant', subtitle: 'Fruit, durian, rose apple, eat, check please, banana leaf, krathong, sour.',
  vocabCardIds: [137, 529, 4389, 5706, 5710, 4294, 4333, 70], sentenceCardId: 832, challengeCardIds: [137, 529, 5706],
  sentenceBuilder: {
    sourceCardId: 832, prompt: 'Build this Thai sentence', english: 'May I have the menu (male)', thai: 'ขอเมนูหน่อยครับ',
    tokens: [
      { id: 'khaw', thai: 'ขอ', ph: 'khǎw', en: 'may I have / request' },
      { id: 'menu', thai: 'เมนู', ph: 'meh-nuu', en: 'menu' },
      { id: 'noi', thai: 'หน่อย', ph: 'nàwy', en: 'a little' },
      { id: 'khrap', thai: 'ครับ', ph: 'khráp', en: 'polite (male)' },
    ], answer: ['khaw', 'menu', 'noi', 'khrap'],
  },
});
export const STAGE_6_UNIT_HOME = unit({
  unitId: 'stage-6-rest-and-home', stageId: 6,
  title: 'Rest and home', subtitle: 'Fridge, chair, bedroom, balcony, bed, roof, clean, table.',
  vocabCardIds: [1002, 1006, 1008, 1011, 3453, 2821, 1030, 2773], sentenceCardId: 827, challengeCardIds: [1006, 1008, 3453],
  sentenceBuilder: {
    sourceCardId: 827, prompt: 'Build this Thai sentence', english: 'I want to rest (male)', thai: 'ผมอยากพักผ่อน',
    tokens: [
      { id: 'phom', thai: 'ผม', ph: 'phǒm', en: 'I (male)' },
      { id: 'yak', thai: 'อยาก', ph: 'yàak', en: 'to want to' },
      { id: 'phakphon', thai: 'พักผ่อน', ph: 'phák-phàwn', en: 'to rest' },
    ], answer: ['phom', 'yak', 'phakphon'],
  },
});
export const STAGE_6_UNIT_TOWN = unit({
  unitId: 'stage-6-out-in-town', stageId: 6,
  title: 'Out in town', subtitle: 'Hotel, station, bank, country, district, city, territory, mountain.',
  vocabCardIds: [161, 167, 169, 1662, 1819, 2197, 2453, 610], sentenceCardId: 957, challengeCardIds: [161, 167, 169],
  sentenceBuilder: {
    sourceCardId: 957, prompt: 'Build this Thai sentence', english: 'I will come back again (male)', thai: 'ผมจะกลับมาอีก',
    tokens: [
      { id: 'phom', thai: 'ผม', ph: 'phǒm', en: 'I (male)' },
      { id: 'ja', thai: 'จะ', ph: 'jà', en: 'will (future)' },
      { id: 'glap', thai: 'กลับ', ph: 'glàp', en: 'to return' },
      { id: 'maa', thai: 'มา', ph: 'maa', en: 'to come' },
      { id: 'ik', thai: 'อีก', ph: 'ìik', en: 'again' },
    ], answer: ['phom', 'ja', 'glap', 'maa', 'ik'],
  },
});
export const STAGE_6_UNIT_BANKING = unit({
  unitId: 'stage-6-banking-paperwork', stageId: 6,
  title: 'Banking and paperwork', subtitle: 'Bank, ATM, signature, document, address, receipt, insurance, package.',
  vocabCardIds: [1100, 1103, 1111, 1119, 1123, 1127, 1129, 1132], sentenceCardId: 1505, challengeCardIds: [1103, 1119, 1127],
  sentenceBuilder: {
    sourceCardId: 1505, prompt: 'Build this Thai sentence', english: 'Can you come today? (male)', thai: 'มาวันนี้ได้ไหมครับ',
    tokens: [
      { id: 'maa', thai: 'มา', ph: 'maa', en: 'to come' },
      { id: 'wannii', thai: 'วันนี้', ph: 'wan níi', en: 'today' },
      { id: 'dai', thai: 'ได้', ph: 'dâai', en: 'can / able' },
      { id: 'mai', thai: 'ไหม', ph: 'mǎi', en: '? (yes/no)' },
      { id: 'khrap', thai: 'ครับ', ph: 'khráp', en: 'polite (male)' },
    ], answer: ['maa', 'wannii', 'dai', 'mai', 'khrap'],
  },
});
export const STAGE_6_UNIT_EMOTIONS = unit({
  unitId: 'stage-6-emotions-moods', stageId: 6,
  title: 'Emotions and moods', subtitle: 'Sad, calm, at ease, intend, trust, irritated, mood, love.',
  vocabCardIds: [461, 463, 465, 466, 468, 478, 1838, 3871], sentenceCardId: 959, challengeCardIds: [461, 463, 468],
  sentenceBuilder: {
    sourceCardId: 959, prompt: 'Build this Thai sentence', english: 'Take care of yourself', thai: 'รักษาตัวด้วยนะ',
    tokens: [
      { id: 'raksatua', thai: 'รักษาตัว', ph: 'rák-sǎa tua', en: 'take care of oneself' },
      { id: 'duai', thai: 'ด้วย', ph: 'dûai', en: 'too / as well' },
      { id: 'na', thai: 'นะ', ph: 'ná', en: '(softener)' },
    ], answer: ['raksatua', 'duai', 'na'],
  },
});
export const STAGE_6_UNIT_LEARNING = unit({
  unitId: 'stage-6-learning-ability', stageId: 6,
  title: 'Learning and ability', subtitle: 'Study, see, hear, recommend, record, summarize, offer, search.',
  vocabCardIds: [1872, 1969, 2170, 2029, 2152, 2073, 1840, 2284], sentenceCardId: 825, challengeCardIds: [1872, 2029, 2170],
  sentenceBuilder: {
    sourceCardId: 825, prompt: 'Build this Thai sentence', english: 'I want to be able to speak Thai (male)', thai: 'ผมอยากพูดไทยได้',
    tokens: [
      { id: 'phom', thai: 'ผม', ph: 'phǒm', en: 'I (male)' },
      { id: 'yak', thai: 'อยาก', ph: 'yàak', en: 'to want to' },
      { id: 'phut', thai: 'พูด', ph: 'phûut', en: 'to speak' },
      { id: 'thai', thai: 'ไทย', ph: 'thai', en: 'Thai' },
      { id: 'dai', thai: 'ได้', ph: 'dâai', en: 'can / able' },
    ], answer: ['phom', 'yak', 'phut', 'thai', 'dai'],
  },
});
export const STAGE_6_UNIT_VERBS = unit({
  unitId: 'stage-6-everyday-verbs', stageId: 6,
  title: 'Everyday verbs', subtitle: 'Accept, experience, fight, follow, laugh, chat, think about, review.',
  vocabCardIds: [1831, 2063, 2229, 2330, 2399, 2443, 2610, 2435], sentenceCardId: 846, challengeCardIds: [1831, 2443, 2399],
  sentenceBuilder: {
    sourceCardId: 846, prompt: 'Build this Thai sentence', english: 'Have you eaten yet?', thai: 'คุณกินข้าวหรือยัง',
    tokens: [
      { id: 'khun', thai: 'คุณ', ph: 'khun', en: 'you' },
      { id: 'ginkhao', thai: 'กินข้าว', ph: 'gin khâao', en: 'to eat (a meal)' },
      { id: 'rueyang', thai: 'หรือยัง', ph: 'rǔe yang', en: 'yet? / or not yet' },
    ], answer: ['khun', 'ginkhao', 'rueyang'],
  },
});
export const STAGE_6_UNIT_COMM = unit({
  unitId: 'stage-6-communication-verbs', stageId: 6,
  title: 'Explaining and confirming', subtitle: 'Explain, confirm, promise, respect, settle, begin, test, guarantee.',
  vocabCardIds: [2599, 2329, 2109, 2262, 2571, 2537, 2217, 2502], sentenceCardId: 913, challengeCardIds: [2599, 2329, 2109],
  sentenceBuilder: {
    sourceCardId: 913, prompt: 'Build this Thai sentence', english: 'May I have some more (male)', thai: 'ขอเพิ่มหน่อยครับ',
    tokens: [
      { id: 'khaw', thai: 'ขอ', ph: 'khǎw', en: 'may I have / request' },
      { id: 'phoem', thai: 'เพิ่ม', ph: 'phôem', en: 'to add / more' },
      { id: 'noi', thai: 'หน่อย', ph: 'nàwy', en: 'a little' },
      { id: 'khrap', thai: 'ครับ', ph: 'khráp', en: 'polite (male)' },
    ], answer: ['khaw', 'phoem', 'noi', 'khrap'],
  },
});
export const STAGE_6_UNIT_QUALITIES = unit({
  unitId: 'stage-6-describing-qualities', stageId: 6,
  title: 'Describing qualities', subtitle: 'Convenient, correct, confused, smart, diligent, strong, warm, familiar.',
  vocabCardIds: [1923, 2053, 2337, 2594, 3034, 2589, 2603, 2256], challengeCardIds: [1923, 2594, 3034],
  // No sentenceCard/builder: the clean Stage 6 adjective sentences are 2-token or
  // idiomatic; this unit is taught as vocabulary and used in sentences elsewhere.
});

// Stage 7 — Natural Thai.
export const STAGE_7_UNIT_FOOD = unit({
  unitId: 'stage-7-food-and-flavors', stageId: 7,
  title: 'Food and flavors', subtitle: 'Noodle soup, pad thai, bread, juice, fried rice, sugar, garlic, fish sauce.',
  vocabCardIds: [145, 146, 150, 153, 158, 520, 523, 525], sentenceCardId: 954, challengeCardIds: [146, 158, 520],
  sentenceBuilder: {
    sourceCardId: 954, prompt: 'Build this Thai sentence', english: 'Thai food is the most delicious', thai: 'อาหารไทยอร่อยที่สุด',
    tokens: [
      { id: 'ahan', thai: 'อาหาร', ph: 'aahǎan', en: 'food' },
      { id: 'thai', thai: 'ไทย', ph: 'thai', en: 'Thai' },
      { id: 'aroi', thai: 'อร่อย', ph: 'aròi', en: 'delicious' },
      { id: 'thisut', thai: 'ที่สุด', ph: 'thîi sùt', en: 'most' },
    ], answer: ['ahan', 'thai', 'aroi', 'thisut'],
  },
});
export const STAGE_7_UNIT_VERBS = unit({
  unitId: 'stage-7-more-verbs', stageId: 7,
  title: 'More everyday verbs', subtitle: 'Shower, cook, help, meet, start, learn, notice, explain.',
  vocabCardIds: [516, 518, 1933, 1947, 2022, 2030, 2058, 2066], sentenceCardId: 894, challengeCardIds: [516, 518, 2030],
  sentenceBuilder: {
    sourceCardId: 894, prompt: 'Build this Thai sentence', english: 'Right now I am eating (male)', thai: 'ตอนนี้ผมกำลังกินข้าว',
    tokens: [
      { id: 'tawnnii', thai: 'ตอนนี้', ph: 'tawn níi', en: 'now' },
      { id: 'phom', thai: 'ผม', ph: 'phǒm', en: 'I (male)' },
      { id: 'gamlang', thai: 'กำลัง', ph: 'gamlang', en: '-ing (now)' },
      { id: 'ginkhao', thai: 'กินข้าว', ph: 'gin khâao', en: 'to eat (rice)' },
    ], answer: ['tawnnii', 'phom', 'gamlang', 'ginkhao'],
  },
});
// Stage 7 deepening (Course Structure Sprint) — the "Natural Thai" path. Every id
// below is an EXISTING Stage 7 card; no card content is changed and no Thai is
// invented. Builders use only the source sentence card's own pieces (its
// space-separated phonetic split, meanings from WORD_LOOKUP) — verified by
// scripts/check-mini-units.mjs against the runtime CARDS. Stage 7 is extremely
// sentence-rich (229 sentence cards, 12 with a clean breakdown); 10 of the 12 new
// units carry a builder, including several longer 5-/6-token natural lines.
export const STAGE_7_UNIT_PLACES = unit({
  unitId: 'stage-7-places-around-town', stageId: 7,
  title: 'Places around town', subtitle: 'Airport, hospital, school, province, village, countryside, cafeteria, villagers.',
  vocabCardIds: [166, 170, 1800, 1885, 2049, 2706, 3742, 1748], sentenceCardId: 930, challengeCardIds: [166, 170, 1800],
  sentenceBuilder: {
    sourceCardId: 930, prompt: 'Build this Thai sentence', english: 'To the airport please (male)', thai: 'ไปสนามบินครับ',
    tokens: [
      { id: 'pai', thai: 'ไป', ph: 'bpai', en: 'to go' },
      { id: 'sanambin', thai: 'สนามบิน', ph: 'sà-nǎam bin', en: 'airport' },
      { id: 'khrap', thai: 'ครับ', ph: 'khráp', en: 'polite (male)' },
    ], answer: ['pai', 'sanambin', 'khrap'],
  },
});
export const STAGE_7_UNIT_DIRECTIONS = unit({
  unitId: 'stage-7-directions-position', stageId: 7,
  title: 'Directions and position', subtitle: 'Between, opposite, behind, north, south, look here, yes sir, in front.',
  vocabCardIds: [1705, 2313, 3484, 3893, 3962, 4248, 3294, 2302], sentenceCardId: 932, challengeCardIds: [2313, 3484, 3893],
  sentenceBuilder: {
    sourceCardId: 932, prompt: 'Build this Thai sentence', english: 'Stop up ahead please (male)', thai: 'จอดข้างหน้าครับ',
    tokens: [
      { id: 'jot', thai: 'จอด', ph: 'jàwt', en: 'to stop / park' },
      { id: 'khangna', thai: 'ข้างหน้า', ph: 'khâang nâa', en: 'ahead / in front' },
      { id: 'khrap', thai: 'ครับ', ph: 'khráp', en: 'polite (male)' },
    ], answer: ['jot', 'khangna', 'khrap'],
  },
});
export const STAGE_7_UNIT_TALKING = unit({
  unitId: 'stage-7-talking-discussing', stageId: 7,
  title: 'Talking and discussing', subtitle: 'Communicate, converse, consult, persuade, negotiate, mention, comment, quarrel.',
  vocabCardIds: [2507, 2707, 2570, 2714, 2715, 2413, 2669, 2950], sentenceCardId: 950, challengeCardIds: [2507, 2707, 2715],
  sentenceBuilder: {
    sourceCardId: 950, prompt: 'Build this Thai sentence', english: 'You speak English very well', thai: 'คุณพูดอังกฤษเก่งมาก',
    tokens: [
      { id: 'khun', thai: 'คุณ', ph: 'khun', en: 'you' },
      { id: 'phut', thai: 'พูด', ph: 'phûut', en: 'to speak' },
      { id: 'angkrit', thai: 'อังกฤษ', ph: 'angkrìt', en: 'English' },
      { id: 'geng', thai: 'เก่ง', ph: 'gèng', en: 'skilled / good at' },
      { id: 'mak', thai: 'มาก', ph: 'mâak', en: 'very' },
    ], answer: ['khun', 'phut', 'angkrit', 'geng', 'mak'],
  },
});
export const STAGE_7_UNIT_MEETING = unit({
  unitId: 'stage-7-meeting-people', stageId: 7,
  title: 'Meeting people', subtitle: 'Family, student, adult, mother, younger brother, boyfriend, girl, boy.',
  vocabCardIds: [1723, 1776, 1837, 2516, 3388, 3733, 3411, 3313], sentenceCardId: 958, challengeCardIds: [1723, 1776, 1837],
  sentenceBuilder: {
    sourceCardId: 958, prompt: 'Build this Thai sentence', english: 'Glad I got to meet you', thai: 'ดีใจที่ได้เจอคุณ',
    tokens: [
      { id: 'deejai', thai: 'ดีใจ', ph: 'dee jai', en: 'glad / happy' },
      { id: 'thi', thai: 'ที่', ph: 'thîi', en: 'that' },
      { id: 'dai', thai: 'ได้', ph: 'dâai', en: 'got to / able' },
      { id: 'jer', thai: 'เจอ', ph: 'jer', en: 'to meet' },
      { id: 'khun', thai: 'คุณ', ph: 'khun', en: 'you' },
    ], answer: ['deejai', 'thi', 'dai', 'jer', 'khun'],
  },
});
export const STAGE_7_UNIT_FLOW = unit({
  unitId: 'stage-7-conversation-flow', stageId: 7,
  title: 'Conversation flow', subtitle: 'Maybe, of course, how, but, so, besides, after that, if.',
  vocabCardIds: [1260, 1265, 1267, 1268, 1270, 1665, 2125, 2666], sentenceCardId: 875, challengeCardIds: [1265, 1268, 1270],
  sentenceBuilder: {
    sourceCardId: 875, prompt: 'Build this Thai sentence', english: 'Could you say it again please? (male)', thai: 'พูดอีกทีได้ไหมครับ',
    tokens: [
      { id: 'phut', thai: 'พูด', ph: 'phûut', en: 'to speak' },
      { id: 'ikthi', thai: 'อีกที', ph: 'ìik thii', en: 'again / one more time' },
      { id: 'dai', thai: 'ได้', ph: 'dâai', en: 'can / able' },
      { id: 'mai', thai: 'ไหม', ph: 'mǎi', en: '? (yes/no)' },
      { id: 'khrap', thai: 'ครับ', ph: 'khráp', en: 'polite (male)' },
    ], answer: ['phut', 'ikthi', 'dai', 'mai', 'khrap'],
  },
});
export const STAGE_7_UNIT_FEELINGS = unit({
  unitId: 'stage-7-feelings-reactions', stageId: 7,
  title: 'Feelings and reactions', subtitle: 'Impatient, happy, surprised, excited, smile, beaming, worry, like that.',
  vocabCardIds: [464, 470, 474, 476, 3298, 3665, 4027, 2283], sentenceCardId: 878, challengeCardIds: [470, 474, 476],
  sentenceBuilder: {
    sourceCardId: 878, prompt: 'Build this Thai sentence', english: 'Thanks for everything', thai: 'ขอบคุณสำหรับทุกอย่าง',
    tokens: [
      { id: 'khopkhun', thai: 'ขอบคุณ', ph: 'khàwp khun', en: 'thank you' },
      { id: 'samrap', thai: 'สำหรับ', ph: 'sǎm-ràp', en: 'for' },
      { id: 'thukyang', thai: 'ทุกอย่าง', ph: 'thúk yàang', en: 'everything' },
    ], answer: ['khopkhun', 'samrap', 'thukyang'],
  },
});
export const STAGE_7_UNIT_TIMESOFDAY = unit({
  unitId: 'stage-7-plans-times-of-day', stageId: 7,
  title: 'Plans and times of day', subtitle: 'Right now, after, night, morning, afternoon, evening, often, finally.',
  vocabCardIds: [214, 1761, 2733, 3382, 3678, 3797, 3900, 4282], sentenceCardId: 892, challengeCardIds: [3382, 3678, 3797],
  sentenceBuilder: {
    sourceCardId: 892, prompt: 'Build this Thai sentence', english: 'Tomorrow I will go to work (male)', thai: 'พรุ่งนี้ผมจะไปทำงาน',
    tokens: [
      { id: 'phrungnii', thai: 'พรุ่งนี้', ph: 'phrûng níi', en: 'tomorrow' },
      { id: 'phom', thai: 'ผม', ph: 'phǒm', en: 'I (male)' },
      { id: 'ja', thai: 'จะ', ph: 'jà', en: 'will (future)' },
      { id: 'pai', thai: 'ไป', ph: 'bpai', en: 'to go' },
      { id: 'thamngan', thai: 'ทำงาน', ph: 'tham-ngaan', en: 'to work' },
    ], answer: ['phrungnii', 'phom', 'ja', 'pai', 'thamngan'],
  },
});
export const STAGE_7_UNIT_SCHEDULE = unit({
  unitId: 'stage-7-days-and-schedule', stageId: 7,
  title: 'Days and schedule', subtitle: 'Friday, Monday, Saturday, Tuesday, clock, now, new year, daybreak.',
  vocabCardIds: [3823, 3879, 3940, 4005, 2766, 2958, 3473, 3776], sentenceCardId: 1509, challengeCardIds: [3879, 3823, 2766],
  sentenceBuilder: {
    sourceCardId: 1509, prompt: 'Build this Thai sentence', english: 'What time will you arrive? (male)', thai: 'จะมาถึงกี่โมงครับ',
    tokens: [
      { id: 'ja', thai: 'จะ', ph: 'jà', en: 'will (future)' },
      { id: 'maathueng', thai: 'มาถึง', ph: 'maa thǔeng', en: 'to arrive' },
      { id: 'kimong', thai: 'กี่โมง', ph: 'gìi mohng', en: 'what time' },
      { id: 'khrap', thai: 'ครับ', ph: 'khráp', en: 'polite (male)' },
    ], answer: ['ja', 'maathueng', 'kimong', 'khrap'],
  },
});
export const STAGE_7_UNIT_DINING = unit({
  unitId: 'stage-7-dining-out', stageId: 7,
  title: 'Dining out', subtitle: 'Ice, rice, rice soup, apple, cook, dinner, sweet, things to eat.',
  vocabCardIds: [133, 2881, 3601, 3692, 3764, 3782, 3980, 4365], sentenceCardId: 919, challengeCardIds: [3601, 3782, 3764],
  sentenceBuilder: {
    sourceCardId: 919, prompt: 'Build this Thai sentence', english: 'Can we split the bill? (male)', thai: 'แยกบิลได้ไหมครับ',
    tokens: [
      { id: 'yaek', thai: 'แยก', ph: 'yâek', en: 'to split / separate' },
      { id: 'bin', thai: 'บิล', ph: 'bin', en: 'bill' },
      { id: 'dai', thai: 'ได้', ph: 'dâai', en: 'can / able' },
      { id: 'mai', thai: 'ไหม', ph: 'mǎi', en: '? (yes/no)' },
      { id: 'khrap', thai: 'ครับ', ph: 'khráp', en: 'polite (male)' },
    ], answer: ['yaek', 'bin', 'dai', 'mai', 'khrap'],
  },
});
export const STAGE_7_UNIT_ACTIONS = unit({
  unitId: 'stage-7-everyday-actions', stageId: 7,
  title: 'Everyday actions', subtitle: 'Touch, assemble, improve, add, decorate, dress, get ready, jump.',
  vocabCardIds: [1897, 1914, 2306, 2378, 2554, 2645, 2745, 2940], sentenceCardId: 938, challengeCardIds: [2306, 2645, 2940],
  sentenceBuilder: {
    sourceCardId: 938, prompt: 'Build this Thai sentence', english: 'Can you take me here? (male)', thai: 'พาผมไปที่นี่ได้ไหม',
    tokens: [
      { id: 'phaa', thai: 'พา', ph: 'phaa', en: 'to take (someone)' },
      { id: 'phom', thai: 'ผม', ph: 'phǒm', en: 'I / me (male)' },
      { id: 'pai', thai: 'ไป', ph: 'bpai', en: 'to go' },
      { id: 'thinii', thai: 'ที่นี่', ph: 'thîi nîi', en: 'here' },
      { id: 'dai', thai: 'ได้', ph: 'dâai', en: 'can / able' },
      { id: 'mai', thai: 'ไหม', ph: 'mǎi', en: '? (yes/no)' },
    ], answer: ['phaa', 'phom', 'pai', 'thinii', 'dai', 'mai'],
  },
});
export const STAGE_7_UNIT_QUALITIES = unit({
  unitId: 'stage-7-describing-things', stageId: 7,
  title: 'Describing things', subtitle: 'Cute, many, ordinary, clear, neat, different, safe, dangerous.',
  vocabCardIds: [76, 1744, 1828, 1846, 1970, 2048, 2147, 2140], challengeCardIds: [76, 2048, 2147],
  // No sentenceCard/builder: the clean Stage 7 adjective sentences are 2-token or
  // idiomatic; this unit is taught as vocabulary and used in sentences elsewhere.
});
export const STAGE_7_UNIT_NATURE = unit({
  unitId: 'stage-7-nature-outdoors', stageId: 7,
  title: 'Nature and outdoors', subtitle: 'River, nature, tree, flower, sky, sunlight, beach, lotus.',
  vocabCardIds: [611, 1863, 2208, 2416, 3192, 3514, 3618, 4296], challengeCardIds: [611, 2208, 3618],
  // No sentenceCard/builder: Stage 7 has no clean nature sentence to tokenize;
  // taught as vocabulary, used in sentences elsewhere.
});

// Stage 8 — Thai Mastery (sentence-heavy stage; one lighter "out and about" unit).
export const STAGE_8_UNIT_OUT = unit({
  unitId: 'stage-8-out-and-about', stageId: 8,
  title: 'Out and about', subtitle: 'Restaurant, skytrain, pharmacy, water, juice, sticky rice.',
  vocabCardIds: [162, 168, 171, 132, 152, 159], sentenceCardId: 386, challengeCardIds: [162, 168, 171],
  sentenceBuilder: {
    sourceCardId: 386, prompt: 'Build this Thai sentence', english: 'Is it close? (male)', thai: 'ใกล้ไหมครับ',
    tokens: [
      { id: 'glai', thai: 'ใกล้', ph: 'glâi', en: 'near' },
      { id: 'mai', thai: 'ไหม', ph: 'mǎi', en: '? (yes/no)' },
      { id: 'khrap', thai: 'ครับ', ph: 'khráp', en: 'polite (male)' },
    ], answer: ['glai', 'mai', 'khrap'],
  },
});
// Stage 8 deepening (Course Structure Sprint, final stage) — the "Thai Mastery"
// path. Every id below is an EXISTING Stage 8 card; no card content is changed and
// no Thai is invented. Builders use only the source sentence card's own pieces
// (its space-separated phonetic split, meanings from WORD_LOOKUP) — verified by
// scripts/check-mini-units.mjs against the runtime CARDS. Stage 8 is by far the
// most sentence-rich stage (526 sentence/phrase cards, 33 with a clean
// breakdown), so all 12 new units carry a genuine mastery-level builder.
export const STAGE_8_UNIT_PEOPLE = unit({
  unitId: 'stage-8-people-family', stageId: 8,
  title: 'People and family', subtitle: 'Boy, girl, sister, uncle, aunt, grandparent, manners, king.',
  vocabCardIds: [3732, 3828, 3947, 4009, 3696, 3834, 2891, 3575], sentenceCardId: 331, challengeCardIds: [3732, 3828, 3947],
  sentenceBuilder: {
    sourceCardId: 331, prompt: 'Build this Thai sentence', english: 'What is your name? (male)', thai: 'คุณชื่ออะไรครับ',
    tokens: [
      { id: 'khun', thai: 'คุณ', ph: 'khun', en: 'you' },
      { id: 'chue', thai: 'ชื่อ', ph: 'chûe', en: 'name' },
      { id: 'arai', thai: 'อะไร', ph: 'àrai', en: 'what' },
      { id: 'khrap', thai: 'ครับ', ph: 'khráp', en: 'polite (male)' },
    ], answer: ['khun', 'chue', 'arai', 'khrap'],
  },
});
export const STAGE_8_UNIT_PRONOUNS = unit({
  unitId: 'stage-8-everyone-no-one', stageId: 8,
  title: 'Everyone and no one', subtitle: 'Everything, anybody, nobody, nothing, somebody, their, himself, she.',
  vocabCardIds: [3071, 3687, 3891, 3895, 3957, 3984, 3844, 4308], sentenceCardId: 317, challengeCardIds: [3071, 3957, 3891],
  sentenceBuilder: {
    sourceCardId: 317, prompt: 'Build this Thai sentence', english: 'Nice to meet you', thai: 'ยินดีที่ได้รู้จัก',
    tokens: [
      { id: 'yindee', thai: 'ยินดี', ph: 'yindee', en: 'glad / pleased' },
      { id: 'thi', thai: 'ที่', ph: 'thîi', en: 'to / that' },
      { id: 'dai', thai: 'ได้', ph: 'dâai', en: 'got to / able' },
      { id: 'rujak', thai: 'รู้จัก', ph: 'rúujàk', en: 'to know / be acquainted' },
    ], answer: ['yindee', 'thi', 'dai', 'rujak'],
  },
});
export const STAGE_8_UNIT_MONTHS = unit({
  unitId: 'stage-8-months', stageId: 8,
  title: 'Months of the year', subtitle: 'January, February, March, April, May, June, July, August.',
  vocabCardIds: [3853, 3807, 3872, 3693, 3876, 3858, 3856, 3695], sentenceCardId: 937, challengeCardIds: [3853, 3872, 3693],
  sentenceBuilder: {
    sourceCardId: 937, prompt: 'Build this Thai sentence', english: 'I will stay for one week (male)', thai: 'ผมจะอยู่หนึ่งอาทิตย์',
    tokens: [
      { id: 'phom', thai: 'ผม', ph: 'phǒm', en: 'I (male)' },
      { id: 'ja', thai: 'จะ', ph: 'jà', en: 'will (future)' },
      { id: 'yu', thai: 'อยู่', ph: 'yùu', en: 'to stay' },
      { id: 'nueng', thai: 'หนึ่ง', ph: 'nèung', en: 'one' },
      { id: 'athit', thai: 'อาทิตย์', ph: 'aa-thít', en: 'week' },
    ], answer: ['phom', 'ja', 'yu', 'nueng', 'athit'],
  },
});
export const STAGE_8_UNIT_DAYS = unit({
  unitId: 'stage-8-days-and-when', stageId: 8,
  title: 'Days and when', subtitle: 'Sunday, Thursday, tomorrow, yesterday, finally, now, soon, then.',
  vocabCardIds: [3975, 3989, 3995, 4029, 2347, 2905, 3961, 2216], sentenceCardId: 898, challengeCardIds: [3975, 3995, 4029],
  sentenceBuilder: {
    sourceCardId: 898, prompt: 'Build this Thai sentence', english: 'See you tomorrow', thai: 'แล้วเจอกันพรุ่งนี้',
    tokens: [
      { id: 'laew', thai: 'แล้ว', ph: 'láew', en: 'then / well' },
      { id: 'jergan', thai: 'เจอกัน', ph: 'jer gan', en: 'see each other' },
      { id: 'phrungnii', thai: 'พรุ่งนี้', ph: 'phrûng níi', en: 'tomorrow' },
    ], answer: ['laew', 'jergan', 'phrungnii'],
  },
});
export const STAGE_8_UNIT_PLACES = unit({
  unitId: 'stage-8-places-in-town', stageId: 8,
  title: 'Places in town', subtitle: 'University, library, museum, office, shop, country, staff, official.',
  vocabCardIds: [1913, 3308, 3441, 3899, 3079, 2415, 2151, 2351], sentenceCardId: 852, challengeCardIds: [1913, 3308, 3441],
  sentenceBuilder: {
    sourceCardId: 852, prompt: 'Build this Thai sentence', english: 'Where is it? (male)', thai: 'อยู่ที่ไหนครับ',
    tokens: [
      { id: 'yu', thai: 'อยู่', ph: 'yùu', en: 'to be (located)' },
      { id: 'thinai', thai: 'ที่ไหน', ph: 'thîi nǎi', en: 'where' },
      { id: 'khrap', thai: 'ครับ', ph: 'khráp', en: 'polite (male)' },
    ], answer: ['yu', 'thinai', 'khrap'],
  },
});
export const STAGE_8_UNIT_DIRECTIONS = unit({
  unitId: 'stage-8-directions-distance', stageId: 8,
  title: 'Directions and distance', subtitle: 'East, west, left, distance, past, alongside, eastward, spacing.',
  vocabCardIds: [2375, 4018, 3864, 3026, 2272, 2951, 3792, 3540], sentenceCardId: 382, challengeCardIds: [2375, 4018, 3864],
  sentenceBuilder: {
    sourceCardId: 382, prompt: 'Build this Thai sentence', english: 'Stop here (male)', thai: 'จอดที่นี่ครับ',
    tokens: [
      { id: 'jot', thai: 'จอด', ph: 'jàwt', en: 'to stop / park' },
      { id: 'thinii', thai: 'ที่นี่', ph: 'thîi nîi', en: 'here' },
      { id: 'khrap', thai: 'ครับ', ph: 'khráp', en: 'polite (male)' },
    ], answer: ['jot', 'thinii', 'khrap'],
  },
});
export const STAGE_8_UNIT_TRAVEL = unit({
  unitId: 'stage-8-travel-and-activities', stageId: 8,
  title: 'Travel and activities', subtitle: 'Tour, travel, swim, exercise, turn to face, exchange, avoid, win.',
  vocabCardIds: [2478, 4004, 3376, 3404, 3496, 2709, 2827, 3042], sentenceCardId: 389, challengeCardIds: [2478, 4004, 3404],
  sentenceBuilder: {
    sourceCardId: 389, prompt: 'Build this Thai sentence', english: 'I am lost (male)', thai: 'ผมหลงทางครับ',
    tokens: [
      { id: 'phom', thai: 'ผม', ph: 'phǒm', en: 'I (male)' },
      { id: 'longthang', thai: 'หลงทาง', ph: 'lǒng thaang', en: 'to be lost' },
      { id: 'khrap', thai: 'ครับ', ph: 'khráp', en: 'polite (male)' },
    ], answer: ['phom', 'longthang', 'khrap'],
  },
});
export const STAGE_8_UNIT_CONNECTORS = unit({
  unitId: 'stage-8-connectors-nuance', stageId: 8,
  title: 'Connectors and nuance', subtitle: 'Only, especially, at least, anyway, besides, from now on, generally, extremely.',
  vocabCardIds: [1656, 1798, 1928, 2317, 2786, 2717, 2979, 2226], sentenceCardId: 433, challengeCardIds: [1656, 1798, 2317],
  sentenceBuilder: {
    sourceCardId: 433, prompt: 'Build this Thai sentence', english: 'Say it again please (male)', thai: 'พูดอีกทีครับ',
    tokens: [
      { id: 'phut', thai: 'พูด', ph: 'phûut', en: 'to speak' },
      { id: 'ikthi', thai: 'อีกที', ph: 'ìik thii', en: 'again / one more time' },
      { id: 'khrap', thai: 'ครับ', ph: 'khráp', en: 'polite (male)' },
    ], answer: ['phut', 'ikthi', 'khrap'],
  },
});
export const STAGE_8_UNIT_HOME = unit({
  unitId: 'stage-8-home-and-documents', stageId: 8,
  title: 'Home and documents', subtitle: 'Living room, house, apartment, password, passport, immigration, credit card, fee.',
  vocabCardIds: [1010, 2939, 5738, 1019, 1113, 1116, 1105, 1124], sentenceCardId: 844, challengeCardIds: [1010, 5738, 1113],
  sentenceBuilder: {
    sourceCardId: 844, prompt: 'Build this Thai sentence', english: 'Where do you live?', thai: 'คุณอยู่ที่ไหน',
    tokens: [
      { id: 'khun', thai: 'คุณ', ph: 'khun', en: 'you' },
      { id: 'yu', thai: 'อยู่', ph: 'yùu', en: 'to live / be at' },
      { id: 'thinai', thai: 'ที่ไหน', ph: 'thîi nǎi', en: 'where' },
    ], answer: ['khun', 'yu', 'thinai'],
  },
});
export const STAGE_8_UNIT_DECISIONS = unit({
  unitId: 'stage-8-decisions-verbs', stageId: 8,
  title: 'Decisions and opinions', subtitle: 'Consider, decide, support, deny, be responsible, analyze, develop, change.',
  vocabCardIds: [1827, 1835, 1987, 2016, 2232, 2332, 1736, 1918], sentenceCardId: 823, challengeCardIds: [1835, 2232, 2332],
  sentenceBuilder: {
    sourceCardId: 823, prompt: 'Build this Thai sentence', english: 'I want to go there (male)', thai: 'ผมอยากไปที่นั่น',
    tokens: [
      { id: 'phom', thai: 'ผม', ph: 'phǒm', en: 'I (male)' },
      { id: 'yak', thai: 'อยาก', ph: 'yàak', en: 'to want to' },
      { id: 'pai', thai: 'ไป', ph: 'bpai', en: 'to go' },
      { id: 'thinan', thai: 'ที่นั่น', ph: 'thîi nân', en: 'there' },
    ], answer: ['phom', 'yak', 'pai', 'thinan'],
  },
});
export const STAGE_8_UNIT_LIKES = unit({
  unitId: 'stage-8-likes-impressions', stageId: 8,
  title: 'Likes and impressions', subtitle: 'Interesting, fun, impressed, honest, fair, creative, modern, independent.',
  vocabCardIds: [2292, 2396, 2783, 2913, 2523, 2512, 2858, 2296], sentenceCardId: 812, challengeCardIds: [2292, 2396, 2783],
  sentenceBuilder: {
    sourceCardId: 812, prompt: 'Build this Thai sentence', english: 'I really like it (male)', thai: 'ผมชอบมากเลย',
    tokens: [
      { id: 'phom', thai: 'ผม', ph: 'phǒm', en: 'I (male)' },
      { id: 'chop', thai: 'ชอบ', ph: 'chôp', en: 'to like' },
      { id: 'mak', thai: 'มาก', ph: 'mâak', en: 'very / a lot' },
      { id: 'loei', thai: 'เลย', ph: 'loei', en: '(emphasis)' },
    ], answer: ['phom', 'chop', 'mak', 'loei'],
  },
});
export const STAGE_8_UNIT_SOCIETY = unit({
  unitId: 'stage-8-society-and-ideas', stageId: 8,
  title: 'Society and ideas', subtitle: 'Sacred, conserve, harmony, public, hardship, complex, strange, progressive.',
  vocabCardIds: [2772, 2743, 3159, 2530, 2989, 3090, 3142, 2609], sentenceCardId: 955, challengeCardIds: [2772, 3159, 3090],
  sentenceBuilder: {
    sourceCardId: 955, prompt: 'Build this Thai sentence', english: 'Thai people are very kind', thai: 'คนไทยใจดีมาก',
    tokens: [
      { id: 'khonthai', thai: 'คนไทย', ph: 'khon thai', en: 'Thai people' },
      { id: 'jaidee', thai: 'ใจดี', ph: 'jai dee', en: 'kind' },
      { id: 'mak', thai: 'มาก', ph: 'mâak', en: 'very' },
    ], answer: ['khonthai', 'jaidee', 'mak'],
  },
});

// Full guided path. Stage 1 first; each stage's units are in sequence order.
export const MINI_UNITS = [
  STAGE_1_MINI_UNIT_PILOT,
  STAGE_1_UNIT_GREETINGS,
  STAGE_1_UNIT_YESNO,
  STAGE_1_UNIT_WHERE,
  STAGE_1_UNIT_PRICES,
  STAGE_2_UNIT_ACTIONS,
  STAGE_2_UNIT_DOING,
  STAGE_2_UNIT_TALK,
  STAGE_2_UNIT_AROUND,
  STAGE_2_UNIT_DAILY2,
  STAGE_2_UNIT_SIZES,
  STAGE_2_UNIT_QUALITIES,
  STAGE_2_UNIT_FEELINGS,
  STAGE_2_UNIT_NUMBERS,
  STAGE_2_UNIT_CONNECTORS,
  STAGE_3_UNIT_DAILY,
  STAGE_3_UNIT_DESCRIBE,
  STAGE_3_UNIT_PEOPLE,
  STAGE_3_UNIT_VERBS1,
  STAGE_3_UNIT_VERBS2,
  STAGE_3_UNIT_VERBS3,
  STAGE_3_UNIT_DESCRIBE2,
  STAGE_3_UNIT_QUALITIES,
  STAGE_3_UNIT_TIME,
  STAGE_3_UNIT_CONNECTORS,
  STAGE_3_UNIT_HOME,
  STAGE_3_UNIT_ANIMALS,
  STAGE_4_UNIT_TRAVEL,
  STAGE_4_UNIT_TASTE,
  STAGE_4_UNIT_SMALLTALK,
  STAGE_4_UNIT_PLANS,
  STAGE_4_UNIT_OUT,
  STAGE_4_UNIT_DIRECTIONS,
  STAGE_4_UNIT_FEELINGS,
  STAGE_4_UNIT_SAYING,
  STAGE_4_UNIT_VERBS1,
  STAGE_4_UNIT_HOME,
  STAGE_4_UNIT_VERBS2,
  STAGE_4_UNIT_STATES,
  STAGE_4_UNIT_LEAVING,
  STAGE_4_UNIT_FOOD,
  STAGE_5_UNIT_VERBS,
  STAGE_5_UNIT_DESCRIBE,
  STAGE_5_UNIT_PEOPLE,
  STAGE_5_UNIT_EMOTIONS,
  STAGE_5_UNIT_HEALTH,
  STAGE_5_UNIT_WEATHER,
  STAGE_5_UNIT_TIME,
  STAGE_5_UNIT_FOOD,
  STAGE_5_UNIT_MONEY,
  STAGE_5_UNIT_REQUESTS,
  STAGE_5_UNIT_COMPLIMENTS,
  STAGE_5_UNIT_TOWN,
  STAGE_5_UNIT_WANTS,
  STAGE_5_UNIT_VERBS2,
  STAGE_6_UNIT_WANTS,
  STAGE_6_UNIT_HEALTH,
  STAGE_6_UNIT_PEOPLE,
  STAGE_6_UNIT_DAYS,
  STAGE_6_UNIT_TIMES,
  STAGE_6_UNIT_RESTAURANT,
  STAGE_6_UNIT_HOME,
  STAGE_6_UNIT_TOWN,
  STAGE_6_UNIT_BANKING,
  STAGE_6_UNIT_EMOTIONS,
  STAGE_6_UNIT_LEARNING,
  STAGE_6_UNIT_VERBS,
  STAGE_6_UNIT_COMM,
  STAGE_6_UNIT_QUALITIES,
  STAGE_7_UNIT_FOOD,
  STAGE_7_UNIT_VERBS,
  STAGE_7_UNIT_PLACES,
  STAGE_7_UNIT_DIRECTIONS,
  STAGE_7_UNIT_TALKING,
  STAGE_7_UNIT_MEETING,
  STAGE_7_UNIT_FLOW,
  STAGE_7_UNIT_FEELINGS,
  STAGE_7_UNIT_TIMESOFDAY,
  STAGE_7_UNIT_SCHEDULE,
  STAGE_7_UNIT_DINING,
  STAGE_7_UNIT_ACTIONS,
  STAGE_7_UNIT_QUALITIES,
  STAGE_7_UNIT_NATURE,
  STAGE_8_UNIT_OUT,
  STAGE_8_UNIT_PEOPLE,
  STAGE_8_UNIT_PRONOUNS,
  STAGE_8_UNIT_MONTHS,
  STAGE_8_UNIT_DAYS,
  STAGE_8_UNIT_PLACES,
  STAGE_8_UNIT_DIRECTIONS,
  STAGE_8_UNIT_TRAVEL,
  STAGE_8_UNIT_CONNECTORS,
  STAGE_8_UNIT_HOME,
  STAGE_8_UNIT_DECISIONS,
  STAGE_8_UNIT_LIKES,
  STAGE_8_UNIT_SOCIETY,
];

export function getMiniUnit(unitId) {
  return MINI_UNITS.find(unit => unit.unitId === unitId) || null;
}

export function getMiniUnitsForStage(stageId) {
  return MINI_UNITS.filter(unit => (unit.stageId || 1) === stageId);
}
