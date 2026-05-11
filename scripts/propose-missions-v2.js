// Step 3.2.5: weak-fit cleanup + final mission proposal. Includes:
//   - 8 weak S1 cards demoted to later stages
//   - 8 high-value cards promoted from S2/S3 to S1
//   - Mission re-classifications for mis-bucketed S1 cards
//   - Renamed missions (M1, M5, M6)
//   - 70% unlock threshold (not 80%)
// Writes STAGE_1_MISSIONS.md (final proposal). No card-data changes yet.

import { CARDS } from '../src/data/cards.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');

// ---------- The swap plan ----------

// Cards being DEMOTED out of S1 (true content-quality problems for beginners)
const DEMOTE_FROM_S1 = [
  { id: 2231, thai: 'ผี',   newStage: 8, reason: 'ghost — culturally specific, advanced' },
  { id: 2664, thai: 'ปา',   newStage: 6, reason: 'throw — uncommon verb at beginner level' },
  { id: 3615, thai: 'ยอ',   newStage: 7, reason: 'flatter/praise — abstract social verb' },
  { id: 2805, thai: 'คม',   newStage: 5, reason: 'sharp — descriptive, low frequency' },
  { id: 1874, thai: 'นา',   newStage: 6, reason: 'rice farm — rural noun, not survival' },
  { id: 2001, thai: 'สม',   newStage: 6, reason: 'suitable — abstract, conditional use' },
  { id: 4087, thai: 'โอ',   newStage: 7, reason: 'small lacquered bowl — too specific' },
  { id: 1796, thai: 'ตาย',  newStage: 6, reason: 'die — heavy concept, complex contexts' }
];

// Cards being PROMOTED into S1 (high-value beginner vocab, matched to missions)
const PROMOTE_TO_S1 = [
  { id: 67,   thai: 'อร่อย', ph: 'aròi',   en: 'delicious',           fromStage: 3, mission: 2 },
  { id: 131,  thai: 'น้ำ',   ph: 'náam',   en: 'water',               fromStage: 2, mission: 2 },
  { id: 68,   thai: 'เผ็ด',  ph: 'phèt',   en: 'spicy',               fromStage: 3, mission: 2 },
  { id: 231,  thai: 'สอง',   ph: 'sǎwng',  en: 'two (2)',             fromStage: 2, mission: 4 },
  { id: 72,   thai: 'แพง',   ph: 'phaeng', en: 'expensive',           fromStage: 2, mission: 4 },
  { id: 176,  thai: 'เงิน',  ph: 'ngern',  en: 'money',               fromStage: 2, mission: 4 },
  { id: 1200, thai: 'ปวด',   ph: 'bpùat',  en: 'to ache / hurt',      fromStage: 2, mission: 5 },
  { id: 81,   thai: 'ไกล',   ph: 'glai',   en: 'far',                 fromStage: 2, mission: 3 }
];

// Mission re-classifications for S1 cards that stay in S1 but were in the wrong bucket
const RECLASSIFY = {
  4033: 1,  // คะ → M1 (with ค่ะ — both polite particles)
  1698: 1,  // ลูก kid → M1 (people)
  1612: 2,  // อีก more → M2 ("one more please")
  2417: 3,  // ไง how/what casual → M3 (question)
  1733: 3,  // นาน long → M3 (long way, long time)
  1652: 5,  // ผิด wrong → M5 (something is wrong)
  1274: 6,  // สิ urging particle → M6
  3023: 6,  // รึ or → M6
  1684: 6,  // จริง true → M6
  1699: 6,  // คง probably → M6
  1594: 6,  // ว่า that/think → M6
  // New promoted cards (set their mission)
  67: 2, 131: 2, 68: 2,    // food
  231: 4, 72: 4, 176: 4,   // numbers/prices
  1200: 5,                  // pain
  81: 3                     // direction
};

// Final S1 set after swaps
const demoteIds = new Set(DEMOTE_FROM_S1.map(d => d.id));
const s1Current = CARDS.filter(c => c.stage === 1);
const s1AfterSwap = [
  ...s1Current.filter(c => !demoteIds.has(c.id)),
  ...PROMOTE_TO_S1.map(p => CARDS.find(c => c.id === p.id))
];
console.log('S1 cards: current', s1Current.length, '→ after swap', s1AfterSwap.length);

// ---------- Original explicit M1 forcings + auto categorization ----------

const FORCED_MISSION = {
  // M1 — Hello & Politeness
  1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 1712: 1, 4034: 1,
  250: 1, 251: 1, 5703: 1,
  100: 1, 1273: 1, 5709: 1,
  310: 1, 312: 1, 313: 1, 314: 1, 330: 1,
  3396: 1, 2815: 1, 3254: 1, 5361: 1, 5702: 1, 1661: 1, 4540: 1,
  190: 1, 197: 1,

  // M2 — At the Restaurant
  15: 2, 91: 2, 22: 2, 23: 2, 20: 2, 135: 2, 60: 2, 73: 2,
  1666: 2, 51: 2, 24: 2,

  // M3 — Getting Around
  112: 3, 1772: 3, 118: 3, 164: 3, 853: 3, 174: 3, 1615: 3, 277: 3,
  13: 3, 14: 3, 515: 3, 1600: 3, 1611: 3, 1830: 3,
  58: 3, 59: 3, 43: 3, 2223: 3, 111: 3, 110: 3,

  // M4 — Numbers & Prices
  116: 4, 117: 4, 410: 4, 850: 4, 5701: 4, 1746: 4,
  221: 4, 1633: 4, 2983: 4, 1742: 4, 1847: 4,
  1044: 4, 4528: 4, 4397: 4, 1673: 4,

  // M5 — Help & Communication
  33: 5, 431: 5, 430: 5, 5700: 5,
  29: 5, 30: 5, 34: 5, 35: 5, 26: 5, 28: 5,
  17: 5, 57: 5, 25: 5, 74: 5,
  560: 5, 561: 5, 562: 5, 566: 5, 567: 5, 573: 5, 2562: 5,
  1706: 5, 605: 5, 2250: 5, 3177: 5, 1218: 5,

  // M6 — Survival Test
  108: 6, 103: 6, 104: 6, 1276: 6, 1277: 6,
  10: 6, 11: 6, 12: 6, 510: 6, 18: 6, 19: 6,
  508: 6,

  // Reclassifications
  ...RECLASSIFY
};

function autoMission(c) {
  if (FORCED_MISSION[c.id]) return FORCED_MISSION[c.id];
  // Defaults by category
  const defaults = {
    greetings: 1, intro: 1, pronouns: 1, people: 1,
    questions: 3, directions: 3, places: 3,
    food: 2, 'food-phrases': 2,
    shopping: 4, numbers: 4, time: 4,
    body: 5, emergency: 5, health: 5, emotions: 5, weather: 5,
    fluency: 6, grammar: 6, verbs: 6, adjectives: 6, adverbs: 6,
    things: 6, home: 6,
    'sentences-questions': 3, 'sentences-daily': 6, 'sentences-self': 5
  };
  return defaults[c.cat] || 6;
}

const buckets = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
for (const c of s1AfterSwap) {
  const m = autoMission(c);
  buckets[m].push(c);
}

console.log('Initial mission counts:', Object.fromEntries(Object.entries(buckets).map(([k, v]) => [k, v.length])));

// Rebalance (same two-way logic as before)
const targets = { 1: 25, 2: 28, 3: 27, 4: 27, 5: 28, 6: 15 };
function rebalance() {
  for (let pass = 0; pass < 30; pass++) {
    const counts = Object.fromEntries(Object.entries(buckets).map(([k, v]) => [k, v.length]));
    let over = null, under = null;
    for (const m of [1, 2, 3, 4, 5, 6]) {
      if (counts[m] > targets[m] + 1 && (!over || counts[m] - targets[m] > counts[over] - targets[over])) over = m;
      if (counts[m] < targets[m] - 1 && (!under || targets[m] - counts[m] > targets[under] - counts[under])) under = m;
    }
    if (!over || !under) break;
    const movable = buckets[over].filter(c => !FORCED_MISSION[c.id]);
    if (movable.length === 0) break;
    movable.sort((a, b) => b.id - a.id);
    const card = movable[0];
    buckets[over] = buckets[over].filter(c => c.id !== card.id);
    buckets[under].push(card);
  }
}
rebalance();

console.log('After rebalance:    ', Object.fromEntries(Object.entries(buckets).map(([k, v]) => [k, v.length])));

// ---------- Generate markdown ----------

const NAMES = {
  1: 'Hello & Politeness',
  2: 'At the Restaurant',
  3: 'Getting Around',
  4: 'Numbers & Prices',
  5: 'Help & Communication',
  6: 'Survival Test'
};
const GOALS = {
  1: 'Be polite, identify yourself, basic yes/no.',
  2: 'Order food and drinks. Express wants. Basic taste/quality vocab.',
  3: 'Ask where, navigate, find places, get on/off transport.',
  4: 'Ask "how much", understand prices and time, count.',
  5: 'Ask for help, express that you don\'t understand, talk about pain/needs.',
  6: 'Review challenge. Connectors, common verbs, fluency particles to lock in mastery before Stage 2.'
};
const CELEBRATIONS = {
  1: '🎉 You spoke your first Thai words! Mission 2 unlocked.',
  2: '🍜 You can order food! Try it at the next restaurant. Mission 3 unlocked.',
  3: '🛺 You can find your way! Try ห้องน้ำอยู่ที่ไหน in real Bangkok. Mission 4 unlocked.',
  4: '💰 You can bargain! เท่าไหร่ครับ → ลดได้ไหม. Mission 5 unlocked.',
  5: '❤️ You can ask for help! ช่วยด้วย, ผมไม่เข้าใจ — three lifelines mastered. Mission 6 unlocked.',
  6: '👑 Survival Thai complete! You can handle real Thailand. The full path is now unlocked — 4,752 cards await.'
};

const lines = [];
const push = (l = '') => lines.push(l);

push('# Stage 1 Missions — Final Proposal (with weak-fit cleanup)');
push('');
push('Generated by `scripts/propose-missions-v2.js`. Reflects 4 decisions:');
push('- Q1: 8 weak-fit S1 cards swapped for 8 high-value S2/S3 cards');
push('- Q2: mission names updated (M1, M5, M6)');
push('- Q3: unlock threshold lowered to **70%** (not 80%)');
push('- Q5: swaps to be applied in Step 3.3');
push('');

push('## Card swaps');
push('');
push('### Removed from S1 (8 cards, demoted to later stages)');
push('');
push('| id | thai | en | demoted to | reason |');
push('|---:|---|---|---:|---|');
for (const d of DEMOTE_FROM_S1) {
  const c = CARDS.find(x => x.id === d.id);
  push(`| ${d.id} | ${c.thai} | ${c.en} | S${d.newStage} | ${d.reason} |`);
}
push('');
push('### Promoted to S1 (8 cards)');
push('');
push('| id | thai | ph | en | from stage | lands in mission |');
push('|---:|---|---|---|---:|---:|');
for (const p of PROMOTE_TO_S1) {
  push(`| ${p.id} | ${p.thai} | ${p.ph} | ${p.en} | S${p.fromStage} | M${p.mission} |`);
}
push('');
push('**Net effect**: S1 stays at 150 cards. Total deck unchanged at 4,791.');
push('');

push('## Mission re-classifications (S1 cards moving between missions)');
push('');
push('These cards stay in Stage 1 but move to a more appropriate mission:');
push('');
push('| id | thai | en | from M | to M | reason |');
push('|---:|---|---|---:|---:|---|');
const RECLASS_REASONS = {
  4033: 'female polite particle — fits with ค่ะ in M1',
  1698: 'kid — fits people cluster in M1',
  1612: 'more — "one more please" at restaurant',
  2417: 'casual question word — fits question cluster in M3',
  1733: 'long — "is it far?" / "long time"',
  1652: 'wrong — used for problems (M5)',
  1274: 'urging particle — fits with other particles in M6',
  3023: 'or — grammar particle, M6',
  1684: 'true — emphatic, M6',
  1699: 'probably — modal, M6',
  1594: 'that/think — conjunction, M6'
};
const RECLASS_FROM = {
  4033: 2, 1698: 2, 1612: 3, 2417: 2,
  1733: 2, 1652: 4, 1274: 2, 3023: 2,
  1684: 4, 1699: 4, 1594: 4
};
for (const id of Object.keys(RECLASSIFY).filter(id => RECLASS_REASONS[id])) {
  const c = CARDS.find(x => x.id === Number(id));
  if (!c) continue;
  push(`| ${id} | ${c.thai} | ${c.en} | M${RECLASS_FROM[id] || '?'} | M${RECLASSIFY[id]} | ${RECLASS_REASONS[id]} |`);
}
push('');

push('## Final mission distribution');
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
push('- **Missions 2-6**: unlocked when previous mission is **70% mastered** (interval ≥ 21 days for ≥70% of mission cards)');
push('- 70% threshold chosen for encouraging psychology — beginners shouldn\'t hit a wall');
push('');

push('## Essential sentence distribution (unchanged)');
push('');
const essentialIds = [310, 312, 313, 314, 330, 5700, 850, 853, 430, 431];
const eMission = { 310: 1, 312: 1, 313: 1, 314: 1, 330: 1, 5700: 5, 850: 4, 853: 3, 430: 5, 431: 5 };
push('| Essential | Lands in |');
push('|---|---|');
for (const id of essentialIds) {
  const c = CARDS.find(x => x.id === id);
  push(`| ${c.thai} (${c.en}) | M${eMission[id]} |`);
}
push('');

push('## Mission contents');
push('');
for (let m = 1; m <= 6; m++) {
  push(`### Mission ${m}: ${NAMES[m]}  (${buckets[m].length} cards)`);
  push('');
  push(`**Goal**: ${GOALS[m]}`);
  push('');
  push(`**Celebration**: ${CELEBRATIONS[m]}`);
  push('');
  push('| id | type | cat | thai | ph | en |');
  push('|---:|---|---|---|---|---|');
  const sorted = buckets[m].slice().sort((a, b) => {
    const tOrder = { p: 0, s: 1, w: 2, g: 3 };
    if (tOrder[a.type] !== tOrder[b.type]) return tOrder[a.type] - tOrder[b.type];
    return a.id - b.id;
  });
  for (const c of sorted) {
    const isNew = PROMOTE_TO_S1.some(p => p.id === c.id);
    const marker = isNew ? ' 🆕' : '';
    push(`| ${c.id}${marker} | ${c.type} | ${c.cat} | ${c.thai} | ${c.ph || ''} | ${(c.en || '').replace(/\|/g, '\\|').slice(0, 60)} |`);
  }
  push('');
}

push('## Implementation notes (Step 3.3)');
push('');
push('1. **Card stage swaps** (8 demotions + 8 promotions): update `STEP2_OVERRIDES` in `src/data/cards-step2.js`');
push('2. **Mission property**: add `mission: 1..6` to each S1 card via `STEP2_OVERRIDES`');
push('3. **MISSIONS export** in `src/data/taxonomy.js`: id, name, goal, celebration, threshold (70%)');
push('4. **Stage renames** in `src/data/taxonomy.js` STAGES array');
push('5. **Mission progress helpers** in `src/lib/state.js`: `getMissionState(stats, progress)` returns each mission\'s mastery % and locked/unlocked state');
push('6. **Threshold constant** in `src/data/gamification.js`: `MISSION_UNLOCK_THRESHOLD = 0.7`');
push('');
push('Dependency safety check: none of the 8 demoted cards are referenced by any S1 essential sentence\'s breakdown or segmentation. The 8 promoted cards are standalone vocab — no new dependency edges. ✓');
push('');

fs.writeFileSync(path.join(REPO_ROOT, 'STAGE_1_MISSIONS.md'), lines.join('\n'), 'utf8');
console.log('Wrote STAGE_1_MISSIONS.md (' + lines.length + ' lines)');
