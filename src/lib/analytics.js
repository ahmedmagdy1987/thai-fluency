// In-house, dependency-free analytics. NO external packages, NO third-party
// network beacons. Emits a small set of SAFE, non-PII product events so we can
// understand the upgrade funnel without shipping a tracking SDK.
//
// Sinks: (1) console.debug in dev; (2) a bounded ring buffer in localStorage so
// recent events can be inspected and a future first-party cloud sink (e.g. a
// Supabase `events` table) can drain them. Never throws — analytics must never
// break the app.

export const ANALYTICS_EVENTS = {
  PLANS_VIEWED: 'plans_viewed',
  PREMIUM_FEATURE_TAPPED: 'premium_feature_tapped',
  UPGRADE_MODAL_SHOWN: 'upgrade_modal_shown',
  UPGRADE_MODAL_DISMISSED: 'upgrade_modal_dismissed',
  // Both funnel events are WIRED: CHECKOUT_STARTED fires when the embedded
  // checkout mounts (SuperCheckoutModal), SUBSCRIPTION_ACTIVATED fires on the
  // server-confirmed ?super=success return (App.jsx checkout-return effect).
  // Events currently land in the local ring buffer below only — there is no
  // cloud sink yet (see docs/analytics-wiring-findings.md).
  CHECKOUT_STARTED: 'checkout_started',
  SUBSCRIPTION_ACTIVATED: 'subscription_activated',
};

const ALLOWED = new Set(Object.values(ANALYTICS_EVENTS));
const EVENT_LOG_KEY = 'tuk-talk-thai-events-v1';
const MAX_EVENTS = 50;

// Keep only primitive, non-PII props (string/number/boolean) and cap string
// length, so a stray object/email can never be logged or persisted.
function sanitize(props) {
  const out = {};
  if (!props || typeof props !== 'object') return out;
  for (const [k, v] of Object.entries(props)) {
    if (typeof v === 'string') out[k] = v.slice(0, 80);
    else if (typeof v === 'number' && Number.isFinite(v)) out[k] = v;
    else if (typeof v === 'boolean') out[k] = v;
  }
  return out;
}

export function trackEvent(name, props = {}) {
  try {
    if (!ALLOWED.has(name)) return;
    const event = { name, props: sanitize(props), at: new Date().toISOString() };
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.debug('[analytics]', name, event.props);
    }
    if (typeof localStorage !== 'undefined') {
      let log = [];
      try { log = JSON.parse(localStorage.getItem(EVENT_LOG_KEY)) || []; } catch { log = []; }
      if (!Array.isArray(log)) log = [];
      log.push(event);
      if (log.length > MAX_EVENTS) log = log.slice(-MAX_EVENTS);
      localStorage.setItem(EVENT_LOG_KEY, JSON.stringify(log));
    }
  } catch (e) { /* analytics must never crash the app */ }
}

// For debugging / a future cloud drain.
export function getRecentEvents() {
  try {
    if (typeof localStorage !== 'undefined') {
      const log = JSON.parse(localStorage.getItem(EVENT_LOG_KEY));
      return Array.isArray(log) ? log : [];
    }
  } catch (e) { /* ignore */ }
  return [];
}
