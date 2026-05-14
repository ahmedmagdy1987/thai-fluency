import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Volume2, RotateCcw, Check, ChevronRight } from 'lucide-react';
import { CARDS } from '../data/cards.js';
import { WORD_LOOKUP } from '../data/lookup.js';
import { CATEGORIES } from '../data/taxonomy.js';
import { displayCard, displayLine, transformThai, transformPh, transformEn, DEFAULT_VOICE, DEFAULT_VIEW_MODE } from '../lib/voice.js';
import { speakThai, ttsAvailable } from '../lib/audio.js';
import {
  playEasy,
  playCharacterSelect,
  playCharacterCorrect,
  playCharacterWrong,
} from '../lib/sounds.js';
import { reviewCard, getDueCards, getNewCards, getStats, intervalLabel, DAY_MS } from '../lib/srs.js';
import { getStageState, buildPlacementCards, autoBreakdown, checkAchievements } from '../lib/state.js';
import { resolveCoachIdForStage } from '../data/stageCharacters.js';
import { useCharacterReaction } from '../hooks/useCharacterReaction.js';
import RateBtn from './RateBtn.jsx';
import CharacterCoach from './CharacterCoach.jsx';

export default function CardsTab({ progress, reviewOne, markCardKnown, dailyNewLimit, voice, viewMode, startedStage, maxUnlockedStage, audioRate, audioAutoPlay, undoLastReview, lastReviewSnapshot }) {
  const [revealed, setRevealed] = useState(false);
  const [sessionDone, setSessionDone] = useState(0);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speakingTimerRef = useRef(null);

  const queue = useMemo(() => {
    const now = Date.now();
    // Sequential unlock: SRS pool is constrained to unlocked stages.
    const lower = startedStage || 1;
    const upper = maxUnlockedStage || 1;
    const filteredCards = CARDS.filter(c => {
      const s = c.stage || 1;
      return s >= lower && s <= upper;
    });
    const due = getDueCards(progress, filteredCards, now);
    const newOnes = getNewCards(progress, filteredCards, dailyNewLimit);
    return [...due, ...newOnes];
  }, [progress, dailyNewLimit, startedStage, maxUnlockedStage]);

  const rawCard = queue[0];
  const card = useMemo(() => displayCard(rawCard, voice), [rawCard, voice]);

  // Coach: derived from the current card's stage so the right tutor
  // shows up as the user moves between stages. Stages without real art
  // resolve to the default character (elephant).
  const coachId = useMemo(
    () => resolveCoachIdForStage(rawCard && rawCard.stage),
    [rawCard && rawCard.stage]
  );
  // mode='review' tells the coach to pull from the SRS line pool (reflective
  // copy) rather than the quiz pool (interrogative copy). See characters.js.
  const coach = useCharacterReaction({ characterId: coachId, initialState: 'idle', mode: 'review' });

  // Sync resting state with the lesson phase: while waiting for reveal the
  // coach is "idle", once the answer is on screen we shift to "thinking"
  // (gentle attentive pose).
  useEffect(() => {
    coach.setRestingState(revealed ? 'thinking' : 'idle');
  }, [revealed]);

  useEffect(() => {
    if (audioAutoPlay && card && card.thai) {
      const t = setTimeout(() => triggerSpeak(card.thai), 350);
      return () => clearTimeout(t);
    }
  }, [card && card.id, audioAutoPlay, audioRate]);

  // Clean up the speaking timer on unmount so we don't leak state.
  useEffect(() => () => {
    if (speakingTimerRef.current) clearTimeout(speakingTimerRef.current);
  }, []);

  // Speaks the Thai phrase AND drives the coach's speaking pulse. The
  // pulse is time-boxed (we can't reliably hook into speechSynthesis
  // end events on every browser) — 1.6s comfortably covers a phrase.
  const triggerSpeak = (text) => {
    if (!text) return;
    try { speakThai(text, audioRate); } catch (_) { /* ignore */ }
    setIsSpeaking(true);
    coach.react('speaking', { duration: 1800 });
    if (speakingTimerRef.current) clearTimeout(speakingTimerRef.current);
    speakingTimerRef.current = setTimeout(() => setIsSpeaking(false), 1800);
  };

  const handleReveal = () => {
    if (revealed) return;
    setRevealed(true);
    // Short "how did that feel" beat. Picks from review-mode choiceSelected
    // pool — reflective, not interrogative.
    coach.react('choiceSelected', { duration: 800 });
    playCharacterSelect(coachId);
  };

  const handleRate = (rating) => {
    if (!rawCard) return;
    const correct = rating >= 3;
    if (correct) setSessionCorrect(c => c + 1);
    if (rating === 4) playEasy(); // existing Easy blip — preserved
    if (correct) {
      coach.react('correct', { duration: 1500 });
      playCharacterCorrect(coachId);
    } else {
      coach.react('wrong', { duration: 1700 });
      playCharacterWrong(coachId);
    }
    setSessionDone(d => d + 1);
    setRevealed(false);
    reviewOne(rawCard.id, rating);
  };

  const handleSkip = () => {
    if (!rawCard || !markCardKnown) return;
    setSessionDone(d => d + 1);
    setRevealed(false);
    coach.react('correct', { duration: 1200, message: 'Marked as known. Onward.' });
    markCardKnown(rawCard.id);
  };

  const handleUndo = () => {
    if (!undoLastReview || !lastReviewSnapshot) return;
    undoLastReview();
    setSessionDone(d => Math.max(0, d - 1));
    if (lastReviewSnapshot.rating >= 3) setSessionCorrect(c => Math.max(0, c - 1));
    setRevealed(true); // show the card revealed since they're correcting it
    coach.react('thinking', { duration: 1000, message: 'Re-rating it — your call.' });
  };

  if (!card) {
    return (
      <div className="tab-content">
        <div className="empty-state">
          <div className="empty-icon">🎉</div>
          <div className="empty-title">All done for now</div>
          <div className="empty-sub">No cards due. Come back later or browse to add new vocabulary.</div>
          {sessionDone > 0 && (
            <div className="session-summary">
              <div className="summary-stat"><div className="summary-num">{sessionDone}</div><div className="summary-label">reviewed</div></div>
              <div className="summary-stat"><div className="summary-num">{sessionCorrect}</div><div className="summary-label">correct</div></div>
              <div className="summary-stat"><div className="summary-num">{Math.round((sessionCorrect/sessionDone)*100)}%</div><div className="summary-label">accuracy</div></div>
            </div>
          )}
        </div>
      </div>
    );
  }

  const cardState = progress[card.id];
  const isNew = !cardState;
  const cat = CATEGORIES.find(c => c.id === card.cat);

  return (
    <div className="tab-content cards-tab-content">
      <div className="cards-header">
        <div className="cards-progress-text">
          <span className="cards-progress-text-left">
            {sessionDone > 0 && <span className="session-done">{sessionDone} done</span>}
            <span className="queue-remaining">{queue.length} left</span>
          </span>
          {lastReviewSnapshot && (Date.now() - lastReviewSnapshot.timestamp < 30000) && (
            <button className="cards-undo-btn" onClick={handleUndo} title="Undo last rating">
              <RotateCcw size={12} /> Undo
            </button>
          )}
        </div>
        <div className="cards-progress-bar">
          <div className="cards-progress-fill" style={{ width: sessionDone > 0 ? `${(sessionDone / (sessionDone + queue.length)) * 100}%` : '0%' }} />
        </div>
      </div>

      <div className="cards-coach-rail">
        <CharacterCoach
          characterId={coachId}
          state={coach.state}
          message={coach.message}
          isSpeaking={isSpeaking}
          compact
        />
      </div>

      <div className="srs-card-wrap">
        <div className={`srs-card srs-card-mode-${viewMode || 'speak'} ${revealed ? 'srs-card-revealed' : ''}`} onClick={handleReveal}>
          <div className="srs-card-meta">
            {cat && <span className="srs-card-cat" style={{ color: cat.color }}>{cat.icon} {cat.name}</span>}
            <div className="srs-card-meta-right">
              {isNew && <span className="srs-card-new-badge">new</span>}
              {!isNew && cardState && <span className="srs-card-interval">{cardState.learning ? 'learning' : `${cardState.interval}d interval`}</span>}
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
          </div>

          {/* Render order depends on view mode. Empty ph (cards flagged phNeedsGen)
              would otherwise render a blank line — show a "coming soon" placeholder. */}
          {viewMode === 'read' ? (
            <>
              <div className="srs-card-thai srs-card-thai-primary">{card.thai}</div>
              {revealed && <div className="srs-card-ph-front">{card.ph || <span className="srs-card-ph-pending">phonetic coming soon</span>}</div>}
            </>
          ) : viewMode === 'both' ? (
            <>
              <div className="srs-card-thai">{card.thai}</div>
              <div className="srs-card-ph-front">{card.ph || <span className="srs-card-ph-pending">phonetic coming soon</span>}</div>
            </>
          ) : (
            <>
              {/* speak mode: phonetic primary, Thai script small/secondary */}
              <div className="srs-card-ph-primary">{card.ph || <span className="srs-card-ph-pending">phonetic coming soon</span>}</div>
              <div className="srs-card-thai srs-card-thai-secondary">{card.thai}</div>
            </>
          )}

          {!revealed ? (
            <div className="srs-card-prompt">
              <div className="srs-card-prompt-text">Tap to reveal</div>
              <div className="srs-card-prompt-hint">Try to recall the meaning first</div>
            </div>
          ) : (
            <div className="srs-card-back">
              <div className="srs-card-en">{card.en}</div>
              {(() => {
                const bd = card.breakdown && card.breakdown.length > 0 ? card.breakdown
                  : (card.type === 's' ? autoBreakdown(card.ph) : null);
                if (!bd || bd.length === 0) return null;
                return (
                  <div className="srs-breakdown">
                    <div className="srs-breakdown-label">Word-by-word</div>
                    <div className="srs-breakdown-grid">
                      {bd.map((b, i) => (
                        <div key={i} className="srs-breakdown-item">
                          {viewMode !== 'speak' && b.thai && b.thai !== '—' && <div className="srs-bd-thai">{b.thai}</div>}
                          <div className="srs-bd-ph">{b.ph}</div>
                          <div className="srs-bd-en">{b.en}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
              {card.note && <div className="srs-card-note">{card.note}</div>}
            </div>
          )}
        </div>

        {/* I know this - skip button (only when card is new and not yet revealed) */}
        {isNew && !revealed && markCardKnown && (
          <button className="srs-skip-btn" onClick={(e) => { e.stopPropagation(); handleSkip(); }}>
            I already know this — skip
          </button>
        )}
      </div>

      {revealed && (
        <>
          <div className="rate-row">
            <RateBtn rating={1} label="Again" subLabel={intervalLabel(cardState, 1)} color="#A03B2C" onClick={() => handleRate(1)} />
            <RateBtn rating={2} label="Hard"  subLabel={intervalLabel(cardState, 2)} color="#E0823B" onClick={() => handleRate(2)} />
            <RateBtn rating={3} label="Good"  subLabel={intervalLabel(cardState, 3)} color="#2E7D5B" onClick={() => handleRate(3)} />
            <RateBtn rating={4} label="Easy"  subLabel={intervalLabel(cardState, 4)} color="#2563A8" onClick={() => handleRate(4)} />
          </div>
          <div className="card-skip-row">
            <button className="card-skip-btn" onClick={handleSkip}>I already know this — skip</button>
          </div>
        </>
      )}

      {!revealed && (
        <div className="rate-row rate-row-hidden">
          <button className="reveal-btn" onClick={handleReveal}>Show answer</button>
        </div>
      )}
    </div>
  );
}
