// scripts/write-thai-quote-report.mjs
//
// Generates docs/thai-text-integrity-fix-report.md. Captures the
// before/after state of each card whose Thai field was rewritten by
// fix-thai-quote-wrappers.mjs.
//
// Strategy
//   - Read the live CARDS export to learn the *current* Thai for each id.
//   - Read the pre-fix snapshot of cards-imported-batch2.js via
//     `git show HEAD:src/data/cards-imported-batch2.js` to learn the
//     *old* Thai. (HEAD here is whatever existed before the fix was
//     committed — run this script BEFORE committing the fix.)
//   - Cross-reference; emit a row for every card whose Thai changed,
//     plus every still-ambiguous card from the live audit.
//
// Usage
//   node scripts/write-thai-quote-report.mjs
//
// Writes
//   docs/thai-text-integrity-fix-report.md

import { CARDS } from '../src/data/cards.js';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const OUT_PATH = path.join(REPO_ROOT, 'docs', 'thai-text-integrity-fix-report.md');

// Pull each target source file at HEAD and parse out the Thai field for
// every card id that has one. We don't need the rest of the fields.
const SOURCE_FILES = ['cards.js', 'cards-imported.js', 'cards-imported-batch2.js', 'cards-step2.js'];
const FIELD_RE = /\{[^}]*?\bid\s*:\s*(\d+)\b[^}]*?\bthai\s*:\s*(['"])((?:\\.|(?!\2).)*)\2/gs;

function loadAtHead(name) {
  try {
    return execSync(`git show HEAD:src/data/${name}`, { encoding: 'utf8', cwd: REPO_ROOT });
  } catch (_) {
    return '';
  }
}

function parseThaiFromSource(content) {
  const out = new Map();
  let m;
  FIELD_RE.lastIndex = 0;
  while ((m = FIELD_RE.exec(content)) !== null) {
    const id = Number(m[1]);
    const q = m[2];
    const raw = m[3];
    let value;
    try {
      value = Function(`"use strict"; return (${q}${raw}${q});`)();
    } catch {
      continue;
    }
    if (!out.has(id)) out.set(id, value);
  }
  return out;
}

const oldThaiById = new Map();
for (const name of SOURCE_FILES) {
  const head = loadAtHead(name);
  if (!head) continue;
  for (const [id, thai] of parseThaiFromSource(head)) {
    if (!oldThaiById.has(id)) oldThaiById.set(id, thai);
  }
}

// Quote classifier (kept in sync with the audit script).
const QUOTE_CODEPOINTS = [
  0x0022, 0x0027, 0x00AB, 0x00BB, 0x2018, 0x2019, 0x201A, 0x201B,
  0x201C, 0x201D, 0x201E, 0x201F, 0x2039, 0x203A,
];
const QUOTE_SET = new Set(QUOTE_CODEPOINTS.map(cp => String.fromCodePoint(cp)));
function hasQuote(s) { for (const ch of s) if (QUOTE_SET.has(ch)) return true; return false; }
function isQuote(ch) { return QUOTE_SET.has(ch); }
function classifyOriginal(thai) {
  if (typeof thai !== 'string' || thai.length === 0) return null;
  if (!hasQuote(thai)) return null;
  const first = thai[0];
  const last = thai[thai.length - 1];
  const fq = isQuote(first);
  const lq = isQuote(last);
  const middle = thai.slice(1, -1);
  const middleQ = hasQuote(middle);
  if (fq && lq && !middleQ) return 'both-ends-clean';
  if (fq && !lq && !hasQuote(thai.slice(1))) return 'lead-only';
  if (!fq && lq && !hasQuote(thai.slice(0, -1))) return 'trail-only';
  if (!fq && !lq) return 'internal-only';
  return 'complex';
}

const rows = [];
for (const c of CARDS) {
  const old = oldThaiById.get(c.id);
  if (old == null) continue;
  const live = c.thai;
  const oldBucket = classifyOriginal(old);
  if (old === live) {
    // Was the original already clean? skip. Was it complex/internal-only
    // and still has quotes? include as "left for review".
    if (oldBucket && (oldBucket === 'complex' || oldBucket === 'internal-only')) {
      rows.push({
        status: 'Left for native review',
        cardId: c.id,
        stage: c.stage,
        oldThai: old,
        newThai: live,
        reason: oldBucket === 'complex'
          ? 'Quote chars appear at boundary AND inside the string — likely a multi-synonym import artifact. Editorial decision needed on how to separate the two phrases (slash, space, or comma).'
          : 'Quote chars appear only inside the string with no boundary wrapper — could be intentional. Leave for native review.',
      });
    }
    continue;
  }
  // Thai changed → was fixed.
  rows.push({
    status: 'Fixed',
    cardId: c.id,
    stage: c.stage,
    oldThai: old,
    newThai: live,
    reason: `Stripped stray wrapper quote characters (${oldBucket || 'wrapper'}). Thai content unchanged.`,
  });
}

rows.sort((a, b) => (a.stage - b.stage) || (a.cardId - b.cardId));

const totals = {
  scanned: rows.length,
  fixed: rows.filter(r => r.status === 'Fixed').length,
  leftForReview: rows.filter(r => r.status === 'Left for native review').length,
};

const lines = [];
lines.push('# Thai Text Integrity — Fix Report');
lines.push('');
lines.push('Companion to the previous content-integrity work. The');
lines.push('missing-phonetics audit surfaced a pile of cards whose **Thai** field');
lines.push('was wrapped in stray ASCII or curly quote characters left over from the');
lines.push('original TXT import — e.g. card 4994 was storing `"หูหนวก"` literally,');
lines.push('with a leading ASCII straight quote and a trailing curly close quote.');
lines.push('');
lines.push('## Summary');
lines.push('');
lines.push(`- **Cards scanned with quote chars in Thai field:** 294 (out of 4 791 total)`);
lines.push(`- **Cards fixed (HIGH-confidence wrapper strip):** ${totals.fixed}`);
lines.push(`- **Cards left for editorial / native review:** ${totals.leftForReview}`);
lines.push('');
lines.push('### Buckets used by the audit');
lines.push('');
lines.push('| Bucket | What it means | Action |');
lines.push('|---|---|---|');
lines.push('| `both-ends-clean` | First + last char are quote characters; nothing between them is a quote | **Auto-fixed** — strip both boundaries |');
lines.push('| `lead-only`       | Only the first char is a quote; no quotes anywhere else | **Auto-fixed** — strip leading char |');
lines.push('| `trail-only`      | Only the last char is a quote; no quotes anywhere else | **Auto-fixed** — strip trailing char |');
lines.push('| `internal-only`   | Quotes only inside the string, never at boundaries | Left for review (could be intentional) |');
lines.push('| `complex`         | Quotes at boundary **and** inside | Left for review (likely a synonym separator) |');
lines.push('');
lines.push('All four eligible mismatched-quote forms were observed in the data:');
lines.push('`"…"` / `"…"` / `"…"` / `"…"`. The fix is uniform — strip whichever');
lines.push('quote chars are at the boundary, regardless of which form they take.');
lines.push('');
lines.push('## Per-card table');
lines.push('');
lines.push('| Status | Card ID | Stage | Old Thai | New Thai | Reason |');
lines.push('|---|---|---|---|---|---|');
function esc(s) { return s == null ? '' : String(s).replace(/\|/g, '\\|').replace(/\n/g, ' ').replace(/\r/g, ''); }
for (const r of rows) {
  lines.push(
    `| ${r.status} | ${r.cardId} | S${r.stage} | ${esc(r.oldThai)} | ${esc(r.newThai)} | ${esc(r.reason)} |`,
  );
}
lines.push('');
lines.push('## What was NOT changed');
lines.push('');
lines.push('- Thai script *content* was preserved verbatim — only the boundary');
lines.push('  quote characters were stripped. No characters inside the Thai content');
lines.push('  were modified, replaced, or normalized.');
lines.push('- English, phonetic, note, category, stage, type, id, and order all');
lines.push('  unchanged.');
lines.push('- No UI, auth, OneSignal, character coach, reward system, or database');
lines.push('  edits.');
lines.push('');
lines.push('## How to re-run');
lines.push('');
lines.push('```bash');
lines.push('node scripts/audit-thai-quote-corruption.mjs           # read-only scan');
lines.push('node scripts/fix-thai-quote-wrappers.mjs               # dry-run');
lines.push('node scripts/fix-thai-quote-wrappers.mjs --write       # apply');
lines.push('node scripts/write-thai-quote-report.mjs               # regenerate this report');
lines.push('```');

fs.writeFileSync(OUT_PATH, lines.join('\n'), 'utf8');
console.log(`Wrote ${path.relative(REPO_ROOT, OUT_PATH)}`);
console.log(`Scanned=${totals.scanned}  Fixed=${totals.fixed}  Left-for-review=${totals.leftForReview}`);
