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

const cfg = readFileSync(join(ROOT, 'vite.config.js'), 'utf8');

assert('the PWA plugin is configured', /VitePWA\(\{/.test(cfg));
assert('navigations are NOT answered from the precache (navigateFallback: null)',
  /navigateFallback:\s*null/.test(cfg),
  'a precached index.html serves the PREVIOUS deploy to returning users');
assert('navigations use a NetworkFirst runtime strategy',
  /handler:\s*['"]NetworkFirst['"]/.test(cfg) && /request\.mode === ['"]navigate['"]/.test(cfg),
  'so a new deploy is picked up on the very next load');
assert('the network-first navigation has a timeout (a slow network must not hang the app)',
  /networkTimeoutSeconds:\s*[1-9]/.test(cfg));
assert('outdated caches are cleaned up on activation',
  /cleanupOutdatedCaches:\s*true/.test(cfg));
assert('the SW still auto-updates', /registerType:\s*['"]autoUpdate['"]/.test(cfg));

// The OneSignal scope split must survive — two SWs at scope '/' is a hard
// browser conflict and has broken push before.
assert('the PWA worker is not registered at the OneSignal scope',
  !/push\/onesignal/.test(cfg.replace(/\/\/.*$/gm, '')) ,
  'the OneSignal worker owns /push/onesignal/; this one owns /');

// If a build exists, verify the generated worker actually reflects the policy.
const swPath = join(ROOT, 'dist/sw.js');
if (existsSync(swPath)) {
  const sw = readFileSync(swPath, 'utf8');
  assert('the BUILT service worker contains a NetworkFirst navigation route',
    /NetworkFirst/.test(sw) || /html-shell/.test(sw),
    'the config did not reach the generated worker');
  assert('the BUILT service worker cleans up outdated caches',
    /cleanupOutdatedCaches|cleanupOutdated/.test(sw));
} else {
  console.log('NOTE dist/ not built — skipped the generated-worker assertions');
}

if (failures > 0) {
  console.error(`\nSW-freshness check FAILED: ${failures} assertion(s).`);
  console.error('Returning users would boot a stale bundle, so a hotfix could not reach them.');
  process.exit(1);
}
console.log('\nSW-freshness check passed.');
