// Step 2.4: Apply final stage redistribution.
//
// Strategy: write all changes to a single new file src/data/cards-step2.js
// containing STEP2_ADDITIONS (new cards) + STEP2_OVERRIDES (field changes for
// existing cards). Then modify src/data/cards.js to import + apply them.
// The original 3 card data files stay byte-for-byte untouched (backups exist).

import { CARDS as BASE_CARDS } from '../src/data/cards.js';
import { WORD_LOOKUP } from '../src/data/lookup.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');

// ============================================================================
// PATCHES: existing cards being changed (Step 2.1 + 2.2)
// ============================================================================

// Existing cards whose type changes (this affects vocab membership)
const RETYPE_TO_W = new Set([
  4528, // ไม่ได้  s → w  (Step 2.1)
  5361, // ไม่เป็นไร  s → w + move S3→S1  (Step 2.1)
  4474, // มาถึง  p → w + ph fix
  5344, // ช้าๆ  s → w
  4671  // กี่โมง  s → w + en fix
]);
const RETYPE_TO_P = new Set([
  4732, // แป๊บนึง  s → p
  4733  // อะไรอย่างเงี้ยะ  s → p
]);
// Field corrections (en/ph data quality fixes)
const FIELD_FIXES = {
  4671: { en: 'what time' },
  4474: { ph: 'maa thǔeng' }
};

// ============================================================================
// NEW CARDS (39 total: 1 sentence + 38 vocab words)
// ============================================================================

const NEW_CARDS = [
  // ---- Step 2.1: 1 new sentence + 3 new words ----
  { id: 5700, thai: 'ผมพูดภาษาไทยไม่ได้ครับ', ph: 'phǒm phûut phaa-sǎa thai mâi dâai khráp', en: "I can't speak Thai", type: 's', stage: 1, cat: 'sentences-self' },
  { id: 5701, thai: 'อันนี้',      ph: 'an níi',         en: 'this one / this thing',                   type: 'w', stage: 1, cat: 'pronouns' },
  { id: 5702, thai: 'เจอกัน',      ph: 'jer gan',        en: 'see you',                                 type: 'w', stage: 1, cat: 'greetings' },
  { id: 5703, thai: 'ไม่ใช่',      ph: 'mâi châi',       en: "no / not so / that's not it",             type: 'w', stage: 1, cat: 'grammar' },
  // ---- Step 2.2 priority: 5 new ----
  { id: 5704, thai: 'มั้ย',        ph: 'mái',            en: 'casual question particle',                type: 'w', stage: 2, cat: 'grammar' },
  { id: 5705, thai: 'ได้ไหม',      ph: 'dâai mǎi',       en: 'can you...? / is it OK?',                 type: 'w', stage: 2, cat: 'grammar' },
  { id: 5706, thai: 'กินข้าว',     ph: 'gin khâao',      en: 'eat (a meal)',                            type: 'w', stage: 2, cat: 'food' },
  { id: 5707, thai: 'จากไหน',      ph: 'jàak nǎi',       en: 'from where',                              type: 'w', stage: 2, cat: 'directions' },
  { id: 5708, thai: 'สักครู่',     ph: 'sàk khrûu',      en: 'a moment',                                type: 'w', stage: 2, cat: 'time' },
  // ---- Step 2.2 recommended: 6 new ----
  { id: 5709, thai: 'เหรอ',        ph: 'rěr',            en: 'really? / question particle (casual)',    type: 'w', stage: 2, cat: 'grammar' },
  { id: 5710, thai: 'เช็คบิล',     ph: 'chék bin',       en: 'check please (at restaurant)',            type: 'w', stage: 2, cat: 'food' },
  { id: 5711, thai: 'เมนู',        ph: 'meh nuu',        en: 'menu',                                    type: 'w', stage: 2, cat: 'food' },
  { id: 5712, thai: 'หลงทาง',      ph: 'lǒng thaang',    en: 'lost (on the way)',                       type: 'w', stage: 3, cat: 'directions' },
  { id: 5713, thai: 'หรือยัง',     ph: 'rǔe yang',       en: '...yet?',                                 type: 'w', stage: 3, cat: 'grammar' },
  { id: 5714, thai: 'งี้',         ph: 'ngíi',           en: 'casual "like this"',                      type: 'w', stage: 3, cat: 'grammar' },
  // ---- Step 2.2 deeper Tier A: 8 new ----
  { id: 5715, thai: 'รวย',         ph: 'ruai',           en: 'rich / wealthy',                          type: 'w', stage: 3, cat: 'adjectives' },
  { id: 5716, thai: 'เด็ด',        ph: 'dèt',            en: 'excellent / top-notch',                   type: 'w', stage: 3, cat: 'adjectives' },
  { id: 5717, thai: 'อิจฉา',       ph: 'ìt-chǎa',        en: 'envious / jealous',                       type: 'w', stage: 3, cat: 'emotions' },
  { id: 5718, thai: 'ยืด',         ph: 'yûet',           en: 'to stretch',                              type: 'w', stage: 3, cat: 'verbs' },
  { id: 5719, thai: 'น่ะ',         ph: 'nâ',             en: 'emphasis particle (casual)',              type: 'w', stage: 2, cat: 'grammar' },
  { id: 5720, thai: 'อ่ะ',         ph: 'à',              en: 'soft particle (casual)',                  type: 'w', stage: 2, cat: 'grammar' },
  { id: 5721, thai: 'ไม๊',         ph: 'mái',            en: 'variant of มั้ย/ไหม (question)',          type: 'w', stage: 3, cat: 'grammar' },
  { id: 5722, thai: 'รู้สึก',      ph: 'rúu sùek',       en: 'to feel',                                 type: 'w', stage: 2, cat: 'verbs' },
  // ---- Step 2.2 deeper Tier B: 14 new ----
  { id: 5723, thai: 'เซ็น',        ph: 'sen',            en: "to sign (one's name)",                    type: 'w', stage: 3, cat: 'verbs' },
  { id: 5724, thai: 'บัส',         ph: 'bát',            en: 'bus (loanword)',                          type: 'w', stage: 2, cat: 'transport' },
  { id: 5725, thai: 'แผน',         ph: 'phǎen',          en: 'plan',                                    type: 'w', stage: 3, cat: 'things' },
  { id: 5726, thai: 'แบงค์',       ph: 'báeng',          en: 'banknote / bill',                         type: 'w', stage: 2, cat: 'shopping' },
  { id: 5727, thai: 'ตังค์',       ph: 'dtang',          en: 'money (slang)',                           type: 'w', stage: 2, cat: 'shopping' },
  { id: 5728, thai: 'เนอะ',        ph: 'nóe',            en: 'sentence-final particle',                 type: 'w', stage: 3, cat: 'grammar' },
  { id: 5729, thai: 'คุ้ม',        ph: 'khúm',           en: 'worth it / worthwhile',                   type: 'w', stage: 3, cat: 'adjectives' },
  { id: 5730, thai: 'โกง',         ph: 'gohng',          en: 'to cheat',                                type: 'w', stage: 4, cat: 'verbs' },
  { id: 5731, thai: 'ท้อ',         ph: 'thóh',           en: 'discouraged / disheartened',              type: 'w', stage: 4, cat: 'emotions' },
  { id: 5732, thai: 'ไส้',         ph: 'sâi',            en: 'filling / intestine',                     type: 'w', stage: 3, cat: 'food' },
  { id: 5733, thai: 'มั้ง',        ph: 'máng',           en: 'probably (casual)',                       type: 'w', stage: 3, cat: 'grammar' },
  { id: 5734, thai: 'ฉี่',         ph: 'chìi',           en: 'pee / urinate',                           type: 'w', stage: 3, cat: 'body' },
  { id: 5735, thai: 'ปั่น',        ph: 'bpàn',           en: 'to spin / stir',                          type: 'w', stage: 4, cat: 'verbs' },
  { id: 5736, thai: 'หุบ',         ph: 'hùp',            en: 'to close (mouth, valley)',                type: 'w', stage: 4, cat: 'verbs' },
  // ---- Step 2.2 deeper Tier C compounds: 2 new ----
  { id: 5737, thai: 'มิเตอร์',     ph: 'mí-ter',         en: 'meter (taxi)',                            type: 'w', stage: 3, cat: 'transport' },
  { id: 5738, thai: 'อพาร์ทเมนท์', ph: 'à-páat-mén',     en: 'apartment',                               type: 'w', stage: 3, cat: 'home' }
];

console.log('New cards being added:', NEW_CARDS.length);
console.log('Existing cards retyped to w:', RETYPE_TO_W.size);
console.log('Existing cards retyped to p:', RETYPE_TO_P.size);
console.log('Existing cards with field fixes:', Object.keys(FIELD_FIXES).length);
console.log('');

// ============================================================================
// Build working card set with patches applied (in memory)
// ============================================================================

function applyPatches(card) {
  let c = { ...card };
  if (RETYPE_TO_W.has(c.id)) c.type = 'w';
  if (RETYPE_TO_P.has(c.id)) c.type = 'p';
  if (FIELD_FIXES[c.id]) c = { ...c, ...FIELD_FIXES[c.id] };
  return c;
}

const workingCards = [...BASE_CARDS.map(applyPatches), ...NEW_CARDS];

// ============================================================================
// REDISTRIBUTION ALGORITHM
// ============================================================================

const TARGETS = { 1: 150, 2: 275, 3: 425, 4: 575, 5: 700, 6: 800, 7: 875, 8: 952 };

// --- Build vocab (w + g + p) ---
const vocab = new Map(); // thai -> card
for (const c of workingCards) {
  if (c.type === 'w' || c.type === 'g' || c.type === 'p') {
    if (!vocab.has(c.thai)) vocab.set(c.thai, c);
  }
}
const vocabKeys = [...vocab.keys()].sort((a, b) => b.length - a.length);

// --- Segmenter ---
function segment(thaiRaw) {
  const tokens = [];
  const chunks = (thaiRaw || '').split(/[\sๆ?.,!;:"'“”‘’()\[\]{}\-—–…\/\\_*<>=#%&@+|`~^]+/u).filter(Boolean);
  for (const chunk of chunks) {
    let pos = 0;
    while (pos < chunk.length) {
      let matched = null;
      for (const w of vocabKeys) {
        if (w.length === 0) continue;
        if (chunk.startsWith(w, pos)) { matched = w; break; }
      }
      if (matched) { tokens.push(matched); pos += matched.length; }
      else { tokens.push('?' + chunk[pos]); pos++; }
    }
  }
  return tokens;
}

// --- Dependency tokens for each sentence/phrase card (skip p when it's itself in vocab as a single chunk) ---
const deps = new Map();
for (const c of workingCards) {
  if (c.type !== 's' && c.type !== 'p') continue;
  if (Array.isArray(c.breakdown) && c.breakdown.length) {
    deps.set(c.id, c.breakdown.map(b => b.thai).filter(Boolean));
  } else {
    deps.set(c.id, segment(c.thai));
  }
}

// --- Token frequency (for difficulty) ---
const tokenRefs = new Map();
for (const [, tokens] of deps) {
  for (const t of tokens) {
    if (t.startsWith('?')) continue;
    tokenRefs.set(t, (tokenRefs.get(t) || 0) + 1);
  }
}

// --- Difficulty scoring ---
function toneCount(ph) { return (ph.match(/[àáâǎ]/g) || []).length; }
function wordDifficulty(c) {
  const ph = c.ph || '';
  const thaiLen = (c.thai || '').length;
  const phWords = ph.trim() ? ph.trim().split(/\s+/).length : 1;
  const tones = toneCount(ph);
  const refs = tokenRefs.get(c.thai) || 0;
  const freqBonus = -Math.log10(1 + refs) * 0.6;
  return 1.0 + Math.max(0, thaiLen - 2) * 0.18 + tones * 0.25 + (phWords - 1) * 0.4 + freqBonus;
}
function grammarDifficulty(c) { return wordDifficulty(c) + 0.15; }

const wordScore = new Map();
for (const c of workingCards) {
  if (c.type === 'w' || c.type === 'p') wordScore.set(c.thai, wordDifficulty(c));
  else if (c.type === 'g') wordScore.set(c.thai, grammarDifficulty(c));
}

function sentenceDifficulty(c) {
  const tokens = deps.get(c.id) || [];
  const known = tokens.filter(t => !t.startsWith('?'));
  const unknown = tokens.length - known.length;
  let sum = 0;
  for (const t of known) sum += (wordScore.get(t) || 2.0);
  const avg = known.length ? sum / known.length : 2.5;
  const base = c.type === 's' ? 3.0 : 2.0;
  const phEmpty = (!c.ph || !c.ph.trim()) ? 0.5 : 0;
  return base + tokens.length * 0.35 + avg * 0.7 + unknown * 0.4 + phEmpty;
}

const difficulty = new Map();
for (const c of workingCards) {
  if (c.type === 'w') difficulty.set(c.id, wordDifficulty(c));
  else if (c.type === 'g') difficulty.set(c.id, grammarDifficulty(c));
  else difficulty.set(c.id, sentenceDifficulty(c));
}

// ============================================================================
// HAND-CURATED STAGE 1 (the 10 essentials and their required vocab)
// ============================================================================

const ESSENTIAL_S1_SENTENCE_IDS = [
  310,  // สวัสดีครับ - Hello
  330,  // ผมชื่อ ___ ครับ - My name is
  853,  // ห้องน้ำอยู่ที่ไหนครับ - Where bathroom
  850,  // อันนี้เท่าไหร่ครับ - How much
  5700, // (NEW) ผมพูดภาษาไทยไม่ได้ครับ - I can't speak Thai
  312,  // ขอบคุณมากครับ - Thank you very much
  313,  // ไม่เป็นไรครับ - You're welcome
  314,  // ขอโทษครับ - Sorry
  431,  // ผมไม่เข้าใจครับ - I don't understand
  430   // ช่วยด้วย - Help!
];

// Required Stage 1 word/grammar movements (constituent dependencies)
const FORCE_S1_WORD_IDS = new Set([
  164,  // ห้องน้ำ (S3 → S1)
  100,  // มาก (S4 → S1)
  // 4528 ไม่ได้ — already S1 via retype
  // 5361 ไม่เป็นไร — moving via override below
  // 430 ช่วยด้วย — sentence #10, handled as sentence
]);

// Existing cards force-moved to S1
const FORCE_S1_ALL_IDS = new Set([
  ...FORCE_S1_WORD_IDS,
  ...ESSENTIAL_S1_SENTENCE_IDS,
  5361  // ไม่เป็นไร: moved from S3 + retyped to w
]);

// Atomic vocab: w + g only (no compound phrases). Used to decompose phrase
// matches back into atomic constituents — both should be S1 for compositionality.
const atomVocab = new Map();
for (const c of workingCards) {
  if (c.type === 'w' || c.type === 'g') {
    if (!atomVocab.has(c.thai)) atomVocab.set(c.thai, c);
  }
}
const atomKeys = [...atomVocab.keys()].sort((a, b) => b.length - a.length);

function segmentAtoms(thaiRaw) {
  const tokens = [];
  const chunks = (thaiRaw || '').split(/[\sๆ?.,!;:"'“”‘’()\[\]{}\-—–…\/\\_*<>=#%&@+|`~^]+/u).filter(Boolean);
  for (const chunk of chunks) {
    let pos = 0;
    while (pos < chunk.length) {
      let matched = null;
      for (const w of atomKeys) {
        if (w.length === 0) continue;
        if (chunk.startsWith(w, pos)) { matched = w; break; }
      }
      if (matched) { tokens.push(matched); pos += matched.length; }
      else { tokens.push('?' + chunk[pos]); pos++; }
    }
  }
  return tokens;
}

// Auto-derive S1 forced vocab from essential sentence constituents — every
// word used by an S1 essential sentence MUST also be in S1 (dependency rule).
// Do BOTH compound (vocab-with-p) and atomic (w+g only) segmentations so the
// compound phrase AND its atomic decomposition are all forced to S1.
for (const sid of ESSENTIAL_S1_SENTENCE_IDS) {
  const sent = workingCards.find(c => c.id === sid);
  if (!sent) continue;
  const compoundToks = segment(sent.thai).filter(t => !t.startsWith('?'));
  for (const t of compoundToks) {
    const vc = vocab.get(t);
    if (vc) FORCE_S1_ALL_IDS.add(vc.id);
  }
  const atomicToks = segmentAtoms(sent.thai).filter(t => !t.startsWith('?'));
  for (const t of atomicToks) {
    const vc = atomVocab.get(t);
    if (vc) FORCE_S1_ALL_IDS.add(vc.id);
  }
}

// New cards that must be Stage 1 (defined in NEW_CARDS with stage:1)
const NEW_S1_IDS = new Set(NEW_CARDS.filter(c => c.stage === 1).map(c => c.id));

// ============================================================================
// Assign stages: Stage 1 first (forced + topup), then 2-8 by difficulty, then sentences by max-dep
// ============================================================================

const stageAssign = new Map(); // id -> new stage

// Stage 1: Lock in all forced cards
for (const id of FORCE_S1_ALL_IDS) stageAssign.set(id, 1);
for (const id of NEW_S1_IDS) stageAssign.set(id, 1);
// Also: ใช่ (251), ไม่ (250) already S1 — no override needed, but lock them
stageAssign.set(250, 1);
stageAssign.set(251, 1);

// All vocab words/grammar/phrases NOT yet placed, sorted by difficulty
const remainingVocab = workingCards
  .filter(c => (c.type === 'w' || c.type === 'g' || c.type === 'p') && !stageAssign.has(c.id))
  .sort((a, b) => (difficulty.get(a.id) || 0) - (difficulty.get(b.id) || 0));

const s1Vocab = workingCards.filter(c => stageAssign.get(c.id) === 1 && (c.type === 'w' || c.type === 'g' || c.type === 'p'));
const s1Sentences = workingCards.filter(c => stageAssign.get(c.id) === 1 && (c.type === 's'));

console.log('Stage 1 lock-ins so far:');
console.log('  forced vocab/words:', s1Vocab.length);
console.log('  essential sentences:', s1Sentences.length);
console.log('  total locked:', s1Vocab.length + s1Sentences.length);

// Top up S1 with easiest remaining vocab to reach 150 total (sentences + words)
const s1TargetVocab = TARGETS[1] - s1Sentences.length;
let s1VocabAdded = s1Vocab.length;
let vocabIdx = 0;
while (s1VocabAdded < s1TargetVocab && vocabIdx < remainingVocab.length) {
  const c = remainingVocab[vocabIdx];
  vocabIdx++;
  if (stageAssign.has(c.id)) continue;
  stageAssign.set(c.id, 1);
  s1VocabAdded++;
}
console.log('  topped up to:', s1VocabAdded, 'vocab in S1');
console.log('  S1 total:', s1VocabAdded + s1Sentences.length, '(target', TARGETS[1] + ')');
console.log('');

// Stages 2-8: distribute remaining vocab proportionally
const stillRemainingVocab = remainingVocab.filter(c => !stageAssign.has(c.id));
const sumTargets2to8 = Object.values(TARGETS).reduce((a, b) => a + b, 0) - TARGETS[1];

// Vocab share per stage
const stageVocabCap = {};
for (let s = 2; s <= 8; s++) {
  stageVocabCap[s] = Math.round(stillRemainingVocab.length * TARGETS[s] / sumTargets2to8);
}

let idx = 0;
for (let s = 2; s <= 8; s++) {
  const cap = stageVocabCap[s];
  for (let k = 0; k < cap && idx < stillRemainingVocab.length; k++, idx++) {
    stageAssign.set(stillRemainingVocab[idx].id, s);
  }
}
while (idx < stillRemainingVocab.length) {
  stageAssign.set(stillRemainingVocab[idx].id, 8);
  idx++;
}

// Sentences: dependency-floor + capacity-aware placement.
// Walk sentences in difficulty order; place each in the lowest stage that
// (a) ≥ max dependency stage and (b) hasn't exhausted its capacity yet.
const sentences = workingCards.filter(c => c.type === 's' && !stageAssign.has(c.id))
  .sort((a, b) => (difficulty.get(a.id) || 0) - (difficulty.get(b.id) || 0));

const currentStageTotal = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0 };
for (const c of workingCards) {
  const s = stageAssign.get(c.id);
  if (s) currentStageTotal[s]++;
}
console.log('Stage totals before sentence placement:', currentStageTotal);

let placedSentCount = 0, deferredSentCount = 0;
const quarantinedIds = new Set();
for (const c of sentences) {
  const tokens = deps.get(c.id) || [];
  let maxDepStage = 0;
  let hasUnknown = false;
  for (const t of tokens) {
    if (t.startsWith('?')) { hasUnknown = true; continue; }
    const vc = vocab.get(t);
    if (vc) {
      const s = stageAssign.get(vc.id) || 0;
      if (s > maxDepStage) maxDepStage = s;
    } else {
      // Breakdown[] token (or segmented atom) with no matching vocab card —
      // treat as unresolvable so the sentence gets quarantined to S8.
      hasUnknown = true;
    }
  }

  let chosen;
  if (hasUnknown) {
    chosen = 8; // quarantine sentences with unresolvable tokens
    deferredSentCount++;
    quarantinedIds.add(c.id);
  } else {
    // Place at lowest stage ≥ max(2, maxDepStage) that still has budget
    chosen = Math.max(2, maxDepStage);
    while (chosen <= 8 && currentStageTotal[chosen] >= TARGETS[chosen]) chosen++;
    if (chosen > 8) chosen = 8; // overflow safety
    placedSentCount++;
  }
  stageAssign.set(c.id, chosen);
  currentStageTotal[chosen]++;
}

console.log('Sentences placed cleanly:', placedSentCount);
console.log('Sentences quarantined to S8 (unresolvable tokens):', deferredSentCount);
console.log('');

// ============================================================================
// COMPUTE OVERRIDES AND ADDITIONS
// ============================================================================

const overrides = {};
const baseById = new Map(BASE_CARDS.map(c => [c.id, c]));
const newIds = new Set(NEW_CARDS.map(c => c.id));

for (const c of workingCards) {
  if (newIds.has(c.id)) continue; // new cards handled separately
  const base = baseById.get(c.id);
  if (!base) continue;

  const newStage = stageAssign.get(c.id);
  const newType = c.type;
  const newEn = c.en;
  const newPh = c.ph;

  const o = {};
  if (newStage !== base.stage) o.stage = newStage;
  if (newType !== base.type) o.type = newType;
  if (newEn !== base.en) o.en = newEn;
  if (newPh !== base.ph) o.ph = newPh;

  if (quarantinedIds.has(c.id)) o.needsReview = true;
  if (Object.keys(o).length > 0) overrides[c.id] = o;
}

// Post-pass: ensure ALL sentence/phrase cards with unresolvable tokens are
// flagged needsReview, including type='p' phrases that bypass the placement
// loop. Catches the few extra cases the verifier finds.
for (const c of workingCards) {
  if (c.type !== 's' && c.type !== 'p') continue;
  const tokens = (Array.isArray(c.breakdown) && c.breakdown.length)
    ? c.breakdown.map(b => b.thai).filter(Boolean)
    : segment(c.thai);
  let unresolvable = false;
  for (const t of tokens) {
    if (t.startsWith('?')) { unresolvable = true; break; }
    const vc = vocab.get(t);
    if (!vc) { unresolvable = true; break; }
    if (vc.id === c.id) continue;
  }
  if (unresolvable) {
    if (!overrides[c.id]) overrides[c.id] = {};
    overrides[c.id].needsReview = true;
  }
}

// Update stages on new cards based on assignment (their declared stage was a hint; actual stage from algorithm)
const finalNewCards = NEW_CARDS.map(c => ({ ...c, stage: stageAssign.get(c.id) ?? c.stage }));

// ============================================================================
// FINAL DISTRIBUTION REPORT
// ============================================================================

const finalByStage = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0 };
for (const c of workingCards) {
  const s = stageAssign.get(c.id);
  if (s) finalByStage[s]++;
}
console.log('=== Final distribution ===');
console.log('Stage | Target | Final | Δ');
for (let s = 1; s <= 8; s++) {
  console.log('  ' + s + '   | ' + String(TARGETS[s]).padStart(5) + '  | ' + String(finalByStage[s]).padStart(5) + ' | ' + (finalByStage[s] - TARGETS[s] >= 0 ? '+' : '') + (finalByStage[s] - TARGETS[s]));
}
console.log('Total:', Object.values(finalByStage).reduce((a, b) => a + b, 0), '/', workingCards.length);
console.log('Overrides generated:', Object.keys(overrides).length);
console.log('');

// ============================================================================
// WRITE FILES
// ============================================================================

function fmt(s) {
  // Escape single quotes and backslashes for embedding in a JS string literal
  return String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function cardLiteral(c) {
  const parts = [`id:${c.id}`, `thai:'${fmt(c.thai)}'`, `ph:'${fmt(c.ph || '')}'`, `en:'${fmt(c.en || '')}'`, `type:'${c.type}'`, `stage:${c.stage}`, `cat:'${fmt(c.cat)}'`];
  if (c.note) parts.push(`note:'${fmt(c.note)}'`);
  return '{' + parts.join(',') + '}';
}

const additionsLines = finalNewCards.map(c => '  ' + cardLiteral(c) + ',').join('\n');
const overrideEntries = Object.entries(overrides).map(([id, o]) => {
  const fields = Object.entries(o).map(([k, v]) => {
    if (typeof v === 'string') return `${k}:'${fmt(v)}'`;
    return `${k}:${v}`;
  }).join(',');
  return `  ${id}: {${fields}}`;
}).join(',\n');

const step2Content = `// Step 2 (Phase 2): redistribution overrides + new vocab.
// Generated by scripts/apply-redistribution.js on ${new Date().toISOString()}.
// Do not hand-edit unless you know what you are doing — re-run the script
// to regenerate with new inputs.

export const STEP2_ADDITIONS = [
${additionsLines}
];

export const STEP2_OVERRIDES = {
${overrideEntries}
};
`;

fs.writeFileSync(path.join(REPO_ROOT, 'src/data/cards-step2.js'), step2Content, 'utf8');
console.log('Wrote src/data/cards-step2.js (' + finalNewCards.length + ' new cards, ' + Object.keys(overrides).length + ' overrides)');

// Persist useful diagnostics
fs.writeFileSync(path.join(REPO_ROOT, 'STAGING_FINAL_STATS.json'), JSON.stringify({
  finalDistribution: finalByStage,
  targets: TARGETS,
  newCards: finalNewCards.length,
  overrides: Object.keys(overrides).length,
  retypedToW: [...RETYPE_TO_W],
  retypedToP: [...RETYPE_TO_P],
  sentencesQuarantined: deferredSentCount
}, null, 2));
console.log('Wrote STAGING_FINAL_STATS.json');
