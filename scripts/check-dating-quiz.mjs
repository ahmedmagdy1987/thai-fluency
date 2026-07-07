// Validation for the interactive Dating & Real Talk question bank + engine.
//
// Proves, on every run:
//   • every question has a unique id, a real category, a known questionType,
//     a prompt, an explanation, and >= 2 options with EXACTLY one correct;
//   • every phrase reference resolves into datingPhrases.js and the subject
//     phrase belongs to the question's category;
//   • tone questions use only severity labels and their answer matches the
//     subject phrase's severity; response/safest questions use phrase options
//     and their subject equals the correct option;
//   • strong-severity subjects carry a warning;
//   • the question bank file contains NO Thai script (Thai enters only via
//     phraseId into the reviewed-pending draft set — no new unreviewed Thai);
//   • every phrase-bearing category has >= 3 questions spanning >= 3 types;
//   • every question resolves through the same resolver the UI renders with,
//     and derived fields (tone/usage/review) are present;
//   • nativeReviewStatus is honest: while DATING_REVIEW_COMPLETE is false no
//     phrase may claim 'approved'.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
  QUESTION_TYPES, QUESTION_TYPE_LABEL, SEVERITY_LABEL, USAGE_GUIDANCE,
  promptShowsPhrase, badgesLeakAnswer, resolveQuestion, validateQuestion, gradeAnswer,
} from '../src/lib/datingQuiz.js';
import { DATING_QUESTIONS } from '../src/data/datingQuestions.js';
import { DATING_PHRASES } from '../src/data/datingPhrases.js';
import { DATING_CATEGORIES, DATING_REVIEW_COMPLETE } from '../src/data/datingContent.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
let failures = 0;
const ok = (name) => console.log(`OK   ${name}`);
const fail = (name, detail) => { console.log(`FAIL ${name}  ${detail}`); failures++; };
const assert = (name, cond, detail = '') => (cond ? ok(name) : fail(name, detail));

const phraseById = new Map(DATING_PHRASES.map((p) => [p.id, p]));
const categoryIds = new Set(DATING_CATEGORIES.map((c) => c.id));

// ---- 1. Structural validation of every question -------------------------------
const seen = new Set();
let structuralErrors = [];
for (const q of DATING_QUESTIONS) {
  if (seen.has(q.id)) structuralErrors.push(`duplicate id ${q.id}`);
  seen.add(q.id);
  structuralErrors = structuralErrors.concat(validateQuestion(q, phraseById, categoryIds));
}
assert(`all ${DATING_QUESTIONS.length} questions structurally valid (unique id, options, exactly one correct, category/tone/warning rules)`,
  structuralErrors.length === 0, structuralErrors.slice(0, 5).join(' | '));

// ---- 2. No Thai script in the question bank source ----------------------------
const bankSrc = readFileSync(join(root, 'src/data/datingQuestions.js'), 'utf8');
assert('question bank contains no Thai script (Thai only via phraseId)', !/[฀-๿]/.test(bankSrc));

// ---- 3. Category coverage ------------------------------------------------------
const byCat = new Map();
for (const q of DATING_QUESTIONS) {
  if (!byCat.has(q.cat)) byCat.set(q.cat, []);
  byCat.get(q.cat).push(q);
}
const catsWithPhrases = new Set(DATING_PHRASES.map((p) => p.cat));
for (const catId of catsWithPhrases) {
  const qs = byCat.get(catId) || [];
  const types = new Set(qs.map((q) => q.questionType));
  assert(`category ${catId}: >=3 questions (${qs.length}) spanning >=3 types (${types.size})`,
    qs.length >= 3 && types.size >= 3);
}

// ---- 4. Resolver round-trip (exactly what the UI renders) ----------------------
let resolveErrors = 0;
for (const q of DATING_QUESTIONS) {
  try {
    const r = resolveQuestion(q, phraseById);
    if (!r.phrase || !r.tone || !r.usageGuidance || !r.nativeReviewStatus) resolveErrors++;
  } catch {
    resolveErrors++;
  }
}
assert('every question resolves with derived tone/usage/review fields', resolveErrors === 0, `${resolveErrors} failed`);

// ---- 5. Engine unit checks ------------------------------------------------------
assert('question types registry matches the label map',
  QUESTION_TYPES.every((t) => QUESTION_TYPE_LABEL[t]));
assert('meaning/tone/scenario show the subject phrase',
  promptShowsPhrase('meaning') && promptShowsPhrase('tone') && promptShowsPhrase('scenario'));
assert('response/safest hide the subject phrase (options ARE the answer)',
  !promptShowsPhrase('response') && !promptShowsPhrase('safest'));
assert('tone/scenario/safest hide answer-leaking badges pre-reveal',
  badgesLeakAnswer('tone') && badgesLeakAnswer('scenario') && badgesLeakAnswer('safest'));
assert('meaning/response keep subject badges visible',
  !badgesLeakAnswer('meaning') && !badgesLeakAnswer('response'));
assert('gradeAnswer: correct id passes, others fail',
  gradeAnswer({ correctOptionId: 'b' }, 'b') === true && gradeAnswer({ correctOptionId: 'b' }, 'a') === false);
assert('severity labels cover the usage-guidance map',
  Object.keys(USAGE_GUIDANCE).every((s) => SEVERITY_LABEL[s]));

// ---- 6. Honest review status ----------------------------------------------------
assert('no phrase claims native approval while DATING_REVIEW_COMPLETE is false',
  DATING_REVIEW_COMPLETE || DATING_PHRASES.every((p) => p.reviewStatus !== 'approved'));
assert('every phrase carries a nativeReviewStatus', DATING_PHRASES.every((p) => !!p.reviewStatus));

console.log('');
if (failures > 0) {
  console.log(`Dating quiz check FAILED (${failures} failure(s)).`);
  process.exit(1);
}
console.log(`Dating quiz check passed (${DATING_QUESTIONS.length} questions across ${byCat.size} categories).`);
