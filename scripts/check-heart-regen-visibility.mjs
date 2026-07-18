// HEART REGEN VISIBILITY guard (Wave 11).
//
// THE REPORT: "heart regeneration is invisible until hearts hit zero."
// THE FINDING: accrual was never broken — economy.js gates regen on
// `storedHearts < HEART_MAX` and spendHeart() stamps the clock on EVERY spend,
// so a user at 4/5 was genuinely earning a heart back. What was missing was the
// TELLING: the countdown existed in exactly one place, QuizTab's out-of-hearts
// gate, which by construction only renders at 0 hearts. Between 1 and 4 hearts
// the user saw a frozen "4/5" and no indication a heart was coming.
//
// check-economy.mjs (e) pins the accrual RULE. This pins the DISPLAY contract,
// so the information can't quietly disappear again:
//   (1) the shared hook treats "below the cap" as pending — never "empty";
//   (2) every surface that renders a heart count can render the countdown;
//   (3) the Challenge's live tick runs below the cap, not only at zero;
//   (4) it stays quiet when there is nothing to say (full hearts / Super).

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { HEART_MAX } from '../src/lib/economy.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(root, p), 'utf8');

let failures = 0;
const ok = (n) => console.log(`OK   ${n}`);
const fail = (n, d = '') => { console.log(`FAIL ${n}  ${d}`); failures++; };
const assert = (n, c, d) => (c ? ok(n) : fail(n, d));

// ── (1) the shared hook keys on the CAP, not on empty ───────────────────────
const hook = read('src/hooks/useHeartRegen.js');
assert('(1) the shared regen hook exists and derives from the real economy lib',
  /from '\.\.\/lib\/economy\.js'/.test(hook) && /regenState/.test(hook));
assert('(1) it treats "below the cap" as pending — never "hearts === 0"',
  /hearts\s*<\s*HEART_MAX/.test(hook) && !/hearts\s*(===|<=)\s*0/.test(hook),
  'a regen countdown gated on empty is exactly the reported bug');
assert('(1) Super short-circuits (unlimited hearts never show a countdown)',
  /isSuper/.test(hook) && /Infinity/.test(hook));
assert('(1) it only ticks while something is pending (no idle interval)',
  /if \(isSuper \|\| !pending\) return undefined;/.test(hook));
// Comments are stripped first: the hook's own docs NAME the mutating functions
// while explaining that it deliberately doesn't call them.
const stripComments = (src) => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
assert('(1) it is display-only — it never writes economy state',
  !/spendHeart|refillHearts|grantHeart|setStats|saveState/.test(stripComments(hook)),
  'the hook must not mutate hearts/gems');

// ── (2) every hearts-displaying surface can show the countdown ──────────────
// Any surface that renders a heart COUNT must also be able to render the
// pending-heart information; otherwise the user is shown a number with a
// missing half.
const SURFACES = [
  { file: 'src/components/TopStatsBar.jsx', label: 'header hearts chip' },
  { file: 'src/components/ShopScreen.jsx', label: 'Shop refill item' },
];
for (const s of SURFACES) {
  const src = read(s.file);
  const showsHearts = /HEART_MAX/.test(src) && /hearts/i.test(src);
  assert(`(2) ${s.label} displays hearts (guard target still valid)`, showsHearts);
  assert(`(2) ${s.label} surfaces the regen countdown`,
    /useHeartRegen/.test(src) && /countdown/.test(src),
    `${s.file} shows a heart count but no "next heart in" information`);
}

// QuizTab keeps its own tick (it also self-clears the gate), so it is asserted
// on its own terms rather than on the hook.
const quiz = read('src/components/QuizTab.jsx');
assert('(2) the Challenge intro shows the countdown below the cap',
  /quiz-hearts-status-regen/.test(quiz) && /heartsLive < HEART_MAX/.test(quiz),
  'the intro must tell a 4/5 user when the next heart lands');
assert('(2) the out-of-hearts gate KEEPS its countdown (unchanged behaviour)',
  /quiz-hearts-gate-regen/.test(quiz) && /Next heart in/.test(quiz));

// ── (3) the live tick runs below the cap, not only at zero ──────────────────
assert('(3) the Challenge tick is armed below the CAP (not `hearts > 0` bail-out)',
  /if \(!gateEligible \|\| hearts >= HEART_MAX\) return undefined;/.test(quiz),
  'a tick armed only at 0 hearts leaves 1-4 hearts frozen and countdown-less');

// ── (4) quiet when there is nothing to say ──────────────────────────────────
const topStats = read('src/components/TopStatsBar.jsx');
assert('(4) the header countdown renders only when a heart is actually pending',
  /!isSuper && regen\.countdown &&/.test(topStats),
  'it must not render an empty or zero countdown at full hearts');

// Sanity: the cap the guards key on is the real one.
assert('cap constant intact', HEART_MAX === 5);

console.log('');
if (failures > 0) {
  console.log(`Heart regen visibility check FAILED (${failures} failure(s)).`);
  process.exit(1);
}
console.log('Heart regen visibility check passed (countdown available wherever hearts are shown, below the cap — not only at zero).');
