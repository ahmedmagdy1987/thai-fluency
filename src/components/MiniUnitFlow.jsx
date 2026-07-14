import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, CheckCircle2, ChevronRight, Clock, RotateCcw, Sparkles, Volume2, X } from 'lucide-react';
import { CARDS } from '../data/cards.js';
import { displayCard, displayBuilder, transformText } from '../lib/voice.js';
import { speakThai, ttsAvailable } from '../lib/audio.js';
import { playCelebration, playCharacterCorrect, playCharacterSelect, playCharacterWrong, playFlip } from '../lib/sounds.js';
import { useCharacterReaction } from '../hooks/useCharacterReaction.js';
import CharacterCoach from './CharacterCoach.jsx';
import SentenceBuilder from './SentenceBuilder.jsx';
import CardDirectionToggle from './CardDirectionToggle.jsx';
import { useAttemptDirection } from '../hooks/useAttemptDirection.js';
import { faceIsEnglishFirst } from '../lib/attemptDirection.js';
import { resolveCoachIdForStage } from '../data/stageCharacters.js';

function cardsByIds(ids, voice) {
  return ids
    .map(id => CARDS.find(card => card.id === id))
    .filter(Boolean)
    .map(card => displayCard(card, voice) || card);
}

// Fisher-Yates shuffle (pure; copies the input). Used to randomize BOTH the
// question order and each question's option order per attempt.
function shuffle(items) {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// MiniUnitFlow is a REPEATABLE quiz (replayable from LearnPath), so a fixed
// layout let a learner memorize "question 1 = option 4" by position instead of
// meaning (B6). Shuffle the QUESTION order AND each question's OPTIONS on every
// build. Correctness is tracked by option.id (never by index), so shuffling the
// display order can't desync the answer. This runs inside useMemo([challengeCards])
// below, so it reshuffles once per mount = once per attempt.
function buildMiniChallenge(cards) {
  return shuffle(cards).map((correct) => {
    const distractors = cards.filter(card => card.id !== correct.id).slice(0, 3);
    const options = shuffle([correct, ...distractors]);
    return {
      id: `mini-${correct.id}`,
      correct,
      prompt: correct.en,
      options,
    };
  });
}

function safeNonNegativeIndex(value) {
  const index = Number.isFinite(Number(value)) ? Number(value) : 0;
  return Math.max(0, index);
}

// Module-scope on purpose: defining this inside MiniUnitFlow would give React
// a new component type every render, remounting the whole card subtree and
// dropping keyboard focus on each reveal/toggle/coach tick.
function CardPractice({ card, label, onNext, nextLabel, revealed, onReveal, onHide, onSpeak, cardDirection, onChangeCardDirection }) {
  // Freeze the faces for THIS card. Toggling direction while the answer is still
  // hidden can't swap the hidden side onto the prompt (the anti-peek lock); the
  // preference only takes effect on the next card.
  const { attemptDirection, changeDirection } = useAttemptDirection(cardDirection, card?.id ?? 'none');
  const isEnglishFirst = faceIsEnglishFirst(attemptDirection);
  const handleChangeDirection = (next) =>
    changeDirection(next, { active: !revealed, applyLive: onChangeCardDirection });
  return (
    <section className="miniunit-practice-card">
      <div className="miniunit-step-label">{label}</div>
      <CardDirectionToggle value={cardDirection} onChange={handleChangeDirection} className="miniunit-direction-toggle" />
      {cardDirection !== attemptDirection && (
        <div className="miniunit-direction-hint" role="status">Direction applies to the next card</div>
      )}
      <div
        className={`miniunit-flash-card ${revealed ? 'miniunit-flash-card-revealed' : ''}`}
        onClick={onReveal}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onReveal();
          }
        }}
        aria-label={isEnglishFirst
          ? `${card.en}. Tap to reveal the Thai`
          : `${card.ph || card.thai}. Tap to reveal the meaning`}
      >
        <div className="miniunit-card-top">
          <span>{card.type === 's' || card.type === 'p' ? 'Phrase' : 'Word'}</span>
          {/* English-first hides the speaker until reveal so the audio can't
              give the Thai answer away. */}
          {(!isEnglishFirst || revealed) && ttsAvailable() && card.thai && (
            <span
              role="button"
              tabIndex={0}
              className="speaker-btn speaker-btn-card miniunit-speaker"
              onClick={(e) => { e.stopPropagation(); onSpeak(card.thai); }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  e.stopPropagation();
                  onSpeak(card.thai);
                }
              }}
              title="Hear pronunciation"
              aria-label="Play pronunciation"
            >
              <Volume2 size={16} />
            </span>
          )}
        </div>
        {isEnglishFirst ? (
          <>
            <div className="miniunit-card-en-primary">{card.en}</div>
            {revealed ? (
              <>
                {card.ph && <div className="miniunit-card-ph miniunit-card-ph-answer">{card.ph}</div>}
                <div className="miniunit-card-thai miniunit-card-thai-secondary">{card.thai}</div>
              </>
            ) : (
              <div className="miniunit-card-hint">Tap to reveal the Thai</div>
            )}
          </>
        ) : (
          <>
            <div className="miniunit-card-thai">{card.thai}</div>
            {card.ph && <div className="miniunit-card-ph">{card.ph}</div>}
            {revealed ? (
              <div className="miniunit-card-en">{card.en}</div>
            ) : (
              <div className="miniunit-card-hint">Tap to reveal meaning</div>
            )}
          </>
        )}
      </div>
      <div className="miniunit-card-actions">
        <button type="button" className="btn-secondary" onClick={onHide} disabled={!revealed}>
          <RotateCcw size={14} /> Hide
        </button>
        <button type="button" className="btn-primary" onClick={onNext}>
          {nextLabel} <ChevronRight size={16} />
        </button>
      </div>
    </section>
  );
}

export default function MiniUnitFlow({
  unit,
  voice,
  cardDirection = 'en-first',
  onChangeCardDirection,
  audioRate = 0.8,
  showCharacters = true,
  initialProgress,
  onProgressChange,
  onExit,
  onOpenCards,
  onOpenChallenge,
}) {
  const savedProgress = initialProgress?.unitId === unit.unitId ? initialProgress : null;
  const [step, setStep] = useState(savedProgress?.step || 'intro');
  const [vocabIndex, setVocabIndex] = useState(() => safeNonNegativeIndex(savedProgress?.vocabIndex));
  const [revealed, setRevealed] = useState(!!savedProgress?.revealed);
  const [challengeIndex, setChallengeIndex] = useState(() => safeNonNegativeIndex(savedProgress?.challengeIndex));
  // Do NOT restore a mid-question selection: the per-attempt reshuffle in
  // buildMiniChallenge means a saved option id no longer maps to this render's
  // options, so a resumed challenge question always starts unanswered (B6).
  // challengeIndex and the running score are still restored, so resume position
  // is preserved.
  const [selectedId, setSelectedId] = useState(null);
  const [checked, setChecked] = useState(false);
  const [challengeScore, setChallengeScore] = useState(savedProgress?.challengeScore || 0);
  const [builderComplete, setBuilderComplete] = useState(!!savedProgress?.builderComplete);
  const checkLockedRef = useRef(false);
  const completedSoundRef = useRef(false);

  // The unit has a sentence-builder step only when it ships explicit, safe
  // token data. Other units skip straight from the sentence card to challenge.
  const hasBuilder = !!(unit.sentenceBuilder && Array.isArray(unit.sentenceBuilder.tokens) && unit.sentenceBuilder.tokens.length > 0);

  const vocabCards = useMemo(() => cardsByIds(unit.vocabCardIds, voice), [unit, voice]);
  const sentenceCard = useMemo(() => cardsByIds([unit.sentenceCardId], voice)[0] || null, [unit, voice]);
  const challengeCards = useMemo(() => cardsByIds(unit.challengeCardIds, voice), [unit, voice]);
  const challengeQuestions = useMemo(() => buildMiniChallenge(challengeCards), [challengeCards]);
  // Speaking style applied at the display layer: builder tiles flip together
  // with the sentence (answer checking is token-ID based, so it stays valid),
  // and intro/recap prose flips its embedded Thai/romanization. transformText
  // leaves prose that explicitly teaches the male/female contrast unchanged.
  const builderData = useMemo(() => displayBuilder(unit.sentenceBuilder, voice), [unit, voice]);
  const lessonIntro = useMemo(() => {
    const raw = unit.lessonIntro || null;
    if (!raw || voice !== 'female') return raw;
    return {
      ...raw,
      lead: transformText(raw.lead, voice),
      points: Array.isArray(raw.points)
        ? raw.points.map(p => ({ ...p, text: transformText(p.text, voice) }))
        : raw.points,
    };
  }, [unit, voice]);
  const recapLines = useMemo(
    () => (unit.recapText || []).map(line => transformText(line, voice)),
    [unit, voice]
  );
  const previewLines = useMemo(
    () => (unit.previewText || []).map(line => transformText(line, voice)),
    [unit, voice]
  );
  const missionRecap = useMemo(() => {
    const raw = unit.missionRecap || null;
    if (!raw || voice !== 'female') return raw;
    return {
      ...raw,
      headline: transformText(raw.headline, voice),
      lead: transformText(raw.lead, voice),
      achievements: Array.isArray(raw.achievements)
        ? raw.achievements.map(item => transformText(item, voice))
        : raw.achievements,
    };
  }, [unit, voice]);
  // Resolve the coach from the unit's STAGE so every stage shows its own
  // mascot. (The unit data only carries an 'elephant' default characterId for
  // stages 2-8, so we must derive the real mascot from the stage here.)
  const coachId = useMemo(() => resolveCoachIdForStage(unit.stageId), [unit.stageId]);
  const coach = useCharacterReaction({ characterId: coachId, initialState: 'greeting', mode: 'quiz' });

  const currentVocab = vocabCards[vocabIndex] || null;
  const currentChallenge = challengeQuestions[challengeIndex] || null;
  const selectedIsCorrect = !!(currentChallenge && selectedId === currentChallenge.correct.id);

  useEffect(() => {
    onProgressChange?.({
      unitId: unit.unitId,
      step,
      vocabIndex,
      revealed,
      challengeIndex,
      selectedId,
      checked,
      challengeScore,
      builderComplete,
      updatedAt: new Date().toISOString(),
    });
  }, [unit.unitId, step, vocabIndex, revealed, challengeIndex, selectedId, checked, challengeScore, builderComplete, onProgressChange]);

  useEffect(() => {
    if (step === 'complete' && !completedSoundRef.current) {
      completedSoundRef.current = true;
      playCelebration();
      coach.react('celebrating', { duration: 2200, message: 'Mini-unit complete.' });
    }
  }, [step]);

  const triggerSpeak = (text) => {
    if (!text) return;
    try { speakThai(text, audioRate); } catch (_) { /* ignore */ }
    coach.react('speaking', { duration: 1400 });
  };

  const revealCard = () => {
    if (revealed) return;
    setRevealed(true);
    playFlip();
    playCharacterSelect(coachId);
    coach.react('choiceSelected', { duration: 900, message: 'Now connect sound to meaning.' });
  };

  const nextVocab = () => {
    if (vocabIndex + 1 >= vocabCards.length) {
      if (sentenceCard) {
        setStep('sentence');
      } else {
        setStep('challenge');
        setChallengeIndex(0);
        setSelectedId(null);
        setChecked(false);
        setChallengeScore(0);
        checkLockedRef.current = false;
        coach.react('greeting', { duration: 1200, message: 'Pick the Thai you just practiced.' });
      }
      setRevealed(false);
      return;
    }
    setVocabIndex(index => index + 1);
    setRevealed(false);
  };

  const startChallenge = () => {
    setStep('challenge');
    setChallengeIndex(0);
    setSelectedId(null);
    setChecked(false);
    setChallengeScore(0);
    checkLockedRef.current = false;
    coach.react('greeting', { duration: 1200, message: 'Pick the Thai you just practiced.' });
  };

  // After the sentence card: build it (if this unit has builder data), then
  // challenge. The builder must be completed before the unit can finish.
  const afterSentence = () => {
    setRevealed(false);
    if (hasBuilder) {
      setStep('builder');
    } else {
      startChallenge();
    }
  };

  const finishBuilder = () => {
    setBuilderComplete(true);
    startChallenge();
  };

  const selectOption = (option) => {
    if (checked) return;
    setSelectedId(option.id);
    if (option.thai) triggerSpeak(option.thai);
    coach.react('choiceSelected', { duration: 800, message: 'Locked in?' });
  };

  const checkAnswer = () => {
    if (!currentChallenge || !selectedId || checked || checkLockedRef.current) return;
    checkLockedRef.current = true;
    setChecked(true);
    if (selectedId === currentChallenge.correct.id) {
      setChallengeScore(score => score + 1);
      playCharacterCorrect(coachId);
      coach.react('correct', { duration: 1400 });
    } else {
      playCharacterWrong(coachId);
      coach.react('wrong', { duration: 1600 });
    }
  };

  const nextChallenge = () => {
    if (!checked) return;
    if (challengeIndex + 1 >= challengeQuestions.length) {
      setStep('recap');
      return;
    }
    setChallengeIndex(index => index + 1);
    setSelectedId(null);
    setChecked(false);
    checkLockedRef.current = false;
  };

  return (
    <div className="tab-content miniunit-flow">
      <div className="miniunit-topbar">
        <button type="button" className="miniunit-back-btn" onClick={onExit}>Back to Learn</button>
        <div className="miniunit-progress-pill">
          <Clock size={14} /> {unit.estimatedMinutes} min
        </div>
      </div>

      {step === 'intro' && (
        <section className="miniunit-hero">
          {showCharacters && (
            <div className="miniunit-coach">
              <CharacterCoach
                characterId={coachId}
                state={coach.state}
                message={coach.message || 'Ready for a guided mini-unit?'}
                compact
              />
            </div>
          )}
          <div className="miniunit-eyebrow">Stage {unit.stageId} guided lesson</div>
          <h1 className="miniunit-title">{unit.title}</h1>
          <p className="miniunit-sub">{unit.subtitle || unit.introText}</p>
          {lessonIntro && (
            <div className="miniunit-intro-card">
              {lessonIntro.lead && <p className="miniunit-intro-lead">{lessonIntro.lead}</p>}
              {Array.isArray(lessonIntro.points) && lessonIntro.points.length > 0 && (
                <ul className="miniunit-intro-points">
                  {lessonIntro.points.map((p, i) => (
                    <li key={i}><strong>{p.label}:</strong> {p.text}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
          <div className="miniunit-stats-row">
            <span>{vocabCards.length} vocab cards</span>
            {sentenceCard && <span>1 sentence</span>}
            <span>{challengeQuestions.length} challenge questions</span>
          </div>
          <button type="button" className="btn-primary miniunit-primary" onClick={() => setStep('vocab')}>
            Start lesson <ChevronRight size={16} />
          </button>
        </section>
      )}

      {step === 'vocab' && currentVocab && (
        <CardPractice
          card={currentVocab}
          label={`Vocabulary ${vocabIndex + 1} of ${vocabCards.length}`}
          onNext={nextVocab}
          nextLabel={vocabIndex + 1 >= vocabCards.length ? 'Sentence' : 'Next word'}
          revealed={revealed}
          onReveal={revealCard}
          onHide={() => setRevealed(false)}
          onSpeak={triggerSpeak}
          cardDirection={cardDirection}
          onChangeCardDirection={onChangeCardDirection}
        />
      )}

      {step === 'sentence' && sentenceCard && (
        <CardPractice
          card={sentenceCard}
          label="Sentence"
          onNext={afterSentence}
          nextLabel={hasBuilder ? 'Build sentence' : 'Start challenge'}
          revealed={revealed}
          onReveal={revealCard}
          onHide={() => setRevealed(false)}
          onSpeak={triggerSpeak}
          cardDirection={cardDirection}
          onChangeCardDirection={onChangeCardDirection}
        />
      )}

      {step === 'builder' && hasBuilder && (
        <SentenceBuilder
          data={builderData}
          audioRate={audioRate}
          showCharacters={showCharacters}
          characterId={coachId}
          onComplete={finishBuilder}
        />
      )}

      {step === 'challenge' && currentChallenge && (
        <section className="miniunit-challenge">
          <div className="miniunit-step-label">Challenge {challengeIndex + 1} of {challengeQuestions.length}</div>
          {showCharacters && (
            <div className="miniunit-coach miniunit-coach-inline">
              <CharacterCoach
                characterId={coachId}
                state={coach.state}
                message={coach.message}
                compact
              />
            </div>
          )}
          <div className="miniunit-question-card">
            <div className="miniunit-question-label">Choose the Thai</div>
            <div className="miniunit-question-prompt">{currentChallenge.prompt}</div>
          </div>
          <div className="miniunit-options" role="group" aria-label="Answer choices">
            {currentChallenge.options.map((option, index) => {
              const isSelected = selectedId === option.id;
              const isCorrect = option.id === currentChallenge.correct.id;
              const cls = [
                'miniunit-option',
                isSelected && !checked && 'miniunit-option-selected',
                checked && isCorrect && 'miniunit-option-correct',
                checked && isSelected && !isCorrect && 'miniunit-option-wrong',
                checked && !isSelected && !isCorrect && 'miniunit-option-faded',
              ].filter(Boolean).join(' ');
              return (
                <button
                  key={option.id}
                  type="button"
                  className={cls}
                  onClick={() => selectOption(option)}
                  disabled={checked}
                  aria-pressed={isSelected}
                >
                  <span className="miniunit-option-letter">{String.fromCharCode(65 + index)}</span>
                  <span className="miniunit-option-body">
                    <span className="miniunit-option-thai">{option.thai}</span>
                    {option.ph && <span className="miniunit-option-ph">{option.ph}</span>}
                  </span>
                  {checked && isCorrect && <Check size={18} className="miniunit-option-mark" />}
                  {checked && isSelected && !isCorrect && <X size={18} className="miniunit-option-mark" />}
                </button>
              );
            })}
          </div>
          <div className="miniunit-challenge-actions">
            {!checked ? (
              <button type="button" className="btn-primary miniunit-check-btn" onClick={checkAnswer} disabled={!selectedId}>
                Check
              </button>
            ) : (
              <button type="button" className="btn-primary miniunit-check-btn" onClick={nextChallenge}>
                {challengeIndex + 1 >= challengeQuestions.length ? 'Review' : 'Continue'} <ChevronRight size={16} />
              </button>
            )}
          </div>
          {checked && (
            <div className={`miniunit-feedback ${selectedIsCorrect ? 'miniunit-feedback-correct' : 'miniunit-feedback-wrong'}`}>
              {selectedIsCorrect ? <CheckCircle2 size={18} /> : <X size={18} />}
              <span>{selectedIsCorrect ? 'Correct.' : `Answer: ${currentChallenge.correct.thai}`}</span>
            </div>
          )}
        </section>
      )}

      {step === 'recap' && (
        <section className="miniunit-panel">
          <div className="miniunit-step-label">Mini-lesson</div>
          <h2 className="miniunit-panel-title">What you just practiced</h2>
          <div className="miniunit-lesson-grid">
            <div>
              <h3>Recap</h3>
              {recapLines.map(line => <p key={line}>{line}</p>)}
            </div>
            <div>
              <h3>Preview</h3>
              {previewLines.map(line => <p key={line}>{line}</p>)}
            </div>
          </div>
          <button type="button" className="btn-primary miniunit-primary" onClick={() => setStep('complete')}>
            Finish mini-unit <ChevronRight size={16} />
          </button>
        </section>
      )}

      {step === 'complete' && (
        <section className="miniunit-complete">
          <div className="miniunit-complete-icon"><Sparkles size={48} /></div>
          <div className="miniunit-eyebrow">Mini-unit complete</div>
          <h2 className="miniunit-title">{missionRecap?.headline || 'Nice! You learned a focused set of Thai words and a sentence.'}</h2>
          {missionRecap?.lead && <p className="miniunit-sub miniunit-recap-lead">{missionRecap.lead}</p>}
          {Array.isArray(missionRecap?.achievements) && missionRecap.achievements.length > 0 && (
            <ul className="miniunit-recap-list">
              {missionRecap.achievements.map((item, i) => (
                <li key={i} className="miniunit-recap-item">
                  <CheckCircle2 size={15} aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
          <p className="miniunit-sub miniunit-complete-score">Score: {challengeScore} of {challengeQuestions.length}. Cards did most of the learning; Challenge gave you a quick check.</p>
          <div className="miniunit-complete-actions">
            <button type="button" className="btn-primary" onClick={onOpenCards}>Review cards</button>
            <button type="button" className="btn-secondary" onClick={onOpenChallenge}>Open Challenge</button>
            <button type="button" className="btn-secondary" onClick={onExit}>Back to Learn</button>
          </div>
        </section>
      )}
    </div>
  );
}
