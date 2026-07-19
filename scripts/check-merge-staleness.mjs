// ─────────────────────────────────────────────────────────────────────────────
// MERGE STALENESS + FIELD-POLICY guard (Wave 12, root cause 1).
//
// THE CLASS OF BUG THIS MAKES IMPOSSIBLE TO REINTRODUCE:
// mergeStats used to build `{ ...cloud }` and overlay only three named lists, so
// any field NOT in a list was cloud-authoritative BY OMISSION. A stale cloud row
// therefore destroyed fresher local state, and every newly added field inherited
// the bug silently. That is how 31 streak freezes bought for 930 gems reverted to
// 933 gems / 0 freezes when an old row was merged back in during Super activation.
//
// This guard enforces, executably:
//   (1) DEFAULT-SAFETY BY REGISTRATION — every stats field reachable from
//       DEFAULT_STATS or from the cloud upload/download mappings is classified in
//       lib/statsFieldPolicy.js. A field nobody registered FAILS THE BUILD. This is
//       the "a future field nobody remembered" case.
//   (2) DEFAULT-SAFETY AT RUNTIME — an unregistered field still resolves
//       protectively (as OWNED), so even if (1) were somehow bypassed the merge
//       cannot silently clobber it.
//   (3) STALENESS SEMANTICS — a stale cloud row never overwrites OWNED state; a
//       cloud row that HAS advanced still wins (another device's newer write);
//       a clean device still yields to cloud.
//   (4) ANTI-FORGERY — the CLOUD class (earned XP, account preferences) never
//       takes a local value under ANY condition, and entitlement never rides a
//       stats merge.
//   (5) IDEMPOTENCE — merging twice cannot double-apply a purchase.
//
// It drives the REAL merge from src/lib/progressMerge.js — no reimplementation.
// ─────────────────────────────────────────────────────────────────────────────

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { mergeStats, isCloudStatsStale, STATS_MAX, STATS_OR, STATS_UNION, STATS_CLOUD_AUTH, STATS_OWNED } from '../src/lib/progressMerge.js';
import { STATS_FIELD_POLICY, FIELD_CLASS, DEFAULT_CLASS, classOf } from '../src/lib/statsFieldPolicy.js';
import { DEFAULT_STATS } from '../src/lib/stats.js';
import { FREEZE_COST_GEMS, MAX_BANKED_FREEZES, buyStreakFreezeWithGems } from '../src/lib/economy.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
let failures = 0;
const assert = (label, cond, extra = '') => {
  if (cond) console.log(`OK   ${label}`);
  else { failures += 1; console.error(`FAIL ${label}${extra ? ' — ' + extra : ''}`); }
};

// ── (1) Every reachable field is registered ─────────────────────────────────
// Sources of truth for "what fields exist": the local default shape, plus BOTH
// directions of the cloud mapping (a field can enter stats from either).
const cloudSrc = readFileSync(join(ROOT, 'src/lib/cloudStorage.js'), 'utf8');

// downloadStats maps snake_case columns onto camelCase stats keys: `camelKey: data.x`
const downloadKeys = [...cloudSrc.matchAll(/^\s{4}([a-zA-Z][a-zA-Z0-9]*)\s*:\s*(?:!!)?(?:Number\.isFinite\()?data\./gm)]
  .map(m => m[1]);
// uploadStats reads stats.<key>. Scope the scan to that function's body so prose
// like "lib/stats.js" elsewhere in the file cannot masquerade as a field.
const uploadBody = cloudSrc.slice(
  cloudSrc.indexOf('export async function uploadStats'),
  cloudSrc.indexOf('export async function downloadStats'),
);
const uploadKeys = [...uploadBody.matchAll(/stats\.([a-zA-Z][a-zA-Z0-9]*)/g)].map(m => m[1]);

const reachable = new Set([
  ...Object.keys(DEFAULT_STATS),
  ...downloadKeys,
  ...uploadKeys,
]);
// Transport metadata, not user state — explicitly not a policy field.
reachable.delete('cloudUpdatedAt');

assert('(1) the download mapping was actually parsed (guard against a silent regex miss)',
  downloadKeys.length > 20, `parsed ${downloadKeys.length} keys`);
assert('(1) the upload mapping was actually parsed',
  uploadKeys.length > 20, `parsed ${uploadKeys.length} keys`);

const unregistered = [...reachable].filter(k => !(k in STATS_FIELD_POLICY)).sort();
assert('(1) EVERY reachable stats field is classified in statsFieldPolicy.js (no field is classified by omission)',
  unregistered.length === 0,
  unregistered.length ? `unregistered: ${unregistered.join(', ')} — add them to STATS_FIELD_POLICY with a deliberate class` : '');

// Classes must be disjoint and complete.
const classes = new Set(Object.values(FIELD_CLASS));
const badClass = Object.entries(STATS_FIELD_POLICY).filter(([, v]) => !classes.has(v));
assert('(1) every registered field has a valid class', badClass.length === 0,
  badClass.map(([k, v]) => `${k}=${v}`).join(', '));
assert('(1) the derived lists are disjoint',
  STATS_CLOUD_AUTH.every(k => !STATS_MAX.includes(k) && !STATS_OR.includes(k) && !STATS_UNION.includes(k) && !STATS_OWNED.includes(k)));
assert('(1) the OWNED class is non-empty and contains the purchased-goods fields',
  ['gems', 'streakFreezes', 'hearts'].every(k => STATS_OWNED.includes(k)));
assert('(1) totalXp is CLOUD class (the anti-forgery core is not weakened)',
  classOf('totalXp') === FIELD_CLASS.CLOUD);

// ── (2) The protective default ───────────────────────────────────────────────
assert('(2) the DEFAULT class for an unregistered field is OWNED (protective, not cloud-clobber)',
  DEFAULT_CLASS === FIELD_CLASS.OWNED);
assert('(2) classOf() returns the protective default for an unknown field',
  classOf('some_field_invented_in_2027') === FIELD_CLASS.OWNED);

const T0 = '2026-07-18T10:00:00.000Z';
const LATER = '2026-07-18T12:00:00.000Z';
const dirtySync = { dirty: true, lastSyncedCloudUpdatedAt: T0 };

{
  const local = { brandNewField: 'local-value' };
  const cloud = { brandNewField: 'stale-cloud-value', cloudUpdatedAt: T0 };
  const m = mergeStats(local, cloud, dirtySync);
  assert('(2) an UNREGISTERED field is protected from a stale cloud row at runtime',
    m.brandNewField === 'local-value', JSON.stringify(m));
}

// ── (3) Staleness semantics, driven with the owner's real numbers ───────────
// Cloud row as it stood before the spending spree; it never advanced because the
// uploader was disarmed after a failed cloud init.
const cloudRow = () => ({
  totalXp: 5000, streak: 12, gems: 933, streakFreezes: 0, hearts: 5,
  todayXp: 40, todayDate: '2026-07-18', longestStreak: 12, cloudUpdatedAt: T0,
});

// The owner's ACTUAL reported end state, reconstructed directly. It is built by
// hand rather than by 31 calls to buyStreakFreezeWithGems because Wave 12's cap
// now makes 31 purchases impossible — but the state exists in the wild on his
// account, and the merge must protect balances it would no longer sell.
const spent = { ...cloudRow(), gems: 933 - 31 * FREEZE_COST_GEMS, streakFreezes: 31 };
delete spent.cloudUpdatedAt;
assert('(3) setup: the reported end state is exactly 933 - 31 x FREEZE_COST_GEMS',
  spent.gems === 3 && spent.streakFreezes === 31 && FREEZE_COST_GEMS === 30,
  `gems=${spent.gems} freezes=${spent.streakFreezes} cost=${FREEZE_COST_GEMS}`);

// The cap is enforced in the PURCHASE PATH, so the run-up can never recur — and
// it never reduces a balance a user already holds.
{
  let walk = { gems: 933, streakFreezes: 0 };
  let bought = 0;
  for (let i = 0; i < 40; i++) {
    const patch = buyStreakFreezeWithGems(walk);
    if (!patch) break;
    walk = { ...walk, ...patch };
    bought += 1;
  }
  assert('(3) the freeze cap stops the run-up in the purchase path (not just the UI)',
    bought === MAX_BANKED_FREEZES && walk.streakFreezes === MAX_BANKED_FREEZES,
    `bought=${bought} freezes=${walk.streakFreezes} cap=${MAX_BANKED_FREEZES}`);
  assert('(3) a user already above the cap keeps what they have (the cap never confiscates)',
    buyStreakFreezeWithGems({ gems: 999, streakFreezes: 31 }) === null);
}

assert('(3) isCloudStatsStale is TRUE when local is dirty and the row has not advanced',
  isCloudStatsStale(cloudRow(), dirtySync) === true);

{
  const m = mergeStats(spent, cloudRow(), dirtySync);
  assert('(3) THE BUG: a stale cloud row no longer destroys purchased gems/freezes',
    m.gems === 3 && m.streakFreezes === 31, `gems=${m.gems} freezes=${m.streakFreezes}`);
}
{
  // Another device wrote later → NOT stale → cloud authority is preserved.
  const advanced = { ...cloudRow(), gems: 500, streakFreezes: 2, cloudUpdatedAt: LATER };
  assert('(3) a cloud row that HAS advanced is not stale', isCloudStatsStale(advanced, dirtySync) === false);
  const m = mergeStats(spent, advanced, dirtySync);
  assert('(3) a newer cloud row still wins (another device is authoritative)',
    m.gems === 500 && m.streakFreezes === 2, `gems=${m.gems} freezes=${m.streakFreezes}`);
}
{
  const m = mergeStats(spent, cloudRow(), { dirty: false, lastSyncedCloudUpdatedAt: T0 });
  assert('(3) a CLEAN device still yields to cloud (nothing local to protect)',
    m.gems === 933 && m.streakFreezes === 0, `gems=${m.gems}`);
}
{
  const noTs = cloudRow(); delete noTs.cloudUpdatedAt;
  assert('(3) with no server timestamp the merge is conservative (cloud wins)',
    isCloudStatsStale(noTs, dirtySync) === false && mergeStats(spent, noTs, dirtySync).gems === 933);
}
{
  assert('(3) with no watermark at all the merge is conservative (pre-Wave-12 behaviour)',
    isCloudStatsStale(cloudRow(), null) === false && mergeStats(spent, cloudRow(), null).gems === 933);
  assert('(3) a device that never synced cannot claim staleness',
    isCloudStatsStale(cloudRow(), { dirty: true, lastSyncedCloudUpdatedAt: null }) === false);
}

// ── (4) Anti-forgery ────────────────────────────────────────────────────────
{
  const forged = { ...spent, totalXp: 999999, lastXpActivityAt: '2099-01-01', dailyGoal: 1 };
  const m = mergeStats(forged, cloudRow(), dirtySync);
  assert('(4) a forged-high local totalXp NEVER wins, even against a stale row',
    m.totalXp === 5000, `totalXp=${m.totalXp}`);
  for (const k of STATS_CLOUD_AUTH) {
    const cloud = { ...cloudRow(), [k]: 'CLOUD_VALUE' };
    const mm = mergeStats({ ...spent, [k]: 'LOCAL_FORGED' }, cloud, dirtySync);
    if (mm[k] !== 'CLOUD_VALUE') {
      failures += 1;
      console.error(`FAIL (4) CLOUD-class field '${k}' took a local value under staleness`);
    }
  }
  assert('(4) every CLOUD-class field resists a local value under staleness', true);
}
{
  const m = mergeStats({ ...spent, tier: 'super', superUntil: '2099-01-01', cancelAtPeriodEnd: true }, cloudRow(), dirtySync);
  assert('(4) entitlement never rides a stats merge (tier/superUntil/cancelAtPeriodEnd stripped)',
    !('tier' in m) && !('superUntil' in m) && !('cancelAtPeriodEnd' in m));
}
{
  const m = mergeStats(spent, cloudRow(), dirtySync);
  assert('(4) transport metadata never lands in the stats blob', !('cloudUpdatedAt' in m));
}

// ── (5) Idempotence — a replayed merge cannot double-apply a purchase ───────
{
  const once = mergeStats(spent, cloudRow(), dirtySync);
  const twice = mergeStats({ ...spent, ...once }, cloudRow(), dirtySync);
  assert('(5) merging twice is idempotent (no double-spend, no double-grant)',
    twice.gems === 3 && twice.streakFreezes === 31, `gems=${twice.gems} freezes=${twice.streakFreezes}`);
}

// ── (6) The staleness path is actually wired in App.jsx ─────────────────────
// A correct merge that nobody calls with a watermark fixes nothing.
{
  const app = readFileSync(join(ROOT, 'src/App.jsx'), 'utf8');
  assert('(6) App.jsx passes a sync watermark into mergeStats',
    /mergeStats\(\s*s\s*,\s*cloudStatsData\s*\|\|\s*\{\}\s*,\s*syncMark\s*\)/.test(app), 'the merge call must receive the watermark');
  assert('(6) App.jsx marks the device dirty on local writes',
    /markStatsDirty\(/.test(app));
  assert('(6) App.jsx acknowledges a successful upload with the server timestamp',
    /markStatsSynced\(\s*userId\s*,\s*cloudUpdatedAt\s*\)/.test(app));
  assert('(6) App.jsx records the merged row version',
    /recordMergedCloudUpdatedAt\(/.test(app));
  assert('(6) App.jsx clears the watermark on sign-out (no cross-identity leak)',
    /clearSyncWatermark\(\)/.test(app));

  const cloud = readFileSync(join(ROOT, 'src/lib/cloudStorage.js'), 'utf8');
  assert('(6) uploadStats returns the server-written updated_at',
    /\.select\('updated_at'\)/.test(cloud));
  assert('(6) downloadStats surfaces cloudUpdatedAt',
    /cloudUpdatedAt:\s*data\.updated_at/.test(cloud));
}

if (failures > 0) {
  console.error(`\nMerge-staleness check FAILED: ${failures} assertion(s) failed.`);
  process.exit(1);
}
console.log('\nMerge-staleness check passed.');
