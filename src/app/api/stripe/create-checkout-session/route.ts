// src/app/api/stripe/create-checkout-session/route.ts
import { NextResponse } from "next/server";
import { stripe, getOrCreateCustomerIdForCurrentUser, successUrlWithSession, cancelUrl, resolvePriceByLookupKey, deriveModeFromLookupKey } from "@/lib/stripe";
import { createClient } from "@/utils/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = {
  lookup_key?: string;
  price_id?: string;
};

export async function POST(req: Request) {
  try {
    const payload = (await req.json().catch(() => ({}))) as Body;
    const lookupKey = payload.lookup_key;
    const priceIdInput = payload.price_id;

    // Require auth explicitly so we can return 401 (client will redirect)
    const supabase = await createClient();
    const { data: auth } = await supabase.auth.getUser();
    const user = auth.user;
    if (!user) return NextResponse.json({ error: { message: "Unauthorized" } }, { status: 401 });

    const customerId = await getOrCreateCustomerIdForCurrentUser();

    // Resolve price
    let priceId: string | null = null;
    let recurring = false;
    if (priceIdInput) {
      priceId = priceIdInput;
      const p = await stripe.prices.retrieve(priceId);
      recurring = Boolean(p.recurring);
    } else if (lookupKey) {
      const resolved = await resolvePriceByLookupKey(lookupKey);
      if (!resolved) return NextResponse.json({ error: { message: `Unknown price lookup_key: ${lookupKey}` } }, { status: 400 });
      priceId = resolved.id;
      recurring = resolved.recurring;
    } else {
      return NextResponse.json({ error: { message: "Missing price_id or lookup_key" } }, { status: 400 });
    }

    const mode = recurring ? "subscription" : deriveModeFromLookupKey(lookupKey || "");

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode,
      success_url: successUrlWithSession(),
      cancel_url: cancelUrl(),
      metadata: lookupKey ? { price_lookup_key: lookupKey } : undefined,
      line_items: [
        {
          price: priceId!,
          quantity: 1,
          // minimum subscription period: enforce 3 months for pro_monthly using trial/phase? Stripe doesn't support directly.
          // We'll enforce on our side for cancellations.
        },
      ],
      allow_promotion_codes: true,
      // If desired, set `subscription_data[trial_settings]` here.
    });

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: { message } }, { status: 500 });
  }
}


