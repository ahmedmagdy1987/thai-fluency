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
  STAGE_5_UNIT_VERBS,
  STAGE_5_UNIT_DESCRIBE,
  STAGE_6_UNIT_WANTS,
  STAGE_6_UNIT_HEALTH,
  STAGE_7_UNIT_FOOD,
  STAGE_7_UNIT_VERBS,
  STAGE_8_UNIT_OUT,
];

export function getMiniUnit(unitId) {
  return MINI_UNITS.find(unit => unit.unitId === unitId) || null;
}

export function getMiniUnitsForStage(stageId) {
  return MINI_UNITS.filter(unit => (unit.stageId || 1) === stageId);
}
