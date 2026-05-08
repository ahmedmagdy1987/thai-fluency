// Persistence — uses localStorage for real persistence across sessions
const STORAGE_KEY = 'thai-fluency-state-v1';

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
