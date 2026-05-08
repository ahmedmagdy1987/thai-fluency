// SM-2 spaced repetition algorithm
// rating: 1=Again, 2=Hard, 3=Good, 4=Easy

export const DAY_MS = 24 * 60 * 60 * 1000;

export function reviewCard(state, rating) {
  const now = Date.now();
  const isNew = !state;

  if (isNew) {
    // First exposure — short learning intervals
    if (rating === 1) return { lastReview: now, nextDue: now + 1 * 60 * 1000, interval: 0, ease: 2.5, reviews: 1, lapses: 0, learning: true };
    if (rating === 2) return { lastReview: now, nextDue: now + 10 * 60 * 1000, interval: 0, ease: 2.5, reviews: 1, lapses: 0, learning: true };
    if (rating === 3) return { lastReview: now, nextDue: now + 1 * DAY_MS, interval: 1, ease: 2.5, reviews: 1, lapses: 0, learning: false };
    if (rating === 4) return { lastReview: now, nextDue: now + 4 * DAY_MS, interval: 4, ease: 2.6, reviews: 1, lapses: 0, learning: false };
  }

  let { interval, ease, reviews, lapses, learning } = state;
  reviews += 1;

  if (rating === 1) {
    // Lapse — reset to learning
    return { lastReview: now, nextDue: now + 10 * 60 * 1000, interval: 0, ease: Math.max(1.3, ease - 0.2), reviews, lapses: lapses + 1, learning: true };
  }

  if (learning) {
    if (rating === 2) return { lastReview: now, nextDue: now + 1 * DAY_MS, interval: 1, ease, reviews, lapses, learning: false };
    if (rating === 3) return { lastReview: now, nextDue: now + 1 * DAY_MS, interval: 1, ease, reviews, lapses, learning: false };
    if (rating === 4) return { lastReview: now, nextDue: now + 4 * DAY_MS, interval: 4, ease: ease + 0.1, reviews, lapses, learning: false };
  }

  // Mature card — apply ease modifier
  let nextInterval;
  if (rating === 2) { nextInterval = Math.max(1, Math.round(interval * 1.2)); ease = Math.max(1.3, ease - 0.15); }
  else if (rating === 3) { nextInterval = Math.round(interval * ease); }
  else { nextInterval = Math.round(interval * ease * 1.3); ease = ease + 0.15; }

  return { lastReview: now, nextDue: now + nextInterval * DAY_MS, interval: nextInterval, ease, reviews, lapses, learning: false };
}

export function getDueCards(progress, allCards, now) {
  return allCards
    .filter(c => progress[c.id] && progress[c.id].nextDue <= now)
    .sort((a, b) => progress[a.id].nextDue - progress[b.id].nextDue);
}

export function getNewCards(progress, allCards, limit = 10) {
  // Cards user hasn't seen yet — group by stage so earlier stages come first,
  // shuffled within stage with a daily seed for variety.
  const unseen = allCards.filter(c => !progress[c.id]);
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const seededRand = (i) => {
    const x = Math.sin(seed + i) * 10000;
    return x - Math.floor(x);
  };
  const byStage = {};
  unseen.forEach(c => {
    const st = c.stage || 1;
    if (!byStage[st]) byStage[st] = [];
    byStage[st].push({ c, key: seededRand(c.id) });
  });
  const ordered = [];
  Object.keys(byStage).map(Number).sort((a, b) => a - b).forEach(st => {
    byStage[st].sort((a, b) => a.key - b.key).forEach(x => ordered.push(x.c));
  });
  return ordered.slice(0, limit);
}

export function getStats(progress, allCards) {
  const total = allCards.length;
  const seen = Object.keys(progress).length;
  const mature = Object.values(progress).filter(c => c.interval >= 21).length;
  const now = Date.now();
  const due = allCards.filter(c => progress[c.id] && progress[c.id].nextDue <= now).length;
  const newAvail = allCards.filter(c => !progress[c.id]).length;
  return { total, seen, mature, due, newAvail };
}

export function intervalLabel(state, rating) {
  // What interval would we get for this rating?
  if (!state) {
    if (rating === 1) return '<1m';
    if (rating === 2) return '10m';
    if (rating === 3) return '1d';
    if (rating === 4) return '4d';
  }
  if (rating === 1) return '10m';
  const hypothetical = reviewCard(state, rating);
  const days = Math.round((hypothetical.nextDue - Date.now()) / DAY_MS);
  if (days < 1) return '<1d';
  if (days < 30) return `${days}d`;
  if (days < 365) return `${Math.round(days / 30)}mo`;
  return `${(days / 365).toFixed(1)}y`;
}
