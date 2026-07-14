# Tuk Talk Thai — Spec 3: Progression & Mastery

**Owns foundation section:** §6 (Mastery State Machine).
**Status:** Binding within the FOUNDATION CONTRACT (`docs/architecture/README.md`). Where this doc and the contract disagree, the contract wins; every divergence is logged in "Open questions / proposed foundation changes." Planning only — this doc writes **zero** application code. Data-shape sketches and interface signatures below are specification, not implementation.

**Canonical IDs reused verbatim from the foundation:** situation IDs `sit-greet … sit-formal` (§2); path IDs `path-tourist/expat/partner/worker/path-none` and weights `C/H/N/L` (§3); register IDs `reg-intimate … reg-deferential` (§4); tone IDs `tone-mid/low/falling/high/rising` (§5); mastery states `mastery-taught/recognized/produced/spoken` (§6); exercise-type IDs `flashcard-srs`, `recognition-th-en`, `production-en-th`, `sentence-build`, `listen-meaning`, `tone-discriminate`, `tone-produce`, `speaking-repeat`, `register-judge`, `dialogue` (§1); the Sacred free/Super line (§7).

---

## 1. The one-paragraph model

A learner moves down four nested rails: **situation → unit → lesson → exercise**. Situations are ordered *per learner* by `priority(sit, path) = base(sit) × weight(sit, path)` (§2/§3). Inside a situation, **units** unlock strictly linearly; inside a unit, **lessons** run in order; inside a lesson, **exercises** run **teach-before-test** (§8 `check-dating-sequence`). Advancing any rail requires only that a card be **taught** (the existing "seen" signal) — never that it be matured, recognized, produced, or spoken (§6 HARD RULE). Underneath all of it, the **existing SRS** (`srs.js`, untouched) keeps scheduling the review of every taught card, and a **derived mastery overlay** (`taught→recognized→produced→spoken`) records skill depth as a parallel, never-gating achievement track.

Nothing here adds a scheduler, a state library, a router, or a dependency. The overlay is read-time-derived plus one monotonic per-card counter.

---

## 2. Progression hierarchy: what unlocks what, and why

### 2.1 Situation → Unit → Lesson → Exercise

| Rail | What it is | Unlock rule | Enforced by |
|---|---|---|---|
| **Situation** | A `sit-*` bundle (§2), e.g. `sit-food`. New tagging layer over cards. | Strictly linear along the **per-learner** order `sort desc by priority(sit,path)`, ties by §2 `base` (§3 reweight rule). Exactly one `current` situation. | new `check-situation-sequence.mjs` (mirrors `check-mini-unit-sequence`) |
| **Unit** | A mini-unit inside a situation (6–10 vocab + a sentence + a small challenge; shape = `STAGE_1_MINI_UNIT_PILOT`, `miniUnits.js:1-51`). | Linear: unit *i* unlocks when unit *i-1* is in `completedMiniUnits` (`getMiniUnitProgressState`, `miniUnitSequence.js:15-57`). | `check-mini-unit-sequence`, `check-mini-units` |
| **Lesson** | One pass through a unit's steps in `MiniUnitFlow` / `FirstLessonFlow`: vocab → sentence → builder → challenge. | Steps are ordered inside the flow; completion writes `completedMiniUnits` + XP (`App.jsx:1908-1958`). | `check-dating-sequence` (teach-before-test), `check-course-completion` |
| **Exercise** | A single `§1` exercise-type instance. | Within a lesson, every **graded** exercise is preceded by its **ungraded teach step** (§8). | `check-dating-sequence`, `check-quiz-shuffle` |

**Why this order.** Situations surface by real-world frequency × inverse difficulty (§2 rationale): a person living in Thailand needs `sit-greet`/`sit-store`/`sit-food` on day one and can learn them earliest; `sit-admin`/`sit-formal` are rare, hard, high-register, so they come last. The **path** (§3) only *reweights* this order — it never forks, locks, or gates. Every situation stays reachable in sequence for every learner, which keeps the Sacred rule intact (§7: the whole curated path is free forever).

**Two unlock ladders exist in the code today and must be kept distinct** (this is a real structural fact, not a proposal):

1. **Guided-lesson ladder** — `completedMiniUnits` drives `getMiniUnitProgressState` (`miniUnitSequence.js`). Completing a unit records the unit id and grants XP but **writes no per-card `progress`** — the code comment is explicit: *"guided lessons record no card progress"* (`App.jsx:1840-1842`).
2. **Stage/mission "seen" ladder** — `getStageState` (`state.js:21-61`) and `getMissionState` (`state.js:117-147`) count a card as seen only when `progress[id]` exists, which today is written **only** by an SRS rating (`App.jsx:1418-1422`) or `markCardsKnown` (placement, `App.jsx:1621-1639`).

These ladders do not feed each other today. The situation rail defined here rides on ladder 1's completion ledger plus the derived `taught` set (§4.1), and **leaves ladder 2 (`getStageState`) exactly as-is** so no existing user is re-locked. The unification option (make lesson completion mark cards seen) is a behavior change → **needs-owner** (see §7 and Open Questions).

### 2.2 The situation progression lib (new, separate)

Situations must **not** be merged into `MINI_UNITS`: `check-mini-units` requires each unit single-stage and stage-contiguous, and a situation crosses stages (e.g. `sit-money` pulls numbers from Stage 1 and prices from Stage 2). Per the §8 resolution ("a **separate** progression lib with its own validator"), specify a new pure module:

```
// lib/situationProgression.js  (pure, no React, no deps — unit-checkable)
export function getSituationOrder(path)          // → [sitId,...] sorted desc by priority(sit,path), ties by base
export function getSituationProgressState(order, completedSituations, currentSituationId)
  // → { situations:[{sitId,status:'complete'|'current'|'locked',unlocked,isCurrent}],
  //     currentSituationId, pathComplete, completedCount, totalCount }
export function getUnitsForSituation(sitId)      // → mini-units tagged to this situation, in path order
```

`getSituationProgressState` is the exact shape of `getMiniUnitProgressState` (`miniUnitSequence.js:15-57`) so `check-situation-sequence.mjs` can assert the same invariants: first situation always unlocked; situation *i* unlocks when *i-1* complete; exactly one `current`; everything past the frontier `locked`; all complete → `pathComplete`. A situation is `complete` when every unit tagged to it is in `completedMiniUnits`.

Because the order is a *per-learner linearization* (one deterministic sequence given `path`), it is still strictly linear — satisfying the `check-mini-unit-sequence` shape without the branching graph that validator forbids (§8).

---

## 3. Placement / diagnostic: how each onboarding answer changes the path

The real onboarding is `PlacementOnboarding.jsx`. It captures **exactly two** things today: gender **voice** and a **starting stage** (`startedStage`). It captures **no persona, no identity path, no XP goal** — those are net-new (§3 note; capture owned by `engagement.md`). This section specifies how each *existing* answer already reshapes the path, then how the *new* answers must map.

### 3.1 Existing answers → existing path effects (grounded)

| Onboarding answer | Where | Effect on the path |
|---|---|---|
| **Speaking-as** (Male/Female) | `PlacementOnboarding.jsx:36-47` | Sets `stats.voice`; every card renders through `displayCard(card, voice)` M/F flip (`voice.js`). Not a progression signal. |
| **Skill self-rating** (5 levels) | `SKILL_LEVELS`, `PlacementOnboarding.jsx:17-23` | Maps to `startedStage`: `none`→1, `few`→1, `survival`→2, `casual`→4, `confident`→5 (`:19-23`). `onComplete(stage, [], voice)` (`:57`). |
| **`startedStage` > 1** | `completeOnboarding`, `App.jsx:1655-1681` | Skips the Stage-1 starter (`firstLessonCompleted=true`), lands the learner on `learn`, and seeds stage-milestone achievements (`:1670-1674`). `getStageState` treats every stage `< startedStage` as an unlocked **floor** (`state.js:41-44`). |
| **Placement test** ("Do you know this?") | `PlacementOnboarding.jsx:78-129`, cards from `buildPlacementCards` (`state.js:65-78`, 2/stage, skips empty `ph`, ≤14) | Each **"I know it"** adds the card to `knownIds`; `markCardsKnown` pre-matures it — `interval:30, nextDue:now+30d, learning:false` (`App.jsx:1626-1634`) — so it counts as **taught** immediately and is already near "mature" (≥21d, `srs.js:80`). |
| **Suggested stage** | `PlacementOnboarding.jsx:132-154` | Highest stage with ≥1 known card, gated to ≥25% overall (`:153`), presented as the default in the stage picker (`onComplete(stage, knownIds, voice)`, `:165`). |

**Net effect on "where do I start":** `startedStage` sets the unlocked floor; placement `knownIds` pre-teach specific cards; the two together determine which situations are already mostly-taught and therefore drop in first-teach priority, pushing the learner's **entry situation** to the highest-priority `sit-*` that is not yet unit-complete.

### 3.2 New answers → new path effects (net-new; owned by `engagement.md`, consumed here)

Add these as **optional** onboarding questions. This doc specifies only how each answer must *change the path*; it does not build the UI.

| New answer | Persisted as | Path effect (this doc's contract) |
|---|---|---|
| **Identity** ("Why are you learning?" → tourist / expat / partner / worker / skip) | `stats.identityPath` ∈ `path-tourist \| path-expat \| path-partner \| path-worker \| path-none` | Selects the §3 weight column. `getSituationOrder(path)` reweights situation order; the daily recommender boosts the top of that order. **Never** locks/forks content (§3). `path-none` = all `N` = §2 `base` order. |
| **Starting situation** (derived, not asked) | — | = first situation in `getSituationOrder(identityPath)` that is not unit-complete, respecting the `startedStage` floor. A `survival` (Stage 2) + `path-tourist` learner enters at `sit-food` (base 9 × C 2.0 = 18) rather than `sit-greet`. |
| **Daily time** ("How much time per day?" → e.g. 5/10/15 min) | `stats.dailyGoal` (already exists; default `DEFAULT_DAILY_GOAL = 50`, `gamification.js:73`) | Sets the daily XP goal that drives the streak/goal quests (`dailyQuests.js:16-52`). A larger goal simply asks for more activity/day; it is **not** a gate and does not change unlock rules. |

**Merge classes for the new fields** (§8 `check-progress-merge`): `identityPath` is a **cloud-authoritative** preference (like `voice`; cloud wins, never derived from a reward). `dailyGoal` is already cloud-authoritative (`progressMerge.js:82`). Neither may ever influence `tier` (`progressMerge.js:109-112`).

---

## 4. Mastery state machine (foundation §6)

```
mastery-taught ─▶ mastery-recognized ─▶ mastery-produced ─▶ mastery-spoken
```

Four canonical per-card states. This is a **derived overlay on top of the existing SRS** — it does not replace `srs.js` and does not add a scheduler (§6).

### 4.1 State definitions, transitions, and grounding

| State | `id` | Reached when | Advanced by (exercise-type IDs) | Source of truth |
|---|---|---|---|---|
| Taught | `mastery-taught` | `progress[id]` exists **OR** the card is in a `completedMiniUnit`'s card set | any SRS rating (`flashcard-srs`), `markCardsKnown`, or completing a lesson that contains the card | `App.jsx:1418-1422`, `1621-1639`; `completedMiniUnits` (`App.jsx:1922-1927`) |
| Recognized | `mastery-recognized` | learner picks the correct meaning from Thai, or from audio | correct `recognition-th-en` / `listen-meaning` | new overlay signal |
| Produced | `mastery-produced` | learner produces the Thai from English | correct `production-en-th` / `sentence-build` | new overlay signal |
| Spoken | `mastery-spoken` | browser speech returns `correct`/`close` | `speaking-repeat` / `tone-produce` verdict | new overlay signal; `[gated]` |

**`mastery-taught` = the existing "seen" signal (extended).** Foundation §6 states taught is advanced by "completing a lesson containing the card." The code does **not** write `progress` on lesson completion (`App.jsx:1840-1842`), so to honor §6 without rebuilding SRS, `taught` is defined as a **read-time union**:

```
isTaught(cardId, progress, completedMiniUnits) =
    !!progress[cardId]
    || cardId ∈ ⋃ { vocabCardIds ∪ {sentenceCardId} ∪ challengeCardIds : unit ∈ completedMiniUnits }
```

This adds no write and no scheduler — it is exactly the "derived overlay" §6 mandates. It is the signal the **situation/unit** rail uses for unlock. It deliberately does **not** change `getStageState` (which still reads `progress[id]`), preserving the do-not-regress guarantee (§6, `state.js:11-17`).

**`recognized`/`produced`/`spoken` are new, parallel, monotonic, never-gating signals.** Per §6 they are "recorded alongside `progress`… never routed through tier," and per the HARD RULE they may **never** become an advance gate — making any of them a gate would re-lock existing users, and `mastery-spoken` is structurally unreachable on iOS Safari / Firefox / Capacitor (no Web Speech), so it can never be required for completion.

### 4.2 What counts as "learned"

- **"Learned" for progression/unlock = `mastery-taught`** (the derived-seen signal above). This is what the situation/unit/lesson/stage rails require, and only this (§6 HARD RULE).
- **"Learned" for the graded Challenge pool = the stricter predicate `progress[id]` exists** — the *exact* predicate `check-challenge-scope` enforces via `allowedStageCards` (`challengeQuestions.js:135-142`). Guided-only cards (taught via `completedMiniUnits` but never rated) are **not** challenge-eligible until their first SRS rating writes `progress`. Naming these two subsets distinctly (`taught` ⊇ `reviewed`) avoids the trap of testing a card the learner only saw once.
- **"Mature"** stays the legacy display signal: `interval ≥ 21` (`srs.js:80`, `state.js:28`). Keep showing learned-vs-mature side by side (§6). Mature is never required to advance (`state.js:31-33`).

### 4.3 Storage & merge (data shape)

Keep mastery signals **out of** the SRS card object so `mergeCard`'s advancement logic (`progressMerge.js:44-63`) is untouched. Specify one new sibling map:

```
// persisted alongside progress; NOT inside the srsState object
masteryRank: { [cardId: number]: 0 | 1 | 2 | 3 }
//   0 = taught-only, 1 = recognized, 2 = produced, 3 = spoken   (monotonic: only ever rises)
```

- **Rank never decreases.** A wrong answer or lapse never lowers it (recognition/production skill is retained even when SRS reschedules the card).
- **Merge class = MAX per-card** (§8 `check-progress-merge`) — identical policy to `interval`/`reviews`/`currentStage` (`progressMerge.js:91-93`, `mergeCard :54-55`). MAX is non-rewarding and monotonic, so a merge can never grant a reward or tier (`progressMerge.js:8-17`, `109-112`). A new `mergeMasteryRank(local, cloud)` (element-wise `Math.max`) must be added to `progressMerge.js` **and** to the `check-progress-merge.mjs` scenario list (do not exploit the allowlist gap, §8).
- `taught` itself is **not** stored in `masteryRank` — it is the derived union in §4.1, so it is always consistent with `progress` + `completedMiniUnits` and needs no separate persistence or merge.

Interface signatures (specification only):

```
// lib/mastery.js  (pure, no deps)
export function isTaught(cardId, progress, completedMiniUnits): boolean
export function masteryStateOf(cardId, progress, completedMiniUnits, masteryRank): 
    'mastery-taught'|'mastery-recognized'|'mastery-produced'|'mastery-spoken'|null   // null = untaught
export function advanceMastery(masteryRank, cardId, viaExercise): masteryRank        // pure, MAX-monotonic
// viaExercise ∈ the §1 exercise-type IDs; maps recognition→1, production→2, speaking→3
```

### 4.4 Hearts / graded-vs-ungraded mapped onto mastery

The heart economy gates **starting a graded round**, never the recording of a mastery signal, and never the learn/review path (§7; `economy.js:5-13`; `check-economy`). The mapping:

| Exercise-type | Graded? | Spends a heart? | Advances which mastery signal |
|---|---|---|---|
| `flashcard-srs` | ungraded (self-rating) | **never** | `taught` (any rating writes `progress`, `App.jsx:1418-1422`) |
| lesson teach steps (vocab/sentence/builder intro) | ungraded | **never** (`check-dating-sequence`) | `taught` (on unit completion, via §4.1 union) |
| `recognition-th-en`, `production-en-th` **in a lesson** | ungraded | **never** | `recognized` / `produced` |
| `recognition-th-en`, `production-en-th` **in the Stage Challenge** | graded | **yes** — mirrors the `QuizTab` gate exactly (`economy.js:5-13`) | `recognized` / `produced` |
| `sentence-build` | graded (token order) but reward-free spine | **never** (`check-sentence-builder`) | `produced` |
| `listen-meaning`, `tone-discriminate`, `register-judge`, `dialogue` | graded MCQ | **never** (parallel tracks) | `recognized` (listen), or their own track |
| `speaking-repeat`, `tone-produce` `[gated]` | graded (coarse verdict) | **never** | `spoken` |

**Consequences that must hold:**
- A mastery transition can be recorded from **either** a graded round **or** an ungraded lesson step — the *skill* was demonstrated regardless of whether hearts were in play. Hearts gate the *round*, not the *signal*.
- **At 0 hearts**, the free user is blocked only from *starting* the Stage Challenge and is always offered the free way forward — Learn/Review — which still advances `taught`/`recognized`/`produced` (`economy.js`, `check-economy`). So mastery is **never** heart-gated. Super bypasses the gate (`effectiveHearts()` = `Infinity`).
- **No new exercise may spend a heart during Learn/Review**, and **no** new type may spend a heart outside the exact `QuizTab` gate (§7, `check-economy`).
- Hearts never touch SRS; the Challenge never marks cards learned (§6; `check-economy`; `check-challenge-scope`).

---

## 5. SRS integration — how `srs.js` schedules review of taught items (do NOT rebuild)

`srs.js` is a modified SM-2 and is the **source of truth for scheduling**. The overlay reads it and never rewrites its outputs.

- **Rating → schedule.** `reviewCard(state, rating)` (`srs.js:6-39`), ratings `1=Again / 2=Hard / 3=Good / 4=Easy`. First exposure: `Again`→+1 min, `Hard`→+10 min, `Good`→+1 day (`interval:1`), `Easy`→+4 days. Lapse (`Again`) resets to learning and drops `ease` by 0.2. Mature cards multiply `interval` by `ease` (or `ease×1.3` for Easy). `intervalLabel` (`srs.js:87-102`) previews each button's next interval.
- **Which taught items come up for review, and when.** `getDueCards(progress, allCards, now)` returns exactly the cards with `progress[id]` whose `nextDue ≤ now`, sorted soonest-first (`srs.js:41-46`). This is the definition of "review of taught items" — the SRS surfaces *only* taught (seen) cards for review; untaught cards never appear as review.
- **Which new items get taught next.** `getNewCards(progress, allCards, limit=10)` returns unseen cards grouped by **stage ascending → mission ascending → daily seed** (`srs.js:48-74`). The situation rail *reorders which unseen cards are offered* by feeding the recommender a situation-priority sort, but it must not change `reviewCard`, `getDueCards`, or the due ordering.
- **Aggregate signals the UI reads.** `getStats` (`srs.js:76-85`): `seen = Object.keys(progress).length`, `mature = interval ≥ 21`, plus `due`/`newAvail`. `getStageState`/`getMissionState` derive stage/mission completion from `seen ≥ total` with a legacy `≥70% mature` OR-fallback (`state.js:31-33`, `MISSION_UNLOCK_THRESHOLD = 0.70`, `gamification.js:77`).

**Placement's pre-mature write is SRS-legal.** `markCardsKnown` writes a full valid SRS state (`interval:30, ease:2.5, reviews:1, learning:false`, `App.jsx:1626-1634`), so placed-known cards enter `getDueCards`/`getStats` naturally (due in ~30 days) — no special-casing in the scheduler.

**Overlay ↔ SRS contract (one line):** the overlay may **read** `progress`, `getDueCards`, `getStats`, `completedMiniUnits`, and `masteryRank`; it may **write** only `masteryRank` (MAX-monotonic) and the existing `completedMiniUnits`/`progress` via their existing handlers. It must never write `nextDue`/`interval`/`ease` outside `reviewCard`/`markCardsKnown`.

---

## 6. Situation/unit challenges and the scope rules

### 6.1 `check-challenge-scope` (Stage Challenge is untouched)

The existing Stage Challenge stays exactly as validated: `buildChallenge`/`countChallengePool` scope to stage-N cards that are `stageComplete || progress[id]`, both directions `thai-to-en` and `en-to-thai`, distractors from the same scoped pool, zero questions when 0 learned (`challengeQuestions.js:135-142, 197-222`; `check-challenge-scope.mjs`). Nothing in this doc changes it.

### 6.2 Situation Challenge (new, needs its own scoped builder)

A situation crosses stages, so it **cannot** reuse `buildChallenge`'s single-stage filter without failing `check-challenge-scope` (which asserts every option is same-stage). Per the §8 resolution, specify a parallel builder with its own validator:

```
// lib/situationChallenge.js
export function buildSituationChallenge({ sitId, type, voice, progress })
export function countSituationChallengePool({ sitId, progress })
// SCOPE: cards tagged to sitId AND progress[id] exists (the reviewed subset, §4.2).
//        Distractors drawn from that same scoped pool → never leak an untaught or
//        off-situation card. Zero questions when the reviewed pool < MIN_CHALLENGE_POOL.
```

- **Predicate = `progress[id]` exists** (the exact `check-challenge-scope` learned predicate, `challengeQuestions.js:140`) intersected with the situation tag — **not** the derived `taught` union — so a graded challenge never tests a card the learner only saw once in a guided lesson (§4.2).
- **Grade by `option.id === correct.id`; shuffle both question order and option order per attempt; never `rotateOptions`** (§1 invariants; `check-quiz-shuffle`). Add the new component to the `check-quiz-shuffle` scan array (do not exploit the allowlist gap, §8).
- A new `check-situation-challenge-scope.mjs` (modeled on `check-challenge-scope.mjs`) asserts: every correct+distractor is situation-tagged and reviewed; no cross-situation or untaught leak; empty state when the reviewed pool is too small.

### 6.3 `check-dating-sequence` — teach-before-test across the whole rail

Every graded exercise in a lesson is preceded by its **ungraded teach step**, and the teach branch carries **no hearts/XP/scoring** (`check-dating-sequence.mjs:76-104`; teach shows English meaning → reveal → Thai). This doc extends that rule to every new graded exercise:

- `register-judge` is preceded by an **ungraded register primer** (teach-before-test, §4 foundation).
- `tone-discriminate` is preceded by an ear-training primer; the written diacritic + romanization stay **hidden until reveal** (§5; preserve the protected string "Ear training", `check-pedagogy-regression`).
- The **Dating module stays recognition-only, English-option, reward-free** (§1, §8). `production-en-th` and `register-judge` are built **outside** Dating (`check-dating-quiz`, `check-dating-badges`). No lesson's graded step is ever reachable without its preceding teach step.

**Enforcement gap — teach-before-test outside Dating is currently intent-only.** `check-dating-sequence.mjs` genuinely enforces the rule above **for Dating**, but it is hard-scoped to `DatingSection.jsx` with Dating-DOM-specific assertions (`quiz.phase==='lesson'`, `phrasesByCat`, `dating-lesson-en`). Unlike `check-quiz-shuffle` (extensible via its file allowlist, §6.2), it is **structurally un-extensible** — it **cannot** be pointed at the new non-Dating graded exercises (`register-judge`, `tone-discriminate`, `dialogue`). So for those types the teach-before-test guarantee in this section is **intent-only, not machine-checkable**. A **new generic validator** (e.g. `check-teach-before-test.mjs` — distinct from the ordering validator `check-situation-sequence.mjs` in §2.2), asserting that every graded `register-judge`/`tone-discriminate`/`dialogue` step is preceded by an **ungraded, heart/XP-free teach step**, is therefore a **REQUIRED deliverable before those graded exercises ship**. Until it exists, teach-before-test outside Dating is enforced by intent only.

---

## 7. Free vs Super (progression is free forever)

The Sacred rule holds without exception here: **every situation, every unit, every lesson, every exercise type, every tone/register drill, the SRS, and all cards are FREE forever** (§7). Progression sells nothing.

- **No mastery state is ever a paywall or an advance gate** (§6/§7). `recognized`/`produced`/`spoken` are free achievement tracks.
- Super sells only convenience (unlimited hearts, ad-free, double-XP, streak-freeze), cosmetics, **early access** to the *next* stage + themed packs, and the mature **Dating pack** — never a step of the progression path (§7). Early access shifts *timing*, never *reachability*: the curated path stays free and never time-locked.
- **Precise tone/pronunciation scoring** (`enhancedReview`) is the only pedagogy-adjacent Super item, and it is **needs-owner** — kept `COMING_SOON` until `VITE_PRONUNCIATION_SCORER` is set *and* entitlement flips `AVAILABLE` (§7, §9). Until then `tone-produce`/`speaking-repeat` advance `mastery-spoken` only via the honest coarse browser verdict ("did the app understand you?"), and `mastery-spoken` is never required for completion (unreachable on iOS/Firefox/native).
- **Entitlement is server-authoritative**; the overlay may display tier but never grants Super, and `masteryRank`/`identityPath` are stripped from any tier derivation (§7; `progressMerge.js:109-112`; `check-subscription-status`).

---

## 8. Review-pipeline honesty (foundation §9)

Every net-new artifact this rail introduces — situation tags, situation-challenge items, register/tone drills derived from `ph`, dialogue lines — ships `reviewStatus: 'pending'` by default and renders the **"Draft content — pending native-speaker review"** badge until a named native reviewer signs off (§9). `approved` requires that sign-off (an open `owner-launch-inputs` item). Derivations are **not** approvals: the M/F flip, the tone-from-`ph` parse, and the derived `taught` union are computed views, never native-reviewed content. The `enhancedReview` scorer stays `COMING_SOON` and must never be advertised as delivered while only the coarse verdict exists.

---

## 9. Validator / rule conflicts encountered + resolutions

| # | Rule / validator | Conflict this doc hit | Resolution in this doc |
|---|---|---|---|
| C1 | §6 wording vs. `App.jsx:1840-1842` | §6 says "completing a lesson advances `mastery-taught`," but lesson completion writes **no** `progress` — so a learner could finish every guided unit and still not register those cards as "seen" for `getStageState`. | Define `taught` as a **read-time union** of `progress[id]` **and** `completedMiniUnits` card sets (§4.1). The situation/unit rail uses this union; the legacy `getStageState` is left untouched (do-not-regress). No SRS write, no scheduler. Full unification (writing `progress` on lesson completion) is a behavior change → **needs-owner** (Open Q1). |
| C2 | `check-challenge-scope` | A **situation** challenge crosses stages, violating the single-stage assertion; and using the derived `taught` union would test guided-only cards. | New `lib/situationChallenge.js` + `check-situation-challenge-scope.mjs`; scope to `progress[id] ∧ situation-tag` (the exact `check-challenge-scope` predicate), never the union (§6.2). Stage Challenge is unchanged. |
| C3 | `check-mini-unit-sequence` / `check-mini-units` | Situations are cross-stage and per-path reordered — they can't be `MINI_UNITS` (single-stage, contiguous) nor a branching graph. | Separate `lib/situationProgression.js` with its own `check-situation-sequence.mjs`; the per-path order is a **linearization** (one deterministic sequence per learner), still strictly linear with exactly one `current` (§2.2). `MINI_UNITS` + its validators untouched. |
| C4 | `check-progress-merge` | New persisted `masteryRank` (and `identityPath`) could be silently dropped or mis-merged, or leak into tier. | `masteryRank` → **MAX** per-card (monotonic, non-rewarding); `identityPath` → **cloud-authoritative** preference. Add `mergeMasteryRank` to `progressMerge.js` **and** to `check-progress-merge.mjs` scenarios. Neither ever touches `tier` (§4.3). |
| C5 | `check-quiz-shuffle` | The situation challenge is a new repeatable MCQ in a new file the fixed allowlist won't scan. | Shuffle both axes, grade by `option.id`, never `rotateOptions`; **add the component to the scan array** rather than exploiting the gap (§6.2, §8). |
| C6 | `check-economy` | Risk that a new graded situation/mastery exercise spends hearts in Learn/Review, or that mastery becomes heart-gated. | Only the Stage Challenge spends hearts; every new graded exercise is heart-free; the mastery *signal* is never heart-gated; 0-hearts always offers the free Learn/Review way forward (§4.4). |
| C7 | `check-dating-sequence` / `check-dating-quiz` / `check-dating-badges` | Any graded mastery step without a preceding teach step; production/register with Thai options inside Dating. | Every graded exercise gets an ungraded teach step (no hearts/XP in teach); `production-en-th`/`register-judge` live **outside** Dating; Dating stays recognition-only, English-option, reward-free (§6.3). |
| C8 | `check-pedagogy-regression` | Reworking tone/first-lesson surfaces could drop protected copy. | Preserve "Ear training", "Complete Stage 1", "Hidden until you answer", etc.; hide diacritic+romanization until reveal for `tone-discriminate` (§5, §6.3). |

---

## 10. Open questions / proposed foundation changes

1. **Unify the two unlock ladders? (C1 — the load-bearing question.)** Today guided-lesson completion writes no `progress` (`App.jsx:1840-1842`), so the guided ladder (`completedMiniUnits`) and the stage/mission "seen" ladder (`progress[id]`, `state.js`) advance independently. This doc bridges them with a **read-time derived `taught` union** and leaves `getStageState` untouched. The cleaner long-term fix is to have lesson completion call a light `markCardsSeen(cardIds)` that writes a minimal `progress` entry so both ladders unify — **but** that changes SRS behavior (those cards immediately enter the `getDueCards` queue) and could surprise existing users, so it is **needs-owner**. Proposed foundation clarification for §6: state explicitly that "completing a lesson" advances `mastery-taught` **as a derived overlay signal**, not as a `progress` write, unless/until the owner approves `markCardsSeen`.

2. **Should `masteryRank` live in the SRS card object or a sibling map?** This doc chose a **sibling map** to keep `mergeCard`'s advancement logic (`progressMerge.js:44-63`) untouched. If the foundation prefers a single per-card object, the rank could ride inside `progress[id]` as `mRank` merged via `Math.max` in `mergeCard` — simpler storage, but it touches the most safety-critical merge function. Flagging for an explicit owner call.

3. **`recognized`/`produced` from the graded Challenge — do they count?** This doc says yes: a correct `recognition-th-en`/`production-en-th` advances the rank whether it happened in a lesson or the Stage Challenge (§4.4), since the skill was demonstrated. If the foundation wants mastery-depth to come only from the non-heart lesson track (to keep Challenge purely a review-game), that is a one-line policy change here — flagging so it is a deliberate decision, not an accident.

4. **Entry-situation for placement floors.** §3 defines path reweighting but not how `startedStage`/placement `knownIds` interact with the *situation* order. This doc proposes: entry situation = highest-priority `sit-*` not yet unit-complete, treating below-floor and placement-known cards as already-taught so their situations drop in first-teach priority (§3.1). If the foundation wants a stricter mapping (e.g. `startedStage` hard-selects an entry situation), specify it in §2/§3.

5. **Situation tagging is net-new content, and `check-mini-units` forbids invented Thai.** Realizing the situation rail requires tagging existing cards (and authoring new male-form cards where a situation lacks coverage), all shipping `reviewStatus:'pending'` (§9). No situation may go live before its cards exist and pass `check-mini-units`; this is a content dependency the owner must schedule, not something the progression code can conjure.
