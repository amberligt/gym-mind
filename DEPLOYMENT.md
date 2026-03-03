## Deployment guide

This document explains how to:

- **Set up a production Supabase project** that matches this app’s schema.
- **Deploy the `claude-workout` edge function** with Anthropic configured.
- **Deploy the frontend to Vercel**.
- **Manually verify auth, onboarding, and workout flows** end‑to‑end.

---

## 1. Supabase production setup

### 1.1 Create or use a Supabase project

- Create a new project in the Supabase dashboard (or reuse your existing project).
- In **Settings → API**, note:
  - **Project URL** – used as `VITE_SUPABASE_URL`.
  - **anon public key** – used as `VITE_SUPABASE_ANON_KEY`.

You will plug these into `.env` locally and into Vercel environment variables later.

### 1.2 Apply database schema and RLS

The schema and security live under `supabase/migrations`:

- `001_schema.sql` – core tables: `workouts`, `sessions`, `sets`.
- `002_rls.sql` – row‑level security for user‑scoped data.
- `003_add_completion_status.sql` – completion status updates.
- `004_profiles.sql` – `profiles` table and related policies.
- `005_rate_limits.sql` – `api_rate_limits` table and `check_and_increment_rate_limit` RPC.

You have two main options to apply them to your production project:

#### Option A – Supabase CLI (recommended)

1. Install the Supabase CLI (follow Supabase docs for your platform).
2. From the project root (`mygym`), log in and link your cloud project:

   ```bash
   npm run supabase:login
   npm run supabase:link
   ```

   - During `supabase link`, choose your production project.

3. Push the local migrations to the linked project:

   ```bash
   npm run db:push
   ```

4. In the Supabase dashboard, confirm that the following exist and look reasonable:
   - Tables: `workouts`, `sessions`, `sets`, `profiles`, `api_rate_limits`.
   - Function: `check_and_increment_rate_limit(p_action text)` in the `public` schema.
   - Row‑level security is enabled on user tables and `api_rate_limits`.

#### Option B – Supabase SQL editor

If you prefer to apply SQL manually:

1. Open the **SQL editor** in your Supabase project.
2. For each migration file in `supabase/migrations` (in numeric order):
   - Copy the file contents into a new query.
   - Run it against the database.
3. Verify tables, RLS, and the `check_and_increment_rate_limit` function as above.

### 1.3 Configure Auth redirects for the SPA

In your **Supabase project → Authentication → URL configuration**:

- Set **Site URL** to your production app URL, for example:
  - `https://your-app.vercel.app`
- Add the same URL to the list of additional redirect URLs (for safety you can also include any preview URLs you care about).
- Ensure email flows are enabled as you expect:
  - Signup confirmation (if you require confirmations).
  - Password reset links.
  - Magic links (if you intend to use them).

The frontend’s auth logic assumes Supabase will redirect back to the SPA origin so the password‑recovery flow can complete in the browser.

### 1.4 Local `.env` for development

For local dev, create a `.env` file in the project root (if you don’t already have one) with:

```bash
VITE_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

These must match the values from your Supabase project’s API settings.

---

## 2. Deploy the `claude-workout` edge function

The Claude integration lives in `supabase/functions/claude-workout/index.ts`. It:

- Validates the Supabase auth JWT from the `Authorization: Bearer <token>` header.
- Enforces per‑user, per‑action rate limits via `check_and_increment_rate_limit`.
- Calls Anthropic Claude to generate/analyse/adjust workouts and parse profiles.

### 2.1 Configure Supabase secrets

In your Supabase project settings:

- Add a secret `CLAUDE_API_KEY` with your Anthropic API key.
- Ensure the standard Supabase env vars are available to the function:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`

Supabase typically injects these automatically for edge functions, but verify in the dashboard’s **Configuration → Secrets** / **Functions** section.

### 2.2 Deploy the function with the CLI

From the project root:

```bash
npm run supabase:login     # if not already logged in
npm run supabase:link      # if not already linked to the prod project
npm run functions:deploy   # deploys the claude-workout edge function
```

After deployment:

- The function should be reachable at:
  - `<SUPABASE_URL>/functions/v1/claude-workout`
- It should accept:
  - `Authorization: Bearer <Supabase session JWT>`
  - JSON body: `{ "action": "<generate|analyse|alternatives|adjust|parse_profile>", "payload": { ... } }`

You can verify this quickly using the Supabase dashboard function tester or a tool like `curl` or Postman.

---

## 3. Vercel deployment (frontend)

### 3.1 Create a Vercel project

1. Push this repo to your Git host (GitHub/GitLab/Bitbucket).
2. In the Vercel dashboard, create a **New Project** and import the repo.
3. When prompted:
   - Framework: **Vite**.
   - Build command: `npm run build`.
   - Output directory: `dist`.

You do not need a custom `vercel.json` for a basic SPA setup.

### 3.2 Configure Vercel environment variables

In the Vercel project settings, add the following environment variables for **Production** (and **Preview**, if desired):

- `VITE_SUPABASE_URL` → your Supabase project URL.
- `VITE_SUPABASE_ANON_KEY` → your Supabase anon public key.

These are read in `src/lib/supabase.ts`; if they are missing or invalid, the app will throw at startup.

Trigger a new deployment after saving the env vars so the build picks them up.

---

## 4. Manual verification checklist (post‑deploy)

Once Supabase and Vercel are wired to the same project and the edge function is deployed, use this checklist against your **production URL** (for example `https://your-app.vercel.app`).

### 4.1 Auth flows

- **Sign up**
  - Sign up with a new email/password.
  - Complete any required email confirmation.
  - Refresh the page and verify you remain logged in.
- **Sign in / sign out**
  - Sign out from the app.
  - Sign back in with the same credentials.
- **Password reset**
  - Use “Forgot password”.
  - Click the reset link from the email and ensure you are redirected back to the app.
  - Confirm the **set new password** screen appears and you can log in with the new password.
- **Magic link** (if you intend to support it)
  - Request a magic link.
  - Follow the link from the email and confirm you are signed in.

### 4.2 Onboarding

- As a first‑time confirmed user, verify you land on the onboarding flow rather than directly in a workout.
- Complete onboarding via:
  - The structured profile form.
  - The “AI import” option that parses a free‑form description.
- Check in Supabase that a row is created/updated in the `profiles` table.

### 4.3 Workout generation and history

- Generate a workout and step through multiple exercises.
- Mark a workout as complete.
- Verify the completed workout appears in your **history** view.
- Trigger workout **analysis**, **alternatives**, or **adjustments** and confirm:
  - Responses come back from Claude.
  - If you exceed rate limits, the UI shows a clear “try again after X seconds” style message rather than failing silently.

### 4.4 Session resilience

- Leave the app open for a while, then try to trigger an action that calls Supabase or the edge function.
- Confirm:
  - Expired sessions either refresh cleanly or route you back to a login screen.
  - You do not see unhandled errors or infinite spinners.

If all of the above pass, your Supabase backend, edge function, and Vercel‑hosted frontend are working together as intended.

