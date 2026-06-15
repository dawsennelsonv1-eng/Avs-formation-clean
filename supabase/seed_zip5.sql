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
