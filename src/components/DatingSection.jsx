import React, { useEffect, useMemo, useState } from 'react';
import {
  Heart, ShieldCheck, AlertTriangle, Crown, FileClock, Volume2, Lock,
  ArrowLeft, ArrowRight, Check, X, RotateCcw, Sparkles, BookOpen, GraduationCap,
} from 'lucide-react';
import { DATING_SECTION, DATING_CATEGORIES, DATING_REVIEW_COMPLETE } from '../data/datingContent.js';
import { DATING_PHRASES } from '../data/datingPhrases.js';
import { DATING_QUESTIONS } from '../data/datingQuestions.js';
import {
  SEVERITY_LABEL, USAGE_GUIDANCE, CATEGORY_REGISTER, reviewBadge,
  QUESTION_TYPE_LABEL, promptShowsPhrase, badgesLeakAnswer,
  ANSWER_AFTER_REVEAL_LABEL, resolveQuestion, gradeAnswer,
} from '../lib/datingQuiz.js';
import {
  loadAdultConfirmed, saveAdultConfirmed,
  loadDatingLessonsDone, saveDatingLessonDone,
} from '../lib/storage.js';
import { isSuper } from '../config/entitlements.js';
import { trackEvent, ANALYTICS_EVENTS } from '../lib/analytics.js';

// "Dating & Real Talk Thai" — OPTIONAL, 18+, mature language, NOT part of course
// progress. An INTERACTIVE Super-exclusive learning mode (questions & scenarios,
// not a static phrase list):
//   • Non-subscribers see a LOCKED TEASER (what's inside, 18+ badge, category/
//     status badges, "Unlock with Super" → /plans). No unreviewed Thai is shown.
//   • Super subscribers must confirm 18+ once (persisted device-locally) before
//     the learning mode opens.
//   • The mode itself TEACHES BEFORE IT TESTS: pick a category → ungraded LESSON
//     (English meaning first, then reveal Thai + phonetics + example + note, one
//     phrase at a time, with audio) → the quiz UNLOCKS once the lesson is done →
//     answer question/scenario cards → reveal + explanation → category summary.
//     The lesson is pure study: no scoring, hearts, XP, correct/incorrect, or
//     reward path. Lesson completion is persisted per-category device-locally
//     (loadDatingLessonsDone/saveDatingLessonDone) — no DB schema, no migration,
//     no server reward. Quiz progress is session-local React state, un-farmable.
//
// DIRECTION RULE (owner requirement): this pack teaches RECOGNITION —
//   Thai phrase shown first → English meaning/context/tone/usage options.
// Never English-scenario → choose-the-Thai-phrase. Every question card shows
// its Thai subject phrase; every answer option is English text. The engine
// (resolveQuestion) and scripts/check-dating-quiz.mjs both reject Thai answer
// options, so the direction cannot silently regress.
//
// BADGE POLICY (owner requirement — do not remove badges):
//   Badges are the safety/clarity backbone of this section and must stay visible
//   on category cards, question cards, answers, and explanation panels. The
//   Super gate hides PHRASES (Thai/phonetics/answers/explanations) from locked
//   users — never the 18+/Super/severity/register/review-status badges, which
//   are English-only metadata and safe to show in the teaser.
//   Exception inside the quiz: badges that literally state the answer (tone /
//   usage-guidance chips on a "tone check" or judgement question) stay hidden
//   until reveal — see badgesLeakAnswer() — then appear on the explanation
//   panel. That is answer-hygiene, not badge removal.
//
// All quiz logic lives in src/lib/datingQuiz.js (pure, node-testable); the
// question bank in src/data/datingQuestions.js references Thai ONLY by phraseId
// into datingPhrases.js, so this mode can never introduce new unreviewed Thai.

const shuffleIds = (ids) => {
  const a = ids.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export default function DatingSection({ stats, onOpenSuper, setTab }) {
  const superUser = isSuper(stats);
  const [adultConfirmed, setAdultConfirmed] = useState(() => loadAdultConfirmed());

  // quiz drives the interactive flow:
  //   quiz === null                 → category selector
  //   quiz.phase === 'lesson'       → ungraded lesson walkthrough (English→Thai)
  //   quiz.phase === 'lesson-done'  → lesson completion hand-off to the quiz
  //   quiz.finished                 → category summary
  //   else (quiz.phase === 'quiz')  → graded question (Thai→English)
  const [quiz, setQuiz] = useState(null);
  // FROZEN once set: the current question + its option order never re-derive
  // from live filters/category state, so nothing the user toggles can reveal
  // or swap the active question (same principle as the card direction lock).
  const [current, setCurrent] = useState(null);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [catProgress, setCatProgress] = useState({});
  // Per-category LESSON completion (device-local; the quiz is gated behind it).
  const [lessonsDone, setLessonsDone] = useState(() => loadDatingLessonsDone());
  const lessonDone = (catId) => lessonsDone.includes(catId);

  const phraseById = useMemo(() => new Map(DATING_PHRASES.map((p) => [p.id, p])), []);
  const questionsByCat = useMemo(() => {
    const m = new Map();
    for (const q of DATING_QUESTIONS) {
      if (!m.has(q.cat)) m.set(q.cat, []);
      m.get(q.cat).push(q);
    }
    return m;
  }, []);
  // Phrases per category, in id order — the LESSON walks these one at a time.
  const phrasesByCat = useMemo(() => {
    const m = new Map();
    for (const p of [...DATING_PHRASES].sort((a, b) => a.id - b.id)) {
      if (!m.has(p.cat)) m.set(p.cat, []);
      m.get(p.cat).push(p);
    }
    return m;
  }, []);
  // Categories where the selection-screen severity chip would hand over the
  // answer to a tone question: single distinct phrase-severity AND at least one
  // tone question. For these the severity chip is neutralized on the category
  // card until the lesson (which TEACHES the tone) is completed — the same
  // answer-hygiene pattern as the in-quiz badge gate, not badge removal.
  const severityLeakCats = useMemo(() => {
    const toneCats = new Set(DATING_QUESTIONS.filter((q) => q.questionType === 'tone').map((q) => q.cat));
    const sevByCat = new Map();
    for (const p of DATING_PHRASES) {
      if (!sevByCat.has(p.cat)) sevByCat.set(p.cat, new Set());
      sevByCat.get(p.cat).add(p.severity);
    }
    const s = new Set();
    for (const catId of toneCats) {
      if ((sevByCat.get(catId)?.size || 0) === 1) s.add(catId);
    }
    return s;
  }, []);
  const totalQuestions = DATING_QUESTIONS.length;

  // Reaching this gated section is an intentional premium tap. Record whether the
  // viewer is locked (upsell impression) or a subscriber (content view).
  useEffect(() => {
    trackEvent(ANALYTICS_EVENTS.PREMIUM_FEATURE_TAPPED, {
      source: 'dating-section',
      state: superUser ? (adultConfirmed ? 'unlocked' : 'age-gate') : 'locked',
    });
  }, [superUser, adultConfirmed]);

  const seeSuper = () => {
    trackEvent(ANALYTICS_EVENTS.PREMIUM_FEATURE_TAPPED, { source: 'dating-unlock-super' });
    if (onOpenSuper) onOpenSuper();
  };

  const speak = (thai) => {
    try {
      if (typeof window === 'undefined' || !window.speechSynthesis) return;
      const u = new SpeechSynthesisUtterance(thai);
      u.lang = 'th-TH';
      u.rate = 0.9;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    } catch {
      /* speech synthesis is best-effort only */
    }
  };

  const loadQuestion = (catId, index) => {
    const qs = questionsByCat.get(catId) || [];
    const resolved = resolveQuestion(qs[index], phraseById);
    setCurrent({ q: resolved, order: shuffleIds(resolved.options.map((o) => o.id)) });
    setSelected(null);
    setRevealed(false);
  };

  // Enter a category's LESSON (ungraded study). Landing here — not on a graded
  // question — is what makes the pack teach-before-test. No scoring, hearts, XP,
  // or reward path is reachable from the lesson: it is pure study.
  const startCategoryLesson = (cat) => {
    const phrases = phrasesByCat.get(cat.id) || [];
    if (!phrases.length) return;
    setCurrent(null);
    setSelected(null);
    setRevealed(false);
    setQuiz({ catId: cat.id, phase: 'lesson', li: 0, lrev: false });
  };

  // Enter a category's graded QUIZ. GATED: if the lesson hasn't been completed
  // at least once, send the learner to the lesson instead — never a dead end.
  const startCategoryQuiz = (cat) => {
    const qs = questionsByCat.get(cat.id) || [];
    if (!qs.length) return;
    if (!lessonDone(cat.id)) { startCategoryLesson(cat); return; }
    setQuiz({ catId: cat.id, phase: 'quiz', index: 0, correct: 0, total: qs.length, finished: false });
    loadQuestion(cat.id, 0);
  };

  // LESSON navigation. Next reveals the Thai first (English is shown up front),
  // then advances; finishing the walkthrough persists lesson completion and
  // hands off to the quiz. Nothing here scores, awards, or gates on being right.
  const lessonReveal = () => setQuiz((z) => (z && z.phase === 'lesson' ? { ...z, lrev: true } : z));
  const lessonNext = () => {
    if (!quiz || quiz.phase !== 'lesson') return;
    const phrases = phrasesByCat.get(quiz.catId) || [];
    if (!quiz.lrev) { setQuiz((z) => ({ ...z, lrev: true })); return; }
    if (quiz.li + 1 < phrases.length) { setQuiz((z) => ({ ...z, li: z.li + 1, lrev: false })); return; }
    setLessonsDone(saveDatingLessonDone(quiz.catId));
    setQuiz((z) => ({ ...z, phase: 'lesson-done' }));
  };
  const lessonPrev = () => {
    if (!quiz || quiz.phase !== 'lesson') return;
    if (quiz.li === 0) { setQuiz((z) => ({ ...z, lrev: false })); return; }
    setQuiz((z) => ({ ...z, li: z.li - 1, lrev: true }));
  };

  const submitAnswer = () => {
    if (!current || selected == null || revealed) return;
    setRevealed(true);
    if (gradeAnswer(current.q, selected)) {
      setQuiz((z) => ({ ...z, correct: z.correct + 1 }));
    }
  };

  const nextQuestion = () => {
    if (!quiz || !revealed) return;
    const nextIndex = quiz.index + 1;
    if (nextIndex >= quiz.total) {
      const finalCorrect = quiz.correct;
      setQuiz((z) => ({ ...z, finished: true }));
      setCurrent(null);
      setCatProgress((p) => {
        const prev = p[quiz.catId];
        const best = prev ? Math.max(prev.correct, finalCorrect) : finalCorrect;
        return { ...p, [quiz.catId]: { done: true, correct: best, total: quiz.total } };
      });
      return;
    }
    setQuiz((z) => ({ ...z, index: nextIndex }));
    loadQuestion(quiz.catId, nextIndex);
  };

  const exitToCategories = () => {
    // Leaving mid-question discards the frozen question UNREVEALED — no leak.
    setQuiz(null);
    setCurrent(null);
    setSelected(null);
    setRevealed(false);
  };

  const hero = (
    <header className="dating-hero">
      <div className="dating-badges">
        <span className="dating-badge dating-badge-18" aria-label="18 plus">18+</span>
        <span className="dating-badge dating-badge-mature">Mature language</span>
        <span className="dating-badge dating-badge-super"><Crown size={12} aria-hidden="true" /> Super</span>
        {DATING_REVIEW_COMPLETE ? (
          <span className="dating-badge dating-badge-reviewed"><ShieldCheck size={12} aria-hidden="true" /> Native reviewed</span>
        ) : (
          <span className="dating-badge dating-badge-draft"><FileClock size={12} aria-hidden="true" /> Native review pending</span>
        )}
      </div>
      <h1 className="dating-title"><Heart size={22} aria-hidden="true" /> {DATING_SECTION.title}</h1>
      <p className="dating-tagline">{DATING_SECTION.tagline}</p>
      <p className="dating-safety"><ShieldCheck size={15} aria-hidden="true" /> {DATING_SECTION.safetyNote}</p>
    </header>
  );

  // ── LOCKED TEASER (non-subscribers) ───────────────────────────────────────
  // Explains what's inside using ENGLISH INTENTS ONLY (no unreviewed Thai, no
  // answers), shows the 18+ badge and per-category status badges, and routes to
  // /plans via onOpenSuper.
  if (!superUser) {
    return (
      <div className="tab-content dating-section">
        {hero}

        <section className="locked-premium-card dating-locked" role="group" aria-label="Dating & Real Talk Thai — Super feature">
          <div className="locked-premium-icon" aria-hidden="true"><Lock size={22} /></div>
          <div className="locked-premium-badges">
            <span className="locked-premium-badge locked-premium-badge-super"><Crown size={12} aria-hidden="true" /> Super</span>
            <span className="locked-premium-badge locked-premium-badge-flag">18+</span>
          </div>
          <h2 className="locked-premium-title">Unlock Dating &amp; Real Talk with Super</h2>
          <p className="locked-premium-desc">
            An optional, adults-only <strong>interactive learning mode</strong> — {totalQuestions} questions
            and real-life scenarios across {DATING_CATEGORIES.length} categories: flirting and compliments,
            asking someone out, feelings and relationships, boundaries and consent, polite rejection, and
            getting home safe. Every question comes with tone, severity, and context guidance.
          </p>

          <ul className="dating-teaser-list">
            {DATING_CATEGORIES.map((cat) => (
              <li className="dating-teaser-item" key={cat.id}>
                <div className="dating-teaser-item-head">
                  <span className="dating-teaser-item-name">{cat.name}</span>
                  <span className={`dating-cat-sev dating-cat-sev-${cat.severity}`}>
                    {SEVERITY_LABEL[cat.severity]}
                  </span>
                </div>
                <span className="dating-teaser-item-blurb">{cat.blurb}</span>
                <span className="dating-teaser-item-badges">
                  {CATEGORY_REGISTER[cat.id] && (
                    <span className={`dating-chip dating-chip-${CATEGORY_REGISTER[cat.id].cls}`}>
                      {CATEGORY_REGISTER[cat.id].label}
                    </span>
                  )}
                  <span className={`dating-chip dating-chip-${reviewBadge(cat.reviewStatus).cls}`}>
                    {reviewBadge(cat.reviewStatus).label}
                  </span>
                </span>
                {cat.handleWithCare && (
                  <span className="dating-teaser-care">
                    <AlertTriangle size={12} aria-hidden="true" /> Recognition only — understand it, mostly don’t use it.
                  </span>
                )}
              </li>
            ))}
          </ul>

          <button type="button" className="btn-primary locked-premium-cta" onClick={seeSuper}>
            <Crown size={15} aria-hidden="true" /> Unlock with Super
          </button>
          <p className="locked-premium-note">
            Optional and 18+. Not part of the core course and not required to progress. Draft content,
            pending native-speaker review.
          </p>
        </section>
      </div>
    );
  }

  // ── SUPER, NOT YET 18+ CONFIRMED: one-time age confirmation ───────────────
  if (!adultConfirmed) {
    return (
      <div className="tab-content dating-section">
        {hero}

        <section className="dating-confirm-card" role="group" aria-label="Adults only — confirm your age">
          <div className="dating-badges">
            <span className="dating-badge dating-badge-18">18+</span>
            <span className="dating-badge dating-badge-mature">Mature language</span>
          </div>
          <h2 className="dating-confirm-title">This section is for adults</h2>
          <p className="dating-confirm-copy">
            Dating &amp; Real Talk teaches mature, real-world Thai — flirting, relationships, boundaries
            and consent, nightlife, casual slang, and recognizing rude language. It is educational and
            context-focused, optional, and never required for course progress.
          </p>
          <div className="dating-confirm-actions">
            <button
              type="button"
              className="btn-primary dating-confirm-yes"
              onClick={() => { saveAdultConfirmed(); setAdultConfirmed(true); }}
            >
              I’m 18 or older — continue
            </button>
            <button
              type="button"
              className="dating-confirm-no"
              onClick={() => { if (setTab) setTab('learn'); }}
            >
              Not now
            </button>
          </div>
          <p className="dating-confirm-note">
            Your confirmation is saved on this device only.
          </p>
        </section>
      </div>
    );
  }

  // ── INTERACTIVE MODE: category selector ───────────────────────────────────
  if (!quiz) {
    return (
      <div className="tab-content dating-section">
        {hero}

        {!DATING_REVIEW_COMPLETE && (
          <section className="dating-draft-banner" role="status" aria-label="Draft content notice">
            <div className="dating-draft-icon" aria-hidden="true"><FileClock size={20} /></div>
            <div className="dating-draft-text">
              <h2 className="dating-draft-title">Draft content — pending native-speaker review</h2>
              <p className="dating-draft-copy">
                Written to be accurate and natural, but not yet checked by a native Thai speaker for tone
                and cultural context. Educational and context-only: understanding a phrase is not an
                invitation to use it — every answer explains when (and when not) to.
              </p>
            </div>
          </section>
        )}

        <p className="dating-catgrid-intro">
          Each category starts with a short, ungraded <strong>lesson</strong>: you see the English meaning
          first, then the Thai, one phrase at a time. Finish the lesson once to unlock its quiz — you can
          replay the lesson anytime.
        </p>

        <section className="dating-catgrid" aria-label="Choose a category">
          {DATING_CATEGORIES.filter((c) => (questionsByCat.get(c.id) || []).length > 0).map((cat) => {
            const count = questionsByCat.get(cat.id).length;
            const lessonCount = (phrasesByCat.get(cat.id) || []).length;
            const prog = catProgress[cat.id];
            const done = lessonDone(cat.id);
            // Neutralize the severity chip until the lesson is done for categories
            // where it would hand over a tone answer (answer-hygiene, not removal).
            const hideSev = severityLeakCats.has(cat.id) && !done;
            return (
              <div className="dating-catcard" key={cat.id}>
                <div className="dating-catcard-head">
                  <span className="dating-catcard-name">{cat.name}</span>
                  {done ? (
                    <span className="dating-catcard-lesson-flag dating-catcard-lesson-flag-done">
                      <Check size={13} aria-hidden="true" /> Lesson done
                    </span>
                  ) : (
                    <span className="dating-catcard-lesson-flag">
                      <BookOpen size={12} aria-hidden="true" /> Lesson first
                    </span>
                  )}
                </div>
                <p className="dating-catcard-blurb">{cat.blurb}</p>
                <div className="dating-catcard-badges">
                  {hideSev ? (
                    <span className="dating-chip dating-chip-neutral" title="The lesson teaches this phrase’s tone.">
                      Tone: {ANSWER_AFTER_REVEAL_LABEL}
                    </span>
                  ) : (
                    <span className={`dating-cat-sev dating-cat-sev-${cat.severity}`}>{SEVERITY_LABEL[cat.severity]}</span>
                  )}
                  {CATEGORY_REGISTER[cat.id] && (
                    <span className={`dating-chip dating-chip-${CATEGORY_REGISTER[cat.id].cls}`}>
                      {CATEGORY_REGISTER[cat.id].label}
                    </span>
                  )}
                  <span className={`dating-chip dating-chip-${reviewBadge(cat.reviewStatus).cls}`}>
                    {reviewBadge(cat.reviewStatus).label}
                  </span>
                  <span className="dating-chip dating-chip-count">{lessonCount} phrases · {count} questions</span>
                  {prog && prog.done && (
                    <span className="dating-chip dating-chip-done"><Check size={11} aria-hidden="true" /> Best {prog.correct}/{prog.total}</span>
                  )}
                </div>
                {cat.handleWithCare && (
                  <span className="dating-teaser-care">
                    <AlertTriangle size={12} aria-hidden="true" /> Recognition only — understand it, mostly don’t use it.
                  </span>
                )}
                <div className="dating-catcard-actions">
                  {done ? (
                    <>
                      <button type="button" className="btn-primary dating-catcard-start" onClick={() => startCategoryQuiz(cat)}>
                        Start quiz <ArrowRight size={15} aria-hidden="true" />
                      </button>
                      <button type="button" className="dating-catcard-review" onClick={() => startCategoryLesson(cat)}>
                        <RotateCcw size={13} aria-hidden="true" /> Review lesson
                      </button>
                    </>
                  ) : (
                    <>
                      <button type="button" className="btn-primary dating-catcard-start" onClick={() => startCategoryLesson(cat)}>
                        <BookOpen size={15} aria-hidden="true" /> Start lesson
                      </button>
                      <p className="dating-catcard-locked">
                        <Lock size={12} aria-hidden="true" /> Quiz locked — finish the lesson first.
                      </p>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </section>

        <p className="dating-disclaimer">
          Draft questions pending native review. This section is a tasteful adult resource and excludes
          explicit sexual content, hateful slurs, harassment, and coercive language. Understanding
          casual or blunt language is not an invitation to use it — mind your audience and context.
        </p>
        {/* Session-only expectation setting: catProgress is deliberately
            session-local React state with no XP/reward path — say so, or the
            vanishing "Best" chips read as lost progress (UX audit). */}
        <p className="dating-disclaimer">
          Practice scores here are just for this visit — this section never affects your XP, hearts,
          streak, or course progress.
        </p>
      </div>
    );
  }

  const cat = DATING_CATEGORIES.find((c) => c.id === quiz.catId);

  // ── INTERACTIVE MODE: LESSON (ungraded, English→Thai presentation) ────────
  // Teach BEFORE the test. The learner sees the English meaning FIRST (they
  // already understand it), then reveals the Thai + phonetics + example + note,
  // one phrase at a time, with audio. No scoring, hearts, XP, correct/incorrect,
  // or reward path is reachable here — it is pure study. This is the exact
  // content the reveal panel used to show one screen too late; now it precedes
  // the quiz that tests it.
  if (quiz.phase === 'lesson') {
    const phrases = phrasesByCat.get(quiz.catId) || [];
    const p = phrases[quiz.li] || phrases[0];
    const lrev = !!quiz.lrev;
    return (
      <div className="tab-content dating-section">
        <div className="dating-quiz-topbar">
          <button type="button" className="dating-quiz-back" onClick={exitToCategories}>
            <ArrowLeft size={15} aria-hidden="true" /> Categories
          </button>
          <div className="dating-quiz-cat">
            <span className="dating-lesson-tag"><GraduationCap size={13} aria-hidden="true" /> Lesson</span>
            <span className="dating-quiz-cat-name">{cat ? cat.name : ''}</span>
          </div>
          <span className="dating-quiz-count">{quiz.li + 1} of {phrases.length}</span>
        </div>
        <div className="dating-quiz-progress" role="progressbar" aria-valuemin={0} aria-valuemax={phrases.length} aria-valuenow={quiz.li + (lrev ? 1 : 0)}>
          <div className="dating-quiz-progress-fill" style={{ width: `${((quiz.li + (lrev ? 1 : 0)) / phrases.length) * 100}%` }} />
        </div>

        <section className="dating-lesson-card" aria-label="Lesson phrase">
          <p className="dating-lesson-studylabel">Study this phrase — no score, just learning</p>
          {/* English meaning FIRST (the learner already understands it), THEN the Thai on reveal. */}
          <p className="dating-lesson-en">{p.en}</p>

          {!lrev ? (
            <button type="button" className="btn-primary dating-lesson-reveal" onClick={lessonReveal}>
              Show the Thai <ArrowRight size={15} aria-hidden="true" />
            </button>
          ) : (
            <div className="dating-lesson-thai-block">
              <p className="dating-phrase-thai" lang="th">{p.thai}</p>
              <p className="dating-phrase-ph">{p.ph}</p>
              <button
                type="button"
                className="dating-phrase-speak"
                onClick={() => speak(p.thai)}
                aria-label="Play pronunciation"
                title="Play pronunciation"
              >
                <Volume2 size={15} aria-hidden="true" />
              </button>
              {p.example && (
                <div className="dating-lesson-example">
                  <span className="dating-note-label">Example</span>
                  <p className="dating-phrase-thai dating-lesson-example-thai" lang="th">{p.example.thai}</p>
                  <p className="dating-phrase-ph">{p.example.ph}</p>
                  <p className="dating-phrase-en">{p.example.en}</p>
                </div>
              )}
              {p.note && (
                <p className="dating-phrase-note"><span className="dating-note-label">Note</span> {p.note}</p>
              )}
              <div className="dating-lesson-badges dating-catcard-badges">
                <span className={`dating-cat-sev dating-cat-sev-${p.severity}`}>{SEVERITY_LABEL[p.severity]}</span>
                <span className={`dating-chip dating-chip-${USAGE_GUIDANCE[p.severity].cls}`}>{USAGE_GUIDANCE[p.severity].label}</span>
                {cat && CATEGORY_REGISTER[cat.id] && (
                  <span className={`dating-chip dating-chip-${CATEGORY_REGISTER[cat.id].cls}`}>{CATEGORY_REGISTER[cat.id].label}</span>
                )}
                <span className={`dating-chip dating-chip-${reviewBadge(p.reviewStatus).cls}`}>{reviewBadge(p.reviewStatus).label}</span>
              </div>
              {p.severity === 'strong' && (
                <p className="dating-phrase-care">
                  <AlertTriangle size={12} aria-hidden="true" /> Recognition only — understand it, don’t aim it at anyone.
                </p>
              )}
            </div>
          )}
        </section>

        <div className="dating-lesson-nav">
          <button type="button" className="dating-lesson-prev" onClick={lessonPrev} disabled={quiz.li === 0 && !lrev}>
            <ArrowLeft size={15} aria-hidden="true" /> Previous
          </button>
          <button type="button" className="btn-primary dating-lesson-next" onClick={lessonNext}>
            {!lrev ? 'Show the Thai' : (quiz.li + 1 >= phrases.length ? 'Finish lesson' : 'Next phrase')} <ArrowRight size={15} aria-hidden="true" />
          </button>
        </div>
        <p className="dating-lesson-hint">Studying only — this lesson never affects your XP, hearts, streak, or course progress.</p>
      </div>
    );
  }

  // ── INTERACTIVE MODE: LESSON complete → hand off to the quiz ──────────────
  if (quiz.phase === 'lesson-done') {
    const lessonTotal = (phrasesByCat.get(quiz.catId) || []).length;
    return (
      <div className="tab-content dating-section">
        {hero}
        <section className="dating-summary-card dating-lesson-done-card" role="status" aria-label="Lesson complete">
          <div className="dating-summary-icon" aria-hidden="true"><GraduationCap size={26} /></div>
          <h2 className="dating-summary-title">Lesson complete</h2>
          <p className="dating-summary-score">
            You studied all <strong>{lessonTotal}</strong> phrases in {cat ? cat.name : 'this category'}. Ready — start the quiz.
          </p>
          <div className="dating-confirm-actions">
            <button type="button" className="btn-primary" onClick={() => startCategoryQuiz(cat)}>
              Start the quiz <ArrowRight size={14} aria-hidden="true" />
            </button>
            <button type="button" className="dating-confirm-no" onClick={() => startCategoryLesson(cat)}>
              <RotateCcw size={13} aria-hidden="true" /> Review the lesson
            </button>
            <button type="button" className="dating-confirm-no" onClick={exitToCategories}>
              All categories
            </button>
          </div>
        </section>
      </div>
    );
  }

  // ── INTERACTIVE MODE: category completion summary ─────────────────────────
  if (quiz.finished) {
    return (
      <div className="tab-content dating-section">
        {hero}
        <section className="dating-summary-card" role="status" aria-label="Category complete">
          <div className="dating-summary-icon" aria-hidden="true"><Sparkles size={26} /></div>
          <h2 className="dating-summary-title">{cat ? cat.name : 'Category'} complete</h2>
          <p className="dating-summary-score">
            You got <strong>{quiz.correct} of {quiz.total}</strong> right.
          </p>
          <div className="dating-catcard-badges">
            {cat && <span className={`dating-cat-sev dating-cat-sev-${cat.severity}`}>{SEVERITY_LABEL[cat.severity]}</span>}
            {cat && (
              <span className={`dating-chip dating-chip-${reviewBadge(cat.reviewStatus).cls}`}>
                {reviewBadge(cat.reviewStatus).label}
              </span>
            )}
          </div>
          <div className="dating-confirm-actions">
            <button type="button" className="btn-primary" onClick={() => startCategoryQuiz(cat)}>
              <RotateCcw size={14} aria-hidden="true" /> Practice again
            </button>
            <button type="button" className="dating-confirm-no" onClick={() => startCategoryLesson(cat)}>
              <BookOpen size={13} aria-hidden="true" /> Review lesson
            </button>
            <button type="button" className="dating-confirm-no" onClick={exitToCategories}>
              All categories
            </button>
          </div>
        </section>
      </div>
    );
  }

  // ── INTERACTIVE MODE: question card (Thai phrase → English options) ────────
  const { q, order } = current;
  const showPhrase = promptShowsPhrase(q.questionType); // always true — Thai→English direction
  const showSubjectBadges = !badgesLeakAnswer(q.questionType) || revealed;
  // Answer-hygiene for the TOP BAR too: in a single-severity category the
  // category severity chip states the answer to tone/usage/judgement questions,
  // so pre-reveal it is swapped for a neutral placeholder — never removed. The
  // real chip returns the moment the answer is revealed.
  const hideCatSeverity = badgesLeakAnswer(q.questionType) && !revealed;
  const correctOption = q.options.find((o) => o.id === q.correctOptionId);
  const isCorrect = revealed && gradeAnswer(q, selected);

  const subjectBadges = (
    <>
      <span className={`dating-sev-chip dating-cat-sev-${q.severity}`}>{q.tone}</span>
      <span className={`dating-chip dating-chip-${USAGE_GUIDANCE[q.severity].cls}`}>{q.usageGuidance}</span>
      {q.register && <span className={`dating-chip dating-chip-${q.register.cls}`}>{q.register.label}</span>}
      {q.speakerNote && (
        <span
          className="dating-chip dating-chip-speaker"
          title="Shown in polite male form (ผม / ครับ). Female speakers: swap ครับ → ค่ะ and ผม → ฉัน."
        >
          {q.speakerNote}
        </span>
      )}
    </>
  );

  return (
    <div className="tab-content dating-section">
      <div className="dating-quiz-topbar">
        <button type="button" className="dating-quiz-back" onClick={exitToCategories}>
          <ArrowLeft size={15} aria-hidden="true" /> Categories
        </button>
        <div className="dating-quiz-cat">
          <span className="dating-quiz-cat-name">{cat ? cat.name : ''}</span>
          {cat && (hideCatSeverity ? (
            <span className="dating-chip dating-chip-neutral">{ANSWER_AFTER_REVEAL_LABEL}</span>
          ) : (
            <span className={`dating-cat-sev dating-cat-sev-${cat.severity}`}>{SEVERITY_LABEL[cat.severity]}</span>
          ))}
        </div>
        <span className="dating-quiz-count">{quiz.index + 1}/{quiz.total}</span>
      </div>
      <div className="dating-quiz-progress" role="progressbar" aria-valuemin={0} aria-valuemax={quiz.total} aria-valuenow={quiz.index + (revealed ? 1 : 0)}>
        <div className="dating-quiz-progress-fill" style={{ width: `${((quiz.index + (revealed ? 1 : 0)) / quiz.total) * 100}%` }} />
      </div>

      <section className="dating-question-card" aria-label="Question">
        <div className="dating-phrase-badges">
          <span className="dating-chip dating-chip-qtype">{QUESTION_TYPE_LABEL[q.questionType]}</span>
          <span className={`dating-chip dating-chip-${reviewBadge(q.nativeReviewStatus).cls}`}>
            {reviewBadge(q.nativeReviewStatus).label}
          </span>
          {showSubjectBadges ? subjectBadges : (
            <span className="dating-chip dating-chip-neutral">{ANSWER_AFTER_REVEAL_LABEL}</span>
          )}
        </div>

        {showPhrase && (
          <div className="dating-question-phrase">
            <p className="dating-phrase-thai" lang="th">{q.phrase.thai}</p>
            <p className="dating-phrase-ph">{q.phrase.ph}</p>
            <button
              type="button"
              className="dating-phrase-speak"
              onClick={() => speak(q.phrase.thai)}
              aria-label="Play pronunciation"
              title="Play pronunciation"
            >
              <Volume2 size={15} aria-hidden="true" />
            </button>
          </div>
        )}

        <p className="dating-question-prompt">{q.prompt}</p>

        <ul className="dating-options" role="listbox" aria-label="Answer options">
          {order.map((oid) => {
            const opt = q.options.find((o) => o.id === oid);
            const isSel = selected === oid;
            const cls = [
              'dating-option',
              isSel ? 'dating-option-selected' : '',
              revealed && oid === q.correctOptionId ? 'dating-option-correct' : '',
              revealed && isSel && oid !== q.correctOptionId ? 'dating-option-wrong' : '',
            ].filter(Boolean).join(' ');
            return (
              <li key={oid}>
                <button
                  type="button"
                  className={cls}
                  disabled={revealed}
                  aria-pressed={isSel}
                  onClick={() => { if (!revealed) setSelected(oid); }}
                >
                  {/* English text only — Thai never appears in answer options. */}
                  <span className="dating-option-text">{opt.text}</span>
                  {revealed && oid === q.correctOptionId && <Check size={16} aria-hidden="true" className="dating-option-mark" />}
                  {revealed && isSel && oid !== q.correctOptionId && <X size={16} aria-hidden="true" className="dating-option-mark" />}
                </button>
              </li>
            );
          })}
        </ul>

        {!revealed ? (
          <button
            type="button"
            className="btn-primary dating-quiz-submit"
            disabled={selected == null}
            onClick={submitAnswer}
          >
            Check answer
          </button>
        ) : (
          <div className={`dating-reveal ${isCorrect ? 'dating-reveal-correct' : 'dating-reveal-wrong'}`} role="status">
            <p className="dating-reveal-verdict">
              {isCorrect ? <><Check size={16} aria-hidden="true" /> Correct!</> : <><X size={16} aria-hidden="true" /> Not quite.</>}
            </p>

            <div className="dating-explain">
              <div className="dating-phrase-badges">
                {subjectBadges}
                <span className={`dating-chip dating-chip-${reviewBadge(q.nativeReviewStatus).cls}`}>
                  {reviewBadge(q.nativeReviewStatus).label}
                </span>
              </div>

              <div className="dating-explain-answer">
                <span className="dating-note-label">Answer</span>
                <p className="dating-phrase-thai" lang="th">{q.phrase.thai}</p>
                <p className="dating-phrase-ph">{q.phrase.ph}</p>
                <p className="dating-phrase-en">{q.phrase.en}</p>
                {q.literal && (
                  <p className="dating-explain-literal"><span className="dating-note-label">Literally</span> {q.literal}</p>
                )}
                {correctOption && (
                  <p className="dating-explain-correct-label">Correct choice: “{correctOption.text}”</p>
                )}
                <button
                  type="button"
                  className="dating-phrase-speak"
                  onClick={() => speak(q.phrase.thai)}
                  aria-label="Play pronunciation"
                  title="Play pronunciation"
                >
                  <Volume2 size={15} aria-hidden="true" />
                </button>
              </div>

              <p className="dating-explain-text">{q.explanation}</p>
              {q.context && (
                <p className="dating-phrase-note"><span className="dating-note-label">Context</span> {q.context}</p>
              )}
              {(q.warning || q.severity === 'strong') && (
                <p className="dating-phrase-care">
                  <AlertTriangle size={12} aria-hidden="true" /> {q.warning || 'Handle with care — understand it, don’t aim it at anyone.'}
                </p>
              )}
            </div>

            <button type="button" className="btn-primary dating-quiz-next" onClick={nextQuestion}>
              {quiz.index + 1 >= quiz.total ? 'Finish' : 'Next question'} <ArrowRight size={14} aria-hidden="true" />
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
