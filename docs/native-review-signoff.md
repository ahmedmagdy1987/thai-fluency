# Native review sign-off — reviewer instructions & worklist

**Reviewer of record: Tuk Talk Thai — Internal Thai Review Team.**
Defined once as `REVIEWER_OF_RECORD` in `src/lib/reviewStatus.js` and stamped onto
every approved item's `reviewedBy`.

**Approved today: 0 of 4,792 cards and 0 of 60 Dating phrases.** The sign-off
manifest is empty. That is the correct state, not a backlog bug — it means nothing
has had its draft badge removed without a native vouching for the Thai.

## How to approve something

**Adding an entry to `src/data/nativeReviewSignoff.js` IS the act of approval.**
It is not a request, not a ticket, not a note that approval happened elsewhere. The
entry is the decision. There is no other path to `approved` anywhere in the app.

```js
export const NATIVE_REVIEW_SIGNOFF = Object.freeze({
  situations: Object.freeze({
    'sit-greet': { signedOffAt: '2026-07-15' },   // covers every card tagged sit-greet
  }),
  dating: null,
  cards: Object.freeze({
    5001: { signedOffAt: '2026-07-15' },          // one card; wins over its situation entry
  }),
});
```

`signedOffAt` is the date **you** reviewed it (`YYYY-MM-DD`). It is copied verbatim
onto the card's `reviewedAt` — it is never the build date.

Then run `node scripts/check-situation-review.mjs` and
`node scripts/check-content-approval.mjs`.

> **Never add an entry on someone else's behalf.** Not because a card "looks fine",
> not because the validators pass, not because a batch was probably reviewed. An
> entry claims a named human read the Thai and vouched for it. Adding one for them
> forges that claim invisibly: an approved card ships with the draft badge
> **removed**, so a learner cannot tell a vouched word from a guessed one. If you
> are an agent or a script, you may not write in that file.

## Why a structural check can't do this for you

Approval is the intersection of two independent things:

```
approved  ⟺  (you signed off its scope)  AND  (it clears the eligibility floor)
```

The eligibility floor is four **structural completeness** gates: non-empty `ph`, not
quarantined, no internal contradiction, not flagged needs-review.

**Not one of those gates reads the Thai.** A card can have a perfectly well-formed
romanization, a clean note, and no flags — and still be the wrong word. Catching that
is exactly what your review is for and exactly what the machine cannot see.

So eligibility is a **necessary precondition, never evidence**. Your sign-off is the
evidence. Eligibility can only ever **withhold** an approval you granted; it can never
grant one. Sign off on an ineligible item and it stays unapproved — deliberately.
`scripts/check-content-approval.mjs` drives that intersection with synthetic cards on
every run, so it is proven even while nothing is approved.

## What is currently ineligible, and why

Counts computed from the live deck (`ALL_CARDS` = 4,792; free deck `CARDS` = 4,780).

| Gate | Free deck | Whole deck | Meaning |
|---|---|---|---|
| Empty `ph` | **323** | **335** | No romanization → no tone at all → nothing to sign off *on*. |
| Flagged needs-review | **84** | **96** | An open question already recorded against the item. |
| Quarantined (C3) | — | **7** | Suspected-corrupt Thai. Excluded from the free deck entirely. |
| Mature (18+) | — | **5** | Gated; all 5 also have an empty `ph`. |
| **Held, free deck** | **362** | | 323 + 84 minus **45** cards that are *both*. |
| **Eligible, awaiting your sign-off** | **4,418** | 4,418 | Structurally complete. **Not approved** — no one has signed off. |

Those 4,418 are the anti-derivation case: every one is eligible, and every one is
still `pending`, because eligibility is not evidence.

**Quarantine is the contradiction gate.** For main-deck cards there is no separate
"contradiction" check to run — the quarantine set *is* the corrupted-Thai /
field-contradicts-its-own-note group (`claude-review.md` C3, ids in
`src/data/contentFlags.js`): **4756, 4959, 5002, 5074, 5084, 5151, 5216**. Their Thai
must be corrected before a `ph` is authored — see the warning in
[`empty-phonetics-review-list.md`](./empty-phonetics-review-list.md).

The 323 empty-`ph` cards are each triaged in
[`docs/empty-phonetics-review-list.md`](./empty-phonetics-review-list.md) — that is
the authoring worklist. A `ph` must be authored there before those cards can become
eligible for sign-off here. Nothing may synthesize one.

### Eligible cards by situation (free deck)

Sign off a whole situation with one `situations` entry.

| Situation | Tagged | Eligible | Held: empty `ph` | Held: needs-review |
|---|---|---|---|---|
| `sit-smalltalk` | 304 | 272 | 28 | 9 |
| `sit-food` | 179 | 159 | 20 | 0 |
| `sit-greet` | 127 | 123 | 4 | 0 |
| `sit-pharmacy` | 110 | 104 | 6 | 0 |
| `sit-directions` | 107 | 104 | 2 | 1 |
| `sit-money` | 101 | 96 | 4 | 1 |
| `sit-housing` | 97 | 88 | 7 | 3 |

The other 3,755 free-deck cards are not yet tagged to any situation (only the 7
"adequate pool" situations are tagged today — `src/data/situationTags.js`). They can
only be signed off per-card via the `cards` map until they are tagged.

`sit-greet` is the smallest useful first scope: 127 cards, 123 eligible.

## 🚫 The Dating pack is BLOCKED — phrase 90058 is the gating item

**Do not add a `dating` entry to the manifest yet. It will be refused.**

Phrase **90058** (`บ้าจริง`, `src/data/datingPhrases.js:905-932`) is
`reviewStatus:'needs-review'`. Its severity is **your open call**: the entry read
`'strong'` while its own gloss ("mild frustration"), its own note ("Mild
'ugh/darn'-level") and its quiz explanation ("far softer than a real curse") all read
mild. Three surfaces said mild, one said strong. It was moved to `'moderate'` to end
the contradiction, but that is a **safety-relevant label on unreviewed content**, so
the final severity is yours to confirm.

Why that one phrase blocks all 60:

1. 90058 is flagged, so it is ineligible → it can never be approved as-is.
2. So the pack is at best **59/60** → never 100% → `DATING_REVIEW_COMPLETE`
   (`src/data/datingContent.js:175`) can **never honestly flip** to `true`.
3. `scripts/check-dating-quiz.mjs:130` asserts *no phrase claims approval while
   `DATING_REVIEW_COMPLETE` is false*.
4. So approving the other 59 would **break that gate** — the very check that keeps
   the pack honest.

The resolution is **not** to weaken the gate or flip the flag. It is to **confirm
90058's severity first**. The whole pack unblocks with it:

- Confirm the severity → 90058 clears `needs-review` → all 60 become eligible →
  a `dating` sign-off entry + flipping `DATING_REVIEW_COMPLETE` then agree, and
  `:130` passes untouched.

Until then the system **fails closed**: a `dating` entry added early approves
nothing, and `scripts/check-content-approval.mjs` fails loudly rather than let the
gate break.

## What flips when you sign off

| Surface | Flips? | Why |
|---|---|---|
| A card's `reviewStatus` → `approved`, draft badge drops | **Yes**, per signed-off + eligible card | Stamped in the `src/data/cards.js` export pipeline. |
| `SITUATION_REVIEW_COMPLETE[sit]` | **No — separate, manual** | A per-situation flag in `reviewStatus.js`, flipped by hand. A manifest entry does not flip it. |
| `situationReadiness(sit)` → `'ready'` | Only after **both** | Needs the flag flipped **and** ≥ 8 approved vocab + ≥ 1 approved sentence. |
| `DATING_REVIEW_COMPLETE` | **No — blocked** | Cannot honestly flip while 90058 is flagged. See above. |

## Files

| File | Role |
|---|---|
| `src/data/nativeReviewSignoff.js` | **The manifest. You edit this. Nothing else grants approval.** |
| `src/lib/reviewStatus.js` | `REVIEWER_OF_RECORD`, the vocabulary, the approval rule. |
| `src/data/cards.js` | Reads the manifest, applies the eligibility floor, stamps approval. |
| `scripts/check-content-approval.mjs` | Proves the intersection on synthetic cards. |
| `scripts/check-situation-review.mjs` | "Nothing ineligible is approved"; no orphan approvals. |
| `docs/empty-phonetics-review-list.md` | The 335 empty-`ph` authoring worklist. |
