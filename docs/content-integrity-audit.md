# Content Integrity Audit

A full QA pass across **every learning card** in Tuk Talk Thai. Built in
response to a user-visible bug: phonetic strings like `thô:ht` rendered
with what looked like stacked dots / a colon-shaped artifact inside the
word.

## TL;DR

- **Total cards scanned:** 4,791 (every card in `CARDS`).
- **Total issues found:** 427.
- **High-confidence mechanical fixes applied:** 78
  (67 colon-in-phonetic strips + 11 multiple-space collapses).
- **Items left for manual / native-speaker review:** 349
  (334 already-known missing-phonetic placeholders + 14 duplicate Thai
  with conflicting EN/PH + 1 intentional Thai-in-English).
- **Stacked-dot / `thô:ht` issue:** **data, not rendering.** The colon
  was literally stored in the romanization (ASCII `:`, Paiboon-style
  length-mark artifact from a third-party import). All 67 instances
  have been normalized to the app's own romanization standard.
- **Build status:** ✅ `npm run build` passes.

## Files audited

| File | Cards (approx) | Notes |
| --- | --- | --- |
| `src/data/cards.js` | 502 | Hand-curated S1–S8 plus the splice/override pipeline. |
| `src/data/cards-imported.js` | 2,801 | Auto-generated from three Thai frequency-list TXT files. **Source of the colon artifact.** |
| `src/data/cards-imported-batch2.js` | 1,306 | Auto-generated from Pimsleur / Speak Like A Thai / High-Beginner expression TXT files. |
| `src/data/cards-step2.js` | 182 additions + overrides | Stage redistribution + missions overrides. |
| **Total reachable via `CARDS` export:** | **4,791** | After overrides applied. |

Backup files (`*.backup-*.js`) were ignored — they are historical snapshots that no longer feed the build.

## What the audit script checks

`scripts/audit-content-integrity.mjs` is reusable. Re-run any time with
`node scripts/audit-content-integrity.mjs`. It scans every reachable
card and flags:

1. **Phonetic typography**
   - ASCII colon `:` (Paiboon length mark)
   - IPA length mark `ː` (U+02D0)
   - Double colon `::`
   - Multiple consecutive spaces
   - Leading/trailing whitespace
2. **Invisible characters**
   - Zero-width: U+200B, U+200C, U+200D, U+2060, U+FEFF
   - NBSP (U+00A0)
   - Standalone combining marks at the start of a string
3. **Script mixing**
   - Thai script (U+0E00..U+0E7F) inside the phonetic or English field
   - Latin letters inside the Thai field (only flagged when the field is mostly Thai)
4. **Duplicates / conflicts**
   - Same Thai with conflicting English
   - Same Thai with conflicting romanization
   - Duplicate card IDs
5. **Missing fields**
   - Empty Thai / English / phonetic
   - Phonetic placeholder flags (`phNeedsGen`, `phReview`, etc.)
6. **Card breakdowns** (the per-word splits attached to some sentences)
   - Colon-in-phonetic
   - IPA length mark

Findings are written to `docs/content-integrity-findings.json` (a
machine-readable companion to this report).

## Was the `thô:ht` issue data or rendering?

**Data.** Confirmed by grepping the source. The same ASCII colon
appeared verbatim in `cards-imported.js`:

```
{id:2167,thai:"โทษ",ph:"thô:ht",en:"blame; punish",...}
{id:2725,thai:"ลงโทษ",ph:"lohng thô:ht",en:"punish",...}
{id:3254,thai:"ขอโทษ",ph:"khǎaw thô:ht",en:"sorry",...}
{id:3673,thai:"โธ่",ph:"thô:h",en:"what a pity",...}
```

This is a Paiboon-style romanization convention where `:` is a vowel
length mark and `h` is a glide hint, both used together to render Thai
`โ` syllables. The app's own romanization standard — visible across
`src/data/cards.js` — never uses a colon:

| App-style examples | Foreign-style equivalents (broken) |
| --- | --- |
| `rohng raem` (โรงแรม, hotel) | `ro:hng raem` |
| `thoh-rá-sàp` (โทรศัพท์, phone) | `tho:h-rá-sàp` |
| `gròht` (โกรธ, angry) | `grò:ht` |
| `chôhk dee` (โชคดี, good luck) | `chô:hk dee` |

The fix is purely mechanical: **strip the colon character.** The
preceding `h` already encodes the long-vowel sound in the app's
convention. No Thai script, no English, no tone marks are touched.

## Issues by category (before / after)

| Category | Before | Fixed | After | Disposition |
| --- | ---: | ---: | ---: | --- |
| `colon-in-phonetic` | 67 | 67 | 0 | Auto-fixed (strip `:`). |
| `multiple-spaces` | 11 | 11 | 0 | Auto-fixed (collapse to single space + trim). |
| `thai-script-in-english` | 1 | 0 | 1 | Intentional. Card 5721 explains "variant of มั้ย/ไหม". |
| `missing-phonetic` | 334 | 0 | 334 | Pre-existing known state. Cards flagged `phNeedsGen` in source. UI renders "phonetic coming soon" placeholder; user is not shown garbage. Listed for manual completion. |
| Duplicate Thai with conflicting EN/PH | 14 | 0 | 14 | See § Duplicates below — editorial decisions needed. |
| Duplicate card IDs | 0 | 0 | 0 | None. |
| Zero-width / NBSP / IPA length / leading-mark / repeated tone-mark / non-string / double-colon | 0 | 0 | 0 | None — the data is clean on these axes. |

## Examples — before / after

### colon-in-phonetic (data fix)

| Card | Thai | EN | Before | After |
| --- | --- | --- | --- | --- |
| 2167 | โทษ | blame; punish | `thô:ht` | `thôht` |
| 2725 | ลงโทษ | punish | `lohng thô:ht` | `lohng thôht` |
| 3254 | ขอโทษ | sorry | `khǎaw thô:ht` | `khǎaw thôht` |
| 3673 | โธ่ | what a pity | `thô:h` | `thôh` |
| 1714 | โอกาส | chance | `o:h gàat` | `oh gàat` |
| 2823 | โชคดี | good luck | `chô:hk dee` | `chôhk dee` |

All 67 fixes follow the same one-to-one transform.

### multiple-spaces (data fix)

| Card | Field | Before | After |
| --- | --- | --- | --- |
| 2046 | en | `be quite good;··not bad` | `be quite good; not bad` |
| 5394 | en | `What's in it? / What's in this? /··What's in here?` | `What's in it? / What's in this? / What's in here?` |
| 5692 | ph | `(…)··yùu sáai-meu` | `(…) yùu sáai-meu` |

(`··` denotes the literal two-space run that was collapsed.)

## Items left for manual / native-speaker review

### A. Duplicate Thai with conflicting English (12 cases — homophones / variants)

Same Thai string is taught twice with different English. Most are
legitimate homophones (Thai has many) — they may want a `note:` field
to disambiguate, but are not data errors. Flagging here for the owner
to triage.

| Thai | IDs | English variants |
| --- | --- | --- |
| ผม | 1, 573 | "I / me (male)" vs "hair" — homophone, both correct. |
| อยู่ | 11, 510 | "to be at / to live / to stay" vs "to stay" |
| เย็น | 65, 217 | "cool / cold (drinks/AC)" vs "evening (4-6pm)" — homophone, both correct. |
| เลย | 103, 1276 | "really / so / at all" vs "really / at all (emphatic)" |
| จัง | 104, 1277 | "so / very (casual)" vs "really / so much (casual)" |
| คน | 190, 270 | "person" vs "classifier:people" — both correct. |
| หลัง | 297, 572 | "after" vs "back" — homophone, both correct. |
| ไม่เป็นไรครับ | 313, 871 | "No worries / You are welcome (male)" vs "No worries / it is fine (male)" |
| อันนี้คืออะไรครับ | 351, 916 | "What is this? (male)" vs "What is this dish? (male)" |
| อร่อยมากครับ | 354, 910 | "Very delicious (male)" vs "It is very delicious (male)" |
| ผมอิ่มแล้วครับ | 356, 806 | "I am full (male)" vs "I am full (already) (male)" |
| มีไหมครับ | 414, 851 | "Do you have (it)? (male)" vs "Do you have (any)? (male)" |

**Recommendation:** For homophones (ผม, เย็น, คน, หลัง), keep both
cards but add `note:` clarifying the alternate meaning. For sentence
near-duplicates (313/871, 351/916, etc.), consider deleting one of each
pair to avoid memorization confusion. Not auto-fixed.

### B. Duplicate Thai with conflicting romanization (2 cases — real inconsistency)

| Thai | IDs | Phonetic A | Phonetic B | Notes |
| --- | --- | --- | --- | --- |
| น้ำตาล | 520, 550 | `náam taan` | `náam-taan` | Hyphen vs space — minor style. App appears to prefer space-separated. Both English correct (sugar vs brown — homophone). |
| รู้สึก | 1759, 5722 | `róo sèuk` | `rúu sùek` | Different romanization schemes. The second (`rúu sùek`) matches the app's standard (`ǔ` long-vowel + final `èu`); the first is the foreign-import scheme. |

**Recommendation:**
- `น้ำตาล` — normalize both to `náam-taan` (matches the app's existing
  hyphenated compound nouns, e.g. `phá-yaa-baan` in `rohng phá-yaa-baan`).
- `รู้สึก` — replace `róo sèuk` (id 1759) with `rúu sùek` so the romanization
  matches the canonical version (id 5722).

Both require human confirmation before applying — not done in this pass.

### C. Missing phonetic placeholders (334 cases)

Already a known state — these cards carry empty `ph` fields plus a
`// phNeedsGen` comment in source. The lesson UI handles them
gracefully (renders "phonetic coming soon" instead of a blank line).
Listed in `docs/content-integrity-findings.json` for the import
pipeline owner to complete in a future pass.

### D. Intentional Thai-in-English (1 case)

| Card | Thai | EN |
| --- | --- | --- |
| 5721 | มั๊ย | "variant of มั้ย/ไหม (question)" |

This is deliberate disambiguation prose — the audit's heuristic missed
the `/`-separated form. No fix needed.

## How to re-run the audit

```bash
# Read-only scan — writes JSON, prints summary.
node scripts/audit-content-integrity.mjs

# Apply mechanical fixes (colons + multiple spaces).
node scripts/apply-content-integrity-fixes.mjs            # dry-run
node scripts/apply-content-integrity-fixes.mjs --write    # write to disk

# After fixes, re-run the audit to confirm.
node scripts/audit-content-integrity.mjs
```

The apply-fixes script is idempotent — running it twice on the same
input is a no-op the second time.

## What was NOT changed

- No Thai script edits.
- No semantic English edits (only whitespace collapse + trim).
- No tone marks added or removed.
- No card IDs renumbered.
- No card ordering changes.
- No `breakdown:` data altered (none of the 4,791 cards had colon-in-breakdown findings — checked).
- No UI / CSS / app-shell / character-coach / reward-system code touched.

## Limitations

- The audit checks **typographic and structural** integrity. It does
  not check that a romanization is phonetically correct against its
  Thai — that requires a native-speaker pass.
- "Intentional" Thai-in-English is detected only via heuristics
  (presence of `:` or `—`). Future false positives would need either a
  whitelist or richer language-detection.
- Imported-source files were the only place the colon artifact lived.
  If new content is imported from a Paiboon-style source in the
  future, re-run `scripts/audit-content-integrity.mjs` before
  shipping.
