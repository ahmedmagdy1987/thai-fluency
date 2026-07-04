-- 010_guard_user_stats.sql
-- Server-side integrity guard for the client-written currency/score columns on
-- user_stats. The client legitimately upserts this row (progress, settings,
-- counters), so we do NOT revoke the write (that would break sync). Instead a
-- BEFORE trigger CLAMPS the sensitive columns to legitimate bounds/deltas, so a
-- user editing localStorage or calling the REST upsert directly can no longer
-- set an arbitrary balance (e.g. total_xp = 999999) — the exact devtools-forgery
-- vector. Legitimate small syncs pass through unchanged.
--
-- Rules:
--   total_xp        never decreases; a single write can add at most +10000.
--   today_xp        0 .. 100000.
--   current_streak  >= 0; a single write can increase by at most +1 (resets down ok).
--   longest_streak  monotonic (never decreases).
--   hearts          clamped 0 .. 5 (Super's "unlimited" is computed client-side).
--   gems            >= 0; a single write can add at most +1000; absolute cap 1,000,000.
--   On INSERT (new row) generous absolute caps stop an initial forged row.

create or replace function public.guard_user_stats()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.hearts         := least(greatest(coalesce(new.hearts, 5), 0), 5);
  new.gems           := least(greatest(coalesce(new.gems, 0), 0), 1000000);
  new.total_xp       := greatest(coalesce(new.total_xp, 0), 0);
  new.today_xp       := least(greatest(coalesce(new.today_xp, 0), 0), 100000);
  new.current_streak := greatest(coalesce(new.current_streak, 0), 0);
  new.longest_streak := greatest(coalesce(new.longest_streak, 0), 0);

  if tg_op = 'UPDATE' then
    if new.total_xp < old.total_xp then new.total_xp := old.total_xp; end if;
    if new.total_xp > old.total_xp + 10000 then new.total_xp := old.total_xp + 10000; end if;
    if new.gems > old.gems + 1000 then new.gems := old.gems + 1000; end if;
    if new.current_streak > old.current_streak + 1 then new.current_streak := old.current_streak + 1; end if;
    if new.longest_streak < old.longest_streak then new.longest_streak := old.longest_streak; end if;
  else
    if new.total_xp > 200000 then new.total_xp := 200000; end if;
    if new.current_streak > 3650 then new.current_streak := 3650; end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_guard_user_stats on public.user_stats;
create trigger trg_guard_user_stats
  before insert or update on public.user_stats
  for each row execute function public.guard_user_stats();
