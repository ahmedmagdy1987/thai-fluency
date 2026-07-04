// create-checkout-session
// Auth-gated (verify_jwt = true). Creates an EMBEDDED Stripe Checkout Session
// (subscription mode) for the signed-in user and returns its client_secret so the
// app can mount Checkout in-page (ui_mode: 'embedded') — the user never leaves
// tuktalkthai.com. The app user id is attached as client_reference_id +
// subscription metadata so the webhook can map the resulting subscription back to
// the Supabase user.
//
// Env (Supabase Edge Function secrets):
//   STRIPE_SECRET_KEY (sk_test_...)   — required
//   STRIPE_PRICE_MONTHLY / STRIPE_PRICE_YEARLY — optional (defaults to test IDs)
//   SUPABASE_URL / SUPABASE_ANON_KEY  — provided automatically
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "https://esm.sh/stripe@16.12.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  apiVersion: "2024-06-20",
  httpClient: Stripe.createFetchHttpClient(),
});

// TEST-mode price IDs (NOT secret — safe to ship). Override via env for live.
const PRICE_MONTHLY = Deno.env.get("STRIPE_PRICE_MONTHLY") ?? "price_1TpHZ4I2GsV6FCeik4eF996s";
const PRICE_YEARLY  = Deno.env.get("STRIPE_PRICE_YEARLY")  ?? "price_1TpHZ5I2GsV6FCei0IEpeZkh";

const cors = (origin: string) => ({
  "Access-Control-Allow-Origin": origin || "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin",
});

Deno.serve(async (req) => {
  const origin = req.headers.get("Origin") ?? "*";
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors(origin) });
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: cors(origin) });
  }

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } }, auth: { persistSession: false } },
    );
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401, headers: { ...cors(origin), "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const plan = body.plan === "yearly" ? "yearly" : "monthly";
    const price = plan === "yearly" ? PRICE_YEARLY : PRICE_MONTHLY;
    const returnUrl = (typeof body.returnUrl === "string" && body.returnUrl) || origin || "https://www.tuktalkthai.com";

    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded",
      mode: "subscription",
      line_items: [{ price, quantity: 1 }],
      client_reference_id: user.id,
      customer_email: user.email ?? undefined,
      metadata: { app_user_id: user.id },
      subscription_data: { metadata: { app_user_id: user.id } },
      allow_promotion_codes: true,
      return_url: `${returnUrl}?super=success&session_id={CHECKOUT_SESSION_ID}`,
    });

    return new Response(JSON.stringify({ clientSecret: session.client_secret }), {
      headers: { ...cors(origin), "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e as Error)?.message ?? e) }), {
      status: 500, headers: { ...cors(origin), "Content-Type": "application/json" },
    });
  }
});
