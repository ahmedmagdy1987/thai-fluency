# Pre-Launch Structural Audit — Tuk Talk Thai

**Date:** 2026-07-12
**HEAD:** `0f207fad9a0e95bb9fadd232b3d6fba122f263a9` — `fix(dating): close top-bar badge answer leak + content QA pass + native review pack`
**Scope:** Full recovery from GitHub onto a wiped machine + read-only structural / launch-readiness audit. No code changes were made in this pass.
**Method:** Fresh clone → environment rebuild → build + all validators + local & production route smoke → 7-dimension multi-agent structural audit (routes/nav, anonymous funnel, upgrade funnel, gates & entitlements, dating answer-hygiene, session isolation & subscription copy, completeness & polish), every significant finding adversarially verified by independent reviewers, plus a completeness critic pass. 42 agents, 766 file reads/greps, all claims carry file:line evidence.

---

## 1. Recovery summary

| Item | Result |
|---|---|
| Local path | `C:\Users\bdstd\Documents\thai-fluency` (fresh machine username is `bdstd`, not `User`) |
| Clone / checkout | Clean clone of `master`, up to date with `origin/master`, working tree clean |
| HEAD | `0f207fa` (Jul 7, 2026) |
| **Dating answer-hygiene completed after `8cd9ee7`?** | **YES** — `0f207fa` is that task. Evidence: `DatingSection.jsx` +17 lines (top-bar chip swap at :417-424, subject badge row swap at :438-440), `datingQuiz.js` +5 (`ANSWER_AFTER_REVEAL_LABEL` shared constant, :81), `check-dating-badges.mjs` +14, `check-dating-quiz.mjs` +5. Verified in depth in §6 below. |
| `npm install` | Clean — 440 packages, deprecation warnings only |
| `.env.local` | Recreated with the three public client values (Supabase URL, publishable key, OneSignal app id). `VITE_STRIPE_PUBLISHABLE_KEY` absent locally as expected (lives in Vercel env); checkout modal degrades gracefully to an honest "Checkout isn't available yet" state (`SuperCheckoutModal.jsx:37-40, 117-125`) — confirmed NOT a bug |
| Supabase CLI | v2.109.1, authenticated; project re-linked to `fkebzcywofzloaqeghtn` |
| `supabase migration list` | All 10 migrations in sync local↔remote (001–006 + 5 timestamped 2026-07-04 rows). `006b_revoke_xp_columns.sql` skipped by the CLI (filename pattern) — the known deferred 006B, untouched per instructions |
| `supabase db push --dry-run` | "Remote database is up to date." Nothing pending. No push performed |

## 2. Baseline validation results

| Check | Result |
|---|---|
| `npm run build` | **PASS** — 1658 modules, 2.5s. PWA generated (`sw.js`, manifest, 13 precache entries). Warning: main JS chunk 1,571 kB (>500 kB) — post-launch code-split candidate |
| `check-celebrations.mjs` | PASS |
| `check-challenge-scope.mjs` | PASS |
| `check-course-completion.mjs` | PASS |
| `check-dating-badges.mjs` | PASS |
| `check-dating-quiz.mjs` | PASS (50 questions across 10 categories) |
| `check-direction-lock.mjs` | PASS |
| `check-mini-units.mjs` | PASS (0 warnings) |
| `check-mini-unit-sequence.mjs` | PASS |
| `check-progress-merge.mjs` | PASS |
| `check-quest-logic.mjs` | PASS |
| `check-sentence-builder.mjs` | PASS |
| `check-session-isolation.mjs` | PASS |
| `check-subscription-status.mjs` | PASS |
| Local route smoke (`vite preview`, 17 targets) | **PASS** — all routes + OneSignal worker + manifest |
| Production smoke (`https://www.tuktalkthai.com`, 17 targets) | **PASS** — all 200, worker served as JS, manifest as `application/manifest+json` |
| `npx cap sync android` | **PASS** — 0.57s, 7 Capacitor plugins. (Note: machine has JDK 1.8; a Gradle **build** would need JDK 17+, but sync itself is fine) |

**13/13 validators pass; build, both smokes, and Android sync all green.**

## 3. Route inventory

Routing is hand-rolled in `src/App.jsx`: route tables at :167-208 (`TAB_ROUTES`, `ROUTE_TABS`, `AUTH_ROUTES`, `PUBLIC_PAGE_ROUTES`), parser at :215-225, render-gate cascade at :2046-2348. `vercel.json:4` SPA-rewrites all extensionless paths. Unknown paths fall back to `/learn` with a `replaceState` correction (App.jsx:224, 544, 555) — no 404 dead ends (and no 404 page, by design).

| Route | Component | Gate | Reachable from | Status |
|---|---|---|---|---|
| `/` | LearnPath (alias of /learn) | signed-in (anon → landing) | default entry; Stripe return URL | OK |
| `/learn` | LearnPath (App.jsx:2273) | signed-in | sidebar, mobile nav, post-auth redirect, many CTAs | OK |
| `/today` | TodayTab (App.jsx:2274) | signed-in | **direct-URL-only** — no nav entry, zero `setTab('today')` in src | **ORPHAN** (deferred product decision; renders a complete, functional dashboard — see §4.4) |
| `/cards` | CardsTab | signed-in | sidebar "Practice", mobile, TodayTab/LearnPath/Quests/QuizTab CTAs | OK |
| `/browse` | BrowseTab | signed-in | sidebar Explore, mobile More | OK |
| `/challenge` | QuizTab (canonical for tab `quiz`) | signed-in; hearts economy in-component | sidebar "Challenge", mobile, in-page CTAs | OK |
| `/quiz` | QuizTab (inbound alias, App.jsx:186) | signed-in | direct-URL-only (nav always writes /challenge) | OK — intentional alias |
| `/guide` | GuideTab | signed-in | sidebar Explore, mobile More, TodayTab | OK |
| `/quests` | QuestsScreen | signed-in; locked variant < Stage 2 | sidebar Engage, mobile PRIMARY | OK |
| `/shop` | ShopScreen | signed-in | sidebar Explore, mobile More | OK |
| `/leaderboard` | LeaderboardScreen ("Coming soon") | signed-in | direct-URL-only; deliberately omitted from both navs (SidebarNav.jsx:23-25) | ORPHAN by design; placeholder is polished and presentable |
| `/dating` | DatingSection (App.jsx:2281) | signed-in + **Super** + **18+ one-time confirm** | sidebar "Dating 18+", mobile More | OK — all three gates verified (§5) |
| `/profile` | ProfilePage full-screen | signed-in + profile row | sidebar footer, mobile More (authed only) | OK |
| `/settings` | SettingsModal over shell | signed-in | sidebar footer, mobile More | OK |
| `/get-started` | PublicLanding | anonymous (signed-in → /learn) | sign-out, demo exit, "Back to home" links | OK |
| `/welcome` | AuthGate welcome/sign-up | anonymous | landing CTAs, demo end CTA | OK (sign-up also lives here; no separate /sign-up route) |
| `/sign-in` | AuthGate sign-in | anonymous | landing "Sign in", demo, AuthGate switch | OK |
| `/demo` | DemoMode (5-card read-only demo) | anonymous only | landing header/hero/features CTAs, AuthGate | OK |
| `/privacy` `/terms` `/support` `/feedback` `/delete-account` | PublicInfoPage standalone | none (public) | landing footer, AuthGate footer, Settings, Profile, cross-nav | OK — all linked (but see BLOCKER §7) |
| `/plans` | PlansPage — **dual render** | none to view; checkout CTA needs auth | every "Go Super" surface, Settings, Profile, footers | OK — dual render verified (§4.3) |
| `/premium` | PlansPage (legacy alias, App.jsx:203-206) | same as /plans | direct-URL-only (legacy bookmarks) | OK — intentional alias |
| *unknown paths* | LearnPath fallback, URL corrected | as /learn | any typo | OK — silent redirect, no 404 page (by design) |

### 4. Navigation integrity results

**4.1 Dead links: NONE.** Every `setTab` target (`learn/cards/quiz/browse/guide`) exists in the tab switch; every `onOpenPublicPage`/`onNavigate` path resolves in the route tables; landing footer, AuthGate footer, PublicInfoPage cross-nav, and PlansPage links all verified. Two raw anchors in legal copy (`legalCopy.jsx:175` → /feedback, `:260` → /plans) cause full page reloads instead of SPA navigation but resolve correctly — info only.

**4.2 Sidebar ↔ mobile parity: FULL PARITY.** Identical destination sets and labels. Sidebar (SidebarNav.jsx:26-40): Learn, Practice / Quests, Challenge / Browse, Guide, Shop, Dating 18+, plus Go Super/"Super ✓", Profile, Settings, Feedback, Sign out. Mobile (MobileNav.jsx:25-38): same 8 tabs split bottom-bar + "More" sheet, same footer actions (:126-176). `today` and `leaderboard` are absent from BOTH navs — no desktop/mobile disparity. Independently re-verified by the critic pass.

**4.3 `/plans` dual render: VERIFIED CORRECT.** `embedPlansInShell = publicPage==='plans' && hasSupabaseConfig && !!session && isEmailConfirmed && authReady && !demoMode` (App.jsx:2046-2047). Signed-in confirmed users get PlansPage **inside** the AppShell with sidebar/header/bottom-nav and a "Back to app" row (App.jsx:2244-2250; PlansPage.jsx:159-173); everyone else gets the standalone marketing version (App.jsx:2049-2058). Both render cleanly.

**4.4 `/today` current state (report only, per instructions):** registered (App.jsx:171, 182), renders TodayTab with full live props (App.jsx:2274). The component is a complete functional dashboard — Thai greeting, "Today's session" hero launching a card session, daily-goal XP ring, Stage-1 mission/stage overview, stat grid + achievements modal, quick-start buttons (TodayTab.jsx:37-241). Unreachable from any UI surface; not in the smoke list. No crash risk observed. Deferred product decision — untouched.

## 5. Flow traces & gate verification

### 5.1 Anonymous → demo → sign-up → merge: WIRED END-TO-END
- **Landing:** signed-out `/` renders PublicLanding; all CTAs wired (demo, sign-in, sign-up, footer links — PublicLanding.jsx:374-443, 97-104). Anonymous users **provably cannot reach the AppShell**: the three logged-out branches exhaust every `!session` state (App.jsx:2115/2132/2148); typing `/learn` anonymously renders the landing (App.jsx:324-328).
- **Demo:** genuinely read-only (no `saveState`, DemoMode.jsx:192-204; main save gated `!demoMode`, App.jsx:846-848); every screen has forward CTAs; end screen wires sign-up/sign-in/exit (App.jsx:665-689).
- **Sign-up:** client mirrors the 12-char password policy (SignUp.jsx:10-16); unconfirmed sessions are hard-gated to PendingConfirmation with resend (App.jsx:2104-2113); defense-in-depth signs out sessions issued unconfirmed (SignUp.jsx:70-73).
- **Merge:** invoked at a verified call site on cloud-init (App.jsx:797-809); pure/deterministic max-union with local tie-break (progressMerge.js:33-114); idempotent across reloads; runs once per load (`cloudReady` + `claimCloudInit` dedupe, sessionLocks.js:70-82); empty-cloud path uploads local wholesale (App.jsx:783-788). Merge **never** grants tier — entitlement fields are hard-deleted (progressMerge.js:110-112). Regression-tested by `check-progress-merge.mjs` (12 scenarios, passing).
- **No hard dead ends** anywhere in the funnel; both blank waiting gates provably resolve (profileChecked set in `finally`, App.jsx:629-631; cloud-catch releases at :812-815).
- **Gaps (pre-launch):** forgot-password can never complete (no `PASSWORD_RECOVERY` handler/screen; recovery link acts as a one-device magic link; ChangePasswordModal demands the forgotten current password — ForgotPassword.jsx:16-18, App.jsx:389-391, ChangePasswordModal.jsx:28); expired confirmation-link errors (`#error=access_denied…`) are silently swallowed — user lands on the landing with zero feedback (only URL-fragment code is the Stripe param stripper, App.jsx:912).

### 5.2 Free → "Go Super" → /plans → checkout: WIRED, three pre-launch gaps
- **CTA inventory:** every upgrade surface converges on `handleOpenPremium` → `/plans` (App.jsx:1587-1592) or `AppShell.onOpenSuper` (AppShell.jsx:33). Wording consistent ("Go Super"; contextual "Unlock with Super" / "Go Super for unlimited"). Upsell copy centralized (`entitlements.js:87-94`). Nav/Shop/Settings/Profile correctly swap to "Super ✓" when Super.
- **Checkout:** Stripe **Embedded** Checkout via auth-gated `create-checkout-session` Edge Function (JWT-checked, index.ts:47-52; plan→price server-side; returns only client_secret). Test mode honestly labeled twice (pk_test_ detection, stripe.js:16; PlansPage.jsx:189-199; SuperCheckoutModal.jsx:151-155). Missing local key degrades gracefully — confirmed not a bug.
- **Post-purchase:** entitlement written **only** by the signature-verified `stripe-webhook` (index.ts:29-58) into `public.subscriptions`; client re-reads on `?super=success` return (App.jsx:899-948) and on sign-in.
- **Gaps (pre-launch):** (1) already-Super users still see "Go Super" on /plans (no tier prop — PlansPage.jsx:128) and can complete a **second subscription**; the Edge Function does no existing-sub check, the webhook upserts on user_id (last event wins), and cancel-subscription can only cancel the one stored id → orphaned billing with no in-app cancel; (2) the `?super=success` entitlement read is a single attempt that can race the webhook — a paying user silently stays free-tier until reload (App.jsx:916-947, no retry/poll); (3) upsell modal + celebration CTAs never check `isSuper` — paying users can be shown "Go Super" after missions (App.jsx:1566-1585, 1129, 1669, 1778, 1407-1418).
- `/premium` = intentional alias of /plans; no in-app link targets it.

### 5.3 Sign-out → different-user sign-in (session isolation): CORRECT
Centralized identity-change effect keyed on `session?.user?.id` (App.jsx:404-454): wipes local progress/stats + blob when a cloud-loaded user is replaced (`shouldWipeLocalOnIdentityChange`, sessionLocks.js:97-99), resets all nine user-scoped refs (review/mission/achievement locks, celebration arming, super-success/OneSignal one-shots, profile-settings mirror, cloud-init claim — sessionLocks.js:28-46), and clears attempt/undo/overlay React state inline (App.jsx:443-453). Full localStorage inventory enumerated; **no user-scoped key survives identity change** except the two documented device-scoped categories: anti-farm guards (sessionLocks.js:16-19) and the 18+ attestation (storage.js:77-80) — both by design. `handleSignOut` (App.jsx:714-743) clears blob, demo keys, OneSignal link, and routes to /get-started. The settings-blob race is closed by `canWriteProfileSettings` (App.jsx:1089; sessionLocks.js:113-115). `check-session-isolation.mjs`'s ref bag matches the real call site exactly.

### 5.4 Settings & Profile subscription status: SHARED AND CONSISTENT
Copy lives once in `src/lib/subscriptionStatus.js` (:7-30); both SettingsModal (:9, :23, :283-300) and ProfilePage (:4, :16, :178-200) consume `useSubscriptionStatus`. Status strings and the "Cancel plan"/"Canceling…" labels are byte-identical by construction; repo-wide grep confirms no duplicated hardcoded copy. Cancel → confirm dialog → `cancel-subscription` Edge Function → `stripe.subscriptions.update(cancel_at_period_end: true)` → mirrored to `subscriptions` → both surfaces refresh entitlement without reload (useSubscriptionStatus.js:39-52; cancel-subscription/index.ts:47-63). `check-subscription-status.mjs` asserts all five wording states against the real module — passing.

### 5.5 Gates & entitlements: INTACT
- **Super gate:** `isSuper(stats)` checked first in DatingSection (:62, :184); non-Super short-circuits to the locked teaser and can never reach the age gate or content.
- **18+ gate:** only reachable when Super; one-time confirm persisted device-locally (`thai-fluency-dating-adult-v1`, storage.js:81-102); decline exits to Learn; UI honestly says "saved on this device only". Device-scoped by documented design (attestation, not entitlement).
- **Locked teaser leak check (rendered output): NO LEAK.** The locked branch (DatingSection.jsx:184-242) renders only English metadata from `datingContent.js` — category names, severity/register/review chips, blurbs, counts. **Thai-codepoint regex over `datingContent.js` and `datingQuestions.js`: zero matches** (questions reference Thai only via `phraseId`). No phrase, phonetic, answer, explanation, or sampleIntent is referenced anywhere in the teaser JSX. Enforced by `check-dating-badges.mjs` (:67-73).
- **No XP in Dating: CONFIRMED ZERO.** DatingSection has no reward imports/calls (grep matched only the comment "no reward paths"); quiz progress is session-local React state; App.jsx passes no reward callback; `serverRewards.js:23-32` defines 8 event types (none dating) mirrored by the `award_reward` RPC whitelist (006_reward_events_and_rpc.sql:85-96); grep for "dating" across `supabase/`: zero matches.
- **Server-authoritative entitlement: CONFIRMED.** `public.subscriptions` is RLS SELECT-own with all writes revoked from anon/authenticated (20260704003139_billing_entitlements.sql:28-39) — written only by the webhook via service role. Client merges never emit tier (progressMerge.js:110-112); `uploadStats` has no tier field; no tier column exists in user tables. A forged localStorage `tier:'super'` is overwritten by the entitlement roundtrip on every load. **Bounded residual window (post-launch):** the forged flag unlocks the Dating UI for the seconds before the fetch resolves, and for a whole session if cloud-init's `Promise.all` rejects (catch at App.jsx:812-815 sets cloudReady without entitlement). Impact is presentation-only — all dating content ships in the public JS bundle anyway (static imports, DatingSection.jsx:7-8) and Dating has zero reward paths, so nothing of server value is obtainable. The same behavior is what gives legitimate Super users offline access.

## 6. Dating answer-hygiene status (completed at HEAD — verified)

The `0f207fa` fix is **real, correct, and complete for what it claims** (verified line-by-line, all 50 questions enumerated, both validators re-run passing):

- **Mechanism:** `badgesLeakAnswer()` covers `tone|usage|scenario|caution` (datingQuiz.js:74-76). Top-bar category severity chip: `hideCatSeverity = badgesLeakAnswer(q.questionType) && !revealed` (DatingSection.jsx:392) → swapped for the neutral "Answer after reveal" chip at :420-424 — **replaced, never removed** (no layout jump). Subject badge row: `showSubjectBadges` (:387) → same swap at :438-440. Shared `ANSWER_AFTER_REVEAL_LABEL` constant (datingQuiz.js:81) keeps UI and validators in agreement.
- **Post-reveal:** full badge set returns in the card row (:438) and on the explanation panel (:506-511); real top-bar chip returns (:423); `loadQuestion` re-arms `revealed=false` (:113-119); `exitToCategories` discards unrevealed frozen questions (:154-160).
- **Per-type sweep (50 questions):** tone (11) — all answers match subject phrase severity, mechanically enforced by `validateQuestion` (datingQuiz.js:154-163); usage (6) + scenario (11) — consistent with `USAGE_GUIDANCE`; caution (1) — visible type chip does not disambiguate options; meaning (12) + context (9) — badges stay visible by design; reveal-only surfaces (meaning, gloss, explanation, context, warning, correct-mark) all render only under `revealed` (:517-543, :468-483).
- **Validator coverage:** `check-dating-badges.mjs` asserts the gate expressions verbatim, replace-not-remove semantics, reveal restoration, the shared label, no-Thai-in-locked-branch, English-only options, frozen-question hygiene, no XP path, severity/reviewStatus presence (:34-145). `check-dating-quiz.mjs` asserts per-question structure, tone-answer=severity, no Thai anywhere in the bank, no phraseId options, and the exact `badgesLeakAnswer` type set (:114-122).
- **Residual gaps (documented, not fixed in this read-only pass):**
  1. *(post-launch, verified)* On the two `meaning` questions in mild-swears-insults — **dq-swear-1** (datingQuestions.js:1461-1491, phrase 90058) and **dq-swear-5** (:1592-1621, phrase 90060) — the still-visible "Handle with care"/"Don't use casually"/"Rude" chips semantically eliminate every polite-meaning distractor. The badge doesn't *state* the answer so validators pass; it functionally gives these two away. Fix = harden distractors or gate meaning-type in these categories.
  2. *(post-launch, verified — severity confirmed by review panel)* The validators are wired into **no npm script, no CI, no hooks** (package.json:6-15; `.github/workflows/android-debug.yml` runs no checks). A future content edit could reintroduce a leak without failing anything. Wiring all `check-*.mjs` into a `check` script + CI is the single highest-leverage hardening item in the repo.
  3. *(info)* Validator blind spots: prompt/option English wording, `QUESTION_TYPE_LABEL` text, and newly added pre-reveal JSX surfaces are unchecked (no reveal-only assertion for `q.warning`/`q.context`).
  4. *(info, inherent)* Category identity still implies the tone answer in the five single-severity categories (the selector card and teaser show the category severity chip; the category name stays in the top bar, DatingSection.jsx:419, 317, 208-210). Fully fixing this would require hiding category identity, which the owner's badge policy forbids. Design limitation, not a defect.
  5. *(info, positive)* No phrase browser exists; mid-quiz lookup is impossible in-app (tab switch unmounts and destroys quiz state; no dating cards in the main deck).
  6. *(post-launch)* Paywall copy nit: the locked teaser advertises "50 questions … across **11** categories" and lists all 11, but `severity-context-warnings` has zero phrases/questions and is filtered from the playable grid (DatingSection.jsx:197-199, 306; datingContent.js:154-161) — subscribers get 10.

## 7. Completeness & polish findings

- **Placeholder scan: exceptionally clean.** Zero TODO/FIXME/lorem/`console.log` in `src/`; the only console.debug/info are dev-gated. Every "coming soon" is a deliberate honest state (Leaderboard screen; donation cards driven by unset env vars; "coming soon" Super perks).
- **BLOCKER — legal draft banners ship to users.** `OwnerReviewNotice` (legalCopy.jsx:20-26) renders a visible gold callout — "**Owner review required:** Draft legal/support copy… review and approve before public launch" — on Privacy (:32-34), Terms (:107-109), Support (:167-169), and Delete Account (:285-287), all publicly routed and linked from the landing footer, auth gate, settings, and profile. This is the known review-before-launch placeholder status: the underlying copy is substantive and product-accurate (real processors, real effective date "May 26, 2026", real support email config), but the banners are user-visible on production today. Adversarially verified; confirmed blocker.
- **Legal content gaps (pre-launch):** Terms have no billing/refund/cancellation clause, no legal entity name, no jurisdiction/governing-law, no liability limitation — despite live Stripe billing ($4.99/$39.99, PRICING_TBA=false). Support page itself says to confirm `support@tuktalkthai.com` is active before launch.
- **SEO/social (pre-launch):** `index.html` has no `<meta name="description">` and no OG/Twitter tags (confirmed absent in `dist/` too) — shared links get no preview.
- **Error handling (pre-launch, found by critic):** **no React error boundary** and no global error/unhandledrejection handler anywhere (`main.jsx:8-12` renders `<App/>` bare; grep zero matches) — any render exception white-screens the app with no recovery UI and no crash visibility.
- **Analytics (pre-launch by the repo's own definition):** all six funnel events fire at real call sites but sink only to dev console + a 50-event localStorage ring buffer (analytics.js:25, 44-55) — zero funnel data will be collected at launch; `docs/payment-readiness.md:8` itself lists "analytics wiring" as remaining before real charges. (Also: stale comment at analytics.js:15-18 claims CHECKOUT_STARTED/SUBSCRIPTION_ACTIVATED are unwired — both are wired.)
- **Account deletion:** manual email workflow, honestly labeled (legalCopy.jsx:282-312). Fine for web launch; short of Apple 5.1.1(v) in-app-deletion for future store builds. (Severity corrected to post-launch by the review panel for a web-first launch.)
- **PWA: solid.** Full manifest (name/short_name/theme/background, 192+512+maskable icons — PNG dimensions byte-verified), autoUpdate SW, dual-SW strategy with OneSignal documented (vite.config.js:8-43); apple-touch-icon.png is a correct 180×180 at the conventional root path (though no `<link rel="apple-touch-icon">` tag — iOS falls back to the path). `favicon.svg` is 244 KB — heavy.
- **Dark mode: app-wide and real.** ~200 `data-theme` rules in app.css; landing.css and plans.css carry explicit dark overrides; every top-level render branch stamps `data-theme` (App.jsx:2051…2211); theme mirrored to `<html>` with a transition suppressor (App.jsx:641-652). **Gap (post-launch):** no pre-paint theme script in index.html → dark-theme users get a light flash on every cold load (CSP `script-src 'self'` means the fix needs a hash or tiny external script).
- **Assets: no broken references.** All `/characters/*` (8 dirs × 7 expressions), `/cinematic/*` videos+posters resolve; stage-3/course-complete videos are deliberately disabled with null-safe fallbacks (stageCinematics.js:18-28).
- **Hosting config verified good (critic positive-confirmation):** vercel.json has the SPA rewrite, immutable asset caching, X-Frame-Options DENY, Referrer-Policy, and a CSP whose allowlists exactly match the app's real external surface (Stripe, Supabase, OneSignal, Google Fonts). One flag: `Permissions-Policy: payment=()` likely suppresses Apple Pay/Google Pay inside Stripe Embedded Checkout (an iframe can't re-enable a top-level-denied feature) — card payments unaffected; verify wallets on production (post-launch).
- **Empty screens: none broken.** Three intentional blank loading gates render a bare themed div with no spinner (App.jsx:2097-2099, 2171-2173, 2184-2186) — polish, not breakage.
- **Repo hygiene (info):** CLAUDE.md is materially stale (claims no backend/router/5 tabs/personal project); 7 backup files tracked under `src/` (none bundled — verified against the import graph); ~10 root-level audit .md files; dead code: `NavBtn.jsx` unused, `PUBLIC_PAGES.premium` unreachable with stale intro; stale header comment in check-dating-quiz.mjs.
- **Accessibility note (info):** viewport sets `user-scalable=no` — blocks pinch-zoom; common for app-like PWAs but worth a conscious decision.

## 8. Prioritized issue list

Every item below was adversarially verified by independent reviewers (refute + severity lenses). File:line refs are in the sections above.

### (a) LAUNCH BLOCKERS — 1
1. **"Owner review required" draft banners are user-visible on Privacy, Terms, Support, and Delete Account** (legalCopy.jsx:20-26 + four include sites). Tony must review/approve the legal copy and remove the banners. While in there, close the Terms gaps (billing/refund/cancellation, entity, jurisdiction — item b3) in the same edit.

### (b) Should-fix before launch — 8
1. **Forgot-password cannot complete** — no PASSWORD_RECOVERY handling or set-new-password screen; reset emails act as one-device magic links (ForgotPassword.jsx:16; App.jsx:389).
2. **Expired/invalid email-confirmation links fail silently** — `#error=…` fragment never parsed; user dumped on the landing with no message (App.jsx:389/912).
3. **Terms of Use lack billing/refund/cancellation, legal entity, jurisdiction** despite live paid subscriptions (legalCopy.jsx:103-162). Merge with blocker a1.
4. **Already-Super users can double-subscribe from /plans** — no tier prop on PlansPage, no existing-sub check in create-checkout-session, cancel can only reach one subscription id (PlansPage.jsx:128; index.ts:54-69).
5. **Post-checkout entitlement read races the Stripe webhook** — single attempt, no retry; paying user can stay free-tier until reload at the worst possible moment (App.jsx:916-947).
6. **Upsell modal + celebration "Go Super" CTAs not gated by isSuper** — paying users can be shown upgrade prompts (App.jsx:1566-1585, 1129, 1669, 1778).
7. **No error boundary / global error handler** — any render exception = permanent white screen, invisible to the owner (main.jsx:8-12).
8. **No meta description / OG / Twitter tags** in index.html — shared links get no preview (index.html:14). *(Also strongly consider b-adjacent: analytics events never leave the device — the repo's own payment-readiness doc calls this pre-charges work; a tiny Supabase events-table drain would restore funnel visibility.)*

### (c) Post-launch — top items
1. **Wire all 13 `check-*.mjs` validators into `npm run check` + CI** (three dimensions independently flagged; currently zero automated enforcement of the dating-hygiene, isolation, and merge invariants).
2. Dating: harden dq-swear-1/dq-swear-5 distractors (badges functionally reveal the answer); fix teaser "11 categories" vs 10 playable; add reveal-only validator assertions for warning/context surfaces.
3. Forged local `tier:'super'` presentation window (especially the failed-cloud-init whole-session case) — consider applying entitlement even on partial init failure.
4. Extend the smoke script to the 10 missing live routes (/sign-in, /dating, /quests, /browse, /guide, /profile, /settings, /today, /quiz, /leaderboard).
5. Dark-mode pre-paint script (needs CSP hash); spinner on the three blank loading gates; apple-touch-icon link tag; slim the 244 KB favicon.svg.
6. Verify Apple Pay/Google Pay under `Permissions-Policy: payment=()` on production; relax if wallets are wanted.
7. Unconfirmed-email users can start checkout from standalone /plans (money not lost — entitlement keyed to user id — but confusing); demo non-replayable for returning visitors; signed-in /demo cold-load leaves demoMode stuck until next navigation (cloud sync unaffected).
8. Code-split the 1.57 MB main chunk; account-deletion automation before any app-store submission; refresh stale CLAUDE.md; prune backup files and dead code (NavBtn, PUBLIC_PAGES.premium).

## 9. Confirmed-good summary (what launch can rely on)

- Build, 13/13 validators, local + production smoke, Android sync: all green.
- DB migrations in sync; 006B untouched.
- Anonymous users can never reach the app shell; all gates (auth, email-confirm, Super, 18+) enforced in the render tree.
- Dating: no Thai/answer leakage in the locked teaser (codepoint-verified), zero XP/reward paths client and server, answer-hygiene fix verified correct at HEAD.
- Entitlement is server-authoritative (RLS-protected subscriptions table, webhook-only writes, merges strip tier).
- Session isolation on identity change is comprehensive and matches its regression script.
- Subscription status/cancel copy shared and byte-identical across Settings and Profile; cancel Edge Function wired end-to-end.
- No dead links; full sidebar/mobile nav parity; /plans dual-render correct; unknown URLs fall back safely.
- PWA, hosting headers/CSP, dark mode, and asset integrity all verified good.
