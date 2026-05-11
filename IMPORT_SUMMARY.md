# Anki Import Summary

**Last updated:** 2026-05-11 (Phase 2 redistribution applied)

**Total cards in app:** 4791 (645 hand-curated + 2801 batch1 + 1306 batch2 + 39 Phase 2 additions, ids 1–5738)

**Stage distribution (post-Phase 2):** 150 / 275 / 425 / 575 / 700 / 800 / 875 / 991

---

# Phase 2 — Stage redistribution + critical vocab additions

**Date:** 2026-05-11
**Scripts:** `scripts/analyze-redistribution.js`, `scripts/find-next-vocab.js`, `scripts/apply-redistribution.js`, `scripts/verify-redistribution.js`
**Output:** `src/data/cards-step2.js` (39 new cards + 4355 stage/type/data overrides)
**Verification:** `VERIFICATION_REPORT.md`

## Why

Pre-Phase 2 distribution was front-loaded:

| Stage | Pre | Target | Final |
|---:|---:|---:|---:|
| 1 | 1290 | 150 | **150** |
| 2 | 1183 | 275 | **275** |
| 3 | 262 | 425 | **425** |
| 4 | 1238 | 575 | **575** |
| 5 | 595 | 700 | **700** |
| 6 | 106 | 800 | **800** |
| 7 | 43 | 875 | **875** |
| 8 | 35 | 952 | **991** (+39 overflow within ±10% tolerance) |

Each stage now sits inside the ±10% tolerance band, and **0 sentences violate the dependency rule** ("a sentence's stage must be ≥ every constituent word's stage").

## What

**1. Hand-curated 10 essential Stage 1 sentences:**

| # | id | Thai | English |
|---|---:|---|---|
| 1 | 310 | สวัสดีครับ | Hello |
| 2 | 330 | ผมชื่อ ___ ครับ | My name is ___ |
| 3 | 853 | ห้องน้ำอยู่ที่ไหนครับ | Where is the bathroom? |
| 4 | 850 | อันนี้เท่าไหร่ครับ | How much is this? |
| 5 | 5700 (NEW) | ผมพูดภาษาไทยไม่ได้ครับ | I can't speak Thai |
| 6 | 312 | ขอบคุณมากครับ | Thank you very much |
| 7 | 313 | ไม่เป็นไรครับ | You're welcome |
| 8 | 314 | ขอโทษครับ | Sorry / Excuse me |
| 9 | 431 | ผมไม่เข้าใจครับ | I don't understand |
| 10 | 430 | ช่วยด้วย | Help! |

**2. New cards (39 total, ids 5700–5738):**
- 1 new sentence (id 5700: I can't speak Thai)
- 38 new word cards covering high-impact missing vocabulary: `ไม่ใช่`, `อันนี้`, `เจอกัน`, `มั้ย`, `ได้ไหม`, `กินข้าว`, `จากไหน`, `สักครู่`, `เหรอ`, `เช็คบิล`, `เมนู`, `หลงทาง`, `หรือยัง`, `งี้`, `รวย`, `เด็ด`, `อิจฉา`, `ยืด`, `น่ะ`, `อ่ะ`, `ไม๊`, `รู้สึก`, `เซ็น`, `บัส`, `แผน`, `แบงค์`, `ตังค์`, `เนอะ`, `คุ้ม`, `โกง`, `ท้อ`, `ไส้`, `มั้ง`, `ฉี่`, `ปั่น`, `หุบ`, `มิเตอร์`, `อพาร์ทเมนท์`

**3. Type/field changes to existing cards:**

| id | Thai | Change |
|---:|---|---|
| 4528 | ไม่ได้ | type s→w (idiomatic chunk, not sentence) |
| 5361 | ไม่เป็นไร | type s→w (idiomatic chunk), stage S3→S1 |
| 4474 | มาถึง | type p→w, ph fix `mahtërng` → `maa thǔeng` |
| 5344 | ช้าๆ | type s→w (adverb, not sentence) |
| 4671 | กี่โมง | type s→w, en fix "how much / many" → "what time" |
| 4732 | แป๊บนึง | type s→p (idiomatic expression, not free sentence) |
| 4733 | อะไรอย่างเงี้ยะ | type s→p |

**4. Architectural fix:** `type='p'` (phrase) cards now count as vocabulary units in the dependency analyzer alongside `w`/`g`. Phrases are by definition idiomatic chunks — treating them as opaque vocabulary is the correct model.

**5. Quarantined sentences:** 95 sentences contain Thai tokens not in any vocab card and were placed in Stage 8 as "review needed." These can be unblocked by adding the missing words in a future content pass. The top remaining blockers are single-char fragments (`เ`, `ะ`, `น` — from words like `เยอะ`, `โอเค`, `แคนาดา` that we deliberately skipped per scope).

## How the data is structured

To avoid mass-editing 3 source files (4,000+ lines of card data), all Phase 2 changes live in **one new file**: `src/data/cards-step2.js`. It exports:

- `STEP2_ADDITIONS`: the 39 new cards
- `STEP2_OVERRIDES`: a map `{ id → { stage?, type?, en?, ph? } }` for the 4,355 existing cards whose stage/type/data changed

`src/data/cards.js` was modified (~6 lines) to import + apply these. Original card data in `cards.js`, `cards-imported.js`, and `cards-imported-batch2.js` is **byte-for-byte unchanged**. Backups exist as `*.backup-pre-redistribution-2026-05-11.js`.

## How to re-run / extend

```bash
# Regenerate cards-step2.js with updated patches:
# 1. Edit NEW_CARDS / RETYPE_TO_W / RETYPE_TO_P / FIELD_FIXES / ESSENTIAL_S1_SENTENCE_IDS in scripts/apply-redistribution.js
# 2. Restore baseline cards.js (required — the script needs unmodified baseline):
cp src/data/cards.js.backup-pre-redistribution-2026-05-11 src/data/cards.js
# 3. Run the script:
node scripts/apply-redistribution.js
# 4. Re-wire cards.js (add import + RAW_CARDS rename + map at bottom)
# 5. Verify:
node scripts/verify-redistribution.js
```

## How to rollback Phase 2

```bash
cp src/data/cards.js.backup-pre-redistribution-2026-05-11 src/data/cards.js
rm src/data/cards-step2.js
```

`cards-imported.js` and `cards-imported-batch2.js` were never modified, so no restore needed.

---

# Batch 1 — Frequency-list vocabulary

**Script:** `scripts/import-cards.js`
**Output:** `src/data/cards-imported.js` (2801 cards, ids 1593–4393)

## What was imported

Vocabulary from 3 of 4 Anki source files in `sentence/`:
- `Freq 4000.txt` — frequency rank 1–4000 (used for stage assignment + English override)
- `ThaiFrequencyList.txt` — 2700 vocab with phonetic in HTML tone-class spans
- `thai 1000 words.txt` — 1000 vocab with proper diacritic phonetic

**Deferred:** `Thai.txt` (2190 sentences) — needs separate handling for word-by-word breakdowns.

## Stats

| Metric | Count |
|---|---|
| Source rows total | 7700 (vocab) + 2190 (sentences, deferred) |
| Unique Thai keys after merge | 3125 |
| Dupes vs existing `cards.js` | 324 (skipped) |
| Freq4000 entries skipped (no phonetic cross-ref) | 1611 |
| English overridden (tflist → freq4k common sense) | 1852 |
| Top-200 freq forced to stage 1 | 75 |
| Stage re-assigned by freq (`things` overflow) | 457 |
| **Phonetic-review flagged** (`// phReview: true`) | **1602** |
| **Final cards imported** | **2801** |

## Distribution

**By source**
- thai1000: 735
- tflist: 2066

**By category** (top → bottom)
| cat | count |
|---|---|
| things | 821 |
| verbs | 684 |
| adjectives | 603 |
| adverbs | 151 |
| grammar | 113 |
| people | 90 |
| time | 72 |
| pronouns | 51 |
| places | 38 |
| body | 36 |
| food | 29 |
| directions | 27 |
| weather | 27 |
| home | 19 |
| emotions | 12 |
| shopping | 7 |
| health | 6 |
| numbers | 6 |
| emergency | 5 |
| colors | 3 |
| fluency | 1 |

**By stage**
| stage | count |
|---|---|
| 1 (Survival) | 1064 |
| 2 (Food & Errands) | 821 |
| 3 (Transport) | 62 |
| 4 (Social) | 447 |
| 5 (Home) | 359 |
| 6 (Health) | 47 |
| 7 (Money/Admin) | 0 |
| 8 (Fluency) | 1 |

Stage 7 is empty because the freq lists don't carry specialized money/admin vocab. Stage 3 and 6 are light for the same reason. Stage 1–2 carry the bulk, which matches the speak-first design.

## Categorization rules applied

In priority order (first match wins):

1. **English-content overrides** — handles tflist's mis-tagged POS (e.g. `หาก` "if" tagged as Adjective)
   - Conjunctions (if, when, because, …) → `grammar`
   - Personal/relative pronouns (he, she, who, …) → `pronouns`
   - Time adverbs (now, then, already, …) → `time`
   - Quantifiers (many, some, every, …) → `adjectives` (NOT pronouns)
2. **POS tags** from source data → category map
3. **Keyword regex** on English (food, body, home, weather, …) → category
4. **Default** → `things`

## Stage rules applied

1. Base: `category → stage` via `STAGES[].cats` mapping
2. **Top-200 frequency override**: any rank ≤ 200 forced to stage 1 (essential basics)
3. **`things` freq override**: catch-all `things` cat re-staged by freq rank (≤500→s1, ≤1500→s2, ≤3000→s4, else s5) — prevents stage 5 (Home) overflow

## Phonetic conversion

| Source | Method | Quality |
|---|---|---|
| `thai 1000 words` | Used as-is (already in diacritic format) | ✓ canonical |
| `ThaiFrequencyList` | HTML `<span class="tone X">word</span>` → diacritic on first vowel | heuristic |
| `Freq 4000` | Cross-referenced from above two by Thai script | ✓ when match |

Tone class map: L→à, M→bare, H→á, F→â, R→ǎ.
Diacritic placed on first vowel of each space-separated word.

**`phReview: true`** comment added to any card where the converted phonetic contains a multi-vowel syllable (1602 cards). Diacritic placement on diphthongs/long vowels follows Paiboon convention but a small fraction may be slightly off vs. native intuition. Filter for these in the file to audit.

## Known issues / follow-ups

- **`acccording`** (3 c's) typo on `ตาม` — pre-existing in `Freq 4000.txt` source, not introduced. Sed-fix later if desired.
- **`พระ` (monk) → `pronouns`** — tflist tagged it Pronoun. Misclassified.
- **`things` cat still has 821 entries** — catch-all. Triage in-app over time.
- **1611 Freq 4000 entries dropped** for missing phonetic. Could revisit with a romanization library.
- **2190 sentences (Thai.txt) deferred.** Separate pass needed (extend WORD_LOOKUP, then derive sentence phonetic).

## Files changed

| File | Status |
|---|---|
| `src/data/cards.js` | Added `import` + `...IMPORTED_CARDS` spread (3-line diff) |
| `src/data/cards-imported.js` | **NEW** — 2801 auto-generated cards |
| `src/data/cards.backup-pre-import.js` | **NEW** — backup of cards.js immediately before edit |
| `src/data/cards.backup-2026-05-10.js` | Earlier same-day backup (kept for safety) |
| `scripts/import-cards.js` | **NEW** — re-runnable import script |

## How to re-run

```bash
node scripts/import-cards.js              # full import
node scripts/import-cards.js --limit 50   # sample
node scripts/import-cards.js --print      # also print sample to console
```

Re-running overwrites `cards-imported.js` only — `cards.js` is not touched.

## Rollback

```bash
cp src/data/cards.backup-pre-import.js src/data/cards.js
rm src/data/cards-imported.js
```

---

# Batch 2 — Pimsleur, Speak Like A Thai V1, Thai-Expressions-High-Beginner

**Script:** `scripts/import-cards-batch2.js`
**Output:** `src/data/cards-imported-batch2.js` (1306 cards, ids 4394–5699)

## What was imported

| File | Source rows | Kept | Dups | Notes |
|---|---|---|---|---|
| `Pimsleur Thai.txt` | 486 | 334 | 152 | Hand-curated lessons; phonetic uses Pimsleur romanization (NOT Paiboon) |
| `Speak Like A Thai Vol.1.txt` | 503 | 498 | 5 | Practical phrases; **no source phonetic** — derived via word-segmentation against existing 3446 cards |
| `Thai-Expressions-High-Beginner.txt` | 500 | 474 | 26 | Lesson-numbered expressions; phonetic in IPA-Paiboon hybrid, converted clean |

## Stats

| Metric | Count |
|---|---|
| **Final cards imported** | **1306** |
| New IDs | 4394 → 5699 |
| `phReview` flagged | 1274 |
| `phNeedsGen` flagged | 334 (cleared partial-segmentation phonetic + 2 unmatched + Pimsleur fallback) |
| `catReview` flagged (cat = `things`) | 21 |
| IPA leftover (Expressions) | 0 ✓ clean |

## Distribution

**By source**
- Pimsleur: 334
- SLAT: 498
- Expressions: 474

**By type**
- `'w'` words: 31
- `'p'` phrases: 171
- `'s'` sentences: 1104

**By stage**
| stage | count |
|---|---|
| 1 (Survival) | 74 |
| 2 (Food & Errands) | 234 |
| 3 (Transport) | 166 |
| 4 (Social) | 661 |
| 5 (Home) | 170 |
| 8 (Fluency) | 1 |

**Top categories**
- sentences-daily: 680 (catch-all for sentences)
- sentences-questions: 135
- time: 84, emotions: 54, sentences-self: 50, greetings: 49, food: 44, numbers: 41, people: 37
- Other categories: <30 each

## Conversion rules applied

### 1. Pimsleur phonetic normalization
- Strip apostrophes used for stress/syllable boundaries
- `ä` → `aa`, `ö` → `oe`, `ü` → `eu`
- ⚠️ **All 334 Pimsleur cards still flagged `phReview: true`** — Pimsleur's romanization system fundamentally differs from Paiboon (e.g. `pàird` vs Paiboon `bpàet`, `tahng` vs `taang`, `pêun` vs `phûean`, `grung-tâpe` vs `grung thêep`). They're readable but inconsistent with the rest of the app. **Needs full romanization standardization in a follow-up pass.**

### 2. SLAT phonetic via word-segmentation
- Built Thai → phonetic dictionary from existing 3446 cards (cards.js + cards-imported.js)
- For each SLAT phrase, longest-match-first segmentation against the dict
- **Full match (164 cards):** keep generated phonetic
- **Partial match (332 cards):** **cleared** the phonetic — partial is misleading. Marked `phNeedsGen: true` for proper generation later (e.g. via `pythainlp`).
- **No match (2 cards):** also `phNeedsGen: true`.
- **Notes column preserved** as `note:` field on the card (clarifications like `Same as "กำลังทำอะไร"` or `ถึง is added for emphasis.`).

### 3. Thai-Expressions IPA → Paiboon conversion
| IPA | Paiboon | Doubled (long vowel) |
|---|---|---|
| `ɔ` | `aw` | `ɔɔ` → `aaw` |
| `ɛ` | `ae` | `ɛɛ` → `aae` |
| `ə` | `oe` | `əə` → `oe` |
| `ʉ` | `eu` | `ʉʉ` → `eu` |
| `ʔ` | (drop) | — |

Tone diacritics (`àáâǎ`) preserved on first vowel of substitution. **0 IPA leftover** — all 474 cards converted clean.

### 4. Categorization tightening (applied to all 3 sources)
Polysemous English words now require contextual patterns to avoid mis-classification:
- **`like`** removed from `emotions` (was matching "Speak like a Thai", "I like X" as emotion). Food-context patterns retained: `like to eat / drink / try / order`, `like + food noun`.
- **`right`** removed from `directions` (was matching "That's right!"). Now requires directional phrase: `turn right`, `on the right`, `right side`, etc.
- **`cool`** removed from bare `weather` regex (was matching "It's awesome/super/cool!"). Now requires explicit weather noun: `cool weather/day/night/water`.
- **`now`** removed from bare `time` regex (was matching "for now", "from now on"). Now requires time-context phrase: `right now`, `just now`, `until now`, `now is`, etc.

### 5. Stage rules
- **Pimsleur:** parsed `Lesson N` from deck → `≤8 = s1, ≤16 = s2, ≤24 = s3, >24 = s4`
- **SLAT:** default `s4` (Social), `s8` only when note explicitly contains `informal|slang|colloquial|idiom`
- **Expressions:** parsed chapter prefix → `≤30 = s2, ≤60 = s3, ≤100 = s4, >100 = s5`

### 6. Type rules
- English contains `?` or `!` → `'s'` (sentence)
- ≥4 English words → `'s'`
- 1 word + Thai is single chunk → `'w'`
- Else → `'p'`

## Known issues / follow-ups

- **All 334 Pimsleur cards need romanization normalization** — Pimsleur's system uses non-Paiboon spellings. Recommend a dedicated pass to map `pàird → bpàet`, `tahng → taang`, etc.
- **334 cards have `phNeedsGen: true`** — primarily SLAT phrases. Recommend running these through `pythainlp` or similar to generate proper Paiboon phonetics.
- **21 cards in `things` catch-all** (`catReview: true`). Triage in-app or in a small follow-up pass.
- **Pimsleur source is multi-line TSV** — script uses a streaming parser that handles embedded newlines in quoted fields. If new Pimsleur exports follow the same format, it'll continue to work.

## Files changed

| File | Status |
|---|---|
| `src/data/cards.js` | Added second `import` + `...IMPORTED_CARDS_BATCH2` spread |
| `src/data/cards-imported-batch2.js` | **NEW** — 1306 auto-generated cards |
| `src/data/cards.backup-pre-batch2.js` | **NEW** — backup of cards.js immediately before batch 2 wiring |
| `scripts/import-cards-batch2.js` | **NEW** — re-runnable import script |

## How to re-run

```bash
node scripts/import-cards-batch2.js              # full import
node scripts/import-cards-batch2.js --limit 50   # sample (round-robin from all 3 sources)
node scripts/import-cards-batch2.js --print      # also print sample to console
```

Re-running overwrites `cards-imported-batch2.js` only — `cards.js` is not touched.

## Rollback (batch 2 only)

```bash
cp src/data/cards.backup-pre-batch2.js src/data/cards.js
rm src/data/cards-imported-batch2.js
```

This restores cards.js to the post-batch1 state (4752 → 3446 cards) without touching batch 1.
