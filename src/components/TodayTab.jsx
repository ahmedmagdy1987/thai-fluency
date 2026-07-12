import React, { useState } from 'react';
import { ChevronRight, Target, Star, BookOpen, Award, Compass, Check, BarChart3, Zap, Lock } from 'lucide-react';
import { CARDS } from '../data/cards.js';
import { ACHIEVEMENTS, XP_REWARDS, DEFAULT_DAILY_GOAL } from '../data/gamification.js';
import { STAGES } from '../data/taxonomy.js';
import { getStageState, buildPlacementCards, autoBreakdown, checkAchievements } from '../lib/state.js';
import AchievementsModal from './AchievementsModal.jsx';

export default function TodayTab({ stats, fullStats, setTab, stageState, missionState, voice, viewMode, onStartMissionCards }) {
  const [showAchievements, setShowAchievements] = useState(false);
  const ctaText = stats.due > 0 ? `Review ${stats.due} card${stats.due === 1 ? '' : 's'}` : (stats.seen === 0 ? 'Start learning' : 'Learn new cards');
  // In mission view, scope the "new cards ready" count to the user's current
  // mission instead of the full S1 deck (avoids "150 new" for a fresh user;
  // shows "29 new" instead).
  const inMissionViewPre = !!(missionState && stageState && stageState.currentStage === 1 && !missionState.stage1Complete);
  const _currentMissionForSubtitle = missionState ? missionState.missions.find(m => m.id === missionState.currentMission) : null;
  const newCount = (inMissionViewPre && _currentMissionForSubtitle)
    ? Math.max(0, _currentMissionForSubtitle.total - _currentMissionForSubtitle.seen)
    : stats.newAvail;
  const subtitle = stats.due > 0
    ? `${stats.due} due now${newCount > 0 ? `, ${newCount} new available` : ''}`
    : (inMissionViewPre && _currentMissionForSubtitle ? `Mission ${_currentMissionForSubtitle.id}: ${newCount} cards` : `${newCount} new cards ready`);
  const goal = fullStats.dailyGoal || DEFAULT_DAILY_GOAL;
  const todayXp = fullStats.todayXp || 0;
  const goalPct = Math.min(100, Math.round((todayXp / goal) * 100));
  const goalMet = todayXp >= goal;
  const allAchievements = checkAchievements(fullStats, {});
  const unlockedCount = allAchievements.filter(a => fullStats.unlockedAchievements && fullStats.unlockedAchievements.includes(a.id)).length;
  const currentStage = stageState ? stageState.stages.find(S => S.id === stageState.currentStage) || stageState.stages[stageState.stages.length - 1] : null;

  // Mission view kicks in while user is in Stage 1 and S1 isn't complete.
  // Past S1 (or S1 complete): show normal stage view. This hides "4,752"
  // from beginners until they've earned the reveal.
  const inMissionView = !!(missionState && stageState && stageState.currentStage === 1 && !missionState.stage1Complete);
  const currentMission = missionState ? missionState.missions.find(m => m.id === missionState.currentMission) : null;
  const s1Stage = stageState ? stageState.stages.find(s => s.id === 1) : null;
  const startCards = () => {
    if (inMissionView && currentMission && onStartMissionCards) {
      onStartMissionCards(currentMission);
      return;
    }
    // Non-mission continue targets the current learning frontier, so launch a
    // Learn-path learning session (new + due). The bare Cards tab is review-only.
    setTab('cards', { sessionScope: { type: 'learn' } });
  };

  const greetingThai = voice === 'female' ? 'สวัสดีค่ะ' : 'สวัสดีครับ';
  const greetingPh = voice === 'female' ? 'sàwàtdee khâ' : 'sàwàtdee khráp';

  return (
    <div className="tab-content">
      <div className="dash-greeting">
        <div className="dash-greeting-thai">{greetingThai}</div>
        <div className="dash-greeting-ph">{greetingPh}</div>
        <div className="dash-greeting-en">Welcome back. Here's where you are.</div>
      </div>

      <div className="hero-card" onClick={startCards}>
        <div className="hero-card-bg" />
        <div className="hero-card-content">
          <div className="hero-eyebrow">Today's session</div>
          <div className="hero-cta">{ctaText}</div>
          <div className="hero-sub">{subtitle}</div>
          <div className="hero-arrow"><ChevronRight size={28} /></div>
        </div>
      </div>

      {/* Daily goal ring + streak */}
      <div className="daily-goal-card">
        <div className="goal-ring-wrap">
          <svg viewBox="0 0 120 120" className="goal-ring">
            <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(15,61,46,0.08)" strokeWidth="10" />
            <circle cx="60" cy="60" r="52" fill="none" stroke={goalMet ? '#5BAF7C' : '#C9A961'} strokeWidth="10" strokeLinecap="round"
              strokeDasharray={`${(goalPct / 100) * 326.7} 326.7`} transform="rotate(-90 60 60)"
              style={{ transition: 'stroke-dasharray 0.6s ease' }} />
          </svg>
          <div className="goal-ring-center">
            {goalMet ? <Check size={28} /> : <Zap size={24} />}
            <div className="goal-ring-val">{todayXp}</div>
            <div className="goal-ring-of">/ {goal} XP</div>
          </div>
        </div>
        <div className="daily-goal-info">
          <div className="daily-goal-title">{goalMet ? "Goal complete!" : 'Daily goal'}</div>
          <div className="daily-goal-sub">
            {goalMet ? `+${XP_REWARDS.dailyGoalBonus} XP bonus earned` : `${goal - todayXp} XP to go`}
          </div>
          <div className="daily-goal-stats">
            <div className="dgs-item"><span className="dgs-num">{fullStats.streak || 0}</span><span className="dgs-label">streak</span></div>
            <div className="dgs-item"><span className="dgs-num">{fullStats.totalXp || 0}</span><span className="dgs-label">total XP</span></div>
            <div className="dgs-item"><span className="dgs-num">{fullStats.dailyGoalsHit || 0}</span><span className="dgs-label">goals hit</span></div>
          </div>
        </div>
      </div>

      {/* Mission view for Stage 1 beginners (hides the full deck until S1 complete) */}
      {inMissionView && currentMission && (
        <div className="dash-section">
          <div className="dash-section-header">
            <div className="dash-section-title">Your mission</div>
            <div className="dash-section-meta">Mission {currentMission.id} of 6: Survival Thai</div>
          </div>
          <div className="level-card-current" style={{ '--level-color': currentMission.color }}>
            <div className="level-card-icon">{currentMission.icon}</div>
            <div className="level-card-body">
              <div className="level-card-name">Mission {currentMission.id}: {currentMission.name}</div>
              <div className="level-card-desc">{currentMission.goal}</div>
              <div className="level-card-overall">
                <div className="level-card-overall-bar"><div className="level-card-overall-fill" style={{ width: (currentMission.seenPct || 0) + '%' }} /></div>
                <div className="level-card-overall-pct">{Math.round(currentMission.seenPct || 0)}%</div>
              </div>
              <div className="stage-stats-row">
                <div className="stage-stats-item"><div className="ssi-num">{currentMission.seen}<span className="ssi-of">/{currentMission.total}</span></div><div className="ssi-label">seen</div></div>
                <div className="stage-stats-item"><div className="ssi-num">{currentMission.mature}<span className="ssi-of">/{currentMission.total}</span></div><div className="ssi-label">mastered</div></div>
                <div className="stage-stats-item"><div className="ssi-num">{Math.max(0, currentMission.total - currentMission.seen)}</div><div className="ssi-label">to learn</div></div>
              </div>
            </div>
          </div>

          {/* 6 missions overview */}
          <div className="levels-overview stages-overview">
            {missionState.missions.map(M => {
              const isCurrent = M.id === currentMission.id;
              const isLocked = !M.unlocked;
              const isDone = M.complete;
              return (
                <div key={M.id} className={`level-pill ${isCurrent ? 'level-pill-current' : ''} ${isDone ? 'level-pill-done' : ''} ${isLocked ? 'level-pill-locked' : ''}`} style={{ '--lp-color': M.color }} title={isLocked ? `Unlocks when Mission ${M.id - 1} is complete` : M.name}>
                  <div className="level-pill-icon">{isDone ? '✓' : (isLocked ? '🔒' : M.icon)}</div>
                  <div className="level-pill-name">{M.name}</div>
                  <div className="level-pill-meta">{M.seen}/{M.total}</div>
                </div>
              );
            })}
          </div>
          <div className="mission-footnote">Finish Survival Thai to unlock the next stage.</div>
        </div>
      )}

      {/* Stage view (default after S1 complete, or for users placed past S1) */}
      {!inMissionView && currentStage && (
        <div className="dash-section">
          <div className="dash-section-header">
            <div className="dash-section-title">Your path</div>
            <div className="dash-section-meta">Stage {currentStage.id} of {STAGES.length}</div>
          </div>
          <div className="level-card-current" style={{ '--level-color': currentStage.color }}>
            <div className="level-card-icon">{currentStage.icon}</div>
            <div className="level-card-body">
              <div className="level-card-name">Stage {currentStage.id}: {currentStage.name}</div>
              <div className="level-card-desc">{currentStage.desc}</div>
              <div className="level-card-overall">
                <div className="level-card-overall-bar"><div className="level-card-overall-fill" style={{ width: currentStage.seenPct + '%' }} /></div>
                <div className="level-card-overall-pct">{currentStage.seenPct}% learned</div>
              </div>
              <div className="stage-stats-row">
                <div className="stage-stats-item"><div className="ssi-num">{currentStage.seen}<span className="ssi-of">/{currentStage.total}</span></div><div className="ssi-label">seen</div></div>
                <div className="stage-stats-item"><div className="ssi-num">{currentStage.mature}<span className="ssi-of">/{currentStage.total}</span></div><div className="ssi-label">mastered</div></div>
                <div className="stage-stats-item"><div className="ssi-num">{currentStage.total > 0 ? Math.max(0, currentStage.total - currentStage.seen) : 0}</div><div className="ssi-label">to learn</div></div>
              </div>
            </div>
          </div>

          {/* All stages overview */}
          <div className="levels-overview stages-overview">
            {stageState && stageState.stages.map(S => {
              const isCurrent = S.id === currentStage.id;
              const isLocked = !S.unlocked;
              const isDone = S.complete;
              const isEmpty = S.total === 0;
              return (
                <div key={S.id} className={`level-pill ${isCurrent ? 'level-pill-current' : ''} ${isDone ? 'level-pill-done' : ''} ${isLocked ? 'level-pill-locked' : ''} ${isEmpty ? 'level-pill-empty' : ''}`} style={{ '--lp-color': S.color }} title={S.name}>
                  <div className="level-pill-icon">{isDone ? '✓' : (isLocked ? '🔒' : (isEmpty ? '…' : S.icon))}</div>
                  <div className="level-pill-name">{S.name}</div>
                  {!isEmpty && <div className="level-pill-meta">{S.seen}/{S.total}</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Stats grid — show S1-only numbers in mission view to avoid leaking the 4,752 total */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon"><Target size={18} /></div>
          <div className="stat-num">{inMissionView ? (s1Stage ? s1Stage.seen : 0) : stats.seen}<span className="stat-num-of">/{inMissionView ? 150 : stats.total}</span></div>
          <div className="stat-label">Cards seen</div>
          <div className="stat-bar"><div className="stat-bar-fill" style={{ width: Math.round(((inMissionView ? (s1Stage ? s1Stage.seen : 0) : stats.seen) / (inMissionView ? 150 : stats.total)) * 100) + '%' }} /></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><Star size={18} /></div>
          <div className="stat-num">{inMissionView ? (s1Stage ? s1Stage.mature : 0) : stats.mature}</div>
          <div className="stat-label">Mastered</div>
          <div className="stat-bar"><div className="stat-bar-fill stat-bar-fill-gold" style={{ width: Math.round(((inMissionView ? (s1Stage ? s1Stage.mature : 0) : stats.mature) / (inMissionView ? 150 : stats.total)) * 100) + '%' }} /></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><BarChart3 size={18} /></div>
          <div className="stat-num">{fullStats.totalReviews || 0}</div>
          <div className="stat-label">Total reviews</div>
        </div>
        <div className="stat-card stat-card-clickable" onClick={() => setShowAchievements(true)}>
          <div className="stat-icon">🏆</div>
          <div className="stat-num">{unlockedCount}<span className="stat-num-of">/{ACHIEVEMENTS.length}</span></div>
          <div className="stat-label">Achievements</div>
        </div>
      </div>

      <div className="dash-section">
        <div className="dash-section-title">Quick start</div>
        <div className="quick-grid">
          <button className="quick-card" onClick={() => setTab('browse')}>
            <BookOpen size={20} />
            <div>
              <div className="quick-title">Browse content</div>
              <div className="quick-sub">{inMissionView ? '150 cards in Survival Thai' : `${CARDS.length} cards`}, 6 dialogues</div>
            </div>
          </button>
          <button className="quick-card" onClick={() => setTab('quiz')}>
            <Award size={20} />
            <div>
              <div className="quick-title">Start challenge</div>
              <div className="quick-sub">+{XP_REWARDS.quizCorrect} XP per correct</div>
            </div>
          </button>
          {/* Label matches the destination: setTab('guide') opens the Guide on
              its Tones section — the Tone Challenge is a sub-tab inside it. */}
          <button className="quick-card" onClick={() => setTab('guide')}>
            <Compass size={20} />
            <div>
              <div className="quick-title">Tones guide</div>
              <div className="quick-sub">{fullStats.tonesQuizPassed ? 'Tone Challenge passed' : 'Train your ear'}</div>
            </div>
          </button>
        </div>
      </div>

      <div className="footer-ornament">
        <span>{voice === 'female' ? 'chôhk dee khâ (โชคดีค่ะ)' : 'chôhk dee khráp (โชคดีครับ)'}</span>
      </div>

      {showAchievements && <AchievementsModal achievements={allAchievements} unlocked={fullStats.unlockedAchievements || []} onClose={() => setShowAchievements(false)} />}
    </div>
  );
}
