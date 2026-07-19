// cancel-subscription
// Auth-gated (verify_jwt = true). Schedules a cancellation on the signed-in user's
// Stripe subscription: sets cancel_at_period_end = true so it stops auto-renewing
// but Super access stays LIVE until the paid period ends. Optimistically mirrors
// the flag + period end into public.subscriptions (the webhook also confirms it).
//
// NOTE (Wave 13 item K): this makes the function a SECOND service_role writer of
// public.subscriptions alongside stripe-webhook. Earlier comments here and in
// schema.sql claimed the webhook was the sole writer — it is not. Stripe stays the
// source of truth; the webhook event that follows re-confirms whatever is written
// here. Clients still cannot write the table at all (RLS grants SELECT only).
//
// The subscription id is looked up SERVER-SIDE from the caller's own row and is
// never read from the request body — that is what makes this IDOR-safe. Do not
// change it to accept an id from the client.
//
// Env (Supabase Edge Function secrets): STRIPE_SECRET_KEY, SUPABASE_URL,
// SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY (all provided / set already).
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "https://esm.sh/stripe@16.12.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  apiVersion: "2024-06-20",
  httpClient: Stripe.createFetchHttpClient(),
});

const cors = (origin: string) => ({
  "Access-Control-Allow-Origin": origin || "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin",
});
const json = (obj: unknown, status: number, origin: string) =>
  new Response(JSON.stringify(obj), { status, headers: { ...cors(origin), "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  const origin = req.headers.get("Origin") ?? "*";
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors(origin) });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: cors(origin) });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const supa = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } }, auth: { persistSession: false } },
    );
    const { data: { user }, error } = await supa.auth.getUser();
    if (error || !user) return json({ error: "unauthorized" }, 401, origin);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } },
    );
    const { data: sub, error: readError } = await admin
      .from("subscriptions")
      .select("stripe_subscription_id, stripe_customer_id, super_until")
      .eq("user_id", user.id)
      .maybeSingle();
    if (readError) throw readError;

    if (!sub?.stripe_subscription_id) return json({ error: "no_active_subscription" }, 400, origin);

    const updated = await stripe.subscriptions.update(sub.stripe_subscription_id, { cancel_at_period_end: true });
    const periodEnd = updated.current_period_end
      ? new Date(updated.current_period_end * 1000).toISOString()
      : sub.super_until;

    // ── WAVE 13: ORPHANED-SUBSCRIPTION DETECTION ─────────────────────────────
    // public.subscriptions holds ONE row per user (user_id primary key), so it can
    // record only ONE stripe_subscription_id. Before item B existed, a user could
    // end up with two live subscriptions; this cancel path reaches only the one in
    // the row, leaving the other billing with no in-app way to stop it.
    //
    // We do NOT auto-cancel the extras: cancelling a subscription the user did not
    // ask us to cancel is an irreversible billing action taken on a guess, and the
    // customer records may legitimately differ (e.g. a family sharing a card). What
    // we CAN do safely is DETECT and report, so an orphan stops being invisible.
    // Detection is best-effort and must never fail the user's cancellation.
    let otherLiveSubscriptions: string[] = [];
    try {
      if (sub.stripe_customer_id) {
        const list = await stripe.subscriptions.list({
          customer: sub.stripe_customer_id,
          status: "active",
          limit: 10,
        });
        otherLiveSubscriptions = list.data
          .filter((s) => s.id !== sub.stripe_subscription_id && !s.cancel_at_period_end)
          .map((s) => s.id);
      }
      if (otherLiveSubscriptions.length > 0) {
        console.error(
          `[cancel-subscription] ORPHANED SUBSCRIPTIONS for user ${user.id}: ` +
          `${otherLiveSubscriptions.join(", ")} are still live after cancelling ` +
          `${sub.stripe_subscription_id}. These are NOT reachable from the app and ` +
          `must be cancelled manually in the Stripe dashboard.`,
        );
      }
    } catch (e) {
      console.warn("[cancel-subscription] orphan detection failed (non-fatal):", String((e as Error)?.message ?? e));
    }

    // WAVE 13 item F — this write used to discard its error and return ok:true
    // regardless, so the user could be told "canceled" while the row was unchanged.
    // Stripe is the source of truth and the webhook re-confirms, but the response
    // must not claim something we did not do.
    const { error: writeError } = await admin
      .from("subscriptions")
      .update({ cancel_at_period_end: true, current_period_end: periodEnd, super_until: periodEnd })
      .eq("user_id", user.id);
    if (writeError) throw writeError;

    console.log(`[cancel-subscription] CANCEL_SCHEDULED user=${user.id} sub=${sub.stripe_subscription_id} until=${periodEnd}`);

    return json({
      ok: true,
      cancel_at_period_end: true,
      super_until: periodEnd,
      // Surfaced so the client can tell the user to contact support rather than
      // silently leaving them subscribed to something they think they cancelled.
      other_live_subscriptions: otherLiveSubscriptions.length,
    }, 200, origin);
  } catch (e) {
    return json({ error: String((e as Error)?.message ?? e) }, 500, origin);
  }
});
