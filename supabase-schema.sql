-- Supabase schema for /admin content management (services + testimonials)
-- Run this once in Supabase Dashboard → SQL Editor.
-- Small site: service-role key is used server-side only.

create table if not exists testimonials (
  id text primary key,
  role text not null,
  quote text not null,
  context text default '',
  image text default ''
);

create table if not exists services (
  slug text primary key,
  title text not null,
  region text not null,
  "shortDescription" text not null,
  "heroHeading" text not null,
  description jsonb not null default '[]',
  image text default ''
);

-- Admin auth (email + password, sessions, password-reset tokens).
-- Passwords are scrypt-hashed in the app; only hashes are stored here.
create table if not exists admin_users (
  id text primary key,
  email text unique not null,
  password_hash text not null,
  reset_hash text,
  reset_expires timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists admin_sessions (
  token_hash text primary key,
  user_id text not null references admin_users(id) on delete cascade,
  expires_at timestamptz not null
);

-- Allow service-role full access (server-side key bypasses RLS anyway,
-- but enable RLS + permissive read policy so anon read works if you ever query client-side).
alter table testimonials enable row level security;
alter table services enable row level security;
alter table admin_users enable row level security;
alter table admin_sessions enable row level security;

drop policy if exists "public read" on testimonials;
create policy "public read" on testimonials for select using (true);

drop policy if exists "public read" on services;
create policy "public read" on services for select using (true);

