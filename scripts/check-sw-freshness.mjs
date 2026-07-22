// ─────────────────────────────────────────────────────────────────────────────
// SERVICE-WORKER FRESHNESS guard.
//
// THE OUTAGE THIS EXISTS TO PREVENT:
// with the default vite-plugin-pwa config the service worker PRECACHES
// index.html and answers every navigation from that precache. A returning user
// therefore boots the PREVIOUS deploy's HTML — and its JS bundle — on their next
// launch. The repo's own architecture assessment already named this "one version
// behind per launch".
//
// It is not a cosmetic lag. It is a delivery channel for ALREADY-FIXED crashes:
// a paying customer hit the Wave 14 TDZ crash on the checkout return AFTER it had
// been fixed and deployed, because their cached HTML still pointed at the old
// bundle — which is also why a hard refresh (bypassing the SW) "fixed" it. A
// hotfix that cannot reach users is not a hotfix.
//
// The invariant: navigations must be NETWORK-FIRST, so a deploy is picked up on
// the next load, with a cache fallback so the PWA still works offline.
//
// WHY THIS FILE IS STRUCTURAL, NOT A TEXT GREP:
// the first version of this guard grepped the RAW config — comments included —
// and ANDed two UNCORRELATED regexes. Both of these shipped the bug and passed
// 9/9: (a) the magic strings present only inside a comment, and (b) a CacheFirst
// navigate route sitting beside an unrelated NetworkFirst route for PNGs. Worse,
// it never noticed the real production defect: navigateFallback:null removes the
// NavigationRoute but NOT workbox's PrecacheRoute, which is registered FIRST and
// resolves a bare '/' to 'index.html' through its own defaults
// (directoryIndex:'index.html', cleanURLs:true). The router answers with the
// FIRST matching route, so '/' — the start_url, and what typing the domain gets
// — was still served CACHE-FIRST while every other navigation was network-first.
// So this guard now: strips comments before reading the config, CORRELATES the
// navigate pattern with its own handler, and — when a build exists — parses the
// generated precache manifest and fails if index.html is in it.
// ─────────────────────────────────────────────────────────────────────────────

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
let failures = 0;
const assert = (label, cond, extra = '') => {
  if (cond) console.log(`OK   ${label}`);
  else { failures += 1; console.error(`FAIL ${label}${extra ? ' — ' + extra : ''}`); }
};

// Comments are not configuration. Strip them before asserting anything, so a
// magic string mentioned in prose can never satisfy a check (same technique as
// check-checkout-return.mjs).
const rawCfg = readFileSync(join(ROOT, 'vite.config.js'), 'utf8');
const cfg = rawCfg
  .replace(/\/\*[\s\S]*?\*\//g, ' ')
  .split(/\r?\n/)
  .filter(l => !/^\s*(\/\/|\*)/.test(l))
  .map(l => l.replace(/\/\/.*$/, ''))
  .join('\n');

assert('the PWA plugin is configured', /VitePWA\(\{/.test(cfg));
assert('navigations are NOT answered from the precache (navigateFallback: null)',
  /navigateFallback:\s*null/.test(cfg),
  'a precached index.html serves the PREVIOUS deploy to returning users');

// ── the navigate route and its handler must be the SAME entry ────────────────
// Two uncorrelated regexes let a CacheFirst navigation pass next to an unrelated
// NetworkFirst rule. Scope the handler lookup to the navigate entry itself: from
// the navigate urlPattern up to the start of the NEXT urlPattern.
const navIdx = cfg.search(/request\.mode\s*===\s*['"]navigate['"]/);
let navEntry = '';
if (navIdx >= 0) {
  const rest = cfg.slice(navIdx);
  const nextPattern = rest.slice(1).search(/urlPattern\s*:/);
  navEntry = nextPattern >= 0 ? rest.slice(0, nextPattern + 1) : rest;
}
assert('a runtime route matches navigations', navIdx >= 0,
  'without one, nothing overrides the default HTML handling');
assert('THAT navigation route is NetworkFirst (correlated, not merely present elsewhere)',
  /handler:\s*['"]NetworkFirst['"]/.test(navEntry),
  'a CacheFirst navigation beside an unrelated NetworkFirst rule is the bug, not the fix');
assert('the network-first navigation has a timeout (a slow network must not hang the app)',
  /networkTimeoutSeconds:\s*[1-9]/.test(navEntry));

assert('outdated caches are cleaned up on activation',
  /cleanupOutdatedCaches:\s*true/.test(cfg));
assert('the SW still auto-updates', /registerType:\s*['"]autoUpdate['"]/.test(cfg));

// ── index.html must be kept OUT of the precache manifest ─────────────────────
// This is the assertion that would have caught the live defect. navigateFallback
// alone does not do it: the PrecacheRoute still matches '/' via directoryIndex.
assert('index.html is EXCLUDED from the precache (globIgnores)',
  /globIgnores:\s*\[[^\]]*index\.html[^\]]*\]/.test(cfg),
  "workbox's PrecacheRoute is registered first and resolves '/' to index.html via "
  + "directoryIndex, so a precached index.html keeps the front door cache-first");

// The OneSignal scope split must survive — two SWs at scope '/' is a hard
// browser conflict and has broken push before.
assert('the PWA worker is not registered at the OneSignal scope',
  !/push\/onesignal/.test(cfg),
  'the OneSignal worker owns /push/onesignal/; this one owns /');

// ─────────────────────────────────────────────────────────────────────────────
// Generated-worker assertions. These are the real proof — the config is only an
// intention until workbox has emitted a manifest.
// ─────────────────────────────────────────────────────────────────────────────

// Pull the precache list out of the MINIFIED worker by balanced-bracket scan
// from precacheAndRoute's argument, so the parse does not depend on formatting.
function precachedUrls(sw) {
  const call = sw.indexOf('precacheAndRoute');
  if (call < 0) return null;
  const open = sw.indexOf('[', call);
  if (open < 0) return null;
  let depth = 0;
  let close = -1;
  for (let i = open; i < sw.length; i += 1) {
    const ch = sw[i];
    if (ch === '[') depth += 1;
    else if (ch === ']') { depth -= 1; if (depth === 0) { close = i; break; } }
  }
  if (close < 0) return null;
  const block = sw.slice(open, close + 1);
  return [...block.matchAll(/url\s*:\s*["'`]([^"'`]+)["'`]/g)].map(m => m[1]);
}

const swPath = join(ROOT, 'dist/sw.js');
if (existsSync(swPath)) {
  const sw = readFileSync(swPath, 'utf8');
  const urls = precachedUrls(sw);

  // A parse that silently yields nothing must FAIL, never pass vacuously.
  assert('the generated precache manifest is parseable', urls !== null,
    'could not locate precacheAndRoute([...]) in dist/sw.js — the parser needs updating, '
    + 'and until it does this guard is blind');
  assert('the generated precache manifest is non-empty', !!urls && urls.length > 0,
    'an empty manifest would make every precache assertion below vacuously true');

  if (urls && urls.length) {
    const html = urls.filter(u => /(^|\/)index\.html$/.test(u));
    assert('the BUILT worker does NOT precache index.html',
      html.length === 0,
      `precached: ${html.join(', ')} — '/' resolves into the precache via directoryIndex `
      + `and is answered CACHE-FIRST, so the front door stays one deploy behind`);

    // Precaching is still ON for the immutable, content-hashed assets — the fix
    // removes the HTML from the manifest, it does not disable offline support.
    assert('the BUILT worker still precaches the hashed build assets',
      urls.some(u => /^assets\/.+\.(js|css)$/.test(u)),
      'dropping the whole manifest would cost the offline experience, which is not the fix');
  }

  assert('the BUILT service worker contains a NetworkFirst navigation route',
    /NetworkFirst/.test(sw) && /html-shell/.test(sw),
    'the config did not reach the generated worker');
  assert('the BUILT service worker cleans up outdated caches',
    /cleanupOutdatedCaches|cleanupOutdated/.test(sw));
} else {
  console.log('NOTE dist/ not built — skipped the generated-worker assertions.');
  console.log('     The config-level globIgnores assertion above still guards the invariant.');
  console.log('     (CI builds before `npm run check` in the main job; the timezone matrix job does not.)');
}

if (failures > 0) {
  console.error(`\nSW-freshness check FAILED: ${failures} assertion(s).`);
  console.error('Returning users would boot a stale bundle, so a hotfix could not reach them.');
  process.exit(1);
}
console.log('\nSW-freshness check passed.');
