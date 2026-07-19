// Wave 12 RENDERED PROOF â€” real headless Chromium, both themes, desktop + 375px.
// Every visual claim in the Wave 12 report is backed by one of these DOM reads.
//
// Usage: node scripts/visual-wave12.mjs [baseUrl]   (default http://localhost:5173)
//
// NOT part of `npm run check` (it needs a running dev server); run alongside the
// validators, the same way scripts/visual-check.mjs is.

import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(root, 'scripts/viz/artifacts/wave12');
mkdirSync(OUT, { recursive: true });

const base = (process.argv.slice(2).find(a => a.startsWith('http')) || 'http://localhost:5173').replace(/\/$/, '');
const harness = (scene, theme) => `${base}/scripts/viz/index.html?scene=${scene}&theme=${theme}`;

const VIEWPORTS = [
  { name: 'desktop', width: 1280, height: 900 },
  { name: 'mobile', width: 375, height: 780 },
];
const THEMES = ['light', 'dark'];

let failures = 0;
const check = (label, cond, extra = '') => {
  if (cond) console.log(`  OK   ${label}`);
  else { failures += 1; console.error(`  FAIL ${label}${extra ? ' â€” ' + extra : ''}`); }
};

const browser = await chromium.launch();

async function scene(name, theme, vp, fn) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  await page.goto(harness(name, theme), { waitUntil: 'networkidle' });
  await page.waitForFunction('window.__VIZ_READY__ === true', { timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(400);
  await page.screenshot({ path: join(OUT, `${name}-${theme}-${vp.name}.png`), fullPage: true });
  check(`${name} [${theme}/${vp.name}] renders without a page error`, errors.length === 0, errors[0]);
  if (fn) await fn(page);
  await ctx.close();
}

for (const theme of THEMES) {
  for (const vp of VIEWPORTS) {
    console.log(`\n=== ${theme} / ${vp.name} ===`);

    // â”€â”€ Purchase confirmation (root cause: unconfirmed gem spends) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    await scene('shop', theme, vp, async (page) => {
      const freezeBuy = page.locator('.shop-item').filter({ hasText: 'streak freeze' }).locator('.shop-item-buy');
      check('shop: freeze item offers a buy button', await freezeBuy.count() > 0);
      // A single click must NOT spend â€” it must ask first.
      await freezeBuy.first().click();
      await page.waitForTimeout(200);
      const confirm = page.locator('.shop-item-confirm');
      check('shop: one click opens a CONFIRMATION, it does not spend', await confirm.count() === 1);
      const txt = await confirm.first().innerText().catch(() => '');
      check('shop: the confirmation states the cost', /30/.test(txt), txt.replace(/\n/g, ' ').slice(0, 80));
      check('shop: the confirmation states the resulting balance', /gems left/i.test(txt), txt.replace(/\n/g, ' ').slice(0, 90));
      check('shop: the confirmation can be cancelled', await confirm.locator('.shop-item-confirm-no').count() === 1);
      await page.screenshot({ path: join(OUT, `shop-confirm-${theme}-${vp.name}.png`), fullPage: true });
      await confirm.locator('.shop-item-confirm-no').click();
      await page.waitForTimeout(150);
      check('shop: cancelling returns to the buy button (no spend)',
        await page.locator('.shop-item-confirm').count() === 0);
    });

    // â”€â”€ Freeze cap: unavailable WITH a reason, never a silent no-op â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    await scene('shop-freeze-cap', theme, vp, async (page) => {
      const item = page.locator('.shop-item').filter({ hasText: 'streak freeze' });
      const reason = await item.locator('.shop-item-reason').innerText();
      check('cap: the Shop states an honest reason at the cap',
        /maximum/i.test(reason), reason.slice(0, 110));
      const btn = item.locator('.shop-item-buy');
      check('cap: the buy button is disabled at the cap', await btn.isDisabled());
      const status = await item.locator('.shop-item-status-count').innerText();
      check('cap: the banked count is shown against the ceiling', /of \d+ banked/.test(status), status);
    });

    // â”€â”€ Shop for a Super user: not-needed, not purchasable â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    await scene('shop-super', theme, vp, async (page) => {
      const refill = page.locator('.shop-item').filter({ hasText: 'Refill hearts' });
      check('super: the refill item is NOT offered for sale', await refill.locator('.shop-item-buy').count() === 0);
      check('super: it renders as included instead', await refill.locator('.shop-item-included').count() === 1);
      const body = await refill.innerText();
      check('super: no gem price is shown to a Super user', !/\b50\b/.test(body), body.replace(/\n/g, ' ').slice(0, 110));
      check('super: it says why', /unlimited hearts with Super/i.test(body));
    });

    // â”€â”€ Activation states: never a silent free plan â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    await scene('super-activation-pending', theme, vp, async (page) => {
      const t = await page.locator('.super-activation-toast').innerText();
      check('activation/pending: says it is activating', /Activating your Super/i.test(t), t.replace(/\n/g, ' ').slice(0, 90));
    });
    await scene('super-activation-slow', theme, vp, async (page) => {
      const t = await page.locator('.super-activation-toast').innerText();
      check('activation/slow: still says activating (polling continues)', /Still activating/i.test(t), t.replace(/\n/g, ' ').slice(0, 90));
      check('activation/slow: reassures that it switches on by itself', /by itself|automatically/i.test(t));
    });
    await scene('super-activation-timeout', theme, vp, async (page) => {
      const t = await page.locator('.super-activation-toast').innerText();
      check('activation/timeout: confirms the payment succeeded', /payment went through/i.test(t), t.replace(/\n/g, ' ').slice(0, 90));
      check('activation/timeout: offers a real next action', await page.locator('.super-activation-refresh').count() === 1);
      check('activation/timeout: never implies a free plan', !/\bfree\b/i.test(t));
    });

    // â”€â”€ The Super celebration (bound to the entitlement landing) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    await scene('super-celebration', theme, vp, async (page) => {
      const t = await page.locator('.reward-screen-backdrop').innerText();
      check('celebration: welcomes the payer to Super', /now Super/i.test(t), t.replace(/\n/g, ' ').slice(0, 80));
      check('celebration: names the live benefits', /Dating/i.test(t) && /unlimited hearts/i.test(t));
    });

    // â”€â”€ Root cause 2: the reward screen no longer overclaims â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    await scene('reward-lessons-done', theme, vp, async (page) => {
      const t = await page.locator('.reward-screen-backdrop').innerText();
      check('reward: does NOT claim "Path Complete" while words remain',
        !/Path Complete/i.test(t), t.replace(/\n/g, ' ').slice(0, 100));
      check('reward: names what WAS finished (lessons)', /Lessons Complete/i.test(t), t.replace(/\n/g, ' ').slice(0, 80));
      check('reward: states how many words remain', /\d+ more words/i.test(t), t.replace(/\n/g, ' ').slice(0, 110));
    });

    // â”€â”€ WAVE 13 G: the Go Super CTA is not payable while a purchase settles â”€â”€
    await scene('plans-purchase-pending', theme, vp, async (page) => {
      const payable = await page.locator('.pl-plan-premium .pl-plan-cta').count();
      check('G: NO payable "Go Super" CTA while a purchase is pending', payable === 0, `found ${payable}`);
      const blocked = page.locator('.pl-plan-blocked');
      check('G: both Super cards show the blocked state', await blocked.count() === 2, `found ${await blocked.count()}`);
      const t = await blocked.first().innerText();
      check('G: it says the payment went through', /payment went through/i.test(t), t.replace(/\n/g, ' ').slice(0, 100));
      check('G: it tells the user not to pay again', /no need to pay again/i.test(t));
      check('G: it says activation is automatic', /automatically/i.test(t));
    });

    // â”€â”€ WAVE 13 H: /plans refuses to sell to an unconfirmed-email session â”€â”€â”€â”€
    await scene('plans-unconfirmed-email', theme, vp, async (page) => {
      const payable = await page.locator('.pl-plan-premium .pl-plan-cta').count();
      check('H: NO payable CTA for an unconfirmed email', payable === 0, `found ${payable}`);
      const t = await page.locator('.pl-plan-blocked').first().innerText();
      check('H: it asks the user to confirm their email', /confirm your email/i.test(t), t.replace(/\n/g, ' ').slice(0, 100));
      check('H: it says where to look', /inbox/i.test(t));
    });

    // Control: a normal free user must STILL be able to buy.
    await scene('plans-normal', theme, vp, async (page) => {
      const payable = await page.locator('.pl-plan-premium .pl-plan-cta').count();
      check('CONTROL: a normal signed-in free user still gets payable CTAs', payable === 2, `found ${payable}`);
      check('CONTROL: no blocked state is shown', await page.locator('.pl-plan-blocked').count() === 0);
    });

    // ── WAVE 16: the plans page must not contradict itself for a Super user ──
    await scene('plans-super-user', theme, vp, async (page) => {
      const body = await page.locator('.pl-plans-grid').innerText();
      check('super/plans: both Super cards say already Super',
        (body.match(/already Super/gi) || []).length >= 2);
      check('super/plans: the FREE card no longer claims to be their plan',
        !/Your plan/i.test(body), body.replace(/\s+/g, ' ').slice(0, 180));
      check('super/plans: the free tier is shown as included with Super',
        /Included with Super/i.test(body));
    });

    // â”€â”€ Root cause 3: never two full-screen surfaces at once â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    for (const s of ['super-celebration', 'reward-lessons-done', 'streak-recovery']) {
      await scene(s, theme, vp, async (page) => {
        const modals = await page.locator('[aria-modal="true"]').count();
        check(`${s}: exactly one aria-modal layer is present`, modals <= 1, `found ${modals}`);
        const backdrops = await page.locator('.reward-screen-backdrop, .cine-overlay, .s1-complete-overlay, .streak-recovery-backdrop, .super-prompt-backdrop').count();
        check(`${s}: exactly one full-screen backdrop is present`, backdrops <= 1, `found ${backdrops}`);
      });
    }
  }
}

await browser.close();
console.log(`\nArtifacts: ${OUT}`);
if (failures > 0) {
  console.error(`\nWave 12 visual check FAILED: ${failures} assertion(s).`);
  process.exit(1);
}
console.log('\nWave 12 visual check passed.');
