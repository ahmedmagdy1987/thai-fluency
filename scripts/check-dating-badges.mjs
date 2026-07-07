// Regression guard for the Dating & Real Talk badge + gating policy.
//
// OWNER POLICY (2026-07-07): badges must NEVER be removed from this section.
// The Super gate hides PHRASES (Thai script, phonetics, answers, explanations)
// from locked users — never the badges. Locked users must still see the
// teaser/category/status badges (18+, Super, severity, register, native-review
// status), all English-only; Super users get the full interactive mode with
// badges on category cards, question cards, answers, and explanation panels.
// Inside the quiz, badges that literally state the answer (tone/usage chips on
// a tone-check or judgement question) stay hidden until reveal — that is
// answer-hygiene, not badge removal, and the full set must appear on reveal.
//
// This script statically asserts (a) the badge surfaces exist on every screen
// of the interactive flow, (b) the locked teaser leaks no Thai and no phrase
// data, (c) the 18+ gate exists for Super users, (d) the quiz flow has the
// required category/question/reveal/next/completion states with a frozen
// current question, and (e) the mode has no reward/XP path to farm.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { DATING_CATEGORIES, DATING_SECTION } from '../src/data/datingContent.js';
import { DATING_PHRASES } from '../src/data/datingPhrases.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
let failures = 0;
const ok = (name) => console.log(`OK   ${name}`);
const fail = (name, detail) => { console.log(`FAIL ${name}  ${detail}`); failures++; };
const assert = (name, cond, detail = '') => (cond ? ok(name) : fail(name, detail));

const src = readFileSync(join(root, 'src/components/DatingSection.jsx'), 'utf8');

// ---- 1. Split the component into its screens ----------------------------------
const lockedStart = src.indexOf('if (!superUser)');
const ageGateStart = src.indexOf('if (!adultConfirmed)');
const categoriesStart = src.indexOf('if (!quiz)');
const summaryStart = src.indexOf('if (quiz.finished)');
const questionStart = src.indexOf('INTERACTIVE MODE: question card');
assert('screens exist in order: locked → age gate → categories → summary → question',
  lockedStart > 0 && ageGateStart > lockedStart && categoriesStart > ageGateStart
  && summaryStart > categoriesStart && questionStart > summaryStart);
const heroAndShared = src.slice(0, lockedStart);
const locked = src.slice(lockedStart, ageGateStart);
const ageGate = src.slice(ageGateStart, categoriesStart);
const categories = src.slice(categoriesStart, summaryStart);
const summary = src.slice(summaryStart, questionStart);
const question = src.slice(questionStart);

// ---- 2. Hero badges (visible to EVERYONE, locked or not) -----------------------
assert('hero: 18+ badge', heroAndShared.includes('dating-badge-18'));
assert('hero: mature-language badge', heroAndShared.includes('dating-badge-mature'));
assert('hero: Super badge', heroAndShared.includes('dating-badge-super'));
assert('hero: review-status badge is NOT gated on superUser',
  /DATING_REVIEW_COMPLETE\s*\?/.test(heroAndShared) && !/superUser\s*&&[^\n]*dating-badge-draft/.test(heroAndShared),
  'review status is safe metadata and must show for locked users too');

// ---- 3. Locked teaser: status badges WITHOUT content leakage --------------------
assert('locked: Super + 18+ badges on the locked card',
  locked.includes('locked-premium-badge-super') && locked.includes('18+'));
assert('locked: per-category severity chips', locked.includes('dating-cat-sev'));
assert('locked: per-category status badge row', locked.includes('dating-teaser-item-badges'));
assert('locked: per-category review-status chip', locked.includes('reviewBadge(cat.reviewStatus)'));
assert('locked: register chip where flagged', locked.includes('CATEGORY_REGISTER[cat.id]'));
assert('locked: handle-with-care warning preserved', locked.includes('dating-teaser-care'));
assert('locked: Go Super CTA', locked.includes('locked-premium-cta'));
// Leak guards: the locked branch must never touch phrase/question data or render Thai.
assert('locked: does not render phrases, options, or answers',
  !/\bq\.|\bp\.thai\b|\.options\b|correctOptionId|explanation/.test(locked));
assert('locked: no Thai script in the locked JSX', !/[฀-๿]/.test(locked));
assert('locked: no Thai script in datingContent.js (teaser data source)',
  !/[฀-๿]/.test(readFileSync(join(root, 'src/data/datingContent.js'), 'utf8')));
assert('locked: no Thai script in datingQuestions.js (question bank)',
  !/[฀-๿]/.test(readFileSync(join(root, 'src/data/datingQuestions.js'), 'utf8')));

// ---- 4. 18+ age gate for Super users --------------------------------------------
assert('age gate: exists for Super users before content', ageGate.includes('dating-confirm-card'));
assert('age gate: shows 18+ and mature badges',
  ageGate.includes('dating-badge-18') && ageGate.includes('dating-badge-mature'));
assert('age gate: confirmation persists device-locally',
  ageGate.includes('saveAdultConfirmed()') && heroAndShared.includes('loadAdultConfirmed()'));
assert('age gate: has a back/exit path', ageGate.includes('Not now'));
assert('age gate: no Thai phrases shown', !/\bq\.|phrase\.thai|DATING_PHRASES/.test(ageGate));

// ---- 5. Category selector: badges on category cards -----------------------------
assert('categories: badge row on cards', categories.includes('dating-catcard-badges'));
assert('categories: severity chip', categories.includes('SEVERITY_LABEL[cat.severity]'));
assert('categories: register chip where flagged', categories.includes('CATEGORY_REGISTER[cat.id]'));
assert('categories: review-status chip', categories.includes('reviewBadge(cat.reviewStatus)'));
assert('categories: question-count chip', categories.includes('dating-chip-count'));
assert('categories: completion chip', categories.includes('dating-chip-done'));
assert('categories: draft banner + educational note',
  categories.includes('dating-draft-banner') && categories.includes('Educational and context-only'));

// ---- 6. Question card: badges + frozen state + reveal flow ----------------------
assert('question: type badge', question.includes('dating-chip-qtype'));
assert('question: review-status badge always on the card', question.includes('reviewBadge(q.nativeReviewStatus)'));
assert('question: subject badges (tone/usage/register/speaker) rendered', question.includes('subjectBadges'));
assert('question: answer-leaking badges gated until reveal',
  src.includes('badgesLeakAnswer(q.questionType) || revealed'));
// Answer-hygiene coverage: tone/severity/usage/judgement questions must not
// show the answer via ANY badge before reveal — including the top-bar category
// severity chip — and the full badge set must RETURN after reveal. Suppressed
// chips are replaced with the neutral placeholder, never removed.
assert('leak fix: top-bar category severity chip gated on leaking questions',
  src.includes('hideCatSeverity = badgesLeakAnswer(q.questionType) && !revealed'));
assert('leak fix: gated top-bar chip is REPLACED by the neutral placeholder (not removed)',
  /hideCatSeverity \? \(\s*<span className="dating-chip dating-chip-neutral">\{ANSWER_AFTER_REVEAL_LABEL\}/.test(src));
assert('leak fix: suppressed subject badges are REPLACED by the neutral placeholder (not removed)',
  /showSubjectBadges \? subjectBadges : \(\s*<span className="dating-chip dating-chip-neutral">\{ANSWER_AFTER_REVEAL_LABEL\}/.test(src));
assert('leak fix: full badges return after reveal (both gates depend on revealed)',
  src.includes('!badgesLeakAnswer(q.questionType) || revealed') && src.includes('&& !revealed'));
assert('leak fix: neutral placeholder label comes from the shared engine constant',
  src.includes('ANSWER_AFTER_REVEAL_LABEL'));
assert('question: subject phrase shown via the shared direction rule',
  src.includes('promptShowsPhrase(q.questionType)'));
// Direction rule: Thai→English recognition. Options render English text only;
// the Thai-option rendering path must not exist in the component.
assert('direction: options render English text only (no Thai option path)',
  question.includes('dating-option-text') && !src.includes('opt.phrase') && !src.includes('dating-option-thai'));
assert('direction: literal gloss surfaced on the explanation panel', question.includes('dating-explain-literal'));
assert('question: options disabled after reveal', question.includes('disabled={revealed}'));
assert('question: explicit submit state', question.includes('Check answer'));
assert('question: correct/incorrect feedback', question.includes('dating-reveal-correct') && question.includes('dating-reveal-wrong'));
assert('question: explanation panel with badges', question.includes('dating-explain') && question.includes('subjectBadges'));
assert('question: context label preserved', question.includes('dating-note-label'));
assert('question: warning line for strong severity', question.includes('dating-phrase-care'));
assert('question: next/finish progression', question.includes('Next question') && question.includes('Finish'));
assert('question: progress indicator', question.includes('dating-quiz-progress') && question.includes('quiz.index + 1'));
assert('summary: completion state with badges',
  summary.includes('dating-summary-card') && summary.includes('reviewBadge(cat.reviewStatus)'));
assert('flow: frozen current question (options shuffled once, never re-derived)',
  src.includes('const [current, setCurrent]') && src.includes('shuffleIds(resolved.options.map'));
assert('flow: leaving mid-question discards unrevealed (no leak)', src.includes('exitToCategories'));

// ---- 7. No reward/XP farming path ------------------------------------------------
assert('no XP/reward imports in the dating mode',
  !/serverRewards|awardXp|grantXp|awardReward|rewardKeys/.test(src),
  'dating quiz must not touch reward paths');

// ---- 8. Data invariants the badges depend on --------------------------------------
assert('section is marked 18+ / mature', DATING_SECTION.minAge === 18 && DATING_SECTION.matureLanguage === true);
assert('every phrase has severity + reviewStatus',
  DATING_PHRASES.every((p) => p.severity && p.reviewStatus));
assert('every category has severity + reviewStatus',
  DATING_CATEGORIES.every((c) => c.severity && c.reviewStatus));
assert('recognition-only category is flagged handleWithCare',
  DATING_CATEGORIES.filter((c) => c.id === 'mild-swears-insults').every((c) => c.handleWithCare === true));

console.log('');
if (failures > 0) {
  console.log(`Dating badge check FAILED (${failures} failure(s)).`);
  process.exit(1);
}
console.log('Dating badge check passed.');
