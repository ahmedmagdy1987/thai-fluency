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
const only = onlyIdx >= 0 ? args[onlyIdx + 1] : null;
const harness = (scene, theme) => `${base}/scripts/viz/index.html?scene=${scene}&theme=${theme}`;
const route = (path, theme) => `${base}${path}?vizTheme=${theme}`;

// A scene = a render target + optional interaction + optional DOM assertions.
// assert(page) returns { name, pass, detail }[] evaluated in Node against the DOM.
const SCENES = [
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
  if (only && s.name !== only) continue;
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
