// scripts/audit-content-integrity.mjs
//
// Full content integrity QA pass across every learning card.
//
// What it checks (per card, per field):
//   1. Suspicious punctuation in the phonetic field
//      - ASCII colon `:` (Paiboon-style length mark — does not match app's
//        own romanization standard which uses doubled vowels / vowel+h)
//      - IPA length mark `ː`
//      - Double colon `::`
//      - Multiple spaces
//      - Leading / trailing whitespace
//   2. Unicode / combining-mark issues anywhere
//      - Zero-width characters: U+200B / 200C / 200D / FEFF
//      - NBSP (U+00A0) instead of regular space
//      - Standalone combining marks at the start of a string
//   3. Script-mixing rules
//      - Thai script (U+0E00..U+0E7F) inside the phonetic or English field
//      - Latin letters [A-Za-z] inside the Thai field (only flagged when the
//        field is mostly Thai — explicit code-mixed cards are skipped)
//   4. Duplicates
//      - Same Thai string with conflicting English
//      - Same Thai string with conflicting romanization
//      - Duplicate card IDs
//   5. Missing fields
//      - Empty Thai, English, or phonetic
//      - Phonetic placeholders / pending flags
//
// Side effects
//   - Writes findings to docs/content-integrity-findings.json
//   - Prints a structured summary to stdout
//
// Usage
//   node scripts/audit-content-integrity.mjs
//
// This file is read-only — it does NOT mutate card data. The companion
// script apply-content-integrity-fixes.mjs applies the high-confidence
// mechanical fixes.

import { CARDS } from '../src/data/cards.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const OUT_PATH = path.join(REPO_ROOT, 'docs', 'content-integrity-findings.json');

// Use \u escapes throughout for clarity and to avoid encoding ambiguity.
const THAI_BLOCK         = /[฀-๿]/;
const THAI_BLOCK_GLOBAL  = /[฀-๿]/g;
const LATIN              = /[A-Za-z]/;
const LATIN_COMBINING    = /[̀-ͯ]/;
const THAI_COMBINING     = /[็-๎]/;
const THAI_TONE_MARK     = /[่-๋]/;
const ZERO_WIDTH         = /[​‌‍⁠﻿]/;
const ZERO_WIDTH_GLOBAL  = /[​‌‍⁠﻿]/g;
const NBSP               = / /;
const IPA_LENGTH         = /ː/;
const DOUBLE_COLON       = /::/;
const COLON              = /:/;
const COLON_GLOBAL       = /:/g;
const MULTI_SPACE        = /[ \t]{2,}/;
const INVISIBLE          = /[ ­͏؜ᅟᅠ឴឵᠎​-‏‪-‮⁠-⁯ㅤ﻿ﾠ]/;
const INVISIBLE_GLOBAL   = /[ ­͏؜ᅟᅠ឴឵᠎​-‏‪-‮⁠-⁯ㅤ﻿ﾠ]/g;

const STRING_FIELDS = ['thai', 'ph', 'en', 'note'];

const findings = {
  meta: {
    generatedAt: new Date().toISOString(),
    totalCardsScanned: 0,
  },
  issues: [],
  duplicates: [],
  duplicateIds: [],
  counts: {},
};

function record(issue, card, field, extra = {}) {
  const value = card[field] ?? null;
  findings.issues.push({
    issue,
    cardId: card.id,
    stage: card.stage,
    cat: card.cat,
    type: card.type,
    field,
    value,
    ...extra,
  });
  findings.counts[issue] = (findings.counts[issue] || 0) + 1;
}

function escapeCp(s) {
  if (typeof s !== 'string') return s;
  return s.replace(INVISIBLE_GLOBAL, (m) =>
    `\\u${m.codePointAt(0).toString(16).padStart(4, '0').toUpperCase()}`
  );
}

// ---------------------------------------------------------------------------

function checkStringField(card, field) {
  const v = card[field];
  if (v == null || v === '') return;
  if (typeof v !== 'string') return;

  if (ZERO_WIDTH.test(v)) {
    record('zero-width-character', card, field, { sample: escapeCp(v) });
  }

  if (NBSP.test(v)) {
    record('nbsp-instead-of-space', card, field, { sample: escapeCp(v) });
  }

  if (v !== v.trim()) {
    record('leading-or-trailing-whitespace', card, field);
  }

  if (MULTI_SPACE.test(v)) {
    record('multiple-spaces', card, field);
  }
}

function checkPhonetic(card) {
  const v = card.ph;
  if (v == null || v === '') {
    record('missing-phonetic', card, 'ph');
    return;
  }
  if (typeof v !== 'string') {
    record('non-string-phonetic', card, 'ph');
    return;
  }

  if (/phNeedsGen|phReview|phPending|coming soon/i.test(v)) {
    record('phonetic-placeholder-flag', card, 'ph');
  }

  if (COLON.test(v)) {
    const stripped = v.replace(COLON_GLOBAL, '');
    record('colon-in-phonetic', card, 'ph', {
      proposedFix: stripped,
      reason: 'Stray ASCII colon used as Paiboon length mark; app standard strips the colon.',
    });
  }

  if (DOUBLE_COLON.test(v)) {
    record('double-colon-in-phonetic', card, 'ph');
  }

  if (IPA_LENGTH.test(v)) {
    record('ipa-length-mark-in-phonetic', card, 'ph');
  }

  if (THAI_BLOCK.test(v)) {
    const matches = v.match(THAI_BLOCK_GLOBAL) || [];
    record('thai-script-in-phonetic', card, 'ph', { thaiChars: matches });
  }

  if (LATIN_COMBINING.test(v[0] || '')) {
    record('leading-combining-mark', card, 'ph');
  }
}

function checkThai(card) {
  const v = card.thai;
  if (v == null || v === '') {
    record('missing-thai', card, 'thai');
    return;
  }
  if (typeof v !== 'string') {
    record('non-string-thai', card, 'thai');
    return;
  }

  if (THAI_COMBINING.test(v[0] || '') || THAI_TONE_MARK.test(v[0] || '')) {
    record('thai-leading-combining-mark', card, 'thai');
  }

  if (LATIN.test(v)) {
    const total = v.length;
    const latinCount = (v.match(/[A-Za-z]/g) || []).length;
    if (latinCount / total < 0.3) {
      record('latin-in-thai', card, 'thai', { latinCount });
    }
  }

  // Doubled identical tone marks (e.g. two U+0E49 in a row) — unusual.
  if (/([่-๋])\1/.test(v)) {
    record('repeated-thai-tone-mark', card, 'thai');
  }
}

function checkEnglish(card) {
  const v = card.en;
  if (v == null || v === '') {
    record('missing-english', card, 'en');
    return;
  }
  if (typeof v !== 'string') {
    record('non-string-english', card, 'en');
    return;
  }

  if (THAI_BLOCK.test(v)) {
    const matches = v.match(THAI_BLOCK_GLOBAL) || [];
    const looksLikeExplicit = /[:—]/.test(v);
    if (!looksLikeExplicit) {
      record('thai-script-in-english', card, 'en', { thaiChars: matches });
    }
  }

  if (DOUBLE_COLON.test(v)) {
    record('double-colon-in-english', card, 'en');
  }
}

function checkBreakdown(card) {
  if (!Array.isArray(card.breakdown)) return;
  card.breakdown.forEach((b, idx) => {
    if (b == null || typeof b !== 'object') return;
    if (typeof b.ph === 'string' && COLON.test(b.ph)) {
      record('colon-in-breakdown-phonetic', card, `breakdown[${idx}].ph`, {
        value: b.ph,
        proposedFix: b.ph.replace(COLON_GLOBAL, ''),
      });
    }
    if (typeof b.ph === 'string' && IPA_LENGTH.test(b.ph)) {
      record('ipa-length-mark-in-breakdown', card, `breakdown[${idx}].ph`, { value: b.ph });
    }
  });
}

// ---------------------------------------------------------------------------

const seenIds = new Map();
const byThai = new Map();

for (const card of CARDS) {
  findings.meta.totalCardsScanned += 1;

  if (seenIds.has(card.id)) {
    findings.duplicateIds.push({ id: card.id });
  } else {
    seenIds.set(card.id, card);
  }

  for (const field of STRING_FIELDS) checkStringField(card, field);

  checkPhonetic(card);
  checkThai(card);
  checkEnglish(card);
  checkBreakdown(card);

  const key = (card.thai || '').trim();
  if (key) {
    if (!byThai.has(key)) byThai.set(key, { ids: [], englishes: new Set(), phonetics: new Set(), cards: [] });
    const entry = byThai.get(key);
    entry.ids.push(card.id);
    if (card.en) entry.englishes.add(card.en.trim());
    if (card.ph) entry.phonetics.add(card.ph.trim());
    entry.cards.push(card);
  }
}

for (const [thai, entry] of byThai.entries()) {
  if (entry.ids.length < 2) continue;
  const englishes = [...entry.englishes];
  const phonetics = [...entry.phonetics];
  const conflictingEn = englishes.length > 1;
  const conflictingPh = phonetics.length > 1;
  if (!conflictingEn && !conflictingPh) continue;
  findings.duplicates.push({
    thai,
    ids: entry.ids,
    englishes,
    phonetics,
    conflictingEn,
    conflictingPh,
  });
}

// ---------------------------------------------------------------------------

fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
fs.writeFileSync(OUT_PATH, JSON.stringify(findings, null, 2), 'utf8');

const order = [
  'colon-in-phonetic',
  'colon-in-breakdown-phonetic',
  'double-colon-in-phonetic',
  'ipa-length-mark-in-phonetic',
  'ipa-length-mark-in-breakdown',
  'zero-width-character',
  'nbsp-instead-of-space',
  'leading-or-trailing-whitespace',
  'multiple-spaces',
  'leading-combining-mark',
  'thai-leading-combining-mark',
  'repeated-thai-tone-mark',
  'thai-script-in-phonetic',
  'thai-script-in-english',
  'latin-in-thai',
  'missing-phonetic',
  'missing-english',
  'missing-thai',
  'non-string-phonetic',
  'non-string-thai',
  'non-string-english',
  'double-colon-in-english',
  'phonetic-placeholder-flag',
];

let total = 0;
console.log(`Total cards scanned: ${findings.meta.totalCardsScanned}`);
console.log('');
console.log('Issues by category:');
for (const cat of order) {
  const n = findings.counts[cat] || 0;
  total += n;
  if (n > 0) console.log(`  ${cat.padEnd(38)} ${n}`);
}
for (const cat of Object.keys(findings.counts)) {
  if (!order.includes(cat)) {
    const n = findings.counts[cat] || 0;
    total += n;
    console.log(`  ${cat.padEnd(38)} ${n}`);
  }
}
console.log('');
console.log(`Duplicate Thai with conflicting EN/PH: ${findings.duplicates.length}`);
console.log(`Duplicate card IDs:                    ${findings.duplicateIds.length}`);
console.log('');
console.log(`Total issues: ${total + findings.duplicates.length + findings.duplicateIds.length}`);
console.log('');
console.log(`Findings written to ${path.relative(REPO_ROOT, OUT_PATH)}`);
