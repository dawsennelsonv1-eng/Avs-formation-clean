-- ============================================================
-- AVS Formation — Schema v8: lesson content (video + slideshow + text)
-- Run AFTER schema_zip7.sql. Safe to re-run.
-- ============================================================

-- video_url already exists. Add slideshow images + optional written content.
alter table lessons add column if not exists image_urls jsonb not null default '[]'::jsonb;
alter table lessons add column if not exists content text;
