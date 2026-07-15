// Severity/self-description consistency guard for the Dating & Real Talk pack.
//
// A phrase's safety badges are derived from ONE field: `severity`. Everything
// else the learner reads about that phrase — its English gloss, its note, its
// quiz explanations — is hand-written prose. When the prose calls a phrase
// "mild" while the badge says "Handle with care" / "Don't use casually", the
// card hands the learner two contradictory safety signals and they stop
// trusting BOTH (claude-review.md C1, found on 90058). This fails the build if
// that contradiction returns.
//
// THE RULE — a phrase's OWN self-description may not contradict its OWN
// severity. Two one-way implications on the intensity axis:
//   (1) severity 'strong'  → self-description must not claim MILDNESS
//   (2) severity 'gentle'  → self-description must not claim HARSHNESS
// 'moderate' is the mid-band (both softer- and rougher-leaning descriptions are
// legitimate there) and 'safety' is OFF the intensity axis entirely — it flags
// topic/risk (consent, boundaries, getting home), not politeness — so intensity
// words carry no contradiction for either. Both are unconstrained by design.
//
// SCOPE — the phrase's OWN self-description, and deliberately NOT its category:
// a category name describes the BAND's ceiling, not each member. 'mild-swears-
// insults' is named "mild" yet legitimately holds 'strong' phrases (90059
// "Rough/informal", 90060 "Insulting if aimed at a person") — both
// self-consistent. A category-name-vs-severity rule would fail on correct data,
// so this guard reads only what the phrase says about ITSELF.
//
// WHY THE CONTRAST/OPTION SKIPS — explanations exist to NAME AND REFUTE the
// wrong readings, so mild-sounding words about a strong phrase are expected and
// correct there ("It is not mild"; "option d treats it as harmless confusion").
// A sentence that negates/contrasts, or that is talking about an answer option,
// is not an assertion about the phrase, so it is skipped. This buys zero false
// positives at the cost of missing a contradiction smuggled into a hedged
// sentence: like check-dating-distractors.mjs, this guard is the mechanical
// FLOOR, not the ceiling — the final severity call is the native reviewer's.

import { DATING_PHRASES } from '../src/data/datingPhrases.js';
import { DATING_QUESTIONS } from '../src/data/datingQuestions.js';
import { SEVERITY_LABEL, USAGE_GUIDANCE } from '../src/lib/datingQuiz.js';

let failures = 0;
const ok = (name) => console.log(`OK   ${name}`);
const fail = (name, detail) => { console.log(`FAIL ${name}  ${detail}`); failures++; };

// Words that CLAIM a phrase is soft/harmless.
const MILD_CLAIM = /\b(mild(ly)?|soft(er|ly)?|softens?|gentle|gently|harmless|tame|innocuous|playful|inoffensive)\b/i;
// Words that CLAIM a phrase is rough/offensive.
const HARSH_CLAIM = /\b(rude|vulgar|crude|coarse|offensive|insult(s|ing)?|obscene|profan\w*|harsh|blunt|aggressive|filthy)\b/i;
// A negated/contrastive sentence is not a claim ("it is NOT mild").
const CONTRAST = /\b(not|n't|never|rather than|instead of|far from|hardly|no|than|wrong|understates|unlike)\b/i;
// A sentence about an answer option is describing a distractor, not the phrase.
const OPTION_REF = /\boption [a-d]\b|\([a-d]\)/i;

const CLAIM_RULE = {
  strong: { re: MILD_CLAIM, claim: 'mildness' },
  gentle: { re: HARSH_CLAIM, claim: 'harshness' },
};

const sentences = (text) => String(text || '').split(/(?<=[.!?;])\s+/).filter(Boolean);

const explanationsByPhrase = new Map();
for (const q of DATING_QUESTIONS) {
  if (!explanationsByPhrase.has(q.phraseId)) explanationsByPhrase.set(q.phraseId, []);
  explanationsByPhrase.get(q.phraseId).push(q);
}

// Everything a learner reads that ASSERTS what this phrase is like.
const selfDescription = (p) => [
  ['en gloss', p.en],
  ['note', p.note],
  ...(explanationsByPhrase.get(p.id) || []).map((q) => [`explanation of ${q.id}`, q.explanation]),
];

function contradictions(phrases) {
  const found = [];
  for (const p of phrases) {
    const rule = CLAIM_RULE[p.severity];
    if (!rule) continue; // 'moderate' (mid-band) and 'safety' (off-axis) are unconstrained
    for (const [source, text] of selfDescription(p)) {
      for (const s of sentences(text)) {
        if (OPTION_REF.test(s) || CONTRAST.test(s)) continue;
        const hit = s.match(rule.re);
        if (hit) {
          found.push(`${p.id} severity '${p.severity}' (badge "${SEVERITY_LABEL[p.severity]}" / "${USAGE_GUIDANCE[p.severity].label}") but its ${source} claims ${rule.claim} — "${hit[0]}" in: ${s.trim()}`);
        }
      }
    }
  }
  return found;
}

// ---- 1. No phrase contradicts itself -------------------------------------------
const found = contradictions(DATING_PHRASES);
const constrained = DATING_PHRASES.filter((p) => CLAIM_RULE[p.severity]).length;
if (found.length === 0) {
  ok(`no phrase's self-description contradicts its severity (${constrained} of ${DATING_PHRASES.length} phrases on the constrained 'strong'/'gentle' bands)`);
} else {
  fail(`${found.length} severity/self-description contradiction(s)`, `\n     - ${found.join('\n     - ')}`);
}

// ---- 2. Sensitivity trap --------------------------------------------------------
// A guard that can no longer fail is a guard that has silently rotted. Re-label
// 90058 'strong' in memory — the exact C1 defect — and prove this still catches it.
const trap = contradictions(DATING_PHRASES.map((p) => (p.id === 90058 ? { ...p, severity: 'strong' } : p)));
if (trap.length > 0) ok(`guard still bites: re-labelling 90058 'strong' is caught (${trap.length} contradiction(s) across gloss/note/explanation)`);
else fail('guard has rotted', 're-labelling 90058 as strong produced NO contradiction — the rule no longer detects the C1 defect');

// ---- 3. Every severity is one the badge maps know ---------------------------------
const unknown = DATING_PHRASES.filter((p) => !SEVERITY_LABEL[p.severity] || !USAGE_GUIDANCE[p.severity]);
if (unknown.length === 0) ok('every phrase severity resolves to a badge + usage-guidance label');
else fail('unknown severity value(s)', unknown.map((p) => `${p.id}: '${p.severity}'`).join(' | '));

console.log('');
if (failures > 0) {
  console.log(`Dating severity-consistency check FAILED (${failures} failure(s)).`);
  process.exit(1);
}
console.log(`Dating severity-consistency check passed (${DATING_PHRASES.length} phrases; no phrase's gloss, note, or explanation contradicts its own severity).`);
