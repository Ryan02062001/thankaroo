// src/app/api/stripe/create-portal-session/route.ts
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/utils/supabase/server';
import { getSupabaseAdmin } from '@/lib/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type UserMetadata = { stripe_customer_id?: string } & Record<string, unknown>;

async function createPortalForCustomer(customerId: string, origin: string) {
	const configuration = process.env.STRIPE_BILLING_PORTAL_CONFIGURATION_ID || undefined;
	const portal = await stripe.billingPortal.sessions.create({
		customer: customerId,
		return_url: origin,
		...(configuration ? { configuration } : {}),
	});
	return NextResponse.redirect(portal.url, { status: 303 });
}

async function createPortalFromSessionId(session_id: string, origin: string) {
	const checkoutSession = await stripe.checkout.sessions.retrieve(session_id);
	const customer = checkoutSession.customer;
	if (!customer) {
		// Try to derive a customer from the session email
		const email = checkoutSession.customer_details?.email || checkoutSession.customer_email || '';
		if (!email) {
			return NextResponse.json({ error: { message: 'No customer on session' } }, { status: 400 });
		}
		const existing = await stripe.customers.list({ email, limit: 1 });
		let customerId = existing.data[0]?.id;
		if (!customerId) {
			const created = await stripe.customers.create({ email });
			customerId = created.id;
		}
		return createPortalForCustomer(customerId, origin);
	}
	return createPortalForCustomer(String(customer), origin);
}

export async function GET(req: Request) {
	try {
		const origin = req.headers.get('origin') ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
		const url = new URL(req.url);
		const session_id = url.searchParams.get('session_id') || '';
		if (session_id) {
			return await createPortalFromSessionId(session_id, origin);
		}

		// Fallback: derive customer from signed-in user
		const supabase = await createClient();
		const { data: userRes } = await supabase.auth.getUser();
		const email = userRes.user?.email || '';
		const metadata = (userRes.user?.user_metadata ?? {}) as UserMetadata;
		const customerIdFromMeta = metadata.stripe_customer_id;
		const customerId = customerIdFromMeta
			|| (email ? (await stripe.customers.list({ email, limit: 1 })).data[0]?.id : undefined);
		if (!customerId) return NextResponse.json({ error: { message: 'No Stripe customer for this user' } }, { status: 404 });

		// Upsert mapping so billing_customers is populated even without webhooks
		if (userRes.user?.id) {
			try {
				const admin = getSupabaseAdmin();
				await admin.from('billing_customers').upsert({ user_id: userRes.user.id, stripe_customer_id: customerId }, { onConflict: 'user_id' });
			} catch {}
		}

		return await createPortalForCustomer(customerId, origin);
	} catch (e: unknown) {
		const message = e instanceof Error ? e.message : 'Unknown error';
		return NextResponse.json({ error: { message } }, { status: 500 });
	}
}

export async function POST(req: Request) {
	try {
		const origin = req.headers.get('origin') ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

		let session_id = '';
		const contentType = req.headers.get('content-type') || '';
		if (contentType.includes('application/json')) {
			const body = await req.json();
			session_id = body.session_id ?? '';
		} else {
			const form = await req.formData();
			session_id = String(form.get('session_id') || '');
		}

		if (session_id) {
			return await createPortalFromSessionId(session_id, origin);
		}

		// Same fallback as GET: signed-in user -> customer by metadata/email
		const supabase = await createClient();
		const { data: userRes } = await supabase.auth.getUser();
		const email = userRes.user?.email || '';
		const metadata = (userRes.user?.user_metadata ?? {}) as UserMetadata;
		const customerIdFromMeta = metadata.stripe_customer_id;
		const customerId = customerIdFromMeta
			|| (email ? (await stripe.customers.list({ email, limit: 1 })).data[0]?.id : undefined);
		if (!customerId) return NextResponse.json({ error: { message: 'No Stripe customer for this user' } }, { status: 404 });

		// Upsert mapping so billing_customers is populated even without webhooks
		if (userRes.user?.id) {
			try {
				const admin = getSupabaseAdmin();
				await admin.from('billing_customers').upsert({ user_id: userRes.user.id, stripe_customer_id: customerId }, { onConflict: 'user_id' });
			} catch {}
		}

		return await createPortalForCustomer(customerId, origin);
	} catch (e: unknown) {
		const message = e instanceof Error ? e.message : 'Unknown error';
		return NextResponse.json({ error: { message } }, { status: 500 });
	}
}