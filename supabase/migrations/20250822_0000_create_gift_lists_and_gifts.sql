-- Base schema for lists and gifts.
-- Later migrations already depend on these tables existing.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public'
      and t.typname = 'gift_type'
  ) then
    create type public.gift_type as enum ('non registry', 'monetary', 'registry', 'multiple');
  end if;
end
$$;

create table if not exists public.gift_lists (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.gifts (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references public.gift_lists(id) on delete cascade,
  guest_name text not null,
  description text not null,
  gift_type public.gift_type not null default 'non registry',
  date_received date not null default current_date,
  thank_you_sent boolean not null default false,
  thank_you_sent_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_gift_lists_updated_at on public.gift_lists;
create trigger trg_gift_lists_updated_at
before update on public.gift_lists
for each row execute function public.set_updated_at_timestamp();

drop trigger if exists trg_gifts_updated_at on public.gifts;
create trigger trg_gifts_updated_at
before update on public.gifts
for each row execute function public.set_updated_at_timestamp();

create index if not exists idx_gift_lists_owner on public.gift_lists(owner_id);
create index if not exists idx_gifts_list_date on public.gifts(list_id, date_received desc);
create index if not exists idx_gifts_list_guest on public.gifts(list_id, guest_name);

alter table public.gift_lists enable row level security;
alter table public.gifts enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'gift_lists' and policyname = 'gift_lists_owner_select'
  ) then
    create policy gift_lists_owner_select on public.gift_lists
      for select using (auth.uid() = owner_id);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'gift_lists' and policyname = 'gift_lists_owner_insert'
  ) then
    create policy gift_lists_owner_insert on public.gift_lists
      for insert with check (auth.uid() = owner_id);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'gift_lists' and policyname = 'gift_lists_owner_update'
  ) then
    create policy gift_lists_owner_update on public.gift_lists
      for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'gift_lists' and policyname = 'gift_lists_owner_delete'
  ) then
    create policy gift_lists_owner_delete on public.gift_lists
      for delete using (auth.uid() = owner_id);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'gifts' and policyname = 'gifts_owner_select'
  ) then
    create policy gifts_owner_select on public.gifts
      for select
      using (
        exists (
          select 1
          from public.gift_lists gl
          where gl.id = gifts.list_id
            and gl.owner_id = auth.uid()
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'gifts' and policyname = 'gifts_owner_insert'
  ) then
    create policy gifts_owner_insert on public.gifts
      for insert
      with check (
        exists (
          select 1
          from public.gift_lists gl
          where gl.id = gifts.list_id
            and gl.owner_id = auth.uid()
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'gifts' and policyname = 'gifts_owner_update'
  ) then
    create policy gifts_owner_update on public.gifts
      for update
      using (
        exists (
          select 1
          from public.gift_lists gl
          where gl.id = gifts.list_id
            and gl.owner_id = auth.uid()
        )
      )
      with check (
        exists (
          select 1
          from public.gift_lists gl
          where gl.id = gifts.list_id
            and gl.owner_id = auth.uid()
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'gifts' and policyname = 'gifts_owner_delete'
  ) then
    create policy gifts_owner_delete on public.gifts
      for delete
      using (
        exists (
          select 1
          from public.gift_lists gl
          where gl.id = gifts.list_id
            and gl.owner_id = auth.uid()
        )
      );
  end if;
end $$;
