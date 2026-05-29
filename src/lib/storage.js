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
