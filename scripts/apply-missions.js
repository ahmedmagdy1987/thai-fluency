// Phase 3: applies the 8 stage swaps (weak-fit cleanup) and adds mission
// assignment (1-6) to every S1 card. Reads current STEP2_OVERRIDES and writes
// an updated cards-step2.js with the changes merged in.
//
// Run: node scripts/apply-missions.js

import { CARDS } from '../src/data/cards.js';
import { STEP2_ADDITIONS, STEP2_OVERRIDES } from '../src/data/cards-step2.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');

// ---------- Phase 3 swaps ----------

const DEMOTE = { 2231: 8, 2664: 6, 3615: 7, 2805: 5, 1874: 6, 2001: 6, 4087: 7, 1796: 6 };
const PROMOTE = { 67: 1, 131: 1, 68: 1, 231: 1, 72: 1, 176: 1, 1200: 1, 81: 1 };

// Mission forcing: ids that go to a specific mission regardless of cat
const FORCED_MISSION = {
  // M1 — Hello & Politeness
  1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 1712: 1, 4034: 1, 4033: 1,
  250: 1, 251: 1, 5703: 1,
  100: 1, 1273: 1, 5709: 1,
  310: 1, 312: 1, 313: 1, 314: 1, 330: 1,
  3396: 1, 2815: 1, 3254: 1, 5361: 1, 5702: 1, 1661: 1, 4540: 1,
  190: 1, 197: 1, 1698: 1,

  // M2 — At the Restaurant
  15: 2, 91: 2, 22: 2, 23: 2, 20: 2, 135: 2, 60: 2, 73: 2,
  1666: 2, 51: 2, 24: 2, 1612: 2,
  // Promoted to M2
  67: 2, 131: 2, 68: 2,

  // M3 — Getting Around
  112: 3, 1772: 3, 118: 3, 164: 3, 853: 3, 174: 3, 1615: 3, 277: 3,
  13: 3, 14: 3, 515: 3, 1600: 3, 1611: 3, 1830: 3,
  58: 3, 59: 3, 43: 3, 2223: 3, 111: 3, 110: 3,
  2417: 3, 1733: 3,
  // Promoted to M3
  81: 3,

  // M4 — Numbers & Prices
  116: 4, 117: 4, 410: 4, 850: 4, 5701: 4, 1746: 4,
  221: 4, 1633: 4, 2983: 4, 1742: 4, 1847: 4,
  1044: 4, 4528: 4, 4397: 4, 1673: 4,
  // Promoted to M4
  231: 4, 72: 4, 176: 4,

  // M5 — Help & Communication
  33: 5, 431: 5, 430: 5, 5700: 5,
  29: 5, 30: 5, 34: 5, 35: 5, 26: 5, 28: 5,
  17: 5, 57: 5, 25: 5, 74: 5,
  560: 5, 561: 5, 562: 5, 566: 5, 567: 5, 573: 5, 2562: 5,
  1706: 5, 605: 5, 2250: 5, 3177: 5, 1218: 5,
  1652: 5,
  // Promoted to M5
  1200: 5,

  // M6 — Survival Test
  108: 6, 103: 6, 104: 6, 1276: 6, 1277: 6,
  10: 6, 11: 6, 12: 6, 510: 6, 18: 6, 19: 6,
  508: 6,
  1274: 6, 3023: 6, 1684: 6, 1699: 6, 1594: 6
};

const CAT_DEFAULT_MISSION = {
  greetings: 1, intro: 1, pronouns: 1, people: 1,
  questions: 3, directions: 3, places: 3,
  food: 2, 'food-phrases': 2, 'sentences-food': 2,
  shopping: 4, numbers: 4, time: 4,
  body: 5, emergency: 5, health: 5, emotions: 5, weather: 5,
  fluency: 6, grammar: 6, verbs: 6, adjectives: 6, adverbs: 6,
  things: 6, home: 6,
  'sentences-questions': 3, 'sentences-daily': 6, 'sentences-self': 5
};

const TARGETS = { 1: 25, 2: 28, 3: 27, 4: 27, 5: 28, 6: 15 };

// ---------- Build extended overrides ----------

const newOverrides = JSON.parse(JSON.stringify(STEP2_OVERRIDES));

// Apply Phase 3 swaps
for (const [id, stage] of Object.entries(DEMOTE)) {
  if (!newOverrides[id]) newOverrides[id] = {};
  newOverrides[id].stage = stage;
}
for (const [id, stage] of Object.entries(PROMOTE)) {
  if (!newOverrides[id]) newOverrides[id] = {};
  newOverrides[id].stage = stage;
}

// Recompute final card stage with new overrides
function finalStage(c) {
  const ov = newOverrides[c.id];
  return (ov && ov.stage !== undefined) ? ov.stage : c.stage;
}

const allCardsWithFinalStage = CARDS.map(c => ({ ...c, stage: finalStage(c) }));
const s1Cards = allCardsWithFinalStage.filter(c => c.stage === 1);

console.log('S1 card count after Phase 3 swaps:', s1Cards.length);

// ---------- Assign mission per S1 card ----------

function autoMission(c) {
  if (FORCED_MISSION[c.id]) return FORCED_MISSION[c.id];
  return CAT_DEFAULT_MISSION[c.cat] || 6;
}

const buckets = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
for (const c of s1Cards) buckets[autoMission(c)].push(c);

console.log('Initial mission counts:', Object.fromEntries(Object.entries(buckets).map(([k, v]) => [k, v.length])));

function rebalance() {
  for (let pass = 0; pass < 30; pass++) {
    const counts = Object.fromEntries(Object.entries(buckets).map(([k, v]) => [k, v.length]));
    let over = null, under = null;
    for (const m of [1, 2, 3, 4, 5, 6]) {
      if (counts[m] > TARGETS[m] + 1 && (!over || counts[m] - TARGETS[m] > counts[over] - TARGETS[over])) over = m;
      if (counts[m] < TARGETS[m] - 1 && (!under || TARGETS[m] - counts[m] > TARGETS[under] - counts[under])) under = m;
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

// ---------- Write missions into overrides ----------

for (let m = 1; m <= 6; m++) {
  for (const c of buckets[m]) {
    if (!newOverrides[c.id]) newOverrides[c.id] = {};
    newOverrides[c.id].mission = m;
  }
}

// Cards that are no longer S1 should not have a mission
for (const id of Object.keys(newOverrides)) {
  const c = CARDS.find(x => x.id === Number(id));
  if (!c) continue;
  if (finalStage(c) !== 1 && newOverrides[id].mission !== undefined) {
    delete newOverrides[id].mission;
  }
}

// ---------- Verify stage distribution ----------

const stageCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0 };
for (const c of allCardsWithFinalStage) stageCounts[c.stage]++;
console.log('Final stage distribution:', stageCounts);

// ---------- Write cards-step2.js ----------

function fmt(s) {
  return String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function cardLiteral(c) {
  const parts = [`id:${c.id}`, `thai:'${fmt(c.thai)}'`, `ph:'${fmt(c.ph || '')}'`, `en:'${fmt(c.en || '')}'`, `type:'${c.type}'`, `stage:${c.stage}`, `cat:'${fmt(c.cat)}'`];
  if (c.note) parts.push(`note:'${fmt(c.note)}'`);
  return '{' + parts.join(',') + '}';
}

function valLiteral(v) {
  if (typeof v === 'string') return `'${fmt(v)}'`;
  if (typeof v === 'boolean') return String(v);
  return String(v);
}

const additionsLines = STEP2_ADDITIONS.map(c => '  ' + cardLiteral(c) + ',').join('\n');
const overrideEntries = Object.entries(newOverrides).map(([id, o]) => {
  const fields = Object.entries(o).map(([k, v]) => `${k}:${valLiteral(v)}`).join(',');
  return `  ${id}: {${fields}}`;
}).join(',\n');

const content = `// Step 2/3 (Phase 2+3): redistribution overrides + new vocab + missions.
// Generated by scripts/apply-redistribution.js + scripts/apply-missions.js.
// Last regenerated: ${new Date().toISOString()}.
// Do not hand-edit unless you know what you are doing — re-run the scripts to
// regenerate with new inputs.

export const STEP2_ADDITIONS = [
${additionsLines}
];

export const STEP2_OVERRIDES = {
${overrideEntries}
};
`;

fs.writeFileSync(path.join(REPO_ROOT, 'src/data/cards-step2.js'), content, 'utf8');
console.log('Wrote src/data/cards-step2.js (' + STEP2_ADDITIONS.length + ' additions, ' + Object.keys(newOverrides).length + ' overrides)');
