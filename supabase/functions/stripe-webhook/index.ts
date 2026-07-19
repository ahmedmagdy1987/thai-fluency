// stripe-webhook
// Public endpoint (verify_jwt = false) — authenticated by Stripe SIGNATURE, not a
// Supabase JWT. Verifies the signature, then writes the server-authoritative
// entitlement into public.subscriptions using the service_role key.
// super_until = the subscription's current_period_end while active.
//
// WRITERS OF public.subscriptions (Wave 13 item K — the previous "the ONLY
// writer" claim here was false): this webhook is the PRIMARY writer, and
// cancel-subscription/index.ts is a SECOND service_role writer that optimistically
// mirrors a scheduled cancellation. Clients can never write it (RLS grants SELECT
// only — supabase/schema.sql). Stripe remains the source of truth: anything
// cancel-subscription writes is re-confirmed by the webhook event that follows.
//
// DEPLOY: this function must be deployed with JWT verification DISABLED, because
// Stripe authenticates by signature and sends no Supabase JWT:
//   supabase functions deploy stripe-webhook --no-verify-jwt
//
// Env (Supabase Edge Function secrets):
//   STRIPE_SECRET_KEY (sk_test_...)         — required
//   STRIPE_WEBHOOK_SECRET (whsec_...)        — required
//   SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY — provided automatically
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "https://esm.sh/stripe@16.12.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
// Pure decision logic, shared verbatim with the Node validator suite so the
// riskiest rules in the product are executed by `npm run check`.
import { isEntitlingStatus, shouldApplySubscriptionEvent } from "../_shared/billingRules.js";

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
  if (!appUserId) {
    // WAVE 13 item E — this used to `return` silently with a 200. A subscription
    // created outside the app (Stripe Dashboard, a comped/migrated sub) carries no
    // app_user_id, so it entitles NOBODY, forever, and the owner sees only a
    // success in the Stripe dashboard. It is still not an error we can fix by
    // retrying — there is no user to map to — so we log loudly and return 200
    // rather than making Stripe retry something that can never succeed.
    console.error(
      "[stripe-webhook] UNMAPPED SUBSCRIPTION — no app_user_id in metadata and no client_reference_id fallback. " +
      "Nobody will be entitled. Subscription:", sub.id,
      "customer:", typeof sub.customer === "string" ? sub.customer : sub.customer?.id ?? null,
      "status:", sub.status,
    );
    return;
  }
  const item = sub.items?.data?.[0];
  const interval = item?.price?.recurring?.interval;
  const periodEnd = sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null;
  const active = isEntitlingStatus(sub.status);

  // WAVE 13 item D — public.subscriptions is keyed user_id, so EVERY subscription
  // a user has held writes the same row. Without this check, an event for a
  // superseded subscription (e.g. cancelling a duplicate) overwrites the row and
  // downgrades a customer whose other subscription is still live and still
  // billing. shouldApplySubscriptionEvent rejects ONLY that case; upgrades, plan
  // switches, first writes, and the owning subscription's own cancellation all
  // still apply. See supabase/functions/_shared/billingRules.js.
  const { data: stored, error: readError } = await admin
    .from("subscriptions")
    .select("stripe_subscription_id, super_until")
    .eq("user_id", appUserId)
    .maybeSingle();
  if (readError) throw readError;   // surface as 500 → Stripe retries

  const decision = shouldApplySubscriptionEvent(
    stored,
    { stripe_subscription_id: sub.id, entitling: active },
  );
  if (!decision.apply) {
    console.warn(`[stripe-webhook] SKIPPED write for user ${appUserId}: ${decision.reason}`);
    return;
  }

  // WAVE 13 item A — the result of this upsert used to be discarded entirely.
  // supabase-js RESOLVES with { data, error } rather than throwing, so a database
  // failure never reached the catch below and the function returned 200. Stripe
  // treats 200 as delivered and never retries, so a paying customer could be left
  // permanently unentitled with no trace. Throwing lets the existing catch return
  // 500, which engages Stripe's own retry (up to ~3 days).
  const { error: writeError } = await admin.from("subscriptions").upsert({
    user_id: appUserId,
    plan: active ? planFromInterval(interval) : "free",
    status: sub.status,
    provider: "stripe",
    super_until: active ? periodEnd : null,
    stripe_customer_id: typeof sub.customer === "string" ? sub.customer : sub.customer?.id ?? null,
    stripe_subscription_id: sub.id,
    current_period_end: periodEnd,
    cancel_at_period_end: !!sub.cancel_at_period_end,
  }, { onConflict: "user_id" });
  if (writeError) throw writeError;

  // WAVE 13 item I (server half) — purchase observability with NO migration.
  // These lines land in the Supabase Edge Function logs, which the owner can read
  // in the dashboard, so activations are no longer invisible.
  console.log(
    `[stripe-webhook] ENTITLEMENT user=${appUserId} sub=${sub.id} status=${sub.status} ` +
    `entitled=${active} plan=${active ? planFromInterval(interval) : "free"} until=${active ? periodEnd : "null"}`,
  );
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
        // WAVE 13 item D — this was the ONLY branch that wrote from the frozen
        // event SNAPSHOT (event.data.object). Stripe does not guarantee delivery
        // order and retries for up to ~3 days, so a delayed/duplicated older
        // event could overwrite fresher state and downgrade a paying customer.
        // The other two branches already re-read live state (see below); this one
        // now does the same, so ordering cannot matter for any handler.
        //
        // `deleted` is the one case we must NOT re-fetch blindly: retrieving a
        // deleted subscription still returns it with status 'canceled', which is
        // what we want, but if the object is gone entirely the retrieve throws —
        // so fall back to the event payload rather than failing the delivery.
        const snapshot = event.data.object as Stripe.Subscription;
        let fresh = snapshot;
        try {
          fresh = await stripe.subscriptions.retrieve(snapshot.id);
        } catch (e) {
          console.warn(
            `[stripe-webhook] could not re-fetch subscription ${snapshot.id}; ` +
            `falling back to the event snapshot:`, String((e as Error)?.message ?? e),
          );
        }
        // Metadata lives on the subscription either way; pass the snapshot's
        // app_user_id as a fallback in case a re-fetch ever returns it empty.
        await applySubscription(fresh, snapshot.metadata?.app_user_id ?? null);
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
