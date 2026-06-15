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
