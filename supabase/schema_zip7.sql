-- ============================================================
-- AVS Formation — Schema v7: Bundles (Offres groupées) + Events (Évènements)
-- Run AFTER schema_zip6.sql. Safe to re-run.
-- ============================================================

-- ---------- BUNDLES ----------
create table if not exists bundles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  blurb text,
  price integer not null default 0,
  was integer not null default 0,
  color text not null default '#7B3FF2',
  featured boolean not null default false,   -- the "Offre limitée" hero
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists bundle_courses (
  bundle_id uuid references bundles(id) on delete cascade,
  course_id uuid references courses(id) on delete cascade,
  position integer not null default 0,
  primary key (bundle_id, course_id)
);

-- ---------- EVENTS ----------
create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  date_label text not null,   -- e.g. "15 JUIN"
  time_label text not null,   -- e.g. "19h00"
  live boolean not null default false,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- RLS: public read, admin write ----------
alter table bundles enable row level security;
alter table bundle_courses enable row level security;
alter table events enable row level security;

do $$
declare t text;
begin
  foreach t in array array['bundles','bundle_courses','events'] loop
    execute format('drop policy if exists "public read %1$s" on %1$s', t);
    execute format('create policy "public read %1$s" on %1$s for select using (true)', t);
    execute format('drop policy if exists "admin manage %1$s" on %1$s', t);
    execute format('create policy "admin manage %1$s" on %1$s for all using (is_admin()) with check (is_admin())', t);
  end loop;
end $$;
