// ─────────────────────────────────────────────────────────────────────────────
// CIRCULAR IMPORT guard — dependency-free.
//
// WHY: a cycle between ES modules is the classic cause of "Cannot access 'X'
// before initialization" in a PRODUCTION bundle. Vite's dev server and Rollup's
// bundle order modules differently, so a cycle can be harmless in `npm run dev`
// and fatal in the built app — which is the worst possible failure shape: it only
// appears after deploy.
//
// The Wave 14 outage turned out NOT to be a cycle (it was a plain forward
// reference inside one component — see check-tdz.mjs), and this codebase has zero
// cycles today. That is exactly why it is worth pinning: "zero" is a property
// that is cheap to keep and expensive to rediscover.
//
// No madge, no new dependency — a small resolver plus an iterative DFS.
// ─────────────────────────────────────────────────────────────────────────────

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve, relative } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'src');
const EXTS = ['.js', '.jsx', '.mjs'];

const files = [];
(function walk(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (EXTS.some(x => e.name.endsWith(x))) files.push(p);
  }
})(SRC);

// Resolve a relative specifier the way the bundler does.
function resolveSpec(fromFile, spec) {
  if (!spec.startsWith('.')) return null;             // bare = node_modules, not our graph
  const base = resolve(dirname(fromFile), spec);
  if (existsSync(base) && statSync(base).isFile()) return base;
  for (const x of EXTS) if (existsSync(base + x)) return base + x;
  for (const x of EXTS) {
    const idx = join(base, 'index' + x);
    if (existsSync(idx)) return idx;
  }
  return null;
}

// STATIC imports only. A dynamic import() is a deliberate async boundary and does
// not create an initialisation-order cycle, so it must not be counted.
const IMPORT_RE = /^\s*(?:import\s[^'"]*from\s*|import\s*|export\s[^'"]*from\s*)['"]([^'"]+)['"]/gm;

const graph = new Map();
for (const f of files) {
  const src = readFileSync(f, 'utf8');
  const deps = new Set();
  for (const m of src.matchAll(IMPORT_RE)) {
    const target = resolveSpec(f, m[1]);
    if (target) deps.add(target);
  }
  graph.set(f, [...deps]);
}

// Iterative DFS with an explicit stack — finds every distinct cycle once.
const cycles = [];
const seen = new Set();
const WHITE = 0, GREY = 1, BLACK = 2;
const color = new Map(files.map(f => [f, WHITE]));

for (const start of files) {
  if (color.get(start) !== WHITE) continue;
  const stack = [[start, 0]];
  const path = [];
  const onPath = new Set();
  color.set(start, GREY);
  path.push(start); onPath.add(start);

  while (stack.length) {
    const frame = stack[stack.length - 1];
    const [node, idx] = frame;
    const deps = graph.get(node) || [];
    if (idx >= deps.length) {
      color.set(node, BLACK);
      stack.pop(); path.pop(); onPath.delete(node);
      continue;
    }
    frame[1] += 1;
    const next = deps[idx];
    if (onPath.has(next)) {
      const at = path.indexOf(next);
      const cyc = [...path.slice(at), next].map(p => relative(ROOT, p).replace(/\\/g, '/'));
      const key = [...cyc].slice(0, -1).sort().join('|');
      if (!seen.has(key)) { seen.add(key); cycles.push(cyc); }
      continue;
    }
    if (color.get(next) === WHITE) {
      color.set(next, GREY);
      stack.push([next, 0]);
      path.push(next); onPath.add(next);
    }
  }
}

console.log(`Scanned ${files.length} modules under src/.`);
if (cycles.length) {
  console.error(`\nCIRCULAR IMPORTS FOUND (${cycles.length}):\n`);
  for (const c of cycles) console.error('  ' + c.join('\n    → ') + '\n');
  console.error('A cycle can bundle in an order where a const is read before it is');
  console.error('initialised — fatal in the production build, often invisible in dev.');
  console.error('Fix: extract the shared piece into a leaf module, or invert the edge.\n');
  console.error(`Import-cycle check FAILED: ${cycles.length} cycle(s).`);
  process.exit(1);
}
console.log('OK   no circular imports\n');
console.log('Import-cycle check passed.');
