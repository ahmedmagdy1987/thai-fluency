# Tuk Talk Thai

A practical Thai-language learning app for expats. Speak first, polish later.

## What's in this project

This is a Vite + React PWA. It contains:

- **645+ flashcards** across 8 stages from Survival to Real-Life Fluency
- **Spaced repetition** (SM-2 algorithm)
- **Tones quiz, dialogues, idioms, culture notes**
- **Male/female voice toggle**, light/dark mode, speak/read view modes
- **Browser TTS** for Thai pronunciation (works on iOS/Android/desktop browsers)
- **Local persistence** via localStorage (your progress survives reloads)
- **PWA support** — install to home screen, works offline

## Setup (5 minutes)

You need Node.js installed. If you don't have it: https://nodejs.org → click the green LTS button → run installer with default settings.

Then in the Terminal/Command Prompt, in this folder:

```bash
npm install
npm run dev
```

This will print something like:

```
  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.1.42:5173/
```

Open the **Local** link in your browser. The app is now running on your computer.

## Use it on your phone

While `npm run dev` is running, your phone can connect to the **Network** URL:

1. Make sure your phone is on the same Wi-Fi as your computer
2. Open Safari/Chrome on your phone, type the Network URL into the address bar
3. To install as an app: tap Share → "Add to Home Screen"

This works as long as the dev server is running on your computer.

## Folder structure

```
thai-fluency/
├── src/
│   ├── App.jsx              ← main app component
│   ├── main.jsx             ← React entry point
│   ├── components/          ← all UI components (one file each)
│   │   ├── CardsTab.jsx
│   │   ├── BrowseTab.jsx
│   │   ├── QuizTab.jsx
│   │   ├── GuideTab.jsx
│   │   ├── TodayTab.jsx
│   │   └── ... (more)
│   ├── data/                ← all content data
│   │   ├── cards.js         ← flashcards
│   │   ├── reference.js     ← tones, dialogues, idioms, culture
│   │   ├── taxonomy.js      ← categories and stages
│   │   ├── gamification.js  ← achievements, XP rewards
│   │   └── lookup.js        ← word breakdown lookup
│   ├── lib/                 ← non-UI logic
│   │   ├── srs.js           ← spaced repetition algorithm
│   │   ├── storage.js       ← localStorage wrapper
│   │   ├── audio.js         ← text-to-speech
│   │   ├── voice.js         ← M/F voice transformations
│   │   ├── state.js         ← stage progression, placement test
│   │   └── stats.js         ← stats helpers, default state
│   └── styles/
│       └── app.css          ← all styling
├── public/                  ← static assets (icons, etc.)
├── index.html               ← HTML entry point
├── vite.config.js           ← build configuration
└── package.json             ← dependencies
```

## Adding more cards

Open `src/data/cards.js` and add new entries to the `CARDS` array. Format:

```js
{ id: 1234, thai: 'อาหาร', ph: 'aahǎan', en: 'food', type: 'w', stage: 2, cat: 'food' },
```

Field meanings:
- `id`: unique number — pick any unused integer
- `thai`: Thai script
- `ph`: phonetic (with tone marks: `à á â ǎ` for low/high/falling/rising)
- `en`: English meaning
- `type`: `'w'` (word), `'p'` (phrase), `'s'` (sentence), `'g'` (grammar)
- `stage`: 1-8 (which stage this card belongs to)
- `cat`: category id (see `taxonomy.js`)

Save the file and the dev server will hot-reload with your new cards.

## Adding sentence breakdowns

The app auto-generates word-by-word breakdowns for sentences using `src/data/lookup.js`. To improve coverage for new sentences, add new entries to `WORD_LOOKUP`:

```js
'phûut': { thai: 'พูด', en: 'to speak' },
```

Multi-word entries (longer keys) are matched first. Use that for idioms and fixed phrases.

## Building for production

```bash
npm run build
```

This creates a `dist/` folder with optimized static files. You can host these anywhere — Vercel, Netlify, GitHub Pages, your own server.

## Rendered visual checks (Playwright)

`scripts/visual-check.mjs` drives a real headless Chromium over the app's key
screens (Dating lesson/quiz, the out-of-hearts gate, Settings, Shop, the
MiniUnit challenge shuffle, the canceled-plan copy, `/feedback`) at both themes
and desktop + 375px, captures screenshots to `scripts/viz/artifacts/`, and
asserts on the live DOM.

One-time on a fresh machine, download the browser binary:

```bash
npx playwright install chromium
```

Then, with the dev server running (`npm run dev` in another terminal), run:

```bash
npm run visual                                                   # all scenes
node scripts/visual-check.mjs http://localhost:5173 --only mini-unit-shuffle
```

Screenshots land in `scripts/viz/artifacts/` (gitignored). The script always
exits 0 — visual asserts are advisory and backed by the screenshots.

## Deploying to Vercel (free, ~5 minutes)

1. Create a free GitHub account at github.com
2. Create a new empty repository on GitHub (call it whatever, e.g. `thai-fluency`)
3. In your Terminal in this folder:

   ```bash
   git init
   git add .
   git commit -m "initial"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/thai-fluency.git
   git push -u origin main
   ```

4. Go to vercel.com, sign up with GitHub
5. Click "Import Project" → select your repo → Deploy
6. 60 seconds later you have a live URL

After this, every time you `git push`, Vercel auto-deploys the new version.

## Working with Claude Code

This project is designed to be edited via Claude Code. In this folder:

```bash
claude
```

You can then ask Claude to:
- Add new content ("add 50 more food vocabulary cards to Stage 2")
- Adjust UI ("make the undo button more prominent")
- Implement features ("add a favorites tab")

Claude will edit the files directly and the dev server will hot-reload.

## Troubleshooting

**"npm: command not found"** — Node.js not installed. Get it from nodejs.org.

**"Cannot find module..."** — Run `npm install` first.

**App is blank / errors in browser console** — Open browser dev tools (F12 / right-click → Inspect → Console) and read the error. Most likely an import path issue. Tell Claude.

**My phone can't connect to localhost** — That's expected. Use the Network URL printed by `npm run dev`. Both devices need to be on the same Wi-Fi.

**Audio doesn't work** — Browser TTS requires a Thai voice installed. iOS and most modern Android phones have one by default. On desktop, Chrome and Edge work; Firefox sometimes lacks Thai. You may need to interact with the page once before audio works (browser anti-spam).

**My progress disappeared** — Check that you're using the same browser/profile. localStorage is per-browser. To export/backup, use the Settings panel (when added).

## Push notifications

Tuk Talk Thai sends daily reminders, streak warnings, milestone celebrations,
and re-engagement nudges via [OneSignal](https://onesignal.com). Setup steps,
architecture, message templates, and an admin broadcast guide live in
[NOTIFICATIONS.md](NOTIFICATIONS.md).

In short:
- **Client** picks up the `VITE_ONESIGNAL_APP_ID` env var, initializes the SDK
  after the user signs in + completes onboarding, and saves the subscription
  ID to `profiles.onesignal_player_id`.
- **Backend** is a Supabase Edge Function (`supabase/functions/send-notification`)
  triggered by Database Webhooks (milestone events) and a pg_cron hourly tick
  (scheduled notifications).
- **REST API Key** lives only in Supabase Edge Function secrets — never in Git,
  never on Vercel.

## Security audit + data isolation

Pre-launch security audit is in [SECURITY_AUDIT_REPORT.md](SECURITY_AUDIT_REPORT.md).
Data isolation review (every read/write tabulated, RLS verified) is in
[DATA_ISOLATION_AUDIT.md](DATA_ISOLATION_AUDIT.md).

## Next steps

- Use it daily, find what frustrates you
- Use Claude Code to add cards and fix things
- Deploy to Vercel for a real URL
- Add native audio recordings (Fiverr) when ready to monetize
- Wrap as native app via Capacitor for App Store submission
