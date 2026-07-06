// Regression guard for the shared subscription-status source of truth
// (src/hooks/useSubscriptionStatus.js). Proves the wording is consistent for
// every Super state, and statically asserts that SettingsModal and ProfilePage
// both consume the shared hook rather than re-implementing (and re-drifting) the
// status copy / cancel logic.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { subscriptionStatusText, formatSuperUntil, FREE_PLAN_BLURB } from '../src/lib/subscriptionStatus.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
let failures = 0;
const check = (label, cond, extra = '') => {
  if (cond) console.log(`OK   ${label}`);
  else { failures += 1; console.error(`FAIL ${label}${extra ? ' — ' + extra : ''}`); }
};

// ── Status wording ───────────────────────────────────────────────────────────
check('free → no status text (component renders the free CTA)',
  subscriptionStatusText({ isSuper: false, canceled: false, untilLabel: null }) === null);

check('active with renewal date → "Renews on <date>"',
  subscriptionStatusText({ isSuper: true, canceled: false, untilLabel: 'Jan 5, 2027' })
    === 'Renews on Jan 5, 2027. Thanks for supporting Tuk Talk Thai!');

check('active without date → "Active."',
  subscriptionStatusText({ isSuper: true, canceled: false, untilLabel: null })
    === 'Active. Thanks for supporting Tuk Talk Thai!');

check('canceled with date → "stays active until <date>. Auto-renew is off."',
  subscriptionStatusText({ isSuper: true, canceled: true, untilLabel: 'Jan 5, 2027' })
    === 'Canceled — stays active until Jan 5, 2027. Auto-renew is off.');

check('canceled without date → generic "end of your billing period"',
  subscriptionStatusText({ isSuper: true, canceled: true, untilLabel: null })
    === 'Canceled — stays active until the end of your billing period. Auto-renew is off.');

// ── formatSuperUntil ─────────────────────────────────────────────────────────
check('formatSuperUntil: null → null', formatSuperUntil(null) === null);
check('formatSuperUntil: invalid → null', formatSuperUntil('not-a-date') === null);
check('formatSuperUntil: valid ISO → a non-empty string',
  typeof formatSuperUntil('2027-01-05T00:00:00Z') === 'string' && formatSuperUntil('2027-01-05T00:00:00Z').length > 0);

check('FREE_PLAN_BLURB names the live Super benefit (Dating)', /Dating/.test(FREE_PLAN_BLURB));

// ── Both surfaces consume the shared hook (no re-drift) ──────────────────────
for (const rel of ['src/components/SettingsModal.jsx', 'src/components/ProfilePage.jsx']) {
  const srcTxt = readFileSync(join(root, rel), 'utf8');
  check(`${rel}: imports useSubscriptionStatus`, /useSubscriptionStatus/.test(srcTxt));
  check(`${rel}: no local handleCancelPlan (uses the shared cancel)`, !/handleCancelPlan/.test(srcTxt),
    'found a local handleCancelPlan — status/cancel logic must live in the shared hook');
  check(`${rel}: no local superUntilLabel computation`, !/superUntilLabel/.test(srcTxt),
    'found a local superUntilLabel — formatting must come from the shared hook');
}

console.log('');
if (failures > 0) {
  console.error(`Subscription-status check FAILED: ${failures} assertion(s) failed.`);
  process.exit(1);
}
console.log('Subscription-status check passed.');
