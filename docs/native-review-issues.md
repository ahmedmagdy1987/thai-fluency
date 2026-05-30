# Tuk Talk Thai — Native Review Issue Tracker

_A running log of items a native speaker / owner flags during review. Last updated: May 30, 2026._

## How to use this tracker

- One row per flagged item. Most reviewed items will be **Approved** and never
  need a row here — only log things that need a fix, a decision, or a discussion.
- **Status:** `open` → `decided` → `applied` (or `wontfix`).
- **Issue type:** `thai-naturalness` · `english-meaning` · `phonetic` ·
  `token-boundary` · `tile-order` · `too-advanced` · `polite-form` ·
  `builder-awkward` · `topic-mismatch` · `other`.
- **Recommended action / Final decision:** one of the master-checklist decisions —
  Approved · Needs wording fix · Remove sentence builder · Keep sentence but no
  builder · Needs native rewrite later · Unsure.
- Card Thai / phonetic / English are copied here only for convenience; **the source
  of truth is the card data, which this review never changes.** Applying a "fix"
  later is a developer task done against the unit/builder metadata, not the cards.

## Issues

| Status | Stage | Unit ID | Card ID | Issue type | Current Thai | Current phonetic | Current English | Reviewer note | Recommended action | Final decision |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| _template_ | _N_ | _stage-N-unit-id_ | _card id_ | _issue-type_ | _ก…_ | _phaa…_ | _English…_ | _what's wrong / suggestion_ | _one of the decisions_ | _(filled when decided)_ |
| _template_ | 4 | stage-4-example | 1234 | tile-order | (example only) | (example) | (example) | EXAMPLE ROW — delete me. Shows how to log a tile-order problem. | Needs wording fix | — |
| _template_ | 5 | stage-5-example | 5678 | builder-awkward | (example only) | (example) | (example) | EXAMPLE ROW — delete me. Shows how to log "show sentence, drop builder". | Keep sentence but no builder | — |
| open | 6 | stage-6-communication-verbs | 913 | topic-mismatch | ขอเพิ่มหน่อยครับ | khǎw phôem nàwy khráp | May I have some more (male) | Flagged medium-confidence at build time: the request builder sits with communication verbs (explain/confirm/promise). Confirm pairing or drop builder. | Unsure | — |
| open | 7 | stage-7-feelings-reactions | 878 | topic-mismatch | ขอบคุณสำหรับทุกอย่าง | khàwp khun sǎm-ràp thúk yàang | Thanks for everything | Flagged medium-confidence: "thanks for everything" shown with feeling words; not literally about them. Confirm or keep sentence without builder. | Unsure | — |
| open | 7 | stage-7-everyday-actions | 938 | topic-mismatch | พาผมไปที่นี่ได้ไหม | phaa phǒm bpai thîi nîi dâai mǎi? | Can you take me here? (male) | Flagged medium-confidence: taxi request shown with general action verbs. 6-token builder — confirm it's not too long for the level. | Unsure | — |
| open | 8 | stage-8-decisions-verbs | 823 | topic-mismatch | ผมอยากไปที่นั่น | phǒm yàak bpai thîi nân | I want to go there (male) | Flagged medium-confidence: want/intent builder shown with decision verbs (consider/decide/analyze). Confirm or drop builder. | Unsure | — |

## Notes
- The four `open` rows above are **the only items already documented** during the
  Course Structure Sprint (the "medium confidence" pairings in the stage matrices).
  Everything else is awaiting first review — add rows as you go.
- Polite-form note: most builders use the male polite form (ผม / ครับ). If the
  reviewer wants neutral/female alternatives, log one `polite-form` row per affected
  unit (or a single blanket decision here).
