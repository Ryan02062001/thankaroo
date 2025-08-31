// src/lib/plans.ts

import { createClient } from "@/utils/supabase/server";

export type SubscriptionLookupKey = "pro_monthly" | "pro_annual";
export type OneTimeLookupKey = "wedding_plan";

export const SUBSCRIPTION_LOOKUP_KEYS: SubscriptionLookupKey[] = [
  "pro_monthly",
  "pro_annual",
];

export const ONE_TIME_LOOKUP_KEYS: OneTimeLookupKey[] = ["wedding_plan"];

export type AllLookupKey = SubscriptionLookupKey | OneTimeLookupKey;

export type PlanKey = "free" | "pro" | "wedding_pass";
export type PlanLimits = {
  // If undefined, treat as unlimited for the app's purposes
  maxAiDraftsPerMonth?: number;
};

export type PlanFull = {
  plan: "free" | "wedding" | "pro";
  limits: { maxLists: number | null; maxGiftsPerList: number | null; maxAiDraftsPerMonth: number | null };
};

export function currentPeriodMonthUTC(): string {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}-01`;
}

export async function getAiDraftsThisMonth(): Promise<number> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) return 0;
  const period = currentPeriodMonthUTC();
  const { data } = await supabase
    .from("usage_monthly")
    .select("ai_drafts")
    .eq("period_month", period)
    .maybeSingle();
  return data?.ai_drafts ?? 0;
}

export async function incrementAiDraftsThisMonth(by: number): Promise<void> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) return;
  const period = currentPeriodMonthUTC();
  const used = await getAiDraftsThisMonth();
  const next = used + by;
  await supabase
    .from("usage_monthly")
    .upsert({ user_id: user.id, period_month: period, ai_drafts: next }, { onConflict: "user_id,period_month" });
}

export async function getCurrentPlanForUserFast(): Promise<{ plan: PlanKey; limits: PlanLimits }> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) return { plan: "free", limits: { maxAiDraftsPerMonth: 20 } };

  const [{ data: sub }, { data: ents }] = await Promise.all([
    supabase
      .from("billing_subscriptions")
      .select("status, price_lookup_key, cancel_at_period_end")
      .maybeSingle(),
    supabase
      .from("billing_entitlements")
      .select("product_lookup_key, active"),
  ]);

  let plan: PlanKey = "free";
  if (sub && (sub.status === "active" || sub.status === "trialing")) {
    plan = "pro";
  } else if ((ents ?? []).some((e) => (e.product_lookup_key === "wedding_plan" || e.product_lookup_key === "wedding_pass") && e.active)) {
    plan = "wedding_pass";
  }

  const limits: PlanLimits =
    plan === "free"
      ? { maxAiDraftsPerMonth: 20 }
      : plan === "wedding_pass"
      ? { maxAiDraftsPerMonth: 1000 }
      : { maxAiDraftsPerMonth: undefined };

  return { plan, limits };
}

export async function getCurrentPlanForUser(): Promise<PlanFull> {
  const { plan: internalPlan } = await getCurrentPlanForUserFast();
  const plan: PlanFull["plan"] = internalPlan === "pro" ? "pro" : internalPlan === "wedding_pass" ? "wedding" : "free";
  if (plan === "free") return { plan, limits: { maxLists: 1, maxGiftsPerList: 50, maxAiDraftsPerMonth: 20 } };
  if (plan === "wedding") return { plan, limits: { maxLists: 1, maxGiftsPerList: null, maxAiDraftsPerMonth: 1000 } };
  return { plan, limits: { maxLists: null, maxGiftsPerList: null, maxAiDraftsPerMonth: null } };
}



