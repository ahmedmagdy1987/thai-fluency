#!/usr/bin/env node
//
// Native-review coverage report (READ-ONLY). Summarises the guided mini-unit
// catalogue so an owner / native speaker can see, at a glance, what exists and
// what still needs human review before the course content is called "final".
//
// Reads ONLY: src/data/miniUnits.js, src/data/cards.js, src/data/taxonomy.js,
// and checks for the existence of the per-stage review-matrix docs. It does NOT
// modify any file, touch the database, or change product logic.
//
// Usage:  node scripts/report-native-review-coverage.mjs

import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { CARDS } from '../src/data/cards.js';
import { MINI_UNITS } from '../src/data/miniUnits.js';
import { STAGES } from '../src/data/taxonomy.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const stageName = (id) => (STAGES.find(s => s.id === id)?.name) || `Stage ${id}`;

// Priority grouping the owner asked for (high = earliest stages learners hit).
const PRIORITY = { 1: 'HIGH', 2: 'HIGH', 3: 'MEDIUM', 4: 'MEDIUM', 5: 'MEDIUM', 6: 'LOWER', 7: 'LOWER', 8: 'LOWER' };

console.log('==================================================================');
console.log(' Tuk Talk Thai — Native Review Coverage Report');
console.log(' (read-only; no files were modified)');
console.log('==================================================================\n');

// ── Totals ───────────────────────────────────────────────────────────────────
const totalUnits = MINI_UNITS.length;
const totalBuilders = MINI_UNITS.filter(u => u.sentenceBuilder).length;
const stages = [...new Set(MINI_UNITS.map(u => u.stageId || 1))].sort((a, b) => a - b);
let totalCovered = 0;

console.log(`Total guided mini-units : ${totalUnits}`);
console.log(`Total sentence builders : ${totalBuilders}`);
console.log(`Stages with guided path : ${stages.length} / 8  (${stages.join(', ')})\n`);

// ── Per-stage table ──────────────────────────────────────────────────────────
console.log('── Per-stage coverage ───────────────────────────────────────────');
console.log(
  'St  '.padEnd(4) +
  'Name'.padEnd(20) +
  'Units'.padEnd(7) +
  'Builders'.padEnd(10) +
  'Vocab (cov/total)'.padEnd(19) +
  'Priority'
);
const noBuilderUnits = [];
const perStage = [];
for (const st of stages) {
  const units = MINI_UNITS.filter(u => (u.stageId || 1) === st);
  const covered = new Set();
  units.forEach(u => (u.vocabCardIds || []).forEach(id => covered.add(id)));
  const stageTotal = CARDS.filter(c => (c.stage || 1) === st).length;
  const builders = units.filter(u => u.sentenceBuilder).length;
  totalCovered += covered.size;
  units.filter(u => !u.sentenceBuilder).forEach(u => noBuilderUnits.push(u));
  perStage.push({ st, units: units.length, builders, covered: covered.size, stageTotal });
  console.log(
    String(st).padEnd(4) +
    stageName(st).slice(0, 19).padEnd(20) +
    String(units.length).padEnd(7) +
    String(builders).padEnd(10) +
    `${covered.size}/${stageTotal}`.padEnd(19) +
    (PRIORITY[st] || '—')
  );
}
console.log('─────────────────────────────────────────────────────────────────');
console.log(`Totals: ${totalUnits} units, ${totalBuilders} builders, ${totalCovered} vocab cards covered\n`);

// ── Units with no builder (vocab-only / sentence-shown-only) ─────────────────
console.log(`── Units with NO sentence builder (${noBuilderUnits.length}) ─────────────────────────`);
if (noBuilderUnits.length === 0) {
  console.log('  (none)');
} else {
  for (const u of noBuilderUnits) {
    const sentence = u.sentenceCardId ? `sentence ${u.sentenceCardId} shown (no builder)` : 'vocab-only';
    console.log(`  Stage ${u.stageId} · ${u.unitId} — ${sentence}`);
  }
}
console.log('');

// ── Builder confidence note ──────────────────────────────────────────────────
const anyConfidence = MINI_UNITS.some(u => u.sentenceBuilder && u.sentenceBuilder.confidence);
console.log('── Builder confidence ───────────────────────────────────────────');
if (anyConfidence) {
  console.log('  (confidence is present in unit data — see sentenceBuilder.confidence)');
} else {
  console.log('  Builder confidence is NOT stored in the unit data. It is recorded');
  console.log('  per-row in each stage review matrix (docs/stage-N-content-review-');
  console.log('  matrix.md, "Confidence" column: high / medium / low).');
}
console.log('');

// ── Review-doc existence check ───────────────────────────────────────────────
console.log('── Review documents ─────────────────────────────────────────────');
const missingDocs = [];
for (const st of [1, 2, 3, 4, 5, 6, 7, 8]) {
  const rel = `docs/stage-${st}-content-review-matrix.md`;
  const exists = existsSync(join(ROOT, rel));
  // Stage 1 intentionally has no matrix — its content lives in the roadmap.
  const expected = st !== 1;
  let status;
  if (exists) status = 'OK   present';
  else if (!expected) status = 'note documented in docs/course-structure-roadmap.md (no matrix by design)';
  else { status = 'MISSING'; missingDocs.push(rel); }
  console.log(`  Stage ${st}: ${rel.padEnd(42)} ${status}`);
}
const packDocs = [
  'docs/native-review-master-checklist.md',
  'docs/native-review-stage-summary.md',
  'docs/native-review-issues.md',
];
console.log('  Native review pack:');
for (const rel of packDocs) {
  const exists = existsSync(join(ROOT, rel));
  console.log(`    ${rel.padEnd(46)} ${exists ? 'OK   present' : 'MISSING'}`);
  if (!exists) missingDocs.push(rel);
}
console.log('');

// ── What needs native review ─────────────────────────────────────────────────
console.log('── Summary: what needs native review ────────────────────────────');
console.log(`  • ${totalBuilders} sentence builders are auto-derived from existing card`);
console.log('    phonetics and need a native speaker to approve tile order and word');
console.log('    boundaries.');
console.log(`  • ${totalUnits} unit topics + their vocab groupings want a sanity check`);
console.log('    (does the theme fit, are the cards useful at that level).');
console.log('  • Polite particles: builders mostly use the source cards\' male polite');
console.log('    form (ผม / ครับ) where the card does; confirm this is acceptable.');
console.log('  • Coverage is partial by design — uncovered cards remain available in');
console.log('    Practice and the Stage Challenge.');
console.log('  • Priority order for review: Stages 1–2 (HIGH), 3–5 (MEDIUM), 6–8 (LOWER).');
console.log('');

if (missingDocs.length) {
  console.error(`Report finished WITH MISSING DOCS (${missingDocs.length}):`);
  missingDocs.forEach(d => console.error(`  - ${d}`));
  process.exit(1);
}
console.log('Report complete — all expected review documents are present.');
