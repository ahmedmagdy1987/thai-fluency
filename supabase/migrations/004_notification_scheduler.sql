-- Migration 004: Notification scheduler
--
-- Sets up the hourly tick that fans out daily reminders, streak warnings,
-- and re-engagement notifications. Milestone events are handled by Database
-- Webhooks (configured separately in the dashboard — see NOTIFICATIONS.md).
--
-- PREREQUISITES — do these BEFORE running this file:
--   1. Deploy the supabase/functions/send-notification Edge Function
--      (Supabase Dashboard → Edge Functions → Deploy New Function → paste index.ts → Deploy)
--   2. Set Edge Function secrets:
--      Supabase Dashboard → Edge Functions → Manage Secrets → add:
--        ONESIGNAL_APP_ID     = 9dff8341-a44c-4b22-a863-467baabd6f7d
--        ONESIGNAL_REST_API_KEY = <your OneSignal REST API Key>
--   3. Find your project's service_role_key:
--      Supabase Dashboard → Project Settings → API → service_role (Reveal & copy)
--   4. Replace 'YOUR_SERVICE_ROLE_KEY_HERE' below with the actual key, then run.
--
-- Idempotent: safe to re-run.

create extension if not exists pg_net;
create extension if not exists pg_cron;

-- Store the service_role_key in Vault so pg_cron can authenticate to the
-- Edge Function without us hard-coding a secret in this file.
do $$
begin
  if exists (select 1 from vault.secrets where name = 'service_role_key') then
    update vault.secrets
       set secret = 'YOUR_SERVICE_ROLE_KEY_HERE'
     where name = 'service_role_key';
  else
    perform vault.create_secret('YOUR_SERVICE_ROLE_KEY_HERE', 'service_role_key');
  end if;
end $$;

-- SQL helper that POSTs {"mode":"tick"} to the Edge Function with the
-- service_role_key as Bearer auth. SECURITY DEFINER so the cron job can call it.
create or replace function public.tick_notifications()
returns void
language plpgsql
security definer
set search_path = public, vault, extensions
as $$
declare
  service_key text;
begin
  select decrypted_secret into service_key
  from vault.decrypted_secrets
  where name = 'service_role_key'
  limit 1;

  if service_key is null then
    raise notice 'service_role_key not found in Vault; tick skipped';
    return;
  end if;

  perform net.http_post(
    url := 'https://fkebzcywofzloaqeghtn.supabase.co/functions/v1/send-notification',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || service_key,
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object('mode', 'tick')
  );
end $$;

-- Schedule: every hour at minute 5. The :05 offset gives the wall-clock
-- hour boundary a moment to settle (so 19:00-typical-study-hour users
-- get their 18:00 reminder at 18:05 sharp).
do $$
begin
  -- Drop any prior schedule with the same name so re-running this file
  -- updates the schedule cleanly.
  if exists (select 1 from cron.job where jobname = 'tuk-talk-notification-tick') then
    perform cron.unschedule('tuk-talk-notification-tick');
  end if;
  perform cron.schedule(
    'tuk-talk-notification-tick',
    '5 * * * *',
    $job$ select public.tick_notifications(); $job$
  );
end $$;
