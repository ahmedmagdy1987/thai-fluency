import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, CheckCircle2, ChevronRight, Clock, RotateCcw, Sparkles, Volume2, X } from 'lucide-react';
import { CARDS } from '../data/cards.js';
import { displayCard } from '../lib/voice.js';
import { speakThai, ttsAvailable } from '../lib/audio.js';
import { playCelebration, playCharacterCorrect, playCharacterSelect, playCharacterWrong, playFlip } from '../lib/sounds.js';
import { useCharacterReaction } from '../hooks/useCharacterReaction.js';
import CharacterCoach from './CharacterCoach.jsx';
import SentenceBuilder from './SentenceBuilder.jsx';

function cardsByIds(ids, voice) {
  return ids
    .map(id => CARDS.find(card => card.id === id))
    .filter(Boolean)
    .map(card => displayCard(card, voice) || card);
}

function rotateOptions(options, shift) {
  if (options.length < 2) return options;
  const offset = shift % options.length;
  return [...options.slice(offset), ...options.slice(0, offset)];
}

function buildMiniChallenge(cards) {
  return cards.map((correct, index) => {
    const distractors = cards.filter(card => card.id !== correct.id).slice(0, 3);
    const options = rotateOptions([correct, ...distractors], index);
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

export default function MiniUnitFlow({
  unit,
  voice,
  audioRate = 0.95,
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
  const [selectedId, setSelectedId] = useState(savedProgress?.selectedId || null);
  const [checked, setChecked] = useState(!!savedProgress?.checked);
  const [challengeScore, setChallengeScore] = useState(savedProgress?.challengeScore || 0);
  const [builderComplete, setBuilderComplete] = useState(!!savedProgress?.builderComplete);
  const checkLockedRef = useRef(!!savedProgress?.checked);
  const completedSoundRef = useRef(false);

  // The unit has a sentence-builder step only when it ships explicit, safe
  // token data. Other units skip straight from the sentence card to challenge.
  const hasBuilder = !!(unit.sentenceBuilder && Array.isArray(unit.sentenceBuilder.tokens) && unit.sentenceBuilder.tokens.length > 0);

  const vocabCards = useMemo(() => cardsByIds(unit.vocabCardIds, voice), [unit, voice]);
  const sentenceCard = useMemo(() => cardsByIds([unit.sentenceCardId], voice)[0] || null, [unit, voice]);
  const challengeCards = useMemo(() => cardsByIds(unit.challengeCardIds, voice), [unit, voice]);
  const challengeQuestions = useMemo(() => buildMiniChallenge(challengeCards), [challengeCards]);
  const coach = useCharacterReaction({ characterId: unit.characterId, initialState: 'greeting', mode: 'quiz' });

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
    playCharacterSelect(unit.characterId);
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
      playCharacterCorrect(unit.characterId);
      coach.react('correct', { duration: 1400 });
    } else {
      playCharacterWrong(unit.characterId);
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

  const CardPractice = ({ card, label, onNext, nextLabel }) => (
    <section className="miniunit-practice-card">
      <div className="miniunit-step-label">{label}</div>
      <div
        className={`miniunit-flash-card ${revealed ? 'miniunit-flash-card-revealed' : ''}`}
        onClick={revealCard}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            revealCard();
          }
        }}
      >
        <div className="miniunit-card-top">
          <span>{card.type === 's' || card.type === 'p' ? 'Phrase' : 'Word'}</span>
          {ttsAvailable() && card.thai && (
            <span
              role="button"
              tabIndex={0}
              className="speaker-btn speaker-btn-card miniunit-speaker"
              onClick={(e) => { e.stopPropagation(); triggerSpeak(card.thai); }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  e.stopPropagation();
                  triggerSpeak(card.thai);
                }
              }}
              title="Hear pronunciation"
              aria-label="Play pronunciation"
            >
              <Volume2 size={16} />
            </span>
          )}
        </div>
        <div className="miniunit-card-thai">{card.thai}</div>
        {card.ph && <div className="miniunit-card-ph">{card.ph}</div>}
        {revealed ? (
          <div className="miniunit-card-en">{card.en}</div>
        ) : (
          <div className="miniunit-card-hint">Tap to reveal meaning</div>
        )}
      </div>
      <div className="miniunit-card-actions">
        <button type="button" className="btn-secondary" onClick={() => setRevealed(false)} disabled={!revealed}>
          <RotateCcw size={14} /> Hide
        </button>
        <button type="button" className="btn-primary" onClick={onNext}>
          {nextLabel} <ChevronRight size={16} />
        </button>
      </div>
    </section>
  );

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
                characterId={unit.characterId}
                state={coach.state}
                message={coach.message || 'Ready for a guided mini-unit?'}
                compact
              />
            </div>
          )}
          <div className="miniunit-eyebrow">Stage {unit.stageId} guided lesson</div>
          <h1 className="miniunit-title">{unit.title}</h1>
          <p className="miniunit-sub">{unit.subtitle || unit.introText}</p>
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
        />
      )}

      {step === 'sentence' && sentenceCard && (
        <CardPractice
          card={sentenceCard}
          label="Sentence"
          onNext={afterSentence}
          nextLabel={hasBuilder ? 'Build sentence' : 'Start challenge'}
        />
      )}

      {step === 'builder' && hasBuilder && (
        <SentenceBuilder
          data={unit.sentenceBuilder}
          audioRate={audioRate}
          showCharacters={showCharacters}
          characterId={unit.characterId}
          onComplete={finishBuilder}
        />
      )}

      {step === 'challenge' && currentChallenge && (
        <section className="miniunit-challenge">
          <div className="miniunit-step-label">Challenge {challengeIndex + 1} of {challengeQuestions.length}</div>
          {showCharacters && (
            <div className="miniunit-coach miniunit-coach-inline">
              <CharacterCoach
                characterId={unit.characterId}
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
          <div className="miniunit-options" role="list">
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
              {unit.recapText.map(line => <p key={line}>{line}</p>)}
            </div>
            <div>
              <h3>Preview</h3>
              {unit.previewText.map(line => <p key={line}>{line}</p>)}
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
          <h2 className="miniunit-title">Nice! You learned your first Thai words and sentence.</h2>
          <p className="miniunit-sub">Score: {challengeScore} of {challengeQuestions.length}. Cards did most of the learning; Challenge gave you a quick check.</p>
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
