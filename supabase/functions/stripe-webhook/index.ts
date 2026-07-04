// stripe-webhook
// Public endpoint (verify_jwt = false) — authenticated by Stripe SIGNATURE, not a
// Supabase JWT. Verifies the signature, then writes the server-authoritative
// entitlement into public.subscriptions using the service_role key (the ONLY
// writer). super_until = the subscription's current_period_end while active.
//
// Env (Supabase Edge Function secrets):
//   STRIPE_SECRET_KEY (sk_test_...)         — required
//   STRIPE_WEBHOOK_SECRET (whsec_...)        — required
//   SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY — provided automatically
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "https://esm.sh/stripe@16.12.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  apiVersion: "2024-06-20",
  httpClient: Stripe.createFetchHttpClient(),
});
const cryptoProvider = Stripe.createSubtleCryptoProvider();

const admin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false } },
);

const planFromInterval = (interval?: string) => (interval === "year" ? "super_yearly" : "super_monthly");

async function applySubscription(sub: Stripe.Subscription, fallbackUserId?: string | null) {
  const appUserId = sub.metadata?.app_user_id ?? fallbackUserId;
  if (!appUserId) return;
  const item = sub.items?.data?.[0];
  const interval = item?.price?.recurring?.interval;
  const periodEnd = sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null;
  const active = sub.status === "active" || sub.status === "trialing";
  await admin.from("subscriptions").upsert({
    user_id: appUserId,
    plan: active ? planFromInterval(interval) : "free",
    status: sub.status,
    provider: "stripe",
    super_until: active ? periodEnd : null,
    stripe_customer_id: typeof sub.customer === "string" ? sub.customer : sub.customer?.id ?? null,
    stripe_subscription_id: sub.id,
    current_period_end: periodEnd,
  }, { onConflict: "user_id" });
}

Deno.serve(async (req) => {
  const sig = req.headers.get("stripe-signature");
  const whsec = Deno.env.get("STRIPE_WEBHOOK_SECRET") ?? "";
  const raw = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(raw, sig!, whsec, undefined, cryptoProvider);
  } catch (e) {
    return new Response(`Signature verification failed: ${String((e as Error)?.message ?? e)}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.subscription) {
          const sub = await stripe.subscriptions.retrieve(session.subscription as string);
          await applySubscription(sub, session.client_reference_id);
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        await applySubscription(event.data.object as Stripe.Subscription);
        break;
      }
      case "invoice.paid":
      case "invoice.payment_succeeded": {
        const inv = event.data.object as Stripe.Invoice;
        if (inv.subscription) {
          const sub = await stripe.subscriptions.retrieve(inv.subscription as string);
          await applySubscription(sub);
        }
        break;
      }
      default:
        break;
    }
  } catch (e) {
    return new Response(`Handler error: ${String((e as Error)?.message ?? e)}`, { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), { headers: { "Content-Type": "application/json" } });
});
