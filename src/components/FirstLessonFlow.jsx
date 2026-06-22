import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, CheckCircle2, ChevronRight, Sparkles, Volume2, X } from 'lucide-react';
import { CARDS } from '../data/cards.js';
import { STAGE_1_MINI_UNIT_PILOT } from '../data/miniUnits.js';
import { resolveCoachIdForStage } from '../data/stageCharacters.js';
import { speakThai, ttsAvailable } from '../lib/audio.js';
import { displayCard, transformText } from '../lib/voice.js';
import { playCorrect, playWrong, playCelebration } from '../lib/sounds.js';
import CharacterCoach from './CharacterCoach.jsx';
import ConfettiBurst from './ConfettiBurst.jsx';
import ThaiBasicsPrimer from './ThaiBasicsPrimer.jsx';
import CardDirectionToggle from './CardDirectionToggle.jsx';
import SpeakerStyleToggle from './SpeakerStyleToggle.jsx';

function prefersReducedMotion() {
  return typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Whether a card is best described as a sentence/phrase vs a single word, so
// quiz prompts can say "sentence" or "word" instead of an ambiguous "Pick the
// Thai for ___" (owner feedback: mixing a sentence prompt with word options
// reads as confusing). 's' = sentence, 'p' = phrase, 'g' = grammar, 'w' = word.
function isSentenceLike(card) {
  return !!card && (card.type === 's' || card.type === 'p');
}

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

function safeIndex(value, max) {
  const index = Number.isFinite(Number(value)) ? Number(value) : 0;
  return Math.min(Math.max(0, index), Math.max(0, max - 1));
}

export default function FirstLessonFlow({
  unit = STAGE_1_MINI_UNIT_PILOT,
  voice,
  onChangeVoice,
  cardDirection = 'en-first',
  onChangeCardDirection,
  audioRate = 0.8,
  showCharacters = true,
  initialProgress,
  onProgressChange,
  onComplete,
}) {
  const vocabCards = useMemo(() => cardsByIds(unit.vocabCardIds || [], voice), [unit, voice]);
  const sentenceCard = useMemo(() => cardsByIds(unit.sentenceCardId ? [unit.sentenceCardId] : [], voice)[0] || null, [unit, voice]);
  const lessonCards = useMemo(
    () => (sentenceCard ? [...vocabCards, sentenceCard] : vocabCards),
    [vocabCards, sentenceCard]
  );
  const challengeCards = useMemo(() => cardsByIds(unit.challengeCardIds || [], voice), [unit, voice]);
  const challengeQuestions = useMemo(
    () => buildQuestions(challengeCards, lessonCards).slice(0, 3),
    [challengeCards, lessonCards]
  );

  // Optional pedagogy metadata (pilot: Stage 1 Mission 1 only). Absent on every
  // other unit, so this whole layer is a no-op when the data is not present.
  const primer = unit.lessonPrimer || null;
  const quizQuestions = useMemo(() => (unit.pedagogyQuiz?.questions || []), [unit]);
  // Recap prose flips to the selected speaking style (transformText leaves
  // any line that explicitly teaches the male/female contrast unchanged).
  const recap = useMemo(() => {
    const raw = unit.missionRecap || null;
    if (!raw || voice !== 'female') return raw;
    return {
      ...raw,
      headline: transformText(raw.headline, voice),
      lead: transformText(raw.lead, voice),
      footnote: transformText(raw.footnote, voice),
      achievements: Array.isArray(raw.achievements)
        ? raw.achievements.map(item => transformText(item, voice))
        : raw.achievements,
    };
  }, [unit, voice]);
  const hasPrimer = !!(primer && Array.isArray(primer.sections) && primer.sections.length > 0);
  const hasQuiz = quizQuestions.length > 0;
  const reducedMotion = useMemo(() => prefersReducedMotion(), []);

  const savedProgress = initialProgress?.unitId === unit.unitId ? initialProgress : null;
  const [step, setStep] = useState(savedProgress?.step || 'intro');
  const [cardIndex, setCardIndex] = useState(() => safeIndex(savedProgress?.cardIndex, Math.max(1, vocabCards.length)));
  const [revealed, setRevealed] = useState(!!savedProgress?.revealed);
  const [challengeIndex, setChallengeIndex] = useState(() => safeIndex(savedProgress?.challengeIndex, Math.max(1, challengeQuestions.length)));
  const [selectedId, setSelectedId] = useState(savedProgress?.selectedId || null);
  const [checked, setChecked] = useState(!!savedProgress?.checked);
  const [score, setScore] = useState(savedProgress?.score || 0);
  const checkLockedRef = useRef(!!savedProgress?.checked);

  // Primer-quiz state (mirrors the challenge state shape). Quick and forgiving:
  // wrong answers never block, the user can skip, and it just warms up the learner.
  const [quizIndex, setQuizIndex] = useState(() => safeIndex(savedProgress?.quizIndex, Math.max(1, quizQuestions.length)));
  const [quizSelectedId, setQuizSelectedId] = useState(savedProgress?.quizSelectedId || null);
  const [quizChecked, setQuizChecked] = useState(!!savedProgress?.quizChecked);
  const [quizScore, setQuizScore] = useState(savedProgress?.quizScore || 0);
  const quizLockedRef = useRef(!!savedProgress?.quizChecked);
  const completeSoundRef = useRef(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const isEnglishFirst = cardDirection !== 'th-first';
  const currentCard = step === 'sentence' ? sentenceCard : vocabCards[cardIndex];
  const currentQuestion = challengeQuestions[challengeIndex] || null;
  const selectedIsCorrect = !!(currentQuestion && selectedId === currentQuestion.correct.id);

  const currentQuizQ = quizQuestions[quizIndex] || null;
  const currentQuizCorrectId = currentQuizQ ? (currentQuizQ.options.find(o => o.correct)?.id ?? null) : null;
  const quizSelectedIsCorrect = !!(currentQuizQ && quizSelectedId && quizSelectedId === currentQuizCorrectId);

  useEffect(() => {
    onProgressChange?.({
      unitId: unit.unitId,
      step,
      cardIndex,
      revealed,
      challengeIndex,
      selectedId,
      checked,
      score,
      quizIndex,
      quizSelectedId,
      quizChecked,
      quizScore,
      updatedAt: new Date().toISOString(),
    });
  }, [unit.unitId, step, cardIndex, revealed, challengeIndex, selectedId, checked, score, quizIndex, quizSelectedId, quizChecked, quizScore, onProgressChange]);

  // One-time celebration cue when the lesson is complete (respects reduced motion
  // by skipping the flourish; the visual confetti is also gated below).
  useEffect(() => {
    if (step === 'complete' && !completeSoundRef.current) {
      completeSoundRef.current = true;
      if (!reducedMotion) {
        playCelebration();
        setShowConfetti(true);
      }
    }
  }, [step, reducedMotion]);

  // Defensive: if a saved/resumed step points at primer or quiz but that data is
  // absent (e.g. a future unit without pedagogy metadata, or a swapped unit),
  // never strand the user on a blank panel — continue into the lesson cards.
  useEffect(() => {
    if ((step === 'primer' && !hasPrimer) || (step === 'quiz' && !currentQuizQ)) {
      setStep('cards');
      setCardIndex(0);
      setRevealed(false);
    }
  }, [step, hasPrimer, currentQuizQ]);

  const triggerSpeak = (text) => {
    if (!text) return;
    try { speakThai(text, audioRate); } catch (_) { /* ignore */ }
  };

  const beginCards = () => {
    setStep('cards');
    setCardIndex(0);
    setRevealed(false);
  };

  // From the intro: show the Thai Basics Primer first (pilot only), else go
  // straight to the cards exactly as before.
  const startLesson = () => {
    if (hasPrimer) { setStep('primer'); return; }
    beginCards();
  };

  // Primer CTAs.
  const startPrimerQuiz = () => {
    if (!hasQuiz) { beginCards(); return; }
    setStep('quiz');
    setQuizIndex(0);
    setQuizSelectedId(null);
    setQuizChecked(false);
    setQuizScore(0);
    quizLockedRef.current = false;
  };
  const skipPrimer = () => beginCards();

  // Primer-quiz handlers (forgiving: wrong never blocks; skip allowed).
  const selectQuizOption = (optId) => {
    if (quizChecked) return;
    setQuizSelectedId(optId);
  };
  const checkQuiz = () => {
    if (!currentQuizQ || !quizSelectedId || quizChecked || quizLockedRef.current) return;
    quizLockedRef.current = true;
    setQuizChecked(true);
    if (quizSelectedId === currentQuizCorrectId) {
      setQuizScore(s => s + 1);
      playCorrect();
    } else {
      playWrong();
    }
  };
  const nextQuiz = () => {
    if (!quizChecked) return;
    if (quizIndex + 1 >= quizQuestions.length) { beginCards(); return; }
    setQuizIndex(i => i + 1);
    setQuizSelectedId(null);
    setQuizChecked(false);
    quizLockedRef.current = false;
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
      setStep(sentenceCard ? 'sentence' : 'challenge');
      setChallengeIndex(0);
      setSelectedId(null);
      setChecked(false);
      setScore(0);
      checkLockedRef.current = false;
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
      playCorrect();
    } else {
      playWrong();
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
    ? (isEnglishFirst ? 'Reveal the Thai' : 'Reveal meaning')
    : step === 'sentence'
      ? 'Start challenge'
      : cardIndex + 1 >= vocabCards.length
        ? 'Practice a sentence'
        : 'Next word';

  return (
    <main className="firstlesson-root">
      <div className="firstlesson-shell">
        <div className="firstlesson-brand">
          <span className="firstlesson-brand-name">Tuk Talk Thai</span>
          <span className="firstlesson-brand-slogan">Learn Thai the fast and fun way.</span>
        </div>

        {step === 'intro' && (
          <section className="firstlesson-panel firstlesson-intro">
            {showCharacters && (
              <div className="firstlesson-coach">
                <CharacterCoach
                  characterId={resolveCoachIdForStage(unit.stageId)}
                  state="greeting"
                  message="One short path to begin."
                  compact
                />
              </div>
            )}
            <div className="firstlesson-eyebrow">Stage {unit.stageId} mini-unit</div>
            <h1 className="firstlesson-title">{unit.title}</h1>
            <p className="firstlesson-copy">
              {unit.subtitle || 'We will guide you through a short lesson, then unlock the rest.'}
            </p>
            <div className="firstlesson-stats-row">
              <span>{unit.estimatedMinutes} min</span>
              <span>{vocabCards.length} cards</span>
              <span>{challengeQuestions.length} questions</span>
            </div>
            <div className="firstlesson-unlock-preview" aria-label="Unlocked after first lesson">
              <div><strong>Cards</strong><span>Complete your first lesson to unlock Cards.</span></div>
              <div><strong>Challenge</strong><span>Complete your first lesson to unlock Challenge.</span></div>
              <div><strong>Quests</strong><span>Reach Level 2 to unlock daily quests.</span></div>
            </div>
            <p className="firstlesson-perspective-note">
              {voice === 'female'
                ? 'You are learning with a female speaking style: chăn (ฉัน) and khâ (ค่ะ). You can change this anytime.'
                : 'You are learning with a male speaking style: phǒm (ผม) and khráp (ครับ). You can change this anytime.'}
            </p>
            <SpeakerStyleToggle value={voice} onChange={onChangeVoice} className="firstlesson-style-toggle" />
            <button type="button" className="btn-primary firstlesson-primary" onClick={startLesson}>
              Start lesson <ChevronRight size={16} />
            </button>
          </section>
        )}

        {step === 'primer' && hasPrimer && (
          <section className="firstlesson-panel firstlesson-primer">
            <ThaiBasicsPrimer primer={primer} />
            <div className="firstlesson-actions firstlesson-actions-stack">
              <button type="button" className="btn-primary firstlesson-primary" onClick={startPrimerQuiz}>
                {hasQuiz ? 'Start quick check' : 'Start lesson'} <ChevronRight size={16} />
              </button>
              <button type="button" className="btn-secondary firstlesson-skip-btn" onClick={skipPrimer}>
                Skip for now
              </button>
            </div>
          </section>
        )}

        {step === 'quiz' && currentQuizQ && (
          <section className="firstlesson-panel firstlesson-challenge firstlesson-quiz">
            <div className="firstlesson-progress-row">
              <span className="firstlesson-step-label">Quick check</span>
              <span className="firstlesson-progress-pill">{quizIndex + 1} of {quizQuestions.length}</span>
            </div>
            <div className="firstlesson-question">
              <span>Choose the best answer:</span>
              <strong>{currentQuizQ.prompt}</strong>
            </div>
            <div className="firstlesson-options">
              {currentQuizQ.options.map((option, index) => {
                const isSelected = quizSelectedId === option.id;
                const isCorrectOpt = quizChecked && option.id === currentQuizCorrectId;
                const isWrongOpt = quizChecked && isSelected && option.id !== currentQuizCorrectId;
                return (
                  <button
                    key={option.id}
                    type="button"
                    className={[
                      'firstlesson-option',
                      'firstlesson-option-text',
                      isSelected ? 'firstlesson-option-selected' : '',
                      isCorrectOpt ? 'firstlesson-option-correct' : '',
                      isWrongOpt ? 'firstlesson-option-wrong' : '',
                    ].filter(Boolean).join(' ')}
                    onClick={() => selectQuizOption(option.id)}
                    disabled={quizChecked}
                    aria-pressed={isSelected}
                  >
                    <span className="firstlesson-option-letter">{String.fromCharCode(65 + index)}</span>
                    <span className="firstlesson-option-body">
                      <span className="firstlesson-option-label">{option.label}</span>
                    </span>
                    {isCorrectOpt && <Check size={18} />}
                    {isWrongOpt && <X size={18} />}
                  </button>
                );
              })}
            </div>

            {quizChecked && (
              <div className={`firstlesson-feedback ${quizSelectedIsCorrect ? 'firstlesson-feedback-correct' : 'firstlesson-feedback-wrong'}`}>
                {quizSelectedIsCorrect ? 'Correct. ' : 'Not quite. '}{currentQuizQ.explain}
              </div>
            )}

            <div className="firstlesson-actions firstlesson-actions-stack">
              {!quizChecked ? (
                <button type="button" className="btn-primary firstlesson-primary" onClick={checkQuiz} disabled={!quizSelectedId}>
                  Check answer
                </button>
              ) : (
                <button type="button" className="btn-primary firstlesson-primary" onClick={nextQuiz}>
                  {quizIndex + 1 >= quizQuestions.length ? 'Start lesson' : 'Next question'} <ChevronRight size={16} />
                </button>
              )}
              <button type="button" className="btn-secondary firstlesson-skip-btn" onClick={beginCards}>
                Skip to lesson
              </button>
            </div>
          </section>
        )}

        {(step === 'cards' || step === 'sentence') && currentCard && (
          <section className="firstlesson-panel firstlesson-card-step">
            <div className="firstlesson-progress-row">
              <span className="firstlesson-step-label">{cardLabel}</span>
              <span className="firstlesson-progress-pill">
                {step === 'sentence' ? `${vocabCards.length + 1} of ${vocabCards.length + 1}` : `${cardIndex + 1} of ${vocabCards.length + (sentenceCard ? 1 : 0)}`}
              </span>
            </div>

            <CardDirectionToggle value={cardDirection} onChange={onChangeCardDirection} className="firstlesson-direction-toggle" />

            <button
              type="button"
              className={`firstlesson-flash ${revealed ? 'firstlesson-flash-revealed' : ''}`}
              onClick={() => setRevealed(true)}
            >
              <span className="firstlesson-card-kind">
                {currentCard.type === 's' || currentCard.type === 'p' ? 'Phrase' : 'Word'}
              </span>
              {isEnglishFirst ? (
                <>
                  <span className="firstlesson-card-en-primary">{currentCard.en}</span>
                  {revealed ? (
                    <>
                      {currentCard.ph && <span className="firstlesson-card-ph firstlesson-card-ph-answer">{currentCard.ph}</span>}
                      <span className="firstlesson-card-thai firstlesson-card-thai-secondary">{currentCard.thai}</span>
                    </>
                  ) : (
                    <span className="firstlesson-card-hint">Tap to reveal the Thai</span>
                  )}
                </>
              ) : (
                <>
                  <span className="firstlesson-card-thai">{currentCard.thai}</span>
                  {currentCard.ph && <span className="firstlesson-card-ph">{currentCard.ph}</span>}
                  {revealed ? (
                    <span className="firstlesson-card-en">{currentCard.en}</span>
                  ) : (
                    <span className="firstlesson-card-hint">Tap to reveal</span>
                  )}
                </>
              )}
            </button>

            <div className="firstlesson-actions">
              {/* English-first keeps the speaker for after reveal only, so the
                  audio can't give the Thai answer away. */}
              {(!isEnglishFirst || revealed) && ttsAvailable() && currentCard.thai && (
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
              <span>{isSentenceLike(currentQuestion.correct) ? 'Pick the Thai sentence for:' : 'Pick the Thai word for:'}</span>
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
            {showConfetti && <ConfettiBurst variant="strong" onDone={() => setShowConfetti(false)} />}
            <div className="firstlesson-complete-icon">
              <Sparkles size={34} />
            </div>
            <h1 className="firstlesson-title">
              {recap?.headline || 'Nice! You learned your first Thai words and sentence.'}
            </h1>
            {recap?.lead && <p className="firstlesson-copy">{recap.lead}</p>}
            {Array.isArray(recap?.achievements) && recap.achievements.length > 0 && (
              <ul className="firstlesson-recap-list">
                {recap.achievements.map((item, i) => (
                  <li key={i} className="firstlesson-recap-item">
                    <CheckCircle2 size={16} className="firstlesson-recap-check" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
            <p className="firstlesson-copy firstlesson-recap-score">
              You got {score} of {challengeQuestions.length} in the mini challenge.
              {recap?.footnote ? ` ${recap.footnote}` : ''}
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
