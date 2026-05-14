// scripts/fix-thai-quote-wrappers.mjs
//
// Applies high-confidence wrapper-strip fixes to the `thai` field of
// every card flagged by audit-thai-quote-corruption.mjs.
//
// Eligible buckets:
//   both-ends-clean   strip first + last char (both are quote chars,
//                     middle is quote-free)
//   lead-only         strip first char (orphan opening quote)
//   trail-only        strip last char (orphan closing quote)
//
// NOT touched:
//   internal-only     no boundary quotes; could be intentional copy
//   complex           boundary AND inner quotes (likely an import-time
//                     synonym separator — needs editorial decision)
//
// What the script does NOT change:
//   - Thai script itself (no character substitution)
//   - Phonetic / English / note / category fields
//   - Card ids or ordering
//   - Any other code or asset
//
// Usage
//   node scripts/fix-thai-quote-wrappers.mjs           # dry-run
//   node scripts/fix-thai-quote-wrappers.mjs --write   # apply
//
// Idempotent — re-running on already-fixed cards is a no-op.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(REPO_ROOT, 'src', 'data');
const FINDINGS_PATH = path.join(REPO_ROOT, 'docs', 'thai-quote-findings.json');

const WRITE = process.argv.includes('--write');

if (!fs.existsSync(FINDINGS_PATH)) {
  console.error('Findings file missing — run scripts/audit-thai-quote-corruption.mjs first.');
  process.exit(1);
}

const findings = JSON.parse(fs.readFileSync(FINDINGS_PATH, 'utf8'));

const ELIGIBLE = new Set(['both-ends-clean', 'lead-only', 'trail-only']);
const actionable = findings.cards.filter(c => ELIGIBLE.has(c.bucket) && c.proposedThai != null);

const TARGETS = [
  'cards.js',
  'cards-imported.js',
  'cards-imported-batch2.js',
  'cards-step2.js',
];
const fileCaches = new Map();
for (const name of TARGETS) {
  const p = path.join(DATA_DIR, name);
  if (fs.existsSync(p)) fileCaches.set(name, fs.readFileSync(p, 'utf8'));
}

function escapeRegex(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

// JS string escape for either quote style.
function jsEscape(value, quote) {
  let out = '';
  for (const ch of value) {
    if (ch === '\\') out += '\\\\';
    else if (ch === quote) out += '\\' + quote;
    else if (ch === '\n') out += '\\n';
    else if (ch === '\r') out += '\\r';
    else if (ch === '\t') out += '\\t';
    else out += ch;
  }
  return out;
}

let applied = 0;
const perFile = {};
const skipped = [];

for (const f of actionable) {
  // Match the entire card object literal that contains id:<n> and a
  // thai:"..." or thai:'...' field, then rewrite only the thai literal.
  // Anchored on the card id to avoid touching the wrong card.
  const idRe = new RegExp(`(\\bid\\s*:\\s*${f.id}\\b[^}]*?\\bthai\\s*:\\s*)(['\"])((?:\\\\.|(?!\\2).)*)\\2`, 's');

  let landed = false;
  for (const [name, content] of fileCaches) {
    let updated = false;
    const next = content.replace(idRe, (full, pre, q, rawValue) => {
      // Decode the source literal so we compare against the JS runtime value.
      let actualValue;
      try {
        // Wrap in the same quote chars and eval-via-JSON if possible. The
        // safer path: build a JS source string and parse via Function.
        actualValue = Function(`"use strict"; return (${q}${rawValue}${q});`)();
      } catch {
        return full;
      }
      if (actualValue !== f.oldThai) return full;
      const newThai = f.proposedThai;
      const safe = jsEscape(newThai, q);
      updated = true;
      return `${pre}${q}${safe}${q}`;
    });
    if (next !== content && updated) {
      fileCaches.set(name, next);
      perFile[name] = (perFile[name] || 0) + 1;
      applied += 1;
      landed = true;
      break;
    }
  }
  if (!landed) {
    skipped.push({ id: f.id, bucket: f.bucket, reason: 'no exact match in source files (possibly already fixed)' });
  }
}

if (WRITE) {
  for (const [name, content] of fileCaches) {
    fs.writeFileSync(path.join(DATA_DIR, name), content, 'utf8');
  }
}

console.log(`Mode: ${WRITE ? 'WRITE' : 'DRY-RUN (re-run with --write to apply)'}`);
console.log('');
console.log(`Eligible cards (HIGH-confidence): ${actionable.length}`);
for (const [name, n] of Object.entries(perFile)) {
  console.log(`  ${name.padEnd(28)} ${n} card${n === 1 ? '' : 's'} ${WRITE ? 'written' : 'would be written'}`);
}
if (skipped.length) {
  console.log('');
  console.log(`Skipped (${skipped.length}):`);
  for (const s of skipped.slice(0, 10)) {
    console.log(`  ${s.id}  [${s.bucket}]  ${s.reason}`);
  }
  if (skipped.length > 10) console.log(`  … ${skipped.length - 10} more`);
}
console.log('');
console.log(`Total applied: ${applied}${WRITE ? '' : ' (dry-run)'}`);
