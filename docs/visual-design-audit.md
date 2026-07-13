# Visual Design & Polish Audit — Tuk Talk Thai

**Date:** 2026-07-12 · **Audited at:** `3bbe536` (production-verified) · **Fixes applied at:** this commit
**Method:** Multi-agent visual audit — 3 browser-driven dimensions (real Chrome, ~135 screenshots across light+dark × desktop 1280 + mobile 375) and 3 static token-inventory dimensions, every significant finding **adversarially verified** (recomputing WCAG ratios from the actual token values). 56 agents, 59 findings (39 verified safe-fix, 7 owner-design, 12 info, 5 refuted). This is the first pass to evaluate the app *as a designer* — the owner's sense that it looks "off" is **correct and measurable** (see §4).

**Headline verdict:** the app is not one design system — it is several coexisting ones. The *bones* are good (clean 12-token color system, a genuinely premium landing, unified celebration overlays). What reads "unfinished" is drift on top of those bones: hardcoded colors that ignore the tokens and break in dark mode, an inverted hierarchy on the selling page, and same-purpose components that each reinvent themselves. This pass fixed the highest-impact, lowest-risk of those; the structural unifications (type scale, spacing tokens, card-language merge) are owner-design calls in §7.

---

## 1. Footer audit (owner request) + what was fixed

**Inventory (both themes, desktop + 375px):**

| Surface | Footer? | Verdict |
|---|---|---|
| Landing (`PublicLanding.jsx` `.lp-footer`) | Real jade footer: wordmark + 6 links + copyright | The only true site footer |
| Signed-in app shell (`.sidebar-footer`) | Nav utility group, no marketing footer | **Correct** — an app shell shouldn't carry a landing footer |
| Info/legal pages, **Plans (pricing) page** | **None** | Gap — the pricing page ends in a void with no Terms/Privacy at the bottom (owner-design; adding a shared slim footer is a layout change) |
| AuthGate / Demo | In-card consent/nav lines (not site footers) | Correct-by-context |

**Link inventory:** landing `FOOTER_LINKS` = Plans, Privacy, Terms, Support, Feedback, Account deletion — all 6 resolve to real pages, **no dead links**. Contrast on the jade band all passes AA (floor 4.91:1 on the copyright line). Nothing a paid product strictly *needs* is missing except a proper copyright and (optionally) social + About.

**Fixed this pass:**
- **Copyright had no year and fused the slogan into the legal line.** `© Tuk Talk Thai. Learn Thai the fast and fun way.` → `© {currentYear} Tuk Talk Thai. All rights reserved.` (year via `new Date().getFullYear()`, so it never goes stale; slogan stays in the header lockup where it belongs).
- **Label mismatch for `/delete-account`** — "Account deletion" on the landing/AuthGate but "Delete account" on info pages. Unified to **"Account deletion"** (`PublicInfoPage.jsx`).
- **Social-icon system built (hidden by default)** — see §3.

**Reported (owner-design):** no footer on the Plans/legal pages; the landing's two dead "Coming soon" donation cards (configure the URLs or hide the section).

---

## 2. Social-icon system — how it works & what the owner must do

**Files:** `src/config/socialLinks.js` (config), `src/components/SocialLinks.jsx` (render), wired into the landing footer (`PublicLanding.jsx`), styled in `landing.css` (`.social-links`/`.social-link`).

**How it works:** `SOCIAL_LINKS` lists facebook, instagram, tiktok, youtube, x, line, telegram — **every `url: null`**. `SocialLinks.jsx` renders an inline-SVG icon (no dependency) **only** for entries whose URL passes `isActiveSocialUrl()` (must be an absolute `http(s)://…`). With everything null the component returns `null` → **nothing renders: no icon, no empty row, no gap** (verified in both themes). Each rendered icon is a real `<a>` with `target="_blank"`, `rel="noopener noreferrer"`, an `aria-label`, hover/focus states, and dark-mode-aware colors. A bare handle, `#`, or empty string is rejected by the guard — **never a placeholder or dead link**.

**To enable a platform, the owner edits ONE file — `src/config/socialLinks.js`** — and pastes the real, live URL into that platform's `url:`. Example:
```js
{ key: 'instagram', label: 'Instagram', url: 'https://instagram.com/tuktalkthai' },
```
The icon appears in the footer instantly with zero other code changes. Leave any platform `null` until its URL is confirmed live.

---

## 3. Design-system inventory (the measurable "off")

| Axis | Finding | Numbers |
|---|---|---|
| **Typography** | No type scale; endemic half-pixel sizes | **48 distinct** `font-size` values; ~93 declarations use fractional `X.5px`. `font-weight:800` (62×) and `900` (2×) **never render** — only 400–700 are loaded, so they silently clamp to 700. Orphan weights 650/750. |
| **Spacing** | No spacing scale, **zero spacing tokens** | **47 distinct** literal px values, with a parallel "odd-number" set (7/9/11/13/26px) alongside the 4/8/16 rhythm. |
| **Color** | Clean 12-token system exists but is widely bypassed | **56 distinct hardcoded hex** + 341 raw `rgba()` in CSS; **~47 hexes duplicate a token value** (violating CLAUDE.md's "never hardcode colors" rule). Error-red `#b3261e` alone repeated 28×. |
| **Components** | Several coexisting systems | **4 primary-button identities** (jade `.btn-primary` + 3 separately-coded gold-gradient CTAs at different sizes); **2 card languages** (flat cream-warm vs white-shadowed); **6 modal-backdrop opacities / 5 blurs / 8 z-tiers**; **5 modal close-buttons**; **~20 chip/badge classes** with no shared scale; **~15 radii / ~80 unique shadows**, no radius/shadow tokens; lucide icon sizes span **~20 values** with no step scale. |
| **Contrast (AA)** | Several real failures | `--stone` secondary text 3.25–3.80:1 (both themes); `--gold` micro-labels 2.09–2.25:1 (light); dark-mode white-on-`--jade` 2.67:1; `.auth-suggest-cta` light text on gold in dark; Dating red text near-invisible in dark. |

---

## 4. The 6-surface honest review (verdict + top change)

1. **Landing — Premium.** Cinematic hero, Fraunces + gold-italic headline, gold-gradient CTA, frosted stats band, holds up in dark. *Top change:* none critical; tighten the dead "Coming soon" donation close.
2. **/plans (the selling page) — Was undermining itself; now fixed.** The hierarchy was **inverted** — the Free $0 card carried a gold border + glow while the paid Super cards had no treatment, and the "Best value" Yearly had the *weakest* (ghost) CTA. **Fixed this pass** (§5). *Top remaining:* Free and Super Monthly still share the identical "Available now" tag (quick win, §7a).
3. **Learn — Organized bones, some competing emphasis.** A gold "Bonus" card can out-rank the daily-goal ring near the top. *Top change:* de-emphasize the bonus card relative to the day's primary goal (owner-design). Dark-mode progress tracks were invisible — **fixed this pass**.
4. **Dating (the paid feature) — Does NOT feel premium.** Built from the *exact same* `var(--card-bg)` + `1px var(--line)` cards as the free SRS/quiz surfaces; the only "paid" signal is a badge row. Its danger colors were also hardcoded and failed dark contrast — **fixed this pass** (tokenized to themed `--sev-*`). *Top change (owner-design):* a distinct premium surface treatment (accent frame / richer header) so subscribers feel the upgrade.
5. **Celebrations — Mostly unified; the biggest milestone is the flattest.** Two of three share `.reward-screen-*` with an XP count-up and look good; **Stage 1 Complete** (the largest milestone) runs on a separate, off-brand system and was the flattest. **Partly fixed** (tokenized its colors, Noto-serif→sans-serif, track visibility); full unification onto `.reward-screen-*` is owner-design.
6. **Auth — Was the least-finished; now lifted.** Cards were flat/shadowless next to every marketing card; dark inputs blended into the card; the welcome bullet panel lost its container in dark; `.auth-suggest-cta` failed dark contrast. **All fixed this pass** (§5).

---

## 5. Safe visual fixes applied (files)

**Color tokens & dark-mode / contrast (the biggest "looks off" wins):**
- **9 new design tokens** on `.app-root` + `[data-theme]` (`app.css`): `--gold-ink`, `--gold-deep` (now a real, AA-passing token — was an undefined reference falling back to a low-contrast literal), `--track`, `--stat-streak/-gems/-hearts`, `--sev-strong/-safety/-slang`.
- **Contrast:** `--stone` darkened (light `#8a8275`→`#736c60` = 5.19:1) and lightened (dark `#7a7569`→`#9a958b` = 5.00:1); `--gold-deep` = `#8a6a16` light (5.06:1) / `#E0BD7A` dark; dark-mode **white-on-jade → `var(--cream)`** (2.67:1 → 6.36:1) across 5 rules; `.auth-suggest-cta` → `--gold-ink` (fixes dark).
- **Dark-mode-invisible values fixed:** progress/goal tracks (Learn + reward) → `var(--track)`; Dating severity text (`#b3261e/#2563A8/#7c3aed`) → themed `--sev-*` tokens; topstats stat pills → stat tokens; plans hero got a **dark gradient override** (was rendering an off-brand bright green); dark form inputs get a recessed fill; the dark welcome-bullet panel gets a distinct fill.
- **Token de-duplication:** `#2a2412` gold-ink (13×) → `var(--gold-ink)`; `#e0bd7a` (6×) → `var(--gold)`; stray `'Noto Sans Thai', serif` (2×) → `sans-serif`.

**Selling page (/plans) hierarchy:** `.pl-plan-free` dropped to a neutral border + base elevation; new `.pl-plan-premium` rule gives the Super cards the gold accent + stronger shadow (both themes); the Best-Value **Yearly CTA upgraded from ghost → filled primary**. Verified in both themes — the eye now lands on the paid cards.

**Auth polish:** `.onboard-card` gets a soft shadow (light + dark) so auth cards lift like marketing cards.

**Loading state:** the three cold-load gates (bare blank `<div>`) now render **`AppBootScreen`** — a centered brand wordmark + spinner (reduced-motion aware) so the first frame reads as "loading", not "broken". Added `.sr-only` helper.

**Components:** `.modal-close` gained the missing hover + focus-visible states (and `background: white`→`var(--card-bg)`).

**Footer:** copyright year + "All rights reserved"; label unification; hidden social system (§2–3).

*All 13/13 validators still pass, and all 7 protected copy strings from `3bbe536` are intact (no regression).*

---

## 6. Contrast / accessibility failures found & fixed

| Pair | Before | After | Fix |
|---|---|---|---|
| `--stone` on white/cream (light) | 3.80 / 3.52 | 5.19 / 4.81 | token `#736c60` |
| `--stone` on card/cream (dark) | 3.25 / 3.70 | 5.00 / 5.70 | token `#9a958b` |
| `--gold-deep` label on white (Super/locked) | 3.93 | 5.06 | token `#8a6a16` |
| white text on dark `--jade` (#5BAF7C) | 2.67 | 6.36 | → `var(--cream)` |
| `.auth-suggest-cta` text on gold (dark) | fail | pass | → `--gold-ink` |
| Dating red text (dark) | near-invisible | 5.85 | `--sev-strong` = `#F0837A` |
| Modal close, boot spinner | no focus ring | AA focus-visible | added |

Not fixed (owner-design): `--gold` micro-label chips (the "soon" tags) at 2.09–2.25:1 — darkening them means either a new darker-gold chip token or a chip redesign; recommended in §7a.

---

## 7. Recommendations

### (a) Quick visual wins (small, high-value)
1. **Load the Inter 800 weight** (one line in the `index.html` font URL) so the ~64 elements *authored* at weight 800 (prices, headings, badges) finally render heavy as designed — instant premium lift. (Left out this pass because it's a broad, judgment-call visual shift better eyeballed by the owner.)
2. **Darken the "soon" / micro-label chips** to clear AA (a `--chip-gold-ink` token or darker gold).
3. **Differentiate the plan tags** — Free's "Available now" should read differently from the Super plans (e.g. Free = "Free forever", Super Monthly = "Most popular").
4. Give the Plans/legal pages a **slim shared footer** (copyright + Privacy/Terms) so they don't end in a void.

### (b) Needs owner design decision
1. **Adopt a type scale + spacing tokens** — the single biggest source of the "off" feeling (48 font sizes, 47 spacing literals, zero spacing tokens). A one-time normalization to a scale (e.g. 12/13/14/16/18/22/28/36/48 and 4/8/12/16/24/32) would make everything feel intentional.
2. **Merge the two card languages** into one elevation/border system.
3. **Give Dating a premium visual identity** (accent frame / richer header) so the paid feature looks paid — no gate/content change, visual only.
4. **Unify the primary-button + modal systems** (1 gold-CTA class, 1 modal-close, 1 backdrop) instead of 4/5/6 variants.
5. **Rebuild Stage-1 Complete** on the shared `.reward-screen-*` celebration system.
6. **Resolve the funnel CTA seam** (gold-gradient marketing CTAs → flat jade app buttons at conversion) and the two dead "Coming soon" donation cards.

### (c) Post-launch
Full color-token migration of the remaining ~47 duplicate hexes; radius/shadow tokens; lucide icon-size step scale; the reset-password "Checking…" state already got a pulse in `3bbe536`.

---

## 8. What's verified good (keep)
Clean 12-token color system with a full dark override; genuinely premium landing (both themes); unified reward/celebration overlays with XP count-up; footer on-jade contrast passes AA; anonymous-shell footer correctly absent; the new social system's hidden-by-default contract (renders nothing until a real URL is set).

---

## 9. Quick-wins pass (follow-up, mechanical only — no design decisions)

A follow-up pass executed the zero-judgment quick wins from §7. **Done:**
- **Inter 800 loaded** — added `;800` to the Inter axis in `index.html` (same Google Fonts method, no new dependency). The ~62 elements *authored* at weight 800 (prices, plan names, badges, hero) now render heavy as designed instead of clamping to 700. Payload: one additional latin woff2 (~20–30 KB, lazy, non-blocking). **The two `font-weight: 900` uses** (`.firstlesson-option-letter`, `.firstlesson-primer-num`, both JetBrains Mono) were left untouched — JetBrains 900 isn't loaded either, so they clamp to 700; whether to change them to 800 (and load JetBrains 800) is an owner call.
- **"soon" micro-chip contrast fixed** — `.pl-matrix-soon` used `var(--gold)` as text on the cream-warm matrix = **2.25:1 (AA fail)**; switched to the existing `--gold-deep` token → **5.06:1 light / 8.33:1 dark** (both pass). No new token.
- **Slim footer on Plans + legal/info pages** — extracted the landing footer into a shared `SiteFooter` component (single source of `FOOTER_LINKS` + copyright + the hidden social system) and added a `slim` variant to `/plans` (standalone only) and all legal/info pages, which previously ended in a void. The signed-in app shell and the embedded in-shell `/plans` deliberately still render **no** footer. Verified present + slim + no-social + correct copyright in both themes; no 375px overflow.
- **Hardcoded-color reduction (safe subset only, zero visual change):** tokenized **8 occurrences** across 2 values — the 7 dead `var(--gold-deep, #a07b1f)` fallbacks (the token is now defined, so the fallback never rendered) → `var(--gold-deep)`, and the one dark-block `#ebcc8e` (== dark `--gold-soft`) → `var(--gold-soft)`. **~48 distinct hexes remain** and are NOT safely tokenizable this way: a light-only literal that matches a *light* token would change its **dark** rendering if tokenized (the token flips value by theme), so migrating them is part of the owner color-system project, not a pure refactor.

**Reported, not changed (require a design/product decision — owner's list):**
- **Donation "Coming soon" cards** are **not dead** — `SITE_CONFIG.support.buyMeACoffeeUrl` / `crypto.address` are env-driven; setting them turns the cards into live links. They represent a planned feature with a clear owner path to activate, so they were **kept** (removing them would delete a real feature). Owner choice: set the URLs, or hide the Support section until then.
- **Funnel CTA seam** (gold-gradient marketing CTAs → flat jade primary buttons at the auth/app boundary) is a **brand-identity decision** (which primary-button style wins), not a mechanical fix — left for the owner.
- Everything in §7b (type scale, spacing tokens, card-language merge, Dating premium skin, primary-button/modal unification, Stage-1-Complete rebuild) remains owner-design.

---

## 10. RESOLVED — type scale + spacing tokens (§7b.1)

The single biggest §7b item is done, isolated in one revertable commit (sizes/spacing only, no color/layout/component change):

- **Type scale (`:root --fs-*`):** 12/14/16/18/22/28/36/48, plus documented exceptions — micro tier 10/11 (chips/badges/fine print) and display tier 56/64/72 (landing hero). **46 distinct font-sizes → 13 tokens; all 97 fractional half-pixel declarations eliminated.** `clamp()` fluid hero sizes (25) and one `0.85em` relative size are kept (the fixed scale can't express fluid/relative type).
- **Spacing scale (`:root --sp-1..7` = 4/8/12/16/24/32/48):** padding/margin/gap map to these steps, ties → the smaller step. **51 distinct spacing literals → 7 tokens.** Kept literal (documented exceptions): 0, negative offsets, ≤3px micro-adjustments, >48px structural dimensions, one calc()-embedded value.
- Line-height (`--lh-*`) and weight (`--fw-*`) scales are defined for future adoption.
- **Verification caveat:** build compiles (CSS valid, every token resolves), 16/16 validators + local smoke pass. Pixel-level browser verification (both themes, desktop + 375px) was NOT possible in this environment (no browser tool). The change is shrink-biased and isolated, so a one-command `git revert` restores the prior look if any surface reads wrong on review.

Still owner-design (§7b): card-language merge, Dating premium skin, primary-button/modal unification, Stage-1-Complete rebuild. The donation "Coming soon" cards (§9) are now **hidden until configured** (see the UX audit's resolution note).
