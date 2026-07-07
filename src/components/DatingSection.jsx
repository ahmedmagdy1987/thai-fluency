import React, { useEffect, useMemo } from 'react';
import { Heart, ShieldCheck, AlertTriangle, Crown, FileClock, Volume2, Lock } from 'lucide-react';
import { DATING_SECTION, DATING_CATEGORIES, DATING_REVIEW_COMPLETE } from '../data/datingContent.js';
import { DATING_PHRASES } from '../data/datingPhrases.js';
import { isSuper } from '../config/entitlements.js';
import { trackEvent, ANALYTICS_EVENTS } from '../lib/analytics.js';

// "Dating & Real Talk Thai" — OPTIONAL, 18+, mature language, NOT part of course
// progress. This section is Super-EXCLUSIVE:
//   • Non-subscribers see an attractive LOCKED TEASER (what's inside, 18+ badge,
//     an "Unlock with Super" button → /plans). No unreviewed Thai is shown.
//   • Super subscribers see the FIRST BATCH of draft phrases (datingPhrases.js)
//     grouped by category, behind an honest "Draft — pending native review"
//     banner that does NOT claim the content is reviewed.
// Content stays within a tasteful adult boundary (see datingContent.js /
// datingPhrases.js safety notes).
//
// BADGE POLICY (owner requirement — do not remove badges):
//   Badges are the safety/clarity backbone of this section and must stay visible
//   on cards, category headers, teaser rows, and any future interactive screens.
//   The Super gate hides PHRASES (Thai/phonetics/examples/explanations) from
//   locked users — never the 18+/Super/severity/review-status badges, which are
//   English-only metadata and safe to show in the teaser.

const SEVERITY_LABEL = {
  gentle: 'Gentle',
  moderate: 'Casual',
  strong: 'Handle with care',
  safety: 'Safety',
};

// Per-category severity carries an overall tone label for the section header.
const CAT_SEVERITY_LABEL = {
  gentle: 'Gentle',
  moderate: 'Casual',
  strong: 'Handle with care',
  safety: 'Safety',
};

// Usage guidance derived from the reviewer-set severity. Safety phrases (consent,
// boundaries, getting home) are exactly the ones a learner SHOULD use.
const USAGE_GUIDANCE = {
  gentle: { label: 'Safe to use', cls: 'safe' },
  moderate: { label: 'Use carefully', cls: 'careful' },
  strong: { label: 'Don’t use casually', cls: 'avoid' },
  safety: { label: 'Safe to use', cls: 'safe' },
};

// Language-register flag for categories whose register itself needs a warning.
const CATEGORY_REGISTER = {
  'casual-slang': { label: 'Slang', cls: 'slang' },
  'mild-swears-insults': { label: 'Rude', cls: 'rude' },
};

// Native-review status → badge. Every phrase/category carries reviewStatus; the
// labels flip automatically when the native reviewer marks items approved.
const REVIEW_STATUS = {
  pending: { label: 'Native review pending', cls: 'review-pending' },
  approved: { label: 'Native approved', cls: 'review-approved' },
  'needs-review': { label: 'Needs review', cls: 'review-needs' },
};
const reviewBadge = (status) => REVIEW_STATUS[status] || REVIEW_STATUS.pending;

// All shipped phrases are male-polite form (ผม / ครับ) per the app-wide
// male-default voice convention; badge it so female learners know to swap.
const isMaleForm = (p) => /ครับ|ผม/.test(`${p.thai} ${p.example ? p.example.thai : ''}`);

export default function DatingSection({ stats, onOpenSuper }) {
  const superUser = isSuper(stats);

  // Reaching this gated section is an intentional premium tap. Record whether the
  // viewer is locked (upsell impression) or a subscriber (content view).
  useEffect(() => {
    trackEvent(ANALYTICS_EVENTS.PREMIUM_FEATURE_TAPPED, {
      source: 'dating-section',
      state: superUser ? 'unlocked' : 'locked',
    });
  }, [superUser]);

  const seeSuper = () => {
    trackEvent(ANALYTICS_EVENTS.PREMIUM_FEATURE_TAPPED, { source: 'dating-unlock-super' });
    if (onOpenSuper) onOpenSuper();
  };

  const speak = (thai) => {
    try {
      if (typeof window === 'undefined' || !window.speechSynthesis) return;
      const u = new SpeechSynthesisUtterance(thai);
      u.lang = 'th-TH';
      u.rate = 0.9;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    } catch {
      /* speech synthesis is best-effort only */
    }
  };

  // Group the draft phrases by category, preserving DATING_CATEGORIES order and
  // only showing categories that actually have phrases in this batch.
  const groups = useMemo(() => {
    const byCat = new Map();
    for (const p of DATING_PHRASES) {
      if (!byCat.has(p.cat)) byCat.set(p.cat, []);
      byCat.get(p.cat).push(p);
    }
    return DATING_CATEGORIES
      .filter((c) => byCat.has(c.id))
      .map((c) => ({ cat: c, phrases: byCat.get(c.id) }));
  }, []);

  const totalPhrases = DATING_PHRASES.length;

  const hero = (
    <header className="dating-hero">
      <div className="dating-badges">
        <span className="dating-badge dating-badge-18" aria-label="18 plus">18+</span>
        <span className="dating-badge dating-badge-mature">Mature language</span>
        <span className="dating-badge dating-badge-super"><Crown size={12} aria-hidden="true" /> Super</span>
        {DATING_REVIEW_COMPLETE ? (
          <span className="dating-badge dating-badge-reviewed"><ShieldCheck size={12} aria-hidden="true" /> Native reviewed</span>
        ) : (
          <span className="dating-badge dating-badge-draft"><FileClock size={12} aria-hidden="true" /> Native review pending</span>
        )}
      </div>
      <h1 className="dating-title"><Heart size={22} aria-hidden="true" /> {DATING_SECTION.title}</h1>
      <p className="dating-tagline">{DATING_SECTION.tagline}</p>
      <p className="dating-safety"><ShieldCheck size={15} aria-hidden="true" /> {DATING_SECTION.safetyNote}</p>
    </header>
  );

  // ── LOCKED TEASER (non-subscribers) ───────────────────────────────────────
  // Explains what's inside using ENGLISH INTENTS ONLY (no unreviewed Thai), shows
  // the 18+ badge, and routes to /plans via onOpenSuper. Reuses the locked-premium
  // visual language for consistency with the rest of the app.
  if (!superUser) {
    return (
      <div className="tab-content dating-section">
        {hero}

        <section className="locked-premium-card dating-locked" role="group" aria-label="Dating & Real Talk Thai — Super feature">
          <div className="locked-premium-icon" aria-hidden="true"><Lock size={22} /></div>
          <div className="locked-premium-badges">
            <span className="locked-premium-badge locked-premium-badge-super"><Crown size={12} aria-hidden="true" /> Super</span>
            <span className="locked-premium-badge locked-premium-badge-flag">18+</span>
          </div>
          <h2 className="locked-premium-title">Unlock Dating &amp; Real Talk with Super</h2>
          <p className="locked-premium-desc">
            An optional, adults-only section with {totalPhrases}+ practical phrases for real dating in
            Thailand — flirting and compliments, asking someone out, feelings and relationships,
            boundaries and consent, polite rejection, and getting home safe. Each phrase comes with
            phonetics, an example, and a tone/severity note.
          </p>

          <ul className="dating-teaser-list">
            {DATING_CATEGORIES.map((cat) => (
              <li className="dating-teaser-item" key={cat.id}>
                <div className="dating-teaser-item-head">
                  <span className="dating-teaser-item-name">{cat.name}</span>
                  <span className={`dating-cat-sev dating-cat-sev-${cat.severity}`}>
                    {CAT_SEVERITY_LABEL[cat.severity]}
                  </span>
                </div>
                <span className="dating-teaser-item-blurb">{cat.blurb}</span>
                <span className="dating-teaser-item-badges">
                  {CATEGORY_REGISTER[cat.id] && (
                    <span className={`dating-chip dating-chip-${CATEGORY_REGISTER[cat.id].cls}`}>
                      {CATEGORY_REGISTER[cat.id].label}
                    </span>
                  )}
                  <span className={`dating-chip dating-chip-${reviewBadge(cat.reviewStatus).cls}`}>
                    {reviewBadge(cat.reviewStatus).label}
                  </span>
                </span>
                {cat.handleWithCare && (
                  <span className="dating-teaser-care">
                    <AlertTriangle size={12} aria-hidden="true" /> Recognition only — understand it, mostly don’t use it.
                  </span>
                )}
              </li>
            ))}
          </ul>

          <button type="button" className="btn-primary locked-premium-cta" onClick={seeSuper}>
            <Crown size={15} aria-hidden="true" /> Unlock with Super
          </button>
          <p className="locked-premium-note">
            Optional and 18+. Not part of the core course and not required to progress. Draft content,
            pending native-speaker review.
          </p>
        </section>
      </div>
    );
  }

  // ── SUPER SUBSCRIBERS: draft phrases ──────────────────────────────────────
  return (
    <div className="tab-content dating-section">
      {hero}

      {/* Honest draft banner — does NOT claim the content is reviewed. */}
      <section className="dating-draft-banner" role="status" aria-label="Draft content notice">
        <div className="dating-draft-icon" aria-hidden="true"><FileClock size={20} /></div>
        <div className="dating-draft-text">
          <h2 className="dating-draft-title">Draft content — pending native-speaker review</h2>
          <p className="dating-draft-copy">
            These {totalPhrases} phrases are an early draft written to be accurate and natural, but they
            have <strong>not</strong> yet been checked by a native Thai speaker for tone and cultural
            context. Learn from them, but expect small changes. This optional adult section isn’t part of
            the core course and isn’t required to progress.
          </p>
        </div>
      </section>

      {/* Draft phrases, grouped by category. */}
      <section className="dating-phrases" aria-label="Draft phrases">
        {groups.map(({ cat, phrases }) => (
          <div className="dating-cat-block" key={cat.id}>
            <div className="dating-cat-block-head">
              <div className="dating-cat-block-titles">
                <h2 className="dating-cat-block-name">{cat.name}</h2>
                <p className="dating-cat-block-blurb">{cat.blurb}</p>
              </div>
              <span className="dating-cat-chiprow">
                <span className={`dating-cat-sev dating-cat-sev-${cat.severity}`}>
                  {CAT_SEVERITY_LABEL[cat.severity]}
                </span>
                {CATEGORY_REGISTER[cat.id] && (
                  <span className={`dating-chip dating-chip-${CATEGORY_REGISTER[cat.id].cls}`}>
                    {CATEGORY_REGISTER[cat.id].label}
                  </span>
                )}
                <span className={`dating-chip dating-chip-${reviewBadge(cat.reviewStatus).cls}`}>
                  {reviewBadge(cat.reviewStatus).label}
                </span>
              </span>
            </div>

            {cat.handleWithCare && (
              <p className="dating-cat-care">
                <AlertTriangle size={13} aria-hidden="true" /> Recognition only — understand these, mostly don’t use them.
              </p>
            )}

            <ul className="dating-phrase-list">
              {phrases.map((p) => (
                <li className="dating-phrase-card" key={p.id}>
                  <div className="dating-phrase-top">
                    <div className="dating-phrase-main">
                      <p className="dating-phrase-thai" lang="th">{p.thai}</p>
                      <p className="dating-phrase-ph">{p.ph}</p>
                      <p className="dating-phrase-en">{p.en}</p>
                    </div>
                    <div className="dating-phrase-side">
                      <button
                        type="button"
                        className="dating-phrase-speak"
                        onClick={() => speak(p.thai)}
                        aria-label={`Play pronunciation of ${p.en}`}
                        title="Play pronunciation"
                      >
                        <Volume2 size={15} aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  <div className="dating-phrase-badges">
                    <span className={`dating-sev-chip dating-cat-sev-${p.severity}`}>
                      {SEVERITY_LABEL[p.severity]}
                    </span>
                    <span className={`dating-chip dating-chip-${USAGE_GUIDANCE[p.severity].cls}`}>
                      {USAGE_GUIDANCE[p.severity].label}
                    </span>
                    {CATEGORY_REGISTER[p.cat] && (
                      <span className={`dating-chip dating-chip-${CATEGORY_REGISTER[p.cat].cls}`}>
                        {CATEGORY_REGISTER[p.cat].label}
                      </span>
                    )}
                    <span className={`dating-chip dating-chip-${reviewBadge(p.reviewStatus).cls}`}>
                      {reviewBadge(p.reviewStatus).label}
                    </span>
                    {isMaleForm(p) && (
                      <span
                        className="dating-chip dating-chip-speaker"
                        title="Shown in polite male form (ผม / ครับ). Female speakers: swap ครับ → ค่ะ and ผม → ฉัน."
                      >
                        Male form
                      </span>
                    )}
                  </div>

                  {p.example && (
                    <div className="dating-phrase-example">
                      <span className="dating-phrase-example-label">Example</span>
                      <p className="dating-phrase-example-thai" lang="th">{p.example.thai}</p>
                      <p className="dating-phrase-example-ph">{p.example.ph}</p>
                      <p className="dating-phrase-example-en">{p.example.en}</p>
                    </div>
                  )}

                  {p.note && (
                    <p className="dating-phrase-note">
                      <span className="dating-note-label">Context</span> {p.note}
                    </p>
                  )}

                  {p.severity === 'strong' && (
                    <p className="dating-phrase-care">
                      <AlertTriangle size={12} aria-hidden="true" /> Handle with care — understand it, don’t aim it at anyone.
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <p className="dating-disclaimer">
        Draft phrases pending native review. This section is a tasteful adult resource and excludes
        explicit sexual content, hateful slurs, harassment, and coercive language. Understanding
        casual or blunt language is not an invitation to use it — mind your audience and context.
      </p>
    </div>
  );
}
