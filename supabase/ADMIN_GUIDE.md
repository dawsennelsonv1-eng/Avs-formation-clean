# Managing courses & learning tools

## Add a new course
Insert a row in `courses` (Supabase Table editor or SQL):
```sql
insert into courses (slug, title, tag, blurb, summary, price, duration_min, lessons, color, has_learning_tools)
values ('mon-cours','Mon Cours','Marketing','Accroche courte','Résumé complet',
        1500, 120, 10, '#7B3FF2', true);  -- has_learning_tools: true | false
```

## Decide per course whether it has AI tutor / quiz / flashcards
The single switch is the **`has_learning_tools`** column on `courses`.
- `true`  → the "Apprends & mémorise" panel (AI tutor + cards + quiz) appears on the course page, and the card shows an INTERACTIF badge.
- `false` → only the video player + reviews show. No tutor, no quiz, no cards.

Flip it any time:
```sql
update courses set has_learning_tools = true  where slug = 'mon-cours';
update courses set has_learning_tools = false where slug = 'autre-cours';
```

Note: the AI tutor tab always appears when tools are on. The Cards tab shows only if the course has flashcards; the Quiz tab only if it has questions — so you can enable tools and add just a quiz, just cards, or both.

## Add flashcards to a course
```sql
insert into flashcards (course_id, front, back, position)
select id, 'Question ?', 'Réponse.', 0 from courses where slug='mon-cours';
```

## Add quiz questions to a course
```sql
insert into quiz_questions (course_id, question, options, correct_index, explanation, position)
select id,
  'Ta question ?',
  '["Option A","Option B","Option C"]'::jsonb,
  1,                       -- index of the correct option (0-based)
  'Pourquoi B est correct.',
  0
from courses where slug='mon-cours';
```

## How memory (spaced repetition) works
Each flashcard answer is graded (À revoir / Difficile / Bien / Facile) and stored per user in
`card_reviews` using an SM-2 schedule (`lib/learning/srs.ts`). Weak cards get a short interval and
resurface sooner; mastered cards space out. Quiz results land in `quiz_attempts` and feed the
"Quiz réussis" stat on Ma Formation (a pass = score ≥ 70%).
