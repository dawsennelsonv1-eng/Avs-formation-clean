-- ============================================================
-- AVS Formation — TARGETED FIX (run ONLY this, not RUN_ALL)
-- 1) Lets admins grant access (the "violates RLS policy for enrollments" error)
-- 2) Adds an optional banner image to bundles / special offers
-- Safe to run once. Idempotent.
-- ============================================================

-- 1) Admins can insert/update/delete enrollments for ANY user (grant access).
drop policy if exists "admin manage enrollments" on enrollments;
create policy "admin manage enrollments" on enrollments
  for all using (is_admin()) with check (is_admin());

-- 2) Optional banner image for bundles (special offers).
alter table bundles add column if not exists image_url text;
