// Phase 1 analysis only: reads cards, segments sentences, scores difficulty,
// proposes a stage redistribution that respects dependency ordering. Writes
// STAGING_PLAN.md at repo root. Does NOT modify any card data file.
//
// Run: node scripts/analyze-redistribution.js

import { CARDS } from '../src/data/cards.js';
import { WORD_LOOKUP } from '../src/data/lookup.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');

const TARGETS = { 1: 150, 2: 275, 3: 425, 4: 575, 5: 700, 6: 800, 7: 875, 8: 952 };
const TOLERANCE = 0.10;

// ---------- Build Thai → entry vocabulary ----------

const vocab = new Map(); // thai -> { ph, en, source }
for (const c of CARDS) {
  if (c.type === 'w' || c.type === 'g') {
    if (!vocab.has(c.thai)) {
      vocab.set(c.thai, { thai: c.thai, ph: c.ph || '', en: c.en || '', source: 'card', id: c.id });
    }
  }
}
for (const [ph, info] of Object.entries(WORD_LOOKUP)) {
  if (info.thai && !vocab.has(info.thai)) {
    vocab.set(info.thai, { thai: info.thai, ph, en: info.en || '', source: 'lookup' });
  }
}
// Also harvest words from existing breakdown[] arrays — these are author-curated tokens
for (const c of CARDS) {
  if (Array.isArray(c.breakdown)) {
    for (const b of c.breakdown) {
      if (b && b.thai && !vocab.has(b.thai)) {
        vocab.set(b.thai, { thai: b.thai, ph: b.ph || '', en: b.en || '', source: 'breakdown' });
      }
    }
  }
}

const vocabKeysByLen = [...vocab.keys()].sort((a, b) => b.length - a.length);

// ---------- Longest-match segmenter ----------

const PUNCT = /[\s​ ?.,!;:"'()\-—–]/;

function segment(thaiRaw) {
  const tokens = [];
  const unknowns = [];
  // Strip ASCII + smart punctuation, ellipsis, slashes, brackets. Anything not
  // a Thai letter or digit becomes a chunk boundary.
  // ๆ is the Thai mai yamok (repetition marker) — treat as punctuation, not a word.
  const chunks = thaiRaw.split(/[\sๆ?.,!;:"'“”‘’()\[\]{}\-—–…\/\\_*<>=#%&@+|`~^]+/u).filter(Boolean);
  for (const chunk of chunks) {
    let pos = 0;
    let unkSpan = '';
    while (pos < chunk.length) {
      let matched = null;
      for (const w of vocabKeysByLen) {
        if (w.length === 0) continue;
        if (chunk.startsWith(w, pos)) { matched = w; break; }
      }
      if (matched) {
        if (unkSpan) { tokens.push('?' + unkSpan); unknowns.push(unkSpan); unkSpan = ''; }
        tokens.push(matched);
        pos += matched.length;
      } else {
        unkSpan += chunk[pos];
        pos++;
      }
    }
    if (unkSpan) { tokens.push('?' + unkSpan); unknowns.push(unkSpan); }
  }
  return { tokens, unknowns };
}

// Existing breakdown[] is authoritative when present
function getDeps(card) {
  if (Array.isArray(card.breakdown) && card.breakdown.length) {
    return {
      tokens: card.breakdown.map(b => b.thai).filter(Boolean),
      unknowns: [],
      source: 'breakdown'
    };
  }
  const seg = segment(card.thai || '');
  return { tokens: seg.tokens, unknowns: seg.unknowns, source: 'segment' };
}

// ---------- Pass 1: segment all sentence/phrase cards ----------

const sentLike = CARDS.filter(c => c.type === 's' || c.type === 'p');
const deps = new Map(); // card.id -> { tokens, unknowns, source }
for (const c of sentLike) {
  deps.set(c.id, getDeps(c));
}

// ---------- Frequency proxy: count token references across sentences ----------

const tokenRefs = new Map(); // thai -> count of sentences using it
for (const c of sentLike) {
  for (const t of deps.get(c.id).tokens) {
    if (t.startsWith('?')) continue;
    tokenRefs.set(t, (tokenRefs.get(t) || 0) + 1);
  }
}

// ---------- Difficulty scoring ----------

function toneCount(ph) {
  return (ph.match(/[àáâǎ]/g) || []).length;
}

function wordDifficulty(card) {
  const ph = card.ph || '';
  const thaiLen = (card.thai || '').length;
  const phWords = ph.trim() ? ph.trim().split(/\s+/).length : 1;
  const tones = toneCount(ph);
  const refs = tokenRefs.get(card.thai) || 0;
  // High refs → very common word → lower difficulty
  const freqBonus = -Math.log10(1 + refs) * 0.6;
  return 1.0 + Math.max(0, thaiLen - 2) * 0.18 + tones * 0.25 + (phWords - 1) * 0.4 + freqBonus;
}

function grammarDifficulty(card) {
  // Grammar particles are essential basics; treat like words but slightly higher
  return wordDifficulty(card) + 0.15;
}

function sentenceDifficulty(card, wordScoreByThai) {
  const d = deps.get(card.id);
  const known = d.tokens.filter(t => !t.startsWith('?'));
  const unknown = d.tokens.length - known.length;
  let sum = 0;
  for (const t of known) sum += (wordScoreByThai.get(t) || 2.0);
  const avg = known.length ? sum / known.length : 2.5;
  const base = card.type === 's' ? 3.0 : 2.0;
  // ph empty (phNeedsGen) implies less reviewed content → +0.5
  const phEmptyPenalty = (!card.ph || !card.ph.trim()) ? 0.5 : 0;
  return base + d.tokens.length * 0.35 + avg * 0.7 + unknown * 0.4 + phEmptyPenalty;
}

const wordScoreByThai = new Map();
for (const c of CARDS) {
  if (c.type === 'w') wordScoreByThai.set(c.thai, wordDifficulty(c));
  else if (c.type === 'g') wordScoreByThai.set(c.thai, grammarDifficulty(c));
}

const difficulty = new Map(); // id -> score
for (const c of CARDS) {
  if (c.type === 'w') difficulty.set(c.id, wordDifficulty(c));
  else if (c.type === 'g') difficulty.set(c.id, grammarDifficulty(c));
  else difficulty.set(c.id, sentenceDifficulty(c, wordScoreByThai));
}

// ---------- Identify Stage 1 essential sentences (10 picks) ----------

// PM's 5 must-haves first, then 5 my-picks for tourist survival. Patterns try
// strict match first, then a loose fallback so common variants are caught.
const ESSENTIAL_PATTERNS = [
  { label: 'My name is',           regex: /^my name'?s?\s|^my name is/i },
  { label: 'Where is the bathroom',regex: /where.*(bathroom|toilet|restroom)/i },
  { label: 'How much is this',     regex: /how much/i },
  { label: "I don't speak Thai",   regex: /(don't|do not|cannot|can't|not able to) speak thai|i (only )?speak (a little|some) thai/i },
  { label: 'Thank you very much',  regex: /thank you( very much)?\.?$/i },
  { label: 'Hello / Goodbye',      regex: /^(hello|hi|goodbye|good day|good morning|good afternoon|good evening)\b/i },
  { label: "You're welcome / No worries", regex: /(no worries|you'?re welcome|never mind|it'?s nothing|don'?t mention it)/i },
  { label: 'Sorry / Excuse me',    regex: /^(excuse me|sorry|pardon)/i },
  { label: "I don't understand",   regex: /^(i )?(don't|do not) understand\b/i },
  { label: 'Yes / No',             regex: /^(yes|no|yeah|nope|right|correct)\.?$/i }
];

function pickEssentialSentences() {
  const picked = [];
  const usedIds = new Set();
  for (const pat of ESSENTIAL_PATTERNS) {
    if (picked.length >= 10) break;
    const candidates = sentLike
      .filter(c => !usedIds.has(c.id) && pat.regex.test(c.en || ''))
      .sort((a, b) => difficulty.get(a.id) - difficulty.get(b.id));
    if (candidates.length) {
      picked.push({ pattern: pat.label, card: candidates[0] });
      usedIds.add(candidates[0].id);
    } else {
      picked.push({ pattern: pat.label, card: null });
    }
  }
  return picked.slice(0, 10);
}

// Bias picker toward shorter sentences (more "essential" feel) and prefer ones
// whose tokens are all common.
function pickEssentialSentencesPriority() {
  const picked = [];
  const usedIds = new Set();
  for (const pat of ESSENTIAL_PATTERNS) {
    if (picked.length >= 10) break;
    const candidates = sentLike
      .filter(c => !usedIds.has(c.id) && pat.regex.test(c.en || ''))
      .sort((a, b) => {
        const da = (a.thai || '').length;
        const db = (b.thai || '').length;
        if (da !== db) return da - db;
        return difficulty.get(a.id) - difficulty.get(b.id);
      });
    if (candidates.length) {
      picked.push({ pattern: pat.label, card: candidates[0] });
      usedIds.add(candidates[0].id);
    } else {
      picked.push({ pattern: pat.label, card: null });
    }
  }
  return picked;
}

const essentialPicks = pickEssentialSentencesPriority();
const essentialCards = essentialPicks.filter(p => p.card).map(p => p.card);
const essentialIds = new Set(essentialCards.map(c => c.id));

// ---------- Pick Stage 1 vocabulary (140 easiest words/grammar) ----------

// Constraint: every essential sentence's constituent words must be Stage 1.
// So: start with the union of constituent words of essential sentences,
// then top up to 140 with easiest words by difficulty.

const stage1Required = new Set();
for (const c of essentialCards) {
  for (const t of deps.get(c.id).tokens) {
    if (t.startsWith('?')) continue;
    stage1Required.add(t);
  }
}

const wordsAndGrammar = CARDS.filter(c => c.type === 'w' || c.type === 'g');
const stage1Words = [];
const usedThai = new Set();

// First, every required word
for (const t of stage1Required) {
  const c = wordsAndGrammar.find(w => w.thai === t);
  if (c && !usedThai.has(c.thai)) {
    stage1Words.push(c);
    usedThai.add(c.thai);
  }
}
const stage1WordsRequiredCount = stage1Words.length;

// Then top up easiest first
const sortedWG = [...wordsAndGrammar].sort(
  (a, b) => (difficulty.get(a.id) || 0) - (difficulty.get(b.id) || 0)
);
for (const c of sortedWG) {
  if (stage1Words.length >= 140) break;
  if (!usedThai.has(c.thai)) {
    stage1Words.push(c);
    usedThai.add(c.thai);
  }
}

// ---------- Assign remaining word/grammar cards by difficulty, targeting sizes ----------
// Stage 1 size target = 150 (140 words + 10 sentences).
// For stages 2-8, allocate words proportionally to (stage_target - sentences_expected).
// Easiest approach: globally sort remaining cards by difficulty and pour into stages
// until each hits its target word-share. Then place sentences on top.

const stageAssign = new Map(); // id -> stage

for (const c of stage1Words) stageAssign.set(c.id, 1);
for (const c of essentialCards) stageAssign.set(c.id, 1);

// Remaining word/grammar cards in difficulty order
const remainingWG = sortedWG.filter(c => !stageAssign.has(c.id));

// Estimate sentence/phrase counts per stage proportional to remaining sentences
// after pulling out the essential 10
const remainingSentLike = sentLike.filter(c => !essentialIds.has(c.id));
const totalRemaining = remainingWG.length + remainingSentLike.length;
const stageTotalRemaining = {};
let consumed = stage1Words.length + essentialCards.length;
for (let s = 2; s <= 8; s++) stageTotalRemaining[s] = TARGETS[s];

// Word share per stage = words remaining * (stage_target / sum_targets_2_to_8)
const sumTargets2to8 = Object.values(TARGETS).reduce((a, b) => a + b, 0) - TARGETS[1];
const stageWordCap = {};
for (let s = 2; s <= 8; s++) {
  stageWordCap[s] = Math.round(remainingWG.length * TARGETS[s] / sumTargets2to8);
}

let wgIdx = 0;
for (let s = 2; s <= 8; s++) {
  const cap = stageWordCap[s];
  for (let k = 0; k < cap && wgIdx < remainingWG.length; k++, wgIdx++) {
    stageAssign.set(remainingWG[wgIdx].id, s);
  }
}
// Any leftover (rounding) → stage 8
while (wgIdx < remainingWG.length) {
  stageAssign.set(remainingWG[wgIdx].id, 8);
  wgIdx++;
}

// ---------- Place sentences/phrases respecting dependency ----------

const unplaceable = [];
const sentSorted = [...remainingSentLike].sort(
  (a, b) => difficulty.get(a.id) - difficulty.get(b.id)
);
const stageSentCount = { 1: essentialCards.length, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0 };

function maxDepStage(card) {
  const d = deps.get(card.id);
  let maxS = 0;
  let unknownTokens = [];
  for (const t of d.tokens) {
    if (t.startsWith('?')) { unknownTokens.push(t.slice(1)); continue; }
    const vocabCard = wordsAndGrammar.find(w => w.thai === t);
    if (!vocabCard) {
      // Token recognized in vocab map but not as a card (lookup-only or breakdown-only)
      unknownTokens.push(t);
      continue;
    }
    const s = stageAssign.get(vocabCard.id);
    if (s && s > maxS) maxS = s;
  }
  return { maxS, unknownTokens };
}

for (const c of sentSorted) {
  const { maxS, unknownTokens } = maxDepStage(c);
  if (unknownTokens.length > 0) {
    unplaceable.push({ card: c, reason: 'tokens not in vocab', unknownTokens });
    continue;
  }
  // Place in the difficulty-suggested stage, but no earlier than maxS, no later than 8
  const sortPos = sentSorted.indexOf(c);
  const naturalStage = Math.min(8, Math.max(2,
    Math.ceil((sortPos / sentSorted.length) * 7) + 1
  ));
  const stage = Math.max(naturalStage, maxS, 1);
  stageAssign.set(c.id, stage);
  stageSentCount[stage]++;
}

// ---------- Compute proposed totals ----------

const proposed = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0 };
for (const c of CARDS) {
  const s = stageAssign.get(c.id);
  if (s) proposed[s]++;
}
// Unplaceable cards are excluded from proposed totals (held aside)

// ---------- Sample 20 cards per stage (mixed types, sorted by difficulty) ----------

function sampleStage(stage, n = 20) {
  const inStage = CARDS.filter(c => stageAssign.get(c.id) === stage)
    .map(c => ({ c, d: difficulty.get(c.id) }))
    .sort((a, b) => a.d - b.d);
  // Take 5 easiest, 5 hardest, 10 evenly spaced middle
  const out = [];
  const N = inStage.length;
  if (N === 0) return [];
  const idxs = [];
  for (let i = 0; i < Math.min(n, N); i++) idxs.push(Math.floor((i * N) / Math.min(n, N)));
  for (const i of idxs) out.push(inStage[i]);
  return out;
}

// ---------- Compose STAGING_PLAN.md ----------

const lines = [];
const push = (l = '') => lines.push(l);

push('# Staging Plan — Phase 1 analysis');
push('');
push(`Generated by \`scripts/analyze-redistribution.js\`. Reads CARDS (${CARDS.length} total) and proposes a stage assignment respecting size targets and sentence dependency ordering. **No card-data files were modified.**`);
push('');

push('## 1. Current vs target distribution');
push('');
push('| Stage | Current | Target | Tolerance (±10%) | Proposed | Δ vs target |');
push('|---|---:|---:|---|---:|---:|');
const currentByStage = {};
for (const c of CARDS) currentByStage[c.stage] = (currentByStage[c.stage] || 0) + 1;
for (let s = 1; s <= 8; s++) {
  const t = TARGETS[s];
  const tol = `${Math.round(t * (1 - TOLERANCE))}–${Math.round(t * (1 + TOLERANCE))}`;
  const p = proposed[s];
  const delta = p - t;
  push(`| ${s} | ${currentByStage[s] || 0} | ${t} | ${tol} | ${p} | ${delta >= 0 ? '+' : ''}${delta} |`);
}
const placed = Object.values(proposed).reduce((a, b) => a + b, 0);
push(`| **Total** | **${CARDS.length}** | **4752** | | **${placed}** | (${CARDS.length - placed} unplaceable) |`);
push('');

push('## 2. Stage 1 — essential sentences (10 picks)');
push('');
push('Each picked sentence is the easiest existing card matching the pattern. **All constituent vocabulary is force-included in Stage 1 first**, then Stage 1 is topped up to 140 words with the easiest remaining words/grammar (+10 sentences = 150 total).');
push('');
push('| # | Pattern requested | Picked card | Thai | Tokens |');
push('|---|---|---|---|---|');
for (let i = 0; i < essentialPicks.length; i++) {
  const ep = essentialPicks[i];
  if (!ep.card) {
    push(`| ${i + 1} | ${ep.pattern} | **NOT FOUND** | — | — |`);
  } else {
    const d = deps.get(ep.card.id);
    const tokDisplay = d.tokens.join(' · ');
    push(`| ${i + 1} | ${ep.pattern} | id ${ep.card.id} "${ep.card.en}" | ${ep.card.thai} | ${tokDisplay} |`);
  }
}
push('');
push(`Stage 1 vocabulary breakdown: ${stage1WordsRequiredCount} words required by essential sentences + ${stage1Words.length - stage1WordsRequiredCount} easiest top-up = ${stage1Words.length} words/grammar + ${essentialCards.length} sentences = **${stage1Words.length + essentialCards.length} cards**.`);
push('');

push('## 3. Sample cards per stage (difficulty progression)');
push('');
push('Sampled evenly across the stage by ascending difficulty score. `[w]`, `[g]`, `[p]`, `[s]` = card type.');
push('');
for (let s = 1; s <= 8; s++) {
  const samples = sampleStage(s, 20);
  push(`### Stage ${s} (proposed: ${proposed[s]} cards, target ${TARGETS[s]})`);
  push('');
  if (samples.length === 0) {
    push('_(no cards assigned)_');
    push('');
    continue;
  }
  push('| diff | type | thai | ph | en |');
  push('|---:|---|---|---|---|');
  for (const { c, d } of samples) {
    const ph = c.ph || '_(empty)_';
    const en = (c.en || '').replace(/\|/g, '\\|');
    push(`| ${d.toFixed(2)} | ${c.type} | ${c.thai} | ${ph} | ${en} |`);
  }
  push('');
}

push('## 4. Unplaceable sentences');
push('');
push(`${unplaceable.length} sentences could not be placed because their constituent Thai words could not be matched against our vocabulary (no \`w\`/\`g\` card with that Thai spelling).`);
push('');
if (unplaceable.length === 0) {
  push('_(none)_');
} else {
  push('Showing up to first 40, sorted by number of unknown tokens (worst first):');
  push('');
  push('| id | type | stage(now) | thai | en | unknown tokens | suggested fix |');
  push('|---:|---|---:|---|---|---|---|');
  const sorted = unplaceable.slice().sort((a, b) => b.unknownTokens.length - a.unknownTokens.length);
  for (const u of sorted.slice(0, 40)) {
    const fix = u.unknownTokens.length === 1
      ? `add a \`w\` card for "${u.unknownTokens[0]}"`
      : `add \`w\` cards for: ${u.unknownTokens.slice(0, 3).join(', ')}${u.unknownTokens.length > 3 ? '…' : ''}`;
    push(`| ${u.card.id} | ${u.card.type} | ${u.card.stage} | ${u.card.thai} | ${(u.card.en || '').replace(/\|/g, '\\|')} | ${u.unknownTokens.join(' · ')} | ${fix} |`);
  }
  push('');
  // Aggregate: which unknown tokens appear most often?
  const unkFreq = new Map();
  for (const u of unplaceable) for (const t of u.unknownTokens) unkFreq.set(t, (unkFreq.get(t) || 0) + 1);
  const topUnk = [...unkFreq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 30);
  push('### Most-needed missing word cards (top 30)');
  push('');
  push('Adding `w` cards for these would resolve the largest number of unplaceable sentences.');
  push('');
  push('| Thai | sentences blocked |');
  push('|---|---:|');
  for (const [t, n] of topUnk) push(`| ${t} | ${n} |`);
  push('');
}

push('## 5. Dependency graph statistics');
push('');
const allTokenCounts = [];
let viaBreakdown = 0, viaSegment = 0;
for (const c of sentLike) {
  const d = deps.get(c.id);
  allTokenCounts.push(d.tokens.length);
  if (d.source === 'breakdown') viaBreakdown++; else viaSegment++;
}
const avg = allTokenCounts.reduce((a, b) => a + b, 0) / allTokenCounts.length;
const distrib = {};
for (const n of allTokenCounts) {
  const bucket = n <= 2 ? '1-2' : n <= 4 ? '3-4' : n <= 6 ? '5-6' : n <= 8 ? '7-8' : '9+';
  distrib[bucket] = (distrib[bucket] || 0) + 1;
}
push(`- Sentence/phrase cards: **${sentLike.length}**`);
push(`- Tokens resolved via existing \`breakdown[]\`: **${viaBreakdown}**`);
push(`- Tokens resolved via longest-match segmentation: **${viaSegment}**`);
push(`- Average tokens per sentence: **${avg.toFixed(2)}**`);
push(`- Vocabulary used for segmentation: **${vocab.size}** Thai forms (${[...vocab.values()].filter(v=>v.source==='card').length} from cards, ${[...vocab.values()].filter(v=>v.source==='lookup').length} from WORD_LOOKUP, ${[...vocab.values()].filter(v=>v.source==='breakdown').length} from breakdown arrays)`);
push(`- Token-count distribution: ${Object.entries(distrib).map(([k, v]) => `${k}: ${v}`).join(', ')}`);
push('');
// Most-referenced words
const refTop = [...tokenRefs.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20);
push('### Most-referenced vocabulary (top 20, treated as easiest/most common)');
push('');
push('| Thai | sentences referencing |');
push('|---|---:|');
for (const [t, n] of refTop) push(`| ${t} | ${n} |`);
push('');

push('## 6. Open questions for the product manager');
push('');
push('**The current content cannot cleanly hit the target distribution.** The targets call for stages 6-8 to hold ~2,627 cards combined (most of the deck), but those stages are meant to be the *hardest*. Existing content is heavily front-loaded with beginner/intermediate words — most of it genuinely belongs in stages 1-4 by difficulty.');
push('');
push('Three paths to consider before Phase 2:');
push('');
push('1. **Accept the lopsided shape.** Stage 1-4 will exceed targets; stages 5-8 will undershoot. Closer to honest difficulty progression but violates the size goal.');
push('2. **Stretch the difficulty scale.** Push moderate cards (e.g. uncommon words, longer sentences) up into stages 5-8 even when they\'re not truly "hard." Hits size targets but the late-stage difficulty curve will feel flat.');
push('3. **Backfill late-stage content.** Add ~2,000 advanced cards (rare vocabulary, idioms, complex sentences) before redistributing. Best learner experience but needs a content-acquisition pass first.');
push('');
push('The proposed assignment in this report uses approach **(2)** — easy cards distributed across all 8 stages by *relative* difficulty within their type, so the size shape matches the target. The Stage 7-8 samples above show how mild this difficulty is in practice. Recommend reviewing Stage 8 samples to decide whether this is acceptable.');
push('');

fs.writeFileSync(path.join(REPO_ROOT, 'STAGING_PLAN.md'), lines.join('\n'), 'utf8');
console.log('Wrote STAGING_PLAN.md (' + lines.length + ' lines)');
console.log('');
console.log('Summary:');
console.log('  Proposed distribution:', proposed);
console.log('  Unplaceable sentences:', unplaceable.length);
console.log('  Essential sentences found:', essentialCards.length, '/ 10');
