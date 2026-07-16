// ─────────────────────────────────────────────────────────────────────────────
// SITUATION TAGGING OVERLAY — a side map, NEVER a content fork.
//
// The as-built deck groups cards by part of speech inside a stage (taxonomy.js
// CATEGORIES / STAGES), not by real-world situation. FOUNDATION README §2
// restores the situation-first intent as a NEW TAGGING LAYER over the existing
// cards. Rather than edit the 4,791 cards to add a `situation` field (which would
// churn check-mini-units / verify-voice-flip / verify-no-gender-mismatch across
// the whole deck for zero pedagogical gain — curriculum.md §1), this overlay maps
// each EXISTING taxonomy category to a canonical situation id.
//
// A card therefore belongs to a situation via its existing `cat` field alone:
// this file contains ZERO Thai — only category ids and situation ids. Every card
// stays byte-identical.
//
// SCOPE (Pass 2): only the ~7 "adequate raw pool" situations are tagged today
// (curriculum.md §4.2 tier 1) — the ones with enough taggable candidates that the
// work is re-tag/re-unit/re-review, not authoring. The category → situation map
// is 1:1 (each category maps to exactly ONE situation), which is unambiguous for
// these 7 because none of them share a category.
//
// KNOWN LIMITATION (documented, deferred): several LATER situations share a
// single category pool — `sit-store`, `sit-market`, and `sit-money` all want the
// one `shopping` pool (43 cards); `sit-transport` wants context from
// `directions`/`places` which already belong to `sit-directions`. A pure
// category→situation map cannot express that overlap. Disambiguating them needs
// per-cardId tagging or an authored inline `situation` field on new cards
// (curriculum.md §4.2 "shared pools still need disjoint tagging"). Until then,
// `shopping` is assigned to `sit-money` (its highest-`base` claimant among the
// ready set), and `sit-store`/`sit-market` remain untagged ("thin" tier).
//
// New AUTHORED cards do NOT need an entry here — they carry a `situation` field
// inline, and situationOf() prefers that field over this overlay.
// ─────────────────────────────────────────────────────────────────────────────

// taxonomy.js category id  →  canonical FOUNDATION §2 situation id.
// Only the 7 "ready" (adequate-pool) situations are populated in Pass 2.
export const SITUATION_CATEGORY_TAGS = Object.freeze({
  // sit-greet  (127 cards)
  greetings: 'sit-greet',
  pronouns: 'sit-greet',
  intro: 'sit-greet',

  // sit-food  (179 cards)
  food: 'sit-food',
  'food-phrases': 'sit-food',
  'sentences-food': 'sit-food',
  'sentences-want': 'sit-food',

  // sit-money  (102 cards)  — owns `shopping` for now (see KNOWN LIMITATION)
  numbers: 'sit-money',
  shopping: 'sit-money',

  // sit-directions  (107 cards)
  directions: 'sit-directions',
  places: 'sit-directions',

  // sit-smalltalk  (306 cards)
  'sentences-self': 'sit-smalltalk',
  people: 'sit-smalltalk',
  emotions: 'sit-smalltalk',
  'sentences-social': 'sit-smalltalk',

  // sit-housing  (97 cards)
  home: 'sit-housing',
  'sentences-home': 'sit-housing',

  // sit-pharmacy  (110 cards)
  health: 'sit-pharmacy',
  body: 'sit-pharmacy',
  'sentences-health': 'sit-pharmacy',
});

// ─────────────────────────────────────────────────────────────────────────────
// PER-CARD SITUATION TAGS (Wave 7) — the per-cardId layer the KNOWN LIMITATION
// above anticipated. Still a SIDE MAP, never a content fork: card ids → situation
// id, ZERO Thai, every card byte-identical.
//
// The category overlay above tags whole part-of-speech categories that map 1:1 to
// a situation. But the deck's big pools — `things` (concrete + abstract nouns),
// `sentences-daily` (mostly grammar/function output), `sentences-questions` — are
// MIXED: a handful of cards in each clearly belong to a situation (taxi→transport,
// medicine→pharmacy, rent→housing) while most are cross-cutting foundational vocab
// with no single-situation home. A category tag cannot express that split, so
// those individually-routable cards are tagged here by id instead.
//
// These ids were classified by ENGLISH MEANING ONLY (Wave 7 tagging pass) — no
// Thai authored, nothing approved. A newly-tagged card inherits its EXISTING
// reviewStatus (almost all `pending`); tagging is not review. situationOf() reads
// this map (id) BEFORE the category overlay (cat), so a per-card tag is the more
// specific decision and wins. Every id here was previously UNTAGGED — none
// overrides an already-tagged or approved card.
//
// The ~3,450 cards NOT here stayed untagged ON PURPOSE: abstract nouns (process,
// system, government), bare adjectives/adverbs (good, very), pure grammar/function
// words, time words, colors — foundational vocabulary used across ALL situations.
// Forcing them into one situation would be a lie; untagged is the honest result.
export const SITUATION_CARD_TAGS = Object.freeze({
  // sit-greet (23)
  840:'sit-greet', 870:'sit-greet', 871:'sit-greet', 872:'sit-greet', 873:'sit-greet', 876:'sit-greet', 877:'sit-greet', 878:'sit-greet', 879:'sit-greet', 896:'sit-greet',
  897:'sit-greet', 898:'sit-greet', 899:'sit-greet', 1794:'sit-greet', 3877:'sit-greet', 4417:'sit-greet', 4492:'sit-greet', 4493:'sit-greet', 4592:'sit-greet', 5269:'sit-greet',
  5345:'sit-greet', 5412:'sit-greet', 5511:'sit-greet',
  // sit-store (3)
  1131:'sit-store', 1569:'sit-store', 2345:'sit-store',
  // sit-food (29)
  894:'sit-food', 1707:'sit-food', 3258:'sit-food', 3320:'sit-food', 3368:'sit-food', 3438:'sit-food', 3521:'sit-food', 3664:'sit-food', 3724:'sit-food', 3739:'sit-food',
  3747:'sit-food', 3752:'sit-food', 3756:'sit-food', 3757:'sit-food', 3819:'sit-food', 3852:'sit-food', 4261:'sit-food', 4425:'sit-food', 4426:'sit-food', 4551:'sit-food',
  4573:'sit-food', 4636:'sit-food', 4637:'sit-food', 5281:'sit-food', 5405:'sit-food', 5446:'sit-food', 5447:'sit-food', 5449:'sit-food', 5535:'sit-food',
  // sit-money (13)
  176:'sit-money', 177:'sit-money', 850:'sit-money', 3033:'sit-money', 4543:'sit-money', 4630:'sit-money', 4645:'sit-money', 4662:'sit-money', 4663:'sit-money', 4690:'sit-money',
  4879:'sit-money', 4880:'sit-money', 5359:'sit-money',
  // sit-transport (34)
  174:'sit-transport', 175:'sit-transport', 930:'sit-transport', 931:'sit-transport', 932:'sit-transport', 933:'sit-transport', 935:'sit-transport', 938:'sit-transport', 1858:'sit-transport', 2360:'sit-transport',
  2450:'sit-transport', 2665:'sit-transport', 3451:'sit-transport', 3720:'sit-transport', 3738:'sit-transport', 3744:'sit-transport', 3869:'sit-transport', 3882:'sit-transport', 3971:'sit-transport', 3982:'sit-transport',
  4452:'sit-transport', 4504:'sit-transport', 4706:'sit-transport', 4707:'sit-transport', 4708:'sit-transport', 4711:'sit-transport', 4800:'sit-transport', 4837:'sit-transport', 4860:'sit-transport', 5284:'sit-transport',
  5694:'sit-transport', 5695:'sit-transport', 5724:'sit-transport', 5737:'sit-transport',
  // sit-directions (13)
  852:'sit-directions', 853:'sit-directions', 934:'sit-directions', 4405:'sit-directions', 4406:'sit-directions', 4407:'sit-directions', 4554:'sit-directions', 4713:'sit-directions', 4716:'sit-directions', 5360:'sit-directions',
  5566:'sit-directions', 5675:'sit-directions', 5691:'sit-directions',
  // sit-market (3)
  893:'sit-market', 1591:'sit-market', 1592:'sit-market',
  // sit-smalltalk (74)
  600:'sit-smalltalk', 601:'sit-smalltalk', 602:'sit-smalltalk', 603:'sit-smalltalk', 604:'sit-smalltalk', 605:'sit-smalltalk', 606:'sit-smalltalk', 607:'sit-smalltalk', 841:'sit-smalltalk', 842:'sit-smalltalk',
  844:'sit-smalltalk', 845:'sit-smalltalk', 846:'sit-smalltalk', 847:'sit-smalltalk', 848:'sit-smalltalk', 890:'sit-smalltalk', 891:'sit-smalltalk', 1971:'sit-smalltalk', 2004:'sit-smalltalk', 2548:'sit-smalltalk',
  3500:'sit-smalltalk', 3644:'sit-smalltalk', 3697:'sit-smalltalk', 3831:'sit-smalltalk', 3835:'sit-smalltalk', 3950:'sit-smalltalk', 4076:'sit-smalltalk', 4422:'sit-smalltalk', 4445:'sit-smalltalk', 4525:'sit-smalltalk',
  4556:'sit-smalltalk', 4557:'sit-smalltalk', 4588:'sit-smalltalk', 4589:'sit-smalltalk', 4590:'sit-smalltalk', 4595:'sit-smalltalk', 4598:'sit-smalltalk', 4624:'sit-smalltalk', 4650:'sit-smalltalk', 4651:'sit-smalltalk',
  4655:'sit-smalltalk', 4687:'sit-smalltalk', 4695:'sit-smalltalk', 4698:'sit-smalltalk', 4703:'sit-smalltalk', 4727:'sit-smalltalk', 5301:'sit-smalltalk', 5347:'sit-smalltalk', 5349:'sit-smalltalk', 5350:'sit-smalltalk',
  5352:'sit-smalltalk', 5353:'sit-smalltalk', 5374:'sit-smalltalk', 5378:'sit-smalltalk', 5381:'sit-smalltalk', 5383:'sit-smalltalk', 5384:'sit-smalltalk', 5470:'sit-smalltalk', 5479:'sit-smalltalk', 5480:'sit-smalltalk',
  5529:'sit-smalltalk', 5541:'sit-smalltalk', 5573:'sit-smalltalk', 5579:'sit-smalltalk', 5587:'sit-smalltalk', 5591:'sit-smalltalk', 5610:'sit-smalltalk', 5633:'sit-smalltalk', 5635:'sit-smalltalk', 5636:'sit-smalltalk',
  5688:'sit-smalltalk', 5689:'sit-smalltalk', 5690:'sit-smalltalk', 5698:'sit-smalltalk',
  // sit-housing (5)
  2631:'sit-housing', 3216:'sit-housing', 3445:'sit-housing', 3518:'sit-housing', 3592:'sit-housing',
  // sit-pharmacy (20)
  436:'sit-pharmacy', 437:'sit-pharmacy', 438:'sit-pharmacy', 3351:'sit-pharmacy', 3372:'sit-pharmacy', 3532:'sit-pharmacy', 3547:'sit-pharmacy', 3571:'sit-pharmacy', 3755:'sit-pharmacy', 3988:'sit-pharmacy',
  4895:'sit-pharmacy', 4947:'sit-pharmacy', 4994:'sit-pharmacy', 4995:'sit-pharmacy', 5197:'sit-pharmacy', 5204:'sit-pharmacy', 5501:'sit-pharmacy', 5502:'sit-pharmacy', 5619:'sit-pharmacy', 5668:'sit-pharmacy',
  // sit-work (15)
  843:'sit-work', 892:'sit-work', 1599:'sit-work', 1628:'sit-work', 2045:'sit-work', 2448:'sit-work', 2613:'sit-work', 2629:'sit-work', 2756:'sit-work', 4871:'sit-work',
  5080:'sit-work', 5090:'sit-work', 5091:'sit-work', 5102:'sit-work', 5646:'sit-work',
  // sit-admin (43)
  1100:'sit-admin', 1101:'sit-admin', 1102:'sit-admin', 1103:'sit-admin', 1104:'sit-admin', 1105:'sit-admin', 1106:'sit-admin', 1107:'sit-admin', 1108:'sit-admin', 1109:'sit-admin',
  1110:'sit-admin', 1111:'sit-admin', 1112:'sit-admin', 1113:'sit-admin', 1114:'sit-admin', 1115:'sit-admin', 1116:'sit-admin', 1117:'sit-admin', 1118:'sit-admin', 1119:'sit-admin',
  1120:'sit-admin', 1121:'sit-admin', 1122:'sit-admin', 1123:'sit-admin', 1124:'sit-admin', 1125:'sit-admin', 1126:'sit-admin', 1127:'sit-admin', 1128:'sit-admin', 1129:'sit-admin',
  1130:'sit-admin', 1132:'sit-admin', 1560:'sit-admin', 1561:'sit-admin', 1562:'sit-admin', 1563:'sit-admin', 1564:'sit-admin', 1565:'sit-admin', 1566:'sit-admin', 1567:'sit-admin',
  1568:'sit-admin', 1849:'sit-admin', 2071:'sit-admin',
  // sit-emergency (20)
  430:'sit-emergency', 431:'sit-emergency', 432:'sit-emergency', 433:'sit-emergency', 434:'sit-emergency', 435:'sit-emergency', 439:'sit-emergency', 874:'sit-emergency', 875:'sit-emergency', 939:'sit-emergency',
  2663:'sit-emergency', 2993:'sit-emergency', 3223:'sit-emergency', 3816:'sit-emergency', 3838:'sit-emergency', 4653:'sit-emergency', 4688:'sit-emergency', 4759:'sit-emergency', 5108:'sit-emergency', 5290:'sit-emergency',
  // sit-formal (1)
  1898:'sit-formal',
});
