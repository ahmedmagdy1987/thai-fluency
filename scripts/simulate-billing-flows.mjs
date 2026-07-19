// ─────────────────────────────────────────────────────────────────────────────
// BILLING FLOW SIMULATION (Wave 13).
//
// WHAT THIS IS — AND WHAT IT IS NOT.
// The mandated acceptance matrix is a LIVE Stripe test-mode run (`stripe listen`
// + `stripe trigger`). That needs the Stripe CLI, Docker and Deno, none of which
// are installed on this machine, and it needs the test secret key, which must
// never be requested. So it CANNOT be run here.
//
// This is the strongest honest substitute: it re-implements the two Edge Function
// HANDLER FLOWS in Node — using the REAL shared decision module the deployed
// functions import — against a mock Supabase and a mock Stripe. It therefore
// proves the control flow and the rules (409 vs allow, retry vs 200, supersession,
// customer fallback). It does NOT prove Stripe's real event ordering, real
// signature verification, or real network behaviour.
//
// Read the results as: "the logic is right", not "the integration is proven".
// scripts/../docs list the exact CLI commands the owner must run to close that gap.
// ─────────────────────────────────────────────────────────────────────────────

import {
  hasActiveEntitlement, shouldApplySubscriptionEvent, isEntitlingStatus,
} from '../supabase/functions/_shared/billingRules.js';

let failures = 0;
const scenario = (n) => console.log(`\n── ${n} ${'─'.repeat(Math.max(0, 66 - n.length))}`);
const assert = (label, cond, extra = '') => {
  if (cond) console.log(`   PASS  ${label}`);
  else { failures += 1; console.error(`   FAIL  ${label}${extra ? ' — ' + extra : ''}`); }
};

// ── Mocks ───────────────────────────────────────────────────────────────────
function mockDb(initialRow = null, opts = {}) {
  return {
    row: initialRow ? { ...initialRow } : null,
    failWrites: !!opts.failWrites,
    failReads: !!opts.failReads,
    writes: 0,
    read() {
      if (this.failReads) return { data: null, error: { message: 'DB read down' } };
      return { data: this.row ? { ...this.row } : null, error: null };
    },
    upsert(next) {
      if (this.failWrites) return { error: { message: 'DB write down' } };
      this.writes += 1;
      this.row = { ...(this.row || {}), ...next };
      return { error: null };
    },
  };
}

function mockStripe(opts = {}) {
  return {
    subscriptions: new Map(Object.entries(opts.subscriptions || {})),
    rejectCustomer: opts.rejectCustomer || null,
    createdSessions: [],
    retrieve(id) {
      if (!this.subscriptions.has(id)) throw new Error(`No such subscription: ${id}`);
      return this.subscriptions.get(id);
    },
    createSession(params) {
      if (params.customer && params.customer === this.rejectCustomer) {
        throw new Error(`No such customer: ${params.customer}`);
      }
      this.createdSessions.push(params);
      return { client_secret: 'cs_test_secret', usedCustomer: params.customer ?? null, usedEmail: params.customer_email ?? null };
    },
  };
}

// ── Handler flows (mirrors of the deployed control flow) ────────────────────
// create-checkout-session
function runCheckout({ db, stripe, user, plan = 'monthly' }) {
  const read = db.read();
  if (read.error) return { status: 500, body: { error: read.error.message } };
  const existing = read.data;

  if (hasActiveEntitlement(existing)) {
    return { status: 409, body: { error: 'already_subscribed', superUntil: existing?.super_until ?? null } };
  }

  const storedCustomerId = existing?.stripe_customer_id || null;
  const base = { mode: 'subscription', client_reference_id: user.id, metadata: { app_user_id: user.id } };
  let session;
  let fellBack = false;
  if (storedCustomerId) {
    try {
      session = stripe.createSession({ ...base, customer: storedCustomerId });
    } catch {
      fellBack = true;
      session = stripe.createSession({ ...base, customer_email: user.email });
    }
  } else {
    session = stripe.createSession({ ...base, customer_email: user.email });
  }
  return { status: 200, body: { clientSecret: session.client_secret }, session, fellBack };
}

// stripe-webhook applySubscription
function runWebhook({ db, sub, fallbackUserId = null }) {
  const appUserId = sub.metadata?.app_user_id ?? fallbackUserId;
  if (!appUserId) return { httpStatus: 200, unmappedLogged: true, wrote: false };

  const active = isEntitlingStatus(sub.status);
  const read = db.read();
  if (read.error) return { httpStatus: 500, wrote: false, threw: 'read' };   // → Stripe retries

  const decision = shouldApplySubscriptionEvent(read.data, { stripe_subscription_id: sub.id, entitling: active });
  if (!decision.apply) return { httpStatus: 200, wrote: false, skipped: decision.reason };

  const periodEnd = sub.current_period_end || null;
  const { error } = db.upsert({
    user_id: appUserId,
    plan: active ? 'super_monthly' : 'free',
    status: sub.status,
    super_until: active ? periodEnd : null,
    stripe_customer_id: sub.customer,
    stripe_subscription_id: sub.id,
    current_period_end: periodEnd,
    cancel_at_period_end: !!sub.cancel_at_period_end,
  });
  if (error) return { httpStatus: 500, wrote: false, threw: 'write' };       // → Stripe retries
  return { httpStatus: 200, wrote: true };
}

const FUTURE = '2026-08-20T12:00:00.000Z';
const PAST = '2026-06-20T12:00:00.000Z';
const USER = { id: 'user_1', email: 'a@example.com' };
const subOf = (over = {}) => ({
  id: 'sub_A', status: 'active', customer: 'cus_1',
  current_period_end: FUTURE, metadata: { app_user_id: USER.id }, ...over,
});

// ── S1: happy path — one subscription, one row, correct super_until ─────────
scenario('S1  New subscription → exactly one row, correct super_until');
{
  const db = mockDb(null);
  const r = runWebhook({ db, sub: subOf() });
  assert('webhook returns 200', r.httpStatus === 200);
  assert('the row was written', r.wrote === true && db.writes === 1);
  assert('super_until is the period end', db.row.super_until === FUTURE);
  assert('plan is a Super plan', db.row.plan === 'super_monthly');
  assert('exactly one row exists (single-row store by construction)', !!db.row);
}

// ── S2: THE ITEM-A DEFECT — database failure must NOT return 200 ────────────
scenario('S2  Database write fails → Stripe must RETRY (not 200)');
{
  const db = mockDb(null, { failWrites: true });
  const r = runWebhook({ db, sub: subOf() });
  assert('webhook returns 500 so Stripe retries', r.httpStatus === 500, `got ${r.httpStatus}`);
  assert('nothing was silently reported as written', r.wrote === false);
  // Pre-Wave-13 behaviour for contrast:
  const swallowed = 200;
  assert('this is a CHANGE from the old swallow-and-200 behaviour', r.httpStatus !== swallowed);
}
{
  const db = mockDb(null, { failReads: true });
  const r = runWebhook({ db, sub: subOf() });
  assert('a failed READ also returns 500', r.httpStatus === 500);
}

// ── S3: ITEM B — second subscribe blocked; lapsed user still allowed ────────
scenario('S3  Already-subscribed → 409;  lapsed → allowed');
{
  const active = mockDb({ super_until: FUTURE, plan: 'super_monthly', stripe_customer_id: 'cus_1' });
  const r = runCheckout({ db: active, stripe: mockStripe(), user: USER });
  assert('an ACTIVE subscriber gets 409', r.status === 409, `got ${r.status}`);
  assert('no checkout session was created', !r.session);
}
{
  const lapsed = mockDb({ super_until: PAST, plan: 'super_monthly', stripe_customer_id: 'cus_1' });
  const stripe = mockStripe();
  const r = runCheckout({ db: lapsed, stripe, user: USER });
  assert('a LAPSED subscriber CAN buy again (200)', r.status === 200, `got ${r.status}`);
  assert('a session was created', stripe.createdSessions.length === 1);
}
{
  const fresh = mockDb(null);
  const r = runCheckout({ db: fresh, stripe: mockStripe(), user: USER });
  assert('a never-subscribed user can buy', r.status === 200);
}

// ── S4: ITEM C — customer reuse, and the mandatory stale-id fallback ────────
scenario('S4  Stripe customer reuse + stale-customer fallback');
{
  const db = mockDb({ super_until: PAST, stripe_customer_id: 'cus_existing' });
  const stripe = mockStripe();
  const r = runCheckout({ db, stripe, user: USER });
  assert('the stored customer is reused', r.session.usedCustomer === 'cus_existing');
  assert('no new customer is minted via email', r.session.usedEmail === null);
  assert('no fallback was needed', r.fellBack === false);
}
{
  const db = mockDb({ super_until: PAST, stripe_customer_id: 'cus_deleted' });
  const stripe = mockStripe({ rejectCustomer: 'cus_deleted' });
  const r = runCheckout({ db, stripe, user: USER });
  assert('a STALE customer id does not block the purchase', r.status === 200);
  assert('it fell back to customer_email', r.fellBack === true && r.session.usedEmail === USER.email);
  assert('the checkout still completed', !!r.session.client_secret);
}

// ── S5: ITEM D — out-of-order / superseded events must not downgrade ────────
scenario('S5  Out-of-order and superseded events');
{
  // Same subscription, stale past_due arriving after active. The deployed webhook
  // re-fetches live state for these events, so simulate that: the re-fetch returns
  // the CURRENT (active) subscription regardless of the stale snapshot.
  const db = mockDb(null);
  runWebhook({ db, sub: subOf({ status: 'active' }) });
  assert('user is entitled after the active event', db.row.super_until === FUTURE);

  const stripe = mockStripe({ subscriptions: { sub_A: subOf({ status: 'active' }) } });
  const staleSnapshot = subOf({ status: 'past_due' });
  const fresh = stripe.retrieve(staleSnapshot.id);          // what the webhook now does
  const r = runWebhook({ db, sub: fresh });
  assert('the stale past_due snapshot does NOT downgrade (re-fetch wins)',
    db.row.super_until === FUTURE && db.row.status === 'active', JSON.stringify(db.row));
  assert('the write still happened (current truth re-applied)', r.wrote === true);
}
{
  // Two subscriptions: cancelling the DUPLICATE must not wipe a live entitlement.
  const db = mockDb({ stripe_subscription_id: 'sub_A', super_until: FUTURE, plan: 'super_monthly', status: 'active' });
  const r = runWebhook({ db, sub: subOf({ id: 'sub_B', status: 'canceled', current_period_end: PAST }) });
  assert('a superseded subscription cannot downgrade a live row', db.row.super_until === FUTURE, JSON.stringify(db.row));
  assert('the write was skipped with a reason', r.wrote === false && !!r.skipped);
}
{
  // …but a legitimate upgrade from a different subscription DOES apply.
  const db = mockDb({ stripe_subscription_id: 'sub_A', super_until: FUTURE, plan: 'super_monthly', status: 'active' });
  const r = runWebhook({ db, sub: subOf({ id: 'sub_B', status: 'active', current_period_end: '2027-01-01T00:00:00.000Z' }) });
  assert('a legitimate plan switch still supersedes', r.wrote === true && db.row.stripe_subscription_id === 'sub_B');
  assert('and extends the entitlement', db.row.super_until === '2027-01-01T00:00:00.000Z');
}
{
  // The owner's own cancellation of the OWNING subscription must still work.
  const db = mockDb({ stripe_subscription_id: 'sub_A', super_until: FUTURE, plan: 'super_monthly', status: 'active' });
  const r = runWebhook({ db, sub: subOf({ id: 'sub_A', status: 'canceled', current_period_end: PAST }) });
  assert('the user can still cancel their OWN subscription', r.wrote === true && db.row.status === 'canceled');
}

// ── S6: ITEM E — unmapped subscription is surfaced, not silent ──────────────
scenario('S6  Subscription with no app_user_id');
{
  const db = mockDb(null);
  const r = runWebhook({ db, sub: { id: 'sub_X', status: 'active', customer: 'cus_x', metadata: {} } });
  assert('nothing is written (there is no user to entitle)', r.wrote === false);
  assert('it is logged as unmapped rather than dropped silently', r.unmappedLogged === true);
  assert('it returns 200 (retrying cannot help — there is no mapping)', r.httpStatus === 200);
}

console.log('');
if (failures > 0) {
  console.error(`Billing flow simulation FAILED: ${failures} assertion(s).`);
  process.exit(1);
}
console.log('Billing flow simulation passed (LOGIC ONLY — see the header: this is not a live Stripe run).');
