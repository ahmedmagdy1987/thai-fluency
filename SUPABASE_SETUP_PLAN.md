# Supabase Setup Plan — Auth + Cloud Sync

**Status:** Planning only. Nothing implemented yet. This document captures
everything needed to make an informed decision and the work required before
code is written.

## Why Supabase

For Tuk Talk Thai's current shape (solo project, no backend, want auth +
device sync), Supabase is the strongest fit:

| Requirement | Supabase | Firebase | Auth0 + Postgres self-hosted |
|---|---|---|---|
| Email/password auth | ✓ built-in | ✓ built-in | ✓ built-in / self |
| Google sign-in | ✓ one-toggle | ✓ one-toggle | ✓ |
| Free tier headroom | 50K MAU, 500MB DB | 10K MAU/month | 7K MAU |
| Postgres database | ✓ (real Postgres) | ✗ (Firestore — NoSQL) | ✓ (self-hosted) |
| Row-Level Security | ✓ built-in | ✓ rules-based | ✓ via Postgres |
| JS SDK | ✓ first-class | ✓ | mixed |
| Realtime sync | ✓ via subscriptions | ✓ via Firestore | self-build |
| Vendor lock-in | Low (open-source, plain Postgres) | High (Firestore is proprietary) | Low |
| Setup time | ~30 min | ~30 min | ~2-3 hours |

**Recommendation: Supabase.** Best fit for this app because (a) free tier
covers any realistic Tuk Talk Thai userbase for 1+ year, (b) the existing
localStorage data structure maps cleanly to Postgres tables, (c) no vendor
lock-in (we can self-host Postgres later if needed).

---

## What the owner must do BEFORE implementation

1. **Create a Supabase account** at https://supabase.com
   - Sign up with `journeypixofficial@gmail.com` (or chosen owner email)
   - Free tier — no credit card required
2. **Create a new project**
   - Name: `tuk-talk-thai`
   - Region: closest to majority users (likely **Singapore** for Thai
     learners + SE Asia reach). Pick this once — changing later requires
     project migration.
   - Database password: **GENERATE A STRONG ONE** and save it in a password
     manager. We won't need it day-to-day (we use the anon key), but losing
     it locks you out of database admin.
3. **Enable Google sign-in** in Auth → Providers → Google
   - This step requires a one-time setup with Google Cloud Console:
     1. Go to https://console.cloud.google.com/
     2. Create OAuth 2.0 Client ID for web application
     3. Add your domain to "Authorized JavaScript origins": `https://thai-fluency.vercel.app` and `http://localhost:5173`
     4. Add OAuth callback URL given by Supabase to "Authorized redirect URIs"
     5. Copy the Client ID + Client Secret into Supabase
   - **Time required**: ~15 minutes if you've done OAuth setup before; ~45 if new
4. **Provide these credentials to me** (safe to commit; the anon key is
   designed to be public — its security comes from row-level policies):
   - `SUPABASE_URL` (looks like `https://xxxxx.supabase.co`)
   - `SUPABASE_ANON_KEY` (long JWT string from project Settings → API)
5. **Approve privacy implications**
   - User email addresses will be stored on Supabase (EU-hosted servers by
     default; we can pick SG region instead — pick at project creation)
   - We'll need a short privacy text update in the app and Settings

---

## Database schema

Three tables, all with Row-Level Security so each user only reads/writes
their own data.

### `auth.users` (managed by Supabase, do not modify)
Supabase Auth creates and manages this. Holds email, password hash, etc.

### `user_progress`
The flashcard SRS state. One row per user-card pair where they have progress.

```sql
create table user_progress (
  user_id uuid references auth.users(id) on delete cascade,
  card_id integer not null,
  last_review bigint not null,         -- epoch ms
  next_due bigint not null,            -- epoch ms
  interval integer not null,
  ease real not null,
  reviews integer not null,
  lapses integer not null,
  learning boolean not null default false,
  updated_at timestamptz default now(),
  primary key (user_id, card_id)
);

alter table user_progress enable row level security;

create policy "users read own progress"
  on user_progress for select
  using (auth.uid() = user_id);

create policy "users write own progress"
  on user_progress for insert with check (auth.uid() = user_id);

create policy "users update own progress"
  on user_progress for update using (auth.uid() = user_id);

create policy "users delete own progress"
  on user_progress for delete using (auth.uid() = user_id);
```

### `user_stats`
Single row per user. All the non-SRS fields from current `stats`.

```sql
create table user_stats (
  user_id uuid primary key references auth.users(id) on delete cascade,
  streak integer default 0,
  last_study date,
  total_reviews integer default 0,
  total_xp integer default 0,
  daily_goal integer default 50,
  daily_goals_hit integer default 0,
  tones_quiz_passed boolean default false,
  tones_quiz_best integer default 0,
  quizzes_passed integer default 0,
  perfect_quizzes integer default 0,
  dialogues_completed jsonb default '[]'::jsonb,
  unlocked_achievements jsonb default '[]'::jsonb,
  current_stage integer default 1,
  started_stage integer default 1,
  has_onboarded boolean default false,
  voice text default 'male',
  view_mode text default 'speak',
  theme text default 'light',
  audio_rate real default 0.85,
  audio_auto_play boolean default false,
  streak_freezes integer default 1,
  last_freeze_grant timestamptz,
  stage1_celebration_shown boolean default false,
  last_seen_mission integer default 1,
  updated_at timestamptz default now()
);

alter table user_stats enable row level security;
create policy "users read own stats" on user_stats for select using (auth.uid() = user_id);
create policy "users write own stats" on user_stats for insert with check (auth.uid() = user_id);
create policy "users update own stats" on user_stats for update using (auth.uid() = user_id);
create policy "users delete own stats" on user_stats for delete using (auth.uid() = user_id);
```

### `known_card_ids` (denormalized)
Cards marked "known" via placement test or quick skip. Kept separate from
`user_progress` because these don't have SRS state (they're matured at
import time).

```sql
create table known_card_ids (
  user_id uuid references auth.users(id) on delete cascade,
  card_id integer not null,
  added_at timestamptz default now(),
  primary key (user_id, card_id)
);

alter table known_card_ids enable row level security;
create policy "users own known cards" on known_card_ids using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

### Indexes worth adding

```sql
create index user_progress_due_idx on user_progress (user_id, next_due);
```

(For "what's due now?" queries. Optional; skip until perf needs it.)

---

## Auth flow

### Sign up
1. User enters email + password
2. Client calls `supabase.auth.signUp({ email, password })`
3. Supabase sends verification email (we'll use Supabase's built-in template;
   can customize later)
4. User clicks link → confirmed
5. On first sign-in after confirmation: create empty rows in `user_stats`
   (with defaults) — call `ensureUserRow()`
6. If user has local progress (was using app before signing up), prompt
   "Upload your progress to cloud?" — if yes, run migration (below)

### Sign in
1. User enters email + password (or clicks "Sign in with Google")
2. `supabase.auth.signInWithPassword(...)` or `signInWithOAuth({ provider: 'google' })`
3. On success: load `user_stats` and `user_progress` from cloud
4. Replace local state with cloud state (or prompt if local is newer)

### Sign out
1. `supabase.auth.signOut()`
2. Clear in-memory state
3. localStorage stays as-is (acts as a fallback for offline / not-signed-in use)

### Password reset
1. User clicks "Forgot password?" on sign-in screen
2. `supabase.auth.resetPasswordForEmail(email)` sends reset link
3. Reset link opens `/reset-password` route in app
4. User enters new password → `supabase.auth.updateUser({ password })`

### Anonymous / not-signed-in
**Important**: the app must keep working for non-signed-in users (current
behavior, localStorage only). Auth is purely additive. Adding sign-in
unlocks cloud sync — it doesn't gate basic use.

---

## localStorage → cloud migration

Existing users have data in `localStorage['thai-fluency-state-v1']` containing
`{ progress, stats }`. When they sign up:

1. Detect: `loadState()` returns non-empty data AND user has just signed up
2. Prompt: "Save your existing progress to your account?" (yes/no)
3. If yes:
   - Transform local `stats` → `user_stats` row (one upsert)
   - Transform local `progress` map → `user_progress` rows (batch insert,
     ~150-500 rows depending on user)
   - Transform local `stats.knownCardIds` → `known_card_ids` rows
4. Mark local state with a flag `migrated: true` (don't re-prompt)
5. Going forward: writes go to both localStorage (offline-first) AND cloud
   (synced on next online)

Cloud write strategy: **debounced**, ~2 seconds after the last localStorage
write. Don't write on every card review — batch.

Conflict resolution (signed in on Device A, then sign in on Device B with
existing local data):

- Default: "Replace local with cloud" — safest for typical user
- Advanced (settings flag): "Merge" — pick the more recent value per field,
  union of progress map. Implement later if users ask.

---

## Code architecture plan

### New files
- `src/lib/supabase.js` — Supabase client singleton; reads URL+anon key from
  `import.meta.env.VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`
- `src/lib/auth.js` — wrapper around supabase.auth: `signUp`, `signIn`,
  `signInWithGoogle`, `signOut`, `resetPassword`, `currentUser()`, hook
- `src/lib/cloudStorage.js` — wraps `loadState`/`saveState` to also sync
  cloud when signed in. Keeps the existing function signatures (the App
  shouldn't need to know whether storage is local or cloud).
- `src/components/AuthModal.jsx` — sign in / sign up / forgot password UI
- `src/components/AccountSection.jsx` — slot in SettingsModal: signed-in
  email + sign-out button
- `.env.local` (NEW, gitignored) — `VITE_SUPABASE_URL=...`,
  `VITE_SUPABASE_ANON_KEY=...`

### Modified files
- `src/lib/storage.js` — delegates to `cloudStorage.js` when signed in
- `src/App.jsx` — load auth state on mount; show "Sign in" button in header
  for anon users; show user info for signed-in users
- `src/components/SettingsModal.jsx` — add AccountSection at the top
- `package.json` — add `@supabase/supabase-js` dependency

### Dependencies to add

```bash
npm install @supabase/supabase-js
```

About 50KB minified — no big bundle hit.

---

## Estimated implementation time

Assuming owner has Supabase project ready + URL + anon key + Google OAuth
configured:

| Task | Effort |
|---|---|
| Supabase client setup + env vars | 15 min |
| Auth functions (signUp/signIn/signOut/reset) | 1 hour |
| Auth UI: AuthModal + Account section | 1.5 hours |
| Cloud sync read/write + debounced batching | 1 hour |
| localStorage → cloud migration prompt | 45 min |
| Google sign-in wiring | 30 min |
| Schema SQL run + RLS verification | 30 min |
| Testing (sign up, sign in, sync to second browser, sign out, password reset) | 1.5 hours |
| Error handling + offline graceful degradation | 1 hour |
| **Total** | **~8 hours** |

iOS PWA users will have one extra wrinkle: Apple sometimes clears
localStorage after long periods of inactivity. The cloud sync mitigates
that — users won't lose data even if iOS evicts the local copy.

---

## Open questions to answer in next session

1. **Email verification required?** (recommendation: yes — built-in,
   reduces spam accounts)
2. **Allow anonymous accounts?** (Supabase supports this; not needed for v1)
3. **Profile fields beyond email?** (recommendation: skip for v1; can add
   `display_name` later)
4. **What happens if cloud write fails?** (recommendation: write to local
   anyway, retry on next online; show a small "syncing" indicator)
5. **GDPR right-to-delete?** (the `on delete cascade` clauses handle this:
   deleting the auth.users row removes all related data)

---

## Risks & mitigations

| Risk | Mitigation |
|---|---|
| User in plane mode loses data | localStorage always writes first; cloud syncs when online |
| Multiple-device conflicting writes | Default "replace local with cloud" on sign-in; advanced merge later |
| Supabase outage | App still works offline-only via localStorage; cloud writes queue |
| User abandons account | Free tier has no real per-row cost; we can prune inactive accounts after 12 months if needed |
| OAuth provider redirect issues | Test on each provider separately; document the exact redirect URI in setup |
| 50K free-tier limit | Pay tier starts at $25/month — well within reach if app monetizes |

---

## Next action

Owner: complete the Supabase + Google OAuth setup steps above, return the
two credentials. Once we have them, we can implement auth + sync in a
future session in ~8 hours of focused work.
