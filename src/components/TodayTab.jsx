import React, { useState } from 'react';
import { ChevronRight, Target, Star, BookOpen, Award, Compass, Check, BarChart3, Zap } from 'lucide-react';
import { CARDS } from '../data/cards.js';
import { ACHIEVEMENTS, XP_REWARDS, DEFAULT_DAILY_GOAL } from '../data/gamification.js';
import { STAGES } from '../data/taxonomy.js';
import { getStageState, buildPlacementCards, autoBreakdown, checkAchievements } from '../lib/state.js';
import AchievementsModal from './AchievementsModal.jsx';

export default function TodayTab({ stats, fullStats, setTab, stageState, resetAll, voice, viewMode }) {
  const [showAchievements, setShowAchievements] = useState(false);
  const ctaText = stats.due > 0 ? `Review ${stats.due} card${stats.due === 1 ? '' : 's'}` : (stats.seen === 0 ? 'Start learning' : 'Learn new cards');
  const subtitle = stats.due > 0 ? `${stats.due} due now${stats.newAvail > 0 ? ` · ${stats.newAvail} new available` : ''}` : `${stats.newAvail} new cards ready`;
  const goal = fullStats.dailyGoal || DEFAULT_DAILY_GOAL;
  const todayXp = fullStats.todayXp || 0;
  const goalPct = Math.min(100, Math.round((todayXp / goal) * 100));
  const goalMet = todayXp >= goal;
  const allAchievements = checkAchievements(fullStats, {});
  const unlockedCount = allAchievements.filter(a => fullStats.unlockedAchievements && fullStats.unlockedAchievements.includes(a.id)).length;
  const currentStage = stageState ? stageState.stages.find(S => S.id === stageState.currentStage) || stageState.stages[stageState.stages.length - 1] : null;

  const greetingThai = voice === 'female' ? 'สวัสดีค่ะ' : 'สวัสดีครับ';
  const greetingPh = voice === 'female' ? 'sàwàtdee khâ' : 'sàwàtdee khráp';

  return (
    <div className="tab-content">
      <div className="dash-greeting">
        <div className="dash-greeting-thai">{greetingThai}</div>
        <div className="dash-greeting-ph">{greetingPh}</div>
        <div className="dash-greeting-en">Welcome back. Here's where you are.</div>
      </div>

      <div className="hero-card" onClick={() => setTab('cards')}>
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
            <div className="dgs-item"><span className="dgs-num">{fullStats.streak || 0}</span><span className="dgs-label">🔥 streak</span></div>
            <div className="dgs-item"><span className="dgs-num">{fullStats.totalXp || 0}</span><span className="dgs-label">total XP</span></div>
            <div className="dgs-item"><span className="dgs-num">{fullStats.dailyGoalsHit || 0}</span><span className="dgs-label">goals hit</span></div>
          </div>
        </div>
      </div>

      {/* Current stage */}
      {currentStage && (
        <div className="dash-section">
          <div className="dash-section-header">
            <div className="dash-section-title">Your path</div>
            <div className="dash-section-meta">Stage {currentStage.id} of {STAGES.length}</div>
          </div>
          <div className="level-card-current" style={{ '--level-color': currentStage.color }}>
            <div className="level-card-icon">{currentStage.icon}</div>
            <div className="level-card-body">
              <div className="level-card-name">Stage {currentStage.id} · {currentStage.name}</div>
              <div className="level-card-desc">{currentStage.desc}</div>
              <div className="level-card-overall">
                <div className="level-card-overall-bar"><div className="level-card-overall-fill" style={{ width: currentStage.maturePct + '%' }} /></div>
                <div className="level-card-overall-pct">{currentStage.maturePct}%</div>
              </div>
              <div className="stage-stats-row">
                <div className="stage-stats-item"><div className="ssi-num">{currentStage.seen}<span className="ssi-of">/{currentStage.total}</span></div><div className="ssi-label">seen</div></div>
                <div className="stage-stats-item"><div className="ssi-num">{currentStage.mature}<span className="ssi-of">/{currentStage.total}</span></div><div className="ssi-label">mastered</div></div>
                <div className="stage-stats-item"><div className="ssi-num">{currentStage.total > 0 ? Math.max(0, currentStage.total - currentStage.mature) : 0}</div><div className="ssi-label">to go</div></div>
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
                  {!isEmpty && <div className="level-pill-meta">{S.mature}/{S.total}</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Stats grid */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon"><Target size={18} /></div>
          <div className="stat-num">{stats.seen}<span className="stat-num-of">/{stats.total}</span></div>
          <div className="stat-label">Cards seen</div>
          <div className="stat-bar"><div className="stat-bar-fill" style={{ width: Math.round((stats.seen / stats.total) * 100) + '%' }} /></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><Star size={18} /></div>
          <div className="stat-num">{stats.mature}</div>
          <div className="stat-label">Mastered</div>
          <div className="stat-bar"><div className="stat-bar-fill stat-bar-fill-gold" style={{ width: Math.round((stats.mature / stats.total) * 100) + '%' }} /></div>
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
              <div className="quick-sub">{CARDS.length} cards · 6 dialogues</div>
            </div>
          </button>
          <button className="quick-card" onClick={() => setTab('quiz')}>
            <Award size={20} />
            <div>
              <div className="quick-title">Take a quiz</div>
              <div className="quick-sub">+{XP_REWARDS.quizCorrect} XP per correct</div>
            </div>
          </button>
          <button className="quick-card" onClick={() => setTab('guide')}>
            <Compass size={20} />
            <div>
              <div className="quick-title">Tones quiz</div>
              <div className="quick-sub">{fullStats.tonesQuizPassed ? '✓ Passed · try again' : 'Train your ear'}</div>
            </div>
          </button>
        </div>
      </div>

      <div className="footer-ornament">
        <span>{voice === 'female' ? 'โชคดีค่ะ · chôhk dee khâ' : 'โชคดีครับ · chôhk dee khráp'}</span>
      </div>

      {showAchievements && <AchievementsModal achievements={allAchievements} unlocked={fullStats.unlockedAchievements || []} onClose={() => setShowAchievements(false)} />}
    </div>
  );
}
