import React, { useMemo, useState } from 'react';
import { Target, Flame, BookOpen, CheckCircle2, Sparkles, Lock, Trophy } from 'lucide-react';
import { evaluateDailyQuests } from '../lib/dailyQuests.js';
import { checkAchievements } from '../lib/state.js';
import AchievementsModal from './AchievementsModal.jsx';

// Phase 1 quests read real stats where available, but they do not spend
// rewards or mutate quest state. Lesson flow remains the source of progress.
//
// All quest LOGIC lives in lib/dailyQuests.js (one source of truth) so the
// four quests can never contradict each other (e.g. XP goal done but streak
// says "no study today"). This component only renders that evaluation.
export default function QuestsScreen({ stats, dashboardStats, progress, setTab, locked = false, onOpenSuper }) {
  const q = evaluateDailyQuests({ stats, dashboardStats, progress });
  const goal = q.goal;
  const todayXp = q.todayXp;
  const dailyPct = q.daily.pct;
  const dailyDone = q.daily.done;

  const due = q.due.due;
  const dueSeen = q.due.seen;
  const dueDone = q.due.done;
  const duePct = q.due.pct;

  const cardsTarget = q.cards.target;
  const practicedToday = q.cards.practicedToday;
  const cardsPct = q.cards.pct;
  const cardsDone = q.cards.done;

  const streakCount = q.streakCount;
  const streakDone = q.streak.done;
  const streakPct = q.streak.pct;

  const quests = [
    {
      id: 'daily-goal',
      Icon: Target,
      iconBg: '#5BAF7C',
      title: 'Hit your daily XP goal',
      desc: `Earn ${goal} XP through lessons, challenges, or reviews.`,
      progress: `${todayXp}/${goal} XP`,
      pct: dailyPct,
      done: dailyDone,
      // Both rewards are real: the +25 XP bonus and the 5-gem daily-goal grant
      // (GEMS_PER_DAILY_GOAL, awarded in App.jsx when the goal is first hit).
      reward: '+25 XP bonus · +5 gems',
      cta: dailyDone ? null : 'Start practice',
      onClick: () => setTab && setTab('cards'),
    },
    {
      id: 'cards-ten',
      Icon: BookOpen,
      iconBg: '#C9A961',
      title: 'Practice 10 cards today',
      desc: 'Complete cards to earn XP and keep Thai fresh.',
      progress: `${Math.min(practicedToday, cardsTarget)}/${cardsTarget} cards`,
      pct: cardsPct,
      done: cardsDone,
      reward: 'Keep Thai fresh',
      cta: cardsDone ? null : 'Open Practice',
      onClick: () => setTab && setTab('cards'),
    },
    {
      id: 'due-cards',
      Icon: CheckCircle2,
      iconBg: '#2E7D5B',
      title: 'Review your due cards',
      // Display-only zero-state branch: with no cards learned yet (seen === 0)
      // the quest is not "cleared" — it hasn't started. Saying "Excellent" over
      // an unchecked 0% bar read as a contradiction (UX audit).
      desc: due > 0
        ? `${due} card${due === 1 ? '' : 's'} waiting. Clear them to lock in mastery.`
        : (dueSeen > 0
            ? 'No reviews due right now. Excellent.'
            : 'Learn a few cards first — reviews appear here when they’re due.'),
      progress: due > 0 ? `${due} due` : (dueSeen > 0 ? 'Cleared' : 'No cards yet'),
      pct: duePct,
      done: dueDone,
      reward: 'Build mastery',
      cta: due > 0 ? 'Review now' : null,
      onClick: () => setTab && setTab('cards'),
    },
    {
      id: 'streak',
      Icon: Flame,
      iconBg: '#E0823B',
      title: 'Keep your streak alive',
      desc: streakDone
        ? (streakCount > 1
            ? `${streakCount}-day streak, kept alive today.`
            : 'Studied today. Your streak is going.')
        : (streakCount > 0
            ? `${streakCount}-day streak. Study once today to keep it.`
            : 'Study at least once today to start your streak.'),
      progress: streakDone
        ? (streakCount > 0 ? `${streakCount} day${streakCount === 1 ? '' : 's'}` : 'Done today')
        : 'Study today',
      pct: streakPct,
      done: streakDone,
      reward: 'Protect your streak',
      cta: streakDone ? null : 'Study now',
      onClick: () => setTab && setTab('cards'),
    },
  ];

  const completed = quests.filter(q => q.done).length;

  // Achievements collection browser (Wave 10). Before this, AchievementsModal
  // was reachable only from the auth-gated Profile page and the orphaned
  // /today route — an ANONYMOUS learner could earn achievements but never
  // browse them again. Quests is the gamification home and is in the nav for
  // everyone, so the collection lives here too (also rendered in the
  // stage-locked state below, where stage-1 anonymous learners actually are).
  const [showAchievements, setShowAchievements] = useState(false);
  const achievements = useMemo(() => checkAchievements(stats || {}, progress || {}), [stats, progress]);
  const unlockedIds = useMemo(() => achievements.filter(a => a.unlocked).map(a => a.id), [achievements]);

  const achievementsCard = (
    <article className="quest-card quests-achievements-card" style={{ '--quest-color': '#C9A961' }}>
      <div className="quest-card-icon" aria-hidden="true"><Trophy size={22} /></div>
      <div className="quest-card-body">
        <div className="quest-card-title">Achievements</div>
        <div className="quest-card-desc">{unlockedIds.length} of {achievements.length} unlocked</div>
      </div>
      <button type="button" className="quest-card-cta" onClick={() => setShowAchievements(true)}>
        View all
      </button>
    </article>
  );

  const achievementsModal = showAchievements ? (
    <AchievementsModal
      achievements={achievements}
      unlocked={unlockedIds}
      onClose={() => setShowAchievements(false)}
    />
  ) : null;

  if (locked) {
    return (
      <div className="tab-content quests-screen">
        <section className="feature-lock-panel">
          <div className="feature-lock-icon"><Lock size={28} /></div>
          <div className="feature-lock-eyebrow">Progressive unlock</div>
          <h1 className="feature-lock-title">Complete Stage 1 to unlock Quests</h1>
          <p className="feature-lock-copy">
            Finish Stage 1 on your Learn path to unlock daily quests. Quests are free — you unlock them by learning.
          </p>
          <div className="feature-lock-actions">
            {/* Learn is the only surface that introduces new cards and can
                actually complete Stage 1 — the bare Practice tab is review-only
                and could never satisfy this gate (UX audit). */}
            <button type="button" className="btn-primary" onClick={() => setTab && setTab('learn')}>
              Go to Learn
            </button>
          </div>
        </section>
        {/* Achievements are NOT stage-gated — they unlock from the first lesson
            onward, so the browser stays reachable while quests are locked. */}
        <div className="quests-list" role="list">{achievementsCard}</div>
        {achievementsModal}
      </div>
    );
  }

  return (
    <div className="tab-content quests-screen">
      <header className="quests-hero">
        <div className="quests-hero-icon" aria-hidden="true"><Target size={28} /></div>
        <div className="quests-hero-body">
          <div className="quests-hero-eyebrow">Daily quests</div>
          <h1 className="quests-hero-title">{completed > 0 ? `${completed} of ${quests.length} done today` : "Today's quests"}</h1>
          <p className="quests-hero-sub">
            Track your daily practice, build your streak, and complete cards to earn XP.
          </p>
        </div>
      </header>

      <div className="quests-list" role="list">
        {quests.map(q => (
          <article
            key={q.id}
            role="listitem"
            className={`quest-card ${q.done ? 'quest-card-done' : ''}`}
            style={{ '--quest-color': q.iconBg }}
          >
            <div className="quest-card-icon" aria-hidden="true">
              {q.done ? <CheckCircle2 size={22} /> : <q.Icon size={22} />}
            </div>
            <div className="quest-card-body">
              <div className="quest-card-title">{q.title}</div>
              <div className="quest-card-desc">{q.desc}</div>
              <div className="quest-card-progress-row">
                <div className="quest-card-bar"><div className="quest-card-bar-fill" style={{ width: `${q.pct}%` }} /></div>
                <span className="quest-card-progress-text">{q.progress}</span>
              </div>
              <div className="quest-card-reward">
                <Sparkles size={12} /> {q.reward}
              </div>
            </div>
            {q.cta && (
              <button type="button" className="quest-card-cta" onClick={q.onClick}>
                {q.cta}
              </button>
            )}
          </article>
        ))}
        {achievementsCard}
      </div>
      {achievementsModal}
    </div>
  );
}
