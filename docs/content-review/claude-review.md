# Dating Pack + Content-Review Pipeline — Independent Content Review (Agent C)

## ⚠️ Reviewer limitation — READ FIRST

**I am NOT a native (or fluent) Thai speaker.** This review covers **logic, internal
consistency, structural data integrity, pedagogy, and safety framing ONLY.** I did **not**
and **cannot** validate the linguistic correctness of any Thai string, romanization, tone
mark, gloss, or nuance. Wherever I mention a Thai spelling or a "typo," I am flagging a
**structural anomaly** (stray/duplicated combining marks, truncation, a field contradicting
its own note) for a **native** to adjudicate — never asserting that I verified the Thai.

The owner already has a separate Thai-team native review in flight
(`docs/dating-real-talk-native-review.md`, `DATING_REVIEW_COMPLETE = false`). **This is a
second, different pass** and does not replace, duplicate, or claim native approval. **Nothing
in this report authorizes marking any content `approved`.** The zero-approved invariant must
and does still hold (see §4).

Scope: docs-only. This review created exactly one file (this one) and changed zero source.
All five dating/situation guard scripts were run and **all pass** as of this review; every
finding below is either a NEW issue those guards do not cover or a data-quality observation.

---

## 1. SAFETY (priority)

**Overall: the Dating pack's safety design is genuinely strong.** No explicit, coercive,
harassing, or unsafe-advice content was found in the 60 phrases or 65 questions. Consent and
boundaries language (phrases 90028–90035, questions `dq-bound-*`) is authentically
consent-aware — "No means no" (`mâi bplae wâa mâi`), "Please stop," "Is this okay?," "respect
each other's decisions," plus the correctly-marked-wrong dangerous distractor in `dq-bound-4`
("a firm no holds *for now*, fine to check in later" → correctly NOT the answer). Rough phrases
are recognition-only with explicit warnings, and the file-level safety boundary
(`datingPhrases.js:9-24`) is honored. This section is a credit to the authors.

The safety findings below are about **placement/labeling consistency**, not the Dating pack's
advice quality.

### S1 — MEDIUM — Mature / crude / insult content sits in the UNGATED main deck
`src/data/cards-imported-batch2.js:626` (and 687, 702, 820, …)

The 18+ Dating pack is gated behind age-confirmation + Super + a mature-language banner. But
equivalent-register content exists in the **free, ungated main deck** at stage 8 (all flagged
`needsReview`, none behind any 18+ gate):

- `5012` `โสดแต่ไม่สด` — *"single, but not a virgin"* (sexual innuendo) — batch2.js:626
- `5073` `เป็นเมนส์ / มีประจำเดือน` — *"I'm having my period"* — batch2.js:687
- `5088` `มักมากในกาม` — *"To be lustful"* — batch2.js:702
- `5206` `ตอแหล` — *"Liar!"* (insult) — batch2.js:820

The Dating pack takes great care to gate this register; the main deck does not. Recommend the
owner decide whether these belong in the general course at all, and if kept, whether they need
the same gating/warning treatment. (I am flagging **placement and consistency with the app's
own safety model**, not the Thai itself.)

### S2 — LOW — `90058` mild/strong label conflict has a (mild) safety read
`src/data/datingPhrases.js:912` (severity) vs `:918` (note)

`บ้าจริง` carries `severity:'strong'` → badge **"Handle with care" / "Don't use casually"**,
while its own note says *"Mild 'ugh/darn'-level"* and the quiz explanation calls it *"far
softer than a real curse"* (`datingQuestions.js:1905`). The direction here is **over-warning**
(safe-leaning), so the risk is low — but a label set that contradicts itself erodes learner
trust in the very warnings that DO matter (90059/90060). Treated primarily as a consistency
bug in §3 (C1).

### S3 — INFO — No claim of native approval anywhere
Every phrase, category, and card correctly renders as draft/pending. No surface claims native
approval it lacks (verified in §4). Good.

---

## 2. PEDAGOGY

### P1 — MEDIUM — Tone questions conflate "register" with a non-register "Safety" axis
`src/lib/datingQuiz.js:11-16` · `src/data/datingQuestions.js:950-979` (`dq-bound-3`), `1545-1573` (`dq-night-3`)

`SEVERITY_LABEL` folds four values onto one axis — `{Gentle, Casual, Handle with care,
Safety}` — and the `tone` questions ask **"what register is it?"** offering those four as
answers. But **"Safety" is not a register** (gentle/casual/handle-with-care describe
politeness level; "Safety" describes topic/risk — consent, get-home-safe). Two tone questions
mark **"Safety"** as the correct *register* (`dq-bound-3`, `dq-night-3`), teaching a category
error: a learner is told a consent phrase's *register* is "Safety." Recommend either renaming
the question stem away from "register," or splitting the safety flag out of the register axis.

### P2 — LOW — Residual "only-nuanced-option" semantic tell in several scenario questions
`dq-intro-5` (`datingQuestions.js:156-186`), `dq-apps-2` (`304-334`), `dq-slang-4` (`1794-1824`)

The mechanical distractor guard (`check-dating-distractors.mjs`) **passes** — no
length/hedge/absolutist regression (54 non-tone questions clear; **verified NO regression**).
But the acknowledged *semantic* ceiling (documented as out-of-scope in that guard's header)
persists: in these scenario items the correct answer is the single balanced/nuanced option
while distractors are blunt yes/no absolutes, so a test-wise learner can pick it without the
Thai. Not a regression — a known residual. Worth a future adversarial re-pass, not a blocker.

### P3 — POSITIVE — Teach-before-test holds; explanations teach, not just restate
The lesson branch of `DatingSection.jsx` renders `SEVERITY_LABEL`, `USAGE_GUIDANCE`, register,
note, and warning **before** the quiz, so `tone`/`usage` questions test taught material.
Every quizzed phrase is in its category's taught lesson (`validateQuestion` enforces
`subject.cat === q.cat`; `check-dating-sequence` gates the quiz behind the lesson). Explanations
consistently explain *why* and contrast the distractors (e.g. `dq-rel-4`, `dq-bound-4`,
`dq-swear-4`) rather than restating the answer. All 60 phrases are quizzed at least once (0
orphans). This is above-average quiz pedagogy.

---

## 3. CONSISTENCY

### C1 — HIGH — `90058` severity contradicts its note, its explanation, AND its category name
`datingPhrases.js:912` vs `:918` · `datingQuestions.js:1905` · `datingContent.js:143`

`บ้าจริง` (90058) has `severity:'strong'` (→ "Handle with care" / "Don't use casually"), yet
**four** surfaces call it mild:
- its own note: *"Mild 'ugh/darn'-level"* (`datingPhrases.js:918`)
- its quiz explanation: *"a mild 'darn it'-level exclamation … far softer than a real curse"* (`datingQuestions.js:1905`)
- the category **name**: *"Mild swear words & insults"* (`datingContent.js:143`)
- the category **blurb**: *"common mild swears"* (`datingContent.js:144`)

**Correction to the brief:** the known-example id you cited, **`90059`**, is actually
*self-consistent* — its note says *"Rough/informal"* (`datingPhrases.js:933`), which matches
`severity:'strong'`. The real mild-vs-strong contradiction is **`90058`**, and it is the only
one of its kind in the 60 phrases (confirmed by a full note/severity scan). Fix is a native
call: either downgrade 90058 to `moderate`, or drop "mild" from its note/explanation.

### C2 — MEDIUM — 56 of the 95 `needsReview` cards have EMPTY phonetics
`src/data/cards-imported-batch2.js` (rows tagged `// phReview: true, phNeedsGen: true`)

56/95 legacy `needsReview:true` cards ship `ph:""` (ids: 4734, 4737, 4755, 4756, 4772, 4781,
4783, 4796, 4806, 4808, 4815, 4827, 4880, 4895–4898, 4916, 4936, 4948, 4959, 4962, 4992, 4993,
5002–5004, 5012, 5016, 5063, 5070, 5072–5074, 5082–5085, 5088, 5090, 5091, 5102, 5117, 5123,
5126, 5142, 5148, 5151, 5165, 5168, 5175, 5180, 5197, 5206, 5216, 5220). The app convention
(`CLAUDE.md`: "Phonetic + English are **always** shown") means these cards cannot render a
phonetic line. They are self-flagged `phNeedsGen: true` — phonetics were never generated. This
is the single biggest concrete defect in the 95.

### C3 — MEDIUM — Suspected Thai orthographic corruption in several `needsReview` cards *(native to confirm)*
`src/data/cards-imported-batch2.js`

Structural anomalies (stray/duplicated combining marks, truncation, a field contradicting its
own note) — I flag the *shape*, a native confirms the Thai:
- `4959` `เขาเพึ่งจะไป` — the card's **own note** gives the corrected form *"Also: เขาเพิ่งจะไป"* (batch2.js:573)
- `5002` `แล้วทีนี้่จะทำยังไง` — doubled mark on `ทีนี้่` (batch2.js:616)
- `5074` `จะเล่าคามจริงให้ฟัง` — `คาม` vs expected `ความ` per the English "truth" (batch2.js:688)
- `5084` `พยยามรวบรวมเงิน` — `พยยาม` (batch2.js:698)
- `5151` `ต้องรีบท` — appears truncated vs English "finish it quickly" (batch2.js:765)
- `5216` `เปิเเผยความลับ` — `เปิเเผย` (batch2.js:830)
- `4756` `ผมเป็นหนี้บุคุณเขา` — `บุคุณ` (batch2.js:370)

### C4 — LOW — One `needsReview` card packs TWO phrases in a single card
`src/data/cards-imported-batch2.js:687`

`5073` `เป็นเมนส์ / มีประจำเดือน` stores two alternative phrases in one `thai` field. A card is
assumed to be one utterance (TTS, flashcard face, any future grading). Split into two cards.

### C5 — LOW — Near-duplicate cards across decks
`cards-imported-batch2.js:896-897` · `datingPhrases.js:232`

`5282` `คุณดูดี` "You look good" and `5283` `คุณดูดีมาก` "You look great" near-duplicate each
other, and both echo Dating phrase `90014` `คุณดูดีมากเลยวันนี้` "You look really great today."
Different decks so not a hard collision, but overlapping teaching content worth de-duping.

### C6 — LOW — Category `severity-context-warnings` advertises 8 phrases, ships 0
`src/data/datingContent.js:153-161`

`DATING_CATEGORIES` has 11 entries but phrases populate only 10 categories. The 11th
(`severity-context-warnings`, `plannedPhrases:8`) has zero phrases, so a locked user sees a
teaser category that is empty. Guards tolerate this (coverage loops iterate phrase-bearing
categories only), but the teaser over-promises. Either populate it (native) or hide empties.

### C7 — INFO — Situation tagging: no NEW mis-tag in the 95; one pre-existing documented gap
`src/data/situationTags.js:22-30`

Cross-checking each `needsReview` card's `cat` against `situations.js`, I found no card
mis-routed to a wrong situation. The only weakness is the **already-documented** KNOWN
LIMITATION: `shopping` is shared by store/market/money and is parked on `sit-money`; `sit-store`
/`sit-market`/`sit-transport` stay untagged. Pre-existing and disclosed — not a new defect.

---

## 4. REVIEW-STATUS REALITY (exact counts, computed via `reviewStatusOf`)

| Content set | total | `pending` | `needs-review` | `approved` |
|---|---|---|---|---|
| Main-deck cards (`CARDS`) | **4791** | 4696 | **95** | **0** |
| Dating phrases (`DATING_PHRASES`) | **60** | 60 | 0 | **0** |
| Dating categories (`DATING_CATEGORIES`) | **11** | 11 | 0 | **0** |

- All 95 `needs-review` cards resolve via legacy `needsReview:true` → `'needs-review'`
  (`reviewStatus.js:70-74`); **zero cards carry an explicit `reviewStatus` field.**
- `SITUATION_REVIEW_COMPLETE` — all **16** situations `false` (`reviewStatus.js:123-140`).
- `DATING_REVIEW_COMPLETE = false` (`datingContent.js:168`).
- **Zero-approved invariant HOLDS.** `check-situation-review.mjs` passes and prints
  `"… 4791 cards, 0 approved"` (line 96); `check-dating-quiz.mjs` asserts no phrase claims
  `'approved'` while incomplete (line 129) and passes. **I changed nothing; nothing is approved.**

### What the owner must supply to ever mark content `approved` (do NOT do this now)

1. **A named human native reviewer.** `reviewStatus.js:24-26` states this reviewer *"does not
   exist yet"* — it is the open `owner-launch-inputs` item. `approved` is human-only; it is
   never derived, defaulted, or inferred.

2. **Then, to approve a Dating phrase:** set `reviewStatus:'approved'` on the phrase in
   `src/data/datingPhrases.js` **and** flip `DATING_REVIEW_COMPLETE = true` in
   `src/data/datingContent.js:168` (the `check-dating-quiz` gate blocks any `'approved'` phrase
   while that flag is false).

3. **To approve a situation's cards:** cards have **no `reviewStatus` field today** (only the
   `needsReview` boolean), so approval means **adding** `reviewStatus:'approved'` to each card
   **and** flipping `SITUATION_REVIEW_COMPLETE[sit] = true` in `src/lib/reviewStatus.js`.
   `situationReadiness()` additionally requires **≥8 approved vocab + ≥1 approved sentence** per
   situation before it can surface (`situations.js:187-195`).

4. **For the 95 `needsReview` cards specifically:** fix the data first (C2 empty phonetics, C3
   suspected corruption, C4 split card) — then a native sets `reviewStatus:'approved'`.

Files that *would* change at approval time (not now): `datingPhrases.js`, `datingContent.js`,
`reviewStatus.js`, and per-card `cards-*.js`.

---

## 5. Prioritized fix list

1. **[HIGH · C1]** Resolve the `90058` mild-vs-strong contradiction (native decides: downgrade
   severity to `moderate`, or remove "mild" from note + explanation). Note the brief's cited id
   `90059` is already consistent — the real one is `90058`.
2. **[MEDIUM · C2]** Generate the 56 missing phonetics on the `needsReview` cards (they are
   self-flagged `phNeedsGen:true`); until then they violate the "phonetic always shown" rule.
3. **[MEDIUM · S1]** Owner decision on mature/insult content in the ungated main deck (5012,
   5073, 5088, 5206): remove, or gate/warn to match the 18+ Dating standard.
4. **[MEDIUM · C3]** Native pass on the ~7 suspected corrupted Thai strings (4756, 4959, 5002,
   5074, 5084, 5151, 5216) — several are contradicted by their own English/notes.
5. **[MEDIUM · P1]** Fix the register/Safety axis conflation in `tone` questions (rename the
   stem, or split "Safety" out of the register label set).
6. **[LOW · C4]** Split the two-phrase card `5073` into two cards.
7. **[LOW · C6]** Populate or hide the empty `severity-context-warnings` category.
8. **[LOW · C5]** De-duplicate `5282`/`5283`/Dating `90014` "you look good/great" cluster.
9. **[LOW · P2]** Schedule an adversarial re-pass on the residual "only-nuanced-option"
   scenario items (`dq-intro-5`, `dq-apps-2`, `dq-slang-4`).
10. **[GOVERNANCE · §4]** Keep `approved` at zero until a **named** native reviewer signs off;
    do not flip `DATING_REVIEW_COMPLETE` / `SITUATION_REVIEW_COMPLETE` before that human exists.

*All guard scripts (`check-dating-quiz`, `-distractors`, `-badges`, `-sequence`,
`check-situation-review`) pass at review time. `check-dating-quiz.mjs` was read but NOT
modified; the Thai→English recognition-only lock is intact.*
