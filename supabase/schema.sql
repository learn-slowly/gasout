-- Supabase schema for LNG platform
-- Run this in Supabase SQL editor

-- Extensions (if not enabled)
create extension if not exists pgcrypto;

-- Tables
create table if not exists public.power_plants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null,
  latitude numeric(10,8) not null,
  longitude numeric(11,8) not null,
  capacity_mw integer,
  status text check (status in ('계획중','건설중','운영중','백지화')),
  operator text,
  permit_date date,
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text check (role in ('admin','activist')) default 'activist',
  managed_region_id uuid,
  created_at timestamptz default now()
);

create table if not exists public.activity_posts (
  id uuid primary key default gen_random_uuid(),
  plant_id uuid references public.power_plants(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete set null,
  title text not null,
  content text not null,
  images text[],
  youtube_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Row Level Security
alter table public.power_plants enable row level security;
alter table public.profiles enable row level security;
alter table public.activity_posts enable row level security;

-- Policies: public read for plants & posts
drop policy if exists power_plants_read_public on public.power_plants;
create policy power_plants_read_public on public.power_plants
  for select
  using (true);

drop policy if exists activity_posts_read_public on public.activity_posts;
create policy activity_posts_read_public on public.activity_posts
  for select
  using (true);

-- Profiles
drop policy if exists profiles_self_select on public.profiles;
create policy profiles_self_select on public.profiles
  for select
  using (auth.uid() = id);

-- Only authenticated users can insert/update their own profile
drop policy if exists profiles_self_upsert on public.profiles;
create policy profiles_self_upsert on public.profiles
  for insert
  with check (auth.uid() = id);

drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Activity posts: authenticated users can create, authors can update/delete
drop policy if exists activity_posts_insert_auth on public.activity_posts;
create policy activity_posts_insert_auth on public.activity_posts
  for insert to authenticated
  with check (auth.uid() = author_id);

drop policy if exists activity_posts_update_own on public.activity_posts;
create policy activity_posts_update_own on public.activity_posts
  for update to authenticated
  using (auth.uid() = author_id);

drop policy if exists activity_posts_delete_own on public.activity_posts;
create policy activity_posts_delete_own on public.activity_posts
  for delete to authenticated
  using (auth.uid() = author_id);

-- Plants: read-only for public; admins will manage via SQL/secure API later
-- Optionally, allow admins by JWT claim (role = 'admin') to write
-- Example claim-based write policy (uncomment when using custom JWT):
-- create policy power_plants_admin_write on public.power_plants
--   for all to authenticated using ((auth.jwt() ->> 'user_role') = 'admin') with check ((auth.jwt() ->> 'user_role') = 'admin');

-- Triggers: updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_updated_at_power_plants on public.power_plants;
create trigger set_updated_at_power_plants
before update on public.power_plants
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_activity_posts on public.activity_posts;
create trigger set_updated_at_activity_posts
before update on public.activity_posts
for each row execute function public.set_updated_at();


