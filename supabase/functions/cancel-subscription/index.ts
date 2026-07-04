// cancel-subscription
// Auth-gated (verify_jwt = true). Schedules a cancellation on the signed-in user's
// Stripe subscription: sets cancel_at_period_end = true so it stops auto-renewing
// but Super access stays LIVE until the paid period ends. Optimistically mirrors
// the flag + period end into public.subscriptions (the webhook also confirms it).
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
    const { data: sub } = await admin
      .from("subscriptions")
      .select("stripe_subscription_id, super_until")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!sub?.stripe_subscription_id) return json({ error: "no_active_subscription" }, 400, origin);

    const updated = await stripe.subscriptions.update(sub.stripe_subscription_id, { cancel_at_period_end: true });
    const periodEnd = updated.current_period_end
      ? new Date(updated.current_period_end * 1000).toISOString()
      : sub.super_until;

    await admin
      .from("subscriptions")
      .update({ cancel_at_period_end: true, current_period_end: periodEnd, super_until: periodEnd })
      .eq("user_id", user.id);

    return json({ ok: true, cancel_at_period_end: true, super_until: periodEnd }, 200, origin);
  } catch (e) {
    return json({ error: String((e as Error)?.message ?? e) }, 500, origin);
  }
});
