// scripts/fix-content.mjs
//
// Applies high-confidence fixes from the content audit:
//   1. Append " (male)" to en for cards using ผม/ครับ with no marker.
//   2. Append " (female)" to en for cards using ฉัน, ค่ะ, or คะ with no marker.
//   3. Append " (female, formal)" to en for cards using ดิฉัน with no marker.
//   4. Append " (male/female)" to en for mixed-gender teaching cards.
//   5. Standardise "(m)" → "(male)" and "(f)" → "(female)" in en.
//   6. Fix the one note (id 2) that mentions "+ male" so it auto-flips.
//
// The script works on the source-file *text*, not the imported CARDS array,
// so id ordering / formatting is preserved. Edits are scoped to the single
// line of each target card.
//
// Usage:  node scripts/fix-content.mjs            (dry-run by default)
//         node scripts/fix-content.mjs --apply    (write changes to disk)

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const FINDINGS_PATH = path.join(REPO_ROOT, 'docs', 'content-audit-findings.json');

const APPLY = process.argv.includes('--apply');

// id range -> source file
const RANGES = [
  { min:    1, max: 1592, file: 'src/data/cards.js' },
  { min: 1593, max: 4393, file: 'src/data/cards-imported.js' },
  { min: 4394, max: 5699, file: 'src/data/cards-imported-batch2.js' },
  { min: 5700, max: 5738, file: 'src/data/cards-step2.js' },
];

function fileForId(id) {
  for (const r of RANGES) if (id >= r.min && id <= r.max) return r.file;
  throw new Error(`No source file for id ${id}`);
}

// --- load findings ------------------------------------------------------------

const findings = JSON.parse(fs.readFileSync(FINDINGS_PATH, 'utf-8'));

// Categories we will auto-fix
const APPEND_OPS = {
  'male-thai-missing-en-annotation':       ' (male)',
  'chǎn-missing-female-annotation':        ' (female)',
  'female-particle-missing-annotation':    ' (female)',
  'dìchǎn-missing-female-annotation':      ' (female, formal)',
  'mixed-gender-thai':                     ' (male/female)',
};
const STANDARDISE_OPS = {
  'female-uses-short-form-(f)':            'f-to-female',
  'male-uses-short-form-(m)':              'm-to-male',
};

// Build a per-id plan
const plan = new Map(); // id -> { appends:[], replacements:[], noteEdit:null }
function planFor(id) {
  if (!plan.has(id)) plan.set(id, { appends: [], replacements: [], noteEdit: null });
  return plan.get(id);
}

for (const issue of findings.issues) {
  const op = APPEND_OPS[issue.category];
  if (op) {
    const p = planFor(issue.id);
    if (!p.appends.includes(op)) p.appends.push(op);
    continue;
  }
  const std = STANDARDISE_OPS[issue.category];
  if (std === 'f-to-female') {
    planFor(issue.id).replacements.push({ kind: 'f-to-female' });
  } else if (std === 'm-to-male') {
    planFor(issue.id).replacements.push({ kind: 'm-to-male' });
  }
}

// Special case: card id 2's note needs "polite + male" -> "polite (male)"
planFor(2).noteEdit = { from: 'polite + male', to: 'polite (male)' };

console.log(`Planned changes for ${plan.size} unique cards.`);
const sampleIds = [...plan.keys()].slice(0, 8);
console.log('Sample card IDs to be modified:', sampleIds.join(', '));

// --- per-file processing ------------------------------------------------------

const byFile = new Map();
for (const [id, p] of plan) {
  const file = fileForId(id);
  if (!byFile.has(file)) byFile.set(file, []);
  byFile.get(file).push({ id, ...p });
}

// regex helpers for extracting/modifying card line fields
// Match en: '...' or en: "..." with proper escape handling.
function findFieldInLine(line, fieldName) {
  // Match field name, optional spaces, colon, optional spaces, then a quoted string.
  // Supports single or double quotes with backslash escapes inside.
  const re = new RegExp(
    `\\b${fieldName}\\s*:\\s*(?:'((?:[^'\\\\]|\\\\.)*)'|"((?:[^"\\\\]|\\\\.)*)")`
  );
  const m = line.match(re);
  if (!m) return null;
  const value = m[1] != null ? m[1] : m[2];
  const quote = m[1] != null ? "'" : '"';
  const start = m.index;
  const end = m.index + m[0].length;
  return { value, quote, start, end, raw: m[0] };
}

function replaceFieldInLine(line, fieldName, newValue, quote) {
  // newValue is the raw captured text (already correctly escaped in the
  // source). The audit only appends plain ASCII like "(male)" or substitutes
  // (m)→(male), neither of which introduces quote/backslash chars, so we can
  // re-emit the value verbatim without double-escaping pre-existing \' or \".
  const re = new RegExp(
    `(\\b${fieldName}\\s*:\\s*)(?:'(?:[^'\\\\]|\\\\.)*'|"(?:[^"\\\\]|\\\\.)*")`
  );
  return line.replace(re, `$1${quote}${newValue}${quote}`);
}

function modifyEnForCard(line, ops) {
  const field = findFieldInLine(line, 'en');
  if (!field) return { line, modified: false, reason: 'no-en-field' };
  let value = field.value;
  let touched = false;

  // Apply replacements first (so we don't append (male) and then immediately convert it).
  for (const r of ops.replacements) {
    if (r.kind === 'f-to-female') {
      const before = value;
      // "(f)" -> "(female)" and "(f, X)" -> "(female, X)"
      value = value
        .replace(/\(f\)/g, '(female)')
        .replace(/\(f,\s/g, '(female, ');
      if (value !== before) touched = true;
    } else if (r.kind === 'm-to-male') {
      const before = value;
      value = value
        .replace(/\(m\)/g, '(male)')
        .replace(/\(m,\s/g, '(male, ');
      if (value !== before) touched = true;
    }
  }

  // Then apply appends, but only if the marker isn't already present.
  for (const append of ops.appends) {
    const trimmed = append.trim();
    if (!value.includes(trimmed)) {
      // Avoid double space — ensure exactly one space between value and append.
      value = value.replace(/\s+$/, '') + append;
      touched = true;
    }
  }

  if (!touched) return { line, modified: false, reason: 'already-correct' };
  const newLine = replaceFieldInLine(line, 'en', value, field.quote);
  return { line: newLine, modified: true };
}

function modifyNoteForCard(line, noteEdit) {
  const field = findFieldInLine(line, 'note');
  if (!field) return { line, modified: false, reason: 'no-note-field' };
  if (!field.value.includes(noteEdit.from)) {
    return { line, modified: false, reason: 'phrase-not-found' };
  }
  const newValue = field.value.replace(noteEdit.from, noteEdit.to);
  const newLine = replaceFieldInLine(line, 'note', newValue, field.quote);
  return { line: newLine, modified: true };
}

// Find the line(s) covering a card's definition by id
function findCardLineIndex(lines, id) {
  // Card lines look like: {id:N,...} or { id: N, ... }
  const re = new RegExp(`\\bid\\s*:\\s*${id}\\b`);
  for (let i = 0; i < lines.length; i++) {
    if (re.test(lines[i])) return i;
  }
  return -1;
}

let totalModified = 0;
let totalSkipped = 0;
const log = [];

for (const [file, items] of byFile) {
  const abs = path.join(REPO_ROOT, file);
  const text = fs.readFileSync(abs, 'utf-8');
  const lines = text.split(/\r?\n/);

  let fileModified = 0;
  for (const { id, appends, replacements, noteEdit } of items) {
    const idx = findCardLineIndex(lines, id);
    if (idx < 0) {
      console.warn(`  [${file}] id ${id}: line not found`);
      totalSkipped++;
      continue;
    }

    let line = lines[idx];

    if (appends.length || replacements.length) {
      const res = modifyEnForCard(line, { appends, replacements });
      if (res.modified) {
        line = res.line;
        fileModified++;
        log.push({ file, id, type: 'en', before: lines[idx], after: line });
      } else {
        totalSkipped++;
        log.push({ file, id, type: 'en-skip', reason: res.reason });
      }
    }
    if (noteEdit) {
      const res = modifyNoteForCard(line, noteEdit);
      if (res.modified) {
        line = res.line;
        fileModified++;
        log.push({ file, id, type: 'note', before: lines[idx], after: line });
      } else {
        totalSkipped++;
        log.push({ file, id, type: 'note-skip', reason: res.reason });
      }
    }

    lines[idx] = line;
  }

  console.log(`  ${file}: ${fileModified} card lines modified`);
  totalModified += fileModified;

  if (APPLY && fileModified > 0) {
    const newText = lines.join('\n');
    fs.writeFileSync(abs, newText);
  }
}

console.log(`\nTotal lines modified: ${totalModified}`);
console.log(`Total skipped: ${totalSkipped}`);
console.log(APPLY ? 'Wrote changes to disk.' : 'Dry run — no files written. Use --apply to commit changes.');

// Save change log for audit trail
const LOG_PATH = path.join(REPO_ROOT, 'docs', 'content-audit-changes.json');
fs.writeFileSync(LOG_PATH, JSON.stringify(log, null, 2));
console.log(`Change log: ${LOG_PATH}`);
