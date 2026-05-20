import React from 'react';
import { BookOpen, ChevronRight, Clock, Lock, Check, Sparkles, Flame, Zap } from 'lucide-react';
import { STAGES, MISSIONS } from '../data/taxonomy.js';
import { DEFAULT_DAILY_GOAL, XP_REWARDS } from '../data/gamification.js';
import { getStageCharacter } from '../data/stageCharacters.js';
import { STAGE_1_MINI_UNIT_PILOT } from '../data/miniUnits.js';

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
}) {
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

  const ctaLabel = due > 0
    ? `Continue: ${due} due`
    : (seen === 0 ? 'Start your first lesson' : `Learn ${Math.max(1, newAvail)} new`);

  const continueSubtitle = inMissionView && currentMission
    ? `Mission ${currentMission.id}: ${currentMission.name}`
    : (currentStage ? `Stage ${currentStage.id}: ${currentStage.name}` : 'Survival Thai');

  const stageCharacter = currentStage ? getStageCharacter(currentStage.id) : getStageCharacter(1);
  const showMiniUnitPilot = !!(onStartMiniUnit && stageState && stageState.currentStage === 1);

  return (
    <div className="tab-content learn-path">
      {/* Continue banner — anchored CTA into the actual lesson flow */}
      <section
        className="learn-continue"
        style={{ '--learn-char-accent': stageCharacter.accent }}
        onClick={() => setTab('cards')}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTab('cards'); } }}
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

      {/* Guided mini-unit pilot — a safe entry point into the new 75/25 flow */}
      {showMiniUnitPilot && (
        <section className="learn-miniunit-card">
          <div className="learn-miniunit-icon" aria-hidden="true">
            <BookOpen size={24} />
          </div>
          <div className="learn-miniunit-body">
            <div className="learn-miniunit-eyebrow">Guided mini-unit pilot</div>
            <h2 className="learn-miniunit-title">{STAGE_1_MINI_UNIT_PILOT.title}</h2>
            <p className="learn-miniunit-copy">
              {STAGE_1_MINI_UNIT_PILOT.subtitle}
            </p>
            <div className="learn-miniunit-meta">
              <span><Clock size={13} /> {STAGE_1_MINI_UNIT_PILOT.estimatedMinutes} min</span>
              <span>{STAGE_1_MINI_UNIT_PILOT.vocabCardIds.length} cards</span>
              <span>{STAGE_1_MINI_UNIT_PILOT.challengeCardIds.length} questions</span>
            </div>
          </div>
          <button
            type="button"
            className="learn-miniunit-btn"
            onClick={() => onStartMiniUnit(STAGE_1_MINI_UNIT_PILOT.unitId)}
          >
            Try guided lesson <ChevronRight size={16} />
          </button>
        </section>
      )}

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
                  <div className="learn-mission-bar-fill" style={{ width: `${Math.round(currentMission.maturePct || 0)}%` }} />
                </div>
                <span className="learn-mission-pct">{Math.round(currentMission.maturePct || 0)}%</span>
              </div>
              <div className="learn-mission-stats">
                <span>{currentMission.seen}/{currentMission.total} seen</span>
                <span>{currentMission.mature}/{currentMission.total} mastered</span>
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
                  title={isLocked ? `Unlocks when Mission ${M.id - 1} is 70% mastered` : M.name}
                >
                  <div className="learn-mission-node-icon">
                    {isDone ? <Check size={16} /> : (isLocked ? <Lock size={14} /> : M.icon)}
                  </div>
                  <div className="learn-mission-node-name">{M.name}</div>
                  <div className="learn-mission-node-meta">{M.mature}/{M.total}</div>
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
            <span>{MISSIONS.length} missions in Stage 1</span>
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
              if (isLocked) return;
              setTab('cards');
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
                  disabled={isLocked}
                  aria-label={`Stage ${S.id}: ${S.name}${isLocked ? ' (locked)' : ''}`}
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
                          {S.mature}/{S.total} mastered ({S.maturePct}%)
                        </span>
                      )}
                    </div>
                    {!isEmpty && (
                      <div className="learn-path-bar">
                        <div className="learn-path-bar-fill" style={{ width: `${S.maturePct}%` }} />
                      </div>
                    )}
                    {isEmpty && (
                      <div className="learn-path-empty-note">More lessons planned</div>
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
        <span>Stages unlock at 70% mastery. Take your time. Practical fluency matters more than speed.</span>
      </div>
    </div>
  );
}
