// src/lib/billing-sync.ts
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { getSupabaseAdmin } from '@/lib/admin';

async function findUserIdByCustomer(admin: ReturnType<typeof getSupabaseAdmin>, customerId: string) {
	const { data } = await admin
		.from('billing_customers')
		.select('user_id')
		.eq('stripe_customer_id', customerId)
		.maybeSingle();
	return (data as { user_id: string } | null)?.user_id as string | undefined;
}

async function findUserIdByEmail(admin: ReturnType<typeof getSupabaseAdmin>, email: string) {
	try {
		for (let page = 1; page <= 3; page++) {
			// Supabase JS v2 admin API
			const { data } = await admin.auth.admin.listUsers({ page, perPage: 200 });
			const users: Array<{ id: string; email?: string | null }> = data?.users ?? [];
			const match = users.find((u) => (u.email || '').toLowerCase() === email.toLowerCase());
			if (match?.id) return match.id;
			if (!users.length) break;
		}
	} catch {}
	return undefined;
}

export async function syncStripeStateForCustomer(
	customerId: string,
	hints?: { userId?: string; email?: string },
): Promise<{ subsUpserted: number; entitlementsUpserted: number; userId?: string }> {
	const admin = getSupabaseAdmin();

	// Resolve userId
	let userId = hints?.userId || (await findUserIdByCustomer(admin, customerId));
	if (!userId) {
		let email = hints?.email;
		if (!email) {
			try {
				const c = (await stripe.customers.retrieve(customerId)) as Stripe.Customer;
				email = c.email || undefined;
			} catch {}
		}
		if (email) {
			userId = (await findUserIdByEmail(admin, email)) || undefined;
		}
	}
	if (userId) {
		// Ensure mapping
		await admin.from('billing_customers').upsert({ user_id: userId, stripe_customer_id: customerId }, { onConflict: 'user_id' });
	}

	// If we still don't know the user, we can't write to user-scoped tables
	if (!userId) {
		return { subsUpserted: 0, entitlementsUpserted: 0, userId: undefined };
	}

	// Subscriptions
	const subs = await stripe.subscriptions.list({ customer: customerId, status: 'all', limit: 20 });
	let subsUpserted = 0;
	for (const s of subs.data) {
		const item = s.items.data[0];
		const lookupKey = (item?.price?.lookup_key ?? null) as string | null;
		const cpe = (s as unknown as { current_period_end?: number }).current_period_end;
		const currentPeriodEnd = cpe ? new Date(cpe * 1000).toISOString() : null;

		await admin.from('billing_subscriptions').upsert(
			{
				id: s.id,
				user_id: userId,
				price_lookup_key: lookupKey,
				status: s.status,
				current_period_end: currentPeriodEnd,
				cancel_at_period_end: !!s.cancel_at_period_end,
			},
			{ onConflict: 'id' },
		);
		subsUpserted += 1;
	}

	// One-time entitlements (e.g., wedding_pass)
	const sessions = await stripe.checkout.sessions.list({
		customer: customerId,
		limit: 50,
		expand: ['data.line_items'],
	});
	let entitlementsUpserted = 0;
	for (const session of sessions.data) {
		if (session.mode !== 'payment' || session.status !== 'complete') continue;
		const metaLookup = session.metadata?.price_lookup_key || '';
		const linePrice = (session as unknown as { line_items?: { data?: Array<{ price?: { lookup_key?: string } }> } }).line_items?.data?.[0]?.price;
		const liLookup = (linePrice?.lookup_key ?? '') as string;
		const lookup = metaLookup || liLookup;
		if (lookup === 'wedding_pass_') {
			await admin
				.from('billing_entitlements')
				.upsert({ user_id: userId, product_lookup_key: 'wedding_pass_', active: true }, { onConflict: 'user_id,product_lookup_key' });
			entitlementsUpserted += 1;
		}
	}

	return { subsUpserted, entitlementsUpserted, userId };
}