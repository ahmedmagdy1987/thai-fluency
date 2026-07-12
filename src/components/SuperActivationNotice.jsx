import React from 'react';
import { Clock, Loader2 } from 'lucide-react';

// Post-checkout activation toast. After Stripe returns with ?super=success the
// entitlement is written server-side by the Stripe webhook, which the client
// polls briefly (see the checkout-return effect in App.jsx). While polling this
// shows a calm "Activating…" state; if the webhook is slower than the polling
// window it switches to a reassuring "taking longer than usual" note — never a
// scary error, because at this point the payment has already succeeded.
export default function SuperActivationNotice({ status, onDismiss }) {
  const pending = status === 'pending';
  return (
    <div className="super-activation-toast" role="status" aria-live="polite">
      <span className="super-activation-icon" aria-hidden="true">
        {pending ? <Loader2 size={20} className="super-activation-spinner" /> : <Clock size={20} />}
      </span>
      <div className="super-activation-body">
        <strong className="super-activation-title">
          {pending ? 'Activating your Super…' : 'Almost there…'}
        </strong>
        <p className="super-activation-text">
          {pending
            ? 'Confirming your subscription with Stripe. This usually takes a few seconds.'
            : 'This is taking a bit longer than usual. Your payment went through — refresh in a minute and your Super will be ready.'}
        </p>
      </div>
      {!pending && (
        <button type="button" className="super-activation-dismiss" onClick={onDismiss}>
          OK
        </button>
      )}
    </div>
  );
}
