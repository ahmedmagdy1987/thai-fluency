#!/usr/bin/env node
// Imports Thai vocabulary from Anki TSV exports in sentence/ folder.
// Outputs src/data/cards-imported.js. Run from project root:
//   node scripts/import-cards.js [--limit N]

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { STAGES } from '../src/data/taxonomy.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const args = process.argv.slice(2);
const limitIdx = args.indexOf('--limit');
const LIMIT = limitIdx >= 0 ? parseInt(args[limitIdx + 1], 10) : Infinity;
const PRINT_SAMPLE = args.includes('--print');

// ---------- TSV parser (handles "..."" quote-wrapped fields) ----------
function parseTSV(content) {
  const rows = [];
  for (const line of content.split(/\r?\n/)) {
    if (!line || line.startsWith('#')) continue;
    const fields = [];
    let cur = '', inQ = false, i = 0;
    while (i < line.length) {
      const ch = line[i];
      if (inQ) {
        if (ch === '"' && line[i + 1] === '"') { cur += '"'; i += 2; continue; }
        if (ch === '"') { inQ = false; i++; continue; }
        cur += ch; i++;
      } else {
        if (ch === '\t') { fields.push(cur); cur = ''; i++; continue; }
        if (ch === '"' && cur === '') { inQ = true; i++; continue; }
        cur += ch; i++;
      }
    }
    fields.push(cur);
    rows.push(fields);
  }
  return rows;
}

// ---------- Phonetic conversion (HTML tone spans → diacritic form) ----------
const TONE_MARKS = {
  L: { a: 'à', e: 'è', i: 'ì', o: 'ò', u: 'ù' },
  F: { a: 'â', e: 'ê', i: 'î', o: 'ô', u: 'û' },
  H: { a: 'á', e: 'é', i: 'í', o: 'ó', u: 'ú' },
  R: { a: 'ǎ', e: 'ě', i: 'ǐ', o: 'ǒ', u: 'ǔ' },
  M: null,
};

function applyTone(word, toneClass) {
  if (!word) return '';
  if (toneClass === 'M' || !toneClass) return word;
  const map = TONE_MARKS[toneClass];
  if (!map) return word;
  for (let i = 0; i < word.length; i++) {
    const ch = word[i].toLowerCase();
    if (map[ch]) return word.slice(0, i) + map[ch] + word.slice(i + 1);
  }
  return word;
}

function convertTonePhonetic(html) {
  if (!html) return '';
  const regex = /<span\s+class="?tone\s+([MLHFR])"?>([^<]+)<\/span>/gi;
  const parts = [];
  let m;
  while ((m = regex.exec(html))) parts.push(applyTone(m[2].trim(), m[1].toUpperCase()));
  return parts.join(' ').trim();
}

// ---------- Helpers ----------
const stripSound = (s) => (s || '').replace(/\[sound:[^\]]+\]/g, '').trim();
const stripBrackets = (s) => (s || '').replace(/\s*\[[^\]]+\]\s*/g, ' ').replace(/\s+/g, ' ').trim();

function shortenEnglish(s) {
  if (!s) return '';
  let txt = s.replace(/<br\s*\/?>/gi, ' ; ').replace(/^-\s*/gm, '').replace(/\s*-\s+/g, ' ; ');
  // Strip [bracketed grammatical/usage notes] — they leak into card display
  txt = txt.replace(/\[[^\]]+\]/g, ' ').replace(/\s+/g, ' ').trim();
  const parts = txt.split(/\s*;\s*/).map(p => p.trim()).filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0];
  return parts.slice(0, 2).join(' / ');
}

// ---------- Read sources ----------
const SENT = resolve(ROOT, 'sentence');
const freq4000 = parseTSV(readFileSync(resolve(SENT, 'Freq 4000.txt'), 'utf8'));
const thaiSent = parseTSV(readFileSync(resolve(SENT, 'Thai.txt'), 'utf8'));
const tflist = parseTSV(readFileSync(resolve(SENT, 'ThaiFrequencyList.txt'), 'utf8'));
const thai1000 = parseTSV(readFileSync(resolve(SENT, 'thai 1000 words.txt'), 'utf8'));

// ---------- Build phonetic cross-reference index ----------
const phByThai = new Map();
for (const r of thai1000) {
  const thai = stripBrackets(r[4]);
  const ph = (r[5] || '').trim();
  if (thai && ph && !phByThai.has(thai)) phByThai.set(thai, ph);
}
for (const r of tflist) {
  const thai = (r[3] || '').trim();
  const ph = convertTonePhonetic(r[5]);
  if (thai && ph && !phByThai.has(thai)) phByThai.set(thai, ph);
}

// ---------- Read existing cards.js for dedup + max id ----------
const cardsContent = readFileSync(resolve(ROOT, 'src/data/cards.js'), 'utf8');
const existingThai = new Set();
let maxId = 0;
const cardObjRegex = /\{\s*id:\s*(\d+)[^}]*?thai:\s*['"]([^'"]+)['"]/g;
let cm;
while ((cm = cardObjRegex.exec(cardsContent))) {
  const id = parseInt(cm[1], 10);
  if (id > maxId) maxId = id;
  existingThai.add(cm[2]);
}

// ---------- Classification ----------
const POS_TO_CAT = {
  Pronoun: 'pronouns', Verb: 'verbs', Adjective: 'adjectives', Adverb: 'adverbs',
  Particle: 'grammar', Preposition: 'grammar', Conjunction: 'grammar', Prefix: 'grammar',
  Number: 'numbers', Numeral: 'numbers',
  pro: 'pronouns', verb: 'verbs', adj: 'adjectives', adv: 'adverbs',
  pre: 'grammar', con: 'grammar', number: 'numbers', int: 'grammar', exp: 'fluency',
};

const KEYWORD_CAT = [
  ['food', /\b(eat|food|drink|rice|noodle|cook|fruit|meat|fish|chicken|pork|spicy|sweet|salt|sugar|water|coffee|tea|beer|cup|plate|meal|breakfast|lunch|dinner|hungry|thirsty|delicious|chili|herb|sauce|soup|bread|egg|milk|vegetable|sour|bitter|salty|banana|mango|apple|orange|pineapple)/i],
  ['home', /\b(house|home|room|door|window|wall|roof|kitchen|bedroom|bathroom|toilet|shower|bed|table|chair|sofa|fridge|stove|tv|television|aircon|fan|broken|repair|rent|condo|apartment|electricity|wifi|internet|garden|floor|ceiling|key|lock)/i],
  ['body', /\b(head|hair|face|eye|nose|mouth|ear|tooth|tongue|neck|shoulder|arm|hand|finger|leg|foot|toe|stomach|back|chest|skin|bone|blood|heart|brain|throat|hip|knee|elbow|cheek|lip|nail)/i],
  ['health', /\b(sick|hurt|pain|ache|fever|cold|cough|medicine|pharmacy|doctor|hospital|clinic|injure|injury|dizzy|allergy|flu|nausea|wound|bandage|prescription|disease|infection|surgery|nurse|patient|symptom|treatment|cure|ill|recover)/i],
  ['emergency', /\b(emergency|police|fire|accident|danger|warn|thief|robber|attack|rescue|save|escape)/i],
  ['colors', /\b(red|blue|green|yellow|black|white|pink|purple|orange|brown|grey|gray|colour|color|gold|silver)/i],
  ['time', /\b(time|hour|minute|second|day|week|month|year|today|tomorrow|yesterday|morning|afternoon|evening|night|noon|midnight|now|later|early|late|before|after|monday|tuesday|wednesday|thursday|friday|saturday|sunday|january|february|march|april|may|june|july|august|september|october|november|december|date|clock|calendar|weekend|holiday)/i],
  ['weather', /\b(rain|sun|cloud|wind|hot|cold|warm|cool|storm|thunder|lightning|weather|sky|temperature|humid|snow|fog|flood|nature|tree|flower|plant|leaf|forest|mountain|river|ocean|sea|beach|island|grass|stone|rock)/i],
  ['emotions', /\b(happy|sad|angry|scared|afraid|love|hate|like|enjoy|fun|bored|tired|excited|nervous|worry|calm|jealous|proud|shy|embarrass|surprise|relax|stress|lonely|grateful|disappointed|comfortable|jai|feeling|emotion|mood|cry|laugh|smile|frown)/i],
  ['places', /\b(market|temple|hotel|airport|station|hospital|school|university|bank|park|store|shop|mall|restaurant|bar|cafe|office|building|city|town|village|country|province|district|library|museum|theater|theatre|station|gym)/i],
  ['people', /\b(mother|father|mom|dad|son|daughter|brother|sister|baby|child|kid|family|husband|wife|boyfriend|girlfriend|friend|neighbor|person|man|woman|boy|girl|adult|elder|grandparent|grandmother|grandfather|aunt|uncle|cousin|nephew|niece|relative|king|queen|prince|priest|monk|teacher|student|engineer|farmer|driver)/i],
  ['shopping', /\b(buy|sell|price|cost|money|cheap|expensive|discount|pay|cash|card|baht|dollar|change|receipt|bag)/i],
  ['directions', /\b(left|right|straight|turn|north|south|east|west|near|far|here|there|behind|front|opposite|across|along|past|distance|close|away|between)/i],
];

// English-content overrides — run BEFORE POS to fix tflist's mis-tagged words
// (e.g. หาก "if" tagged as Adjective → must be grammar)
const OVERRIDE_BY_EN = [
  // Conjunctions/connectors → grammar
  [/^(if|when|because|since|therefore|though|although|while|whereas|until|unless|whether|but|and|or|so|hence|thus)$/i, 'grammar'],
  // Personal/relative/indefinite pronouns → pronouns
  [/^(he|she|it|they|we|us|them|him|her|i|me|you|who|whom|whose|everyone|everybody|someone|somebody|anyone|anybody|nobody|something|nothing|everything|anything)$/i, 'pronouns'],
  // Time adverbs → time
  [/^(now|then|already|still|just|yet|soon|always|never|sometimes|often|rarely|usually|recently|currently|forever|eventually|finally|today|tomorrow|yesterday|tonight)$/i, 'time'],
  // Quantifiers → adjectives (NOT pronouns)
  [/^(many|some|every|all|few|several|each|none|both|either|neither|much|more|less|most|least|enough|various|certain|any)$/i, 'adjectives'],
];

function classify(thai, en, posTags) {
  const enLower = (en || '').toLowerCase();
  // First sense only — gloss is "; "-separated, override should match the primary meaning
  const firstSense = enLower.split(/[;/]/)[0].trim();
  for (const [regex, cat] of OVERRIDE_BY_EN) if (regex.test(firstSense)) return cat;
  for (const tag of posTags) if (POS_TO_CAT[tag]) return POS_TO_CAT[tag];
  for (const [cat, regex] of KEYWORD_CAT) if (regex.test(enLower)) return cat;
  return 'things';
}

// phReview detection: tflist conversion applied tone diacritic; flag any output with
// multi-vowel syllables so user can audit diacritic placement (e.g. khôei vs khoêi).
const VOWEL_RE = /[aeiouàáâǎèéêěìíîǐòóôǒùúûǔ]/;
function hasMultiVowelSyllable(ph) {
  for (const word of ph.split(/\s+/)) {
    let count = 0;
    for (const ch of word) if (VOWEL_RE.test(ch)) count++;
    if (count > 1) return true;
  }
  return false;
}

// Map cat → stage via STAGES.cats (first stage that lists the cat wins)
const CAT_TO_STAGE = new Map();
for (const stage of STAGES) {
  for (const cat of stage.cats) {
    if (!CAT_TO_STAGE.has(cat)) CAT_TO_STAGE.set(cat, stage.id);
  }
}

// ---------- Build merged card list (priority: thai1000 > tflist > freq4000-xref) ----------
const merged = new Map();

for (const r of thai1000) {
  if (r.length < 6) continue;
  const en = (r[3] || '').trim();
  const thai = stripBrackets(r[4]);
  const ph = stripBrackets(r[5]);
  const pos = (r[7] || '').trim();
  if (!thai || !ph || !en) continue;
  if (!merged.has(thai)) merged.set(thai, { thai, ph, en, pos: pos ? [pos] : [], freq: null, source: 'thai1000' });
}

for (const r of tflist) {
  if (r.length < 6) continue;
  const thai = (r[3] || '').trim();
  const en = shortenEnglish(r[4]);
  const ph = convertTonePhonetic(r[5]);
  const tagsStr = r[r.length - 1] || '';
  const posMatches = tagsStr.match(/Thai::Vocabulary::([A-Za-z]+)/g) || [];
  const pos = posMatches.map(p => p.replace('Thai::Vocabulary::', ''));
  if (!thai || !ph || !en) continue;
  if (!merged.has(thai)) merged.set(thai, { thai, ph, en, pos, freq: null, source: 'tflist' });
}

let freqNoXref = 0;
let enOverridden = 0;
for (const r of freq4000) {
  if (r.length < 6) continue;
  const thai = stripSound(r[3]);
  const en = (r[4] || '').trim();
  const freq = parseInt(r[5], 10);
  if (!thai || !en) continue;
  const ph = phByThai.get(thai);
  if (!merged.has(thai)) {
    if (!ph) { freqNoXref++; continue; }
    merged.set(thai, { thai, ph, en, pos: [], freq, source: 'freq4000-xref' });
  } else {
    const existing = merged.get(thai);
    if (existing.freq === null) existing.freq = freq;
    // ThaiFrequencyList English picks rare/archaic senses first; Freq 4000's terse
    // gloss uses the modern common sense. Override tflist entries with Freq 4000's en.
    if (existing.source === 'tflist') {
      existing.en = en;
      enOverridden++;
    }
  }
}

// ---------- Filter, classify, assign IDs ----------
const stats = {
  totalSources: { thai1000: thai1000.length, tflist: tflist.length, freq4000: freq4000.length, sentences: thaiSent.length },
  uniqueAfterMerge: merged.size,
  dupesAgainstExisting: 0,
  freqNoXref,
  enOverridden,
  thingsStageOverridden: 0,
  top200Forced: 0,
  phReviewFlagged: 0,
  bySource: {},
  byCategory: {},
  byStage: {},
};

const cards = [];
let nextId = maxId + 1;

const sortedEntries = [...merged.values()].sort((a, b) => (a.freq ?? 9999) - (b.freq ?? 9999));

const edgeCases = { tflistMultiSyl: [], thai1000Tricky: [], shortGloss: [] };

function stageForFreq(rank) {
  if (rank == null) return null;
  if (rank <= 500) return 1;
  if (rank <= 1500) return 2;
  if (rank <= 3000) return 4;
  return 5;
}

for (const e of sortedEntries) {
  if (existingThai.has(e.thai)) { stats.dupesAgainstExisting++; continue; }
  const cat = classify(e.thai, e.en, e.pos);
  let stage = CAT_TO_STAGE.get(cat) ?? 4;
  // Top-200 frequency words are essential basics — force stage 1 regardless of POS
  if (e.freq != null && e.freq <= 200) {
    if (stage !== 1) { stage = 1; stats.top200Forced++; }
  } else if (cat === 'things' && e.freq != null) {
    // 'things' catch-all maps to stage 5 (Home & Services); use freq-based stage instead
    const freqStage = stageForFreq(e.freq);
    if (freqStage !== stage) { stage = freqStage; stats.thingsStageOverridden++; }
  }
  const phReview = e.source === 'tflist' && hasMultiVowelSyllable(e.ph);
  if (phReview) stats.phReviewFlagged++;
  const card = { id: nextId++, thai: e.thai, ph: e.ph, en: e.en, type: 'w', stage, cat };
  cards.push({ ...card, _src: e.source, _freq: e.freq, _phReview: phReview });
  stats.bySource[e.source] = (stats.bySource[e.source] || 0) + 1;
  stats.byCategory[cat] = (stats.byCategory[cat] || 0) + 1;
  stats.byStage[stage] = (stats.byStage[stage] || 0) + 1;
  if (e.source === 'tflist' && e.ph.split(/\s+/).length >= 2 && edgeCases.tflistMultiSyl.length < 6) {
    edgeCases.tflistMultiSyl.push({ thai: e.thai, ph: e.ph, en: e.en });
  }
  if (e.source === 'thai1000' && /[ǎěǐǒǔ]/.test(e.ph) && edgeCases.thai1000Tricky.length < 4) {
    edgeCases.thai1000Tricky.push({ thai: e.thai, ph: e.ph, en: e.en });
  }
  if (e.en && e.en.length <= 3 && edgeCases.shortGloss.length < 4) {
    edgeCases.shortGloss.push({ thai: e.thai, ph: e.ph, en: e.en });
  }
}

const outputCards = cards.slice(0, Math.min(LIMIT, cards.length));

// ---------- Write file ----------
const outFile = resolve(ROOT, 'src/data/cards-imported.js');
const banner = `// AUTO-GENERATED by scripts/import-cards.js — do not edit by hand.
// Source files: sentence/Freq 4000.txt, sentence/ThaiFrequencyList.txt, sentence/thai 1000 words.txt
// Generated: ${new Date().toISOString()}
// Sample size: ${outputCards.length} of ${cards.length} processed cards
// Limit flag: ${LIMIT === Infinity ? 'none' : LIMIT}
`;
const lines = outputCards.map((c, i) => {
  const fields = [
    `id:${c.id}`,
    `thai:${JSON.stringify(c.thai)}`,
    `ph:${JSON.stringify(c.ph)}`,
    `en:${JSON.stringify(c.en)}`,
    `type:${JSON.stringify(c.type)}`,
    `stage:${c.stage}`,
    `cat:${JSON.stringify(c.cat)}`,
  ];
  const obj = `  {${fields.join(',')}}`;
  const trailing = i === outputCards.length - 1 ? '' : ',';
  const comment = c._phReview ? ' // phReview: true' : '';
  return `${obj}${trailing}${comment}`;
});
const body = lines.join('\n');

writeFileSync(outFile, `${banner}\nexport const IMPORTED_CARDS = [\n${body}\n];\n`);

// ---------- Print stats ----------
console.log('\n=== IMPORT STATS ===');
console.log(`Source rows  : thai1000=${stats.totalSources.thai1000}  tflist=${stats.totalSources.tflist}  freq4000=${stats.totalSources.freq4000}  sentences=${stats.totalSources.sentences} (deferred)`);
console.log(`Unique Thai keys after merge       : ${stats.uniqueAfterMerge}`);
console.log(`Dupes vs existing cards.js         : ${stats.dupesAgainstExisting}`);
console.log(`Freq4000 entries skipped (no x-ref): ${stats.freqNoXref}`);
console.log(`English overridden (tflist→freq4k) : ${stats.enOverridden}`);
console.log(`Top-200 freq forced to stage 1     : ${stats.top200Forced}`);
console.log(`Stage re-assigned by freq (things) : ${stats.thingsStageOverridden}`);
console.log(`Phonetic-review flagged (multi-vow): ${stats.phReviewFlagged}`);
console.log(`Final processed cards              : ${cards.length}`);
console.log(`Existing max id                    : ${maxId}`);
console.log(`Sample written                     : ${outputCards.length} → ${outFile.replace(ROOT + '\\', '').replace(ROOT + '/', '')}`);
console.log('\nBy source:');
for (const [s, n] of Object.entries(stats.bySource)) console.log(`  ${s.padEnd(16)} ${n}`);
console.log('\nBy category (top → bottom):');
for (const [cat, n] of Object.entries(stats.byCategory).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${cat.padEnd(20)} ${n}`);
}
console.log('\nBy stage:');
for (const [stage, n] of Object.entries(stats.byStage).sort((a, b) => +a[0] - +b[0])) {
  console.log(`  stage ${stage}: ${n}`);
}
console.log('\n=== EDGE CASES (sanity check phonetic conversion) ===');
console.log('\nMulti-syllable from ThaiFrequencyList (tone-class → diacritic conversion):');
for (const e of edgeCases.tflistMultiSyl) console.log(`  ${e.thai.padEnd(15)} ${e.ph.padEnd(28)} ${e.en}`);
console.log('\nRising-tone words from thai 1000 words (cleanest source):');
for (const e of edgeCases.thai1000Tricky) console.log(`  ${e.thai.padEnd(15)} ${e.ph.padEnd(28)} ${e.en}`);
console.log('\nVery short English glosses (may need a clarifying note):');
for (const e of edgeCases.shortGloss) console.log(`  ${e.thai.padEnd(15)} ${e.ph.padEnd(28)} ${e.en}`);

if (PRINT_SAMPLE) {
  console.log('\n=== SAMPLE CARDS ===');
  for (const c of outputCards) {
    console.log(`  id:${c.id}  ${c.thai.padEnd(18)} ${c.ph.padEnd(28)} ${('"' + c.en + '"').padEnd(32)} cat:${c.cat.padEnd(14)} stage:${c.stage}  [src:${c._src}${c._freq ? ' f#' + c._freq : ''}]`);
  }
}
console.log('');
