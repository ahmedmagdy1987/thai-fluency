import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Minus,
  Sparkles,
  Compass,
  Repeat2,
  ShieldCheck,
  Heart,
  Gift,
  CloudUpload,
} from 'lucide-react';
import { STAGES } from '../data/taxonomy.js';
import { MINI_UNITS } from '../data/miniUnits.js';
import { SITE_CONFIG } from '../config/site.js';
import { PLANS } from '../config/entitlements.js';
import { trackEvent, ANALYTICS_EVENTS } from '../lib/analytics.js';
import SuperCheckoutModal from './SuperCheckoutModal.jsx';

// Plans / freemium page. Super checkout is now live in beta (Stripe test mode):
// a signed-in learner can open embedded checkout right here. Free stays the
// complete, live experience. The paid value is framed around consistency,
// convenience, fewer interruptions, recovery and bonus content - NOT around
// "pay to skip the journey" (the curated path stays free and intact). Some Super
// benefits are still being built and are labelled "soon" so nothing is oversold.

const FREEMIUM_POINTS = [
  {
    Icon: Compass,
    title: 'The path is always yours',
    text: `All ${STAGES.length} stages and ${MINI_UNITS.length} guided missions are free. You progress by learning, never by paying to skip ahead.`,
  },
  {
    Icon: Sparkles,
    title: 'Free gets you speaking',
    text: 'Smart flashcards, quick checks, mini-lessons, streaks and XP are all included, free, from your very first mission.',
  },
  {
    Icon: ShieldCheck,
    title: 'Premium is for momentum',
    text: 'When it launches, Super adds consistency, convenience and bonus practice for learners who want fewer interruptions and a little more flexibility.',
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
  { label: 'Stays ad-free if ads are ever added', free: false, premium: 'Guaranteed', planned: true },
  { label: 'Extra practice & recovery (hearts)', free: 'Standard', premium: 'Extra', planned: true },
  { label: 'Flexible review & topic practice', free: 'Guided', premium: 'More flexible', planned: true },
  { label: 'Bonus & early-access mission packs', free: false, premium: true, planned: true },
  { label: 'Support independent development', free: false, premium: true },
];

const FREE_INCLUDES = [
  'All 8 stages of the guided journey',
  'Smart flashcards & spaced review',
  'Quick checks & friendly mini-lessons',
  'Streaks, XP and quests',
  'Cloud progress & account sync',
];

const PREMIUM_INCLUDES = [
  { Icon: ShieldCheck, text: 'A focused, ad-free experience, guaranteed' },
  { Icon: Heart, text: 'Extra practice & gentle recovery so a bad day never blocks you' },
  { Icon: Repeat2, text: 'More flexible review and topic practice' },
  { Icon: Gift, text: 'Bonus and early-access mission packs' },
  { Icon: CloudUpload, text: 'You directly support native review & better audio' },
];

const FAQ = [
  {
    q: 'Is Tuk Talk Thai really free?',
    a: 'Yes. The complete guided journey, including every stage and mission, flashcards, quick checks and mini lessons, is free to use today. You can learn and reach real Thai fluency without paying.',
  },
  {
    q: 'Do I have to pay to finish the course?',
    a: 'No. The learning path is free and stays that way. Premium is about convenience and consistency, not about unlocking the content you need to progress.',
  },
  {
    q: 'How much is Super and how do I buy it?',
    a: 'Super comes in monthly and yearly options. Checkout is live in a secure beta (test mode) via Stripe — sign in, tap Get Super, and complete checkout right on this site. Final launch prices are still being confirmed, so they are shown as "Pricing coming soon" until announced.',
  },
  {
    q: 'What will Premium include?',
    a: 'It is planned around momentum: a guaranteed ad-free experience, extra practice and recovery, more flexible review, and bonus or early-access mission packs. The exact set is finalized before launch.',
  },
  {
    q: 'Will the free version get worse to push Premium?',
    a: 'No. The free experience stays a genuinely good way to learn Thai. Premium adds extras for people who want them. It does not take things away from free learners.',
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

// Price from the central plans config. NEVER invents a number: a null price (no
// pricing supplied yet) renders "Pricing coming soon" — see config/entitlements.
function PlanPriceTag({ plan }) {
  if (plan.price === 0) {
    return <div className="pl-plan-price"><span className="pl-plan-amount">$0</span><span className="pl-plan-period">{plan.period}</span></div>;
  }
  if (plan.price == null) {
    return <div className="pl-plan-price"><span className="pl-plan-amount-tba">Pricing coming soon</span><span className="pl-plan-period">per {plan.period}</span></div>;
  }
  return <div className="pl-plan-price"><span className="pl-plan-amount">${plan.price}</span><span className="pl-plan-period">per {plan.period}</span></div>;
}

export default function PlansPage({ onNavigate, isAuthed = false, onGetStarted, onSignIn }) {
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
    if (onGetStarted) onGetStarted();
    else if (onNavigate) onNavigate('/get-started');
  };

  // Super CTA: a signed-in learner opens embedded checkout in-page for the chosen
  // plan; a signed-out visitor is sent to sign up first (you must have an account
  // to subscribe), matching the free flow.
  const startSuper = (plan) => () => {
    trackEvent(ANALYTICS_EVENTS.PREMIUM_FEATURE_TAPPED, { source: 'plans-page', plan });
    if (isAuthed) setCheckoutPlan(plan);
    else if (onGetStarted) onGetStarted();
    else if (onNavigate) onNavigate('/get-started');
  };

  return (
    <main className="pl-page">
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

      <section className="pl-hero">
        <div className="pl-shell pl-hero-inner">
          <span className="pl-eyebrow">Plans &amp; pricing</span>
          <h1 className="pl-hero-title">Free to learn. Premium for momentum.</h1>
          <p className="pl-hero-sub">
            Tuk Talk Thai keeps the whole guided journey free. You pay only if you want a smoother,
            more consistent ride. No paywalls on the path to speaking Thai.
          </p>
          <div className="pl-hero-actions">
            <button type="button" className="pl-cta-primary" onClick={startFree}>
              Start free
              <ArrowRight size={18} aria-hidden="true" />
            </button>
            {onSignIn && (
              <button type="button" className="pl-cta-ghost" onClick={onSignIn}>
                I already have an account
              </button>
            )}
          </div>
          <p className="pl-hero-note">No card needed. No payment is collected during the beta.</p>
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
            <p className="pl-plan-blurb">{PLANS.free.tagline} Everything you need to start speaking Thai, from your first mission.</p>
            <button type="button" className="pl-cta-primary pl-plan-cta" onClick={startFree}>
              {PLANS.free.cta}
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
              <span className="pl-plan-tag pl-plan-tag-soon">Beta</span>
            </div>
            <PlanPriceTag plan={PLANS.superMonthly} />
            <p className="pl-plan-blurb">{PLANS.superMonthly.tagline} Everything in Free, plus:</p>
            <button type="button" className="pl-cta-primary pl-plan-cta" onClick={startSuper('monthly')}>
              {isAuthed ? 'Get Super' : 'Sign up to go Super'}
              <ArrowRight size={17} aria-hidden="true" />
            </button>
            <ul className="pl-plan-list">
              {PREMIUM_INCLUDES.map(({ Icon, text }) => (
                <li key={text}><Icon size={16} aria-hidden="true" /> {text}</li>
              ))}
            </ul>
            <p className="pl-plan-foot">Checkout runs in secure beta (test mode). Cancel anytime; billing is handled by Stripe.</p>
          </article>

          <article className="pl-plan pl-plan-premium">
            {PLANS.superYearly.badge && <span className="pl-plan-badge">{PLANS.superYearly.badge}</span>}
            <div className="pl-plan-head">
              <span className="pl-plan-name">{PLANS.superYearly.name}</span>
              <span className="pl-plan-tag pl-plan-tag-soon">Beta</span>
            </div>
            <PlanPriceTag plan={PLANS.superYearly} />
            <p className="pl-plan-blurb">{PLANS.superYearly.tagline} Everything in Super Monthly, billed yearly.</p>
            <button type="button" className="pl-cta-ghost pl-plan-cta" onClick={startSuper('yearly')}>
              {isAuthed ? 'Choose yearly' : 'Sign up for yearly'}
            </button>
            <ul className="pl-plan-list">
              <li><Check size={16} aria-hidden="true" /> Everything in Super Monthly</li>
              <li><Check size={16} aria-hidden="true" /> Best price per month</li>
              <li><Check size={16} aria-hidden="true" /> One simple yearly payment</li>
            </ul>
            <p className="pl-plan-foot">Checkout runs in secure beta (test mode). Cancel anytime; billing is handled by Stripe.</p>
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
            <Sparkles size={13} aria-hidden="true" /> Items marked <strong>soon</strong> are planned Super
            benefits and are not active during the beta.
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
          <h2 className="pl-cta-title">Start free and see how far the path takes you.</h2>
          <p className="pl-cta-sub">Learn something you can actually say in Thailand today.</p>
          <button type="button" className="pl-cta-primary pl-cta-band-btn" onClick={startFree}>
            Start your first mission
            <ArrowRight size={18} aria-hidden="true" />
          </button>
          <a className="pl-cta-back" href={homePath} onClick={navClick(homePath)}>{homeLabel}</a>
        </div>
      </section>

      {checkoutPlan && (
        <SuperCheckoutModal plan={checkoutPlan} onClose={() => setCheckoutPlan(null)} />
      )}
    </main>
  );
}
