// src/app/api/stripe/prices/route.ts
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const prices = await stripe.prices.list({ active: true, limit: 100, expand: ["data.product"] });
    // Return minimal public info
    const data = prices.data.map((p) => ({
      id: p.id,
      lookup_key: p.lookup_key ?? null,
      unit_amount: p.unit_amount,
      currency: p.currency,
      recurring: p.recurring ? { interval: p.recurring.interval, interval_count: p.recurring.interval_count } : null,
      product:
        typeof p.product === "string"
          ? p.product
          : {
              id: p.product.id,
              name: "name" in p.product ? p.product.name : null,
            },
    }));
    return NextResponse.json({ data });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: { message } }, { status: 500 });
  }
}


