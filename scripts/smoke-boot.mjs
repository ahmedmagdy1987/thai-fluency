// ─────────────────────────────────────────────────────────────────────────────
// BOOT SMOKE TEST — does the BUILT app actually start?
//
// WHY THIS EXISTS: Wave 13 shipped with `npm run check` at 36/36 and every
// rendered proof passing, and production still crashed on boot into the
// ErrorBoundary. Nothing in the suite ever BOOTED THE REAL APP: the validators
// are pure-logic (they never mount React), and the viz harness mounts individual
// components in isolation, which never exercises the whole module graph. A
// module-initialisation error (TDZ, circular import, a bad top-level side effect)
// is invisible to both.
//
// This loads the real built bundle in real Chromium and asserts the app mounted
// and the ErrorBoundary is NOT showing. It is the cheapest possible test for the
// single worst failure mode — "the app does not start".
//
// Usage:
//   node scripts/smoke-boot.mjs                      # serves ./dist itself
//   node scripts/smoke-boot.mjs https://www.tuktalkthai.com   # against production
//
// Exits non-zero on a boot failure, an ErrorBoundary, or any console/page error.

import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, extname, normalize } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const target = process.argv.slice(2).find(a => a.startsWith('http')) || null;

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.webmanifest': 'application/manifest+json',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp',
  '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.mp4': 'video/mp4',
  '.ico': 'image/x-icon',
};

// Minimal SPA static server so this test needs no dev server and no extra deps.
async function serveDist() {
  const server = createServer(async (req, res) => {
    try {
      const url = decodeURIComponent((req.url || '/').split('?')[0]);
      let filePath = join(DIST, normalize(url).replace(/^(\.\.[/\\])+/, ''));
      let s = await stat(filePath).catch(() => null);
      if (!s || s.isDirectory()) {
        // SPA fallback — every route serves index.html, as Vercel does.
        filePath = join(DIST, 'index.html');
        s = await stat(filePath).catch(() => null);
        if (!s) { res.writeHead(404); res.end('no dist — run `npm run build` first'); return; }
      }
      const body = await readFile(filePath);
      res.writeHead(200, { 'Content-Type': MIME[extname(filePath)] || 'application/octet-stream' });
      res.end(body);
    } catch (e) {
      res.writeHead(500); res.end(String(e));
    }
  });
  await new Promise(resolve => server.listen(0, resolve));
  return { server, url: `http://localhost:${server.address().port}` };
}

let failures = 0;
const check = (label, cond, extra = '') => {
  if (cond) console.log(`  OK   ${label}`);
  else { failures += 1; console.error(`  FAIL ${label}${extra ? '\n         ' + extra : ''}`); }
};

// Noise we must NOT fail on: third-party/extension issues and offline-by-design
// network calls. Everything else is an app error.
const IGNORE = [
  /data:font\/woff2/i,          // a browser extension on the owner's machine
  /chrome-extension:/i,
  /Failed to load resource/i,   // Supabase/OneSignal calls with no creds in this context
  /net::ERR_/i,
  /supabase/i,
  /onesignal/i,
  /the server responded with a status of 4/i,
  /Download the React DevTools/i,
];
const isNoise = (t) => IGNORE.some(re => re.test(t));

const { server, url: localUrl } = target ? { server: null, url: null } : await serveDist();
const base = target || localUrl;
console.log(`\nBoot smoke: ${base}\n`);

const browser = await chromium.launch();
const ctx = await browser.newContext();
const page = await ctx.newPage();

const consoleErrors = [];
const pageErrors = [];
page.on('console', m => { if (m.type() === 'error' && !isNoise(m.text())) consoleErrors.push(m.text()); });
page.on('pageerror', e => { const t = String(e); if (!isNoise(t)) pageErrors.push(t); });

await page.goto(base, { waitUntil: 'networkidle', timeout: 45000 });
await page.waitForTimeout(1500);

// 1. No module-initialisation / render crash.
const tdz = [...pageErrors, ...consoleErrors].filter(t => /before initialization|is not defined|is not a function/i.test(t));
check('no TDZ / module-initialisation error', tdz.length === 0, tdz[0]);
check('no uncaught page error', pageErrors.length === 0, pageErrors[0]);
check('no app console error', consoleErrors.length === 0, consoleErrors[0]);

// 2. The ErrorBoundary is NOT showing. main.jsx renders it on a render crash.
const bodyText = await page.locator('body').innerText().catch(() => '');
const boundaryVisible = /Something went wrong|went wrong loading the app|Reload the app/i.test(bodyText);
check('the ErrorBoundary is NOT showing', !boundaryVisible, bodyText.slice(0, 200).replace(/\n/g, ' '));

// 3. The app actually mounted something.
const rootHtml = await page.locator('#root').innerHTML().catch(() => '');
check('#root exists and is not empty', rootHtml.length > 200, `root length ${rootHtml.length}`);
const appRoot = await page.locator('.app-root, .lp-page, .landing-root').count();
check('a real app surface rendered (app shell or landing)', appRoot > 0);

// 4. Meaningful content, not a blank shell.
const visibleText = bodyText.replace(/\s+/g, ' ').trim();
check('the page shows real content', visibleText.length > 60, `only ${visibleText.length} chars`);

await page.screenshot({ path: join(ROOT, 'scripts/viz/artifacts/boot-smoke.png'), fullPage: false }).catch(() => {});

await browser.close();
if (server) server.close();

console.log('');
if (failures > 0) {
  console.error(`Boot smoke FAILED (${failures}). The app does not start.`);
  process.exit(1);
}
console.log('Boot smoke passed — the built app boots and renders.');
