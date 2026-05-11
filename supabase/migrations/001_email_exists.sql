-- Migration 001: email_exists RPC for smart sign-in error UX.
-- Allows the unauthenticated client to ask "is this email registered?" so the
-- sign-in form can distinguish "wrong password" from "no account yet" and
-- offer the right next step. Bypasses RLS on profiles via SECURITY DEFINER.
--
-- Paste this into the Supabase SQL Editor and click Run.

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
