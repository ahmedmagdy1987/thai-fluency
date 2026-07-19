// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// TEMPORAL DEAD ZONE guard â€” "does the app actually boot?" as a static check.
//
// THE BUG THIS EXISTS TO PREVENT (it took production down):
// a hook in a React component read a `const` declared HUNDREDS of lines further
// down the same component:
//
//     useEffect(() => { â€¦ superActive â€¦ }, [superActive, â€¦]);   // line 1291
//     â€¦
//     const superActive = isSuper(stats);                        // line 1856
//
// A hook's DEPENDENCY ARRAY is an ordinary expression evaluated inline during
// render, so this throws "Cannot access 'superActive' before initialization" on
// EVERY render and takes the whole app into the ErrorBoundary. It is invisible to
// linting-by-eye in a 3,200-line component, and it was invisible to the entire
// validator suite because nothing in CI ever booted the built app.
//
// This scans every component body for a top-level `const`/`let` that is READ at a
// line ABOVE its own declaration. It is deliberately conservative: it only looks
// at component-scope declarations (2-space indent) and ignores comments/strings,
// so a hit is a genuine forward reference, not a style opinion.
//
// It pairs with scripts/smoke-boot.mjs, which proves the built app boots in a real
// browser. This one tells you WHICH binding is wrong; that one tells you THAT the
// app is broken.
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'src');

const files = [];
(function walk(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(js|jsx)$/.test(e.name)) files.push(p);
  }
})(SRC);

// Strip comments and string/template literals so a name mentioned in prose or in
// a string can never be mistaken for a read.
function blankNonCode(src) {
  let out = '';
  let i = 0;
  const n = src.length;
  let state = null;   // 'line' | 'block' | '"' | "'" | '`'
  while (i < n) {
    const c = src[i];
    const c2 = src[i + 1];
    if (!state) {
      if (c === '/' && c2 === '/') { state = 'line'; out += '  '; i += 2; continue; }
      if (c === '/' && c2 === '*') { state = 'block'; out += '  '; i += 2; continue; }
      if (c === '"' || c === "'" || c === '`') { state = c; out += ' '; i += 1; continue; }
      out += c; i += 1; continue;
    }
    if (state === 'line') { if (c === '\n') { state = null; out += '\n'; } else out += ' '; i += 1; continue; }
    if (state === 'block') {
      if (c === '*' && c2 === '/') { state = null; out += '  '; i += 2; continue; }
      out += (c === '\n' ? '\n' : ' '); i += 1; continue;
    }
    // inside a string/template
    if (c === '\\') { out += '  '; i += 2; continue; }
    if (c === state) { state = null; out += ' '; i += 1; continue; }
    out += (c === '\n' ? '\n' : ' '); i += 1; continue;
  }
  return out;
}

let failures = 0;
const findings = [];

for (const file of files) {
  const raw = readFileSync(file, 'utf8');
  const code = blankNonCode(raw);
  const lines = code.split(/\r?\n/);

  // Component bodies: `export default function X(` â€¦ through end of file, and
  // `function X(` at column 0. We only need the outermost function's own scope.
  const compStarts = [];
  lines.forEach((l, i) => {
    if (/^(export default )?function [A-Z]\w*\s*\(/.test(l)) compStarts.push(i);
  });
  if (compStarts.length === 0) continue;

  for (let c = 0; c < compStarts.length; c++) {
    const start = compStarts[c];
    const end = (c + 1 < compStarts.length ? compStarts[c + 1] : lines.length) - 1;

    // Component-scope declarations: exactly two spaces of indent.
    const decls = new Map();   // name -> line index
    for (let i = start; i <= end; i++) {
      const m = lines[i].match(/^ {2}(?:const|let)\s+([A-Za-z_$][\w$]*)\s*=/);
      if (m && !decls.has(m[1])) decls.set(m[1], i);
    }

    // Everything from the component's own `return (` onward is JSX evaluated
    // DURING RENDER, so a forward reference there is just as fatal as one in a
    // dependency array. Wave 15: the original check only looked at dep arrays,
    // which is why a render-time read could still ship.
    let renderStart = Infinity;
    for (let i = start; i <= end; i++) {
      if (/^ {2}return \(/.test(lines[i])) { renderStart = i; break; }
    }

    for (const [name, declLine] of decls) {
      // Match the BINDING only, never a property of the same name: `stats.foo`
      // and `q.cat` are reads of `stats` / `q`, not of `foo` / `cat`. Without the
      // lookbehind this floods with false positives on `stats.firstLessonCompleted`
      // and `stageState?.maxUnlockedStage`.
      const re = new RegExp(`(?<![.\\w$])${name.replace(/\$/g, '\\$')}\\b`);
      for (let i = start; i < declLine; i++) {
        const line = lines[i];
        if (!re.test(line)) continue;

        // FATAL class 1 â€” a hook dependency array is an expression evaluated
        // inline during render.
        const inDepArray = /\}\s*,\s*\[[^\]]*\b/.test(line) || (/\],?\s*\)\s*;?\s*$/.test(line) && /\[/.test(line));
        // FATAL class 2 â€” anything inside the component's JSX return.
        const inRender = i >= renderStart;
        // FATAL class 3 â€” a component-scope const/let initialised from it, or a
        // bare call, both of which run immediately during render.
        const immediateBinding = /^ {2}(?:const|let)\s+[\w$]+\s*=/.test(line) || /^ {2}[\w$]+\(/.test(line);
        // A name in PARAMETER position ((cat) =>, unction f(cat)) is a new
        // binding that shadows, not a read of the outer one.
        const isParam = new RegExp(`\\(\\s*(?:[\\w$]+\\s*,\\s*)*${name}\\s*(?:,[^)]*)?\\)\\s*=>`).test(line)
          || new RegExp(`function\\s*[\\w$]*\\s*\\([^)]*\\b${name}\\b`).test(line);
        if (isParam) continue;

        if (!inDepArray && !inRender && !immediateBinding) continue;   // closure â€” safe
        findings.push({
          file: relative(ROOT, file).replace(/\\/g, '/'),
          name,
          useLine: i + 1,
          declLine: declLine + 1,
          kind: inDepArray ? 'hook dependency array'
            : inRender ? 'JSX render (evaluated every render)'
              : 'component-scope expression',
          text: raw.split(/\r?\n/)[i].trim().slice(0, 110),
        });
        break;
      }
    }
  }
}

if (findings.length) {
  failures = findings.length;
  console.error('TDZ FORWARD REFERENCES FOUND â€” these throw during render:\n');
  for (const f of findings) {
    console.error(`  ${f.file}:${f.useLine}  reads '${f.name}' but it is declared at line ${f.declLine}`);
    console.error(`      via a ${f.kind}: ${f.text}`);
    console.error(`      FIX: move the declaration above the hook, or derive the value locally.\n`);
  }
} else {
  console.log('OK   no component-scope binding is read above its declaration');
}

if (failures > 0) {
  console.error(`TDZ check FAILED: ${failures} forward reference(s). The app will crash on render.`);
  process.exit(1);
}
console.log('\nTDZ check passed.');
