// src/app/api/stripe/webhook/route.ts
import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { syncStripeStateForCustomer } from '@/lib/billing-sync';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const allowedEvents = new Set<Stripe.Event.Type>([
	'checkout.session.completed',
	'customer.subscription.created',
	'customer.subscription.updated',
	'customer.subscription.deleted',
	'customer.subscription.trial_will_end',
	'invoice.paid',
	'invoice.payment_succeeded',
	'invoice.payment_failed',
]);

function extractCustomerHints(event: Stripe.Event): { customerId?: string; userIdHint?: string; emailHint?: string } {
	switch (event.type) {
		case 'checkout.session.completed': {
			const s = event.data.object as Stripe.Checkout.Session;
			return {
				customerId: s.customer ? String(s.customer) : undefined,
				userIdHint: s.client_reference_id || undefined,
				emailHint: s.customer_details?.email || s.customer_email || undefined,
			};
		}
		case 'customer.subscription.created':
		case 'customer.subscription.updated':
		case 'customer.subscription.deleted':
		case 'customer.subscription.trial_will_end': {
			const sub = event.data.object as Stripe.Subscription;
			return { customerId: String(sub.customer) };
		}
		case 'invoice.paid':
		case 'invoice.payment_succeeded':
		case 'invoice.payment_failed': {
			const inv = event.data.object as Stripe.Invoice;
			const customer = inv.customer;
			return { customerId: typeof customer === 'string' ? customer : undefined };
		}
		default:
			return {};
	}
}

export async function POST(req: Request) {
	const sig = req.headers.get('stripe-signature');
	const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
	const rawBody = await req.text();

	let event: Stripe.Event;

	try {
		if (endpointSecret) {
			if (!sig) return new NextResponse('Missing Stripe signature', { status: 400 });
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
		if (allowedEvents.has(event.type)) {
			const { customerId, userIdHint, emailHint } = extractCustomerHints(event);
			if (customerId) {
				await syncStripeStateForCustomer(customerId, { userId: userIdHint, email: emailHint });
			} else {
				console.warn('Allowed event without customerId:', event.type);
			}
		} else {
			console.log(`Unhandled event type ${event.type}`);
		}
		return new NextResponse(null, { status: 200 });
	} catch (e: unknown) {
		const message = e instanceof Error ? e.message : 'Unknown error';
		console.error('Webhook handler error:', message);
		return new NextResponse('Webhook handler failed', { status: 500 });
	}
}