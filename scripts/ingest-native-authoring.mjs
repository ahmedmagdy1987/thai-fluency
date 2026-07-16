#!/usr/bin/env node
//
// INGEST NATIVE-AUTHORED PHONETICS / CORRECTED THAI — the read-back tool for the
// two worklists in docs/ (native-author-worklist-phonetics.* and
// native-author-worklist-corrupted.*). It writes the human-supplied values into
// the card source (src/data/cards-imported-batch2.js — where all 335 empty-`ph`
// cards and the 7 quarantined cards live) and NOTHING ELSE.
//
// ── WHAT IT DOES / DOES NOT DO ────────────────────────────────────────────────
//   • Sets `ph` on a phonetics entry ({id, ph, …}). Any other fields (thai, en,
//     situation, stage) are reference-only and ignored.
//   • Sets `thai` AND `ph` on a corrupted-fix entry ({id, correctedThai, ph, …}).
//     A row is a corrupted-fix ONLY if it carries a `correctedThai` field, so a
//     phonetics row's reference `thai` is never mistaken for a Thai correction.
//   • REJECTS any entry whose ph (or corrected thai) is blank — a guessed
//     romanization guesses a tone, so a blank must never be written as if real.
//   • NEVER sets reviewStatus. Approval is manifest-driven and human-only
//     (src/data/nativeReviewSignoff.js). A card that becomes eligible here (now
//     has a real `ph`, no longer quarantined) is approved automatically ONLY if
//     its situation is already signed off in the manifest — the reviewer's
//     existing sign-off finally reaching a card that was withheld for being
//     structurally incomplete. This tool grants nothing; the manifest does.
//
// ── HOW THE NATIVE TEAM USES IT ───────────────────────────────────────────────
//   1. Open docs/native-author-worklist-phonetics.json (and .md for context).
//      Each row has a BLANK "ph". Fill it with the romanization (tone marks:
//      à low · á high · â falling · ǎ rising · no mark = mid). Leave a row blank
//      if you are unsure — the tool skips blanks; do not guess a tone.
//   2. For docs/native-author-worklist-corrupted.json: fill "correctedThai" (the
//      fixed Thai) AND "ph". These 7 cards have corrupted Thai — read the
//      per-row "diagnosis" and "thaiCurrent", then supply the correct script.
//   3. Dry-run to preview:  node scripts/ingest-native-authoring.mjs <file.json> --dry-run
//   4. Apply:               node scripts/ingest-native-authoring.mjs <file.json>
//   5. Rebuild + validate:  npm run build && npm run check
//   6. The now-complete cards in an already-signed-off situation become approved
//      on that build; the rest stay pending until their situation is signed off.
//
// Cross-platform, no deps. Read-only unless it finds valid entries to write.

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CARD_FILE = join(ROOT, 'src/data/cards-imported-batch2.js');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const inputPath = args.find((a) => !a.startsWith('--'));
if (!inputPath) {
  console.error('Usage: node scripts/ingest-native-authoring.mjs <filled-worklist.json> [--dry-run]');
  process.exit(2);
}

let entries;
try {
  entries = JSON.parse(readFileSync(inputPath, 'utf8'));
} catch (e) {
  console.error(`Could not read/parse ${inputPath}: ${e.message}`);
  process.exit(2);
}
// The worklist .json is { situation: [rows] } grouped, or a flat array — accept both.
if (!Array.isArray(entries)) {
  entries = Object.values(entries).flat();
}

let src = readFileSync(CARD_FILE, 'utf8');
const lines = src.split('\n');
// id -> line index (cards are one object per line: {id:1234,...})
const lineOf = new Map();
lines.forEach((ln, i) => {
  const m = ln.match(/\{id:\s*(\d+)\s*,/);
  if (m) lineOf.set(Number(m[1]), i);
});

const isBlank = (v) => v == null || typeof v !== 'string' || v.trim() === '';
// Embed a string value into the double-quoted source form, escaping safely.
const q = (v) => JSON.stringify(String(v));
// Replace `field:"..."` (or `field:'...'`) on a single line with a new JSON-quoted value.
function setField(line, field, value) {
  const re = new RegExp(`(${field}:)(".*?"|'.*?')`);
  if (!re.test(line)) return null;
  return line.replace(re, `$1${q(value)}`);
}

const written = [];
const rejected = [];

for (const e of entries) {
  const id = Number(e && e.id);
  if (!Number.isFinite(id)) { rejected.push({ id: e && e.id, why: 'missing/invalid id' }); continue; }
  if (!lineOf.has(id)) { rejected.push({ id, why: 'id not found in card source' }); continue; }
  const isCorrupted = Object.prototype.hasOwnProperty.call(e, 'correctedThai');
  if (isBlank(e.ph)) { rejected.push({ id, why: 'blank ph (skipped — never guess a tone)' }); continue; }
  if (isCorrupted && isBlank(e.correctedThai)) { rejected.push({ id, why: 'blank correctedThai (skipped)' }); continue; }

  const li = lineOf.get(id);
  let line = lines[li];
  if (isCorrupted) {
    const t = setField(line, 'thai', e.correctedThai);
    if (t == null) { rejected.push({ id, why: 'could not locate thai field on line' }); continue; }
    line = t;
  }
  const p = setField(line, 'ph', e.ph);
  if (p == null) { rejected.push({ id, why: 'could not locate ph field on line' }); continue; }
  line = p;

  lines[li] = line;
  written.push({ id, ph: e.ph, ...(isCorrupted ? { thai: e.thai } : {}) });
}

console.log(`Ingest ${dryRun ? '(DRY RUN) ' : ''}— input: ${inputPath}`);
console.log(`  entries read:  ${entries.length}`);
console.log(`  would write:   ${written.length}`);
console.log(`  rejected:      ${rejected.length}`);
if (rejected.length) {
  const byWhy = {};
  for (const r of rejected) byWhy[r.why] = (byWhy[r.why] || 0) + 1;
  for (const [why, n] of Object.entries(byWhy)) console.log(`    - ${n}× ${why}`);
}

if (!dryRun && written.length > 0) {
  writeFileSync(CARD_FILE, lines.join('\n'));
  console.log(`\nWrote ${written.length} card(s) to ${CARD_FILE}.`);
  console.log('No reviewStatus was set — run `npm run build && npm run check`; the manifest approves any now-complete card in an already-signed-off situation.');
} else if (dryRun) {
  console.log('\nDry run — no files written.');
} else {
  console.log('\nNothing to write.');
}

// Exit non-zero if EVERY entry was rejected (a filled file that produced no
// writes is almost always a mistake worth surfacing), else 0.
process.exit(entries.length > 0 && written.length === 0 ? 1 : 0);
