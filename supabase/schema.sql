-- ============================================================================
-- Tuk Talk Thai — Supabase schema
-- ============================================================================
-- Paste this entire file into the Supabase SQL Editor and click Run.
-- Creates 6 tables, row-level security policies, auto-provisioning trigger,
-- and updated_at triggers. Safe to re-run: uses `create table if not exists`
-- where Postgres allows; otherwise wrapped in idempotent checks.
--
-- After running this, verify in Authentication → Policies that every table
-- has RLS enabled and 4 policies (select/insert/update/delete).

-- ----------------------------------------------------------------------------
-- 1. profiles — user identity + per-user preferences (1:1 with auth.users)
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  onboarding_completed boolean default false,
  selected_voice text default 'male' check (selected_voice in ('male', 'female')),
  -- Free-form per-user settings that don't justify their own column.
  -- View mode, theme, audio rate, audio auto-play, daily goal, etc.
  settings jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles select own" on public.profiles;
drop policy if exists "profiles insert own" on public.profiles;
drop policy if exists "profiles update own" on public.profiles;
drop policy if exists "profiles delete own" on public.profiles;

create policy "profiles select own" on public.profiles for select using (auth.uid() = id);
create policy "profiles insert own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles update own" on public.profiles for update using (auth.uid() = id);
create policy "profiles delete own" on public.profiles for delete using (auth.uid() = id);

-- ----------------------------------------------------------------------------
-- 2. user_stats — aggregate gamification state (1:1 with auth.users)
-- ----------------------------------------------------------------------------
create table if not exists public.user_stats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references auth.users(id) on delete cascade,
  total_xp integer default 0,
  current_streak integer default 0,
  longest_streak integer default 0,
  last_active_date date,
  cards_seen integer default 0,
  cards_mastered integer default 0,
  -- Fields beyond the minimum spec — needed for full state sync across devices.
  current_stage integer default 1,
  started_stage integer default 1,
  total_reviews integer default 0,
  today_xp integer default 0,
  today_xp_date date,
  last_xp_activity_at timestamptz,
  daily_goal integer default 50,
  daily_goals_hit integer default 0,
  tones_quiz_passed boolean default false,
  tones_quiz_best integer default 0,
  quizzes_passed integer default 0,
  perfect_quizzes integer default 0,
  challenge_attempts integer default 0,
  challenge_correct integer default 0,
  challenge_wrong integer default 0,
  last_challenge_date date,
  best_challenge_score integer default 0,
  best_challenge_total integer default 0,
  streak_freezes integer default 1,
  last_freeze_grant timestamptz,
  last_seen_mission integer default 1,
  stage1_celebration_shown boolean default false,
  dialogues_completed jsonb default '[]'::jsonb,
  known_card_ids jsonb default '[]'::jsonb,
  -- Hearts + gems economy (migration 009_hearts_gems_cancel). hearts: gentle
  -- lives used ONLY in the Challenge (max 5, regenerate over time, Super =
  -- unlimited); gems: earned currency spent in the Shop.
  hearts integer not null default 5,
  gems integer not null default 0,
  hearts_updated_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.user_stats enable row level security;

drop policy if exists "user_stats select own" on public.user_stats;
drop policy if exists "user_stats insert own" on public.user_stats;
drop policy if exists "user_stats update own" on public.user_stats;
drop policy if exists "user_stats delete own" on public.user_stats;

create policy "user_stats select own" on public.user_stats for select using (auth.uid() = user_id);
create policy "user_stats insert own" on public.user_stats for insert with check (auth.uid() = user_id);
create policy "user_stats update own" on public.user_stats for update using (auth.uid() = user_id);
create policy "user_stats delete own" on public.user_stats for delete using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- 3. user_progress — SRS state per (user, card)
-- ----------------------------------------------------------------------------
create table if not exists public.user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  card_id integer not null,
  ease real not null default 2.5,
  interval integer not null default 0,
  reps integer not null default 0,
  lapses integer not null default 0,
  -- `learning` is required by the SM-2 algorithm (lib/srs.js) to distinguish
  -- a card still in the short-interval learning phase from a mature card.
  learning boolean not null default false,
  next_review timestamptz not null,
  last_review timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, card_id)
);

create index if not exists idx_user_progress_user on public.user_progress (user_id);
create index if not exists idx_user_progress_due on public.user_progress (user_id, next_review);

alter table public.user_progress enable row level security;

drop policy if exists "user_progress select own" on public.user_progress;
drop policy if exists "user_progress insert own" on public.user_progress;
drop policy if exists "user_progress update own" on public.user_progress;
drop policy if exists "user_progress delete own" on public.user_progress;

create policy "user_progress select own" on public.user_progress for select using (auth.uid() = user_id);
create policy "user_progress insert own" on public.user_progress for insert with check (auth.uid() = user_id);
create policy "user_progress update own" on public.user_progress for update using (auth.uid() = user_id);
create policy "user_progress delete own" on public.user_progress for delete using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- 4. user_missions — explicit mission completion events
-- ----------------------------------------------------------------------------
create table if not exists public.user_missions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  stage integer not null,
  mission integer not null,
  completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz default now(),
  unique (user_id, stage, mission)
);

create index if not exists idx_user_missions_user on public.user_missions (user_id);

alter table public.user_missions enable row level security;

drop policy if exists "user_missions select own" on public.user_missions;
drop policy if exists "user_missions insert own" on public.user_missions;
drop policy if exists "user_missions update own" on public.user_missions;
drop policy if exists "user_missions delete own" on public.user_missions;

create policy "user_missions select own" on public.user_missions for select using (auth.uid() = user_id);
create policy "user_missions insert own" on public.user_missions for insert with check (auth.uid() = user_id);
create policy "user_missions update own" on public.user_missions for update using (auth.uid() = user_id);
create policy "user_missions delete own" on public.user_missions for delete using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- 5. user_achievements — unlocked achievement IDs per user
-- ----------------------------------------------------------------------------
create table if not exists public.user_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  achievement_id text not null,
  unlocked_at timestamptz default now(),
  unique (user_id, achievement_id)
);

create index if not exists idx_user_achievements_user on public.user_achievements (user_id);

alter table public.user_achievements enable row level security;

drop policy if exists "user_achievements select own" on public.user_achievements;
drop policy if exists "user_achievements insert own" on public.user_achievements;
drop policy if exists "user_achievements update own" on public.user_achievements;
drop policy if exists "user_achievements delete own" on public.user_achievements;

create policy "user_achievements select own" on public.user_achievements for select using (auth.uid() = user_id);
create policy "user_achievements insert own" on public.user_achievements for insert with check (auth.uid() = user_id);
create policy "user_achievements update own" on public.user_achievements for update using (auth.uid() = user_id);
create policy "user_achievements delete own" on public.user_achievements for delete using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- 6. Auto-create profile + user_stats on signup
-- ----------------------------------------------------------------------------
-- Fires after Supabase Auth creates a new user. Adds the matching profile and
-- user_stats row so the client doesn't need a separate provisioning round trip.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, created_at)
  values (new.id, new.email, now())
  on conflict (id) do nothing;

  insert into public.user_stats (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- 7. Auto-update updated_at columns on row updates
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists set_user_stats_updated_at on public.user_stats;
create trigger set_user_stats_updated_at
  before update on public.user_stats
  for each row execute function public.set_updated_at();

drop trigger if exists set_user_progress_updated_at on public.user_progress;
create trigger set_user_progress_updated_at
  before update on public.user_progress
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 8. email_exists RPC — used by the sign-in form to distinguish "wrong
--    password" from "no account yet" without exposing all profile rows.
--    SECURITY DEFINER bypasses RLS for this one boolean lookup.
-- ----------------------------------------------------------------------------
create or replace function public.email_exists(check_email text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where lower(email) = lower(check_email)
  );
$$;

grant execute on function public.email_exists(text) to anon, authenticated;

-- ----------------------------------------------------------------------------
-- 9. subscriptions — server-authoritative Super entitlement (1:1 with auth.users)
-- ----------------------------------------------------------------------------
-- Reflects migrations 007_billing_entitlements + 009_hearts_gems_cancel. Written
-- ONLY by the Stripe billing webhook (service_role); clients may read their own
-- row. super_until is the single truth for Super access across web/iOS/Android;
-- cancel_at_period_end flags a scheduled cancel (Super stays active to period end).
create table if not exists public.subscriptions (
  user_id                uuid primary key references auth.users(id) on delete cascade,
  plan                   text not null default 'free',       -- 'free' | 'super_monthly' | 'super_yearly'
  status                 text not null default 'inactive',   -- 'active' | 'trialing' | 'past_due' | 'canceled' | 'inactive'
  provider               text,                               -- 'stripe' | 'apple' | 'google'
  super_until            timestamptz,                        -- entitlement expiry; NULL or past = NOT Super
  stripe_customer_id     text,
  stripe_subscription_id text,
  current_period_end     timestamptz,
  cancel_at_period_end   boolean not null default false,     -- scheduled cancel; Super stays active until current_period_end
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

comment on table public.subscriptions is
  'Server-authoritative Super entitlement. Written ONLY by the billing webhook (service_role). Clients read their own row. super_until is the single truth for Super access across web/iOS/Android.';

alter table public.subscriptions enable row level security;

-- Tight privileges: authenticated users may SELECT (RLS restricts to own row);
-- no INSERT/UPDATE/DELETE grant, so clients can never forge entitlement.
-- service_role bypasses RLS and is the sole writer (the webhook).
revoke all on public.subscriptions from anon, authenticated;
grant select on public.subscriptions to authenticated;

drop policy if exists subscriptions_select_own on public.subscriptions;
create policy subscriptions_select_own on public.subscriptions
  for select to authenticated
  using (auth.uid() = user_id);

create or replace function public.subscriptions_touch_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_subscriptions_touch on public.subscriptions;
create trigger trg_subscriptions_touch
  before update on public.subscriptions
  for each row execute function public.subscriptions_touch_updated_at();
