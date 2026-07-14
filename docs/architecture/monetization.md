# 05 — Monetization

**Spec #5 of the Tuk Talk Thai Architecture Blueprint.** Owns FOUNDATION §7 (Free vs Super line, hearts/gems economy, entitlement + speech-upgrade seam). Planning only — this doc writes **zero** application code. It ratifies and extends what is already built; it does not redesign the economy.

**Binding parents:** `docs/architecture/README.md` (FOUNDATION CONTRACT — LAW). Where this spec conflicts with the FOUNDATION, the FOUNDATION wins. Canonical IDs in `code font` are reused verbatim.

**Sibling docs referenced (canonical names from the FOUNDATION index):** `exercise-types.md` (speech seam), `engagement.md` (streak/freeze surfaces, identity capture). Those two files are not yet authored; this spec cites the FOUNDATION sections they will own and stays consistent with them. *(Filename note: the FOUNDATION index calls this file `monetization.md`; it is authored here as `monetization.md` per the task. Same document.)*

---

## 0. What is already built (audited, not proposed)

The monetization loop is **wired and live**, not a preview. This spec extends it; it invents no new economy.

| System | Where | State |
|---|---|---|
| Hearts/gems economy (pure helpers) | `src/lib/economy.js` | LIVE |
| Hearts gate (Challenge only) | `src/components/QuizTab.jsx:82-354` | LIVE |
| Gem shop (refill + streak-freeze) | `src/components/ShopScreen.jsx` | LIVE |
| Entitlement model (single source of truth) | `src/config/entitlements.js` | LIVE |
| Server-authoritative tier | `entitlements.js:106-113`, `downloadEntitlement()` (`App.jsx:1769-1787`) | LIVE |
| Stripe embedded checkout (real prices) | `src/config/stripe.js`, `SuperCheckoutModal.jsx` | LIVE (`PRICING_TBA = false`, `entitlements.js:59`) |
| Dating & Real Talk (18+) Super gate | `src/components/DatingSection.jsx:70-71`, `entitlements.js:43` | LIVE + enforced |
| Unlimited hearts for Super | `economy.js:77-78` (`effectiveHearts → Infinity`) | LIVE + enforced |
| Rewarded-ad heart slot (config-gated, inert) | `site.js:39-44`, `QuizTab.jsx:338-342`, `App.jsx:1509-1520` | Gate present, **no SDK** |
| Economy regression guard | `scripts/check-economy.mjs` | Enforced |

Two Super benefits are **AVAILABLE (enforced today)**: `datingRealTalk` (`entitlements.js:43`) and `unlimitedHearts` (`entitlements.js:48`). Every other Super benefit is `COMING_SOON` (`entitlements.js:49-53`) and is advertised on `/plans` but **never used to gate real value** — the honesty constraint in `entitlements.js:11-19` and enforced by `check-economy` invariant (d).

---

## 1. The Free / Super line (FOUNDATION §7 — reproduced VERBATIM)

> **The one-sentence principle (the "Sacred rule," `RETENTION_AND_MONETIZATION.md §2`):** *The entire curated, staged learning path — every situation, every card, every exercise type, every tone and register drill — is FREE forever; Super sells only convenience (unlimited hearts, ad-free, double-XP), cosmetics (character skins), early access (next stage + themed phrase packs), and the mature Dating pack — never pedagogy, never a mastery gate.*

| Lane | FREE forever | SUPER only |
|---|---|---|
| Learning path | all situations, all exercise types, SRS, tone `discriminate`+coarse `produce`, `register-judge`, quests, streak, achievements, Guide, all cards | — |
| Convenience | timed heart regen; gem heart-refill | **unlimited hearts** (bypass gate); ad-free; double-XP; monthly streak-freeze |
| Content access | full staged path (never time-locked) | **early access** to next stage + themed early-access phrase packs; **Dating pack** (18+) |
| Cosmetics | default characters | character skins |
| Precise pronunciation | coarse browser verdict | **`enhancedReview` tone-accurate scorer** — `needs-owner`, ships only when `VITE_PRONUNCIATION_SCORER` set AND entitlement flipped `AVAILABLE` |

This table is LAW. The rest of this doc specifies *where* each line is enforced and *what is not yet built*. The verbatim Super list is broader than the currently-enforced catalog (`double-XP`, `character skins`, `early access`, `monthly streak-freeze` have no `FEATURES` entry yet) — those gaps are mapped in §3 and raised in §9, and until built they stay `COMING_SOON` so `check-economy` (d) and the `entitlements.js:11-19` honesty rule hold.

### 1.1 Why this line maximizes BOTH learning and revenue

**Learning.** Pedagogy is never the paywall, so no learner is ever *blocked from progressing*. The one friction currency (hearts) touches **only** the optional, competitive Stage Challenge (`economy.js:5-14`) and **never** the flashcard/lesson spine — enforced by `check-economy` (b) against `CardsTab.jsx`. At 0 hearts the gate *still* offers a free way forward ("You can still learn and review for free →", `QuizTab.jsx:349-353`). The daily habit that actually teaches — review + lessons — is frictionless for everyone, which maximizes retention, and retention is the entire top of the revenue funnel. A free user who churns because they hit a wall is worth $0; a free user who keeps their streak is a durable conversion candidate.

**Revenue.** Super sells the two things language learners reliably pay for, each surfaced at the moment of **peak intent**:
1. **Removal of a self-inflicted friction they meet at maximum engagement** — the out-of-hearts moment happens *mid-competition*, so Super is the **primary** CTA on that gate (`QuizTab.jsx:316-323`), gem refill the secondary.
2. **Exclusive desire-driven content with a clean non-pedagogical justification** — the 18+ Dating pack is a whole tab devoted to a *want*, not a learning gate (`DatingSection.jsx:23-37`). It is defensible to charge for because the free path teaches all the *language skills*; Dating adds mature register/vocabulary that a family-friendly free tier legitimately shouldn't front.

Because willingness-to-pay is captured at desire (hearts gate, Dating lock) and never by degrading the free learning experience, the model protects retention (→ LTV) while still converting. The precise-pronunciation scorer (§4) is the natural expansion tier precisely because it is the *only* feature with real marginal server cost — so charging for it aligns cost with revenue rather than taxing the free base.

---

## 2. The economy this doc EXTENDS (do not reinvent)

Canonical config, single source of truth (`economy.js:21-34`):

| Constant | Value | Line |
|---|---|---|
| `HEART_MAX` | 5 | `economy.js:23` |
| `HEART_REGEN_MIN` | 30 (one heart / 30 min) | `economy.js:24` |
| `REFILL_COST_GEMS` | 50 (full refill) | `economy.js:26` |
| `FREEZE_COST_GEMS` | 30 (one streak freeze) | `economy.js:27` |
| `GEMS_PER_MISSION` | 5 | `economy.js:32` |
| `GEMS_PER_CHALLENGE_PASS` | 3 | `economy.js:33` |
| `GEMS_PER_DAILY_GOAL` | 5 | `economy.js:34` |

**Hearts** (`economy.js:5-11`): gentle "lives," Challenge-only. Lose 1 per **wrong** Challenge answer (`QuizTab.jsx:220`), regen +1/30 min, refill 50 gems, **Super = `Infinity`** (`effectiveHearts`, `economy.js:77-78`; `spendHeart` is a no-op for Super, `App.jsx:1485-1486`). Hearts **never** touch Learn/Review — enforced.

**Gems** (`economy.js:12-14`): the **free** currency. Earned from missions/challenge-pass/daily-goal; two sinks — heart refill (`refillHeartsWithGems`, `economy.js:131`) and streak freeze (`buyStreakFreezeWithGems`, `economy.js:162`). The freeze sink is what keeps gems from being circular (`economy.js:159-161`) — enforced by `check-economy` (c). **Super grants no gems** (enforced by `check-economy` (c): `!/gem/i.test(JSON.stringify(FEATURES))`).

**Extension rule (binding on every other spec):** any new graded exercise from `exercise-types.md` that *could* be heart-bearing is defined `never` in the FOUNDATION §1 catalog (`listen-meaning`, `tone-discriminate`, `tone-produce`, `speaking-repeat`, `register-judge`, `dialogue` all carry Hearts = **never**). This doc ratifies that: **no new exercise type spends a heart.** Only the existing Stage Challenge spends hearts. If a future graded mode ever spends a heart it must mirror the `QuizTab` gate exactly (start-block at 0, free way forward, Super bypass) or `check-economy` (a)(b) fails.

---

## 3. Conversion surface registry — where EVERY upsell lives

A conversion surface is any place the app offers Super. Each must (i) route through the central `handleOpenPremium(intent)` (`App.jsx:1757-1763`), which persists the surface via `saveSuperIntent` so checkout returns the user there, and (ii) draw copy from the shared `UPSELL_COPY` map (`entitlements.js:92-100`) — never inline — or `check-subscription-status` fails.

**Return-after-checkout mechanic (existing):** `SUPER_INTENT_TABS = {'dating','quiz','shop'}` (`App.jsx:207`). `handleOpenPremium` saves the intent (`App.jsx:1760`); after a successful purchase `loadSuperIntent()` returns the user to that exact tab (`App.jsx:1064-1066`). **Any new conversion surface that wants return-routing must add its intent to `SUPER_INTENT_TABS`.**

| # | Surface | Where it lives (file:line) | Trigger | Primary CTA | Free way forward | `UPSELL_COPY` reason | Status |
|---|---|---|---|---|---|---|---|
| 1 | **Out-of-hearts gate** | `QuizTab.jsx:302-354`; `onOpenSuper=handleOpenPremium('quiz')` (`App.jsx:2512`) | free user hits 0 effective hearts on the Challenge intro | **Super** (`QuizTab.jsx:319-323`) | "learn and review for free →" (`:349-353`) + gem refill (`:324-334`) + regen countdown | `hearts` (`entitlements.js:98`) | **LIVE** |
| 2 | **Dating lock** | `DatingSection.jsx` locked teaser; `handleOpenPremium('dating')` (`App.jsx:2516`) | non-Super opens the Dating tab | **Super** ("Unlock with Super") | none needed — Dating is optional, outside course progress (`DatingSection.jsx:23`) | `dating` (`entitlements.js:97`) | **LIVE + enforced** (`datingRealTalk` AVAILABLE) |
| 3 | **Shop upsell** | `ShopScreen.jsx:117-130`; `handleOpenPremium('shop')` (`App.jsx:2515`) | non-Super in the Shop | **Super** ("Super = unlimited hearts") | buy refill / freeze with gems | (shop card copy) | **LIVE** |
| 4 | **Streak-break / freeze** | Shop freeze item (`ShopScreen.jsx:93-115`); auto-freeze (`App.jsx:964-965`); consume (`stats.js:177-180`) | missed-day risk / broken streak | *not a Super gate today* — free auto-freeze + gem-buyable freeze | freeze is FREE-earnable (weekly) and gem-buyable | — | **LIVE (free)**; Super perk = §3.1 |
| 5 | **Milestone / mission / mini-unit prompts** | `SuperUpgradePrompt.jsx` (`getUpsellCopy(reason)`); throttled by `superPromptLastShownAt` (`App.jsx:1733-1751`) | after a win (first-lesson, mission, mini-unit) | Super | dismiss; never blocks | `first-lesson`/`mission`/`mini-unit`/`generic` (`entitlements.js:92-99`) | **LIVE** |
| 6 | **Advanced exercise types** | new types in `exercise-types.md` | — | **NONE — the type itself is FREE** | the whole type is free | — | see §3.2 |
| 7 | **Identity paths** | captured in `engagement.md` onboarding | — | **NONE — path never gates** | path only reweights order | — | see §3.3 |
| 8 | **Precise pronunciation** | `SpeakingExercise.jsx` scorer seam (§4) | inside a `[gated]` speaking exercise, when a scorer exists | Super (`enhancedReview`) | coarse browser verdict stays free | `generic` (until dedicated reason added) | `needs-owner` (§4) |

### 3.1 Streak-break / freeze — the Super perk vs the free floor (surface #4)

**This must stay consistent with `engagement.md`, which owns the streak/freeze surfaces.** The freeze economy already has three tiers and the Super perk is an **addition**, never a removal of the free path:

- **Free floor (do not remove):** auto-freeze granted at streak ≥ 7, once per 7 days, capped at 2 (`App.jsx:964-965`); a new account seeds `streakFreezes: 1` (`stats.js:59`); consumed automatically on a gap ≤ 2 days (`stats.js:165-180`). This is `streakFreeze` — FREE + AVAILABLE (`entitlements.js:37`).
- **Free gem sink:** buy a freeze for `FREEZE_COST_GEMS = 30` (`ShopScreen.jsx:93-115`). This is the non-circular gem sink `check-economy` (c) requires — **it must remain,** even after any Super freeze perk ships.
- **Super perk (FOUNDATION §7 "monthly streak-freeze"):** an *additional* Super-granted freeze cadence, mapped onto the existing `streakRecovery` benefit (`entitlements.js:51`, currently `COMING_SOON`). Keep `COMING_SOON` until built; when built, Super grants an extra freeze on a monthly cadence **on top of** the free weekly auto-freeze — it must not gate or shrink the free floor, or `check-economy` (b)/(c) intent breaks.
- **Comeback banner** (a broken streak with no freeze available) is a retention surface owned by `engagement.md` (`RETENTION_AND_MONETIZATION.md §1` rec 2). It is a *re-engagement* surface, not a paywall; if it carries a Super mention it uses `getUpsellCopy('generic')`.

### 3.2 Advanced exercise types are FREE — the seam is quality, not access (surface #6)

Per the Sacred rule and FOUNDATION §1 (every new type marked Hearts = `never`), **the exercise types themselves are never paywalled.** `listen-meaning`, `tone-discriminate`, coarse `tone-produce`/`speaking-repeat`, `register-judge`, and `dialogue` are all free. The only monetizable seam *inside* the exercise layer is the **precise pronunciation scorer** (§4) — offered as an in-exercise *upgrade to the free coarse verdict*, not as a gate that hides the exercise. Presenting an advanced type behind a Super wall would violate the Sacred rule and the `entitlements.js:11-19` honesty rule.

### 3.3 Identity paths inform targeting, never gate (surface #7)

FOUNDATION §3 is explicit: a path "never locks, unlocks, forks, or gates content." So `path-tourist` / `path-expat` / `path-partner` / `path-worker` / `path-none` are **free** and are **not** a conversion surface in themselves. Their monetization role is **relevance targeting**: identity is a signal for *which* upsell copy/surface is most apt — e.g., `path-partner` (Dating weight `C`, FOUNDATION §3) makes the Dating-lock (surface #2) the highest-intent upsell for that learner; `path-worker`/`path-expat` weight `sit-admin`/`sit-housing` where early-access packs would land best. Targeting selects among existing `UPSELL_COPY` reasons and timing; it never changes entitlement. Capture of identity lives in `engagement.md`; this doc only consumes it as a targeting input.

---

## 4. The SPEAKING TIER question — recommended position + defense

**The question:** speaking uses the browser Web Speech API — free, imprecise, and **unsupported on iOS Safari / Firefox / in-app webviews / the Capacitor APK**, hidden where unavailable (FOUNDATION stack rails; `exercise-types.md` speech gate `speechRecognitionAvailable()`). Should precise pronunciation/tone scoring be a *future paid tier*, and if so how does it coexist with the free coarse verdict?

### 4.1 Recommended position

**Keep the coarse browser-speech verdict FREE and honestly framed; make precise per-tone scoring the single legitimate paid pedagogy-adjacent upgrade, gated as Super `enhancedReview`, kept `COMING_SOON` until it actually ships.**

Concretely:
- The free `[gated]` speaking exercises (`tone-produce`, `speaking-repeat`, `exercise-types.md`) return a coarse `correct`/`close`/`wrong` word verdict and are framed as *"did the app understand you?"* — **never** advertised as pronunciation or tone assessment (FOUNDATION §1 gating rule; §5 honest limit). Browser recognition auto-corrects a mistoned attempt to the nearest real word, so it *cannot* grade tone (FOUNDATION §5).
- Precise scoring is the FOUNDATION §7 `needs-owner` differentiator: `enhancedReview` (`entitlements.js:50`) flips to `AVAILABLE` **only** when `VITE_PRONUNCIATION_SCORER` is set **and** entitlement is flipped — a Supabase Edge Function with a runtime-injected SDK (never `npm i`, mirroring `loadStripeJs`, `stripe.js:33-59`).
- **Interface seam (planning sketch, no implementation):**
  ```
  // exercise-types.md owns the exercise; this doc owns the gate.
  speechRecognitionAvailable(): boolean          // hide the whole speaking surface where false
  scorePronunciation(utterance, targetCard): Promise<{ perTone, verdict, source }>
     // called ONLY when:
     //   canUseFeature('enhancedReview', stats) === true   (server-authoritative tier)
     //   && import.meta.env.VITE_PRONUNCIATION_SCORER       (scorer configured)
     // otherwise the exercise falls back to the free coarse verdict — never a dead end.
  ```
  A free user, or any user before the scorer ships, always gets the coarse verdict; the precise result is an *additive overlay*, not a replacement path.

### 4.2 Defense

1. **It does not violate the Sacred rule.** The free path already *teaches* production and speaking (mastery states `mastery-produced`, `mastery-spoken`, FOUNDATION §6). Precise scoring is a *quality/depth* upgrade on an exercise you can already do for free — convenience, not pedagogy locked away.
2. **It is the only feature with real marginal cost.** Every other Super benefit (unlimited hearts, Dating access, cosmetics) is zero-marginal-cost. A per-utterance scoring API costs money per use; charging for it *aligns cost with revenue* instead of taxing the free base — the economically honest place to draw a paid line.
3. **Platform reality forces it to be optional anyway.** `mastery-spoken` is *structurally unreachable* on iOS Safari / Firefox / native (no Web Speech), so it may **never** be required for completion (FOUNDATION §6 HARD RULE). The paid scorer inherits that constraint: it is an optional depth tool, never an advance gate, and on platforms without speech **both** the free coarse surface *and* the paid upsell are hidden (`speechRecognitionAvailable()`), so we never dangle a paid feature the device cannot run.
4. **Honesty is enforceable.** It stays `COMING_SOON` (FOUNDATION §9; `check-subscription-status`; `check-economy` (d)) so we never advertise tone scoring as delivered while only the coarse verdict exists. Selling "pronunciation feedback" that is really browser word-matching would be the exact fake-gate the honesty rule forbids.

**Rejected alternative:** paywalling the coarse browser verdict itself. It has no marginal cost, it's inaccurate, and gating it would put a paywall on the *only* speaking practice iOS/Firefox users… still can't use — punishing free users for a platform limitation while charging for a low-quality signal. That degrades learning and is dishonest.

---

## 5. Entitlement seam (server-authoritative — reaffirmed, not redesigned)

**Client may DISPLAY tier; it must NEVER GRANT Super by changing localStorage** (`entitlement-foundation-design.md`; `entitlements.js:102-113`). `getTier(stats)` returns `super` only when `stats.tier === 'super'`, and `stats.tier` is written **only** by `downloadEntitlement()` from the server (`App.jsx:1769-1787`), which reads `subscriptions.super_until` written **only** by the Stripe webhook (`entitlements.js:104-107`). The `subscriptions` table is read-only to clients (RLS).

Entitlement fields already on `stats` (do not add parallel copies): `tier`, `superUntil`, `cancelAtPeriodEnd`, `status` (`App.jsx:1774-1780`). The server state machine (`free → trial → super → past_due/canceled → free`, with grace) is defined in `entitlement-foundation-design.md §2` and is the authority; the client re-derives the same values for *display only*.

**`check-progress-merge` interaction (binding):** any new persisted monetization state is **cloud-auth class — never `union`/`max`/`sticky-OR`** and **tier is never derived from a merge** (FOUNDATION §8). Trial flags, entitlement, and `superUntil` come from the server, not from local↔cloud reconciliation.

**Copy discipline (`check-subscription-status`):** all Super sales copy flows through `subscriptionStatus.js` (`FREE_PLAN_BLURB`, `subscriptionStatusText`) and `entitlements.js` `UPSELL_COPY` / `PLANS`. New surfaces add a **reason key** to `UPSELL_COPY` (`entitlements.js:92`) — never inline strings. Prices ($4.99/mo, $39.99/yr, `entitlements.js:69-85`) change only in `PLANS` + the Stripe products; `isStripeTestMode` (`stripe.js:16`) drives the honest "test mode — no real charge" notice.

---

## 6. Mapping the FOUNDATION §7 Super list onto the built catalog

| FOUNDATION §7 Super line | `FEATURES` id (`entitlements.js`) | Status today | Action |
|---|---|---|---|
| unlimited hearts | `unlimitedHearts` (`:48`) | **AVAILABLE** | none — LIVE + enforced |
| Dating pack (18+) | `datingRealTalk` (`:43`) | **AVAILABLE** | none — LIVE + enforced |
| ad-free | `adFree` (`:49`) | COMING_SOON | flip to AVAILABLE only if ads ship (§7, owner) |
| precise pronunciation | `enhancedReview` (`:50`) | COMING_SOON | flip only when `VITE_PRONUNCIATION_SCORER` set (§4) |
| monthly streak-freeze | `streakRecovery` (`:51`) | COMING_SOON | build as *additive* freeze (§3.1) |
| early access (next stage + packs) | `bonusPacks` (`:53`) | COMING_SOON | see §9 (must graduate to free) |
| extra daily flexibility/attempts | `extraFlexibility` (`:52`) | COMING_SOON | keep advertised-only until built |
| **double-XP** | *none* | not modeled | **new FEATURES entry needed** (§9) |
| **character skins** | *none* | not modeled | **new FEATURES entry needed** (§9) |

`/plans` already renders the matrix honestly: the hearts row is live ("Unlimited", `PlansPage.jsx:63`) and the unbuilt rows carry `planned: true` → a "soon" chip (`PlansPage.jsx:64-68`, `MatrixValue`), which `check-economy` (d) asserts.

---

## 7. Owner-decision items (specify what each REQUIRES — do not assume them)

### 7.1 Free trial via Stripe

**What exists:** the entitlement state machine already includes `trial` with `trial_end` and `is_entitled` already honors `status='trial' AND trial_end > now()` (`entitlement-foundation-design.md §2`). The client displays `status` (`App.jsx:1779`) with no change needed.

**What a trial REQUIRES:**
1. Server-side: the Edge Function that creates the Stripe Checkout Session adds `subscription_data.trial_period_days` (or a trial-bearing price) — **server only**, the client never sets trial.
2. The Stripe webhook writes `status='trial'` + `trial_end` into `subscriptions`; `downloadEntitlement()` surfaces it. No client architecture change.
3. **Abuse control:** one trial per user — a server dedupe keyed on Stripe customer / auth user id (a learner must not farm trials by re-checkout). This is `check-session-isolation`-adjacent (device/user-scoped guard) but enforced server-side.
4. Dunning at trial→paid conversion is already scoped in `docs/dunning-payment-failure-proposal.md`.
5. Copy: a `trial` branch in `subscriptionStatusText` (`subscriptionStatus.js:20`) and a trial reason in `UPSELL_COPY` — through the shared source, not inline.

**No new npm dependency, no new client dependency.** Stripe.js is already runtime-injected (`stripe.js:33-59`).

### 7.2 Family plan

**What exists:** entitlement is strictly **per-user** — `stats.tier` derives from that user's `subscriptions` row (`entitlements.js:104-113`).

**What a family plan REQUIRES (backend project, not a client tweak):**
1. A **seat/ownership model**: one paying owner, N member accounts. New server schema — a group/owner reference on `subscriptions` (or a `subscription_members` table) with RLS so a member reads *inherited* entitlement without a write path (preserving "client never grants," §5).
2. Entitlement inheritance: `downloadEntitlement()` resolves a member's tier from the owner's active subscription, not the member's own row.
3. An invite/link flow tying member auth accounts to the group (new UI + server endpoints).
4. New `PLANS` entries (`entitlements.js:60`) + matching Stripe products; new `/plans` matrix rows.

No client *architecture* blocker (no new dep, no router needed), but it is a genuine backend build. **Flag: post-launch, backend-heavy, not assumed.**

### 7.3 Ads

**What exists — the config gate is already built and inert:** `AD_CONFIG.rewardedUnitId` + `hasActiveAdSlot()` (`site.js:39-44`); the "watch an ad for a heart" slot renders **only** when `VITE_REWARDED_AD_UNIT` is set (`QuizTab.jsx:338-342`); `handleWatchAd → grantHeart` is wired but inert with **no SDK** (`App.jsx:1509-1520`, `economy.js:149-156`).

**What shipping ads REQUIRES:**
1. Set `VITE_REWARDED_AD_UNIT` (`site.js:40`).
2. Integrate a rewarded-ad SDK by **runtime injection** (mirror `loadStripeJs`, `stripe.js:33-59`) — **no npm dependency**, and it must respect the app's CSP.
3. `grantHeart` must be called **only on a verified ad completion** (server-verified where possible to stop farming; register any new anti-farm ref as **device-scoped** so `check-session-isolation` holds).
4. Flip `adFree` (`entitlements.js:49`) to `AVAILABLE` — the "Super = ad-free" promise (`PlansPage.jsx:64`) only becomes real *after* ads exist; advertising it before is the fake-gate `check-economy` (d) forbids.
5. **Placement constraint (Sacred rule):** ads may appear **only** as the *optional* rewarded-heart slot on the Challenge gate. Interstitials must **never** block the learning path (Learn/Review/lessons) — that would breach `check-economy` (b) intent and the Sacred rule.
6. **Policy caution:** ads on a product that also ships an 18+ section (Dating) raise ad-network policy and audience questions; flag for the owner.

**Recommendation:** ads are the *lowest-priority* revenue lever — they risk the free experience that drives retention, and the rewarded slot's only reward (a heart) is something Super gives away. Keep the gate inert until the owner explicitly opts in.

---

## 8. Validator / rule conflicts encountered + resolution

| Validator / rule | Potential conflict from this doc | Resolution |
|---|---|---|
| `check-economy` (a) 0 hearts blocks graded start | any new gated exercise reusing hearts | No new type spends hearts (FOUNDATION §1 all `never`); only the Stage Challenge gates. §2. |
| `check-economy` (b) learning never costs a heart | precise-scorer / speaking inside a lesson | Speaking exercises carry Hearts = `never`; the scorer is display-only overlay. §2, §4. |
| `check-economy` (c) gems non-circular; Super grants no gems | FOUNDATION §7 **double-XP** could accelerate `dailyGoalsHit` → more daily-goal gems | **Open question §9.1:** double-XP must not increase gem income; gems stay tied to real activity counts, not an XP multiplier. Freeze gem sink (`FREEZE_COST_GEMS`) stays even after the Super freeze perk (§3.1). |
| `check-economy` (d) advertised Super benefits AVAILABLE; live rows not "soon" | mapping unbuilt §7 lines to features | Keep `adFree`/`enhancedReview`/`streakRecovery`/`extraFlexibility`/`bonusPacks` `COMING_SOON`; only `datingRealTalk`+`unlimitedHearts` AVAILABLE. §6. |
| `check-subscription-status` copy from shared source | new surfaces need upsell copy | Add reason keys to `UPSELL_COPY` (`entitlements.js:92`); never inline. §5. |
| `check-progress-merge` tier never from merge | new persisted monetization/trial state | cloud-auth class only; entitlement from server. §5. |
| `check-dating-quiz` / `check-dating-badges` Dating reward-free, English-option, pending badge | monetization must not add XP/reward to Dating | Super gates *access* only; no XP/gems/hearts inside Dating; `pending` badge stays (FOUNDATION §9). |
| §9 review pipeline (honesty) | selling the scorer before it ships | `enhancedReview` stays `COMING_SOON` until `VITE_PRONUNCIATION_SCORER` set AND flipped `AVAILABLE`. §4.1. |
| `SUPER_INTENT_TABS` return-routing | new surfaces lose return-after-checkout | Add new intents to `SUPER_INTENT_TABS` (`App.jsx:207`). §3. |

No **hard** conflict was found: the built economy already satisfies every `check-economy` invariant, and this spec only extends it. The one *spirit* risk is double-XP vs the gem-income intent of `check-economy` (c) — raised in §9.1 rather than diverged silently.

---

## 9. Open questions / proposed foundation changes

The FOUNDATION §7 verbatim Super list names four benefits with **no `FEATURES` entry and no built surface**. Rather than diverge silently, this spec proposes the following so §6/§7/§8 stay coherent.

**9.1 `double-XP` needs a feature entry AND a gem-income guard.** No `FEATURES.doubleXp` exists. Proposal: add `doubleXp` as a `SUPER` / `COMING_SOON` premium feature. **Constraint that must be foundation-blessed:** double-XP must not increase **gem** income (gems come from mission/challenge-pass/daily-goal *counts*, `economy.js:32-34`), or a Super user effectively earns gems faster via the daily-goal path — a soft breach of `check-economy` (c)'s "Super grants no gems." Recommended resolution: apply the multiplier to *displayed/leaderboard XP* only, or exclude the XP multiplier from the `dailyGoalsHit` gem trigger. **Owner/foundation decision required before build.**

**9.2 `character skins` needs a feature entry.** No `FEATURES.characterSkins`. Characters exist (`data/characters.js`, `data/stageCharacters.js`). Proposal: add `characterSkins` as `SUPER` / `COMING_SOON`. Zero pedagogy and zero economy impact — the cleanest pure-cosmetic Super lever; safe to add whenever art exists.

**9.3 "Early access to next stage" must be reconciled with "full staged path never time-locked."** FOUNDATION §7 lists early access as Super *and* declares the staged path "never time-locked." These coexist only if **early access applies solely to net-new content beyond the current free path** (a future stage 9+, or themed packs not yet released) and that content **graduates to free on a published timeline** — it may never permanently gate a stage that free users would otherwise reach in sequence. Proposal: state this graduation rule explicitly in the FOUNDATION (map onto `bonusPacks`, `entitlements.js:53`). Otherwise "early access" reads as a permanent content gate, which the Sacred rule forbids.

**9.4 "Monthly streak-freeze" as Super vs the existing FREE weekly auto-freeze.** The FOUNDATION §7 Super column lists "monthly streak-freeze," while `streakFreeze` is already **FREE + AVAILABLE** (`entitlements.js:37`, weekly auto-grant `App.jsx:964`). Proposal (also in §3.1): the Super freeze is **additive** (an extra cadence on top of the free weekly one + the gem-buyable one), mapped to `streakRecovery`; it must never remove or shrink the free floor or the gem sink. Confirm this framing with `engagement.md`, which owns the streak surfaces.

**9.5 Speaking-tier reason key.** Surface #8 currently reuses `UPSELL_COPY.generic`. When the scorer nears shipping, add a dedicated reason (e.g., `pronunciation`) to `UPSELL_COPY` (`entitlements.js:92`) so `check-subscription-status` keeps copy centralized — noted here so it is not forgotten at build time.

---

*End of `monetization.md`. Extends FOUNDATION §7; does not contradict it. Elaborations that go beyond the built catalog are confined to §7 (owner decisions) and §9 (open questions).*
