// src/app/api/billing/summary/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getAiDraftsThisMonth, getCurrentPlanForUser } from "@/lib/plans";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: auth } = await supabase.auth.getUser();
    const user = auth.user;
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const [{ plan, limits }, aiUsed, listsCountRes] = await Promise.all([
      getCurrentPlanForUser(),
      getAiDraftsThisMonth(),
      supabase.from("gift_lists").select("id", { count: "exact", head: true }).eq("owner_id", user.id),
    ]);

    const listsCount = (listsCountRes as any).count ?? 0;

    return NextResponse.json(
      {
        plan,
        limits,
        usage: {
          aiDraftsThisMonth: aiUsed,
          listsCount,
        },
      },
      { status: 200 }
    );
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


