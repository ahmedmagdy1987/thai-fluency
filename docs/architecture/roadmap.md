# Tuk Talk Thai — Spec 6: Implementation Roadmap

**Status:** Planning only. Sequences the five sibling specs (`exercise-types.md`,
`curriculum.md`, `progression.md`, `engagement.md`, `monetization.md`) and the FOUNDATION
CONTRACT (`README.md`) into ordered implementation **passes**. Writes zero application
code. Where this doc and the FOUNDATION disagree, the FOUNDATION wins.

**What this doc adds:** the five specs each say *what* to build and *why it is legal*; none
says *in what order*. This orders everything by **dependency** first, then by
**impact-per-effort**, and for each pass states: what it delivers, what it depends on (the
honest prerequisites), what could BREAK (which validators / live systems it
touches), and what needs the OWNER.

**Ground truth reused (FOUNDATION §0):** `ALL_CARDS` cards (counts move — read the export; stages
`150/269/423/575/701/804/877/992`); **96** `MINI_UNITS` (83 with a `sentenceBuilder`);
**95** `needsReview:true` cards (no `reviewStatus` field on the main deck); **60** dating
phrases all `reviewStatus:'pending'` across **10** populated categories; **65**
`DATING_QUESTIONS`; `DATING_REVIEW_COMPLETE` (now true); **the auto-discovered validator suite** (`check-*.mjs` +
3 `verify-*.mjs`), run by the external harness, most using a **fixed file allowlist**.

**The two named critical-path prerequisites (from the brief), both located in Pass 2:**
1. **Content-review pipeline before shipping more content** — nothing new may ship as
   `approved`; the status vocabulary + draft badge + per-situation completion flags must
   exist before any authored/re-tagged content is surfaced.
2. **Feature-detect seam before speaking exercises** — `speechRecognitionAvailable()` in a
   new `lib/speech.js` must exist (and correctly return **false** on iOS Safari / Firefox /
   Capacitor APK) before any `[gated]` speaking surface is built.

---

## How to read a pass

- **Delivers** — the user-visible or structural outcome.
- **Depends on** — the honest hard prerequisites (a pass never starts before these).
- **Could break** — the specific validators/systems it touches and how it stays green.
- **Needs owner** — the explicit decisions or content/backend work only the owner unblocks.
- **Effort / reach** — rough size and how many users actually get the value (speech types
  are structurally hidden on iOS/Firefox/native, capping their reach).

Passes are numbered by recommended sequence. **Passes 1, 3, and 4 have no hard dependency
on Pass 2** and may run in parallel with it; every pass from 5 onward has real
prerequisites and must respect them.

---

## Pass 1 — Fix the tone leak + ship `listen-meaning`

**The single highest impact-per-effort move, and it needs nothing.** Both consume existing
cards (no new content) and existing TTS output (no speech *recognition*), so neither of the
Pass-2 prerequisites gates them.

**Delivers**
- **`tone-discriminate` redesign** (`exercise-types.md §6`, FOUNDATION §5): during the
  question, **hide the written diacritic AND the romanization** — the prompt becomes a play
  button only (`speakThai(q.thai)`, already wired at `TonesQuizSection.jsx:101-105`);
  `syl`/`thai`/`mean` reveal only after answering. This fixes a **real correctness bug**:
  today `TonesQuizSection.jsx:96` prints `q.syl` *with its diacritic*, and the diacritic
  **is** the answer key (`pedagogy-audit.md §4.2`). This is the headline "tones as a game
  mechanic" differentiator — currently defeated by its own UI.
- **`listen-meaning`** (`exercise-types.md §5`): net-new audio→English MCQ. Play button
  only (no printed Thai/`ph`) + four English options; reveal after answer. Any card with
  `thai`+`en` qualifies — **zero new content**. This is the core "living in Thailand"
  listening skill.

**Depends on:** nothing. `ttsAvailable()` already exists (`audio.js:271-274`).

**Could break**
- `check-quiz-shuffle` — `TonesQuizSection.jsx` is **already** in the scan (lines 44-51);
  preserve the two matched shuffle patterns verbatim (`[...TONE_QUIZ_ITEMS].sort(...)` and
  the `useMemo(..., [idx])` option shuffle) and the `tone === q.tone` grade. **`listen-meaning`
  is a NEW file — it MUST be added to the scan array** (do not exploit the allowlist gap).
- `check-pedagogy-regression` — preserve the protected string **"Ear training"**
  (`TonesQuizSection.jsx:41`) and the "Hidden until you answer"-style placeholder; if the
  redesign alters any other protected copy, update the guard **in the same commit**.
- `check-economy` — both are Hearts = **never**; keep them out of the Challenge heart gate.

**Needs owner:** none. One honest edge to flag (not blocking): where `ttsAvailable()` is
true but no Thai voice is installed, `speakThai` fails silently (`audio.js:84,166-170`) and
an audio-only item is unanswerable — add a non-scored **"reveal the phrase"** escape (never
a heart, never a mastery write). Owner may later decide on a stricter `thaiVoiceLikely()`
probe (`exercise-types.md §13.1`).

**Effort:** small. **Reach:** universal (TTS output is broad).

---

## Pass 2 — Foundational seams (unblock everything; ship no risky surface)

**No user-visible feature; this is the plumbing every later pass imports.** It carries both
named critical-path prerequisites. Deliberately low-risk: the new files are not yet scanned
by any validator and must not edit a single existing card byte.

**Delivers**
- **Review-pipeline plumbing** (`curriculum.md §5`, FOUNDATION §9): canonical status
  vocabulary `pending` / `needs-review` / `approved`; the byte-safe adapter
  `reviewStatusOf(item) = item.reviewStatus ?? (item.needsReview ? 'needs-review' : 'pending')`
  (maps the 95 legacy `needsReview:true` cards without touching them); a **shared** draft
  badge ("Draft content — pending native-speaker review") generalized from the existing
  Dating `reviewBadge()` (`datingQuiz.js:35-40`); and `SITUATION_REVIEW_COMPLETE` (all 16
  `false`), mirroring `DATING_REVIEW_COMPLETE`.
- **`lib/speech.js` feature-detect seam** (`exercise-types.md §11.1`): `speechRecognitionAvailable()`,
  mirroring `ttsAvailable()` — `isNative() → false` (Capacitor APK WebView is unreliable),
  web → `!!(window.SpeechRecognition || window.webkitSpeechRecognition)`. Zero deps.
- **`lib/situations.js` spine** (`curriculum.md §4.4`): the `SITUATIONS` catalog (16 IDs,
  `base`, `cats`, `content` tier — all verbatim from FOUNDATION §2), an empty
  `SITUATION_TAGS` side-map keyed by `cardId` (so the cards stay byte-identical), and
  `situationReadiness(sitId)`.
- **`toneFromPh(ph)` parser** (`curriculum.md §8`, FOUNDATION §5): pure, zero-dep
  `à→tone-low á→tone-high â→tone-falling ǎ→tone-rising`, unmarked→`tone-mid`. Lets later
  passes attach a leak-free tone drill to any card (audio from `card.thai`, a
  separate source from the written answer).

**Depends on:** nothing.

**Could break**
- Essentially nothing on the code side — no existing file changes, no validator yet scans
  these files. The one rule: the review adapter and `SITUATION_TAGS` must be **additive**
  (`verify-voice-flip`, `verify-no-gender-mismatch`, `check-mini-units` stay green because
  no card is edited).

**Needs owner (this is where the pipeline gets teeth)**
- **Name the native reviewer.** `approved` is meaningless until a named Thai speaker can
  sign off — the still-open `owner-launch-inputs` item. Without this, *every* content pass
  downstream is capped at `pending`.
- **Decide the 22nd validator.** `check-situation-review` (`curriculum.md §5.6`) enforces
  the pending→approved gate machine-side; wiring a new `check-*.mjs` into the harness is an
  owner action. Until wired, the gate leans on code review + the extended `check-dating-quiz`
  intent.
- **Confirm side-map vs. card-field** for situation tags (`curriculum.md` Open Q4). The
  side-map is the churn-free default; a field-on-every-card migration is a larger,
  validator-touching decision.

**Effort:** small–moderate. **Reach:** enables everything; no direct value alone.

---

## Pass 3 — Engagement loop juice (retention, no content, no prerequisites)

**High retention-per-effort; reuses only assets that already exist** (`engagement.md
§0,§3,§4,§5`). No new art, no new sound files, no new dependency, near-zero new
persistence.

**Delivers**
- **In-session combo 3/5/10** (`engagement.md §3`): transient consecutive-correct counter
  in component state; drives existing coach reactions (`useCharacterReaction`) + existing
  sounds (`playMilestone`/`playCelebration`) + `ConfettiBurst`. **Never persisted, grants no
  XP/gems, touches neither SRS nor hearts.**
- **Payoff-screen extension** (`engagement.md §4`): add display-only `accuracy` and
  `comboBest` cells to the existing shared `MissionCompleteRewardScreen` (do not add a
  second payoff surface). Computed from the transient session object; never stored.
- **Durable streak milestones 3/7/30/100** (`engagement.md §5.1`): mint via the existing
  `celebrations.js` ledger; **must be added to the `activeCelebrationIds` baseline seed**
  so a user already on a 40-day streak is not retro-spammed.
- **Honest streak recovery card** (`engagement.md §5.2`) + freeze-as-conversion surface
  (reuses `buyStreakFreezeWithGems`, 30 gems).

**Depends on:** nothing (all live assets). No hard dependency on Pass 2.

**Could break**
- `check-celebrations` — durable IDs (no `:YYYY-MM-DD` suffix); mint via
  `withCelebrated`/`hasCelebrated`; **seed the baseline** or existing streaks get
  retro-celebrated.
- `check-quest-logic` — combo grants **no** XP/gems, so nothing new hits the "activity
  today" streak signal; XP still flows through the existing idempotent `awardReward`/`grantXp`.
- `check-economy` — freeze reuses the existing 30-gem sink; **no new gem source**, Super
  grants no gems, the free path stays.
- `check-session-isolation` — combo is component-state (auto-resets); no new persisted ref.

**Needs owner:** none (only recovery-card copy). Note: the *routing reversal* that makes the
first lesson playable anonymously (`engagement.md §1`) is a separate owner decision — see
the Owner track; it is **not** required for combo/milestones/payoff.

**Effort:** small. **Reach:** universal (speech-independent by design).

---

## Pass 4 — Mastery overlay + UI

**The skill-depth spine every later pass reads.** A derived overlay on the existing SRS —
no scheduler, no state library, one monotonic per-card counter (`progression.md §4`).

**Delivers**
- **`lib/mastery.js`** (pure): `isTaught(cardId, progress, completedMiniUnits)` (the
  read-time union that honors FOUNDATION §6 "completing a lesson advances taught" without a
  `progress` write — reconciling the two unlock ladders that exist today,
  `App.jsx:1840-1842` vs `state.js`); `masteryStateOf(...)`;
  `advanceMastery(...)` (MAX-monotonic).
- **`masteryRank` sibling map** (`{[cardId]: 0|1|2|3}`), persisted alongside `progress`,
  **outside** the SRS card object so `mergeCard` is untouched.
- **Mastery UI**: display `taught → recognized → produced → spoken` alongside the existing
  learned-vs-mature readout; `spoken` visibly marked **"optional / device-dependent"** so
  iOS/Firefox/native users don't perceive a permanently incomplete track.
- Wire the existing `recognition-th-en` / `production-en-th` / `sentence-build` /
  `listen-meaning` (Pass 1) to write their mastery signal.

**Depends on:** Pass 1 only insofar as `listen-meaning` should write `recognized` once it
exists. Otherwise no hard dependency; may run parallel to Passes 2/3.

**Could break**
- `check-progress-merge` — `masteryRank` is class **MAX** (monotonic, non-rewarding, never
  tier). A new `mergeMasteryRank` (element-wise `Math.max`) must be added to
  `progressMerge.js` **and** to the `check-progress-merge.mjs` scenario list (do not exploit
  the allowlist gap). `taught` is derived, not stored, so it needs no merge class.
- `getStageState` (`state.js`) — **must be left exactly as-is** (reads `progress[id]`) so no
  existing user is re-locked (FOUNDATION §6 HARD RULE / do-not-regress).

**Needs owner**
- **`markCardsSeen` unification** (`progression.md` Open Q1): whether guided-lesson
  completion should write a minimal `progress` entry (unifying the two ladders). This
  changes SRS behavior (those cards enter `getDueCards`) → owner decision. The overlay works
  without it; this only matters for making guided-only cards challenge-eligible.
- **Do Challenge-earned correct answers count toward `recognized`/`produced`?**
  (`progression.md` Open Q3) — a one-line policy call.

**Effort:** moderate. **Reach:** universal (except `spoken`, which is capped by device).

---

## Pass 5 — Gated speaking (`speaking-repeat` + `tone-produce`)

**Coarse, honest, and structurally low-reach.** Ships the speaking *attempt* loop for the
minority of platforms that support browser `SpeechRecognition`.

**Delivers**
- **`SpeakingExercise.jsx`** (`exercise-types.md §7,§8`): mic → transcript → coarse
  `correct`/`close`/`wrong` **word** verdict against `card.thai` (never `ph`). Renders
  **only** when `speechRecognitionAvailable()` is true; when absent it renders **nothing**
  (mirror `SocialLinks.jsx:45` returning `null`) — no button, no "unsupported" stub. The
  upstream lesson flow routes *around* the gated step so iOS/Firefox users never hit a dead
  end.
- Honest framing, written verbatim: *browser recognition cannot grade tone — it
  auto-corrects a mistoned attempt toward the nearest real word.* The verdict is "did the
  app understand you?", **never** advertised as pronunciation/tone assessment.
- Optionally attaches `tone-discriminate`/`tone-produce` to the full deck via `toneFromPh`
  (Pass 2).

**Depends on:** **Pass 2** (`speechRecognitionAvailable()`), **Pass 4** (writes
`mastery-spoken` as a sticky-OR flag).

**Could break**
- `check-economy` — Hearts = **never**.
- `check-progress-merge` — the `spoken` flag is class **sticky-OR**; never routed through
  tier.
- `check-session-isolation` — any per-attempt anti-farm/spam guard must be **device-scoped**;
  any user reward-lock registered in `resetUserScopedRefs`.
- **HARD RULE:** `mastery-spoken` is unreachable on iOS Safari / Firefox / in-app webviews /
  Capacitor APK, so it may **never** be required for any completion, unlock, or streak.

**Needs owner**
- **Precise tone scoring is needs-owner** (FOUNDATION §7, `exercise-types.md §11.3`): the
  paid `enhancedReview` scorer ships only when `VITE_PRONUNCIATION_SCORER` is set **AND**
  entitlement flips `enhancedReview` from `COMING_SOON` to `AVAILABLE` (runtime-injected SDK
  via Supabase Edge Function; never `npm i`). Keep it `COMING_SOON` until it actually ships.
- Confirm the seam returns **false** on Capacitor (no coarse path on the APK unless a native
  recognizer plugin is added — out of scope, would be a new dependency).

**Effort:** moderate. **Reach:** **low** (a large share of users have no `SpeechRecognition`).
Sequenced after the universal wins for exactly this reason.

---

## Pass 6 — Situations MVP (the "situations not units" differentiator, on content that already exists)

**The strategic centerpiece — sequenced only this far down because it has the most
prerequisites.** Ship it first on the **~7 "adequate raw pool" situations** that need only
**re-tag + re-unit + native re-review**, not authoring (`curriculum.md §4.2`):
`sit-greet` (127), `sit-food` (179), `sit-money` (102), `sit-directions` (107),
`sit-smalltalk` (306), `sit-housing` (97), `sit-pharmacy` (110).

**Delivers**
- **Identity capture** (`engagement.md §2.1`): optional onboarding question → `stats.identityPath`
  ∈ `path-tourist/expat/partner/worker/path-none`. Reweights order only; never gates.
- **`lib/situationProgression.js`** (`progression.md §2.2`): `getSituationOrder(path)` (pure
  sort by `priority(sit,path) = base × weight`), `getSituationProgressState(...)` (same shape
  as `getMiniUnitProgressState`), `getUnitsForSituation(sitId)`.
- **The daily recommender**: free "up next" = highest-`priority` situation that is *ready
  (§4.3 floor: ≥8 approved vocab + ≥1 approved sentence) + free + approved*. A Super-gated or
  `pending` situation may rank #1 by weight yet surface only as a locked/preview card.
- **Populate `SITUATION_TAGS`** for the 7 situations (side-map only; no card edits) and flip
  their `SITUATION_REVIEW_COMPLETE` **after** native re-review.

**Depends on:** **Pass 2** (situations spine + review pipeline), **Pass 4** (`isTaught`
union for unlock), **identity capture** (above). **Native reviewer sign-off** on the
re-tagged situations (Pass 2 owner item) before any of them leaves "Coming soon."

**Could break**
- `check-mini-units` — tag via the side-map; **no invented Thai**; existing units stay
  single-stage and stage-contiguous.
- `check-mini-unit-sequence` — the per-path order is a **linearization** (one deterministic
  sequence per learner), still strictly linear with exactly one `current`. Unit unlock via
  the untouched `miniUnitSequence.js`.
- `check-course-completion` — keep the existing `MINI_UNITS`-derived total; the situation
  rail gets a **separate** completion lib (never re-point the existing total).
- `check-progress-merge` — `identityPath` is class **cloud-auth**, never tier.
- `check-session-isolation` — reset `identityPath` in `resetUserScopedRefs` on identity change.
- **NEW `check-situation-sequence.mjs`** — model on `check-mini-unit-sequence`; harness
  wiring is an owner action.

**Needs owner**
- Wire `check-situation-sequence`.
- **Confirm the partner-path / Dating recommender resolution** (`curriculum.md` Open Q2):
  `sit-dating` is `partner: C` (×2.0) so it ranks ~#1 for partner-path, but it is Super-only
  and 100% `pending` — the free "up next" must resolve past it to a ready+free+approved
  situation. Confirm this is intended.
- **Confirm entry-situation mapping** vs. `startedStage`/placement `knownIds`
  (`progression.md` Open Q4).
- Native reviewer to flip the 7 `SITUATION_REVIEW_COMPLETE` flags.

**Effort:** large (tagging + re-unit + re-review across 7 situations + new lib + recommender
+ onboarding). **Reach:** universal.

---

## Pass 7 — Situation Challenge + situation-scoped tone/register drills

**Delivers**
- **`lib/situationChallenge.js`** + **`check-situation-challenge-scope.mjs`**
  (`progression.md §6.2`): a challenge scoped to `progress[id] ∧ situation-tag` (the exact
  `check-challenge-scope` learned predicate intersected with the tag), distractors from the
  same scoped pool, empty when the reviewed pool is too small. A situation crosses stages, so
  it **cannot** reuse the single-stage `buildChallenge`.
- **Situation tone drills** via `toneFromPh` (Pass 2) on each situation's own cards, plus the
  leak-free `tone-discriminate` from Pass 1.

**Depends on:** **Pass 6** (situation tags + readiness), **Pass 4** (the `progress[id]`
reviewed predicate), **Pass 2** (`toneFromPh`).

**Could break**
- `check-challenge-scope` — **do not touch** the Stage Challenge; the situation builder is
  separate with its own validator (asserts every option is situation-tagged + reviewed, no
  cross-situation/untaught leak).
- `check-quiz-shuffle` — situation challenge is a new repeatable MCQ in a new file: shuffle
  both axes, grade by `option.id`, **add the component to the scan array**.
- `check-economy` — heart-free (it is not the Stage Challenge).

**Needs owner:** wire `check-situation-challenge-scope`.

**Effort:** moderate. **Reach:** universal.

---

## Pass 8 — Authored exercise tracks: `register-judge`, then `dialogue`

**The two `needs-content` differentiators. Sequenced last because they are gated on authored
Thai + native sign-off, not on stack or validators** (`exercise-types.md §9,§10`;
`curriculum.md §4.3,§7`). Ship **`register-judge` first** (smaller lift, and it is strategic
premise #2 — register as a first-class trainable skill); **`dialogue` second** (the largest
content lift in the whole roadmap).

**Delivers**
- **`register-judge`** (OUTSIDE the Dating module): English listener/situation prompt → pick
  the register-appropriate **Thai** response; graded by `option.id`; preceded by an ungraded
  register primer. Needs **register-variant cards first** (~20, `curriculum.md §4.3`),
  authored male-form, `pending`, dual-form cards marked `isSpeakerStyleProtected`.
- **`dialogue`** (branching): `DialogueScene`/`DialogueTurn` where the learner's choice
  changes the partner's next line (reply consequences). Extends the existing
  `DialoguesView.jsx` (today linear/un-graded). Needs **~16 authored situational dialogues**
  (`curriculum.md §4.3` — only 6 `DIALOGUES` ship today, a ≥10-dialogue gap), every line
  card-backed (no invented Thai).
- The broader net-new authoring these tracks also unlock the thin/zero situations
  (`sit-delivery`/`sit-work`/`sit-formal` = 0 dedicated cards; `sit-transport` = 2): roughly
  **150–210 net-new cards** across 6 situations (`curriculum.md §4.3`), all `pending` → native
  review before surfacing.

**Depends on:** **Pass 2** (review pipeline), **Pass 6** (situations + placement outside
Dating), and **authored content + native review** — the real gate. Sensitive-lane items
(`reg-intimate`/"Rude", Dating `severity:'safety'|'strong'`) need **dual sign-off**.

**Could break**
- `check-mini-units` — **cards first, no invented Thai**; single-stage, stage-contiguous.
- `check-quiz-shuffle` — add both new components; shuffle option order on dialogue replay.
- `check-dating-sequence` — every graded step gets an ungraded teach step; no hearts/XP in
  teach branches.
- `check-dating-quiz` / `check-dating-badges` / `check-dating-distractors` — **build outside
  Dating**; Dating stays recognition-only, English-option, reward-free.
- `verify-voice-flip` / `verify-no-gender-mismatch` — author male-form; English annotation
  matches the Thai pronoun/particle; `(male/female)` for dual-form.
- `check-celebrations` — mint register/dialogue milestones via existing helpers; seed the
  baseline.

**Needs owner**
- A **content sprint** (author + native reviewer) — the binding constraint.
- **Owner co-sign** for the sensitive lane; a proposed `OWNER_COSIGN_COMPLETE` flag
  (`curriculum.md` Open Q6) to make "recognition-only until dual-signed" machine-checkable.

**Effort:** large (register) → very large (dialogue + net-new situation content).
**Reach:** universal, but throttled by authoring/review throughput.

---

## Owner-gated track (parallel to all passes — decisions & backend, not build passes)

These are surfaced by the specs as `needs-owner`; they do not block the build passes above
and can be decided independently, but several are launch-relevant.

| Item | Source | What it needs from the owner |
|---|---|---|
| **Invest-before-ask routing reversal** | `engagement.md §1,§10` | Reverse `App.jsx:2358` so the first full lesson is playable anonymously (localStorage-backed +60 XP, Day-1 streak) and the account ask moves to the post-reward boundary. Routing change only, but **reverses current behavior** → explicit decision. |
| **Ladder unification (`markCardsSeen`)** | `progression.md` Open Q1 | Whether guided-lesson completion writes `progress` (changes SRS queue behavior). |
| **Dating review + entitlement** | `curriculum.md §4.3`, FOUNDATION §9 | 60 phrases + 65 questions are 100% `pending`; the gap is **native review + owner co-sign**, not authoring. `datingRealTalk` is already AVAILABLE + enforced; content just needs sign-off. |
| **Paid pronunciation scorer** | `monetization.md §4`, `exercise-types.md §11.3` | Flip `enhancedReview` only when `VITE_PRONUNCIATION_SCORER` set AND scorer ships; the only feature with real marginal cost. |
| **Super catalog completion** | `monetization.md §6,§9` | Add `doubleXp` (with a **gem-income guard** so it never accelerates `dailyGoalsHit` gems), `characterSkins`; bless the **early-access graduation rule** (early access = net-new-beyond-free content that graduates to free, never a permanent gate); ship the **additive** monthly Super freeze on `streakRecovery`. |
| **Free trial / family plan / ads** | `monetization.md §7` | Each is server/backend work (trial dedupe, seat model, rewarded-ad SDK by runtime injection). Ads are lowest priority (they risk the retention engine). |
| **New validators into the harness** | `curriculum.md §5.6`, `progression.md §6.2` | Wire `check-situation-review` (Pass 2), `check-situation-sequence` (Pass 6), `check-situation-challenge-scope` (Pass 7). |
| **Name the native reviewer** | FOUNDATION §9 | The single most launch-critical unblock — `approved` is impossible without it, capping every content pass at `pending`. |

---

## Dependency graph (one screen)

```
 NO PREREQS (do in parallel)
 ┌───────────────────────────────────────────────────────────────────────┐
 │ Pass 1  Tone-leak fix + listen-meaning        (correctness + core skill)│
 │ Pass 3  Engagement juice: combo/milestones/payoff   (retention)         │
 │ Pass 4  Mastery overlay + UI                  (skill-depth spine)        │
 └───────────────────────────────────────────────────────────────────────┘
 ┌───────────────────────────────────────────────────────────────────────┐
 │ Pass 2  SEAMS: review-pipeline • speech.js • situations.js • toneFromPh │
 │         (carries BOTH named critical-path prerequisites)                │
 └───────────────────────────────────────────────────────────────────────┘
        │ speech.js                │ review-pipeline + situations spine
        ▼                          │
 Pass 5  Gated speaking            │        (also needs Pass 4: spoken flag)
 (low reach; iOS/FF/native hidden) │
                                   ▼
                          Pass 6  Situations MVP   ◀── Pass 4 (taught union)
                          (re-tag 7 adequate       ◀── identity capture
                           situations; recommender) ◀── NATIVE REVIEW sign-off
                                   │
                                   ▼
                          Pass 7  Situation Challenge + tone/register attach
                          (◀── Pass 2 toneFromPh, ◀── Pass 4 reviewed predicate)
                                   │
                                   ▼
                          Pass 8  register-judge → dialogue
                          (◀── Pass 2 review, ◀── Pass 6 situations,
                           ◀── CONTENT AUTHORING + NATIVE + owner co-sign)

 OWNER TRACK (parallel, non-blocking): routing reversal • ladder unification •
   Dating review+entitlement • paid scorer • Super catalog • trial/family/ads •
   wire the 3 new validators • NAME THE NATIVE REVIEWER (gates all content)
```

**Critical path to the strategic differentiators:** Pass 2 → Pass 4 → Pass 6 → Pass 7 → Pass 8,
with **native-reviewer naming** (Owner track) as the true rate-limiter on everything from
Pass 6 onward.

---

## Recommended first 3 passes

1. **Pass 1 — Tone-leak fix + `listen-meaning`.** Highest impact-per-effort in the whole
   roadmap: it repairs a real correctness bug that currently defeats the tones differentiator
   (the printed diacritic *is* the answer), and ships the core listening skill — both with
   **zero new content and zero prerequisites**. Immediate, universal, low-risk.
2. **Pass 2 — Foundational seams.** Buys down all downstream risk by landing the two named
   critical-path prerequisites (content-review pipeline; `speechRecognitionAvailable()`) plus
   the situations spine and `toneFromPh`. No user surface, so no user-facing risk — but every
   pass from 5 on is blocked without it, and it forces the **name-the-native-reviewer** owner
   decision to the top of the queue, which is the real launch rate-limiter.
3. **Pass 3 — Engagement loop juice.** Cheap, speech-independent retention wins (combo,
   durable streak milestones, one consolidated payoff screen) using only existing assets — no
   new dependency, no content, near-zero persistence. Retention is the top of the revenue
   funnel, so this compounds the value of everything else.

Then **Pass 4 (mastery overlay)** as the bridge into the situation work (Passes 6–8), which
is where the "situations not units / register / identity paths" differentiators land but also
where the honest content-and-review cost is concentrated.

---

*End of Spec 6 — Implementation Roadmap. Sequences the FOUNDATION CONTRACT and the five
sibling specs; contradicts none of them.*
