import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, CheckCircle2, ChevronRight, Clock, RotateCcw, Sparkles, Volume2, X } from 'lucide-react';
import { CARDS } from '../data/cards.js';
import { displayCard } from '../lib/voice.js';
import { speakThai, ttsAvailable } from '../lib/audio.js';
import { playCelebration, playCharacterCorrect, playCharacterSelect, playCharacterWrong, playFlip } from '../lib/sounds.js';
import { useCharacterReaction } from '../hooks/useCharacterReaction.js';
import CharacterCoach from './CharacterCoach.jsx';

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
  return cards.slice(0, 5).map((correct, index) => {
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

export default function MiniUnitFlow({
  unit,
  voice,
  audioRate = 0.95,
  showCharacters = true,
  onExit,
  onOpenCards,
  onOpenChallenge,
}) {
  const [step, setStep] = useState('intro');
  const [vocabIndex, setVocabIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const [checked, setChecked] = useState(false);
  const [challengeScore, setChallengeScore] = useState(0);
  const checkLockedRef = useRef(false);
  const completedSoundRef = useRef(false);

  const vocabCards = useMemo(() => cardsByIds(unit.vocabCardIds, voice), [unit, voice]);
  const sentenceCard = useMemo(() => cardsByIds([unit.sentenceCardId], voice)[0] || null, [unit, voice]);
  const challengeCards = useMemo(() => cardsByIds(unit.challengeCardIds, voice), [unit, voice]);
  const challengeQuestions = useMemo(() => buildMiniChallenge(challengeCards), [challengeCards]);
  const coach = useCharacterReaction({ characterId: unit.characterId, initialState: 'greeting', mode: 'quiz' });

  const currentVocab = vocabCards[vocabIndex] || null;
  const currentChallenge = challengeQuestions[challengeIndex] || null;
  const selectedIsCorrect = !!(currentChallenge && selectedId === currentChallenge.correct.id);

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
      setStep('sentence');
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
          <p className="miniunit-sub">{unit.introText}</p>
          <div className="miniunit-stats-row">
            <span>{vocabCards.length} vocab cards</span>
            <span>1 sentence</span>
            <span>{challengeQuestions.length} challenge questions</span>
          </div>
          <button type="button" className="btn-primary miniunit-primary" onClick={() => setStep('vocab')}>
            Start mini-unit <ChevronRight size={16} />
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
          onNext={startChallenge}
          nextLabel="Start challenge"
        />
      )}

      {step === 'sentence' && !sentenceCard && (
        <section className="miniunit-panel">
          <div className="miniunit-step-label">Sentence</div>
          <h2 className="miniunit-panel-title">Sentence card missing</h2>
          <p className="miniunit-panel-copy">This pilot has no approved sentence card yet. The gap is documented so Thai content can be reviewed separately.</p>
          <button type="button" className="btn-primary" onClick={startChallenge}>Start challenge</button>
        </section>
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
          <h2 className="miniunit-title">You finished your first guided Thai mini-unit.</h2>
          <p className="miniunit-sub">Score: {challengeScore} of {challengeQuestions.length}. This pilot kept SRS untouched and used Challenge practice as a short check.</p>
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
