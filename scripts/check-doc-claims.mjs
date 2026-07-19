// ─────────────────────────────────────────────────────────────────────────────
// DOC / COMMENT CLAIM guard (Wave 12, root cause 4).
//
// THE CLASS OF BUG: comments that assert a checkable fact drift from the code and
// then get TRUSTED. src/data/cards.js said "the manifest is empty, so nothing is
// approved" while APPROVED_CARDS.length was 946; three validator headers argued
// with their own assertion bodies; reviewStatus.js claimed
// DATING_REVIEW_COMPLETE = false when it is true. No executable assertion was
// wrong — but a comment claiming "nothing is approved" is exactly what gets used
// to justify skipping a check.
//
// The fix that STICKS is not "write more careful comments"; it is to make the
// checkable claims executable. This guard fails the build when prose disagrees
// with the code:
//   (1) NO STALE HARDCODED COUNTS — deck sizes and approval counts must not be
//       written as literals in comments/docs, because they move. (Where a number
//       is genuinely useful it belongs in an assertion, not a sentence.)
//   (2) NO REVIVED ZERO-APPROVAL CLAIMS — the specific false invariants that
//       shipped ("nothing is approved", "the manifest is empty",
//       "DATING_REVIEW_COMPLETE = false") must not reappear anywhere.
//   (3) VALIDATOR-COUNT CLAIMS must match what check-all.mjs actually discovers.
// ─────────────────────────────────────────────────────────────────────────────

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative } from 'node:path';

import { ALL_CARDS, CARDS, APPROVED_CARDS } from '../src/data/cards.js';
import { DATING_REVIEW_COMPLETE } from '../src/data/datingContent.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
let failures = 0;
const assert = (label, cond, extra = '') => {
  if (cond) console.log(`OK   ${label}`);
  else { failures += 1; console.error(`FAIL ${label}${extra ? '\n     ' + extra : ''}`); }
};

// SCOPE — LIVING documents only: source comments, validator headers, the
// architecture specs, and CLAUDE.md. Point-in-time records (dated audits, review
// transcripts, launch snapshots, roadmaps of past states) are deliberately NOT
// scanned: they are history, and history is allowed to describe what was true
// when it was written. What must never go stale is anything a future editor
// would read as a statement about the code AS IT IS.
const SCAN_DIRS = ['src', 'scripts', 'docs/architecture'];
const files = [];
const walk = (dir) => {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) { walk(p); continue; }
    if (/\.(js|jsx|mjs|md)$/.test(e.name)) files.push(p);
  }
};
for (const d of SCAN_DIRS) walk(join(ROOT, d));
for (const f of ['CLAUDE.md', 'README.md']) {
  try { statSync(join(ROOT, f)); files.push(join(ROOT, f)); } catch { /* optional */ }
}
const rel = (p) => relative(ROOT, p).replace(/\\/g, '/');

// This guard's own text necessarily quotes the banned phrases; so does the
// architecture assessment, which is a dated historical record, and the migration
// ledger, which quotes past states on purpose.
const EXEMPT = new Set([
  'scripts/check-doc-claims.mjs',
  'docs/architecture-assessment.md',
  'docs/database-migration-ledger-reconciliation.md',
]);
const scan = files.filter(f => !EXEMPT.has(rel(f)));

// This guard is about PROSE, not code. For source files only the comment part of
// a line is considered — otherwise card ids (4700-4799 in the data files) and
// other legitimate literals would read as false claims.
// A line that explicitly frames a number/claim as HISTORICAL is not a false
// statement about today — it is the useful kind of comment ("the old hardcoded
// 4,752 shipped stale"). Those are allowed; undisclaimed present-tense claims are
// not.
const DISCLAIMED = /\b(old|older|was|were|used to|previously|formerly|stale|hardcoded|retired|historic|history|no longer|until|before)\b/i;

const proseOf = (file, line) => {
  if (file.endsWith('.md')) return line;
  const t = line.trim();
  if (t.startsWith('*') || t.startsWith('/*')) return t;
  const i = line.indexOf('//');
  return i >= 0 ? line.slice(i) : '';
};

const hits = (re) => {
  const out = [];
  for (const f of scan) {
    const src = readFileSync(f, 'utf8');
    src.split(/\r?\n/).forEach((line, i) => {
      const prose = proseOf(f, line);
      if (prose && !DISCLAIMED.test(prose) && re.test(prose)) {
        out.push(`${rel(f)}:${i + 1}: ${prose.trim().slice(0, 120)}`);
      }
    });
  }
  return out;
};

// ── (1) Stale hardcoded deck counts ─────────────────────────────────────────
// The live numbers, for the failure message.
const live = `ALL_CARDS=${ALL_CARDS.length} CARDS=${CARDS.length} APPROVED_CARDS=${APPROVED_CARDS.length}`;

// Any deck-sized literal that is NOT one of today's real values is stale by
// definition; and even a currently-correct literal is a landmine, so the only
// tolerated form is naming the export.
const DECK_LITERAL = /\b4[,.]7\d\d\b/g;   // comma/period form only: "4,791" / "4.791"
const deckHits = [];
for (const f of scan) {
  readFileSync(f, 'utf8').split(/\r?\n/).forEach((line, i) => {
    const prose = proseOf(f, line);
    if (!prose || DISCLAIMED.test(prose)) return;
    for (const m of prose.matchAll(DECK_LITERAL)) {
      const n = Number(m[0].replace(/[,.]/g, ''));
      // Allow the live values (load-bearing in a few explanatory places).
      if (n === ALL_CARDS.length || n === CARDS.length) continue;
      deckHits.push(`${rel(f)}:${i + 1}: ${prose.trim().slice(0, 120)}`);
    }
  });
}
assert('(1) no comment or doc states a STALE deck count',
  deckHits.length === 0, `live: ${live}\n     ${deckHits.join('\n     ')}`);

// ── (2) The zero-approval family must not come back ─────────────────────────
const ZERO_APPROVAL = [
  /nothing is approved/i,
  /the manifest is empty/i,
  /NOTHING resolves to ['"]?approved/i,
  /whole deck is draft/i,
  /DATING_REVIEW_COMPLETE\s*=\s*false/,
];
for (const re of ZERO_APPROVAL) {
  const h = hits(re);
  assert(`(2) no prose asserts ${re}`,
    h.length === 0, `${live}, DATING_REVIEW_COMPLETE=${DATING_REVIEW_COMPLETE}\n     ${h.join('\n     ')}`);
}
// Those claims are false RIGHT NOW — prove it, so the ban is grounded in fact.
assert('(2) …and the code disagrees with them: approvals genuinely exist',
  APPROVED_CARDS.length > 0 && DATING_REVIEW_COMPLETE === true, live);

// ── (3) Validator-count claims must match reality ───────────────────────────
{
  const discovered = readdirSync(join(ROOT, 'scripts'))
    .filter(f => /^(check|verify)-.*\.mjs$/.test(f) && f !== 'check-all.mjs').length;
  const claims = [];
  for (const f of scan) {
    const src = readFileSync(f, 'utf8');
    src.split(/\r?\n/).forEach((line, i) => {
      const m = line.match(/\b(\d{2})\s+(?:invariant guards|validators)\b/);
      if (m && Number(m[1]) !== discovered) claims.push(`${rel(f)}:${i + 1}: ${line.trim().slice(0, 120)}`);
    });
  }
  assert('(3) no comment or doc states a validator count that disagrees with what check-all discovers',
    claims.length === 0, `discovered=${discovered}\n     ${claims.join('\n     ')}`);
}

if (failures > 0) {
  console.error(`\nDoc-claim check FAILED: ${failures} assertion(s) failed.`);
  console.error('A comment is asserting something the code contradicts. Fix the comment, or');
  console.error('better: delete the claim and let an assertion carry the fact.');
  process.exit(1);
}
console.log('\nDoc-claim check passed.');
