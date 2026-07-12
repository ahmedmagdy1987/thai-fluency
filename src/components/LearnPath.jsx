import React, { useState, useEffect } from 'react';
import { BookOpen, ChevronRight, Clock, Lock, Check, Sparkles, Flame, Gift, Zap, X } from 'lucide-react';
import { STAGES, MISSIONS } from '../data/taxonomy.js';
import { DEFAULT_DAILY_GOAL, XP_REWARDS } from '../data/gamification.js';
import { getStageCharacter } from '../data/stageCharacters.js';
import { getMiniUnitsForStage, MINI_UNITS, STAGE_1_MINI_UNIT_PILOT } from '../data/miniUnits.js';
import { BORROWED_WORDS } from '../data/borrowedWords.js';
import { getMiniUnitProgressState } from '../lib/miniUnitSequence.js';
import ThaiBasicsPrimer from './ThaiBasicsPrimer.jsx';
import BorrowedWordsBonus from './BorrowedWordsBonus.jsx';

// New primary learning view. Renders the 8-stage path with a per-stage
// character, plus a Stage-1 mission rail while the user is still in S1.
// All progress, unlock, and current-stage logic is read from state.js
// (stageState / missionState) — no new gameplay rules.
export default function LearnPath({
  stats,
  fullStats,
  dashboardStats,
  stageState,
  missionState,
  setTab,
  onStartMiniUnit,
  onLockedFeature,
  onStartMissionCards,
  courseCompletion,
}) {
  const courseComplete = !!(courseCompletion && courseCompletion.courseComplete);

  // "Thai basics" re-open: the once-skippable first-lesson primer, available
  // anytime from the guided path as a lightweight modal (no route, no global
  // state). Content is the pilot unit's lessonPrimer (single source of truth).
  const basics = STAGE_1_MINI_UNIT_PILOT.lessonPrimer;
  const [showBasics, setShowBasics] = useState(false);
  useEffect(() => {
    if (!showBasics) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setShowBasics(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showBasics]);

  // "Words You Already Know" bonus: optional borrowed-words list in the same
  // lightweight modal pattern as Thai basics (no route, no progress writes).
  const [showBorrowed, setShowBorrowed] = useState(false);
  useEffect(() => {
    if (!showBorrowed) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setShowBorrowed(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showBorrowed]);
  const due = dashboardStats?.due || 0;
  const seen = dashboardStats?.seen ?? 0;
  const newAvail = dashboardStats?.newAvail ?? 0;
  const goal = fullStats?.dailyGoal || DEFAULT_DAILY_GOAL;
  const todayXp = fullStats?.todayXp || 0;
  const goalPct = Math.min(100, Math.round((todayXp / goal) * 100));
  const goalMet = todayXp >= goal;

  const inMissionView = !!(
    missionState && stageState &&
    stageState.currentStage === 1 && !missionState.stage1Complete
  );
  const currentMission = missionState
    ? missionState.missions.find(m => m.id === missionState.currentMission)
    : null;
  const currentStage = stageState
    ? stageState.stages.find(s => s.id === stageState.currentStage) || stageState.stages[0]
    : null;

  // A freshly-unlocked stage the user hasn't started yet (e.g. Stage 2 right
  // after Stage 1 is complete) gets an explicit "Start Stage N" call-to-action
  // so a completed stage never feels like a dead end.
  const startingNewStage = !inMissionView && currentStage && currentStage.id > 1 && (currentStage.seen || 0) === 0;
  const ctaLabel = inMissionView && currentMission
    ? (currentMission.seen === 0 ? `Start Mission ${currentMission.id}` : `Continue Mission ${currentMission.id}`)
    : startingNewStage
      ? `Start Stage ${currentStage.id}`
      : (due > 0
        ? `Continue: ${due} due`
        // No count: newAvail is the TOTAL unseen in the unlocked range (a tap
        // teaches only the daily chunk), and Math.max(1, 0) promised "Learn 1
        // new" when nothing was learnable (UX audit).
        : (seen === 0 ? 'Start your first lesson' : 'Learn new words'));

  const continueSubtitle = inMissionView && currentMission
    ? `Mission ${currentMission.id}: ${currentMission.name}`
    : (currentStage ? `Stage ${currentStage.id}: ${currentStage.name}` : 'Survival Thai');

  const stageCharacter = currentStage ? getStageCharacter(currentStage.id) : getStageCharacter(1);
  // Guided mini-units for the CURRENT stage (data-driven, sequential unlock).
  // Any stage that ships mini-units shows its path; stages without units fall
  // back to the existing mission/stage UI.
  const currentStageId = stageState?.currentStage || 1;
  const currentStageMiniUnits = getMiniUnitsForStage(currentStageId);
  // "Continue" only when there is genuinely mid-flow saved progress (a unit the
  // user started but didn't finish) — a bare intro or a completed save = "Start".
  const savedUnitProgress = fullStats?.miniUnitProgress;
  const midFlowUnitId = (savedUnitProgress?.step && savedUnitProgress.step !== 'intro' && savedUnitProgress.step !== 'complete')
    ? savedUnitProgress.unitId
    : null;
  const miniUnitSequence = getMiniUnitProgressState(
    currentStageMiniUnits,
    fullStats?.completedMiniUnits || [],
    midFlowUnitId,
  );
  const showMiniUnits = !!(onStartMiniUnit && stageState && miniUnitSequence.units.length > 0);
  const startCards = () => {
    if (inMissionView && currentMission && onStartMissionCards) {
      onStartMissionCards(currentMission);
      return;
    }
    // Non-mission: the continue banner targets the current learning frontier,
    // so launch a Learn-path learning session (teaches new + due cards). The
    // bare Cards tab (no scope) is review-only and never introduces new cards.
    setTab('cards', { sessionScope: { type: 'learn' } });
  };

  return (
    <div className="tab-content learn-path">
      {/* Course-complete state — shown when every guided mini-unit across all
          stages is done. The stage/unit path below is intentionally NOT hidden,
          so users can keep reviewing any completed unit. */}
      {courseComplete && (
        <section className="learn-course-complete" role="status">
          <div className="learn-course-complete-icon" aria-hidden="true"><Sparkles size={26} /></div>
          <div className="learn-course-complete-body">
            <div className="learn-course-complete-eyebrow">Course path complete</div>
            <h2 className="learn-course-complete-title">You finished all guided stages</h2>
            <p className="learn-course-complete-sub">
              Keep reviewing and challenging yourself. Your completed stages and
              units stay below — revisit any of them anytime.
            </p>
            <div className="learn-course-complete-actions">
              <button type="button" className="btn-primary" onClick={() => setTab('cards')}>Review due cards</button>
              <button type="button" className="btn-secondary" onClick={() => setTab('quiz')}>Challenge</button>
            </div>
          </div>
        </section>
      )}

      {/* Continue banner — anchored CTA into the actual lesson flow */}
      <section
        className="learn-continue"
        data-tutorial="path"
        style={{ '--learn-char-accent': stageCharacter.accent }}
        onClick={startCards}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); startCards(); } }}
      >
        <div className="learn-continue-character" aria-hidden="true">
          <span className="learn-continue-character-emoji">{stageCharacter.placeholderEmoji}</span>
          <span className="learn-continue-character-shadow" />
        </div>
        <div className="learn-continue-body">
          <div className="learn-continue-eyebrow">{continueSubtitle}</div>
          <div className="learn-continue-cta">{ctaLabel}</div>
          <div className="learn-continue-sub">
            Guided by <strong>{stageCharacter.name}</strong>. {stageCharacter.vibe}
          </div>
        </div>
        <div className="learn-continue-arrow"><ChevronRight size={26} /></div>
      </section>

      {/* Guided mini-units — the Stage 1 beginner path (sequential unlock). */}
      {showMiniUnits && (
        <section className="learn-section">
          <div className="learn-section-header">
            <h2 className="learn-section-title">Stage {currentStageId} missions</h2>
            <span className="learn-section-meta">
              {miniUnitSequence.pathComplete
                ? `Stage ${currentStageId} path complete`
                : `${miniUnitSequence.completedCount}/${miniUnitSequence.totalCount} missions complete`}
            </span>
          </div>
          {basics && (
            <button type="button" className="learn-basics-link" onClick={() => setShowBasics(true)}>
              <BookOpen size={14} /> Open Thai basics
            </button>
          )}
          <div className="learn-miniunit-list">
            {miniUnitSequence.units.map((u, idx) => {
              const status = u.status; // 'complete' | 'current' | 'locked'
              const locked = status === 'locked';
              const badge = status === 'complete' ? 'Complete' : status === 'current' ? 'Current' : 'Locked';
              const note = status === 'complete'
                ? 'Completed. Review anytime.'
                : status === 'current'
                  ? 'Continue your path.'
                  : 'Complete the previous mission to unlock.';
              const action = status === 'complete'
                ? 'Review'
                : status === 'current'
                  ? (u.inProgress ? 'Continue' : 'Start')
                  : 'Locked';
              return (
                <section
                  key={u.unitId}
                  className={`learn-miniunit-card learn-miniunit-card-${status}`}
                  aria-disabled={locked || undefined}
                >
                  <div className="learn-miniunit-icon" aria-hidden="true">
                    {status === 'complete' ? <Check size={22} /> : status === 'locked' ? <Lock size={20} /> : <BookOpen size={24} />}
                  </div>
                  <div className="learn-miniunit-body">
                    <div className="learn-miniunit-eyebrow">
                      <span className={`learn-miniunit-badge learn-miniunit-badge-${status}`}>{badge}</span>
                      <span className="learn-miniunit-num">Mission {idx + 1}</span>
                    </div>
                    <h2 className="learn-miniunit-title">{u.title}</h2>
                    <p className="learn-miniunit-copy">{locked ? note : u.subtitle}</p>
                    {!locked && (
                      <div className="learn-miniunit-meta">
                        <span><Clock size={13} /> {u.estimatedMinutes} min</span>
                        <span>{u.vocabCardIds.length} cards</span>
                        {u.sentenceBuilder && <span>Sentence builder</span>}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    className="learn-miniunit-btn"
                    onClick={locked ? undefined : () => onStartMiniUnit(u.unitId)}
                    disabled={locked}
                    aria-label={locked ? `${u.title}, locked. ${note}` : `${action} ${u.title}`}
                    title={locked ? note : undefined}
                  >
                    {locked ? <><Lock size={14} /> Locked</> : <>{action} <ChevronRight size={16} /></>}
                  </button>
                </section>
              );
            })}
          </div>
        </section>
      )}

      {/* Bonus: borrowed "Words You Already Know" — optional, no XP, no progress */}
      <section className="learn-section learn-bonus-section">
        <button type="button" className="learn-bonus-card" onClick={() => setShowBorrowed(true)}>
          <span className="learn-bonus-icon" aria-hidden="true"><Gift size={20} /></span>
          <span className="learn-bonus-body">
            <span className="learn-bonus-eyebrow">Bonus</span>
            <span className="learn-bonus-title">Words You Already Know</span>
            <span className="learn-bonus-copy">
              {BORROWED_WORDS.length} Thai words that sound familiar from day one. A quick confidence boost.
            </span>
          </span>
          <ChevronRight size={18} aria-hidden="true" />
        </button>
      </section>

      {/* Daily goal — mirrors TodayTab's ring so users get the same dopamine signal */}
      <section className="learn-goal-card">
        <div className="learn-goal-ring-wrap">
          <svg viewBox="0 0 120 120" className="learn-goal-ring" aria-hidden="true">
            <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(15,61,46,0.08)" strokeWidth="10" />
            <circle
              cx="60" cy="60" r="52" fill="none"
              stroke={goalMet ? '#5BAF7C' : '#C9A961'}
              strokeWidth="10" strokeLinecap="round"
              strokeDasharray={`${(goalPct / 100) * 326.7} 326.7`}
              transform="rotate(-90 60 60)"
              style={{ transition: 'stroke-dasharray 0.6s ease' }}
            />
          </svg>
          <div className="learn-goal-ring-center">
            {goalMet ? <Check size={22} /> : <Zap size={20} />}
            <div className="learn-goal-ring-val">{todayXp}</div>
            <div className="learn-goal-ring-of">/ {goal} XP</div>
          </div>
        </div>
        <div className="learn-goal-info">
          <div className="learn-goal-title">{goalMet ? 'Daily goal complete!' : 'Today\'s goal'}</div>
          <div className="learn-goal-sub">
            {goalMet
              ? `+${XP_REWARDS.dailyGoalBonus} XP bonus earned`
              : `${goal - todayXp} XP to go`}
          </div>
          <div className="learn-goal-stats">
            <div className="learn-goal-stat"><Flame size={13} /> <span>{fullStats?.streak || 0}</span><em>streak</em></div>
            <div className="learn-goal-stat"><Zap size={13} /> <span>{fullStats?.totalXp || 0}</span><em>total XP</em></div>
          </div>
        </div>
      </section>

      {/* Mission rail — only while inside Stage 1 */}
      {inMissionView && currentMission && missionState && (
        <section className="learn-section">
          <div className="learn-section-header">
            <h2 className="learn-section-title">Mission {currentMission.id}: {currentMission.name}</h2>
            <span className="learn-section-meta">Stage 1: Survival Thai</span>
          </div>
          <div className="learn-mission-card" style={{ '--mission-color': currentMission.color }}>
            <div className="learn-mission-icon">{currentMission.icon}</div>
            <div className="learn-mission-body">
              <div className="learn-mission-goal">{currentMission.goal}</div>
              <div className="learn-mission-progress">
                <div className="learn-mission-bar">
                  <div className="learn-mission-bar-fill" style={{ width: `${Math.round(currentMission.seenPct || 0)}%` }} />
                </div>
                <span className="learn-mission-pct">{Math.round(currentMission.seenPct || 0)}%</span>
              </div>
              <div className="learn-mission-stats">
                <span>{currentMission.seen}/{currentMission.total} learned</span>
                <span>{currentMission.mature} mastered through review</span>
              </div>
            </div>
          </div>

          <div className="learn-mission-rail" role="list">
            {missionState.missions.map(M => {
              const isCurrent = M.id === currentMission.id;
              const isLocked = !M.unlocked;
              const isDone = M.complete;
              const cls = [
                'learn-mission-node',
                isCurrent && 'learn-mission-node-current',
                isDone && 'learn-mission-node-done',
                isLocked && 'learn-mission-node-locked',
              ].filter(Boolean).join(' ');
              return (
                <div
                  key={M.id}
                  role="listitem"
                  className={cls}
                  style={{ '--node-color': M.color }}
                  title={isLocked ? `Unlocks when Mission ${M.id - 1} is complete` : M.name}
                >
                  <div className="learn-mission-node-icon">
                    {isDone ? <Check size={16} /> : (isLocked ? <Lock size={14} /> : M.icon)}
                  </div>
                  <div className="learn-mission-node-name">{M.name}</div>
                  <div className="learn-mission-node-meta">{M.seen}/{M.total}</div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* The 8-stage path — every stage has a character */}
      <section className="learn-section">
        <div className="learn-section-header">
          <h2 className="learn-section-title">Your Thai journey</h2>
          <span className="learn-section-meta learn-journey-summary">
            <span>{STAGES.length} stages</span>
            <span>{MINI_UNITS.length} guided missions</span>
          </span>
        </div>

        <ol className="learn-path-list" role="list">
          {stageState && stageState.stages.map((S, idx) => {
            const character = getStageCharacter(S.id);
            const isCurrent = S.id === stageState.currentStage;
            const isLocked = !S.unlocked;
            const isDone = S.complete;
            const isEmpty = S.total === 0;
            const cls = [
              'learn-path-node',
              isCurrent && 'learn-path-node-current',
              isDone && 'learn-path-node-done',
              isLocked && 'learn-path-node-locked',
              isEmpty && 'learn-path-node-empty',
            ].filter(Boolean).join(' ');

            const onClick = () => {
              if (isLocked) {
                onLockedFeature && onLockedFeature(S);
                return;
              }
              if (S.id === 1 && inMissionView && currentMission && onStartMissionCards) {
                onStartMissionCards(currentMission);
                return;
              }
              // A completed stage never re-teaches new cards: open a Stage
              // Review session scoped to that stage's already-seen cards. Due
              // cards earn review XP; non-due replays earn 0. It never advances
              // stage progress. An active/incomplete stage starts a learning
              // session instead.
              if (isDone) {
                setTab('cards', { sessionScope: { type: 'stageReview', stageId: S.id, stageName: S.name } });
                return;
              }
              setTab('cards', { sessionScope: { type: 'learn' } });
            };

            return (
              <li
                key={S.id}
                className={cls}
                style={{ '--stage-color': S.color, '--char-accent': character.accent }}
              >
                <div className="learn-path-connector" aria-hidden="true" data-first={idx === 0 || undefined} />
                <button
                  type="button"
                  className="learn-path-node-btn"
                  onClick={onClick}
                  aria-disabled={isLocked}
                  aria-label={`Stage ${S.id}: ${S.name}${isLocked ? ' (locked)' : isDone ? ' (complete, tap to review)' : ''}`}
                >
                  <div className="learn-path-character" aria-hidden="true">
                    <span className="learn-path-character-emoji">
                      {isLocked
                        ? <Lock size={20} />
                        : (isDone ? <Check size={22} /> : character.placeholderEmoji)}
                    </span>
                  </div>
                  <div className="learn-path-info">
                    <div className="learn-path-eyebrow">
                      <span className="learn-path-stage-num">Stage {S.id}</span>
                      {isCurrent && <span className="learn-path-current-tag">Now</span>}
                      {isDone && <span className="learn-path-done-tag">Complete</span>}
                    </div>
                    <div className="learn-path-name">{S.name}</div>
                    <div className="learn-path-desc">{S.desc}</div>
                    <div className="learn-path-meta">
                      <span className="learn-path-character-name">{character.placeholderEmoji} {character.name}</span>
                      {!isEmpty && (
                        <span className="learn-path-progress-text">
                          {S.seen}/{S.total} learned · {S.mature} mastered through review
                        </span>
                      )}
                    </div>
                    {!isEmpty && (
                      <div className="learn-path-bar">
                        <div className="learn-path-bar-fill" style={{ width: `${S.seenPct}%` }} />
                      </div>
                    )}
                    {isDone && !isEmpty && (
                      <div className="learn-path-done-note">
                        Stage {S.id} complete. Every word learned. Tap to review Stage {S.id} (review only, due cards earn XP).
                      </div>
                    )}
                    {isEmpty && (
                      <div className="learn-path-empty-note">More lessons planned</div>
                    )}
                    {isLocked && (
                      <div className="learn-path-locked-note">
                        <span className="learn-path-locked-main">Locked</span>
                        <span className="learn-path-locked-sub">Complete earlier stages to unlock. Every stage is free.</span>
                      </div>
                    )}
                  </div>
                  {!isLocked && (
                    <span className="learn-path-arrow" aria-hidden="true"><ChevronRight size={20} /></span>
                  )}
                </button>
              </li>
            );
          })}
        </ol>
      </section>

      <div className="learn-footnote">
        <Sparkles size={14} />
        <span>Learn every word in a stage to unlock the next one. Mastery comes later, through review. Keep reviewing to lock words in for good.</span>
      </div>

      {showBasics && basics && (
        <div
          className="basics-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Thai basics primer"
          onClick={() => setShowBasics(false)}
        >
          <div className="basics-modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="basics-modal-head">
              <span className="basics-modal-eyebrow">Thai basics</span>
              <button
                type="button"
                className="basics-modal-close"
                onClick={() => setShowBasics(false)}
                aria-label="Close Thai basics"
              >
                <X size={18} />
              </button>
            </div>
            <div className="basics-modal-scroll">
              <ThaiBasicsPrimer primer={basics} />
            </div>
          </div>
        </div>
      )}

      {showBorrowed && (
        <div
          className="basics-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Words You Already Know"
          onClick={() => setShowBorrowed(false)}
        >
          <div className="basics-modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="basics-modal-head">
              <span className="basics-modal-eyebrow">Bonus: Words You Already Know</span>
              <button
                type="button"
                className="basics-modal-close"
                onClick={() => setShowBorrowed(false)}
                aria-label="Close Words You Already Know"
              >
                <X size={18} />
              </button>
            </div>
            <div className="basics-modal-scroll">
              <BorrowedWordsBonus audioRate={fullStats?.audioRate || 0.8} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
