// Deterministic, conservative merge of LOCAL and CLOUD state at sign-in (M2).
//
// The bug this fixes: on sign-in the app replaced local state with cloud
// (`setProgress(cloud)` + spreading cloud stats over local). A user who studied
// anonymously/offline and then signed into an account that already had cloud data
// silently lost their local SRS progress, completed lessons, achievements, etc.
//
// SAFETY INVARIANTS (this file never violates them):
//   • Merging NEVER grants a reward. It only combines already-earned state; XP is
//     awarded exclusively through the gameplay reward paths, never at load. So a
//     merge can never create a reward_event or bump XP by itself.
//   • XP stays CLOUD-authoritative unconditionally — local values are never added
//     on top (no double-count) and a forged-high local value can never raise it.
//   • Currency / purchased goods / streak / today are CLOUD-authoritative too,
//     EXCEPT when the cloud row is provably stale (isCloudStatsStale): a row that
//     has not advanced since this device last synced cannot contain the user's
//     latest actions, so it must not overwrite them. Staleness is judged on the
//     server-written `user_stats.updated_at`, which a client cannot forge, and the
//     server-side `guard_user_stats` trigger still clamps every write. See
//     lib/statsFieldPolicy.js for why this opens no forgery hole.
//   • Super/entitlement is NOT handled here at all. Tier comes only from
//     subscriptions.super_until (applied separately by the caller). Merged output
//     deliberately omits tier/superUntil so local can never grant Super.
//   • Learning progress is preserved from BOTH sides: no card is dropped, review
//     counts and lapse history never decrease, a graduated card never un-graduates,
//     and completed lessons/achievements are unioned (completed/unlocked wins).

import {
  FIELD_CLASS, STATS_FIELD_POLICY, OWNED_FIELDS, fieldsOfClass,
} from './statsFieldPolicy.js';

function num(v) { return Number.isFinite(v) ? v : 0; }

// Fields present on either side that nobody registered in statsFieldPolicy.js.
// They resolve as OWNED (protective) so an unregistered field can never be
// silently destroyed by a stale cloud row — the failure mode is "too careful",
// never "lost the user's data". check-merge-staleness.mjs fails CI on any such
// field, so this path should stay empty in practice.
function unregisteredFieldsIn(local, cloud) {
  const out = [];
  for (const k of new Set([...Object.keys(local || {}), ...Object.keys(cloud || {})])) {
    if (k === 'cloudUpdatedAt') continue;   // transport metadata, not user state
    if (!(k in STATS_FIELD_POLICY)) out.push(k);
  }
  return out;
}
function unionIds(a, b) {
  return [...new Set([...(Array.isArray(a) ? a : []), ...(Array.isArray(b) ? b : [])])];
}

// ── Mastery-rank merge (class MAX, per-card) ─────────────────────────────────
// `masteryRank` is a NEW sibling map in stats ({ [cardId]: 0|1|2|3 }) recording
// the derived mastery overlay (taught→recognized→produced→spoken). It lives
// OUTSIDE the SRS card object (mergeCard is untouched). Merge = element-wise
// Math.max over the union of card ids: monotonic and non-rewarding, so a merge
// can never grant a reward or a tier and never downgrades a learner's depth —
// identical policy to interval/reviews/currentStage (the STATS_MAX counters).
// Never routed through tier (mergeStats deletes tier/superUntil below).
export function mergeMasteryRank(localMap, cloudMap) {
  const l = localMap && typeof localMap === 'object' ? localMap : {};
  const c = cloudMap && typeof cloudMap === 'object' ? cloudMap : {};
  const out = {};
  const ids = new Set([...Object.keys(l), ...Object.keys(c)]);
  for (const id of ids) out[id] = Math.max(num(l[id]), num(c[id]));
  return out;
}

// ── Per-card SRS merge ───────────────────────────────────────────────────────
// "More advanced" is ordered by review count, then interval (mastery / how far
// out it is scheduled), then most-recent study. The dominant entry supplies the
// coherent SRS schedule (ease/interval/nextDue/lastReview); review count and lapse
// history are taken as the max of both sides so neither can decrease; and the card
// is treated as graduated if EITHER side had graduated it.
function advancementScore(e) {
  return [num(e.reviews), num(e.interval), num(e.lastReview)];
}
function dominant(a, b) {
  const sa = advancementScore(a);
  const sb = advancementScore(b);
  for (let i = 0; i < sa.length; i++) {
    if (sa[i] !== sb[i]) return sa[i] > sb[i] ? a : b;
  }
  return a; // fully tied → local (a) is fine; fields below are symmetric anyway
}
export function mergeCard(local, cloud) {
  if (!local) return cloud;
  if (!cloud) return local;
  const dom = dominant(local, cloud);
  // Graduated = has been reviewed at least once and is no longer in the learning
  // phase. If either side graduated the card, the merged card stays graduated.
  const graduated = (num(local.reviews) > 0 && local.learning === false)
    || (num(cloud.reviews) > 0 && cloud.learning === false);
  return {
    ease: dom.ease ?? 2.5,
    interval: Math.max(num(local.interval), num(cloud.interval)),
    reviews: Math.max(num(local.reviews), num(cloud.reviews)),
    lapses: Math.max(num(local.lapses), num(cloud.lapses)),
    learning: graduated ? false : !!dom.learning,
    // Keep the later due date: the more-advanced schedule wins and reviews/lapses
    // are preserved independently, so a later nextDue never erases reviewed state.
    nextDue: Math.max(num(local.nextDue), num(cloud.nextDue)),
    lastReview: Math.max(num(local.lastReview), num(cloud.lastReview)),
  };
}

// Merge two whole progress maps ({ [cardId]: srsState }). Union of card ids; each
// shared card merged by mergeCard. Never drops a card from either side.
export function mergeProgress(local, cloud) {
  const safeLocal = local && typeof local === 'object' ? local : {};
  const safeCloud = cloud && typeof cloud === 'object' ? cloud : {};
  const out = {};
  const ids = new Set([...Object.keys(safeLocal), ...Object.keys(safeCloud)]);
  for (const id of ids) out[id] = mergeCard(safeLocal[id], safeCloud[id]);
  return out;
}

// ── Stats merge ──────────────────────────────────────────────────────────────
// Field rules live in ONE place: lib/statsFieldPolicy.js. NOTHING is classified
// by omission any more — that default was the Wave 12 root cause. An unregistered
// field resolves as OWNED (protective), and check-merge-staleness.mjs fails CI if
// any reachable field is missing from the registry.
//
// The classes are CLOUD / MAX / OR / UNION / OWNED / DEVICE; see the registry for
// what each means and for the per-field rationale.
//
// DERIVED from the registry — lib/statsFieldPolicy.js is the single source of
// truth for field classes. These exports remain for the validators and for
// readability at the call sites below; they are no longer independently edited,
// so the lists and the policy can never drift apart (Wave 12, root cause 2).
export const STATS_MAX = fieldsOfClass(FIELD_CLASS.MAX);
export const STATS_OR = fieldsOfClass(FIELD_CLASS.OR);
export const STATS_UNION = fieldsOfClass(FIELD_CLASS.UNION);

// The cloud-authoritative class — cloud wins EVEN WHEN THE ROW IS STALE. This is
// now a real behavioural class, not documentation: it is the set the staleness
// fallback deliberately does NOT touch, so it is the anti-forgery core.
// `totalXp` and `lastXpActivityAt` are here because earned XP is the highest-value
// forgery target; `identityPath` and `dailyGoal` are account-level PREFERENCES
// (engagement.md §2.1/§9), never rewards, so local must not raise them.
//
// Note the omission semantics that keep preferences safe: when cloud has no
// identityPath the merged patch omits the key entirely (rather than setting it to
// undefined), so spreading the patch leaves an anonymous learner's choice intact.
//
// Currency, purchased goods, the live streak and today's progress are NO LONGER in
// this class — they are OWNED (see statsFieldPolicy.js), which is what stops a
// stale row from destroying a completed purchase.
export const STATS_CLOUD_AUTH = fieldsOfClass(FIELD_CLASS.CLOUD);

// The user-owned class: cloud wins normally, LOCAL wins when the cloud row is
// provably stale. Re-exported so validators can assert the class of each field.
export const STATS_OWNED = OWNED_FIELDS;

// ── Staleness (Wave 12, root cause 1) ────────────────────────────────────────
// THE CLASS OF BUG THIS KILLS: the merge had no concept of which side was newer,
// so a cloud row from before the user's latest actions silently overwrote them.
// A completed purchase (930 gems → 31 streak freezes) was destroyed exactly this
// way when an old row was merged back in during entitlement activation.
//
// The signal is `user_stats.updated_at`. It is written by the server trigger
// `set_user_stats_updated_at` (supabase/schema.sql:235-238 → set_updated_at()
// does `new.updated_at = now()`), so it is SERVER time and a client cannot forge
// it — whatever the client sends is overwritten. downloadStats already fetches it
// (`select('*')`); it is now surfaced as `cloudUpdatedAt`.
//
// The cloud row is STALE for this device when BOTH hold:
//   (a) this device has local writes it has not yet successfully uploaded, and
//   (b) the cloud row has NOT advanced since this device last synced.
// (b) is what keeps another device's newer write authoritative: if the row moved,
// it is not stale and cloud authority applies unchanged.
//
// `sync` is { dirty: boolean, lastSyncedCloudUpdatedAt: string|null }. When it is
// absent (anonymous, or no watermark recorded yet) the answer is FALSE — the
// conservative, pre-Wave-12 behaviour.
export function isCloudStatsStale(cloud, sync) {
  if (!sync || !sync.dirty) return false;              // nothing local to protect
  const seen = sync.lastSyncedCloudUpdatedAt || null;
  if (!seen) return false;                             // never synced → cannot compare
  const cloudAt = (cloud && cloud.cloudUpdatedAt) || null;
  if (!cloudAt) return false;                          // no server timestamp → don't guess
  const cloudMs = Date.parse(cloudAt);
  const seenMs = Date.parse(seen);
  if (!Number.isFinite(cloudMs) || !Number.isFinite(seenMs)) return false;
  // Row has not advanced past what we already merged → it cannot hold our writes.
  return cloudMs <= seenMs;
}

// Merge cloud stats INTO local stats. Cloud is the authority base; local
// contributes MAX counters, OR flags, UNION ledgers, and — when the cloud row is
// provably STALE — the OWNED fields (currency, purchased goods, live streak,
// today's progress). Returns a stats patch to spread over the current stats.
// Never includes tier/superUntil (entitlement is applied separately by the
// caller). `cloud` is the object from downloadStats(); `sync` is the local sync
// watermark (see lib/syncWatermark.js).
//
// Field classes live in ONE place — lib/statsFieldPolicy.js. Nothing is
// classified by omission any more, and an UNREGISTERED field resolves as OWNED
// (protective) rather than cloud-authoritative, so a field nobody remembered to
// register can no longer be silently destroyed.
export function mergeStats(local, cloud, sync = null) {
  const l = local && typeof local === 'object' ? local : {};
  const c = cloud && typeof cloud === 'object' ? cloud : {};
  // Start from cloud so every cloud-authoritative field wins by default.
  const out = { ...c };
  for (const k of STATS_MAX) out[k] = Math.max(num(l[k]), num(c[k]));
  for (const k of STATS_OR) out[k] = !!l[k] || !!c[k];
  for (const k of STATS_UNION) out[k] = unionIds(l[k], c[k]);

  // Stale cloud row → OWNED fields fall back to local, which is strictly newer.
  // Absolute local values are taken (never deltas), so this is idempotent: a
  // merge that runs twice cannot double-apply a spend or double-grant a purchase.
  if (isCloudStatsStale(c, sync)) {
    const ownedNow = new Set([...OWNED_FIELDS, ...unregisteredFieldsIn(l, c)]);
    for (const k of ownedNow) {
      if (k in l && l[k] !== undefined) out[k] = l[k];
    }
  }
  // The server timestamp is transport metadata, not user state — never persist it
  // into the stats blob.
  delete out.cloudUpdatedAt;
  // Mastery overlay: per-card MAX merge (monotonic, non-rewarding). Only emit a
  // merged map when either side actually has one, so untouched stats stay clean.
  if ((l.masteryRank && typeof l.masteryRank === 'object') || (c.masteryRank && typeof c.masteryRank === 'object')) {
    out.masteryRank = mergeMasteryRank(l.masteryRank, c.masteryRank);
  }
  // Guard: entitlement fields must never be carried by a stats merge.
  delete out.tier;
  delete out.superUntil;
  delete out.cancelAtPeriodEnd;
  return out;
}

// ── Cloud profile-settings merge ─────────────────────────────────────────────
// profiles.settings holds account-level preferences AND a few learning ledgers.
// UI preferences are account-synced (cloud wins, existing behavior). Learning
// ledgers must UNION (a completed lesson/watched cinematic is never un-completed),
// and once-true flags OR. Returns a patch to spread over local stats.
const SETTINGS_UNION = ['completedMiniUnits', 'builderRewardedUnits', 'celebratedIds', 'cinematicsWatched'];
const SETTINGS_OR = ['firstLessonCompleted', 'celebrationBaselineDone', 'tutorialSeen'];
export function mergeCloudSettings(localStats, cloudSettings) {
  const l = localStats && typeof localStats === 'object' ? localStats : {};
  const c = cloudSettings && typeof cloudSettings === 'object' ? cloudSettings : {};
  const out = { ...c }; // UI prefs: cloud (account) wins
  for (const k of SETTINGS_UNION) {
    if (Array.isArray(l[k]) || Array.isArray(c[k])) out[k] = unionIds(l[k], c[k]);
  }
  for (const k of SETTINGS_OR) {
    if (k in l || k in c) out[k] = !!l[k] || !!c[k];
  }
  return out;
}
