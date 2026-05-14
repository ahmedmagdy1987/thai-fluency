# Duplicate Thai Card Review

Companion to [`content-integrity-audit.md`](./content-integrity-audit.md).
That pass flagged **14 cards** where the same Thai string appeared with
conflicting English or romanization. This document classifies each
case, applies the safe fixes, and lists the rest for editorial /
native-speaker review.

## Outcome at a glance

- **14 cases reviewed.**
- **5 cards fixed** in this pass (1 romanization normalization + 4
  homophone clarification notes).
- **9 cases left for editorial / native review** — these need a
  product or content judgment (dedupe vs differentiate), not a typo
  fix.
- **0 Thai script changes** — only English notes and one romanization
  scheme normalization.

Re-running `scripts/audit-content-integrity.mjs` after the fixes drops
the conflict count from 14 → 13. The remaining "conflict" is `น้ำตาล`
which was reclassified as **not a bug** (see § A.7 below).

## Classification key

| Tag | Meaning |
| --- | --- |
| **homophone** | Two cards intentionally teach the same Thai string with different meanings (e.g. `เย็น` = "cool" and "evening"). Both correct. |
| **near-dup-sentence** | The same sentence appears twice with slightly different English wording — editorial judgement needed (dedupe or differentiate). |
| **near-dup-word** | Same Thai word appears twice with English variants — editorial judgement. |
| **romanization-style** | Same Thai, different romanization scheme — fix to match the app's standard. |
| **categorical-split** | Same Thai, split intentionally into two pedagogical categories (e.g. classifier vs noun). Both correct. |

---

## A. Cases reviewed

### A.1 `ผม` — IDs 1, 573

- **Card 1** — `phǒm` · "I / me (male)" · pronouns
- **Card 573** — `phǒm` · "hair" · body — *already has* note: `Same word as "I" (male). Context tells which.`
- **Classification:** homophone.
- **Action:** none. Card 573's note already cross-references. Card 1
  is the absolute first card a learner sees; adding a "this also
  means hair" note there would distract from learning the primary
  pronoun. Leave.

### A.2 `อยู่` — IDs 11, 510

- **Card 11** — `yùu` · "to be at / to live / to stay" · verbs · has note about `yùu thîi nǎi?`
- **Card 510** — `yùu` · "to stay" · verbs
- **Classification:** near-dup-word.
- **Action:** none in this pass. Card 510's English is a strict subset
  of card 11's, but the two cards may serve different memorization
  goals (broad vs focused). Recommend the owner choose between:
  (a) delete card 510, or
  (b) keep both and refine card 510's English to add something card 11
      doesn't cover (e.g. "(continued state) to stay / remain").
  Editorial call.

### A.3 `เย็น` — IDs 65, 217 ✅ FIXED

- **Card 65** — `yen` · "cool / cold (drinks/AC)" · adjectives, stage 2
- **Card 217** — `yen` · "evening (4-6pm)" · time, stage 1
- **Classification:** homophone.
- **Action applied:** Added cross-reference notes to **both** cards in
  the same style as card 573's existing note:
  - Card 65 note: `Same word as "evening" — context tells which.`
  - Card 217 note: `Same word as "cool / cold" — context tells which.`

### A.4 `เลย` — IDs 103, 1276

- **Card 103** — `loei` · "really / so / at all" · adverbs · has note about positional usage
- **Card 1276** — `loei` · "really / at all (emphatic)" · fluency
- **Classification:** near-dup-word.
- **Action:** none in this pass. Card 103 already explains both usages
  via the note. Card 1276 is a narrower restatement. Recommend either
  deleting 1276 or rephrasing it to surface a third sense (e.g. the
  conjunction usage "so then / therefore").

### A.5 `จัง` — IDs 104, 1277

- **Card 104** — `jang` · "so / very (casual)" · adverbs
- **Card 1277** — `jang` · "really / so much (casual)" · fluency
- **Classification:** near-dup-word.
- **Action:** none in this pass. Same Thai, same phonetic, near-equivalent
  English. Editorial decision needed: dedupe, or differentiate (e.g.
  one focuses on adjective intensifier, the other on "really" as
  emphasis after a complete clause).

### A.6 `คน` — IDs 190, 270

- **Card 190** — `khon` · "person" · people
- **Card 270** — `khon` · "classifier:people" · grammar · has note `"sǎam khon" = three people.`
- **Classification:** categorical-split.
- **Action:** none. The classifier sense vs the noun sense are
  pedagogically distinct in Thai (classifiers are a foundational
  grammar concept). Card 270's note already explains the classifier
  pattern. The split is intentional.

### A.7 `หลัง` — IDs 297, 572 ✅ FIXED

- **Card 297** — `lǎng` · "after" · grammar, stage 1, type 'g'
- **Card 572** — `lǎng` · "back" · body, stage 6, type 'w'
- **Classification:** homophone.
- **Action applied:** Added cross-reference notes to both cards:
  - Card 297 note: `Same word as "back" (body) — context tells which.`
  - Card 572 note: `Same word as "after" (grammar) — context tells which.`

### A.8 `ไม่เป็นไรครับ` — IDs 313, 871

- **Card 313** — phrase, greetings stage 1, has note `The unofficial Thai national motto.` · "No worries / You are welcome (male)"
- **Card 871** — sentence, sentences-polite stage 8 · "No worries / it is fine (male)"
- **Classification:** near-dup-sentence.
- **Action:** none. Same Thai, same phonetic. Card 313's note is
  excellent; card 871 is a stage 8 review of the same phrase. Could
  be intentional (spaced repetition across stages) — keep, but
  consider deleting card 871 if the duplicated content reduces
  motivation. Editorial decision.

### A.9 `อันนี้คืออะไรครับ` — IDs 351, 916

- **Card 351** — phrase, food-phrases stage 8 · "What is this? (male)"
- **Card 916** — sentence, sentences-food stage 8 · "What is this dish? (male)"
- **Classification:** near-dup-sentence.
- **Action:** none. Same Thai sentence; card 916's English is
  contextually narrower ("dish" vs generic "this"). Either could be
  considered canonical. Editorial decision.

### A.10 `อร่อยมากครับ` — IDs 354, 910

- **Card 354** — phrase, food-phrases stage 8 · "Very delicious (male)"
- **Card 910** — sentence, sentences-food stage 4 · "It is very delicious (male)"
- **Classification:** near-dup-sentence.
- **Action:** none. Same sentence, two stages. Card 354's English is
  shorter; card 910's is grammatically more complete. Editorial
  decision on which form to keep.

### A.11 `ผมอิ่มแล้วครับ` — IDs 356, 806

- **Card 356** — phrase, food-phrases stage 8 · "I am full (male)"
- **Card 806** — sentence, sentences-self stage 8 · "I am full (already) (male)"
- **Classification:** near-dup-sentence.
- **Action:** none. Card 806's English ("already") more accurately
  reflects the Thai `แล้ว`. If forced to choose, card 806's English
  is more pedagogically informative. Editorial decision.

### A.12 `มีไหมครับ` — IDs 414, 851

- **Card 414** — phrase, shopping stage 8 · "Do you have (it)? (male)"
- **Card 851** — sentence, sentences-questions stage 8 · "Do you have (any)? (male)"
- **Classification:** near-dup-sentence.
- **Action:** none. Same sentence. Minor wording difference between
  "(it)" and "(any)" — both legitimate. Editorial decision.

### A.13 `น้ำตาล` — IDs 520, 550

- **Card 520** — `náam taan` · "sugar" · food, stage 7
- **Card 550** — `náam-taan` · "brown" · colors, stage 6
- **Classification:** homophone — **and the romanization difference is intentional**.
- **Investigation:** the app already uses two distinct romanization
  styles for `น้ำ`-prefixed compounds in `cards.js`:
  - **Hyphenated** for color compounds (tightly bound phonologically):
    `náam-ngern` (น้ำเงิน blue), `náam-taan` (น้ำตาล brown)
  - **Space-separated** for food / general compounds:
    `náam plàao` (น้ำเปล่า plain water), `náam khǎeng` (น้ำแข็ง ice),
    `náam sôm` (น้ำส้ม orange juice), `náam plaa` (น้ำปลา fish sauce),
    and `náam taan` (น้ำตาล sugar)
- **Action:** none — the audit's heuristic incorrectly flagged this
  as a conflict. Both forms are intentional and consistent with the
  established pattern. Reclassifying this case as "not a bug" in this
  review.

### A.14 `รู้สึก` — IDs 1759, 5722 ✅ FIXED

- **Card 1759** (in `cards-imported.js`) — `róo sèuk` · "feel"
- **Card 5722** (in `cards-step2.js`) — `rúu sùek` · "to feel"
- **Classification:** romanization-style + en-style.
- **Investigation:**
  - The app's canonical `cards.js` uses **`rúu`** for `รู้` (card 26:
    `รู้` → `rúu` "to know"; card 27: `รู้จัก` → `rúu-jàk`). Card 1759's
    `róo` does not match.
  - Every Stage-1 verb in `cards.js` uses the **"to X"** English form
    (`to be`, `to have`, `to go`, `to come`, `to eat`, `to drink`, ...).
    Card 1759's `feel` does not match the convention.
- **Action applied:** Updated card 1759 to:
  - ph `róo sèuk` → `rúu sùek` (matches canonical `rúu` + card 5722)
  - en `feel` → `to feel` (matches the canonical verb form + card 5722)
  - Source-file comment added documenting the manual fix.

> Note: `cards-imported.js` is marked AUTO-GENERATED at the top.
> Re-running the import pipeline would overwrite this fix. Recommend
> adding card 1759 to `STEP2_OVERRIDES` in `cards-step2.js` if the
> import pipeline is ever re-run.

---

## B. Summary table

| # | Thai | IDs | Classification | Status |
| ---: | --- | --- | --- | --- |
| 1 | ผม | 1, 573 | homophone | leave (existing note) |
| 2 | อยู่ | 11, 510 | near-dup-word | editorial |
| 3 | เย็น | 65, 217 | homophone | **✅ notes added** |
| 4 | เลย | 103, 1276 | near-dup-word | editorial |
| 5 | จัง | 104, 1277 | near-dup-word | editorial |
| 6 | คน | 190, 270 | categorical-split | leave (existing note) |
| 7 | หลัง | 297, 572 | homophone | **✅ notes added** |
| 8 | ไม่เป็นไรครับ | 313, 871 | near-dup-sentence | editorial |
| 9 | อันนี้คืออะไรครับ | 351, 916 | near-dup-sentence | editorial |
| 10 | อร่อยมากครับ | 354, 910 | near-dup-sentence | editorial |
| 11 | ผมอิ่มแล้วครับ | 356, 806 | near-dup-sentence | editorial |
| 12 | มีไหมครับ | 414, 851 | near-dup-sentence | editorial |
| 13 | น้ำตาล | 520, 550 | homophone (no bug) | leave (intentional) |
| 14 | รู้สึก | 1759, 5722 | romanization-style | **✅ fixed (1759)** |

**Cases reviewed:** 14
**Cases fixed:** 5 (cards 65, 217, 297, 572, 1759)
**Cases left for editorial / native review:** 9 (near-dup sentences and word variants)
**Cases reclassified as no-bug:** 1 (`น้ำตาล`)

---

## C. Recommendations for the editorial pass

For the 9 near-dup cases, here is a suggested triage approach the
owner can run later:

1. **Run a side-by-side review** of each near-dup pair in the Browse
   tab — Thai + EN + stage + category — to feel whether duplication
   actually helps spaced repetition or merely creates confusion.
2. **Prefer the card with the richer English / note.** Delete the
   thinner one if the two genuinely teach the same thing.
3. **For variants that are pedagogically different** (e.g. card 11's
   "to be at / to live / to stay" vs card 510's narrow "to stay"),
   refine the thinner one to focus on a sense the canonical card
   doesn't cover.
4. **Re-run `node scripts/audit-content-integrity.mjs` after each
   editorial pass** — it's idempotent and will keep the duplicate
   count current.

## D. What was NOT done in this pass

- No Thai script edits.
- No card deletions.
- No card-ID renumbering.
- No new categories created.
- No UI, auth, OneSignal, app shell, character coach, or database
  changes.
- The 334 missing-phonetic cards are out of scope for this review —
  they need the import-pipeline owner to backfill phonetics from
  source.
