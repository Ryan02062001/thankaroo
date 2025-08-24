-- Ensure RLS and owner policies on gift_lists

alter table if exists public.gift_lists enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='gift_lists' and policyname='gift_lists_owner_select'
  ) then
    create policy gift_lists_owner_select on public.gift_lists
      for select using (auth.uid() = owner_id);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='gift_lists' and policyname='gift_lists_owner_insert'
  ) then
    create policy gift_lists_owner_insert on public.gift_lists
      for insert with check (auth.uid() = owner_id);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='gift_lists' and policyname='gift_lists_owner_update'
  ) then
    create policy gift_lists_owner_update on public.gift_lists
      for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='gift_lists' and policyname='gift_lists_owner_delete'
  ) then
    create policy gift_lists_owner_delete on public.gift_lists
      for delete using (auth.uid() = owner_id);
  end if;
end $$;

-- Helpful index for counting by owner
create index if not exists idx_gift_lists_owner on public.gift_lists(owner_id);


