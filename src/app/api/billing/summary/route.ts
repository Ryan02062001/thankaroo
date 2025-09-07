// src/app/api/billing/summary/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getAiDraftsThisMonth, getCurrentPlanForUserFast } from "@/lib/plans";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function fullLimitsFor(plan: "free" | "wedding" | "pro") {
  if (plan === "free") return { maxLists: 1, maxGiftsPerList: 50, maxAiDraftsPerMonth: 20 } as const;
  if (plan === "wedding") return { maxLists: 1, maxGiftsPerList: null, maxAiDraftsPerMonth: 500 } as const;
  return { maxLists: null, maxGiftsPerList: null, maxAiDraftsPerMonth: null } as const; // pro
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: auth } = await supabase.auth.getUser();
    const user = auth.user;
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const [{ plan: internalPlan }, aiUsed, listsCountRes] = await Promise.all([
      getCurrentPlanForUserFast(),
      getAiDraftsThisMonth(),
      supabase
        .from("gift_lists")
        .select("id", { count: "exact", head: true })
        .eq("owner_id", user.id),
    ]);

    const plan: "free" | "wedding" | "pro" =
      internalPlan === "pro" ? "pro" : internalPlan === "tracker_pro" ? "wedding" : "free";

    const limits = fullLimitsFor(plan);
    const usage = {
      aiDraftsThisMonth: aiUsed,
      listsCount: listsCountRes.count ?? 0,
    };

    return NextResponse.json({ plan, limits, usage });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


