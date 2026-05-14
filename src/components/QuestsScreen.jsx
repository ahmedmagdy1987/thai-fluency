import React from 'react';
import { Target, Flame, BookOpen, CheckCircle2, Sparkles, Award } from 'lucide-react';
import { DEFAULT_DAILY_GOAL, XP_REWARDS } from '../data/gamification.js';

// Phase 1 quests — reads real stats where it can (today XP, streak, due
// cards) so the page already feels alive, but the rewards next to each
// quest are placeholders. Nothing here mutates progress beyond what the
// underlying lesson flow already does.
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
      desc: `Earn ${goal} XP in any combination of lessons, quizzes, or reviews.`,
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
      desc: 'Short and sweet — a quick session keeps the language warm.',
      progress: `${reviewsToday}/${cardsTarget} cards`,
      pct: cardsPct,
      done: cardsDone,
      reward: 'Coming: +15 gems',
      cta: cardsDone ? null : 'Open Cards',
      onClick: () => setTab && setTab('cards'),
    },
    {
      id: 'due-cards',
      Icon: CheckCircle2,
      iconBg: '#2E7D5B',
      title: 'Review your due cards',
      desc: due > 0
        ? `${due} card${due === 1 ? '' : 's'} are waiting — clear them to lock in mastery.`
        : 'No reviews due right now. Excellent.',
      progress: due > 0 ? `${due} due` : 'Cleared',
      pct: duePct,
      done: dueDone,
      reward: 'Keeps mastery moving',
      cta: due > 0 ? 'Review now' : null,
      onClick: () => setTab && setTab('cards'),
    },
    {
      id: 'streak',
      Icon: Flame,
      iconBg: '#E0823B',
      title: 'Keep your streak alive',
      desc: streakAlive
        ? `${stats.streak}-day streak going. Study today to keep it.`
        : 'Build a streak — study at least one card today.',
      progress: streakAlive ? `🔥 ${stats.streak} days` : 'Start today',
      pct: streakPct,
      done: streakAlive,
      reward: 'Coming: streak freeze drop',
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
          <div className="quests-hero-eyebrow">Daily quests · Preview</div>
          <h1 className="quests-hero-title">{completed > 0 ? `${completed} of ${quests.length} done today` : "Today's quests"}</h1>
          <p className="quests-hero-sub">
            Small daily goals tuned to your real progress. Full quest economy
            (chests, gem rewards, weekly challenges) ships in a later phase.
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
          <div className="quests-future-title">Weekly challenges, leaderboards, and chests are coming</div>
          <div className="quests-future-sub">
            We're keeping Phase 1 focused on real learning. Reward economy lands once we wire the supporting database tables.
          </div>
        </div>
      </section>
    </div>
  );
}
