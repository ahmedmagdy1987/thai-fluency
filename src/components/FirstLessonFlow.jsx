import React, { useMemo, useRef, useState } from 'react';
import { Check, ChevronRight, Sparkles, Volume2 } from 'lucide-react';
import { CARDS } from '../data/cards.js';
import { speakThai, ttsAvailable } from '../lib/audio.js';
import { displayCard } from '../lib/voice.js';
import CharacterCoach from './CharacterCoach.jsx';

export const FIRST_LESSON_VOCAB_IDS = [3396, 1, 1661, 2, 2815, 3254];
export const FIRST_LESSON_SENTENCE_ID = 330;
export const FIRST_LESSON_CHALLENGE_IDS = [3396, 2815, 330];

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

function buildQuestions(challengeCards, lessonCards) {
  return challengeCards.map((correct, index) => {
    const distractors = lessonCards.filter(card => card.id !== correct.id).slice(0, 3);
    return {
      id: `first-lesson-${correct.id}`,
      correct,
      prompt: correct.en,
      options: rotateOptions([correct, ...distractors], index),
    };
  });
}

export default function FirstLessonFlow({
  voice,
  audioRate = 0.95,
  showCharacters = true,
  onComplete,
}) {
  const [step, setStep] = useState('intro');
  const [cardIndex, setCardIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const checkLockedRef = useRef(false);

  const vocabCards = useMemo(() => cardsByIds(FIRST_LESSON_VOCAB_IDS, voice), [voice]);
  const sentenceCard = useMemo(() => cardsByIds([FIRST_LESSON_SENTENCE_ID], voice)[0] || null, [voice]);
  const lessonCards = useMemo(
    () => (sentenceCard ? [...vocabCards, sentenceCard] : vocabCards),
    [vocabCards, sentenceCard]
  );
  const challengeCards = useMemo(() => cardsByIds(FIRST_LESSON_CHALLENGE_IDS, voice), [voice]);
  const challengeQuestions = useMemo(
    () => buildQuestions(challengeCards, lessonCards).slice(0, 3),
    [challengeCards, lessonCards]
  );

  const currentCard = step === 'sentence' ? sentenceCard : vocabCards[cardIndex];
  const currentQuestion = challengeQuestions[challengeIndex] || null;
  const selectedIsCorrect = !!(currentQuestion && selectedId === currentQuestion.correct.id);

  const triggerSpeak = (text) => {
    if (!text) return;
    try { speakThai(text, audioRate); } catch (_) { /* ignore */ }
  };

  const startLesson = () => {
    setStep('cards');
    setCardIndex(0);
    setRevealed(false);
  };

  const nextCard = () => {
    if (!revealed) {
      setRevealed(true);
      return;
    }
    if (step === 'sentence') {
      setStep('challenge');
      setChallengeIndex(0);
      setSelectedId(null);
      setChecked(false);
      setScore(0);
      checkLockedRef.current = false;
      return;
    }
    if (cardIndex + 1 >= vocabCards.length) {
      setStep('sentence');
      setRevealed(false);
      return;
    }
    setCardIndex(index => index + 1);
    setRevealed(false);
  };

  const selectOption = (option) => {
    if (checked) return;
    setSelectedId(option.id);
    triggerSpeak(option.thai);
  };

  const checkAnswer = () => {
    if (!currentQuestion || !selectedId || checked || checkLockedRef.current) return;
    checkLockedRef.current = true;
    setChecked(true);
    if (selectedId === currentQuestion.correct.id) {
      setScore(current => current + 1);
    }
  };

  const nextQuestion = () => {
    if (!checked) return;
    if (challengeIndex + 1 >= challengeQuestions.length) {
      setStep('complete');
      return;
    }
    setChallengeIndex(index => index + 1);
    setSelectedId(null);
    setChecked(false);
    checkLockedRef.current = false;
  };

  const cardLabel = step === 'sentence'
    ? 'Sentence'
    : `Word ${Math.min(cardIndex + 1, vocabCards.length)} of ${vocabCards.length}`;
  const nextLabel = !revealed
    ? 'Reveal meaning'
    : step === 'sentence'
      ? 'Start challenge'
      : cardIndex + 1 >= vocabCards.length
        ? 'Practice a sentence'
        : 'Next word';

  return (
    <main className="firstlesson-root">
      <div className="firstlesson-shell">
        <div className="firstlesson-brand">
          <span className="firstlesson-brand-mark">Tuk</span>
          <span>Tuk Talk Thai</span>
        </div>

        {step === 'intro' && (
          <section className="firstlesson-panel firstlesson-intro">
            {showCharacters && (
              <div className="firstlesson-coach">
                <CharacterCoach
                  characterId="elephant"
                  state="greeting"
                  message="One short path to begin."
                  compact
                />
              </div>
            )}
            <div className="firstlesson-eyebrow">First lesson</div>
            <h1 className="firstlesson-title">Learn your first Thai words</h1>
            <p className="firstlesson-copy">
              We&apos;ll guide you through a short lesson, then unlock the rest.
            </p>
            <button type="button" className="btn-primary firstlesson-primary" onClick={startLesson}>
              Start lesson <ChevronRight size={16} />
            </button>
          </section>
        )}

        {(step === 'cards' || step === 'sentence') && currentCard && (
          <section className="firstlesson-panel firstlesson-card-step">
            <div className="firstlesson-progress-row">
              <span className="firstlesson-step-label">{cardLabel}</span>
              <span className="firstlesson-progress-pill">
                {step === 'sentence' ? '7 of 7' : `${cardIndex + 1} of ${vocabCards.length + 1}`}
              </span>
            </div>

            <button
              type="button"
              className={`firstlesson-flash ${revealed ? 'firstlesson-flash-revealed' : ''}`}
              onClick={() => setRevealed(true)}
            >
              <span className="firstlesson-card-kind">
                {currentCard.type === 's' || currentCard.type === 'p' ? 'Phrase' : 'Word'}
              </span>
              <span className="firstlesson-card-thai">{currentCard.thai}</span>
              {currentCard.ph && <span className="firstlesson-card-ph">{currentCard.ph}</span>}
              {revealed ? (
                <span className="firstlesson-card-en">{currentCard.en}</span>
              ) : (
                <span className="firstlesson-card-hint">Tap to reveal</span>
              )}
            </button>

            <div className="firstlesson-actions">
              {ttsAvailable() && currentCard.thai && (
                <button
                  type="button"
                  className="btn-secondary firstlesson-icon-btn"
                  onClick={() => triggerSpeak(currentCard.thai)}
                  aria-label="Play pronunciation"
                >
                  <Volume2 size={16} />
                </button>
              )}
              <button type="button" className="btn-primary firstlesson-primary" onClick={nextCard}>
                {nextLabel} <ChevronRight size={16} />
              </button>
            </div>
          </section>
        )}

        {step === 'challenge' && currentQuestion && (
          <section className="firstlesson-panel firstlesson-challenge">
            <div className="firstlesson-progress-row">
              <span className="firstlesson-step-label">Mini challenge</span>
              <span className="firstlesson-progress-pill">
                {challengeIndex + 1} of {challengeQuestions.length}
              </span>
            </div>
            <div className="firstlesson-question">
              <span>Pick the Thai for</span>
              <strong>{currentQuestion.prompt}</strong>
            </div>
            <div className="firstlesson-options">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedId === option.id;
                const isCorrect = checked && option.id === currentQuestion.correct.id;
                const isWrong = checked && isSelected && option.id !== currentQuestion.correct.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    className={[
                      'firstlesson-option',
                      isSelected ? 'firstlesson-option-selected' : '',
                      isCorrect ? 'firstlesson-option-correct' : '',
                      isWrong ? 'firstlesson-option-wrong' : '',
                    ].filter(Boolean).join(' ')}
                    onClick={() => selectOption(option)}
                    disabled={checked}
                  >
                    <span className="firstlesson-option-letter">{String.fromCharCode(65 + index)}</span>
                    <span className="firstlesson-option-body">
                      <span className="firstlesson-option-thai">{option.thai}</span>
                      {option.ph && <span className="firstlesson-option-ph">{option.ph}</span>}
                    </span>
                    {isCorrect && <Check size={18} />}
                  </button>
                );
              })}
            </div>

            {checked && (
              <div className={`firstlesson-feedback ${selectedIsCorrect ? 'firstlesson-feedback-correct' : 'firstlesson-feedback-wrong'}`}>
                {selectedIsCorrect ? 'Correct.' : `Answer: ${currentQuestion.correct.thai}`}
              </div>
            )}

            <div className="firstlesson-actions">
              {!checked ? (
                <button
                  type="button"
                  className="btn-primary firstlesson-primary"
                  onClick={checkAnswer}
                  disabled={!selectedId}
                >
                  Check answer
                </button>
              ) : (
                <button type="button" className="btn-primary firstlesson-primary" onClick={nextQuestion}>
                  {challengeIndex + 1 >= challengeQuestions.length ? 'Finish lesson' : 'Next question'} <ChevronRight size={16} />
                </button>
              )}
            </div>
          </section>
        )}

        {step === 'complete' && (
          <section className="firstlesson-panel firstlesson-complete">
            <div className="firstlesson-complete-icon">
              <Sparkles size={34} />
            </div>
            <h1 className="firstlesson-title">Nice! You learned your first Thai words and sentence.</h1>
            <p className="firstlesson-copy">
              You got {score} of {challengeQuestions.length} in the mini challenge.
            </p>
            <button type="button" className="btn-primary firstlesson-primary" onClick={onComplete}>
              Unlock the app <ChevronRight size={16} />
            </button>
          </section>
        )}
      </div>
    </main>
  );
}
