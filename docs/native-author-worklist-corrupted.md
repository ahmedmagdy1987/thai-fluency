# Native Author Worklist — Corrupted Thai (7 quarantined cards)

**Generated:** 2026-07-16 · regenerate with `node scripts/write-native-author-worklists.mjs`
**Scope:** the 7 cards quarantined for corrupted Thai (contentFlags.js QUARANTINED_CARD_IDS).
Each has a structural **diagnosis** — the corruption TYPE, NOT a corrected guess. Fill `correctedThai`
AND `ph` in `docs/native-author-worklist-corrupted.json`, then ingest with
`node scripts/ingest-native-authoring.mjs docs/native-author-worklist-corrupted.json`.

These cards are held out of the free deck (quarantined) and stay `needs-review` until fixed.
Fix the Thai here BEFORE authoring their phonetics on the phonetics worklist.

| id | English | current (corrupted) Thai | diagnosis | hardest? | correctedThai | ph |
| --- | --- | --- | --- | --- | --- | --- |
| 4756 | I'm indebted to him (male) | `ผมเป็นหนี้บุคุณเขา` | **inserted/garbled syllable** — The cluster "บุคุณ" is not a standard word. Likely either "บุญคุณ" (a debt of gratitude — a ญ dropped) or a stray "บุ" before "คุณ". AMBIGUOUS — two plausible targets; the reviewer decides which the sentence intends. | YES | | |
| 4959 | He just left | `เขาเพึ่งจะไป` | **wrong vowel diacritic** — "เพึ่ง" carries สระอึ (U+0E36) where สระอิ (U+0E34) is expected — a single-vowel typo. The card's own note already records the intended reading "เขาเพิ่งจะไป"; confirm and apply. |  | | |
| 5002 | What should I do then? | `แล้วทีนี้่จะทำยังไง` | **double / stacked tone mark** — "นี้่" stacks BOTH ไม้โท (U+0E49) and ไม้เอก (U+0E48) on the same syllable — an invalid double tone mark. One must be removed; confirm which tone is intended. |  | | |
| 5074 | I will tell you the truth | `จะเล่าคามจริงให้ฟัง` | **dropped consonant** — "คาม" is missing a ว — the intended word for "truth/matter" in "เล่า___จริง" is "ความ". Supply the corrected script. |  | | |
| 5084 | I'm trying to gather money | `พยยามรวบรวมเงิน` | **dropped vowel** — "พยยาม" is missing a สระอา — the verb "to try" is "พยายาม". Supply the corrected script. |  | | |
| 5151 | "I have to finish it quickly” | `ต้องรีบท` | **truncation** — The Thai ends on an orphan "ท" ("ต้องรีบท") — the sentence is cut off mid-word. NO CLEAR TARGET: what "finish it quickly" was meant to say cannot be recovered from the fragment; the reviewer must re-author the full phrase from the English. | YES | | |
| 5216 | To tell a secret | `เปิเเผยความลับ` | **mojibake (เเ for แ) + dropped consonant** — Two U+0E40 (เเ) appear where a single แ (U+0E41) belongs, and a ด is missing — "เปิเเผย" for the intended "เปิดเผย" (to reveal). Supply the corrected script. |  | | |

**Hardest two** (flagged): **5151** (truncated — no clear target, must re-author from the English) and **4756** (ambiguous — บุญคุณ vs a stray syllable).