-- Migration 004: Notification scheduler
--
-- Sets up the hourly tick that fans out daily reminders, streak warnings,
-- and re-engagement notifications. Milestone events are handled by Database
-- Webhooks configured separately in the dashboard; see NOTIFICATIONS.md.
--
-- PREREQUISITES - do these BEFORE running this file:
--   1. Deploy the supabase/functions/send-notification Edge Function.
--   2. Set Edge Function secrets:
--        ONESIGNAL_APP_ID = 9dff8341-a44c-4b22-a863-467baabd6f7d
--        ONESIGNAL_REST_API_KEY = <your OneSignal REST API key>
--        NOTIFICATION_WEBHOOK_SECRET = <strong random secret>
--   3. Replace YOUR_NOTIFICATION_WEBHOOK_SECRET_HERE below with the same
--      NOTIFICATION_WEBHOOK_SECRET value, then run.
--
-- Never place a Supabase service-role key in this file, Vault entry, cron
-- function, or Database Webhook header.
--
-- Idempotent: safe to re-run.

create extension if not exists pg_net;
create extension if not exists pg_cron;

-- Store the dedicated webhook secret in Vault so pg_cron can authenticate to
-- the Edge Function without embedding a service-role bearer credential.
do $$
begin
  if exists (select 1 from vault.secrets where name = 'notification_webhook_secret') then
    update vault.secrets
       set secret = 'YOUR_NOTIFICATION_WEBHOOK_SECRET_HERE'
     where name = 'notification_webhook_secret';
  else
    perform vault.create_secret('YOUR_NOTIFICATION_WEBHOOK_SECRET_HERE', 'notification_webhook_secret');
  end if;
end $$;

-- SQL helper that POSTs {"mode":"tick"} to the Edge Function with the
-- dedicated webhook secret. SECURITY DEFINER so the cron job can call it.
create or replace function public.tick_notifications()
returns void
language plpgsql
security definer
set search_path = public, vault, extensions
as $$
declare
  webhook_secret text;
begin
  select decrypted_secret into webhook_secret
  from vault.decrypted_secrets
  where name = 'notification_webhook_secret'
  limit 1;

  if webhook_secret is null then
    raise notice 'notification_webhook_secret not found in Vault; tick skipped';
    return;
  end if;

  perform net.http_post(
    url := 'https://fkebzcywofzloaqeghtn.supabase.co/functions/v1/send-notification',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'X-Tuk-Notification-Secret', webhook_secret
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
