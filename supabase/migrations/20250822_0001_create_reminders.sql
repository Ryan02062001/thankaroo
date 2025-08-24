-- Create required extension for UUID generation (safe if already present)
create extension if not exists pgcrypto;

-- Helper trigger function to update updated_at
create or replace function set_updated_at_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- reminder_settings: one row per list
create table if not exists public.reminder_settings (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null unique references public.gift_lists(id) on delete cascade,
  default_intervals_days integer[] not null default '{7,14}',
  default_channel text not null default 'email' check (default_channel in ('email','text','card')),
  auto_generate_drafts boolean not null default true,
  timezone text not null default 'UTC',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Trigger to keep updated_at fresh
create trigger if not exists trg_reminder_settings_updated_at
before update on public.reminder_settings
for each row execute function set_updated_at_timestamp();

-- reminders: scheduled items tied to lists and gifts
create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references public.gift_lists(id) on delete cascade,
  gift_id uuid not null references public.gifts(id) on delete cascade,
  due_at date not null,
  channel text not null check (channel in ('email','text','card')),
  sent boolean not null default false,
  created_at timestamptz not null default now(),
  gift_snapshot jsonb not null
);

-- Helpful indexes
create index if not exists idx_reminders_list_due on public.reminders(list_id, due_at);
create index if not exists idx_reminders_gift on public.reminders(gift_id);

-- Row Level Security
alter table public.reminder_settings enable row level security;
alter table public.reminders enable row level security;

-- Policies for reminder_settings (owner of the list only)
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'reminder_settings' and policyname = 'reminder_settings_select_owner'
  ) then
    create policy reminder_settings_select_owner on public.reminder_settings
      for select
      using (
        exists (
          select 1 from public.gift_lists gl
          where gl.id = reminder_settings.list_id and gl.owner_id = auth.uid()
        )
      );
  end if;
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'reminder_settings' and policyname = 'reminder_settings_insert_owner'
  ) then
    create policy reminder_settings_insert_owner on public.reminder_settings
      for insert
      with check (
        exists (
          select 1 from public.gift_lists gl
          where gl.id = reminder_settings.list_id and gl.owner_id = auth.uid()
        )
      );
  end if;
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'reminder_settings' and policyname = 'reminder_settings_update_owner'
  ) then
    create policy reminder_settings_update_owner on public.reminder_settings
      for update
      using (
        exists (
          select 1 from public.gift_lists gl
          where gl.id = reminder_settings.list_id and gl.owner_id = auth.uid()
        )
      )
      with check (
        exists (
          select 1 from public.gift_lists gl
          where gl.id = reminder_settings.list_id and gl.owner_id = auth.uid()
        )
      );
  end if;
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'reminder_settings' and policyname = 'reminder_settings_delete_owner'
  ) then
    create policy reminder_settings_delete_owner on public.reminder_settings
      for delete
      using (
        exists (
          select 1 from public.gift_lists gl
          where gl.id = reminder_settings.list_id and gl.owner_id = auth.uid()
        )
      );
  end if;
end $$;

-- Policies for reminders (owner of the list only)
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'reminders' and policyname = 'reminders_select_owner'
  ) then
    create policy reminders_select_owner on public.reminders
      for select
      using (
        exists (
          select 1 from public.gift_lists gl
          where gl.id = reminders.list_id and gl.owner_id = auth.uid()
        )
      );
  end if;
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'reminders' and policyname = 'reminders_insert_owner'
  ) then
    create policy reminders_insert_owner on public.reminders
      for insert
      with check (
        exists (
          select 1 from public.gift_lists gl
          where gl.id = reminders.list_id and gl.owner_id = auth.uid()
        )
      );
  end if;
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'reminders' and policyname = 'reminders_update_owner'
  ) then
    create policy reminders_update_owner on public.reminders
      for update
      using (
        exists (
          select 1 from public.gift_lists gl
          where gl.id = reminders.list_id and gl.owner_id = auth.uid()
        )
      )
      with check (
        exists (
          select 1 from public.gift_lists gl
          where gl.id = reminders.list_id and gl.owner_id = auth.uid()
        )
      );
  end if;
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'reminders' and policyname = 'reminders_delete_owner'
  ) then
    create policy reminders_delete_owner on public.reminders
      for delete
      using (
        exists (
          select 1 from public.gift_lists gl
          where gl.id = reminders.list_id and gl.owner_id = auth.uid()
        )
      );
  end if;
end $$;


