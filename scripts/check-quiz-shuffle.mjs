// Regression guard for quiz randomization (B6). A retake must NOT serve the
// same questions in the same order with the same option order — otherwise the
// learner memorizes "the answer was #4" by position instead of understanding.
//
// This statically asserts that every REPEATABLE quiz shuffles BOTH the question
// order and the option order per attempt:
//   • Stage Challenge      — src/lib/challengeQuestions.js
//   • Dating quiz          — src/components/DatingSection.jsx
//   • Tone Challenge       — src/components/TonesQuizSection.jsx
//   • Mini-Unit challenge  — src/components/MiniUnitFlow.jsx (replayable from LearnPath)
//   • First-lesson challenge — src/components/FirstLessonFlow.jsx (onboarding)
// It FAILS if any of these serves a FIXED question or option order (e.g. a
// deterministic index-based rotateOptions) — that is exactly how the repeatable
// MiniUnitFlow gap slipped through before.
// Correctness is always tracked by a flag/id, never by index (also asserted
// where checkable), so shuffling display order is safe.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(root, p), 'utf8');
let failures = 0;
const ok = (n) => console.log(`OK   ${n}`);
const fail = (n, d = '') => { console.log(`FAIL ${n}  ${d}`); failures++; };
const assert = (n, c, d) => (c ? ok(n) : fail(n, d));

// ── Stage Challenge (buildChallenge) ────────────────────────────────────────
const chal = read('src/lib/challengeQuestions.js');
assert('Stage Challenge shuffles QUESTION order (shuffle(pool))', /const candidates = shuffle\(pool\)/.test(chal));
assert('Stage Challenge shuffles OPTION order (shuffle([correct, ...distractors]))',
  /options:\s*shuffle\(\[correct, \.\.\.distractors\]\)/.test(chal));

// ── Dating quiz (DatingSection) ─────────────────────────────────────────────
const dating = read('src/components/DatingSection.jsx');
assert('Dating quiz shuffles QUESTION order per attempt (shuffleIds over question indices)',
  /shuffleIds\(\[\.\.\.qs\.keys\(\)\]\)/.test(dating));
assert('Dating quiz shuffles OPTION order per question (shuffleIds over option ids)',
  /shuffleIds\(resolved\.options\.map/.test(dating));
assert('Dating grades by correctOptionId, not by index',
  dating.includes('gradeAnswer') && !/selected === q\.options\[0\]/.test(dating));

// ── Tone Challenge (TonesQuizSection) ───────────────────────────────────────
const tones = read('src/components/TonesQuizSection.jsx');
assert('Tone Challenge shuffles QUESTION order per attempt',
  /\[\.\.\.TONE_QUIZ_ITEMS\]\.sort\(\(\) => Math\.random\(\)/.test(tones));
assert('Tone Challenge shuffles the tone OPTIONS per question (useMemo keyed on idx)',
  /const tones = useMemo\(\(\) => \{[\s\S]{0,300}Math\.random\(\)[\s\S]{0,200}\}, \[idx\]\)/.test(tones));
assert('Tone Challenge grades by tone value, not by index (tone === q.tone)',
  /tone === q\.tone/.test(tones));

// ── Mini-Unit challenge (MiniUnitFlow — REPEATABLE, replayable from LearnPath) ─
const mini = read('src/components/MiniUnitFlow.jsx');
assert('MiniUnitFlow shuffles QUESTION order per attempt (shuffle(cards).map)',
  /shuffle\(cards\)\.map/.test(mini));
assert('MiniUnitFlow shuffles OPTION order per question (shuffle([correct, ...distractors]))',
  /const options = shuffle\(\[correct, \.\.\.distractors\]\)/.test(mini));
assert('MiniUnitFlow serves NO fixed index-rotated order (no rotateOptions)',
  !/rotateOptions/.test(mini),
  'found rotateOptions — a repeatable quiz must shuffle, not deterministically rotate by index');
assert('MiniUnitFlow grades by option id, not by index',
  /option\.id === currentChallenge\.correct\.id/.test(mini));

// ── First-lesson mini-challenge (FirstLessonFlow — onboarding) ───────────────
const first = read('src/components/FirstLessonFlow.jsx');
assert('FirstLessonFlow shuffles the mini-challenge QUESTION order (shuffle(buildQuestions(...)))',
  /shuffle\(buildQuestions\(/.test(first));
assert('FirstLessonFlow shuffles the mini-challenge OPTION order (shuffle([correct, ...distractors]))',
  /options: shuffle\(\[correct, \.\.\.distractors\]\)/.test(first));
assert('FirstLessonFlow serves NO fixed index-rotated order (no rotateOptions)',
  !/rotateOptions/.test(first),
  'found rotateOptions — must shuffle, not deterministically rotate by index');
assert('FirstLessonFlow grades by option id, not by index',
  /selectedId === currentQuestion\.correct\.id/.test(first));

// ── Listen & Match (ListenMeaning — NEW audio→English MCQ, repeatable) ────────
const listen = read('src/components/ListenMeaning.jsx');
assert('ListenMeaning shuffles QUESTION order per attempt (shuffle(pool).slice)',
  /shuffle\(pool\)\.slice\(0, ROUND_SIZE\)/.test(listen));
assert('ListenMeaning shuffles OPTION order per question (shuffle([correct, ...distractors]))',
  /const options = shuffle\(\[correct, \.\.\.distractors\]\)/.test(listen));
assert('ListenMeaning serves NO fixed index-rotated order (no rotateOptions)',
  !/rotateOptions/.test(listen),
  'found rotateOptions — a repeatable quiz must shuffle, not deterministically rotate by index');
assert('ListenMeaning grades by option id, not by index',
  /opt\.id === current\.correct\.id/.test(listen));

console.log('');
if (failures > 0) {
  console.log(`Quiz-shuffle check FAILED (${failures} failure(s)).`);
  process.exit(1);
}
console.log('Quiz-shuffle check passed (question + option order shuffled per attempt in every repeatable quiz).');
