// src/lib/stripe.ts
import Stripe from 'stripe';

const secretKey = process.env.STRIPE_SECRET_KEY;
if (!secretKey) {
	throw new Error('Missing STRIPE_SECRET_KEY');
}

// Allow pinning API version via env; fallback to account default if unset.
const apiVersion = process.env.STRIPE_API_VERSION as Stripe.LatestApiVersion | undefined;

export const stripe = new Stripe(secretKey, {
	apiVersion,
	appInfo: {
		name: 'Thankaroo',
		url: 'https://thankaroo.com'
	}
});

export async function getPriceByLookupOrId(params: { lookup_key?: string; price_id?: string }) {
	const { lookup_key, price_id } = params;
	if (price_id) {
		return stripe.prices.retrieve(price_id);
	}
	if (lookup_key) {
		const prices = await stripe.prices.list({
			lookup_keys: [lookup_key],
			expand: ['data.product'],
		});
		const price = prices.data[0];
		if (!price) {
			throw new Error(`No price found for lookup_key=${lookup_key}`);
		}
		return price;
	}
	throw new Error('Provide lookup_key or price_id');
}

export function checkoutModeForPrice(price: Stripe.Price): 'payment' | 'subscription' {
	return price.recurring ? 'subscription' : 'payment';
}