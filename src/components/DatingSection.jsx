import React, { useEffect } from 'react';
import { Heart, Lock, ShieldCheck, AlertTriangle, Crown } from 'lucide-react';
import { DATING_SECTION, DATING_CATEGORIES, DATING_REVIEW_COMPLETE } from '../data/datingContent.js';
import { trackEvent, ANALYTICS_EVENTS } from '../lib/analytics.js';

// Premium "Dating & Real Talk Thai" teaser. OPTIONAL, 18+, mature language, and
// NOT part of course progress. Until native review is complete (DATING_REVIEW_
// COMPLETE === false) this shows ONLY: positioning, a safety note, and an English-
// only preview of the categories — never any unreviewed Thai. The actual lessons
// open with Super after review.
const SEVERITY_LABEL = {
  gentle: 'Gentle',
  moderate: 'Casual',
  strong: 'Strong — handle with care',
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

  return (
    <div className="tab-content dating-section">
      <header className="dating-hero">
        <div className="dating-badges">
          <span className="dating-badge dating-badge-18" aria-label="18 plus">18+</span>
          <span className="dating-badge dating-badge-mature">Mature language</span>
          <span className="dating-badge dating-badge-super"><Crown size={12} aria-hidden="true" /> Super</span>
          {!DATING_REVIEW_COMPLETE && <span className="dating-badge dating-badge-soon">Coming soon</span>}
        </div>
        <h1 className="dating-title"><Heart size={22} aria-hidden="true" /> {DATING_SECTION.title}</h1>
        <p className="dating-tagline">{DATING_SECTION.tagline}</p>
        <p className="dating-safety"><ShieldCheck size={15} aria-hidden="true" /> {DATING_SECTION.safetyNote}</p>
      </header>

      <section className="dating-locked" aria-label="Locked premium section">
        <div className="dating-locked-icon" aria-hidden="true"><Lock size={22} /></div>
        <h2 className="dating-locked-title">Opens with Super, after native review</h2>
        <p className="dating-locked-copy">
          This optional adult section is being prepared and checked by a native Thai speaker for
          accuracy, tone, and cultural context. It’s not part of the core course and isn’t required
          to progress. It unlocks with Super once review is complete.
        </p>
        <button type="button" className="btn-primary dating-locked-cta" onClick={seeSuper}>
          See Super
        </button>
      </section>

      <section className="dating-preview" aria-label="What this section will cover">
        <h2 className="dating-preview-title">What it will cover</h2>
        <div className="dating-cat-grid">
          {DATING_CATEGORIES.map((cat) => (
            <article className="dating-cat-card" key={cat.id}>
              <div className="dating-cat-head">
                <h3 className="dating-cat-name">{cat.name}</h3>
                <span className={`dating-cat-sev dating-cat-sev-${cat.severity}`}>{SEVERITY_LABEL[cat.severity]}</span>
              </div>
              <p className="dating-cat-blurb">{cat.blurb}</p>
              <ul className="dating-cat-intents">
                {cat.sampleIntents.slice(0, 3).map((intent, i) => (
                  <li key={i}>{intent}</li>
                ))}
              </ul>
              {cat.handleWithCare && (
                <p className="dating-cat-care"><AlertTriangle size={12} aria-hidden="true" /> Understand it, mostly don’t use it.</p>
              )}
            </article>
          ))}
        </div>
        <p className="dating-disclaimer">
          Previews above are English intents only. Thai phrases, romanization, tone, and severity
          notes are pending native review and are not shown until approved. This section excludes
          hateful slurs, harassment, coercive sexual language, and explicit material.
        </p>
      </section>
    </div>
  );
}
