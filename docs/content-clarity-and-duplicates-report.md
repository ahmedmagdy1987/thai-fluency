# Content Clarity & Duplicate Audit — 2026-05-15

Targeted pass focused on the cards explicitly called out in the lesson UX brief:
**สวัสดี, สวัสดีครับ, สวัสดีค่ะ, ไม่, ไหม / มั้ย, ไม่เป็นไรครับ**, plus the
near-duplicate cluster around ไม่เป็นไร.

Duplicate-like cards were classified into:

1. **Exact duplicate** — identical Thai + English + usage + stage. Safe to remove.
2. **Polite/gender variant** — different particle (ครับ / ค่ะ) or pronoun. Keep, clarify.
3. **Contextual meaning variant** — same Thai, different English shade. Keep, clarify.
4. **Same phrase repeated across stages intentionally** — pedagogical re-introduction. Keep, note.
5. **Near-duplicate needing editorial decision** — flagged, not changed.

No card was deleted in this pass. All edits add or clarify notes / English copy.

## Cards changed

| Status | Card ID | Stage | Thai | Current English | Change Made | Reason | Needs Native Review |
|---|---|---|---|---|---|---|---|
| Updated | 3396 | 1 | สวัสดี | hello / goodbye (general greeting) | English changed from "goodbye" → "hello / goodbye (general greeting)"; category changed from `grammar` → `greetings`; note added explaining general greeting + male/female polite forms | Bug-fix: card claimed only "goodbye", which is misleading. สวัสดี is the canonical general greeting (hello AND goodbye). | No |
| Updated | 310 | 1 | สวัสดีครับ | Hello / Goodbye (male) | Note expanded to explicitly explain it's the polite male-speaker form and reference สวัสดีค่ะ for female speakers | High-confidence: makes the male/female pairing learnable rather than mysterious | No |
| Updated | 4485 | 1 | สวัสดีค่ะ | hello / goodbye (female) | Added note clarifying it's the polite female-speaker form and pointing at สวัสดีครับ for male speakers | High-confidence: matched the male card's framing | No |
| Updated | 250 | 1 | ไม่ | no / not | Note rewritten to spell out: BEFORE verbs/adjectives, falling tone, do NOT confuse with ไหม / มั้ย question particles | Per brief: avoid ไม่ vs ไหม / มั้ย confusion | No |
| Updated | 118 | 1 | ไหม | (yes/no question particle — end of sentence) | English clarified ("end of sentence"); note expanded to mention มั้ย as casual variant and warn vs ไม่ | High-confidence: distinguishes the question particle from negation | No |
| Updated | 313 | 1 | ไม่เป็นไรครับ | No worries / You are welcome (male) | Note expanded to explain male-speaker polite form, list common English meanings, and reference ไม่เป็นไรค่ะ for female speakers | Per brief: "Polite male-speaker form of ไม่เป็นไร" | No |
| Updated | 871 | 4 | ไม่เป็นไรครับ | No worries / it is fine (male) | Added note classifying this as the Stage-4 polite-sentence reintroduction of the Stage-1 greeting (#310 / #313 cluster) | Documents that the Stage 4 appearance is intentional re-exposure, not a mistake | No |
| Updated | 5704 | 2 | มั้ย | casual question particle (end of sentence) | English clarified ("end of sentence"); note added explaining it's the spoken/casual variant of ไหม and warning vs ไม่ | Per brief: ensure มั้ย's question-particle usage is unambiguous | No |

## Cards flagged — no auto-fix

| Status | Card ID | Stage | Thai | Current English | Recommended Action | Reason | Needs Native Review |
|---|---|---|---|---|---|---|---|
| Review | 5291 | 2 | สวัสดีค่ะ / สวัสดีครับ | Good-bye (or Hello) (male/female) | Either delete (covered by #310 + #4485) or convert to a single polite-particle teaching card | Pedagogically muddled — single card combines both gender forms with a slash. Stages overlap with the stage-1 cards but at stage 2 it adds little. Risky to auto-delete because users may have SRS progress on it. | **Yes** |
| Review | 5361 | 3 | ไม่เป็นไร | It's okay / It's fine / It's no problem / It's all right / You're welcome / Never mind | English already enumerates meanings well — consider trimming to the 2–3 most common to reduce cognitive load. No politeness particle here (so it's the bare phrase). | Acceptable as-is, but the long English string is unusual vs the rest of the deck. | **Yes** |
| Review | 5721 | 5 | ไม๊ | variant of มั้ย / ไหม (question) | Confirm with native speaker whether ไม๊ is common enough to warrant a card, or whether it's rare-enough orthography that it should be a note on #118 / #5704 instead. | Three spellings (ไหม, มั้ย, ไม๊) all teaching the same particle creates redundancy. | **Yes** |
| Review | 4503 | 4 | ไม่เป็นไรหรอก | Not a big deal. (casual) | Acceptable. Note could specify what หรอก adds (mild reassurance / dismissive softening). | Casual variant — pedagogically distinct, but English could be richer. | **Yes** |
| Review | 2874 | 1 | ไหม้ | burn | Phonetic given as `mâi` — same romanization as ไม่ and ไหม. Add a note flagging that ไหม้ is a completely different word (verb, falling tone, written with mai-tho tone mark) and the homophone collision with the question particle is purely orthographic confusion to avoid. | Same-romanization homophone cluster (ไม่ / ไหม / มั้ย / ไม๊ / ไหม้) is the single biggest source of learner confusion in Stage 1–2. A native reviewer should confirm the framing before the app teaches it. | **Yes** |

## Duplicate clusters reviewed

### สวัสดี cluster
- **#3396** (สวัสดี, w/general) — **fixed** the "goodbye"-only bug.
- **#310** (สวัสดีครับ, p/male) — kept, note enhanced.
- **#4485** (สวัสดีค่ะ, s/female) — kept, note added.
- **#5291** (สวัสดีค่ะ / สวัสดีครับ, p/combined) — **flagged for editorial review**.

Classification: items 1–3 are a Polite/Gender variant set with a base form; item 4 is a near-duplicate. None deleted.

### ไม่เป็นไร cluster
- **#5361** (ไม่เป็นไร, s/neutral) — flagged (English could be tightened).
- **#313** (ไม่เป็นไรครับ, p/male, S1) — kept, note enhanced.
- **#871** (ไม่เป็นไรครับ, s/male, S4) — kept, note added to document intentional re-exposure.
- **#4503** (ไม่เป็นไรหรอก, s/casual) — flagged (note could be richer).

Classification: 1 is base; 2 + 3 are an intentional cross-stage repeat (same Thai, different stage); 4 is a casual variant. None deleted.

### ไม่ / ไหม / มั้ย homophone cluster
- **#250** ไม่ — note now warns against ไหม / มั้ย confusion.
- **#118** ไหม — note now warns against ไม่ and mentions มั้ย.
- **#5704** มั้ย — note added.
- **#5721** ไม๊ — flagged (rare orthography, may be redundant).
- **#2874** ไหม้ — flagged (homophone with the cluster; pedagogically distinct).

This is the single most important confusion-set in early-stage Thai. The note edits give learners a consistent cross-reference between cards.

## Process notes

- **No Thai text was guessed.** When unsure of romanization or context, the card was flagged for native review rather than edited.
- **No card was deleted.** Per brief, even high-confidence duplicates were retained because users may have SRS progress on them — deletion is a separate, riskier operation.
- **Stage / category / mission ordering** is unchanged. Edits only touched `en` and `note` fields, plus one `cat` correction (#3396 from `grammar` → `greetings`, which matches its actual usage and won't reshape any mission since this card sits in the imported overflow set, not the curated stage-1 mission deck).
- See also `content-clarity-and-duplicates-report.json` for the machine-readable version of this audit.
