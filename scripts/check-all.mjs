#!/usr/bin/env node
//
// Runs EVERY content/logic validator (scripts/check-*.mjs + scripts/verify-*.mjs)
// and exits non-zero if any of them fails. This is the single command CI and
// `npm run check` invoke, so a guard can no longer pass merely because a human
// forgot to run it.
//
// WHAT IS IN THE SET, AND WHAT IS DELIBERATELY NOT:
//   • check-*.mjs   — the invariant guards (each exits 1 on a violation).
//   • verify-*.mjs  — the content guards (also exit 1 on a violation).
// Counts are deliberately NOT written here: the set is auto-discovered from disk
// and printed at run time, so any number in this comment could only go stale.
// EXCLUDED on purpose (they are not pass/fail invariant guards):
//   • fix-*/apply-*/import-*/write-*/audit-* — they MUTATE files or emit reports.
//   • smoke-production-routes.mjs — needs a live URL (run in the post-deploy step).
//   • visual-check.mjs — a Playwright render harness, run via `npm run visual`.
//   • verify-*.js (not .mjs) — one-off migration helpers, not standing guards.
//
// Cross-platform (Windows dev + Ubuntu CI): pure Node, no shell globbing, no deps.
// Timezone note: every guard here is hermetic and timezone-independent AFTER the
// stats.js streak fix; CI additionally runs this whole set under several TZ values
// (see .github/workflows/validate.yml) so a timezone regression fails the build.

import { readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const SCRIPTS_DIR = dirname(fileURLToPath(import.meta.url));

const validators = readdirSync(SCRIPTS_DIR)
  .filter((f) => /^(check|verify)-.*\.mjs$/.test(f) && f !== 'check-all.mjs')
  .sort();

if (validators.length === 0) {
  console.error('check-all: found no validators — refusing to report success.');
  process.exit(1);
}

console.log(`Running ${validators.length} validators (${process.env.TZ ? `TZ=${process.env.TZ}` : 'system TZ'})\n`);

const failed = [];
for (const name of validators) {
  const res = spawnSync(process.execPath, [join(SCRIPTS_DIR, name)], {
    stdio: ['ignore', 'pipe', 'pipe'],
    encoding: 'utf8',
  });
  const ok = res.status === 0 && !res.error;
  if (ok) {
    console.log(`PASS  ${name}`);
  } else {
    failed.push(name);
    console.error(`FAIL  ${name}  (exit ${res.status ?? 'n/a'}${res.error ? `, ${res.error.message}` : ''})`);
    // Surface the failing validator's own output so CI logs are actionable.
    const out = `${res.stdout || ''}${res.stderr || ''}`.trimEnd();
    if (out) console.error(out.split('\n').map((l) => `      │ ${l}`).join('\n'));
  }
}

console.log(`\n${validators.length - failed.length}/${validators.length} validators passed.`);
if (failed.length > 0) {
  console.error(`\nFAILED (${failed.length}): ${failed.join(', ')}`);
  process.exit(1);
}
console.log('All validators green.');
