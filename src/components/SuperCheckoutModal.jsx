import React, { useEffect, useRef, useState } from 'react';
import { X, Crown, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase.js';
import { STRIPE_PUBLISHABLE_KEY, hasStripeConfig, isStripeTestMode, loadStripeJs } from '../config/stripe.js';
import { trackEvent, ANALYTICS_EVENTS } from '../lib/analytics.js';

// Centered, in-site checkout dialog. A dim/blurred backdrop keeps the plans page
// visible behind it, so paying feels like part of Tuk Talk Thai — never a separate
// page. Stripe Embedded Checkout mounts INSIDE the card (#super-checkout): loads
// Stripe.js once, fetches the client secret from the auth-gated
// create-checkout-session Edge Function, mounts, and destroys on close/unmount.
//
// Honest failure modes: no Stripe config → friendly note; script/session/network
// failure → an error state with Try again. A real Stripe session always backs it.
export default function SuperCheckoutModal({ plan = 'monthly', onClose }) {
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'error' | 'unconfigured'
  const [errorMsg, setErrorMsg] = useState('');
  const mountRef = useRef(null);
  const checkoutRef = useRef(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Close on Escape; lock body scroll while open so only the dialog scrolls.
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  useEffect(() => {
    let cancelled = false;

    if (!hasStripeConfig) {
      setStatus('unconfigured');
      return undefined;
    }

    setStatus('loading');
    setErrorMsg('');

    (async () => {
      try {
        const Stripe = await loadStripeJs();
        if (cancelled) return;
        if (!Stripe) throw new Error('Could not load secure checkout. Check your connection and try again.');

        const stripe = Stripe(STRIPE_PUBLISHABLE_KEY);

        const fetchClientSecret = async () => {
          const { data, error } = await supabase.functions.invoke('create-checkout-session', {
            body: { plan, returnUrl: window.location.origin },
          });
          if (error) throw error;
          if (!data?.clientSecret) throw new Error('Checkout could not be started. Please try again.');
          return data.clientSecret;
        };

        const checkout = await stripe.initEmbeddedCheckout({ fetchClientSecret });
        if (cancelled) {
          try { checkout.destroy(); } catch { /* ignore */ }
          return;
        }
        checkoutRef.current = checkout;
        if (mountRef.current) {
          checkout.mount('#super-checkout');
          setStatus('ready');
          // Funnel: the embedded checkout is now live in front of the user. Safe,
          // non-PII (plan name only) — see lib/analytics.js.
          trackEvent(ANALYTICS_EVENTS.CHECKOUT_STARTED, { plan });
        }
      } catch (e) {
        if (cancelled) return;
        setErrorMsg(e?.message ? String(e.message) : 'Something went wrong starting checkout.');
        setStatus('error');
      }
    })();

    return () => {
      cancelled = true;
      if (checkoutRef.current) {
        try { checkoutRef.current.destroy(); } catch { /* ignore */ }
        checkoutRef.current = null;
      }
    };
  }, [plan, reloadKey]);

  const planLabel = plan === 'yearly' ? 'Super Yearly' : 'Super Monthly';

  return (
    <div className="sco-overlay" role="dialog" aria-modal="true" aria-labelledby="sco-title">
      <div className="sco-panel">
        <div className="sco-panel-head">
          <div className="sco-panel-head-main">
            <span className="sco-panel-icon" aria-hidden="true"><Crown size={20} /></span>
            <div>
              <div className="sco-eyebrow">Upgrade</div>
              <h1 id="sco-title" className="sco-title">{planLabel}</h1>
            </div>
          </div>
          <button type="button" className="sco-close" onClick={onClose} aria-label="Close checkout">
            <X size={18} />
          </button>
        </div>

        <div className="sco-scroll">
          {status === 'loading' && (
            <div className="sco-state" aria-live="polite">
              <Loader2 size={26} className="sco-spinner" aria-hidden="true" />
              <p className="sco-state-text">Loading secure checkout…</p>
            </div>
          )}

          {status === 'unconfigured' && (
            <div className="sco-state" aria-live="polite">
              <p className="sco-state-title">Checkout isn’t available yet</p>
              <p className="sco-state-text">
                Secure checkout isn’t configured on this environment yet. No payment has been collected.
              </p>
              <button type="button" className="sco-btn sco-btn-ghost" onClick={onClose}>Close</button>
            </div>
          )}

          {status === 'error' && (
            <div className="sco-state" aria-live="assertive">
              <p className="sco-state-title">We couldn’t start checkout</p>
              <p className="sco-state-text">{errorMsg}</p>
              <div className="sco-state-actions">
                <button type="button" className="sco-btn sco-btn-primary" onClick={() => setReloadKey(k => k + 1)}>
                  Try again
                </button>
                <button type="button" className="sco-btn sco-btn-ghost" onClick={onClose}>Close</button>
              </div>
            </div>
          )}

          {/* Stripe Embedded Checkout mounts here. Kept mounted so the ref is stable;
              shown only once Stripe reports it ready. */}
          <div
            id="super-checkout"
            ref={mountRef}
            className="sco-mount"
            style={{ display: status === 'ready' ? 'block' : 'none' }}
          />

          {status === 'ready' && (
            <>
              {isStripeTestMode && (
                <p className="sco-testmode-note" role="status">
                  Test mode — no real card is charged yet. Use Stripe's test card to try the flow.
                </p>
              )}
              <p className="sco-secure-note">
                Payments are securely processed by Stripe. You stay on Tuk Talk Thai the whole time.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
