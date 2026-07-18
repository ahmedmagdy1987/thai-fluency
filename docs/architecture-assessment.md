# Architecture & Information-Design Assessment

**Date:** 2026-07-18 · **HEAD:** `5dab333` (== origin/master == production) · **Method:** read-only; 9 parallel investigation passes (navigation model, surfaces, nav chrome, IA, roadmap, progression, single-source-of-truth, file structure, free hunt), every claimed defect independently re-verified by two adversarial passes (one trying to refute it, one trying to reproduce it from the code), plus a completeness critic. Every number below was computed from the code (node evaluation of the live modules), not taken from any document.

Labels: **defect** = demonstrable from code with a concrete failing scenario · **risk** = could bite, not fully demonstrable · **preference** = stylistic. Affects: **normal-user** / **edge-tester** / **developer-only**.

---

## 0. The diagnosis in one paragraph

The owner's symptoms are real and have identifiable causes, but they are **not primarily the giant-App.jsx architecture**. The app "breaks every so often" because of four **silent-failure seams**: two service workers fighting over scope `/`, a debounced cloud sync that can roll back XP/streaks on the next launch, an auto-updating service worker with no update UI, and TTS that fails silently without a Thai voice. It feels "not connected / incoherent" because the product has **two progression ladders that never touch** (card progress vs. guided-unit completion — producing two contradictory meanings of "stage complete" on one screen), **three names for the same lesson object** (Lesson / Mission / Mini-unit), stage names that promise content the decks don't contain (0.5–3 % theme match for stages 3, 6, 7, 8), and a Back button that is trapped inside every guided lesson. The in-app defensive engineering (error boundary, merge safety, idempotent rewards, validators) is unusually good for a solo project — the failures live at the seams nobody owned, and they all fail silently, which is exactly why the app reads as "randomly breaking" rather than reporting problems.

---

## 1. Top findings, ranked by user impact

### 1. Sign-in/launch merge rolls back XP, streak, and gems when the last upload never landed — **defect / normal-user**
Cloud sync uploads on a 2.5 s debounce (`App.jsx:1061-1070`) with **no flush on pagehide/visibilitychange**, and a failed cloud init disarms the uploader for the whole session (`App.jsx:1033-1038`, `cloudInitOk` stays false). The launch merge makes `totalXp/streak/todayXp/lastStudy/hearts/gems` cloud-authoritative (`progressMerge.js:130-142`, `out = { ...c }`). Concrete: do a quick review session and close the PWA within 2.5 s (the typical streak-saving session; iOS suspends timers on background) → upload never fires → next launch reverts XP visibly and `computeStreak` (`stats.js:184-199`) sees a stale `lastStudy`, eats a streak freeze or resets the streak to 1 — for a user who studied daily. Server rewards can't restore it: the RPC is an idempotency ledger only (`supabase/migrations/20260704145636…:17` "the client remains the SINGLE total_xp writer") and consumed event keys return `duplicate`. **This is the single most trust-destroying "the app is broken" experience a gamified app can produce, and it fires for the most engaged usage pattern.** (Verified: refute CONFIRMED, repro CONFIRMED.)

### 2. The PWA service worker and OneSignal's worker fight over scope `/` — **defect / normal-user**
`dist/registerSW.js` registers `/sw.js` at scope `/` on every load; OneSignal v16 registers `OneSignalSDKWorker.js` at its default scope `/` when push is enabled (`onesignal.js:48-70` sets no `serviceWorkerParam`). The ServiceWorker spec allows **one registration per scope** — each `register()` with a different script URL replaces the other. The comments at `vite.config.js:11-15` and `onesignal.js:52-53` claim the two "coexist… both at scope '/'", which is an impossibility. For push-enabled users the `/` registration thrashes between the two scripts across sessions: when OneSignal's worker holds the scope there is **no fetch handler** (offline launch → browser error page, precache unused); when `sw.js` holds it, push lands in a worker with no push handler. Which one wins at any launch is timing-dependent — the textbook "works sometimes, breaks sometimes." Fix is one config line (dedicated OneSignal scope), per OneSignal's own coexistence docs. (Verified: CONFIRMED ×2.)

### 3. Two progression ladders that never cross-feed — guided units become permanently unstartable, "due" counts lie, and one screen shows two contradictory "stage complete" states — **defect cluster / normal-user**
- Guided lessons write **no card progress** (`App.jsx:2086-2088` comment; MiniUnitFlow gets no `reviewOne`), and card sessions never complete units. The only reconciliation is a read-only union (`mastery.isTaught`).
- The trail renders **only the current stage's units** (`LearnPath.jsx:113`); incomplete units of earlier stages render as inert `<span>`s (`LearnPath.jsx:269-275`). `currentStage` advances on card progress alone (`state.js:48-53`), so anyone who finishes a stage's cards before its 5–14 guided units **loses those units forever**, and `getCourseCompletion` (`courseCompletion.js:46`, all 96 units) — the Course Complete celebration and its +250 XP — becomes unreachable. Placement users are worse off: skipped-stage units are unreachable from day one and the pilot unit is never marked complete for them (`App.jsx:1826-1835`).
- **Phantom due reviews:** the dashboard deck has no lower stage bound (`App.jsx:2350`) but every serving surface filters `stage >= startedStage` (`CardsTab.jsx:129-134`). Placement marks known cards across stages 1–8 with interval 30 (`App.jsx:1786-1800`); 30 days later, below-`startedStage` cards are due in every count and servable in no session. The "clear your due reviews" quest (`dailyQuests.js:65`) becomes **permanently unfinishable**, blocking the all-quests celebration daily.
- The same LearnPath screen shows "Stage N path complete" (unit ledger, `LearnPath.jsx:354-355`) beside "Opens when Stage N is complete. Every stage is free." (all-cards-seen, `LearnPath.jsx:499`) — two different predicates with one word. Units cover 12–31 % of each stage's cards (841 distinct of 4,780; computed), so this contradiction is the *normal* experience of a guided-path-first learner. (All verified CONFIRMED ×2.)

### 4. Stage names promise content the decks do not contain — **defect / normal-user**
Computed share of each stage's cards matching its own declared `cats` (`taxonomy.js`): S1 55 %, S2 20 %, **S3 1 %** (3/423 — "Getting Around: taxis, motorbikes, hotels, airports" contains zero directions and zero travel-sentence cards; its 12 units are Daily verbs, Describing things, People and family…), S4 27 %, S5 18 %, **S6 3 %**, **S7 0.5 %** ("banking, ATMs, visas" → 4 admin cards of 877), **S8 1 %**. `docs/course-structure-roadmap.md:354-357` *admits* the redistribution deliberately abandoned the travel taxonomy — but the user-facing names/descs in `taxonomy.js` were never updated, and they render on TodayTab (`TodayTab.jsx:150`), StageUpToast, and Stage1CompleteCelebration. The roadmap's central promise — the stage label describes what you'll learn — is false for the half of the course holding ~70 % of the deck. (Verified CONFIRMED ×2.)

### 5. Browser Back is trapped inside every guided lesson — **defect / normal-user**
`applyRouteState` clears the lesson on popstate (`App.jsx:596-597`), but the resume effect (`App.jsx:2229-2235`) immediately re-hydrates it from persisted `stats.activeMiniUnitId` — which `handleStartMiniUnit` writes (`App.jsx:2158`) and no navigation ever clears. Starting a unit also writes no route, so the lesson lives on `/learn`. Result: Back appears dead inside a lesson (screen unchanged, URL silently changes), and the second press exits the site. On mobile/PWA the system back gesture is the primary gesture. Only the in-app X exits cleanly (`App.jsx:2213-2216`). (Verified CONFIRMED ×2.)

---

## 2. Full findings by area

### 2.1 Navigation model
The screen is chosen by a **14-branch early-return waterfall** (`App.jsx:2548-2805`: publicPage → config-error → authReady → passwordRecovery → email-unconfirmed → landing → auth gate → demo → profileChecked boot → onboarding → cloudReady boot → first lesson → profile → AppShell) over ~16 state variables (~30 counting overlays). There is **no single source of truth** for "which screen am I on"; the URL is an imperative best-effort mirror.

| Finding | Label | Evidence |
|---|---|---|
| Back trapped in mini-unit (top-5 #5) | defect/normal-user | App.jsx:596, 2158, 2229-2235 |
| Mission reward + streak/stage celebration stack as two `aria-modal` backdrops — celebration branches check `!celebration` but never `rewardScreen` (only the course branch clears it, App.jsx:2424); the code's own comment at 2914-2918 calls this stacking a bug and guards only the achievement pair | defect/normal-user | App.jsx:2413, 2447-2515, 2905-2933 |
| Stage-1 finale co-mounts Mission-6 reward + Stage-1 celebration, ordered only by z-index 9999 vs 260 | defect/normal-user | App.jsx (both mounts), z-index in app.css |
| `loaded=false` falls through every gate into AppShell with `DEFAULT_STATS` — protected only by an implicit promise-resolution race (localStorage microtask vs `getSession()`) | risk/developer-only | App.jsx:2745-2764, storage.js:181-189 |
| Retired DemoMode still boots from stale `tuk-talk-thai-demo-mode` localStorage flag, contradicting the comment at App.jsx:264-265 | risk/edge-tester (defect for legacy visitors) | App.jsx:389, 2722 |
| Mini-unit/first-lesson/placement invisible to URL; anonymous `/profile` deep link shows learn tab under a `/profile` URL | risk/edge-tester | App.jsx:2786, 345 |

**Fine:** root ErrorBoundary exists (`main.jsx`) — render crashes show a themed reload card, not a white screen. Tab↔URL sync is solid for all 10 tabs; unknown paths canonicalize to `/learn`. Profile/Settings routing clean (open pushes route, Back closes). Auth precedence ordering is sound and security-correct (recovery-evidence gate, no branch exposes the deck unconfirmed). `cardSession` clears on popstate (no Back-trap analog). Identity-change hygiene wipes every overlay on user switch.

### 2.2 Full-screen surfaces
~28 surface-controlling state atoms; **three architectures**: a genuinely consistent ROUTED family (public/profile/settings/auth/landing/demo/reset-password — one `applyRouteState` reducer, Back handled, mutually exclusive); a DERIVED-gate family (boot/onboarding/first-lesson — ignores history); and a NON-ROUTED overlay family (celebration, rewardScreen, cinematic, streak recovery, save-progress ask, upgrade prompt, toasts…) with **~5 entry and ~4 exit mechanisms** and hand-written pairwise guards. Both demonstrated stacking defects live in the unguarded pairs of the third family. Escape/scrim behavior is consistently split by intent (dismissible chrome closes on Escape; acknowledgment moments require a button) — defensible. In-tab sessions (Challenge run, Dating lesson/quiz) are component-local and destroyed without confirmation by any route change (risk/normal-user). Seven ad-hoc scrim z-index tiers; streak-recovery (60) sits below settings (100). Mini-unit resumes after Settings visit; a mission card session does not (inconsistent survivor semantics).

**Fine:** `requestSuperPrompt` is a genuinely centralized gate (can't fire over 8 other overlays, daily-capped). Achievement-vs-reward stacking IS guarded with an accurate comment. Cinematic-over-celebration co-mount is deliberate and replay-proof. Reward-family shares `.reward-screen-backdrop` intentionally. GuidedTutorial has a documented 12-flag exclusion list.

### 2.3 Navigation surfaces (chrome)
Desktop `SidebarNav.jsx:26-40` and mobile `MobileNav.jsx:28-41` are **two hand-synced arrays** (three counting public `PAGE_LINKS`) — but they currently agree *exactly*: same 8 destinations, order, labels, icons, badge logic ("kept in sync" comments; a previously-audited order swap was fixed). The CSS-only swap at a single 1024 px breakpoint is clean.

| Finding | Label | Evidence |
|---|---|---|
| Embedded `/plans` keeps the previous tab highlighted in both navs (route type `public` never calls `setTab`, App.jsx:620-627; "Go Super" has no active state) — every signed-in upgrade visit shows a wrong highlight | defect/normal-user | App.jsx:2545, 2808-2810; SidebarNav.jsx:55 |
| `/today` and `/leaderboard` render with no nav entry and zero highlight — URL-only ghost tabs | defect/edge-tester | ROUTE_TABS App.jsx:205-218 vs both nav arrays |
| Mobile "More" sheet survives crossing the 1024 px breakpoint and floats over desktop layout | defect/edge-tester | MobileNav.jsx:109 (state not reset on resize) |
| Dead legacy nav layer: `NavBtn.jsx`, `UserMenu.jsx`, `.app-nav`/`.nav-btn` CSS — and CLAUDE.md still documents the dead layer | defect/developer-only | grep; CLAUDE.md styles section |
| Same destination `/plans` labeled "Go Super" in-app, "Plans" on public chrome | preference/normal-user | SidebarNav.jsx:96 vs SiteFooter |

**Fine:** auth-conditional entries agree across navs; tutorial anchors resolve the duplicate `data-tutorial` correctly; public SiteFooter is a real single source reused everywhere; middle-click preserved on public links; ProfilePage unmounts the nav entirely (no stale highlight); deep links highlight correctly on cold load.

### 2.4 Information architecture
**Sitemap (verified complete):** 8 nav-visible tabs (Learn, Practice, Quests, Challenge, Browse, Guide, Shop, Dating 18+) + 2 ghost tabs (`/today`, `/leaderboard`) + Profile/Settings + 7 public pages + auth/onboarding flows + the Dating deep ladder + 9 Guide sub-tabs. Grouping (Primary | Engage | Explore) is coherent; the count is appropriate; heavy secondary content (situations, missions) was correctly folded into Learn as collapsibles rather than new tabs.

| Finding | Label | Evidence |
|---|---|---|
| Anonymous learners can never browse achievements: AchievementsModal lives only in ProfilePage (auth-gated) and orphaned TodayTab — the gamification loop dead-ends for the exact audience of the anonymous-first redesign | defect/normal-user | imports: ProfilePage.jsx:7, TodayTab.jsx:7; gate App.jsx:2786; no `setTab('today')` anywhere |
| TodayTab is a fully-built dashboard orphaned from all navigation (duplication with Learn "resolved" by hiding, not deleting) | defect/edge-tester (refuter: PARTIAL — no normal user reaches it) | 230-line component, zero nav entries |
| "Challenge" names three different things (nav tab, Guide's Tone Challenge, lesson challenge step) | risk/normal-user | QuizTab label, GuideTab, MiniUnitFlow |
| Guide mixes six reference sections with three interactive exercises (Listen & Match, Say It, Tone Challenge) under a reference-flavored label | preference/normal-user | GuideTab.jsx |
| Plan management duplicated in Settings and Profile | preference/normal-user | SettingsModal §Plan & Billing; ProfilePage |
| Dead IA artifacts: unreachable `premium` info page variant, five unused components, backup files | preference/developer-only | grep |

**Fine:** card review is genuinely hub-and-spoke — every entry (continue strip, missions, quests, situations, course CTA) converges on ONE CardsTab with typed `sessionScope`s; empty states route honestly. Shop (soft currency) vs Plans (real money) do not overlap and both say so. Dating's gate ladder is correct at every rung. The anonymous path has no one-way doors (AnonymousAccountBar always present). SituationRail correctly lives inside Learn, collapsed.

### 2.5 The roadmap: promise vs. reality
Bottom layer honest, top layer not. Mini-units are built from **explicit hand-picked card id lists** (not filters), all 733+ referenced ids exist, zero wrong-stage references (the check-mini-units claim verified true), and ~88 of 96 unit titles fairly describe their cards. The stage layer above breaks the promise (top-5 #4). Additional findings: stage names contradict their own descriptions inside `taxonomy.js` (two label schemes glued together — defect); **"What's in Stage N?"** on locked stages opens a Super upsell whose copy is about the 18+ Dating section, and is a **silent no-op for paying Super users** (`LearnPath.jsx:249-251` → `App.jsx:2041-2046` discards the stage argument → `App.jsx:1933` `if (superActive) return false`); two Stage-4 units share the identical title "Out and about"; a Stage-8 unit teaches two cards glossed "east" and two glossed "distance" in one 8-card lesson; Mission 6 celebration says "the full **4,752**-card path" but the deck is **4,780** (`taxonomy.js:161`); `STAGES[].cats` is dead metadata (declared categories with zero cards in their stage). Path legibility: a node communicates almost nothing before entry; units cover 12–31 % of each stage while unlock needs 100 % (top-5 #3).

**Fine:** situations overlay is *unusually honest engineering* (counts are exactly the launched session, empty situations collapse into an explicit "not written yet" row, draft badges mandatory, sit-dating never auto-suggested). Stage 1 delivers its promise (55 % in-theme, titles precise). Trail mechanics sound; statuses consumed verbatim from the lib.

### 2.6 Progression logic
**Coherent-with-seams at module level; two accidental fractures.** `getStageState` is the single derivation of stage complete/unlocked/current and every consumer reads the one derived object via props (verified across CardsTab, QuizTab, LearnPath, TodayTab, celebrations, cinematics, quests). The economy cannot touch progression. XP-farming guards are sound. Cross-device merge is monotonic for progression ledgers. The two accidents: the **double ladder** (top-5 #3) and the **eligibleCards-vs-serving-window mismatch** (phantom dues). Also: "Practice Stage N words" on a below-`startedStage` stage serves the wrong stage's cards (defect, CONFIRMED ×2); `getMissionState.stage1Complete` is a second, independent stage-1-complete predicate omitting the legacy mature fallback (risk); a dead second frontier system (`getSituationProgressState` + `completedSituations` ledger) has no UI consumer or writer (developer-only); `MISSION_UNLOCK_THRESHOLD`'s doc comment describes logic that doesn't exist and `STAGE_1_COMPLETE_THRESHOLD` is exported dead.

**Which splits are principled:** stage-window duplication with validators, the currentStage ratchet vs. derived state, the `isTaught` read-time union, and the device-local Dating ledger — all deliberate, documented, and correct. **Which are accidents:** the two above.

### 2.7 Single-source-of-truth
Current-generation constants are genuinely centralized (economy.js with an honored "change HERE only" contract; entitlements.js PLANS; config/site.js name/URL/email; contentFlags.js). Prices agree everywhere today ($4.99/$39.99) but are re-typed as prose in 3 UI strings; "5 hearts" and "+25 XP · +5 gems" re-typed similarly. **User-visible wrong number:** "4,752-card path" (`taxonomy.js:161`) vs. real 4,780. **Docs:** CLAUDE.md is one product-generation stale on: "cards go up to ~960" (ids reach **5739**; 169 cards already occupy 961–1592; **no validator enforces global id uniqueness** — a real trap, though zero duplicates exist today), "5-tab nav"/"no router" (8 visible destinations, 10 tab surfaces, hand-rolled pushState router), "localStorage (no backend yet)" (full Supabase + Stripe + OneSignal), Guide list (7 listed, 9 exist), layout classes (`.app-nav` is dead). `docs/architecture/README.md`'s self-declared "VERIFIED GROUND TRUTH" table is **stale on 6 of 8 rows** (total 4,792 not 4,791; 28 validators not 21, wired into CI, etc.). Storage-key rule violated by App.jsx (7 direct keys), analytics.js, DemoMode.jsx under a second key prefix. ~7 backup files (~1.1 MB) inside `src/` — confirmed unimported and absent from the bundle; pure grep/audit noise (plausibly the origin of some stale doc numbers).

**Fine:** CLAUDE.md's deck numbers are exactly right (4,780/4,792/5/7; 150→981; 70 %). App name and support email consistent everywhere a user looks. No duplicate card ids today. Hearts constants imported everywhere, never re-implemented.

### 2.8 File-level structure
**App.jsx (3,000 lines, 35 useState + 18 useRef, ~15 responsibilities)** is where concentration demonstrably hurts: "reset per-user state on identity change" is two hand-maintained enumeration lists, and git history shows that bug class took a **four-commit chain to converge** (15d1baf → 6dc547d → 70d0b1e → f45fc2d, the last titled "close residual … leaks"); 25 of the last 60 commits touch App.jsx (42 % — universal merge/review surface). The four giant data files are **fine**: logic-free content tables through one sound choke-point pipeline (zero duplicate ids, zero orphan overrides, correct stamp ordering, prototype-pollution guards). Layering is clean (no lib imports React; no component imports another component's logic; zero contexts, as documented). CSS: 3,538-line app.css (+ landing.css 862 + plans.css 317, contradicting "all styles in app.css") with ~60–70 confirmed-dead selectors — but live selectors are sometimes template-literal-constructed, so naive purging would over-delete. The `stats` prop means two different shapes in sibling tabs; LearnPath receives the same object as both `stats` and `fullStats` (App.jsx:2864).

### 2.9 Everything else (the "breaks every so often" file)
Beyond the top-5 SW fight and sync rollback:

| Finding | Label | Evidence |
|---|---|---|
| `autoUpdate` SW, no update prompt, no periodic check: long-lived PWA sessions run stale bundles against a moving backend; every launch serves the previous deploy's index.html from precache ("one version behind per launch"); mid-session updates skipWaiting+claim silently | risk/normal-user | vite.config.js:9; dist/registerSW.js; no `virtual:pwa-register` in src |
| TTS fails silently without a Thai voice: `ttsAvailable()` is just `!!window.speechSynthesis`; utterance proceeds with engine-default voice → silence/gibberish; no hint anywhere | defect/normal-user | audio.js:84-86, 202-206, 271-274 |
| Push-permission prompt fires 2.5 s into the FIRST lesson / over the guided tutorial (guard is only `hasOnboarded`), and its durable fired-flag **permanently disarms the intended post-first-lesson ask** | defect/normal-user | App.jsx:1267-1286, 316-330, 2050-2061 |
| Placement: `slice(0,14)` silently drops the stage-8 pair (test can never suggest stage 8); one recognized card marks a whole stage known; both inline comments describe different logic than ships ("stage AFTER", "50 %+" vs. actual `<0.25`) | defect/normal-user | state.js:65-77; PlacementOnboarding.jsx:145-153 |
| The lesson renames itself mid-flow: path "Lesson N" → intro "guided lesson" → coach "mini-unit" → exit "Finish mini-unit"; stage-1 Learn stacks a third vocabulary ("Start Mission N") | defect/normal-user | LearnPath.jsx:352/433/95; MiniUnitFlow.jsx:381/386/542/550 |
| Tab switches keep the previous tab's scroll position (`handleSetTab` lacks the `scrollTo(0,0)` that `handleNavigatePath` has) | defect/normal-user | App.jsx:2237-2250 vs 696-701 |
| Boot gates block on Supabase queries with no timeout; every cloud failure is invisible (89 swallowed catches, zero user-facing failure surfaces, no offline indicator) | risk/normal-user | cloudStorage.js; App.jsx gates |
| One monolithic 1.8 MB JS chunk — the marketing landing downloads the entire app + 4,792-card deck; zero code splitting | risk/normal-user | vite.config.js (no manualChunks); grep React.lazy → 0 |
| Pinch-zoom globally disabled (`maximum-scale=1.0, user-scalable=no`) — for an app whose core content is small Thai script | risk/normal-user | index.html viewport meta |
| First-party media (4.2 MB character art, cinematics) not in the SW precache — installed PWA opens offline with broken art | risk/edge-tester | vite.config.js (default globPatterns) |
| Google Fonts from network, never cached | risk/normal-user | index.html |

**Fine (and genuinely impressive):** every JSON.parse guarded with shape validation — no crash-loop path from bad localStorage; `migrateStats` additive-defaults pattern handles old/new blob shapes both directions; per-card SRS merge is monotonic (anonymous progress never dropped at sign-in); declining SaveProgressAsk loses nothing; failed cloud init can never strand a returning user on a spinner AND can never let stale local state clobber the cloud row; rewards/celebrations are idempotent under StrictMode double-invoke; server-reward dispatch fails safe (auth failures don't fall back to local grants); Stripe checkout return is bounded, honest on timeout, webhook-only entitlement; hearts regen is clock-manipulation-resistant; speech *recognition* (unlike TTS) is properly feature-gated with a 12 s timeout; DB-side XP guard prevents forged decreases.

---

## 3. Doc-vs-code disagreements (correct values)

| Doc says | Code says (correct) |
|---|---|
| CLAUDE.md: "localStorage for persistence (no backend yet)" | Full Supabase backend (auth, cloud sync, server rewards), Stripe billing, OneSignal push; app hard-fails without Supabase config |
| CLAUDE.md: "5-tab nav… no router" (+ App.jsx:2866 comment) | 8 nav destinations, 10 tab surfaces, hand-rolled pushState/popstate router (App.jsx:193-290) |
| CLAUDE.md: "cards go up to ~960" | Max id **5739** across four files; 169 cards already in 961-1592; no global id-uniqueness validator |
| CLAUDE.md: Guide has 7 sections | 9 (adds Listen & Match, Say It; "Tones Quiz" renamed "Tone Challenge") |
| CLAUDE.md: layout `.app-nav` etc.; "all styles in app.css" | `.app-nav` dead; live shell is `.app-shell-*`; three stylesheets (app/landing/plans) |
| `taxonomy.js:161` (user-visible): "full 4,752-card path" | 4,780 |
| `docs/architecture/README.md` "VERIFIED GROUND TRUTH" | Stale on 6/8 rows: total 4,792 (not 4,791); s:1250; stage 8: 993; needsReview 96; 946 cards carry reviewStatus; **28** validators wired into `npm run check` + CI (not "21, not wired") |
| `.github/workflows/validate.yml:3`: "all 25 validators" | 28 |
| `vite.config.js:11-15` / `onesignal.js:52-53`: two SWs "coexist… both at scope '/'" | Impossible per spec — one registration per scope; they alternate-replace each other |
| `state.js:19-20`: below-placement stages "auto-matured" | Nothing auto-matures them; only ≤2 sampled cards per stage get progress |
| `App.jsx:1820-1822`: placed users "mark the guided pilot done" | Only `firstLessonCompleted` is set; the pilot unit is never added to `completedMiniUnits` |
| `gamification.js:75-76`: MISSION_UNLOCK_THRESHOLD gates mission unlock | Missions unlock on all-cards-seen; the constant is only the legacy stage-complete fallback; `STAGE_1_COMPLETE_THRESHOLD` is dead |
| PlacementOnboarding comments: "stage AFTER the highest", "50 %+ correct" | No +1 exists; the floor is 0.25 |
| CLAUDE.md: "don't use localStorage directly" | App.jsx (7 keys), analytics.js, DemoMode.jsx bypass storage.js under a second key prefix |

(Also verified TRUE, for fairness: CLAUDE.md's deck counts 4,780/4,792/5/7 and per-stage growth 150→981; "no contexts yet"; single `saveState` call site; MobileNav/SidebarNav sync comments; miniUnits.js "every id exists, right stage" claim; ListenMeaning's "4,457 of 4,780 carry a phonetic".)

---

## 4. Proposal — ranked by (user impact ÷ risk of breaking what works)

Constraints honored: no new dependencies, no DB migrations, no Stripe/Edge-Function/Server-Rewards changes proposed as incremental work; economy rules, Super/18+ gates, badges, Dating sequence + direction lock, and the approval eligibility floor untouched. Every item states how the 28 validators stay green: **run `npm run check` after each item; none of the safe-incremental items touches a validator-guarded invariant, and two items *add* validators.**

### A. Safe and incremental (do these; roughly in order)

1. **OneSignal SW scope fix** — pass `serviceWorkerParam: { scope: '/push/onesignal/' }` + `serviceWorkerPath` in the OneSignal init (`onesignal.js:48-70`) and correct the two false "coexist" comments. Could break: push delivery for existing subscribers (OneSignal re-registers at the new scope on next visit — their documented migration path). Verify: DevTools → two registrations at distinct scopes; offline launch serves from precache; test push received. Size: **XS**. *This plus #2 attacks "breaks every so often" head-on.*
2. **Sync flush + re-arm** — flush the pending debounced upload on `visibilitychange/pagehide`; retry failed uploads with backoff; re-arm the uploader when a later init succeeds instead of disarming for the whole session (`App.jsx:1033-1070`). Deliberately does NOT change the merge policy (cloud-authoritative stays; anti-forgery design preserved; `check-progress-merge`/`check-subscription-status` untouched). Could break: nothing user-visible; worst case an extra upload. Verify: quick-session-then-close scenario; XP survives relaunch. Size: **S**.
3. **Back-trap fix** — when `applyRouteState` clears `activeMiniUnitId`, also clear the persisted `stats.activeMiniUnitId` (or gate the resume effect on the current route). Could break: legitimate resume-after-reload (test both paths). Verify: manual Back inside a lesson exits to Learn; reload mid-lesson still resumes; `check-mini-unit-sequence` green. Size: **XS**.
4. **Overlay mutual exclusion** — extend the existing achievement guard pattern to the `celebration`+`rewardScreen` pair (queue the celebration until the reward dismisses; the course-complete branch at App.jsx:2424 already shows the correct pattern). Verify: force the Mission-6 + Stage-1 finale; `check-celebrations` green. Size: **XS**.
5. **Push-prompt timing** — add `firstLessonCompleted && tutorialSeen` (and no-overlay) to the guard at App.jsx:1267-1286, and don't burn the durable fired-flag from this path. Verify: fresh-signup funnel; prompt appears only after first lesson. Size: **XS**.
6. **`scrollTo(0,0)` in `handleSetTab`** (mirror App.jsx:696-701). Size: **XS**.
7. **Plans nav highlight** — when `embedPlansInShell`, pass a sentinel tab so no item (or the Super entry) highlights. Size: **XS**.
8. **"What's in Stage N?"** — replace the upsell with a real stage-preview (the unit titles for that stage already exist in `miniUnits.js`); at minimum stop the silent no-op for Super users. Analytics mislabeling also fixed. Size: **S**.
9. **Phantom dues, small fix** — align the dashboard count with the serving window (add the same `stage >= startedStage` lower bound at App.jsx:2350), which also un-blocks the due-cards quest. (The alternative — serving below-floor dues — changes placement semantics; see B.) Verify: `check-quest-logic` green; placed-user scenario. Size: **S**.
10. **One name for the lesson object** — pick "Lesson" and use it across LearnPath/MiniUnitFlow/FirstLessonFlow/Quests copy ("Mission" stays for the stage-1 mission structure, but the two CTAs on one screen should stop using different nouns for the same tap). Copy-only. Size: **S**.
11. **Fix "4,752" → compute from `CARDS.length`** (`taxonomy.js:161`); fix the placement comments-vs-code drift (and decide the ≥1-known-card promotion floor deliberately — behavior change is owner-visible, keep threshold change out unless approved). Size: **XS**.
12. **TTS voice hint** — detect the null-Thai-voice case once, show a one-time dismissible hint ("Your device has no Thai voice — try Chrome / install one"). No behavior change when a voice exists. Size: **S**.
13. **Two new validators** — `check-card-id-uniqueness.mjs` (lands green today, springs the "~960" trap forever) and extend `check-economy` to assert the mid-session hearts gate branch (`outOfHearts && !checked`). Additive; 28 → 30 green. Size: **XS**.
14. **Docs refresh** — CLAUDE.md (tech stack, nav, card-id recipe, Guide list, CSS classes, storage-rule exceptions), `docs/architecture/README.md` ground-truth table, `validate.yml` comment. Zero runtime risk. Size: **S**.
15. **Dead-weight sweep** — delete the ~7 backup files in `src/`, `NavBtn.jsx`, `UserMenu.jsx`, the dead `.app-nav` CSS block, the dead `getSituationProgressState` frontier, `STAGE_1_COMPLETE_THRESHOLD`. Each deletion verified by grep-no-references + build + 28 green. Size: **S**. (Do after the fixes so greps during the fixes aren't polluted — or first, for the same reason; either is fine, just not interleaved.)

### B. Requires restructuring (propose, don't rush)

16. **Reconcile the two progression ladders** (the real "not connected" core). Smallest principled step: (a) make incomplete units of *earlier* stages startable from the collapsed stage markers (LearnPath change only — the replay affordance already exists for completed units), which makes Course Complete reachable again; (b) seed `completedMiniUnits` with skipped-stage units at placement commit (one write in `completeOnboarding`, matching its own comment's claim); (c) decide whether guided lessons should write card progress (bigger: touches XP anti-farm ledgers — needs design). Could break: course-completion celebration idempotency, unit-frontier logic. Verify: `check-course-completion`, `check-mini-unit-sequence`, `check-pedagogy-regression` at every step + manual placement/fast-learner scenarios. Size: **M** (a+b), **L** (c).
17. **Stage identity honesty** — either rename stages/descs to what the decks actually are (difficulty bands with topic clusters — copy change, but it's the product's spine, so it's an **owner decision**), or re-theme content per the original promise (native-team scale). The current state — an internal doc admitting the labels are wrong while the UI keeps promising — is the worst of both. Size: copy **S** / content **XL**.
18. **Screen-state consolidation** — derive a single `surface` value (one reducer/enum) from the 14-branch waterfall, and fold the non-routed overlay family into one priority queue (the existing guards become queue policy). This is the *right* long-term shape, but the waterfall's auth ordering is verified sound and the two shipped stacking defects are fixed by #4 — so do this only when the next full-screen surface is added, one branch at a time, behind the existing route smoke + validators. Size: **L**. **A big-bang rewrite is NOT warranted now.**
19. **SW update UX** — switch to `registerType: 'prompt'` + a small "Update ready — refresh" toast + periodic `registration.update()`. Touches the deploy path; test across an actual deploy pair on a preview domain. Size: **S-M** (restructuring-adjacent because its failure mode is the update path itself).
20. **Code-splitting the landing vs. app** (React.lazy for tab surfaces; no new deps). Perf, not correctness. Size: **M**.

### C. Cosmetic / preference
Re-enable pinch-zoom (arguably accessibility, not cosmetic — cheap, do it); label "Plans" vs "Go Super" consistently; z-index tier tidy-up; `stats`/`fullStats` prop naming; cache Google Fonts + character art in the SW precache; Guide relabel ("Practice studio" split); Settings/Profile plan-management dedupe.

---

## 5. What I would do FIRST — and what I would NOT do yet

**First (one small PR each, in this order): A1 + A2** — the SW scope fix and the sync flush. They are the two demonstrated "breaks every so often" mechanisms, they are XS/S with tightly bounded blast radius, neither touches a validator-guarded invariant, and they convert the owner's least-reproducible complaint into fixed code. **Then A3–A5** (Back trap, overlay stacking, push prompt) — the three most user-visible "unprofessional" moments, each XS.

**Not yet, and why:**
- **The App.jsx / navigation-model rewrite (B18).** The waterfall is ugly but its auth-security ordering is verified correct, the routed family genuinely works, and both demonstrated overlay defects have XS targeted fixes. A rewrite risks the app's best-tested surface for developer-facing benefit. Do it incrementally when the next surface is added.
- **Guided-lessons-write-card-progress (B16c).** It's probably the right end-state but it interacts with the XP anti-farming ledgers and placement; design first, behind the validators.
- **Stage re-theming (B17 content path).** Needs the native team and owner intent; the copy-honesty path is available immediately as an owner decision.
- **Anything touching the merge policy's cloud-authoritative stats.** The flush+re-arm fix (A2) removes ~90 % of the rollback exposure without weakening the anti-forgery design; only revisit `max(local, cloud)` for totalXp if rollbacks are still observed afterward (the DB no-decrease guard makes it safe, but it's a policy change).

---

## 6. Confidence

| Conclusion | Confidence | What would change my mind |
|---|---|---|
| SW scope conflict is real and intermittent for push-enabled users | **High** (spec-backed; both adversarial passes confirmed; the code comment claims an impossibility) | A runtime trace on a push-enabled device showing OneSignal v16 registering at a non-root scope by default |
| Sync rollback mechanism | **High** on mechanism, **Medium** on how often real users hit it (depends on session timing/offline patterns) | Telemetry showing uploads virtually always land before close |
| Double-ladder progression fracture + phantom dues | **High** (node-computed numbers; CONFIRMED ×2 each) | — |
| Stage-name mismatch percentages | **High** (computed from the live deck against taxonomy cats) | A deliberate owner statement that stage names are aspirational branding, not content labels |
| Back trap | **High** (static trace CONFIRMED ×2; not runtime-tested) | A runtime test showing the resume effect loses the race — the trap would then be intermittent rather than constant, which is arguably worse |
| "These findings explain the owner's felt experience" | **Medium-High** — the mechanisms map cleanly onto every reported symptom, but without device logs I cannot prove which specific breakages he personally saw | The owner's repro notes for one or two specific "it broke" moments |
| "A large restructure is not warranted now" | **High** — 28 validators green, the defect list is dominated by seam bugs with XS/S fixes, and the one architectural fracture (progression ladders) has a principled M-size reconciliation | If safe-incremental fixes keep regressing because App.jsx coupling makes them unsafe to land, that reverses this conclusion |

---
*Read-only assessment; no files other than this document were created or modified. Not committed.*
