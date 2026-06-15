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
