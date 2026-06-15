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
