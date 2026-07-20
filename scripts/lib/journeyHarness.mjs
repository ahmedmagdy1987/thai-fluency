// ─────────────────────────────────────────────────────────────────────────────
// JOURNEY HARNESS — the shared machinery for RUNNING the app end to end.
//
// Every journey test drives the REAL built bundle in real Chromium. This module
// provides the three things that made that possible where earlier tests failed:
//   1. a static server that serves ./dist with SPA fallback (like Vercel), OR a
//      pass-through to a deployed URL so the same journeys run against production;
//   2. a full, configurable Supabase backend mock (auth + rest + edge functions)
//      that honours .single()/.maybeSingle() and can simulate the CURRENT
//      production state (billing_events missing), outages, and Super entitlement;
//   3. session + localStorage seeding, so a journey can start as a brand-new
//      anonymous visitor, a signed-in free user, a Super user, or mid-lesson.
//
// It exists because the historical failures were all RUNTIME: the app composed
// from passing pieces could not boot, or a flow the validators never mounted
// silently dropped a purchase. This harness mounts the whole thing.
// ─────────────────────────────────────────────────────────────────────────────

import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, extname } from 'node:path';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const DIST = join(ROOT, 'dist');
export const ARTIFACTS = join(ROOT, 'scripts/viz/artifacts/journeys');

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.webmanifest': 'application/manifest+json',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp',
  '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.mp4': 'video/mp4', '.ico': 'image/x-icon',
};

// ── identities ──────────────────────────────────────────────────────────────
export function makeUser({ confirmed = true, id = '00000000-0000-4000-8000-000000000001', email = 'journey@example.com' } = {}) {
  const iso = new Date(Date.now() - 864e5).toISOString();
  return {
    id, aud: 'authenticated', role: 'authenticated', email,
    email_confirmed_at: confirmed ? iso : null,
    confirmed_at: confirmed ? iso : null,
    created_at: iso, app_metadata: { provider: 'email' }, user_metadata: {}, identities: [],
  };
}
export function makeSession(user) {
  const now = Math.floor(Date.now() / 1000);
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
  const jwt = `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ sub: user.id, exp: now + 3600, role: 'authenticated' })}.sig`;
  return { access_token: jwt, token_type: 'bearer', expires_in: 3600, expires_at: now + 3600, refresh_token: 'r', user };
}
export const SUPER_ROW = () => ({
  super_until: new Date(Date.now() + 30 * 864e5).toISOString(),
  status: 'active', plan: 'super_monthly', cancel_at_period_end: false,
  current_period_end: new Date(Date.now() + 30 * 864e5).toISOString(),
});

// Console noise that is NOT an app error.
const NOISE = [
  /data:font\/woff2/i, /chrome-extension:/i, /React DevTools/i, /onesignal/i,
  /Failed to load resource/i, /net::ERR_/i, /\[App\] cloud/i, /\[billingEvents\]/i,
];
export const isNoise = (t) => NOISE.some((re) => re.test(String(t)));

// ── the server ────────────────────────────────────────────────────────────
export async function startServer() {
  const server = createServer(async (req, res) => {
    try {
      const url = decodeURIComponent((req.url || '/').split('?')[0]);
      let f = join(DIST, url);
      if (!existsSync(f) || statSync(f).isDirectory()) f = join(DIST, 'index.html');
      if (!existsSync(f)) { res.writeHead(404); res.end('no dist — run npm run build'); return; }
      res.writeHead(200, { 'Content-Type': MIME[extname(f)] || 'application/octet-stream' });
      res.end(readFileSync(f));
    } catch (e) { res.writeHead(500); res.end(String(e)); }
  });
  await new Promise((r) => server.listen(0, r));
  return { server, url: `http://localhost:${server.address().port}` };
}

// ── the backend mock ────────────────────────────────────────────────────────
// opts: { user, entitlement:'free'|'super'|row, stats, progress, achievements,
//         billingEventsMissing:true, restStatus:null|500|401, checkoutError:null }
export async function mockBackend(ctx, opts = {}) {
  const user = opts.user || makeUser();
  const entitlementRows = opts.entitlement === 'super' ? [SUPER_ROW()]
    : Array.isArray(opts.entitlement) ? opts.entitlement
      : (opts.entitlement && typeof opts.entitlement === 'object') ? [opts.entitlement] : [];

  await ctx.route('**/auth/v1/**', (route) => {
    const u = route.request().url();
    if (/\/user\b/.test(u)) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(user) });
    if (/token/.test(u)) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(makeSession(user)) });
    return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
  });

  await ctx.route('**/rest/v1/**', (route) => {
    const u = route.request().url();
    const method = route.request().method();
    const headers = route.request().headers();
    if (opts.restStatus === 500) return route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ message: 'server error' }) });
    if (opts.restStatus === 401) return route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ message: 'JWT expired' }) });
    const wantsObject = String(headers.accept || '').includes('pgrst.object');
    const json = (b, s = 200) => {
      const body = wantsObject && Array.isArray(b) ? (b[0] ?? null) : b;
      return route.fulfill({ status: s, contentType: 'application/json', body: JSON.stringify(body) });
    };
    if (u.includes('/billing_events')) {
      if (opts.billingEventsMissing !== false) {
        return route.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ code: '42P01', message: 'relation "public.billing_events" does not exist' }) });
      }
      return json([]);
    }
    if (u.includes('/subscriptions')) return json(entitlementRows);
    if (u.includes('/user_stats')) return json(method === 'GET' ? (opts.stats ? [opts.stats] : []) : { updated_at: new Date().toISOString() });
    if (u.includes('/user_progress')) return json(opts.progress || []);
    if (u.includes('/user_achievements')) return json(opts.achievements || []);
    if (u.includes('/profiles')) return json([{ id: user.id, display_name: 'Journey', settings: {}, onesignal_player_id: null, timezone: 'UTC' }]);
    if (u.includes('/rpc/')) return json({});
    return json([]);
  });

  await ctx.route('**/functions/v1/**', (route) => {
    if (opts.checkoutError) return route.fulfill({ status: opts.checkoutError, contentType: 'application/json', body: JSON.stringify({ error: opts.checkoutErrorCode || 'error' }) });
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ clientSecret: 'cs_test_x' }) });
  });
}

// A realistic RETURNING user. Note `unlockedAchievements`: without it, a seeded
// streak of 3 fires the "Three-day Streak" achievement modal on load — which is
// correct app behaviour but not what a returning user (who earned it days ago)
// sees. Seeding the achievements they would already hold keeps journeys testing
// the surface under test, not an incidental celebration.
export const ONBOARDED_STATS = (over = {}) => ({
  hasOnboarded: true, tutorialSeen: true, firstLessonCompleted: true,
  startedStage: 1, currentStage: 1, totalXp: 120, streak: 3,
  gems: 40, hearts: 5, voice: 'male', theme: 'light',
  celebrationBaselineDone: true, stage1CelebrationShown: true,
  unlockedAchievements: ['first-word', 'first-lesson', 'streak-3', 'streak-7', 'stage-1', 'stage-2'],
  ...over,
});

// Dismiss any full-screen reward/achievement/celebration overlay that is up, so a
// journey can interact with the surface beneath it. Returns how many it cleared.
export async function dismissOverlays(page, max = 4) {
  let cleared = 0;
  for (let i = 0; i < max; i++) {
    const btn = page.locator('.reward-continue-btn:visible, .cine-skip:visible, .s1-complete-cta:visible').first();
    if (await btn.count() && await btn.isVisible().catch(() => false)) {
      await btn.click().catch(() => {});
      await page.waitForTimeout(500);
      cleared++;
    } else break;
  }
  return cleared;
}

// Seed session + local state before any app script runs.
export async function seed(ctx, { session = null, state = null, extraKeys = {} } = {}) {
  await ctx.addInitScript(([authKey, sess, stateKey, st, extras]) => {
    try {
      if (sess) localStorage.setItem(authKey, JSON.stringify(sess));
      if (st) localStorage.setItem(stateKey, JSON.stringify(st));
      for (const [k, v] of Object.entries(extras || {})) localStorage.setItem(k, v);
    } catch { /* ignore */ }
  }, ['tuk-talk-thai-auth', session, 'thai-fluency-state-v1', state, extraKeys]);
}

// ── a single journey run ────────────────────────────────────────────────────
export function createRunner({ base, browser, artifactsDir = ARTIFACTS }) {
  mkdirSync(artifactsDir, { recursive: true });
  const results = [];
  let current = null;

  async function journey(name, impact, fn, { seedOpts = null, mockOpts = null, viewport = { width: 1280, height: 900 }, breakLocalStorage = false, offline = false } = {}) {
    current = { name, impact, steps: [], status: 'PASS', evidence: null };
    const ctx = await browser.newContext({ viewport });
    if (breakLocalStorage) {
      // Simulate private mode / quota: every localStorage op throws. The app must
      // still boot — it must never depend on storage succeeding.
      await ctx.addInitScript(() => {
        const boom = () => { throw new DOMException('localStorage disabled', 'SecurityError'); };
        try {
          Object.defineProperty(window, 'localStorage', {
            configurable: true,
            get() { return { getItem: boom, setItem: boom, removeItem: boom, clear: boom, key: boom, get length() { return boom(); } }; },
          });
        } catch { /* ignore */ }
      });
    }
    if (offline) await ctx.setOffline(true);
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', (e) => { const t = String(e.stack || e); if (!isNoise(t)) errs.push('pageerror: ' + t.split('\n')[0]); });
    page.on('console', (m) => { if (m.type() === 'error' && !isNoise(m.text())) errs.push('console: ' + m.text()); });

    const api = {
      page,
      async step(label, cond, extra = '') {
        const ok = typeof cond === 'function' ? await cond() : !!cond;
        current.steps.push({ label, ok, extra: ok ? '' : String(extra).slice(0, 220) });
        if (!ok && current.status === 'PASS') {
          current.status = 'FAIL';
          try { current.evidence = join(artifactsDir, `${name.replace(/[^\w]+/g, '_')}.png`); await page.screenshot({ path: current.evidence, fullPage: true }); } catch { /* ignore */ }
        }
        return ok;
      },
      errs,
      async body() { return (await page.locator('body').innerText().catch(() => '')).replace(/\s+/g, ' '); },
      boundaryShowing: async () => /hit a snag|Something went wrong|Reload the app/i.test(await page.locator('body').innerText().catch(() => '')),
    };

    try {
      if (mockOpts !== false) await mockBackend(ctx, mockOpts || {});
      if (seedOpts) await seed(ctx, seedOpts);
      await fn(api);
      // Every journey implicitly asserts the app never crashed.
      await api.step('no uncaught app error during the journey', errs.length === 0, errs[0]);
      await api.step('ErrorBoundary never appeared', !(await api.boundaryShowing()));
    } catch (e) {
      current.status = 'FAIL';
      current.steps.push({ label: 'journey threw', ok: false, extra: String(e).split('\n')[0].slice(0, 220) });
      try { current.evidence = join(artifactsDir, `${name.replace(/[^\w]+/g, '_')}_threw.png`); await page.screenshot({ path: current.evidence, fullPage: true }); } catch { /* ignore */ }
    } finally {
      await ctx.close();
    }
    results.push(current);
    return current;
  }

  function report() {
    let pass = 0, fail = 0;
    console.log('\n' + '='.repeat(78));
    for (const j of results) {
      const icon = j.status === 'PASS' ? 'PASS' : 'FAIL';
      console.log(`\n[${icon}] ${j.name}   (${j.impact})`);
      for (const s of j.steps) {
        console.log(`   ${s.ok ? '·' : '✗'} ${s.label}${s.ok ? '' : '  — ' + s.extra}`);
      }
      if (j.evidence) console.log(`   evidence: ${j.evidence}`);
      if (j.status === 'PASS') pass++; else fail++;
    }
    console.log('\n' + '='.repeat(78));
    console.log(`JOURNEYS: ${pass} passed, ${fail} failed, ${results.length} total`);
    return { pass, fail, results };
  }

  return { journey, report, results };
}
