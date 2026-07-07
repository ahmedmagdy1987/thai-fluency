// Generates docs/dating-native-review-pack.md — the complete native-speaker
// review pack for the Dating & Real Talk 18+ section. Regenerate after any
// content change: node scripts/write-dating-review-pack.mjs
//
// Everything in the pack is DRAFT/PENDING. Statuses in the data files may only
// flip to 'approved' after this pack comes back from a native reviewer — never
// claim approval without that proof.

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { DATING_PHRASES } from '../src/data/datingPhrases.js';
import { DATING_CATEGORIES, DATING_SECTION, DATING_REVIEW_COMPLETE } from '../src/data/datingContent.js';
import { DATING_QUESTIONS } from '../src/data/datingQuestions.js';
import { SEVERITY_LABEL, USAGE_GUIDANCE, CATEGORY_REGISTER, isMaleForm } from '../src/lib/datingQuiz.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

// Open flags from the 2026-07-07 internal content-QA pass that need a native
// speaker's call (phonetics, Thai wording, severity decisions). Keyed by
// phrase id; rendered inline on the phrase card and in the summary section.
const QA_FLAGS = {
  90009: ['Context note wording is ambiguous — "For a man complimenting, หล่อ (làw) = handsome" can be read backwards. Please confirm intended reading: หล่อ compliments a MAN, สวย compliments a WOMAN — and suggest clearer note wording.'],
  90010: ['Example phonetics: หัวเราะ is romanized "hǔa-rawh" (mid tone on the final syllable) — should เราะ be high tone, i.e. "hǔa-ráwh"? Please confirm the correct tone marks.'],
  90012: ['Same phonetics question as 90010 for "hǔa-rawh" in the example.', 'Thai wording: in the unspaced "คุณตายิ้มสวยนะครับ" the opening คุณตา can parse as "maternal grandfather" ("Grandpa smiles beautifully"). Is the sentence natural as written, or should it be reworded (e.g. possessor after ตา)?'],
  90013: ['Romanization consistency: ดี is written "dee" here ("jai dee") but "dii" everywhere else in the pack (duu dii, dii mǎi). Please pick one spelling — the app will standardize the pack to your choice.'],
  90042: ['Severity call needed: the phrase stacks the ขอ + หน่อย softeners the pack elsewhere labels Gentle, but it is currently marked moderate/Casual (this keys the tone-question answer dq-argue-3). Which register is right?'],
  90046: ['Classifier check: is "khǎw bia sǎwng thîi" natural for ordering beer? ที่ usually counts food portions/seats — should beer be ขวด (khùat, bottle) or แก้ว (gâew, glass)? The note also teaches the ที่-counts-servings pattern; both would need your correction.'],
  90052: ['The note ends "Casual, friendly, safe." but the phrase is marked moderate (renders a "Use carefully" badge). Either the note should teach a register limit (e.g. "too slangy for formal settings") or the severity should drop to gentle — your call.'],
  90059: ['Tier check: เชี่ย is a euphemized form of a strong swear. Does it belong in the "mild" recognition tier at all, and is the (updated) "rough slang exclamation" gloss right?'],
  90060: ['Tier check: ปัญญาอ่อน literally "weak intellect" is historically the term for intellectual disability — person-directed use is an ableist insult. Please confirm it stays within this pack\'s no-slur boundary or should be replaced.'],
};

const questionsByPhrase = new Map();
for (const q of DATING_QUESTIONS) {
  if (!questionsByPhrase.has(q.phraseId)) questionsByPhrase.set(q.phraseId, []);
  questionsByPhrase.get(q.phraseId).push(q);
}

const catById = new Map(DATING_CATEGORIES.map((c) => [c.id, c]));
const byCat = new Map();
for (const p of DATING_PHRASES) {
  if (!byCat.has(p.cat)) byCat.set(p.cat, []);
  byCat.get(p.cat).push(p);
}

const today = new Date().toISOString().slice(0, 10);
const lines = [];
const push = (s = '') => lines.push(s);

push('# Dating & Real Talk Thai — Native Review Pack');
push('');
push(`**Generated:** ${today} · regenerate with \`node scripts/write-dating-review-pack.mjs\``);
push(`**Scope:** all ${DATING_PHRASES.length} draft phrases + ${DATING_QUESTIONS.length} linked quiz questions of the 18+ Super section.`);
push(`**Status:** ${DATING_REVIEW_COMPLETE ? 'REVIEW COMPLETE' : 'EVERY ITEM IS DRAFT — reviewStatus: pending'}. Nothing may be marked approved in the app until this pack is returned by a native Thai reviewer and the statuses in \`src/data/datingPhrases.js\` are updated from it.`);
push('');
push('## How to review');
push('');
push('For each phrase, please check:');
push('');
push('1. **Accuracy** — is the Thai correct and natural for the stated English meaning?');
push('2. **Naturalness** — would a Thai adult actually say this, in this form, today?');
push('3. **Romanization & tones** — do the phonetics (marks: à low · á high · â falling · ǎ rising · none mid) match?');
push('4. **Tone/severity label** — the app maps severity → learner guidance (gentle → “Safe to use”, moderate → “Use carefully”, strong → recognition-only, safety → consent/safety language). Is the label right?');
push('5. **Gender/particles** — phrases ship male-polite form (ผม / ครับ); the app tells female speakers to swap (ค่ะ / ฉัน). Is that swap valid here?');
push('6. **Culture/safety framing** — is the context note fair, and are warnings adequate for anything rude or risky?');
push('');
push('Fill the verdict line under each phrase: check ONE box, and use the notes line for corrections (corrected Thai/phonetics welcome).');
push('');
const flaggedIds = Object.keys(QA_FLAGS);
push(`## Priority items (${flaggedIds.length} phrases carry ⚠ QA flags)`);
push('');
push('An internal QA pass raised specific questions on these phrases — please start here: ' + flaggedIds.map((id) => `**${id}**`).join(', ') + '. Each flag appears under its phrase below.');
push('');
push('---');
push('');

let idx = 0;
for (const cat of DATING_CATEGORIES) {
  const phrases = byCat.get(cat.id);
  if (!phrases || phrases.length === 0) continue;
  const register = CATEGORY_REGISTER[cat.id];
  push(`## ${cat.name}`);
  push('');
  push(`> ${cat.blurb}`);
  push(`> Category severity: **${SEVERITY_LABEL[cat.severity]}**${register ? ` · Register: **${register.label}**` : ''}${cat.handleWithCare ? ' · **Recognition only — understand it, mostly don’t use it.**' : ''}`);
  push('');
  for (const p of phrases) {
    idx += 1;
    const qs = questionsByPhrase.get(p.id) || [];
    const literals = [...new Set(qs.map((q) => q.literal).filter(Boolean))];
    const warnings = [...new Set(qs.map((q) => q.warning).filter(Boolean))];
    push(`### ${idx}. Phrase ${p.id}`);
    push('');
    push('| Field | Value |');
    push('| --- | --- |');
    push(`| Thai | ${p.thai} |`);
    push(`| Phonetic | ${p.ph} |`);
    push(`| English | ${p.en} |`);
    if (literals.length) push(`| Literal | ${literals.join(' · ')} |`);
    push(`| Tone label | ${SEVERITY_LABEL[p.severity]} |`);
    push(`| Severity | ${p.severity} |`);
    push(`| Usage guidance | ${USAGE_GUIDANCE[p.severity].label} |`);
    push(`| Category | ${cat.name} (${p.cat}) |`);
    if (p.note) push(`| Context note | ${p.note} |`);
    if (p.example) push(`| Example | ${p.example.thai} — ${p.example.ph} — ${p.example.en} |`);
    if (warnings.length) push(`| Warning shown | ${warnings.join(' · ')} |`);
    push(`| Speaker note | ${isMaleForm(p) ? 'Male-polite form (ผม / ครับ); female speakers swap to ค่ะ / ฉัน' : 'Particle-neutral as written'} |`);
    push(`| Linked questions | ${qs.length ? qs.map((q) => `${q.id} (${q.questionType})`).join(', ') : '(none yet)'} |`);
    push(`| Review status | ${p.reviewStatus || 'pending'} |`);
    push('');
    for (const flag of QA_FLAGS[p.id] || []) {
      push(`> ⚠ **QA flag for reviewer:** ${flag}`);
      push('');
    }
    push('**Native reviewer verdict:**  ☐ Approve as-is  ·  ☐ Change (write correction below)  ·  ☐ Reject (explain below)');
    push('');
    push('> Notes / corrected Thai / corrected phonetics: ____________________________________________');
    push('');
  }
  push('---');
  push('');
}

push('## Reviewer sign-off');
push('');
push('| Field | Value |');
push('| --- | --- |');
push('| Reviewer name | ____________________ |');
push('| Native speaker of Thai | ☐ yes · ☐ no |');
push('| Date reviewed | ____________________ |');
push('| Overall verdict | ☐ all approved · ☐ approved with the changes noted above · ☐ needs a second pass |');
push('');
push('After this pack is returned: apply corrections to `src/data/datingPhrases.js`, flip each item’s `reviewStatus` per the verdicts, set `DATING_REVIEW_COMPLETE = true` in `src/data/datingContent.js` only when EVERY item is approved, and rerun `node scripts/check-dating-quiz.mjs && node scripts/check-dating-badges.mjs`.');
push('');

writeFileSync(join(root, 'docs/dating-native-review-pack.md'), lines.join('\n'));
console.log(`Wrote docs/dating-native-review-pack.md — ${idx} phrases, ${DATING_QUESTIONS.length} linked questions.`);
