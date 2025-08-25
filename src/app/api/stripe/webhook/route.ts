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
	'customer.subscription.paused',
	'customer.subscription.resumed',
	'customer.subscription.pending_update_applied',
	'customer.subscription.pending_update_expired',
	'customer.subscription.trial_will_end',
	'invoice.paid',
	'invoice.payment_failed',
	'invoice.payment_action_required',
	'invoice.upcoming',
	'invoice.marked_uncollectible',
	'invoice.payment_succeeded',
	'payment_intent.succeeded',
	'payment_intent.payment_failed',
	'payment_intent.canceled',
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
		case 'customer.subscription.trial_will_end':
		case 'customer.subscription.paused':
		case 'customer.subscription.resumed':
		case 'customer.subscription.pending_update_applied':
		case 'customer.subscription.pending_update_expired': {
			const sub = event.data.object as Stripe.Subscription;
			return { customerId: typeof sub.customer === 'string' ? sub.customer : String(sub.customer) };
		}
		case 'invoice.paid':
		case 'invoice.payment_failed':
		case 'invoice.payment_action_required':
		case 'invoice.upcoming':
		case 'invoice.marked_uncollectible':
		case 'invoice.payment_succeeded': {
			const inv = event.data.object as Stripe.Invoice;
			const customer = inv.customer;
			return {
				customerId: typeof customer === 'string' ? customer : undefined,
				emailHint: inv.customer_email || undefined,
			};
		}
		case 'payment_intent.succeeded':
		case 'payment_intent.payment_failed':
		case 'payment_intent.canceled': {
			const pi = event.data.object as Stripe.PaymentIntent;
			return { customerId: typeof pi.customer === 'string' ? pi.customer : undefined };
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