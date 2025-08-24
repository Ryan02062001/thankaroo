This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
# thankaroo

## Stripe setup

Set these environment variables (server-only secrets must not be exposed to the client):

```
# Stripe
STRIPE_SECRET_KEY=sk_live_or_test_...
# Optional: pin Stripe API version to ensure stability
STRIPE_API_VERSION=2024-12-18
# Webhook signing secret (from Stripe CLI or Dashboard > Webhooks)
STRIPE_WEBHOOK_SECRET=whsec_...

# App URL
NEXT_PUBLIC_APP_URL=https://your-app.example.com

# Supabase
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

Recommended: add a `.env.example` with the keys above.

### Webhooks (Next.js route handler)

- Endpoint: `POST /api/stripe/webhook`
- In Stripe Dashboard, add your deployed URL; in local dev, use Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

If you use the CLI, export the provided signing secret to `STRIPE_WEBHOOK_SECRET`.

### Checkout and Billing Portal

- Checkout: `POST /api/stripe/create-checkout-session`
  - Links session to authenticated Supabase user via `client_reference_id`
  - Reuses `stripe_customer_id` from user metadata if present, otherwise uses `customer_email`
  - Uses idempotency for safety

- Billing portal: `GET/POST /api/stripe/create-portal-session`
  - Prefers `stripe_customer_id` from Supabase user metadata
  - Falls back to email-based customer lookup

### Webhook behavior

- On `checkout.session.completed`, when `client_reference_id` is present, stores `stripe_customer_id` on the Supabase user. Otherwise invites by email and attaches the ID to metadata.

Ensure your Stripe Prices use the lookup keys referenced in `src/app/pricing/page.tsx` (e.g., `wedding_pass`, `thank_you_pro_monthly`, `thank_you_pro_yearly`).
