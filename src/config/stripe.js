// Stripe client config. The publishable key is public (safe to ship in the
// bundle) — it only identifies the account and cannot move money on its own; the
// secret key lives ONLY in the Supabase Edge Function secrets. If the key is
// missing (dev clone without Stripe set up), hasStripeConfig is false and the
// checkout modal shows a friendly "checkout not configured" message instead of
// trying to load Stripe.js.
//
// NEVER hardcode a key here — it comes from VITE_STRIPE_PUBLISHABLE_KEY (set in
// .env.local for local dev, and in Vercel env for production).

export const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';
export const hasStripeConfig = !!STRIPE_PUBLISHABLE_KEY;

// TEST-mode price IDs (NOT secret — safe to ship). These mirror the Edge
// Function's plan→price mapping so client and server agree; the server is still
// the authority (it re-maps plan→price and can override via env).
export const SUPER_PRICES = {
  monthly: 'price_1TpHZ4I2GsV6FCeik4eF996s',
  yearly: 'price_1TpHZ5I2GsV6FCei0IEpeZkh',
};

// Load Stripe.js exactly once. Injects <script src="https://js.stripe.com/v3">
// at runtime (no npm dependency) and resolves window.Stripe. Idempotent:
// concurrent/repeat callers share a single in-flight promise, and a script that
// is already present is reused. Resolves null (never throws) if the script fails
// to load so callers can render an error state instead of crashing.
let stripeJsPromise = null;

export function loadStripeJs() {
  if (typeof window === 'undefined') return Promise.resolve(null);
  if (window.Stripe) return Promise.resolve(window.Stripe);
  if (stripeJsPromise) return stripeJsPromise;

  stripeJsPromise = new Promise((resolve) => {
    const SRC = 'https://js.stripe.com/v3';
    const finish = () => resolve(window.Stripe || null);

    const existing = document.querySelector(`script[src="${SRC}"]`);
    if (existing) {
      if (window.Stripe) { finish(); return; }
      existing.addEventListener('load', finish, { once: true });
      existing.addEventListener('error', () => { stripeJsPromise = null; resolve(null); }, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = SRC;
    script.async = true;
    script.addEventListener('load', finish, { once: true });
    script.addEventListener('error', () => { stripeJsPromise = null; resolve(null); }, { once: true });
    document.head.appendChild(script);
  });

  return stripeJsPromise;
}
