// ─────────────────────────────────────────────────────────────────────────────
// JOURNEY SUITE — the app RUN end to end, in a real browser, as a real person.
//
// This is the floor the testing pyramid never had. The validators import modules;
// the viz harness mounts components; this MOUNTS THE WHOLE APP and drives it
// through complete journeys, asserting real outcomes — progress persisted, stage
// unlocked, celebration fired, gate appeared — not merely "no error thrown".
//
// Every serious defect of the last month was a runtime failure a reading-based
// test could not see. Each is now a journey here.
//
//   node scripts/journeys.mjs              # against a freshly built ./dist
//   node scripts/journeys.mjs <baseUrl>    # against a deployed URL (post-deploy)
//
// Exit non-zero on any journey failure. Screenshots of failures land in
// scripts/viz/artifacts/journeys/.
// ─────────────────────────────────────────────────────────────────────────────

import { chromium } from 'playwright';
import {
  startServer, createRunner, makeUser, makeSession, seed, mockBackend, ONBOARDED_STATS, dismissOverlays,
} from './lib/journeyHarness.mjs';
// The REAL deck, so a "completed stage 1" seed is the actual stage-1 card ids and
// not a guessed numeric range. getStageState (src/lib/state.js:34) unlocks stage 2
// only when EVERY stage-1 card has been seen, so a seed that misses even one card
// silently proves nothing.
import { CARDS } from '../src/data/cards.js';

const target = process.argv.slice(2).find((a) => a.startsWith('http')) || null;
const { server, url: localUrl } = target ? { server: null, url: null } : await startServer();
const base = target || localUrl;
const browser = await chromium.launch();
const { journey, report } = createRunner({ base, browser });

const seedFree = () => ({ session: makeSession(makeUser()), state: { progress: {}, stats: ONBOARDED_STATS() } });
const seedSuper = () => ({ session: makeSession(makeUser()), state: { progress: {}, stats: ONBOARDED_STATS({ tier: 'super' }) } });
const settle = (p, ms = 1400) => p.waitForTimeout(ms);

// ── A1 · Brand-new anonymous visitor: onboard → first lesson → save-ask → decline ──
await journey('A1 anonymous onboards, finishes first lesson, declines account, keeps using', 'normal user', async (t) => {
  await t.page.goto(base + '/', { waitUntil: 'networkidle' }); await settle(t.page, 700);
  await t.step('landing shows the free-lesson CTA', await t.page.locator('.lp-cta-primary').first().count() > 0);
  await t.page.locator('.lp-cta-primary').first().click().catch(() => {}); await settle(t.page, 800);
  await t.step('onboarding: voice question appears', /who are you speaking as/i.test(await t.body()));
  await t.page.locator('button').filter({ hasText: 'Male' }).first().click().catch(() => {}); await settle(t.page, 300);
  await t.page.locator('button').filter({ hasText: "I don't speak" }).first().click().catch(() => {}); await settle(t.page, 400);
  await t.page.locator('button').filter({ hasText: 'Skip' }).first().click().catch(() => {}); await settle(t.page, 600);
  await t.step('lands on the first-lesson entry', /first|lesson/i.test(await t.body()));
  await t.page.locator('button').filter({ hasText: 'Start lesson' }).first().click().catch(() => {}); await settle(t.page, 500);
  // Walk the whole lesson.
  let reachedSaveAsk = false;
  for (let i = 0; i < 70; i++) {
    if (await t.page.locator('#save-ask-title').count()) { reachedSaveAsk = true; break; }
    const unlock = t.page.locator('button').filter({ hasText: 'Unlock the app' }).first();
    if (await unlock.count() && await unlock.isVisible().catch(() => false)) { await unlock.click().catch(() => {}); await settle(t.page, 1200); continue; }
    const reward = t.page.locator('.reward-continue-btn:visible').first();
    if (await reward.count()) { await reward.click().catch(() => {}); await settle(t.page, 800); continue; }
    const opt = t.page.locator('.firstlesson-option:not([disabled]), .firstlesson-option-text:not([disabled])').first();
    if (await opt.count() && await opt.isVisible().catch(() => false)) { await opt.click().catch(() => {}); await settle(t.page, 180); }
    const primary = t.page.locator('.firstlesson-primary:not([disabled])').first();
    if (await primary.count() && await primary.isVisible().catch(() => false)) { await primary.click().catch(() => {}); await settle(t.page, 220); }
    else await settle(t.page, 150);
  }
  await t.step('the save-your-progress account offer appears after the lesson', reachedSaveAsk);
  await t.step('the offer lets you continue without an account',
    await t.page.locator('button').filter({ hasText: /without an account/i }).count() > 0);
  await t.page.locator('button').filter({ hasText: /without an account/i }).first().click().catch(() => {}); await settle(t.page, 900);
  await t.step('declining leaves the user in the app (nav visible, no boundary)',
    /Learn/.test(await t.body()) && !(await t.boundaryShowing()));
}, { seedOpts: false });

// ── A3a · Signed-in FREE user: every tab renders ──
await journey('A3 free user — every tab renders with no crash', 'normal user', async (t) => {
  const tabs = ['/learn', '/today', '/cards', '/browse', '/quiz', '/guide', '/quests', '/shop', '/dating', '/leaderboard'];
  for (const tab of tabs) {
    await t.page.goto(base + tab, { waitUntil: 'networkidle' }); await settle(t.page, 900);
    await t.step(`${tab} renders content, no boundary`, !(await t.boundaryShowing()) && (await t.body()).length > 80, tab);
  }
}, { seedOpts: seedFree() });

// ── A7a · Shop: buy a freeze is CONFIRMED, states its cost + balance ──
await journey('A7 shop — a gem spend requires confirmation stating cost and balance', 'normal user', async (t) => {
  await t.page.goto(base + '/shop', { waitUntil: 'networkidle' }); await settle(t.page, 1000);
  await dismissOverlays(t.page);
  await t.step('the shop renders with a freeze buy button', await t.page.locator('.shop-item').filter({ hasText: 'streak freeze' }).locator('.shop-item-buy').count() > 0);
  await t.page.locator('.shop-item').filter({ hasText: 'streak freeze' }).locator('.shop-item-buy').first().click().catch(() => {}); await settle(t.page, 300);
  const confirm = t.page.locator('.shop-item-confirm');
  await t.step('one click opens a confirmation, does not spend', await confirm.count() === 1);
  const ctext = await confirm.first().innerText().catch(() => '');
  await t.step('the confirmation states the cost (30)', /30/.test(ctext), ctext);
  await t.step('the confirmation states the resulting balance', /gems left/i.test(ctext), ctext);
  await confirm.locator('.shop-item-confirm-no').click().catch(() => {}); await settle(t.page, 200);
  await t.step('cancelling returns to the buy button (no spend)', await t.page.locator('.shop-item-confirm').count() === 0);
}, { seedOpts: seedFree() });

// ── A7b · Freeze cap: unavailable with an honest reason ──
await journey('A7 shop — at the freeze cap the button is unavailable with a reason', 'normal user', async (t) => {
  await t.page.goto(base + '/shop', { waitUntil: 'networkidle' }); await settle(t.page, 1000);
  const item = t.page.locator('.shop-item').filter({ hasText: 'streak freeze' });
  await t.step('the reason names the maximum', /maximum/i.test(await item.locator('.shop-item-reason').innerText().catch(() => '')));
  await t.step('the buy button is disabled at the cap', await item.locator('.shop-item-buy').isDisabled().catch(() => false));
}, { seedOpts: { session: makeSession(makeUser()), state: { progress: {}, stats: ONBOARDED_STATS({ streakFreezes: 5, gems: 900 }) } } });

// ── A6 · Super user: nav, hearts, shop, dating all reflect Super ──
await journey('A6 super user — Super benefits are live across the app', 'paying user', async (t) => {
  await t.page.goto(base + '/shop', { waitUntil: 'networkidle' }); await settle(t.page, 1200);
  await t.step('nav shows Super ✓ (not "Go Super")', /Super ✓/.test(await t.body()));
  await t.step('hearts render as unlimited', /Hearts ∞|∞/.test(await t.body()));
  await t.step('the heart refill is Included, not for sale', await t.page.locator('.shop-item-included').count() > 0 && await t.page.locator('.shop-item').filter({ hasText: 'Refill hearts' }).locator('.shop-item-buy').count() === 0);
  await t.page.goto(base + '/dating', { waitUntil: 'networkidle' }); await settle(t.page, 900);
  await t.step('the Dating section is reachable and not the locked teaser', !/Unlock .* with Super/i.test(await t.body()));
  // Entitlement is SERVER-authoritative: App.jsx applies `ent` last and it is the
  // only source of tier/Super, so a locally seeded tier is overwritten by the
  // subscriptions row. Without this mockOpts the mock returns NO subscription and
  // this journey silently tests a FREE user. (It only ever passed because the cloud
  // merge was being cancelled before `ent` was applied -- see the cloud-init dep fix.)
}, { seedOpts: seedSuper(), mockOpts: { entitlement: 'super' } });

// ── A10 · Dating is LOCKED for a free user ──
// These assertions used to run /18\+/ and /Super/i against the WHOLE page text --
// but SidebarNav renders "Dating 18+" (SidebarNav.jsx:39) and "Go Super"
// (SidebarNav.jsx:102) on every page for every free user, so both matched no matter
// what the Dating surface did. Everything is now scoped to the locked teaser itself
// (DatingSection.jsx:288-336), which is rendered ONLY for a non-Super user.
await journey('A10 dating — locked for a free user behind Super + 18+', 'normal user', async (t) => {
  await t.page.goto(base + '/dating', { waitUntil: 'networkidle' }); await settle(t.page, 1000);
  const lock = t.page.locator('.dating-locked');
  await t.step('the locked teaser is what a free user gets (not the unlocked section)',
    await lock.count() > 0, (await t.body()).slice(0, 160));
  const lockText = await lock.first().innerText().catch(() => '');
  await t.step('the 18+ marking is on the LOCK itself',
    /18\+/.test(lockText), lockText.slice(0, 160));
  await t.step('the lock carries the Super upsell CTA',
    /Unlock .*with Super/i.test(lockText), lockText.slice(0, 160));
  // NB: the hero (.dating-hero, .dating-badge-18) renders for locked users too
  // (DatingSection.jsx:286) -- only these are unlocked-only surfaces.
  await t.step('the paid surface is absent — no interactive Dating content is reachable',
    await t.page.locator('.dating-catgrid, .dating-phrase-thai, .dating-lesson-card, .dating-question-card').count() === 0);
  // DatingSection.jsx:27 promises "No unreviewed Thai is shown" to locked users.
  // Escapes, not literal Thai, so the assertion cannot be silently mangled.
  await t.step('no Thai script leaks into the locked teaser',
    !/[\u0E00-\u0E7F]/.test(lockText), lockText.slice(0, 160));
}, { seedOpts: seedFree() });

// ── A4 · Stage unlock: all stage-1 cards seen → stage 2 becomes reachable ──
// The assertion used to be `/Stage 2/.test(body) || !(await t.boundaryShowing())` --
// an OR with "did not crash", so it could NEVER fail; and the seed wrote ids 1..200
// of which only 57 are actually stage-1 cards, so stage 1 was never complete. Both
// halves are fixed: the seed is derived from the real deck, and the assertion stands
// alone. Mutation-proven by seeding one card short.
const STAGE_1_IDS = CARDS.filter((c) => (c.stage || 1) === 1).map((c) => c.id);
const seenProgress = (ids) => Object.fromEntries(
  ids.map((id) => [id, { interval: 1, reviews: 1, lapses: 0, nextDue: Date.now() + 864e5 }]),
);
await journey('A4 stage unlock — completing stage 1 opens stage 2', 'normal user', async (t) => {
  await t.page.goto(base + '/learn', { waitUntil: 'networkidle' }); await settle(t.page, 1500);
  await dismissOverlays(t.page);
  // The trail renders EVERY stage, so "Stage 2 appears" proves nothing — a LOCKED
  // stage 2 is on the page too. These three all flip when stage 1 is one card short
  // (verified: section title "Stage 1 lessons", no done stage, stage 2 locked).
  const textsOf = (sel) => t.page.locator(sel).allInnerTexts().catch(() => []);
  const done = await textsOf('.learn-trail-stage-done .learn-trail-stage-title');
  const section = await textsOf('.learn-section-title');
  const locked = await textsOf('.learn-trail-stage-locked .learn-trail-stage-title');
  await t.step('stage 1 is marked COMPLETE on the trail',
    done.some((s) => /Stage 1:/.test(s)), `done=${JSON.stringify(done)}`);
  await t.step('the lesson section has advanced to stage 2',
    section.some((s) => /Stage 2 lessons/i.test(s)), `section=${JSON.stringify(section)}`);
  await t.step('stage 2 is NOT among the locked stages',
    !locked.some((s) => /Stage 2:/.test(s)), `locked=${JSON.stringify(locked)}`);
}, {
  seedOpts: {
    session: makeSession(makeUser()),
    // EVERY real stage-1 card seen -- the actual unlock condition (state.js:34).
    state: { progress: seenProgress(STAGE_1_IDS), stats: ONBOARDED_STATS({ currentStage: 1 }) },
  },
});

// ── A6h · Hearts: at 0 the graded Challenge is GATED (the historical "hearts don't stop" bug) ──
await journey('A6 hearts — at 0 hearts the Challenge is gated, with a free path and refill', 'normal user', async (t) => {
  await t.page.goto(base + '/quiz', { waitUntil: 'networkidle' }); await settle(t.page, 1500);
  await dismissOverlays(t.page);
  const body = await t.body();
  await t.step('the out-of-hearts gate is shown', /Out of hearts/i.test(body), body.slice(0, 160));
  await t.step('the regen countdown is surfaced at zero', /Next heart in/i.test(body));
  await t.step('a free path is always offered (learning never blocked)', /still learn|for free/i.test(body));
  await t.step('a gem refill is offered', /Refill/i.test(body));
  await t.step('the graded direction pickers are NOT startable at 0 hearts',
    !/Thai to English Read Thai/i.test(body));
}, { seedOpts: { session: makeSession(makeUser()), state: { progress: (() => { const p = {}; for (let id = 1; id <= 60; id++) p[id] = { interval: 3, reviews: 3, lapses: 0, nextDue: Date.now() + 864e5 }; return p; })(), stats: ONBOARDED_STATS({ hearts: 0 }) } } });

// ── A6r · Heart regen countdown is visible BELOW the cap, not only at zero (Wave 11) ──
await journey('A6 hearts — the regen countdown is visible below the cap, not only at zero', 'normal user', async (t) => {
  await t.page.goto(base + '/quiz', { waitUntil: 'networkidle' }); await settle(t.page, 1500);
  await dismissOverlays(t.page);
  await t.step('the header shows a "+1 in …" regen countdown while below max',
    /\+1 in \d/.test(await t.body()));
}, { seedOpts: { session: makeSession(makeUser()), state: { progress: {}, stats: ONBOARDED_STATS({ hearts: 2 }) } } });

// ── A8 · Checkout return: the activating strip appears ──
await journey('A8 checkout return — the "Activating your Super…" strip appears', 'paying user', async (t) => {
  await t.page.goto(base + '/?super=success&session_id=cs_test_x', { waitUntil: 'networkidle' }); await settle(t.page, 2500);
  await t.step('the payer sees an activating state, not a silent page', /Activating your Super|Still activating/i.test(await t.body()));
}, { seedOpts: seedFree(), mockOpts: { entitlement: 'free' } });

// ── A8b · Celebration fires when the entitlement is live on return ──
await journey('A8 celebration — fires when the entitlement is live on the checkout return', 'paying user', async (t) => {
  await t.page.goto(base + '/?super=success&session_id=cs_test_x', { waitUntil: 'networkidle' }); await settle(t.page, 3000);
  await t.step('the "You\'re now Super!" celebration is shown', /now Super/i.test(await t.body()), (await t.body()).slice(0, 160));
}, { seedOpts: seedSuper(), mockOpts: { entitlement: 'super' } });

// ── A8c · Celebration fires from a previous session (owner's exact case) ──
await journey('A8 celebration — fires on next load after navigating away (owed flag + live entitlement, NO url params)', 'paying user', async (t) => {
  await t.page.goto(base + '/', { waitUntil: 'networkidle' }); await settle(t.page, 3000);
  await t.step('the celebration still fires with no url params', /now Super/i.test(await t.body()), (await t.body()).slice(0, 160));
}, {
  seedOpts: { session: makeSession(makeUser()), state: { progress: {}, stats: ONBOARDED_STATS({ tier: 'super' }) }, extraKeys: { 'thai-fluency-super-celebration-pending-v1': JSON.stringify({ at: Date.now() }) } },
  mockOpts: { entitlement: 'super' },
});

// ── A8d · CONTROL: a Super user with nothing owed does NOT celebrate ──
await journey('A8 control — a Super user with nothing owed does NOT celebrate on every load', 'paying user', async (t) => {
  await t.page.goto(base + '/', { waitUntil: 'networkidle' }); await settle(t.page, 2500);
  await t.step('no celebration is shown when nothing is owed', !/now Super/i.test(await t.body()));
}, { seedOpts: seedSuper(), mockOpts: { entitlement: 'super' } });

// ── A9 · Already-Super user on /plans: the payable CTA is suppressed ──
await journey('A9 already-Super on /plans — the Go Super CTA is not payable', 'paying user', async (t) => {
  await t.page.goto(base + '/plans', { waitUntil: 'networkidle' }); await settle(t.page, 1500);
  await t.step('both Super cards say "already Super"', ((await t.body()).match(/already Super/gi) || []).length >= 2);
  await t.step('no payable premium CTA remains', await t.page.locator('.pl-plan-premium .pl-plan-cta').count() === 0);
}, { seedOpts: seedSuper(), mockOpts: { entitlement: 'super' } });

// ── C1 · Supabase returns 500 — the app still boots honestly ──
await journey('C1 failure mode — Supabase 500 does not crash the app', 'edge case', async (t) => {
  await t.page.goto(base + '/learn', { waitUntil: 'networkidle' }); await settle(t.page, 1500);
  await t.step('the app boots and renders despite a 500 backend', !(await t.boundaryShowing()) && (await t.body()).length > 80);
}, { seedOpts: seedFree(), mockOpts: { restStatus: 500 } });

// ── C2 · Supabase 401 (expired JWT) — no crash ──
await journey('C2 failure mode — Supabase 401 does not crash the app', 'edge case', async (t) => {
  await t.page.goto(base + '/learn', { waitUntil: 'networkidle' }); await settle(t.page, 1500);
  await t.step('the app boots and renders despite a 401 backend', !(await t.boundaryShowing()) && (await t.body()).length > 80);
}, { seedOpts: seedFree(), mockOpts: { restStatus: 401 } });

// ── C3 · billing_events table missing (the CURRENT production state) on the payment path ──
await journey('C3 failure mode — billing_events missing does not crash the checkout return', 'paying user', async (t) => {
  await t.page.goto(base + '/?super=success&session_id=cs_test_x', { waitUntil: 'networkidle' }); await settle(t.page, 2500);
  await t.step('the payment return survives the missing telemetry table', !(await t.boundaryShowing()));
  // "Did not crash" is too weak on its own: a swallowed telemetry error could still
  // abort the activation silently. Assert the payment path actually COMPLETED -- the
  // entitlement is live and the celebration fired -- with the table absent.
  await t.step('the checkout return still COMPLETED (celebration fired) with the table absent',
    /now Super/i.test(await t.body()), (await t.body()).slice(0, 160));
}, { seedOpts: seedSuper(), mockOpts: { entitlement: 'super', billingEventsMissing: true } });

// ── C4 · localStorage throws (private mode / quota) — the app still boots ──
await journey('C4 failure mode — localStorage unavailable does not crash the app', 'edge case', async (t) => {
  await t.page.goto(base + '/learn', { waitUntil: 'networkidle' }); await settle(t.page, 1500);
  await t.step('the app boots with localStorage disabled', !(await t.boundaryShowing()) && (await t.body()).length > 80);
}, { seedOpts: false, breakLocalStorage: true });

// ── C5 · An OLD-SCHEMA localStorage blob (missing Wave 12+ fields) migrates, not crashes ──
await journey('C5 failure mode — an old-schema saved state migrates without crashing', 'edge case', async (t) => {
  await t.page.goto(base + '/learn', { waitUntil: 'networkidle' }); await settle(t.page, 1500);
  await t.step('a pre-Wave-12 saved state loads and the app renders', !(await t.boundaryShowing()) && /Learn/.test(await t.body()));
}, {
  // A deliberately minimal, old-shaped blob: no unlockedAchievements, no tier, no
  // heartsUpdatedAt, no cinematicsWatched — the fields Waves 12-16 added.
  seedOpts: { session: makeSession(makeUser()), state: { progress: { 1: { interval: 1, reviews: 1 } }, stats: { hasOnboarded: true, xp: 50, streak: 2 } } },
});

// ── A11 · Cross-identity: a departed user's sync watermark must not destroy this user's stats ──
// The Wave 12 watermark is how the merge tells a STALE cloud row from a fresh one,
// and it is USER-SCOPED. clearSyncWatermark() only ever ran in handleSignOut, so an
// identity change without an explicit sign-out -- token revocation, refresh failure,
// remote sign-out, or simply a second account on a shared device -- left user A's
// watermark behind. markStatsDirty then re-labelled it with B's id (it spread the
// stored record and rewrote only userId), defeating syncWatermarkFor's identity
// guard. B's GENUINE cloud row was then judged stale and the OWNED fields fell back
// to local, so B's real gems/streak were replaced by whatever this device held.
//
// B's local state is deliberately empty and B's cloud row is rich, so the two
// outcomes are unambiguous:
//   bug present -> row judged stale -> OWNED fields fall back to local -> gems 0
//   bug fixed   -> row is not stale -> cloud is authoritative          -> gems 1200
const DEPARTED_USER_ID = '00000000-0000-4000-8000-0000000000ff';
await journey("A11 cross-identity — a departed user's watermark cannot destroy this user's stats", 'normal user', async (t) => {
  await t.page.goto(base + '/learn', { waitUntil: 'networkidle' }); await settle(t.page, 2800);
  await dismissOverlays(t.page);
  const gems = (await t.page.locator('.topstats-pill-gems .topstats-val').first().innerText().catch(() => '')).trim();
  const streak = (await t.page.locator('.topstats-pill-streak .topstats-val').first().innerText().catch(() => '')).trim();
  await t.step('the stats bar rendered (the merge ran and the app is showing real numbers)',
    gems !== '' || streak !== '', `gems="${gems}" streak="${streak}"`);
  await t.step("this user's cloud GEMS survived the departed user's watermark",
    gems === '1200', `gems pill read "${gems}" -- 0 means the merge judged a genuine cloud row stale`);
  await t.step("this user's cloud STREAK survived",
    streak === '40', `streak pill read "${streak}"`);
}, {
  seedOpts: {
    session: makeSession(makeUser()),   // user B -- the CURRENT identity
    // B has nothing locally: this device belonged to A.
    state: { progress: {}, stats: ONBOARDED_STATS({ gems: 0, streak: 0, streakFreezes: 0 }) },
    extraKeys: {
      // User A's watermark, left behind. Its timestamp is NEWER than B's cloud row,
      // which is exactly what makes B's row look "stale" once the id is re-labelled.
      'thai-fluency-sync-watermark-v1': JSON.stringify({
        dirty: false,
        lastSyncedCloudUpdatedAt: new Date(Date.now() + 3600e3).toISOString(),
        userId: DEPARTED_USER_ID,
      }),
    },
  },
  mockOpts: {
    // B's GENUINE cloud row (snake_case: the columns downloadStats reads,
    // src/lib/cloudStorage.js:132-175). updated_at is OLDER than A's watermark.
    stats: {
      total_xp: 98000, current_streak: 40, longest_streak: 40, gems: 1200,
      streak_freezes: 3, hearts: 5, current_stage: 1, started_stage: 1,
      tutorial_seen: true, updated_at: new Date(Date.now() - 864e5).toISOString(),
    },
  },
});

const { fail } = report();
await browser.close();
if (server) server.close();
process.exit(fail > 0 ? 1 : 0);
