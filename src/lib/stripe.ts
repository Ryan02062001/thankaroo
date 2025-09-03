// src/lib/stripe.ts
import Stripe from "stripe";
import { createClient } from "@/utils/supabase/server";
import { getSupabaseAdmin } from "@/lib/admin";
import { getSiteUrl } from "@/lib/utils";
// Plan keys live in ./plans if needed elsewhere

// Lazily construct the Stripe client so env checks happen at call time
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  // Keep this pinned so API responses are predictable
  apiVersion: "2025-07-30.basil",
});

type PriceCache = {
  updatedAt: number;
  byLookupKey: Record<string, { id: string; recurring: boolean }>; // recurring === subscription
};

const PRICE_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
let priceCache: PriceCache | null = null;

async function refreshPriceCache(): Promise<PriceCache> {
  const byLookupKey: PriceCache["byLookupKey"] = {};
  // Fetch up to 100 active prices. If you ever exceed this, narrow by product or add pagination.
  const prices = await stripe.prices.list({ active: true, limit: 100, expand: ["data.product"] });
  for (const p of prices.data) {
    const key = (p.lookup_key ?? undefined) as string | undefined;
    if (!key) continue;
    const recurring = Boolean(p.recurring);
    byLookupKey[key] = { id: p.id, recurring };
  }
  priceCache = { updatedAt: Date.now(), byLookupKey };
  return priceCache;
}

export async function resolvePriceByLookupKey(lookupKey: string): Promise<{ id: string; recurring: boolean } | null> {
  const now = Date.now();
  if (!priceCache || now - priceCache.updatedAt > PRICE_CACHE_TTL_MS) {
    await refreshPriceCache();
  }
  // Try exact key
  const exact = priceCache!.byLookupKey[lookupKey];
  if (exact) return exact;
  // Try common aliases (e.g., wedding_pass vs wedding_pass_)
  const normalizedAliases = new Set<string>([
    lookupKey,
    lookupKey.replace(/_+$/, ""), // strip trailing underscores
    `${lookupKey}_`,
    lookupKey === "wedding_pro" ? "wedding_plan" : "",
    lookupKey === "wedding_plan" ? "wedding_pro" : "",
  ]);
  for (const alias of normalizedAliases) {
    const found = priceCache!.byLookupKey[alias];
    if (found) return found;
  }
  // As a last resort, refetch now (in case dashboard was just updated)
  await refreshPriceCache();
  return priceCache!.byLookupKey[lookupKey] ?? null;
}

export function successUrlWithSession(): string {
  const base = getSiteUrl();
  return `${base}/pricing?success=true&session_id={CHECKOUT_SESSION_ID}`;
}

export function cancelUrl(): string {
  const base = getSiteUrl();
  return `${base}/pricing?canceled=true`;
}

export async function getOrCreateCustomerIdForCurrentUser(): Promise<string> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) throw new Error("Unauthorized");

  type UM = { stripe_customer_id?: string };
  const meta = (user.user_metadata ?? {}) as UM;
  let candidateId = meta.stripe_customer_id || null;

  // Validate the existing customer id (it might be from the wrong Stripe mode)
  if (candidateId) {
    try {
      const cust = await stripe.customers.retrieve(candidateId);
      if (typeof (cust as { id?: string }).id === "string" && (cust as { id: string }).id === candidateId) {
        // ID is valid for this Stripe key; proceed
      } else {
        candidateId = null;
      }
    } catch {
      // Not found for this API key; ignore the stale id
      candidateId = null;
    }
  }

  // Try to find an existing Stripe customer by email
  let existingId: string | undefined;
  if (!candidateId && user.email) {
    const list = await stripe.customers.list({ email: user.email, limit: 1 });
    existingId = list.data[0]?.id;
  }

  const customerId = candidateId
    ? candidateId
    : existingId
    ? existingId
    : (
        await stripe.customers.create({
          email: user.email ?? undefined,
          metadata: { userId: user.id },
        })
      ).id;

  // Store on the user for fast reads (RLS-friendly)
  if (customerId !== meta.stripe_customer_id) {
    await supabase.auth.updateUser({ data: { stripe_customer_id: customerId } });
  }

  // Best-effort: also store in admin mapping table for webhooks
  try {
    const admin = getSupabaseAdmin();
    await admin
      .from("billing_customers")
      .upsert({ user_id: user.id, stripe_customer_id: customerId }, { onConflict: "user_id" });
  } catch {
    // non-fatal
  }

  return customerId;
}

export function deriveModeFromLookupKey(lookupKey: string): "payment" | "subscription" {
  if (lookupKey === "wedding_plan" || lookupKey === "wedding_pro" || lookupKey === "wedding_pass" || lookupKey === "wedding_pass_") return "payment";
  if (lookupKey === "pro_monthly" || lookupKey === "pro_annual") return "subscription";
  // Default to subscription if unknown but recurring price will correct us at creation time
  return "subscription";
}

export function getBillingPortalReturnUrl(): string {
  // Send users back to settings if they opened portal after subscribing
  const base = getSiteUrl();
  return `${base}/settings`;
}


