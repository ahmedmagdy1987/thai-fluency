// Distractor-quality guard for the Dating & Real Talk quiz.
//
// The pedagogy audit found ~60% of questions trivially eliminable WITHOUT any
// Thai, via shape tells. This validator fails the build on the tells that are
// MECHANICALLY checkable, so they can't silently creep back into the bank:
//   (a) LENGTH TELL   — the correct option is conspicuously the longest.
//   (b) HEDGE TELL    — the correct option is the ONLY hedged/qualified one.
//   (c) ABSOLUTIST    — every distractor leans on an absolutist giveaway
//                       ("never/always/only/…") while the correct one doesn't,
//                       so a test-taker just picks the balanced option.
//
// Tone questions are EXEMPT from (a)-(c): their four options are the fixed
// severity labels {Gentle, Casual, Handle with care, Safety} enforced by
// check-dating-quiz.mjs — length/hedge/absolutist don't apply. (The tone
// TAXONOMY leak — the selection-screen severity badge — is handled in the UI
// and guarded by check-dating-badges.mjs, not here.)
//
// The subtler "odd-one-out / only-reasonable-option" and "prompt-telegraph"
// tells are semantic, not mechanically checkable; they were closed by an
// adversarial rewrite+verify pass (see docs/pedagogy-audit.md Remediation) and
// aren't asserted here — this guard is the mechanical floor, not the ceiling.

import { DATING_QUESTIONS } from '../src/data/datingQuestions.js';

let failures = 0;
const ok = (name) => console.log(`OK   ${name}`);
const fail = (name, detail) => { console.log(`FAIL ${name}  ${detail}`); failures++; };

// Correct option may be at most this many chars longer than the longest
// distractor. Beyond this, length alone identifies the answer.
const LENGTH_MARGIN = 12;

const HEDGE = /\b(thoughtful(ly)?|usually|often|can|could|might|may|generally|typically|depends|sometimes|somewhat|a bit|mostly|tends? to|either way|be ready|be prepared|when|if|after|once|carefully|gently|politely)\b/i;
const ABSOLUTE = /\b(never|always|only|ever|any(one|thing|body)?|every(one|body|thing)?|no ?one|nobody|must|all|impossible|strictly|forbidden|insulting)\b/i;

const lenTells = [], hedgeTells = [], absTells = [];

for (const q of DATING_QUESTIONS) {
  if (q.questionType === 'tone') continue; // fixed severity-label options
  const correct = q.options.find((o) => o.id === q.correctOptionId);
  const distractors = q.options.filter((o) => o.id !== q.correctOptionId);
  if (!correct || distractors.length === 0) continue;

  const cl = correct.text.length;
  const maxD = Math.max(...distractors.map((o) => o.text.length));
  if (cl > maxD + LENGTH_MARGIN) lenTells.push(`${q.id} (correct ${cl}c vs longest distractor ${maxD}c, +${cl - maxD})`);

  const correctHedged = HEDGE.test(correct.text);
  const anyDistractorHedged = distractors.some((o) => HEDGE.test(o.text));
  if (correctHedged && !anyDistractorHedged) hedgeTells.push(`${q.id} (correct hedged; no distractor hedged)`);

  const correctAbs = ABSOLUTE.test(correct.text);
  const allDistractorsAbs = distractors.every((o) => ABSOLUTE.test(o.text));
  if (allDistractorsAbs && !correctAbs) absTells.push(`${q.id} (all ${distractors.length} distractors absolutist; correct is not)`);
}

const scored = DATING_QUESTIONS.filter((q) => q.questionType !== 'tone').length;
if (lenTells.length === 0) ok(`no LENGTH tell — correct option is never >${LENGTH_MARGIN}c longer than its longest distractor (${scored} non-tone questions)`);
else fail(`LENGTH tell in ${lenTells.length} question(s)`, lenTells.join(' | '));

if (hedgeTells.length === 0) ok('no HEDGE tell — correct option is never the only hedged option');
else fail(`HEDGE tell in ${hedgeTells.length} question(s)`, hedgeTells.join(' | '));

if (absTells.length === 0) ok('no ABSOLUTIST tell — distractors are never all absolutist while the correct one is balanced');
else fail(`ABSOLUTIST tell in ${absTells.length} question(s)`, absTells.join(' | '));

// Sanity: exactly one correct option per question, and every option has text.
let structural = 0;
for (const q of DATING_QUESTIONS) {
  const correctCount = q.options.filter((o) => o.id === q.correctOptionId).length;
  if (correctCount !== 1) structural++;
  if (q.options.some((o) => !o.text || !o.text.trim())) structural++;
}
if (structural === 0) ok('every question has exactly one correct option and no empty option text');
else fail('structural option issue', `${structural} problem(s)`);

console.log('');
if (failures > 0) {
  console.log(`Dating distractor-quality check FAILED (${failures} failure(s)).`);
  process.exit(1);
}
console.log(`Dating distractor-quality check passed (${scored} non-tone questions clear of length/hedge/absolutist tells).`);
