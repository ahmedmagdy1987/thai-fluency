// Regression guard for the flashcard direction-reveal exploit.
//
// The exploit: if a card's visible faces are derived from the LIVE direction
// preference, toggling direction on an unanswered card swaps the hidden answer
// onto the prompt face — a free reveal, then flip back and rate "Easy" for full
// credit. The fix freezes each active card's faces to an immutable snapshot
// (attemptDirection) via useAttemptDirection; the live toggle only affects the
// NEXT card and marks the current attempt `assisted`.
//
// This script (a) unit-tests the pure core and (b) statically asserts that every
// flashcard/lesson screen renders faces from the frozen snapshot, not the live
// preference. It exits non-zero on any regression so the build/validators catch
// a reintroduction of the exploit.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
  normalizeDirection,
  faceIsEnglishFirst,
  applyDirectionToggle,
} from '../src/lib/attemptDirection.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
let failures = 0;
const ok = (name) => console.log(`OK   ${name}`);
const fail = (name, detail) => { console.log(`FAIL ${name}  ${detail}`); failures++; };
const assert = (name, cond, detail = '') => (cond ? ok(name) : fail(name, detail));

// ---- 1. Pure core unit tests -------------------------------------------------
assert('normalizeDirection: th-first preserved', normalizeDirection('th-first') === 'th-first');
assert('normalizeDirection: anything else → en-first', normalizeDirection('en-first') === 'en-first' && normalizeDirection('garbage') === 'en-first' && normalizeDirection(undefined) === 'en-first');

// Faces derive ONLY from the (frozen) attempt direction.
assert('faceIsEnglishFirst(en-first) === true', faceIsEnglishFirst('en-first') === true);
assert('faceIsEnglishFirst(th-first) === false', faceIsEnglishFirst('th-first') === false);

// INVARIANT: a toggle never changes the frozen attempt direction (defer to next card).
for (const [att, next] of [['en-first', 'th-first'], ['th-first', 'en-first'], ['en-first', 'en-first']]) {
  const r = applyDirectionToggle({ attemptDirection: att, assisted: false, next, active: true });
  assert(`toggle keeps attemptDirection frozen (${att} + toggle→${next})`, r.attemptDirection === normalizeDirection(att), `got ${r.attemptDirection}`);
}

// A flip to the OPPOSITE side while the attempt is ACTIVE (unrevealed) = peek → assisted.
assert('active opposite-side flip marks assisted',
  applyDirectionToggle({ attemptDirection: 'en-first', assisted: false, next: 'th-first', active: true }).assisted === true);
// A flip to the SAME side does not mark assisted.
assert('same-side flip does not mark assisted',
  applyDirectionToggle({ attemptDirection: 'en-first', assisted: false, next: 'en-first', active: true }).assisted === false);
// A flip AFTER the attempt is no longer active (revealed/answered) does not mark assisted.
assert('inactive flip does not mark assisted',
  applyDirectionToggle({ attemptDirection: 'en-first', assisted: false, next: 'th-first', active: false }).assisted === false);
// assisted latches once set.
assert('assisted latches true',
  applyDirectionToggle({ attemptDirection: 'en-first', assisted: true, next: 'en-first', active: false }).assisted === true);

// ---- 2. Static regression scan of every direction-bearing screen -------------
// Each screen MUST derive isEnglishFirst from the frozen snapshot via
// faceIsEnglishFirst(attemptDirection), and MUST NOT compute it directly from
// the live preference (the vulnerable pattern).
const SCREENS = [
  'src/components/CardsTab.jsx',
  'src/components/MiniUnitFlow.jsx',
  'src/components/FirstLessonFlow.jsx',
  'src/components/DemoMode.jsx',
];

// The vulnerable pattern: isEnglishFirst assigned straight from the live pref.
const VULN = /isEnglishFirst\s*=\s*(cardDirection|direction)\s*!==\s*['"]th-first['"]/;
// The required secure pattern.
const SECURE = /isEnglishFirst\s*=\s*faceIsEnglishFirst\(\s*attemptDirection\s*\)/;

for (const rel of SCREENS) {
  const src = readFileSync(join(root, rel), 'utf8');
  assert(`${rel}: imports useAttemptDirection`, /useAttemptDirection/.test(src));
  assert(`${rel}: derives faces from frozen snapshot`, SECURE.test(src), 'missing faceIsEnglishFirst(attemptDirection)');
  assert(`${rel}: no live-preference face derivation`, !VULN.test(src), 'found isEnglishFirst = <livePref> !== "th-first" (exploit pattern)');
}

console.log('');
if (failures === 0) {
  console.log('Direction-lock check passed.');
  process.exit(0);
} else {
  console.log(`Direction-lock check FAILED (${failures} issue(s)).`);
  process.exit(1);
}
