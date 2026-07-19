// ─────────────────────────────────────────────────────────────────────────────
// BILLING RULES — the pure decision logic of the payment path (Wave 13).
//
// WHY THIS FILE EXISTS:
// The Edge Functions run on Deno and import from esm.sh, so their handlers cannot
// be executed by the Node validator suite. That made the most dangerous logic in
// the product — "is this user already subscribed?", "does this event own the
// row?" — the ONLY logic with no automated test. This module holds those
// decisions as pure functions with NO imports, so the SAME code is:
//
//   • imported by the Edge Functions (Deno, relative import), and
//   • executed by scripts/check-billing-rules.mjs (Node) in `npm run check`.
//
// One definition, tested in CI, deployed to production. Keep it dependency-free
// and side-effect-free so both runtimes can load it.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Does this subscriptions row represent a LIVE paid entitlement right now?
 *
 * THE CRITICAL RULE (Wave 13 item B): this is `super_until > now`, NOT
 * `plan !== 'free'`. A lapsed subscriber keeps `plan = 'super_monthly'` on their
 * row forever — the webhook only rewrites `plan` to 'free' when it happens to see
 * an inactive status. Gating re-purchase on `plan` would therefore permanently
 * lock a lapsed customer out of re-subscribing, which is a WORSE bug than the
 * double-charge it is meant to prevent. Time is the only honest test.
 *
 * Deliberately does NOT use the client's "canceled but paid through" grace rule
 * (see cloudStorage.downloadEntitlement). Purpose differs: here we are asking
 * "would a second checkout be a duplicate charge?", and a user inside a
 * cancel-at-period-end window still holds a LIVE Stripe subscription that will
 * bill again unless they cancel — so they must still be blocked from buying a
 * second one. `super_until` is written from `current_period_end` while active, so
 * it already covers that window.
 *
 * @param row  the public.subscriptions row (or null when never subscribed)
 * @param now  Date, injectable for tests
 * @returns boolean
 */
export function hasActiveEntitlement(row, now = new Date()) {
  if (!row) return false;
  const until = row.super_until;
  if (!until) return false;
  const untilMs = Date.parse(until);
  if (!Number.isFinite(untilMs)) return false;
  return untilMs > now.getTime();
}

/**
 * Should an incoming Stripe subscription event be APPLIED to this user's row?
 *
 * THE PROBLEM (Wave 13 item D): public.subscriptions is keyed `user_id PRIMARY
 * KEY`, so every subscription a user has ever held writes the SAME row. When a
 * user holds two subscriptions (the pre-item-B double-subscribe case), an event
 * for the OLD one — e.g. cancelling the duplicate — would overwrite the row and
 * downgrade a customer whose OTHER subscription is still live and still billing.
 *
 * THE RULE: an event may always write when it concerns the subscription already
 * recorded, or when the row holds no/expired entitlement. It is REJECTED only in
 * the narrow, provably-wrong case: a DIFFERENT subscription id trying to write a
 * NON-entitling state over a row that currently holds a LIVE entitlement.
 *
 * This deliberately still allows:
 *   • plan switches / upgrades (a different id writing an ACTIVE state wins —
 *     that is the legitimate "new subscription supersedes old" path),
 *   • the first write to an empty row,
 *   • any write from the subscription that currently owns the row (including
 *     cancellations of it — the user's own cancel must still work).
 *
 * @param stored    existing row (or null)
 * @param incoming  { stripe_subscription_id, entitling }  entitling = would this
 *                  event leave the user with Super?
 * @param now       Date, injectable
 */
export function shouldApplySubscriptionEvent(stored, incoming, now = new Date()) {
  if (!stored) return { apply: true, reason: 'no existing row' };
  const storedId = stored.stripe_subscription_id || null;
  const incomingId = (incoming && incoming.stripe_subscription_id) || null;

  // Same subscription (or we cannot tell them apart) → always authoritative.
  if (!storedId || !incomingId || storedId === incomingId) {
    return { apply: true, reason: 'same subscription or unknown id' };
  }
  // A different subscription bringing an ENTITLING state supersedes — this is a
  // legitimate upgrade / plan switch / re-subscribe.
  if (incoming.entitling) {
    return { apply: true, reason: 'different subscription, entitling (supersede)' };
  }
  // A different subscription bringing a NON-entitling state, while the stored row
  // is still live → this is the superseded-subscription downgrade. Reject.
  if (hasActiveEntitlement(stored, now)) {
    return {
      apply: false,
      reason: `ignoring non-entitling event from superseded subscription ${incomingId}; row is owned by ${storedId} and still entitled`,
    };
  }
  return { apply: true, reason: 'different subscription, row not currently entitled' };
}

/**
 * Is a Stripe subscription status one that grants access?
 * Mirrors the webhook's own definition so both sides cannot drift.
 */
export function isEntitlingStatus(status) {
  return status === 'active' || status === 'trialing';
}
