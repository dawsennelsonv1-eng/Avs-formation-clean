# AVS Formation — ZIP 6 (Admin Dashboard)

Next.js 14 · TypeScript · Tailwind · shadcn/ui · Supabase · Gemini · Framer Motion · Recharts. Includes ZIP 1–5.

## New in ZIP 6
- **Role-gated admin** (`profiles.role = 'admin'`). Admin entry shows in Profile only for admins; `/admin/*` is protected server-side.
- **Dashboard** with **25 KPIs** + charts: revenue trend (area), revenue by method (donut), enrollments (histogram), signups (area), revenue & enrollments per course (horizontal bars), payment funnel (bar), rating distribution (bar), catalogue by category (pie), quiz pass-rate (bars).
- **Course management**: create/edit/delete, **flyer upload** to Supabase Storage, price/category/color, "Bientôt" + "Outils d'apprentissage" toggles, and a per-course manager for **lessons, flashcards, quiz**.
- **Payments admin**: filter by status, manually grant/reject.
- **Reviews admin**: moderate/delete (auto-recomputes ratings).
- **Users admin**: search, promote/demote admin.
- **Bottom nav renamed**: Accueil · Catalogue · Mes formations · Profil (UI/function unchanged).

## Setup
```bash
npm install
cp .env.example .env.local
# Supabase SQL editor, run in order:
#   schema.sql → seed.sql → schema_zip3.sql → seed_zip3.sql → schema_zip4.sql
#   → schema_zip5.sql → seed_zip5.sql → schema_zip6.sql
npm run dev
```
Then make yourself admin — see `supabase/ADMIN_SETUP.md`.

The whole app (including the admin dashboard) runs on rich mock data with no keys, so you can click through everything before wiring Supabase.

## Security notes
- Every admin API route re-checks `role = 'admin'` server-side (defense in depth alongside RLS).
- `forwarded_sms` stays service-role only; admins read aggregates via SECURITY DEFINER views/functions, not raw rows.
