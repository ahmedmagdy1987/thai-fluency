# Curriculum (situation-based)

**Spec 2 of 6.** Owns FOUNDATION §2 (situation map), §3 (identity paths), §4 (register
content encoding), and the content-attach half of §5 (tone). Subordinate to
`docs/architecture/README.md` (FOUNDATION CONTRACT). Where this spec and the
FOUNDATION disagree, the FOUNDATION wins; anything I believe is wrong is filed under
[Open questions / proposed foundation changes](#open-questions--proposed-foundation-changes)
rather than silently changed.

**Planning only.** Zero application code. Data-shape sketches and interface signatures
are illustrative contracts, not implementations. Every "buildable-now" claim means "fits
the existing stack + the 21 validators," not "built."

**Grounding pass (re-verified against live `src/data/` via `node`, 2026-07-14):**
4,791 cards (`w:3267 g:28 p:247 s:1249`; stages `150/269/423/575/701/804/877/992`);
**95** `needsReview:true` cards; card object fields are exactly
`id,thai,ph,en,type,stage,cat,mission,note,breakdown,needsReview` — **no `register`
field, no `situation` field exist today**; **96** `MINI_UNITS` (83 with a
`sentenceBuilder`); **60** dating phrases, **all** `reviewStatus:'pending'`, across
**10** populated categories (severity `gentle:26 moderate:22 safety:9 strong:3`), 11th
category `severity-context-warnings` defined but empty; **65** `DATING_QUESTIONS`;
`DATING_REVIEW_COMPLETE = false`. These match the FOUNDATION §0 canonical numbers; the
brief's "97 units / 60 phrases across 11 categories" are the stale values §0 corrects.

---

## 1. What this redesign changes and what it does not

The as-built course groups cards by **part of speech inside a stage**: `taxonomy.js`
`CATEGORIES` (39 of them, `taxonomy.js:3-42`) and `STAGES` (`taxonomy.js:44-109`) are
grammatical/topical buckets — `verbs`, `adjectives`, `sentences-questions` — not
situations. The 96 `MINI_UNITS` inherit that grouping. The FOUNDATION §2 binding note
restores the **original situation-first intent** (`learning-flow-architecture-plan.md:86-98`,
"One practical situation, such as greeting, ordering, taxi, hotel, prices, help, time").

Concretely, this spec adds **three tagging layers over existing content and a rule for
authoring new content** — it does **not** rebuild the deck, the SRS, or the unlock graph:

| Layer | New artifact | Touches existing cards? | Owner |
|---|---|---|---|
| Situation tag | `src/data/situations.js` — `SITUATION_TAGS: { [cardId]: sitId }` + new cards carry an authored `situation` field | **No** (separate map keyed by id) | this spec |
| Register level | new `register` field on register-bearing **new** cards only; existing cards are implicitly `reg-polite` | **No** | this spec + §4 |
| Tone label | pure `toneFromPh(ph)` parser; audio from `card.thai` | **No** (derived at runtime) | Spec 1 / FOUNDATION §5 |
| Review status | canonical `pending`/`needs-review`/`approved`; `SITUATION_REVIEW_COMPLETE` map mirroring `DATING_REVIEW_COMPLETE` | **No** (legacy `needsReview:true` → `needs-review` via adapter) | §5 below |

**Why a separate `situations.js` map and not a field edit:** editing the 4,791 cards to
add a `situation` field risks `check-mini-units` (faithful-to-source), `verify-voice-flip`,
and `verify-no-gender-mismatch` churn across the whole deck for zero pedagogical gain. A
side map keyed by `cardId` leaves every existing card byte-identical; only **new** authored
cards carry the field inline.

---

## 2. Situation map (order + rationale)

Reproduced **verbatim** from FOUNDATION §2 — IDs, order, names, and `base` priority are
canonical and must not be renamed or re-scoped. `base` (1–10, higher = surface earlier) is
the default-path priority; ordering is **real-world frequency × inverse difficulty**: what
someone LIVING IN THAILAND needs first and can learn earliest surfaces first.

| # | `id` | Name | base | Rationale (frequency × difficulty) |
|---|---|---|---|---|
| 1 | `sit-greet` | Greetings & politeness particles | 10 | Every interaction; ครับ/ค่ะ foundational; trivial difficulty. |
| 2 | `sit-store` | Convenience store (7-Eleven) | 9 | Daily; fixed phrases + numbers; low difficulty. |
| 3 | `sit-food` | Ordering food & drinks | 9 | Daily; moderate; highest-value early win. |
| 4 | `sit-money` | Numbers, prices & paying | 8 | Underpins store/food/transport; precedes bargaining. |
| 5 | `sit-transport` | Taxi / Grab / bus | 8 | Daily mobility; moderate listening load. |
| 6 | `sit-directions` | Asking & understanding directions | 7 | High frequency but harder — you must parse the reply. |
| 7 | `sit-market` | Markets & bargaining | 7 | Common; numbers + light register. |
| 8 | `sit-smalltalk` | Small talk & address-by-age (pîi/náwng) | 6 | Social glue; register-heavy; every path benefits. |
| 9 | `sit-delivery` | Delivery & app messaging (Grab/Lineman) | 6 | Text-first; expat/partner heavy; moderate. |
| 10 | `sit-housing` | Condo, rent & utilities | 5 | Expat/worker; lower frequency, higher stakes. |
| 11 | `sit-pharmacy` | Pharmacy, symptoms & health | 5 | Infrequent, higher stakes; specialized vocab. |
| 12 | `sit-work` | Workplace & office | 4 | Worker path; register-heavy; audience-specific. |
| 13 | `sit-dating` | Dating & relationships | 4 | Partner path; existing Dating pack (18+, Super, severity). |
| 14 | `sit-admin` | Visa / immigration / bank | 3 | Rare, high difficulty, high stakes; formal register. |
| 15 | `sit-emergency` | Emergencies & safety | 3 | Rare but critical; taught defensively. |
| 16 | `sit-formal` | Temple, monks & deference | 2 | Rare; highest register difficulty; deferential. |

**Ordering is a target, not a readiness claim.** §4 shows the content behind several
early-ordered situations is thin or absent (`sit-transport` base 8 has **2** dedicated
cards; `sit-delivery`/`sit-work`/`sit-formal` have **0**). A situation only enters the
recommender when it clears a content-readiness floor (§4.3); until then it renders as a
"Coming soon" card. Order says *where it belongs*; readiness says *whether it can be
surfaced yet*.

---

## 3. Situation → vocab / exercises / register / tones

Vocab counts are **real** — computed by mapping each situation to the existing
`taxonomy.js` categories that feed it and counting `CARDS`. Because the deck is grouped by
part of speech, several situations draw from a **shared** category (e.g. `sit-store` and
`sit-market` both draw the single `shopping` pool of 43), so these counts are the *upper
bound of taggable candidates*, not disjoint per-situation inventories.

Exercise-type IDs are reused verbatim from FOUNDATION §1. Register IDs from §4. Tone IDs
from §5. "Tones drilled" = every situation can drill all five via the `toneFromPh` parser
on its own cards; the ✦ tones additionally have a **first-class minimal pair** in the 24
`TONE_QUIZ_ITEMS` (`gamification.js:38`) so they get a leak-free `tone-discriminate` item
today without authoring anything.

| `id` | Vocab candidates (source cats) | Exercise types | Register levels | Tones drilled |
|---|---|---|---|---|
| `sit-greet` | **127** (`greetings` 61, `pronouns` 59, `intro` 7) | `flashcard-srs` `recognition-th-en` `production-en-th` `listen-meaning` `tone-discriminate` `speaking-repeat`◔ `register-judge` | `reg-polite` `reg-casual` `reg-formal` | ✦falling ✦high ✦rising ✦low mid |
| `sit-store` | **43** (shares `shopping`) | core + `sentence-build` `dialogue` `speaking-repeat`◔ | `reg-polite` `reg-casual` | ✦falling ✦rising ✦low ✦high mid |
| `sit-food` | **179** (`food` 117, `food-phrases` 11, `sentences-food` 10, `sentences-want` 41) | core + `sentence-build` `dialogue` `speaking-repeat`◔ | `reg-polite` `reg-casual` | ✦low ✦high ✦falling ✦mid rising |
| `sit-money` | **102** (`numbers` 59, shares `shopping` 43) | core + `sentence-build` `dialogue` | `reg-polite` | ✦rising ✦low ✦falling mid high |
| `sit-transport` | **2** dedicated (`transport`); context from `directions`/`places` | core + `sentence-build` `dialogue` `speaking-repeat`◔ | `reg-polite` `reg-casual` | ✦mid ✦falling ✦rising low high |
| `sit-directions` | **107** (`directions` 47, `places` 60) | core + `sentence-build` `dialogue` `listen-meaning` | `reg-polite` `reg-formal` | ✦falling ✦mid ✦rising low high |
| `sit-market` | **43** (shares `shopping`) | core + `sentence-build` `dialogue` `register-judge` | `reg-casual` `reg-polite` | ✦rising ✦low ✦falling high mid |
| `sit-smalltalk` | **306** (`sentences-self` 71, `people` 137, `emotions` 88, `sentences-social` 10) | core + `sentence-build` `dialogue` `register-judge` | `reg-intimate` `reg-casual` `reg-polite` | ✦rising ✦high ✦falling low mid |
| `sit-delivery` | **0** — net-new | core + `sentence-build` `dialogue` | `reg-casual` `reg-polite` | all 5 (parser) |
| `sit-housing` | **97** (`home` 84, `sentences-home` 13) | core + `sentence-build` `dialogue` `register-judge` | `reg-polite` `reg-formal` | all 5 (parser) |
| `sit-pharmacy` | **110** (`health` 35, `body` 64, `sentences-health` 11) | core + `sentence-build` `dialogue` `listen-meaning` | `reg-polite` `reg-formal` | all 5 (parser) |
| `sit-work` | **0** — net-new | core + `dialogue` `register-judge` | `reg-formal` `reg-polite` | all 5 (parser) |
| `sit-dating` | **60 phrases + 65 questions** (separate pack, all `pending`, Super) | `recognition-th-en` **only** (§6 constraint) | `reg-intimate` `reg-casual` (from `severity`) | none by default (recognition-only, English options) |
| `sit-admin` | **43** (`admin` 33, `sentences-admin` 10) | core + `sentence-build` `dialogue` `register-judge` | `reg-formal` `reg-polite` | all 5 (parser) |
| `sit-emergency` | **17** (`emergency`) | core + `listen-meaning` `dialogue` `register-judge` | `reg-polite` `reg-formal` | all 5 (parser) |
| `sit-formal` | **0** — net-new | core + `register-judge` `dialogue` | `reg-deferential` `reg-formal` | all 5 (parser) |

**Legend.** *core* = `flashcard-srs` + `recognition-th-en` + `production-en-th` +
`listen-meaning` + `tone-discriminate`. ◔ = `[gated]` speaking types
(`speaking-repeat`/`tone-produce`) render only where `speechRecognitionAvailable()` is true
and otherwise render **nothing** (FOUNDATION §1) — they are listed only where the situation
has short, high-frequency single phrases worth a coarse "did the app understand you?"
check; they are usable everywhere but noise elsewhere. ✦ = first-class minimal pair exists
in `TONE_QUIZ_ITEMS`; unmarked/`parser` = derived from `ph` diacritics via `toneFromPh`.

**`register-judge` placement.** It appears only on register-bearing situations and is
**always built OUTSIDE the Dating module** (FOUNDATION §4/§8). Dating itself stays
recognition-only with English options and no reward path — see §6.

---

## 4. Honest content-volume assessment (real numbers vs. what a situation curriculum needs)

### 4.1 What exists

- **4,791 cards** total: `w:3267 g:28 p:247 s:1249`. Phrases (`p`) exist **only** in stage
  1 (10) and stage 8 (237); stages 2–7 have **zero** phrase-type cards — situational
  "what you actually say" content is carried by `s` (sentence) cards, concentrated in
  `sentences-daily` (690) and a long tail of tiny `sentences-*` buckets (10–13 each).
- **96 mini-units** across 8 stages (`5/10/12/14/14/14/14/13`), **83** with a
  `sentenceBuilder` (`SentenceBuilder.jsx`). All grouped by POS, not situation.
- **60 dating phrases + 65 dating questions**, a separate id space (`DATING_ID_BASE =
  90000`, `datingContent.js:54`), never in the SRS deck, **100% `reviewStatus:'pending'`**.
- **95** `needsReview:true` cards on the main deck (boolean; no `reviewStatus` field).

### 4.2 The gap, per situation (real candidate counts)

Three tiers of gap emerge from the mapping in §3:

| Tier | Situations | Reality |
|---|---|---|
| **Adequate raw pool, wrong grouping** | `sit-greet` (127), `sit-food` (179), `sit-money` (102), `sit-directions` (107), `sit-smalltalk` (306), `sit-housing` (97), `sit-pharmacy` (110) | Enough taggable candidates; the work is **re-tag + re-unit + native re-review**, not authoring. Shared pools (`money`↔`store`↔`market` all pull `shopping` 43) still need disjoint tagging. |
| **Thin / shared** | `sit-store` (43 shared), `sit-market` (43 shared), `sit-transport` (**2** dedicated), `sit-admin` (43), `sit-emergency` (17) | Needs targeted authoring: 7-Eleven scripts, bargaining lines, Grab/taxi dialogue, visa/bank/immigration formulas, defensive emergency phrases. `sit-transport` is the sharpest early-order/low-content mismatch (base 8, 2 cards). |
| **Zero dedicated** | `sit-delivery` (**0**), `sit-work` (**0**), `sit-formal` (**0**) | Fully net-new: authored male-form, `pending`, then native review before any unit references them. |

### 4.3 What a situation curriculum needs (quantified target)

FOUNDATION and `learning-flow-architecture-plan.md:86-98` define a unit as **6–10 vocab
cards + ≥1 combining sentence card**. Applying that to 16 situations:

- **Minimum viable per situation:** ~1 intro unit = 8 vocab + 1 sentence + 3 challenge ≈
  **9–12 cards**. A credible situation (teach + `dialogue` + `register-judge` where
  applicable) wants **2–3 units ≈ 25–35 cards**, of which the register-heavy ones need
  **3–5 register-variant cards** (new `register` field) and **1 authored `dialogue`** of
  4–6 turns.
- **Whole-map minimum viable:** 16 situations × ~1 unit ≈ **~160 cards + 16 dialogues**
  organized situationally. Credible depth: 16 × ~2.5 units ≈ **~450 cards + ~40
  dialogues**.
- **Net-new authoring load (the honest number):** the three zero-content situations plus
  the thin tier need roughly **6 situations × 25–35 cards ≈ 150–210 net-new cards**, plus
  **register variants** (5 register-heavy situations × ~4 cards ≈ **~20 cards**) and
  **~16 authored situational dialogues** (`DialoguesView.jsx` exists; only **6** `DIALOGUES`
  ship today — a **10-dialogue gap** minimum). Every net-new item ships `pending` and must
  pass native review (§5) before it can be labeled approved.
- **`sit-dating`** already meets volume (60+65) but is **0% approved** and Super-gated; its
  gap is entirely **review + entitlement**, not authoring.

**Bottom line:** ~60% of the map (7 situations) is a **tagging/re-unit/re-review**
exercise on existing cards; ~30% (5 situations) needs **targeted authoring**; ~19% (3
situations) is **greenfield**. No situation is blocked on stack or validators — it is
blocked on **authored Thai + native sign-off**. The recommender must therefore gate on a
per-situation readiness floor: **a situation is "ready" only when it owns ≥ 8 `approved`
vocab cards + ≥ 1 `approved` sentence card**; otherwise it is "Coming soon" and never the
free "up next."

### 4.4 Data-shape sketch (situation catalog + tag map)

```js
// src/data/situations.js  (NEW — no edits to cards.js)
export const SITUATIONS = [
  { id:'sit-greet', name:'Greetings & politeness particles', base:10,
    cats:['greetings','pronouns','intro'],
    registerLevels:['reg-polite','reg-casual','reg-formal'],
    content:'adequate' },              // 'adequate' | 'thin' | 'net-new'
  // …16 entries, order/base/ids verbatim from FOUNDATION §2…
];

// Situation tag on EXISTING cards — a side map, never a card edit.
export const SITUATION_TAGS = { /* [cardId]: 'sit-food', … */ };

// New authored cards carry the field inline instead:
//   { id, thai, ph, en, type:'p', stage, cat, situation:'sit-delivery',
//     register:'reg-casual', reviewStatus:'pending' }
```

Interface (pure, zero deps):

```
getSituationVocab(sitId): Card[]        // SITUATION_TAGS ∪ authored situation field
situationReadiness(sitId): 'ready' | 'coming-soon'   // ≥8 approved vocab + ≥1 approved sentence
```

---

## 5. Content review pipeline (nothing unreviewed ships as approved)

FOUNDATION §9 is the law: **all content is "native review pending" until a named native
speaker signs off; unreviewed content must NEVER ship as approved.** This section makes the
statuses, gates, and sign-off owners concrete and unifies today's **two** conventions.

### 5.1 Canonical status vocabulary (unifies the two conventions)

| Status | Meaning | Legacy mapping | Renders |
|---|---|---|---|
| `pending` | Draft; author-entered; not checked by a native speaker | Dating `reviewStatus:'pending'` (60 phrases) stays as-is | **"Draft content — pending native-speaker review"** badge (mandatory) |
| `needs-review` | Flagged for a re-check (accuracy/tone doubt) | main-deck `needsReview:true` (95 cards) maps here via adapter | same pending badge; prioritized in the review queue |
| `approved` | A **named** native reviewer signed off; situation-level completion flag flipped | none today — **no card is `approved`** | badge removed; content usable as "reviewed" |

A tiny adapter keeps the deck untouched: `reviewStatusOf(item)` returns
`item.reviewStatus ?? (item.needsReview ? 'needs-review' : 'pending')`. **Default is
`pending`** — absence of a status never means approved.

### 5.2 The gates

```
        author            native-review           (sensitive lane only)
draft ──────────▶ pending ──────────────▶ approved ◀── owner co-sign
                    │  ▲                       ▲
       flagged ─────┘  └──── send back ────────┘
     (needs-review)         (accuracy/tone fail)
```

- **Gate 0 — Authoring.** Any new artifact (situation cards, register variants,
  `dialogue` lines, `register-judge` items) enters as `pending`, authored **male-form**
  (`voice.js:9` `DEFAULT_VOICE='male'`), and **must** render the draft badge. No item may
  carry `approved` at authoring time.
- **Gate 1 — Native review.** The **named Thai reviewer** (the still-open
  `owner-launch-inputs.md` line: *"Native speaker reviewer — Required — Confirm a Thai
  speaker who can review launch-critical Thai content and pronunciation concerns"*) checks
  accuracy, tone naturalness, and register fit. Pass → `approved` **only** when the
  situation-level completion flag is flipped by that named reviewer. Fail → back to
  `needs-review`.
- **Gate 2 — Sensitive-content co-sign (dual sign-off).** For anything in the sensitive
  lane — Dating `boundaries-consent` (8), `mild-swears-insults` (3), `severity:'safety'`
  (9), `severity:'strong'` (3), and any `reg-intimate`/"Rude" content — `approved` requires
  **both** the named native reviewer **and** the owner. Until both sign, the item stays
  `pending`, is **recognition-only**, and carries the handle-with-care warning (mirrors the
  existing Dating safety boundary in `datingPhrases.js`).

### 5.3 Completion flags (the enforced gate that blocks false "approved")

Mirror the existing `DATING_REVIEW_COMPLETE = false` (`datingContent.js:168`) with a
per-situation map, so a situation cannot claim `approved` content until its reviewer flips
its flag:

```js
// src/data/situations.js
export const SITUATION_REVIEW_COMPLETE = {
  // all default false until a named native reviewer signs off
  'sit-greet': false, /* …all 16… */ 'sit-dating': false,
};
```

Rule (extends `check-dating-quiz`'s existing invariant to all situations): **no item in
situation S may resolve to `approved` while `SITUATION_REVIEW_COMPLETE[S] === false`.**

### 5.4 Who signs off

| Role | Who | Signs |
|---|---|---|
| Author | owner / assistant drafting | produces `pending`; never `approved` |
| Native reviewer | named Thai speaker (owner-launch-inputs open item) | Gate 1; flips `SITUATION_REVIEW_COMPLETE[S]` |
| Owner | project owner | Gate 2 co-sign for sensitive lane; final launch go/no-go |

### 5.5 Derivations are never approvals

`sentence-build` tokens, the `voice.js` M/F flip, and the `toneFromPh` parse are
**derivations of source content, not sign-offs** (FOUNDATION §9). They inherit the source
card's status and may never independently upgrade an item to `approved` or drop the draft
badge. The paid `enhancedReview` tone scorer stays `COMING_SOON` until it actually ships —
never advertise tone scoring as delivered while only the coarse browser verdict exists.

### 5.6 Enforcement (validators)

- `check-dating-quiz` already forbids any phrase claiming `'approved'` while
  `DATING_REVIEW_COMPLETE` is false — this spec **extends the same rule** to
  `SITUATION_REVIEW_COMPLETE`.
- `check-dating-badges` already requires the pending badge — **extend** the badge
  requirement to every new situation surface.
- **Proposed new validator `check-situation-review`** (needs-owner to wire into the
  harness) modeled on `check-dating-quiz`: assert (a) default status `pending`; (b) no
  `approved` while the situation flag is false; (c) sensitive-lane items are
  recognition-only until dual-signed; (d) the draft badge string is present on any
  `pending`/`needs-review` surface. Filed in Open Questions because adding a validator is a
  harness change, not a code-in-app change.

---

## 6. Identity-path model (reweight order, never fork)

Reproduced from FOUNDATION §3. Four personas are a **tagging + weighting overlay on the
one situation map** — **NOT four curricula**. Identity is a **net-new capture** (only
gendered `voice` and skill `startedStage` exist today; `PlacementOnboarding.jsx` captures
no persona). It is an **optional** onboarding question owned by `engagement.md`. A path
**reweights order only**; it never locks, unlocks, forks, or gates content — consistent
with §7 (curated path free forever) and the decoupled progression in §6 of the FOUNDATION.

**Path IDs:** `path-tourist`, `path-expat`, `path-partner`, `path-worker`; default
`path-none`.

**Weight vocabulary (canonical):** `C` = core ×2.0 · `H` = high ×1.5 · `N` = normal ×1.0 ·
`L` = deprioritize ×0.5. `path-none` = all `N`.

**Reweight rule:** `priority(sit, path) = base(sit) × weight(sit, path)`. A learner's
situation order = situations sorted **descending** by `priority`, ties broken by §2 `base`.
Reweighting changes **which situation surfaces first and which the daily recommender
boosts** — every situation stays reachable in sequence for every path.

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

### 6.1 How "no fork" is guaranteed structurally

The overlay is a **pure sort over one catalog**, and it drives only the **recommender /
"up next" ordering** — it does **not** create a new unlock graph:

```
getSituationOrder(path): string[]     // pure; sorts SITUATIONS by priority(sit,path)
priority(sitId, path): number         // base(sit) × WEIGHTS[path][sit]
```

- **One catalog, one content set.** All four paths + `path-none` read the same
  `SITUATIONS` and the same cards. A weight of `L` (×0.5) still leaves the situation in the
  list and fully reachable — it never removes or paywalls it.
- **Unlock stays linear and path-independent.** The existing
  `getMiniUnitProgressState` (`miniUnitSequence.js:8-13`: first unit unlocked, each unit
  unlocks when the previous completes, exactly one `current`) and stage unlock
  (`state.js:8-17,31-33`: unlock on **seen ≥ total**, 0.70 mature fallback) are **untouched**.
  The path reorders *recommendation surfacing*, not *unlock eligibility*.
- **Readiness + entitlement + review filter the recommendation, not the catalog.** The
  free "up next" resolves to the highest-`priority` situation that is *also* `ready`
  (§4.3), *free*, and has `approved` content. A Super-gated or `pending` situation can rank
  #1 by weight yet still surface as a locked/preview card — see the partner-path tension in
  Open Questions.

### 6.2 Persistence class (avoids the merge trap)

The captured `identityPath` is a single user-scoped preference. Under
`check-progress-merge` it is class **`cloud-auth`** (settings, cloud-wins, matching
`progressMerge.js` `mergeCloudSettings`), not a counter and never
tier — it must never be derived from a merge into an entitlement, and it changes nothing
about what content is reachable, so a wrong/empty value degrades gracefully to
`path-none`.

---

## 7. Register content encoding (FOUNDATION §4 attach)

Register becomes a first-class trainable skill by **extending** two existing systems, not
replacing them:

1. `voice.js` render-time M/F transform (ครับ/ค่ะ, ผม/ฉัน, statement-vs-question particle
   awareness, `voice.js:51-65`) — already produces the polite baseline in both genders.
2. Dating `severity ∈ {gentle, moderate, strong, safety}` + the Dating category register
   labels + `lookup.js` particle glosses.

**Register levels (canonical, casual→formal):** `reg-intimate`, `reg-casual`, `reg-polite`
**(authored default)**, `reg-formal`, `reg-deferential`.

**Encoding rules:**

- Authored default is `reg-polite` **male-form** (`voice.js:9`). Never author two gender
  copies — the M/F flip handles it at render.
- **NEW `register` field** on register-bearing new cards only (the deck has none today,
  confirmed: card fields are `id,thai,ph,en,type,stage,cat,mission,note,breakdown,
  needsReview`). Add register variants **as cards first** (male-form, `pending`) so
  `check-mini-units` (no invented Thai) stays satisfied.
- Dating `severity` is **not** re-modeled — it maps onto register for cross-surface
  consistency: `gentle → reg-casual`/`reg-polite`, `moderate → reg-casual`, `strong →
  reg-intimate` (+"Rude"), `safety →` cross-cutting.
- Dual-form / particle-contrast cards must be marked `isSpeakerStyleProtected`
  (`voice.js:44-47`; existing `NO_FLIP_CARD_IDS` set `voice.js:24-33`) so the flip does not
  corrupt teaching content — enforced by `verify-voice-flip` and `verify-no-gender-mismatch`.
- `register-judge` grading (FOUNDATION §4): English prompt names a listener ("You're
  speaking to a monk / your boss / a close friend"); options are candidate Thai responses at
  differing register levels; grade by `option.id === correct.id`. Preceded by an ungraded
  register primer (teach-before-test, `check-dating-sequence`). Register mastery is a
  **parallel track, never an advance gate** (§6 mastery machine). Built **OUTSIDE** Dating.

**Data-shape sketch (register-judge item, `pending` by default):**

```js
{ id, situation:'sit-work', prompt:'Speaking to your boss — which is right?',
  correctRegister:'reg-formal',
  options:[ { id, register:'reg-formal', cardId /* real card */ },
            { id, register:'reg-casual', cardId },
            { id, register:'reg-intimate', cardId } ],
  reviewStatus:'pending' }   // options reference REAL cards; no invented Thai
```

---

## 8. Tone content attach (FOUNDATION §5)

Tone content is owned by Spec 1 for the drill mechanics; this spec only states **how tone
attaches to situation content**:

- The deck stores tone **only** as `ph` diacritics (`à á â ǎ` = low/high/falling/rising;
  unmarked = mid). Only the 24 `TONE_QUIZ_ITEMS` (`gamification.js:38`) carry a first-class
  discrete `tone` field. `reference.js TONES` is the 5-tone visual pitch-contour reference
  (visual-only).
- To attach a `tone-discriminate` drill to any situation card, derive the tone from `ph`
  with a pure `toneFromPh(ph): 'tone-mid'|'tone-low'|'tone-falling'|'tone-high'|'tone-rising'`
  parser (zero new deps), and play **`card.thai`** via TTS — a separate source, so the audio
  never leaks the printed diacritic (fixes the `pedagogy-audit.md §4.2` leak). Written
  diacritic + romanization stay hidden until reveal; preserve the protected "Ear training"
  string (`check-pedagogy-regression`).
- Tone mastery is a **parallel track, never an advance gate**. Precise per-tone scoring is
  the paid `enhancedReview` differentiator (needs-owner), kept `COMING_SOON` until it ships.

---

## 9. Validator conflicts and resolutions (this spec's surface)

FOUNDATION §8 owns the full 21-validator map (README §8, the foundation). Below are the conflicts this
**curriculum** spec actually creates, with resolutions.

| Validator | Conflict introduced here | Resolution |
|---|---|---|
| `check-mini-units` | `sit-delivery/work/formal` (0 cards) and thin situations need phrases that don't exist | **Author cards first** (male-form, `pending`, single-stage, stage-contiguous, no invented Thai); tag via side map; only then reference from a unit. Sequencing is mandatory, not optional. |
| `check-mini-unit-sequence` | A path-reweighted, branching situation graph vs. "strict linear, exactly one `current`" | **No conflict on unlock:** paths reorder the *recommender* only; unit unlock stays linear via the untouched `miniUnitSequence.js`. If per-situation linear sub-paths are wanted, model each situation as a contiguous block of linear mini-units with a **separate** situation-progression lib + its own validator (needs-owner). |
| `check-course-completion` | Adding situation units could re-gate "course complete" (totals from `MINI_UNITS`, `courseCompletion.js:16,46`) | Keep the existing course-completion counting on `MINI_UNITS`; a separate situation progression gets a **separate completion lib** (FOUNDATION §8). Adding units is safe; re-pointing the existing total is not. |
| `check-dating-quiz` / `check-dating-badges` / `check-dating-distractors` | Partner path wants production + register; Dating is recognition-only, English-option, reward-free | Dating stays recognition-only with English options, real `phraseId`, pending badge, **no reward path**. `production-en-th` and `register-judge` for partner-relevant content live in **general situations** (`sit-smalltalk` etc.), **outside** the Dating module. |
| `check-dating-sequence` | New `register-judge`/`dialogue` graded steps | Every graded step gets an ungraded teach step first; hearts/XP/scoring stay out of teach branches. |
| `check-progress-merge` | New persisted fields: `identityPath`, per-card mastery flags, situation-completion ledger | Assign classes: `identityPath` = **`cloud-auth`** (settings, cloud-wins, matching `progressMerge.js` `mergeCloudSettings`; never tier); mastery counters = **max**; situation-completion/rewarded ledgers = **union**; passed flags = **sticky-OR**. Never derive tier from any of them. |
| `verify-voice-flip` / `verify-no-gender-mismatch` | New gendered register/situation cards | Author male-form; mark dual-form `isSpeakerStyleProtected`; English gender annotation must match the Thai pronoun/particle; use `(male/female)` for dual-form. |
| `check-pedagogy-regression` | Re-tagging touches `TonesQuizSection`/`FirstLessonFlow`/`DatingSection` | Preserve the 7 protected strings ("Ear training", "Complete Stage 1", "Hidden until you answer", …) and the 5 CSS markers; update the guard in the same commit if a change is intentional. |
| *(proposed)* `check-situation-review` | Nothing enforces the pending→approved gate for **new** situation content | Add the validator in §5.6 (needs-owner to wire). Until wired, the `SITUATION_REVIEW_COMPLETE` flag rule is enforced by code review + the extended `check-dating-quiz` intent. |

---

## Open questions / proposed foundation changes

1. **Filename mismatch (non-substantive).** The FOUNDATION index (README §"THE SIX SPECS")
   names this file `curriculum.md`; the authoring task specified
   `docs/architecture/curriculum.md`, which is what was written. Propose renaming to
   `curriculum.md` for index consistency, or updating the index — either is fine, but
   the two should match.

2. **Partner path top-weights a paywalled, unreviewed situation — a real §3 vs §7/§9
   tension.** `sit-dating` is `partner: C` (×2.0), so for a partner-path learner it ranks at
   or near #1 by `priority`. But Dating is **Super-only** (§7) and **100% `pending`** (§9),
   so a *free* partner user's highest-weighted situation is both paywalled and unreviewed.
   "Reweight, never gate" (§3) then collides with "curated path free forever" (§7). **Proposed
   resolution (adopted in §6.1):** the recommender's free "up next" resolves to the
   highest-`priority` situation that is *ready + free + approved*; Dating still appears, but
   as a locked/preview card, never as the free next step. This keeps both rules honest
   because Dating was always Super + 18+ and never part of the free curated path. Please
   confirm this is the intended behavior for the daily recommender.

3. **Early order vs. content readiness — `sit-transport` (base 8, 2 dedicated cards) and
   the shared `shopping` pool.** The order promises early prominence to situations the
   content can't yet fill (`sit-transport` 2 cards; `sit-store`+`sit-market` share the same
   43 `shopping` cards; `sit-delivery/work/formal` = 0). **Proposed foundation addition:** a
   canonical per-situation **content-readiness floor** (§4.3: ≥8 approved vocab + ≥1 approved
   sentence) that gates *recommendation*, not *order*. Order is fixed by §2; readiness is a
   separate axis. Requesting this be blessed as canonical so Specs 3/4 can rely on it.

4. **Situation tag: side map vs. card field.** This spec uses a separate
   `src/data/situations.js` `SITUATION_TAGS` map to avoid editing the 4,791 existing cards
   (keeps `verify-*` and `check-mini-units` churn-free). New cards carry `situation`
   inline. If the foundation would prefer a single uniform representation (field on every
   card), that is a larger, validator-touching migration and should be an explicit
   owner decision. Flagging the divergence rather than choosing silently.

5. **`check-situation-review` is a proposed 22nd validator.** Enforcing the pending→approved
   gate for new situation content cleanly requires a new `check-*.mjs` mirroring
   `check-dating-quiz`. Adding it is a harness change (needs-owner), so §5 currently leans on
   the *extended intent* of `check-dating-quiz` + code review in the interim. Requesting
   approval to add the validator.

6. **Sensitive-lane dual sign-off has no code hook yet.** §5.2 Gate 2 (native reviewer +
   owner co-sign for consent/boundaries/swearing/safety) is a **process** gate today; there
   is no `OWNER_COSIGN_COMPLETE` flag analogous to `DATING_REVIEW_COMPLETE`. Proposed: add
   one, so the "recognition-only until dual-signed" rule is machine-checkable rather than
   convention-only.
