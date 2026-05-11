import React, { useState } from 'react';
import { Volume2, ChevronRight, UserPlus, Sparkles } from 'lucide-react';
import { CARDS } from '../data/cards.js';
import { speakThai, ttsAvailable } from '../lib/audio.js';

// Five curated survival cards shown to first-time visitors who pick "Try a
// quick demo". Read-only — no SRS state is written. After all 5 are seen,
// the only path forward is sign-up. The current demo index lives in
// localStorage under DEMO_IDX_KEY so a refresh resumes where they were.
const DEMO_CARD_IDS = [310, 312, 251, 250, 853];
const DEMO_IDX_KEY = 'tuk-talk-thai-demo-idx';

export default function DemoMode({ onSignUp, onSignIn }) {
  const cards = DEMO_CARD_IDS.map(id => CARDS.find(c => c.id === id)).filter(Boolean);
  const [idx, setIdx] = useState(() => {
    try {
      const stored = parseInt(localStorage.getItem(DEMO_IDX_KEY) || '0', 10);
      return Math.max(0, Math.min(stored, cards.length));
    } catch {
      return 0;
    }
  });

  const advance = () => {
    const next = idx + 1;
    try { localStorage.setItem(DEMO_IDX_KEY, String(next)); } catch { /* ignore */ }
    setIdx(next);
  };

  // After all 5 cards: signup CTA. No path back to the demo without clearing browser data.
  if (idx >= cards.length) {
    return (
      <div className="onboard-root">
        <div className="onboard-card demo-end-card">
          <div className="demo-end-icon"><Sparkles size={48} /></div>
          <div className="onboard-eyebrow">Demo complete</div>
          <h1 className="onboard-title">Loved it?</h1>
          <p className="demo-end-thai">เก่งมาก — gèng mâak</p>
          <p className="onboard-sub">
            Sign up to save your progress and unlock the full Thai learning path —
            from Survival Thai through Thai Mastery. Free forever.
          </p>
          <button className="btn-primary auth-cta demo-end-cta" onClick={onSignUp}>
            <UserPlus size={16} /> Create my account →
          </button>
          <button type="button" className="auth-link demo-end-signin" onClick={onSignIn}>
            Already have an account? Sign in
          </button>
        </div>
      </div>
    );
  }

  const card = cards[idx];

  return (
    <div className="onboard-root">
      <div className="onboard-card demo-card-wrap">
        <div className="demo-progress-row">
          <div className="demo-progress-text">Demo · Card {idx + 1} of {cards.length}</div>
          <div className="demo-progress-bar">
            <div className="demo-progress-fill" style={{ width: `${((idx + 1) / cards.length) * 100}%` }} />
          </div>
        </div>

        <div className="demo-card-content">
          <div className="demo-card-thai">{card.thai}</div>
          <div className="demo-card-ph">
            {card.ph}
            {ttsAvailable() && (
              <button
                type="button"
                className="demo-card-audio"
                onClick={() => speakThai(card.thai, 0.85)}
                aria-label="Hear pronunciation"
              >
                <Volume2 size={18} />
              </button>
            )}
          </div>
          <div className="demo-card-en">{card.en}</div>
          {card.note && <div className="demo-card-note">{card.note}</div>}
        </div>

        <button className="btn-primary auth-cta demo-next-btn" onClick={advance}>
          {idx + 1 < cards.length ? <>Next card <ChevronRight size={16} /></> : <>See what's next →</>}
        </button>

        <button type="button" className="auth-link demo-signin-link" onClick={onSignIn}>
          Already have an account? Sign in
        </button>
      </div>
    </div>
  );
}
