// Propose mission categorization for the 150 Stage 1 cards. Writes
// STAGE_1_MISSIONS.md for user review.

import { CARDS } from '../src/data/cards.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');

const s1 = CARDS.filter(c => c.stage === 1);

// Explicit mission assignments by id (handle special cases first).
// 1 = First Words, 2 = At the Restaurant, 3 = Getting Around,
// 4 = Numbers & Prices, 5 = Feelings & Needs, 6 = Review Challenge
const FORCED = {
  // ---- M1 essentials ----
  1: 1, 2: 1, 3: 1, 4: 1, 5: 1,         // ผม, ครับ, คุณ, เขา, เรา
  1712: 1, 4034: 1,                      // ฉัน, ค่ะ
  250: 1, 251: 1, 5703: 1,              // ไม่, ใช่, ไม่ใช่
  100: 1, 1273: 1, 5709: 1,             // มาก, นะ, เหรอ
  310: 1, 312: 1, 313: 1, 314: 1, 330: 1, // 5 greeting/intro essential sentences
  3396: 1, 2815: 1, 3254: 1, 5361: 1,   // สวัสดี, ขอบคุณ, ขอโทษ, ไม่เป็นไร
  5702: 1, 1661: 1, 4540: 1,            // เจอกัน, ชื่อ, ภาษาไทย

  // ---- M2 At the Restaurant: food + eating verbs + wants ----
  15: 2,    // กิน eat
  91: 2,    // หิว hungry
  22: 2,    // อยาก want to
  23: 2,    // เอา take/want
  20: 2,    // ชอบ like
  135: 2,   // ชา tea
  60: 2,    // ดี good (delicious-adjacent)
  73: 2,    // ถูก cheap
  1666: 2,  // ขอ ask for (ordering)
  51: 2,    // ลอง try
  4087: 2,  // โอ small bowl
  24: 2,    // ให้ give/for (give me food)

  // ---- M3 Getting Around: movement verbs, places, "where" ----
  112: 3, 1772: 3, 118: 3,          // ที่ไหน, ไหน, ไหม
  164: 3, 853: 3,                    // ห้องน้ำ + Where bathroom?
  174: 3, 1615: 3, 277: 3,           // รถ, ทาง, ที่ at-classifier
  13: 3, 14: 3,                      // ไป, มา
  515: 3, 1600: 3, 1611: 3, 1830: 3, // ลง, ถึง, ตาม, พา
  58: 3, 59: 3, 43: 3,               // หา, เจอ, รอ
  2223: 3,                           // รีบ hurry
  111: 3,                            // ใคร who (asking who)
  110: 3,                            // อะไร what

  // ---- M4 Numbers & Prices ----
  116: 4, 117: 4,                    // เท่าไหร่, กี่
  410: 4, 850: 4,                    // sentences: How much?, How much is this?
  5701: 4,                           // อันนี้ this one (price context)
  1746: 4,                           // ลด reduce/discount
  221: 4, 1633: 4, 2983: 4, 1742: 4, 1847: 4, // ปี, วัน, โมง, ตรง o'clock, สาย late
  1044: 4,                           // ของ thing/belongings
  4528: 4, 4397: 4,                  // ไม่ได้, ไม่ได้ครับ (can't afford)
  1673: 4,                           // มัน it

  // ---- M5 Feelings & Needs: communication, cognition, help ----
  33: 5, 431: 5,                     // เข้าใจ + I don't understand
  430: 5,                            // Help!
  5700: 5,                           // I can't speak Thai
  29: 5, 30: 5,                      // พูด, ฟัง
  34: 5, 35: 5, 26: 5, 28: 5,        // จำ, ลืม, รู้, คิด
  17: 5,                             // นอน sleep
  57: 5,                             // ช่วย help
  25: 5,                             // ได้ can/able (capability)
  1218: 5,                           // แรง strong
  74: 5,                             // สวย beautiful
  1706: 5,                           // ใจ mind
  605: 5,                            // ลม wind
  2250: 5,                           // คา stuck
  3177: 5,                           // โทร call
  560: 5, 561: 5, 562: 5, 566: 5, 567: 5, 573: 5, 2562: 5, // body parts
  1218: 5,                           // already

  // ---- M6 Review Challenge: connector particles + filler vocab ----
  108: 6,                            // ก็
  103: 6, 104: 6, 1276: 6, 1277: 6,  // เลย, จัง, เลย-emph, จัง-emph
  1273: 6,                           // นะ (moved out of M1 — already a forced M1, keep that)
  10: 6, 11: 6, 12: 6, 510: 6,       // เป็น, อยู่, มี, อยู่-dup (state verbs)
  18: 6, 19: 6,                      // ดู, ทำ
  508: 6,                            // จบ finish
  2664: 6, 3615: 6,                  // ปา throw (rare), ยอ flatter (rare)
};

// Auto-fill remaining cards by category heuristics
const CAT_DEFAULT_MISSION = {
  greetings: 1, intro: 1, pronouns: 1,
  questions: 3,
  directions: 3, places: 3,
  food: 2, 'food-phrases': 2, 'sentences-food': 2,
  shopping: 4, numbers: 4, time: 4,
  body: 5, emergency: 5, health: 5, emotions: 5,
  weather: 5,
  fluency: 6, grammar: 6,
  verbs: 6,                         // default any unforced verb to M6
  adjectives: 6,                    // default unforced adj to M6
  adverbs: 6,
  things: 6, home: 6, people: 1,
  'sentences-questions': 3, 'sentences-daily': 6, 'sentences-self': 5
};

function autoMission(c) {
  if (FORCED[c.id]) return FORCED[c.id];
  return CAT_DEFAULT_MISSION[c.cat] || 6;
}

// Build mission buckets
const buckets = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
for (const c of s1) {
  const m = autoMission(c);
  buckets[m].push(c);
}

// Target sizes: M1=25, M2=28, M3=27, M4=27, M5=28, M6=15
const targets = { 1: 25, 2: 28, 3: 27, 4: 27, 5: 28, 6: 15 };

console.log('Initial counts:', Object.fromEntries(Object.entries(buckets).map(([k, v]) => [k, v.length])));
console.log('Targets:        ', targets);

// Two-way rebalancer: shift non-forced cards from oversize → undersize buckets.
function rebalance() {
  for (let pass = 0; pass < 30; pass++) {
    const counts = Object.fromEntries(Object.entries(buckets).map(([k, v]) => [k, v.length]));
    let over = null, under = null;
    for (const m of [1, 2, 3, 4, 5, 6]) {
      if (counts[m] > targets[m] + 1 && (!over || counts[m] - targets[m] > counts[over] - targets[over])) over = m;
      if (counts[m] < targets[m] - 1 && (!under || targets[m] - counts[m] > targets[under] - counts[under])) under = m;
    }
    if (!over || !under) break;
    // Move a non-forced card from over → under
    const movable = buckets[over].filter(c => !FORCED[c.id]);
    if (movable.length === 0) break;
    // Pick the highest-id (later in deck = generally less core)
    movable.sort((a, b) => b.id - a.id);
    const card = movable[0];
    buckets[over] = buckets[over].filter(c => c.id !== card.id);
    buckets[under].push(card);
  }
}
rebalance();

console.log('After rebalance:', Object.fromEntries(Object.entries(buckets).map(([k, v]) => [k, v.length])));

// Generate markdown
const NAMES = {
  1: 'First Words: Hello & Survival',
  2: 'At the Restaurant',
  3: 'Getting Around',
  4: 'Numbers & Prices',
  5: 'Feelings, Needs & Help',
  6: 'Mini Review Challenge'
};
const GOALS = {
  1: 'Be polite, identify yourself, basic yes/no. After this mission you can greet, thank, apologize, say your name, and say no/yes.',
  2: 'Order food and drinks. Express wants ("I want", "I like"). Basic taste vocabulary. After this you can survive at any food vendor.',
  3: 'Ask where things are, get a taxi, navigate locations. After this you can find your hotel, ask for the bathroom, get on/off transport.',
  4: 'Ask "how much", understand prices, talk about time and quantity. After this you can shop and negotiate.',
  5: 'Express feelings, ask for help, talk about needs. After this you can say "I don\'t understand", "Help!", "I\'m tired", and get unstuck in any situation.',
  6: 'Review challenge. Mix of the most useful S1 fluency words and connectors to lock in mastery before unlocking Stage 2.'
};
const CELEBRATIONS = {
  1: '🎉 You spoke your first Thai words! ผมเริ่มต้นแล้ว — "I\'ve begun." Mission 2 unlocked.',
  2: '🍜 You can order food! Try it at the next restaurant — ask for ชา (tea) and see what happens. Mission 3 unlocked.',
  3: '🛺 You can find your way! Next tuk-tuk ride: try ห้องน้ำอยู่ที่ไหน. Mission 4 unlocked.',
  4: '💰 You can bargain! เท่าไหร่ครับ → ลดได้ไหม. You\'re now dangerous at any market. Mission 5 unlocked.',
  5: '❤️ You can ask for help! ช่วยด้วย, ผมไม่เข้าใจ, ผมพูดภาษาไทยไม่ได้ — three lifelines, mastered. Mission 6 unlocked.',
  6: '👑 Survival Thai complete! You can handle real Thailand. The full path is now unlocked — 4,752 cards await.'
};

const lines = [];
const push = (l = '') => lines.push(l);

push('# Stage 1 Missions — Categorization Proposal');
push('');
push(`Generated by \`scripts/propose-missions.js\`. Splits the 150 Survival Thai cards into 6 progressive missions.`);
push('');
push('## Summary');
push('');
push('| Mission | Name | Cards | Target |');
push('|---:|---|---:|---:|');
let total = 0;
for (let m = 1; m <= 6; m++) {
  push(`| ${m} | ${NAMES[m]} | ${buckets[m].length} | ${targets[m]} |`);
  total += buckets[m].length;
}
push(`| **Total** | | **${total}** | **150** |`);
push('');

push('## Unlock criteria');
push('');
push('- **Mission 1**: unlocked by default for new users');
push('- **Missions 2-6**: unlocked when the previous mission is 80% mastered (matches the existing stage-complete threshold of 80% in `src/lib/state.js`)');
push('- A mission card counts as "mastered" when its SRS interval ≥ 21 days (same definition as stage mastery)');
push('');
push('## Distribution of the 10 essential survival sentences');
push('');
const essentialIds = [310, 312, 313, 314, 330, 5700, 850, 853, 430, 431];
push('| Essential | Lands in | Reason |');
push('|---|---|---|');
const essentialMission = {
  310: 'M1', 312: 'M1', 313: 'M1', 314: 'M1', 330: 'M1',
  850: 'M4', 853: 'M3', 5700: 'M5', 430: 'M5', 431: 'M5'
};
const essentialReason = {
  310: 'Hello — first greeting',
  312: 'Thank you very much — core politeness',
  313: 'You\'re welcome — paired response',
  314: 'Sorry / Excuse me — core politeness',
  330: 'My name is — intro context',
  850: 'How much is this? — shopping/numbers',
  853: 'Where is the bathroom? — directions',
  5700: 'I can\'t speak Thai — communication need',
  430: 'Help! — emergency need',
  431: 'I don\'t understand — communication need'
};
for (const id of essentialIds) {
  const c = CARDS.find(x => x.id === id);
  if (!c) continue;
  push(`| ${c.thai} (${c.en}) | ${essentialMission[id]} | ${essentialReason[id]} |`);
}
push('');

push('## Mission contents (full card lists)');
push('');
for (let m = 1; m <= 6; m++) {
  push(`### Mission ${m}: ${NAMES[m]}  (${buckets[m].length} cards)`);
  push('');
  push(`**Goal**: ${GOALS[m]}`);
  push('');
  push(`**Celebration on completion**: ${CELEBRATIONS[m]}`);
  push('');
  push('| id | type | cat | thai | ph | en |');
  push('|---:|---|---|---|---|---|');
  const sorted = buckets[m].slice().sort((a, b) => {
    const tOrder = { p: 0, s: 1, w: 2, g: 3 };
    if (tOrder[a.type] !== tOrder[b.type]) return tOrder[a.type] - tOrder[b.type];
    return a.id - b.id;
  });
  for (const c of sorted) {
    push(`| ${c.id} | ${c.type} | ${c.cat} | ${c.thai} | ${c.ph || ''} | ${(c.en || '').replace(/\|/g, '\\|').slice(0, 60)} |`);
  }
  push('');
}

push('## Cards I flagged as weak fits (need your judgment)');
push('');
push('These cards landed in topical missions only because the rebalancer needed to fill quotas. Several feel out-of-place. Options: (a) accept loose placement, (b) move to M6 review, (c) flag for content review (some of these may not belong in S1 at all — they were placed by the redistribution algorithm based on difficulty score, not topic).');
push('');
push('| id | thai | en | currently in | concern |');
push('|---:|---|---|---:|---|');
const WEAK_FITS = [
  { id: 1628, in: 'M2', concern: 'งาน job — not food-related' },
  { id: 1663, in: 'M2', concern: 'เอง only/alone — too abstract' },
  { id: 1690, in: 'M2', concern: 'ละ each — particle, fits M6' },
  { id: 1698, in: 'M2', concern: 'ลูก kid — fits M1 (people) or M6' },
  { id: 1796, in: 'M2', concern: 'ตาย die — emergency, fits M5' },
  { id: 1874, in: 'M2', concern: 'นา rice farm — too rare for S1' },
  { id: 2001, in: 'M2', concern: 'สม suitable — too abstract for S1' },
  { id: 2368, in: 'M2', concern: 'สด live/fresh — could be M2 (fresh food) but rare' },
  { id: 2805, in: 'M2', concern: 'คม sharp — doesn\'t belong in S1 IMO' },
  { id: 4033, in: 'M2', concern: 'คะ — female polite particle, fits M1 with ค่ะ' },
  { id: 1274, in: 'M2', concern: 'สิ urging particle — fits M6' },
  { id: 3023, in: 'M2', concern: 'รึ or — fits M6' },
  { id: 2417, in: 'M2', concern: 'ไง how/what — fits M3 (question)' },
  { id: 1684, in: 'M4', concern: 'จริง true — not price-related' },
  { id: 1699, in: 'M4', concern: 'คง probably — not price-related' },
  { id: 1803, in: 'M4', concern: 'ตก fall — only fits if "price drops"' },
  { id: 2231, in: 'M4', concern: 'ผี ghost — doesn\'t belong in S1 at all' },
  { id: 1652, in: 'M4', concern: 'ผิด wrong — fits M5 (problem)' },
  { id: 1594, in: 'M4', concern: 'ว่า that/think — fits M6 (conjunction)' },
  { id: 2664, in: 'M6', concern: 'ปา throw — doesn\'t belong in S1 IMO' },
  { id: 3615, in: 'M6', concern: 'ยอ flatter — doesn\'t belong in S1 IMO' }
];
for (const w of WEAK_FITS) {
  const c = CARDS.find(x => x.id === w.id);
  if (!c) continue;
  push(`| ${w.id} | ${c.thai} | ${c.en} | ${w.in} | ${w.concern} |`);
}
push('');
push('My recommendation: accept the current placement for this session. Flag the 4-5 "doesn\'t belong in S1" cards (ปา, ยอ, ผี, คม, นา) for a future content pass. They\'re S1 only because the difficulty algorithm scored them as common, but topic-wise they\'re fillers.');
push('');

push('## Cards I flagged as ambiguous (genuine judgment calls)');
push('');
const ambiguous = [
  { id: 1666, options: 'M2 (ขอ "ask for" = ordering food) vs M3 (asking directions)', placed: 'M2' },
  { id: 17, options: 'M2 (basic verb) vs M5 (need = "I want to sleep")', placed: 'M5' },
  { id: 1746, options: 'M4 (ลด = price reduction) vs M2 (reducing food order)', placed: 'M4' },
  { id: 1633, options: 'M4 (วัน = day) vs M3 (when traveling)', placed: 'M4' },
  { id: 2983, options: 'M4 (โมง = hour) vs M3 (transit times)', placed: 'M4' },
  { id: 4540, options: 'M1 (ภาษาไทย — used in "I speak Thai") vs M5 (used in "I can\'t speak Thai")', placed: 'M1' },
  { id: 4528, options: 'M4 ("can\'t afford") vs M5 (general "can\'t")', placed: 'M4' },
  { id: 4397, options: 'Same as 4528', placed: 'M4' }
];
push('| id | thai | en | options | placed in |');
push('|---:|---|---|---|---|');
for (const a of ambiguous) {
  const c = CARDS.find(x => x.id === a.id);
  if (!c) continue;
  push(`| ${a.id} | ${c.thai} | ${c.en} | ${a.options} | ${a.placed} |`);
}
push('');

push('## Implementation plan (after your approval)');
push('');
push('1. Add `mission` property (1-6) to each S1 card via `STEP2_OVERRIDES` in `src/data/cards-step2.js`');
push('2. Define MISSIONS array in `src/data/taxonomy.js` (name, goal, celebration, unlock criteria)');
push('3. Add `getMissionState(stats, progress, missionId)` helper in `src/lib/state.js`');
push('4. UI: in S1, show current mission instead of stage progress in `TodayTab.jsx`');
push('5. Locked mission cards rendered with 🔒 + unlock requirement');
push('6. Mission complete modal — celebration screen');
push('7. Onboarding: hide "4,752" from new users until S1 complete');
push('');
push('All Stage 1 missions only use vocabulary that is itself in Stage 1, so the dependency rule is naturally satisfied within S1.');
push('');

fs.writeFileSync(path.join(REPO_ROOT, 'STAGE_1_MISSIONS.md'), lines.join('\n'), 'utf8');
console.log('Wrote STAGE_1_MISSIONS.md (' + lines.length + ' lines)');
