#!/usr/bin/env node
//
// Code-level QA for the mini-unit Sentence Builder (lib/sentenceBuilder.js +
// the pilot data in data/miniUnits.js). Verifies the pure logic and that the
// pilot token data is internally consistent AND faithful to the source card
// (no invented Thai content). Exits non-zero on any failure.

import { CARDS } from '../src/data/cards.js';
import { STAGE_1_MINI_UNIT_PILOT } from '../src/data/miniUnits.js';
import {
  isBuilderCorrect,
  shuffleTokens,
  assembledThai,
  validateSentenceBuilder,
} from '../src/lib/sentenceBuilder.js';

let failures = 0;
function check(label, cond, extra = '') {
  if (cond) console.log(`OK   ${label}`);
  else { failures += 1; console.error(`FAIL ${label}${extra ? ' — ' + extra : ''}`); }
}

const sb = STAGE_1_MINI_UNIT_PILOT.sentenceBuilder;
const ids = sb.tokens.map(t => t.id);
const answer = sb.answer;

console.log(`Sentence builder check — unit=${STAGE_1_MINI_UNIT_PILOT.unitId}, tokens=${ids.length}`);

// ── Data validity ────────────────────────────────────────────────────────────
check('pilot sentenceBuilder data is valid (validateSentenceBuilder)', validateSentenceBuilder(sb) === true);
check('answer is a permutation of token ids', answer.length === ids.length && answer.every(id => ids.includes(id)) && new Set(answer).size === answer.length);

// ── Faithful to source card 330 (no invented Thai content) ──────────────────
const card = CARDS.find(c => c.id === sb.sourceCardId);
check('source card 330 exists', !!card, `sourceCardId=${sb.sourceCardId}`);
if (card) {
  check('builder thai matches card thai', sb.thai === card.thai, `"${sb.thai}" vs "${card.thai}"`);
  const nonBlank = sb.tokens.filter(t => !t.isBlank);
  check('every non-blank token thai appears in card 330 thai',
    nonBlank.every(t => card.thai.includes(t.thai)), JSON.stringify(nonBlank.map(t => t.thai)));
  check('every non-blank token ph appears in card 330 phonetic',
    nonBlank.every(t => card.ph.includes(t.ph)), JSON.stringify(nonBlank.map(t => t.ph)));
  check('blank token represents the card name slot (___)',
    sb.tokens.some(t => t.isBlank) && card.thai.includes('___'));
}

// ── isBuilderCorrect ─────────────────────────────────────────────────────────
check('correct order passes', isBuilderCorrect([...answer], answer) === true);
const wrong = [...answer]; if (wrong.length >= 2) { [wrong[0], wrong[1]] = [wrong[1], wrong[0]]; }
check('swapped order fails', isBuilderCorrect(wrong, answer) === false);
check('partial (short) fails', isBuilderCorrect(answer.slice(0, answer.length - 1), answer) === false);
check('empty fails', isBuilderCorrect([], answer) === false);
check('non-array fails gracefully', isBuilderCorrect(null, answer) === false && isBuilderCorrect(answer, undefined) === false);

// ── shuffleTokens: permutation + never pre-solved (for >1 token) ─────────────
{
  let allPermutations = true;
  let neverSolved = true;
  for (let i = 0; i < 30; i++) {
    const shuffled = shuffleTokens(sb.tokens).map(t => t.id);
    if (shuffled.length !== ids.length || !shuffled.every(id => ids.includes(id)) || new Set(shuffled).size !== ids.length) allPermutations = false;
    if (shuffled.join('|') === ids.join('|')) neverSolved = false;
  }
  check('shuffleTokens always returns a full permutation', allPermutations);
  check('shuffleTokens never returns the already-solved order', neverSolved);
  check('shuffleTokens handles <2 tokens without looping', shuffleTokens([{ id: 'a' }]).length === 1 && shuffleTokens([]).length === 0);
}

// ── assembledThai: joins non-blank thai in arranged order, skips the blank ───
{
  const assembled = assembledThai(sb.tokens, answer);
  const expected = sb.tokens.filter(t => !t.isBlank).map(t => t.thai).join('');
  check('assembledThai joins non-blank tokens in answer order', assembled === expected, `"${assembled}" vs "${expected}"`);
  check('assembledThai excludes the name-slot placeholder', !assembled.includes('(your name)') && !assembled.includes('___'));
}

if (failures > 0) {
  console.error(`\nSentence builder check FAILED: ${failures} assertion(s) failed.`);
  process.exit(1);
}
console.log('\nSentence builder check passed.');
