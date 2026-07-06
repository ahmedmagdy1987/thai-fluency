# M1 Proposal — Server-trusted time for reward day-scoping (device-clock farming)

Status: **PROPOSAL ONLY. Not implemented. No DB changes applied.** This document
scopes a fix for the device-clock roll-forward risk (audit finding M1). It is for
review/approval; nothing here has been built or deployed.

## Problem

Every day-scoped reward decision uses the **client** local date
(`getLocalDateKey()` / `Date.now()`), which a user fully controls:

- **Daily review XP** — the per-card "earned XP once today" guard resets when the
  client date changes (`App.jsx` reviewXpDay guard).
- **Server review event key** — `review:${cardId}:${localDate}` is built from the
  client `local_date`; a new date string is a brand-new key the RPC treats as a
  fresh `awarded` event.
- **Daily quest / gem rewards** — the daily-goal bonus (+25 XP) and
  `GEMS_PER_DAILY_GOAL` fire on the first goal crossing per client day
  (`startStudyDay`).
- **Streak** — increments on the first study of each new client day (`computeStreak`).
- **Review "due" logic** — `nextDue <= Date.now()` uses the client clock, so
  rolling the clock forward makes every scheduled card instantly due.

By advancing the device clock forward one day (with the app open, so the day-
rollover effect does not pre-empt), a user can re-review the same cards for fresh
XP, re-cross the daily goal for more bonus XP + gems, and bump the streak — as
many times as they can advance the clock.

**Current real-world impact is LOW and bounded**, which is why this is a proposal,
not an emergency fix:
- The migration-010 `guard_user_stats` trigger clamps each sync: `total_xp` ≤
  +10000/write and never decreases, `gems` ≤ +1000/write, `current_streak` ≤
  +1/write. So a single sync can't post an absurd balance.
- Rewards are **self-only** — there is **no live leaderboard** (LeaderboardScreen
  is an explicit "coming soon" placeholder), and gems only buy Challenge heart
  refills. Inflating your own numbers changes nothing another user sees.
- The `award_reward` RPC already rejects a **future-dated** `at` payload > 5 min
  ahead — but the client currently never sends `at`, so that guard is dormant.

**This becomes materially exploitable the moment a leaderboard, social compare,
or gem-for-real-value feature ships.** The recommendation is to land this before
any such feature, not before then.

## Design principle

Make **the server the authority for "what day is it" and "is this card due"**,
while keeping the app fully usable offline. The client may *propose* a local date
(for timezone-correct day boundaries), but the server validates it against its own
trusted clock and rejects or clamps out-of-range values. XP amounts are already
server-authoritative (006c); this extends the same trust boundary to *time*.

## Proposed changes by area

### 1. Daily review XP
- `award_reward` already computes the XP amount server-side. Add server-side day
  validation: the RPC derives `server_day = (now() at time zone client_tz)::date`
  from a client-supplied IANA `tz` (validated against `pg_timezone_names`), and
  requires the `event_key`'s embedded date to equal `server_day` (± a grace
  window, below). A key dated to a future server-day is rejected (`stale_or_future_day`).
- Keep the client-side per-card day guard as a fast UX gate, but it is no longer
  the security boundary — the RPC is.

### 2. Daily quest / gem rewards
- The daily-goal bonus + `GEMS_PER_DAILY_GOAL` are currently **client-only**
  (`startStudyDay`). Move the "did you cross the goal today" award behind a server
  event: a new `daily_goal_reached` reward type with `event_key =
  daily_goal:${server_day}` — idempotent per server-day via the existing
  `reward_events` UNIQUE(user_id, event_key). Gems then post through the same
  guarded path. This makes the daily bonus unfarmable by clock changes.

### 3. Streak
- Streak is the hardest to make fully server-authoritative without a server-side
  "last active server-day" column. Proposed: add `user_stats.last_active_server_day
  date` written **only** by a server RPC (`touch_activity(tz)`), which sets it to
  the trusted `server_day` and returns the computed streak delta. The client
  displays the streak but the increment decision is server-derived (studied
  yesterday → +1; gap → reset), so rolling the clock cannot manufacture increments.
- The migration-010 guard already caps `current_streak` to +1/write as a backstop.

### 4. Review "due" logic
- Leave SRS scheduling client-side for responsiveness, but gate **XP for a due
  review** on the server: the RPC only pays `due_review_completed` XP when the
  card's stored `next_review` (server copy in `user_progress`) is `<= now()`
  server-time. A client that fakes local dueness still gets scheduling UX but no
  XP for a not-actually-due card. (Requires the RPC to read `user_progress`, which
  it currently does not.)

### 5. Offline behavior
- Offline, the client keeps working on its local clock and queues reward events
  locally (it already grants XP locally via the `unavailable` fallback path).
- On reconnect, queued events are replayed to `award_reward` with their original
  intended `local_date` + `tz` + a client `at` timestamp. The server accepts them
  only if they fall within the grace window relative to server time; anything
  older/newer than the window is recorded as `status: 'stale'` and pays 0 (SRS
  scheduling still applies). This preserves legitimate offline study while
  bounding clock abuse.

### 6. Grace windows
- **Past grace:** accept events whose day is `server_day` or `server_day - 1`
  (covers a genuine offline session that crosses midnight and syncs late, plus
  timezone edge cases). Older → `stale`, 0 XP.
- **Future tolerance:** reject any event dated beyond `server_day` (with a small
  `+5 min` clock-skew allowance on any `at` timestamp, matching the RPC's existing
  `future_dated_event` check).
- **Timezone:** validate the client `tz` against `pg_timezone_names`; fall back to
  UTC if missing/invalid so a user can't pick a fake offset to shift day boundaries.

## Implementation options (server side)

Three ways to enforce, in increasing order of surface area:

1. **Extend `award_reward` (recommended).** Add optional `tz` handling + server-
   day validation + (for due XP) a `user_progress` read, inside the existing RPC.
   Smallest blast radius; one deploy path; reuses the `reward_events` idempotency.
   Needs a new migration (function replace) + possibly the `last_active_server_day`
   column and a `touch_activity` RPC for streak.
2. **New Edge Function** `reward-gateway` that stamps server time and calls the
   RPC. More moving parts, another deployed function to secure (`verify_jwt`),
   no clear advantage over (1) since the DB already has `now()`.
3. **DB trigger on `reward_events`** that overwrites/validates the day from
   `now()`. Works but couples validation to insert-time and is harder to return
   friendly statuses to the client. Least preferred.

**Recommended: option 1** (extend the RPC), plus one additive migration for the
streak column/RPC.

## Migrations required (NONE to be applied without approval)

- `011_reward_day_validation.sql` (proposal): `create or replace function
  award_reward(...)` adding a `p_tz text` arg, server-day derivation, grace-window
  validation, and a `user_progress` dueness check for review XP. Additive/idempotent
  (function replace only), reversible by re-applying 006c.
- `012_activity_server_day.sql` (proposal, only if streak is included): add
  `user_stats.last_active_server_day date` (nullable, additive) + a
  `touch_activity(p_tz text)` SECURITY DEFINER RPC granted to `authenticated`.
- Rollback scripts `rollback/011_*.sql` (re-apply 006c) and `rollback/012_*.sql`
  (drop column + RPC) prepared alongside.

All SQL applied **manually by the owner in the Supabase SQL Editor** (this repo
has no privileged DB access), consistent with the 006 rollout.

## Rollout plan

1. Land the client changes behind a flag `SERVER_TRUSTED_TIME_ENABLED = false`:
   send `tz` + `at` on reward events; keep local day guards as UX only. Ship dark.
2. Apply `011` (and `012` if streak included) in production; verify with a test
   account: normal review pays once/day; a clock rolled forward → `stale`/rejected,
   0 XP; offline-then-sync within grace → paid; streak increments only on real
   server-day change.
3. Flip `SERVER_TRUSTED_TIME_ENABLED = true`, deploy, and re-run the reward smoke
   (learn/practice/mission/challenge/stage) plus explicit clock-roll tests.
4. Monitor `reward_events` for a spike in `stale` statuses (would indicate a
   timezone bug hitting legitimate users) before/after the flip.

## Rollback plan

- **Client:** flip `SERVER_TRUSTED_TIME_ENABLED = false` and redeploy — the app
  reverts to today's client-date behavior instantly (the extra `tz`/`at` fields
  are simply ignored by the pre-011 RPC).
- **DB:** re-apply `rollback/011_*.sql` (restores the 006c idempotency-only RPC)
  and, if used, `rollback/012_*.sql` (drops the column + `touch_activity`). Both
  additive and safe; no data migration to undo.

## Risks

- **Timezone correctness is the main hazard.** A wrong `tz`→server-day mapping
  could deny legitimate users their daily reward near midnight. Mitigations: the
  ± 1-day past grace window, validating `tz` against `pg_timezone_names`, and
  monitoring `stale` rates during the dark-launch.
- **RPC reading `user_progress` for dueness** adds coupling and a small perf cost
  per review event; index `user_progress(user_id, card_id)` already exists, so the
  lookup is a single indexed read.
- **Streak server-authority (012) is the most invasive piece.** It can be deferred:
  ship review-XP + daily-goal day validation first (biggest farm surface), and
  treat streak hardening as a fast follow, since the 010 guard already caps streak
  growth to +1/write.
- **Offline replay semantics** must be communicated so users don't perceive
  "lost" XP when a very stale offline session syncs — surface a gentle "synced,
  some older activity didn't count toward today" note if `stale` events occur.
- **No behavior change for honest users** is the success criterion; the dark-launch
  + `stale`-rate monitoring is how we prove that before flipping the flag.

## Recommendation

Defer until a leaderboard / social / real-value gem feature is on the near roadmap,
then implement **option 1** (extend `award_reward`) covering review XP + daily-goal
first, with streak hardening (012) as a fast follow. Until then the 010 guard, the
self-only scope, and the absence of a leaderboard keep the practical risk low.
