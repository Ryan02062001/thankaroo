// src/app/api/stripe/create-portal-session/route.ts
import { NextResponse } from "next/server";
import { stripe, getOrCreateCustomerIdForCurrentUser, getBillingPortalReturnUrl } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const customer = await getOrCreateCustomerIdForCurrentUser();
    const session = await stripe.billingPortal.sessions.create({
      customer,
      return_url: getBillingPortalReturnUrl(),
    });
    // Redirect the caller directly to the Stripe Billing Portal
    return NextResponse.redirect(session.url, { status: 303 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: { message } }, { status: 500 });
  }
}


