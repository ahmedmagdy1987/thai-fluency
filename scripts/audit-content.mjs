// scripts/audit-content.mjs
//
// Content quality audit for Thai learning cards.
//
// Checks every card in the project for:
//   - missing or empty Thai/English/phonetic fields
//   - duplicate IDs
//   - duplicate Thai strings with conflicting English
//   - Latin/Roman characters in the Thai field (excluding allowed loanwords)
//   - Thai script appearing inside the English field
//   - suspiciously short English when Thai contains gendered pronouns / particles
//   - gendered Thai (ผม, ครับ) where the English is missing a (male) annotation
//   - female-form Thai (ดิฉัน, hardcoded ฉัน, ค่ะ, คะ) where the English is
//     missing a (female) annotation
//   - inconsistent annotation styles ((m)/(f)/(female, formal)/etc.)
//   - notes that mention "male"/"female" outside the (male)/(female) flip pattern
//
// Usage:   node scripts/audit-content.mjs
// Output:  prints summary to stdout; writes JSON to docs/content-audit-findings.json

import { CARDS } from '../src/data/cards.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const OUT_PATH = path.join(REPO_ROOT, 'docs', 'content-audit-findings.json');

// --- gendered marker patterns -------------------------------------------------

// Male pronoun / polite particle in Thai
const MALE_PRONOUN = /ผม/;          // "I" (male)
const MALE_PARTICLE = /ครับ/;        // polite particle (male)

// Female pronouns
const FEMALE_FORMAL_PRONOUN = /ดิฉัน/;     // formal female "I"
// "ฉัน" but NOT preceded by "ดิ" (which would make it "ดิฉัน")
const FEMALE_CASUAL_PRONOUN = /(?<!ดิ)ฉัน/;

// Female polite particles (ค่ะ statement, คะ question)
const FEMALE_PARTICLE_KHA = /ค่ะ/;
const FEMALE_PARTICLE_KA_Q = /คะ/;

// Existing English-side annotation patterns
const EN_HAS_MALE = /\(male\)|\(male,/;
const EN_HAS_FEMALE = /\(female\)|\(female,/;
// Short-form annotations: "(m)", "(m, casual)", "(m, response to X)".
// "m" or "f" must be a standalone letter — avoids false positives on words
// like "(mostly)" or "(formal)" that happen to start with the same letter.
const EN_HAS_SHORT_M = /\(m\)|\(m,\s|\bm\)/;
const EN_HAS_SHORT_F = /\(f\)|\(f,\s|\bf\)/;

// Suspiciously short English for translations that should be more specific
const SUSPICIOUS_SHORT_EN = /^(I|me|I\/me|I \/ me|you|he|she|we|us|yes|no|thank you|thanks|hello|hi|goodbye|okay|ok|sorry|please)\.?$/i;

// Latin characters allowed in Thai field (digits + spaces are common in dates;
// allow none-Latin-letter chars otherwise)
const LATIN_LETTER_IN_THAI = /[A-Za-z]/;

// Thai script in English field
const THAI_IN_EN = /[฀-๿]/;

// --- helpers ------------------------------------------------------------------

function classifyGender(card) {
  const thai = card.thai || '';
  const en = card.en || '';
  const note = card.note || '';
  const tags = [];

  if (MALE_PRONOUN.test(thai)) tags.push('has-phǒm');
  if (MALE_PARTICLE.test(thai)) tags.push('has-khráp');
  if (FEMALE_FORMAL_PRONOUN.test(thai)) tags.push('has-dìchǎn');
  if (FEMALE_CASUAL_PRONOUN.test(thai)) tags.push('has-chǎn');
  if (FEMALE_PARTICLE_KHA.test(thai)) tags.push('has-khâ');
  if (FEMALE_PARTICLE_KA_Q.test(thai)) tags.push('has-khá');

  if (EN_HAS_MALE.test(en) || EN_HAS_MALE.test(note)) tags.push('en-says-(male)');
  if (EN_HAS_FEMALE.test(en) || EN_HAS_FEMALE.test(note)) tags.push('en-says-(female)');
  if (EN_HAS_SHORT_M.test(en) || EN_HAS_SHORT_M.test(note)) tags.push('en-says-(m)');
  if (EN_HAS_SHORT_F.test(en) || EN_HAS_SHORT_F.test(note)) tags.push('en-says-(f)');

  return tags;
}

function hasAnyMaleMarker(card) {
  const en = card.en || '';
  const note = card.note || '';
  return EN_HAS_MALE.test(en) || EN_HAS_SHORT_M.test(en) ||
         EN_HAS_MALE.test(note) || EN_HAS_SHORT_M.test(note);
}

function hasAnyFemaleMarker(card) {
  const en = card.en || '';
  const note = card.note || '';
  return EN_HAS_FEMALE.test(en) || EN_HAS_SHORT_F.test(en) ||
         EN_HAS_FEMALE.test(note) || EN_HAS_SHORT_F.test(note);
}

// --- findings collector -------------------------------------------------------

const findings = {
  total: CARDS.length,
  byCategory: {},
  issues: [],
};

function record(category, card, detail = {}) {
  findings.byCategory[category] = (findings.byCategory[category] || 0) + 1;
  findings.issues.push({
    category,
    id: card.id,
    stage: card.stage,
    mission: card.mission,
    cat: card.cat,
    type: card.type,
    thai: card.thai,
    ph: card.ph,
    en: card.en,
    note: card.note,
    ...detail,
  });
}

// --- checks -------------------------------------------------------------------

// 1) Missing/empty fields + duplicate IDs + duplicate Thai
const seenIds = new Map();
const thaiToCard = new Map();

for (const c of CARDS) {
  if (c.id == null) record('missing-id', c);
  if (!c.thai || !String(c.thai).trim()) record('missing-thai', c);
  if (!c.en || !String(c.en).trim()) record('missing-en', c);
  // ph: most cards have it. Words can occasionally omit. Flag only sentences/phrases.
  if (!c.ph && (c.type === 's' || c.type === 'p')) record('missing-ph-sentence', c);

  if (seenIds.has(c.id)) {
    record('duplicate-id', c, { otherCard: seenIds.get(c.id) });
  } else {
    seenIds.set(c.id, { id: c.id, thai: c.thai, en: c.en });
  }

  if (c.thai) {
    if (thaiToCard.has(c.thai)) {
      const prev = thaiToCard.get(c.thai);
      // Conflicting English?
      if (prev.en !== c.en) {
        record('duplicate-thai-conflicting-en', c, { otherCard: prev });
      } else {
        record('duplicate-thai-identical', c, { otherCard: prev });
      }
    } else {
      thaiToCard.set(c.thai, { id: c.id, en: c.en });
    }
  }

  // Latin in Thai
  if (c.thai && LATIN_LETTER_IN_THAI.test(c.thai)) {
    // Exception: known loanwords in Thai use mostly Thai script with the
    // English name; we only flag if it's mostly Latin. Allow common loanwords
    // like "WiFi", "ATM" by checking the ratio.
    const thai = c.thai;
    const latinChars = (thai.match(/[A-Za-z]/g) || []).length;
    const thaiChars = (thai.match(/[฀-๿]/g) || []).length;
    if (latinChars > 0 && thaiChars === 0) {
      record('latin-in-thai-only', c, { latinChars, thaiChars });
    } else if (latinChars > thaiChars) {
      record('mostly-latin-in-thai', c, { latinChars, thaiChars });
    }
  }

  // Thai in English
  if (c.en && THAI_IN_EN.test(c.en)) {
    record('thai-in-english', c);
  }
}

// 2) Gender annotation checks
for (const c of CARDS) {
  const thai = c.thai || '';
  const en = c.en || '';

  const isMaleForm = MALE_PRONOUN.test(thai) || MALE_PARTICLE.test(thai);
  const isFemaleFormal = FEMALE_FORMAL_PRONOUN.test(thai);
  const isFemaleCasual = !isFemaleFormal && FEMALE_CASUAL_PRONOUN.test(thai);
  const isFemaleParticle = FEMALE_PARTICLE_KHA.test(thai) || FEMALE_PARTICLE_KA_Q.test(thai);

  // Cards with both male AND female markers (e.g., "ครับ/ค่ะ", "ผม / ดิฉัน")
  const hasMaleMarker = isMaleForm;
  const hasFemaleMarker = isFemaleFormal || isFemaleCasual || isFemaleParticle;

  if (hasMaleMarker && hasFemaleMarker) {
    // Mixed-form card — usually a teaching card showing both options.
    // OK if it's annotated with "(male/female)" or similar.
    const enLow = (c.en || '').toLowerCase();
    const hasMixedAnnotation =
      /\(male\s*\/\s*female\)/i.test(c.en || '') ||
      /\(m\s*\/\s*f\)/i.test(c.en || '') ||
      (EN_HAS_MALE.test(c.en || '') && EN_HAS_FEMALE.test(c.en || ''));
    if (!hasMixedAnnotation) {
      record('mixed-gender-thai-missing-annotation', c);
    }
    continue;
  }

  // Pure male form
  if (hasMaleMarker && !hasFemaleMarker) {
    if (!hasAnyMaleMarker(c)) {
      record('male-thai-missing-en-annotation', c);
    }
  }

  // Pure female form
  if (hasFemaleMarker && !hasMaleMarker) {
    if (!hasAnyFemaleMarker(c)) {
      if (isFemaleFormal) record('dìchǎn-missing-female-annotation', c);
      else if (isFemaleCasual) record('chǎn-missing-female-annotation', c);
      else record('female-particle-missing-annotation', c);
    } else {
      // Has female marker but maybe in short form (m)/(f) — flag for standardization
      if (EN_HAS_SHORT_F.test(en) && !EN_HAS_FEMALE.test(en)) {
        record('female-uses-short-form-(f)', c);
      }
    }
  }
}

// 3) Short-form annotations to standardize
for (const c of CARDS) {
  const en = c.en || '';
  if (EN_HAS_SHORT_M.test(en) && !EN_HAS_MALE.test(en)) {
    record('male-uses-short-form-(m)', c);
  }
}

// 4) Suspiciously generic English when Thai has gender content
for (const c of CARDS) {
  const en = c.en || '';
  const thai = c.thai || '';
  if (SUSPICIOUS_SHORT_EN.test(en.trim())) {
    if (MALE_PRONOUN.test(thai) || MALE_PARTICLE.test(thai) ||
        FEMALE_FORMAL_PRONOUN.test(thai) || /(?<!ดิ)ฉัน/.test(thai) ||
        FEMALE_PARTICLE_KHA.test(thai) || FEMALE_PARTICLE_KA_Q.test(thai)) {
      record('suspiciously-short-en-with-gender-thai', c);
    }
  }
}

// 5) Notes that mention male/female outside the auto-flip pattern
for (const c of CARDS) {
  const note = c.note || '';
  if (!note) continue;
  const hasMaleWord = /\bmale\b/i.test(note);
  const hasFemaleWord = /\bfemale\b/i.test(note);
  if (hasMaleWord || hasFemaleWord) {
    const hasFlipPattern = /\(male\)|\(female\)|\(male,|\(female,/.test(note);
    if (!hasFlipPattern) {
      // Note mentions "male" or "female" as plain words. In female voice mode
      // voice.js will not flip them — could result in "polite + male" in
      // female voice. Flag for review.
      record('note-mentions-gender-without-flip-pattern', c);
    }
  }
}

// --- summary & output ---------------------------------------------------------

console.log('=== Thai Card Content Audit ===');
console.log(`Total cards: ${findings.total}`);
console.log('');
console.log('Findings by category:');
const sorted = Object.entries(findings.byCategory).sort((a, b) => b[1] - a[1]);
for (const [cat, count] of sorted) {
  console.log(`  ${count.toString().padStart(5)}  ${cat}`);
}
console.log(`Total issues: ${findings.issues.length}`);
console.log('');

fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
fs.writeFileSync(OUT_PATH, JSON.stringify(findings, null, 2));
console.log(`Wrote ${OUT_PATH}`);
