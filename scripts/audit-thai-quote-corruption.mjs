// scripts/audit-thai-quote-corruption.mjs
//
// Scans every card's `thai` field for stray quote characters — ASCII
// double / single, curly singles & doubles, guillemets, low-9, etc.
// Classifies each finding into one of four buckets, writes JSON
// findings, prints a structured summary.
//
// Buckets:
//   both-ends-clean   — first and last char are quotes; nothing between
//                       is a quote. HIGH-confidence wrapper strip.
//   lead-only         — only the first char is a quote, no quote
//                       anywhere else. HIGH-confidence orphan strip.
//   trail-only        — only the last char is a quote, no quote
//                       anywhere else. HIGH-confidence orphan strip.
//   internal-only     — no quote at either boundary, but quote(s)
//                       inside. Leave for native review.
//   complex           — quote(s) at boundary AND inside. Leave for
//                       review (likely a multi-synonym import artifact).
//
// Usage
//   node scripts/audit-thai-quote-corruption.mjs
//
// Side effects
//   Writes docs/thai-quote-findings.json. Read-only otherwise.

import { CARDS } from '../src/data/cards.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const OUT_PATH = path.join(REPO_ROOT, 'docs', 'thai-quote-findings.json');

// Defined by codepoint to avoid any source-file encoding surprises.
const QUOTE_CODEPOINTS = [
  0x0022, // "
  0x0027, // '
  0x00AB, // «
  0x00BB, // »
  0x2018, // '
  0x2019, // '
  0x201A, // ‚
  0x201B, // ‛
  0x201C, // "
  0x201D, // "
  0x201E, // „
  0x201F, // ‟
  0x2039, // ‹
  0x203A, // ›
];
const QUOTE_SET = new Set(QUOTE_CODEPOINTS.map(cp => String.fromCodePoint(cp)));

function isQuote(ch) { return QUOTE_SET.has(ch); }
function hasQuote(s) { for (const ch of s) if (isQuote(ch)) return true; return false; }

function classify(thai) {
  if (typeof thai !== 'string' || thai.length === 0) return null;
  if (!hasQuote(thai)) return null;
  const first = thai[0];
  const last = thai[thai.length - 1];
  const fq = isQuote(first);
  const lq = isQuote(last);
  const middle = thai.slice(1, -1);
  const middleHasQuote = hasQuote(middle);
  const tail = thai.slice(1);          // everything after first char
  const head = thai.slice(0, -1);      // everything before last char

  if (fq && lq && !middleHasQuote) {
    return { bucket: 'both-ends-clean', proposed: middle };
  }
  if (fq && !lq && !hasQuote(tail)) {
    return { bucket: 'lead-only', proposed: tail };
  }
  if (!fq && lq && !hasQuote(head)) {
    return { bucket: 'trail-only', proposed: head };
  }
  if (!fq && !lq) {
    return { bucket: 'internal-only', proposed: null };
  }
  return { bucket: 'complex', proposed: null };
}

const findings = {
  meta: { generatedAt: new Date().toISOString(), totalCards: CARDS.length },
  counts: {
    'both-ends-clean': 0,
    'lead-only':       0,
    'trail-only':      0,
    'internal-only':   0,
    'complex':         0,
  },
  cards: [],
};

for (const c of CARDS) {
  const result = classify(c.thai);
  if (!result) continue;
  findings.counts[result.bucket] += 1;
  findings.cards.push({
    id: c.id,
    stage: c.stage,
    cat: c.cat,
    type: c.type,
    bucket: result.bucket,
    oldThai: c.thai,
    proposedThai: result.proposed,
    en: c.en,
  });
}

fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
fs.writeFileSync(OUT_PATH, JSON.stringify(findings, null, 2), 'utf8');

console.log(`Total cards:           ${findings.meta.totalCards}`);
console.log(`Cards with quote chars in thai field:`);
for (const [bucket, n] of Object.entries(findings.counts)) {
  console.log(`  ${bucket.padEnd(18)} ${n}`);
}
const total = Object.values(findings.counts).reduce((a, b) => a + b, 0);
console.log(`  ${'TOTAL'.padEnd(18)} ${total}`);
console.log('');
console.log(`Findings written to ${path.relative(REPO_ROOT, OUT_PATH)}`);
