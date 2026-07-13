// Regression guard for the pedagogy-fix pass.
//
// The pedagogy remediation touched DatingSection, TonesQuizSection,
// FirstLessonFlow, storage, gamification, plus the question bank and CSS. This
// guard proves that pass did NOT regress the earlier audit fixes that must stay
// intact per the task's REGRESSION GUARD:
//   • the 7 protected COPY strings from the UX & product-coherence audit
//     (commit 3bbe536 / copy pass ad259df), and
//   • the 5 DESIGN markers from the visual design & polish audit
//     (commit 709bb4d / quick-wins passes 40b9cbe).
//
// These lists aren't enumerated verbatim in the audit docs, so this file pins
// the canonical, most-at-risk items from each audit's "fixes applied" section
// (ux-coherence-audit.md §4, visual-design-audit.md §5/§9) — the strings/markers
// this pass could plausibly have broken. If any disappears, the build fails.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(root, p), 'utf8');
let failures = 0;
const ok = (name) => console.log(`OK   ${name}`);
const fail = (name, detail) => { console.log(`FAIL ${name}  ${detail}`); failures++; };
const has = (name, file, needle) => (read(file).includes(needle) ? ok(`${name}`) : fail(name, `missing "${needle}" in ${file}`));

console.log('— 7 protected copy strings (UX audit 3bbe536 / ad259df) —');
has('copy 1/7: "Complete Stage 1" (killed the phantom Level system)', 'src/components/FirstLessonFlow.jsx', 'Complete Stage 1');
has('copy 2/7: "Ear training" (Tone Challenge honest framing)', 'src/components/TonesQuizSection.jsx', 'Ear training');
has('copy 3/7: "Hidden until you answer" (shared answer-hygiene chip)', 'src/lib/datingQuiz.js', 'Hidden until you answer');
has('copy 4/7: "Go to Learn" (Quests locked CTA)', 'src/components/QuestsScreen.jsx', 'Go to Learn');
has('copy 5/7: Dating session-only scores hint', 'src/components/DatingSection.jsx', 'Practice scores here are just for this visit');
has('copy 6/7: "no account needed" (auth gate)', 'src/components/auth/AuthGate.jsx', 'no account needed');
has('copy 7/7: "Mission 1 in Learn" (first-lesson reward nextStep)', 'src/App.jsx', 'Mission 1 in Learn');

console.log('— 5 design markers (visual audit 709bb4d / 40b9cbe) —');
has('design 1/5: --gold-deep token (AA-passing gold)', 'src/styles/app.css', '--gold-deep:');
has('design 2/5: --sev-strong token (themed Dating severity)', 'src/styles/app.css', '--sev-strong:');
has('design 3/5: --track token (dark-mode-visible progress tracks)', 'src/styles/app.css', '--track:');
has('design 4/5: .pl-plan-premium (selling-page hierarchy fix)', 'src/styles/plans.css', 'pl-plan-premium');
has('design 5/5: Inter 800 weight loaded', 'index.html', 'Inter:wght@400;500;600;700;800');

console.log('');
if (failures > 0) {
  console.log(`Pedagogy regression guard FAILED (${failures} failure(s)).`);
  process.exit(1);
}
console.log('Pedagogy regression guard passed (7 copy strings + 5 design markers intact).');
