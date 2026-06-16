-- ============================================================
-- AVS Formation — Schema v9: manual grants & direct (off-system) payments
-- Run AFTER schema_zip8.sql. Safe to re-run.
-- ============================================================

-- Allow a 'manual' payment method (admin grants / direct payments).
alter table payment_submissions drop constraint if exists payment_submissions_method_check;
alter table payment_submissions add constraint payment_submissions_method_check
  check (method in ('moncash','natcash','manual'));

-- Custom amount (for direct payments not equal to course price) + admin note.
alter table payment_submissions add column if not exists amount integer;
alter table payment_submissions add column if not exists note text;

-- ---------- Revenue views recomputed to honour manual amounts ----------
-- Use the recorded amount when present, otherwise fall back to course price.

create or replace view v_daily_revenue as
select date_trunc('day', ps.created_at)::date as day,
       sum(coalesce(ps.amount, c.price)) as revenue,
       count(*) as sales
from payment_submissions ps
join courses c on c.id = ps.course_id
where ps.status = 'granted'
group by 1 order by 1;

create or replace view v_revenue_by_method as
select ps.method,
       sum(coalesce(ps.amount, c.price)) as revenue,
       count(*) as sales
from payment_submissions ps
join courses c on c.id = ps.course_id
where ps.status = 'granted'
group by 1;

create or replace view v_course_performance as
select c.id, c.title, c.tag, c.price,
       count(distinct e.id) as enrollments,
       coalesce(sum(case when ps.status='granted' then coalesce(ps.amount, c.price) end),0) as revenue,
       c.rating, c.reviews
from courses c
left join enrollments e on e.course_id = c.id
left join payment_submissions ps on ps.course_id = c.id and ps.status='granted'
group by c.id, c.title, c.tag, c.price, c.rating, c.reviews;

-- KPI snapshot: revenue figures honour manual amounts too.
create or replace function admin_kpis()
returns json language sql security definer stable as $$
  select json_build_object(
    'total_revenue', coalesce((select sum(coalesce(ps.amount, c.price)) from payment_submissions ps join courses c on c.id=ps.course_id where ps.status='granted'),0),
    'revenue_30d', coalesce((select sum(coalesce(ps.amount, c.price)) from payment_submissions ps join courses c on c.id=ps.course_id where ps.status='granted' and ps.created_at > now()-interval '30 days'),0),
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
    'arpu', coalesce((select round( (select sum(coalesce(ps.amount, c.price)) from payment_submissions ps join courses c on c.id=ps.course_id where ps.status='granted')::numeric / nullif((select count(*) from profiles),0), 0)),0),
    'onboarded_users', (select count(*) from profiles where onboarded)
  );
$$;
