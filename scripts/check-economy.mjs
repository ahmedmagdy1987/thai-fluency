// Regression guard for the rebuilt economy (E6). Fails if the economy slips back
// into the circular / frictionless states the rebuild fixed:
//   (a) a graded activity can be STARTED at 0 hearts (free users);
//   (b) a learning/review path consumes a heart (learning must never be gated);
//   (c) gems are a circular hearts-only currency (Super earns gems only usable
//       for hearts Super already gives free) — gems must have a non-heart sink;
//   (d) a surface advertises a Super benefit that isn't AVAILABLE in
//       entitlements.js, or marks a LIVE benefit as "soon".

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { FEATURES, FEATURE_STATUS, TIERS } from '../src/config/entitlements.js';
import { HEART_MAX, HEART_REGEN_MIN, FREEZE_COST_GEMS, buyStreakFreezeWithGems, spendHeart, effectiveHearts, regenState } from '../src/lib/economy.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(root, p), 'utf8');
let failures = 0;
const ok = (n) => console.log(`OK   ${n}`);
const fail = (n, d = '') => { console.log(`FAIL ${n}  ${d}`); failures++; };
const assert = (n, c, d) => (c ? ok(n) : fail(n, d));

// ── (a) 0 hearts blocks STARTING a graded activity ──────────────────────────
const quiz = read('src/components/QuizTab.jsx');
assert('(a) startQuiz refuses to start the Challenge at 0 hearts (free users)',
  /if \(!isSuper && hearts(?:Live)? <= 0\) \{[\s\S]{0,120}return;/.test(quiz),
  'startQuiz must early-return when a free user has 0 (live) hearts');
assert('(a) the intro renders the out-of-hearts gate instead of a start control',
  quiz.includes('outOfHearts ?') && quiz.includes('quiz-hearts-gate'));
assert('(a) the gate always offers a free way forward (never a dead end)',
  quiz.includes('quiz-hearts-gate-practice') && /learn and review for free/.test(quiz));
// The MID-SESSION hearts gate (stop at 0 hearts between questions, resume on
// refill) is pinned by its own validator: scripts/check-hearts-midsession.mjs.

// ── (b) learning / review NEVER costs a heart ───────────────────────────────
const cards = read('src/components/CardsTab.jsx');
assert('(b) SRS review (CardsTab) never spends a heart',
  !/onSpendHeart|spendHeart\(/.test(cards), 'CardsTab must not touch hearts');
const economy = read('src/lib/economy.js');
assert('(b) hearts are documented as Challenge-only (not the learning path)',
  /NEVER touched by flashcard review|Challenge-only|never gated/i.test(economy));

// ── (c) gems are NOT a circular hearts-only currency ────────────────────────
assert('(c) economy exports a non-heart gem sink (buyStreakFreezeWithGems)',
  typeof buyStreakFreezeWithGems === 'function' && FREEZE_COST_GEMS > 0);
const shop = read('src/components/ShopScreen.jsx');
assert('(c) the Shop spends gems on freezes too, not only hearts',
  shop.includes('onBuyFreeze') && shop.includes('streak freeze'));
// Prove the sink actually works: buying a freeze deducts gems and grants a freeze.
const patch = buyStreakFreezeWithGems({ gems: 100, streakFreezes: 0 });
assert('(c) buyStreakFreezeWithGems deducts gems and grants a freeze',
  patch && patch.gems === 100 - FREEZE_COST_GEMS && patch.streakFreezes === 1, JSON.stringify(patch));
assert('(c) Super does NOT grant gems (no Super-only gem bonus in entitlements)',
  !/gem/i.test(JSON.stringify(FEATURES)));

// ── (d) advertised Super benefits exist + no live benefit marked "soon" ─────
const liveSuper = Object.values(FEATURES).filter(f => f.access === TIERS.SUPER && f.status === FEATURE_STATUS.AVAILABLE).map(f => f.id);
assert('(d) the two LIVE Super benefits are AVAILABLE (Dating + unlimited hearts)',
  liveSuper.includes('datingRealTalk') && liveSuper.includes('unlimitedHearts'), liveSuper.join(','));
const plans = read('src/components/PlansPage.jsx');
// The hearts matrix row is LIVE — it must not carry `planned: true` ("soon").
assert('(d) /plans does not mark the (live) hearts benefit as "soon"',
  /label: 'Hearts in the Challenge'[^}]*premium: 'Unlimited' \}/.test(plans)
  && !/label: 'Hearts in the Challenge'[^}]*planned: true/.test(plans));
assert('(d) /plans advertises unlimited hearts as a Super benefit',
  /[Uu]nlimited hearts/.test(plans));

// ── (e) REGEN ACCRUES BELOW THE CAP, not only at zero (Wave 11) ─────────────
// The owner reported that regen "only seems to exist at 0 hearts". It was a
// DISPLAY gap — accrual has always run below the cap — but nothing pinned that
// rule, so a future "only regen when empty" tweak would have silently turned a
// display bug into a real economy loss. These assertions run the real economy
// functions over a simulated timeline.
const T0 = Date.parse('2026-01-01T12:00:00.000Z');
const MIN = 60 * 1000;
const at = (mins) => T0 + mins * MIN;
// One heart lost at T0 (5 -> 4), never reaching zero.
const afterOneLoss = spendHeart({ hearts: HEART_MAX, gems: 0, heartsUpdatedAt: new Date(T0).toISOString() }, T0);
assert('(e) spending a heart stamps the regen clock (not only the zero-th spend)',
  afterOneLoss.hearts === HEART_MAX - 1 && !!afterOneLoss.heartsUpdatedAt,
  JSON.stringify(afterOneLoss));
assert('(e) a heart regenerates below the cap WITHOUT ever reaching zero',
  effectiveHearts(afterOneLoss, false, at(HEART_REGEN_MIN)) === HEART_MAX
  && effectiveHearts(afterOneLoss, false, at(HEART_REGEN_MIN - 1)) === HEART_MAX - 1,
  `t-1min=${effectiveHearts(afterOneLoss, false, at(HEART_REGEN_MIN - 1))} t=${effectiveHearts(afterOneLoss, false, at(HEART_REGEN_MIN))}`);
assert('(e) the countdown is live below the cap (a UI can always show "next heart in")',
  regenState(afterOneLoss, at(0)).nextRegenMs > 0
  && regenState(afterOneLoss, at(HEART_REGEN_MIN - 1)).nextRegenMs > 0
  && regenState(afterOneLoss, at(HEART_REGEN_MIN - 1)).nextRegenMs <= MIN,
  JSON.stringify(regenState(afterOneLoss, at(HEART_REGEN_MIN - 1))));
assert('(e) a FULL heart bar has nothing pending (no phantom countdown)',
  regenState({ hearts: HEART_MAX, gems: 0, heartsUpdatedAt: new Date(T0).toISOString() }, at(999)).nextRegenMs === 0);
// The rate and cap themselves must not drift.
assert('(e) regen rate and cap unchanged (1 heart per 30 min, cap 5)',
  HEART_MAX === 5 && HEART_REGEN_MIN === 30);
// (The DISPLAY side of this — every hearts surface being able to show the
// countdown — is pinned by scripts/check-heart-regen-visibility.mjs.)

// ── Config sanity ───────────────────────────────────────────────────────────
assert('heart config present and sane (cap + regen minutes)',
  HEART_MAX >= 1 && HEART_REGEN_MIN >= 1);

console.log('');
if (failures > 0) {
  console.log(`Economy check FAILED (${failures} failure(s)).`);
  process.exit(1);
}
console.log('Economy check passed (hearts gate graded-only, learning never blocked, gems non-circular, Super promise honest).');
