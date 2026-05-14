// scripts/fix-missing-phonetics.mjs
//
// Applies high-confidence phonetic fills to cards with missing `ph`.
//
// Confidence policy (matches docs/missing-phonetics-fix-report.md):
//   HIGH — auto-applied:
//     A. exact Thai duplicate of another card whose ph is filled
//     B. exact Thai entry in lookup.js (inverted Thai → ph)
//     C. tail-particle decomposition where the head's Thai exactly
//        matches an existing card or lookup entry
//   MEDIUM / LOW — never auto-applied:
//     - Component-wise reconstruction of multi-word phrases
//       (tone sandhi makes this unreliable)
//     - Phrases containing reduplication markers ๆ
//     - Slang particles (เงี้ยะ, ปุ๊บ-ปั๊บ, etc.)
//     - Any pronunciation guessed from spelling alone
//
// Why so conservative?
//   We teach Thai. A wrong phonetic in a learner's deck is worse than
//   a missing one — the user sees a clear "phonetic coming soon"
//   placeholder for empty fields. Wrong tones get memorized.
//
// Usage
//   node scripts/fix-missing-phonetics.mjs               # dry-run
//   node scripts/fix-missing-phonetics.mjs --write       # write to disk
//
// The script edits each card line in place via a precise regex match
// keyed on the card id, so structural code formatting is preserved.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(REPO_ROOT, 'src', 'data');
const FINDINGS_PATH = path.join(REPO_ROOT, 'docs', 'missing-phonetics-findings.json');

const WRITE = process.argv.includes('--write');

if (!fs.existsSync(FINDINGS_PATH)) {
  console.error('Findings file missing — run scripts/audit-missing-phonetics.mjs first.');
  process.exit(1);
}

const findings = JSON.parse(fs.readFileSync(FINDINGS_PATH, 'utf8'));

// Filter to cards we will actually act on.
const ACTIONABLE_PATHS = new Set([
  'exact-card-duplicate',
  'exact-lookup-entry',
  'tail-particle-decomposable',
]);
const actionable = findings.cards.filter(c => ACTIONABLE_PATHS.has(c.chosenPath) && c.proposedPh);

console.log(`Mode: ${WRITE ? 'WRITE' : 'DRY-RUN (re-run with --write to apply)'}`);
console.log('');
console.log(`Actionable HIGH-confidence cards: ${actionable.length}`);

if (actionable.length === 0) {
  console.log('Nothing to do — every missing-ph card falls into the manual-review bucket.');
  console.log('See docs/missing-phonetics-fix-report.md for the per-card breakdown.');
  process.exit(0);
}

// Group actionable cards by which source file each lives in.
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

let appliedCount = 0;
let perFile = {};

for (const card of actionable) {
  // Try each file. We rewrite only the very specific {id:<n>,...ph:""...}
  // pattern, requiring the empty-string ph slot to still be there. If a
  // previous run already filled it, the regex won't match and we skip.
  const regexEmpty = new RegExp(
    `(\\{[^}]*?\\bid\\s*:\\s*${card.id}\\b[^}]*?\\bph\\s*:\\s*)(['"])\\s*\\2([^}]*?\\})`,
    's',
  );

  let landed = false;
  for (const [name, content] of fileCaches) {
    const next = content.replace(regexEmpty, (full, pre, q, post) => {
      // Escape any quote char that conflicts with our chosen quote.
      const safe = card.proposedPh.replace(/\\/g, '\\\\').replace(new RegExp(q, 'g'), `\\${q}`);
      return `${pre}${q}${safe}${q}${post}`;
    });
    if (next !== content) {
      fileCaches.set(name, next);
      perFile[name] = (perFile[name] || 0) + 1;
      appliedCount += 1;
      landed = true;
      break;
    }
  }
  if (!landed) {
    console.warn(`  card ${card.id} (${card.thai}): could not locate empty ph slot — skipping`);
  }
}

if (WRITE) {
  for (const [name, content] of fileCaches) {
    fs.writeFileSync(path.join(DATA_DIR, name), content, 'utf8');
  }
}

console.log('');
for (const [name, n] of Object.entries(perFile)) {
  console.log(`  ${name.padEnd(28)} ${n} card${n === 1 ? '' : 's'} ${WRITE ? 'written' : 'would be written'}`);
}
console.log('');
console.log(`Total applied: ${appliedCount}${WRITE ? '' : ' (dry-run; pass --write to commit)'}`);
