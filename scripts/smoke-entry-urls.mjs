// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// ENTRY-URL BOOT SMOKE â€” every URL the app parses on boot must not crash.
//
// WHY THIS EXISTS: Wave 14 added a boot smoke, and it only ever loaded "/". The
// post-checkout return URL â€” `/?super=success&session_id=â€¦` â€” takes a completely
// different branch (an entitlement poll, an activation toast, telemetry writes),
// and it crashed into the ErrorBoundary for EVERY PAYING CUSTOMER while the boot
// smoke stayed green. A boot test that only tests the front door is not a boot
// test.
//
// This loads every entry URL the app special-cases, in a real browser, with a
// SIGNED-IN session and a fully mocked Supabase backend, and asserts none of them
// reaches the ErrorBoundary.
//
// The backend mock matters as much as the URLs: `billing_events` is served as
// 404 / 42P01 ("relation does not exist") because THAT IS THE STATE PRODUCTION IS
// IN â€” the migration has not been applied. The app must be correct in that state.
//
// Usage: node scripts/smoke-entry-urls.mjs            # against ./dist
//        node scripts/smoke-entry-urls.mjs <baseUrl>  # against a deployed URL
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, extname } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const target = process.argv.slice(2).find(a => a.startsWith('http')) || null;
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.mp4': 'video/mp4', '.ico': 'image/x-icon', '.jpg': 'image/jpeg' };

let base = target, srv = null;
if (!target) {
  srv = createServer((q, r) => {
    let u = decodeURIComponent((q.url || '/').split('?')[0]);
    let f = join(DIST, u);
    if (!existsSync(f) || statSync(f).isDirectory()) f = join(DIST, 'index.html');
    r.writeHead(200, { 'Content-Type': MIME[extname(f)] || 'application/octet-stream' });
    r.end(readFileSync(f));
  });
  await new Promise(r => srv.listen(0, r));
  base = `http://localhost:${srv.address().port}`;
}

const USER_ID = '00000000-0000-4000-8000-000000000001';
const now = Math.floor(Date.now() / 1000);
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
const jwt = `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ sub: USER_ID, exp: now + 3600, role: 'authenticated' })}.sig`;
const USER = {
  id: USER_ID, aud: 'authenticated', role: 'authenticated', email: 'paying-customer@example.com',
  email_confirmed_at: new Date(Date.now() - 864e5).toISOString(),
  confirmed_at: new Date(Date.now() - 864e5).toISOString(),
  created_at: new Date(Date.now() - 864e5).toISOString(),
  app_metadata: { provider: 'email' }, user_metadata: {}, identities: [],
};
const SESSION = { access_token: jwt, token_type: 'bearer', expires_in: 3600, expires_at: now + 3600, refresh_token: 'r', user: USER };

// Scenarios differ only in what the entitlement endpoint returns.
const FREE_ENTITLEMENT = [];
const SUPER_ENTITLEMENT = [{
  super_until: new Date(Date.now() + 30 * 864e5).toISOString(),
  status: 'active', plan: 'super_monthly', cancel_at_period_end: false,
  current_period_end: new Date(Date.now() + 30 * 864e5).toISOString(),
}];

let failures = 0;
const check = (label, cond, extra = '') => {
  if (cond) console.log(`    OK   ${label}`);
  else { failures += 1; console.error(`    FAIL ${label}${extra ? '\n           ' + extra : ''}`); }
};

// Network noise from unmocked assets / third parties is not an app error. App
// errors (uncaught exceptions, TDZ, render failures) are still fatal below.
const IGNORE = [
  /data:font\/woff2/i, /chrome-extension:/i, /React DevTools/i, /onesignal/i,
  /Failed to load resource/i, /net::ERR_/i,
];
const isNoise = t => IGNORE.some(re => re.test(t));

async function mockBackend(ctx, { entitlement }) {
  await ctx.route('**/auth/v1/**', route => {
    const u = route.request().url();
    if (/\/user\b/.test(u)) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(USER) });
    if (/token/.test(u)) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(SESSION) });
    return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
  });
  await ctx.route('**/rest/v1/**', route => {
    const u = route.request().url();
    const method = route.request().method();
    const headers = route.request().headers();
    // .single()/.maybeSingle() ask for a single OBJECT, not an array. Honouring
    // that matters: returning an array here made supabase-js resolve to null and
    // the Super path silently never ran, so the test proved nothing.
    const wantsObject = String(headers.accept || '').includes('pgrst.object');
    const json = (b, s = 200) => {
      const body = wantsObject && Array.isArray(b) ? (b[0] ?? null) : b;
      return route.fulfill({ status: s, contentType: 'application/json', body: JSON.stringify(body) });
    };

    // THE PRODUCTION STATE: the migration has NOT been applied, so PostgREST
    // reports the relation does not exist. Anything the app does with telemetry
    // must survive this.
    if (u.includes('/billing_events')) {
      return route.fulfill({
        status: 404, contentType: 'application/json',
        body: JSON.stringify({ code: '42P01', details: null, hint: null, message: 'relation "public.billing_events" does not exist' }),
      });
    }
    if (u.includes('/subscriptions')) return json(entitlement);
    if (u.includes('/user_stats')) return json(method === 'GET' ? [] : { updated_at: new Date().toISOString() });
    if (u.includes('/user_progress')) return json([]);
    if (u.includes('/user_achievements')) return json([]);
    if (u.includes('/profiles')) return json([{ id: USER_ID, display_name: 'Test', settings: {}, onesignal_player_id: null, timezone: 'UTC' }]);
    if (u.includes('/rpc/')) return json({});
    return json([]);
  });
  await ctx.route('**/functions/v1/**', route =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ clientSecret: 'cs_test_x' }) }));
}

// Every URL the app special-cases on boot.
const ENTRY_URLS = [
  { name: 'plain app', url: '/', ent: FREE_ENTITLEMENT },
  { name: 'CHECKOUT RETURN (free â†’ poll)', url: '/?super=success&session_id=cs_test_b1Ckw0GcjVZLKn90YcWsxr2MfM8vpdzurPyvyidYVY4IlZWf2dQB72zSLI', ent: FREE_ENTITLEMENT, expectUi: /Activating your Super|Still activating/i },
  // THE CELEBRATION, proved two ways â€” both the states a real payer passes through.
  //
  // (a) The entitlement is already live when they land back from Stripe: the
  //     celebration must fire on the return itself.
  {
    name: 'CELEBRATION â€” entitlement live on the checkout return',
    url: '/?super=success&session_id=cs_test_abc',
    ent: SUPER_ENTITLEMENT, seedTier: 'super',
    expectUi: /now Super/i,
  },
  // (b) The webhook landed AFTER they navigated away / closed the tab. On the
  //     next load there are NO url params at all â€” only the persisted
  //     "celebration owed" flag plus the now-live entitlement. This is the exact
  //     case the owner hit twice, and the case Wave 13 claimed worked.
  {
    name: 'CELEBRATION â€” owed from a previous session, entitlement now live, NO url params',
    url: '/',
    ent: SUPER_ENTITLEMENT, seedTier: 'super',
    seedKeys: { 'thai-fluency-super-celebration-pending-v1': JSON.stringify({ at: Date.now() }) },
    expectUi: /now Super/i,
  },
  // (c) Control: entitlement live but NOTHING owed â†’ the celebration must NOT
  //     fire. Without this, (a) and (b) could pass by celebrating on every load.
  {
    name: 'CONTROL â€” Super user, nothing owed, must NOT celebrate',
    url: '/',
    ent: SUPER_ENTITLEMENT, seedTier: 'super',
    expectNotUi: /now Super/i,
  },
  { name: 'checkout return, no session_id', url: '/?super=success', ent: FREE_ENTITLEMENT },
  { name: 'checkout cancelled', url: '/?super=cancelled', ent: FREE_ENTITLEMENT },
  { name: 'password recovery', url: '/#access_token=x&refresh_token=y&type=recovery', ent: FREE_ENTITLEMENT },
  { name: 'email confirmation', url: '/#access_token=x&refresh_token=y&type=signup', ent: FREE_ENTITLEMENT },
  { name: 'auth error in hash', url: '/#error=access_denied&error_description=Email+link+is+invalid+or+has+expired', ent: FREE_ENTITLEMENT },
  { name: 'plans deep-link', url: '/plans', ent: FREE_ENTITLEMENT },
  { name: 'plans (already Super)', url: '/plans', ent: SUPER_ENTITLEMENT },
  { name: 'reset-password route', url: '/reset-password', ent: FREE_ENTITLEMENT },
  { name: 'learn deep-link', url: '/learn', ent: FREE_ENTITLEMENT },
  { name: 'privacy', url: '/privacy', ent: FREE_ENTITLEMENT },
];

console.log(`\nEntry-URL boot smoke: ${base}`);
console.log(`(billing_events is mocked as MISSING â€” the current production state)\n`);

const browser = await chromium.launch();
for (const entry of ENTRY_URLS) {
  const ctx = await browser.newContext();
  // Seed BOTH the session AND an onboarded local state. Without hasOnboarded the
  // app early-returns to the onboarding screen before any overlay renders, so the
  // checkout-return branch is never reached â€” which is exactly how an earlier
  // version of this test passed while proving nothing.
  await ctx.addInitScript(([authKey, sess, stateKey, state, extraKeys]) => {
    try {
      localStorage.setItem(authKey, JSON.stringify(sess));
      localStorage.setItem(stateKey, JSON.stringify(state));
      for (const [k, v] of Object.entries(extraKeys || {})) localStorage.setItem(k, v);
    } catch { /* ignore */ }
  }, ['tuk-talk-thai-auth', SESSION, 'thai-fluency-state-v1', {
    progress: {},
    stats: {
      hasOnboarded: true, tutorialSeen: true, firstLessonCompleted: true,
      startedStage: 1, currentStage: 1, totalXp: 120, streak: 3,
      gems: 40, hearts: 5, voice: 'male', theme: 'light',
      celebrationBaselineDone: true, stage1CelebrationShown: true,
      // Scenarios that need the entitlement ALREADY APPLIED seed it here. This
      // is how the celebration binding is proved without depending on cloud
      // init completing against a mock â€” the state it produces is what matters,
      // not the code path that produced it.
      ...(entry.seedTier ? { tier: entry.seedTier } : {}),
    },
  }, entry.seedKeys || {}]);
  await mockBackend(ctx, { entitlement: entry.ent });

  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => { const t = String(e.stack || e); if (!isNoise(t)) errs.push('pageerror: ' + t); });
  page.on('console', m => { if (m.type() === 'error' && !isNoise(m.text())) errs.push('console: ' + m.text()); });

  console.log(`  ${entry.name}  ${entry.url.slice(0, 70)}`);
  await page.goto(base + entry.url, { waitUntil: 'networkidle', timeout: 45000 }).catch(() => {});
  await page.waitForTimeout(3000);

  const body = await page.locator('body').innerText().catch(() => '');
  const boundary = /hit a snag|Something went wrong|Reload the app/i.test(body);
  check('ErrorBoundary NOT showing', !boundary, body.replace(/\s+/g, ' ').slice(0, 150));
  check('no uncaught error', errs.length === 0, errs[0]);
  check('rendered real content', body.replace(/\s+/g, ' ').trim().length > 40);
  // Try to PROVE the branch executed. This harness cannot currently drive the
  // app to cloudReady=true with a mocked backend (the cloud-init IIFE does not
  // settle against the mock), so the checkout-return POLL does not start here.
  // That is a KNOWN HARNESS LIMITATION, reported loudly rather than silently
  // passed â€” a green test that never enters the path it claims to cover is how
  // this class of bug shipped twice. The crash assertions above ARE meaningful
  // and do cover this URL; only the deeper "did the poll start" claim is unmet.
  if (entry.expectUi) {
    // Celebration scenarios are seeded so they do NOT depend on cloud init
    // completing â€” they are hard assertions, not best-effort notes.
    if (/^CELEBRATION/.test(entry.name)) {
      check(`the celebration FIRED: ${entry.expectUi}`, entry.expectUi.test(body),
        body.replace(/\s+/g, ' ').slice(0, 200));
    } else if (entry.expectUi.test(body)) {
      console.log(`    OK   the branch really ran: ${entry.expectUi}`);
    } else {
      console.log(`    NOTE the poll branch did not start in this harness (known limitation â€” see comment); crash coverage above still applies`);
    }
  }
  if (entry.expectNotUi) {
    check(`must NOT show: ${entry.expectNotUi}`, !entry.expectNotUi.test(body),
      body.replace(/\s+/g, ' ').slice(0, 200));
  }
  await ctx.close();
}

await browser.close();
if (srv) srv.close();

console.log('');
if (failures > 0) { console.error(`Entry-URL smoke FAILED (${failures}).`); process.exit(1); }
console.log('Entry-URL smoke passed â€” every entry URL boots without the ErrorBoundary.');
