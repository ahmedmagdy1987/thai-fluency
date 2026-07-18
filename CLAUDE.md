# Tuk Talk Thai — Claude Code Context

This file is read automatically by Claude Code when working in this project. It tells Claude what this project is, conventions, and patterns to follow.

## Project overview

A practical Thai-language learning PWA built with Vite + React, live at https://www.tuktalkthai.com. Targeted at expats and long-term visitors to Thailand. Speak-first design — reading/writing are deprioritized vs. spoken fluency.

Solo-owner project, live in production with real users possible at any time. Monetized via an optional "Super" subscription (Stripe; currently TEST-mode keys — no real revenue yet).

## Tech stack

- **Vite** (build tool, dev server) + **vite-plugin-pwa** (service worker at scope `/`; OneSignal's push worker registers at `/push/onesignal/` — one SW registration per scope is a hard browser rule, never put both at `/`)
- **React 18** with hooks (no class components except the required `ErrorBoundary` in `main.jsx`; no state libraries, no contexts yet)
- **Plain CSS** — `src/styles/app.css` (main), `src/styles/landing.css`, `src/styles/plans.css` (no Tailwind, no CSS-in-JS)
- **Supabase** — auth (email confirmation, password recovery), cloud sync of progress/stats/achievements, server-authoritative Super entitlement written by a Stripe webhook (`supabase/functions/`). The app HARD-FAILS without `VITE_SUPABASE_URL`/`VITE_SUPABASE_KEY`. localStorage remains the local persistence layer and works offline/anonymous.
- **Stripe** — embedded checkout on `/plans`; entitlement only ever written server-side by the webhook
- **OneSignal** — web push (lazy-loaded SDK, `src/lib/onesignal.js`)
- **Browser SpeechSynthesis** for TTS on web; the Capacitor TTS plugin on native builds (no audio files yet). A missing Thai voice triggers a one-time in-app hint.
- **Capacitor** — Android/iOS wrappers (`npm run mobile:*`)

## Project structure

- `src/App.jsx` — the hub: all per-user state, the hand-rolled URL router (pushState/popstate, route tables at the top of the file), cloud sync, celebration/overlay orchestration, and the screen decision tree (a precedence chain of early returns)
- `src/components/*.jsx` — one component per file; subfolders `auth/`, `legal/`, `profile/`
- `src/data/*.js` — content data. Cards live in FOUR files merged by `cards.js` (`RAW_CARDS` + `cards-imported.js` + `cards-imported-batch2.js` + `cards-step2.js` overrides/additions); `miniUnits.js` (96 guided lessons), `datingPhrases.js`/`datingQuestions.js`, `taxonomy.js`, `contentFlags.js` (mature/quarantine choke point), `nativeReviewSignoff.js` (approval manifest)
- `src/lib/*.js` — non-UI logic (SRS, storage, state derivations, economy, merge policy, sync scheduler, audio, speech)
- `src/config/*.js` — site constants (`site.js`), entitlements/prices (`entitlements.js`), Stripe publishable-key plumbing (`stripe.js`)
- `src/hooks/*.js` — small shared hooks
- `scripts/check-*.mjs` / `verify-*.mjs` — the validator suite; `npm run check` runs ALL of them via `check-all.mjs` (auto-discovered — currently 30) and CI runs the same set across several timezones

## Data conventions

### Cards

```js
{ id: 1234, thai: 'อาหาร', ph: 'aahǎan', en: 'food', type: 'w', stage: 2, cat: 'food' }
```

- `type`: `'w'` word, `'p'` phrase, `'s'` sentence, `'g'` grammar
- `stage`: 1-8 (matches STAGES in `taxonomy.js`)
- `cat`: must exist in `CATEGORIES` array in `taxonomy.js`
- `ph`: phonetic with tone marks `à á â ǎ` (low/high/falling/rising), no diacritic = mid
- Optional `note: 'string'` for clarifying notes

### Word lookup (`src/data/lookup.js`)

Used to auto-generate word-by-word breakdowns under sentence cards. Multi-word phrases (longer keys) are matched first:

```js
'phǒm yàak': { thai: 'ผมอยาก', en: 'I want to' }  // matched before 'phǒm' alone
```

## Conventions

- **Voice perspective is male by default** (ผม / ครับ). Female (ฉัน / ค่ะ) is auto-transformed at render via `lib/voice.js`. Never hard-code gendered content in two versions; write male-form, the system flips it.
- **Phonetic + English are always shown.** Thai script visibility depends on `viewMode`: speak (hidden), both, or read-mastery (only Thai).
- **Use `displayCard(card, voice)` whenever rendering a card** so M/F transforms apply.
- **Styling uses CSS custom properties** (`--jade`, `--cream`, `--ink`, etc.) defined on `.app-root`. Dark mode swaps the values via `[data-theme="dark"]` selector. Never hardcode colors except inside `--variable` definitions.
- **Breakdowns auto-generate** from `WORD_LOOKUP`. Adding entries there improves all sentences automatically — don't write inline `breakdown:` arrays unless a specific sentence needs custom handling.
- **User-facing name for a guided unit is "lesson"** — `mini-unit` is the internal data-model name (ids, code, comments) and must not leak into UI copy.

## Patterns to follow

- **One component per file**, default export
- Hooks at top of components, destructured imports from `react`
- **Props naming**: `voice`, `viewMode`, `progress`, `stats`, `setTab` — keep consistent across components
- **No prop drilling more than 2 levels** — if it goes deeper, refactor or use context (we don't have any contexts yet, but it's fine to add one if needed)
- **The main state blob is batched** via the single `saveState({ progress, stats })` call in App.jsx — don't write the main state from components. Auxiliary device-scoped keys (demo flag, prompt-fired flags, analytics ring buffer, dating ledgers, TTS hint) go through helpers in `lib/storage.js` where possible; a handful of legacy literals still live in App.jsx/analytics.js — don't add new raw `localStorage` calls.
- **Invariants are validator-enforced.** Economy rules (hearts graded-only, Super grants no gems), Super + 18+ gates, Dating lesson→quiz sequencing and its Thai→English-only lock, content-approval eligibility (nothing empty-`ph`/quarantined approved), card-id uniqueness, and more — `npm run check` must stay green; add a validator when you add an invariant.

## Common tasks

### Adding cards

1. Cards are spread across four files (see Project structure). New cards go in the newest batch file, NOT the legacy inline array in `cards.js`.
2. Pick an unused id: the merged id space currently reaches **5739** and is NOT contiguous — check `ALL_CARDS` before choosing (the `check-card-id-uniqueness` validator will fail CI on a collision).
3. Add the card with all required fields; run `npm run check`.

### Adding a category

1. Open `src/data/taxonomy.js`
2. Add to `CATEGORIES` array: `{ id, name, icon, color }`
3. Reference the new `id` in card `cat` fields

### Adding to the Guide tab

The Guide has 9 sections: Tones, Tone Challenge, Listen & Match, Say It (renders only when SpeechRecognition is supported), Pronunciation, Patterns, Idioms, Errors, Culture. To add a new section:
1. Add data array to `src/data/reference.js`
2. Create `<Section>.jsx` in `src/components/`
3. Wire it into `GuideTab.jsx` tab list and conditional render

### Changing styles

Main styles live in `src/styles/app.css` (landing/plans pages have their own sheets). The file is roughly organized:
- CSS variables and dark mode
- Shell layout: `.app-root`, `.app-shell-root`, `.app-shell-header`, `.app-shell-main`, plus `.sidebar-nav` (desktop ≥1024px) and `.mobile-nav` (bottom bar + More sheet)
- Tab content: `.tab-content`
- Per-component styles grouped by component (`.srs-card-*`, `.quiz-*`, `.dialogue-*`, etc.)
- Responsive (`@media`) rules at the bottom of each section
Some live selectors are constructed from template literals in JSX — grep before assuming a selector is dead.

## Navigation (how screens work)

- There is a **hand-rolled history router** in App.jsx: route tables (`TAB_ROUTES`/`ROUTE_TABS`/`PUBLIC_PAGE_ROUTES`/`AUTH_ROUTES`), `writeRoute` (pushState/replaceState), a popstate listener, and `applyRouteState` as the single reducer for routed surfaces.
- **10 tab render cases** exist (`learn, today, cards, browse, quiz, guide, quests, shop, dating, leaderboard`); the nav chrome (SidebarNav + MobileNav, hand-synced — keep them identical) shows 8 of them; `/today` and `/leaderboard` are URL-only.
- Full-screen overlays (celebration, reward screen, cinematic, etc.) are NON-routed state with explicit mutual-exclusion guards — when adding one, wire it into the exclusion chain (Stage-1 celebration > celebration > reward screen > achievement) and into the identity-change wipe list.
- Guided lessons push a sentinel history entry on start so browser Back closes the lesson; any route navigation clears both the local and the persisted lesson pointer.

## Known issues / TODO

- Audio uses TTS only (browser SpeechSynthesis / native engine). Real audio is a future upgrade.
- Total card count is ~4,780 in the free deck (4,792 incl. the 5 mature + 7 quarantined cards held out of it). 335 cards still have empty `ph` and 7 have corrupted Thai — the native-team worklists in `docs/native-author-worklist-*.json` feed `scripts/ingest-native-authoring.mjs`; approval flows only through the sign-off manifest.
- Content is back-loaded: cards grow per stage from ~150 (stage 1) to ~980 (stage 8), so stages 5-8 hold ~70% of the deck. The thinner area is early-stage *tourist situation* sessions (a stage-1 tourist gets only a couple of cards) — an owner content-authoring decision.
- **Stage names/descriptions promise situational content (taxis, banking) that stages 3/6/7/8 do not contain** (0.5-3% theme match — see `docs/architecture-assessment.md`). Renaming vs. re-theming is an OWNER decision; don't "fix" stage names without one.
- The card-progress ladder and the guided-lesson ladder are still independent (guided lessons write no card progress; units of passed stages become unstartable) — reconciliation is designed but deliberately deferred (see the assessment).
- Reading practice section not yet built. Writing practice deprioritized indefinitely.

## Don't do

- Don't add Tailwind / Emotion / styled-components. Stay with plain CSS.
- Don't add a state management library. React's built-in `useState` + lifted state via App.jsx is sufficient.
- Don't add a router LIBRARY — the hand-rolled router in App.jsx is the pattern; extend its route tables instead.
- Don't introduce TypeScript. Project is small enough to not need it.
- Don't read/write the main state blob outside `lib/storage.js` / the batched `saveState` call.
- Don't register any service worker at scope `/` other than the PWA worker.
- Don't put a literal deck count in user-facing copy — compute from `CARDS.length` (the old hardcoded "4,752" shipped stale).
- Don't approve content in code: approval flows only through `nativeReviewSignoff.js` + the eligibility floor in `cards.js`.
