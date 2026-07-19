// ─────────────────────────────────────────────────────────────────────────────
// CHECKOUT-RETURN guard — the celebration must never be droppable.
//
// THE BUG THIS PINS (it cost TWO real purchases their celebration):
// Stripe returns the payer to `/?super=success&session_id=…`. `/` is an UNKNOWN
// route, so the boot router calls `writeRoute('/learn', { replace: true })`, and
// writeRoute passes a BARE PATH to history.replaceState — silently discarding the
// query string. That fires on `authReady`; the checkout-return poll is gated on
// `cloudReady`, which resolves later. By the time the poll ran the URL had been
// rewritten, so it bailed at its first check: no "Activating…" strip, no pending
// flag, no celebration.
//
// The invariants this enforces:
//   1. The return params are captured at MODULE SCOPE, before React or the
//      router can run — and the poll reads that capture, never window.location.
//   2. The "celebration owed" flag is persisted EARLY, on session alone, not
//      behind cloudReady — so nothing that stops the poll can cancel the
//      celebration.
//   3. The celebration is bound to the ENTITLEMENT LANDING (tier), so it fires
//      whichever path applies it, and is cleared only once it has been shown.
//   4. `celebration` is an EXCLUSIVE surface in the registry, so when something
//      higher-priority is up it is QUEUED, never dropped.
// ─────────────────────────────────────────────────────────────────────────────

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { SURFACES, EXCLUSIVE_SURFACE_IDS, resolveActiveSurface, queuedSurfaces } from '../src/lib/surfaceRegistry.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
let failures = 0;
const assert = (label, cond, extra = '') => {
  if (cond) console.log(`OK   ${label}`);
  else { failures += 1; console.error(`FAIL ${label}${extra ? ' — ' + extra : ''}`); }
};

const app = readFileSync(join(ROOT, 'src/App.jsx'), 'utf8');
const code = app
  .replace(/\/\*[\s\S]*?\*\//g, ' ')
  .split(/\r?\n/)
  .filter(l => !/^\s*(\/\/|\*)/.test(l))
  .map(l => l.replace(/\/\/.*$/, ''))
  .join('\n');

// ── (1) The params are captured before anything can rewrite the URL ─────────
assert('(1) the checkout return is captured at MODULE scope (not inside the component)',
  /^const CHECKOUT_RETURN = readCheckoutReturn\(\);/m.test(code),
  'a value read inside an effect can already have been destroyed by the router');
assert('(1) readCheckoutReturn parses super=success',
  /params\.get\('super'\) === 'success'/.test(code));

// THE REGRESSION ITSELF: the poll must not re-read the live URL.
const pollIdx = code.indexOf('superSuccessHandled.current');
const pollRegion = code.slice(pollIdx, pollIdx + 900);
assert('(1) the poll gates on the CAPTURED value',
  /CHECKOUT_RETURN\.isReturn/.test(pollRegion),
  'gating on window.location.search is the bug — the router wipes it first');
assert('(1) the poll does NOT re-read window.location.search for the super flag',
  !/new URLSearchParams\(window\.location\.search\)[\s\S]{0,200}get\('super'\)/.test(pollRegion),
  'the query string is gone by the time this effect runs');

// ── (2) The flag is persisted early, independent of cloudReady ──────────────
const earlyIdx = code.indexOf('if (!CHECKOUT_RETURN.isReturn) return;');
assert('(2) an EARLY effect exists that acts on the checkout return', earlyIdx > -1);
// Scope to THIS effect's body only — up to its dependency array. A fixed-size
// window would spill into the next effect (which legitimately mentions
// cloudReady) and make the assertion below meaningless.
const earlyEnd = earlyIdx > -1 ? code.indexOf('}, [', earlyIdx) : -1;
const earlyRegion = earlyIdx > -1 && earlyEnd > -1 ? code.slice(earlyIdx, earlyEnd) : '';
assert('(2) it persists the celebration-owed flag',
  /saveSuperCelebrationPending\(\)/.test(earlyRegion));
assert('(2) it is NOT gated on cloudReady (that gate is what delayed it past the URL rewrite)',
  !/cloudReady/.test(earlyRegion),
  'the flag must be written on session alone');
assert('(2) it shows the activating strip so the payer is never looking at a silent page',
  /setSuperActivation\(/.test(earlyRegion));

// ── (3) The celebration is bound to the entitlement, and cleared once shown ──
assert('(3) the celebration effect keys on the derived entitlement, not on the poll result',
  /superActiveForCelebration/.test(code));
assert('(3) it consumes the pending flag exactly once',
  /loadSuperCelebrationPending\(\)/.test(code) && /clearSuperCelebrationPending\(\)/.test(code));
{
  // The clear must come AFTER the "is it owed?" check, or the celebration is
  // consumed without ever being shown.
  //
  // Scope to the CELEBRATION EFFECT. `loadSuperCelebrationPending()` also appears
  // earlier as the useState initializer for superPurchasePending; measuring from
  // that occurrence made this assertion vacuously true and let a real mutation
  // (clear-before-read) survive.
  const effectAt = code.indexOf('if (!superActiveForCelebration) return;');
  const region = effectAt > -1 ? code.slice(effectAt, code.indexOf('}, [', effectAt)) : '';
  const loadAt = region.indexOf('loadSuperCelebrationPending()');
  const clearAt = region.indexOf('clearSuperCelebrationPending()');
  assert('(3) inside the celebration effect, the flag is READ before it is CLEARED',
    effectAt > -1 && loadAt > -1 && clearAt > loadAt,
    'clearing first consumes the celebration without ever showing it');
}
assert('(3) the celebration is actually raised on that path',
  /setCelebration\(\{[\s\S]{0,400}Welcome to Super/.test(app));

// ── (4) A suppressed celebration is QUEUED, never dropped ───────────────────
assert('(4) celebration is an EXCLUSIVE surface in the registry',
  EXCLUSIVE_SURFACE_IDS.includes('celebration'));
{
  // For every combination where the celebration wants the screen, it must either
  // win or be queued — never silently vanish.
  const others = EXCLUSIVE_SURFACE_IDS.filter(id => id !== 'celebration');
  let dropped = null;
  for (let mask = 0; mask < 2 ** others.length; mask++) {
    const present = { celebration: true };
    others.forEach((id, i) => { present[id] = !!(mask & (1 << i)); });
    const active = resolveActiveSurface(present);
    const queued = queuedSurfaces(present);
    if (active !== 'celebration' && !queued.includes('celebration')) { dropped = mask; break; }
  }
  assert(`(4) over all ${2 ** (EXCLUSIVE_SURFACE_IDS.length - 1)} combinations, a wanted celebration is never dropped`,
    dropped === null, dropped === null ? '' : `dropped at mask ${dropped}`);
}
assert('(4) the celebration outranks the lower-priority modals it must not be buried by',
  SURFACES.findIndex(s => s.id === 'celebration') < SURFACES.findIndex(s => s.id === 'upgradePrompt'));

// ── The activating strip must be reachable and non-exclusive ────────────────
assert('the activation strip is a NON-exclusive surface (it must show alongside the app)',
  SURFACES.find(s => s.id === 'superActivation')?.exclusive === false);
assert('the activation strip has a render site',
  /superActivation && \(/.test(app) || /activeSurface === 'superActivation'/.test(app));

if (failures > 0) {
  console.error(`\nCheckout-return check FAILED: ${failures} assertion(s).`);
  console.error('A paying customer could be left with no acknowledgement of their purchase.');
  process.exit(1);
}
console.log('\nCheckout-return check passed.');
