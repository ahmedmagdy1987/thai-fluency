-- 008_tutorial_seen_persistence.sql
-- Fix: the first-run tutorial re-appeared on every login because `tutorialSeen`
-- only lived in the profiles.settings JSON blob (fragile, timing-dependent) and
-- was reset to false by clearState on sign-out. Give it a durable home on
-- user_stats so it round-trips with the rest of the synced stats.
-- ADDITIVE + safe: defaults to false; existing rows are unaffected.

alter table public.user_stats
  add column if not exists tutorial_seen boolean not null default false;

comment on column public.user_stats.tutorial_seen is
  'True once the user has seen the first-run guided tutorial. Durable so it never re-shows on re-login.';
