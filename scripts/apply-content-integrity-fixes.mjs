// scripts/apply-content-integrity-fixes.mjs
//
// Applies the high-confidence mechanical fixes identified by
// audit-content-integrity.mjs:
//
//   1. Strips every ASCII colon `:` from phonetic field values inside
//      cards-imported.js and cards-imported-batch2.js.
//      Rationale: every colon is a Paiboon-style length mark on a Thai
//      โ syllable. The app's own romanization standard (visible in
//      src/data/cards.js, e.g. `rohng`, `chôhk`, `gròht`) uses plain
//      `oh` / `oo` and never includes a colon. Stripping the colon is
//      a one-to-one normalization, not a guess at Thai pronunciation.
//
//   2. Collapses runs of whitespace inside string-literal values in the
//      raw card source files (cards.js, cards-imported.js, cards-imported-batch2.js,
//      cards-step2.js). Only touches lines that include a `field:"..."` or
//      `field:'...'` pattern so structural code is never reformatted.
//
// What it does NOT do
//   - Does not modify Thai script.
//   - Does not modify English meanings semantically (only whitespace).
//   - Does not modify romanization schemes (only strips colons).
//   - Does not touch any file outside src/data/.
//   - Does not touch duplicates flagged by the audit — those need
//     editorial / native-speaker judgment.
//
// Usage
//   node scripts/apply-content-integrity-fixes.mjs           # report dry-run
//   node scripts/apply-content-integrity-fixes.mjs --write   # write to disk
//
// Idempotent: re-running on already-fixed files reports 0 changes.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(REPO_ROOT, 'src', 'data');

const WRITE = process.argv.includes('--write');

const TARGETS = [
  'cards.js',
  'cards-imported.js',
  'cards-imported-batch2.js',
  'cards-step2.js',
];

let totalColonFixes = 0;
let totalSpaceFixes = 0;
const perFile = {};

// Matches a JS-style field assignment like  ph:"abc"  or  en:'xyz'  or  ph: "abc"
// Captures the field name, the quote char, and the inner literal.
//
// Important: not bullet-proof against escaped quotes inside strings, but
// our generators never embed quote chars inside phonetic / english /
// thai values (they use entities or rephrase). If they ever do, this
// regex would skip those lines rather than corrupt them — `.match` on
// the inner pattern stops at the first matching closing quote.
const FIELD_RE = /(\b(?:ph|en|thai|note)\s*:\s*)(["'])((?:(?!\2).)*)\2/g;

function fixContent(content) {
  let colonFixes = 0;
  let spaceFixes = 0;

  const next = content.replace(FIELD_RE, (full, prefix, quote, value, offset) => {
    let v = value;
    let touched = false;

    // 1. Strip colons inside phonetic fields ONLY.
    if (full.startsWith('ph:') || /^\s*ph\s*:/.test(prefix) || prefix.trim().startsWith('ph')) {
      if (v.includes(':')) {
        v = v.replace(/:/g, '');
        colonFixes += 1;
        touched = true;
      }
    }

    // 2. Collapse runs of whitespace in any string field. Trim leading /
    //    trailing whitespace as well.
    const collapsed = v.replace(/\s{2,}/g, ' ').replace(/^\s+|\s+$/g, '');
    if (collapsed !== v) {
      spaceFixes += 1;
      v = collapsed;
      touched = true;
    }

    if (!touched) return full;
    return `${prefix}${quote}${v}${quote}`;
  });

  return { next, colonFixes, spaceFixes };
}

for (const name of TARGETS) {
  const filePath = path.join(DATA_DIR, name);
  if (!fs.existsSync(filePath)) {
    perFile[name] = { skipped: true, reason: 'not found' };
    continue;
  }
  const original = fs.readFileSync(filePath, 'utf8');
  const { next, colonFixes, spaceFixes } = fixContent(original);
  perFile[name] = { colonFixes, spaceFixes, changed: next !== original };
  totalColonFixes += colonFixes;
  totalSpaceFixes += spaceFixes;
  if (WRITE && next !== original) {
    fs.writeFileSync(filePath, next, 'utf8');
  }
}

console.log(`Mode: ${WRITE ? 'WRITE' : 'DRY-RUN (re-run with --write to apply)'}`);
console.log('');
for (const [name, info] of Object.entries(perFile)) {
  if (info.skipped) {
    console.log(`  ${name.padEnd(28)} skipped — ${info.reason}`);
    continue;
  }
  console.log(`  ${name.padEnd(28)} colons:${String(info.colonFixes).padStart(3)}  spaces:${String(info.spaceFixes).padStart(3)}  ${info.changed ? '(changed)' : '(no change)'}`);
}
console.log('');
console.log(`Total colon strips: ${totalColonFixes}`);
console.log(`Total space fixes:  ${totalSpaceFixes}`);
