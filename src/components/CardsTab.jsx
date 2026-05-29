import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Volume2, RotateCcw, Check, ChevronRight } from 'lucide-react';
import { CARDS } from '../data/cards.js';
import { WORD_LOOKUP } from '../data/lookup.js';
import { CATEGORIES } from '../data/taxonomy.js';
import { displayCard, displayLine, transformThai, transformPh, transformEn, DEFAULT_VOICE, DEFAULT_VIEW_MODE } from '../lib/voice.js';
import { speakThai, ttsAvailable } from '../lib/audio.js';
import {
  playEasy,
  playFlip,
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

// The card flip is 550ms in CSS; 3400ms keeps the reveal prompt readable
// for roughly 2.8s after the back face settles, then returns to resting.
const REVEAL_PROMPT_DURATION_MS = 3400;

// Fast id → card lookup for resolving the frozen new-card allotment back to
// card objects without scanning the whole deck on every render.
const CARD_BY_ID = new Map(CARDS.map(c => [c.id, c]));

export default function CardsTab({ progress, reviewOne, markCardKnown, dailyNewLimit, voice, viewMode, startedStage, maxUnlockedStage, audioRate, audioAutoPlay, showCharacters = true, undoLastReview, lastReviewSnapshot, sessionScope, setTab, stageState }) {
  const [revealed, setRevealed] = useState(false);
  const [sessionDone, setSessionDone] = useState(0);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [ratingLocked, setRatingLocked] = useState(false);
  const speakingTimerRef = useRef(null);
  const handledCardIdsRef = useRef(new Set());
  const actionLockRef = useRef(null);
  // The new-card allotment is frozen once per session (see queue useMemo).
  const newAllotmentRef = useRef({ key: null, ids: [] });
  const sessionKey = sessionScope?.type === 'mission'
    ? `mission:${sessionScope.missionId}`
    : 'practice';

  const queue = useMemo(() => {
    const now = Date.now();
    const safeProgress = progress && typeof progress === 'object' ? progress : {};
    const missionCardIds = Array.isArray(sessionScope?.cardIds) ? new Set(sessionScope.cardIds) : null;
    const filteredCards = missionCardIds
      ? CARDS.filter(c => missionCardIds.has(c.id))
      : CARDS.filter(c => {
          const s = c.stage || 1;
          const lower = startedStage || 1;
          const upper = maxUnlockedStage || 1;
          return s >= lower && s <= upper;
        });
    // Due reviews are always live: any unlocked stage (including a completed
    // one) surfaces its cards here exactly when SRS says they're due.
    const due = getDueCards(progress, filteredCards, now);

    // New-card candidates exclude completed stages: once a stage is
    // learned/complete its cards only return as due reviews (above), never as
    // fresh learning. New learning flows forward to the current stage/mission.
    const completeStageIds = new Set(
      (stageState?.stages || []).filter(s => s.complete).map(s => s.id)
    );
    const newCandidates = missionCardIds
      ? filteredCards
      : filteredCards.filter(c => !completeStageIds.has(c.stage || 1));

    // Freeze the new-card allotment once per session. getNewCards returns a
    // sliding window of the next unseen cards capped at the daily limit; if it
    // were recomputed live, rating a new card would immediately pull the next
    // unseen card into the queue and "N left" would never fall. Snapshotting
    // makes the session a bounded batch that counts down to an empty state.
    // The session resets when the Cards tab is re-entered (CardsTab remounts)
    // or the session scope changes (sessionKey).
    if (newAllotmentRef.current.key !== sessionKey) {
      newAllotmentRef.current = {
        key: sessionKey,
        ids: getNewCards(
          progress,
          newCandidates,
          missionCardIds ? newCandidates.length : dailyNewLimit
        ).map(c => c.id),
      };
    }
    // Only allotment cards still unseen remain queued; a rated new card drops
    // out and is NOT replaced — that is what makes the remaining count fall.
    const newOnes = newAllotmentRef.current.ids
      .filter(id => !safeProgress[id])
      .map(id => CARD_BY_ID.get(id))
      .filter(Boolean);
    return [...due, ...newOnes];
  }, [progress, dailyNewLimit, startedStage, maxUnlockedStage, sessionScope, sessionKey, stageState]);

  const rawCard = queue[0];
  const card = useMemo(() => displayCard(rawCard, voice), [rawCard, voice]);
  const sessionTotal = sessionScope?.type === 'mission'
    ? Math.max(sessionScope.total || 0, sessionDone + queue.length)
    : sessionDone + queue.length;
  const isMissionSession = sessionScope?.type === 'mission';

  // Progress labels. The visible header stays terse on every screen ("22 done",
  // "10 left", "10 reviews"); the full, context-specific meaning lives in the
  // title/aria-label so clarity isn't lost. Review mode = every remaining card
  // has already been seen (due reviews, no new cards).
  const remaining = queue.length;
  const remPlural = remaining === 1 ? '' : 's';
  const isReviewMode = !isMissionSession && remaining > 0 && queue.every(c => progress && progress[c.id]);
  let leftLabel; // visible (concise)
  let leftTitle; // full explanation (title + aria-label)
  if (isMissionSession) {
    leftLabel = `${remaining} left`;
    leftTitle = `${remaining} card${remPlural} left in this mission`;
  } else if (isReviewMode) {
    leftLabel = `${remaining} review${remPlural}`;
    leftTitle = `${remaining} card${remPlural} left to review`;
  } else {
    leftLabel = `${remaining} left`;
    leftTitle = `${remaining} card${remPlural} left in this practice session`;
  }
  const doneLabel = `${sessionDone} done`;
  const doneTitle = `${sessionDone} card${sessionDone === 1 ? '' : 's'} reviewed this session`;

  useEffect(() => {
    setRevealed(false);
    setSessionDone(0);
    setSessionCorrect(0);
    setRatingLocked(false);
    handledCardIdsRef.current = new Set();
    actionLockRef.current = null;
  }, [sessionKey]);

  useEffect(() => {
    setRatingLocked(false);
    actionLockRef.current = null;
    // When we advance off a card, drop it from the per-session dedupe guard.
    // Otherwise a card that legitimately re-dues later this session (e.g. rated
    // "Again", due again in ~1 min) would re-surface as queue[0] but every
    // rating would silently no-op on the handledCardIdsRef check below, leaving
    // the user stuck on it and unable to reach an empty queue. Same-exposure
    // double-taps are still blocked by actionLockRef above and by reviewOne's
    // own per-exposure review lock.
    const handledId = rawCard?.id;
    return () => {
      if (handledId != null) handledCardIdsRef.current.delete(handledId);
    };
  }, [rawCard?.id]);

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
    // Subtle "card snap" cue. Played alongside the character reaction sound
    // so the flip feels grounded as a physical action, not just visual.
    playFlip();
    // Keep the reveal prompt readable after the flip; choiceSelected
    // pool — reflective, not interrogative.
    coach.react('choiceSelected', { duration: REVEAL_PROMPT_DURATION_MS });
    playCharacterSelect(coachId);
  };

  const handleRate = (rating) => {
    if (!rawCard || ratingLocked || actionLockRef.current === rawCard.id) return;
    actionLockRef.current = rawCard.id;
    setRatingLocked(true);
    if (handledCardIdsRef.current.has(rawCard.id)) return;
    handledCardIdsRef.current.add(rawCard.id);
    const result = reviewOne(rawCard.id, rating);
    if (result === false) return;
    const rushed = !!(result && result.rushed);
    const correct = rating >= 3;
    if (correct) setSessionCorrect(c => c + 1);
    if (rating === 4) playEasy(); // existing Easy blip — preserved
    if (rushed) {
      // Gentle nudge when XP was throttled for blind-fast rating. The card is
      // still saved/scheduled; we just remind them speed isn't mastery.
      coach.react('thinking', { duration: 2000, message: 'Quick pass saved. Review again later to master it.' });
      if (correct) playCharacterCorrect(coachId); else playCharacterWrong(coachId);
    } else if (correct) {
      coach.react('correct', { duration: 1500 });
      playCharacterCorrect(coachId);
    } else {
      coach.react('wrong', { duration: 1700 });
      playCharacterWrong(coachId);
    }
    setSessionDone(d => d + 1);
    setRevealed(false);
  };

  const handleSkip = () => {
    if (!rawCard || !markCardKnown || ratingLocked || actionLockRef.current === rawCard.id) return;
    actionLockRef.current = rawCard.id;
    setRatingLocked(true);
    if (handledCardIdsRef.current.has(rawCard.id)) return;
    handledCardIdsRef.current.add(rawCard.id);
    setSessionDone(d => d + 1);
    setRevealed(false);
    coach.react('correct', { duration: 1200, message: 'Marked as known. Onward.' });
    markCardKnown(rawCard.id);
  };

  const handleUndo = () => {
    if (!undoLastReview || !lastReviewSnapshot) return;
    undoLastReview();
    handledCardIdsRef.current.delete(lastReviewSnapshot.cardId);
    actionLockRef.current = null;
    setRatingLocked(false);
    setSessionDone(d => Math.max(0, d - 1));
    if (lastReviewSnapshot.rating >= 3) setSessionCorrect(c => Math.max(0, c - 1));
    setRevealed(true); // show the card revealed since they're correcting it
    coach.react('thinking', { duration: 1000, message: 'Re-rate it if needed.' });
  };

  if (!card) {
    // Has the user seen every card in the whole deck? (true "caught up").
    const allContentSeen = CARDS.every(c => progress && progress[c.id]);
    const goLearn = () => setTab && setTab('learn');
    const goChallenge = () => setTab && setTab('quiz');

    // If the user just cleared a stage and the next one is unlocked with content
    // still to learn, point them forward instead of leaving a dead end.
    const stages = stageState?.stages || [];
    // Only treat the next stage as "freshly cleared → start it" when it hasn't
    // been started yet (seen === 0). If it's already in progress, the empty
    // queue just means the daily allotment is drained, so we fall through to the
    // accurate generic "No reviews due right now / Continue your path" copy
    // instead of wrongly saying "Start Stage N" for a stage already underway.
    const nextStage = stages.find(
      s => s.id === stageState?.currentStage && s.unlocked && !s.complete && s.total > 0 && (s.seen || 0) === 0
    );
    const clearedStage = nextStage
      ? stages.filter(s => s.complete && s.total > 0 && s.id < nextStage.id).slice(-1)[0]
      : null;

    let emptyTitle;
    let emptySub;
    let primaryLabel = null;
    let primaryAction = null;
    if (isMissionSession) {
      emptyTitle = 'Mission complete';
      emptySub = `You finished this mission's ${sessionScope.total || sessionDone} cards. Keep going on your path.`;
      primaryLabel = 'Continue your path';
      primaryAction = goLearn;
    } else if (clearedStage && nextStage) {
      emptyTitle = `Stage ${clearedStage.id} complete. No reviews due right now.`;
      emptySub = `Nice work — you've learned all of ${clearedStage.name}. Start Stage ${nextStage.id} to keep going.`;
      primaryLabel = `Start Stage ${nextStage.id}`;
      primaryAction = goLearn;
    } else if (allContentSeen) {
      emptyTitle = "You're caught up";
      emptySub = 'Come back later to review and master what you learned. Your reviews appear here when they’re due.';
      primaryLabel = 'Try a Challenge';
      primaryAction = goChallenge;
    } else {
      emptyTitle = 'No reviews due right now';
      emptySub = 'Continue your learning path to learn new words, or try a Challenge to test what you know.';
      primaryLabel = 'Continue your path';
      primaryAction = goLearn;
    }

    return (
      <div className="tab-content">
        <div className="empty-state">
          <div className="empty-icon">{allContentSeen ? '✅' : '🎉'}</div>
          <div className="empty-title">{emptyTitle}</div>
          <div className="empty-sub">{emptySub}</div>
          {sessionDone > 0 && (
            <div className="session-summary">
              <div className="summary-stat"><div className="summary-num">{sessionDone}</div><div className="summary-label">reviewed</div></div>
              <div className="summary-stat"><div className="summary-num">{sessionCorrect}</div><div className="summary-label">correct</div></div>
              <div className="summary-stat"><div className="summary-num">{Math.round((sessionCorrect/sessionDone)*100)}%</div><div className="summary-label">accuracy</div></div>
            </div>
          )}
          {setTab && (
            <div className="empty-actions">
              {primaryLabel && (
                <button type="button" className="btn-primary empty-cta" onClick={primaryAction}>
                  {primaryLabel} <ChevronRight size={16} />
                </button>
              )}
              {primaryAction !== goChallenge && (
                <button type="button" className="empty-cta-secondary" onClick={goChallenge}>
                  Try a Challenge
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  const cardState = progress?.[card.id];
  const isNew = !cardState;
  const cat = CATEGORIES.find(c => c.id === card.cat);

  return (
    <div className="tab-content cards-tab-content">
      <div className="cards-header">
        <div className="cards-progress-text">
          <span className="cards-progress-text-left">
            {sessionDone > 0 && (
              <span className="session-done" title={doneTitle} aria-label={doneTitle}>{doneLabel}</span>
            )}
            <span className="queue-remaining" title={leftTitle} aria-label={leftTitle}>{leftLabel}</span>
          </span>
          {lastReviewSnapshot && (Date.now() - lastReviewSnapshot.timestamp < 30000) && (
            <button className="cards-undo-btn" onClick={handleUndo} title="Undo last rating">
              <RotateCcw size={12} /> Undo
            </button>
          )}
        </div>
        <div className="cards-progress-bar">
          <div className="cards-progress-fill" style={{ width: sessionDone > 0 && sessionTotal > 0 ? `${Math.min(100, (sessionDone / sessionTotal) * 100)}%` : '0%' }} />
        </div>
      </div>

      <div className="srs-card-wrap">
        <div className="srs-card-flip-wrap">
          <div className={`srs-card-flip ${revealed ? 'srs-card-flip-revealed' : ''}`}>
            {/* ============ FRONT FACE ============ */}
            <div
              className={`srs-card srs-card-face srs-card-face-front srs-card-mode-${viewMode || 'speak'} ${showCharacters ? 'srs-card-with-coach' : ''}`}
              onClick={handleReveal}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleReveal(); } }}
              aria-label="Reveal answer"
            >
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

              {/* Tutor coach embedded at the top of the lesson card. Hidden
                  when the user disables `showCharacters` in Settings — the
                  card still works, it just looks cleaner. */}
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
                    <div className="srs-card-ph-front">{card.ph || <span className="srs-card-ph-pending">phonetic unavailable</span>}</div>
                  </>
                ) : (
                  <>
                    {/* speak mode: phonetic primary, Thai script small/secondary */}
                    <div className="srs-card-ph-primary">{card.ph || <span className="srs-card-ph-pending">phonetic unavailable</span>}</div>
                    <div className="srs-card-thai srs-card-thai-secondary">{card.thai}</div>
                  </>
                )}
              </div>

              <div className="srs-card-prompt">
                <div className="srs-card-prompt-text">Tap to reveal</div>
                <div className="srs-card-prompt-hint">Try to recall the meaning first</div>
              </div>
            </div>

            {/* ============ BACK FACE ============ */}
            <div className="srs-card srs-card-face srs-card-face-back" aria-hidden={!revealed}>
              <div className="srs-card-back-meta">
                {cat && <span className="srs-card-cat" style={{ color: cat.color }}>{cat.icon} {cat.name}</span>}
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
            </div>
          </div>
        </div>

        {/* I know this - skip button (only when card is new and not yet revealed) */}
        {isNew && !revealed && markCardKnown && (
          <button className="srs-skip-btn" onClick={(e) => { e.stopPropagation(); handleSkip(); }} disabled={ratingLocked}>
            I already know this. Skip
          </button>
        )}
      </div>

      {revealed && (
        <>
          <div className="rate-row">
            <RateBtn rating={1} label="Again" subLabel={intervalLabel(cardState, 1)} color="#A03B2C" onClick={() => handleRate(1)} disabled={ratingLocked} />
            <RateBtn rating={2} label="Hard"  subLabel={intervalLabel(cardState, 2)} color="#E0823B" onClick={() => handleRate(2)} disabled={ratingLocked} />
            <RateBtn rating={3} label="Good"  subLabel={intervalLabel(cardState, 3)} color="#2E7D5B" onClick={() => handleRate(3)} disabled={ratingLocked} />
            <RateBtn rating={4} label="Easy"  subLabel={intervalLabel(cardState, 4)} color="#2563A8" onClick={() => handleRate(4)} disabled={ratingLocked} />
          </div>
          <div className="card-skip-row">
            <button className="card-skip-btn" onClick={handleSkip} disabled={ratingLocked}>I already know this. Skip</button>
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
