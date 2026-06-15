# Setup from a tablet (no command line)

You do **not** need to run any commands. Vercel runs `npm install` and the build for you automatically on every push. The only "commands" in this whole project are SQL, and those run inside the Supabase website (a text box + a Run button) — perfectly doable on a tablet.

Here is the entire flow using only websites.

---

## 1. Get the code onto GitHub (no git, no terminal)

1. Go to **github.com** and create a new empty repository (e.g. `avs-formation`). Do NOT add a README.
2. On the new repo page, tap **"uploading an existing file"** (it's a link in the quick-setup box).
3. Unzip `avs-formation-zip6.zip` on your tablet, then drag/select the files to upload.
   - GitHub's web uploader accepts folders. Upload the **contents** of the `avs` folder (so `package.json`, `app/`, `components/`, etc. sit at the repo root — not nested inside an `avs/` folder).
   - **Do NOT upload `node_modules`** (it isn't in the zip anyway). `.gitignore` already excludes it.
4. Tap **Commit changes**.

> Tablet tip: GitHub's mobile web uploader can be limited with large folder trees. If it struggles, upload in batches (root files first, then each top-level folder: `app`, `components`, `lib`, `config`, `public`, `supabase`, `types`).

---

## 2. Deploy on Vercel (Vercel runs the build for you)

1. Go to **vercel.com** → sign in with GitHub → **Add New Project** → import your repo.
2. Vercel auto-detects Next.js. **You don't set any build commands** — it already knows to run `npm install` and `next build`.
3. Before deploying, open **Environment Variables** and add each one (copy the names from `.env.example`):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `GEMINI_API_KEY`
   - `NEXT_PUBLIC_MONCASH_NAME`, `NEXT_PUBLIC_MONCASH_PHONE`
   - `NEXT_PUBLIC_NATCASH_NAME`, `NEXT_PUBLIC_NATCASH_PHONE`
   - `SMS_FORWARDER_SECRET`
   - `NEXT_PUBLIC_SITE_URL` (set to your Vercel URL, e.g. `https://avs-formation.vercel.app`)
4. Tap **Deploy**. Vercel installs everything and builds it. When it's done you get a live URL.

> If you want to deploy first and add Supabase later: the app builds and runs on mock data even with no env vars, so you can deploy immediately and wire the backend after.

---

## 3. Set up the database (Supabase website only)

1. Go to **supabase.com**, create a project.
2. Project Settings → **API**: copy the Project URL, the `anon` key, and the `service_role` key. Paste these into Vercel's Environment Variables (then redeploy from Vercel's Deployments tab → "Redeploy").
3. In Supabase, open **SQL Editor** → **New query**.
4. Open the file **`supabase/RUN_ALL.sql`** from the project, copy its entire contents, paste into the editor, tap **Run**.
   - This one file runs all 8 migrations + seeds in the correct order. You only paste once.
5. Go to **Authentication → URL Configuration**:
   - Site URL: your Vercel URL
   - Redirect URLs: add `https://<your-vercel-url>/auth/callback`

---

## 4. Make yourself admin

After you sign up in the live app with your own email, go back to Supabase **SQL Editor**, new query, paste this (with your email), and Run:

```sql
update profiles set role = 'admin'
where id = (select id from auth.users where email = 'YOUR-EMAIL-HERE');
```

Refresh the app → the **Admin** card appears in your Profile.

---

## 5. Making changes later (still no terminal)

To edit a file: open it on github.com, tap the pencil ✏️ icon, edit, Commit. Vercel automatically rebuilds and redeploys within a minute. That's your entire update loop from a tablet.

---

## What runs where — quick mental model

| Task | Where | You type commands? |
|------|-------|--------------------|
| `npm install` / build | Vercel (automatic) | **No** |
| Database setup | Supabase SQL Editor (paste `RUN_ALL.sql`) | No — paste + Run button |
| Make admin | Supabase SQL Editor (1 line) | No — paste + Run button |
| Get code up | GitHub web uploader | No |
| Edit code | GitHub web editor (pencil) | No |

You never open a terminal.
