-- ============================================================
-- AVS Formation — RUN_ALL.sql
-- Paste this ENTIRE file into Supabase > SQL Editor and click RUN.
-- It runs every migration + seed in the correct order, in one go.
-- Safe to re-run.
-- ============================================================


-- ============================================================
-- SECTION: schema.sql
-- ============================================================
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


-- ============================================================
-- SECTION: seed.sql
-- ============================================================
-- Seed the 6 demo courses. Run after schema.sql.
insert into courses (slug, title, tag, blurb, summary, price, rating, reviews, duration_min, lessons, color, upcoming)
values
('marketing-digital','Maîtriser le Marketing Digital','Marketing',
 'De zéro à expert : publicités, tunnels de vente et stratégie de contenu.',
 'Apprenez à lancer des campagnes rentables, créer du contenu viral et bâtir une audience fidèle.',
 1500,4.8,124,200,18,'#7B3FF2',false),
('carte-debit-virtuelle','Obtenir une Carte de Débit Virtuelle','Cartes',
 'Guide pas à pas pour obtenir et activer ta carte sans tracas.',
 'Tout ce qu''il faut savoir pour créer une carte virtuelle, l''alimenter et payer en ligne en sécurité.',
 0,4.9,302,42,6,'#0FA3B1',false),
('art-de-la-vente','L''Art de la Vente','Ventes',
 'Techniques de persuasion et closing pour vendre n''importe quoi.',
 'Maîtrise la psychologie de l''acheteur, la gestion des objections et le closing à fort taux de conversion.',
 2000,4.7,89,245,22,'#E5484D',false),
('dropshipping','Dropshipping de A à Z','E-commerce',
 'Construis ta boutique rentable même sans budget de départ.',
 'Trouve des produits gagnants, lance ta boutique et scale avec la pub payante.',
 2500,4.6,156,310,28,'#3BB273',true),
('tiktok-organique','TikTok Organique : Devenir Viral','Marketing',
 'Le système exact pour des vidéos à des millions de vues.',
 'Hooks, montage, tendances et algorithme : tout pour exploser ta portée sans dépenser un sou.',
 1200,4.9,410,170,15,'#F2618C',true),
('finances-personnelles','Finances Personnelles & Budget','Finance',
 'Gère ton argent comme un pro et arrête de stresser.',
 'Méthodes simples pour budgétiser, épargner et investir tes premiers gourdes intelligemment.',
 0,4.8,198,90,9,'#E8B84B',true)
on conflict (slug) do nothing;


-- ============================================================
-- SECTION: schema_zip3.sql
-- ============================================================
-- ============================================================
-- AVS Formation — Schema v3 (ZIP 3): learning tools
-- Run AFTER schema.sql (and seed.sql). Safe to re-run.
-- ============================================================

-- Per-course switch: does this course expose AI tutor / quizzes / flashcards?
alter table courses add column if not exists has_learning_tools boolean default false;

-- ---------- FLASHCARDS (content authored per course) ----------
create table if not exists flashcards (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references courses(id) on delete cascade,
  front text not null,
  back text not null,
  position int default 0,
  created_at timestamptz default now()
);
create index if not exists flashcards_course on flashcards (course_id, position);

-- ---------- QUIZZES ----------
create table if not exists quiz_questions (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references courses(id) on delete cascade,
  question text not null,
  options jsonb not null,          -- ["opt a","opt b",...]
  correct_index int not null,
  explanation text,
  position int default 0
);
create index if not exists quiz_course on quiz_questions (course_id, position);

create table if not exists quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  course_id uuid references courses(id) on delete cascade,
  score int not null,              -- correct answers
  total int not null,
  created_at timestamptz default now()
);
create index if not exists quiz_attempts_user on quiz_attempts (user_id, course_id);

-- ---------- SPACED-REPETITION MEMORY (per user per card) ----------
-- Lightweight SM-2-style scheduling so weak cards resurface.
create table if not exists card_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  card_id uuid references flashcards(id) on delete cascade,
  ease numeric default 2.5,        -- ease factor
  interval_days int default 0,     -- current interval
  repetitions int default 0,       -- consecutive correct
  due_at timestamptz default now(),
  last_grade int,                  -- 0=again 1=hard 2=good 3=easy
  updated_at timestamptz default now(),
  unique (user_id, card_id)
);
create index if not exists card_reviews_due on card_reviews (user_id, due_at);

-- ---------- REVIEWS ----------
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  course_id uuid references courses(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  body text,
  author_name text,
  created_at timestamptz default now(),
  unique (user_id, course_id)      -- one review per user per course
);
create index if not exists reviews_course on reviews (course_id, created_at desc);

-- ---------- RLS ----------
alter table flashcards enable row level security;
alter table quiz_questions enable row level security;
alter table quiz_attempts enable row level security;
alter table card_reviews enable row level security;
alter table reviews enable row level security;

drop policy if exists "flashcards readable" on flashcards;
create policy "flashcards readable" on flashcards for select using (true);

drop policy if exists "quiz readable" on quiz_questions;
create policy "quiz readable" on quiz_questions for select using (true);

drop policy if exists "reviews readable" on reviews;
create policy "reviews readable" on reviews for select using (true);

drop policy if exists "own review write" on reviews;
create policy "own review write" on reviews
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own attempts" on quiz_attempts;
create policy "own attempts" on quiz_attempts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own card reviews" on card_reviews;
create policy "own card reviews" on card_reviews
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------- helper: average rating refresh ----------
create or replace function refresh_course_rating(p_course uuid)
returns void language sql as $$
  update courses c set
    rating = coalesce((select round(avg(rating)::numeric,1) from reviews where course_id = p_course),0),
    reviews = coalesce((select count(*) from reviews where course_id = p_course),0)
  where c.id = p_course;
$$;


-- ============================================================
-- SECTION: seed_zip3.sql
-- ============================================================
-- Enable learning tools on selected courses (you decide which).
update courses set has_learning_tools = true
  where slug in ('marketing-digital','tiktok-organique','art-de-la-vente');

-- Flashcards for TikTok course
insert into flashcards (course_id, front, back, position)
select id, 'Quel est le but d''un hook ?', 'Capter l''attention dans les 3 premières secondes.', 0 from courses where slug='tiktok-organique'
union all
select id, 'Combien de secondes pour accrocher ?', 'Environ 3 secondes — le scroll est impitoyable.', 1 from courses where slug='tiktok-organique'
union all
select id, 'Qu''est-ce qui booste la rétention ?', 'Un montage rythmé et une promesse claire dès le départ.', 2 from courses where slug='tiktok-organique';

-- Quiz for TikTok course
insert into quiz_questions (course_id, question, options, correct_index, explanation, position)
select id,
 'Quel est le facteur n°1 pour devenir viral sur TikTok ?',
 '["Le nombre d''abonnés","Le hook des 3 premières secondes","La durée de la vidéo"]'::jsonb,
 1, 'C''est le hook : sans accroche immédiate, le spectateur scrolle.', 0
from courses where slug='tiktok-organique'
union all
select id,
 'Que regarde l''algorithme en priorité ?',
 '["Le taux de rétention et de replay","La date de publication","Le nombre de hashtags"]'::jsonb,
 0, 'La rétention/replay signale un contenu engageant.', 1
from courses where slug='tiktok-organique';


-- ============================================================
-- SECTION: schema_zip4.sql
-- ============================================================
-- ============================================================
-- AVS Formation — Schema v4 (ZIP 4): auth profile bootstrap
-- Run AFTER schema.sql / schema_zip3.sql. Safe to re-run.
-- ============================================================

-- Auto-create a profiles row whenever a new auth user signs up.
-- full_name / whatsapp are read from the signup metadata if present.
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, whatsapp, streak)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'whatsapp',
    0
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Backfill profiles for any users created before the trigger existed.
insert into public.profiles (id, full_name, streak)
select u.id, coalesce(u.raw_user_meta_data->>'full_name', split_part(u.email,'@',1)), 0
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;


-- ============================================================
-- SECTION: schema_zip5.sql
-- ============================================================
-- ============================================================
-- AVS Formation — Schema v5 (ZIP 5): lessons + onboarding
-- Run AFTER schema_zip4.sql. Safe to re-run.
-- ============================================================

-- Onboarding: store interests + a completed flag on the profile.
alter table profiles add column if not exists onboarded boolean default false;
alter table profiles add column if not exists interests text[] default '{}';

-- ---------- LESSONS ----------
create table if not exists lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references courses(id) on delete cascade,
  title text not null,
  duration_min int default 0,
  video_url text,
  is_preview boolean default false,   -- previewable without unlocking
  position int default 0,
  created_at timestamptz default now()
);
create index if not exists lessons_course on lessons (course_id, position);

-- Per-user lesson completion.
create table if not exists lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  lesson_id uuid references lessons(id) on delete cascade,
  course_id uuid references courses(id) on delete cascade,
  completed boolean default true,
  completed_at timestamptz default now(),
  unique (user_id, lesson_id)
);
create index if not exists lesson_progress_user on lesson_progress (user_id, course_id);

alter table lessons enable row level security;
alter table lesson_progress enable row level security;

drop policy if exists "lessons readable" on lessons;
create policy "lessons readable" on lessons for select using (true);

drop policy if exists "own lesson progress" on lesson_progress;
create policy "own lesson progress" on lesson_progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Recompute enrollment progress % from completed lessons.
create or replace function recompute_progress(p_user uuid, p_course uuid)
returns void language plpgsql security definer as $$
declare
  v_total int;
  v_done int;
  v_pct int;
begin
  select count(*) into v_total from lessons where course_id = p_course;
  select count(*) into v_done from lesson_progress
    where user_id = p_user and course_id = p_course and completed;
  v_pct := case when v_total = 0 then 0 else round(100.0 * v_done / v_total) end;

  update enrollments
    set progress = v_pct,
        last_lesson = v_done,
        completed = (v_total > 0 and v_done >= v_total)
    where user_id = p_user and course_id = p_course;
end;
$$;


-- ============================================================
-- SECTION: seed_zip5.sql
-- ============================================================
-- Sample lessons for the TikTok course.
insert into lessons (course_id, title, duration_min, is_preview, position)
select id, 'Introduction & état d''esprit', 8, true, 0 from courses where slug='tiktok-organique'
union all
select id, 'Le hook parfait en 3 secondes', 12, false, 1 from courses where slug='tiktok-organique'
union all
select id, 'Monter une vidéo qui retient', 15, false, 2 from courses where slug='tiktok-organique'
union all
select id, 'Comprendre l''algorithme', 10, false, 3 from courses where slug='tiktok-organique'
union all
select id, 'Analyser et itérer', 9, false, 4 from courses where slug='tiktok-organique';


-- ============================================================
-- SECTION: schema_zip6.sql
-- ============================================================
-- ============================================================
-- AVS Formation — Schema v6 (ZIP 6): admin role, analytics, storage
-- Run AFTER schema_zip5.sql. Safe to re-run.
-- ============================================================

-- ---------- ROLE ----------
alter table profiles add column if not exists role text not null default 'user'
  check (role in ('user','admin'));

-- Helper: is the current user an admin? (used in RLS policies)
create or replace function is_admin()
returns boolean language sql security definer stable as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

-- ---------- ADMIN WRITE POLICIES ----------
-- Admins can fully manage catalogue + learning content.
do $$
declare t text;
begin
  foreach t in array array['courses','lessons','flashcards','quiz_questions'] loop
    execute format('drop policy if exists "admin manage %1$s" on %1$s', t);
    execute format(
      'create policy "admin manage %1$s" on %1$s for all using (is_admin()) with check (is_admin())', t);
  end loop;
end $$;

-- Admins can read everything needed for the dashboard.
drop policy if exists "admin read submissions" on payment_submissions;
create policy "admin read submissions" on payment_submissions
  for select using (is_admin() or auth.uid() = user_id);

drop policy if exists "admin manage submissions" on payment_submissions;
create policy "admin manage submissions" on payment_submissions
  for update using (is_admin()) with check (is_admin());

drop policy if exists "admin read enrollments" on enrollments;
create policy "admin read enrollments" on enrollments
  for select using (is_admin() or auth.uid() = user_id);

drop policy if exists "admin read profiles" on profiles;
create policy "admin read profiles" on profiles
  for select using (is_admin() or auth.uid() = id);

drop policy if exists "admin moderate reviews" on reviews;
create policy "admin moderate reviews" on reviews
  for delete using (is_admin());

drop policy if exists "admin read attempts" on quiz_attempts;
create policy "admin read attempts" on quiz_attempts
  for select using (is_admin() or auth.uid() = user_id);

-- ---------- STORAGE: course flyers + lesson videos ----------
insert into storage.buckets (id, name, public)
values ('course-media','course-media', true)
on conflict (id) do nothing;

drop policy if exists "public read course media" on storage.objects;
create policy "public read course media" on storage.objects
  for select using (bucket_id = 'course-media');

drop policy if exists "admin write course media" on storage.objects;
create policy "admin write course media" on storage.objects
  for all using (bucket_id = 'course-media' and is_admin())
  with check (bucket_id = 'course-media' and is_admin());

-- flyer_url column on courses
alter table courses add column if not exists flyer_url text;

-- ============================================================
-- ANALYTICS VIEWS (read by the admin dashboard)
-- ============================================================

-- 1) Daily revenue (granted payments x course price)
create or replace view v_daily_revenue as
select date_trunc('day', ps.created_at)::date as day,
       sum(c.price) as revenue,
       count(*) as sales
from payment_submissions ps
join courses c on c.id = ps.course_id
where ps.status = 'granted'
group by 1 order by 1;

-- 2) Revenue by payment method
create or replace view v_revenue_by_method as
select ps.method,
       sum(c.price) as revenue,
       count(*) as sales
from payment_submissions ps
join courses c on c.id = ps.course_id
where ps.status = 'granted'
group by 1;

-- 3) Daily new enrollments
create or replace view v_daily_enrollments as
select date_trunc('day', granted_at)::date as day, count(*) as enrollments
from enrollments group by 1 order by 1;

-- 4) Daily signups
create or replace view v_daily_signups as
select date_trunc('day', created_at)::date as day, count(*) as signups
from profiles group by 1 order by 1;

-- 5) Course performance (enrollments + revenue + rating)
create or replace view v_course_performance as
select c.id, c.title, c.tag, c.price,
       count(distinct e.id) as enrollments,
       coalesce(sum(case when ps.status='granted' then c.price end),0) as revenue,
       c.rating, c.reviews
from courses c
left join enrollments e on e.course_id = c.id
left join payment_submissions ps on ps.course_id = c.id and ps.status='granted'
group by c.id, c.title, c.tag, c.price, c.rating, c.reviews;

-- 6) Payment funnel by status
create or replace view v_payment_funnel as
select status, count(*) as count from payment_submissions group by status;

-- 7) Rating distribution
create or replace view v_rating_distribution as
select rating, count(*) as count from reviews group by rating order by rating;

-- 8) Quiz pass rate per course
create or replace view v_quiz_pass_rate as
select c.title,
       count(*) filter (where qa.score::numeric / nullif(qa.total,0) >= 0.7) as passed,
       count(*) as attempts
from quiz_attempts qa join courses c on c.id = qa.course_id
group by c.title;

-- 9) Tag/category distribution of catalogue
create or replace view v_category_distribution as
select tag, count(*) as courses from courses group by tag;

-- 10) Lesson completion rate per course
create or replace view v_lesson_completion as
select c.title,
       count(lp.*)::numeric / nullif(count(distinct l.id) * nullif(count(distinct lp.user_id),0),0) as completion_ratio
from courses c
left join lessons l on l.course_id = c.id
left join lesson_progress lp on lp.course_id = c.id
group by c.title;

-- Aggregate KPI snapshot used for the metric cards.
create or replace function admin_kpis()
returns json language sql security definer stable as $$
  select json_build_object(
    'total_revenue', coalesce((select sum(c.price) from payment_submissions ps join courses c on c.id=ps.course_id where ps.status='granted'),0),
    'revenue_30d', coalesce((select sum(c.price) from payment_submissions ps join courses c on c.id=ps.course_id where ps.status='granted' and ps.created_at > now()-interval '30 days'),0),
    'total_users', (select count(*) from profiles),
    'users_7d', (select count(*) from profiles where created_at > now()-interval '7 days'),
    'total_enrollments', (select count(*) from enrollments),
    'active_courses', (select count(*) from courses),
    'pending_payments', (select count(*) from payment_submissions where status='pending'),
    'granted_payments', (select count(*) from payment_submissions where status='granted'),
    'duplicate_attempts', (select count(*) from payment_submissions where status='duplicate'),
    'rejected_payments', (select count(*) from payment_submissions where status='rejected'),
    'avg_rating', coalesce((select round(avg(rating),2) from reviews),0),
    'total_reviews', (select count(*) from reviews),
    'quiz_attempts', (select count(*) from quiz_attempts),
    'quiz_pass_rate', coalesce((select round(100.0*count(*) filter (where score::numeric/nullif(total,0)>=0.7)/nullif(count(*),0),1) from quiz_attempts),0),
    'completed_courses', (select count(*) from enrollments where completed),
    'free_courses', (select count(*) from courses where price=0),
    'paid_courses', (select count(*) from courses where price>0),
    'total_lessons', (select count(*) from lessons),
    'flashcards_count', (select count(*) from flashcards),
    'card_reviews', (select count(*) from card_reviews),
    'sms_received', (select count(*) from forwarded_sms),
    'sms_unconsumed', (select count(*) from forwarded_sms where not consumed),
    'conversion_rate', coalesce((select round(100.0*count(*) filter (where status='granted')/nullif(count(*),0),1) from payment_submissions),0),
    'arpu', coalesce((select round( (select sum(c.price) from payment_submissions ps join courses c on c.id=ps.course_id where ps.status='granted')::numeric / nullif((select count(*) from profiles),0), 0)),0),
    'onboarded_users', (select count(*) from profiles where onboarded)
  );
$$;


-- ============================================================
-- SECTION: schema_zip7.sql
-- ============================================================
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

-- ============================================================
-- SECTION: schema_zip8.sql
-- ============================================================
-- ============================================================
-- AVS Formation — Schema v8: lesson content (video + slideshow + text)
-- Run AFTER schema_zip7.sql. Safe to re-run.
-- ============================================================

-- video_url already exists. Add slideshow images + optional written content.
alter table lessons add column if not exists image_urls jsonb not null default '[]'::jsonb;
alter table lessons add column if not exists content text;
