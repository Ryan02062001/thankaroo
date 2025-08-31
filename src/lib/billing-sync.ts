// src/lib/billing-sync.ts
import { stripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/admin";

export type StripeSubCache =
  | {
      subscriptionId: string | null;
      status: string;
      priceId: string | null;
      currentPeriodStart: number | null;
      currentPeriodEnd: number | null;
      cancelAtPeriodEnd: boolean;
      paymentMethod: { brand: string | null; last4: string | null } | null;
    }
  | { status: "none" };

/**
 * Syncs the full state for a Stripe customer into our database tables.
 * - Upserts mapping in `billing_customers`
 * - Upserts active subscription (if any) in `billing_subscriptions`
 * - Upserts one-time entitlements in `billing_entitlements`
 * Returns a compact cache object useful for UI state if desired.
 */
export async function syncStripeStateForCustomer(
  customerId: string,
  hints?: { userId?: string; email?: string }
): Promise<StripeSubCache> {
  const admin = getSupabaseAdmin();

  // Resolve user_id from our mapping table if possible
  let userId: string | null = hints?.userId ?? null;
  if (!userId) {
    const { data: mapping } = await admin
      .from("billing_customers")
      .select("user_id")
      .eq("stripe_customer_id", customerId)
      .maybeSingle();
    userId = mapping?.user_id ?? null;
  }

  // As a last resort, attempt to find by email if provided
  if (!userId && hints?.email) {
    const { data: users } = await admin
      .from("users")
      .select("id")
      .eq("email", hints.email)
      .limit(1);
    userId = users?.[0]?.id ?? null;
  }

  // If we still can't find a user, do not write DB rows, but still return cache
  // This should be rare because we upsert mapping during checkout/backfill

  // Fetch the latest subscription (if any)
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: "all",
    limit: 1,
    expand: ["data.default_payment_method"],
  });

  if (subscriptions.data.length === 0) {
    if (userId) {
      await admin
        .from("billing_subscriptions")
        .delete()
        .eq("user_id", userId);
    }
    return { status: "none" };
  }

  const subscription = subscriptions.data[0];
  const currentPeriodEnd = (subscription as unknown as { current_period_end?: number }).current_period_end ?? null;
  const currentPeriodStart = (subscription as unknown as { current_period_start?: number }).current_period_start ?? null;
  const price = subscription.items.data[0]?.price ?? null;
  const priceId = price?.id ?? null;
  const priceLookupKey = (price?.lookup_key ?? null) as string | null;

  const cache: StripeSubCache = {
    subscriptionId: subscription.id,
    status: subscription.status,
    priceId,
    currentPeriodStart: currentPeriodStart,
    currentPeriodEnd: currentPeriodEnd,
    cancelAtPeriodEnd: !!subscription.cancel_at_period_end,
    paymentMethod:
      subscription.default_payment_method &&
      typeof subscription.default_payment_method !== "string"
        ? {
            brand: subscription.default_payment_method.card?.brand ?? null,
            last4: subscription.default_payment_method.card?.last4 ?? null,
          }
        : null,
  };

  if (userId) {
    // Ensure customer mapping exists
    await admin
      .from("billing_customers")
      .upsert(
        { user_id: userId, stripe_customer_id: customerId },
        { onConflict: "user_id" }
      );

    // Upsert subscription snapshot
    await admin.from("billing_subscriptions").upsert(
      {
        id: subscription.id,
        user_id: userId,
        price_lookup_key: priceLookupKey,
        status: subscription.status,
        current_period_end: currentPeriodEnd ? new Date(currentPeriodEnd * 1000).toISOString() : null,
        cancel_at_period_end: !!subscription.cancel_at_period_end,
      },
      { onConflict: "id" }
    );

    // One-time entitlements: scan recent sessions for completed one-time payments
    const sessions = await stripe.checkout.sessions.list({
      customer: customerId,
      limit: 20,
      expand: ["data.line_items"],
    });
    for (const s of sessions.data) {
      if (s.mode !== "payment" || s.status !== "complete") continue;
      const metaLookup = s.metadata?.price_lookup_key || "";
      const liPrice = (s as unknown as { line_items?: { data?: Array<{ price?: { lookup_key?: string } }> } }).line_items?.data?.[0]?.price;
      const liLookup = (liPrice?.lookup_key ?? "") as string;
      const lookup = metaLookup || liLookup;
      if (lookup === "wedding_plan" || lookup === "wedding_pass" || lookup === "wedding_pass_") {
        await admin
          .from("billing_entitlements")
          .upsert(
            { user_id: userId, product_lookup_key: "wedding_plan", active: true },
            { onConflict: "user_id,product_lookup_key" }
          );
      }
    }
  }

  return cache;
}


