#!/usr/bin/env node
// Wraps :hover CSS rules in `@media (hover: hover) and (pointer: fine)` so they
// don't stick on touch devices after a tap. Splits mixed selector chains
// (e.g. `.X-active, .X-active:hover { … }`) so the non-hover selector still
// applies on touch. Adds button focus-visible rules at the end.
//
// Usage: node scripts/fix-button-states.js

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const PATH = resolve(ROOT, 'src/styles/app.css');

const text = readFileSync(PATH, 'utf8');

// Parse into blocks: either a rule (selector + balanced { body }) or raw text.
const blocks = [];
let buf = '', depth = 0, pendingSel = '';
for (let i = 0; i < text.length; i++) {
  const ch = text[i];
  if (ch === '{') {
    if (depth === 0) { pendingSel = buf; buf = ch; depth = 1; }
    else { buf += ch; depth++; }
    continue;
  }
  if (ch === '}') {
    buf += ch; depth--;
    if (depth === 0) { blocks.push({ type: 'rule', selector: pendingSel, body: buf }); buf = ''; pendingSel = ''; }
    continue;
  }
  buf += ch;
}
if (buf) blocks.push({ type: 'raw', text: buf });

// Split selector list by top-level commas (respect parens/brackets for :not(...))
function splitSelectors(s) {
  const out = [];
  let cur = '', d = 0;
  for (const ch of s) {
    if (ch === '(' || ch === '[') d++;
    else if (ch === ')' || ch === ']') d--;
    else if (ch === ',' && d === 0) { out.push(cur); cur = ''; continue; }
    cur += ch;
  }
  if (cur.trim()) out.push(cur);
  return out;
}

const HOVER_WRAP = '@media (hover: hover) and (pointer: fine)';
let stats = { wrapped: 0, split: 0, untouched: 0 };

const result = [];
for (const b of blocks) {
  if (b.type === 'raw') { result.push(b.text); continue; }
  const sel = b.selector, body = b.body, trimmed = sel.trim();
  // Don't touch at-rules (already-wrapped @media, @keyframes, etc.)
  if (trimmed.startsWith('@')) { result.push(sel + body); continue; }
  if (!sel.includes(':hover')) { result.push(sel + body); stats.untouched++; continue; }

  const parts = splitSelectors(sel);
  const hover = parts.filter(p => p.includes(':hover'));
  const nonHover = parts.filter(p => !p.includes(':hover'));

  if (nonHover.length === 0) {
    // All selectors have :hover — wrap entire rule
    result.push(`${HOVER_WRAP} {${sel}${body}}`);
    stats.wrapped++;
  } else {
    // Mixed chain — split into two rules. Trim each part to avoid blank lines from
    // re-joining selectors that had leading/trailing whitespace in the source.
    const cleanNH = nonHover.map(p => p.trim()).join(',\n');
    const cleanH = hover.map(p => p.trim()).join(',\n');
    result.push(`${cleanNH}${body}`);
    result.push(`\n${HOVER_WRAP} {${cleanH}${body}}`);
    stats.split++;
  }
}

let output = result.join('');
output += `

/* Remove default browser focus outlines after mouse click (the "stuck pressed" look).
   Keyboard accessibility preserved via :focus-visible. */
button:focus, [role="button"]:focus, a:focus { outline: none; }
button:focus-visible, [role="button"]:focus-visible, a:focus-visible { outline: 2px solid var(--jade); outline-offset: 2px; border-radius: 4px; }
`;

writeFileSync(PATH, output);
console.log(`Wrapped (all-hover):  ${stats.wrapped}`);
console.log(`Split (mixed chain):  ${stats.split}`);
console.log(`Non-hover untouched:  ${stats.untouched}`);
console.log(`Wrote ${PATH}`);
