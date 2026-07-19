// ─────────────────────────────────────────────────────────────────────────────
// FULL-SCREEN SURFACE EXCLUSION guard (Wave 12, root cause 3).
//
// THE CLASS OF BUG THIS MAKES IMPOSSIBLE TO REINTRODUCE:
// mutual exclusion used to be a per-render-site convention — a hand-maintained
// chain of `&& !otherThing`. Every new surface required editing N existing sites,
// and that memory kept failing. The live example: `stageCinematic` rendered with
// NO guard at all while being set in the same synchronous branch as
// setCelebration, so an opaque z-1300 video painted over a still-mounted
// aria-modal celebration (clips ship for stages 1, 2, 4, 5, 6, 7 — not latent).
// `streakRecovery` guarded only `!rewardScreen`. The most complete chain in the
// file listed eight negations and still missed three surfaces.
//
// This guard enforces:
//   (1) EXHAUSTIVE EXCLUSION — over ALL 2^N combinations of surfaces wanting the
//       screen, the resolver returns at most one. Not sampled: enumerated.
//   (2) QUEUED, NOT DROPPED — every suppressed surface is still reported as
//       queued, so nothing is silently discarded.
//   (3) NO RENDER SITE OUTSIDE THE REGISTRY — every exclusive surface in App.jsx
//       renders on `activeSurface === '<id>'`, and no legacy pairwise negation
//       chain survives.
//   (4) PRIORITY IS TOTAL AND STABLE — the order is a strict ranking with no
//       duplicates, so "which one wins" is never ambiguous.
// ─────────────────────────────────────────────────────────────────────────────

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import {
  SURFACES, EXCLUSIVE_SURFACE_IDS, resolveActiveSurface, queuedSurfaces,
  surfacePriority, isSurfaceVisible,
} from '../src/lib/surfaceRegistry.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
let failures = 0;
const assert = (label, cond, extra = '') => {
  if (cond) console.log(`OK   ${label}`);
  else { failures += 1; console.error(`FAIL ${label}${extra ? ' — ' + extra : ''}`); }
};

// ── (4) The ranking is total and unambiguous ────────────────────────────────
assert('(4) the registry is non-empty and has exclusive surfaces',
  SURFACES.length > 0 && EXCLUSIVE_SURFACE_IDS.length > 1);
assert('(4) surface ids are unique',
  new Set(SURFACES.map(s => s.id)).size === SURFACES.length);
{
  const prios = EXCLUSIVE_SURFACE_IDS.map(surfacePriority);
  assert('(4) every exclusive surface has a distinct priority (no ties → no ambiguity)',
    new Set(prios).size === prios.length);
}
assert('(4) every surface documents WHY it sits where it does',
  SURFACES.every(s => typeof s.why === 'string' && s.why.length > 20));

// ── (1) Exhaustive: at most one exclusive surface, over every combination ───
{
  const n = EXCLUSIVE_SURFACE_IDS.length;
  const total = 2 ** n;
  let worstCombo = null;
  let visibleAlwaysAtMostOne = true;
  let resolverMatchesIsVisible = true;
  let queueLosesNothing = true;

  for (let mask = 0; mask < total; mask++) {
    const present = {};
    for (let i = 0; i < n; i++) present[EXCLUSIVE_SURFACE_IDS[i]] = !!(mask & (1 << i));

    // How many would actually RENDER, decided exactly as App.jsx decides.
    const active = resolveActiveSurface(present);
    const visible = EXCLUSIVE_SURFACE_IDS.filter(id => active === id);
    if (visible.length > 1) { visibleAlwaysAtMostOne = false; worstCombo = { mask, visible }; }

    // isSurfaceVisible must agree with the resolver for every id.
    for (const id of EXCLUSIVE_SURFACE_IDS) {
      if (isSurfaceVisible(id, present) !== (active === id)) resolverMatchesIsVisible = false;
    }

    // (2) Nothing is dropped: wanting = visible ∪ queued, exactly.
    const wanted = EXCLUSIVE_SURFACE_IDS.filter(id => present[id]);
    const queued = queuedSurfaces(present);
    const accounted = new Set([...visible, ...queued]);
    if (accounted.size !== wanted.length || !wanted.every(id => accounted.has(id))) queueLosesNothing = false;

    // A surface may only win if it actually wanted the screen.
    if (active && !present[active]) visibleAlwaysAtMostOne = false;
  }

  assert(`(1) over all ${total} combinations, at most ONE exclusive surface is ever visible`,
    visibleAlwaysAtMostOne, worstCombo ? `mask ${worstCombo.mask} → ${worstCombo.visible.join(' + ')}` : '');
  assert('(1) isSurfaceVisible() agrees with resolveActiveSurface() for every id in every combination',
    resolverMatchesIsVisible);
  assert('(2) every suppressed surface is QUEUED, never dropped (visible ∪ queued == wanted)',
    queueLosesNothing);
}

// The specific pairs that shipped broken must now be impossible.
{
  const both = { celebration: true, stageCinematic: true };
  const active = resolveActiveSurface(both);
  assert('(1) the SHIPPED bug: celebration + stageCinematic can no longer both render',
    [active].filter(Boolean).length === 1);
  assert('(1) the cinematic wins that pair (opaque video plays first)',
    active === 'stageCinematic', `active=${active}`);
  assert('(2) …and the celebration is queued, so it still shows afterwards',
    queuedSurfaces(both).includes('celebration'));

  const pair2 = { celebration: true, streakRecovery: true };
  assert('(1) celebration + streakRecovery can no longer both render',
    resolveActiveSurface(pair2) === 'celebration' && queuedSurfaces(pair2).includes('streakRecovery'));
}

// ── (3) Render sites: registry-gated, no legacy chains ──────────────────────
{
  const app = readFileSync(join(ROOT, 'src/App.jsx'), 'utf8');

  assert('(3) App.jsx imports the registry resolver',
    /import \{[^}]*resolveActiveSurface[^}]*\} from '\.\/lib\/surfaceRegistry\.js'/.test(app));
  assert('(3) App.jsx computes exactly one activeSurface',
    (app.match(/const activeSurface = resolveActiveSurface\(/g) || []).length === 1);

  // Every exclusive surface must have a registry-gated render site.
  for (const id of EXCLUSIVE_SURFACE_IDS) {
    const gated = new RegExp(`activeSurface === '${id}'`).test(app);
    if (!gated) {
      failures += 1;
      console.error(`FAIL (3) surface '${id}' has no \`activeSurface === '${id}'\` render site in App.jsx`);
    }
  }
  assert('(3) every exclusive surface renders through the registry gate', true);

  // Every surface listed in the registry must actually be fed by surfacesPresent.
  // (ES6 shorthand `celebration,` counts as supplying it.)
  const presentBlock = app.slice(app.indexOf('const surfacesPresent = {'), app.indexOf('const activeSurface = resolveActiveSurface('));
  for (const s of SURFACES) {
    if (!new RegExp(`\\b${s.id}\\s*[:,]`).test(presentBlock)) {
      failures += 1;
      console.error(`FAIL (3) registry surface '${s.id}' is not supplied in surfacesPresent`);
    }
  }
  assert('(3) surfacesPresent supplies every registered surface', true);

  // No legacy pairwise negation may survive ON A REGISTERED SURFACE'S RENDER GATE.
  // Scoped deliberately: `if (!celebration && !rewardScreen)` inside an EFFECT is
  // state hygiene (don't replace a live celebration object), a different concern
  // from render exclusion; and inline non-registered chrome (e.g. the anonymous
  // account bar suppressing itself during the save-ask) is content logic, not
  // full-screen precedence. What must never come back is a render gate that
  // decides precedence itself instead of asking the registry.
  const lines = app.split(/\r?\n/);
  const gateLines = [];
  lines.forEach((line, i) => {
    if (/activeSurface === '/.test(line)) gateLines.push([i + 1, line.trim()]);
  });
  const contaminated = gateLines.filter(([, t]) => /&&\s*!/.test(t));
  assert('(3) no registry render gate re-implements precedence with a negation',
    contaminated.length === 0,
    contaminated.map(([n, t]) => `App.jsx:${n}: ${t.slice(0, 110)}`).join('; '));

  // And the specific components that shipped broken must be registry-gated.
  const COMPONENT_OF = {
    celebration: 'CelebrationOverlay',
    rewardScreen: 'MissionCompleteRewardScreen',
    stage1Celebration: 'Stage1CompleteCelebration',
    achievementToast: 'AchievementUnlockedModal',
    saveProgressAsk: 'SaveProgressAsk',
    streakRecovery: 'StreakRecoveryCard',
    upgradePrompt: 'SuperUpgradePrompt',
    stageCinematic: 'StageCinematicOverlay',
    guidedTutorial: 'GuidedTutorial',
  };
  const ungated = [];
  for (const [id, comp] of Object.entries(COMPONENT_OF)) {
    // Find the render site and walk back to its opening JSX guard.
    const idx = app.indexOf(`<${comp}`);
    if (idx < 0) { ungated.push(`${comp} (not found)`); continue; }
    const before = app.slice(Math.max(0, idx - 600), idx);
    const lastGuard = before.lastIndexOf('{activeSurface ===');
    const lastOtherGuard = Math.max(before.lastIndexOf('{'), 0);
    if (lastGuard < 0 || !new RegExp(`\\{activeSurface === '${id}'`).test(before.slice(lastGuard))) {
      ungated.push(`${comp} is not gated by activeSurface === '${id}' (nearest guard at offset ${lastOtherGuard})`);
    }
  }
  assert('(3) every previously-broken overlay component renders only under its registry gate',
    ungated.length === 0, ungated.join('; '));
}

if (failures > 0) {
  console.error(`\nSurface-exclusion check FAILED: ${failures} assertion(s) failed.`);
  process.exit(1);
}
console.log('\nSurface-exclusion check passed.');
