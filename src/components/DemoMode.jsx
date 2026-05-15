import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Volume2, ChevronRight, UserPlus, Sparkles } from 'lucide-react';
import { CARDS } from '../data/cards.js';
import { DEFAULT_VIEW_MODE } from '../lib/voice.js';
import { speakThai, ttsAvailable } from '../lib/audio.js';
import { playFlip, playCharacterSelect } from '../lib/sounds.js';
import { resolveCoachIdForStage } from '../data/stageCharacters.js';
import { useCharacterReaction } from '../hooks/useCharacterReaction.js';
import CharacterCoach from './CharacterCoach.jsx';

// Five curated survival cards shown to first-time visitors who pick "Try a
// quick demo". Read-only — no SRS state is written. After all 5 are seen,
// the only path forward is sign-up. The current demo index lives in
// localStorage under DEMO_IDX_KEY so a refresh resumes where they were.
const DEMO_CARD_IDS = [310, 312, 251, 250, 853];
const DEMO_IDX_KEY = 'tuk-talk-thai-demo-idx';

export default function DemoMode({
  onSignUp,
  onSignIn,
  viewMode = DEFAULT_VIEW_MODE,
  audioRate = 0.95,
  audioAutoPlay = false,
  showCharacters = true,
}) {
  const cards = useMemo(
    () => DEMO_CARD_IDS.map(id => CARDS.find(c => c.id === id)).filter(Boolean),
    []
  );
  const [idx, setIdx] = useState(() => {
    try {
      const stored = parseInt(localStorage.getItem(DEMO_IDX_KEY) || '0', 10);
      return Math.max(0, Math.min(stored, cards.length));
    } catch {
      return 0;
    }
  });
  const [revealed, setRevealed] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speakingTimerRef = useRef(null);

  const card = idx < cards.length ? cards[idx] : null;
  const coachId = useMemo(
    () => resolveCoachIdForStage(card && card.stage),
    [card && card.stage]
  );
  const coach = useCharacterReaction({ characterId: coachId, initialState: 'greeting', mode: 'review' });

  // Greet the user on the very first card so the demo feels welcoming, then
  // settle the coach into the idle/thinking rhythm the real lesson uses.
  useEffect(() => {
    if (!card) return;
    if (idx === 0 && !revealed) {
      coach.react('greeting', { duration: 1600, message: 'Welcome! Tap the card to see the meaning.' });
    } else if (!revealed) {
      coach.setRestingState('idle');
    }
  }, [card && card.id]);

  useEffect(() => {
    coach.setRestingState(revealed ? 'thinking' : 'idle');
  }, [revealed]);

  useEffect(() => () => {
    if (speakingTimerRef.current) clearTimeout(speakingTimerRef.current);
  }, []);

  useEffect(() => {
    if (audioAutoPlay && card && card.thai) {
      const t = setTimeout(() => triggerSpeak(card.thai), 350);
      return () => clearTimeout(t);
    }
  }, [card && card.id, audioAutoPlay, audioRate]);

  const triggerSpeak = (text) => {
    if (!text) return;
    try { speakThai(text, audioRate); } catch { /* ignore */ }
    setIsSpeaking(true);
    coach.react('speaking', { duration: 1600 });
    if (speakingTimerRef.current) clearTimeout(speakingTimerRef.current);
    speakingTimerRef.current = setTimeout(() => setIsSpeaking(false), 1600);
  };

  const handleReveal = () => {
    if (revealed) return;
    setRevealed(true);
    playFlip();
    coach.react('choiceSelected', { duration: 900 });
    playCharacterSelect(coachId);
  };

  const advance = () => {
    const next = idx + 1;
    try { localStorage.setItem(DEMO_IDX_KEY, String(next)); } catch { /* ignore */ }
    setRevealed(false);
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
          <p className="demo-end-thai">เก่งมาก (gèng mâak)</p>
          <p className="onboard-sub">
            Sign up to save your progress and unlock the full Thai learning path,
            from Survival Thai through Thai Mastery. Free forever.
          </p>
          <button className="btn-primary auth-cta demo-end-cta" onClick={onSignUp}>
            <UserPlus size={16} /> Create my account
          </button>
          <button type="button" className="auth-link demo-end-signin" onClick={onSignIn}>
            Already have an account? Sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="onboard-root">
      <div className="onboard-card demo-card-wrap">
        <div className="demo-progress-row">
          <div className="demo-progress-text">Demo: Card {idx + 1} of {cards.length}</div>
          <div className="demo-progress-bar">
            <div className="demo-progress-fill" style={{ width: `${((idx + 1) / cards.length) * 100}%` }} />
          </div>
        </div>

        {/* Same flip mechanic as the real lesson card so the demo feels
            continuous with the signed-in experience. */}
        <div className="srs-card-flip-wrap demo-flip-wrap">
          <div className={`srs-card-flip ${revealed ? 'srs-card-flip-revealed' : ''}`}>
            {/* FRONT */}
            <div
              className={`srs-card srs-card-face srs-card-face-front demo-card-face ${showCharacters ? 'srs-card-with-coach' : ''}`}
              onClick={handleReveal}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleReveal(); } }}
              aria-label="Reveal answer"
            >
              <div className="srs-card-meta">
                <span className="srs-card-cat" style={{ color: 'var(--jade)' }}>Demo</span>
                {ttsAvailable() && card.thai && (
                  <button
                    className="speaker-btn speaker-btn-card"
                    onClick={(e) => { e.stopPropagation(); triggerSpeak(card.thai); }}
                    title="Hear pronunciation"
                    aria-label="Play pronunciation"
                  >
                    <Volume2 size={16} />
                  </button>
                )}
              </div>

              {showCharacters && (
                <div className="srs-card-coach">
                  <CharacterCoach
                    characterId={coachId}
                    state={coach.state}
                    message={coach.message}
                    isSpeaking={isSpeaking}
                    compact
                  />
                </div>
              )}

              <div className="srs-card-front-body">
                {viewMode === 'read' ? (
                  <div className="srs-card-thai srs-card-thai-primary">{card.thai}</div>
                ) : viewMode === 'both' ? (
                  <>
                    <div className="srs-card-thai">{card.thai}</div>
                    <div className="srs-card-ph-front">{card.ph}</div>
                  </>
                ) : (
                  <>
                    <div className="srs-card-ph-primary">{card.ph}</div>
                    <div className="srs-card-thai srs-card-thai-secondary">{card.thai}</div>
                  </>
                )}
              </div>

              <div className="srs-card-prompt">
                <div className="srs-card-prompt-text">Tap to reveal</div>
                <div className="srs-card-prompt-hint">Try to recall the meaning first</div>
              </div>
            </div>

            {/* BACK */}
            <div className="srs-card srs-card-face srs-card-face-back demo-card-face" aria-hidden={!revealed}>
              <div className="srs-card-back-meta">
                <span className="srs-card-cat" style={{ color: 'var(--jade)' }}>Meaning</span>
                {ttsAvailable() && card.thai && (
                  <button
                    className="speaker-btn speaker-btn-card"
                    onClick={(e) => { e.stopPropagation(); triggerSpeak(card.thai); }}
                    title="Hear pronunciation"
                    aria-label="Play pronunciation"
                  >
                    <Volume2 size={16} />
                  </button>
                )}
              </div>

              {showCharacters && (
                <div className="srs-card-coach srs-card-coach-back">
                  <CharacterCoach
                    characterId={coachId}
                    state={coach.state}
                    message={coach.message}
                    isSpeaking={isSpeaking}
                    compact
                  />
                </div>
              )}

              <div className="srs-card-back-body">
                <div className="srs-card-back-eyebrow">Meaning</div>
                {card.ph && <div className="srs-card-back-ph">{card.ph}</div>}
                <div className="srs-card-en">{card.en}</div>
                {card.note && <div className="srs-card-note">{card.note}</div>}
              </div>
            </div>
          </div>
        </div>

        {revealed ? (
          <button className="btn-primary auth-cta demo-next-btn" onClick={advance}>
            {idx + 1 < cards.length ? <>Next card <ChevronRight size={16} /></> : <>See what's next</>}
          </button>
        ) : (
          <button type="button" className="demo-reveal-hint" onClick={handleReveal}>
            Tap the card above to reveal the meaning
          </button>
        )}

        <button type="button" className="auth-link demo-signin-link" onClick={onSignIn}>
          Already have an account? Sign in
        </button>
      </div>
    </div>
  );
}
