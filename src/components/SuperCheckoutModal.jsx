import React, { useEffect, useRef, useState } from 'react';
import { X, Crown, Loader2 } from 'lucide-react';
import { SITE_CONFIG } from '../config/site.js';
import { supabase } from '../lib/supabase.js';
import { STRIPE_PUBLISHABLE_KEY, hasStripeConfig, loadStripeJs } from '../config/stripe.js';

// Full-screen Super checkout. Keeps the Tuk Talk Thai brand header + a close (X)
// visible so the user never feels they left the site: Stripe's Embedded Checkout
// mounts INSIDE our own frame (#super-checkout), not a redirect. On open it loads
// Stripe.js once, creates an embedded checkout whose clientSecret is fetched from
// the auth-gated create-checkout-session Edge Function, and mounts it. The
// embedded instance is destroyed on close/unmount so re-opening starts clean.
//
// Honest failure modes: no Stripe config → friendly "not configured" note;
// script/session/network failure → an error state with a Try again button. No
// payment is ever faked — a real Stripe session backs the form.
export default function SuperCheckoutModal({ plan = 'monthly', onClose }) {
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'error' | 'unconfigured'
  const [errorMsg, setErrorMsg] = useState('');
  const mountRef = useRef(null);
  const checkoutRef = useRef(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Close on Escape for keyboard users.
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
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
        if (!Stripe) throw new Error('Could not load the secure checkout. Check your connection and try again.');

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
      <header className="sco-header">
        <div className="sco-brand">
          <span className="sco-brand-name">{SITE_CONFIG.siteName}</span>
          <span className="sco-brand-slogan">{SITE_CONFIG.slogan}</span>
        </div>
        <button type="button" className="sco-close" onClick={onClose} aria-label="Close checkout">
          <X size={20} />
        </button>
      </header>

      <div className="sco-body">
        <div className="sco-panel">
          <div className="sco-panel-head">
            <span className="sco-panel-icon" aria-hidden="true"><Crown size={20} /></span>
            <div>
              <div className="sco-eyebrow">Upgrade</div>
              <h1 id="sco-title" className="sco-title">{planLabel}</h1>
            </div>
          </div>

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
                Secure checkout isn’t configured on this environment. Please check back soon — no payment
                has been collected.
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

          {/* Stripe Embedded Checkout mounts here. Kept in the tree across states
              so the ref is stable; hidden until Stripe reports it ready. */}
          <div
            id="super-checkout"
            ref={mountRef}
            className="sco-mount"
            style={{ display: status === 'ready' ? 'block' : 'none' }}
          />

          <p className="sco-secure-note">
            Payments are securely processed by Stripe. You stay on {SITE_CONFIG.siteName} the whole time.
          </p>
        </div>
      </div>
    </div>
  );
}
