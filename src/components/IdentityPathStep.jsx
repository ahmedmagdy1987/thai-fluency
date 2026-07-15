import React from 'react';
import { ChevronRight } from 'lucide-react';
import { PATHS } from '../lib/situations.js';

// The ONE optional onboarding question (engagement.md §2.1). It sets
// stats.identityPath, which reweights the learner's SITUATION ORDER and nothing
// else.
//
// HONESTY CONSTRAINT (engagement.md:94, do not violate):
// the identity path feeds priority(sit, path) = base(sit) × weight(sit, path) —
// a pure re-sort of all 16 situations. It NEVER locks, unlocks, forks, or gates
// anything, and it is NOT "your next lesson": sit-dating genuinely ranks high on
// path-partner but stays a locked preview (Super + 18+, no lessons written yet),
// so the only promise this copy may make is "boosted in your order". Any copy
// added here must keep that distinction.
//
// The question is OPTIONAL by contract: skipping is a first-class answer
// ('path-none' = all-N weights = the plain §2 catalog order), so the skip control
// is a real, equally-weighted choice — never a dark-pattern afterthought.
//
// Option copy + emoji are VERBATIM from engagement.md:85-93. The ids are filtered
// against situations.js PATHS below, so this list can never drift from the lib
// and can never offer a path the weighting model does not know. 'path-none' is
// deliberately absent: it is what SKIPPING means, not a fifth button.
const IDENTITY_OPTIONS = [
  { id: 'path-tourist', icon: '🧳', label: "I'm visiting / traveling" },
  { id: 'path-expat',   icon: '🏠', label: 'I live here / long stay' },
  { id: 'path-partner', icon: '💛', label: 'For my partner / their family' },
  { id: 'path-worker',  icon: '💼', label: 'For work' },
].filter(o => PATHS.includes(o.id));

export default function IdentityPathStep({ onSelect, onSkip }) {
  return (
    <div className="onboard-root">
      <div className="onboard-card onboard-card-narrow">
        <div className="onboard-eyebrow">Last one — optional</div>
        <h2 className="onboard-title">Why are you learning Thai?</h2>
        <p className="onboard-sub">
          Pick one and we'll move the situations that matter to you up your order. Or skip — you can
          learn everything either way.
        </p>

        <div className="skill-level-list">
          {IDENTITY_OPTIONS.map(o => (
            <button key={o.id} className="skill-level-btn" onClick={() => onSelect(o.id)}>
              <div className="skill-level-icon">{o.icon}</div>
              <div className="skill-level-body">
                <div className="skill-level-name">{o.label}</div>
              </div>
              <ChevronRight size={18} className="skill-level-arrow" />
            </button>
          ))}
        </div>

        {/* The honest scope of the answer, stated before the user commits: it
            reorders, it never gates. Mirrors engagement.md:94 exactly. */}
        <p className="identity-path-note">
          This only changes the <strong>order</strong> situations appear in. Nothing is locked or
          unlocked by your answer — every situation stays available to everyone, and you can pick a
          different one to start any time.
        </p>

        <div className="onboard-skip-row">
          <button className="onboard-skip-btn" onClick={onSkip}>Skip — just show me the standard order</button>
        </div>
      </div>
    </div>
  );
}
