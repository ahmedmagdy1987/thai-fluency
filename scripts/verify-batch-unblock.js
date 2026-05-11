// Step 2.3: Simulate ALL approved patches (Step 2.1 + 2.2 priority + 2.2
// deeper) in memory and report final unplaceable count. Goal: <100. No file
// modifications.

import { CARDS } from '../src/data/cards.js';
import { WORD_LOOKUP } from '../src/data/lookup.js';

// ---------- Approved patch sets ----------

// All new w cards (Thai → metadata for in-memory vocab)
const NEW_W = [
  // Step 2.1
  ['อันนี้',      'an níi',         'this one / this thing',                    1],
  ['เจอกัน',      'jer gan',        'see you',                                  1],
  ['ไม่ใช่',      'mâi châi',       'no / not so / that\'s not it',             1],
  // Step 2.2 priority
  ['มั้ย',        'mái',            'casual question particle',                 2],
  ['ได้ไหม',      'dâai mǎi',       'can you...? / is it OK?',                 2],
  ['กินข้าว',     'gin khâao',      'eat (a meal)',                             2],
  ['จากไหน',      'jàak nǎi',       'from where',                              2],
  ['สักครู่',     'sàk khrûu',      'a moment',                                 2],
  // Step 2.2 recommended
  ['เหรอ',        'rěr',            'casual "really?" / question particle',     2],
  ['เช็คบิล',     'chék bin',       'check please (at restaurant)',             2],
  ['เมนู',        'meh nuu',        'menu',                                     2],
  ['หลงทาง',      'lǒng thaang',    'lost (on the way)',                        3],
  ['หรือยัง',     'rǔe yang',       '...yet?',                                  3],
  ['งี้',         'ngíi',           'casual "like this"',                       3],
  // Step 2.2 deeper Tier A
  ['รวย',         'ruai',           'rich / wealthy',                           3],
  ['เด็ด',        'dèt',            'excellent / top-notch',                    3],
  ['อิจฉา',       'ìt-chǎa',        'envious / jealous',                        3],
  ['ยืด',         'yûet',           'to stretch',                               3],
  ['น่ะ',         'nâ',             'emphasis particle (casual)',               2],
  ['อ่ะ',         'à',              'soft particle (casual)',                   2],
  ['ไม๊',         'mái',            'variant of มั้ย/ไหม (question)',           3],
  ['รู้สึก',      'rúu sùek',       'to feel',                                  2],
  // Step 2.2 deeper Tier B
  ['เซ็น',        'sen',            'to sign (one\'s name)',                    3],
  ['บัส',         'bát',            'bus (loanword)',                           2],
  ['แผน',         'phǎen',          'plan',                                     3],
  ['แบงค์',       'báeng',          'banknote / bill',                          2],
  ['ตังค์',       'dtang',          'money (slang)',                            2],
  ['เนอะ',        'nóe',            'sentence-final particle',                  3],
  ['คุ้ม',        'khúm',           'worth it / worthwhile',                    3],
  ['โกง',         'gohng',          'to cheat',                                 4],
  ['ท้อ',         'thóh',           'discouraged / disheartened',               4],
  ['ไส้',         'sâi',            'filling / intestine',                      3],
  ['มั้ง',        'máng',           'probably (casual)',                        3],
  ['ฉี่',         'chìi',           'pee / urinate',                            3],
  ['ปั่น',        'bpàn',           'to spin / stir',                           4],
  ['หุบ',         'hùp',            'to close (mouth, valley)',                 4],
  // Step 2.2 deeper Tier C — compounds
  ['มิเตอร์',    'mí-ter',         'meter (taxi)',                             3],
  ['อพาร์ทเมนท์','à-páat-mén',     'apartment (loanword)',                     3]
];

// Type changes (s→w or p→w): existing card ids
const RETYPED_TO_W = new Set([
  4528, // ไม่ได้ s→w  (Step 2.1)
  5361, // ไม่เป็นไร s→w  (Step 2.1)
  4474, // มาถึง p→w
  5344, // ช้าๆ s→w
  4671  // กี่โมง s→w
]);

// Type changes s→p: existing card ids (idiomatic expressions kept as phrases)
const RETYPED_TO_P = new Set([
  4732, // แป๊บนึง
  4733  // อะไรอย่างเงี้ยะ
]);

// ---------- Build patched vocab ----------

function buildVocab() {
  const vocab = new Map();
  for (const c of CARDS) {
    let t = c.type;
    if (RETYPED_TO_W.has(c.id)) t = 'w';
    if (RETYPED_TO_P.has(c.id)) t = 'p';
    // Include w + g + p (architectural fix)
    if (t === 'w' || t === 'g' || t === 'p') {
      if (!vocab.has(c.thai)) vocab.set(c.thai, {});
    }
  }
  for (const [, info] of Object.entries(WORD_LOOKUP)) {
    if (info.thai && !vocab.has(info.thai)) vocab.set(info.thai, {});
  }
  for (const c of CARDS) {
    if (Array.isArray(c.breakdown)) for (const b of c.breakdown) {
      if (b && b.thai && !vocab.has(b.thai)) vocab.set(b.thai, {});
    }
  }
  for (const [thai] of NEW_W) {
    if (!vocab.has(thai)) vocab.set(thai, {});
  }
  return vocab;
}

const vocab = buildVocab();
const keys = [...vocab.keys()].sort((a, b) => b.length - a.length);
console.log('Vocab size after all patches:', vocab.size, '(was 3257 at baseline)');
console.log('');

function segment(thaiRaw) {
  const unknowns = [];
  const tokens = [];
  const chunks = thaiRaw.split(/[\sๆ?.,!;:"'“”‘’()\[\]{}\-—–…\/\\_*<>=#%&@+|`~^]+/u).filter(Boolean);
  for (const chunk of chunks) {
    let pos = 0, unk = '';
    while (pos < chunk.length) {
      let matched = null;
      for (const w of keys) {
        if (w.length === 0) continue;
        if (chunk.startsWith(w, pos)) { matched = w; break; }
      }
      if (matched) {
        if (unk) { unknowns.push(unk); tokens.push('?' + unk); unk = ''; }
        tokens.push(matched);
        pos += matched.length;
      } else {
        unk += chunk[pos]; pos++;
      }
    }
    if (unk) { unknowns.push(unk); tokens.push('?' + unk); }
  }
  return { unknowns, tokens };
}

// Sentences that need dependency checking. After patches, retyped s→w/p cards
// stop being "sentences" — exclude them.
const sentLike = CARDS.filter(c => {
  if (RETYPED_TO_W.has(c.id)) return false;
  if (RETYPED_TO_P.has(c.id)) return false;
  return c.type === 's' || c.type === 'p';
}).filter(c => !(Array.isArray(c.breakdown) && c.breakdown.length));

const blocked = [];
for (const c of sentLike) {
  const r = segment(c.thai || '');
  if (r.unknowns.length > 0) blocked.push({ id: c.id, type: c.type, stage: c.stage, thai: c.thai, en: c.en, unknowns: r.unknowns });
}

console.log('Sentences requiring segmentation:', sentLike.length);
console.log('Sentences fully resolvable:', sentLike.length - blocked.length);
console.log('Sentences STILL blocked:', blocked.length);
console.log('');

if (blocked.length < 100) {
  console.log('✅ GOAL ACHIEVED: < 100 unplaceable sentences');
} else {
  console.log('❌ GOAL NOT ACHIEVED: >= 100 unplaceable sentences');
}

console.log('');
console.log('--- Top 20 remaining blockers ---');
const remaining = new Map();
for (const b of blocked) for (const u of b.unknowns) remaining.set(u, (remaining.get(u) || 0) + 1);
const top = [...remaining.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20);
for (const [t, n] of top) console.log('  ' + String(n).padStart(2) + '  ' + t);

console.log('');
console.log('--- Sample 10 remaining blocked sentences ---');
for (const b of blocked.slice(0, 10)) {
  console.log('  id ' + b.id + ' [' + b.type + ' s' + b.stage + '] ' + b.thai + ' = ' + (b.en || '').slice(0, 60));
  console.log('     unknowns: ' + b.unknowns.join(' · '));
}
