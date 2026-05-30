#!/usr/bin/env node
//
// Code-level QA for the mini-unit catalogue (data/miniUnits.js). Validates that
// every unit references only existing cards, groups Stage-1 cards correctly,
// has no internal duplicates, and that any sentenceBuilder is internally valid
// AND faithful to its source card (no invented Thai content). Exits non-zero on
// any failure. Reports unit sizes.

import { CARDS } from '../src/data/cards.js';
import { MINI_UNITS } from '../src/data/miniUnits.js';
import { validateSentenceBuilder } from '../src/lib/sentenceBuilder.js';

const byId = new Map(CARDS.map(c => [c.id, c]));
let failures = 0;
let warnings = 0;
function check(label, cond, extra = '') {
  if (cond) console.log(`OK   ${label}`);
  else { failures += 1; console.error(`FAIL ${label}${extra ? ' — ' + extra : ''}`); }
}
function warn(label, cond, extra = '') {
  if (!cond) { warnings += 1; console.warn(`WARN ${label}${extra ? ' — ' + extra : ''}`); }
}

console.log(`Mini-unit check — ${MINI_UNITS.length} units`);

// ── Unique unit ids ──────────────────────────────────────────────────────────
const unitIds = MINI_UNITS.map(u => u.unitId);
check('all unit ids are unique', new Set(unitIds).size === unitIds.length, JSON.stringify(unitIds));

let builderUnits = 0;

for (const u of MINI_UNITS) {
  const tag = u.unitId;
  const vocab = u.vocabCardIds || [];
  const challenge = u.challengeCardIds || [];

  // Referenced cards exist
  const missingVocab = vocab.filter(id => !byId.has(id));
  const missingChallenge = challenge.filter(id => !byId.has(id));
  check(`[${tag}] all vocabCardIds exist`, missingVocab.length === 0, `missing ${JSON.stringify(missingVocab)}`);
  check(`[${tag}] all challengeCardIds exist`, missingChallenge.length === 0, `missing ${JSON.stringify(missingChallenge)}`);

  // No duplicate card ids within the unit's vocab
  check(`[${tag}] no duplicate vocab card ids`, new Set(vocab).size === vocab.length, JSON.stringify(vocab));

  // Vocab size in the 6–10 sweet spot (warn outside)
  warn(`[${tag}] vocab size 6–10 (got ${vocab.length})`, vocab.length >= 6 && vocab.length <= 10);

  // Stage-1 units: vocab must be Stage-1 cards
  if ((u.stageId || 1) === 1) {
    const offStage = vocab.filter(id => byId.has(id) && (byId.get(id).stage || 1) !== 1);
    check(`[${tag}] vocab are all Stage 1 cards`, offStage.length === 0, `off-stage ${JSON.stringify(offStage)}`);
  }

  // Challenge cards belong to the unit's cards, or at least the same stage
  const unitCardSet = new Set([...vocab, u.sentenceCardId].filter(Boolean));
  const challengeNotInUnit = challenge.filter(id => !unitCardSet.has(id));
  warn(`[${tag}] challengeCardIds are drawn from the unit's cards`, challengeNotInUnit.length === 0, `extra ${JSON.stringify(challengeNotInUnit)}`);
  const challengeOffStage = challenge.filter(id => byId.has(id) && (byId.get(id).stage || 1) !== (u.stageId || 1));
  check(`[${tag}] challengeCardIds match the unit stage`, challengeOffStage.length === 0, `off-stage ${JSON.stringify(challengeOffStage)}`);

  // Sentence card exists if provided
  if (u.sentenceCardId != null) {
    check(`[${tag}] sentenceCardId exists`, byId.has(u.sentenceCardId), `id ${u.sentenceCardId}`);
    warn(`[${tag}] sentenceCardId is a Stage-1 card`, byId.has(u.sentenceCardId) && (byId.get(u.sentenceCardId).stage || 1) === (u.stageId || 1));
  }

  // Sentence builder validity + fidelity to source card
  if (u.sentenceBuilder) {
    builderUnits += 1;
    const sb = u.sentenceBuilder;
    check(`[${tag}] sentenceBuilder is valid (tokens/answer arrays, answer ⊆ tokens)`, validateSentenceBuilder(sb) === true);
    const card = byId.get(sb.sourceCardId);
    check(`[${tag}] sentenceBuilder.sourceCardId exists`, !!card, `id ${sb.sourceCardId}`);
    if (card) {
      check(`[${tag}] builder.thai matches source card thai`, sb.thai === card.thai, `"${sb.thai}" vs "${card.thai}"`);
      // Strong fidelity: the tokens' phonetics reconstruct the card's own
      // space-separated phonetic (ignoring sentence-final punctuation like the
      // "?" the card appends as a reading aid) — proves nothing was invented.
      const normPh = (s) => String(s || '').replace(/[?!.]/g, '').replace(/\s+/g, ' ').trim();
      const joinedPh = sb.tokens.map(t => t.ph).join(' ');
      check(`[${tag}] token phonetics reconstruct the card phonetic`, normPh(joinedPh) === normPh(card.ph), `"${joinedPh}" vs "${card.ph}"`);
      const nonBlank = sb.tokens.filter(t => !t.isBlank);
      check(`[${tag}] every non-blank token thai appears in the card thai`,
        nonBlank.every(t => card.thai.includes(t.thai)), JSON.stringify(nonBlank.map(t => t.thai)));
    }
  }

  console.log(`  · ${tag}: ${vocab.length} vocab, ${challenge.length} challenge, sentence=${u.sentenceCardId ?? 'none'}, builder=${u.sentenceBuilder ? 'yes' : 'no'}`);
}

// Acceptance: at least 2 units carry a sentenceBuilder.
check(`at least 2 units have a sentenceBuilder (got ${builderUnits})`, builderUnits >= 2);

if (failures > 0) {
  console.error(`\nMini-unit check FAILED: ${failures} assertion(s) failed (${warnings} warning(s)).`);
  process.exit(1);
}
console.log(`\nMini-unit check passed (${warnings} warning(s)).`);
