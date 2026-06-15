# Admin setup

## Make yourself an admin
After signing up normally, run this in the Supabase SQL editor (use your email):
```sql
update profiles set role = 'admin'
where id = (select id from auth.users where email = 'you@example.com');
```
Refresh the app — an "Tableau de bord Admin" card appears in Profile, and `/admin/*` becomes accessible.
Non-admins are redirected away from `/admin` server-side.

## Storage bucket
`schema_zip6.sql` creates a public `course-media` bucket for flyers. If it already existed, the
policies are still applied. Flyers uploaded from the admin course editor go to `course-media/flyers/`.

## What admins can do
- **Tableau de bord** — 25 KPIs + charts (revenue trend, revenue by method donut, enrollments
  histogram, signups area, revenue/enrollments per course bars, payment funnel, rating distribution,
  category pie, quiz pass-rate bars).
- **Formations** — create / edit / delete courses, upload flyers, set price/category/color,
  toggle "Bientôt" and "Outils d'apprentissage"; per-course manager for lessons, flashcards, quiz.
- **Paiements** — filter by status, manually grant or reject pending submissions.
- **Avis** — moderate (delete) reviews; ratings auto-recompute.
- **Utilisateurs** — search users, promote/demote admin role.

## The 25 tracked metrics
Revenu total · Revenu 30j · ARPU · Taux de conversion · Utilisateurs · Nouveaux 7j · Onboardés ·
Inscriptions · Formations terminées · Formations actives · Payantes/Gratuites · Leçons ·
Paiements validés · En attente · Doublons bloqués · Rejetés · SMS reçus · Note moyenne · Avis ·
Quiz tentés · Taux de réussite quiz · Flashcards · Révisions cartes · Revenu MonCash · Revenu NatCash.
