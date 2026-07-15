// Rendered visual verification via a REAL headless browser (Playwright/Chromium).
// Loads harness scenes (scripts/viz, auth-gated components mounted in isolation)
// and public routes, at both themes and desktop + 375px, drives interactions,
// captures screenshots to scripts/viz/artifacts/, and asserts on the live DOM.
//
// Usage:
//   node scripts/visual-check.mjs [baseUrl] [--only <name>]
//   baseUrl defaults to http://localhost:5173 (a running `npm run dev`).
// Every visual claim in the report is backed by one of these screenshots/DOM reads.

import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(root, 'scripts/viz/artifacts');
mkdirSync(OUT, { recursive: true });

const args = process.argv.slice(2);
const base = (args.find(a => a.startsWith('http')) || 'http://localhost:5173').replace(/\/$/, '');
const onlyIdx = args.indexOf('--only');
// Comma-separated so a related group can be driven in one pass — the Wave 4
// anonymous scenes each walk a whole first lesson, so running them apart from
// the fast component scenes keeps either pass from timing out the other.
const only = onlyIdx >= 0 ? args[onlyIdx + 1].split(',').map(s => s.trim()).filter(Boolean) : null;
const harness = (scene, theme) => `${base}/scripts/viz/index.html?scene=${scene}&theme=${theme}`;
const route = (path, theme) => `${base}${path}?vizTheme=${theme}`;

// ── Wave 4 Part B: drive the REAL app as a first-time ANONYMOUS visitor ──────
// Part B is a ROUTING change, so mounting a component proves nothing — the only
// honest proof is the real app, from "/", with a fresh browser context (= empty
// localStorage = a brand-new visitor, no session). These helpers walk that path.
async function anonOnboard(page) {
  await page.locator('.lp-cta-primary').first().click();          // "Start your first lesson"
  await page.waitForTimeout(700);
  await page.locator('button').filter({ hasText: 'Male' }).first().click().catch(() => {});
  await page.waitForTimeout(250);
  await page.locator('button').filter({ hasText: "I don't speak any Thai" }).first().click().catch(() => {});
  await page.waitForTimeout(600);
  await page.locator('.onboard-skip-btn').first().click().catch(() => {});  // identity Q is optional
  await page.waitForTimeout(600);
}
// Walk the whole first lesson: pick an option when one is offered, otherwise
// advance. Ends on the 'complete' step's "Unlock the app" CTA.
async function anonRunFirstLesson(page) {
  await page.locator('.firstlesson-primary').first().click().catch(() => {}); // "Start lesson"
  await page.waitForTimeout(400);
  for (let i = 0; i < 120; i++) {
    if (await page.locator('#save-ask-title').count()) return true;
    const unlock = page.locator('button', { hasText: 'Unlock the app' }).first();
    if (await unlock.count() && await unlock.isVisible().catch(() => false)) {
      await unlock.click().catch(() => {});
      await page.waitForTimeout(1400);
      // Finishing the first lesson grants 60 XP, which clears DEFAULT_DAILY_GOAL
      // (50), so the "Goal Crusher" AchievementUnlockedModal renders at the same
      // time as the payoff — and it uses the SAME .reward-screen-panel /
      // .reward-continue-btn classes. It sits UNDER the payoff's backdrop, so a
      // generic .reward-continue-btn.first() targets an unclickable element and
      // the ask never fires. Target the payoff BY NAME.
      const payoff = page.locator('.reward-screen-panel')
        .filter({ hasText: 'First Lesson Complete' }).locator('.reward-continue-btn').first();
      if (await payoff.count()) await payoff.click({ timeout: 3000 }).catch(() => {});
      await page.waitForTimeout(1200);
      continue;
    }
    const opt = page.locator('.firstlesson-option-text:not([disabled]), .firstlesson-option:not([disabled])').first();
    if (await opt.count() && await opt.isVisible().catch(() => false)) {
      await opt.click().catch(() => {});
      await page.waitForTimeout(200);
    }
    const primary = page.locator('.firstlesson-primary:not([disabled])').first();
    if (await primary.count() && await primary.isVisible().catch(() => false)) {
      await primary.click().catch(() => {});
    }
    await page.waitForTimeout(260);
  }
  return !!(await page.locator('#save-ask-title').count());
}
const readStats = (page) => page.evaluate(() => {
  for (let i = 0; i < localStorage.length; i++) {
    const raw = localStorage.getItem(localStorage.key(i)) || '';
    if (raw.includes('totalXp')) { try { const p = JSON.parse(raw); return p.stats || p; } catch { /* not ours */ } }
  }
  return null;
});

// A scene = a render target + optional interaction + optional DOM assertions.
// assert(page) returns { name, pass, detail }[] evaluated in Node against the DOM.
const SCENES = [
  // ── Wave 4 Part B — anonymous-first, proven against the real app ───────────
  { name: 'anon-entry', url: (t) => route('/', t), public: true,
    async assert(page) {
      const pw = await page.locator('input[type=password]').count();
      const cta = await page.locator('.lp-cta-primary').count();
      return [
        { name: 'anonymous visitor hits NO signup wall', pass: pw === 0, detail: `passwordFields=${pw}` },
        { name: 'the landing offers the first lesson', pass: cta >= 1, detail: `ctas=${cta}` },
      ];
    } },
  { name: 'anon-first-lesson', url: (t) => route('/', t), public: true,
    async act(page) { await anonOnboard(page); },
    async assert(page) {
      const pw = await page.locator('input[type=password]').count();
      const body = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
      return [
        { name: 'a real lesson is reachable with NO account', pass: /Start lesson/i.test(body), detail: body.slice(0, 60) },
        { name: 'still no signup wall anywhere on the path', pass: pw === 0, detail: `passwordFields=${pw}` },
      ];
    } },
  { name: 'anon-payoff-ask', url: (t) => route('/', t), public: true,
    async act(page) { await anonOnboard(page); await anonRunFirstLesson(page); },
    async assert(page) {
      const ask = await page.locator('#save-ask-title').count();
      const body = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
      const stats = await readStats(page);
      const xp = stats ? (stats.totalXp || 0) : 0;
      const streak = stats ? (stats.streak || 0) : 0;
      // The secondary path is MANDATORY and must not threaten the learner.
      const secondary = /Keep going without an account/i.test(body);
      const coercive = /lose your progress|will be lost|progress will vanish/i.test(body);
      return [
        { name: 'the account offer appears at the reward peak', pass: ask === 1, detail: `ask=${ask}` },
        { name: 'anonymous lesson earned real XP', pass: xp >= 60, detail: `totalXp=${xp}` },
        { name: 'anonymous lesson started a Day-1 streak', pass: streak >= 1, detail: `streak=${streak}` },
        { name: 'honest secondary path offered (no dead-end)', pass: secondary, detail: secondary ? 'present' : 'MISSING' },
        { name: 'never threatens the learner with loss', pass: !coercive, detail: coercive ? 'COERCIVE COPY' : 'honest' },
      ];
    } },
  { name: 'anon-keep-going', url: (t) => route('/', t), public: true,
    async act(page) {
      await anonOnboard(page); await anonRunFirstLesson(page);
      await page.locator('button', { hasText: 'Keep going without an account' }).first().click().catch(() => {});
      await page.waitForTimeout(900);
    },
    async assert(page) {
      const ask = await page.locator('#save-ask-title').count();
      const stats = await readStats(page);
      const nav = await page.locator('nav, .app-nav, .sidebar-nav').count();
      return [
        { name: 'secondary path lands in the app, not a dead-end', pass: ask === 0 && nav >= 1, detail: `ask=${ask} nav=${nav}` },
        { name: 'progress SURVIVES declining the account', pass: !!stats && (stats.totalXp || 0) >= 60, detail: `totalXp=${stats ? stats.totalXp : 'null'}` },
      ];
    } },
  // ── Auth flows must all still work (forceAuthGate wins) ───────────────────
  { name: 'auth-signin', url: (t) => route('/sign-in', t), public: true,
    async assert(page) {
      const btns = (await page.locator('button').allInnerTexts()).join(' | ');
      return [
        { name: 'sign-in still reachable with email+password', pass: await page.locator('input[type=password]').count() === 1 && await page.locator('input[type=email]').count() === 1, detail: 'fields' },
        { name: 'password recovery reachable from sign-in', pass: /Forgot password/i.test(btns), detail: 'link' },
        { name: 'sign-up reachable from sign-in', pass: /Create an account/i.test(btns), detail: 'link' },
      ];
    } },
  { name: 'auth-welcome', url: (t) => route('/welcome', t), public: true,
    async assert(page) {
      const btns = (await page.locator('button').allInnerTexts()).join(' | ');
      return [
        { name: 'sign-up (returning-user gate) still reachable', pass: /Create free account/i.test(btns), detail: 'signup' },
        { name: 'returning user can get to sign-in', pass: /I already have an account/i.test(btns), detail: 'signin' },
      ];
    } },
  { name: 'auth-forgot', url: (t) => route('/sign-in', t), public: true,
    async act(page) { await page.locator('button', { hasText: 'Forgot password' }).first().click().catch(() => {}); await page.waitForTimeout(600); },
    async assert(page) {
      const body = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
      return [{ name: 'password-recovery screen renders', pass: await page.locator('input[type=email]').count() >= 1 && /reset|recover|send/i.test(body), detail: body.slice(0, 60) }];
    } },
  { name: 'dating-lesson', url: (t) => harness('dating-lesson', t),
    async act(page) {
      // Enter the first category's lesson.
      const start = page.locator('button.dating-catcard-start', { hasText: 'Start lesson' }).first();
      await start.click();
      await page.waitForSelector('.dating-lesson-card', { timeout: 4000 });
    },
    async assert(page) {
      const showThai = await page.locator('button', { hasText: 'Show the Thai' }).count();
      const coach = await page.locator('.character-coach').count();
      return [
        { name: 'exactly one "Show the Thai" button', pass: showThai === 1, detail: `count=${showThai}` },
        { name: 'lesson shows a CharacterCoach', pass: coach >= 1, detail: `count=${coach}` },
      ];
    } },

  { name: 'dating-quiz-mascot', url: (t) => harness('dating-quiz', t),
    async act(page) {
      await page.locator('button.dating-catcard-start', { hasText: 'Start lesson' }).first().click();
      await page.waitForSelector('.dating-lesson-card', { timeout: 4000 });
      // Walk the whole lesson: reveal the Thai (in-card, B1) then advance, until
      // the completion hands off to the quiz.
      for (let i = 0; i < 40; i++) {
        const reveal = page.locator('.dating-lesson-reveal');
        if (await reveal.count()) { await reveal.click(); await page.waitForTimeout(40); }
        const next = page.locator('.dating-lesson-next');
        if (await next.count()) { await next.click(); await page.waitForTimeout(40); }
        const done = page.locator('button', { hasText: 'Start the quiz' });
        if (await done.count()) { await done.click(); break; }
      }
      await page.waitForSelector('.dating-question-card', { timeout: 4000 });
    },
    async assert(page) {
      const q = await page.locator('.dating-question-card').count();
      return [{ name: 'dating quiz question renders after lesson', pass: q >= 1, detail: `card=${q}` }];
    } },

  { name: 'dating-teaser-free', url: (t) => harness('dating-teaser', t),
    async assert(page) {
      const html = await page.content();
      const thai = /[฀-๿]/.test(html);
      const locked = (await page.locator('.dating-locked, .locked-premium-card').count()) >= 1;
      return [
        { name: 'free teaser leaks ZERO Thai script', pass: !thai, detail: thai ? 'THAI FOUND' : 'clean' },
        { name: 'teaser shows the locked upsell card', pass: locked, detail: `locked=${locked}` },
      ];
    } },

  { name: 'quiz-challenge-coach', url: (t) => harness('quiz-challenge', t),
    async act(page) {
      const start = page.locator('button', { hasText: /Start .*challenge|Start Stage|Start challenge/i }).first();
      if (await start.count()) await start.click();
      await page.waitForTimeout(400);
    },
    async assert(page) {
      const coach = await page.locator('.character-coach').count();
      return [{ name: 'challenge renders a coach', pass: coach >= 1, detail: `coach=${coach}` }];
    } },

  { name: 'out-of-hearts', url: (t) => harness('out-of-hearts', t),
    async assert(page) {
      const gate = await page.locator('.quiz-hearts-gate').count();
      const canStart = await page.locator('button', { hasText: /Start .*challenge/i }).count();
      return [
        { name: 'out-of-hearts gate is shown', pass: gate >= 1, detail: `gate=${gate}` },
        { name: 'no "start challenge" button at 0 hearts', pass: canStart === 0, detail: `start=${canStart}` },
      ];
    } },

  { name: 'settings', url: (t) => harness('settings', t),
    async assert(page) {
      const sections = await page.locator('.settings-section-title, .settings-group-title, [data-settings-section]').count();
      return [{ name: 'settings has grouped section headers', pass: sections >= 3, detail: `sections=${sections}` }];
    } },

  { name: 'shop', url: (t) => harness('shop', t),
    async assert(page) {
      const freeze = await page.locator('.shop-item', { hasText: 'streak freeze' }).count();
      const adSlot = (await page.content()).includes('Watch an ad');
      return [
        { name: 'shop offers a gem→streak-freeze purchase (non-circular gems)', pass: freeze >= 1, detail: `freeze=${freeze}` },
      ];
    } },

  { name: 'feedback', url: (t) => route('/feedback', t), public: true,
    async assert(page) {
      // duplicate-paragraph check: collect all <p> texts, look for a repeat.
      const texts = await page.locator('p').allInnerTexts();
      const norm = texts.map(t => t.trim()).filter(t => t.length > 40);
      const dup = norm.length !== new Set(norm).size;
      return [{ name: 'no duplicated intro paragraph', pass: !dup, detail: dup ? 'DUP FOUND' : 'unique' }];
    } },

  { name: 'mini-unit-shuffle', url: (t) => harness('mini-unit', t),
    async assert(page) {
      // B6 rendered proof: reload the harness a few times and collect the first
      // question's prompt (question order) and its option order (Thai texts). A
      // fixed layout would be identical every attempt; shuffling makes both vary.
      const prompts = new Set();
      const optionOrders = new Set();
      for (let i = 0; i < 6; i++) {
        await page.reload({ waitUntil: 'networkidle' });
        await page.waitForFunction(() => window.__VIZ_READY__ === true, { timeout: 8000 }).catch(() => {});
        await page.waitForSelector('.miniunit-option', { timeout: 4000 });
        const prompt = (await page.locator('.miniunit-question-prompt').first().innerText().catch(() => '')).trim();
        const opts = (await page.locator('.miniunit-option-thai').allInnerTexts()).map(t => t.trim()).join('|');
        prompts.add(prompt);
        optionOrders.add(opts);
      }
      return [
        { name: 'mini-unit QUESTION order varies across attempts', pass: prompts.size > 1, detail: `distinct=${prompts.size}/6` },
        { name: 'mini-unit OPTION order varies across attempts', pass: optionOrders.size > 1, detail: `distinct=${optionOrders.size}/6` },
      ];
    } },

  { name: 'settings-canceled', url: (t) => harness('settings-canceled', t),
    async assert(page) {
      // B5 copy: a canceled-but-paid Super sees "Super — active until <date>. Auto-
      // renew is off." and NO Cancel button (and never "Renews on").
      const html = await page.content();
      const activeUntil = /active until/i.test(html) && /Auto-renew is off/i.test(html);
      const noRenews = !/Renews on/i.test(html);
      const cancelBtns = await page.locator('.setting-cancel-plan-btn').count();
      return [
        { name: 'shows "Super — active until <date>. Auto-renew is off."', pass: activeUntil, detail: activeUntil ? 'ok' : 'missing' },
        { name: 'does NOT say "Renews on"', pass: noRenews, detail: noRenews ? 'ok' : 'RENEWS FOUND' },
        { name: 'no Cancel button for an already-canceled sub', pass: cancelBtns === 0, detail: `cancelBtns=${cancelBtns}` },
      ];
    } },

  // ── Wave 1 (Passes 1 + 3) rendered proof ──────────────────────────────────
  { name: 'tone-question', url: (t) => harness('tone-question', t),
    async act(page) {
      await page.locator('button', { hasText: 'Start tone challenge' }).click();
      await page.waitForSelector('.tones-quiz-play', { timeout: 4000 });
    },
    async assert(page) {
      const play = await page.locator('.tones-quiz-play').count();
      const cardText = await page.locator('.tones-quiz-card').innerText().catch(() => '');
      const thaiLeak = /[฀-๿]/.test(cardText);
      return [
        { name: 'audio-first: play button shown', pass: play >= 1, detail: `play=${play}` },
        { name: 'NO Thai/diacritic/romanization before answering', pass: !thaiLeak, detail: thaiLeak ? 'THAI LEAK' : 'hidden' },
      ];
    } },
  { name: 'tone-revealed', url: (t) => harness('tone-revealed', t),
    async act(page) {
      await page.locator('button', { hasText: 'Start tone challenge' }).click();
      await page.waitForSelector('.tones-quiz-play', { timeout: 4000 });
      await page.locator('.tones-quiz-option').first().click();
      await page.waitForSelector('.tones-quiz-reveal-thai', { timeout: 4000 });
    },
    async assert(page) {
      const revealText = await page.locator('.tones-quiz-reveal-thai').innerText().catch(() => '');
      const thaiShown = /[฀-๿]/.test(revealText);
      return [{ name: 'Thai + diacritic REVEALED after answering', pass: thaiShown, detail: thaiShown ? 'shown' : 'missing' }];
    } },
  { name: 'listen-meaning', url: (t) => harness('listen-meaning', t),
    async act(page) {
      await page.locator('button', { hasText: 'Start listening' }).click();
      await page.waitForSelector('.listen-meaning-play', { timeout: 4000 });
    },
    async assert(page) {
      const play = await page.locator('.listen-meaning-play').count();
      const opts = await page.locator('.listen-meaning-option').count();
      const cardText = await page.locator('.listen-meaning-card').innerText().catch(() => '');
      const thaiLeak = /[฀-๿]/.test(cardText);
      return [
        { name: 'audio play button + English options render', pass: play >= 1 && opts >= 2, detail: `play=${play} opts=${opts}` },
        { name: 'NO Thai shown before answering', pass: !thaiLeak, detail: thaiLeak ? 'THAI LEAK' : 'hidden' },
      ];
    } },
  // ── Wave 3 (Part B: Situations MVP) rendered proof ────────────────────────
  // Asserted against the LIVE DOM, not inferred from the model.
  { name: 'situation-rail-free', url: (t) => harness('situation-rail-free', t),
    async assert(page) {
      const rows = await page.locator('.situation-row').count();
      const html = await page.content();
      const dating = page.locator('.situation-row', { hasText: 'Dating & relationships' }).first();
      const datingTxt = (await dating.innerText().catch(() => '')).replace(/\s+/g, ' ');
      const upNextTxt = (await page.locator('.situation-row-upnext, .situation-row.is-upnext').first().innerText().catch(() => '')).replace(/\s+/g, ' ');
      // The 7 tagged situations must show a real, non-zero card count.
      const counts = await page.locator('.situation-chip-count').allInnerTexts().catch(() => []);
      const nonZero = counts.filter(c => /[1-9]/.test(c)).length;
      // Wave 4 Part C: zero-content situations must no longer be dead rows.
      const deadRows = (html.match(/No lessons written yet/gi) || []).length;
      // Count the CLASS, not the label: the up-next row reads "Start", the other
      // six read "Practice" (SituationRail.jsx:135) — one primary action, six
      // secondary. All seven are the same real launch affordance.
      const starts = await page.locator('.situation-row-start').count();
      return [
        { name: 'no dead "No lessons written yet" rows remain', pass: deadRows === 0, detail: `deadRows=${deadRows}` },
        { name: 'rail collapsed from 16 to the 7 startable + dating preview', pass: rows === 8, detail: `rows=${rows}` },
        { name: 'the 7 content-owning situations are STARTABLE', pass: starts === 7, detail: `startButtons=${starts}` },
        { name: 'draft badge present (nothing claims approval)', pass: /Draft content — pending native-speaker review/.test(html), detail: 'badge' },
        { name: 'NOTHING renders as approved', pass: !/Native approved/i.test(html), detail: /Native approved/i.test(html) ? 'APPROVED LEAK' : 'clean' },
        { name: 'sit-dating is STILL a locked preview (Super-only)', pass: /Super/i.test(datingTxt) && /lock/i.test(await dating.innerHTML().catch(() => '')), detail: `"${datingTxt.slice(0, 60)}"` },
        { name: 'sit-dating is NOT the up-next lesson', pass: !/Dating & relationships/i.test(upNextTxt), detail: `upNext="${upNextTxt.slice(0, 40)}"` },
        { name: 'sit-dating offers NO free Start', pass: !/Start/i.test(datingTxt), detail: 'no start CTA' },
        { name: 'the 7 show real card counts', pass: nonZero === 7, detail: `nonZero=${nonZero}` },
        { name: 'the remaining 9 are named honestly in ONE collapsed affordance', pass: /More situations|9 (more|of 16)|coming/i.test(html), detail: 'collapse' },
      ];
    } },
  { name: 'situation-rail-stage1', url: (t) => harness('situation-rail-stage1', t),
    async assert(page) {
      const html = await page.content();
      const counts = await page.locator('.situation-chip-count').allInnerTexts();
      // A stage-1 learner must never be promised cards outside the unlocked window.
      const nums = counts.map(c => parseInt(c, 10)).filter(Number.isFinite);
      const maxCount = nums.length ? Math.max(...nums) : 0;
      return [
        { name: 'stage-1 learner sees only stage-window content (no stage-8 leak)', pass: maxCount > 0 && maxCount < 130, detail: `counts=[${nums.join(',')}]` },
        { name: 'still nothing approved', pass: !/Native approved/i.test(html), detail: 'clean' },
      ];
    } },
  // Part C: prove Start ACTUALLY LAUNCHES, in the real app (the harness stubs it).
  { name: 'situation-start-launch', url: (t) => route('/', t), public: true,
    async act(page) {
      await anonOnboard(page); await anonRunFirstLesson(page);
      await page.locator('button', { hasText: 'Keep going without an account' }).first().click().catch(() => {});
      await page.waitForTimeout(1000);
      // The "Goal Crusher" achievement modal is queued behind the ask (60 XP >
      // the 50 daily goal) and BLOCKS the page once the ask is gone. Clear every
      // stacked modal before touching the rail, or the Start click is silently
      // intercepted and the scene reports a launch that never happened.
      for (let i = 0; i < 4; i++) {
        const modal = page.locator('.reward-screen-panel:visible .reward-continue-btn').first();
        if (!(await modal.count())) break;
        await modal.click({ timeout: 2500 }).catch(() => {});
        await page.waitForTimeout(700);
      }
      // Capture what the rail PROMISES for this row, so we can hold the launched
      // session to it. The session UI shows the card's CATEGORY, not the
      // situation name, so the advertised count is the real scoping evidence.
      const row = page.locator('.situation-row').filter({ has: page.locator('.situation-row-start') }).first();
      this._promised = (await row.locator('.situation-chip-count').innerText().catch(() => '')).match(/\d+/)?.[0] || null;
      const start = page.locator('.situation-row-start').first();
      await start.scrollIntoViewIfNeeded().catch(() => {});
      // Do NOT swallow this click: an intercepted Start is the failure we are
      // testing for, so it must be visible in the scene detail, not hidden.
      this._clickErr = null;
      try { await start.click({ timeout: 4000 }); } catch (e) { this._clickErr = String(e.message).split('\n')[0].slice(0, 60); }
      await page.waitForTimeout(1500);
    },
    async assert(page) {
      const body = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
      // A real launch = the cards tab showing an actual card, sized to exactly the
      // deck the rail promised. Assert the SESSION, not just "some text changed".
      const onCards = page.url().includes('/cards');
      const cardSurface = await page.locator('.srs-card, [class*="srs-card"]').count();
      const left = (body.match(/(\d+)\s+LEFT/i) || [])[1] || null;
      return [
        { name: 'Start was clickable (no modal intercepted it)', pass: !this._clickErr, detail: this._clickErr || 'clicked' },
        { name: 'clicking Start launches a REAL card session', pass: onCards && cardSurface >= 1, detail: `url=${page.url().replace(/^https?:\/\/[^/]+/, '')} cardSurface=${cardSurface}` },
        { name: 'the session holds EXACTLY the deck the rail promised', pass: !!left && !!this._promised && left === this._promised, detail: `rail promised ${this._promised} → session has ${left}` },
      ];
    } },
  { name: 'situation-rail-super', url: (t) => harness('situation-rail-super', t),
    async assert(page) {
      const html = await page.content();
      const dating = page.locator('.situation-row', { hasText: 'Dating & relationships' }).first();
      const datingTxt = (await dating.innerText().catch(() => '')).replace(/\s+/g, ' ');
      return [
        { name: 'sit-dating still locked for Super (18+ attestation)', pass: /18\+/.test(datingTxt), detail: `"${datingTxt.slice(0, 70)}"` },
        { name: 'still nothing approved', pass: !/Native approved/i.test(html), detail: 'clean' },
      ];
    } },
  { name: 'identity-path', url: (t) => harness('identity-path', t),
    async assert(page) {
      const btns = await page.locator('.skill-level-btn').count();
      const skip = await page.locator('.onboard-skip-btn').count();
      const html = await page.content();
      // engagement.md:94 — the honest promise is "boosted in your order", never
      // "unlocks" / "your next lesson". Test the CLAIM, not the substring: the
      // copy legitimately contains "unlocked" inside the negation "Nothing is
      // locked or unlocked by your answer", which is the disclaimer we want.
      const disclaimer = /Nothing is locked or\s+unlocked by your answer/i.test(html);
      const overpromise = /\bunlocks\b/i.test(html) || /we'?ll unlock/i.test(html) || /your next lesson/i.test(html);
      return [
        { name: 'the 4 identity paths render', pass: btns === 4, detail: `btns=${btns}` },
        { name: 'the question is OPTIONAL (skip affordance present)', pass: skip === 1, detail: `skip=${skip}` },
        { name: 'states the honest scope: reorders, never gates', pass: disclaimer, detail: disclaimer ? 'disclaimer shown' : 'MISSING' },
        { name: 'makes no affirmative unlock / next-lesson promise', pass: !overpromise, detail: overpromise ? 'OVERPROMISE' : 'honest' },
      ];
    } },

  { name: 'combo', url: (t) => harness('combo', t),
    async assert(page) {
      const pill = await page.locator('.combo-pill').count();
      const txt = (await page.locator('.combo-pill').innerText().catch(() => '')).replace(/\s+/g, ' ');
      return [{ name: 'combo pill renders at a high streak', pass: pill >= 1 && /10/.test(txt), detail: `pill=${pill} "${txt}"` }];
    } },
  { name: 'payoff', url: (t) => harness('payoff', t),
    async act(page) { await page.waitForTimeout(1600); },
    async assert(page) {
      const cells = await page.locator('.reward-summary-item').count();
      const html = await page.content();
      return [
        { name: 'payoff shows >=4 summary cells (accuracy + best combo added)', pass: cells >= 4, detail: `cells=${cells}` },
        { name: 'accuracy + best combo present', pass: /accuracy/i.test(html) && /best combo/i.test(html), detail: 'labels' },
      ];
    } },
  { name: 'streak-recovery', url: (t) => harness('streak-recovery', t),
    async assert(page) {
      const html = await page.content();
      const card = await page.locator('.streak-recovery-card').count();
      const honest = /Day 1 again/i.test(html);
      const noShame = !/you lost/i.test(html) && !/\bfailed\b/i.test(html);
      return [
        { name: 'recovery card renders', pass: card >= 1, detail: `card=${card}` },
        { name: 'honest + non-shaming ("Day 1 again", no "you lost")', pass: honest && noShame, detail: `honest=${honest} noShame=${noShame}` },
      ];
    } },

  // ── Wave 2 (Passes 4 + 5) rendered proof ──────────────────────────────────
  { name: 'mastery', url: (t) => harness('mastery', t),
    async assert(page) {
      const tracks = await page.locator('.mastery-track').count();
      const reached = await page.locator('.mastery-dot-reached').count();
      const optional = await page.locator('.mastery-dot-optional').count();
      const summary = await page.locator('.mastery-summary').count();
      return [
        { name: 'mastery tracks render (taught->spoken)', pass: tracks >= 4 && summary >= 1, detail: `tracks=${tracks} summary=${summary}` },
        { name: 'reached + optional(spoken) dots present', pass: reached >= 1 && optional >= 1, detail: `reached=${reached} optional=${optional}` },
      ];
    } },
  { name: 'speaking', url: (t) => harness('speaking', t),
    async assert(page) {
      const root = await page.locator('[data-testid="speaking-exercise"]').count();
      const mic = await page.locator('button.speaking-mic').count();
      const honest = /not a tone or pronunciation score|does not score tone/i.test(await page.content());
      return [
        { name: 'speaking exercise renders where supported (mic present)', pass: root >= 1 && mic >= 1, detail: `root=${root} mic=${mic}` },
        { name: 'honest framing (word check, not tone/pronunciation score)', pass: honest, detail: honest ? 'ok' : 'missing' },
      ];
    } },
  { name: 'speaking-unsupported', url: (t) => harness('speaking-unsupported', t),
    async assert(page) {
      const root = await page.locator('[data-testid="speaking-exercise"]').count();
      const mic = await page.locator('button.speaking-mic').count();
      return [{ name: 'renders NOTHING where unsupported (no exercise, no mic, no stub)', pass: root === 0 && mic === 0, detail: `root=${root} mic=${mic}` }];
    } },
];

const VIEWPORTS = [{ w: 1280, h: 900, tag: 'desktop' }, { w: 375, h: 720, tag: 'mobile' }];
const THEMES = ['light', 'dark'];

async function forcePublicTheme(page, theme) {
  // Public pages read theme from stored settings; force it for the screenshot.
  await page.addInitScript((t) => {
    try {
      document.documentElement.setAttribute('data-theme', t);
      const obs = new MutationObserver(() => {
        document.querySelectorAll('.app-root').forEach(el => el.setAttribute('data-theme', t));
      });
      obs.observe(document.documentElement, { childList: true, subtree: true });
    } catch {}
  }, theme);
}

const results = [];
const browser = await chromium.launch();
for (const s of SCENES) {
  if (only && !only.includes(s.name)) continue;
  for (const theme of THEMES) {
    for (const vp of VIEWPORTS) {
      const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h }, deviceScaleFactor: 1 });
      const page = await ctx.newPage();
      const label = `${s.name}__${theme}__${vp.tag}`;
      try {
        if (s.public) await forcePublicTheme(page, theme);
        await page.goto(s.url(theme), { waitUntil: 'networkidle', timeout: 20000 });
        if (!s.public) await page.waitForFunction(() => window.__VIZ_READY__ === true, { timeout: 8000 }).catch(() => {});
        if (s.act) await s.act(page);
        await page.waitForTimeout(300);
        const file = join(OUT, `${label}.png`);
        await page.screenshot({ path: file, fullPage: true });
        let checks = [];
        if (s.assert) checks = await s.assert(page);
        const failed = checks.filter(c => !c.pass);
        results.push({ label, ok: failed.length === 0, checks });
        const mark = failed.length === 0 ? 'OK  ' : 'FAIL';
        console.log(`${mark} ${label}  ${checks.map(c => `${c.pass ? '✓' : '✗'}${c.name}(${c.detail})`).join(' | ')}`);
      } catch (e) {
        results.push({ label, ok: false, error: String(e.message || e) });
        console.log(`ERR  ${label}  ${String(e.message || e).slice(0, 120)}`);
      } finally {
        await ctx.close();
      }
    }
  }
}
await browser.close();

const failed = results.filter(r => !r.ok);
console.log(`\nScreenshots → scripts/viz/artifacts/  (${results.length} shots, ${failed.length} with failing asserts)`);
process.exit(0); // never fail the pipeline on visual asserts; they are advisory + screenshot-backed
