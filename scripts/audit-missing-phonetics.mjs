// scripts/audit-missing-phonetics.mjs
//
// Focused audit for cards with missing phonetics. Runs against the
// resolved CARDS export (i.e. after STEP2_OVERRIDES are applied) so it
// reflects what the app actually serves to learners.
//
// Reports
//   - total cards
//   - cards with missing / empty / whitespace-only `ph`
//   - breakdown by stage and category
//   - whether each missing card has any safe lookup path:
//       (a) exact-Thai duplicate elsewhere in CARDS (with ph filled)
//       (b) exact-Thai entry in lookup.js (inverted Thai → ph)
//       (c) decomposable via known tail particles (ครับ / ค่ะ / นะ / ...)
//
// Usage
//   node scripts/audit-missing-phonetics.mjs
//
// Side effects
//   - Writes findings to docs/missing-phonetics-findings.json
//   - Read-only otherwise

import { CARDS } from '../src/data/cards.js';
import { WORD_LOOKUP } from '../src/data/lookup.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const OUT_PATH = path.join(REPO_ROOT, 'docs', 'missing-phonetics-findings.json');

// Common Thai tail particles paired with their app-standard romanization.
// Used to test the "head + particle" decomposition path.
const TAIL_PARTICLES = [
  { thai: 'นะครับ', ph: 'ná khráp' },
  { thai: 'นะค่ะ',  ph: 'ná khâ' },
  { thai: 'ครับ',  ph: 'khráp' },
  { thai: 'ค่ะ',   ph: 'khâ' },
  { thai: 'คะ',    ph: 'khá' },
  { thai: 'นะ',    ph: 'ná' },
  { thai: 'จ้ะ',   ph: 'jâ' },
  { thai: 'จ้า',   ph: 'jâa' },
  { thai: 'แล้ว',  ph: 'láew' },
  { thai: 'หรือ',  ph: 'rǔe' },
  { thai: 'ละ',    ph: 'lá' },
];

// --- index existing Thai → ph from CARDS ----------------------------------
const cardThaiToPh = new Map();
for (const c of CARDS) {
  if (typeof c.ph !== 'string') continue;
  const ph = c.ph.trim();
  if (!ph) continue;
  const key = (c.thai || '').trim();
  if (!key) continue;
  if (!cardThaiToPh.has(key)) cardThaiToPh.set(key, new Set());
  cardThaiToPh.get(key).add(ph);
}

// --- index existing Thai → ph from lookup.js -----------------------------
// lookup.js is keyed by phonetic; invert it so we can lookup by Thai.
const lookupThaiToPh = new Map();
for (const [ph, info] of Object.entries(WORD_LOOKUP)) {
  if (!info || !info.thai) continue;
  const key = info.thai.trim();
  if (!key) continue;
  if (!lookupThaiToPh.has(key)) lookupThaiToPh.set(key, new Set());
  lookupThaiToPh.get(key).add(ph);
}

// --- scan -----------------------------------------------------------------
const missing = CARDS.filter(c => typeof c.ph !== 'string' || c.ph.trim() === '');

const findings = {
  meta: {
    generatedAt: new Date().toISOString(),
    totalCards: CARDS.length,
    totalMissingPh: missing.length,
  },
  byStage: {},
  byCategory: {},
  pathBreakdown: {
    exactCardDuplicate: 0,
    exactLookupEntry: 0,
    tailParticleDecomposable: 0,
    noKnownPath: 0,
  },
  cards: [],
};

for (const c of missing) {
  const thai = (c.thai || '').trim();

  // Path A: exact Thai duplicate in CARDS
  const exactCardPh = cardThaiToPh.get(thai);
  // Path B: exact Thai in lookup.js
  const exactLookupPh = lookupThaiToPh.get(thai);
  // Path C: decomposable via tail particle
  let tailDecomp = null;
  for (const p of TAIL_PARTICLES) {
    if (thai.endsWith(p.thai) && thai !== p.thai) {
      const head = thai.slice(0, thai.length - p.thai.length).trim();
      if (head) {
        const headPh = cardThaiToPh.get(head) || lookupThaiToPh.get(head);
        if (headPh && headPh.size > 0) {
          tailDecomp = { head, headPh: [...headPh][0], particle: p.thai, particlePh: p.ph, proposed: `${[...headPh][0]} ${p.ph}` };
          break;
        }
      }
    }
  }

  let chosenPath = null;
  let proposedPh = null;
  if (exactCardPh && exactCardPh.size === 1) {
    chosenPath = 'exact-card-duplicate';
    proposedPh = [...exactCardPh][0];
    findings.pathBreakdown.exactCardDuplicate += 1;
  } else if (exactLookupPh && exactLookupPh.size === 1) {
    chosenPath = 'exact-lookup-entry';
    proposedPh = [...exactLookupPh][0];
    findings.pathBreakdown.exactLookupEntry += 1;
  } else if (tailDecomp) {
    chosenPath = 'tail-particle-decomposable';
    proposedPh = tailDecomp.proposed;
    findings.pathBreakdown.tailParticleDecomposable += 1;
  } else {
    chosenPath = 'no-known-path';
    findings.pathBreakdown.noKnownPath += 1;
  }

  findings.byStage[c.stage] = (findings.byStage[c.stage] || 0) + 1;
  findings.byCategory[c.cat] = (findings.byCategory[c.cat] || 0) + 1;

  findings.cards.push({
    id: c.id,
    thai: c.thai,
    en: c.en,
    note: c.note || null,
    stage: c.stage,
    cat: c.cat,
    type: c.type,
    chosenPath,
    proposedPh,
    tailDecomp,
  });
}

fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
fs.writeFileSync(OUT_PATH, JSON.stringify(findings, null, 2), 'utf8');

console.log(`Total cards:           ${findings.meta.totalCards}`);
console.log(`Missing-phonetic:      ${findings.meta.totalMissingPh}`);
console.log('');
console.log('Path breakdown:');
console.log(`  exact-card-duplicate     ${findings.pathBreakdown.exactCardDuplicate}`);
console.log(`  exact-lookup-entry       ${findings.pathBreakdown.exactLookupEntry}`);
console.log(`  tail-particle-decomp.    ${findings.pathBreakdown.tailParticleDecomposable}`);
console.log(`  no-known-path            ${findings.pathBreakdown.noKnownPath}`);
console.log('');
console.log('By stage:');
for (const s of Object.keys(findings.byStage).sort()) {
  console.log(`  S${s}  ${findings.byStage[s]}`);
}
console.log('');
console.log(`Findings written to ${path.relative(REPO_ROOT, OUT_PATH)}`);
