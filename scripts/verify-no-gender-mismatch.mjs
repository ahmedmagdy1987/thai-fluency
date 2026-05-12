// Detect cards where the Thai pronoun/particle and English annotation
// disagree (e.g., Thai has ผม but English says (female)).

import { CARDS } from '../src/data/cards.js';

const issues = [];
for (const c of CARDS) {
  const thai = c.thai || '';
  const en = c.en || '';
  const note = c.note || '';
  const both = en + ' ' + note;

  const hasMaleThai = /ผม|ครับ/.test(thai);
  const hasFemaleFormalThai = /ดิฉัน/.test(thai);
  const hasFemaleCasualThai = /(?<!ดิ)ฉัน|ค่ะ|คะ/.test(thai);

  const enSaysMale = /\(male\)|\(male,/.test(both);
  const enSaysFemale = /\(female\)|\(female,/.test(both);
  const enSaysMixed = /\(male\/female\)|\(male\s*\/\s*female\)/.test(both);

  // Pure male Thai with female-only English annotation
  if (hasMaleThai && !hasFemaleFormalThai && !hasFemaleCasualThai && enSaysFemale && !enSaysMale && !enSaysMixed) {
    issues.push({ kind: 'male-thai-female-en', id: c.id, thai, en });
  }
  // Pure female Thai with male-only English annotation
  if (!hasMaleThai && (hasFemaleFormalThai || hasFemaleCasualThai) && enSaysMale && !enSaysFemale && !enSaysMixed) {
    issues.push({ kind: 'female-thai-male-en', id: c.id, thai, en });
  }
}

console.log(`Cards with Thai/English gender mismatch: ${issues.length}`);
for (const i of issues) {
  console.log(`  ${i.kind}: id ${i.id}  thai="${i.thai}"  en="${i.en}"`);
}

// Also: how many ดิฉัน cards exist; show whether they use (female, formal) or (female).
console.log('\nAll ดิฉัน cards:');
for (const c of CARDS) {
  if (/ดิฉัน/.test(c.thai || '')) {
    console.log(`  id ${c.id}  thai="${c.thai}"  en="${c.en}"`);
  }
}
