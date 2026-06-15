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
