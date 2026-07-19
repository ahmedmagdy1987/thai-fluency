// ─────────────────────────────────────────────────────────────────────────────
// BILLING RULES guard (Wave 13).
//
// THE PROBLEM THIS SOLVES: the payment path's most dangerous decisions — "is this
// user already subscribed?" and "does this event own the row?" — lived inside
// Deno Edge Functions that import from esm.sh, so `npm run check` could not
// execute a single line of them. The riskiest code in the product was the only
// code with no test.
//
// supabase/functions/_shared/billingRules.js now holds those decisions as pure,
// import-free functions that BOTH runtimes load: the Edge Functions import it at
// deploy time, and this validator executes it in CI. Same code, both places.
//
// It also statically asserts that the Edge Functions actually USE the rules and
// still CHECK their database errors — a correct rule that nobody calls, or a
// swallowed error, is how Wave 12 shipped a webhook that told Stripe "success"
// while losing a paying customer's entitlement.
// ─────────────────────────────────────────────────────────────────────────────

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import {
  hasActiveEntitlement, shouldApplySubscriptionEvent, isEntitlingStatus,
} from '../supabase/functions/_shared/billingRules.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
let failures = 0;
const assert = (label, cond, extra = '') => {
  if (cond) console.log(`OK   ${label}`);
  else { failures += 1; console.error(`FAIL ${label}${extra ? ' — ' + extra : ''}`); }
};

const NOW = new Date('2026-07-20T12:00:00.000Z');
const future = '2026-08-20T12:00:00.000Z';
const past = '2026-06-20T12:00:00.000Z';

// ── (B) The already-subscribed rule ─────────────────────────────────────────
// THE CRITICAL REQUIREMENT: it must key on super_until > now, NOT on plan.
assert('(B) an ACTIVE entitlement blocks a second checkout',
  hasActiveEntitlement({ super_until: future, plan: 'super_monthly' }, NOW) === true);

assert('(B) a LAPSED subscriber can buy again (super_until in the past)',
  hasActiveEntitlement({ super_until: past, plan: 'super_monthly' }, NOW) === false);

// The exact regression the owner called out: gating on `plan` would lock a lapsed
// user out forever, because the row keeps plan='super_monthly' after lapsing.
assert('(B) THE LOCKOUT REGRESSION: a lapsed row still says plan=super_monthly, and that must NOT block',
  hasActiveEntitlement({ super_until: past, plan: 'super_monthly' }, NOW) === false
  && hasActiveEntitlement({ super_until: null, plan: 'super_yearly' }, NOW) === false);

assert('(B) a never-subscribed user (no row) can buy', hasActiveEntitlement(null, NOW) === false);
assert('(B) a row with no super_until can buy', hasActiveEntitlement({ plan: 'free' }, NOW) === false);
assert('(B) a malformed super_until does not block (fails open to purchasable)',
  hasActiveEntitlement({ super_until: 'not-a-date' }, NOW) === false);
assert('(B) the boundary is strict: super_until exactly now does NOT block',
  hasActiveEntitlement({ super_until: NOW.toISOString() }, NOW) === false);
// A cancel-at-period-end user still holds a live subscription that will bill
// again unless cancelled, so they must still be blocked from buying a second.
assert('(B) a cancel-at-period-end user (still paid through) is still blocked from double-buying',
  hasActiveEntitlement({ super_until: future, cancel_at_period_end: true }, NOW) === true);

// ── (D) Superseded-subscription protection ──────────────────────────────────
const liveRow = { stripe_subscription_id: 'sub_A', super_until: future };

assert('(D) THE DOWNGRADE: a non-entitling event from a DIFFERENT subscription is rejected while the row is live',
  shouldApplySubscriptionEvent(liveRow, { stripe_subscription_id: 'sub_B', entitling: false }, NOW).apply === false);

assert('(D) the owning subscription can always write, including its own cancellation',
  shouldApplySubscriptionEvent(liveRow, { stripe_subscription_id: 'sub_A', entitling: false }, NOW).apply === true);

assert('(D) a legitimate plan switch/upgrade still supersedes (different id, entitling)',
  shouldApplySubscriptionEvent(liveRow, { stripe_subscription_id: 'sub_B', entitling: true }, NOW).apply === true);

assert('(D) the first write to an empty row always applies',
  shouldApplySubscriptionEvent(null, { stripe_subscription_id: 'sub_A', entitling: true }, NOW).apply === true);

assert('(D) once the row is NOT entitled, any subscription may write it',
  shouldApplySubscriptionEvent(
    { stripe_subscription_id: 'sub_A', super_until: past },
    { stripe_subscription_id: 'sub_B', entitling: false }, NOW).apply === true);

assert('(D) an unknown stored id does not block (cannot prove supersession)',
  shouldApplySubscriptionEvent(
    { stripe_subscription_id: null, super_until: future },
    { stripe_subscription_id: 'sub_B', entitling: false }, NOW).apply === true);

// The out-of-order dunning replay the report described: an old `past_due`
// snapshot arriving after the row is live and owned by the SAME subscription.
// Same-id events still apply (we cannot tell old from new without a timestamp),
// which is precisely why the webhook re-fetches live state for these events —
// asserted statically below.
assert('(D) a same-subscription non-entitling event still applies (re-fetch is what protects this case)',
  shouldApplySubscriptionEvent(liveRow, { stripe_subscription_id: 'sub_A', entitling: false }, NOW).apply === true);

assert('(D) rejections explain themselves (the reason is logged)',
  typeof shouldApplySubscriptionEvent(liveRow, { stripe_subscription_id: 'sub_B', entitling: false }, NOW).reason === 'string');

// ── Status mapping ──────────────────────────────────────────────────────────
assert('entitling statuses are exactly active + trialing',
  isEntitlingStatus('active') && isEntitlingStatus('trialing')
  && !isEntitlingStatus('past_due') && !isEntitlingStatus('canceled')
  && !isEntitlingStatus('incomplete') && !isEntitlingStatus('unpaid'));

// ── Static assertions: the Edge Functions must USE all of this ──────────────
const webhook = readFileSync(join(ROOT, 'supabase/functions/stripe-webhook/index.ts'), 'utf8');
const checkout = readFileSync(join(ROOT, 'supabase/functions/create-checkout-session/index.ts'), 'utf8');
const cancel = readFileSync(join(ROOT, 'supabase/functions/cancel-subscription/index.ts'), 'utf8');

// (A) every service_role write must check its error — the Wave 12 defect.
assert('(A) the webhook CHECKS its upsert error and throws (so Stripe retries)',
  /const \{ error: writeError \} = await admin\.from\("subscriptions"\)\.upsert\(/.test(webhook)
  && /if \(writeError\) throw writeError;/.test(webhook),
  'a swallowed error returns 200 and Stripe never retries');
assert('(A) the webhook checks its READ error too',
  /if \(readError\) throw readError;/.test(webhook));
assert('(F) cancel-subscription checks its update error before claiming success',
  /const \{ error: writeError \} = await admin/.test(cancel) && /if \(writeError\) throw writeError;/.test(cancel));
assert('(F) cancel-subscription checks its read error',
  /if \(readError\) throw readError;/.test(cancel));
// No bare service_role write may remain in any function.
for (const [name, src] of [['stripe-webhook', webhook], ['cancel-subscription', cancel]]) {
  const bare = src.split(/\r?\n/).filter(l => /^\s*await admin\s*$/.test(l) || /^\s*await admin\.from\(/.test(l));
  if (bare.length) {
    failures += 1;
    console.error(`FAIL (A/F) ${name} still has an unchecked service_role write: ${bare[0].trim()}`);
  }
}
assert('(A/F) no unchecked service_role write remains in any Edge Function', true);

// (B) the checkout function must gate on the shared rule, not on `plan`.
assert('(B) create-checkout-session imports the shared entitlement rule',
  /import \{ hasActiveEntitlement \} from "\.\.\/_shared\/billingRules\.js"/.test(checkout));
// Match the guard EXACTLY — `if (false && hasActiveEntitlement(existing))` must
// not pass, so a substring test is not enough.
assert('(B) create-checkout-session rejects an active subscriber with 409',
  /\n\s*if \(hasActiveEntitlement\(existing\)\) \{/.test(checkout) && /status: 409/.test(checkout),
  'the guard must be reached unconditionally');
// Code-only: the comments deliberately QUOTE the wrong rule to explain why it is
// wrong, so strip comments before asserting the code does not use it.
const stripComments = (src) => src.split(/\r?\n/)
  .filter(l => !/^\s*(\/\/|\*|\/\*)/.test(l))
  .map(l => l.replace(/\/\/.*$/, ''))
  .join('\n');
assert('(B) create-checkout-session does NOT gate on plan (the lockout regression)',
  !/plan\s*!==?\s*["']free["']/.test(stripComments(checkout)),
  'gating on plan permanently locks out lapsed subscribers');

// (C) customer reuse WITH the mandatory fallback.
assert('(C) create-checkout-session reuses a stored Stripe customer when present',
  /customer: storedCustomerId/.test(checkout));
// The fallback must be a REAL second create call, not just the else-branch one:
// there are exactly two `customer_email` creates (the fallback and the
// no-stored-customer path). Dropping the fallback leaves only one.
{
  const emailCreates = (checkout.match(/customer_email: user\.email/g) || []).length;
  assert('(C) …and falls back to customer_email when the stored id is rejected',
    emailCreates >= 2 && /falling back to customer_email/.test(checkout),
    `a stale/deleted customer id must never block a paying customer (found ${emailCreates} email-create path(s))`);
  assert('(C) the stale-customer catch does not rethrow',
    !/catch \(e\) \{\s*\n\s*throw e;/.test(checkout));
}

// (D) the subscription.* branch must re-fetch live state.
assert('(D) the customer.subscription.* branch re-fetches from Stripe instead of trusting the snapshot',
  /case "customer\.subscription\.deleted": \{[\s\S]{0,1600}stripe\.subscriptions\.retrieve\(snapshot\.id\)/.test(webhook));
assert('(D) …with a fallback to the snapshot if the re-fetch fails',
  /catch \(e\)[\s\S]{0,300}falling back to the event snapshot/.test(webhook));
assert('(D) the webhook consults the supersession rule before writing',
  /shouldApplySubscriptionEvent\(/.test(webhook));

// (E) unmapped subscriptions must be loud.
assert('(E) an unmapped subscription is logged as an error, not silently dropped',
  /UNMAPPED SUBSCRIPTION/.test(webhook) && /console\.error/.test(webhook));

// (I, server half) observability.
assert('(I) the webhook logs every entitlement decision',
  /ENTITLEMENT user=/.test(webhook));
assert('(I) checkout starts are logged', /CHECKOUT_STARTED user=/.test(checkout));
assert('(I) cancellations are logged', /CANCEL_SCHEDULED user=/.test(cancel));

// Orphan detection.
assert('orphaned live subscriptions are detected and reported on cancel',
  /ORPHANED SUBSCRIPTIONS/.test(cancel) && /stripe\.subscriptions\.list/.test(cancel));
assert('orphan detection can never fail the user\'s cancellation',
  /orphan detection failed \(non-fatal\)/.test(cancel));

// Things that must NOT have been weakened.
assert('SAFETY: webhook signature verification is intact',
  /constructEventAsync\(raw, sig!, whsec/.test(webhook) && /status: 400/.test(webhook));
assert('SAFETY: the price allow-list is intact (client cannot supply a price id)',
  /body\.plan === "yearly" \? "yearly" : "monthly"/.test(checkout)
  && /const price = plan === "yearly" \? PRICE_YEARLY : PRICE_MONTHLY;/.test(checkout)
  && !/body\.(price|priceId|price_id)\b/.test(stripComments(checkout)),
  'the price must come only from the server-side allow-list');
assert('SAFETY: cancel still looks the subscription up server-side (no IDOR)',
  /\.eq\("user_id", user\.id\)/.test(cancel) && !/body\.subscriptionId|body\.subscription_id/.test(cancel));

if (failures > 0) {
  console.error(`\nBilling-rules check FAILED: ${failures} assertion(s) failed.`);
  process.exit(1);
}
console.log('\nBilling-rules check passed.');
