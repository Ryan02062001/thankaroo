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

		// Associate the session with the signed-in user
		if (user?.id) {
			params.client_reference_id = user.id;
		}

		// Always ensure a Stripe Customer exists before starting checkout (recommended)
		let customerId: string | undefined;
		if (user?.id) {
			// 1) Try DB mapping first
			const { data: bc } = await supabase
				.from('billing_customers')
				.select('stripe_customer_id')
				.eq('user_id', user.id)
				.maybeSingle();
			customerId = (bc as { stripe_customer_id?: string } | null)?.stripe_customer_id;

			// 2) Try user metadata next
			if (!customerId) {
				const metadata = (user.user_metadata ?? {}) as UserMetadata;
				customerId = metadata.stripe_customer_id;
			}

			// 3) Create the customer if still missing
			if (!customerId && user.email) {
				const created = await stripe.customers.create({
					email: user.email,
					metadata: { userId: user.id },
				});
				customerId = created.id;
				// Upsert mapping with admin key (RLS-safe)
				try {
					const admin = getSupabaseAdmin();
					await admin
						.from('billing_customers')
						.upsert({ user_id: user.id, stripe_customer_id: customerId }, { onConflict: 'user_id' });
				} catch {}
			}
		}

		// Prefer passing an explicit customer to avoid ephemeral customers
		if (customerId) {
			params.customer = customerId;
		} else if (user?.email) {
			// Guest or no user mapping available: fall back to email
			params.customer_email = user.email;
		}

		// For one-time payments, if we still don't have a customer, let Stripe create one and create an invoice
		if (mode === 'payment' && !params.customer) {
			params.customer_creation = 'always';
			params.invoice_creation = { enabled: true };
		}

		// If we already know user + customer id, upsert mapping immediately
		if (user?.id && params.customer) {
			try {
				const admin = getSupabaseAdmin();
				await admin
					.from('billing_customers')
					.upsert({ user_id: user.id, stripe_customer_id: String(params.customer) }, { onConflict: 'user_id' });
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