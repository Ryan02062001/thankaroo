// src/app/api/stripe/webhook/route.ts
import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getSupabaseAdmin } from '@/lib/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function upsertBillingCustomer(admin: ReturnType<typeof getSupabaseAdmin>, userId: string, customerId: string) {
  await admin
    .from('billing_customers')
    .upsert({ user_id: userId, stripe_customer_id: customerId }, { onConflict: 'user_id' });
}

async function findUserIdByCustomer(admin: ReturnType<typeof getSupabaseAdmin>, customerId: string) {
  const { data } = await admin
    .from('billing_customers')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .maybeSingle();
  return (data as { user_id: string } | null)?.user_id as string | undefined;
}

export async function POST(req: Request) {
	console.log('Stripe webhook POST /api/stripe/webhook invoked');
	const sig = req.headers.get('stripe-signature');
	const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
	const rawBody = await req.text();

	let event: Stripe.Event;

	try {
		if (endpointSecret) {
			if (!sig) {
				return new NextResponse('Missing Stripe signature', { status: 400 });
			}
			event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
		} else {
			event = JSON.parse(rawBody) as Stripe.Event;
		}
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : 'Unknown error';
		console.error('Webhook signature verification failed:', message);
		return new NextResponse('Bad signature', { status: 400 });
	}

	try {
		switch (event.type) {
			case 'checkout.session.completed': {
				const admin = getSupabaseAdmin();
				const session = event.data.object as Stripe.Checkout.Session;
				const email = session.customer_details?.email || '';
				const customerId = session.customer ? String(session.customer) : '';
				const refUserId = session.client_reference_id || '';
				const lookupKey = session.metadata?.price_lookup_key || '';

				if (customerId && refUserId) {
					await upsertBillingCustomer(admin, refUserId, customerId);
					// Grant one-time entitlement for Wedding Pass purchases
					if (session.mode === 'payment' && lookupKey === 'wedding_pass') {
						await admin
							.from('billing_entitlements')
							.upsert({ user_id: refUserId, product_lookup_key: 'wedding_pass', active: true }, { onConflict: 'user_id,product_lookup_key' });
					}
				} else if (email && customerId) {
					// No user id available — store mapping by inviting user and ask sign-in
					await admin.auth.admin.inviteUserByEmail(email, {
						data: { stripe_customer_id: customerId },
						redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/signin`,
					});
				}

				console.log(`Checkout completed: ${session.id} customer=${customerId} email=${email}`);
				break;
			}
			case 'invoice.paid': {
				console.log('Invoice paid (good time to provision access)');
				break;
			}
			case 'customer.subscription.trial_will_end':
			case 'customer.subscription.deleted':
			case 'customer.subscription.created':
			case 'customer.subscription.updated': {
				const admin = getSupabaseAdmin();
				const sub = event.data.object as Stripe.Subscription;
				const customerId = String(sub.customer);
				const userId = await findUserIdByCustomer(admin, customerId);
				if (!userId) {
					console.warn('No user mapping for Stripe customer:', customerId);
					break;
				}

				const item = sub.items.data[0];
				const lookupKey = (item?.price?.lookup_key ?? '') as string;
				const status = sub.status;
				const currentPeriodEnd = sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null;

				await admin.from('billing_subscriptions').upsert(
					{
						id: sub.id,
						user_id: userId,
						price_lookup_key: lookupKey || null,
						status,
						current_period_end: currentPeriodEnd,
						cancel_at_period_end: !!sub.cancel_at_period_end,
					},
					{ onConflict: 'id' },
				);

				break;
			}
			case 'entitlements.active_entitlement_summary.updated': {
				console.log('Entitlements updated');
				break;
			}
			default:
				console.log(`Unhandled event type ${event.type}`);
		}
		return new NextResponse(null, { status: 200 });
	} catch (e: unknown) {
		const message = e instanceof Error ? e.message : 'Unknown error';
		console.error('Webhook handler error:', message);
		return new NextResponse('Webhook handler failed', { status: 500 });
	}
}