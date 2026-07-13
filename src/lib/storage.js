// Persistence — uses localStorage for real persistence across sessions
const STORAGE_KEY = 'thai-fluency-state-v1';

// Anti-rushing guard. Kept in its OWN localStorage key (not the main state
// blob) so it survives refresh, route changes, leaving/returning to Practice,
// and short restarts — and is NOT wiped by clearState() on sign-out (otherwise
// sign-out/in would become an XP-farm reset vector). Device-local by design;
// the cap is an anti-abuse signal, not user content, so it does not sync to
// the cloud. Shape: { rushRun:number, lastRatingAt:number(ms epoch) }.
const RUSH_GUARD_KEY = 'thai-fluency-rush-guard-v1';

export function loadRushGuard() {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(RUSH_GUARD_KEY);
      if (raw) {
        const v = JSON.parse(raw);
        if (v && typeof v === 'object') {
          return {
            rushRun: Number.isFinite(v.rushRun) ? Math.max(0, v.rushRun) : 0,
            lastRatingAt: Number.isFinite(v.lastRatingAt) ? v.lastRatingAt : 0,
          };
        }
      }
    }
  } catch (e) { /* private mode or corrupt value - silent fail */ }
  return { rushRun: 0, lastRatingAt: 0 };
}

export function saveRushGuard(state) {
  try {
    if (typeof localStorage !== 'undefined') {
      const safe = {
        rushRun: Math.max(0, Number(state?.rushRun) || 0),
        lastRatingAt: Number(state?.lastRatingAt) || 0,
      };
      localStorage.setItem(RUSH_GUARD_KEY, JSON.stringify(safe));
    }
  } catch (e) { /* silent fail - must never crash the review loop */ }
}

// Per-card daily review-XP guard. Records which card ids have already paid out
// review XP on the current local day, so repeatedly rating the SAME card (e.g.
// rating "Again", which re-dues in ~1-10 min) cannot slowly farm XP. Like the
// rush guard, it is device-local and NOT synced (an anti-abuse signal, not user
// content) and survives refresh/route changes but resets each local day.
// Shape: { date: 'YYYY-MM-DD', ids: number[] }.
const REVIEW_XP_DAY_KEY = 'thai-fluency-review-xp-day-v1';

export function loadReviewXpDay() {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(REVIEW_XP_DAY_KEY);
      if (raw) {
        const v = JSON.parse(raw);
        if (v && typeof v === 'object' && typeof v.date === 'string' && Array.isArray(v.ids)) {
          return { date: v.date, ids: v.ids.filter(id => Number.isFinite(id)) };
        }
      }
    }
  } catch (e) { /* private mode or corrupt value - silent fail */ }
  return { date: null, ids: [] };
}

export function saveReviewXpDay(state) {
  try {
    if (typeof localStorage !== 'undefined') {
      const safe = {
        date: typeof state?.date === 'string' ? state.date : null,
        ids: Array.isArray(state?.ids) ? state.ids.filter(id => Number.isFinite(id)) : [],
      };
      localStorage.setItem(REVIEW_XP_DAY_KEY, JSON.stringify(safe));
    }
  } catch (e) { /* silent fail - must never crash the review loop */ }
}

// 18+ confirmation for the Dating & Real Talk section. Device-local age
// attestation (like the guards above, it is NOT user content): kept in its own
// key so clearState() on sign-out does not re-ask an adult on every login, and
// it never syncs to the cloud. Stores only { confirmedAt: ms epoch }.
const DATING_ADULT_KEY = 'thai-fluency-dating-adult-v1';

export function loadAdultConfirmed() {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(DATING_ADULT_KEY);
      if (raw) {
        const v = JSON.parse(raw);
        return !!(v && typeof v === 'object' && Number.isFinite(v.confirmedAt));
      }
    }
  } catch (e) { /* private mode or corrupt value - silent fail */ }
  return false;
}

export function saveAdultConfirmed() {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(DATING_ADULT_KEY, JSON.stringify({ confirmedAt: Date.now() }));
    }
  } catch (e) { /* silent fail - confirmation just won't persist */ }
}

// Per-category LESSON completion for the Dating & Real Talk section. The
// interactive quiz for a category is gated behind finishing that category's
// ungraded lesson at least once; this records which category lessons are done.
// Like the 18+ confirmation above it lives in its OWN key (so clearState() on
// sign-out never re-locks the lessons for a returning learner — the lesson is a
// "you've seen the teaching" marker, NOT XP/progress and NOT a farmable reward),
// is device-local, and never syncs to the cloud. Shape: { done: string[] }
// (category ids). No DB table, no migration, no server reward path.
const DATING_LESSONS_KEY = 'thai-fluency-dating-lessons-v1';

export function loadDatingLessonsDone() {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(DATING_LESSONS_KEY);
      if (raw) {
        const v = JSON.parse(raw);
        if (v && Array.isArray(v.done)) {
          return v.done.filter((id) => typeof id === 'string');
        }
      }
    }
  } catch (e) { /* private mode or corrupt value - silent fail */ }
  return [];
}

export function saveDatingLessonDone(catId) {
  if (typeof catId !== 'string' || !catId) return loadDatingLessonsDone();
  try {
    const done = new Set(loadDatingLessonsDone());
    done.add(catId);
    const next = Array.from(done);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(DATING_LESSONS_KEY, JSON.stringify({ done: next }));
    }
    return next;
  } catch (e) {
    /* silent fail - completion just won't persist this session */
    return loadDatingLessonsDone();
  }
}

export async function loadState() {
  try {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    }
  } catch (e) { /* private mode or quota - silent fail */ }
  return null;
}

export async function saveState(state) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  } catch (e) { /* silent fail - shouldn't crash app */ }
}

export async function clearState() {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (e) { /* silent */ }
}
