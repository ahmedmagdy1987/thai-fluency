# Tuk Talk Thai — Spec 04: Engagement Loop

**Status:** Planning only. Elaborates the FOUNDATION CONTRACT (`docs/architecture/README.md`); where they differ, the contract wins. This spec writes **zero** application code — data-shape sketches and interface signatures only.

**Owns (per foundation index, row 4):** identity capture, onboarding, notifications; where identity is captured; the retention loop; hidden-where-unavailable discipline.

**Reuses verbatim from the contract:** exercise-type IDs (`recognition-th-en`, `production-en-th`, `sentence-build`, `listen-meaning`, `tone-discriminate`, `speaking-repeat`, `register-judge`, …); situation IDs/order (§2); identity tags `path-tourist` / `path-expat` / `path-partner` / `path-worker` / `path-none` (§3); register levels `reg-*` (§4); tones `tone-*` (§5); mastery states `mastery-taught` / `mastery-recognized` / `mastery-produced` / `mastery-spoken` (§6); the free/Super line (§7).

**Hard rails honored:** no new npm deps; plain CSS; localStorage only via `lib/storage.js`; speaking gated + hidden where unavailable; entitlement server-authoritative (client never grants Super).

---

## 0. The loop, concretely (trigger → action → variable reward → investment)

The engagement loop reuses **only** assets that already exist: the `CharacterCoach` component + its transient reaction hook, the Web-Audio `sounds.js` cues, the pure `celebrations.js` ledger, and existing CSS (`firstlesson-*`, `reward-*`, `character-coach-*`, `ConfettiBurst`). **No new art, no new sound files, no new dependency.**

| Loop phase | Concrete surface (existing) | What it uses | File anchor |
|---|---|---|---|
| **Trigger (external)** | Daily push: "Get a daily nudge so you don't lose your streak." | OneSignal slidedown (already worded for loss-aversion) | `lib/onesignal.js:60` |
| **Trigger (internal)** | The streak flame + "Day N" on the header / reward screen; the daily-goal ring | existing streak (`stats.streak`) + daily goal (`DEFAULT_DAILY_GOAL=50`) | `lib/stats.js:167-203`, `data/gamification.js:70-73` |
| **Action** | One lesson / review round (`FirstLessonFlow`, `MiniUnitFlow`, `CardsTab`, `QuizTab`) | existing graded surfaces; direction-locked cards | `components/FirstLessonFlow.jsx` |
| **Variable reward** | Per-answer coach reaction + sound; **combo** at 3/5/10 (net-new, §3); count-up XP payoff (§4) | `useCharacterReaction` states; `playCorrect`/`playMilestone`/`playCelebration`/`playXpTick`; `ConfettiBurst` | `hooks/useCharacterReaction.js`, `lib/sounds.js:119-212` |
| **Investment** | XP banked, streak advanced, cards seeded into SRS, identity path chosen, next mission queued | `grantXp` → `computeStreak`/`startStudyDay`; `saveState` (localStorage) | `App.jsx:1151-1172`, `lib/stats.js:167-203` |

The whole loop must run **without speech** (`mastery-spoken` is structurally unreachable on iOS Safari/Firefox — §6). Speaking exercises, when available, decorate the loop; they never gate it (see §7 of this doc, "Hidden-where-unavailable").

---

## 1. INVEST-BEFORE-ASK — earn first, sign up at the peak

### 1.1 The as-built ordering blocks this (must be flagged)

Today the anonymous visitor **cannot** invest before the ask. `showAuthGate` returns **before** the onboarding/first-lesson branches:

- `App.jsx:2358` — `const showAuthGate = hasSupabaseConfig && !session && (forceAuthGate || (!demoMode && !showPublicLanding));` returns the `<AuthGate>` at `App.jsx:2359-2379`.
- The `PlacementOnboarding` (`App.jsx:2409`) and `FirstLessonFlow` (`App.jsx:2422`) branches are **downstream** of that early return, so an anonymous user never reaches them.
- The only anonymous path today is a **3-card read-only demo** (`DemoMode`, `App.jsx:2382`) that saves nothing and grants no XP/streak — the `AuthGate` copy even corrects the old "(5 cards)" claim (`components/auth/AuthGate.jsx:93-94`).

**This spec proposes reversing that ordering** (see §9 conflict table and §10). The reversal is a routing change in `App.jsx`, not a validator change, and uses the localStorage path that already exists (`lib/storage.js` via `saveState`). It is buildable-now with no new dependency.

### 1.2 Target flow (invest → reward → ask)

```
Anonymous  →  PlacementOnboarding      (voice + level + identity path — §2)
           →  FirstLessonFlow          (full pilot unit; earns +60 XP, streak = 1)
           →  Payoff screen            (MissionCompleteRewardScreen — §4)
           →  "Save your progress" ask (AuthGate, framed by the reward just earned)
           →  Main tabbed app
```

Anonymous stats persist locally exactly like a signed-in user's (`saveState({ progress, stats })`, `App.jsx`; CLAUDE.md localStorage rule). Cloud sync (`lib/cloudStorage.js`) only begins after sign-up — nothing about the anonymous lesson is lost on conversion; it uploads on first authenticated load.

### 1.3 The exact moment + copy

**Moment:** `FirstLessonFlow` reaches `step === 'complete'` and the learner taps the existing **"Unlock the app"** CTA (`FirstLessonFlow.jsx:623-625`). This already routes to `onComplete` → `completeFirstLesson` (`App.jsx:1828-1863`), which grants `FIRST_LESSON_REWARD_XP = 60` (`App.jsx:143,1833`) and shows the reward screen with `streak: Math.max(1, stats.streak || 0)` (`App.jsx:1839`). **This is peak motivation:** the confetti has just fired (`FirstLessonFlow.jsx:194-202`), XP counted up, and "Day 1" is showing.

**Do not edit protected copy.** `FirstLessonFlow`'s "Complete Stage 1 to unlock daily quests." (`FirstLessonFlow.jsx:374`) is guarded by `check-pedagogy-regression`. The conversion ask is therefore inserted **at the reward-screen boundary** — after `MissionCompleteRewardScreen`'s "Continue" (`MissionCompleteRewardScreen.jsx:124-126`), for an anonymous user only — never by rewording the lesson.

**The ask screen** reuses `AuthGate`'s welcome layout (`AuthGate.jsx:58-118`) with a reward-aware header. Proposed copy (grounded in AuthGate's existing value props at `AuthGate.jsx:67,77`):

> **Headline:** "You just learned your first Thai. Keep it."
> **Sub:** "You earned **60 XP** and started a **Day 1 streak**. Create a free account to save it and sync across devices — it takes a few seconds."
> **Primary:** "Save my progress" → `showScreen('signup')` (`AuthGate.jsx:86`)
> **Secondary (honest, non-coercive):** "Keep going without an account" → into the app; progress stays in localStorage.

The secondary path is mandatory for honesty: the learner already owns their local progress, so we must not pretend it will vanish. Conversion pressure comes from the *reward already earned*, not from a false threat.

---

## 2. SELF-COMMITMENT — every onboarding answer has a consequence

Onboarding is `PlacementOnboarding` (`components/PlacementOnboarding.jsx`). Audit of every question and its real, load-bearing consequence:

| Question (existing/new) | Answer | Real consequence | Anchor |
|---|---|---|---|
| "Who are you speaking as?" | `voice` ∈ {male, female} | Drives the render-time M/F flip on **every card** for the whole account (`displayCard`) | `PlacementOnboarding.jsx:36-47`; `lib/voice.js` |
| "Where are you with Thai?" | skill level → `stage` | Sets `startedStage`/`currentStage`; unlocks that stage's path immediately | `PlacementOnboarding.jsx:17-23,57` |
| Placement test (optional) | per-card No/Kinda/Know | `knownIds` → seeds SRS as known (skips what you know) + drives suggested stage | `PlacementOnboarding.jsx:78-153` |
| **NEW — identity path (optional)** | `path-*` (§3) | Reweights **situation order** and the daily recommender (§3 reweight rule) — never gates/forks | new; consumes contract §3 |

**Nothing is cut** — all four already carry a consequence. The rule this section enforces going forward: **no vanity questions.** If a future onboarding answer would not change `voice`, `stage`, SRS seeding, or the situation recommender, it does not ship. That is the self-commitment test: the user's answer must visibly bend the product.

### 2.1 Identity capture (contract §3) — the one new question

Placed as an **optional** step on the `PlacementOnboarding` welcome card (`PlacementOnboarding.jsx:25-75`), after voice, before/around the level picker. Framed as commitment, not demographics:

> **"Why are you learning Thai?"** (pick one, or skip)
> 🧳 "I'm visiting / traveling" → `path-tourist`
> 🏠 "I live here / long stay" → `path-expat`
> 💛 "For my partner / their family" → `path-partner`
> 💼 "For work" → `path-worker`
> *(skip)* → `path-none`

**Consequence (contract §3, verbatim rule):** `priority(sit, path) = base(sit) × weight(sit, path)`; the learner's situation order = situations sorted descending by `priority`. It reweights **which situation surfaces first and which the daily recommender boosts** — it **never locks, unlocks, forks, or gates** content. Example the copy can honestly promise: `path-partner` boosts `sit-smalltalk` and `sit-dating` to the front; `path-worker` boosts `sit-work` and `sit-formal`; every situation stays reachable in sequence for everyone. **Free-tier caveat:** the identity weighting genuinely ranks `sit-dating` high, but for free users it appears as a locked/preview card, not their next free lesson (it is Super-only and 100% native-review `pending`, so the free daily recommender resolves past it — see `curriculum.md` Open Q2) — so the honest onboarding promise is "boosted in your order", not "your next lesson."

**Persistence:** new stats field `identityPath: 'path-none'` (default). It is a **preference**, synced like `voice`/`viewMode` through `profiles.settings` via `updateSettings`, **not** derived from tier. Progress-merge class = **cloud-auth** (settings, cloud-wins) (see §9). It is user-scoped, so it must reset on identity change (`check-session-isolation`).

---

## 3. MOMENTUM — in-session combo (3 / 5 / 10), live progress, coach reactions

**Net-new but zero-dependency and zero-persistence.** No `combo` concept exists in the repo today (grep: only `dailyQuests`/`QuestsScreen` "streak"). A combo is a **transient, session-only** counter of consecutive correct **graded** answers, reset to 0 on a wrong answer. It lives in component state, is **never** written to localStorage, grants **no XP and no gems**, and touches **neither SRS nor hearts**.

### 3.1 Triggers and feedback (existing assets only)

| Combo reaches | Coach reaction (existing state) | Sound (existing) | Visual (existing) |
|---|---|---|---|
| every correct | `react('correct')` | `playCorrect()` (`sounds.js:119`) or `playCharacterCorrect(id)` | option turns correct (`firstlesson-option-correct`) |
| **3 in a row** | `react('celebrating')` — reuses "Strong run!" / "Nice streak" quiz lines | `playAchievement()` (`sounds.js:189`) | small combo pill (new CSS class, no new asset) |
| **5 in a row** | `react('celebrating')` | `playMilestone()` (`sounds.js:145`) | combo pill emphasized |
| **10 in a row** | `react('celebrating')` + confetti | `playCelebration()` (`sounds.js:157`) | `ConfettiBurst variant="strong"` (already imported by `FirstLessonFlow`/reward screen) |
| any wrong | `react('wrong')` — supportive line | `playWrong()` — deliberately soft (`sounds.js:133`) | combo resets to 0, silently (no shaming) |

Coach copy needs **no new strings**: the `'celebrating'` state already has quiz-mode lines ("Strong run!", "Crushed it!") in `data/characters.js`, dispatched by `useCharacterReaction.react('celebrating')` (`hooks/useCharacterReaction.js:71-103`). Reduced-motion is already respected in CSS + by the confetti gate (`FirstLessonFlow.jsx:196-201`).

### 3.2 Live progress (already present)

The "N of M" progress pill already renders in every graded surface (`firstlesson-progress-pill`, `FirstLessonFlow.jsx:405-406,537-539`). Momentum reuses it — the combo pill sits beside it. No new layout.

### 3.3 Anti-abuse / correctness

- Combo grants no reward, so `check-quest-logic` (no double-count) and `check-economy` (no new XP/gem source) are unaffected — XP still flows per-answer through the existing idempotent `awardReward`/`grantXp` path (`App.jsx:1188-1203`).
- Session-only + component-state means it auto-resets on unmount and on identity change → `check-session-isolation` satisfied with no new persisted ref.
- Speech-independence: `speaking-repeat` / `tone-produce` answers *may* extend a combo when available, but the combo counts non-speech graded answers first, so a device without Web Speech (iOS/Firefox) still hits 3/5/10 normally.

---

## 4. PAYOFF — one shared end-of-session screen

**Reuse the existing shared reward screen** — `MissionCompleteRewardScreen` is already the single screen for first-lesson **and** mini-units (`MissionCompleteRewardScreen.jsx:13-27`, comment: "this shared screen celebrates BOTH the 6-mission rail AND lessons/first-lesson"). Do not add a second payoff surface. Consolidating the loop onto this one screen is the goal (note: `FirstLessonFlow` currently has its own inline `'complete'` panel *and* then the reward screen — see §10 cleanup).

It already provides: **XP count-up** with per-tick sound (`displayXp` easing + `playXpTick`, `MissionCompleteRewardScreen.jsx:37-68`), **streak** (Flame + `streak`, lines 112-116), **next action** (`nextStep`, lines 117-121), confetti + celebration sound (lines 33-34, 73-74).

**Extend its props (display-only, not persisted) to complete the required payoff set:**

```
MissionCompleteRewardScreen props (existing + additions)
  title, subtitle, eyebrow, xpEarned, streak, nextStep, achievements, characterId, onContinue   // existing
  accuracy?:  number   // 0–100, correct/answered this session   ← ADD (display only)
  comboBest?: number   // best consecutive-correct run this session ← ADD (display only)
```

Rendered as two more cells in the existing `reward-summary-grid` (`MissionCompleteRewardScreen.jsx:111-122`) — same CSS pattern (Flame/Sparkles → Zap/Target icons already in `lucide-react`). The single screen then shows, in one place: **XP (count-up) · accuracy · best combo · streak · next action.** `accuracy`/`comboBest` are computed from the transient session object (§3) and never stored, so `check-progress-merge` has nothing to classify.

**Speech honesty:** the payoff never shows a "spoken" or pronunciation metric on a device without Web Speech — `mastery-spoken` is unreachable there (§6), so that row is simply absent.

---

## 5. LOSS AVERSION — streak milestones + honest recovery + freeze as a conversion surface

### 5.1 Streak milestones (celebrate, don't fabricate)

Mint **durable** milestone IDs through the existing ledger so a milestone fires at most once and is deduped across refresh/tabs/devices:

```
// new, mirrors stageCompleteCelebrationId (lib/celebrations.js:28)
streakMilestoneCelebrationId(n): string   // e.g. "streak-milestone:7"  (durable, no date suffix)
```

Milestone thresholds reuse existing signals: **3, 7, 30, 100** (7 already backs the `streak-7` "Week Warrior" achievement, `data/gamification.js:13`). Each fires `playAchievement()` + `react('celebrating')`.

**`check-celebrations` compliance:** durable IDs (no `:YYYY-MM-DD` suffix) survive `pruneCelebrated` (`celebrations.js:66-77`); they **must** be added to the baseline seed in `activeCelebrationIds` (`celebrations.js:93-108`) so a user who is *already* on a 40-day streak when this ships is **not** retro-spammed for 3/7/30. Mint via the existing `hasCelebrated`/`withCelebrated` helpers (`celebrations.js:62-87`) — never a bespoke check.

### 5.2 Honest, non-shaming recovery

The freeze mechanics already exist and are currently invisible (`docs/RETENTION_AND_MONETIZATION.md:45-51`):

- **Auto-consume:** a gap ≤ 2 days with a freeze banked keeps the streak (`computeStreak`, `lib/stats.js:174-181`).
- **Auto-grant:** +1 freeze at streak ≥ 7, once per 7 days, capped at 2 (`App.jsx:963-965`).

On a **real break** (returned after a gap, no freeze available → `computeStreak` returned `streak: 1`, `stats.js:180`), show a **one-time, supportive** recovery card — never a red "you lost your streak" shame screen. Copy (loss-aversion, honest):

> **"Welcome back. Let's start a fresh streak today."**
> "Your best was **{bestStreak} days** — you can beat it. Today is Day 1 again."
> Primary: "Study now" · Secondary (if affordable): "Use a freeze next time" → Shop.

The break is stated plainly (Day 1 again) — we do not fake-restore a streak the user didn't earn (§9 honesty). We reframe forward instead of punishing.

### 5.3 Streak freeze as a real conversion surface (consistent with contract §7)

The freeze is the honest bridge between the free economy and Super:

- **Free path (always):** buy one freeze for **30 gems** — `buyStreakFreezeWithGems` (`economy.js:162-170`, `FREEZE_COST_GEMS = 30`). Gems are the earned free currency (contract §7: "Gems are the free currency; sinks = heart refill, streak freeze"). Surface the freeze count on the streak chip + Shop (`docs/RETENTION_AND_MONETIZATION.md:45-47`; `ShopScreen.jsx:103`).
- **Super convenience (sell here):** a **monthly streak-freeze**, which the contract §7 lists explicitly under Super "Convenience" and RETENTION calls out as already-existing (`RETENTION_AND_MONETIZATION.md:93`). At the recovery moment, offer Super via the **existing** upgrade-prompt path `requestSuperPrompt('streak-freeze')`, which respects the daily cap (`superPromptLastShownAt` / `superCtaId`, `celebrations.js:58`) so it can never nag.

**Contract-§7 invariants kept:** Super sells convenience (the monthly freeze), **not** pedagogy and **not** a mastery gate; **Super grants no gems** (`check-economy` `!/gem/i.test(FEATURES)`); the free path (30 gems, or just start a new streak) is always present; entitlement stays server-authoritative — the client only *offers*, it never flips `tier` in localStorage (`stats.js:41-46`).

---

## 6. NOTIFICATIONS — in-context, reasoned, once, never nagging

All grounded in `lib/onesignal.js`. Push is **best-effort** (`onesignal.js:18`) and silently no-ops when unconfigured/unsupported (`ensureLoaded` returns false → `promptForPushPermission` returns false, `onesignal.js:93-114`).

### 6.1 When we ask

The contract requires the ask "after first lesson + streak goal set, with a reason." Sequenced against §1 (invest-before-ask), the ask can only land **after** the learner has signed up, because linking a push subscription needs a user id (`setExternalUserId`, `onesignal.js:132-147`). So:

1. Anonymous first lesson → +60 XP → **streak = 1** (the streak goal is implicitly set the moment the streak starts; the daily goal `DEFAULT_DAILY_GOAL = 50` is already live).
2. Sign-up ask (§1.3) → account created + confirmed.
3. **Then** the highest-intent push ask fires — this is `maybePromptPushAfterFirstLesson` (`App.jsx:1812-1826`), which already: fires once (session ref `notificationPromptFired` **AND** durable `hasFiredPushPrompt()`, lines 1814/1817), requires `isEmailConfirmed` + `hasOneSignalConfig` (line 1813), and short-circuits if permission is already `granted`/`denied` (line 1822).

### 6.2 The reason (already written, loss-aversion)

The OneSignal slidedown already states the reason and ties it to the just-started streak:

> "Get a daily nudge so you don't lose your streak." (`onesignal.js:60`)

That copy is exactly right for this moment — the learner has a Day 1 streak to protect. Keep it. The in-context framing wraps it: ask **right after** the first-lesson reward, referencing the streak by name, not on cold first open.

### 6.3 Never nagging (existing guards, keep them)

- **At most once, ever:** the ref + durable flag double-guard (`App.jsx:1814,1136,1817,1139`). The two ask sites (post-first-lesson at `App.jsx:1812`; post-onboarding fallback at `App.jsx:1134-1149`) share the **same** `notificationPromptFired`/`hasFiredPushPrompt` guard, so they can never both fire.
- **Respect a "no":** `denied` short-circuits forever (line 1822); the Settings toggle remains the only re-entry (`onesignal.js` `setPushOptIn`).
- **Best-effort only:** never load-bearing; SDK hiccups are swallowed (`onesignal.js:18-25`).

---

## 7. Hidden-where-unavailable discipline (speech + push)

The engagement loop must degrade invisibly, mirroring the contract's speech-gate idiom (render **nothing** when unavailable — like `SocialLinks.jsx:45` returning `null`).

- **Speech:** momentum, payoff, streak, and notifications are all fully functional with **zero** speaking exercises. `mastery-spoken` is never required for completion (contract §6, HARD RULE). Where `speechRecognitionAvailable()` is false, speaking surfaces render nothing — the loop simply counts the graded MCQ/builder answers.
- **Push:** where `hasOneSignalConfig` is false or the platform can't subscribe (iOS in-app webview, etc.), the ask no-ops silently — no "notifications unavailable" stub. The internal triggers (streak flame, daily goal ring) still drive return visits.
- **Audio/coach:** sounds are gesture-gated and fail silent (`sounds.js:43-59`); the coach is opt-out via `showCharacters` (`stats.js:71`). The loop never depends on any of them being on.

---

## 8. Data shapes & interface signatures (sketches only — no implementation)

```
// §2 — persisted preference (settings-class, synced like `voice`)
stats.identityPath: 'path-none' | 'path-tourist' | 'path-expat' | 'path-partner' | 'path-worker'

// §3 — TRANSIENT session momentum (component state; NEVER persisted)
SessionMomentum = {
  answered:      number,   // graded answers this session
  correct:       number,
  comboCurrent:  number,   // consecutive correct; reset to 0 on wrong
  comboBest:     number,   // max comboCurrent this session
  get accuracy(): number   // Math.round(correct / answered * 100)
}
// dispatch signature (reuses the existing hook; no new component)
reactCombo(react: (state, opts) => void, tier: 3 | 5 | 10): void

// §4 — payoff screen prop additions (display-only)
<MissionCompleteRewardScreen accuracy?={number} comboBest?={number} ... />

// §5 — durable streak-milestone ledger id (mirrors stageCompleteCelebrationId)
streakMilestoneCelebrationId(n: number): string        // "streak-milestone:7"
STREAK_MILESTONES = [3, 7, 30, 100]

// §1 — conversion ask context passed into AuthGate at the reward boundary
FirstLessonConversion = { reason: 'first-lesson-save', xpEarned: 60, streak: 1 }
```

---

## 9. Validator / rule conflicts + resolutions

| Rule / validator | Where this spec touches it | Conflict? | Resolution |
|---|---|---|---|
| **App routing (not a validator)** | §1 invest-before-ask reverses the `showAuthGate`-first order (`App.jsx:2358` returns before onboarding/first-lesson at 2409/2422) | **Yes — behavioral reversal** | Let the anonymous learner reach `PlacementOnboarding` + `FirstLessonFlow` (localStorage-backed via `saveState`), and gate only the **main tabbed app** behind auth. Owner decision required (§10). |
| `check-pedagogy-regression` | §1 conversion, §4 payoff | Risk if lesson copy edited | Do **not** touch protected strings ("Complete Stage 1" `FirstLessonFlow.jsx:374`, "Ear training", etc.). Add the conversion at the **reward-screen boundary**, not inside the lesson. |
| `check-celebrations` | §5 streak-milestone IDs | New milestone type | Mint via `withCelebrated`/`hasCelebrated`; durable (no date suffix) so `pruneCelebrated` keeps them; **add to the `activeCelebrationIds` baseline** (`celebrations.js:93-108`) so existing streaks aren't retro-celebrated. |
| `check-quest-logic` | §3 combo, §4 XP | New activity double-counting streak/XP | Combo grants **no** XP/gems (pure visual) → nothing new hits the "activity today" signal; XP still flows through the existing idempotent `awardReward`/`grantXp` path. |
| `check-economy` | §5 freeze offer | New gem source / Super gem grant | Reuse `buyStreakFreezeWithGems` (30 gems) — **no** new gem source; Super's benefit is the **monthly freeze** (convenience), **not** gems; the free path (gems or fresh streak) is always present. |
| `check-progress-merge` | §2 `identityPath`; §3/§4 combo & accuracy | New persisted field silently dropped / double-counted | `identityPath` = **cloud-auth** class (settings, cloud-wins), synced via `profiles.settings` like `voice`; **never** tier-derived. Combo/accuracy are session-only → **not persisted**, so no merge class needed. |
| `check-session-isolation` | §2 `identityPath`; §3 combo | User-scoped state leaking across identity switch | `identityPath` is user-scoped → reset in `resetUserScopedRefs` on identity change. Combo is component-state → auto-resets on unmount; no new device/user ref. |
| Speech gate (contract §1/§6) | §3 combo, §4 payoff, §7 | Loop depending on `mastery-spoken` | Speaking answers only *decorate* the combo; completion/payoff/streak never require them; "spoken" metric hidden where Web Speech is absent. |
| Entitlement (contract §7) | §5 Super freeze offer | Client granting Super | Client only *offers* via `requestSuperPrompt`; `tier` stays server-authoritative (`stats.js:41-46`); daily cap via `superCtaId` prevents nagging. |

---

## 10. Open questions / proposed foundation changes

1. **Anonymous first-lesson routing (the core divergence).** The contract's engagement row implies invest-before-ask, but the as-built `App.jsx:2358` forces `AuthGate` before any lesson, and the anonymous surface is a save-nothing 3-card `DemoMode`. **Proposed foundation change:** the first full lesson is playable anonymously with real localStorage-backed XP + a Day-1 streak, and the account ask moves to the post-reward moment (§1.3). This is a routing change only (no new dep, no validator relaxation) but it **reverses current behavior**, so it needs an explicit owner decision. Sub-question: should the placement/first-lesson run *before* or *after* a slimmed welcome? This spec assumes onboarding → lesson → ask (onboarding must precede the lesson because the lesson consumes `voice` and starting stage).

2. **Two "complete" surfaces for the first lesson.** `FirstLessonFlow` renders its own inline `'complete'` panel (`FirstLessonFlow.jsx:599-627`) *and* `completeFirstLesson` then shows `MissionCompleteRewardScreen` (`App.jsx:1834-1845`). §4 wants **one** payoff screen. Proposed cleanup: collapse the inline panel into a thin hand-off so the shared reward screen is the single payoff. Flagged because it touches `FirstLessonFlow` near protected copy — must be done without altering guarded strings.

3. **Identity path lives in onboarding, but §3 also feeds the daily recommender** (owned by `curriculum.md` / `progression.md`). This spec only *captures and persists* `identityPath` + guarantees "reweight, never gate." The recommender that consumes it, and the exact tie-break with contract §2 `base` order, belong to the curriculum/progression specs — noted so ownership doesn't collide.

4. **`monetization.md` (05) is not yet written.** §5's freeze-as-conversion-surface is aligned to contract §7 and `RETENTION_AND_MONETIZATION.md`; if spec 05 later refines the Super freeze cadence (e.g. monthly vs on-demand), this section should be reconciled to it, not vice-versa.

5. **Streak-goal explicitness.** The contract says "streak goal set" before the notification ask. Today the streak simply starts at 1 and the daily goal is a fixed `DEFAULT_DAILY_GOAL = 50`. This spec treats "streak started + daily goal live" as the implicit goal. If the owner wants an *explicit* "pick your daily goal" step, it should be added to onboarding (§2) with a real consequence (it already has one: `dailyGoal` drives the goal ring + `dailyGoalBonus`), and the notification copy can then name the chosen time/goal.
