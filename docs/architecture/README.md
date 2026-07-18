# Tuk Talk Thai — Architecture Blueprint: FOUNDATION CONTRACT

**Status:** Binding. This document is LAW for all six specs below. Where a spec conflicts with
this contract, this contract wins. IDs in `code font` are **canonical** and must be reused
**verbatim** by every other doc — do not rename, re-case, or re-scope them.

**Scope discipline:** Planning only. This blueprint proposes; it writes zero application code.
Every "buildable-now" claim means "buildable within the existing stack and validators," not "built."

**Stack rails (from CLAUDE.md, non-negotiable):** plain CSS only; no Tailwind/CSS-in-JS; no state
library; no router; no TypeScript; **no new npm dependencies**; no paid APIs; localStorage only via
`lib/storage.js`; content authored **male-form** with runtime M/F flip via `displayCard(card, voice)`;
speaking uses the browser Web Speech API only and is **hidden where unavailable** (iOS Safari,
Firefox, in-app webviews, Capacitor APK).

---

## 0. VERIFIED GROUND TRUTH (corrected 2026-07-18 — Wave 10; recompute before trusting, numbers drift)

| Fact | Canonical value | Note / stale sources to ignore |
|---|---|---|
| Total cards | **4,792** (`ALL_CARDS`; free deck `CARDS` = **4,780** — 5 mature + 7 quarantined held out) | This table previously said 4,791 — itself stale. User-facing copy must compute from `CARDS.length` (the old hardcoded "4,752" shipped stale). |
| Cards by type | **w:3267, g:28, p:247, s:1250** | `p` (phrases) exist only in stage 1 (10) + stage 8 (237); stages 2–7 have zero. |
| Cards by stage | **1:150 2:269 3:423 4:575 5:701 6:804 7:877 8:993** | 8 stages, sequential unlock. Max card id **5739**; id space is NOT contiguous (`check-card-id-uniqueness` guards collisions). |
| Mini-units | **96** (`MINI_UNITS.length`) | User-facing name is "lesson"; `mini-unit` is internal. The pilot is already inside the array. |
| Dating phrases | **60**, all `reviewStatus:'approved'` (since Wave 6) | Across **10** of 11 planned categories (`severity-context-warnings` has 0). |
| Dating questions | **65** (`DATING_QUESTIONS`) | The "60" figure is the phrase count, not the question count. |
| Main-deck review state | `needsReview:true` on **96** cards; **946** cards carry `reviewStatus:'approved'` (stamped by the manifest + eligibility floor in `cards.js`) | The old "NO reviewStatus field / 95 cards" rows predate the Wave 4-6 approval pipeline. |
| Validators | **ALL `check-*.mjs` + `verify-*.mjs`**, auto-discovered by `scripts/check-all.mjs` (30 at this correction) | WIRED: `npm run check` runs them all and CI (`validate.yml`) runs the suite on every push/PR across several timezones. The old "21, not wired" row was doubly stale. |

---

## THE SIX SPECS (index)

Each spec OWNS its listed foundation sections and may elaborate them, but may not contradict them.

| # | Spec file | Owns foundation sections | One-line scope |
|---|---|---|---|
| 1 | `exercise-types.md` | §1, §5 (drills), speech seam | The exercise-type catalog, per-type grading, the Web-Speech gate + upgrade seam. |
| 2 | `curriculum.md` | §2, §3, §4 (content encoding), §5 (content attach) | Situation map, identity-path weighting, register/tone content modeling, new-card requirements. |
| 3 | `progression.md` | §6 | Mastery state machine + how it overlays (never replaces) the existing SRS. |
| 4 | `engagement.md` | identity capture, onboarding, notifications | Where identity is captured; retention loop; hidden-where-unavailable discipline. |
| 5 | `monetization.md` | §7 | Free vs Super line, hearts/gems economy, entitlement + speech upgrade seam. |
| 6 | `roadmap.md` | — (none; §8, §9 live in this README, the foundation) | Implementation roadmap: build sequencing and milestones. §8 (validator constraint map) and §9 (review-pipeline enforcement) live in THIS README (the foundation), not a sibling spec. |

---

## 1. EXERCISE-TYPE CATALOG

Canonical `id` + one-line contract. **Direction** and **grading** are load-bearing. **Status:**
`buildable-now` (fits stack + validators today) · `needs-content` (needs new/tagged content first) ·
`needs-owner` (needs an explicit owner decision to relax an enforced rule or ship a paid path).

Two invariants bind **every** graded MCQ type (enforced by `check-quiz-shuffle`, `check-challenge-scope`):
**(a)** grade by `option.id === correct.id` / value equality — **never array index**;
**(b)** shuffle **both** question order and option order per attempt; never `rotateOptions`.

| `id` | Name | Direction | Grades by | Existing surface / anchor | Hearts? | Status |
|---|---|---|---|---|---|---|
| `flashcard-srs` | SRS flashcard review (the spine) | user-config, default `en-first` | self-rating Again/Hard/Good/Easy → SM-2 | `CardsTab.jsx`, `srs.js` | **never** | buildable-now (exists) |
| `recognition-th-en` | Read Thai → pick English | Thai→English | `option.id` flag | `QuizTab` `thai-to-en`; Dating (hard-locked) | Stage-Challenge only | buildable-now (exists) |
| `production-en-th` | Read English → pick Thai | English→Thai | `option.id` flag | `QuizTab` `en-to-thai`, `MiniUnitFlow`, `FirstLessonFlow` | Stage-Challenge only | buildable-now (exists) — **must live OUTSIDE Dating** |
| `sentence-build` | Order tokens → produce Thai sentence | English→Thai (production) | exact token-id sequence (`isBuilderCorrect`) | `SentenceBuilder.jsx` (83/96 units) | never | buildable-now (exists) |
| `listen-meaning` | Hear Thai audio → pick English meaning | audio→English | `option.id` flag | new; reuses `speakThai` + MCQ; hide button via `ttsAvailable()` | never | buildable-now (net-new surface) |
| `tone-discriminate` | Hear a syllable → pick 1 of 5 tones; **written diacritic + romanization HIDDEN until reveal** | audio→tone-label | tone value === `q.tone` | extends `TonesQuizSection.jsx` (fixes the printed-diacritic answer leak) | never | buildable-now (needs the diacritic-hidden redesign) |
| `tone-produce` `[gated]` | Say the syllable; browser speech returns a **coarse** word verdict | speak→verdict | `correct`/`close`/`wrong` (word match, **not tone**) | new `SpeakingExercise.jsx` + `lib/speech.js`; gated by `speechRecognitionAvailable()` | never | buildable-now (coarse, gated). Precise **tone** scoring = **needs-owner** (paid scorer, §7) |
| `speaking-repeat` `[gated]` | Say the target phrase; browser speech coarse verdict | speak→verdict | `correct`/`close`/`wrong` (match to `card.thai`, never `ph`) | new `SpeakingExercise.jsx`; parent type of `tone-produce` | never | buildable-now (coarse, gated) |
| `register-judge` | Given a listener/situation → pick the register-appropriate Thai response | situation→register-choice | `option.id` flag (register-match) | new; **OUTSIDE Dating**; extends `voice.js` M/F + Dating `severity` | never (parallel track) | **needs-content** (register tagging does not exist on the deck, §4) |
| `dialogue` | Multi-turn situational exchange → pick the appropriate next line | situation→response | `option.id` flag | `DialoguesView.jsx` exists; graded loop is new | never | **needs-content** (needs authored situational dialogue) |

**Gating rule for `[gated]` types:** the exercise renders only when `speechRecognitionAvailable()` is
true (mirrors the `ttsAvailable()` idiom). When absent it **renders nothing** — no button, no
"unsupported" stub (mirror `SocialLinks.jsx:45` returning `null`). Browser recognition **cannot grade
tone** — it snaps a mistoned attempt to the nearest real word. The free verdict is honestly framed as
"did the app understand you?", not pronunciation assessment.

---

## 2. SITUATION MAP

Canonical situation IDs, ordered by **(real-world frequency × inverse difficulty)** — what a person
LIVING IN THAILAND needs first and can learn earliest surfaces first; rare/high-difficulty/high-register
last. `base` (1–10, higher = surface earlier) is the default-path priority; per-path weights are §3.

> **Binding note:** the situation map is a **new tagging layer** over content. The as-built 96
> mini-units group by **part of speech**, not situation (`course-structure-roadmap.md`, Stages 2–4),
> because the card deck never supported the situational taxonomy the `STAGES` names imply. This
> restores the **original** situation-first intent (`learning-flow-architecture-plan.md:86-98`) and
> **supersedes the as-built grammatical grouping** — which means new/re-tagged content, not just
> re-ordering (see §8 `check-mini-units`: no invented Thai; add cards first).

| Order | `id` | Name | base | Rationale (frequency × difficulty) |
|---|---|---|---|---|
| 1 | `sit-greet` | Greetings & politeness particles | 10 | Every single interaction; ครับ/ค่ะ foundational; trivial difficulty. |
| 2 | `sit-store` | Convenience store (7-Eleven) | 9 | Daily; fixed phrases + numbers; low difficulty. |
| 3 | `sit-food` | Ordering food & drinks | 9 | Daily; moderate; the highest-value early win. |
| 4 | `sit-money` | Numbers, prices & paying | 8 | Underpins store/food/transport; must precede bargaining. |
| 5 | `sit-transport` | Taxi / Grab / bus | 8 | Daily mobility; moderate listening load. |
| 6 | `sit-directions` | Asking & understanding directions | 7 | High frequency but harder — you must parse the reply. |
| 7 | `sit-market` | Markets & bargaining | 7 | Common; couples numbers + light register. |
| 8 | `sit-smalltalk` | Small talk & address-by-age (pîi/náwng) | 6 | Social glue; register-heavy; every path benefits. |
| 9 | `sit-delivery` | Delivery & app messaging (Grab/Lineman) | 6 | Text-first; expat/partner heavy; moderate. |
| 10 | `sit-housing` | Condo, rent & utilities | 5 | Expat/worker; lower frequency, higher difficulty/stakes. |
| 11 | `sit-pharmacy` | Pharmacy, symptoms & health | 5 | Infrequent, higher stakes; specialized vocab. |
| 12 | `sit-work` | Workplace & office | 4 | Worker path; register-heavy; audience-specific. |
| 13 | `sit-dating` | Dating & relationships | 4 | Partner path; **existing Dating pack** (18+, Super, severity). |
| 14 | `sit-admin` | Visa / immigration / bank | 3 | Rare, high difficulty, high stakes; formal register. |
| 15 | `sit-emergency` | Emergencies & safety | 3 | Rare but critical; taught defensively, high priority for `close` recall. |
| 16 | `sit-formal` | Temple, monks & deference | 2 | Rare; highest register difficulty; deferential register. |

---

## 3. IDENTITY-PATH MODEL

Four paths as a **tagging + weighting overlay** on §2 — **NOT four forked curricula**. Identity is a
**net-new capture** (only gendered `voice` + skill-`startedStage` exist today; no persona is captured
anywhere — `PlacementOnboarding.jsx`). Capture it as an **optional** onboarding question owned by
`engagement.md`. A path **reweights order only**; it never locks, unlocks, forks, or gates content.

**Path IDs:** `path-tourist`, `path-expat`, `path-partner`, `path-worker`, and default `path-none`.

**Weight vocabulary (canonical):** `C` = core (×2.0), `H` = high (×1.5), `N` = normal (×1.0),
`L` = deprioritize (×0.5). `path-none` uses all `N`.

**Reweight rule:** `priority(sit, path) = base(sit) × weight(sit, path)`. A learner's situation order
= situations sorted **descending** by `priority`, ties broken by §2 `base` order. Reweighting changes
**which situation surfaces first and which the daily recommender boosts** — every situation stays
reachable in sequence for every path. (Consistent with §6/§7: never a gate, curated path free forever.)

| `id` | tourist | expat | partner | worker |
|---|---|---|---|---|
| `sit-greet` | N | N | N | N |
| `sit-store` | H | H | N | N |
| `sit-food` | C | H | N | N |
| `sit-money` | H | H | N | H |
| `sit-transport` | C | H | N | N |
| `sit-directions` | H | N | N | N |
| `sit-market` | H | N | N | N |
| `sit-smalltalk` | N | H | C | H |
| `sit-delivery` | L | H | H | N |
| `sit-housing` | L | C | H | H |
| `sit-pharmacy` | N | H | H | N |
| `sit-work` | L | N | N | C |
| `sit-dating` | L | N | C | L |
| `sit-admin` | L | C | N | H |
| `sit-emergency` | H | H | N | N |
| `sit-formal` | N | N | H | C |

---

## 4. POLITENESS / REGISTER MODEL

Register becomes a **first-class trainable skill**, built by **extending** two existing systems, not
replacing them: (a) `voice.js` render-time M/F transform (ครับ/ค่ะ, ผม/ฉัน, statement-vs-question
particle awareness `voice.js:51-65`); (b) Dating `severity` ∈ {gentle, moderate, strong, safety} +
`CATEGORY_REGISTER` (Slang/Rude) + `lookup.js` particle glosses.

**Register levels (canonical, ordered casual→formal):**

| `id` | Level | Real listener(s) | Marker signal |
|---|---|---|---|
| `reg-intimate` | Intimate | close friend, partner | drop particles; nicknames; slang |
| `reg-casual` | Casual | friends, peers | light particles; casual pronouns; slang OK |
| `reg-polite` | Polite **(authored default)** | stranger, shopkeeper, most listeners | ครับ/ค่ะ; standard ผม/ฉัน |
| `reg-formal` | Formal | boss, elder, police/official | full particles; formal pronouns (กระผม/ดิฉัน) |
| `reg-deferential` | Deferential | monk, ceremony | specialized vocabulary; maximal deference |

**Encoding on content:**
- Authored default is `reg-polite` male-form — mirrors the existing "author male-polite, flip at
  runtime" rule (`voice.js:9`, `DEFAULT_VOICE='male'`). Never author two gender copies.
- **NEW field** on register-bearing content: `register` ∈ the five IDs above. The main deck has **no
  per-card register field today** — this is a new modeling layer (`curriculum.md` owns it). Add
  register variants as **cards first** (§8 `check-mini-units`), authored male-form.
- Dating `severity` remains the Dating sub-axis and is **not** re-modeled: map gentle→`reg-casual`/
  `reg-polite`, moderate→`reg-casual`, strong→`reg-intimate`+"Rude", safety→cross-cutting.
- Dual-form / particle-contrast cards must be marked `isSpeakerStyleProtected` (`voice.js:44-47`) so the
  M/F flip does not corrupt teaching content (`verify-voice-flip`, `verify-no-gender-mismatch`).

**How `register-judge` is graded:** prompt names a listener/situation in English ("You're speaking to a
monk / your boss / a close friend"); options are candidate responses at differing register levels;
grade by `option.id === correct.id` where `correct` = the register-appropriate response. Preceded by an
ungraded register primer (**teach-before-test**, §8). Register mastery is a **parallel track, never an
advance gate** (§6). Built **OUTSIDE the Dating module** (§8 — Dating is recognition-only, English-option,
reward-free).

---

## 5. TONE MODEL

**Five tones (canonical):** `tone-mid`, `tone-low`, `tone-falling`, `tone-high`, `tone-rising`.
Existing assets: `reference.js TONES` (5 tones + SVG pitch contours, visual-only), `gamification.js
TONE_QUIZ_ITEMS` (24 minimal pairs, each carrying a **discrete `tone` field** + real `thai`).

**Discrimination — `tone-discriminate` (audio-only):**
- Play `card.thai` via TTS (`speakThai`); learner picks 1 of 5 tone IDs.
- **Written Thai diacritic AND romanization are HIDDEN during the question**, revealed only after
  answering. This **fixes the current leak** where the printed `ph` diacritic *is* the answer key
  (`pedagogy-audit.md §4.2`, `TonesQuizSection`). Preserve the protected string "Ear training"
  (`check-pedagogy-regression`).
- Grade by tone value === correct tone; shuffle both axes.

**Production — `tone-produce` `[gated]`:**
- Browser speech, gated exactly like §1. Coarse verdict `correct`/`close`/`wrong`.
- **Honest limit (write verbatim into `exercise-types.md`):** browser recognition **cannot grade
  tone** — it auto-corrects toward the nearest real Thai word. Free path = recognition, not tone
  assessment. Precise per-tone scoring is the **needs-owner** paid differentiator (§7: `enhancedReview`
  + `VITE_PRONUNCIATION_SCORER`, via a Supabase Edge Function; runtime-injected SDK, never `npm i`).

**How tone drills attach to content:** the deck stores tone **only** as `ph` diacritics
(`à á â ǎ` = low/high/falling/rising; unmarked = mid). Only the 24 `TONE_QUIZ_ITEMS` carry a
first-class `tone` label. To attach a tone drill to any of the 4,791 cards, derive tone from `ph` via a
**diacritic→tone parser** (pure JS, zero new deps); audio comes from `card.thai` (a separate source, so
the audio never leaks the written answer). Tone mastery is a **parallel track, never an advance gate**.

---

## 6. MASTERY STATE MACHINE

Four canonical per-card states form a **derived overlay on top of the existing SRS** — they do **not**
replace it and do **not** add a new scheduler.

```
taught ─▶ recognized ─▶ produced ─▶ spoken
```

| State | `id` | Reached when | Advanced by |
|---|---|---|---|
| Taught | `mastery-taught` | `progress[id]` exists (seen) | any SRS rating, `markCardsKnown`, or completing a lesson containing the card |
| Recognized | `mastery-recognized` | learner picks meaning from Thai / passes `listen-meaning` | correct `recognition-th-en` / `listen-meaning` |
| Produced | `mastery-produced` | learner produces Thai from English | correct `production-en-th` / `sentence-build` |
| Spoken | `mastery-spoken` | browser speech returns `correct`/`close` | `speaking-repeat` / `tone-produce` verdict |

**SRS integration (do NOT rebuild — `srs.js` modified SM-2 is the source of truth):**
- The existing scheduler owns scheduling and the legacy signals: **seen/learned** = `progress[id]`
  exists (`App.jsx:1418-1422`); **mature** = `interval >= 21` days (`srs.js:80`, `state.js:28`). Keep
  both; keep displaying learned-vs-mature side by side.
- `mastery-taught` **is** the existing "seen" signal. `recognized`/`produced`/`spoken` are **new**
  per-card signals recorded alongside `progress`, merged by §8 `check-progress-merge` rules
  (union / max / sticky-OR), never routed through tier.
- **HARD RULE (enforced-rule reversal risk):** progression is decoupled from mastery. **Only
  `mastery-taught` (seen) advances the path** — mission/stage/unit unlock requires *seen*, not *mature*
  (`state.js:11-17,31-33`, with a do-not-regress fallback at 0.70). `recognized`/`produced`/`spoken`
  are **parallel achievement tracks; NEVER advance gates** — making any of them a gate would re-lock
  existing users. `mastery-spoken` is **structurally unreachable on iOS/Firefox/native** (no Web
  Speech) and therefore may **never** be required for completion.
- Challenge never marks cards learned; hearts never touch SRS.

---

## 7. FREE vs SUPER LINE

**The one-sentence principle (the "Sacred rule," `RETENTION_AND_MONETIZATION.md §2`):**
*The entire curated, staged learning path — every situation, every card, every exercise type, every
tone and register drill — is FREE forever; Super sells only convenience (unlimited hearts, ad-free,
double-XP), cosmetics (character skins), early access (next stage + themed phrase packs), and the mature
Dating pack — never pedagogy, never a mastery gate.*

| Lane | FREE forever | SUPER only |
|---|---|---|
| Learning path | all situations, all exercise types, SRS, tone `discriminate`+coarse `produce`, `register-judge`, quests, streak, achievements, Guide, all cards | — |
| Convenience | timed heart regen; gem heart-refill | **unlimited hearts** (bypass gate); ad-free; double-XP; monthly streak-freeze |
| Content access | full staged path (never time-locked) | **early access** to next stage + themed early-access phrase packs; **Dating pack** (18+) |
| Cosmetics | default characters | character skins |
| Precise pronunciation | coarse browser verdict | **`enhancedReview` tone-accurate scorer** — `needs-owner`, ships only when `VITE_PRONUNCIATION_SCORER` set AND entitlement flipped `AVAILABLE` |

**Economy invariants (enforced by `check-economy`; extend, do not reinvent):**
- **Hearts** gate **graded activities only** and today only the **Stage Challenge** spends them
  (`economy.js:8-10`, `QuizTab.jsx:220`). Max 5, regen 30 min, refill 50 gems, Super = `Infinity`.
- Hearts **NEVER** touch the learning/review path (`flashcard-srs`, lessons, teach steps). At 0 hearts a
  free user is blocked from **starting** a graded round and is always offered a **free way forward**
  ("learn and review for free"); Super bypasses.
- Any **new** graded exercise that spends hearts must mirror the `QuizTab` gate exactly; **no** new type
  may spend a heart during Learn/Review.
- **Gems** are the **free** currency (earned; sinks = heart refill, streak freeze). Super grants **no
  gems** (`check-economy` `!/gem/i.test(FEATURES)`).
- **Entitlement is server-authoritative**; the client may **display** tier but must **never GRANT** Super
  by changing localStorage (`entitlement-foundation-design.md`).

---

## 8. CONSTRAINT MAP

21 validators (18 `check-*` + 3 `verify-*`) bind the blueprint. Most static-scan validators use a
**fixed file allowlist** — a new exercise in a new file would slip the scan, but the **intent still
binds**: the blueprint must **add new screens to these scan arrays**, not exploit the gap.

**Headline conflict — Thai→English direction lock vs EN→TH production — RESOLVED:**
English→Thai production is **already first-class and enforced-as-supported** (`check-challenge-scope.mjs:26`
runs both `thai-to-en` and `en-to-thai`; `challengeQuestions.js:112-120` builds EN-prompt→Thai-answer).
The Thai→English lock is **Dating-module-only** (`check-dating-quiz.mjs`). The flashcard "direction lock"
(`check-direction-lock`) only freezes card **faces mid-attempt** — it does not ban a direction.
**Resolution:** build `production-en-th` and `register-judge` **OUTSIDE the Dating module**; Dating stays
**recognition-only, English-option, reward-free**. Relaxing Dating's lock is **needs-owner** (`pedagogy-audit.md` Option B).

| Validator | Invariant (anchor) | Conflict | Resolution |
|---|---|---|---|
| `check-dating-quiz` | Dating = Thai→English recognition only; no Thai in options/prompt; no phrase `'approved'` while incomplete | `production-en-th`, register-with-Thai-options inside Dating | Build those exercises **outside** Dating; Dating options English-only, reference real `phraseId`. |
| `check-challenge-scope` | Stage-N challenge uses only stage-N **learned** cards; both directions | situation-scoped challenge regroups across stages | Reuse learned/unlocked scoping; a situation challenge needs its own learned-scoped function. |
| `check-direction-lock` | Faces derive from frozen `attemptDirection` (SCREENS: CardsTab, MiniUnitFlow, FirstLessonFlow, DemoMode) | new peekable card screen with a live toggle | Reuse `useAttemptDirection`/`faceIsEnglishFirst`; **add the new screen to SCREENS**. |
| `check-quiz-shuffle` | Repeatable quizzes shuffle both axes; grade by id/value; no `rotateOptions` | new repeatable MCQ (`tone-discriminate`, `register-judge`, `listen-meaning`) | `shuffle(questions)` + `shuffle([correct,...distractors])`; grade by id; add component to scan list. |
| `check-economy` | Hearts graded-only, never Learn/Review, free path at 0, Super bypass; gems non-circular; Super grants no gems | any heart spend in learning; any new gem source | Gate graded attempts only; mirror `QuizTab`; no gem reward, no Super gem grant. |
| `check-mini-unit-sequence` | Strict linear unlock; exactly one `current` | non-linear / branching situation graph | Express situations as **linear** mini-units, OR a **separate** progression lib with its own validator. |
| `check-mini-units` | Vocab/challenge ids exist in CARDS; single-stage; contiguous; **no invented Thai**; builders faithful to source card | situations needing new phrases | **Add new content as cards first** (male-form); keep unit vocab single-stage, stage-contiguous. |
| `check-dating-sequence` | Teach-before-test; lesson branch has **no** hearts/XP/scoring; device-local persistence | any graded step without a preceding teach step | Every graded exercise gets an ungraded teach step; keep hearts/XP out of teach branches. |
| `check-dating-badges` | Dating options English-only; no reward/XP path; badges gated-then-restored | XP/reward or Thai options in Dating | Keep Dating reward-free, English-option; production/register go elsewhere. |
| `check-dating-distractors` | Non-tone Dating MCQ clears length/hedge/absolutist floor | new non-tone Dating MCQ | Balance option lengths/hedging; fixed-label sets add their `questionType` to the exempt branch. |
| `check-progress-merge` | Local↔cloud merge classes; **tier never from merge** | new persisted mastery/completion field silently dropped or double-counted | Give each new field a class: **union** (completion/rewarded ledgers), **max** (mastery counters), **sticky-OR** (passed flags), **cloud-auth** (currency). Never derive tier from new state. |
| `check-session-isolation` | User-scoped locks reset on identity change; device-scoped anti-farm guards preserved | new reward-lock / anti-farm ref | Register new locks in `resetUserScopedRefs`; make new spam-guards device-scoped. |
| `check-quest-logic` | Any learning activity today satisfies streak; no double-count | new XP activity that hits daily-goal without satisfying streak | Route new-activity XP through the same "activity today" signal; keep per-card counting distinct. |
| `check-celebrations` | Milestone IDs (durable vs date-keyed) + baseline seed; no retro-spam | new milestone (tone/register/situation) | Mint IDs via existing helpers; add to `activeCelebrationIds` baseline + prune. |
| `check-pedagogy-regression` | 7 protected copy strings + 5 CSS markers | reworking TonesQuizSection / FirstLessonFlow / DatingSection | Preserve "Ear training", "Complete Stage 1", "Hidden until you answer", etc.; update the guard in the same commit if intentionally changed. |
| `check-sentence-builder` | `answer` is a permutation; faithful to source card; shuffle never pre-solved | — (sanctioned home for token-order production) | Implement `production-en-th` token-ordering here; tokens from a real card. |
| `check-course-completion` | Totals derived from `MINI_UNITS` | adding units re-gates course-complete | Adding units is safe; a **separate** situation progression gets a separate completion lib. |
| `check-subscription-status` | Super copy comes from shared source | new Super headline edited inline | Change sales copy only through shared `subscriptionStatus`/entitlements. |
| `verify-voice-flip` | Male-marker cards must flip Thai + phonetic + English correctly | new gendered register/situation content | Author male-form; mark dual-form `isSpeakerStyleProtected`. |
| `verify-no-gender-mismatch` | No male Thai with female-only annotation (or vice-versa) | new cards with mismatched pronoun/annotation | English gender annotation must match Thai pronoun/particle; use `(male/female)` for dual-form. |
| `verify-edits` | Historical one-off audit | none | N/A. |

---

## 9. REVIEW-PIPELINE PRINCIPLE

**All content is "native review pending" until a named native speaker signs off; unreviewed content
must NEVER ship as approved.**

- **Two conventions exist today** and must be unified in the blueprint's vocabulary:
  main deck = `needsReview:true` boolean on **95** cards (no `reviewStatus` field anywhere in
  `cards.js`); Dating = `reviewStatus:'pending'` on **all 60** phrases + 11 categories, with
  `DATING_REVIEW_COMPLETE = false`.
- **Canonical review-status vocabulary (new):** `pending` (default) · `needs-review` · `approved`.
  Legacy `needsReview:true` maps to `needs-review`; Dating `pending` stays `pending`. **`approved`
  requires a named native-reviewer sign-off** (an `owner-launch-inputs` item still open).
- **Default = `pending`.** Every new blueprint artifact (situation cards, register variants,
  diacritic→tone parser output, dialogue lines, `register-judge` items) ships `pending` and MUST render
  the **"Draft content — pending native-speaker review"** badge.
- **No auto-derived content may be presented as reviewed** — sentence-builder tokens, the M/F flip, and
  the tone-from-`ph` parse are derivations, not approvals.
- **Enforcement:** `check-dating-quiz` already forbids any phrase claiming `'approved'` while
  `DATING_REVIEW_COMPLETE` is false; `check-dating-badges` requires the pending badge. The blueprint
  extends this honesty rule to all new content and to the `enhancedReview` scorer (kept `COMING_SOON`
  until it actually ships — never advertise tone scoring as delivered while only the coarse browser
  verdict exists).

---

*End of FOUNDATION CONTRACT. The six specs elaborate; they do not contradict.*
