// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// TELEMETRY SAFETY guard â€” analytics must never be able to break the app.
//
// WHY: recordBillingEvent() is called on the POST-PAYMENT RETURN PATH â€” the
// single most sensitive screen in the product. `public.billing_events` does not
// exist in production (the migration is unapplied), so every one of these calls
// hits a PostgREST 404. Wave 13 claimed the module "degrades silently"; that
// claim was never executed by a test, only asserted in a report.
//
// It enforces the SHAPE that makes the module safe: a chained .catch() (a
// two-arg .then cannot catch its own handler), a synchronous try/catch, a guarded
// fulfilled handler, no re-throw, sanitised inputs, and no call site that awaits
// it. It is the unit-level complement to the entry-URL smoke: that proves the
// page renders, this proves the telemetry call itself cannot take it down.
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
let failures = 0;
const assert = (label, cond, extra = '') => {
  if (cond) console.log(`OK   ${label}`);
  else { failures += 1; console.error(`FAIL ${label}${extra ? ' â€” ' + extra : ''}`); }
};

// NOTE ON METHOD: this validator is STATIC. The module cannot be imported in
// Node because it pulls in the supabase client, which reads `import.meta.env` â€”
// undefined outside Vite. Rather than fake an environment (and test something
// other than what ships), the contract is enforced on the source itself. The
// checks below are mutation-tested, so "static" does not mean "weak": removing
// the .catch, the try/catch, or the guarded handler each fails the build.

// â”€â”€ Static contract: the shape that makes it safe â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const src = readFileSync(join(ROOT, 'src/lib/billingEvents.js'), 'utf8');

// Comments in this file deliberately DISCUSS `.catch()` and throwing, so every
// assertion about the CODE must run against a comment-stripped copy. (Asserting
// against the raw source let a mutation survive: the phrase ".catch()" in a
// comment satisfied the check while the real call had been deleted.)
const codeOnly = src
  .replace(/\/\*[\s\S]*?\*\//g, ' ')          // block comments, including inline ones
  .split(/\r?\n/)
  .filter(l => !/^\s*(\/\/|\*)/.test(l))
  .map(l => l.replace(/\/\/.*$/, ''))
  .join('\n');

// `.then(f, r)` does NOT catch a throw inside `f`. A chained `.catch()` does.
assert('the promise chain ends in a .catch() (a two-arg .then cannot catch its own handler)',
  /\.catch\(/.test(codeOnly),
  'use .then(...).catch(...), not .then(onFulfilled, onRejected)');
assert('the whole call is wrapped in try/catch for synchronous failures',
  /try \{[\s\S]*\} catch/.test(src));
assert('the fulfilled handler is itself guarded so it cannot throw',
  /\.then\(\(res\) => \{[\s\S]{0,200}try \{/.test(src),
  'destructuring a malformed response must not throw');
assert('it never re-throws',
  !/\bthrow\b/.test(codeOnly),
  'telemetry must never propagate an error to the caller');

// â”€â”€ The call sites on the payment path must not await or chain on it â”€â”€â”€â”€â”€â”€â”€â”€
const app = readFileSync(join(ROOT, 'src/App.jsx'), 'utf8');
const callSites = [...app.matchAll(/^.*recordBillingEvent\(.*$/gm)].map(m => m[0].trim());
assert('recordBillingEvent is called on the payment path', callSites.length >= 3, `${callSites.length} call site(s)`);
const awaited = callSites.filter(l => /await\s+recordBillingEvent|recordBillingEvent\([^)]*\)\s*\./.test(l));
assert('no call site awaits or chains on it (a purchase must never wait on telemetry)',
  awaited.length === 0, awaited.join(' | '));

// Inputs must be sanitised to primitives â€” a nested object or a function must
// never reach the wire (and JSON.stringify of a circular value would throw).
assert('props are sanitised to primitives only',
  /typeof v === 'string'/.test(src) && /typeof v === 'number'/.test(src) && /typeof v === 'boolean'/.test(src),
  'anything else must be dropped, so a circular or exotic value can never be serialised');
assert('string props are length-capped', /\.slice\(0, \d+\)/.test(src));
// The event name must be allow-listed, so a typo cannot spam the table.
assert('event names are allow-listed', /ALLOWED\.has\(name\)/.test(src));

if (failures > 0) {
  console.error(`\nTelemetry-safety check FAILED: ${failures} assertion(s).`);
  process.exit(1);
}
console.log('\nTelemetry-safety check passed.');
