// src/app/api/stripe/backfill/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { stripe } from '@/lib/stripe';
import { getSupabaseAdmin } from '@/lib/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: auth } = await supabase.auth.getUser();
    const user = auth.user;
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const admin = getSupabaseAdmin();

    type UserMeta = { stripe_customer_id?: string };
    const meta = (user.user_metadata ?? {}) as UserMeta;
    let customerId = meta.stripe_customer_id;

    if (!customerId && user.email) {
      const existing = await stripe.customers.list({ email: user.email, limit: 1 });
      customerId = existing.data[0]?.id;
    }

    if (!customerId) {
      return NextResponse.json({ error: 'No Stripe customer for this user' }, { status: 404 });
    }

    // Ensure mapping exists
    await admin
      .from('billing_customers')
      .upsert({ user_id: user.id, stripe_customer_id: customerId }, { onConflict: 'user_id' });

    // Backfill subscriptions
    const subs = await stripe.subscriptions.list({ customer: customerId, status: 'all', limit: 20 });
    let subsUpserted = 0;
    for (const s of subs.data) {
      const item = s.items.data[0];
      const lookupKey = (item?.price?.lookup_key ?? null) as string | null;
      const currentPeriodEnd = s.current_period_end ? new Date(s.current_period_end * 1000).toISOString() : null;
      await admin.from('billing_subscriptions').upsert(
        {
          id: s.id,
          user_id: user.id,
          price_lookup_key: lookupKey,
          status: s.status,
          current_period_end: currentPeriodEnd,
          cancel_at_period_end: !!s.cancel_at_period_end,
        },
        { onConflict: 'id' },
      );
      subsUpserted += 1;
    }

    // Backfill one-time entitlements (e.g., wedding_pass)
    const sessions = await stripe.checkout.sessions.list({
      customer: customerId,
      limit: 20,
      expand: ['data.line_items'],
    });
    let entitlementsUpserted = 0;
    for (const session of sessions.data) {
      if (session.mode !== 'payment' || session.status !== 'complete') continue;
      const metaLookup = session.metadata?.price_lookup_key || '';
      const linePrice = (session as unknown as { line_items?: { data?: Array<{ price?: { lookup_key?: string } }> } }).line_items?.data?.[0]?.price;
      const liLookup = (linePrice?.lookup_key ?? '') as string;
      const lookup = metaLookup || liLookup;
      if (lookup === 'wedding_pass') {
        await admin
          .from('billing_entitlements')
          .upsert({ user_id: user.id, product_lookup_key: 'wedding_pass', active: true }, { onConflict: 'user_id,product_lookup_key' });
        entitlementsUpserted += 1;
      }
    }

    return NextResponse.json({ ok: true, subsUpserted, entitlementsUpserted }, { status: 200 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


