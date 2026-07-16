// Generates the native-author worklists — the fill-in lists the human Thai team
// works from, and the ingestion tool (scripts/ingest-native-authoring.mjs) reads
// back. Regenerate after any content change: node scripts/write-native-author-worklists.mjs
//
// AUTHORS ZERO Thai and ZERO phonetics. Every `ph` (and `correctedThai`) field is
// BLANK by design — a guessed romanization guesses a tone, which is a wrong word,
// and approval is human-only. This script only ARRANGES the work.
//
// Produces four files in docs/:
//   • native-author-worklist-phonetics.md / .json — all 335 empty-`ph` cards,
//     grouped by situation, each with a BLANK `ph` to fill.
//   • native-author-worklist-corrupted.md / .json — the 7 quarantined
//     (corrupted-Thai) cards, each with a structural DIAGNOSIS (not a corrected
//     guess) and BLANK correctedThai + ph.

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { ALL_CARDS } from '../src/data/cards.js';
import { hasPhonetic } from '../src/lib/phonetics.js';
import { QUARANTINED_CARD_IDS } from '../src/data/contentFlags.js';
import { situationOf, getSituation, SITUATION_IDS } from '../src/lib/situations.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const today = new Date().toISOString().slice(0, 10);

const QUAR = new Set(QUARANTINED_CARD_IDS);
const emptyPh = ALL_CARDS.filter((c) => !hasPhonetic(c)).sort((a, b) => a.id - b.id);

// ── Structural diagnoses for the 7 corrupted-Thai cards ──────────────────────
// A DIAGNOSIS of the corruption TYPE — NOT a corrected guess. The native team
// supplies the correct Thai; we only describe what looks wrong and how hard it is.
const CORRUPT_DIAGNOSIS = {
  4756: { type: 'inserted/garbled syllable', hardest: true,
    note: 'The cluster "บุคุณ" is not a standard word. Likely either "บุญคุณ" (a debt of gratitude — a ญ dropped) or a stray "บุ" before "คุณ". AMBIGUOUS — two plausible targets; the reviewer decides which the sentence intends.' },
  4959: { type: 'wrong vowel diacritic',
    note: '"เพึ่ง" carries สระอึ (U+0E36) where สระอิ (U+0E34) is expected — a single-vowel typo. The card\'s own note already records the intended reading "เขาเพิ่งจะไป"; confirm and apply.' },
  5002: { type: 'double / stacked tone mark',
    note: '"นี้่" stacks BOTH ไม้โท (U+0E49) and ไม้เอก (U+0E48) on the same syllable — an invalid double tone mark. One must be removed; confirm which tone is intended.' },
  5074: { type: 'dropped consonant',
    note: '"คาม" is missing a ว — the intended word for "truth/matter" in "เล่า___จริง" is "ความ". Supply the corrected script.' },
  5084: { type: 'dropped vowel',
    note: '"พยยาม" is missing a สระอา — the verb "to try" is "พยายาม". Supply the corrected script.' },
  5151: { type: 'truncation', hardest: true,
    note: 'The Thai ends on an orphan "ท" ("ต้องรีบท") — the sentence is cut off mid-word. NO CLEAR TARGET: what "finish it quickly" was meant to say cannot be recovered from the fragment; the reviewer must re-author the full phrase from the English.' },
  5216: { type: 'mojibake (เเ for แ) + dropped consonant',
    note: 'Two U+0E40 (เเ) appear where a single แ (U+0E41) belongs, and a ด is missing — "เปิเเผย" for the intended "เปิดเผย" (to reveal). Supply the corrected script.' },
};

// ── 1. PHONETICS WORKLIST (all 335 empty-`ph`) ───────────────────────────────
const phBySit = {};
for (const c of emptyPh) {
  const sit = situationOf(c) || 'untagged';
  (phBySit[sit] || (phBySit[sit] = [])).push(c);
}
const sitOrder = [...SITUATION_IDS, 'untagged'];
const phJson = [];
const phLines = [];
phLines.push('# Native Author Worklist — Phonetics (empty `ph`)');
phLines.push('');
phLines.push(`**Generated:** ${today} · regenerate with \`node scripts/write-native-author-worklists.mjs\``);
phLines.push(`**Scope:** all ${emptyPh.length} cards that ship with an empty \`ph\`. Fill each blank \`ph\` in`);
phLines.push('`docs/native-author-worklist-phonetics.json`, then ingest with');
phLines.push('`node scripts/ingest-native-authoring.mjs docs/native-author-worklist-phonetics.json`.');
phLines.push('');
phLines.push('**Tone marks:** à low · á high · â falling · ǎ rising · no mark = mid. Leave a row blank if unsure — the tool skips blanks; never guess a tone.');
phLines.push('');
phLines.push(`**⚠ ${QUAR.size} of these cards also have CORRUPTED Thai** (ids ${[...QUAR].sort((a,b)=>a-b).join(', ')}) — see`);
phLines.push('`native-author-worklist-corrupted.md` and fix the Thai there FIRST; do not romanize corrupted script.');
phLines.push('');
for (const sit of sitOrder) {
  const cards = phBySit[sit];
  if (!cards || !cards.length) continue;
  const s = getSituation(sit);
  phLines.push(`## ${s ? s.name : 'Untagged'} — \`${sit}\` (${cards.length})`);
  phLines.push('');
  phLines.push('| id | Thai | English | stage | ph (fill in) |');
  phLines.push('| --- | --- | --- | --- | --- |');
  for (const c of cards) {
    const flag = QUAR.has(c.id) ? ' ⚠corrupted' : '';
    phLines.push(`| ${c.id}${flag} | ${c.thai} | ${String(c.en).replace(/\|/g, '\\|')} | ${c.stage || 1} | |`);
    phJson.push({ id: c.id, thai: c.thai, en: c.en, situation: sit, stage: c.stage || 1, ph: '', ...(QUAR.has(c.id) ? { corruptedThai: true } : {}) });
  }
  phLines.push('');
}
writeFileSync(join(ROOT, 'docs/native-author-worklist-phonetics.md'), phLines.join('\n'));
writeFileSync(join(ROOT, 'docs/native-author-worklist-phonetics.json'), JSON.stringify(phJson, null, 2));

// ── 2. CORRUPTED-THAI WORKLIST (the 7) ───────────────────────────────────────
const corrupt = ALL_CARDS.filter((c) => QUAR.has(c.id)).sort((a, b) => a.id - b.id);
const coJson = [];
const coLines = [];
coLines.push('# Native Author Worklist — Corrupted Thai (7 quarantined cards)');
coLines.push('');
coLines.push(`**Generated:** ${today} · regenerate with \`node scripts/write-native-author-worklists.mjs\``);
coLines.push(`**Scope:** the ${corrupt.length} cards quarantined for corrupted Thai (contentFlags.js QUARANTINED_CARD_IDS).`);
coLines.push('Each has a structural **diagnosis** — the corruption TYPE, NOT a corrected guess. Fill `correctedThai`');
coLines.push('AND `ph` in `docs/native-author-worklist-corrupted.json`, then ingest with');
coLines.push('`node scripts/ingest-native-authoring.mjs docs/native-author-worklist-corrupted.json`.');
coLines.push('');
coLines.push('These cards are held out of the free deck (quarantined) and stay `needs-review` until fixed.');
coLines.push('Fix the Thai here BEFORE authoring their phonetics on the phonetics worklist.');
coLines.push('');
coLines.push('| id | English | current (corrupted) Thai | diagnosis | hardest? | correctedThai | ph |');
coLines.push('| --- | --- | --- | --- | --- | --- | --- |');
for (const c of corrupt) {
  const d = CORRUPT_DIAGNOSIS[c.id] || { type: 'unknown', note: '' };
  coLines.push(`| ${c.id} | ${String(c.en).replace(/\|/g, '\\|')} | \`${c.thai}\` | **${d.type}** — ${d.note.replace(/\|/g, '\\|')} | ${d.hardest ? 'YES' : ''} | | |`);
  coJson.push({ id: c.id, en: c.en, thaiCurrent: c.thai, stage: c.stage || 1, situation: situationOf(c) || 'untagged', diagnosisType: d.type, diagnosis: d.note, hardest: !!d.hardest, correctedThai: '', ph: '' });
}
coLines.push('');
coLines.push('**Hardest two** (flagged): **5151** (truncated — no clear target, must re-author from the English) and **4756** (ambiguous — บุญคุณ vs a stray syllable).');
writeFileSync(join(ROOT, 'docs/native-author-worklist-corrupted.md'), coLines.join('\n'));
writeFileSync(join(ROOT, 'docs/native-author-worklist-corrupted.json'), JSON.stringify(coJson, null, 2));

console.log(`Wrote phonetics worklist: ${phJson.length} cards (grouped across ${Object.keys(phBySit).length} situations).`);
console.log(`Wrote corrupted worklist: ${coJson.length} cards.`);
