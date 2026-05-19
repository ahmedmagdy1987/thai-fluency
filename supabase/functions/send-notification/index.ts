// Edge Function: send-notification
//
// Dispatches push notifications via OneSignal. Three invocation modes:
//
//   1. Database Webhook (table = "user_missions" or "user_stats"):
//      Supabase posts the changed row. We detect milestone events and
//      send the matching notification to the user.
//
//   2. Direct invocation { mode: "send", user_id, type, data? }:
//      Used by tick mode internally; can also be called manually for testing.
//
//   3. Cron tick { mode: "tick" }:
//      Hourly pg_cron job. Scans all subscribed users and sends scheduled
//      notifications (daily reminder, streak warning, re-engagement)
//      to whoever matches the current hour in their local timezone.
//
// Auth: every POST path requires X-Tuk-Notification-Secret, so database
// webhooks and pg_cron do not need to embed service-role bearer credentials.
//
// Required Edge Function secrets:
//   ONESIGNAL_APP_ID            (public; for convenience, mirrors VITE_ONESIGNAL_APP_ID)
//   ONESIGNAL_REST_API_KEY      (sensitive; never set on Vercel)
//   NOTIFICATION_WEBHOOK_SECRET (sensitive; shared only with DB webhooks/cron)
//
// Auto-injected by Supabase:
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.105.4";

const ONESIGNAL_APP_ID = Deno.env.get("ONESIGNAL_APP_ID") ?? "";
const ONESIGNAL_REST_API_KEY = Deno.env.get("ONESIGNAL_REST_API_KEY") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const NOTIFICATION_WEBHOOK_SECRET = Deno.env.get("NOTIFICATION_WEBHOOK_SECRET") ?? "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// Per-user anti-spam: don't send more than one notification within this window.
const COOLDOWN_MINUTES = 60;

// App URL the user lands on when they tap a notification.
const APP_URL = "https://thai-fluency.vercel.app/";

function constantTimeEqual(a: string, b: string): boolean {
  const maxLength = Math.max(a.length, b.length);
  let mismatch = a.length === b.length ? 0 : 1;
  for (let i = 0; i < maxLength; i++) {
    mismatch |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }
  return mismatch === 0;
}

function hasValidNotificationSecret(req: Request): boolean {
  const provided = req.headers.get("X-Tuk-Notification-Secret") ?? "";
  return !!NOTIFICATION_WEBHOOK_SECRET && constantTimeEqual(provided, NOTIFICATION_WEBHOOK_SECRET);
}

// Message variants. Picked deterministically per (user, day) so each user
// sees variety across days without us tracking which variant they last got.
type Variant = { title: string; body: string };

const MESSAGES: Record<string, Variant[]> = {
  daily_reminder: [
    { title: "🌱 Tuk Talk Thai", body: "Your Thai practice is waiting." },
    { title: "Tuk Talk Thai", body: "Just 5 minutes keeps your momentum." },
    { title: "Tuk Talk Thai", body: "Your mission cards are due for review." },
  ],
  streak_warning: [
    { title: "🔥 Don't lose your streak", body: "A quick 5-minute review keeps your {streak}-day streak alive." },
  ],
  re_engagement: [
    { title: "We miss you 🇹🇭", body: "Your Thai is waiting." },
    { title: "Tuk Talk Thai", body: "You're {days} days from your last review. One mission is 5 minutes away." },
    { title: "Tuk Talk Thai", body: "Quick win: one mission is 5 minutes away." },
  ],
  milestone_mission: [
    { title: "🎉 Mission {n} complete!", body: "Tap to start the next one." },
  ],
  milestone_stage: [
    { title: "👑 Stage {n} complete!", body: "Onward — Stage {next} unlocked." },
  ],
  milestone_xp: [
    { title: "✨ {xp} XP earned!", body: "Your momentum is paying off." },
  ],
};

function pickVariant(type: string, userId: string, dateKey: string): Variant | null {
  const variants = MESSAGES[type];
  if (!variants || variants.length === 0) return null;
  let h = 0;
  const seed = userId + dateKey;
  for (let i = 0; i < seed.length; i++) {
    h = ((h << 5) - h) + seed.charCodeAt(i);
    h |= 0;
  }
  return variants[Math.abs(h) % variants.length];
}

function template(s: string, data: Record<string, unknown>): string {
  return s.replace(/\{(\w+)\}/g, (_, k) => String(data[k] ?? ""));
}

async function sendOneSignal(opts: {
  player_id: string;
  title: string;
  body: string;
  data: Record<string, unknown>;
}): Promise<{ ok: boolean; raw: unknown }> {
  const payload = {
    app_id: ONESIGNAL_APP_ID,
    include_player_ids: [opts.player_id],
    contents: { en: opts.body },
    headings: { en: opts.title },
    data: opts.data,
    url: APP_URL,
  };
  const res = await fetch("https://onesignal.com/api/v1/notifications", {
    method: "POST",
    headers: {
      "Authorization": `Basic ${ONESIGNAL_REST_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const raw = await res.json();
  return { ok: res.ok, raw };
}

async function dispatchSend(
  userId: string,
  type: string,
  data: Record<string, unknown> = {},
): Promise<{ sent: boolean; reason?: string; raw?: unknown }> {
  // Load profile + check preferences.
  const { data: profile, error: pErr } = await supabase
    .from("profiles")
    .select("onesignal_player_id, notification_preferences")
    .eq("id", userId)
    .maybeSingle();
  if (pErr || !profile) return { sent: false, reason: "no_profile" };
  if (!profile.onesignal_player_id) return { sent: false, reason: "no_subscription" };

  // Per-type pref gate. Milestone variants share the "milestone" key.
  const prefKey = type.startsWith("milestone_") ? "milestone" : type;
  const prefs = (profile.notification_preferences ?? {}) as Record<string, boolean>;
  if (prefs[prefKey] === false) return { sent: false, reason: "user_disabled" };

  // Anti-spam cooldown — except milestones always go through (they're rare).
  if (!type.startsWith("milestone_")) {
    const { data: stats } = await supabase
      .from("user_stats")
      .select("last_notification_sent_at")
      .eq("user_id", userId)
      .maybeSingle();
    if (stats?.last_notification_sent_at) {
      const ageMs = Date.now() - new Date(stats.last_notification_sent_at).getTime();
      if (ageMs < COOLDOWN_MINUTES * 60_000) return { sent: false, reason: "cooldown" };
    }
  }

  // Pick + render the message.
  const dateKey = new Date().toISOString().slice(0, 10);
  const variant = pickVariant(type, userId, dateKey);
  if (!variant) return { sent: false, reason: "no_template" };
  const title = template(variant.title, data);
  const body = template(variant.body, data);

  const result = await sendOneSignal({
    player_id: profile.onesignal_player_id,
    title,
    body,
    data: { type, ...data },
  });

  // Update last_notification_sent_at (best effort; failure doesn't block).
  await supabase
    .from("user_stats")
    .update({ last_notification_sent_at: new Date().toISOString() })
    .eq("user_id", userId);

  return { sent: result.ok, raw: result.raw };
}

// What hour-of-day (0-23) is it in the given IANA timezone?
function hourInTimezone(tz: string | null | undefined): number {
  try {
    if (!tz) return new Date().getUTCHours();
    const fmt = new Intl.DateTimeFormat("en-US", { timeZone: tz, hour: "numeric", hour12: false });
    const parts = fmt.formatToParts(new Date());
    const h = parts.find(p => p.type === "hour")?.value;
    const parsed = parseInt(h ?? "0", 10);
    return Number.isFinite(parsed) ? parsed : new Date().getUTCHours();
  } catch {
    return new Date().getUTCHours();
  }
}

async function dispatchTick(): Promise<{ sent: number; checked: number }> {
  let sent = 0;
  let checked = 0;

  // Fetch all subscribed users with their stats. Free-tier scale this is
  // <=10K rows; fine to do client-side filtering for the smart-timing logic.
  const { data: users, error } = await supabase
    .from("profiles")
    .select(`
      id,
      timezone,
      onesignal_player_id,
      notification_preferences,
      user_stats!inner(typical_study_hour, last_active_date, current_streak, last_notification_sent_at)
    `)
    .not("onesignal_player_id", "is", null);

  if (error || !users) return { sent, checked };

  const nowMs = Date.now();

  for (const u of users as Array<Record<string, unknown>>) {
    checked++;
    const statsField = u.user_stats as unknown;
    const stats = Array.isArray(statsField) ? (statsField[0] as Record<string, unknown>) : (statsField as Record<string, unknown>);
    if (!stats) continue;

    const tz = u.timezone as string | null;
    const localHour = hourInTimezone(tz);
    const typical = Number(stats.typical_study_hour ?? 19);
    const streak = Number(stats.current_streak ?? 0);
    const lastActive = stats.last_active_date ? new Date(String(stats.last_active_date)) : null;
    const daysSinceActive = lastActive
      ? Math.floor((nowMs - lastActive.getTime()) / 86_400_000)
      : 999;

    const userId = String(u.id);

    // Daily reminder: send 1 hour before typical study time if user
    // hasn't studied today.
    const reminderHour = (typical + 23) % 24; // typical - 1 mod 24
    if (localHour === reminderHour && daysSinceActive >= 1) {
      const r = await dispatchSend(userId, "daily_reminder", {});
      if (r.sent) sent++;
      continue;
    }

    // Streak warning: send at 22:00 local if user has 3+ day streak
    // AND hasn't studied today.
    if (streak >= 3 && localHour === 22 && daysSinceActive >= 1) {
      const r = await dispatchSend(userId, "streak_warning", { streak });
      if (r.sent) sent++;
      continue;
    }

    // Re-engagement: 7+ days inactive, send at typical study hour.
    if (daysSinceActive >= 7 && localHour === typical) {
      const r = await dispatchSend(userId, "re_engagement", { days: daysSinceActive });
      if (r.sent) sent++;
      continue;
    }
  }

  return { sent, checked };
}

// Supabase Database Webhook payload format.
type WebhookPayload = {
  type?: "INSERT" | "UPDATE" | "DELETE";
  table?: string;
  schema?: string;
  record?: Record<string, unknown>;
  old_record?: Record<string, unknown>;
};

async function handleWebhook(body: WebhookPayload): Promise<Response> {
  // Mission complete: row in user_missions with completed=true.
  if (body.table === "user_missions" && body.record?.completed === true) {
    const userId = String(body.record.user_id);
    const mission = Number(body.record.mission);
    const r = await dispatchSend(userId, "milestone_mission", { n: mission });
    return new Response(JSON.stringify(r), { status: 200 });
  }

  // Stage complete: user_stats.current_stage incremented.
  if (body.table === "user_stats" && body.type === "UPDATE") {
    const oldStage = Number(body.old_record?.current_stage ?? 1);
    const newStage = Number(body.record?.current_stage ?? 1);
    if (newStage > oldStage) {
      const userId = String(body.record!.user_id);
      const r = await dispatchSend(userId, "milestone_stage", {
        n: newStage - 1,
        next: newStage,
      });
      return new Response(JSON.stringify(r), { status: 200 });
    }

    // XP milestones (100, 500, 1000, 5000).
    const oldXp = Number(body.old_record?.total_xp ?? 0);
    const newXp = Number(body.record?.total_xp ?? 0);
    const milestones = [100, 500, 1000, 5000];
    for (const m of milestones) {
      if (oldXp < m && newXp >= m) {
        const userId = String(body.record!.user_id);
        const r = await dispatchSend(userId, "milestone_xp", { xp: m });
        return new Response(JSON.stringify(r), { status: 200 });
      }
    }
  }

  return new Response(JSON.stringify({ skipped: true }), { status: 200 });
}

serve(async (req) => {
  // Health check.
  if (req.method === "GET") {
    return new Response(JSON.stringify({
      ok: true,
      configured: !!(
        ONESIGNAL_APP_ID &&
        ONESIGNAL_REST_API_KEY &&
        SUPABASE_URL &&
        SUPABASE_SERVICE_ROLE_KEY &&
        NOTIFICATION_WEBHOOK_SECRET
      ),
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!hasValidNotificationSecret(req)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
  }

  // Database Webhook payload — Supabase always includes `table` and `record`.
  if (body.table && body.record) {
    return await handleWebhook(body as WebhookPayload);
  }

  const mode = (body.mode as string) ?? "send";

  if (mode === "tick") {
    const result = await dispatchTick();
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (mode === "send") {
    if (!body.user_id || !body.type) {
      return new Response(JSON.stringify({ error: "user_id and type required" }), { status: 400 });
    }
    const r = await dispatchSend(
      String(body.user_id),
      String(body.type),
      (body.data as Record<string, unknown>) ?? {},
    );
    return new Response(JSON.stringify(r), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ error: "Unknown mode" }), { status: 400 });
});
