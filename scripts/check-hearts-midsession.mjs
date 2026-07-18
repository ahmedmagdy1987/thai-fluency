// Mid-session hearts gate guard (Wave 10, pinning the Wave 8 fix).
//
// check-economy.mjs asserts the START-time block (a graded run can't begin at
// 0 hearts) and that the gate UI exists — but not the MID-SESSION behavior the
// Wave 8 fix shipped: the gate is session-WIDE (gateEligible = !isSuper), a
// free user who reaches 0 hearts is stopped before the next unanswered
// question renders, and nothing about the run is reset so a refill (regen
// tick, gem refill, ad) resumes at the SAME question with the score intact.
// This validator pins that exact branch so it can't silently regress:
//
//   if (outOfHearts && !checked) {
//     return ( ... renderHeartsGate({ at: idx + 1, total: questions.length, score }) ... );
//   }

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const quiz = readFileSync(join(root, 'src/components/QuizTab.jsx'), 'utf8');

let failures = 0;
const ok = (n) => console.log(`OK   ${n}`);
const fail = (n, d = '') => { console.log(`FAIL ${n}  ${d}`); failures++; };
const assert = (n, c, d) => (c ? ok(n) : fail(n, d));

// The gate must be session-wide: eligibility from the tier only, never from
// the question type/direction.
assert('gate eligibility is session-wide (gateEligible = !isSuper)',
  /const gateEligible = !isSuper;/.test(quiz),
  'gateEligible must depend only on isSuper');
assert('outOfHearts derives from gateEligible + live hearts',
  /const outOfHearts = gateEligible && hearts(?:Live)? <= 0;/.test(quiz));

// The mid-session branch itself.
const midGate = quiz.match(/if \(outOfHearts && !checked\) \{([\s\S]{0,400}?)\n  \}/);
assert('a mid-session out-of-hearts branch exists and renders the gate with position',
  !!midGate && /renderHeartsGate\(\{ at: idx \+ 1, total: questions\.length/.test(midGate[1]),
  'QuizTab must early-return the hearts gate when outOfHearts && !checked');

// It must sit BEFORE the question render, so the next question is unreachable
// at 0 hearts (position proxy: the branch precedes the QUESTION_TYPES lookup
// that the question render starts with).
assert('the mid-session gate sits BEFORE the question render',
  quiz.indexOf('if (outOfHearts && !checked)') !== -1
  && quiz.indexOf('const typeConfig = QUESTION_TYPES[type]') !== -1
  && quiz.indexOf('if (outOfHearts && !checked)') < quiz.indexOf('const typeConfig = QUESTION_TYPES[type]'),
  'the gate branch must precede the question render');

// The pause must preserve the run: the branch may render, never reset.
assert('the mid-session gate resets NOTHING (a refill resumes the same question)',
  !!midGate && !/resetQuiz|setQuestions|setIdx|setScore/.test(midGate[1]),
  'the gate branch must not clear the run state');

// The `!checked` nuance is deliberate (the just-answered, already-paid-for
// question may finish its feedback) — pin that it is `!checked`, not a
// stricter condition that would eat the paid answer's feedback.
assert('the gate defers to the current answered question\'s feedback (`!checked`)',
  /outOfHearts && !checked/.test(quiz));

console.log('');
if (failures > 0) {
  console.log(`Mid-session hearts gate check FAILED (${failures} failure(s)).`);
  process.exit(1);
}
console.log('Mid-session hearts gate check passed (session-wide gate, stops before the next question, resumes in place).');
