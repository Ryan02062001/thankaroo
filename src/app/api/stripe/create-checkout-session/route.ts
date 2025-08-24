// src/app/api/stripe/create-checkout-session/route.ts
import { NextResponse } from 'next/server';
import { stripe, getPriceByLookupOrId, checkoutModeForPrice } from '@/lib/stripe';
import { createClient } from '@/utils/supabase/server';
import { randomUUID } from 'node:crypto';
import type Stripe from 'stripe';
import { getSupabaseAdmin } from '@/lib/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type UserMetadata = { stripe_customer_id?: string } & Record<string, unknown>;

export async function POST(req: Request) {
	try {
		const origin = req.headers.get('origin') ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
		const { lookup_key, price_id } = await req.json();

		const price = await getPriceByLookupOrId({ lookup_key, price_id });
		const mode = checkoutModeForPrice(price);

		const supabase = await createClient();
		const { data: authRes } = await supabase.auth.getUser();
		const user = authRes.user;

		const params: Stripe.Checkout.SessionCreateParams = {
			billing_address_collection: 'auto',
			allow_promotion_codes: true,
			line_items: [{ price: price.id, quantity: 1 }],
			mode,
			success_url: `${origin}/pricing?success=true&session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${origin}/pricing?canceled=true`,
			metadata: {
				price_lookup_key: String((lookup_key ?? (price as unknown as { lookup_key?: string })?.lookup_key) || ''),
			},
		};

		if (user?.id) {
			params.client_reference_id = user.id;
		}
		const metadata = (user?.user_metadata ?? {}) as UserMetadata;
		const existingCustomerId = metadata.stripe_customer_id;
		if (existingCustomerId) {
			params.customer = existingCustomerId;
		} else if (user?.email) {
			params.customer_email = user.email;
		}

		// Ensure Checkout creates a Customer for one-time payments if we didn't supply one,
		// and also create an Invoice so it shows up in the Billing Portal history.
		if (mode === 'payment') {
			if (!params.customer) {
				params.customer_creation = 'always';
			}
			params.invoice_creation = { enabled: true };
		}

		// If we already know user + customer id, upsert mapping immediately
		if (user?.id && params.customer) {
			try {
				const admin = getSupabaseAdmin();
				await admin.from('billing_customers').upsert({ user_id: user.id, stripe_customer_id: String(params.customer) }, { onConflict: 'user_id' });
			} catch {}
		}

		const idempotencyKey = randomUUID();
		const session = await stripe.checkout.sessions.create(params, { idempotencyKey });

		return NextResponse.json({ url: session.url }, { status: 200 });
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : 'Unknown error';
		return NextResponse.json({ error: { message } }, { status: 400 });
	}
}