-- Create required extension for UUID generation (safe if already present)
create extension if not exists pgcrypto;

-- Helper trigger function to update updated_at (reused if exists)
create or replace function set_updated_at_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- thank_you_notes: persisted drafts and sent notes
create table if not exists public.thank_you_notes (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references public.gift_lists(id) on delete cascade,
  gift_id uuid not null references public.gifts(id) on delete cascade,
  channel text not null check (channel in ('email','text','card')),
  relationship text not null check (relationship in ('friend','family','coworker','other')),
  tone text not null check (tone in ('warm','formal','playful')),
  status text not null default 'draft' check (status in ('draft','sent')),
  content text not null default '',
  meta jsonb not null default '{}', -- e.g., { occasion: 'wedding', personalTouch: '...' }
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  sent_at timestamptz null
);

-- Trigger to keep updated_at fresh (CREATE TRIGGER does not support IF NOT EXISTS)
drop trigger if exists trg_thank_you_notes_updated_at on public.thank_you_notes;
create trigger trg_thank_you_notes_updated_at
before update on public.thank_you_notes
for each row execute function set_updated_at_timestamp();

-- Helpful indexes
create index if not exists idx_thank_you_notes_list_created on public.thank_you_notes(list_id, created_at desc);
create index if not exists idx_thank_you_notes_list_status on public.thank_you_notes(list_id, status);
create index if not exists idx_thank_you_notes_gift on public.thank_you_notes(gift_id);

-- Row Level Security
alter table public.thank_you_notes enable row level security;

-- Policies: owner of the list only
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'thank_you_notes' and policyname = 'thank_you_notes_select_owner'
  ) then
    create policy thank_you_notes_select_owner on public.thank_you_notes
      for select
      using (
        exists (
          select 1 from public.gift_lists gl
          where gl.id = thank_you_notes.list_id and gl.owner_id = auth.uid()
        )
      );
  end if;
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'thank_you_notes' and policyname = 'thank_you_notes_insert_owner'
  ) then
    create policy thank_you_notes_insert_owner on public.thank_you_notes
      for insert
      with check (
        exists (
          select 1 from public.gift_lists gl
          where gl.id = thank_you_notes.list_id and gl.owner_id = auth.uid()
        )
      );
  end if;
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'thank_you_notes' and policyname = 'thank_you_notes_update_owner'
  ) then
    create policy thank_you_notes_update_owner on public.thank_you_notes
      for update
      using (
        exists (
          select 1 from public.gift_lists gl
          where gl.id = thank_you_notes.list_id and gl.owner_id = auth.uid()
        )
      )
      with check (
        exists (
          select 1 from public.gift_lists gl
          where gl.id = thank_you_notes.list_id and gl.owner_id = auth.uid()
        )
      );
  end if;
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'thank_you_notes' and policyname = 'thank_you_notes_delete_owner'
  ) then
    create policy thank_you_notes_delete_owner on public.thank_you_notes
      for delete
      using (
        exists (
          select 1 from public.gift_lists gl
          where gl.id = thank_you_notes.list_id and gl.owner_id = auth.uid()
        )
      );
  end if;
end $$;


