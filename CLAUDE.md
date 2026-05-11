# Tuk Talk Thai — Claude Code Context

This file is read automatically by Claude Code when working in this project. It tells Claude what this project is, conventions, and patterns to follow.

## Project overview

A practical Thai-language learning PWA built with Vite + React. Targeted at expats and long-term visitors to Thailand. Speak-first design — reading/writing are deprioritized vs. spoken fluency.

Currently solo project for the owner's personal use. May be monetized later as a public app.

## Tech stack

- **Vite** (build tool, dev server)
- **React 18** with hooks (no class components, no state libraries)
- **Plain CSS** in `src/styles/app.css` (no Tailwind, no CSS-in-JS, no preprocessor)
- **localStorage** for persistence (no backend yet)
- **Browser SpeechSynthesis** for TTS (no audio files yet)
- **vite-plugin-pwa** for PWA capabilities

## Project structure

- `src/App.jsx` — main app component
- `src/components/*.jsx` — one component per file
- `src/data/*.js` — all content data (cards, dialogues, etc.)
- `src/lib/*.js` — non-UI logic (SRS, storage, voice transforms)
- `src/styles/app.css` — all styles, organized by component section

## Data conventions

### Cards (`src/data/cards.js`)

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

## Patterns to follow

- **One component per file**, default export
- Hooks at top of components, destructured imports from `react`
- **Props naming**: `voice`, `viewMode`, `progress`, `stats`, `setTab` — keep consistent across components
- **No prop drilling more than 2 levels** — if it goes deeper, refactor or use context (we don't have any contexts yet, but it's fine to add one if needed)
- **localStorage writes are batched** via the `saveState({ progress, stats })` call in App.jsx — don't write to localStorage directly from components

## Common tasks

### Adding cards

1. Open `src/data/cards.js`
2. Pick an unused `id` (current cards go up to ~960)
3. Add to the array with all required fields
4. Save — Vite hot-reload picks it up

### Adding a category

1. Open `src/data/taxonomy.js`
2. Add to `CATEGORIES` array: `{ id, name, icon, color }`
3. Reference the new `id` in card `cat` fields

### Adding to the Guide tab

The Guide has tabs: Tones, Tones Quiz, Pronunciation, Patterns, Idioms, Errors, Culture. To add a new section:
1. Add data array to `src/data/reference.js`
2. Create `<Section>.jsx` in `src/components/`
3. Wire it into `GuideTab.jsx` tab list and conditional render

### Changing styles

All styles live in `src/styles/app.css`. The file is roughly organized:
- CSS variables and dark mode
- Layout: `.app-root`, `.app-header`, `.app-nav`, `.app-main`
- Tab content: `.tab-content`
- Per-component styles grouped by component (`.srs-card-*`, `.quiz-*`, `.dialogue-*`, etc.)
- Responsive (`@media`) rules at the bottom of each section

## Known issues / TODO

- Audio uses browser TTS only. Quality varies by device. Plan to add real audio (Fiverr or ElevenLabs) when scaling up content.
- Total card count is 645. Target is ~3,000 words + 1,000 sentences = ~4,000 cards.
- Stages 5-8 are still light on content — biggest opportunity is filling these.
- Reading practice section not yet built. Writing practice deprioritized indefinitely.

## Don't do

- Don't add Tailwind / Emotion / styled-components. Stay with plain CSS.
- Don't add a state management library. React's built-in `useState` + lifted state via App.jsx is sufficient.
- Don't add a router. The 5-tab nav is hand-rolled in `App.jsx`.
- Don't introduce TypeScript. Project is small enough to not need it.
- Don't use `localStorage.getItem` directly — go through `lib/storage.js`.
