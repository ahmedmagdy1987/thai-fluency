// One-off verification: confirm no card's backslash count changed during fix.
import fs from 'node:fs';

const log = JSON.parse(fs.readFileSync('docs/content-audit-changes.json', 'utf-8'));
const BS = '\\';

let mismatches = 0;
for (const e of log) {
  if (!e.before || !e.after) continue;
  const bCount = e.before.split(BS).length - 1;
  const aCount = e.after.split(BS).length - 1;
  if (bCount !== aCount) {
    console.log(`id ${e.id} backslash-count ${bCount} -> ${aCount}`);
    console.log('  before:', e.before.trim());
    console.log('  after :', e.after.trim());
    mismatches++;
  }
}
console.log(`Backslash-count mismatches: ${mismatches}`);

// Also: confirm every "after" has same number of quote chars as before
let qmismatch = 0;
for (const e of log) {
  if (!e.before || !e.after) continue;
  const bSQ = (e.before.match(/'/g) || []).length;
  const aSQ = (e.after.match(/'/g) || []).length;
  const bDQ = (e.before.match(/"/g) || []).length;
  const aDQ = (e.after.match(/"/g) || []).length;
  if (bSQ !== aSQ || bDQ !== aDQ) {
    console.log(`id ${e.id} quote-count ${bSQ}/${bDQ} -> ${aSQ}/${aDQ}`);
    qmismatch++;
  }
}
console.log(`Quote-count mismatches: ${qmismatch}`);

// A changed backslash/quote count means the content-integrity fix altered escape
// structure it was supposed to preserve — a real regression, so fail (and
// `npm run check`) instead of just printing it.
if (mismatches > 0 || qmismatch > 0) {
  console.error(`\nEdit-integrity check FAILED: ${mismatches} backslash + ${qmismatch} quote mismatch(es).`);
  process.exit(1);
}
console.log('\nEdit-integrity check passed.');
