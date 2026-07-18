import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Award, Check, CheckCircle2, ChevronRight, Crown, Gem, Heart, Play, RotateCcw, Volume2, X, XCircle } from 'lucide-react';
import { speakThai, ttsAvailable } from '../lib/audio.js';
import { hasActiveAdSlot } from '../config/site.js';
import { playCharacterCorrect, playCharacterWrong } from '../lib/sounds.js';
import {
  buildChallenge,
  countChallengePool,
  MIN_CHALLENGE_POOL,
  getDisplayed,
  getPromptText,
  getAnswerText,
} from '../lib/challengeQuestions.js';
import { HEART_MAX, REFILL_COST_GEMS, regenState, formatCountdown } from '../lib/economy.js';
import { resolveCoachIdForStage } from '../data/stageCharacters.js';
import { useCharacterReaction } from '../hooks/useCharacterReaction.js';
import { useSessionCombo } from '../hooks/useSessionCombo.js';
import CharacterCoach from './CharacterCoach.jsx';
import ComboBadge from './ComboBadge.jsx';

// Direction labels/copy for the two Challenge modes. The question-selection
// logic lives in lib/challengeQuestions.js (stage + learned-card scoping).
const QUESTION_TYPES = {
  'thai-to-en': {
    label: 'Thai to English',
    intro: 'Read Thai and choose the meaning.',
    promptLabel: 'Choose the English meaning',
    answerLabel: 'Meaning',
  },
  'en-to-thai': {
    label: 'English to Thai',
    intro: 'Read English and choose the Thai.',
    promptLabel: 'Choose the Thai',
    answerLabel: 'Thai',
  },
};

export default function QuizTab({
  onComplete,
  voice,
  maxUnlockedStage,
  stageState,
  progress,
  audioRate = 0.95,
  showCharacters = true,
  // Hearts economy (Challenge-only). `hearts` is the EFFECTIVE (regenerated)
  // count; `isSuper` users are unlimited (never lose a heart, never blocked).
  // onSpendHeart is called on a WRONG answer for free users; onRefillHearts +
  // onOpenSuper power the "out of hearts" gate. `stats` feeds the regen
  // countdown. Hearts NEVER affect flashcard review — only this Challenge.
  hearts = HEART_MAX,
  isSuper = false,
  gems = 0,
  stats = null,
  onSpendHeart,
  onRefillHearts,
  onOpenSuper,
  onWatchAd,
  setTab,
  // Mastery overlay (optional; no-op if absent). Called ONLY on a correct graded
  // answer: thai-to-en → 'recognized', en-to-thai → 'produced'. Never on wrong.
  // Advances a parallel achievement track only — never gates, never spends a
  // heart, never touches SRS/grading/shuffle.
  onMastery,
}) {
  // Stages the user may be challenged on: unlocked and with content. Locked
  // stages are intentionally excluded so a Stage N Challenge can never pull
  // cards the user hasn't reached.
  const challengeStages = useMemo(
    () => (stageState?.stages || []).filter(s => s.unlocked && s.total > 0),
    [stageState]
  );
  // Default the picker to the current in-progress stage, clamped to what's
  // unlocked. Falls back to the highest unlocked stage if no in-progress one.
  const upper = maxUnlockedStage || 1;
  const defaultStage = Math.min(stageState?.currentStage || upper, upper);
  const [selectedStage, setSelectedStage] = useState(defaultStage);
  const [type, setType] = useState('thai-to-en');
  const [questions, setQuestions] = useState([]);
  const [idx, setIdx] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [poolError, setPoolError] = useState(null);
  const checkLockedRef = useRef(false);

  // "Out of hearts" gate: applies to free users at 0 effective hearts BOTH on the
  // intro AND mid-session. Super users are never gated.
  //
  // WAS intro-only ("mid-session play is never interrupted"), which made hearts
  // decorative once a Challenge had started: a user could hit 0 on question 3 and
  // answer the rest for free. The gate only bit on the NEXT start. Now the gate is
  // session-wide — the moment hearts reach 0 the session STOPS and the conversion
  // surface takes over. Session state (questions/idx/score) stays in component
  // state and is NOT reset, so this only changes what RENDERS: when a heart
  // returns (regen / gems / Super) the gate clears and the SAME question resumes
  // with the score intact. Progress is never lost, and play is never free.
  const onIntro = questions.length === 0;
  const gateEligible = !isSuper;
  // Tick once a second while a free user is BELOW the heart cap, so the regen
  // count stays live and the gate SELF-CLEARS the moment a heart refills — no
  // page refresh needed (the `hearts` prop can be a stale snapshot).
  // Wave 11: the tick used to run only at 0 hearts, so between 1 and 4 hearts
  // the displayed count was frozen at the last unrelated render and the intro
  // could show a stale value; regen itself always ran (economy.js gates on
  // `stored < HEART_MAX`), it simply wasn't shown.
  const [nowTick, setNowTick] = useState(() => Date.now());
  useEffect(() => {
    if (!gateEligible || hearts >= HEART_MAX) return undefined;
    const t = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(t);
  }, [gateEligible, hearts]);
  const regen = useMemo(
    () => (gateEligible ? regenState(stats, nowTick) : null),
    [gateEligible, stats, nowTick]
  );
  // Live regenerated heart count (falls back to the prop). The gate opens/closes
  // on this, so a refilled heart clears the gate on its own tick.
  const heartsLive = regen ? regen.hearts : hearts;
  const outOfHearts = gateEligible && heartsLive <= 0;
  const canAffordRefill = gems >= REFILL_COST_GEMS;

  // Is the selected stage fully complete? Completed stages may be challenged on
  // their whole deck (mastery review); in-progress/unstarted stages only on the
  // cards the user has actually learned (seen) so far.
  const selectedStageMeta = useMemo(
    () => (stageState?.stages || []).find(s => s.id === selectedStage) || null,
    [stageState, selectedStage]
  );
  const selectedStageComplete = !!selectedStageMeta?.complete;
  // How many cards are actually challengeable for the selected stage under the
  // learned/unlocked rule. Drives the "needs more learning" empty state so a
  // stage with too few learned cards never starts a half-empty (or unseen)
  // quiz, and never silently borrows cards from another stage.
  const challengePoolCount = useMemo(
    () => countChallengePool({ stageId: selectedStage, voice, progress, stageComplete: selectedStageComplete }),
    [selectedStage, voice, progress, selectedStageComplete]
  );
  const stageReady = challengePoolCount >= MIN_CHALLENGE_POOL;

  const current = questions[idx] || null;
  const correctDisplay = current ? getDisplayed(current.correct, voice) : null;
  const selected = current?.options.find(option => option.id === selectedId) || null;
  const selectedIsCorrect = !!(selected && current && selected.id === current.correct.id);
  const coachId = useMemo(
    () => resolveCoachIdForStage(current?.correct?.stage || selectedStage || maxUnlockedStage || 1),
    [current?.correct?.stage, selectedStage, maxUnlockedStage]
  );
  const coach = useCharacterReaction({ characterId: coachId, initialState: 'greeting', mode: 'quiz' });
  // Transient in-round combo (spec 04 §3): session-only momentum, no XP/gems/SRS/
  // hearts. Reset when a fresh Challenge round starts so the pill reflects the
  // current round. Hearts are unaffected — combo is display-only.
  const combo = useSessionCombo();

  // The coach is reset SYNCHRONOUSLY when a question starts (startQuiz) and when
  // advancing (handleContinue) — not in a post-paint effect. A post-paint reset
  // let the NEXT question briefly paint with the PREVIOUS question's reaction
  // image (correct/wrong) before it cleared, leaking the reaction across
  // questions (B3). Resetting in the same batch as setIdx means the new question
  // never renders with a stale face.
  const resetCoachForQuestion = () => coach.react('greeting', { duration: 1400, message: 'Pick the best answer.' });

  const startQuiz = (nextType) => {
    // Block STARTING a new Challenge when out of hearts (free users). This also
    // catches the results-screen "Try again" (which is a fresh start): reset to
    // the intro, where the "out of hearts" gate is shown. Super = never blocked.
    // Uses heartsLive (the locally-ticked regenerated count the gate opens/closes
    // on) instead of the `hearts` prop, so a heart that just regenerated lets the
    // user start immediately rather than being briefly blocked by a stale prop.
    if (!isSuper && heartsLive <= 0) {
      resetQuiz();
      return;
    }
    const stage = selectedStage || upper;
    const built = buildChallenge({
      type: nextType,
      stageId: stage,
      voice,
      progress,
      stageComplete: selectedStageComplete,
    });
    if (built.questions.length < 1) {
      // Guide the user instead of failing. Never pad from another stage.
      setPoolError(
        selectedStageComplete
          ? `Not enough Stage ${stage} cards for this challenge yet.`
          : built.poolSize === 0
            ? `Start Stage ${stage} in Learn first, then come back for a Challenge.`
            : `Learn a few more Stage ${stage} cards in Learn, then come back for a Challenge.`
      );
      return;
    }
    setType(nextType);
    setQuestions(built.questions);
    setIdx(0);
    setSelectedId(null);
    setChecked(false);
    setScore(0);
    setDone(false);
    setPoolError(null);
    checkLockedRef.current = false;
    combo.reset();
    resetCoachForQuestion();
  };

  const resetQuiz = () => {
    setQuestions([]);
    setIdx(0);
    setSelectedId(null);
    setChecked(false);
    setScore(0);
    setDone(false);
    setPoolError(null);
    checkLockedRef.current = false;
    coach.clearMessage();
  };

  const handleSelect = (option) => {
    if (checked) return;
    setSelectedId(option.id);
    if (type === 'en-to-thai') {
      const thai = getDisplayed(option, voice)?.thai;
      if (thai) {
        try { speakThai(thai, audioRate); } catch (_) { /* ignore */ }
      }
    }
    coach.react('choiceSelected', { duration: 900, message: 'Locked in?' });
  };

  const handleCheck = () => {
    if (!current || !selected || checked || checkLockedRef.current) return;
    checkLockedRef.current = true;
    setChecked(true);
    const isCorrect = selected.id === current.correct.id;
    combo.register(isCorrect);
    if (isCorrect) {
      setScore(prev => prev + 1);
      // Mastery signal by direction (grade already by option.id above): reading
      // Thai→English demonstrates recognition; English→Thai demonstrates production.
      onMastery?.(current.correct.id, type === 'thai-to-en' ? 'recognized' : 'produced');
      coach.react('correct', { duration: 1700 });
      playCharacterCorrect(coachId);
    } else {
      // Lose one heart per WRONG answer — free users only. Super = unlimited, so
      // never spend. This never interrupts the current session (the block only
      // applies to STARTING a new Challenge, handled on the intro screen).
      if (!isSuper && onSpendHeart) onSpendHeart();
      coach.react('wrong', { duration: 1900 });
      playCharacterWrong(coachId);
    }
  };

  const handleContinue = () => {
    if (!checked) return;
    if (idx + 1 >= questions.length) {
      const finalScore = score;
      setDone(true);
      coach.react(finalScore === questions.length ? 'celebrating' : 'idle', { duration: 1800 });
      // Pass the selected stage so the app can label/celebrate a Stage N result.
      if (onComplete) onComplete(finalScore, questions.length, selectedStage);
      return;
    }
    setIdx(prev => prev + 1);
    setSelectedId(null);
    setChecked(false);
    checkLockedRef.current = false;
    resetCoachForQuestion();
  };

  const canPlayPromptAudio = type === 'thai-to-en' && ttsAvailable() && !!correctDisplay?.thai;

  const playCorrectThai = () => {
    if (!canPlayPromptAudio) return;
    if (correctDisplay?.thai) speakThai(correctDisplay.thai, audioRate);
    coach.react('speaking', { duration: 1400 });
  };

  // The out-of-hearts conversion surface. Rendered on the intro (no session yet)
  // AND mid-session, where it PAUSES the Challenge instead of ending it: session
  // state is untouched, so clearing the gate resumes the same question. `resume`
  // is passed only mid-session, so the "progress is saved" promise is only made
  // when it is actually true.
  const renderHeartsGate = (resume = null) => (
    <div className="quiz-hearts-gate" role="group" aria-label="Out of hearts">
      <div className="quiz-hearts-gate-icon" aria-hidden="true"><Heart size={30} /></div>
      <div className="quiz-hearts-gate-title">Out of hearts</div>
      <p className="quiz-hearts-gate-copy">
        Hearts are only used in the Challenge. Your practice and lessons are always free —
        keep learning while your hearts refill.
      </p>
      {resume && (
        <div className="quiz-hearts-gate-resume" role="status">
          Your Challenge is paused and saved — you'll pick up at{' '}
          <strong>question {resume.at} of {resume.total}</strong>, {resume.score} correct so far.
        </div>
      )}
      <div className="quiz-hearts-gate-regen">
        {regen && regen.nextRegenMs > 0
          ? <>Next heart in <strong>{formatCountdown(regen.nextRegenMs)}</strong></>
          : 'A heart is ready — you can play now.'}
      </div>
      <div className="quiz-hearts-gate-actions">
        {/* This is the app's most important conversion surface, so Super
            is the PRIMARY CTA (intent 'quiz' is captured by the caller so
            checkout returns here). Gem refill is the secondary path. */}
        {onOpenSuper && (
          <button type="button" className="btn-primary quiz-hearts-gate-super" onClick={() => onOpenSuper()}>
            <Crown size={14} aria-hidden="true" /> Go unlimited with Super
          </button>
        )}
        {onRefillHearts && (
          <button
            type="button"
            className="btn-secondary quiz-hearts-gate-refill"
            onClick={() => onRefillHearts()}
            disabled={!canAffordRefill}
            title={canAffordRefill ? `Refill hearts for ${REFILL_COST_GEMS} gems` : `Need ${REFILL_COST_GEMS} gems to refill`}
          >
            <Gem size={14} aria-hidden="true" /> Refill ({REFILL_COST_GEMS} gems)
          </button>
        )}
        {/* Rewarded-ad slot — HIDDEN until an ad unit is configured
            (VITE_REWARDED_AD_UNIT), like the social/donation gates. No ad
            network is integrated here (owner decision). */}
        {hasActiveAdSlot() && onWatchAd && (
          <button type="button" className="btn-secondary quiz-hearts-gate-ad" onClick={() => onWatchAd()}>
            <Play size={14} aria-hidden="true" /> Watch an ad for a heart
          </button>
        )}
      </div>
      {!canAffordRefill && (
        <div className="quiz-hearts-gate-hint">
          You have {gems} gem{gems === 1 ? '' : 's'}. Earn more by hitting your daily goal and passing Challenges.
        </div>
      )}
      {setTab && (
        <button type="button" className="quiz-hearts-gate-practice" onClick={() => setTab('cards')}>
          You can still learn and review for free →
        </button>
      )}
    </div>
  );

  if (questions.length === 0) {
    return (
      <div className="tab-content quiz-mode">
        <div className="quiz-mode-intro">
          {showCharacters && (
            <div className="quiz-mode-coach">
              <CharacterCoach
                characterId={coachId}
                state={coach.state}
                message={coach.message || 'Ready for a quick challenge?'}
                compact
              />
            </div>
          )}
          <div className="quiz-mode-intro-icon"><Award size={34} /></div>
          <h2 className="quiz-mode-title">Stage {selectedStage} Challenge</h2>
          <p className="quiz-mode-sub">Pick a stage, then a direction. You'll be tested only on that stage's cards.</p>
          {challengeStages.length > 1 && (
            <div className="quiz-stage-select">
              <div className="quiz-stage-select-label">Choose a stage</div>
              <div className="quiz-stage-chips" role="group" aria-label="Select challenge stage">
                {challengeStages.map(s => (
                  <button
                    key={s.id}
                    type="button"
                    className={`quiz-stage-chip ${s.id === selectedStage ? 'quiz-stage-chip-active' : ''}`}
                    aria-pressed={s.id === selectedStage}
                    onClick={() => { setSelectedStage(s.id); setPoolError(null); }}
                  >
                    Stage {s.id}
                  </button>
                ))}
              </div>
            </div>
          )}
          {poolError && <p className="quiz-pool-error">{poolError}</p>}
          {/* Hearts status on the intro (free users only). Super = unlimited. */}
          {!isSuper && !outOfHearts && (
            <div className="quiz-hearts-status" aria-label={`Hearts: ${heartsLive} of ${HEART_MAX}`}>
              {Array.from({ length: HEART_MAX }).map((_, i) => (
                <Heart
                  key={i}
                  size={16}
                  className={i < heartsLive ? 'quiz-heart-full' : 'quiz-heart-empty'}
                  aria-hidden="true"
                  fill={i < heartsLive ? 'currentColor' : 'none'}
                />
              ))}
              <span className="quiz-hearts-status-text">{heartsLive}/{HEART_MAX}</span>
              {/* The countdown is no longer exclusive to the out-of-hearts
                  gate: below the cap, say when the next heart lands. */}
              {regen && regen.nextRegenMs > 0 && heartsLive < HEART_MAX && (
                <span className="quiz-hearts-status-regen">+1 in {formatCountdown(regen.nextRegenMs)}</span>
              )}
            </div>
          )}
          {outOfHearts ? renderHeartsGate() : stageReady ? (
            <div className="quiz-mode-direction-grid">
              {Object.entries(QUESTION_TYPES).map(([id, config]) => (
                <button key={id} className="quiz-mode-direction-btn" onClick={() => startQuiz(id)}>
                  <span className="quiz-mode-direction-title">{config.label}</span>
                  <span className="quiz-mode-direction-sub">{config.intro}</span>
                  <ChevronRight size={18} />
                </button>
              ))}
            </div>
          ) : (
            <div className="quiz-stage-empty">
              {challengePoolCount === 0
                ? `Start Stage ${selectedStage} in Learn first, then come back for a Challenge.`
                : `Learn a few more Stage ${selectedStage} cards in Learn, then come back for a Challenge.`}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (done) {
    const pct = Math.round((score / questions.length) * 100);
    const msg = pct === 100 ? 'Perfect round.' : pct >= 80 ? 'Strong challenge.' : pct >= 60 ? 'Good practice.' : 'Keep practicing.';
    return (
      <div className="tab-content quiz-mode">
        <div className="quiz-mode-results">
          {showCharacters && (
            <div className="quiz-mode-coach">
              <CharacterCoach
                characterId={coachId}
                state={coach.state}
                message={coach.message || (pct >= 80 ? 'Strong run!' : 'Keep practicing.')}
                compact
              />
            </div>
          )}
          <div className="quiz-mode-results-icon">{pct >= 80 ? <CheckCircle2 size={54} /> : <Award size={54} />}</div>
          <div className="quiz-mode-results-score">{score} / {questions.length}</div>
          <div className="quiz-mode-results-pct">{pct}%</div>
          <div className="quiz-mode-results-msg">{msg}</div>
          <div className="quiz-results-actions">
            <button className="btn-primary" onClick={() => startQuiz(type)}><RotateCcw size={14} /> Try again</button>
            <button className="btn-secondary" onClick={resetQuiz}>Change stage or direction</button>
          </div>
        </div>
      </div>
    );
  }

  // MID-SESSION HEARTS GATE. Hearts hit 0 while a Challenge is in progress: the
  // session PAUSES here rather than letting the user answer on for free (the old
  // behaviour, which made hearts decorative once a session had started). Placed
  // AFTER the `done` branch so a finished Challenge still shows its results, and
  // BEFORE the question render so the next question is unreachable without a
  // heart. Nothing is reset — questions/idx/score stay in state, so when a heart
  // arrives (regen tick, gem refill, or Super) this branch simply stops matching
  // and the SAME question re-renders with the score intact.
  //
  // `!checked` matters: a heart is only ever spent by answering WRONG, which sets
  // checked=true. Gating on the checked question would yank the screen away before
  // the user sees the feedback for the answer they just PAID a heart for. So the
  // answered question finishes normally; the gate lands on the NEXT (unanswered)
  // question — which is exactly the one they cannot have for free.
  if (outOfHearts && !checked) {
    return (
      <div className="tab-content quiz-mode">
        <div className="quiz-mode-intro">
          {renderHeartsGate({ at: idx + 1, total: questions.length, score })}
        </div>
      </div>
    );
  }

  const typeConfig = QUESTION_TYPES[type];
  const prompt = getPromptText(current.correct, type, voice);
  const progressPct = Math.round((idx / questions.length) * 100);
  // Clearer prompt label: say "sentence" vs "word" when the answer is a Thai
  // phrase/sentence so options that mix lengths never read as ambiguous. Purely
  // presentational — does not affect question selection or challenge scope.
  const correctIsSentence = current.correct?.type === 's' || current.correct?.type === 'p';
  const promptLabel = type === 'en-to-thai'
    ? (correctIsSentence ? 'Choose the Thai sentence' : 'Choose the Thai word')
    : typeConfig.promptLabel;

  return (
    <div className="tab-content quiz-mode">
      <div className="quiz-mode-header">
        <div>
          <div className="quiz-progress-text">Stage {selectedStage} Challenge · Question {idx + 1} of {questions.length}</div>
          <div className="quiz-mode-type">{typeConfig.label}</div>
        </div>
        <div className="quiz-header-meta">
          <ComboBadge
            combo={combo}
            onMilestone={(tier) => coach.react('celebrating', { duration: 1600, message: tier >= 10 ? 'On fire!' : 'Strong run!' })}
          />
          <div className="quiz-score-text">Score: <span>{score}</span></div>
        </div>
      </div>
      <div className="quiz-progress-bar"><div className="quiz-progress-fill" style={{ width: `${progressPct}%` }} /></div>

      <section className={`quiz-mode-card quiz-mode-card-${type}`}>
        {showCharacters && (
          <div className="quiz-mode-coach quiz-mode-coach-card">
            <CharacterCoach
              characterId={coachId}
              state={coach.state}
              message={coach.message}
              compact
            />
          </div>
        )}
        <div className="quiz-mode-prompt-label">{promptLabel}</div>
        <div className={`quiz-mode-prompt ${type === 'thai-to-en' ? 'quiz-mode-prompt-thai' : 'quiz-mode-prompt-en'}`}>
          {prompt}
        </div>
        {type === 'thai-to-en' && correctDisplay?.ph && (
          <div className="quiz-mode-prompt-ph">{correctDisplay.ph}</div>
        )}
        {canPlayPromptAudio && (
          <button
            type="button"
            className="speaker-btn speaker-btn-card quiz-mode-speaker"
            onClick={playCorrectThai}
            aria-label="Play pronunciation"
            title="Play pronunciation"
          >
            <Volume2 size={16} />
          </button>
        )}
      </section>

      <div className="quiz-mode-options" role="list">
        {current.options.map((rawOpt, i) => {
          const opt = getDisplayed(rawOpt, voice);
          const answer = getAnswerText(rawOpt, type, voice);
          const isCorrect = rawOpt.id === current.correct.id;
          const isSelected = rawOpt.id === selectedId;
          const cls = [
            'quiz-mode-option',
            isSelected && !checked && 'quiz-mode-option-selected',
            checked && isCorrect && 'quiz-mode-option-correct',
            checked && isSelected && !isCorrect && 'quiz-mode-option-wrong',
            checked && !isSelected && !isCorrect && 'quiz-mode-option-faded',
          ].filter(Boolean).join(' ');

          return (
            <button
              key={rawOpt.id}
              type="button"
              className={cls}
              onClick={() => handleSelect(rawOpt)}
              disabled={checked}
              aria-pressed={isSelected}
            >
              <span className="quiz-option-letter">{String.fromCharCode(65 + i)}</span>
              <span className="quiz-mode-option-main">
                {type === 'en-to-thai' ? (
                  <>
                    <span className="quiz-mode-option-thai">{answer}</span>
                    {opt.ph && <span className="quiz-mode-option-sub">{opt.ph}</span>}
                  </>
                ) : (
                  <span className="quiz-mode-option-en">{answer}</span>
                )}
              </span>
              {checked && isCorrect && <Check size={18} className="quiz-option-check" />}
              {checked && isSelected && !isCorrect && <X size={18} className="quiz-option-check" />}
            </button>
          );
        })}
      </div>

      <div className="quiz-mode-actions">
        {!checked ? (
          <button className="btn-primary quiz-mode-check-btn" onClick={handleCheck} disabled={!selectedId}>
            Check
          </button>
        ) : (
          <button className="btn-primary quiz-mode-check-btn" onClick={handleContinue}>
            {idx + 1 >= questions.length ? 'See results' : 'Continue'} <ChevronRight size={16} />
          </button>
        )}
      </div>

      {checked && (
        <div className={`quiz-mode-feedback ${selectedIsCorrect ? 'quiz-mode-feedback-correct' : 'quiz-mode-feedback-wrong'}`}>
          <div className="quiz-mode-feedback-icon">
            {selectedIsCorrect ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
          </div>
          <div className="quiz-mode-feedback-body">
            <div className="quiz-mode-feedback-title">
              {selectedIsCorrect ? 'Correct.' : 'Not quite.'}
            </div>
            <div className="quiz-mode-feedback-detail">
              Correct {typeConfig.answerLabel.toLowerCase()}: <strong>{getAnswerText(current.correct, type, voice)}</strong>
            </div>
            <div className="quiz-mode-feedback-pair">
              <span className="quiz-mode-feedback-pair-text">
                {correctDisplay.thai}
                {correctDisplay.ph ? ` (${correctDisplay.ph})` : ''} = {correctDisplay.en}
              </span>
              {ttsAvailable() && correctDisplay?.thai && (
                <button
                  type="button"
                  className="speaker-btn speaker-btn-inline quiz-feedback-speaker"
                  onClick={() => { speakThai(correctDisplay.thai, audioRate); coach.react('speaking', { duration: 1400 }); }}
                  aria-label="Play pronunciation"
                  title="Play pronunciation"
                >
                  <Volume2 size={15} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
