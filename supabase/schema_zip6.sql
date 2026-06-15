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
