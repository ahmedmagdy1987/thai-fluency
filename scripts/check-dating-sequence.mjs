// Regression guard for the Dating & Real Talk LESSON→QUIZ sequence.
//
// The pedagogy audit's core finding was a TEST WITHOUT A LESSON in Dating: it
// dropped learners straight into a graded quiz on phrases it had never taught.
// The fix adds an ungraded LESSON (English meaning first, then the Thai) before
// each category's quiz and GATES the quiz behind completing that lesson once.
// This validator proves the sequence stays intact — it complements
// check-dating-quiz.mjs (question direction/quality) and check-dating-badges.mjs
// (badge/gate policy) and asserts:
//   • every category that has a quiz also has phrases to teach (a lesson exists);
//   • the component renders an ungraded LESSON phase and a lesson→quiz hand-off;
//   • the quiz is GATED behind lesson completion (startCategoryQuiz checks it,
//     the category card shows a locked state + a start-lesson button);
//   • lesson completion is PERSISTED via the shared storage pattern (its own
//     device-local key, not a DB table / migration / server reward);
//   • the lesson is UNGRADED — no scoring / hearts / XP / reward / grade path is
//     reachable from the lesson render branch or its handlers;
//   • the lesson presents the ENGLISH meaning BEFORE the Thai phrase.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { DATING_QUESTIONS } from '../src/data/datingQuestions.js';
import { DATING_PHRASES } from '../src/data/datingPhrases.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
let failures = 0;
const ok = (name) => console.log(`OK   ${name}`);
const fail = (name, detail) => { console.log(`FAIL ${name}  ${detail}`); failures++; };
const assert = (name, cond, detail = '') => (cond ? ok(name) : fail(name, detail));

const section = readFileSync(join(root, 'src/components/DatingSection.jsx'), 'utf8');
const storage = readFileSync(join(root, 'src/lib/storage.js'), 'utf8');

// ---- 1. Data: every quizzed category has phrases to teach (a lesson exists) ----
const catsWithQuestions = new Set(DATING_QUESTIONS.map((q) => q.cat));
const catsWithPhrases = new Set(DATING_PHRASES.map((p) => p.cat));
const missingLesson = [...catsWithQuestions].filter((c) => !catsWithPhrases.has(c));
assert(`every category with a quiz has phrases to teach (${catsWithQuestions.size} categories)`,
  missingLesson.length === 0, `no lesson content for: ${missingLesson.join(', ')}`);
assert('every category with phrases has at least one phrase for the lesson',
  [...catsWithPhrases].every((c) => DATING_PHRASES.filter((p) => p.cat === c).length >= 1));

// ---- 2. The component renders an ungraded LESSON phase + hand-off --------------
assert('lesson render branch exists (quiz.phase === "lesson")',
  section.includes("quiz.phase === 'lesson'"));
assert('lesson walks phrases one at a time from the phrase bank (phrasesByCat)',
  section.includes('phrasesByCat') && section.includes('startCategoryLesson'));
assert('lesson has a visible progress indicator ("N of N")',
  /\{quiz\.li \+ 1\} of \{phrases\.length\}/.test(section));
assert('lesson completion hands off to the quiz (lesson-done phase + start-quiz CTA)',
  section.includes("quiz.phase === 'lesson-done'") && /Start the quiz|start the quiz/i.test(section));
assert('lesson can be replayed at will (Review lesson affordance)',
  /Review lesson|Review the lesson/.test(section) && section.includes('startCategoryLesson'));

// ---- 3. Quiz is GATED behind lesson completion --------------------------------
assert('startCategoryQuiz refuses to enter the quiz until the lesson is done',
  /const startCategoryQuiz[\s\S]{0,400}if \(!lessonDone\(cat\.id\)\) \{ startCategoryLesson\(cat\); return; \}/.test(section));
assert('category card shows a LOCKED quiz state until the lesson is done',
  section.includes('dating-catcard-locked') && /Quiz locked/i.test(section));
assert('locked state says HOW to unlock (a Start-lesson button, never a dead end)',
  /dating-catcard-start[\s\S]{0,120}startCategoryLesson/.test(section) && /Start lesson/i.test(section));
assert('completed categories can jump straight to the quiz',
  /dating-catcard-start[\s\S]{0,120}startCategoryQuiz/.test(section));

// ---- 4. Lesson completion PERSISTED via the shared storage pattern -------------
assert('component loads + saves per-category lesson completion',
  section.includes('loadDatingLessonsDone') && section.includes('saveDatingLessonDone'));
assert('storage uses its OWN device-local key (not the synced main state blob)',
  storage.includes("DATING_LESSONS_KEY = 'thai-fluency-dating-lessons-v1'")
  && storage.includes('export function loadDatingLessonsDone')
  && storage.includes('export function saveDatingLessonDone'));
assert('no DB table / migration / server reward introduced for lessons',
  !/supabase|migration|createTable|serverReward|awardXp|edge function/i.test(storage.slice(storage.indexOf('DATING_LESSONS_KEY'))));

// ---- 5. The LESSON is UNGRADED -------------------------------------------------
// Slice the lesson render branch and assert it carries no scoring/reward/grade.
const lessonStart = section.indexOf("if (quiz.phase === 'lesson') {");
const lessonEnd = section.indexOf("if (quiz.phase === 'lesson-done') {");
assert('lesson render branch is locatable for the ungraded check', lessonStart > 0 && lessonEnd > lessonStart);
const lessonBranch = section.slice(lessonStart, lessonEnd);
// Target scoring/reward CODE tokens (calls, state, class names) — not the words
// "score/hearts/XP" that legitimately appear in the ungraded-disclaimer copy.
assert('lesson branch has no scoring/grade/correctness code',
  !/gradeAnswer\(|dating-reveal-correct|dating-reveal-wrong|isCorrect|setScore|setSelected|setRevealed|correctOptionId/.test(lessonBranch),
  'the lesson must never score or mark answers');
assert('lesson branch has no XP / hearts / reward code path',
  !/serverRewards|awardXp|grantXp|awardReward|rewardKeys|setHearts|spendHeart|addXp|regenHearts/.test(lessonBranch));
assert('lesson hint tells the learner it does not affect XP/hearts/streak/progress',
  /never affects your XP, hearts, streak, or course progress|Studying only/i.test(lessonBranch));

// ---- 6. Lesson presents ENGLISH meaning BEFORE the Thai phrase -----------------
const enIdx = lessonBranch.indexOf('dating-lesson-en');
const revealIdx = lessonBranch.indexOf('dating-lesson-reveal');
const thaiBlockIdx = lessonBranch.indexOf('dating-lesson-thai-block');
assert('lesson shows the English meaning element (dating-lesson-en)', enIdx > 0);
assert('lesson gates the Thai behind a reveal (dating-lesson-thai-block under !lrev)',
  thaiBlockIdx > 0 && lessonBranch.includes('!lrev ?'));
assert('English meaning renders BEFORE the reveal and BEFORE the Thai block',
  enIdx > 0 && revealIdx > enIdx && thaiBlockIdx > enIdx,
  'the learner must see the English meaning first, then reveal the Thai');
const studyLabelIdx = lessonBranch.indexOf('dating-lesson-studylabel');
assert('lesson leads each card with a study label above the English meaning',
  studyLabelIdx > 0 && studyLabelIdx < enIdx);

console.log('');
if (failures > 0) {
  console.log(`Dating sequence check FAILED (${failures} failure(s)).`);
  process.exit(1);
}
console.log('Dating sequence check passed (lesson precedes and gates every category quiz; lesson is ungraded, English-first).');
