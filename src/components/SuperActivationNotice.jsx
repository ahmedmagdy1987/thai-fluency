import React from 'react';
import { Clock, Loader2 } from 'lucide-react';

// Post-checkout activation strip. After Stripe returns with ?super=success the
// entitlement is written server-side by the Stripe webhook, which the client
// polls (see the checkout-return effect in App.jsx).
//
// WAVE 12 — three honest states, and the user is NEVER shown a plain free plan
// while a payment is settling:
//   pending  — the first ~30s, "usually takes a few seconds"
//   slow     — past 30s, STILL POLLING (the old build stopped here and gave up
//              after 30s, which is how a ~3-minute webhook produced a silent
//              activation with no acknowledgement at all)
//   timeout  — polling finished without the webhook landing. The payment still
//              succeeded, so this is reassurance plus a real next action, never
//              an error and never a downgrade.
export default function SuperActivationNotice({ status, onDismiss, onRefresh }) {
  const pending = status === 'pending';
  const slow = status === 'slow';
  const timedOut = status === 'timeout';
  const stillWorking = pending || slow;

  const title = pending ? 'Activating your Super…'
    : slow ? 'Still activating…'
      : 'Your payment went through';

  const text = pending
    ? 'Confirming your subscription with Stripe. This usually takes a few seconds.'
    : slow
      ? 'This one is taking a little longer than usual — we’re still checking. You can keep using the app; Super switches on by itself the moment it lands.'
      : 'Stripe has your payment, but the confirmation hasn’t reached us yet. It usually arrives within a few minutes and Super turns on automatically — no action needed. You can check now if you’d like.';

  return (
    <div className="super-activation-toast" role="status" aria-live="polite">
      <span className="super-activation-icon" aria-hidden="true">
        {stillWorking ? <Loader2 size={20} className="super-activation-spinner" /> : <Clock size={20} />}
      </span>
      <div className="super-activation-body">
        <strong className="super-activation-title">{title}</strong>
        <p className="super-activation-text">{text}</p>
      </div>
      {timedOut && (
        <div className="super-activation-actions">
          {onRefresh && (
            <button type="button" className="super-activation-refresh" onClick={onRefresh}>
              Check now
            </button>
          )}
          <button type="button" className="super-activation-dismiss" onClick={onDismiss}>
            OK
          </button>
        </div>
      )}
    </div>
  );
}
