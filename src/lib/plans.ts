// src/lib/plans.ts
import { createClient } from "@/utils/supabase/server";
import { stripe } from "@/lib/stripe";

export type PlanId = "free" | "wedding" | "pro";

type Limits = {
  maxLists: number | null;
  maxGiftsPerList: number | null;
  maxAiDraftsPerMonth: number | null;
};

export const PLAN_LIMITS: Record<PlanId, Limits> = {
  free: { maxLists: 1, maxGiftsPerList: 100, maxAiDraftsPerMonth: 10 },
  wedding: { maxLists: 3, maxGiftsPerList: null, maxAiDraftsPerMonth: 100 },
  pro: { maxLists: null, maxGiftsPerList: null, maxAiDraftsPerMonth: 10000 },
};

// Map Stripe price lookup_keys to a plan id
export const LOOKUP_KEY_TO_PLAN: Record<string, PlanId> = {
  wedding_pass: "wedding",
  thank_you_pro_monthly: "pro",
  thank_you_pro_yearly: "pro",
};

function firstDayOfMonthISO(d = new Date()) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)).toISOString().slice(0, 10);
}

// Fast, DB-only plan lookup (no Stripe fallback). Use this for latency-sensitive paths (like AI calls).
export async function getCurrentPlanForUserFast(): Promise<{ plan: PlanId; limits: Limits }> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId) return { plan: "free", limits: PLAN_LIMITS.free };

  const { data: subs } = await supabase
    .from("billing_subscriptions")
    .select("price_lookup_key, status")
    .eq("user_id", userId)
    .in("status", ["active", "trialing"]) as unknown as { data: { price_lookup_key: string | null; status: string }[] | null };

  const subPlan = subs?.[0]?.price_lookup_key ? LOOKUP_KEY_TO_PLAN[subs[0].price_lookup_key] : undefined;
  if (subPlan) return { plan: subPlan, limits: PLAN_LIMITS[subPlan] };

  const { data: ents } = await supabase
    .from("billing_entitlements")
    .select("product_lookup_key")
    .eq("user_id", userId)
    .eq("active", true) as unknown as { data: { product_lookup_key: string }[] | null };

  const entPlan = ents?.[0]?.product_lookup_key ? LOOKUP_KEY_TO_PLAN[ents[0].product_lookup_key] : undefined;
  if (entPlan) return { plan: entPlan, limits: PLAN_LIMITS[entPlan] };

  return { plan: "free", limits: PLAN_LIMITS.free };
}

export async function getCurrentPlanForUser(): Promise<{ plan: PlanId; limits: Limits }> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId) return { plan: "free", limits: PLAN_LIMITS.free };

  // Active subscription?
  const { data: subs } = await supabase
    .from("billing_subscriptions")
    .select("price_lookup_key, status")
    .eq("user_id", userId)
    .in("status", ["active", "trialing"]) as unknown as { data: { price_lookup_key: string | null; status: string }[] | null };

  const subPlan = subs?.[0]?.price_lookup_key ? LOOKUP_KEY_TO_PLAN[subs[0].price_lookup_key] : undefined;
  if (subPlan) return { plan: subPlan, limits: PLAN_LIMITS[subPlan] };

  // One-time entitlement (e.g., Wedding Pass)
  const { data: ents } = await supabase
    .from("billing_entitlements")
    .select("product_lookup_key")
    .eq("user_id", userId)
    .eq("active", true) as unknown as { data: { product_lookup_key: string }[] | null };

  const entPlan = ents?.[0]?.product_lookup_key ? LOOKUP_KEY_TO_PLAN[ents[0].product_lookup_key] : undefined;
  if (entPlan) return { plan: entPlan, limits: PLAN_LIMITS[entPlan] };

  // Fallback: query Stripe directly if DB hasn't been populated yet by webhooks
  try {
    const email = auth.user?.email || "";
    type UserMeta = { stripe_customer_id?: string };
    const meta = auth.user?.user_metadata as UserMeta | undefined;
    let customerId = meta?.stripe_customer_id;
    if (!customerId && email) {
      const existing = await stripe.customers.list({ email, limit: 1 });
      customerId = existing.data[0]?.id;
    }
    if (customerId) {
      const subs = await stripe.subscriptions.list({ customer: customerId, status: "all", limit: 5 });
      const active = subs.data.find((s) => s.status === "active" || s.status === "trialing");
      const lookupKey = (active?.items?.data?.[0]?.price?.lookup_key ?? "") as string;
      if (lookupKey) {
        const planFromStripe = LOOKUP_KEY_TO_PLAN[lookupKey];
        if (planFromStripe) {
          return { plan: planFromStripe, limits: PLAN_LIMITS[planFromStripe] };
        }
      }
    }
  } catch {
    // Ignore Stripe fallback errors and default to free
  }

  return { plan: "free", limits: PLAN_LIMITS.free };
}

export async function getAiDraftsThisMonth(): Promise<number> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId) return 0;

  const period = firstDayOfMonthISO();
  const { data } = await supabase
    .from("usage_monthly")
    .select("ai_drafts")
    .eq("user_id", userId)
    .eq("period_month", period)
    .maybeSingle();

  return (data?.ai_drafts as number | undefined) ?? 0;
}

export async function incrementAiDraftsThisMonth(delta = 1): Promise<void> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId) return;

  const period = firstDayOfMonthISO();

  const { data: existing } = await supabase
    .from("usage_monthly")
    .select("ai_drafts")
    .eq("user_id", userId)
    .eq("period_month", period)
    .maybeSingle();

  if (existing) {
    const current = (existing.ai_drafts as number | undefined) ?? 0;
    await supabase
      .from("usage_monthly")
      .update({ ai_drafts: current + delta })
      .eq("user_id", userId)
      .eq("period_month", period);
  } else {
    await supabase
      .from("usage_monthly")
      .insert({ user_id: userId, period_month: period, ai_drafts: delta });
  }
}