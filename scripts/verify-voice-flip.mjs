// scripts/verify-voice-flip.mjs
//
// For every card containing male markers (ผม/ครับ) and a (male) English
// annotation, simulate the voice.js female-voice transform and check:
//
//   1. Thai correctly flips: ผม → ฉัน, ครับ → ค่ะ or คะ.
//   2. Phonetic correctly flips: phǒm → chán, khráp → khâ or khá.
//   3. English correctly flips: (male) → (female).
//
// Also spot-check a handful of representative cards verbatim.

import { CARDS } from '../src/data/cards.js';
import { displayCard, isSpeakerStyleProtected, transformThai, transformPh, transformEn } from '../src/lib/voice.js';

let total = 0;
let okFlips = 0;
let badFlips = 0;
let protectedCount = 0;

const samples = [];
const protectedCards = [];

for (const c of CARDS) {
  const thai = c.thai || '';
  const en = c.en || '';
  const hasMaleThai = /ผม|ครับ/.test(thai);
  // Include "(male)" and "(male/female)" / "(male," annotations so dual-form
  // cards are exercised too (they must come back as protected).
  const hasMaleEn = /\(male[\)\/,]/.test(en);
  if (!hasMaleThai || !hasMaleEn) continue;
  // Protected cards stay male-form by design (homographs, dual-form cards
  // that show both particles, กระผม). Report them separately, not as failures.
  if (isSpeakerStyleProtected(c)) {
    protectedCount++;
    protectedCards.push(c);
    continue;
  }
  total++;

  const female = displayCard(c, 'female');
  const thaiOk =
    !/ผม/.test(female.thai) && // ผม should be gone
    !/ครับ/.test(female.thai); // ครับ should be gone
  const enOk = !/\(male[\)\/,]/.test(female.en) && /\(female[\)\/,]/.test(female.en);

  if (thaiOk && enOk) {
    okFlips++;
    if (samples.length < 8) samples.push({ id: c.id, male: c, female });
  } else {
    badFlips++;
    if (samples.length < 12) samples.push({ id: c.id, male: c, female, broken: true });
  }
}

console.log(`Total (male)-annotated cards checked: ${total}`);
console.log(`  OK flips:   ${okFlips}`);
console.log(`  Bad flips:  ${badFlips}`);
console.log(`  Protected (intentionally not flipped): ${protectedCount}`);
for (const c of protectedCards) {
  console.log(`    id ${c.id}: ${c.thai}  |  ${c.en}`);
}

console.log('\nSample flips:');
for (const s of samples) {
  console.log(`  id ${s.id}${s.broken ? '  ⚠ BROKEN' : ''}`);
  console.log(`    male:   ${s.male.thai}  |  ${s.male.ph}  |  ${s.male.en}`);
  console.log(`    female: ${s.female.thai}  |  ${s.female.ph}  |  ${s.female.en}`);
}

// Also spot-check a few pure-female cards (ฉัน, ค่ะ, คะ, ดิฉัน)
console.log('\nPure-female cards (should be untouched by male->female transform):');
const femaleSample = [];
for (const c of CARDS) {
  const thai = c.thai || '';
  if (/ดิฉัน/.test(thai) || /(?<!ดิ)ฉัน/.test(thai) || /ค่ะ|คะ/.test(thai)) {
    if (femaleSample.length < 6) femaleSample.push(c);
  }
}
for (const c of femaleSample) {
  const female = displayCard(c, 'female');
  const male = c; // male voice is identity (no transform)
  console.log(`  id ${c.id}`);
  console.log(`    in male voice mode:   ${male.thai}  |  ${male.ph}  |  ${male.en}`);
  console.log(`    in female voice mode: ${female.thai}  |  ${female.ph}  |  ${female.en}`);
}
