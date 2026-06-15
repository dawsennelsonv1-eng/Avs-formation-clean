-- ============================================================
-- AVS Formation — Schema v2 (ZIP 2)
-- Run in Supabase SQL editor. Safe to re-run.
-- ============================================================

-- ---------- PROFILES ----------
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  whatsapp text,
  streak int default 0,
  created_at timestamptz default now()
);

-- ---------- COURSES ----------
create table if not exists courses (
  id uuid primary key default gen_random_uuid(),
  slug text unique,
  title text not null,
  tag text not null,
  blurb text,
  summary text,
  price int not null default 0,                         -- HTG; 0 = free
  is_free boolean generated always as (price = 0) stored,
  rating numeric default 0,
  reviews int default 0,
  duration_min int default 0,
  lessons int default 0,
  color text default '#7B3FF2',
  video_url text,
  upcoming boolean default false,
  created_at timestamptz default now()
);

-- ---------- ENROLLMENTS (access grants) ----------
create table if not exists enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  course_id uuid references courses(id) on delete cascade,
  progress int default 0,
  last_lesson int default 0,
  completed boolean default false,
  granted_at timestamptz default now(),
  unique (user_id, course_id)
);

-- ============================================================
-- PAYMENT VERIFICATION
-- ============================================================

-- Transaction IDs harvested from the SMS forwarder (your phone -> webhook).
create table if not exists forwarded_sms (
  id uuid primary key default gen_random_uuid(),
  method text not null check (method in ('moncash','natcash')),
  transaction_id text not null,
  amount int,
  sender_phone text,
  raw_text text,
  consumed boolean default false,
  consumed_by uuid references profiles(id),
  received_at timestamptz default now(),
  unique (method, transaction_id)   -- core anti-reuse guard
);

create index if not exists forwarded_sms_lookup
  on forwarded_sms (method, transaction_id, consumed);

-- Every payment attempt a client submits.
create table if not exists payment_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete set null,
  course_id uuid references courses(id) on delete cascade,
  method text not null check (method in ('moncash','natcash')),
  full_name text not null,
  whatsapp text not null,
  proof_kind text not null check (proof_kind in ('id','screenshot')),
  submitted_transaction_id text,
  extracted_via_ai boolean default false,
  screenshot_path text,
  status text not null default 'pending'
    check (status in ('granted','pending','rejected','duplicate')),
  matched_sms_id uuid references forwarded_sms(id),
  created_at timestamptz default now()
);

create index if not exists payment_submissions_user
  on payment_submissions (user_id, status);

-- ============================================================
-- VERIFICATION FUNCTION (atomic match + consume + grant)
-- ============================================================
create or replace function verify_payment(
  p_user uuid,
  p_course uuid,
  p_method text,
  p_transaction_id text,
  p_full_name text,
  p_whatsapp text,
  p_proof_kind text,
  p_extracted_via_ai boolean default false,
  p_screenshot_path text default null
) returns text
language plpgsql
security definer
as $$
declare
  v_price int;
  v_sms forwarded_sms%rowtype;
  v_status text;
  v_sub_id uuid;
begin
  select price into v_price from courses where id = p_course;
  if v_price is null then
    return 'rejected';
  end if;

  insert into payment_submissions
    (user_id, course_id, method, full_name, whatsapp, proof_kind,
     submitted_transaction_id, extracted_via_ai, screenshot_path, status)
  values
    (p_user, p_course, p_method, p_full_name, p_whatsapp, p_proof_kind,
     p_transaction_id, p_extracted_via_ai, p_screenshot_path, 'pending')
  returning id into v_sub_id;

  select * into v_sms
  from forwarded_sms
  where method = p_method
    and transaction_id = p_transaction_id
  for update;

  if not found then
    v_status := 'pending';
  elsif v_sms.consumed then
    v_status := 'duplicate';
  elsif v_sms.amount is not null and v_sms.amount < v_price then
    v_status := 'rejected';
  else
    update forwarded_sms
      set consumed = true, consumed_by = p_user
      where id = v_sms.id;

    insert into enrollments (user_id, course_id)
    values (p_user, p_course)
    on conflict (user_id, course_id) do nothing;

    v_status := 'granted';
  end if;

  update payment_submissions
    set status = v_status,
        matched_sms_id = case when v_status = 'granted' then v_sms.id else null end
    where id = v_sub_id;

  return v_status;
end;
$$;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table profiles enable row level security;
alter table enrollments enable row level security;
alter table payment_submissions enable row level security;
alter table forwarded_sms enable row level security;
alter table courses enable row level security;

drop policy if exists "courses readable" on courses;
create policy "courses readable" on courses for select using (true);

drop policy if exists "own profile" on profiles;
create policy "own profile" on profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "own enrollments" on enrollments;
create policy "own enrollments" on enrollments
  for select using (auth.uid() = user_id);

drop policy if exists "own submissions" on payment_submissions;
create policy "own submissions" on payment_submissions
  for select using (auth.uid() = user_id);

-- forwarded_sms: no public policies — service role only.
