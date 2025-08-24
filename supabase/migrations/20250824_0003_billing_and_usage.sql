-- Create billing + usage tables and RLS policies

create table if not exists public.billing_customers (
  user_id uuid primary key references auth.users(id) on delete cascade,
  stripe_customer_id text unique not null,
  created_at timestamptz not null default now()
);

create table if not exists public.billing_subscriptions (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  price_lookup_key text,
  status text not null,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Trigger fn (safe if already exists in earlier migrations)
create or replace function public.set_updated_at_timestamp()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_billing_subscriptions_updated_at on public.billing_subscriptions;
create trigger trg_billing_subscriptions_updated_at
before update on public.billing_subscriptions
for each row execute function public.set_updated_at_timestamp();

create table if not exists public.billing_entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_lookup_key text not null,
  active boolean not null default true,
  granted_at timestamptz not null default now(),
  unique (user_id, product_lookup_key)
);

create table if not exists public.usage_monthly (
  user_id uuid not null references auth.users(id) on delete cascade,
  period_month date not null,
  ai_drafts integer not null default 0,
  primary key (user_id, period_month)
);

alter table public.billing_customers enable row level security;
alter table public.billing_subscriptions enable row level security;
alter table public.billing_entitlements enable row level security;
alter table public.usage_monthly enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='billing_customers' and policyname='billing_customers_owner_select'
  ) then
    create policy billing_customers_owner_select on public.billing_customers
      for select using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='billing_subscriptions' and policyname='billing_subscriptions_owner_select'
  ) then
    create policy billing_subscriptions_owner_select on public.billing_subscriptions
      for select using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='billing_entitlements' and policyname='billing_entitlements_owner_select'
  ) then
    create policy billing_entitlements_owner_select on public.billing_entitlements
      for select using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='usage_monthly' and policyname='usage_monthly_owner_select'
  ) then
    create policy usage_monthly_owner_select on public.usage_monthly
      for select using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='usage_monthly' and policyname='usage_monthly_owner_insert'
  ) then
    create policy usage_monthly_owner_insert on public.usage_monthly
      for insert with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='usage_monthly' and policyname='usage_monthly_owner_update'
  ) then
    create policy usage_monthly_owner_update on public.usage_monthly
      for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
end $$;


