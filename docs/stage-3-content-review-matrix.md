# Stage 3 — Content Review Matrix (for owner / native-speaker review)

Date: May 30, 2026

This matrix lists every Stage 3 guided mini-unit and its sentence-builder so a
native speaker can **approve or flag** the wording and tokenization. No Thai card
content was changed — all units reference existing Stage 3 cards, and every
builder's tokens were derived from the source sentence card's own phonetic via
the app's `WORD_LOOKUP` / `autoBreakdown` (so the token phonetics reconstruct the
card phonetic exactly; nothing was invented). Verified by
`scripts/check-mini-units.mjs` against the **runtime** `CARDS` (the composed set,
not the inline `RAW_CARDS` in `cards.js`).

- **Stage 3 total cards:** 423 (theme: *Getting Around* / deep vocabulary)
- **Coverage before this pass:** 16 vocab cards (2 units)
- **Coverage after this pass:** 96 vocab cards (12 units)
- **Sentence builders:** 9 of 12 units (all 3-token, auto-derived)

## A note on theming
Stage 3's clean vocabulary is dominated by single-syllable **verbs (75)**,
**adjectives (77)**, and **"things"/nouns (63)**; the literal "Getting Around"
sub-themes the taxonomy suggests (transport, directions, hotel, travel verbs)
have very few clean cards at this stage (places = 3, transport nouns ≈ 4). Rather
than force unrelated cards under invented theme labels, units group the cleanest,
most teachable cards into coherent sets: people/family, three everyday-verb
batches, two describing/quality sets, time & sequence, connectors & particles,
home & places, and animals. This is a known limitation documented below — the
remaining ~327 Stage 3 cards stay available in Practice and Stage Challenge.

## How to review
For each unit, confirm: (a) the vocab cards belong together / are useful at this
level, (b) the sentence + English meaning read naturally, (c) the builder tiles
split the sentence at correct Thai word boundaries. Mark anything to change in
the **Notes** column.

## Units (the 2 pre-existing units are included for completeness)

| Unit ID | Title | Topic | Vocab card IDs | Sentence card | Thai | Phonetic | English | Builder tokens (thai) | Token phonetics | Confidence | Needs native review |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| stage-3-daily-verbs | Daily verbs | verbs | 38, 47, 48, 49, 52, 54, 501, 511 | 821 | ผมอยากนอน | phǒm yàak nawn | I want to sleep (male) | ผม · อยาก · นอน | phǒm · yàak · nawn | high | yes |
| stage-3-describing-things | Describing things | adjectives | 62, 64, 82, 84, 85, 89, 92, 1624 | 804 | ผมร้อนครับ | phǒm ráwn khráp | I am hot (male) | ผม · ร้อน · ครับ | phǒm · ráwn · khráp | high | yes |
| stage-3-people-family | People and family | people | 194, 195, 196, 198, 2788, 2836, 2964, 2359 | 840 | คุณชื่ออะไร | khun chûe àrai? | What is your name? | คุณ · ชื่อ · อะไร | khun · chûe · àrai | high | yes |
| stage-3-everyday-verbs-1 | Everyday verbs I | verbs | 513, 1675, 2107, 2139, 2288, 2398, 2659, 3004 | 4729 | ทำอะไรอยู่ | tham àrai yùu | What are you doing? | ทำ · อะไร · อยู่ | tham · àrai · yùu | high | yes |
| stage-3-everyday-verbs-2 | Everyday verbs II | verbs | 2441, 2726, 2904, 2912, 3247, 3296, 3614, 4068 | 4767 | ทำไปทำไม | tham bpai tham mai | Why are you doing that? | ทำ · ไป · ทำไม | tham · bpai · tham mai | medium | yes |
| stage-3-everyday-verbs-3 | Everyday verbs III | verbs | 2376, 2421, 2474, 2582, 2602, 2987, 3178, 5723 | 819 | ผมลืมแล้ว | phǒm luem láew | I forgot already (male) | ผม · ลืม · แล้ว | phǒm · luem · láew | high | yes |
| stage-3-describing-things-2 | Describing things II | adjectives | 1758, 2017, 2042, 2468, 2899, 3166, 3669, 5729 | 803 | ผมง่วงครับ | phǒm ngûang khráp | I am sleepy (male) | ผม · ง่วง · ครับ | phǒm · ngûang · khráp | high | yes |
| stage-3-qualities-states | Qualities and states | adjectives | 1613, 1793, 1809, 3022, 3097, 3123, 3169, 5716 | 810 | ผมยุ่งครับ | phǒm yûng khráp | I am busy (male) | ผม · ยุ่ง · ครับ | phǒm · yûng · khráp | high | yes |
| stage-3-time-sequence | Time and sequence | time | 220, 254, 296, 1602, 2177, 2529, 2580, 2852 | 4749 | เดี๋ยวมา | dǐaao maa | I'll be right back | (no builder) | — | n/a | yes (sentence wording) |
| stage-3-connectors-particles | Connectors and particles | grammar/particles | 293, 295, 1617, 1619, 4037, 5719, 5720, 5728 | 817 | ผมไม่เข้าใจ | phǒm mâi khâo jai | I do not understand (male) | ผม · ไม่ · เข้าใจ | phǒm · mâi · khâo jai | high | yes |
| stage-3-home-places | Home and places | places/home | 160, 1719, 2601, 2080, 3403, 1000, 2631, 1021 | 1500 | แอร์เสีย | ae sǐa | The AC is broken | (no builder) | — | n/a | yes (sentence wording) |
| stage-3-animals | Animals | things/animals | 2598, 3066, 2696, 3318, 2789, 3467, 3519, 2583 | — | — | — | — | (no builder) | — | n/a | no |

### Notes per unit
- **People and family:** ยาย (2359) is filed in the card data under the
  "adjectives" category but means "grandmother"; it is grouped here for semantic
  coherence. Confirm the kinship set (mother/father/friend/doctor/uncle/paternal
  grandmother/grandfather/grandmother) is the set you want first.
- **Everyday verbs II (4767 "ทำไปทำไม"):** marked medium — the middle tile ไป/bpai
  is the directional "away/off" particle here, not literally "to go". Confirm the
  English "Why are you doing that?" and the 3-way split read naturally.
- **Describing things II (803 "ผมง่วงครับ"):** the builder's feeling word ง่วง
  (sleepy) is itself a vocab card in this unit (3669) — a deliberate reinforcement.
- **Time and sequence:** sentence 4749 "เดี๋ยวมา" is shown for context (เดี๋ยว/soon
  is a vocab card here) but has **no builder** — it is 2 tokens, too short to
  arrange. Several Stage 3 nouns/adverbs here are abstract (กาล era, คราว/หน
  occasion); flag any you would rather drop.
- **Connectors and particles:** mixes connectors (but/if/by/therefore) with casual
  sentence-final particles (น่ะ/อ่ะ/เนอะ/ซิ). Confirm those casual particles are
  desired at this level.
- **Home and places:** sentence 1500 "แอร์เสีย" is shown for context (แอร์/air-con
  and พัง/broken are vocab cards here) but has **no builder** — its phonetic does
  not split cleanly into known `WORD_LOOKUP` pieces.
- **Animals:** vocab-only (no clean Stage 3 animal sentence exists). ปู (2583) is
  "crab" here (the card data lists it under the verb category, but the English is
  "crab").

## Skipped sentence-builder candidates (Stage 3)

These Stage 3 sentence/phrase cards were **not** turned into builders. They are
still available as normal cards (Practice / Stage Challenge). Stage 3 has 111
sentence/phrase cards; only 12 produced a clean, safe 3+-token breakdown (10 of
which are now used as builders; the remaining clean ones below are too short).

| Card ID | Thai | Phonetic | English | Skip reason |
| --- | --- | --- | --- | --- |
| 829 | ไม่เอาครับ | mâi ao khráp | No thanks (male) | Clean but no themed unit fit (food/refusal not a Stage 3 unit) |
| 911 | ไม่อร่อยเลย | mâi aròi loei | It is not good at all | Clean but no themed unit fit (no Stage 3 food/taste unit) |
| 5553 | อยากกินอีก | yàak gin ìik | I want to eat it again | Clean but no themed unit fit (no Stage 3 food/eating unit) |
| 856 | ทำไมครับ | tham mai khráp? | Why? (male) | 2 tokens — too short to arrange |
| 4749 | เดี๋ยวมา | dǐaao maa | I'll be right back | 2 tokens — shown as the Time unit's sentence, no builder |
| 5239 | พูดเล่นนะ | pûut-lên ná | I'm joking! | 2 tokens — too short |
| 5290 | ไม่เข้าใจ | mâi-kâo-jai | I don't understand | Written as one phonetic token; ไม่เข้าใจ has no internal split here |
| 1500 | แอร์เสีย | ae sǐa | The AC is broken | Shown as the Home unit's sentence; phonetic does not split into known pieces |
| (≈98 others) | various | — | various | Did not produce a clean `WORD_LOOKUP` breakdown (idiomatic, long, female-voice, or unknown inner words) — deferred until reviewed |

## Outcome wanted
Please mark each "Needs native review" row **approved** or **change**, and note
any wording/tokenization fixes. Approved builders stay; flagged ones can be
demoted to sentence-shown-only (drop `sentenceBuilder`) without changing any card
data. Once approved, this pattern can be reused to deepen Stage 4 next.
