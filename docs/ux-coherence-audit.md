# UX & Product-Coherence Audit — Tuk Talk Thai

**Date:** 2026-07-12 · **Audited at:** `844b1b3` (production-verified) · **Fixes applied at:** this commit
**Method:** 6-dimension multi-agent audit — Journeys A (anonymous, browser-driven with screenshots at 1280px + 375px), B (fresh free user, static walkthrough), C (Super user, static walkthrough), D (cross-cutting: offline/PWA, theme, identity transitions, interrupted flows — browser-driven), full 26-route linking/ordering matrix, and a clarity & friction copy sweep. Every safe-fix and owner-decision finding was **adversarially verified** by an independent reviewer (60 verified; 1 refuted and dropped). Complements, does not repeat, the structural audit (`docs/pre-launch-structural-audit.md`).

**Headline verdict:** the app flows well. The funnels keep perfect scent (landing → "Ready for your first mission?" → first lesson), a total beginner reaches learning in 2 taps, every empty state routes forward, money-path states are exemplary, no dead links exist, and Super users see zero upsells. The weaknesses were **vocabulary drift** (two things called "Mission", a phantom "Level" system, "Premium" vs "Super") and **value legibility** (activation never said what Super unlocked) — most of which this pass fixed.

---

## 1. Journey findings

### Journey A — Brand-new anonymous visitor (browser-driven)
- **Excellent:** value prop lands in ~2 seconds ("Speak useful Thai from your very first mission." + gold CTA); persuasion order is textbook (what → how → structure → close); demo is the best screen sequence in the funnel (three concurrent affordances on card 1, kind "Again" feedback, non-punishing); sign-up prompts are quiet footer links, never interruptions; auth errors are self-recovering ("No account found" → one-tap "Create an account with this email"); all 9 gated deep links land safely on the landing; no horizontal scroll at 375px.
- **Fixed this pass:** plans "Premium"/"Super" mix; matrix "Bonus packs" bare checkmark contradicting "(soon)"; "(5 cards)" demo miscount; matrix footnote flex-fragment layout; 25px mobile demo tap target.
- **Owner items:** "Owner review required" banners public on all 4 legal pages (known, gated on legal approval); non-replayable demo greets returning visitors with "Loved it?" (allow replay or state-aware copy); landing closes on two dead "Coming soon" donation cards (configure or hide).

### Journey B — Fresh free signed-up user (static walkthrough)
- **Excellent:** total beginner reaches the first lesson in 2 taps; "Unlock the app" verifiably lands on /learn + reward + unlock note; all 5 tutorial anchors exist at zero progress, skippable + replayable from Settings; locked stages/units say why AND how ("Complete earlier stages to unlock. Every stage is free."); the out-of-hearts gate is a model state (explains, counts down, offers gems / Super / free path); upsells are genuinely conservative (post-Stage-1, 1/day, dismissible).
- **Fixed this pass:** "Reach Level 2" (no Level system exists — now "Complete Stage 1") ×2; Quests locked CTA pointed at review-only Practice which can never unlock Quests (now "Go to Learn"); placement "(12 cards)" (test is 14 — de-numbered); false "change levels anytime" promise; due-cards quest zero-state self-contradiction ("Cleared"/"Excellent" at 0%); gem-earning copy that didn't match the real economy (Shop, hearts gate, quest reward line); first-lesson reward pointed at empty tabs (nextStep now "Mission 1 in Learn"); Tone Challenge's phantom "Required for Level 1" gate.
- **Owner items (the big ones):** **two parallel "Mission" systems collide on the Stage-1 Learn screen** (5 mini-unit "Missions" vs the 6-mission taxonomy rail, different names and counts — the single most confusing thing a fresh user sees; recommend one series keeps the word); guided lessons record no card progress, so freshly-"unlocked" Practice/Challenge are empty (copy now mitigates; structural fix is an owner call); locked-stage tap answers "how do I unlock?" with a Super modal that admits stages are free; achievements are unreachable (only entry is orphaned /today — suggest a Profile entry); quest toasts fire while Quests is locked.

### Journey C — Super user (static walkthrough)
- **Excellent:** activation race handled honestly ("Activating your Super…" → calm slow-state); every surface flips correctly (nav "Super ✓", ∞ hearts, Shop upsell unmounts, Settings/Profile plan rows, /plans already-Super state); **zero upsell leakage to paying users**; 18+ gate copy is clear, honest about device-local persistence, decline path sane; teaser↔unlocked views are data-identical; quiz reveal order is logical and safety-forward; cancel wording honest end-to-end and re-subscribe works after expiry.
- **Fixed this pass:** activation celebration now names the live benefits (Dating 18+ + unlimited hearts); Dating selector now says scores are session-only and never affect XP/hearts/progress (vanishing "Best" chips read as broken); "Answer after reveal" chip → "Hidden until you answer"; the two future-tense celebration Super buttons → standard "Go Super…" live-benefit copy.
- **Owner items:** /plans never mentions the live unlimited-hearts benefit the Shop sells ("Super = unlimited hearts") and even marks hearts "soon" — advertised-value change, owner's call; checkout returns to Learn, dropping the Dating purchase intent (suggest a "Open Dating & Real Talk" secondary CTA on the celebration); no resume path in the canceled-but-active window while two surfaces promise "manage"; inert "Super ✓" nav chip does nothing on tap.

### Journey D — Cross-cutting (browser-driven + static)
- **Excellent:** offline app shell genuinely works on anonymous surfaces (landing/plans/demo render; missing media hides invisibly); dark theme consistent across all 12 route/viewport combos with no SPA-navigation flash; interrupted flows recover cleanly (mid-demo Back, /plans Back with exact scroll restoration, demo resume); identity transitions are flash-proof (user B can never see user A's data).
- **Fixed this pass:** static 6s "Checking your link…" now pulses (reduced-motion aware); coach alt text no longer leaks "(idle)"; reset-password resend-sent dead end got "Back to sign in"; /welcome orphan period wrap.
- **Owner items:** **SPA navigations never reset scroll** — footer links land users mid-page on /plans and /privacy (one-line `scrollTo(0,0)` in `handleNavigatePath`, behavioral so not done this pass — *recommend as the first quick fix*); sign-out gives zero feedback while 3 network calls run; post-sign-in blank gate has no spinner; offline demo shows a broken coach image (characters not precached); static `document.title` on every route.

---

## 2. Linking & ordering matrix (summary — full table in the audit workflow record)

All 26 routes verified: **zero dead links** (every `setTab`/`onNavigate`/`href` target resolves), unknown paths rewrite to /learn (no 404 dead end), and exactly the **two known deliberate orphans**:
- **/today** — no nav entry, no `setTab('today')` anywhere; renders a complete, functional dashboard. Unchanged, per constraint. (Its "Tone challenge" quick card was relabeled "Tones guide" to match its real destination.)
- **/leaderboard** — deliberately out of both navs; honest "Coming soon" with inert placeholder rows. Unchanged, per constraint.

**Entry/exit highlights:** /learn is a healthy hub (12+ entry points); /plans is reachable from every upsell surface via one choke point (`handleOpenPremium`); /premium is a linkless legacy alias (correct); /reset-password is email-link-only (by design).

**Back affordances:** present on every deep surface — ProfilePage, SettingsModal, MiniUnitFlow (all steps), Dating quiz, embedded /plans, checkout modal, legal pages, every demo step. Two gaps fixed this pass (reset-password resend-sent state; /welcome back-to-home). FirstLessonFlow is deliberately exit-less (forced funnel, resumes across reloads) — acceptable.

**Nav order:** matches the learner loop (Learn → Practice → Challenge/Quests → Explore); labels byte-identical across sidebar and mobile. One wrinkle for the owner: sidebar lists Quests→Challenge, mobile bar lists Challenge→Quests (relative order swapped).

**CTA standard:** "Go Super" exact at every generic surface; "Unlock with Super" exactly once, on the Dating teaser. The two celebration buttons that deviated were fixed this pass.

**Label-vs-destination mismatches:** all fixed this pass ("Super" under "Legal" → "Plans & pricing"; "Start free" no-op for signed-in users → "Back to learning"; "(5 cards)"; "Tone challenge" quick card; "Required for Level 1").

---

## 3. Clarity findings (worst first; ✔ = fixed this pass)

1. ✔ **Phantom "Level" system** — 3 surfaces said "Level 1/2"; nothing else in the app does; the Tone Challenge one claimed a gate that doesn't exist.
2. **Two "Mission" systems on one screen** (owner) — the deepest vocabulary problem; each system is individually coherent, together they disagree on names and counts.
3. ✔ **Quests locked panel sent users somewhere that could never unlock Quests.**
4. ✔ **Economy copy didn't match the economy** (gems "from missions" that pay nothing post-Stage-1; the daily-goal quest hid its real +5 gems).
5. ✔ **"Premium" vs "Super" on the selling page.**
6. One guided flow, four names (Mission → guided lesson → mini-unit → "Mission Complete"/"Mini-Unit Complete") — eyebrow contradiction fixed this pass (neutral "Nice work"); full unification is the owner's vocabulary call.
7. Silent failures (post-launch): cloud-sync failures are console-only; TTS with no Thai voice animates "speaking" with no sound; notification-pref saves swallow errors; hearts gate says "refresh to play" when the data to self-clear is already on hand.
8. Positives to preserve: every empty state is contextual and actionable (CardsTab has six accurate variants); "SRS" never leaks into UI copy; checkout state coverage is exemplary; `alert()` count is zero; autoFocus on all credential forms.

---

## 4. Safe fixes applied this pass (all adversarially verified findings; 22 files)

| # | Fix | Files |
|---|---|---|
| 1 | "Reach Level 2" → "Complete Stage 1" (×2) + Quests locked CTA → "Go to Learn" | QuestsScreen.jsx, FirstLessonFlow.jsx |
| 2 | Tone Challenge: "Required for Level 1" → "Ear training" / achievement framing | TonesQuizSection.jsx |
| 3 | Gem-economy copy matches reality; daily-goal quest shows "+5 gems"; due-quest zero-state ("No cards yet") | ShopScreen.jsx, QuizTab.jsx, QuestsScreen.jsx |
| 4 | Plans: Premium→Super (hero + 2 FAQs), bonus-packs matrix row honest "(soon)", footnote layout, signed-in CTAs ("Back to learning" / "Your plan — keep learning" + startFree routes to /learn) | PlansPage.jsx, plans.css |
| 5 | Celebration Super buttons → standard live-benefit "Go Super…" copy (×2) | App.jsx |
| 6 | Activation celebration + notification name the live benefits (Dating 18+, unlimited hearts) | App.jsx |
| 7 | First-lesson reward nextStep → "Mission 1 in Learn" (was two empty tabs) | App.jsx |
| 8 | Stage-1 celebration: "mastered" → "learned … keep reviewing to master" | Stage1CompleteCelebration.jsx |
| 9 | Reward-screen eyebrow neutral ("Nice work") — no more "Mission Complete" over "Mini-Unit Complete" | MissionCompleteRewardScreen.jsx |
| 10 | "unlock Cards" → "unlock Practice"; "Open cards" → "Open Practice" (nav-label consistency) | FirstLessonFlow.jsx, QuestsScreen.jsx |
| 11 | Placement: "(12 cards)" de-numbered (test is 14); false "change levels anytime" softened | PlacementOnboarding.jsx |
| 12 | Auth gate: "(5 cards)" → "no account needed"; added "Back to home"; orphan-period nowrap | AuthGate.jsx, app.css |
| 13 | Reset-password: resend-sent dead end got "Back to sign in"; checking state pulses (reduced-motion aware) | ResetPassword.jsx, App.jsx, app.css |
| 14 | Dating: "Answer after reveal" → "Hidden until you answer" (shared constant, validators still pass); session-only scores hint | datingQuiz.js, DatingSection.jsx |
| 15 | "Super" links under "Legal" → "Plans & pricing"; group headings "Legal & support"/"Legal & more" | SettingsModal.jsx, ProfilePage.jsx |
| 16 | Escape closes SettingsModal (matches every other modal) | SettingsModal.jsx |
| 17 | Learn CTA: "Learn N new" → "Learn new words" (no false/overstated count) | LearnPath.jsx |
| 18 | Coach alt text drops "(idle)" dev-state suffix | CharacterCoach.jsx |
| 19 | /today quick card "Tone challenge" → "Tones guide" (label matches destination) | TodayTab.jsx |
| 20 | Touch targets: landing demo link 44px; demo footer links padded | landing.css, app.css |

Validation: build green · 13/13 validators (incl. dating-badges with the renamed shared chip constant) · local route smoke green · 11/11 headless spot-checks of fixed screens, zero console errors · `cap sync android` green.

---

## 5. Prioritized suggestions

### (a) Quick-fix candidates (small, high-value; behavioral so they need a nod, not a design)
1. **Scroll-to-top on SPA navigation** — one line in `handleNavigatePath`; footer links currently land users mid-page on /plans and /privacy. *Highest value-per-line in this list.*
2. Escape handlers on the three remaining modals (AchievementsModal, ChangePasswordModal, SuperUpgradePrompt) — same 3-line pattern now in SettingsModal.
3. "Open Dating & Real Talk" secondary CTA on the Super activation celebration (CelebrationOverlay already supports `secondaryLabel`).
4. Demo replay: reset `tuk-talk-thai-demo-idx` from the end screen's own button (or state-aware headline for returning visitors).
5. Hearts gate: derive the count from the already-ticking `regen.hearts` so it self-clears instead of saying "refresh to play".

### (b) Owner-decision-needed
1. **Unify the "Mission" vocabulary** — decide which system owns the word (recommend: mini-units keep "Mission" since the funnel promises it; rename the Stage-1 taxonomy rail e.g. "Word goals"). Ripples through reward screens, TodayTab, celebrations.
2. **Legal-page banners** — approve copy → remove `OwnerReviewNotice` (already in the launch checklist; it's also the top *UX* trust issue).
3. **/plans hearts benefit** — advertise the live unlimited-hearts benefit (matrix row currently says "soon" for something that ships today); changes advertised plan value.
4. **Locked-stage tap → Super modal** — answer "how do I unlock?" with guidance first (funnel is instrumented, so it's a deliberate trade).
5. **Achievements need a reachable home** (Profile section suggested) — 20-item collection currently only behind orphaned /today.
6. Guided lessons record no card progress → freshly-unlocked Practice/Challenge are empty (seed light SRS progress, or repoint the completion CTAs).
7. Quest toasts firing while Quests is locked; push-permission timing after first lesson; checkout return destination; canceled-window "manage" over-promise (needs a resume Edge Function — pairs with the go-live billing pass); donation cards (configure or hide); nav Quests/Challenge order swap; forgot-password account-enumeration posture.

### (c) Post-launch
Sync-failure indicator · TTS Thai-voice detection + hint · notification-pref save error surfacing · in-session heart-loss feedback ("−1 ♥") · tappable header stat pills (touch users get no tooltips) · per-route `document.title` · spinner on the two blank auth gates + sign-out busy state · precache character art for offline · demo rating row half below the fold at 1280×800 · Settings-→legal-page context loss ("Back to app" → /learn) · Super-expiry silent transition · hardcoded counts on /today.

---

## 6. Everything verified good (for the record)

Funnel scent unbroken end-to-end · 2-tap onboarding for beginners · all 5 tutorial anchors exist at zero progress · every zero-data screen routes forward · out-of-hearts gate is a model state · upsell frequency rules conservative and honest · zero upsell leakage to Super users · 18+ gate copy clear and honest · teaser↔unlocked Dating views consistent · cancel flow honest with live UI flip · offline shell works on anonymous surfaces · dark theme consistent everywhere incl. mid-transition · identity transitions flash-proof · no dead links · both orphans presentable · CTA standard exact everywhere · back affordances near-universal · `alert()` zero · "SRS" never in UI copy.
