import React, { useEffect, useMemo } from 'react';
import { Heart, ShieldCheck, AlertTriangle, Crown, FileClock, Volume2 } from 'lucide-react';
import { DATING_SECTION, DATING_CATEGORIES } from '../data/datingContent.js';
import { DATING_PHRASES } from '../data/datingPhrases.js';
import { trackEvent, ANALYTICS_EVENTS } from '../lib/analytics.js';

// "Dating & Real Talk Thai" — OPTIONAL, 18+, mature language, NOT part of course
// progress. This section now renders the FIRST BATCH of draft phrases (from
// datingPhrases.js) grouped by category. Every phrase is DRAFT and pending a
// native-speaker review — the banner says so honestly and does NOT claim the
// content is reviewed. Content stays within a tasteful adult boundary (see the
// safety notes in datingContent.js / datingPhrases.js).

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

export default function DatingSection({ onOpenSuper }) {
  // Reaching this gated section is an intentional premium tap.
  useEffect(() => {
    trackEvent(ANALYTICS_EVENTS.PREMIUM_FEATURE_TAPPED, { source: 'dating-section' });
  }, []);

  const seeSuper = () => {
    trackEvent(ANALYTICS_EVENTS.PREMIUM_FEATURE_TAPPED, { source: 'dating-see-super' });
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

  return (
    <div className="tab-content dating-section">
      <header className="dating-hero">
        <div className="dating-badges">
          <span className="dating-badge dating-badge-18" aria-label="18 plus">18+</span>
          <span className="dating-badge dating-badge-mature">Mature language</span>
          <span className="dating-badge dating-badge-super"><Crown size={12} aria-hidden="true" /> Super</span>
          <span className="dating-badge dating-badge-draft"><FileClock size={12} aria-hidden="true" /> Draft</span>
        </div>
        <h1 className="dating-title"><Heart size={22} aria-hidden="true" /> {DATING_SECTION.title}</h1>
        <p className="dating-tagline">{DATING_SECTION.tagline}</p>
        <p className="dating-safety"><ShieldCheck size={15} aria-hidden="true" /> {DATING_SECTION.safetyNote}</p>
      </header>

      {/* Honest draft banner — replaces the old "Coming soon / opens after review"
          locked block. Does NOT claim the content is reviewed. */}
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
          <button type="button" className="btn-primary dating-draft-cta" onClick={seeSuper}>
            <Crown size={14} aria-hidden="true" /> See Super
          </button>
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
              <span className={`dating-cat-sev dating-cat-sev-${cat.severity}`}>
                {CAT_SEVERITY_LABEL[cat.severity]}
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
                      <span className={`dating-sev-chip dating-cat-sev-${p.severity}`}>
                        {SEVERITY_LABEL[p.severity]}
                      </span>
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

                  {p.example && (
                    <div className="dating-phrase-example">
                      <span className="dating-phrase-example-label">Example</span>
                      <p className="dating-phrase-example-thai" lang="th">{p.example.thai}</p>
                      <p className="dating-phrase-example-ph">{p.example.ph}</p>
                      <p className="dating-phrase-example-en">{p.example.en}</p>
                    </div>
                  )}

                  {p.note && <p className="dating-phrase-note">{p.note}</p>}

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
