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
//   SUPABASE_SERVICE_ROLE_KEY         — provided automatically; used ONLY to read
//                                       the caller's own subscriptions row for the
//                                       already-subscribed check (Wave 13 item B)
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "https://esm.sh/stripe@16.12.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
// Pure decision logic, shared verbatim with the Node validator suite.
import { hasActiveEntitlement } from "../_shared/billingRules.js";

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

    // ── WAVE 13 item B: server-side already-subscribed rejection ──────────────
    // Without this, nothing stopped a second checkout: the client guards all read
    // isSuper(stats), which is FALSE for the ~minutes between paying and the
    // webhook landing — exactly when a user is most likely to try again. The
    // result was two Stripe customers, two subscriptions and two recurring
    // charges, collapsed into ONE row (user_id is the primary key), leaving the
    // first subscription un-cancellable from inside the app.
    //
    // The rule is `super_until > now` (hasActiveEntitlement), NOT `plan != 'free'`.
    // A lapsed subscriber keeps plan='super_monthly' on their row indefinitely, so
    // gating on `plan` would permanently lock them out of re-subscribing — a worse
    // bug than the one being fixed. Read with the service_role client because RLS
    // grants the user SELECT only on their own row and we want this to be
    // authoritative regardless of the caller's token.
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } },
    );
    const { data: existing, error: readError } = await admin
      .from("subscriptions")
      .select("super_until, stripe_customer_id, stripe_subscription_id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (readError) throw readError;

    if (hasActiveEntitlement(existing)) {
      return new Response(
        JSON.stringify({
          error: "already_subscribed",
          message: "You already have an active Super subscription.",
          superUntil: existing?.super_until ?? null,
        }),
        { status: 409, headers: { ...cors(origin), "Content-Type": "application/json" } },
      );
    }

    // ── WAVE 13 item C: reuse the stored Stripe customer ─────────────────────
    // Previously only `customer_email` was passed, so Stripe minted a BRAND-NEW
    // Customer for every checkout — which is why duplicates could never be
    // deduped at the Stripe level either. The webhook has always written
    // stripe_customer_id; it was simply never read back. Reusing it keeps a
    // returning/lapsed subscriber on one customer record (one billing history,
    // one payment-method set).
    //
    // The fallback is REQUIRED, not optional: a customer deleted in the Stripe
    // dashboard, or an id from a different Stripe account/mode, makes
    // sessions.create throw. We must not let a stale id block a paying customer,
    // so on failure we retry once with customer_email and no customer id.
    const storedCustomerId = existing?.stripe_customer_id || null;
    const baseParams = {
      ui_mode: "embedded" as const,
      mode: "subscription" as const,
      line_items: [{ price, quantity: 1 }],
      client_reference_id: user.id,
      metadata: { app_user_id: user.id },
      subscription_data: { metadata: { app_user_id: user.id } },
      allow_promotion_codes: true,
      return_url: `${returnUrl}?super=success&session_id={CHECKOUT_SESSION_ID}`,
    };

    let session;
    if (storedCustomerId) {
      try {
        session = await stripe.checkout.sessions.create({ ...baseParams, customer: storedCustomerId });
      } catch (e) {
        console.warn(
          `[create-checkout-session] stored stripe_customer_id ${storedCustomerId} was rejected ` +
          `(stale or deleted); falling back to customer_email. Reason:`,
          String((e as Error)?.message ?? e),
        );
        session = await stripe.checkout.sessions.create({
          ...baseParams,
          customer_email: user.email ?? undefined,
        });
      }
    } else {
      session = await stripe.checkout.sessions.create({
        ...baseParams,
        customer_email: user.email ?? undefined,
      });
    }

    // WAVE 13 item I (server half): checkout starts are now visible in the Edge
    // Function logs, so the funnel is observable without a migration.
    console.log(`[create-checkout-session] CHECKOUT_STARTED user=${user.id} plan=${plan} reusedCustomer=${!!storedCustomerId}`);

    return new Response(JSON.stringify({ clientSecret: session.client_secret }), {
      headers: { ...cors(origin), "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e as Error)?.message ?? e) }), {
      status: 500, headers: { ...cors(origin), "Content-Type": "application/json" },
    });
  }
});
