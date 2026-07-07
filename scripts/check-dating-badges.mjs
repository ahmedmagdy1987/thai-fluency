// Regression guard for the Dating & Real Talk badge + gating policy.
//
// OWNER POLICY (2026-07-07): badges must NEVER be removed from this section.
// The Super gate hides PHRASES (Thai script, phonetics, examples, explanations)
// from locked users — never the badges. Locked users must still see the
// teaser/category/status badges (18+, Super, severity, register, native-review
// status), all English-only; Super users must see the full badge set on every
// phrase card (severity, usage guidance, register where flagged, review status,
// speaker form) plus category-header badges.
//
// This script statically asserts (a) the badge surfaces exist in both the locked
// and unlocked render paths, (b) the locked teaser leaks no Thai and no phrase
// data, and (c) the data files carry the fields the badges are derived from.
// It exits non-zero on any regression so the validators catch badge removal.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { DATING_CATEGORIES, DATING_SECTION } from '../src/data/datingContent.js';
import { DATING_PHRASES } from '../src/data/datingPhrases.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
let failures = 0;
const ok = (name) => console.log(`OK   ${name}`);
const fail = (name, detail) => { console.log(`FAIL ${name}  ${detail}`); failures++; };
const assert = (name, cond, detail = '') => (cond ? ok(name) : fail(name, detail));

const src = readFileSync(join(root, 'src/components/DatingSection.jsx'), 'utf8');

// ---- 1. Split the component into the locked and unlocked render paths --------
const lockedStart = src.indexOf('if (!superUser)');
const superStart = src.indexOf('SUPER SUBSCRIBERS');
assert('component has a locked branch', lockedStart !== -1);
assert('component has a Super branch after the locked branch', superStart > lockedStart);
const heroAndShared = src.slice(0, lockedStart);
const locked = src.slice(lockedStart, superStart);
const unlocked = src.slice(superStart);

// ---- 2. Hero badges (visible to EVERYONE, locked or not) ---------------------
assert('hero: 18+ badge', heroAndShared.includes('dating-badge-18'));
assert('hero: mature-language badge', heroAndShared.includes('dating-badge-mature'));
assert('hero: Super badge', heroAndShared.includes('dating-badge-super'));
assert('hero: review-status badge is NOT gated on superUser',
  /DATING_REVIEW_COMPLETE\s*\?/.test(heroAndShared) && !/superUser\s*&&[^\n]*dating-badge-draft/.test(heroAndShared),
  'review status is safe metadata and must show for locked users too');

// ---- 3. Locked teaser: status badges WITHOUT content leakage ------------------
assert('locked: Super + 18+ badges on the locked card',
  locked.includes('locked-premium-badge-super') && locked.includes('18+'));
assert('locked: per-category severity chips', locked.includes('dating-cat-sev'));
assert('locked: per-category status badge row', locked.includes('dating-teaser-item-badges'));
assert('locked: per-category review-status chip', locked.includes('reviewBadge(cat.reviewStatus)'));
assert('locked: register chip where flagged', locked.includes('CATEGORY_REGISTER[cat.id]'));
assert('locked: handle-with-care warning preserved', locked.includes('dating-teaser-care'));
// Leak guards: the locked branch must never touch phrase data or render Thai.
assert('locked: does not render DATING_PHRASES entries',
  !locked.includes('phrases.map') && !/\bp\.thai\b/.test(locked) && !/\bp\.ph\b/.test(locked));
assert('locked: no Thai script in the locked JSX', !/[฀-๿]/.test(locked));
assert('locked: no Thai script in datingContent.js (teaser data source)',
  !/[฀-๿]/.test(readFileSync(join(root, 'src/data/datingContent.js'), 'utf8')));

// ---- 4. Super view: full badge set on cards + category headers ----------------
assert('super: category header chip row', unlocked.includes('dating-cat-chiprow'));
assert('super: category severity chip', unlocked.includes('CAT_SEVERITY_LABEL[cat.severity]'));
assert('super: category review-status chip', unlocked.includes('reviewBadge(cat.reviewStatus)'));
assert('super: phrase-card badge row', unlocked.includes('dating-phrase-badges'));
assert('super: severity chip per phrase', unlocked.includes('SEVERITY_LABEL[p.severity]'));
assert('super: usage-guidance chip per phrase', unlocked.includes('USAGE_GUIDANCE[p.severity]'));
assert('super: register chip per phrase where flagged', unlocked.includes('CATEGORY_REGISTER[p.cat]'));
assert('super: review-status chip per phrase', unlocked.includes('reviewBadge(p.reviewStatus)'));
assert('super: speaker-form chip', unlocked.includes('isMaleForm(p)'));
assert('super: context label on notes', unlocked.includes('dating-note-label'));
assert('super: strong phrases keep the handle-with-care line', unlocked.includes('dating-phrase-care'));

// ---- 5. Badge derivations cover every value the data actually uses ------------
const usageMatch = src.match(/const USAGE_GUIDANCE = \{([\s\S]*?)\};/);
const reviewMatch = src.match(/const REVIEW_STATUS = \{([\s\S]*?)\};/);
assert('USAGE_GUIDANCE map exists', !!usageMatch);
assert('REVIEW_STATUS map exists', !!reviewMatch);
const severities = new Set(DATING_PHRASES.map((p) => p.severity).concat(DATING_CATEGORIES.map((c) => c.severity)));
for (const s of severities) {
  assert(`USAGE_GUIDANCE covers severity "${s}"`, !!usageMatch && usageMatch[1].includes(`${s}:`));
}
const statuses = new Set(DATING_PHRASES.map((p) => p.reviewStatus).concat(DATING_CATEGORIES.map((c) => c.reviewStatus)));
for (const st of statuses) {
  assert(`REVIEW_STATUS covers reviewStatus "${st}"`, !!reviewMatch && new RegExp(`['"]?${st}['"]?:`).test(reviewMatch[1]));
}

// ---- 6. Data invariants the badges depend on ----------------------------------
assert('section is marked 18+ / mature', DATING_SECTION.minAge === 18 && DATING_SECTION.matureLanguage === true);
assert('every phrase has severity + reviewStatus',
  DATING_PHRASES.every((p) => p.severity && p.reviewStatus),
  'a phrase without severity/reviewStatus renders unbadged');
assert('every category has severity + reviewStatus',
  DATING_CATEGORIES.every((c) => c.severity && c.reviewStatus));
assert('recognition-only category is flagged handleWithCare',
  DATING_CATEGORIES.filter((c) => c.id === 'mild-swears-insults').every((c) => c.handleWithCare === true));

console.log('');
if (failures > 0) {
  console.log(`Dating badge check FAILED (${failures} failure(s)).`);
  process.exit(1);
}
console.log('Dating badge check passed.');
