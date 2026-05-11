// Simulates applying the approved 21 vocab changes and finds the next batch
// of high-impact missing vocab. No file modifications.
//
// Now also: greedy set-cover analysis — for each candidate addition set,
// compute how many sentences fully unblock (all unknowns resolved).

import { CARDS } from '../src/data/cards.js';
import { WORD_LOOKUP } from '../src/data/lookup.js';

const NEW_W_THAI_STEP2 = [
  'อันนี้', 'เจอกัน', 'ไม่ใช่',
  'มั้ย', 'ได้ไหม', 'กินข้าว', 'จากไหน', 'สักครู่',
  'เหรอ', 'เช็คบิล', 'เมนู', 'หลงทาง', 'หรือยัง', 'งี้'
];

const RETYPED_TO_W_IDS = new Set([4528, 5361, 4474, 5344, 4671]);

function buildVocab(extraThai = []) {
  const vocab = new Map();
  for (const c of CARDS) {
    const t = RETYPED_TO_W_IDS.has(c.id) ? 'w' : c.type;
    // Include w, g, AND p — phrase cards are idiomatic vocab units
    if (t === 'w' || t === 'g' || t === 'p') if (!vocab.has(c.thai)) vocab.set(c.thai, {});
  }
  for (const [, info] of Object.entries(WORD_LOOKUP)) {
    if (info.thai && !vocab.has(info.thai)) vocab.set(info.thai, {});
  }
  for (const c of CARDS) {
    if (Array.isArray(c.breakdown)) for (const b of c.breakdown) {
      if (b && b.thai && !vocab.has(b.thai)) vocab.set(b.thai, {});
    }
  }
  for (const t of NEW_W_THAI_STEP2) if (!vocab.has(t)) vocab.set(t, {});
  for (const t of extraThai) if (!vocab.has(t)) vocab.set(t, {});
  return vocab;
}

function makeSegmenter(vocab) {
  const keysByLen = [...vocab.keys()].sort((a, b) => b.length - a.length);
  return (thaiRaw) => {
    const unknowns = [];
    const chunks = thaiRaw.split(/[\sๆ?.,!;:"'“”‘’()\[\]{}\-—–…\/\\_*<>=#%&@+|`~^]+/u).filter(Boolean);
    for (const chunk of chunks) {
      let pos = 0;
      let unk = '';
      while (pos < chunk.length) {
        let matched = null;
        for (const w of keysByLen) {
          if (w.length === 0) continue;
          if (chunk.startsWith(w, pos)) { matched = w; break; }
        }
        if (matched) {
          if (unk) { unknowns.push(unk); unk = ''; }
          pos += matched.length;
        } else {
          unk += chunk[pos]; pos++;
        }
      }
      if (unk) unknowns.push(unk);
    }
    return unknowns;
  };
}

const sentLike = CARDS.filter(c => c.type === 's' || c.type === 'p')
  .filter(c => !RETYPED_TO_W_IDS.has(c.id))
  .filter(c => !(Array.isArray(c.breakdown) && c.breakdown.length));

// ---------- Pass 1: blockers after the 21 already-approved ----------

const baseVocab = buildVocab([]);
const baseSeg = makeSegmenter(baseVocab);

const blockedBase = [];
for (const c of sentLike) {
  const unk = baseSeg(c.thai || '');
  if (unk.length > 0) blockedBase.push({ id: c.id, type: c.type, thai: c.thai, en: c.en, unknowns: unk });
}
console.log('Baseline (after 21 patches): ' + blockedBase.length + ' sentences still blocked');

// Count token references
const tokenBlockers = new Map();
for (const b of blockedBase) for (const u of b.unknowns) tokenBlockers.set(u, (tokenBlockers.get(u) || 0) + 1);

// ---------- Classify candidates ----------

function classify(t) {
  if (t.length === 1) return 'single-char';
  if (!/[ก-ฮ]/.test(t)) return 'diacritic-only';
  // Karan marker ์ in middle/end → compound with silent letter (e.g. แบงค์) — keep as candidate
  // Repeated mai-eek/mai-tri (ปุ๊บปั๊บ) — onomatopoeia
  if (/^[เแโไใ][ก-ฮ]?$/.test(t) && t.length <= 2) return 'leading-vowel-fragment';
  return 'candidate';
}

// ---------- Greedy set-cover: which adds unblock the most sentences? ----------

function simulateAdditions(adds) {
  const vocab = buildVocab(adds);
  const seg = makeSegmenter(vocab);
  let unblocked = 0;
  for (const c of sentLike) {
    const unk = seg(c.thai || '');
    if (unk.length === 0) unblocked++;
  }
  // unblocked is total satisfied sentences (across all sentLike, not just those previously blocked)
  // Baseline-satisfied:
  const baseSatisfied = sentLike.length - blockedBase.length;
  return unblocked - baseSatisfied; // new sentences satisfied by these adds
}

// Build candidate pool — real-word candidates (skip single-char fragments and pure-diacritic shards)
const candidates = [...tokenBlockers.entries()]
  .map(([t, count]) => ({ t, count, cls: classify(t) }))
  .filter(r => r.cls === 'candidate')
  .sort((a, b) => b.count - a.count);

console.log('Candidate (real-word) tokens after patch:', candidates.length);
console.log('');

// Greedy: at each step, add the single token that increases unblock count the most
const picked = [];
const pickedSet = new Set();
const remaining = candidates.map(c => c.t);

function unblockedWith(extras) {
  return simulateAdditions(extras);
}

let currentUnblock = 0;
const MAX_PICKS = 35;
console.log('Running greedy set-cover (up to ' + MAX_PICKS + ' picks)…');
for (let step = 0; step < MAX_PICKS; step++) {
  let best = null, bestGain = 0;
  for (const t of remaining) {
    if (pickedSet.has(t)) continue;
    const u = unblockedWith([...picked, t]);
    const gain = u - currentUnblock;
    if (gain > bestGain) { bestGain = gain; best = t; }
  }
  if (!best || bestGain === 0) break;
  picked.push(best);
  pickedSet.add(best);
  currentUnblock += bestGain;
  // Look up existing card if any
  const ex = CARDS.filter(c => c.thai === best);
  const status = ex.length ? ex.map(c => `id ${c.id} ${c.type}/s${c.stage}`).join('; ') : 'NEW';
  console.log('  +' + bestGain + '  ' + best.padEnd(14) + '  total=' + currentUnblock + '  (' + status + ')');
}

console.log('');
console.log('After greedy: ' + (132 - currentUnblock) + ' sentences would remain blocked (target <100)');
console.log('');

// Now also propose individual common-word candidates (high count) that the greedy may have skipped because they only unblock partial sentences
console.log('=== Top 30 candidates by reference count (regardless of full-unblock) ===');
for (const r of candidates.slice(0, 30)) {
  const ex = CARDS.filter(c => c.thai === r.t);
  const status = ex.length ? ex.map(c => `id ${c.id} ${c.type}/s${c.stage} ${c.en}`).join('; ') : 'NEW';
  console.log('  ' + String(r.count).padStart(2) + '  ' + r.t.padEnd(14) + '  ' + status);
}
