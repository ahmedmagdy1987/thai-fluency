// Cleanup pass:
//   1. Collapse "(m, X) (male)" -> "(male, X)" and "(f, X) (female)" -> "(female, X)".
//   2. Upgrade plain "(female)" -> "(female, formal)" on ดิฉัน cards.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');

const APPLY = process.argv.includes('--apply');

const FILES = [
  'src/data/cards.js',
  'src/data/cards-imported.js',
  'src/data/cards-imported-batch2.js',
  'src/data/cards-step2.js',
];

let totalChanges = 0;

for (const rel of FILES) {
  const abs = path.join(REPO_ROOT, rel);
  let text = fs.readFileSync(abs, 'utf-8');
  const lines = text.split(/\r?\n/);
  let fileChanges = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 1. Collapse double-annotation in en field
    //    "(m, X) (male)" -> "(male, X)"
    //    "(f, X) (female)" -> "(female, X)"
    let newLine = line;
    newLine = newLine.replace(/\(m,\s([^)]+)\)\s\(male\)/g, '(male, $1)');
    newLine = newLine.replace(/\(f,\s([^)]+)\)\s\(female\)/g, '(female, $1)');

    // 2. Upgrade ดิฉัน cards from (female) to (female, formal)
    if (/ดิฉัน/.test(newLine)) {
      // Avoid double-upgrade if already (female, formal)
      if (!/\(female,\s*formal\)/.test(newLine)) {
        newLine = newLine.replace(/\(female\)/, '(female, formal)');
      }
    }

    if (newLine !== line) {
      lines[i] = newLine;
      fileChanges++;
      if (fileChanges <= 12) {
        console.log(`  ${rel} line ${i + 1}`);
        console.log(`    before: ${line.trim()}`);
        console.log(`    after : ${newLine.trim()}`);
      }
    }
  }

  console.log(`${rel}: ${fileChanges} changes`);
  totalChanges += fileChanges;

  if (APPLY && fileChanges > 0) {
    fs.writeFileSync(abs, lines.join('\n'));
  }
}

console.log(`\nTotal: ${totalChanges} changes`);
console.log(APPLY ? 'Wrote.' : 'Dry run — pass --apply to write.');
