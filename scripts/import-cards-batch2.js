#!/usr/bin/env node
// Imports batch 2: Pimsleur, Speak Like A Thai V1, Thai-Expressions-High-Beginner.
// Outputs src/data/cards-imported-batch2.js. Run from project root:
//   node scripts/import-cards-batch2.js [--limit N] [--print]

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

// ---------- Multi-line TSV parser (Pimsleur has embedded newlines in quoted fields) ----------
function parseTSVMultiline(content) {
  const rows = [];
  let row = [], cur = '', inQ = false, atLineStart = true;
  let i = 0;
  while (i < content.length) {
    const ch = content[i];
    if (atLineStart && !inQ && ch === '#') {
      while (i < content.length && content[i] !== '\n') i++;
      i++; atLineStart = true; continue;
    }
    atLineStart = false;
    if (inQ) {
      if (ch === '"' && content[i + 1] === '"') { cur += '"'; i += 2; continue; }
      if (ch === '"') { inQ = false; i++; continue; }
      cur += ch; i++;
    } else {
      if (ch === '\t') { row.push(cur); cur = ''; i++; continue; }
      if (ch === '\r') { i++; continue; }
      if (ch === '\n') {
        row.push(cur); cur = '';
        if (row.some(f => f.length > 0)) rows.push(row);
        row = []; atLineStart = true; i++; continue;
      }
      if (ch === '"' && cur === '') { inQ = true; i++; continue; }
      cur += ch; i++;
    }
  }
  if (row.length || cur) { row.push(cur); if (row.some(f => f.length > 0)) rows.push(row); }
  return rows;
}

// ---------- Helpers ----------
const stripSound = (s) => (s || '').replace(/\[sound:[^\]]+\]/g, '').trim();
const stripHTML = (s) => (s || '').replace(/<br\s*\/?>/gi, '\n').replace(/<\/?[^>]+>/g, '').trim();
function stripQuotes(s) {
  s = (s || '').trim();
  while (s.startsWith('"') && s.endsWith('"') && s.length > 1) s = s.slice(1, -1).trim();
  return s;
}

// ---------- Pimsleur phonetic normalization ----------
// Pimsleur uses apostrophes for stress/syllable boundaries, plus umlauts on some vowels.
function normalizePimsleurPh(s) {
  if (!s) return '';
  s = s.replace(/['’`´]/g, '');               // strip stress apostrophes
  s = s.replace(/ä/g, 'aa').replace(/ö/g, 'oe').replace(/ü/g, 'eu');
  s = s.replace(/[​-‏﻿]/g, ''); // zero-width chars
  s = s.replace(/\s+/g, ' ').trim();
  return s;
}

// ---------- IPA → Paiboon conversion (for Expressions deck) ----------
function convertIPAtoPaiboon(s) {
  if (!s) return '';
  s = s.normalize('NFC');
  // Long-vowel doubled forms with tone marks (placed BEFORE singles so they win)
  const DOUBLED = [
    ['ɔ̀ɔ', 'àaw'], ['ɔ́ɔ', 'áaw'], ['ɔ̂ɔ', 'âaw'], ['ɔ̌ɔ', 'ǎaw'], ['ɔɔ', 'aaw'],
    ['ɛ̀ɛ', 'àae'], ['ɛ́ɛ', 'áae'], ['ɛ̂ɛ', 'âae'], ['ɛ̌ɛ', 'ǎae'], ['ɛɛ', 'aae'],
    ['ə̀ə', 'òe'],  ['ə́ə', 'óe'],  ['ə̂ə', 'ôe'],  ['ə̌ə', 'ǒe'],  ['əə', 'oe'],
    ['ʉ̀ʉ', 'èu'],  ['ʉ́ʉ', 'éu'],  ['ʉ̂ʉ', 'êu'],  ['ʉ̌ʉ', 'ěu'],  ['ʉʉ', 'eu'],
  ];
  for (const [from, to] of DOUBLED) s = s.split(from).join(to);
  const SINGLE = [
    ['ɔ̀', 'àw'], ['ɔ́', 'áw'], ['ɔ̂', 'âw'], ['ɔ̌', 'ǎw'], ['ɔ', 'aw'],
    ['ɛ̀', 'àe'], ['ɛ́', 'áe'], ['ɛ̂', 'âe'], ['ɛ̌', 'ǎe'], ['ɛ', 'ae'],
    ['ə̀', 'òe'], ['ə́', 'óe'], ['ə̂', 'ôe'], ['ə̌', 'ǒe'], ['ə', 'oe'],
    ['ʉ̀', 'èu'], ['ʉ́', 'éu'], ['ʉ̂', 'êu'], ['ʉ̌', 'ěu'], ['ʉ', 'eu'],
    ['ʔ', ''],
  ];
  for (const [from, to] of SINGLE) s = s.split(from).join(to);
  return s.trim();
}

// ---------- Read existing cards (cards.js + cards-imported.js) ----------
const existingThai = new Set();
const phByThai = new Map();
let maxId = 0;
function ingest(content) {
  const re = /\{[^{}]*?id:\s*(\d+)[^{}]*?thai:\s*['"]([^'"]+)['"][^{}]*?ph:\s*['"]([^'"]*)['"]/g;
  let m;
  while ((m = re.exec(content))) {
    const id = +m[1];
    if (id > maxId) maxId = id;
    existingThai.add(m[2]);
    if (m[3]) phByThai.set(m[2], m[3]);
  }
}
ingest(readFileSync(resolve(ROOT, 'src/data/cards.js'), 'utf8'));
ingest(readFileSync(resolve(ROOT, 'src/data/cards-imported.js'), 'utf8'));

// Longest-first dictionary keys for Thai segmentation
const dictKeys = [...phByThai.keys()].filter(k => k.length >= 1).sort((a, b) => b.length - a.length);

function segmentThaiToPh(thai) {
  if (!thai) return null;
  const out = [];
  let i = 0, anyMatch = false, anyMiss = false;
  while (i < thai.length) {
    if (/[\s\?\!\.\,\(\)๚๛'"]/.test(thai[i])) { i++; continue; }
    let matched = false;
    for (const key of dictKeys) {
      if (thai.startsWith(key, i)) {
        const ph = phByThai.get(key);
        if (ph) out.push(ph);
        i += key.length;
        matched = true; anyMatch = true;
        break;
      }
    }
    if (!matched) { anyMiss = true; i++; }
  }
  if (!anyMatch) return null;
  return { ph: out.join(' '), partial: anyMiss };
}

// ---------- Classification ----------
const POS_TO_CAT = {};
const OVERRIDE_BY_EN = [
  [/^(if|when|because|since|therefore|though|although|while|whereas|until|unless|whether|but|and|or|so|hence|thus)$/i, 'grammar'],
  [/^(he|she|it|they|we|us|them|him|her|i|me|you|who|whom|whose|everyone|everybody|someone|somebody|anyone|anybody|nobody|something|nothing|everything|anything)$/i, 'pronouns'],
  [/^(now|then|already|still|just|yet|soon|always|never|sometimes|often|rarely|usually|recently|currently|forever|eventually|finally|today|tomorrow|yesterday|tonight)$/i, 'time'],
  [/^(many|some|every|all|few|several|each|none|both|either|neither|much|more|less|most|least|enough|various|certain|any)$/i, 'adjectives'],
];
// Polysemous words like "like", "right", "cool", "now" require contextual patterns to
// avoid mis-classifying e.g. "Speak like a Thai" → emotions or "That's right!" → directions.
const KEYWORD_CAT = [
  ['greetings', /\b(hello|hi|good morning|good night|goodbye|bye|see you|nice to meet|thank|thanks|please|sorry|excuse me|welcome|cheers|congrats|congratulation)\b/i],
  ['food', /\b(eat|food|drink|rice|noodle|cook|fruit|meat|fish|chicken|pork|spicy|sweet|salt|sugar|water|coffee|tea|beer|cup|plate|meal|breakfast|lunch|dinner|hungry|thirsty|delicious|chili|herb|sauce|soup|bread|egg|milk|vegetable|sour|bitter|salty|order|menu|bill|tip|taste|flavor)\b/i],
  // "like to eat / drink / try / order …" or "like + food noun" → food, not emotions
  ['food', /\blike\s+(to\s+(eat|drink|cook|order|try|taste)|(rice|noodle|food|coffee|tea|beer|fruit|meat))/i],
  ['home', /\b(house|home|room|door|window|wall|roof|kitchen|bedroom|bathroom|toilet|shower|bed|table|chair|sofa|fridge|stove|tv|television|aircon|fan|broken|repair|rent|condo|apartment|electricity|wifi|internet|garden|floor|ceiling|key|lock)\b/i],
  ['body', /\b(head|hair|face|eye|nose|mouth|ear|tooth|tongue|neck|shoulder|arm|hand|finger|leg|foot|toe|stomach|back|chest|skin|bone|blood|heart|brain|throat|hip|knee|elbow|cheek|lip|nail)\b/i],
  ['health', /\b(sick|hurt|pain|ache|fever|cough|medicine|pharmacy|doctor|hospital|clinic|injure|injury|dizzy|allergy|flu|nausea|wound|bandage|prescription|disease|infection|surgery|nurse|patient|symptom|treatment|cure|ill|recover)\b/i],
  ['emergency', /\b(emergency|police|fire|accident|danger|warn|thief|robber|attack|rescue|escape)\b/i],
  ['colors', /\b(red|blue|green|yellow|black|white|pink|purple|orange|brown|grey|gray|colour|color|gold|silver)\b/i],
  // "now" only matches when used as a time reference (right now, just now, now is …) — not "for now" or "from now on"
  ['time', /\b(time|hour|minute|second|day|week|month|year|today|tomorrow|yesterday|morning|afternoon|evening|night|noon|midnight|early|late|before|after|monday|tuesday|wednesday|thursday|friday|saturday|sunday|january|february|march|april|may|june|july|august|september|october|november|december|date|clock|calendar|weekend|holiday)\b/i],
  ['time', /\b(right now|just now|until now|by now|now is|now we|now i'm|now i\b|in (the )?(morning|afternoon|evening))\b/i],
  // "cool" only matches with explicit weather/temperature noun — not standalone exclamations
  ['weather', /\b(rain|sun|cloud|wind|storm|thunder|lightning|weather|sky|temperature|humid|snow|fog|flood|nature|tree|flower|plant|leaf|forest|mountain|river|ocean|sea|beach|island|grass|stone|rock)\b/i],
  ['weather', /\b(hot|cold|warm|cool)\s+(weather|day|night|outside|today|water|air)\b/i],
  // "like" removed (polysemous: feel-like vs. similar-to). "I like X" with food handled above; otherwise falls to sentences-daily.
  ['emotions', /\b(happy|sad|angry|scared|afraid|love|hate|enjoy|fun|bored|tired|excited|nervous|worry|calm|jealous|proud|shy|embarrass|surprise|relax|stress|lonely|grateful|disappointed|comfortable|jai|feeling|emotion|mood|cry|laugh|smile|frown|cheer(s|ful|y|ing)?|awesome|wonderful|amazing|terrible|miserable|fantastic|beautiful|cute)\b/i],
  ['places', /\b(market|temple|hotel|airport|station|hospital|school|university|bank|park|store|shop|mall|restaurant|bar|cafe|office|building|city|town|village|country|province|district|library|museum|theater|theatre|gym)\b/i],
  ['people', /\b(mother|father|mom|dad|son|daughter|brother|sister|baby|child|kid|family|husband|wife|boyfriend|girlfriend|friend|neighbor|person|man|woman|boy|girl|adult|elder|grandparent|grandmother|grandfather|aunt|uncle|cousin|nephew|niece|relative|king|queen|prince|priest|monk|teacher|student|engineer|farmer|driver)\b/i],
  ['shopping', /\b(buy|sell|price|cost|cheap|expensive|discount|pay|cash|card|baht|dollar|change|receipt|bag|money)\b/i],
  // "right" only matches when used directionally — not "that's right", "alright", etc.
  ['directions', /\b(turn (left|right)|on (the|your) (left|right)|to the (left|right)|(left|right) (turn|side|hand)|straight ahead|north|south|east|west|behind|in front of|opposite|across|along|nearby|close to|between)\b/i],
  ['numbers', /^(zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|million)\b/i],
];

function classify(en, signals = {}) {
  const enLower = (en || '').toLowerCase();
  const firstSense = enLower.split(/[;/]/)[0].trim();
  for (const [regex, cat] of OVERRIDE_BY_EN) if (regex.test(firstSense)) return cat;
  for (const [cat, regex] of KEYWORD_CAT) if (regex.test(enLower)) return cat;
  if (signals.isSentence) {
    if (/\?$/.test(en.trim())) return 'sentences-questions';
    if (/\b(want|would like|need|wish|hope|plan to)\b/i.test(enLower)) return 'sentences-want';
    if (signals.isFluency) return 'sentences-fluency';
    if (/\b(my|i'm|i am|i live|i work|i'd|i went)\b/i.test(enLower)) return 'sentences-self';
    return 'sentences-daily';
  }
  return 'things';
}

const CAT_TO_STAGE = new Map();
for (const stage of STAGES) for (const cat of stage.cats) if (!CAT_TO_STAGE.has(cat)) CAT_TO_STAGE.set(cat, stage.id);

// ---------- Type detection ----------
function detectType(thai, en) {
  if (/[?!]/.test(en)) return 's';
  const cleanEn = en.replace(/\(.*?\)/g, '').trim();
  const enWords = cleanEn.split(/\s+/).filter(Boolean).length;
  if (enWords >= 4) return 's';
  if (enWords === 1 && !/\s/.test(thai)) return 'w';
  if (enWords <= 2) return 'p';
  return 's';
}

// ---------- phReview detection ----------
const VOWEL_RE = /[aeiouàáâǎèéêěìíîǐòóôǒùúûǔ]/;
function hasMultiVowelSyllable(ph) {
  for (const word of ph.split(/\s+/)) {
    let count = 0;
    for (const ch of word) if (VOWEL_RE.test(ch)) count++;
    if (count > 1) return true;
  }
  return false;
}
const hasIPALeftover = (ph) => /[ɔɛəʉʔ]/.test(ph);

// ---------- Stage rules ----------
const pimsleurStage = (lesson) => lesson <= 8 ? 1 : lesson <= 16 ? 2 : lesson <= 24 ? 3 : 4;
const exprStage = (chapter) => chapter <= 30 ? 2 : chapter <= 60 ? 3 : chapter <= 100 ? 4 : 5;

// ---------- Read sources ----------
const SENT = resolve(ROOT, 'sentence');
const pimsleur = parseTSVMultiline(readFileSync(resolve(SENT, 'Pimsleur Thai.txt'), 'utf8'));
const slat = parseTSVMultiline(readFileSync(resolve(SENT, 'Speak Like A Thai Vol.1.txt'), 'utf8'));
const expr = parseTSVMultiline(readFileSync(resolve(SENT, 'Thai-Expressions-High-Beginner.txt'), 'utf8'));

const stats = {
  pimsleur: { total: 0, kept: 0, dup: 0, missingFields: 0 },
  slat:     { total: 0, kept: 0, dup: 0, phMatched: 0, phPartial: 0, phUnmatched: 0 },
  expr:     { total: 0, kept: 0, dup: 0, ipaLeftover: 0 },
  bySource: {}, byCategory: {}, byStage: {}, byType: {},
  phReviewFlagged: 0, phNeedsGen: 0, catReviewFlagged: 0,
};

const allCards = [];
let nextId = maxId + 1;
const localDup = new Set();

// ----- Pimsleur -----
for (const r of pimsleur) {
  if (r.length < 5) { stats.pimsleur.missingFields++; continue; }
  stats.pimsleur.total++;
  const deck = r[2] || '';
  const en = stripQuotes(r[3] || '').trim();
  const blob = stripHTML(stripQuotes(r[4] || ''));
  const lines = blob.split(/\n+/).map(x => x.trim()).filter(Boolean);
  const thai = lines[0] || '';
  const phRaw = lines[1] || '';
  if (!thai || !en) continue;
  if (existingThai.has(thai) || localDup.has(thai)) { stats.pimsleur.dup++; continue; }
  localDup.add(thai);
  const ph = normalizePimsleurPh(phRaw);
  const lessonMatch = deck.match(/Lesson\s+(\d+)/i);
  const lesson = lessonMatch ? parseInt(lessonMatch[1], 10) : 1;
  const stage = pimsleurStage(lesson);
  const type = detectType(thai, en);
  const cat = classify(en, { isSentence: type === 's' || type === 'p' });
  const phReview = !ph || hasMultiVowelSyllable(ph) || /[äöüɔɛəʉʔ]/.test(phRaw);
  if (phReview) stats.phReviewFlagged++;
  if (!ph) stats.phNeedsGen++;
  const catReview = (cat === 'things');
  if (catReview) stats.catReviewFlagged++;
  allCards.push({
    id: nextId++, thai, ph, en, type, stage, cat,
    _src: 'pimsleur', _meta: 'L' + lesson, _phReview: phReview, _phNeedsGen: !ph, _catReview: catReview,
  });
  stats.pimsleur.kept++;
}

// ----- SLAT -----
for (const r of slat) {
  if (r.length < 5) continue;
  stats.slat.total++;
  const thai = stripQuotes(r[3] || '').trim();
  const en = stripQuotes(r[4] || '').trim();
  const note = stripQuotes(r[9] || '').trim();
  if (!thai || !en) continue;
  if (existingThai.has(thai) || localDup.has(thai)) { stats.slat.dup++; continue; }
  localDup.add(thai);
  const seg = segmentThaiToPh(thai);
  let ph = '';
  if (seg && !seg.partial) { ph = seg.ph; stats.slat.phMatched++; }
  else if (seg && seg.partial) { stats.slat.phPartial++; ph = ''; } // partials misleading → clear, mark phNeedsGen
  else { stats.slat.phUnmatched++; }
  // Tighter idiom check: only explicit register words. "emphasis" alone shouldn't trigger fluency stage.
  const isIdiom = /\b(informal|slang|colloquial|idiom)\b/i.test(note);
  const type = detectType(thai, en);
  const cat = classify(en, { isSentence: type === 's' || type === 'p', isFluency: isIdiom });
  let stage = isIdiom ? 8 : 4;
  if (cat === 'sentences-fluency') stage = 8;
  if (cat === 'greetings') stage = 1;
  const phReview = !ph || hasMultiVowelSyllable(ph);
  if (phReview) stats.phReviewFlagged++;
  if (!ph) stats.phNeedsGen++;
  const catReview = (cat === 'things');
  if (catReview) stats.catReviewFlagged++;
  allCards.push({
    id: nextId++, thai, ph, en, type, stage, cat,
    note: note || undefined,
    _src: 'slat', _meta: seg ? (seg.partial ? 'partial-cleared' : 'matched-ph') : 'no-ph',
    _phReview: phReview, _phNeedsGen: !ph, _catReview: catReview,
  });
  stats.slat.kept++;
}

// ----- Expressions -----
for (const r of expr) {
  if (r.length < 7) continue;
  stats.expr.total++;
  const lessonStr = (r[3] || '').trim();
  const thai = stripQuotes(r[4] || '').trim();
  const phIPA = stripQuotes(r[5] || '').trim();
  const en = stripQuotes(r[6] || '').trim();
  if (!thai || !en || !phIPA) continue;
  if (existingThai.has(thai) || localDup.has(thai)) { stats.expr.dup++; continue; }
  localDup.add(thai);
  const ph = convertIPAtoPaiboon(phIPA);
  const ipaLeft = hasIPALeftover(ph);
  if (ipaLeft) stats.expr.ipaLeftover++;
  const chapMatch = lessonStr.match(/^(\d+)/);
  const chapter = chapMatch ? parseInt(chapMatch[1], 10) : 50;
  const stage = exprStage(chapter);
  const type = detectType(thai, en);
  const cat = classify(en, { isSentence: type === 's' || type === 'p' });
  const phReview = ipaLeft || hasMultiVowelSyllable(ph);
  if (phReview) stats.phReviewFlagged++;
  const catReview = (cat === 'things');
  if (catReview) stats.catReviewFlagged++;
  allCards.push({
    id: nextId++, thai, ph, en, type, stage, cat,
    _src: 'expressions', _meta: 'ch' + chapter,
    _phReview: phReview, _phNeedsGen: false, _catReview: catReview,
  });
  stats.expr.kept++;
}

// Stats aggregation
for (const c of allCards) {
  stats.bySource[c._src] = (stats.bySource[c._src] || 0) + 1;
  stats.byCategory[c.cat] = (stats.byCategory[c.cat] || 0) + 1;
  stats.byStage[c.stage] = (stats.byStage[c.stage] || 0) + 1;
  stats.byType[c.type] = (stats.byType[c.type] || 0) + 1;
}

// ---------- Apply --limit (round-robin from sources for variety) ----------
let outputCards;
if (LIMIT < allCards.length) {
  const bySrc = { pimsleur: [], slat: [], expressions: [] };
  for (const c of allCards) bySrc[c._src].push(c);
  const perSrc = Math.ceil(LIMIT / 3);
  outputCards = [
    ...bySrc.pimsleur.slice(0, perSrc),
    ...bySrc.slat.slice(0, perSrc),
    ...bySrc.expressions.slice(0, perSrc),
  ].slice(0, LIMIT);
} else {
  outputCards = allCards;
}

// ---------- Write file ----------
const outFile = resolve(ROOT, 'src/data/cards-imported-batch2.js');
const banner = `// AUTO-GENERATED by scripts/import-cards-batch2.js — do not edit by hand.
// Source files: sentence/Pimsleur Thai.txt, sentence/Speak Like A Thai Vol.1.txt, sentence/Thai-Expressions-High-Beginner.txt
// Generated: ${new Date().toISOString()}
// Sample size: ${outputCards.length} of ${allCards.length} processed cards
// Limit flag: ${LIMIT === Infinity ? 'none' : LIMIT}
`;

const lines = outputCards.map((c, i) => {
  const fields = [
    `id:${c.id}`,
    `thai:${JSON.stringify(c.thai)}`,
    `ph:${JSON.stringify(c.ph || '')}`,
    `en:${JSON.stringify(c.en)}`,
    `type:${JSON.stringify(c.type)}`,
    `stage:${c.stage}`,
    `cat:${JSON.stringify(c.cat)}`,
  ];
  if (c.note) fields.push(`note:${JSON.stringify(c.note)}`);
  const obj = `  {${fields.join(',')}}`;
  const trailing = i === outputCards.length - 1 ? '' : ',';
  const flagBits = [];
  if (c._phReview) flagBits.push('phReview: true');
  if (c._phNeedsGen) flagBits.push('phNeedsGen: true');
  if (c._catReview) flagBits.push('catReview: true');
  const comment = flagBits.length ? ` // ${flagBits.join(', ')}` : '';
  return `${obj}${trailing}${comment}`;
});
writeFileSync(outFile, `${banner}\nexport const IMPORTED_CARDS_BATCH2 = [\n${lines.join('\n')}\n];\n`);

// ---------- Print stats ----------
console.log('\n=== BATCH 2 IMPORT STATS ===');
console.log(`Pimsleur     : ${stats.pimsleur.total} processed → ${stats.pimsleur.kept} kept (${stats.pimsleur.dup} dup vs existing/batch1)`);
console.log(`SLAT         : ${stats.slat.total} processed → ${stats.slat.kept} kept (${stats.slat.dup} dup)`);
console.log(`               phonetic via segmentation: ${stats.slat.phMatched} full, ${stats.slat.phPartial} partial, ${stats.slat.phUnmatched} unmatched (phNeedsGen)`);
console.log(`Expressions  : ${stats.expr.total} processed → ${stats.expr.kept} kept (${stats.expr.dup} dup, ${stats.expr.ipaLeftover} IPA leftover)`);
console.log(`Total processed: ${allCards.length} cards`);
console.log(`Existing max id: ${maxId} → new ids start at ${maxId + 1}, end at ${maxId + allCards.length}`);
console.log(`phReview flagged : ${stats.phReviewFlagged}`);
console.log(`phNeedsGen       : ${stats.phNeedsGen}`);
console.log(`catReview flagged: ${stats.catReviewFlagged}`);
console.log(`Sample written  : ${outputCards.length} → ${outFile.replace(ROOT + '\\', '').replace(ROOT + '/', '')}`);
console.log('\nBy source:');
for (const [s, n] of Object.entries(stats.bySource)) console.log(`  ${s.padEnd(14)} ${n}`);
console.log('\nBy type:');
for (const [t, n] of Object.entries(stats.byType)) console.log(`  ${t.padEnd(4)} ${n}`);
console.log('\nBy category:');
for (const [c, n] of Object.entries(stats.byCategory).sort((a, b) => b[1] - a[1])) console.log(`  ${c.padEnd(22)} ${n}`);
console.log('\nBy stage:');
for (const [s, n] of Object.entries(stats.byStage).sort((a, b) => +a[0] - +b[0])) console.log(`  stage ${s}: ${n}`);

if (PRINT_SAMPLE) {
  console.log('\n=== SAMPLE CARDS (round-robin from 3 sources) ===');
  for (const c of outputCards) {
    const flags = [];
    if (c._phReview) flags.push('phReview');
    if (c._phNeedsGen) flags.push('phNeedsGen');
    const tag = c._meta ? `[${c._src}:${c._meta}]` : `[${c._src}]`;
    const phDisplay = c.ph || '<none>';
    const noteSuffix = c.note ? ` (note: "${c.note.length > 30 ? c.note.slice(0, 30) + '…' : c.note}")` : '';
    console.log(`  id:${c.id} ${c.thai.padEnd(22)} ${phDisplay.padEnd(30)} ${('"'+c.en+'"').padEnd(42)} ${c.type} s${c.stage} ${c.cat.padEnd(20)} ${tag} ${flags.length ? '⚠ '+flags.join('+') : ''}${noteSuffix}`);
  }
}
console.log('');
