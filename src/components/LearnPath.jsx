import React, { useEffect, useRef, useState } from 'react';
import { BookOpen, ChevronRight, ChevronDown, Lock, Check, Sparkles, Flame, Gift, Zap, X } from 'lucide-react';
import { DEFAULT_DAILY_GOAL, XP_REWARDS } from '../data/gamification.js';
import { getStageCharacter, resolveCoachIdForStage } from '../data/stageCharacters.js';
import { getMiniUnitsForStage, STAGE_1_MINI_UNIT_PILOT } from '../data/miniUnits.js';
import { BORROWED_WORDS } from '../data/borrowedWords.js';
import { getMiniUnitProgressState } from '../lib/miniUnitSequence.js';
import CharacterCoach from './CharacterCoach.jsx';
import ThaiBasicsPrimer from './ThaiBasicsPrimer.jsx';
import BorrowedWordsBonus from './BorrowedWordsBonus.jsx';

// Primary learning view — the stepped path. The current stage's mini-units
// render as a zigzag (serpentine) trail of lesson nodes with the stage coach
// travelling to the current node; earlier stages collapse to compact markers
// above the trail and the next stage previews below it.
//
// VISUAL redesign only. All progress, unlock, and current-stage logic is read
// unchanged from state.js (stageState / missionState) and
// miniUnitSequence.js (getMiniUnitProgressState) — no new gameplay rules, no
// new unlock rules, no economy changes. Node status is EXACTLY the sequence
// lib's 'complete' | 'current' | 'locked'.

// ── Trail geometry (presentation constants only) ────────────────────────────
// Serpentine x-centers (in % of track width), cycling per node index so the
// eye follows a winding S down the spine: center → right → center → left.
const TRAIL_X_PATTERN = [50, 76, 50, 24];
const TRAIL_ROW_H = 116;      // px per node row (circle + label)
const TRAIL_TOP_PAD = 96;     // headroom so the coach fits above node 1
const TRAIL_NODE_R = 33;      // node circle radius (66px hit target)

const prefersReducedMotion = () => {
  try { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); }
  catch { return false; }
};

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
  const currentStageId = stageState?.currentStage || 1;
  const currentStageMiniUnits = getMiniUnitsForStage(currentStageId);
  // "Continue" only when there is genuinely mid-flow saved progress (a unit the
  // user started but didn't finish) — a bare intro or a completed save = "Start".
  const savedUnitProgress = fullStats?.miniUnitProgress;
  const midFlowUnitId = (savedUnitProgress?.step && savedUnitProgress.step !== 'intro' && savedUnitProgress.step !== 'complete')
    ? savedUnitProgress.unitId
    : null;
  const completedMiniUnits = fullStats?.completedMiniUnits || [];
  const miniUnitSequence = getMiniUnitProgressState(
    currentStageMiniUnits,
    completedMiniUnits,
    midFlowUnitId,
  );
  const showTrail = !!(onStartMiniUnit && stageState && miniUnitSequence.units.length > 0);

  // The path coach for this stage — the SAME character resolution the lessons
  // themselves use (MiniUnitFlow), so the mascot on the trail is the mascot in
  // the lesson. Stage 1 = Chang the elephant.
  const coachId = resolveCoachIdForStage(currentStageId);

  // ── Trail node geometry (pure presentation over the sequence state) ───────
  const trailNodes = miniUnitSequence.units.map((u, i) => ({
    ...u,
    index: i,
    x: TRAIL_X_PATTERN[i % TRAIL_X_PATTERN.length],
    y: TRAIL_TOP_PAD + i * TRAIL_ROW_H + TRAIL_NODE_R,
  }));
  const currentTrailIdx = trailNodes.findIndex(n => n.isCurrent);
  // The current node stacks extra content (action chip + meta); when it is the
  // LAST node, reserve tail room so it never paints over the next-stage card.
  const lastIsCurrent = trailNodes.length > 0 && currentTrailIdx === trailNodes.length - 1;
  const trackHeight = trailNodes.length > 0
    ? TRAIL_TOP_PAD + trailNodes.length * TRAIL_ROW_H + (lastIsCurrent ? 72 : 8)
    : 0;
  // The coach sits at the current node; when the stage path is complete it
  // celebrates at the last node.
  const coachTrailIdx = currentTrailIdx >= 0 ? currentTrailIdx : trailNodes.length - 1;
  const coachNode = trailNodes[coachTrailIdx] || null;

  // The winding path line, as SVG polylines in a 0–100 × px coordinate space
  // (preserveAspectRatio="none" + non-scaling strokes keep it crisp at any
  // width). Base line spans every node; the "done" overlay traces progress up
  // to the coach's node.
  const lineD = trailNodes.map((n, i) => `${i === 0 ? 'M' : 'L'} ${n.x} ${n.y}`).join(' ');
  const doneD = coachTrailIdx > 0
    ? trailNodes.slice(0, coachTrailIdx + 1).map((n, i) => `${i === 0 ? 'M' : 'L'} ${n.x} ${n.y}`).join(' ')
    : '';

  // Gentle hint when a locked node is tapped — never a dead-end, never a
  // crash. Stored as { index, ts } so RE-tapping the same node produces a new
  // object, re-arming the hide timer (a bare index would bail out of the
  // state update and let the first timer hide the bubble mid-read).
  const [lockedHint, setLockedHint] = useState(null);
  useEffect(() => {
    if (lockedHint == null) return undefined;
    const t = window.setTimeout(() => setLockedHint(null), 3200);
    return () => window.clearTimeout(t);
  }, [lockedHint]);

  // Land the user on "what do I do next": auto-scroll the current node into
  // view on load / when the frontier moves. Runs after App's scroll-to-top on
  // tab change; mirrors the GuidedTutorial scroll pattern.
  const currentNodeRef = useRef(null);
  useEffect(() => {
    const el = currentNodeRef.current;
    if (!el) return undefined;
    const t = window.setTimeout(() => {
      try {
        el.scrollIntoView({ block: 'center', inline: 'nearest', behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
      } catch {
        try { el.scrollIntoView(); } catch { /* older browsers: stay at top */ }
      }
    }, 140);
    return () => window.clearTimeout(t);
  }, [miniUnitSequence.currentUnitId, currentStageId]);

  // Stage groupings around the current stage. All lock/complete state comes
  // straight from stageState (state.js) — markers only redraw it.
  const allStages = stageState ? stageState.stages : [];
  const earlierStages = allStages.filter(S => S.id < currentStageId);
  const nextStage = allStages.find(S => S.id === currentStageId + 1) || null;
  const laterStages = allStages.filter(S => S.id > currentStageId + 1);
  const completedSet = new Set(completedMiniUnits);

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

  // Tapping a stage marker keeps EXACTLY the old stage-row behavior:
  // locked → gentle locked-feature hint; complete → stage review session
  // (review-only, never advances); otherwise → learning session.
  const openStage = (S) => {
    if (!S.unlocked) {
      onLockedFeature && onLockedFeature(S);
      return;
    }
    if (S.id === 1 && inMissionView && currentMission && onStartMissionCards) {
      onStartMissionCards(currentMission);
      return;
    }
    if (S.complete) {
      setTab('cards', { sessionScope: { type: 'stageReview', stageId: S.id, stageName: S.name } });
      return;
    }
    setTab('cards', { sessionScope: { type: 'learn' } });
  };

  // Compact expandable marker for a non-current stage (earlier or later).
  const renderStageMarker = (S, { locked = false } = {}) => {
    const character = getStageCharacter(S.id);
    const isDone = S.complete;
    const stageUnits = getMiniUnitsForStage(S.id);
    return (
      <details className={`learn-trail-stage${isDone ? ' learn-trail-stage-done' : ''}${locked ? ' learn-trail-stage-locked' : ''}`} key={S.id}>
        <summary className="learn-trail-stage-summary">
          <span className="learn-trail-stage-badge" aria-hidden="true" style={{ '--stage-color': S.color, '--char-accent': character.accent }}>
            {locked ? <Lock size={14} /> : isDone ? <Check size={15} /> : character.placeholderEmoji}
          </span>
          <span className="learn-trail-stage-title">Stage {S.id}: {S.name}</span>
          <span className="learn-trail-stage-meta">
            {locked ? 'Locked' : isDone ? 'Complete' : (S.total > 0 ? `${S.seen}/${S.total} learned` : 'More lessons planned')}
          </span>
          <ChevronDown size={16} className="learn-collapse-chev" aria-hidden="true" />
        </summary>
        <div className="learn-trail-stage-body">
          {locked ? (
            <div className="learn-trail-stage-note">
              <span className="learn-path-locked-main">Locked</span>
              <span className="learn-path-locked-sub">Complete earlier stages to unlock. Every stage is free.</span>
              <button type="button" className="learn-trail-stage-action" onClick={() => onLockedFeature && onLockedFeature(S)}>
                What&apos;s in Stage {S.id}?
              </button>
            </div>
          ) : (
            <>
              {stageUnits.length > 0 && (
                <div className="learn-trail-mini-list">
                  {stageUnits.map(u => (
                    completedSet.has(u.unitId) ? (
                      <button
                        key={u.unitId}
                        type="button"
                        className="learn-trail-mini learn-trail-mini-done"
                        onClick={() => onStartMiniUnit && onStartMiniUnit(u.unitId)}
                        aria-label={`Replay ${u.title} (completed lesson, review anytime)`}
                      >
                        <Check size={12} aria-hidden="true" /> <span>{u.title}</span>
                      </button>
                    ) : (
                      <span
                        key={u.unitId}
                        className="learn-trail-mini learn-trail-mini-off"
                        title="Not completed — new lessons continue on your current stage."
                      >
                        {u.title}
                      </span>
                    )
                  ))}
                </div>
              )}
              <button type="button" className="learn-trail-stage-action" onClick={() => openStage(S)}>
                {isDone
                  ? `Review Stage ${S.id} (review only, due cards earn XP)`
                  : `Practice Stage ${S.id} words`}
                <ChevronRight size={14} aria-hidden="true" />
              </button>
              {!isDone && S.total > 0 && (
                <div className="learn-trail-stage-progressline">
                  <div className="learn-path-bar"><div className="learn-path-bar-fill" style={{ width: `${S.seenPct}%` }} /></div>
                </div>
              )}
            </>
          )}
        </div>
      </details>
    );
  };

  return (
    <div className="tab-content learn-path">
      {/* Course-complete state — shown when every guided mini-unit across all
          stages is done. The trail below is intentionally NOT hidden, so users
          can keep reviewing any completed unit. */}
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

      {/* Slim continue strip — the compact session affordance. The trail's
          CURRENT NODE below is the screen's one big primary action; this strip
          keeps the existing card-session behavior (mission cards in Stage 1,
          learning sessions after) reachable without competing visually. */}
      <section
        className="learn-continue-slim"
        data-tutorial="path"
        style={{ '--learn-char-accent': stageCharacter.accent }}
        onClick={startCards}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); startCards(); } }}
      >
        <span className="learn-continue-slim-emoji" aria-hidden="true">{stageCharacter.placeholderEmoji}</span>
        <span className="learn-continue-slim-body">
          <span className="learn-continue-slim-eyebrow">{continueSubtitle}</span>
          <span className="learn-continue-slim-label">{ctaLabel}</span>
        </span>
        <ChevronRight size={18} className="learn-continue-slim-arrow" aria-hidden="true" />
      </section>

      {/* ── The stepped path ─────────────────────────────────────────────── */}
      <section className="learn-section learn-trail" aria-label={`Stage ${currentStageId} lesson path`}>
        {/* Completed / earlier stages — compact markers, expandable. */}
        {earlierStages.length > 0 && (
          <div className="learn-trail-earlier">
            {earlierStages.map(S => renderStageMarker(S))}
          </div>
        )}

        <div className="learn-section-header">
          <h2 className="learn-section-title">Stage {currentStageId} lessons</h2>
          <span className="learn-section-meta">
            {miniUnitSequence.pathComplete
              ? `Stage ${currentStageId} path complete`
              : `${miniUnitSequence.completedCount}/${miniUnitSequence.totalCount} lessons complete`}
          </span>
        </div>
        {basics && (
          <button type="button" className="learn-basics-link" onClick={() => setShowBasics(true)}>
            <BookOpen size={14} /> Open Thai basics
          </button>
        )}

        {/* The zigzag trail: nodes alternate down a winding spine, connected
            by the path line; the stage coach travels to the current node. */}
        {showTrail && (
          <div className="learn-trail-track" style={{ height: trackHeight }}>
            <svg
              className="learn-trail-line"
              viewBox={`0 0 100 ${trackHeight}`}
              preserveAspectRatio="none"
              aria-hidden="true"
              focusable="false"
            >
              <path d={lineD} className="learn-trail-line-base" vectorEffect="non-scaling-stroke" />
              {doneD && <path d={doneD} className="learn-trail-line-done" vectorEffect="non-scaling-stroke" />}
            </svg>

            {coachNode && (
              <div
                className="learn-trail-coach"
                style={{ left: `${coachNode.x}%`, top: coachNode.y - TRAIL_NODE_R + 6 }}
                aria-hidden="true"
                data-coach-at={coachNode.unitId}
              >
                <CharacterCoach
                  characterId={coachId}
                  state={miniUnitSequence.pathComplete ? 'celebrating' : 'idle'}
                  className="learn-trail-coach-inner"
                />
              </div>
            )}

            {trailNodes.map((u) => {
              const status = u.status; // 'complete' | 'current' | 'locked' — straight from miniUnitSequence.js
              const locked = status === 'locked';
              const isCurrent = status === 'current';
              const note = status === 'complete'
                ? 'Completed. Review anytime.'
                : isCurrent
                  ? 'Continue your path.'
                  : 'Complete the previous lesson to unlock.';
              const action = status === 'complete'
                ? 'Review'
                : isCurrent
                  ? (u.inProgress ? 'Continue' : 'Start')
                  : 'Locked';
              return (
                <React.Fragment key={u.unitId}>
                  <button
                    type="button"
                    ref={isCurrent ? currentNodeRef : undefined}
                    className={`learn-trail-node learn-trail-node-${status}`}
                    style={{ left: `${u.x}%`, top: u.y - TRAIL_NODE_R }}
                    data-status={status}
                    data-unit-id={u.unitId}
                    // No aria-disabled: a locked node still performs an action
                    // (the gentle hint), and its locked state is announced in
                    // the label — so it is operable, not disabled.
                    aria-label={locked
                      ? `Lesson ${u.index + 1}: ${u.title}, locked. ${note}`
                      : `${action} lesson ${u.index + 1}: ${u.title}`}
                    title={locked ? note : undefined}
                    onClick={locked
                      ? () => setLockedHint({ index: u.index, ts: Date.now() })
                      : () => onStartMiniUnit(u.unitId)}
                  >
                    <span className="learn-trail-node-circle" aria-hidden="true">
                      {status === 'complete' ? <Check size={26} /> : locked ? <Lock size={20} /> : <BookOpen size={26} />}
                    </span>
                    <span className="learn-trail-node-label">
                      <span className="learn-trail-node-num">Lesson {u.index + 1}</span>
                      <span className="learn-trail-node-title">{u.title}</span>
                      {isCurrent && (
                        <span className="learn-trail-node-action">{action}</span>
                      )}
                      {isCurrent && (
                        <span className="learn-trail-node-meta">
                          {u.estimatedMinutes} min · {u.vocabCardIds.length} cards{u.sentenceBuilder ? ' · builder' : ''}
                        </span>
                      )}
                    </span>
                  </button>
                  {lockedHint && lockedHint.index === u.index && (
                    <div
                      className="learn-trail-hint"
                      role="status"
                      // clamp() keeps the bubble inside the track on narrow
                      // screens — a side-column (24%/76%) node's hint would
                      // otherwise clip at the viewport edge.
                      style={{ left: `clamp(120px, ${u.x}%, calc(100% - 120px))`, top: u.y + TRAIL_NODE_R + 6 }}
                    >
                      Finish the earlier lessons first — complete Lesson {u.index} to unlock this one.
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}

        {/* When the CURRENT stage itself is complete (the all-stages-done end
            state — getStageState keeps currentStage at the last stage), the
            old screen's "Tap to review Stage N" must stay reachable: offer the
            same review-only stage session here. */}
        {currentStage && currentStage.id === currentStageId && currentStage.complete && (
          <button
            type="button"
            className="learn-trail-stage-action learn-trail-current-review"
            onClick={() => openStage(currentStage)}
          >
            Review Stage {currentStage.id} (review only, due cards earn XP)
            <ChevronRight size={14} aria-hidden="true" />
          </button>
        )}

        {/* Next stage — previewed at the bottom of the trail; opens when the
            current stage completes. Same behavior as the old stage row. */}
        {nextStage && (
          <button
            type="button"
            className={`learn-trail-next${nextStage.unlocked ? '' : ' learn-trail-next-locked'}`}
            onClick={() => openStage(nextStage)}
            // No aria-disabled: when locked this button still performs an
            // action (the locked-stage explanation), and the locked state is
            // announced in the label — operable, not disabled.
            aria-label={`Stage ${nextStage.id}: ${nextStage.name}${nextStage.unlocked ? '' : ' (locked)'}`}
          >
            <span className="learn-trail-next-badge" aria-hidden="true">
              {nextStage.unlocked ? getStageCharacter(nextStage.id).placeholderEmoji : <Lock size={18} />}
            </span>
            <span className="learn-trail-next-body">
              <span className="learn-trail-next-eyebrow">Up next</span>
              <span className="learn-trail-next-title">Stage {nextStage.id}: {nextStage.name}</span>
              <span className="learn-trail-next-sub">
                {nextStage.unlocked
                  ? 'Unlocked — keep going.'
                  : `Opens when Stage ${currentStageId} is complete. Every stage is free.`}
              </span>
            </span>
          </button>
        )}

        {/* The rest of the journey — compact locked markers, expandable. */}
        {laterStages.length > 0 && (
          <div className="learn-trail-later">
            {laterStages.map(S => renderStageMarker(S, { locked: !S.unlocked }))}
          </div>
        )}
      </section>

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

      {/* Mission rail — only while inside Stage 1.
          DE-CLUTTER (collapsed by default): this panel restates the mission the
          continue strip at the top already launches, then adds a 6-node rail. Its
          headline progress stays visible in the summary; the card, bar, stats and
          every mission node are unchanged inside. Nothing removed. */}
      {inMissionView && currentMission && missionState && (
        <details className="learn-section learn-collapse">
          <summary className="learn-collapse-summary">
            <span className="learn-collapse-title">Mission {currentMission.id}: {currentMission.name}</span>
            <span className="learn-collapse-meta">{Math.round(currentMission.seenPct || 0)}% · Stage 1: Survival Thai</span>
            <ChevronDown size={18} className="learn-collapse-chev" aria-hidden="true" />
          </summary>
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
        </details>
      )}

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
