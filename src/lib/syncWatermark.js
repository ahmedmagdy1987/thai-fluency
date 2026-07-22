// ─────────────────────────────────────────────────────────────────────────────
// SYNC WATERMARK — the local half of the staleness signal (Wave 12, root cause 1).
//
// progressMerge.isCloudStatsStale needs two facts that only this device knows:
//
//   dirty                    — this device has stats writes it has not yet
//                              successfully uploaded.
//   lastSyncedCloudUpdatedAt — the server `updated_at` this device observed the
//                              last time it successfully synced.
//
// Together with the server-written `user_stats.updated_at` those decide whether a
// cloud row can possibly contain the user's latest actions. If the row has NOT
// advanced past what we already merged AND we still hold unsynced writes, the row
// is stale and must not overwrite user-owned state.
//
// WHY THIS IS DEVICE-SCOPED AND NEVER SYNCED: it describes this device's
// relationship to the cloud row, not the user's progress. Uploading it would be
// meaningless (and would let one device's watermark mislead another). It lives in
// its own localStorage key, outside the main state blob, and is cleared on sign
// out / identity change so a new user can never inherit it.
//
// FORGERY NOTE: this file holds no user value and grants nothing. The worst a
// tampered watermark can do is make the client prefer its own local numbers on the
// next merge — numbers the client could upload directly anyway, and which the
// server trigger `guard_user_stats` clamps on write regardless. The value that
// actually decides staleness (`updated_at`) is server-written and unforgeable.
// ─────────────────────────────────────────────────────────────────────────────

const WATERMARK_KEY = 'thai-fluency-sync-watermark-v1';

const EMPTY = Object.freeze({ dirty: false, lastSyncedCloudUpdatedAt: null, userId: null });

export function loadSyncWatermark() {
  try {
    if (typeof localStorage === 'undefined') return { ...EMPTY };
    const raw = localStorage.getItem(WATERMARK_KEY);
    if (!raw) return { ...EMPTY };
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return { ...EMPTY };
    return {
      dirty: !!parsed.dirty,
      lastSyncedCloudUpdatedAt: typeof parsed.lastSyncedCloudUpdatedAt === 'string'
        ? parsed.lastSyncedCloudUpdatedAt
        : null,
      userId: typeof parsed.userId === 'string' ? parsed.userId : null,
    };
  } catch {
    return { ...EMPTY };
  }
}

function write(next) {
  try {
    if (typeof localStorage === 'undefined') return next;
    localStorage.setItem(WATERMARK_KEY, JSON.stringify(next));
  } catch { /* quota/private mode — staleness simply stays conservative */ }
  return next;
}

// A local stats write happened. Cheap and idempotent: once dirty, stays dirty
// until an upload confirms.
export function markStatsDirty(userId = null) {
  const cur = loadSyncWatermark();
  if (cur.dirty && cur.userId === (userId || cur.userId)) return cur;
  // A watermark belongs to ONE user. When this write is for a DIFFERENT identity
  // than the stored one, the stored cloud timestamp describes SOMEONE ELSE'S row.
  // Carrying it forward under the new id would launder it past syncWatermarkFor's
  // identity guard (which only neutralises a watermark whose userId still differs),
  // and the new user's genuine cloud row would then be judged STALE — destroying
  // their real stats. Drop it: a null timestamp means "cannot compare", which is
  // the conservative, pre-Wave-12 answer.
  const foreignIdentity = !!(userId && cur.userId && cur.userId !== userId);
  return write({
    ...cur,
    dirty: true,
    userId: userId || cur.userId,
    lastSyncedCloudUpdatedAt: foreignIdentity ? null : cur.lastSyncedCloudUpdatedAt,
  });
}

// An uploadStats call SUCCEEDED. The cloud row now reflects everything local had
// at the moment the upload started, so we are clean again. `cloudUpdatedAt` is the
// server timestamp of the row we just wrote (re-read after the write); when it is
// unavailable we keep the previous watermark rather than guessing.
export function markStatsSynced(userId, cloudUpdatedAt) {
  const cur = loadSyncWatermark();
  // Same identity rule as markStatsDirty: never inherit a timestamp recorded for a
  // different user. Falling back to `cur` across an identity boundary would re-label
  // the departed user's row version as this user's.
  const foreignIdentity = !!(userId && cur.userId && cur.userId !== userId);
  return write({
    dirty: false,
    lastSyncedCloudUpdatedAt: cloudUpdatedAt || (foreignIdentity ? null : cur.lastSyncedCloudUpdatedAt) || null,
    userId: userId || cur.userId || null,
  });
}

// A merge just consumed a cloud row. Record the row's server timestamp so the NEXT
// merge can tell whether the row has advanced since. Does not change `dirty`.
export function recordMergedCloudUpdatedAt(userId, cloudUpdatedAt) {
  if (!cloudUpdatedAt) return loadSyncWatermark();
  const cur = loadSyncWatermark();
  // Same identity rule as markStatsDirty/markStatsSynced, so all three writers obey
  // it uniformly: a record left by a DIFFERENT user carries that user's `dirty`
  // flag. Inheriting it would let this user claim unsynced writes they never made,
  // and so judge their OWN cloud row stale on the next merge.
  const foreignIdentity = !!(userId && cur.userId && cur.userId !== userId);
  return write({
    ...(foreignIdentity ? { dirty: false } : cur),
    lastSyncedCloudUpdatedAt: cloudUpdatedAt,
    userId: userId || cur.userId || null,
  });
}

// Identity change / sign-out. A watermark belongs to one user on one device.
export function clearSyncWatermark() {
  try {
    if (typeof localStorage !== 'undefined') localStorage.removeItem(WATERMARK_KEY);
  } catch { /* ignore */ }
  return { ...EMPTY };
}

// Guard against a watermark left behind by a different user on this device.
export function syncWatermarkFor(userId) {
  const cur = loadSyncWatermark();
  if (!userId || !cur.userId || cur.userId !== userId) {
    return { dirty: cur.dirty, lastSyncedCloudUpdatedAt: null, userId: cur.userId };
  }
  return cur;
}
