import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Crown,
  Minus,
  Sparkles,
  Compass,
  Repeat2,
  ShieldCheck,
  Heart,
  Gift,
  CloudUpload,
  Loader2,
  Mail,
} from 'lucide-react';
import { STAGES } from '../data/taxonomy.js';
import { MINI_UNITS } from '../data/miniUnits.js';
import { SITE_CONFIG } from '../config/site.js';
import { PLANS } from '../config/entitlements.js';
import { isStripeTestMode } from '../config/stripe.js';
import { trackEvent, ANALYTICS_EVENTS } from '../lib/analytics.js';
import SuperCheckoutModal from './SuperCheckoutModal.jsx';
import SiteFooter from './SiteFooter.jsx';

// Plans / freemium page. Super checkout is LIVE (Stripe embedded checkout): a
// signed-in learner can subscribe right here. Free stays the complete, live
// experience — the entire guided path is free forever. Super's live, exclusive
// benefit today is the 18+ Dating & Real Talk section; the rest of the Super
// value (ad-free, extra practice, recovery, bonus packs) is advertised and
// labelled "soon" so nothing is oversold. We never gate the free path.

const FREEMIUM_POINTS = [
  {
    Icon: Compass,
    title: 'The path is always yours',
    text: `All ${STAGES.length} stages and ${MINI_UNITS.length} guided lessons are free. You progress by learning, never by paying to skip ahead.`,
  },
  {
    Icon: Sparkles,
    title: 'Free gets you speaking',
    text: 'Smart flashcards, quick checks, mini-lessons, streaks and XP are all included, free, from your very first lesson.',
  },
  {
    Icon: ShieldCheck,
    title: 'Super is for extras',
    text: 'Super unlocks the optional 18+ Dating & Real Talk section and unlimited hearts in the Challenge today, and adds consistency, convenience and bonus practice as more benefits ship — for learners who want a little extra.',
  },
];

// Feature comparison. `free` / `premium` are either true (check), false (dash),
// or a short string. `planned: true` marks a Premium value that is not built
// yet, so the UI can label it honestly.
const MATRIX = [
  { label: `The full guided journey (${STAGES.length} stages)`, free: true, premium: true },
  { label: 'Smart flashcards & spaced review', free: true, premium: true },
  { label: 'Quick checks & mini-lessons', free: true, premium: true },
  { label: 'Streaks, XP & quests', free: true, premium: true },
  { label: 'Cloud progress & account sync', free: true, premium: true },
  { label: 'Dating & Real Talk Thai (18+)', free: false, premium: true },
  { label: 'Support independent development', free: false, premium: true },
  // LIVE benefit — unlimited hearts is enforced today (effectiveHearts→∞), so it
  // must NOT be marked "soon" (E4). Free users get 5 that regenerate/refill.
  { label: 'Hearts in the Challenge', free: '5 · regen or refill', premium: 'Unlimited' },
  { label: 'Stays ad-free if ads are ever added', free: false, premium: 'Guaranteed', planned: true },
  { label: 'Flexible review & topic practice', free: 'Guided', premium: 'More flexible', planned: true },
  // String value (not boolean) so MatrixValue's planned/'soon' path renders —
  // a bare checkmark here contradicted the plan card's "(soon)" label.
  { label: 'Bonus & early-access mission packs', free: false, premium: 'Included', planned: true },
];

const FREE_INCLUDES = [
  'All 8 stages of the guided journey',
  'Smart flashcards & spaced review',
  'Quick checks & friendly mini-lessons',
  'Streaks, XP and quests',
  'Cloud progress & account sync',
];

const PREMIUM_INCLUDES = [
  { Icon: Heart, text: 'The 18+ Dating & Real Talk section — real flirting, dating and consent phrases (Super-exclusive)' },
  { Icon: Repeat2, text: 'Unlimited hearts in the Challenge — never wait to keep practicing' },
  { Icon: ShieldCheck, text: 'A focused, ad-free experience, guaranteed (soon)' },
  { Icon: Repeat2, text: 'More flexible review and topic practice (soon)' },
  { Icon: Gift, text: 'Bonus and early-access mission packs (soon)' },
  { Icon: CloudUpload, text: 'You directly support native review & better audio' },
];

const FAQ = [
  {
    q: 'Is Tuk Talk Thai really free?',
    a: 'Yes. The complete guided journey, including every stage and mission, flashcards, quick checks and mini lessons, is free to use today. You can learn and reach real Thai fluency without paying.',
  },
  {
    q: 'Do I have to pay to finish the course?',
    a: 'No. The learning path is free and stays that way. Super is about convenience and consistency, not about unlocking the content you need to progress.',
  },
  {
    q: 'How much is Super and how do I buy it?',
    a: 'Super is $4.99/month or $39.99/year. Checkout is live: sign in, tap Go Super, and complete secure checkout with Stripe right on this site. You can cancel anytime.',
  },
  {
    q: 'What does Super include?',
    a: 'Today Super unlocks the optional 18+ Dating & Real Talk section — practical dating, flirting and consent phrases — plus unlimited hearts in the Challenge, and it directly supports development. More Super extras (a guaranteed ad-free experience, more flexible practice, and bonus mission packs) are on the way and are labelled "soon" until they ship.',
  },
  {
    q: 'Will the free version get worse to push Super?',
    a: 'No. The free experience stays a genuinely good way to learn Thai. Super adds extras for people who want them. It does not take things away from free learners.',
  },
];

function MatrixValue({ value, planned }) {
  if (value === true) return <Check size={17} className="pl-matrix-yes" aria-label="Included" />;
  if (value === false) return <Minus size={16} className="pl-matrix-no" aria-label="Not included" />;
  return (
    <span className="pl-matrix-text">
      {value}
      {planned && <span className="pl-matrix-soon">soon</span>}
    </span>
  );
}

// Price from the central plans config. Prices are live ($4.99/mo, $39.99/yr), so
// the real amount always renders. The null branch is a defensive fallback only and
// should never trigger in normal operation — see config/entitlements.
function PlanPriceTag({ plan }) {
  if (plan.price === 0) {
    return <div className="pl-plan-price"><span className="pl-plan-amount">$0</span><span className="pl-plan-period">{plan.period}</span></div>;
  }
  if (plan.price == null) {
    return <div className="pl-plan-price"><span className="pl-plan-amount-tba">Pricing coming soon</span><span className="pl-plan-period">per {plan.period}</span></div>;
  }
  return <div className="pl-plan-price"><span className="pl-plan-amount">${plan.price}</span><span className="pl-plan-period">per {plan.period}</span></div>;
}

export default function PlansPage({ onNavigate, isAuthed = false, isSuperUser = false, onGetStarted, onSignIn, embedded = false, onBack, blockedReason = null }) {
  const [checkoutPlan, setCheckoutPlan] = useState(null); // 'monthly' | 'yearly' | null
  // eslint-disable-next-line react-hooks/exhaustive-deps -- one plans_viewed per visit
  useEffect(() => { trackEvent(ANALYTICS_EVENTS.PLANS_VIEWED, { authed: !!isAuthed }); }, []);

  const homePath = isAuthed ? '/learn' : '/get-started';
  const homeLabel = isAuthed ? 'Back to app' : 'Back to home';

  const navClick = (path) => (event) => {
    if (!onNavigate || event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    onNavigate(path);
  };

  const startFree = () => {
    // A signed-in viewer already HAS the free plan — "start" would navigate to
    // /get-started, which silently bounces a session-holder back into the app
    // with a stale URL (UX audit). Send them back to learning instead; the
    // labels below also swap to match.
    if (isAuthed) {
      if (onBack) onBack();
      else if (onNavigate) onNavigate('/learn');
      return;
    }
    if (onGetStarted) onGetStarted();
    else if (onNavigate) onNavigate('/get-started');
  };

  // Super CTA: a signed-in learner opens embedded checkout in-page for the chosen
  // plan; a signed-out visitor is sent to sign up first (you must have an account
  // to subscribe), matching the free flow. An ALREADY-Super user doesn't reach a
  // payable checkout from here (double-billing guard): the Super plan cards
  // render a "You're already Super" state instead of these CTAs, and this guard
  // is defense in depth behind that. Client-side only — the server-side
  // already-subscribed rejection in create-checkout-session is tracked for the
  // go-live pass.
  const startSuper = (plan) => () => {
    if (isSuperUser) {
      if (onNavigate) onNavigate('/settings');
      return;
    }
    // Wave 13 G/H: defense in depth behind the CTA swap below. A pending purchase
    // or an unconfirmed email must never reach a payable checkout.
    if (blockedReason) return;
    trackEvent(ANALYTICS_EVENTS.PREMIUM_FEATURE_TAPPED, { source: 'plans-page', plan });
    if (isAuthed) setCheckoutPlan(plan);
    else if (onGetStarted) onGetStarted();
    else if (onNavigate) onNavigate('/get-started');
  };

  // Rendered in place of the Go Super CTA on both Super plan cards when the
  // viewer already has an active Super subscription.
  const alreadySuperCta = (
    <div className="pl-plan-active" role="status">
      <span className="pl-plan-active-chip"><Crown size={15} aria-hidden="true" /> You're already Super</span>
      <button type="button" className="pl-plan-manage-link" onClick={() => onNavigate && onNavigate('/settings')}>
        Manage or cancel in Settings
      </button>
    </div>
  );

  // ── WAVE 13 items G + H: one honest "you cannot buy right now" surface ─────
  // G — THE DOUBLE-CHARGE MOTIVE. Every previous guard read isSuper(stats), which
  // is FALSE for the minutes between paying and the webhook landing — precisely
  // when a confused payer is most likely to press Go Super again. A second press
  // created a second Stripe customer, a second subscription and a second recurring
  // charge. `blockedReason` is driven by a PENDING-PURCHASE flag instead, so the
  // CTA is unavailable from the moment Stripe returns until the entitlement lands.
  // H — the same surface covers an unconfirmed-email session, which could reach
  // this page because the /plans branch renders before the confirmation gate.
  const blockedCta = blockedReason ? (
    <div className="pl-plan-blocked" role="status">
      <span className="pl-plan-blocked-chip">
        {blockedReason === 'pending'
          ? <><Loader2 size={15} className="pl-plan-blocked-spin" aria-hidden="true" /> Activating your Super…</>
          : <><Mail size={15} aria-hidden="true" /> Confirm your email first</>}
      </span>
      <span className="pl-plan-blocked-note">
        {blockedReason === 'pending'
          ? 'Your payment went through — Super switches on automatically, usually within a few minutes. No need to pay again.'
          : 'Check your inbox for the confirmation link, then you can subscribe.'}
      </span>
    </div>
  ) : null;

  return (
    <main className={`pl-page${embedded ? ' pl-page-embedded' : ''}`}>
      {/* Standalone (anonymous / legal) view keeps the marketing topbar. In-shell
          (signed-in) view drops it — the app header + sidebar/bottom nav already
          frame the page — and shows a compact "Back to app" row instead. */}
      {embedded ? (
        <div className="pl-shell pl-embedded-back-row">
          <button
            type="button"
            className="pl-embedded-back"
            onClick={() => (onBack ? onBack() : onNavigate && onNavigate('/learn'))}
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Back to app
          </button>
        </div>
      ) : (
        <header className="pl-topbar">
          <div className="pl-shell pl-topbar-inner">
            <a className="pl-brand" href={homePath} onClick={navClick(homePath)}>
              <span className="pl-brand-name">{SITE_CONFIG.siteName}</span>
              <span className="pl-brand-slogan">{SITE_CONFIG.slogan}</span>
            </a>
            <a className="pl-topbar-back" href={homePath} onClick={navClick(homePath)}>
              <ArrowLeft size={16} aria-hidden="true" />
              {homeLabel}
            </a>
          </div>
        </header>
      )}

      {isStripeTestMode && (
        <div className="pl-shell">
          <div className="pl-testmode-banner" role="status">
            <ShieldCheck size={15} aria-hidden="true" />
            <span>
              <strong>Test mode.</strong> Checkout is fully working, but payments use Stripe test
              mode — no real card is charged yet while we finish setup.
            </span>
          </div>
        </div>
      )}

      {isSuperUser && (
        <div className="pl-shell">
          <div className="pl-already-super-banner" role="status">
            <Crown size={15} aria-hidden="true" />
            <span>
              <strong>You're already Super.</strong> Thanks for supporting Tuk Talk Thai! You can
              manage or cancel your plan anytime in{' '}
              <button type="button" className="pl-inline-link" onClick={() => onNavigate && onNavigate('/settings')}>
                Settings
              </button>.
            </span>
          </div>
        </div>
      )}

      <section className="pl-hero">
        <div className="pl-shell pl-hero-inner">
          <span className="pl-eyebrow">Plans &amp; pricing</span>
          <h1 className="pl-hero-title">Free to learn. Super for momentum.</h1>
          <p className="pl-hero-sub">
            Tuk Talk Thai keeps the whole guided journey free. You pay only if you want a smoother,
            more consistent ride. No paywalls on the path to speaking Thai.
          </p>
          <div className="pl-hero-actions">
            <button type="button" className="pl-cta-primary" onClick={startFree}>
              {isAuthed ? 'Back to learning' : 'Start free'}
              <ArrowRight size={18} aria-hidden="true" />
            </button>
            {!isAuthed && onSignIn && (
              <button type="button" className="pl-cta-ghost" onClick={onSignIn}>
                I already have an account
              </button>
            )}
          </div>
          <p className="pl-hero-note">
            {isAuthed
              ? 'The whole guided path is already yours, free. Upgrade to Super anytime.'
              : 'Start free — no card needed. Upgrade to Super anytime.'}
          </p>
        </div>
      </section>

      {/* How freemium works */}
      <section className="pl-how">
        <div className="pl-shell">
          <div className="pl-section-head">
            <span className="pl-eyebrow">How freemium works</span>
            <h2 className="pl-h2">You pay for the experience, not the path</h2>
          </div>
          <div className="pl-how-grid">
            {FREEMIUM_POINTS.map(({ Icon, title, text }) => (
              <article className="pl-how-card" key={title}>
                <span className="pl-how-icon"><Icon size={20} aria-hidden="true" /></span>
                <h3 className="pl-how-title">{title}</h3>
                <p className="pl-how-text">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Plan cards — Free / Super Monthly / Super Yearly (from config) */}
      <section className="pl-plans">
        <div className="pl-shell pl-plans-grid">
          <article className="pl-plan pl-plan-free">
            <div className="pl-plan-head">
              <span className="pl-plan-name">{PLANS.free.name}</span>
              <span className="pl-plan-tag pl-plan-tag-live">Available now</span>
            </div>
            <PlanPriceTag plan={PLANS.free} />
            <p className="pl-plan-blurb">{PLANS.free.tagline} Everything you need to start speaking Thai, from your first lesson.</p>
            <button type="button" className="pl-cta-primary pl-plan-cta" onClick={startFree}>
              {isAuthed ? 'Your plan — keep learning' : PLANS.free.cta}
              <ArrowRight size={17} aria-hidden="true" />
            </button>
            <ul className="pl-plan-list">
              {FREE_INCLUDES.map(item => (
                <li key={item}><Check size={16} aria-hidden="true" /> {item}</li>
              ))}
            </ul>
          </article>

          <article className="pl-plan pl-plan-premium">
            <div className="pl-plan-head">
              <span className="pl-plan-name">{PLANS.superMonthly.name}</span>
              <span className="pl-plan-tag pl-plan-tag-live">Available now</span>
            </div>
            <PlanPriceTag plan={PLANS.superMonthly} />
            <p className="pl-plan-blurb">{PLANS.superMonthly.tagline} Everything in Free, plus:</p>
            {isSuperUser ? alreadySuperCta : blockedCta || (
              <button type="button" className="pl-cta-primary pl-plan-cta" onClick={startSuper('monthly')}>
                {isAuthed ? 'Go Super' : 'Sign up to go Super'}
                <ArrowRight size={17} aria-hidden="true" />
              </button>
            )}
            <ul className="pl-plan-list">
              {PREMIUM_INCLUDES.map(({ Icon, text }) => (
                <li key={text}><Icon size={16} aria-hidden="true" /> {text}</li>
              ))}
            </ul>
            <p className="pl-plan-foot">Secure checkout by Stripe. Cancel anytime.</p>
          </article>

          <article className="pl-plan pl-plan-premium">
            {PLANS.superYearly.badge && <span className="pl-plan-badge">{PLANS.superYearly.badge}</span>}
            <div className="pl-plan-head">
              <span className="pl-plan-name">{PLANS.superYearly.name}</span>
              <span className="pl-plan-tag pl-plan-tag-live">Available now</span>
            </div>
            <PlanPriceTag plan={PLANS.superYearly} />
            <p className="pl-plan-blurb">{PLANS.superYearly.tagline} Everything in Super Monthly, billed yearly.</p>
            {isSuperUser ? alreadySuperCta : blockedCta || (
              <button type="button" className="pl-cta-primary pl-plan-cta" onClick={startSuper('yearly')}>
                {isAuthed ? 'Choose yearly' : 'Sign up for yearly'}
              </button>
            )}
            <ul className="pl-plan-list">
              <li><Check size={16} aria-hidden="true" /> Everything in Super Monthly</li>
              <li><Check size={16} aria-hidden="true" /> Best price per month</li>
              <li><Check size={16} aria-hidden="true" /> One simple yearly payment</li>
            </ul>
            <p className="pl-plan-foot">Secure checkout by Stripe. Cancel anytime.</p>
          </article>
        </div>
      </section>

      {/* Feature matrix */}
      <section className="pl-matrix-section">
        <div className="pl-shell">
          <div className="pl-section-head">
            <span className="pl-eyebrow">Compare</span>
            <h2 className="pl-h2">Free vs Super, at a glance</h2>
          </div>
          <div className="pl-matrix-wrap" role="table" aria-label="Free vs Super comparison">
            <div className="pl-matrix-row pl-matrix-header" role="row">
              <span className="pl-matrix-feature" role="columnheader">Feature</span>
              <span className="pl-matrix-col" role="columnheader">Free</span>
              <span className="pl-matrix-col" role="columnheader">Super</span>
            </div>
            {MATRIX.map(row => (
              <div className="pl-matrix-row" role="row" key={row.label}>
                <span className="pl-matrix-feature" role="cell">{row.label}</span>
                <span className="pl-matrix-col" role="cell"><MatrixValue value={row.free} /></span>
                <span className="pl-matrix-col" role="cell"><MatrixValue value={row.premium} planned={row.planned} /></span>
              </div>
            ))}
          </div>
          <p className="pl-matrix-note">
            <Sparkles size={13} aria-hidden="true" /> Items marked <strong>soon</strong> are Super
            benefits we're still building and aren't active yet. The 18+ Dating &amp; Real Talk
            section is live for Super now.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="pl-faq">
        <div className="pl-shell">
          <div className="pl-section-head">
            <span className="pl-eyebrow">FAQ</span>
            <h2 className="pl-h2">Questions about plans</h2>
          </div>
          <div className="pl-faq-list">
            {FAQ.map(({ q, a }) => (
              <details className="pl-faq-item" key={q}>
                <summary className="pl-faq-q">{q}</summary>
                <p className="pl-faq-a">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="pl-cta-band">
        <div className="pl-shell pl-cta-inner">
          <h2 className="pl-cta-title">
            {isAuthed ? 'Your next mission is waiting.' : 'Start free and see how far the path takes you.'}
          </h2>
          <p className="pl-cta-sub">Learn something you can actually say in Thailand today.</p>
          <button type="button" className="pl-cta-primary pl-cta-band-btn" onClick={startFree}>
            {isAuthed ? 'Back to learning' : 'Start your first lesson'}
            <ArrowRight size={18} aria-hidden="true" />
          </button>
          <a className="pl-cta-back" href={homePath} onClick={navClick(homePath)}>{homeLabel}</a>
        </div>
      </section>

      {checkoutPlan && (
        <SuperCheckoutModal
          plan={checkoutPlan}
          alreadySuper={isSuperUser}
          onClose={() => setCheckoutPlan(null)}
        />
      )}

      {/* Standalone (anonymous / marketing) plans page gets the shared footer so
          it doesn't end in a void. The embedded (in-shell) variant does NOT —
          the app shell frames it and shouldn't carry a marketing footer. */}
      {!embedded && <SiteFooter onNavigate={onNavigate} variant="slim" />}
    </main>
  );
}
