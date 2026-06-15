# Retention & Monetization Note — Tuk Talk Thai

> Owner feedback item H. Practical, implementation-focused. Grounded in what
> this app already has. Every recommendation is tagged **proposal** unless it
> describes shipped behavior, and carries an effort tag (**S** ≤ a few hours,
> **M** ~a day or two, **L** ~a sprint+) and a launch-timing tag
> (**Pre-launch** / **Post-launch**). Conventions hold: plain CSS, React 18, no
> new deps, no router, localStorage + Supabase (see `CLAUDE.md`).

## Where the app stands today

The retention scaffolding is real and mostly working: a streak with auto
freeze (`lib/stats.js` + `App.jsx` `grantXp`), a daily XP goal with a +25 bonus,
four live daily quests (`lib/dailyQuests.js`), 30+ achievements
(`data/gamification.js`), and a full server-side push system (OneSignal +
Supabase, `NOTIFICATIONS.md`). The monetization scaffolding is **all preview**:
the Shop spends nothing (`ShopScreen.jsx`), `hearts`/`gems` are UI fallbacks not
real stats, the "Super" tier is a coming-soon page (`legalCopy.jsx`
`PremiumContent`, `SuperUpgradePrompt.jsx`), and there is **no payment provider,
no checkout, no entitlement**. So: retention loop = built and tuneable;
monetization loop = designed but not wired. The work ahead is mostly turning
existing previews into shippable surfaces, not inventing new systems.

---

## 1. Retention / streak / habit building

### What already exists (do not rebuild)
- **Streak engine** (`App.jsx` `grantXp`, `lib/stats.js`): increments on a new
  day if you studied yesterday; **auto-consumes a streak freeze** if you missed
  up to 2 days and have one (`streakFreezes` field, decremented in
  `startStudyDay`). A freeze is auto-granted at streak ≥ 7, once per 7 days,
  capped at 2 (`App.jsx` lines ~685). This is genuinely good — it forgives a
  slip without the user knowing the mechanic exists.
- **Daily goal**: `DEFAULT_DAILY_GOAL = 50` XP, +25 bonus on first cross per day
  (`startStudyDay`), rendered as the ring in `LearnPath.jsx` and `TodayTab`.
- **Four daily quests** (`lib/dailyQuests.js`): daily XP goal, practice 10
  cards, clear due cards, keep streak alive. One source of truth, can't
  contradict each other. Rewards are labeled "planned" in `QuestsScreen.jsx`.
- **Push**: `daily_reminder`, `streak_warning` (22:00 local on a 3+ streak),
  and `re_engagement` (7+ inactive days) already exist server-side
  (`NOTIFICATIONS.md`).

### Recommendations (proposals)
1. **Make streak freeze visible & earnable in the Shop.** The freeze mechanic is
   invisible today. Surface freeze count on the streak chip and wire the Shop's
   existing `streak-freeze` item (note already says "Earned through milestones")
   to actually grant one. Spending gems can wait; *earning* via milestones
   needs no economy. **M · Post-launch.**
2. **Add a "comeback" path for a broken streak.** When `lastStudy` gap > 2 days
   and no freeze was available, show a one-time "Pick up where you left off —
   your X-day record is safe" banner instead of resetting silently to 0. Pairs
   with the existing `re_engagement` push. **S–M · Post-launch.**
3. **Let users pick their daily goal.** `dailyGoal` is already in stats and read
   everywhere; add Casual/Regular/Serious (20/50/100) options in Settings.
   Self-chosen goals lift completion rates. **S · Pre-launch.**
4. **Compute `typical_study_hour` from real study times.** `NOTIFICATIONS.md`
   "Future Improvements" already flags this; today reminders fire on a static
   window. Personalizing the `daily_reminder` hour is the single highest-ROI
   push tweak. **M · Post-launch.**
5. **Add quiet hours + per-category opt-out polish.** Also flagged in
   `NOTIFICATIONS.md`. Prevents the streak_warning from feeling naggy. **S–M ·
   Post-launch.**
6. **Wire quest rewards (XP/gems) to completion.** `QuestsScreen.jsx` shows
   "Rewards planned" — granting XP on quest completion is a small, motivating
   win that needs no payments. **M · Post-launch.**

**Cadence guidance (proposal):** one `daily_reminder` per day max; one
`streak_warning` only on a 3+ streak at risk; `re_engagement` no more than once
per inactive week. Never two pushes the same day. This matches the existing
cooldown intent in the Edge Function.

---

## 2. Subscription logic for the planned "Super" tier

**Sacred rule:** the curated, staged locked path is the product. Super must
**not** unlock everything and flatten the journey. Gate **convenience,
cosmetics, and early access** — never the pedagogy. Reference:
`SuperUpgradePrompt.jsx`, `legalCopy.jsx` `PremiumContent`, route `/premium`.

> Note: `PremiumContent`'s current bullet "Unlock every lesson path… without
> waiting for every staged unlock" reads as *unlock everything*. Reframe it
> (proposal) as **early access** — Super users get the *next* stage a step
> sooner, not the whole course at once. This protects the curation.

### Gate as Super (proposals)
- **Early access to stages/packs**, not full unlock. The locked-path UI already
  teases this: `LearnPath.jsx` renders "Super early access coming soon" on
  locked stages, and `SuperUpgradePrompt` reasons (`locked`, `mission`,
  `mini-unit`) are written for this framing. **L · Post-launch (needs billing).**
- **Convenience**: unlimited hearts / no heart gate (once hearts ship),
  Double-XP power-up, free monthly streak freeze. All four already exist as
  preview items in `ShopScreen.jsx`. **M each · Post-launch.**
- **Cosmetics**: character skins / picker. Already previewed as "Character
  unlocks" in `ShopScreen.jsx`. Zero pedagogy impact — ideal Super pull. **M ·
  Post-launch.**
- **Cloud/quality-of-life**: priority feedback, early audio (the real-audio plan
  in `CLAUDE.md` TODO), offline pack downloads.

### Keep free forever
- The entire core staged path, all current cards, daily quests, streak, the
  achievement set, and the Guide. Beginners must reach real fluency value for
  free — that's the funnel.

### Pricing / trial thinking (proposals)
- **Founder offer**: already promised in `ShopScreen.jsx` footnote and
  `PremiumContent` ("Founder offer details… after beta"). Lifetime or
  steep-discount annual for early supporters; strong with a solo/indie story.
- **Free trial**: 7-day trial of Super convenience features after the user hits
  a habit signal (e.g. a 3-day streak) — convert when habit, not curiosity, is
  the driver.
- **No payments until a provider is chosen.** `PremiumContent` is explicit:
  "no checkout, no billing, no paid entitlement." Keep it that way until billing
  is a deliberate, owner-approved milestone. **L · Post-launch.**

---

## 3. Ad-free value & where ads could (later) live

- **Default stance: no ads in beta.** The Privacy Policy already states "We do
  not use learning progress for third-party advertising" (`legalCopy.jsx`).
  Keep the learning surface ad-free — it's a Super selling point
  (`PremiumContent`: "Remove future ads… if ads are added later").
- **If ads ever ship (proposal):** only at **natural session boundaries** — a
  single interstitial *after* a mission-complete reward screen
  (`MissionCompleteRewardScreen.jsx`), or a static banner on the Shop preview.
  **Never** mid-lesson, mid-card, or during the streak/quest moment — those are
  the dopamine beats that drive retention. **L · Post-launch, low priority.**
- Ad-free is then a clean, honest Super benefit rather than a nag. Most likely
  the right call for this app is **subscription-first, ads-never** for the
  learning flow.

---

## 4. Exclusive content / mission packs as premium pull

- The course is built from data-driven units (`data/miniUnits.js`, ~50+ units
  across 8 stages via `MINI_UNITS`) rendered by `LearnPath.jsx`. New units are
  pure data — **adding a pack is content work, not engine work.** This is the
  strongest, least-risky monetization lever.
- **Proposals:**
  - **Themed early-access packs** (e.g. "Street Food Deep Dive", "Renting an
    Apartment", "Songkran phrases"). Ship to Super first, fold into the free
    path later — exactly the "Early access to phrase packs" bullet already in
    `PremiumContent`. **M per pack (content) · Post-launch.**
  - **Fill Stages 5–8** (flagged thin in `CLAUDE.md` TODO). Doubles as core
    value *and* premium-pack runway. **L · ongoing.**
  - **Real audio** (`CLAUDE.md`: Fiverr/ElevenLabs plan) as an early-access
    Super perk before it rolls out to everyone. **L · Post-launch.**
- Keep packs additive. A pack should *extend* the journey, never gate a step
  the free learner needs to progress.

---

## 5. Prompt frequency & the annoyance balance

**The good model already exists.** `App.jsx` `requestSuperPrompt` throttles the
Super prompt to **once per local day** (`superPromptLastShownAt` checked against
`getLocalDateKey()`; persisted to localStorage *and* cloud settings). It only
fires on positive moments — finishing the first lesson, a mission, a mini-unit,
or tapping a locked feature (`handleLockedFeature`, `handleSetTab`). This is the
right pattern: **celebrate, then softly mention Super, never block.**

### Recommendations (proposals)
1. **Keep the once-per-day throttle as the global rule** for any future paywall
   surface — reuse `superPromptLastShownAt`, don't add a second uncoordinated
   timer. **S (discipline, not code).**
2. **Add a frequency cap, not just a daily cap.** After N dismissals
   ("Maybe later" in `SuperUpgradePrompt.jsx`) without a tap-through, back off
   to weekly. Store a small `superPromptDismissals` counter alongside the
   existing field. **S · Post-launch.**
3. **Never prompt mid-lesson or on a wrong answer.** Only on completion/locked
   surfaces, which is already the case — preserve it when adding new triggers.
4. **One CTA per surface.** The Shop footnote, locked stages, and the prompt all
   point to `/premium` via `onOpenSuper` — keep that single, calm path. Avoid
   stacking a banner + modal + footnote in one session.
5. **Soft, honest copy.** Current copy ("Coming soon", "Maybe later") sets no
   false expectation. Maintain that tone through launch — no fake urgency, no
   countdown timers.

---

## Do these first (prioritized)

1. **Let users choose their daily goal** (Settings, 20/50/100). **S · Pre-launch.**
2. **Reframe `PremiumContent` "unlock every path" → "early access"** so Super
   never threatens the curated path. **S · Pre-launch.**
3. **Personalize `daily_reminder` timing** from real study hours. **M · Post-launch.**
4. **Wire daily-quest rewards + make streak freeze visible/earnable.** **M · Post-launch.**
5. **Choose a billing provider + ship the Founder offer behind Super** (convenience
   + cosmetics + early-access packs only). **L · Post-launch.**
6. **Add the frequency-cap back-off** to `requestSuperPrompt`. **S · Post-launch.**

### Guardrails (non-negotiable)
- The curated staged path stays free and intact. Super = convenience, cosmetics,
  early access only.
- No payments until a provider is deliberately chosen and owner-approved.
- One prompt per day, on positive moments, single CTA, honest copy.
- The learning flow stays ad-free.
