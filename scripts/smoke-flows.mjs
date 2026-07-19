// ─────────────────────────────────────────────────────────────────────────────
// CORE FLOW SMOKE — beyond "it boots", does the app actually WORK?
//
// smoke-boot.mjs proves the bundle starts. This walks the surfaces a user hits
// first, in a real browser, asserting each renders real content with no console
// error. It is the second half of the Wave 14 test-gap fix: a boot check would
// still pass if, say, /plans threw on navigation.
//
// Usage: node scripts/smoke-flows.mjs [baseUrl]   (defaults to ./dist, self-served)
// ─────────────────────────────────────────────────────────────────────────────

import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, extname, normalize } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const target = process.argv.slice(2).find(a => a.startsWith('http')) || null;

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.mp4': 'video/mp4', '.ico': 'image/x-icon' };

async function serveDist() {
  const server = createServer(async (req, res) => {
    try {
      const url = decodeURIComponent((req.url || '/').split('?')[0]);
      let f = join(DIST, normalize(url).replace(/^(\.\.[/\\])+/, ''));
      let s = await stat(f).catch(() => null);
      if (!s || s.isDirectory()) { f = join(DIST, 'index.html'); s = await stat(f).catch(() => null); }
      if (!s) { res.writeHead(404); res.end('no dist'); return; }
      res.writeHead(200, { 'Content-Type': MIME[extname(f)] || 'application/octet-stream' });
      res.end(await readFile(f));
    } catch (e) { res.writeHead(500); res.end(String(e)); }
  });
  await new Promise(r => server.listen(0, r));
  return { server, url: `http://localhost:${server.address().port}` };
}

const IGNORE = [/data:font\/woff2/i, /chrome-extension:/i, /Failed to load resource/i, /net::ERR_/i, /supabase/i, /onesignal/i, /status of 4/i, /React DevTools/i];
const isNoise = t => IGNORE.some(re => re.test(t));

let failures = 0;
const check = (label, cond, extra = '') => {
  if (cond) console.log(`  OK   ${label}`);
  else { failures += 1; console.error(`  FAIL ${label}${extra ? ' — ' + extra : ''}`); }
};

const { server, url: localUrl } = target ? { server: null, url: null } : await serveDist();
const base = target || localUrl;
console.log(`\nCore flows: ${base}\n`);

const browser = await chromium.launch();

// Each route: fresh context so we test a first-time visitor every time.
const ROUTES = [
  { path: '/', name: 'landing', expect: /Thai/i },
  { path: '/learn', name: 'learn', expect: /./ },
  { path: '/plans', name: 'plans', expect: /Super|Free/i },
  { path: '/privacy', name: 'privacy', expect: /privacy/i },
];

for (const r of ROUTES) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => { if (!isNoise(String(e))) errs.push(String(e)); });
  page.on('console', m => { if (m.type() === 'error' && !isNoise(m.text())) errs.push(m.text()); });

  await page.goto(base + r.path, { waitUntil: 'networkidle', timeout: 45000 });
  await page.waitForTimeout(1200);

  const body = await page.locator('body').innerText().catch(() => '');
  check(`${r.name} (${r.path}): no app error`, errs.length === 0, errs[0]);
  check(`${r.name}: ErrorBoundary absent`, !/Something went wrong|Reload the app/i.test(body), body.slice(0, 120).replace(/\n/g, ' '));
  check(`${r.name}: rendered real content`, body.replace(/\s+/g, ' ').trim().length > 60);
  check(`${r.name}: expected content present`, r.expect.test(body), body.slice(0, 100).replace(/\n/g, ' '));
  await ctx.close();
}

// The sign-in surface must be reachable and interactive from the landing page.
{
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => { if (!isNoise(String(e))) errs.push(String(e)); });
  await page.goto(base + '/', { waitUntil: 'networkidle', timeout: 45000 });
  await page.waitForTimeout(800);
  // Any control that leads to auth (landing CTAs vary by build).
  const authCta = page.locator('button, a').filter({ hasText: /sign in|log in|get started|start your first lesson|start free/i });
  const found = await authCta.count();
  check('landing: an entry CTA exists (sign-in / get started)', found > 0, `found ${found}`);
  if (found > 0) {
    await authCta.first().click().catch(() => {});
    await page.waitForTimeout(1500);
    const body = await page.locator('body').innerText().catch(() => '');
    check('after entering the app: no ErrorBoundary', !/Something went wrong|Reload the app/i.test(body), body.slice(0, 140).replace(/\n/g, ' '));
    check('after entering the app: still rendering', body.replace(/\s+/g, ' ').trim().length > 40);
    check('after entering the app: no page error', errs.length === 0, errs[0]);
  }
  await ctx.close();
}

await browser.close();
if (server) server.close();

console.log('');
if (failures > 0) { console.error(`Core flow smoke FAILED (${failures}).`); process.exit(1); }
console.log('Core flow smoke passed.');
