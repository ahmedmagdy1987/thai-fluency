import React from 'react';
import { Target, Flame, BookOpen, CheckCircle2, Sparkles, Award } from 'lucide-react';
import { DEFAULT_DAILY_GOAL, XP_REWARDS } from '../data/gamification.js';

// Phase 1 quests read real stats where available, but they do not spend
// rewards or mutate quest state. Lesson flow remains the source of progress.
export default function QuestsScreen({ stats, dashboardStats, setTab }) {
  const goal = stats?.dailyGoal || DEFAULT_DAILY_GOAL;
  const todayXp = stats?.todayXp || 0;
  const dailyPct = Math.min(100, Math.round((todayXp / goal) * 100));
  const dailyDone = todayXp >= goal;

  const due = dashboardStats?.due || 0;
  const dueDone = due === 0 && (dashboardStats?.seen || 0) > 0;
  const duePct = (() => {
    const total = (dashboardStats?.seen || 0);
    if (total <= 0) return 0;
    return Math.min(100, Math.round(((total - due) / total) * 100));
  })();

  const cardsTarget = 10;
  const reviewsToday = Math.min(cardsTarget, Math.max(0, todayXp > 0 ? Math.ceil(todayXp / XP_REWARDS.good) : 0));
  const cardsPct = Math.min(100, Math.round((reviewsToday / cardsTarget) * 100));
  const cardsDone = reviewsToday >= cardsTarget;

  const streakAlive = (stats?.streak || 0) > 0;
  const streakPct = streakAlive ? 100 : 0;

  const quests = [
    {
      id: 'daily-goal',
      Icon: Target,
      iconBg: '#5BAF7C',
      title: 'Hit your daily XP goal',
      desc: `Earn ${goal} XP through lessons, quizzes, or reviews.`,
      progress: `${todayXp}/${goal} XP`,
      pct: dailyPct,
      done: dailyDone,
      reward: '+25 XP bonus',
      cta: dailyDone ? null : 'Start practice',
      onClick: () => setTab && setTab('cards'),
    },
    {
      id: 'cards-ten',
      Icon: BookOpen,
      iconBg: '#C9A961',
      title: 'Practice 10 cards today',
      desc: 'Complete cards to earn XP and keep Thai fresh.',
      progress: `${reviewsToday}/${cardsTarget} cards`,
      pct: cardsPct,
      done: cardsDone,
      reward: 'Rewards planned',
      cta: cardsDone ? null : 'Open cards',
      onClick: () => setTab && setTab('cards'),
    },
    {
      id: 'due-cards',
      Icon: CheckCircle2,
      iconBg: '#2E7D5B',
      title: 'Review your due cards',
      desc: due > 0
        ? `${due} card${due === 1 ? '' : 's'} waiting. Clear them to lock in mastery.`
        : 'No reviews due right now. Excellent.',
      progress: due > 0 ? `${due} due` : 'Cleared',
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
      desc: streakAlive
        ? `${stats.streak}-day streak. Study today to keep it.`
        : 'Build a streak by studying at least one card today.',
      progress: streakAlive ? `${stats.streak} days` : 'Start today',
      pct: streakPct,
      done: streakAlive,
      reward: 'Streak rewards planned',
      cta: streakAlive ? null : 'Study now',
      onClick: () => setTab && setTab('cards'),
    },
  ];

  const completed = quests.filter(q => q.done).length;

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
      </div>

      <section className="quests-future">
        <div className="quests-future-icon"><Award size={20} /></div>
        <div className="quests-future-body">
          <div className="quests-future-title">Weekly challenges and chests</div>
          <div className="quests-future-sub">
            Rewards are planned. Daily practice tracking is available now.
          </div>
        </div>
      </section>
    </div>
  );
}
