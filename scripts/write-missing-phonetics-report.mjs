// scripts/write-missing-phonetics-report.mjs
//
// Produces the human-readable Markdown report and the
// machine-readable JSON report described in the task brief.
//
// Both reports include every reviewed card. Cards that received a
// HIGH-confidence fix list status=Fixed; everything else is status=Left
// for native review.
//
// Reads:
//   docs/missing-phonetics-findings.json   (from audit-missing-phonetics.mjs)
//
// Writes:
//   docs/missing-phonetics-fix-report.md
//   docs/missing-phonetics-fix-report.json
//
// Re-runnable. Re-running after the audit picks up any newly applied
// fixes automatically.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CARDS } from '../src/data/cards.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const FINDINGS_PATH = path.join(REPO_ROOT, 'docs', 'missing-phonetics-findings.json');
const MD_PATH = path.join(REPO_ROOT, 'docs', 'missing-phonetics-fix-report.md');
const JSON_PATH = path.join(REPO_ROOT, 'docs', 'missing-phonetics-fix-report.json');

if (!fs.existsSync(FINDINGS_PATH)) {
  console.error('Findings file missing — run scripts/audit-missing-phonetics.mjs first.');
  process.exit(1);
}

const findings = JSON.parse(fs.readFileSync(FINDINGS_PATH, 'utf8'));

// Cross-reference each finding's id with the live CARDS export so we can
// tell whether the ph has since been filled (Status = Fixed) or remains
// empty (Status = Left for native review).
const cardById = new Map();
for (const c of CARDS) cardById.set(c.id, c);

const PATH_TO_STATUS = {
  'exact-card-duplicate':       'Duplicate source used',
  'exact-lookup-entry':         'Duplicate source used',
  'tail-particle-decomposable': 'Pattern source used',
  'no-known-path':              'Left for native review',
};

const PATH_TO_CONFIDENCE = {
  'exact-card-duplicate':       'High',
  'exact-lookup-entry':         'High',
  'tail-particle-decomposable': 'High',
  'no-known-path':              'Low',
};

const PATH_TO_REASON = {
  'exact-card-duplicate':
    'Same Thai phrase exists elsewhere in the deck with a filled phonetic — value reused verbatim.',
  'exact-lookup-entry':
    'Same Thai phrase is registered in src/data/lookup.js — value reused verbatim.',
  'tail-particle-decomposable':
    'Phrase decomposes cleanly as <known head> + <known particle>; both subparts have canonical phonetics in the app.',
  'no-known-path':
    'No exact-Thai match in cards or lookup; no safe tail-particle decomposition. Colloquial idiom — pronunciation, tones, vowel length, and possible sandhi require native-speaker judgement.',
};

const rows = [];
for (const f of findings.cards) {
  const live = cardById.get(f.id);
  const currentPh = live && typeof live.ph === 'string' ? live.ph : '';
  const wasFixed = currentPh.trim() !== '';
  const status = wasFixed ? 'Fixed' : PATH_TO_STATUS[f.chosenPath] || 'Left for native review';
  const confidence = wasFixed ? 'High' : PATH_TO_CONFIDENCE[f.chosenPath] || 'Low';
  const oldPhonetic = '(empty)';
  const newPhonetic = wasFixed ? currentPh : (f.proposedPh || '');
  const reason = PATH_TO_REASON[f.chosenPath] || '';
  const sourceCardId = f.tailDecomp && f.tailDecomp.head ? null : null; // detailed source not retained in findings

  rows.push({
    status,
    cardId: f.id,
    stage: f.stage,
    mission: live && live.mission != null ? live.mission : null,
    thai: f.thai,
    english: f.en,
    oldPhonetic,
    newPhonetic,
    confidence,
    reason,
    sourceCardId,
    chosenPath: f.chosenPath,
    category: f.cat,
    type: f.type,
    note: f.note || null,
  });
}

// Stable sort: by stage ascending, then card id ascending — so the
// owner can pick the report up at any stage they want.
rows.sort((a, b) => (a.stage - b.stage) || (a.cardId - b.cardId));

// --- JSON --------------------------------------------------------------
fs.writeFileSync(JSON_PATH, JSON.stringify(rows, null, 2), 'utf8');

// --- Markdown ----------------------------------------------------------
const totals = {
  reviewed: rows.length,
  fixed: rows.filter(r => r.status === 'Fixed').length,
  duplicateSource: rows.filter(r => r.status === 'Duplicate source used').length,
  patternSource: rows.filter(r => r.status === 'Pattern source used').length,
  leftForReview: rows.filter(r => r.status === 'Left for native review').length,
};

const lines = [];
lines.push('# Missing Phonetics — Fix Report');
lines.push('');
lines.push('Companion to [`content-integrity-audit.md`](./content-integrity-audit.md) and');
lines.push('[`duplicate-thai-review.md`](./duplicate-thai-review.md). The original integrity');
lines.push('audit flagged **334 cards** with empty `ph` fields, all of them colloquial');
lines.push('Thai sentences in the IDs 4732–5722 range (sourced from the Pimsleur /');
lines.push('"Speak Like A Thai" / High-Beginner expression imports).');
lines.push('');
lines.push('## Summary');
lines.push('');
lines.push(`- **Cards reviewed:** ${totals.reviewed}`);
lines.push(`- **Cards fixed (HIGH confidence, applied):** ${totals.fixed}`);
lines.push(`- **Cards using duplicate source:** ${totals.duplicateSource}`);
lines.push(`- **Cards using pattern source:** ${totals.patternSource}`);
lines.push(`- **Cards left for native-speaker review:** ${totals.leftForReview}`);
lines.push('');
lines.push('## Why so few mechanical fixes?');
lines.push('');
lines.push('Three lookup strategies were attempted (see `scripts/audit-missing-phonetics.mjs`):');
lines.push('');
lines.push('1. **Exact-Thai match against another card with `ph` filled.**');
lines.push('   Result: 0 matches. None of the 334 missing-phonetic Thai strings appear');
lines.push('   anywhere else in `CARDS` with a filled phonetic. Each idiom is unique to');
lines.push('   the import batch.');
lines.push('2. **Exact-Thai match against `src/data/lookup.js`.**');
lines.push('   Result: 0 matches. `lookup.js` indexes the canonical single-word vocabulary');
lines.push('   used for auto-breakdowns; these sentence-level idioms are not in it.');
lines.push('3. **Tail-particle decomposition** (e.g. "X + ครับ" where the head X has a');
lines.push('   known phonetic).');
lines.push('   Result: 0 decomposable cards.');
lines.push('');
lines.push('Component-wise reconstruction of the remaining cards was deliberately *not*');
lines.push('attempted: each phrase is a colloquial idiom or contains slang particles,');
lines.push('reduplication (ๆ), or compound nouns where tone sandhi, vowel length, and');
lines.push('juncture can shift the surface pronunciation. Per the task brief — and the');
lines.push('project rule "do not guess Thai" — guessing here would be a net negative for');
lines.push('a Thai-learning app: a wrong tone in a learner\'s deck is worse than no');
lines.push('phonetic at all. The lesson UI handles empty `ph` gracefully via a');
lines.push('"phonetic coming soon" placeholder.');
lines.push('');
lines.push('## How a native-speaker pass should run');
lines.push('');
lines.push('1. Walk the table below stage-by-stage (the report is sorted that way).');
lines.push('2. For each card, fill the **New Phonetic** column using the app\'s existing');
lines.push('   romanization convention: doubled vowels for length where applicable,');
lines.push('   tone marks `à á â ǎ` on the first vowel, hyphens within compound nouns,');
lines.push('   spaces between distinct words. See `src/data/cards.js` for canonical');
lines.push('   examples.');
lines.push('3. Run `node scripts/audit-missing-phonetics.mjs` after each batch to track');
lines.push('   the remaining count.');
lines.push('4. Once a batch of phonetics has been verified, add them as');
lines.push('   `STEP2_OVERRIDES` entries in `src/data/cards-step2.js` keyed by card id,');
lines.push('   e.g.:');
lines.push('   ```js');
lines.push('   4772: { ph: "ôh hǒh" },  // โอ้โห');
lines.push('   ```');
lines.push('   This keeps the auto-generated imported files clean of hand-edits and');
lines.push('   makes the changes auditable in version control.');
lines.push('');
lines.push('## Distribution');
lines.push('');
lines.push('| Stage | Cards missing `ph` |');
lines.push('| ---: | ---: |');
const byStage = {};
for (const r of rows) byStage[r.stage] = (byStage[r.stage] || 0) + 1;
for (const s of Object.keys(byStage).sort((a, b) => +a - +b)) {
  lines.push(`| S${s} | ${byStage[s]} |`);
}
lines.push('');
lines.push('## Per-card review table');
lines.push('');
lines.push('All 334 cards appear below. Use the **Status** column to filter.');
lines.push('');
lines.push('| Status | Card ID | Stage | Thai | English | Old Phonetic | New Phonetic | Confidence | Reason |');
lines.push('|---|---|---|---|---|---|---|---|---|');
function cellEscape(s) {
  if (s == null) return '';
  return String(s).replace(/\|/g, '\\|').replace(/\n/g, ' ').replace(/\r/g, '');
}
for (const r of rows) {
  lines.push(
    `| ${r.status} | ${r.cardId} | S${r.stage} | ${cellEscape(r.thai)} | ${cellEscape(r.english)} | ${cellEscape(r.oldPhonetic)} | ${cellEscape(r.newPhonetic)} | ${r.confidence} | ${cellEscape(r.reason)} |`,
  );
}
lines.push('');
lines.push('## Adjacent data findings (out of scope; flagged for the editorial pass)');
lines.push('');
lines.push('During this audit several cards in the same batch were observed with');
lines.push('stray ASCII / curly quote characters wrapping their **Thai script**');
lines.push('(e.g. card 4994 stores `"หูหนวก"` with a leading straight quote and a');
lines.push('trailing curly quote). This is a separate import-pipeline data-integrity');
lines.push('issue and is not auto-fixed here (touching Thai script is explicitly out');
lines.push('of scope for the missing-phonetics task). Recommend an `scripts/audit-`');
lines.push('`thai-quote-corruption.mjs` pass in a future ticket.');
lines.push('');

fs.writeFileSync(MD_PATH, lines.join('\n'), 'utf8');

console.log(`Wrote ${path.relative(REPO_ROOT, MD_PATH)}`);
console.log(`Wrote ${path.relative(REPO_ROOT, JSON_PATH)}`);
console.log('');
console.log(`Totals: reviewed=${totals.reviewed}  fixed=${totals.fixed}  left-for-review=${totals.leftForReview}`);
