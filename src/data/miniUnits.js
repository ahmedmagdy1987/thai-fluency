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
    english: 'My name is ___ (male)',
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

  // ── First-lesson pedagogy metadata (PILOT: Stage 1 Mission 1 only) ────────
  // These three optional fields drive the Thai Basics Primer, the short primer
  // quiz, and the motivational mission recap in FirstLessonFlow. They are
  // intentionally data-driven and extensible: a future sprint can add the same
  // shape to other units, but ONLY this pilot unit fills them today. No new Thai
  // content is invented — every Thai string below already appears in the cards
  // this unit teaches (สวัสดี 3396, ผม 1, ครับ 2, ชื่อ 1661, ใช่ 251, ไม่ 250,
  // ขอบคุณ 2815, and sentence 330 'ผมชื่อ ___ ครับ'). ไม่/ไหม wording mirrors the
  // verified note already on card 250. See docs/first-lesson-pedagogy-notes.md.
  lessonPrimer: {
    title: 'Before your first Thai words',
    subtitle: 'Thai works differently from English. These quick rules make the first lesson easier.',
    readMinutes: 2,
    // Beginner guidance is romanization-first (the app does not teach Thai
    // reading yet); Thai script stays in parentheses as a secondary reference.
    sections: [
      {
        heading: 'Thai has two speaking styles',
        body: 'Thai changes a little depending on who is speaking. Male speakers often end polite sentences with khráp (ครับ). Female speakers often use khâ (ค่ะ). You can pick your speaking style on the lesson screen or in Settings, and change it anytime.',
      },
      {
        heading: 'Saying "I"',
        body: 'A male speaker commonly says phǒm (ผม) for "I". A female speaker commonly says chăn (ฉัน). Your speaking style picks the form you practice, and you will see it in your first introduction sentence.',
      },
      {
        heading: 'The polite ending',
        body: 'khráp (ครับ) and khâ (ค่ะ) are not words with their own meaning. They make a sentence sound polite. A male speaker ends many sentences with khráp (ครับ), and a female speaker with khâ (ค่ะ).',
      },
      {
        heading: 'Word order can feel different',
        body: 'In Thai, a describing word often comes after the thing it describes. So some Thai phrases are built in a different order than English. Do not worry about the grammar yet.',
      },
      {
        heading: 'Asking yes or no',
        body: 'Thai often turns a sentence into a yes/no question with a small question word near the end, mǎi (ไหม). You do not add a spoken question mark the way English does.',
      },
      {
        heading: '"Not" is a different word',
        body: 'mâi (ไม่) means "not" and usually comes before the word it makes negative. This is NOT the same as the question word mǎi (ไหม). They sound similar in romanization, but they are written differently in Thai script and behave differently.',
      },
      {
        heading: 'Thai has tones',
        body: 'Thai is a tonal language: the pitch of a syllable is part of the word. At the start, just listen to the audio and copy the rhythm. The app will help you.',
      },
    ],
  },

  pedagogyQuiz: {
    title: 'Quick check',
    subtitle: 'Five fast questions. No pressure, this just warms you up.',
    questions: [
      {
        id: 'polite-particle',
        prompt: 'In this first path, which polite word does a male speaker add at the end of sentences?',
        options: [
          { id: 'a', label: 'khráp (ครับ)', correct: true },
          { id: 'b', label: 'khâ (ค่ะ)' },
          { id: 'c', label: 'mâi (ไม่)' },
        ],
        explain: 'Male speakers use khráp (ครับ). Female speakers use khâ (ค่ะ).',
      },
      {
        id: 'phom-meaning',
        prompt: 'What does phǒm (ผม) usually mean in this lesson?',
        options: [
          { id: 'a', label: '"I", from a male speaker', correct: true },
          { id: 'b', label: '"you"' },
          { id: 'c', label: '"name"' },
        ],
        explain: 'phǒm (ผม) is a common way for a male speaker to say "I".',
      },
      {
        id: 'mai-not',
        prompt: 'Which word means "not" (it makes something negative)?',
        options: [
          { id: 'a', label: 'mâi (ไม่)', correct: true },
          { id: 'b', label: 'mǎi (ไหม)' },
          { id: 'c', label: 'khráp (ครับ)' },
        ],
        explain: 'mâi (ไม่) means "not" and usually comes before the word it makes negative.',
      },
      {
        id: 'mai-question',
        prompt: 'Which word can turn a sentence into a yes or no question?',
        options: [
          { id: 'a', label: 'mǎi (ไหม)', correct: true },
          { id: 'b', label: 'mâi (ไม่)' },
          { id: 'c', label: 'phǒm (ผม)' },
        ],
        explain: 'mǎi (ไหม) is a question word, often near the end of a sentence. It is different from mâi (ไม่), which is written differently in Thai script.',
      },
      {
        id: 'tones-first',
        prompt: 'What should you do first with Thai tones?',
        options: [
          { id: 'a', label: 'Listen and copy the rhythm', correct: true },
          { id: 'b', label: 'Memorize every tone rule first' },
          { id: 'c', label: 'Skip the audio' },
        ],
        explain: 'At the start, listen to the audio and copy the rhythm. The tone rules come later.',
      },
    ],
  },

  missionRecap: {
    headline: 'Nice. You can start a polite introduction in Thai.',
    lead: 'You are not memorizing random words. You are building your first real Thai introduction.',
    achievements: [
      'Greet politely: sà-wàt-dee khráp (สวัสดีครับ)',
      'Introduce yourself: phǒm chûe ___ khráp (my name is ___)',
      'Recognize the polite ending khráp (ครับ)',
      'Notice how Thai builds short sentences',
      'Listen and repeat Thai sounds',
    ],
    footnote: 'This is a strong first step. Keep going to add more.',
  },

  // Shown on REPLAY via MiniUnitFlow (the first-time flow uses the full primer
  // above). FirstLessonFlow ignores lessonIntro, so Mission 1's first impression
  // is unchanged. Thai here is only words this unit already teaches.
  lessonIntro: {
    lead: 'This is your first real Thai conversation: a polite hello and your own name. Short, friendly, and useful from day one.',
    points: [
      { label: 'You will learn', text: 'How to greet someone and introduce yourself, using sà-wàt-dee (สวัสดี, hello), phǒm (ผม, the word for I), chûe (ชื่อ, name), and the polite word khráp (ครับ).' },
      { label: 'Why it matters', text: 'A warm, polite hello and your name open almost any conversation in Thailand, from a shop to a new friend.' },
      { label: 'Listen for', text: 'The polite ending khráp (ครับ) at the end of almost every sentence.' },
      { label: 'Notice', text: 'Thai builds the sentence phǒm chûe ___ khráp (ผมชื่อ ___ ครับ) one clear piece at a time. You are arranging real words, not memorizing a block.' },
    ],
  },
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
    '"No worries" (mâi-bpen-rai, ไม่เป็นไร) softens almost any situation.',
    'Add khráp (ครับ) to stay polite (male form).',
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
  lessonIntro: {
    lead: 'A handful of courtesy words covers most first encounters: hello, thank you, and the famous Thai "no worries".',
    points: [
      { label: 'You will learn', text: 'Everyday politeness: sà-wàt-dee (สวัสดี, hello), kòp kun (ขอบคุณ, thanks), the phrase mâi-bpen-rai (ไม่เป็นไร, no worries), and jer gan (เจอกัน, see you).' },
      { label: 'Why it matters', text: 'Thai people notice politeness right away. A few kind words make daily moments smoother and friendlier.' },
      { label: 'Listen for', text: 'The soft phrase mâi-bpen-rai (ไม่เป็นไร), which can mean "no worries", "you are welcome", or "never mind".' },
      { label: 'Notice', text: 'Adding khráp (ครับ) to the end keeps a male speaker polite, just like in your first lesson.' },
    ],
  },
  missionRecap: {
    headline: 'Nice. You can be polite in everyday Thai moments.',
    lead: 'You are building real travel Thai, one small courtesy at a time.',
    achievements: [
      'Greet someone with sà-wàt-dee (สวัสดี)',
      'Say thank you with kòp kun (ขอบคุณ)',
      'Smooth things over with mâi-bpen-rai (ไม่เป็นไร)',
      'Say see you with jer gan (เจอกัน)',
      'Keep it polite with khráp (ครับ)',
    ],
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
    'châi (ใช่) = yes, mâi (ไม่) = no, mâi châi (ไม่ใช่) = "that\'s not it".',
    'rěr (เหรอ) is a casual "really?" to keep a chat going.',
    'khráp (ครับ) or khâ (ค่ะ) keep your replies polite.',
  ],
  previewText: [
    'Combine these with the courtesy words for natural replies.',
    'Politeness particles change with male/female speakers.',
  ],
  // sentenceBuilder intentionally omitted (see comment above).
  lessonIntro: {
    lead: 'A few reply words let you respond to almost anything: yes, no, "that is not it", and a casual "really?".',
    points: [
      { label: 'You will learn', text: 'Simple answers: châi (ใช่, yes), mâi (ไม่, no), mâi châi (ไม่ใช่, that is not it), and rěr (เหรอ, really?) to keep a chat going.' },
      { label: 'Why it matters', text: 'Answering clearly, even with one word, keeps a conversation moving and friendly.' },
      { label: 'Listen for', text: 'The short word mâi (ไม่, not) at the start of a negative answer, and how mâi châi (ไม่ใช่) means "that is not it".' },
      { label: 'Notice', text: 'châi and mâi are tiny but powerful. Add khráp (ครับ) or khâ (ค่ะ) to keep your reply polite.' },
    ],
  },
  missionRecap: {
    headline: 'Nice. You can answer simple questions politely.',
    lead: 'Short replies keep a real conversation going.',
    achievements: [
      'Say yes with châi (ใช่)',
      'Say no with mâi (ไม่)',
      'Correct gently with mâi châi (ไม่ใช่)',
      'React naturally with rěr (เหรอ, really?)',
      'Stay polite with khráp (ครับ) or khâ (ค่ะ)',
    ],
  },
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
    'thîi nǎi (ที่ไหน) = where, yùu (อยู่) = to be located.',
    'hông náam yùu thîi nǎi (ห้องน้ำอยู่ที่ไหน) asks where the bathroom is.',
    'bpai / maa (ไป / มา, go / come) help you move around.',
  ],
  previewText: [
    'Swap hông náam (ห้องน้ำ, bathroom) for other places to ask where they are.',
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
  lessonIntro: {
    lead: 'Asking "where" is one of the most useful survival skills, starting with the bathroom.',
    points: [
      { label: 'You will learn', text: 'How to ask where something is: thîi nǎi (ที่ไหน, where), yùu (อยู่, to be located), and the example hông náam yùu thîi nǎi (ห้องน้ำอยู่ที่ไหน, where is the bathroom).' },
      { label: 'Why it matters', text: 'You will need to find places fast: a toilet, an exit, a shop. This question gets you there.' },
      { label: 'Listen for', text: 'The question word thîi nǎi (ที่ไหน, where), which comes near the end of the question.' },
      { label: 'Notice', text: 'You can swap hông náam (ห้องน้ำ, bathroom) for another place to ask where that is. One pattern, many uses.' },
    ],
  },
  missionRecap: {
    headline: 'Nice. You can ask where things are.',
    lead: 'This one question will help you find your way around.',
    achievements: [
      'Ask where with thîi nǎi (ที่ไหน)',
      'Find a bathroom with hông náam yùu thîi nǎi (ห้องน้ำอยู่ที่ไหน)',
      'Talk about being located with yùu (อยู่)',
      'Reuse the pattern for any place',
      'Ask politely with khráp (ครับ)',
    ],
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
  introText: 'Prices come up everywhere: markets, taxis, shops.',
  recapText: [
    'thâo rài (เท่าไหร่) = how much, ngern (เงิน) = money.',
    'thùuk (ถูก) = cheap, phaeng (แพง) = expensive, lóht (ลด) = reduce (discount).',
    'annǐi thâo rài (อันนี้เท่าไหร่) asks the price of this one.',
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
  lessonIntro: {
    lead: 'Money comes up everywhere: markets, taxis, and shops. Here you learn to ask a price and understand the answer.',
    points: [
      { label: 'You will learn', text: 'How to ask the cost: thâo rài (เท่าไหร่, how much), ngern (เงิน, money), and the example annǐi thâo rài (อันนี้เท่าไหร่, how much is this).' },
      { label: 'Why it matters', text: 'Asking a price, and telling cheap from expensive, helps you shop with confidence.' },
      { label: 'Listen for', text: 'The question word thâo rài (เท่าไหร่, how much), plus thùuk (ถูก, cheap) and phaeng (แพง, expensive).' },
      { label: 'Notice', text: 'Add khráp (ครับ) to ask politely. annǐi thâo rài khráp (อันนี้เท่าไหร่ครับ) is a complete, polite question you can use today.' },
    ],
  },
  missionRecap: {
    headline: 'Nice. You can ask prices and talk money.',
    lead: 'You can shop and ask how much with confidence.',
    achievements: [
      'Ask the price with thâo rài (เท่าไหร่)',
      'Ask about this one with annǐi thâo rài (อันนี้เท่าไหร่)',
      'Talk money with ngern (เงิน)',
      'Tell cheap (thùuk, ถูก) from expensive (phaeng, แพง)',
      'Ask politely with khráp (ครับ)',
    ],
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
  lessonIntro: {
    lead: 'This mission gives you a handful of everyday action words, the verbs you reach for all day long. By the end you can say one of the warmest sentences in Thai, ผมรักคุณ, which means I love you.',
    points: [
      { label: 'You will learn', text: 'Common action verbs like ดื่ม (drink), ซื้อ (buy), ทำงาน (work), and เดิน (walk), along with เปิด and ปิด, which cover open and close as well as turn on and turn off.' },
      { label: 'Why it matters', text: 'Verbs are the engine of every sentence. Once you can name a few everyday actions, you have the building blocks you need for simple sentences about what people do.' },
      { label: 'Listen for', text: 'The pair เปิด (open) and ปิด (close). They sound similar, so listen closely for the small difference in the vowel sound between them.' },
      { label: 'Notice', text: 'Thai keeps verbs simple. The word does not change for I, you, or someone else. ผมรักคุณ is just I, then love, then you, placed in that order.' },
    ],
  },
  missionRecap: {
    headline: 'Nice. You can name the actions you do every day.',
    lead: 'You are turning single words into things you can actually do and say in Thai.',
    achievements: [
      'Use everyday verbs like ดื่ม (drink), ซื้อ (buy), and ทำงาน (work)',
      'Open and close things with เปิด and ปิด',
      'Say the warm sentence ผมรักคุณ (I love you)',
      'Put a simple I plus verb plus you sentence in the right order',
    ],
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
  lessonIntro: {
    lead: 'Here you pick up more action verbs for getting things done, plus your first easy way to say that you do not like something. You will build the sentence ผมไม่ชอบ, which means I do not like it.',
    points: [
      { label: 'You will learn', text: 'Useful verbs such as ส่ง (send), หยุด (stop), ออก (leave or exit), and ขึ้น (go up or get on), and how the word ไม่ turns a verb negative.' },
      { label: 'Why it matters', text: 'These verbs come up all the time when you are out and about, and saying clearly that something is not for you with ผมไม่ชอบ is a handy, confident first step.' },
      { label: 'Listen for', text: 'The short word ไม่ (not) right before a verb. In ผมไม่ชอบ it sits between I and like, and it flips the meaning of the sentence.' },
      { label: 'Notice', text: 'To make something negative, Thai simply puts ไม่ in front of the verb. The rest of the sentence stays the same, so one small word does all the work.' },
    ],
  },
  missionRecap: {
    headline: 'Nice. You can take action and say no.',
    lead: 'You can move through everyday situations and clearly say when something is not for you.',
    achievements: [
      'Use action verbs like ส่ง (send), หยุด (stop), and ออก (leave)',
      'Say you do not like something with ผมไม่ชอบ',
      'Use ไม่ to make a verb negative',
      'Handle small moments like stopping or getting on',
    ],
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
  lessonIntro: {
    lead: 'This mission is about talking and thinking, the verbs you use when you chat, guess, or hope. You will also learn an honest and very handy phrase, ผมไม่รู้, which means I do not know.',
    points: [
      { label: 'You will learn', text: 'Verbs for conversation and the mind, like คุย (chat), นึก (think), เดา (guess), and หวัง (hope), plus the sentence ผมไม่รู้ (I do not know).' },
      { label: 'Why it matters', text: 'Real conversations are full of guessing and of not knowing. Being able to say I do not know keeps a chat moving instead of leaving you stuck and silent.' },
      { label: 'Listen for', text: 'Once again the word ไม่ (not), this time inside ผมไม่รู้. Notice how it comes right before รู้, the word for to know.' },
      { label: 'Notice', text: 'You are reusing the same pattern from the last mission, I plus ไม่ plus a verb. One small structure already covers many honest, everyday replies.' },
    ],
  },
  missionRecap: {
    headline: 'Nice. You can talk about thinking and not knowing.',
    lead: 'You can keep a friendly chat going, even in the moments when you are not sure.',
    achievements: [
      'Use conversation verbs like คุย (chat) and เดา (guess)',
      'Talk about hoping with หวัง',
      'Say ผมไม่รู้ (I do not know) when you are unsure',
      'Reuse the I plus not plus verb pattern',
    ],
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
  lessonIntro: {
    lead: 'Now you head out and about with everyday verbs for moving around and handling things, plus a friendly question you will hear a lot, ไปไหนมา, which means where did you go.',
    points: [
      { label: 'You will learn', text: 'Action words like จอด (park), ยืม (borrow), วาง (lay), and เล่น (play), plus the casual question ไปไหนมา (where did you go).' },
      { label: 'Why it matters', text: 'These cover small daily moments such as parking, borrowing, and putting things down, plus the kind of question that friends ask each other all the time.' },
      { label: 'Listen for', text: 'The question word ไหน (where) inside ไปไหนมา. It sits neatly between ไป (go) and มา (come), so the whole question flows together as one short, smooth phrase.' },
      { label: 'Notice', text: 'ไปไหนมา is built from just three tiny words, go, where, and come. Short pieces like these stack together into a real, natural question.' },
    ],
  },
  missionRecap: {
    headline: 'Nice. You can get out and ask where someone has been.',
    lead: 'You can talk about moving around and start a friendly catch up with someone.',
    achievements: [
      'Use everyday verbs like จอด (park), ยืม (borrow), and เล่น (play)',
      'Ask ไปไหนมา (where did you go)',
      'Hear the question word ไหน (where) inside a sentence',
      'Build a short question from go, where, and come',
    ],
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
  lessonIntro: {
    lead: 'This mission adds another set of everyday verbs, from saving and waiting to eating, plus a short, encouraging phrase, ทำไปเลย, which means go ahead and do it.',
    points: [
      { label: 'You will learn', text: 'Useful verbs like เก็บ (save), คอย (wait), and ทาน (eat), plus the friendly phrase ทำไปเลย (go ahead and do it).' },
      { label: 'Why it matters', text: 'Waiting, keeping things, and eating come up every single day. A phrase like go ahead also helps you sound relaxed and natural when you are with friends.' },
      { label: 'Listen for', text: 'The little word เลย at the end of ทำไปเลย. It adds a go on, do it feeling to the whole sentence.' },
      { label: 'Notice', text: 'Thai often ends a sentence with a small word that adds a feeling. Here เลย gives a gentle push, without changing the main verb ทำ, the word for do.' },
    ],
  },
  missionRecap: {
    headline: 'Nice. You can talk about daily actions and cheer someone on.',
    lead: 'You can describe more of what you do and encourage a friend to go for it.',
    achievements: [
      'Use verbs like เก็บ (save), คอย (wait), and ทาน (eat)',
      'Encourage someone with ทำไปเลย (go ahead and do it)',
      'Hear how เลย adds feeling at the end of a sentence',
      'Keep the main verb simple while adding a friendly tone',
    ],
  },
});
export const STAGE_2_UNIT_SIZES = unit({
  unitId: 'stage-2-sizes-and-speeds', stageId: 2,
  title: 'Sizes and speeds', subtitle: 'Small, cool, fast, slow, thick, a little, large, every.',
  vocabCardIds: [63, 65, 78, 79, 2923, 2737, 1833, 1622], challengeCardIds: [63, 78, 79],
  // No sentenceBuilder: Stage 2 adjective sentences are 2 tokens (too short).
  lessonIntro: {
    lead: 'This mission moves from action words to describing words. It gives you a small, handy set of adjectives for talking about size and speed in everyday life.',
    points: [
      { label: 'You will learn', text: 'Describing words like เล็ก (small) and โต (large), เร็ว (fast) and ช้า (slow), plus เย็น (cool) and นิด (a little bit).' },
      { label: 'Why it matters', text: 'Sizes and speeds come up when you order food, shop, or ask a driver to slow down. A few clear adjectives make your meaning land right away.' },
      { label: 'Listen for', text: 'Pairs that are opposites, like เร็ว (fast) and ช้า (slow). Learning two opposites together makes each one much easier to remember.' },
      { label: 'Notice', text: 'The word เย็น can mean cool, as in a cold drink, and it is also the word for evening. The situation around you tells you which meaning fits.' },
    ],
  },
  missionRecap: {
    headline: 'Nice. You can describe size and speed.',
    lead: 'You can make your meaning clearer by saying how big or how fast something is.',
    achievements: [
      'Describe size with เล็ก (small) and โต (large)',
      'Describe speed with เร็ว (fast) and ช้า (slow)',
      'Ask for just a little with นิด',
      'Remember that เย็น can mean cool or evening',
    ],
  },
});
export const STAGE_2_UNIT_QUALITIES = unit({
  unitId: 'stage-2-skills-and-qualities', stageId: 2,
  title: 'Skills and qualities', subtitle: 'Skilled, done, sure, rich, used to it, gone, most, all.',
  vocabCardIds: [77, 1973, 2235, 5715, 3012, 2014, 1982, 1762], sentenceCardId: 5228, challengeCardIds: [77, 2235, 5715],
  lessonIntro: {
    lead: 'This mission gives you words for skills and qualities, and one of the nicest little compliments in Thai, เก่งมาก, which means very good or nice job.',
    points: [
      { label: 'You will learn', text: 'Describing words like เก่ง (skilled), เสร็จ (done or finished), แน่ (sure), and รวย (rich), plus the warm compliment เก่งมาก (very good).' },
      { label: 'Why it matters', text: 'Telling someone they did well, or saying that you are sure or already finished, makes everyday talk warmer, kinder, and much clearer. A kind word is always remembered.' },
      { label: 'Listen for', text: 'The word มาก (very) right after เก่ง. Thai often puts มาก after a describing word to make it stronger, much like stressing a word in English.' },
      { label: 'Notice', text: 'เก่งมาก is simply skilled plus very. You will hear the same pattern, a word plus มาก, in many other compliments and descriptions.' },
    ],
  },
  missionRecap: {
    headline: 'Nice. You can describe skills and give a compliment.',
    lead: 'You can tell someone they did a great job and talk about being sure or finished.',
    achievements: [
      'Describe qualities with เก่ง (skilled) and แน่ (sure)',
      'Say you are finished with เสร็จ',
      'Give the compliment เก่งมาก (very good)',
      'Use มาก (very) to make a describing word stronger',
    ],
  },
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
  lessonIntro: {
    lead: 'This mission is about feelings, the words for how you feel inside, from a little afraid to genuinely happy. You will also build a useful daily sentence, ผมหิวครับ, which means I am hungry.',
    points: [
      { label: 'You will learn', text: 'Feeling words like กลัว (afraid), อาย (shy), and สุข (happiness), plus the polite sentence ผมหิวครับ (I am hungry).' },
      { label: 'Why it matters', text: 'Being able to share how you feel, even in a simple way, helps people understand you and look after you. Saying you are hungry is a friendly, easy place to start.' },
      { label: 'Listen for', text: 'The polite ending ครับ at the end of ผมหิวครับ, the same male polite word you met in your very first lessons.' },
      { label: 'Notice', text: 'The sentence is just I, then the word for what you are feeling or needing, then the polite word ครับ. It is short and clear, with no extra grammar to worry about yet.' },
    ],
  },
  missionRecap: {
    headline: 'Nice. You can talk about how you feel.',
    lead: 'You can share simple feelings and politely tell someone when you are hungry.',
    achievements: [
      'Name feelings like กลัว (afraid) and อาย (shy)',
      'Talk about happiness with สุข',
      'Say ผมหิวครับ (I am hungry) politely',
      'Use the polite ending ครับ once again',
    ],
  },
});
export const STAGE_2_UNIT_NUMBERS = unit({
  unitId: 'stage-2-counting', stageId: 2,
  title: 'Counting', subtitle: 'Three, four, six, seven, ten, thousand.',
  vocabCardIds: [232, 233, 235, 236, 239, 241], challengeCardIds: [232, 233, 239],
  // No sentenceCard/builder: Stage 2 has no clean number sentence to tokenize.
  lessonIntro: {
    lead: 'This mission adds more numbers to the ones you already know. With them you can count further and start to recognize prices, room numbers, and amounts that people say to you.',
    points: [
      { label: 'You will learn', text: 'Numbers including สาม (three), สี่ (four), หก (six), เจ็ด (seven), สิบ (ten), and พัน (one thousand), each one a word you will use often.' },
      { label: 'Why it matters', text: 'Numbers are everywhere, on menus, on signs, and whenever someone tells you an amount. Knowing more of them helps you follow what you hear and reply with confidence.' },
      { label: 'Listen for', text: 'The word สิบ (ten). In Thai, ten helps build many of the larger numbers that you will meet in later lessons.' },
      { label: 'Notice', text: 'These numbers join the ones from earlier stages. Little by little your counting reaches higher, and you will not need any new tricks to get there.' },
    ],
  },
  missionRecap: {
    headline: 'Nice. You can count with more numbers.',
    lead: 'You can recognize and say more of the numbers you meet every day.',
    achievements: [
      'Count with สาม (three), สี่ (four), and หก (six)',
      'Say เจ็ด (seven) and สิบ (ten)',
      'Reach bigger amounts with พัน (one thousand)',
      'Add these to the numbers you already knew',
    ],
  },
});
export const STAGE_2_UNIT_CONNECTORS = unit({
  unitId: 'stage-2-connectors-questions', stageId: 2,
  title: 'Connectors and questions', subtitle: 'Must, with, or, let\'s, "right?", "and you?", is, from.',
  vocabCardIds: [256, 291, 292, 4038, 5704, 1275, 1625, 1598], sentenceCardId: 857, challengeCardIds: [256, 292, 5704],
  lessonIntro: {
    lead: 'This mission gives you small but powerful words that join your ideas together and turn sentences into questions. You will also meet a short, common question, ใครครับ, which means who.',
    points: [
      { label: 'You will learn', text: 'Connecting words like กับ (with), หรือ (or), and จาก (from), the casual question word มั้ย, and ล่ะ, which is used for and you.' },
      { label: 'Why it matters', text: 'These little words glue your sentences together and let you ask simple questions. They make short replies feel natural and warm instead of choppy.' },
      { label: 'Listen for', text: 'The word มั้ย at the very end of a sentence. In casual, everyday speech it turns a plain statement into a yes or no question.' },
      { label: 'Notice', text: 'มั้ย is a casual question word that goes at the end of a sentence. It is different from the word that means not, even though the two can look similar when written in English letters.' },
    ],
  },
  missionRecap: {
    headline: 'Nice. You can join ideas and ask simple questions.',
    lead: 'You can connect your words together and turn a sentence into a question.',
    achievements: [
      'Join ideas with กับ (with), หรือ (or), and จาก (from)',
      'Ask a yes or no question with มั้ย',
      'Ask and you with ล่ะ',
      'Ask who with ใครครับ',
    ],
  },
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
  lessonIntro: {
    lead: 'Stage 3 moves you into more useful daily Thai. This first mission teaches everyday action verbs you will reach for constantly, and shows you how to say what you want with ผมอยากนอน, which means I want to sleep.',
    points: [
      { label: 'You will learn', text: 'Common daily verbs like จ่าย (pay), นั่ง (sit), ยืน (stand), ใช้ (use), เรียน (study), and ถาม (ask), plus the sentence ผมอยากนอน (I want to sleep).' },
      { label: 'Why it matters', text: 'These are the actions that fill an ordinary day. Paying, sitting, studying, and asking questions come up everywhere you go, from a shop to a classroom.' },
      { label: 'Listen for', text: 'The word อยาก (want to) right before a verb. In ผมอยากนอน it sits between I and sleep to say what you would like to do.' },
      { label: 'Notice', text: 'To say you want to do something, Thai puts อยาก in front of the verb. You can swap นอน (sleep) for another action to talk about what you want.' },
    ],
  },
  missionRecap: {
    headline: 'Nice. You can name the actions of a daily routine.',
    lead: 'You are building the everyday verbs that carry a normal day in Thai.',
    achievements: [
      'Use daily verbs like จ่าย (pay), นั่ง (sit), and เรียน (study)',
      'Ask a question with ถาม',
      'Say what you want with ผมอยากนอน (I want to sleep)',
      'Use อยาก before a verb to express a wish',
    ],
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
  lessonIntro: {
    lead: 'This mission gives you a useful set of describing words for the everyday things around you, plus an easy and polite way to say how you feel right now with ผมร้อนครับ, which means I am hot.',
    points: [
      { label: 'You will learn', text: 'Describing words like ใหญ่ (big), ร้อน (hot), ใหม่ (new), ง่าย (easy), and ยาก (difficult), plus the polite sentence ผมร้อนครับ (I am hot).' },
      { label: 'Why it matters', text: 'Describing words let you say how something is: too hot, too big, too new, easy, or difficult. They make your meaning clear in shops, at home, and in everyday conversations, so the people around you understand exactly what you mean.' },
      { label: 'Listen for', text: 'The opposite pair ง่าย (easy) and ยาก (difficult). Learning two opposites together makes each one easier to remember.' },
      { label: 'Notice', text: 'ผมร้อนครับ is just I, then how you are, then the polite word ครับ. You can swap ร้อน (hot) for another describing word.' },
    ],
  },
  missionRecap: {
    headline: 'Nice. You can describe how things are.',
    lead: 'You can say how something looks or feels in simple, clear Thai.',
    achievements: [
      'Describe things with ใหญ่ (big), ร้อน (hot), and ใหม่ (new)',
      'Tell easy (ง่าย) from difficult (ยาก)',
      'Say ผมร้อนครับ (I am hot) politely',
      'Reuse the I plus describing word plus ครับ pattern',
    ],
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
  lessonIntro: {
    lead: 'This mission is about the people closest to you, your family and your friends, plus one of the friendliest and warmest questions in Thai, คุณชื่ออะไร, which means what is your name.',
    points: [
      { label: 'You will learn', text: 'Family and people words like พ่อ (father), แม่ (mother), เพื่อน (friend), and หมอ (doctor), plus the question คุณชื่ออะไร (what is your name).' },
      { label: 'Why it matters', text: 'Talking about family and asking someone their name are warm, natural ways to start a conversation, break the ice, and get to know new people. Family and names are easy, friendly topics, so these words go a long way.' },
      { label: 'Listen for', text: 'The question word อะไร (what) at the end of คุณชื่ออะไร. Thai often places the question word near the end of the sentence.' },
      { label: 'Notice', text: 'คุณชื่ออะไร is built from three small words, you, name, and what. You can use it to ask almost anyone their name.' },
    ],
  },
  missionRecap: {
    headline: 'Nice. You can talk about people and ask names.',
    lead: 'You can name family and friends and start a friendly introduction.',
    achievements: [
      'Name family with พ่อ (father), แม่ (mother), and เพื่อน (friend)',
      'Talk about a doctor with หมอ',
      'Ask คุณชื่ออะไร (what is your name)',
      'Hear the question word อะไร (what) at the end',
    ],
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
  lessonIntro: {
    lead: 'This mission adds more everyday verbs for getting through your day, plus a friendly and very common question you will hear often, ทำอะไรอยู่, which means what are you doing.',
    points: [
      { label: 'You will learn', text: 'Action verbs like เข้า (enter), ฝึก (practice), ดึง (pull), กด (press), and ขี่ (ride), plus the question ทำอะไรอยู่ (what are you doing).' },
      { label: 'Why it matters', text: 'Pressing a button, entering a place, riding a bike: these small actions come up all day long. Asking what someone is doing is a friendly, low-pressure way to start talking and to keep a chat moving along.' },
      { label: 'Listen for', text: 'The question word อะไร (what) inside ทำอะไรอยู่, the same little word you met in the question about a name.' },
      { label: 'Notice', text: 'The word อยู่ at the end of ทำอะไรอยู่ shows the action is happening right now. It turns do what into what are you doing.' },
    ],
  },
  missionRecap: {
    headline: 'Nice. You can talk about more daily actions.',
    lead: 'You can name more everyday actions and ask what someone is up to.',
    achievements: [
      'Use verbs like เข้า (enter), ฝึก (practice), and กด (press)',
      'Ride something with ขี่',
      'Ask ทำอะไรอยู่ (what are you doing)',
      'Hear how อยู่ shows an action is happening now',
    ],
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
  lessonIntro: {
    lead: 'This mission adds another set of practical action verbs for everyday life, plus a natural, common question, ทำไปทำไม, which means why are you doing that.',
    points: [
      { label: 'You will learn', text: 'Verbs like เท (pour), ซ่อน (hide), ขุด (dig), ค้น (search), and โยน (throw), plus the question ทำไปทำไม (why are you doing that).' },
      { label: 'Why it matters', text: 'These hands-on verbs show up in real life all the time, from the kitchen to the garden. Being able to ask why keeps a conversation curious and friendly, and helps you understand what is going on around you.' },
      { label: 'Listen for', text: 'The question word ทำไม (why) at the end of ทำไปทำไม. It is the word you reach for whenever you want to ask why.' },
      { label: 'Notice', text: 'Many Thai questions place the question word near the end. Here ทำไม (why) closes the sentence, just like other questions you have seen.' },
    ],
  },
  missionRecap: {
    headline: 'Nice. You can talk about doing things and ask why.',
    lead: 'You can name more practical actions and ask the reason behind them.',
    achievements: [
      'Use verbs like เท (pour), ซ่อน (hide), and ค้น (search)',
      'Throw something with โยน',
      'Ask ทำไปทำไม (why are you doing that)',
      'Hear the question word ทำไม (why) at the end',
    ],
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
  lessonIntro: {
    lead: 'This mission rounds out your everyday verbs, and teaches a handy way to say that something has already happened with ผมลืมแล้ว, which means I forgot already.',
    points: [
      { label: 'You will learn', text: 'Verbs like จด (write), ผูก (tie), สวม (wear), มอบ (give), and เซ็น (sign), plus the sentence ผมลืมแล้ว (I forgot already).' },
      { label: 'Why it matters', text: 'Writing things down, signing your name, and wearing the right thing are all part of daily life. Being able to say you already did something is just as useful, and it comes up in conversation constantly.' },
      { label: 'Listen for', text: 'The little word แล้ว at the end of ผมลืมแล้ว. It tells the listener that something has already happened.' },
      { label: 'Notice', text: 'Adding แล้ว to the end of a sentence signals that an action is already done. Here it turns I forget into I forgot already.' },
    ],
  },
  missionRecap: {
    headline: 'Nice. You can handle more daily actions.',
    lead: 'You can name practical verbs and say when something has already happened.',
    achievements: [
      'Use verbs like จด (write), สวม (wear), and เซ็น (sign)',
      'Give something with มอบ',
      'Say ผมลืมแล้ว (I forgot already)',
      'Use แล้ว to show something is already done',
    ],
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
  lessonIntro: {
    lead: 'This mission adds more describing words for states and conditions, the words you reach for when you are tired or unwell, plus a useful sentence for tired days, ผมง่วงครับ, which means I am sleepy.',
    points: [
      { label: 'You will learn', text: 'Describing words like พร้อม (ready), ป่วย (ill), มืด (dark), and ง่วง (sleepy), plus the polite sentence ผมง่วงครับ (I am sleepy).' },
      { label: 'Why it matters', text: 'Saying you are ready, ill, or sleepy helps the people around you understand how you are and look after you. These small, honest words really matter on an ordinary day, especially when you are not at your best.' },
      { label: 'Listen for', text: 'The word ง่วง (sleepy) in ผมง่วงครับ. It is a handy one to know at the end of a long day.' },
      { label: 'Notice', text: 'ผมง่วงครับ uses the same friendly pattern as before, I, then how you are, then the polite word ครับ.' },
    ],
  },
  missionRecap: {
    headline: 'Nice. You can describe how you are doing.',
    lead: 'You can share more about your state, from ready to sleepy, in simple Thai.',
    achievements: [
      'Describe states with พร้อม (ready), ป่วย (ill), and มืด (dark)',
      'Say you are sleepy with ง่วง',
      'Say ผมง่วงครับ (I am sleepy) politely',
      'Reuse the I plus state plus ครับ pattern',
    ],
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
  lessonIntro: {
    lead: 'This mission gives you a set of words for qualities and states, the quick describing words you reach for in the moment, plus an honest everyday line, ผมยุ่งครับ, which means I am busy.',
    points: [
      { label: 'You will learn', text: 'Describing words like ไว (fast), ด่วน (urgent), งง (confused), and เด็ด (excellent), plus the polite sentence ผมยุ่งครับ (I am busy).' },
      { label: 'Why it matters', text: 'Telling someone that you are busy, or that something is urgent or excellent, helps you set expectations and react naturally in the moment. These quick words let you respond honestly without searching for a long sentence.' },
      { label: 'Listen for', text: 'The pair ไว (fast) and ด่วน (urgent). Both come up whenever something needs to happen quickly, so it helps to learn them together.' },
      { label: 'Notice', text: 'ผมยุ่งครับ follows the same pattern you know well, I, then a describing word, then the polite word ครับ.' },
    ],
  },
  missionRecap: {
    headline: 'Nice. You can describe states and say you are busy.',
    lead: 'You can describe how things are and let people know when you are busy.',
    achievements: [
      'Describe with ไว (fast), ด่วน (urgent), and เด็ด (excellent)',
      'Say you are confused with งง',
      'Say ผมยุ่งครับ (I am busy) politely',
      'Reuse the I plus describing word plus ครับ pattern',
    ],
  },
});
export const STAGE_3_UNIT_TIME = unit({
  unitId: 'stage-3-time-sequence', stageId: 3,
  title: 'Time and sequence', subtitle: 'Month, currently, before, when, occasion, era, soon, time.',
  vocabCardIds: [220, 254, 296, 1602, 2177, 2529, 2580, 2852], sentenceCardId: 4749, challengeCardIds: [220, 296, 2580],
  lessonIntro: {
    lead: 'This mission gives you words for time and sequence, so you can talk about when things happen, plus the handy phrase เดี๋ยวมา, which means I will be right back.',
    points: [
      { label: 'You will learn', text: 'Time words like เดือน (month), ก่อน (before), เมื่อ (when), and เดี๋ยว (soon), plus the everyday phrase เดี๋ยวมา (I will be right back).' },
      { label: 'Why it matters', text: 'Talking about time keeps plans clear: before or after, this month, in a moment. A quick เดี๋ยวมา lets people know you will return soon.' },
      { label: 'Listen for', text: 'The word เดี๋ยว (soon) inside เดี๋ยวมา. It is a friendly way to say you are stepping away for just a moment.' },
      { label: 'Notice', text: 'The word กำลัง goes right before a verb to show an action is happening right now. It is a small word that adds a sense of in progress.' },
    ],
  },
  missionRecap: {
    headline: 'Nice. You can talk about time and when things happen.',
    lead: 'You can place things in time and tell someone you will be right back.',
    achievements: [
      'Use time words like เดือน (month), ก่อน (before), and เมื่อ (when)',
      'Talk about soon with เดี๋ยว',
      'Say เดี๋ยวมา (I will be right back)',
      'Use กำลัง before a verb to show an action is happening now',
    ],
  },
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
  lessonIntro: {
    lead: 'This mission gives you small joining words and friendly sentence endings that make your Thai flow better, plus an honest, useful line, ผมไม่เข้าใจ, which means I do not understand.',
    points: [
      { label: 'You will learn', text: 'Connecting words like แต่ (but), ถ้า (if), and จึง (therefore), some casual sentence-ending particles, and the sentence ผมไม่เข้าใจ (I do not understand).' },
      { label: 'Why it matters', text: 'Joining words let you build longer, smoother thoughts instead of single words. Being able to say you do not understand is one of the most useful phrases for any learner, and it gently invites people to help you.' },
      { label: 'Listen for', text: 'The word ไม่ (not) before the verb in ผมไม่เข้าใจ. It is the same little word that makes a sentence negative.' },
      { label: 'Notice', text: 'Thai often ends a casual sentence with a small particle like น่ะ or เนอะ. They add a friendly, gentle tone without changing the meaning.' },
    ],
  },
  missionRecap: {
    headline: 'Nice. You can join ideas and ask for help understanding.',
    lead: 'You can connect your thoughts and say clearly when something is unclear.',
    achievements: [
      'Join ideas with แต่ (but), ถ้า (if), and จึง (therefore)',
      'Add a friendly tone with a casual particle like น่ะ',
      'Say ผมไม่เข้าใจ (I do not understand)',
      'Use ไม่ before a verb to make it negative',
    ],
  },
});
export const STAGE_3_UNIT_HOME = unit({
  unitId: 'stage-3-home-places', stageId: 3,
  title: 'Home and places', subtitle: 'House, building, garden, stove, air-con, cabinet, broken.',
  vocabCardIds: [160, 1719, 2601, 2080, 3403, 1000, 2631, 1021], sentenceCardId: 1500, challengeCardIds: [160, 2601, 1000],
  lessonIntro: {
    lead: 'This mission is about your home and the places around it, the everyday spaces you live in, plus a very practical sentence, แอร์เสีย, which means the air conditioning is broken.',
    points: [
      { label: 'You will learn', text: 'Home and place words like บ้าน (house), สวน (garden), เตา (stove), แอร์ (air conditioning), and ตู้ (cabinet), plus the sentence แอร์เสีย (the AC is broken).' },
      { label: 'Why it matters', text: 'Talking about your home comes up every day, and being able to report that something is broken, like the air conditioning, is genuinely useful. It is exactly the kind of thing you may need to tell a landlord or a repair person.' },
      { label: 'Listen for', text: 'The word พัง (broken) in this mission, and the short sentence แอร์เสีย, which you will want when something stops working.' },
      { label: 'Notice', text: 'The word แอร์ comes from the English word air. Thai borrows some everyday words from English, which can make them easier to remember.' },
    ],
  },
  missionRecap: {
    headline: 'Nice. You can talk about your home and what is broken.',
    lead: 'You can name places around your home and report when something stops working.',
    achievements: [
      'Name places with บ้าน (house), สวน (garden), and เตา (stove)',
      'Talk about the air conditioning with แอร์',
      'Say แอร์เสีย (the AC is broken)',
      'Describe something broken with พัง',
    ],
  },
  // sentenceCard shown for context (แอร์เสีย uses แอร์, a vocab card here);
  // no builder — phonetic does not split cleanly into known word pieces.
});
export const STAGE_3_UNIT_ANIMALS = unit({
  unitId: 'stage-3-animals', stageId: 3,
  title: 'Animals', subtitle: 'Dog, snake, monkey, buffalo, cow, frog, ant, crab.',
  vocabCardIds: [2598, 3066, 2696, 3318, 2789, 3467, 3519, 2583], challengeCardIds: [2598, 3066, 2789],
  // No sentenceCard/builder: Stage 3 has no clean animal sentence to tokenize.
  lessonIntro: {
    lead: 'This mission is a friendly set of common animals. It is a lighter mission that builds your everyday vocabulary with words you will hear in stories, on signs, and in daily chat.',
    points: [
      { label: 'You will learn', text: 'Common animal words like หมา (dog), งู (snake), ลิง (monkey), ควาย (buffalo), and วัว (cow), plus a few small creatures like มด (ant) and ปู (crab).' },
      { label: 'Why it matters', text: 'Animals come up more often than you might expect, in conversations, on signs, and in everyday chat. Knowing the common ones helps you follow what people say.' },
      { label: 'Listen for', text: 'Short, one-syllable animal words like หมา (dog) and งู (snake). Many common animal names in Thai are quick and simple to say.' },
      { label: 'Notice', text: 'These words are easy wins. There is no grammar to learn here, just a handful of friendly animal words to add to your vocabulary.' },
    ],
  },
  missionRecap: {
    headline: 'Nice. You can name common animals.',
    lead: 'You added a friendly set of everyday animal words to your vocabulary.',
    achievements: [
      'Name animals like หมา (dog), งู (snake), and ลิง (monkey)',
      'Talk about farm animals like ควาย (buffalo) and วัว (cow)',
      'Recognize small creatures like มด (ant) and ปู (crab)',
      'Build vocabulary with quick, simple words',
    ],
  },
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
  lessonIntro: {
    lead: 'Eight action verbs for life on the move, from reading and driving to running and traveling, plus a short sentence for announcing your next trip.',
    points: [
      { label: 'You will learn', text: 'Action verbs: อ่าน (read), ขาย (sell), เที่ยว (travel or hang out), ขับ (drive), วิ่ง (run), สอน (teach), ตอบ (answer), and เลือก (choose).' },
      { label: 'Why it matters', text: 'Verbs carry the action in any chat. With these you can describe what you do each day, answer simple questions, and talk about getting around town on your own.' },
      { label: 'Listen for', text: 'The little word จะ (jà) before ไป. It marks the future, so ผมจะไปเที่ยว describes a trip that is still coming up, not one already finished.' },
      { label: 'Notice', text: 'Thai verbs keep one fixed form no matter the sentence. เที่ยว looks exactly the same on its vocab card and at the end of ผมจะไปเที่ยว.' },
    ],
  },
  missionRecap: {
    headline: 'Great work. Eight everyday verbs are in your pocket.',
    lead: 'Small action words like these power real talk about your day.',
    achievements: [
      'Announce a trip with ผมจะไปเที่ยว (I am going traveling)',
      'Talk about reading with อ่าน and driving with ขับ',
      'Mark the future with จะ (will)',
      'Use เลือก (choose) and ตอบ (answer) in everyday moments',
    ],
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
  lessonIntro: {
    lead: 'Describing words bring small talk to life: taste, weather, distance, and even a compliment, plus the classic line of praise that every cook loves to hear after a good meal.',
    points: [
      { label: 'You will learn', text: 'Eight describing words: หนาว (cold weather), หวาน (sweet), เค็ม (salty), หล่อ (handsome), ใกล้ (near), ว่าง (free), หลาย (many), and เหมือน (like).' },
      { label: 'Why it matters', text: 'Food and weather are the easiest openers for small talk almost anywhere. One well placed describing word can keep a friendly chat going, and a kind compliment never hurts.' },
      { label: 'Listen for', text: 'The booster มาก (mâak) right after อร่อย in อร่อยมากครับ. It turns delicious into very delicious, and it works after many describing words.' },
      { label: 'Notice', text: 'In อร่อยมากครับ the describing word stands on its own as the whole statement. Thai does not need a separate word for "is" here.' },
    ],
  },
  missionRecap: {
    headline: 'Well done. You can describe tastes and qualities.',
    lead: 'A few describing words go a long way at the table and beyond.',
    achievements: [
      'Praise a meal with อร่อยมากครับ (very delicious)',
      'Describe flavors with หวาน (sweet) and เค็ม (salty)',
      'Say something is nearby with ใกล้ (near)',
      'Boost any description with มาก (very)',
    ],
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
  lessonIntro: {
    lead: 'Words for the people in your life, plus one of the most useful and most common small talk questions you can ask anyone new: what do you do for work?',
    points: [
      { label: 'You will learn', text: 'Family and people words: สามี (husband), มิตร (friend), บุตร (child), หลาน (grandchild), ก๋ง (grandfather), วงศ์ (family), plus ยังไง (how, informal) and เอ็ง (you, very casual, for close friends only).' },
      { label: 'Why it matters', text: 'Small talk often turns to family and work. These words help you follow the friendly questions new acquaintances like to ask, and answer a few of them too.' },
      { label: 'Listen for', text: 'อะไร (àrai) at the end of คุณทำงานอะไร. That final word is what turns the sentence into a "what" question.' },
      { label: 'Notice', text: 'The question word comes last in this pattern. The sentence opens with คุณ (you), names the action, and saves "what" for the very end.' },
    ],
  },
  missionRecap: {
    headline: 'Strong step. You can handle getting-to-know-you talk.',
    lead: 'Family words and one key question open many friendly chats.',
    achievements: [
      'Ask about work with คุณทำงานอะไร (what do you do for work?)',
      'Name family like สามี (husband) and หลาน (grandchild)',
      'Talk about grandfather with ก๋ง',
      'Ask how with the informal ยังไง',
    ],
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
  lessonIntro: {
    lead: 'Times of day and how-often words for talking about your schedule, plus the short friendly question that starts almost every plan: are you free?',
    points: [
      { label: 'You will learn', text: 'Time words เช้า (morning), บ่าย (afternoon), ค่ำ (evening), and นาที (minute), with เสมอ (always), มัก (often), บ่อย (frequent), and งั้น (then).' },
      { label: 'Why it matters', text: 'Making plans is real conversation. Saying when, and how often, turns a vague idea into an actual meetup with a real time attached, which is how plans actually happen.' },
      { label: 'Listen for', text: 'The rising ไหม (mǎi) at the end of คุณว่างไหม. That single word is what turns a plain statement into a yes or no question.' },
      { label: 'Notice', text: 'คุณว่างไหม is only three words: you, free, question. Thai questions can be this compact and still come across perfectly clear to everyone involved.' },
    ],
  },
  missionRecap: {
    headline: 'Great progress. You can start making plans.',
    lead: 'Time words plus one little question word take you a long way.',
    achievements: [
      'Invite someone with คุณว่างไหม (are you free?)',
      'Name times of day with เช้า (morning), บ่าย (afternoon), and ค่ำ (evening)',
      'Say how often with เสมอ (always) and บ่อย (frequent)',
      'Move a plan along with งั้น (then, in that case)',
    ],
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
  lessonIntro: {
    lead: 'Places you will actually visit on any trip, from markets and temples to the beach and the sea, plus the question everyone asks a traveler: where are you going?',
    points: [
      { label: 'You will learn', text: 'Place words: ตลาด (market), วัด (temple), หาด (beach), ร้าน (shop), หอ (hall), ทะเล (sea), ป่า (forest), and ฟ้า (sky).' },
      { label: 'Why it matters', text: 'Naming places lets you say where you are headed, and it helps you understand the friendly question you will hear again and again, wherever the day happens to take you.' },
      { label: 'Listen for', text: 'ไหน (nǎi) with its rising tone at the end of คุณจะไปไหน. It is the "where" that turns the whole sentence into a question.' },
      { label: 'Notice', text: 'จะ plus ไป means "will go". Swap ไหน for a place word like ตลาด and the same question pattern becomes your own answer.' },
    ],
  },
  missionRecap: {
    headline: 'Nice one. You can talk about where you are headed.',
    lead: 'Place names plus one question pattern cover a lot of daily movement.',
    achievements: [
      'Ask where someone is going with คุณจะไปไหน (where are you going?)',
      'Name spots like ตลาด (market), วัด (temple), and หาด (beach)',
      'Talk about nature with ทะเล (sea) and ป่า (forest)',
      'Build \'will go\' with จะ and ไป',
    ],
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
  lessonIntro: {
    lead: 'Getting around town: roads, canals, and distances counted in meters, plus the smart little check that is worth making before you set off anywhere: is it far?',
    points: [
      { label: 'You will learn', text: 'Distance and direction words: ข้าม (across), บัส (bus), คลอง (canal), ถนน (road), เมตร (meter), เขต (zone), ท่า (position), and รั้ว (fence).' },
      { label: 'Why it matters', text: 'Asking about distance before you walk or ride saves real effort on a long day, and these words also help you follow simple directions around an unfamiliar neighborhood on foot.' },
      { label: 'Listen for', text: 'Two words right at the end of ไกลไหมครับ: ไหม asks the yes or no question, and ครับ keeps a male speaker sounding polite.' },
      { label: 'Notice', text: 'ไกลไหมครับ has no word for "it" or "is". One describing word, ไกล (far), plus a question word makes a complete and useful question.' },
    ],
  },
  missionRecap: {
    headline: 'Good thinking. You can check the distance before you go.',
    lead: 'Short questions like this one are the workhorses of getting around.',
    achievements: [
      'Check distance with ไกลไหมครับ (is it far?)',
      'Name the way with ถนน (road) and คลอง (canal)',
      'Talk about crossing with ข้าม (across)',
      'Measure things in เมตร (meters)',
    ],
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
  lessonIntro: {
    lead: 'Words for how you feel and how the day is going, from fun and kind-hearted to bored and lonely, plus a simple way to tell someone you are cold.',
    points: [
      { label: 'You will learn', text: 'Feeling words: ใจดี (kind-hearted), เบื่อ (bored), สนุก (fun), เหงา (lonely), อุ่น (warm up), แย่ (bad), เกรง (fear), and ร้าย (evil).' },
      { label: 'Why it matters', text: 'Real conversation includes feelings. Saying you are bored, having fun, or freezing makes your Thai sound human, keeps your chats honest, and invites people to open up too.' },
      { label: 'Listen for', text: 'The rising tone of หนาว (nǎao) in ผมหนาวครับ. That one short word carries the whole meaning of feeling cold here.' },
      { label: 'Notice', text: 'Feelings follow one simple shape here: ผม plus a feeling word plus ครับ. Swap in เบื่อ or เหงา and the same pattern still works for you.' },
    ],
  },
  missionRecap: {
    headline: 'Big step. You can put feelings into words.',
    lead: 'Sharing how you feel turns set phrases into real conversation.',
    achievements: [
      'Say you are cold with ผมหนาวครับ (I am cold)',
      'Call a day สนุก (fun) or แย่ (bad)',
      'Admit you feel เบื่อ (bored) or เหงา (lonely)',
      'Describe someone as ใจดี (kind-hearted)',
    ],
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
  lessonIntro: {
    lead: 'Verbs for thinking and talking, from believing and guessing to arguing, plus the small satisfying sentence every learner needs in a real conversation: I understand now.',
    points: [
      { label: 'You will learn', text: 'Thinking and speaking verbs: เชื่อ (believe), เน้น (emphasize), เถียง (argue), ทาย (guess), เล่า (tell), เอ่ย (mention), ท่อง (recite), and ตรอง (reflect).' },
      { label: 'Why it matters', text: 'Conversation is more than trading facts. These verbs let you react to what you hear: believe it, doubt it, guess at it, or ask someone for the full story.' },
      { label: 'Listen for', text: 'แล้ว (láew) at the end of ผมเข้าใจแล้ว. This little word signals that something has just happened or changed.' },
      { label: 'Notice', text: 'เข้าใจ (understand) is one idea built from two smaller syllables. Thai often joins little pieces together into bigger words, and you will meet this pattern again.' },
    ],
  },
  missionRecap: {
    headline: 'Way to go. You can say the message landed.',
    lead: 'Thinking and telling verbs add real depth to your chats.',
    achievements: [
      'Confirm understanding with ผมเข้าใจแล้ว (I understand now)',
      'Say you believe it with เชื่อ (believe)',
      'Ask for the story with เล่า (tell)',
      'Take a guess with ทาย (guess)',
    ],
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
  lessonIntro: {
    lead: 'Hands-on verbs for errands and meals, from washing and ordering to tasting, plus an honest and very human little sentence for when something slips your mind.',
    points: [
      { label: 'You will learn', text: 'Daily verbs: ล้าง (wash), สั่ง (order), เรียก (call), ตรวจ (check), เช็ด (wipe), หยิบ (pick up), เติม (add), and ชิม (taste).' },
      { label: 'Why it matters', text: 'These are kitchen, market, and errand verbs. They appear whenever you order food, check a bill, call for service, or ask to taste something before you commit.' },
      { label: 'Listen for', text: 'ไป tucked inside ผมลืมไปครับ. Here it does not mean "to go": instead it softens the verb, as if the thought already slipped quietly away.' },
      { label: 'Notice', text: 'The sentence ends with ครับ once again. Whatever you admit or ask for, that final polite word keeps the whole moment friendly.' },
    ],
  },
  missionRecap: {
    headline: 'Good progress. These verbs power real errands.',
    lead: 'Ordering, checking, and tasting: daily life runs on verbs like these.',
    achievements: [
      'Own a slip-up with ผมลืมไปครับ (I forgot)',
      'Order with สั่ง and ask to taste with ชิม',
      'Say wash with ล้าง and wipe with เช็ด',
      'Use เติม (add) when something needs topping up',
    ],
  },
});
export const STAGE_4_UNIT_HOME = unit({
  unitId: 'stage-4-at-home', stageId: 4,
  title: 'At home', subtitle: 'Sofa, table, key, wifi, repair, sound, quiet, kitchen.',
  vocabCardIds: [1004, 1005, 1012, 1017, 1022, 1027, 1029, 2930], sentenceCardId: 1503, challengeCardIds: [1004, 1005, 1012],
  // sentenceCard shown for context (ไฟดับ "the power is out" fits the home theme);
  // no builder — "ไฟดับ" does not split into known WORD_LOOKUP pieces.
  lessonIntro: {
    lead: 'Around-the-house words for renters, guests, and longer stays: furniture, keys, wifi, and the short two-syllable phrase you will need when the lights suddenly go out.',
    points: [
      { label: 'You will learn', text: 'Home words: โซฟา (sofa), โต๊ะ (table), กุญแจ (key), ไวไฟ (wifi), ซ่อม (repair), เสียง (sound), เงียบ (quiet), and ครัว (kitchen).' },
      { label: 'Why it matters', text: 'If you stay anywhere longer than a night, things need naming and sometimes fixing. These words cover keys, noise, quiet, and the small repairs that come along with daily life in any rented room.' },
      { label: 'Listen for', text: 'The two quick syllables of ไฟดับ (fai dàp). When you hear them from someone nearby, the power has just gone out.' },
      { label: 'Notice', text: 'ไฟดับ is a complete sentence with no word for "the" or "is". Thai often states a situation exactly that directly, with nothing extra added.' },
    ],
  },
  missionRecap: {
    headline: 'Solid work. Your home vocabulary is taking shape.',
    lead: 'Keys, wifi, and quiet rooms: these words make any stay smoother.',
    achievements: [
      'Report a blackout with ไฟดับ (the power is out)',
      'Ask about the ไวไฟ (wifi) and the กุญแจ (key)',
      'Get something fixed with ซ่อม (repair)',
      'Describe noise with เสียง (sound) and calm with เงียบ (quiet)',
    ],
  },
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
  lessonIntro: {
    lead: 'A second round of practical verbs, from cutting and hiring to planting and raising, plus a graceful three-word way to say that something is no longer needed.',
    points: [
      { label: 'You will learn', text: 'Practical verbs: ตัด (cut), จับ (catch), ฝาก (deposit), จ้าง (hire), ถอด (remove), แยก (separate), ปลูก (plant), and เลี้ยง (raise).' },
      { label: 'Why it matters', text: 'Daily life is full of small tasks and small refusals. These verbs cover haircuts, bank stops, and daily errands, and the sentence lets you decline an offer kindly and clearly.' },
      { label: 'Listen for', text: 'ไม่ (mâi) with its falling tone right at the start of ไม่ต้องแล้ว. That one opening sound flips the whole sentence over to "not".' },
      { label: 'Notice', text: 'ไม่ plus ต้อง means "no need to". Adding แล้ว shows the need has already passed, so the offer is gently and politely waved off.' },
    ],
  },
  missionRecap: {
    headline: 'Nice. More working verbs, plus a polite way out.',
    lead: 'Saying what you need, and what you no longer need, keeps errands smooth.',
    achievements: [
      'Decline gently with ไม่ต้องแล้ว (no longer needed)',
      'Say cut with ตัด and remove with ถอด',
      'Use ฝาก (deposit) at the counter',
      'Talk about growing things with ปลูก (plant)',
    ],
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
  lessonIntro: {
    lead: 'Words that describe how things are, from full and heavy to strange and excellent, plus a short and handy reply to use when friendly invitations come your way: I am free.',
    points: [
      { label: 'You will learn', text: 'State words: เต็ม (full), หนัก (heavy), อ้วน (fat), ผอม (thin), แน่น (tight), แห้ง (dry), แปลก (strange), and เลิศ (excellent).' },
      { label: 'Why it matters', text: 'Describing states lets you comment on a packed bus, a heavy bag, or an excellent meal using just one well chosen word delivered at the right moment.' },
      { label: 'Listen for', text: 'ว่าง (wâang) with its falling tone in ผมว่างครับ. It is the word for "free" that you can use any time you accept a friendly invitation.' },
      { label: 'Notice', text: 'One describing word plus ครับ makes a full and polite answer. ผมว่างครับ needs no verb "to be" anywhere at all.' },
    ],
  },
  missionRecap: {
    headline: 'Steady progress. You can describe how things are.',
    lead: 'One sharp describing word often says more than a long sentence.',
    achievements: [
      'Accept an invitation with ผมว่างครับ (I am free)',
      'Call a bag หนัก (heavy) or a room เต็ม (full)',
      'Label something แปลก (strange) or เลิศ (excellent)',
      'Say dry with แห้ง and tight with แน่น',
    ],
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
  lessonIntro: {
    lead: 'Movement verbs for busy streets and quick exits, from hurrying and rushing to waving, plus the classic friendly goodbye line: I am going to go now.',
    points: [
      { label: 'You will learn', text: 'Movement verbs: ถอย (move back), โผล่ (emerge), หลีก (make way), เร่ง (hurry), พุ่ง (rush), ร่วง (fall off), หล่น (drop), and โบก (wave).' },
      { label: 'Why it matters', text: 'Streets, markets, and goodbyes all involve movement. These verbs describe stepping back, speeding up, dropping things, and waving someone down when you need a ride somewhere.' },
      { label: 'Listen for', text: 'จะ (jà) and แล้ว (láew) around ไป in ผมจะไปแล้ว: "will go" plus "now" together make a soft and easy announcement that you are leaving.' },
      { label: 'Notice', text: 'หล่น (drop) and ร่วง (fall off) are a close pair of words about falling. Meeting them side by side now helps you keep the two apart later.' },
    ],
  },
  missionRecap: {
    headline: 'Well done. You can make a graceful exit.',
    lead: 'Movement words plus one goodbye line keep you in charge of the moment.',
    achievements: [
      'Announce your exit with ผมจะไปแล้ว (I am going to go now)',
      'Flag someone down with โบก (wave)',
      'Hurry things up with เร่ง (hurry)',
      'Step back with ถอย (move back)',
    ],
  },
});
export const STAGE_4_UNIT_FOOD = unit({
  unitId: 'stage-4-food-and-dishes', stageId: 4,
  title: 'Food and dishes', subtitle: 'Rice, vegetable, meat, chicken, shrimp, egg, snack, chili.',
  vocabCardIds: [130, 138, 139, 140, 143, 144, 149, 522], challengeCardIds: [130, 139, 140],
  // No sentenceCard/builder: Stage 4's clean food sentences are idiomatic or do
  // not tokenize cleanly; food is taught as vocab here, used in sentences later.
  lessonIntro: {
    lead: 'The core food words behind countless menus and market stalls: rice, vegetables, meats, eggs, snacks, and the chili that decides how spicy your dinner gets.',
    points: [
      { label: 'You will learn', text: 'Food basics: ข้าว (rice), ผัก (vegetable), เนื้อ (meat), ไก่ (chicken), กุ้ง (shrimp), ไข่ (egg), ขนม (snack), and พริก (chili).' },
      { label: 'Why it matters', text: 'Knowing the main ingredients means you can read a dish name, pick out what you actually want to eat, and steer politely around the things you do not.' },
      { label: 'Listen for', text: 'The low tones of ไก่ (gài) and ไข่ (khài). These two short little words sound very close, but one is chicken and one is egg.' },
      { label: 'Notice', text: 'ข้าว can mean plain rice or food in general, so this one small and common word very often stands in for a whole meal.' },
    ],
  },
  missionRecap: {
    headline: 'You did it. Eight core food words are yours.',
    lead: 'Ingredient words are the keys to ordering food you actually want.',
    achievements: [
      'Spot ไก่ (chicken) and กุ้ง (shrimp) in dish names',
      'Ask for ผัก (vegetables) or ไข่ (egg)',
      'Watch for พริก (chili) when you order',
      'Use ข้าว (rice) to talk about food in general',
      'Pick up a ขนม (snack) between meals',
    ],
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
  lessonIntro: {
    lead: 'Eight action words power everyday talk: knowing, writing, changing, starting, and more, plus one sweet practice sentence worth keeping close.',
    points: [
      { label: 'You will learn', text: 'Eight handy verbs: รู้จัก (to know a person or place), เขียน (to write), เปลี่ยน (to change), เริ่ม (to start), สร้าง (create), แสดง (show), ย้าย (move), and ปล่อย (release).' },
      { label: 'Why it matters', text: 'Verbs carry the action in every sentence. A small, focused set like this lets you talk about what you start, change, or create as you go about daily life.' },
      { label: 'Listen for', text: 'The phrase คิดถึง (khít thǔeng) in the practice sentence: a high tone then a rising tone, two short beats you can copy.' },
      { label: 'Notice', text: 'The sentence ผมคิดถึงคุณ is just three pieces in order: ผม (I), คิดถึง (to miss), คุณ (you). The verb sits in the middle and never changes its form.' },
    ],
  },
  missionRecap: {
    headline: 'Great work. Eight new verbs are in your pocket.',
    lead: 'Action words like these make your Thai sentences move.',
    achievements: [
      'Say you know a person or place with รู้จัก (to know)',
      'Use เริ่ม (to start) and เปลี่ยน (to change) when plans shift',
      'Tell someone ผมคิดถึงคุณ (I miss you)',
      'Recognize เขียน (to write) and ย้าย (to move)',
    ],
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
  lessonIntro: {
    lead: 'Time to describe the rough edges of a day: things that are old, dirty, short, or wide, plus the very honest sentence for being worn out.',
    points: [
      { label: 'You will learn', text: 'Eight describing words: ไม่ดี (bad), เก่า (old, for things), สกปรก (dirty), เหนื่อย (tired), สั้น (short), กว้าง (wide), plus ตกลง (agree) and สนใจ (interested).' },
      { label: 'Why it matters', text: 'Travel days bring tired feet and worn out rooms. These words help you say how things look and how you feel, simply and honestly, without hunting for big words.' },
      { label: 'Listen for', text: 'The falling tone of มาก (mâak, very) at the end of ผมเหนื่อยมาก. It lands heavily and adds real strength to a description.' },
      { label: 'Notice', text: 'In ผมเหนื่อยมาก, the describing word เหนื่อย (tired) follows ผม (I) directly, and the booster มาก comes after the quality, never before it.' },
    ],
  },
  missionRecap: {
    headline: 'Well done. You can describe how things really are.',
    lead: 'Honest describing words make your Thai sound natural and clear.',
    achievements: [
      'Say ผมเหนื่อยมาก (I am very tired) after a long day',
      'Call something เก่า (old) or สกปรก (dirty)',
      'Agree to a plan with ตกลง (agree)',
      'Show interest with สนใจ (interested)',
      'Boost any description with มาก (very)',
    ],
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
  lessonIntro: {
    lead: 'Words for the people in your world: relatives, a wife, a father, an aunt, plus the everyday people, like students and police, you may need to find.',
    points: [
      { label: 'You will learn', text: 'People words: ญาติ (relative), ภรรยา (wife), บิดา (father, formal), ป้า (aunt), ธิดา (daughter, formal), บุคคล (person), ศิษย์ (student), and ตำรวจ (police).' },
      { label: 'Why it matters', text: 'Friendly conversations quickly turn to family and where you come from. These words help you follow along, name the people who matter, and answer with a little more confidence.' },
      { label: 'Listen for', text: 'The rising tone at the end of จากไหน (jàak nǎi, from where). That lift is your cue that someone is asking about a place.' },
      { label: 'Notice', text: 'The question คุณมาจากไหน keeps a plain order: คุณ (you), มา (to come), then จากไหน (from where). The question part comes last, not first.' },
    ],
  },
  missionRecap: {
    headline: 'Strong step. People words are now on your side.',
    lead: 'Talking about people opens most friendly conversations.',
    achievements: [
      'Ask คุณมาจากไหน (Where are you from?)',
      'Talk family with ญาติ (relative) and ป้า (aunt)',
      'Mention a ภรรยา (wife) or ธิดา (daughter)',
      'Spot the word ตำรวจ (police) when you need help',
    ],
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
  lessonIntro: {
    lead: 'Feelings come up fast in warm conversation. This unit gives you eight emotion words, from happy and satisfied all the way to sad, angry, and startled.',
    points: [
      { label: 'You will learn', text: 'Emotion words: ดีใจ (happy), พอใจ (satisfied), คิดถึง (to miss someone), เศร้า (sad), อิจฉา (jealous), โมโห (angry), ตกใจ (frightened), and ยินดี (happy).' },
      { label: 'Why it matters', text: 'Sharing a feeling, even in a single word, warms up any chat and helps people understand you. These words let you react honestly when something delights, saddens, or startles you.' },
      { label: 'Listen for', text: 'The matching final syllable in ดีใจ (dee jai), พอใจ (phaw jai), and ตกใจ (dtòhk jai): three feelings that end with the very same sound.' },
      { label: 'Notice', text: 'The sentence ผมดีใจมาก uses a simple frame: ผม (I), then the feeling ดีใจ (happy), then มาก (very). Swap in เศร้า (sad) and the frame still works.' },
    ],
  },
  missionRecap: {
    headline: 'Lovely progress. You can put feelings into Thai words.',
    lead: 'Naming emotions brings real warmth to your conversations.',
    achievements: [
      'Say ผมดีใจมาก (I am very happy)',
      'Tell someone you miss them with คิดถึง (to miss)',
      'Name a low moment with เศร้า (sad) or โมโห (angry)',
      'Describe a shock with ตกใจ (frightened)',
    ],
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
  lessonIntro: {
    lead: 'A small health kit in words: the people who can help you, a few key body parts, and the simple sentence that tells someone you are unwell.',
    points: [
      { label: 'You will learn', text: 'Health words: พยาบาล (nurse), แพทย์ (doctor), แผล (wound), เลือด (blood), หายใจ (to breathe), plus the body parts จมูก (nose), เข่า (knee), and ไหล่ (shoulder).' },
      { label: 'Why it matters', text: 'When you feel sick or pick up a scrape, a few clear words help you find the right person quickly, explain the problem, and point to exactly where it hurts.' },
      { label: 'Listen for', text: 'The polite ครับ (khráp) closing ผมไม่สบายครับ. A male speaker adds it to keep even an uncomfortable report sounding respectful.' },
      { label: 'Notice', text: 'ไม่สบาย (mâi sàbaai) bundles "not" and "well" into one tidy chunk, so a single short word group tells a helper how you feel.' },
    ],
  },
  missionRecap: {
    headline: 'Good going. You can ask for help when you feel rough.',
    lead: 'Health words are the ones you want ready before you need them.',
    achievements: [
      'Say ผมไม่สบายครับ (I am not feeling well)',
      'Ask for a พยาบาล (nurse) or แพทย์ (doctor)',
      'Point out a แผล (wound) or เลือด (blood)',
      'Name จมูก (nose), เข่า (knee), and ไหล่ (shoulder)',
    ],
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
  lessonIntro: {
    lead: 'Small talk nearly always starts with the sky. This unit brings you weather and nature words, plus the one sentence every visitor needs on a hot afternoon.',
    points: [
      { label: 'You will learn', text: 'Weather and nature words: อากาศ (weather), ฤดู (season), พายุ (storm), หิมะ (snow), หญ้า (grass), เกาะ (island), ว่าว (kite), and ศิลา (stone).' },
      { label: 'Why it matters', text: 'Weather chat is the easiest doorway into friendly conversation with someone new, and nature words like เกาะ (island) come up constantly when you plan trips along the coast.' },
      { label: 'Listen for', text: 'The pair ร้อน (ráwn) and มาก (mâak) closing the practice sentence: hot, then very, in that exact order, two strong sounds you will hear again and again.' },
      { label: 'Notice', text: 'วันนี้ร้อนมาก opens with the time word วันนี้ (today). The sentence sets the time first, then gives the description right after it.' },
    ],
  },
  missionRecap: {
    headline: 'Nice one. Weather small talk is now within reach.',
    lead: 'Sky and season words give every chat an easy starting point.',
    achievements: [
      'Say วันนี้ร้อนมาก (It is very hot today)',
      'Bring up the อากาศ (weather)',
      'Plan an island trip with เกาะ (island)',
      'Name a พายุ (storm) or หิมะ (snow)',
    ],
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
  lessonIntro: {
    lead: 'Time words anchor your plans: today, now, this week, plus the handy little question for working out exactly what day it is.',
    points: [
      { label: 'You will learn', text: 'Time words: วันนี้ (today), ตอนนี้ (now), อาทิตย์ (week), จันทร์ (Monday), ทีนี้ (now), เพิ่ง (just recently), หลัง (after), and ครั้ง (times).' },
      { label: 'Why it matters', text: 'Plans live or die on time words. Saying clearly when something happens, today, right now, or after, keeps meetups, bookings, and travel days running on track.' },
      { label: 'Listen for', text: 'อะไร (àrai, what) at the very end of วันนี้วันอะไร. Question words often sit last, so keep listening right to the end of the question.' },
      { label: 'Notice', text: 'วันนี้ (today) is built from วัน (day), and the practice question uses both, so you hear the word for day twice in one short question.' },
    ],
  },
  missionRecap: {
    headline: 'Right on time. You can pin plans to days and times.',
    lead: 'Time words keep plans clear and meetups on schedule.',
    achievements: [
      'Ask วันนี้วันอะไร (What day is today?)',
      'Pin down a moment with วันนี้ (today) and ตอนนี้ (now)',
      'Say something just happened with เพิ่ง (just recently)',
      'Count occasions with ครั้ง (times)',
    ],
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
  lessonIntro: {
    lead: 'Menu favorites and fresh market fruit: famous dishes, drink words, and a simple, useful sentence for saying what you would like to drink.',
    points: [
      { label: 'You will learn', text: 'Food and drink words: เบียร์ (beer), ส้มตำ (papaya salad), ต้มยำ (tom yum soup), เหล้า (liquor), เกลือ (salt), มะนาว (lime), มะม่วง (mango), and กล้วย (banana).' },
      { label: 'Why it matters', text: 'Eating out is where your Thai gets the most use every day. Naming dishes and fruit gets you exactly what you are craving at a stall, market, or restaurant.' },
      { label: 'Listen for', text: 'The matching first syllable of มะนาว (má-naao, lime) and มะม่วง (má-mûang, mango): two fruit names that open with the same sound.' },
      { label: 'Notice', text: 'In ผมอยากดื่มกาแฟ, the word อยาก (to want to) goes right before the action ดื่ม (to drink). Swap in another verb to want something new.' },
    ],
  },
  missionRecap: {
    headline: 'Tasty work. Ordering food just got easier.',
    lead: 'Food words pay off every single mealtime.',
    achievements: [
      'Say ผมอยากดื่มกาแฟ (I want to drink coffee)',
      'Order ส้มตำ (papaya salad) or ต้มยำ (tom yum)',
      'Shop for มะม่วง (mango) and กล้วย (banana)',
      'Ask for เกลือ (salt) or มะนาว (lime)',
    ],
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
  lessonIntro: {
    lead: 'Shopping and paying made simpler: menu and money words, plus an all purpose little sentence for taking the thing you are pointing at.',
    points: [
      { label: 'You will learn', text: 'Ordering words: เมนู (menu), แบงค์ (banknote), ตังค์ (money, informal), เงินสด (cash), เหรียญ (coin), ป้าย (sign), รางวัล (prize), and แวะ (to stop by).' },
      { label: 'Why it matters', text: 'Markets and street stalls move quickly. Knowing the words for cash, coins, and the menu helps you pay smoothly and follow what the seller says back to you.' },
      { label: 'Listen for', text: 'The tiny word เอา (ao) right after ผม in the practice sentence. That single syllable carries the whole meaning of taking or wanting a thing.' },
      { label: 'Notice', text: 'อันนี้ (this one) stands in for any item, so ผมเอาอันนี้ครับ works at a stall, a shop, or a cafe while you simply point.' },
    ],
  },
  missionRecap: {
    headline: 'Smooth work. Paying and ordering feel less mysterious now.',
    lead: 'Money words keep market moments quick and friendly.',
    achievements: [
      'Order anything with ผมเอาอันนี้ครับ (I will take this one)',
      'Ask for the เมนู (menu)',
      'Pay with เงินสด (cash) or เหรียญ (coin)',
      'Suggest a quick stop with แวะ (to stop by)',
    ],
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
  lessonIntro: {
    lead: 'Verbs for passing things and information along: advising, warning, handing out, plus the polite, reusable pattern for requesting a glass of water.',
    points: [
      { label: 'You will learn', text: 'Giving and telling verbs: แนะ (advise), เตือน (warn), แจก (give out), ป้อน (feed), ตัก (scoop), กล่าว (say), ขาน (call out), and แจ้ง (inform).' },
      { label: 'Why it matters', text: 'Asking nicely is a daily skill anywhere. The request sentence here is a simple template you will reuse for water, help, directions, and all kinds of small favors.' },
      { label: 'Listen for', text: 'The softener หน่อย (nàwy, a little) near the end of ขอน้ำหน่อยครับ. It makes a request sound gentle and friendly instead of demanding.' },
      { label: 'Notice', text: 'The request follows a clear three part frame: ขอ (may I have) opens it, น้ำ (water) names the thing, and หน่อย plus ครับ round it off politely.' },
    ],
  },
  missionRecap: {
    headline: 'Well asked. You can request things the gentle way.',
    lead: 'Polite requests smooth out countless daily moments.',
    achievements: [
      'Make a polite request with ขอน้ำหน่อยครับ (May I have some water)',
      'Warn someone kindly with เตือน (warn)',
      'Pass news along with แจ้ง (inform)',
      'Hand things out with แจก (give out)',
    ],
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
  lessonIntro: {
    lead: 'Kind words open doors everywhere. This unit gives you eight friendly ways to praise food, places, and people, plus one classic compliment sentence to finish.',
    points: [
      { label: 'You will learn', text: 'Praise words: พิเศษ (special), เยี่ยม (great), ตลก (funny), สบาย (comfortable), แท้ (real), เรียบ (smooth), ถูกใจ (pleased), and ปลื้ม (delighted).' },
      { label: 'Why it matters', text: 'A genuine compliment warms any exchange with hosts, vendors, or new friends. These words let you say clearly what you liked and why, plainly and kindly.' },
      { label: 'Listen for', text: 'The rising tone in สวย (sǔai, beautiful). The sound climbs upward as you say it, which makes the compliment easy to pick out of fast speech.' },
      { label: 'Notice', text: 'The compliment builds piece by piece, in a steady order: คุณ (you), สวย (beautiful), มาก (very), ครับ (polite, male). The booster มาก comes after the quality it boosts.' },
    ],
  },
  missionRecap: {
    headline: 'Charming work. Your praise now lands in Thai.',
    lead: 'Compliments are small gifts, and you have a pocketful.',
    achievements: [
      'Offer the compliment คุณสวยมากครับ (You are very beautiful)',
      'Call something เยี่ยม (great) or พิเศษ (special)',
      'Say a joke was ตลก (funny)',
      'Show you are pleased with ถูกใจ (pleased) or ปลื้ม (delighted)',
    ],
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
  lessonIntro: {
    lead: 'Get your bearings with useful town words: the city, a building, the market, a bridge, and the train, plus a ready sentence for praising a beautiful spot.',
    points: [
      { label: 'You will learn', text: 'Places around town: เมือง (city), อาคาร (building), ฝั่ง (shore), ตำบล (sub district), กาด (market), สะพาน (bridge), ค่าย (camp), and รถไฟ (train).' },
      { label: 'Why it matters', text: 'Place words turn vague directions into clear ones. Naming the bridge, the market, or the train makes finding your way around town far less stressful.' },
      { label: 'Listen for', text: 'The two falling tones of ที่นี่ (thîi nîi, here): both syllables drop the same way, which makes the word easy to catch in everyday speech.' },
      { label: 'Notice', text: 'ที่นี่สวยมาก needs no extra linking word at all: the place ที่นี่ (here), the quality สวย (beautiful), and the booster มาก (very) simply line up in order.' },
    ],
  },
  missionRecap: {
    headline: 'Good progress. The town around you has names now.',
    lead: 'Place words make every outing easier to talk about.',
    achievements: [
      'Praise a place with ที่นี่สวยมาก (It is very beautiful here)',
      'Find the รถไฟ (train) or the สะพาน (bridge)',
      'Head to the กาด (market)',
      'Talk about the เมือง (city) you are exploring',
    ],
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
  lessonIntro: {
    lead: 'Words for plans that move and change: prepare, schedule, postpone, cancel, and share, plus the honest little sentence for the very end of a long day.',
    points: [
      { label: 'You will learn', text: 'Planning verbs: ใคร่ (desire), เตรียม (prepare), กำหนด (schedule), เลื่อน (postpone), ถอน (cancel), คาด (expect), เชื่อม (connect), and แบ่ง (share).' },
      { label: 'Why it matters', text: 'Plans shift constantly when you travel. Words for preparing, postponing, and canceling let you talk through those changes calmly instead of guessing what happens next.' },
      { label: 'Listen for', text: 'The low tone of อยาก (yàak) sitting between ผม and the action. That small word always flags a want before you hear what is wanted.' },
      { label: 'Notice', text: 'กลับบ้าน (to go home) works as one ready made chunk, so the whole wish is just three easy pieces: ผม (I), อยาก (to want to), กลับบ้าน.' },
    ],
  },
  missionRecap: {
    headline: 'Solid step. You can talk about plans that change.',
    lead: 'Flexible plans need flexible words, and now you have them.',
    achievements: [
      'Say ผมอยากกลับบ้าน (I want to go home)',
      'Get ready with เตรียม (prepare)',
      'Move a plan with เลื่อน (postpone)',
      'Set a time with กำหนด (schedule)',
      'Split things fairly with แบ่ง (share)',
    ],
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
  lessonIntro: {
    lead: 'Social verbs for meeting people and mixing in: greeting, remembering, competing, and exchanging, plus the perfect short sentence for the moment you finally arrive.',
    points: [
      { label: 'You will learn', text: 'Social verbs: ทราบ (know), จดจำ (remember), เกลียด (hate), ชนะ (win), แข่ง (compete), แลก (exchange), ไหว้ (to wai), and ทัก (greet).' },
      { label: 'Why it matters', text: 'Meeting people means greeting them, remembering them, and swapping things with them. These eight verbs cover the small social moves that come up over and over, every single day.' },
      { label: 'Listen for', text: 'เพิ่ง (phêung) right after ผม in ผมเพิ่งมาถึง. This one small word tells the listener that something happened only a few moments ago.' },
      { label: 'Notice', text: 'Time words like เพิ่ง (just recently) slot in right before the verb มาถึง (to arrive). No verb ending is ever needed to show the recent past.' },
    ],
  },
  missionRecap: {
    headline: 'Friendly finish. Your social verbs are ready to use.',
    lead: 'Small social moves add up to easy, warm encounters.',
    achievements: [
      'Announce ผมเพิ่งมาถึง (I just arrived)',
      'Greet someone with ทัก (greet) or a ไหว้ (wai gesture)',
      'Say you remember with จดจำ (remember)',
      'Swap or trade with แลก (exchange)',
    ],
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
  lessonIntro: {
    lead: 'These verbs carry wants and plans: rest, need, try, feel, and travel, plus a sentence about the very thing you are doing right now, learning Thai.',
    points: [
      { label: 'You will learn', text: 'Eight workhorse verbs, including พักผ่อน (to rest), ต้องการ (to need), พยายาม (to try), รู้สึก (to feel), and เดินทาง (to travel).' },
      { label: 'Why it matters', text: 'Verbs like these let you say what you want and what you are trying to do. That is the heart of longer, more useful sentences, and the step beyond single words.' },
      { label: 'Listen for', text: 'The phonetic pá-yaa-yaam for พยายาม: three steady syllables that stand out clearly once you know them. Try to catch all three.' },
      { label: 'Notice', text: 'The sentence ผมอยากเรียนภาษาไทย stacks ผม, then อยาก, then เรียน, then ภาษาไทย: the person, the want, the verb, the thing, in that order.' },
    ],
  },
  missionRecap: {
    headline: 'Great work. Your wants and plans now fit into Thai.',
    lead: 'You practiced verbs that explain what you need and what you are trying to do.',
    achievements: [
      'Say your goal with ผมอยากเรียนภาษาไทย (I want to learn Thai)',
      'Talk about resting with พักผ่อน (to rest)',
      'Express needs with ต้องการ (to need)',
      'Describe effort with พยายาม (to try)',
      'Mention a trip with เดินทาง (to travel)',
    ],
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
  lessonIntro: {
    lead: 'A small health kit for the harder days: words for symptoms and for the body, plus one clear sentence that every traveler with a food allergy should learn well and keep ready.',
    points: [
      { label: 'You will learn', text: 'Six health words, including ปวดหัว (headache), อาการ (symptom), คนไข้ (patient), หัวใจ (heart), and สมอง (brain).' },
      { label: 'Why it matters', text: 'When you feel unwell, a few clear words help a pharmacist or a doctor understand you faster, with much less guessing on both sides. Clear words save time exactly when you have the least patience for confusion.' },
      { label: 'Listen for', text: 'The short word pháe inside ผมแพ้อาหารทะเล. That one small syllable carries the whole meaning of allergic.' },
      { label: 'Notice', text: 'The sentence ผมแพ้อาหารทะเล needs only three parts: ผม, แพ้, and อาหารทะเล. Short pieces, serious message, and a pattern small enough to recall under pressure.' },
    ],
  },
  missionRecap: {
    headline: 'Well done. You can describe how you feel when it counts.',
    lead: 'These are words you hope not to need, and will be glad to have.',
    achievements: [
      'Warn about allergies with ผมแพ้อาหารทะเล (I am allergic to seafood)',
      'Point to a headache with ปวดหัว (headache)',
      'Describe what is wrong with อาการ (symptom)',
      'Name the heart with หัวใจ (heart)',
    ],
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
  lessonIntro: {
    lead: 'Words for the people around you: family members, a friend, a girlfriend, plus a warm goodbye to use when it is time to part ways for the day.',
    points: [
      { label: 'You will learn', text: 'People words like ผู้ชาย (man), ผู้หญิง (woman), ลูกชาย (son), ลูกสาว (daughter), and แฟนสาว (girlfriend).' },
      { label: 'Why it matters', text: 'Small talk often turns to family. Being able to name who is who keeps the conversation going and makes it feel personal. People enjoy hearing their family named correctly.' },
      { label: 'Listen for', text: 'The soft particle นะ in เจอกันใหม่นะครับ. It gently warms the goodbye so it sounds friendly, not abrupt. You will hear it constantly in farewells.' },
      { label: 'Notice', text: 'ลูกชาย (son) and ลูกสาว (daughter) share their first part. Spotting shared pieces like this makes new family words easier to remember.' },
    ],
  },
  missionRecap: {
    headline: 'Strong step. You can talk about the people in your life.',
    lead: 'Family words plus a friendly goodbye make conversations feel warmer.',
    achievements: [
      'Part warmly with เจอกันใหม่นะครับ (see you again)',
      'Talk about a son or daughter with ลูกชาย and ลูกสาว',
      'Say man and woman with ผู้ชาย and ผู้หญิง',
      'Mention a girlfriend with แฟนสาว',
    ],
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
  lessonIntro: {
    lead: 'Time words that anchor your plans: tomorrow, yesterday, tonight, and the holiday, plus a small story sentence about going to the market.',
    points: [
      { label: 'You will learn', text: 'Calendar words like พรุ่งนี้ (tomorrow), เมื่อวาน (yesterday), คืนนี้ (tonight), วันหยุด (holiday), and สัปดาห์ (week).' },
      { label: 'Why it matters', text: 'Booking, meeting, and rescheduling all hang on time words. They are what turn a vague idea into a real plan with a real day. Drop one into a sentence and your plans become easy to follow.' },
      { label: 'Listen for', text: 'mêua waan at the start of the sentence. Hearing the time word first tells you when it happened before anything else arrives. Train your ear to grab it.' },
      { label: 'Notice', text: 'เมื่อวานผมไปตลาด uses no special past form. The word เมื่อวาน alone is enough to set the whole sentence in the past.' },
    ],
  },
  missionRecap: {
    headline: 'Nicely done. Your Thai now has a calendar.',
    lead: 'You can place plans and little stories in time, from yesterday to tonight.',
    achievements: [
      'Tell a small story with เมื่อวานผมไปตลาด (yesterday I went to the market)',
      'Plan ahead with พรุ่งนี้ (tomorrow)',
      'Talk about tonight with คืนนี้ (tonight)',
      'Ask about dates with วันที่ (date)',
      'Mark a day off with วันหยุด (holiday)',
    ],
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
  lessonIntro: {
    lead: 'Parts of the day, two weekdays to anchor your plans, and the polite line you will hear at counters everywhere: please wait a moment.',
    points: [
      { label: 'You will learn', text: 'Time words like กลางวัน (daytime), ตอนเย็น (evening), เสาร์ (Saturday), วันพุธ (Wednesday), and สักครู่ (a moment).' },
      { label: 'Why it matters', text: 'Waiting is part of daily life. Understanding รอสักครู่นะครับ, and saying it yourself, keeps those small moments calm and friendly. It also tells you exactly what is about to happen next.' },
      { label: 'Listen for', text: 'sàk khrûu, the phrase for a short wait. Staff say it all the time, so your ear will get plenty of real practice.' },
      { label: 'Notice', text: 'The sentence ends with นะ and then ครับ: first a softener, then politeness. That order stays the same in many polite sentences, so it is worth noticing early.' },
    ],
  },
  missionRecap: {
    headline: 'Good progress. You can handle times and short waits.',
    lead: 'From Saturday plans to a moment of patience, you have the words.',
    achievements: [
      'Ask someone to wait with รอสักครู่นะครับ (please wait a moment)',
      'Name the evening with ตอนเย็น (evening)',
      'Plan around เสาร์ (Saturday) and วันพุธ (Wednesday)',
      'Say still with ยังคง (still)',
    ],
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
  lessonIntro: {
    lead: 'Restaurant moves you will actually use: asking for the menu, naming fruit like ทุเรียน (durian), and the short phrase that calls for the bill.',
    points: [
      { label: 'You will learn', text: 'Eating words like ผลไม้ (fruit), ทุเรียน (durian), กินข้าว (eat a meal), เปรี้ยว (sour), and เช็คบิล (check please).' },
      { label: 'Why it matters', text: 'Ordering, tasting, and paying are everyday moves. A few set phrases make each restaurant visit smoother from the first request to the last. A confident order also puts the staff at ease with you.' },
      { label: 'Listen for', text: 'khǎw at the start of ขอเมนูหน่อยครับ. That little rising-tone word opens most polite requests, and you will use it many times a day.' },
      { label: 'Notice', text: 'The request pattern: ขอ, then เมนู, then หน่อย, then ครับ. Swap the middle word and you can ask for other things the same way.' },
    ],
  },
  missionRecap: {
    headline: 'Tasty work. You can steer a meal from menu to bill.',
    lead: 'You practiced ordering, naming fruit, and wrapping up politely.',
    achievements: [
      'Ask for the menu with ขอเมนูหน่อยครับ (may I have the menu)',
      'Call for the bill with เช็คบิล (check please)',
      'Name fruit with ผลไม้ (fruit) and ทุเรียน (durian)',
      'Describe a flavor with เปรี้ยว (sour)',
      'Talk about eating with กินข้าว (eat a meal)',
    ],
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
  lessonIntro: {
    lead: 'Home words for apartments and hotel rooms: the fridge, the bedroom, the balcony, plus a simple, honest way to say you want to rest after a long day.',
    points: [
      { label: 'You will learn', text: 'Home words like ตู้เย็น (refrigerator), ห้องนอน (bedroom), ระเบียง (balcony), ที่นอน (bed), and สะอาด (clean).' },
      { label: 'Why it matters', text: 'Renting a room, checking in, or reporting a problem needs exactly these words: which room, which item, and whether it is clean. Naming the exact item gets a problem fixed much sooner.' },
      { label: 'Listen for', text: 'phák-phàwn at the end of ผมอยากพักผ่อน. Those two snappy syllables mean to rest, and you will want them often.' },
      { label: 'Notice', text: 'ห้องนอน (bedroom) and ที่นอน (bed) share the same final part. Spotting shared pieces helps new home words stick faster. Watch for that ending in both.' },
    ],
  },
  missionRecap: {
    headline: 'Cozy progress. Your home vocabulary just moved in.',
    lead: 'You can name rooms and furniture, and say when you need a break.',
    achievements: [
      'Say you want to rest with ผมอยากพักผ่อน (I want to rest)',
      'Name the bedroom with ห้องนอน (bedroom)',
      'Point out the fridge with ตู้เย็น (refrigerator)',
      'Praise a clean room with สะอาด (clean)',
      'Step out on the ระเบียง (balcony)',
    ],
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
  lessonIntro: {
    lead: 'Places that organize a trip: the hotel, the station, the bank, and the mountain, plus a promise travelers love to make, I will come back.',
    points: [
      { label: 'You will learn', text: 'Place words like โรงแรม (hotel), สถานี (station), ธนาคาร (bank), อำเภอ (district), and ภูเขา (mountain).' },
      { label: 'Why it matters', text: 'Taxis, tickets, and directions all start with naming a place. These words tell people exactly where you are headed next, and help you catch the answer when it comes back fast.' },
      { label: 'Listen for', text: 'jà in ผมจะกลับมาอีก. That tiny word signals the future before the main verb even arrives. Catching it tells you a plan is coming.' },
      { label: 'Notice', text: 'The sentence stacks กลับ, then มา, then อีก: return, come, again. Each short word adds one clear piece of meaning. Thai often builds longer ideas this way.' },
    ],
  },
  missionRecap: {
    headline: 'Wonderful. You can name the places that shape a trip.',
    lead: 'Hotels, stations, and banks, plus a line for places worth a return.',
    achievements: [
      'Promise a return with ผมจะกลับมาอีก (I will come back again)',
      'Find your โรงแรม (hotel)',
      'Head to the สถานี (station)',
      'Locate the ธนาคาร (bank)',
      'Point out a ภูเขา (mountain)',
    ],
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
  lessonIntro: {
    lead: 'Paperwork Thai for grown-up errands: the bank, the ATM, signatures and receipts, plus a useful question for arranging when things can actually happen.',
    points: [
      { label: 'You will learn', text: 'Errand words like ธนาคาร (bank), เอทีเอ็ม (ATM), ลายเซ็น (signature), เอกสาร (document), and ใบเสร็จ (receipt).' },
      { label: 'Why it matters', text: 'Accounts, forms, and deliveries are where life abroad gets practical. These words keep counter visits and paperwork manageable, and recognizing them on a form is half the battle won.' },
      { label: 'Listen for', text: 'The pair ได้ plus ไหม near the end of มาวันนี้ได้ไหมครับ. Together they ask whether something is possible. You will hear that pair in offices, shops, and phone calls.' },
      { label: 'Notice', text: 'วันนี้ (today) sits inside the question, right after มา. Time words can slot into the middle of a sentence, not only the start.' },
    ],
  },
  missionRecap: {
    headline: 'Solid work. Bank errands just got less intimidating.',
    lead: 'You met the words that appear on counters, forms, and receipts.',
    achievements: [
      'Ask about timing with มาวันนี้ได้ไหมครับ (can you come today?)',
      'Find an เอทีเอ็ม (ATM)',
      'Sign with your ลายเซ็น (signature)',
      'Keep the ใบเสร็จ (receipt)',
      'Ask about ประกัน (insurance)',
    ],
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
  lessonIntro: {
    lead: 'Feeling words for real conversations: calm, at ease, irritated, and love, plus a caring line to send someone off, take care of yourself.',
    points: [
      { label: 'You will learn', text: 'Mood words like เสียใจ (sad), ใจเย็น (calm), สบายใจ (at ease), หงุดหงิด (irritated), and ความรัก (love).' },
      { label: 'Why it matters', text: 'Sharing how you feel builds friendships better than any list of facts. These words let you be honest and kind at the same time. A single mood word can explain a whole quiet evening.' },
      { label: 'Listen for', text: 'The closing นะ in รักษาตัวด้วยนะ. It softens the line into something caring rather than bossy. It turns an instruction into warmth.' },
      { label: 'Notice', text: 'เสียใจ, สบายใจ, ตั้งใจ, and ไว้ใจ all share the syllable jai. Many feeling words in this set are built around it, so each new one feels familiar.' },
    ],
  },
  missionRecap: {
    headline: 'Heartfelt work. You can share moods, not just facts.',
    lead: 'Feelings are where conversations turn real, and you have words for them.',
    achievements: [
      'Send someone off with รักษาตัวด้วยนะ (take care of yourself)',
      'Stay calm with ใจเย็น (calm)',
      'Admit feeling หงุดหงิด (irritated)',
      'Say you are at ease with สบายใจ (at ease)',
      'Talk about ความรัก (love)',
    ],
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
  lessonIntro: {
    lead: 'Verbs for studying and noticing the world: study, see, hear, recommend, and search, plus a sentence that says exactly why you opened this app today.',
    points: [
      { label: 'You will learn', text: 'Learning verbs like ศึกษา (study), ได้ยิน (hear), มองเห็น (see), แนะนำ (recommend), and สรุป (summarize).' },
      { label: 'Why it matters', text: 'Asking for recommendations and saying what you saw or heard keeps real conversations moving, especially when you need to explain yourself. These verbs also help you ask better questions.' },
      { label: 'Listen for', text: 'dâai at the very end of ผมอยากพูดไทยได้. Placed there, it means to be able to. One small word with a lot of power.' },
      { label: 'Notice', text: 'ได้ยิน (hear) begins with ได้, the same word that ends the sentence. Its position changes the job it does, so watch closely where it lands in each sentence.' },
    ],
  },
  missionRecap: {
    headline: 'Sharp work. You can talk about learning itself.',
    lead: 'You practiced verbs for studying, noticing, and asking for guidance.',
    achievements: [
      'State your goal with ผมอยากพูดไทยได้ (I want to be able to speak Thai)',
      'Ask for tips with แนะนำ (recommend)',
      'Say what you heard with ได้ยิน (hear)',
      'Look things up with ค้นหา (search)',
      'Wrap up ideas with สรุป (summarize)',
    ],
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
  lessonIntro: {
    lead: 'Verbs for life with people: chat, laugh, follow, accept, plus the friendly question you will hear again and again, have you eaten yet?',
    points: [
      { label: 'You will learn', text: 'Social verbs like พูดคุย (chat), หัวเราะ (laugh), ติดตาม (follow), ยอมรับ (accept), and นึกถึง (think about).' },
      { label: 'Why it matters', text: 'These verbs describe time spent with people, which is exactly where your Thai gets its daily exercise and its best rewards. Friendly verbs invite friendly replies, and those replies give you real practice.' },
      { label: 'Listen for', text: 'The tail หรือยัง in คุณกินข้าวหรือยัง. It asks whether something has happened yet. It is one of the most common question tails you will hear.' },
      { label: 'Notice', text: 'กินข้าว works as one unit meaning to eat a meal. The question simply wraps คุณ and หรือยัง around it. Three pieces, one friendly question.' },
    ],
  },
  missionRecap: {
    headline: 'Lovely work. Your everyday verbs are getting social.',
    lead: 'Chatting, laughing, and checking in: these are the verbs of friendship.',
    achievements: [
      'Check in with คุณกินข้าวหรือยัง (have you eaten yet?)',
      'Invite a chat with พูดคุย (chat)',
      'Share a laugh with หัวเราะ (laugh)',
      'Say you think of someone with นึกถึง (think about)',
      'Accept a point with ยอมรับ (accept)',
    ],
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
  lessonIntro: {
    lead: 'Verbs for getting things settled: explain, confirm, promise, and guarantee, plus a handy little request you can use whenever you politely need a bit more of something.',
    points: [
      { label: 'You will learn', text: 'Settling verbs like บรรยาย (explain), ยืนยัน (confirm), สัญญา (promise), รับรอง (guarantee), and ทดลอง (test).' },
      { label: 'Why it matters', text: 'Bookings, repairs, and agreements all need confirming words. They help you pin down what was actually promised and by whom. When plans change later, these are the calm words that sort things out.' },
      { label: 'Listen for', text: 'yeuun yan, the phonetic for ยืนยัน. Its two steady syllables come up whenever details are being checked. Expect to hear it around bookings and bills.' },
      { label: 'Notice', text: 'ขอเพิ่มหน่อยครับ reuses a familiar request frame: ขอ plus หน่อย plus ครับ, with เพิ่ม (more) dropped neatly in the middle. One frame, many uses.' },
    ],
  },
  missionRecap: {
    headline: 'Steady work. You can pin down plans and promises.',
    lead: 'Confirming and explaining are the muscles of practical Thai.',
    achievements: [
      'Ask for more with ขอเพิ่มหน่อยครับ (may I have some more)',
      'Double-check with ยืนยัน (confirm)',
      'Make a promise with สัญญา (promise)',
      'Get it guaranteed with รับรอง (guarantee)',
      'Try something out with ทดลอง (test)',
    ],
  },
});
export const STAGE_6_UNIT_QUALITIES = unit({
  unitId: 'stage-6-describing-qualities', stageId: 6,
  title: 'Describing qualities', subtitle: 'Convenient, correct, confused, smart, diligent, strong, warm, familiar.',
  vocabCardIds: [1923, 2053, 2337, 2594, 3034, 2589, 2603, 2256], challengeCardIds: [1923, 2594, 3034],
  // No sentenceCard/builder: the clean Stage 6 adjective sentences are 2-token or
  // idiomatic; this unit is taught as vocabulary and used in sentences elsewhere.
  lessonIntro: {
    lead: 'Describing words with more nuance: convenient, correct, confused, diligent, warm, and familiar. Useful both for compliments and for clear, honest, friendly feedback.',
    points: [
      { label: 'You will learn', text: 'Quality words like สะดวก (convenient), ถูกต้อง (right), สับสน (confused), ขยัน (diligent), and อบอุ่น (warm).' },
      { label: 'Why it matters', text: 'Compliments and honest feedback both run on words like these. Saying something is convenient or correct moves a conversation forward fast. Precise words also make your questions easier to answer.' },
      { label: 'Listen for', text: 'sàp sǒhn, the phonetic for สับสน. Keep it ready for the days when directions or paperwork stop making sense. Naming the feeling is the first step to fixing it.' },
      { label: 'Notice', text: 'Every word in this set has two syllables, like khà yǎn and òp ùn. The even rhythm makes them satisfying to drill out loud in pairs.' },
    ],
  },
  missionRecap: {
    headline: 'Fine work. Your descriptions just got more precise.',
    lead: 'You can now praise, agree, and admit confusion with the right word.',
    achievements: [
      'Call a plan สะดวก (convenient)',
      'Confirm something is ถูกต้อง (right)',
      'Admit you feel สับสน (confused)',
      'Compliment someone as ขยัน (diligent)',
      'Describe a welcome as อบอุ่น (warm)',
    ],
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
  lessonIntro: {
    lead: 'Eight words from Thai menus and kitchens, from noodle soup to fish sauce, plus one short sentence to praise a good meal.',
    points: [
      { label: 'You will learn', text: 'Popular dishes and staples: ก๋วยเตี๋ยว (noodle soup), ผัดไทย (pad thai), ข้าวผัด (fried rice), ขนมปัง (bread), น้ำส้ม (orange juice), น้ำตาล (sugar), กระเทียม (garlic), and น้ำปลา (fish sauce).' },
      { label: 'Why it matters', text: 'You will order food every single day, and knowing dish names and a few common ingredients helps you ask for exactly what you like and steer around what you do not.' },
      { label: 'Listen for', text: 'The little word náam at the start of น้ำส้ม (orange juice), น้ำตาล (sugar), and น้ำปลา (fish sauce). It often signals a drink or liquid, though น้ำตาล (sugar) shows it is not always literal.' },
      { label: 'Notice', text: 'In อาหารไทยอร่อยที่สุด, describing words follow the noun: อาหาร (food) comes first, then ไทย (Thai), then อร่อย (delicious), with ที่สุด (most) closing the sentence.' },
    ],
  },
  missionRecap: {
    headline: 'Great work. Thai menus just got friendlier.',
    lead: 'You are building real restaurant Thai, one dish at a time.',
    achievements: [
      'Order ก๋วยเตี๋ยว (noodle soup) by name',
      'Ask for ผัดไทย (pad thai) or ข้าวผัด (fried rice)',
      'Spot น้ำปลา (fish sauce) and กระเทียม (garlic) in a recipe',
      'Praise a meal with อาหารไทยอร่อยที่สุด (Thai food is the most delicious)',
    ],
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
  lessonIntro: {
    lead: 'Eight verbs for daily routines and working life, plus a sentence pattern that says what you are doing right now.',
    points: [
      { label: 'You will learn', text: 'Action words: อาบน้ำ (take a shower), ทำอาหาร (cook), ช่วยเหลือ (help), ประชุม (meeting), เริ่มต้น (start), เรียนรู้ (learn), สังเกต (notice), and อธิบาย (explain).' },
      { label: 'Why it matters', text: 'These verbs let you describe your day, offer help when it is needed, and follow along when someone explains plans at work or at home. Small, common verbs like these carry a surprising share of daily speech.' },
      { label: 'Listen for', text: 'กำลัง (gamlang) in ตอนนี้ผมกำลังกินข้าว. It sits right before the verb and means the action is happening at this very moment.' },
      { label: 'Notice', text: 'Several verbs here are two-part words: เริ่มต้น (start), เรียนรู้ (learn), and ช่วยเหลือ (help) each pair two pieces, which makes them feel fuller and clearer.' },
    ],
  },
  missionRecap: {
    headline: 'Well done. Your verb toolkit is growing.',
    lead: 'With more action words, you can say what is happening around you.',
    achievements: [
      'Say you are cooking with ทำอาหาร (to cook)',
      'Offer a hand with ช่วยเหลือ (help)',
      'Mention a work ประชุม (meeting)',
      'Ask someone to explain with อธิบาย (explain)',
      'Say what is happening now: ตอนนี้ผมกำลังกินข้าว (right now I am eating)',
    ],
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
  lessonIntro: {
    lead: 'Eight places you will name in taxis and conversations, from the airport to a quiet village, plus the classic taxi sentence.',
    points: [
      { label: 'You will learn', text: 'Key places: สนามบิน (airport), โรงพยาบาล (hospital), โรงเรียน (school), โรงอาหาร (cafeteria), หมู่บ้าน (village), จังหวัด (province), ชนบท (countryside), and ชาวบ้าน (villagers).' },
      { label: 'Why it matters', text: 'Naming your destination clearly is half of every taxi ride, and these words also help you follow talk about where people live, study, and work. They are also the words you will spot on signs and hear in announcements.' },
      { label: 'Listen for', text: 'The repeated opener rohng in โรงพยาบาล (hospital), โรงเรียน (school), and โรงอาหาร (cafeteria). It signals a building, so it is a useful sound to catch.' },
      { label: 'Notice', text: 'The sentence ไปสนามบินครับ needs only three pieces: ไป (to go), the place สนามบิน (airport), and polite ครับ. No extra word for "to" is required.' },
    ],
  },
  missionRecap: {
    headline: 'Strong step. You can name the places that matter.',
    lead: 'Real destinations make your Thai instantly useful on the move.',
    achievements: [
      'Tell a driver ไปสนามบินครับ (to the airport, please)',
      'Say โรงพยาบาล (hospital) when it really counts',
      'Talk about a หมู่บ้าน (village) or the ชนบท (countryside)',
      'Find the โรงอาหาร (cafeteria) by name',
    ],
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
  lessonIntro: {
    lead: 'Position words that guide drivers and friends: in front, behind, opposite, between, plus compass points and one handy stop-here sentence.',
    points: [
      { label: 'You will learn', text: 'Location words: ข้างหน้า (in front), ข้างหลัง (behind), ตรงข้าม (opposite), ระหว่าง (between), ทิศเหนือ (north), ทิศใต้ (south), plus นี่แน่ะ (look here!) and ขอรับ (yes, sir).' },
      { label: 'Why it matters', text: 'Getting out of a taxi at the right spot, or telling someone where a place sits, depends on exactly these small position words. A missed stop often comes down to one missing word, so this little set earns its keep fast.' },
      { label: 'Listen for', text: 'The shared opener tít in ทิศเหนือ (north) and ทิศใต้ (south). When you hear it, a compass direction is on its way.' },
      { label: 'Notice', text: 'ข้างหน้า (in front) and ข้างหลัง (behind) begin with the same first part. Position words often come in matched pairs, so learn them together.' },
    ],
  },
  missionRecap: {
    headline: 'Nicely done. You can point the way.',
    lead: 'Small direction words do big work when you are on the move.',
    achievements: [
      'Stop a driver with จอดข้างหน้าครับ (stop up ahead, please)',
      'Say something is ตรงข้าม (opposite) a landmark',
      'Place things ข้างหลัง (behind) or ข้างหน้า (in front)',
      'Pin a spot with ระหว่าง (between)',
      'Tell ทิศเหนือ (north) from ทิศใต้ (south)',
    ],
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
  lessonIntro: {
    lead: 'Verbs for real conversations: communicating, consulting, negotiating, even quarreling, plus a compliment you will hear and can give back.',
    points: [
      { label: 'You will learn', text: 'Discussion verbs: สื่อสาร (communicate), สนทนา (discuss), ปรึกษา (consult), ชักชวน (persuade), เจรจา (negotiate), กล่าวถึง (mention), คิดเห็น (comment), and ทะเลาะ (quarrel).' },
      { label: 'Why it matters', text: 'These words let you describe how a talk went, ask for advice, and understand when someone wants to discuss or negotiate something with you. They also prepare you to follow faster, more natural speech as conversations get longer.' },
      { label: 'Listen for', text: 'มาก (mâak) at the very end of คุณพูดอังกฤษเก่งมาก. That one small word turns good into very good.' },
      { label: 'Notice', text: 'In the sentence, เก่ง (skilled) comes after พูด (to speak) and อังกฤษ (English). Thai puts the skill after the activity it describes, then adds มาก (very) last.' },
    ],
  },
  missionRecap: {
    headline: 'Nice one. You have words for real conversations.',
    lead: 'Talking about talking is a quiet superpower in a new language.',
    achievements: [
      'Give a compliment with คุณพูดอังกฤษเก่งมาก (you speak English very well)',
      'Ask to consult someone with ปรึกษา (consult)',
      'Talk about negotiating with เจรจา (negotiate)',
      'Bring up a topic with กล่าวถึง (mention)',
      'Name a quarrel with ทะเลาะ (quarrel)',
    ],
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
  lessonIntro: {
    lead: 'Words for the people in your life: family, students, a younger brother, plus one warm sentence for new acquaintances.',
    points: [
      { label: 'You will learn', text: 'People words: ครอบครัว (family), คุณแม่ (mother), น้องชาย (younger brother), แฟนหนุ่ม (boyfriend), นักเรียน (student), ผู้ใหญ่ (adult), เด็กหญิง (girl), and เด็กชาย (boy).' },
      { label: 'Why it matters', text: 'When you meet someone new, family comes up fast. These words help you introduce your people and follow along when others talk about theirs. A few person words also make stories about your day much easier to tell.' },
      { label: 'Listen for', text: 'ดีใจ (dee jai) opening the sentence ดีใจที่ได้เจอคุณ. The feeling word leads, and no separate word for "I" is needed.' },
      { label: 'Notice', text: 'The ending chaai appears in both น้องชาย (younger brother) and เด็กชาย (boy). Spotting shared parts like this makes new people words easier to remember.' },
    ],
  },
  missionRecap: {
    headline: 'Lovely progress. People words bring people closer.',
    lead: 'You can now talk about the people who matter most.',
    achievements: [
      'Welcome a new acquaintance with ดีใจที่ได้เจอคุณ (glad I got to meet you)',
      'Talk about your ครอบครัว (family)',
      'Introduce your น้องชาย (younger brother)',
      'Mention your คุณแม่ (mother)',
      'Tell เด็กชาย (boy) from เด็กหญิง (girl)',
    ],
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
  lessonIntro: {
    lead: 'Connector words that keep a conversation moving: maybe, of course, but, so, and if, plus the most useful repair question a learner can carry.',
    points: [
      { label: 'You will learn', text: 'Connectors: อาจจะ (maybe), แน่นอน (of course), แต่ว่า (but), ดังนั้น (so), ถ้าหาก (if), อย่างไร (how), นอกจาก (in addition to), and จากนั้น (from that).' },
      { label: 'Why it matters', text: 'Linking words turn single phrases into longer thoughts, and the question พูดอีกทีได้ไหมครับ rescues you whenever something goes by too fast. Even a short answer sounds friendlier with the right connector in front of it.' },
      { label: 'Listen for', text: 'ไหม (mǎi) right before ครับ at the end of the sentence. That rising sound is the signal that you are being asked a yes or no question.' },
      { label: 'Notice', text: 'The piece jàak appears in both นอกจาก (in addition to) and จากนั้น (from that). Thai builds many connectors from the same small parts.' },
    ],
  },
  missionRecap: {
    headline: 'Smooth work. Your ideas can link up now.',
    lead: 'Connectors are the glue between everything you have learned.',
    achievements: [
      'Ask for a repeat with พูดอีกทีได้ไหมครับ (could you say it again, please?)',
      'Soften plans with อาจจะ (maybe)',
      'Agree firmly with แน่นอน (of course)',
      'Contrast ideas with แต่ว่า (but)',
      'Set a condition with ถ้าหาก (if)',
    ],
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
  lessonIntro: {
    lead: 'Feeling words from excitement to worry, two ways to smile, and a thank-you sentence for moments that deserve more than a quick thanks.',
    points: [
      { label: 'You will learn', text: 'Emotions: มีความสุข (happy), ตื่นเต้น (excited), แปลกใจ (surprised), ใจร้อน (impatient), ความกังวล (worry), plus รอยยิ้ม (smile), ยิ้มแย้ม (smile widely), and เช่นนั้น (like that).' },
      { label: 'Why it matters', text: 'Naming feelings makes conversations warmer and more honest, and ขอบคุณสำหรับทุกอย่าง is the right send-off for hosts, helpers, and new friends. People remember how you made them feel, and these words help you say it.' },
      { label: 'Listen for', text: 'The repeated sound yím in รอยยิ้ม (smile) and ยิ้มแย้ม (smile widely). One little syllable carries the whole idea of smiling.' },
      { label: 'Notice', text: 'The piece jai sits at the front of ใจร้อน (impatient) and at the end of แปลกใจ (surprised). Thai often builds feeling words around this small piece.' },
    ],
  },
  missionRecap: {
    headline: 'Beautiful work. You can say how you feel.',
    lead: 'Feeling words turn small talk into real talk.',
    achievements: [
      'Say a big thanks with ขอบคุณสำหรับทุกอย่าง (thanks for everything)',
      'Share joy with มีความสุข (happy)',
      'Admit you are ตื่นเต้น (excited)',
      'Name a worry with ความกังวล (worry)',
      'Describe a รอยยิ้ม (smile)',
    ],
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
  lessonIntro: {
    lead: 'Time words that anchor your plans: morning, afternoon, evening, night, and right now, plus one clear sentence about tomorrow.',
    points: [
      { label: 'You will learn', text: 'Time expressions: เดี๋ยวนี้ (right now), ตอนเช้า (morning), ช่วงบ่าย (afternoon), ช่วงเย็น (evening), กลางคืน (night), หลังจาก (after), บ่อยครั้ง (often), and ลงท้าย (finally).' },
      { label: 'Why it matters', text: 'Making plans means saying when. These words let you suggest a morning meetup, an evening meal, or something that has to happen right now. Once the time of day is clear, the rest of the plan usually falls into place.' },
      { label: 'Listen for', text: 'จะ (jà) in พรุ่งนี้ผมจะไปทำงาน. This tiny word before the verb is how Thai points at the future.' },
      { label: 'Notice', text: 'ช่วงบ่าย (afternoon) and ช่วงเย็น (evening) share the same first word, and the time word พรุ่งนี้ (tomorrow) leads the sentence. Time information likes to come up front.' },
    ],
  },
  missionRecap: {
    headline: 'Good going. Your plans now have a clock.',
    lead: 'Saying when is half of making any plan work.',
    achievements: [
      'Talk about tomorrow with พรุ่งนี้ผมจะไปทำงาน (tomorrow I will go to work)',
      'Suggest ตอนเช้า (morning) or ช่วงเย็น (evening)',
      'Say something happens บ่อยครั้ง (often)',
      'Use เดี๋ยวนี้ (right now) when it cannot wait',
      'Sequence events with หลังจาก (after)',
    ],
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
  lessonIntro: {
    lead: 'Four days of the week, the clock, and the new year, plus the question that pins down any meeting time.',
    points: [
      { label: 'You will learn', text: 'Schedule words: วันจันทร์ (Monday), วันอังคาร (Tuesday), วันศุกร์ (Friday), วันเสาร์ (Saturday), นาฬิกา (clock), บัดนี้ (now), ปีใหม่ (new year), and รุ่งเช้า (daylight).' },
      { label: 'Why it matters', text: 'Appointments live and die on days and times. These words plus one good question keep your schedule clear and your meetings on track. Knowing the day names also helps you read posters, timetables, and chat messages.' },
      { label: 'Listen for', text: 'The repeated opener wan in วันจันทร์ (Monday), วันอังคาร (Tuesday), วันศุกร์ (Friday), and วันเสาร์ (Saturday). It tells you a day name is coming.' },
      { label: 'Notice', text: 'In จะมาถึงกี่โมงครับ, the question part กี่โมง (what time) sits inside the sentence rather than at the start, and ครับ still closes it politely.' },
    ],
  },
  missionRecap: {
    headline: 'Solid work. Your week has Thai names now.',
    lead: 'Days plus one time question keep your schedule running.',
    achievements: [
      'Ask arrival time with จะมาถึงกี่โมงครับ (what time will you arrive?)',
      'Plan around วันจันทร์ (Monday) and วันศุกร์ (Friday)',
      'Save วันเสาร์ (Saturday) for the fun stuff',
      'Wish someone a happy ปีใหม่ (new year)',
    ],
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
  lessonIntro: {
    lead: 'Restaurant essentials from ice to dinner, plus the question that ends every shared meal smoothly: can we split the bill?',
    points: [
      { label: 'You will learn', text: 'Dining words: น้ำแข็ง (ice), ข้าวสาร (rice), ข้าวต้ม (boiled rice soup), อาหารเย็น (dinner), ของกิน (things to eat), พ่อครัว (cook), แอปเปิ้ล (apple), and ลูกกวาด (sweet).' },
      { label: 'Why it matters', text: 'Meals with friends always end at the bill. แยกบิลได้ไหมครับ settles it politely, and the food words help you order and chat along the way. A few extra food words also make menus far less mysterious.' },
      { label: 'Listen for', text: 'ได้ (dâai) followed by ไหม (mǎi) near the end of the sentence. This pair turns a plain statement into a polite can-we question.' },
      { label: 'Notice', text: 'ข้าวสาร (rice) and ข้าวต้ม (boiled rice soup) share their first part, khâao. Rice words form a little family you will keep meeting on menus.' },
    ],
  },
  missionRecap: {
    headline: 'Tasty progress. Shared meals just got easier.',
    lead: 'You can handle the food talk and the bill that follows it.',
    achievements: [
      'Ask แยกบิลได้ไหมครับ (can we split the bill?)',
      'Request น้ำแข็ง (ice) for your drink',
      'Order ข้าวต้ม (boiled rice soup)',
      'Talk about อาหารเย็น (dinner) plans',
      'Compliment the พ่อครัว (cook)',
    ],
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
  lessonIntro: {
    lead: 'Eight doing words for getting ready, fixing, and improving things, plus a sentence that gets a driver to take you exactly where you point.',
    points: [
      { label: 'You will learn', text: 'Action verbs: สัมผัส (touch), ประกอบ (put together), ปรับปรุง (improve), เพิ่มเติม (add), ประดับ (decorate), แต่งตัว (dress), เตรียมตัว (get ready), and กระโดด (jump).' },
      { label: 'Why it matters', text: 'These verbs cover real daily situations, from getting dressed to making improvements, and the taxi sentence works anywhere you can show an address. Verbs like these also help you understand simple instructions when someone shows you what to do.' },
      { label: 'Listen for', text: 'The pair ได้ (dâai) and ไหม (mǎi) closing พาผมไปที่นี่ได้ไหม. Together they ask permission softly: can you?' },
      { label: 'Notice', text: 'Two verbs sit side by side in the sentence: พา (to take) and then ไป (to go). Thai often chains verbs directly, one right after another.' },
    ],
  },
  missionRecap: {
    headline: 'Excellent. Your action words multiplied.',
    lead: 'Everyday verbs make everyday life easier to describe.',
    achievements: [
      'Show an address and say พาผมไปที่นี่ได้ไหม (can you take me here?)',
      'Say you are getting ready with เตรียมตัว (get ready)',
      'Talk about getting dressed with แต่งตัว (dress)',
      'Suggest changes with ปรับปรุง (improve)',
      'Add something extra with เพิ่มเติม (add)',
    ],
  },
});
export const STAGE_7_UNIT_QUALITIES = unit({
  unitId: 'stage-7-describing-things', stageId: 7,
  title: 'Describing things', subtitle: 'Cute, many, ordinary, clear, neat, different, safe, dangerous.',
  vocabCardIds: [76, 1744, 1828, 1846, 1970, 2048, 2147, 2140], challengeCardIds: [76, 2048, 2147],
  // No sentenceCard/builder: the clean Stage 7 adjective sentences are 2-token or
  // idiomatic; this unit is taught as vocabulary and used in sentences elsewhere.
  lessonIntro: {
    lead: 'Eight describing words that bring opinions to life: cute, neat, clear, different, and the important pair of safe and dangerous.',
    points: [
      { label: 'You will learn', text: 'Descriptions: น่ารัก (cute), มากมาย (many), ธรรมดา (plain, normal), ชัดเจน (clear), เรียบร้อย (neat), แตกต่าง (different), ปลอดภัย (safe), and อันตราย (danger).' },
      { label: 'Why it matters', text: 'Describing words let you react to the world, praise what you see, and ask whether a place or a plan is safe before you commit to it. One good describing word often says more than a whole struggling sentence.' },
      { label: 'Listen for', text: 'The echoing syllables of มากมาย (mâak maai). The two halves start with the same sound, which makes this word for many easy to catch by ear.' },
      { label: 'Notice', text: 'ปลอดภัย (safe) and อันตราย (danger) form a natural opposite pair. Learning them together means you can both reassure people and warn them.' },
    ],
  },
  missionRecap: {
    headline: 'Sharp eye. You can describe what you see.',
    lead: 'Opinions and descriptions make your Thai feel alive.',
    achievements: [
      'Call something น่ารัก (cute)',
      'Check safety with ปลอดภัย (safe)',
      'Warn about อันตราย (danger)',
      'Point out something แตกต่าง (different)',
      'Praise tidy work with เรียบร้อย (neat)',
    ],
  },
});
export const STAGE_7_UNIT_NATURE = unit({
  unitId: 'stage-7-nature-outdoors', stageId: 7,
  title: 'Nature and outdoors', subtitle: 'River, nature, tree, flower, sky, sunlight, beach, lotus.',
  vocabCardIds: [611, 1863, 2208, 2416, 3192, 3514, 3618, 4296], challengeCardIds: [611, 2208, 3618],
  // No sentenceCard/builder: Stage 7 has no clean nature sentence to tokenize;
  // taught as vocabulary, used in sentences elsewhere.
  lessonIntro: {
    lead: 'Nature words for trips out of the city: rivers, trees, flowers, the sky, sunlight, and the beach, all in one small set.',
    points: [
      { label: 'You will learn', text: 'Outdoor words: แม่น้ำ (river), ธรรมชาติ (nature), ต้นไม้ (tree), ดอกไม้ (flower), ดอกบัว (lotus flower), ท้องฟ้า (sky), แสงแดด (sunlight), and ชายหาด (beach).' },
      { label: 'Why it matters', text: 'Trips to beaches, rivers, and gardens fill many free days. These words help you talk about what you saw and plan where to go next. They are handy for photos, walks, and weekend stories too.' },
      { label: 'Listen for', text: 'The shared ending máai in ต้นไม้ (tree) and ดอกไม้ (flower). Hearing it tells you a plant word just went by.' },
      { label: 'Notice', text: 'ดอกไม้ (flower) and ดอกบัว (lotus flower) start with the same piece. Thai builds plant names from small reusable parts, so each new word helps with the next one.' },
    ],
  },
  missionRecap: {
    headline: 'Fresh progress. The outdoors has Thai names now.',
    lead: 'Nature words turn trips and views into conversation.',
    achievements: [
      'Plan a day at the ชายหาด (beach)',
      'Point out a แม่น้ำ (river)',
      'Admire a ดอกบัว (lotus flower)',
      'Talk about ธรรมชาติ (nature) on your travels',
      'Describe แสงแดด (sunlight) and the ท้องฟ้า (sky)',
    ],
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
  lessonIntro: {
    lead: 'A short, practical set for getting around town: places to eat, ride, and buy medicine, plus three things you will order again and again.',
    points: [
      { label: 'You will learn', text: 'Six words for daily errands: ร้านอาหาร (restaurant), รถไฟฟ้า (skytrain), and ร้านขายยา (pharmacy), plus the orders น้ำเปล่า (plain water), น้ำผลไม้ (fruit juice), and ข้าวเหนียว (sticky rice).' },
      { label: 'Why it matters', text: 'Eating, riding, and finding a pharmacy fill most days out. Naming the place you need makes every request faster and far less stressful.' },
      { label: 'Listen for', text: 'The question particle ไหม in ใกล้ไหมครับ (is it close?). Its rising sound is what turns a plain statement into a yes or no question.' },
      { label: 'Notice', text: 'Both ร้านอาหาร (restaurant) and ร้านขายยา (pharmacy) open with the same shop word, and น้ำเปล่า and น้ำผลไม้ share the word for water. Thai builds new names from familiar parts.' },
    ],
  },
  missionRecap: {
    headline: 'Great work. You can name the places a day out depends on.',
    lead: 'Real errands need real words, and you just picked up six of them.',
    achievements: [
      'Find food with ร้านอาหาร (restaurant)',
      'Ride the city with รถไฟฟ้า (skytrain)',
      'Get medicine help at ร้านขายยา (pharmacy)',
      'Order น้ำเปล่า (plain water) or น้ำผลไม้ (fruit juice)',
      'Ask ใกล้ไหมครับ (is it close?)',
    ],
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
  lessonIntro: {
    lead: 'Family comes up in nearly every friendly chat. This unit gathers child, sibling, and grandparent words, plus two respectful society terms, manners and king.',
    points: [
      { label: 'You will learn', text: 'Words for people around you: เด็กผู้ชาย (boy), เด็กผู้หญิง (girl), and ปู่ย่า / ตายาย (grandparent), along with two society words, มารยาท (manners) and พระราชา (king).' },
      { label: 'Why it matters', text: 'When neighbors and hosts chat, talk turns to family quickly. Knowing a few person words helps you follow the conversation and add to it.' },
      { label: 'Listen for', text: 'อะไร (what) tucked inside คุณชื่ออะไรครับ (what is your name?). In Thai the question word follows the noun instead of leading the sentence.' },
      { label: 'Notice', text: 'เด็กผู้ชาย (boy) and เด็กผู้หญิง (girl) begin exactly the same way. Only the final part changes, and that small ending is what marks male or female.' },
    ],
  },
  missionRecap: {
    headline: 'Well done. Family talk just got easier to follow.',
    lead: 'You are ready for the family questions that friendly chats bring.',
    achievements: [
      'Point out เด็กผู้ชาย (boy) and เด็กผู้หญิง (girl)',
      'Talk about ปู่ย่า / ตายาย (grandparents)',
      'Bring up มารยาท (manners) when politeness matters',
      'Recognize พระราชา (king)',
      'Ask คุณชื่ออะไรครับ (what is your name?)',
    ],
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
  lessonIntro: {
    lead: 'Everyone, no one, somebody, nothing: these little pointer words let you talk about people and things without naming a single one of them, and they appear constantly in everyday speech.',
    points: [
      { label: 'You will learn', text: 'A set of wide-reaching pronouns: ทุกสิ่งทุกอย่าง (everything), ใครบางคน (somebody), ไม่มีใคร (nobody), and ไม่มีอะไร (nothing), plus the possessive ของพวกเขา (their) for talking about other people\'s things.' },
      { label: 'Why it matters', text: 'Honest answers often need vague words. With somebody, nothing, and everything you can reply truthfully even when you do not know or remember the details.' },
      { label: 'Listen for', text: 'The same who sound running through ใครก็ตาม (anybody), ไม่มีใคร (nobody), and ใครบางคน (somebody). One tiny word anchors all three.' },
      { label: 'Notice', text: 'ไม่มีใคร (nobody) and ไม่มีอะไร (nothing) open identically, then swap one word at the end. Learn the frame once and you get both phrases.' },
    ],
  },
  missionRecap: {
    headline: 'Strong step. You can point at people and things without naming them.',
    lead: 'These small pronouns quietly carry a lot of everyday Thai.',
    achievements: [
      'Say ยินดีที่ได้รู้จัก (nice to meet you)',
      'Cover it all with ทุกสิ่งทุกอย่าง (everything)',
      'Reply with ไม่มีอะไร (nothing)',
      'Mention ใครบางคน (somebody)',
      'Say ไม่มีใคร (nobody) when no one is around',
    ],
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
  lessonIntro: {
    lead: 'Eight month names, January through August, plus a handy sentence for telling someone exactly how long you plan to stay.',
    points: [
      { label: 'You will learn', text: 'The first eight months of the year, from เดือนมกราคม (January) and เดือนกุมภาพันธ์ (February) all the way through เดือนกรกฎาคม (July) and เดือนสิงหาคม (August).' },
      { label: 'Why it matters', text: 'Bookings, visa dates, and travel plans all hang on month names. Saying the right one slowly and clearly prevents confusing and expensive mix-ups.' },
      { label: 'Listen for', text: 'The shared opening sound of every month here, easy to catch in เดือนมีนาคม (March) and เดือนมิถุนายน (June). That repeated first word simply means month.' },
      { label: 'Notice', text: 'In ผมจะอยู่หนึ่งอาทิตย์ (I will stay for one week), the small word จะ sits before the verb to mark the future. Watch for it whenever plans come up.' },
    ],
  },
  missionRecap: {
    headline: 'Month by month, your calendar Thai is growing.',
    lead: 'One month at a time, your dates and plans get clearer.',
    achievements: [
      'Name เดือนมกราคม (January) at the start of the year',
      'Say เดือนเมษายน (April) when booking ahead',
      'Finish the set with เดือนสิงหาคม (August)',
      'Tell hosts ผมจะอยู่หนึ่งอาทิตย์ (I will stay for one week)',
    ],
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
  lessonIntro: {
    lead: 'Two days of the week, the words for tomorrow and yesterday, and a handful of when markers that put your plans in order.',
    points: [
      { label: 'You will learn', text: 'Time anchors for real plans: วันอาทิตย์ (Sunday), วันพฤหัสบดี (Thursday), วันพรุ่งนี้ (tomorrow), and เมื่อวานนี้ (yesterday), plus the softer markers ขณะนี้ (now) and ในไม่ช้า (soon).' },
      { label: 'Why it matters', text: 'Meetups only happen when both people agree on the day. These words let you anchor a plan to a date or gently push it back to later in the week.' },
      { label: 'Listen for', text: 'พรุ่งนี้ (tomorrow) landing at the very end of แล้วเจอกันพรุ่งนี้ (see you tomorrow). Thai often saves the time word for last.' },
      { label: 'Notice', text: 'Sunday, Thursday, and tomorrow all begin with the same day word: compare วันอาทิตย์, วันพฤหัสบดี, and วันพรุ่งนี้. Spot that shared start and new day words get easier.' },
    ],
  },
  missionRecap: {
    headline: 'Good work. Your plans now come with a clear when.',
    lead: 'You can now pin a plan to a day, or push it to soon.',
    achievements: [
      'Pick a day with วันอาทิตย์ (Sunday) or วันพฤหัสบดี (Thursday)',
      'Look back with เมื่อวานนี้ (yesterday)',
      'Promise ในไม่ช้า (soon)',
      'Move a story along with หลังจากนั้น (then)',
      'Part with แล้วเจอกันพรุ่งนี้ (see you tomorrow)',
    ],
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
  lessonIntro: {
    lead: 'From the university to the museum, this unit names a few of the public buildings around town and the staff you will meet inside them.',
    points: [
      { label: 'You will learn', text: 'Places around town: มหาวิทยาลัย (university), ห้องสมุด (library), พิพิธภัณฑ์ (museum), ที่ทำงาน (office), and ร้านค้า (shop), plus เจ้าหน้าที่ (staff), the person who can actually help you.' },
      { label: 'Why it matters', text: 'Asking where something is only works if you can name the place. These words cover study, errands, and official business in one small set.' },
      { label: 'Listen for', text: 'ที่ไหน (where) inside อยู่ที่ไหนครับ (where is it?). This tiny question follows you through every search for a building or an office.' },
      { label: 'Notice', text: 'Official words run long here: มหาวิทยาลัย (university) and ข้าราชการ (government officer) carry many syllables. Take them slowly, piece by piece, and they stop being intimidating.' },
    ],
  },
  missionRecap: {
    headline: 'Nice. You can name the big buildings in town.',
    lead: 'From the library to the office, you know what to ask for.',
    achievements: [
      'Ask for ห้องสมุด (library) or พิพิธภัณฑ์ (museum)',
      'Say where you work with ที่ทำงาน (office)',
      'Spot เจ้าหน้าที่ (staff) when you need help',
      'Ask อยู่ที่ไหนครับ (where is it?)',
    ],
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
  lessonIntro: {
    lead: 'East, west, left, and how far: compass and route words for getting yourself pointed the right way, plus a short sentence every taxi ride eventually needs.',
    points: [
      { label: 'You will learn', text: 'Direction basics: ตะวันออก (east), ทิศตะวันตก (west), and ด้านซ้าย (left), together with ระยะทาง (distance) and the connector พร้อมทั้ง (along with) for joining details.' },
      { label: 'Why it matters', text: 'Rides and walking routes run on direction words. A clear left or east spoken at the right moment can save you a long detour.' },
      { label: 'Listen for', text: 'จอด (to stop / park) opening จอดที่นี่ครับ (stop here). The sentence starts straight at the verb, with no I or you needed.' },
      { label: 'Notice', text: 'Thai gives you two distance words here, ระยะทาง and ระยะห่าง, opening the same way. The compass pair ทิศตะวันตก (west) and ทิศตะวันออก (east) matches the same pattern.' },
    ],
  },
  missionRecap: {
    headline: 'Good going. You can steer a ride with real direction words.',
    lead: 'Every ride gets easier when you can say which way to go.',
    achievements: [
      'Point the way with ด้านซ้าย (left)',
      'Tell east from west with ตะวันออก and ทิศตะวันตก',
      'Talk about ระยะทาง (distance)',
      'Tell the driver จอดที่นี่ครับ (stop here)',
    ],
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
  lessonIntro: {
    lead: 'Touring, swimming, exercising, exchanging: a verb set for active days out, finished with the one sentence you hope to never need on a trip.',
    points: [
      { label: 'You will learn', text: 'Activity verbs for days out: ท่องเที่ยว (tour), ว่ายน้ำ (swim), ออกกำลังกาย (exercise), and แลกเปลี่ยน (exchange), plus a careful pair, หลีกเลี่ยง (avoid) and เอาชนะ (win).' },
      { label: 'Why it matters', text: 'These verbs describe what travelers actually do all day. They let you share plans, ask about activities, and understand what new friends suggest.' },
      { label: 'Listen for', text: 'หลงทาง (to be lost) in ผมหลงทางครับ (I am lost). Recognize it instantly, whether you are saying it or hearing someone else say it.' },
      { label: 'Notice', text: 'The long word เดินทางท่องเที่ยว (travel) carries the shorter ท่องเที่ยว (tour) whole inside it. Thai often grows a bigger word by joining smaller ones together.' },
    ],
  },
  missionRecap: {
    headline: 'Solid work. Your active days have their verbs now.',
    lead: 'Your trips now come with verbs, and a safety phrase too.',
    achievements: [
      'Talk trips with ท่องเที่ยว (tour)',
      'Plan a swim with ว่ายน้ำ',
      'Mention ออกกำลังกาย (exercise)',
      'Sidestep trouble with หลีกเลี่ยง (avoid)',
      'Get help fast with ผมหลงทางครับ (I am lost)',
    ],
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
  lessonIntro: {
    lead: 'Welcome to glue-word territory: only, especially, at least, anyway. These small connectors do not name things, they sharpen exactly what you mean.',
    points: [
      { label: 'You will learn', text: 'Five shading words: เท่านั้น (only), โดยเฉพาะ (especially), อย่างน้อย (at least), นอกจากนั้น (besides that), and โดยทั่วไป (generally), each one adjusting how strong a statement sounds.' },
      { label: 'Why it matters', text: 'Connectors turn short statements into real opinions. With only, especially, and at least in place, what you say gets much closer to what you actually think.' },
      { label: 'Listen for', text: 'อีกที (again / one more time) in พูดอีกทีครับ (say it again please). This is the phrase that politely rescues you when speech moves too fast.' },
      { label: 'Notice', text: 'Three connectors here open the same way: อย่างน้อย (at least), อย่างไรก็ตาม (anyway), and อย่างยิ่ง (extremely). Spotting a shared opening makes long words far less scary.' },
    ],
  },
  missionRecap: {
    headline: 'Big step. Your sentences can carry real nuance.',
    lead: 'Little connector words, big upgrade to how precise you sound.',
    achievements: [
      'Limit things with เท่านั้น (only)',
      'Highlight favorites with โดยเฉพาะ (especially)',
      'Soften claims with อย่างน้อย (at least)',
      'Add more with นอกจากนั้น (besides that)',
      'Ask พูดอีกทีครับ (say it again please)',
    ],
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
  lessonIntro: {
    lead: 'Where you live and the paperwork that comes with it: rooms and apartments on one side, passports, passwords, and fees on the other.',
    points: [
      { label: 'You will learn', text: 'Settling-in words: ห้องนั่งเล่น (living room) and อพาร์ทเมนท์ (apartment) for home, then รหัสผ่าน (password), พาสปอร์ต (passport), บัตรเครดิต (credit card), and ค่าธรรมเนียม (fee) for the practical side.' },
      { label: 'Why it matters', text: 'Living somewhere new means forms, counters, and wifi logins. Naming the document or the fee in question keeps those moments short and calm.' },
      { label: 'Listen for', text: 'ตรวจคนเข้าเมือง (immigration), said trùat khon khâo mueang. It is long and official, and worth recognizing the moment a counter agent says it.' },
      { label: 'Notice', text: 'The question คุณอยู่ที่ไหน (where do you live?) needs no extra words for do or is. Subject, verb, question word: three pieces and the sentence is complete.' },
    ],
  },
  missionRecap: {
    headline: 'Smooth work. The paperwork side of life just got easier.',
    lead: 'Forms and fees feel smaller once you can name them.',
    achievements: [
      'Name your place: อพาร์ทเมนท์ (apartment) or บ้านเรือน (house)',
      'Ask about the รหัสผ่าน (password)',
      'Keep your พาสปอร์ต (passport) ready at ตรวจคนเข้าเมือง (immigration)',
      'Check the ค่าธรรมเนียม (fee) before paying',
      'Ask คุณอยู่ที่ไหน (where do you live?)',
    ],
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
  lessonIntro: {
    lead: 'Consider, decide, support, deny: this unit hands you the verbs of weighing your options carefully and saying where you stand once you have.',
    points: [
      { label: 'You will learn', text: 'Verbs for serious moments: พิจารณา (consider), ตัดสินใจ (decide), สนับสนุน (support), and ปฏิเสธ (deny), plus เปลี่ยนแปลง (change) for when plans need rewriting.' },
      { label: 'Why it matters', text: 'Grown-up conversations turn on these verbs. They let you say clearly what you support, what you politely refuse, and what you would honestly like to change.' },
      { label: 'Listen for', text: 'ตัดสินใจ (decide), said dtàt sǐn jai: three crisp beats you will hear whenever a real choice is on the table.' },
      { label: 'Notice', text: 'In ผมอยากไปที่นั่น (I want to go there), อยาก (to want to) sits directly before ไป (to go). Want plus a verb is how Thai states an intention.' },
    ],
  },
  missionRecap: {
    headline: 'Decisive. You now have verbs for making up your mind.',
    lead: 'Choices, support, refusals: you have words for all three.',
    achievements: [
      'Weigh options with พิจารณา (consider)',
      'Commit with ตัดสินใจ (decide)',
      'Back an idea with สนับสนุน (support)',
      'Turn things down with ปฏิเสธ (deny)',
      'State a goal: ผมอยากไปที่นั่น (I want to go there)',
    ],
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
  lessonIntro: {
    lead: 'Time to react like yourself: interesting, fun, impressed, honest, fair, modern. This unit collects words for sharing real impressions of people and places.',
    points: [
      { label: 'You will learn', text: 'A palette of impression words: น่าสนใจ (interesting), สนุกสนาน (fun), and ประทับใจ (impressed) for reactions, then ซื่อสัตย์ (honest), ยุติธรรม (fair), and สมัยใหม่ (modern) for describing people and places.' },
      { label: 'Why it matters', text: 'Sharing what you like is how friendships start. These adjectives carry your honest reactions well past a plain good or a plain bad.' },
      { label: 'Listen for', text: 'The little word เลย closing ผมชอบมากเลย (I really like it). It adds emphasis, working like a spoken exclamation point.' },
      { label: 'Notice', text: 'สนุกสนาน (fun) is said sà nòok sà nǎan, with its opening sound repeated. Thai sometimes doubles a word\'s rhythm this way, and it makes the word easier to remember.' },
    ],
  },
  missionRecap: {
    headline: 'Lovely work. Your opinions have real color now.',
    lead: 'Honest reactions make better conversations, and you have them now.',
    achievements: [
      'Call something น่าสนใจ (interesting)',
      'Praise a day as สนุกสนาน (fun)',
      'Say you are ประทับใจ (impressed)',
      'Describe a friend as ซื่อสัตย์ (honest)',
      'Gush a little with ผมชอบมากเลย (I really like it)',
    ],
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
  lessonIntro: {
    lead: 'Sacred, public, complex, progress: a compact set of idea words. They are abstract, but they unlock signs, news, and deeper conversations with Thai friends.',
    points: [
      { label: 'You will learn', text: 'Idea words for bigger topics: ศักดิ์สิทธิ์ (sacred), อนุรักษ์ (conserve), สามัคคี (harmony), and สาธารณะ (public), alongside ซับซ้อน (complex) and ก้าวหน้า (progress).' },
      { label: 'Why it matters', text: 'Notices, public signs, news, and thoughtful chats all lean on abstract words like these. A small set of them lets you follow ideas, not just name objects.' },
      { label: 'Listen for', text: 'ซับซ้อน (complex), said sáp sáawn: its two echoing syllables make this word surprisingly easy to catch even in fast everyday speech.' },
      { label: 'Notice', text: 'In คนไทยใจดีมาก (Thai people are very kind), the description ใจดี (kind) follows คนไทย (Thai people) directly, and มาก (very) comes last. No extra word for are is needed.' },
    ],
  },
  missionRecap: {
    headline: 'Impressive. You can touch big ideas in Thai.',
    lead: 'Idea words are a quiet superpower for signs, news, and chats.',
    achievements: [
      'Recognize สาธารณะ (public) on signs and notices',
      'Describe a problem as ซับซ้อน (complex)',
      'Talk about ก้าวหน้า (progress)',
      'Call a place ศักดิ์สิทธิ์ (sacred)',
      'Offer the compliment คนไทยใจดีมาก (Thai people are very kind)',
    ],
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
