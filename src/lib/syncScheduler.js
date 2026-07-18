// Debounced cloud-upload scheduler with flush-on-hide and retry-after-failure.
//
// Extracted from App.jsx (Wave 10) so the TIMING behavior is testable in plain
// node — the pre-Wave-10 inline debounce had a demonstrated data-loss window:
// uploads waited 2.5s after the last state change and nothing flushed them when
// the tab was hidden/closed, so a quick review session followed by closing the
// PWA (the typical streak-saving session) lost its final upload, and the next
// launch's cloud-authoritative merge visibly rolled XP/streak back.
//
// Semantics:
//   schedule(fn)  — remember fn as the latest upload thunk, mark dirty, and
//                   (re)start the debounce timer. Called on every state change,
//                   so fn always closes over the freshest progress/stats.
//   flush()       — if dirty and not already uploading, cancel timers and run
//                   the latest fn NOW. Wired to visibilitychange(hidden) /
//                   pagehide / online in App.jsx. Fire-and-forget safe.
//   reset()       — drop timers, dirty flag and fn. Called on identity change
//                   so a departed user's thunk can never fire for the next user.
//   cancel()      — drop timers only (unmount cleanup). Keeps dirty/fn so a
//                   later flush from a page-lifecycle event can still land.
//
// A failed upload keeps dirty=true and schedules one retry after retryMs; any
// newer schedule() or flush() supersedes it. No merge/conflict logic lives
// here — this changes WHEN the existing upload runs, never who wins a merge.
export function createSyncScheduler({ delayMs = 2500, retryMs = 30000 } = {}) {
  let timer = null;
  let retryTimer = null;
  let uploadFn = null;
  let dirty = false;
  let inFlight = false;

  const clearTimers = () => {
    if (timer) { clearTimeout(timer); timer = null; }
    if (retryTimer) { clearTimeout(retryTimer); retryTimer = null; }
  };

  const run = async () => {
    if (!dirty || inFlight || !uploadFn) return;
    const fn = uploadFn;
    inFlight = true;
    try {
      await fn();
      // Only clear dirty if no NEWER schedule() arrived while uploading —
      // a change made mid-upload still deserves its own upload.
      if (uploadFn === fn) dirty = false;
    } catch {
      // Upload failed (offline, auth blip). Stay dirty; retry once after
      // retryMs unless something newer reschedules first.
      if (!retryTimer) {
        retryTimer = setTimeout(() => { retryTimer = null; run(); }, retryMs);
      }
    } finally {
      inFlight = false;
    }
  };

  return {
    schedule(fn) {
      uploadFn = fn;
      dirty = true;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => { timer = null; run(); }, delayMs);
    },
    flush() {
      if (!dirty || inFlight) return;
      clearTimers();
      return run();
    },
    cancel() {
      clearTimers();
    },
    reset() {
      clearTimers();
      uploadFn = null;
      dirty = false;
    },
    get dirty() { return dirty; },
  };
}
