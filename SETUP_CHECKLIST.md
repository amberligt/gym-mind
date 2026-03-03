# GYMmind Supabase Setup Checklist

Complete these steps in order. The Supabase login may have opened a browser—complete that first.

## 1. Login (if not done)

```bash
npm run supabase:login
```

Sign in with GitHub or email when the browser opens.

## 2. Create a Supabase project (if needed)

Go to [supabase.com/dashboard](https://supabase.com/dashboard) → **New project** → choose org, name, password, region.

## 3. Link your project

```bash
npm run supabase:link
```

- Choose your project from the list, or
- Enter the **Project ref** (from Dashboard → Project Settings → General)

## 4. Push database schema

```bash
npm run db:push
```

This applies migrations (`001_schema.sql`, `002_rls.sql`, `003_add_completion_status.sql`).

## 5. Set Claude API secret

```bash
npx supabase secrets set CLAUDE_API_KEY=your-anthropic-api-key
```

Get your key from [console.anthropic.com](https://console.anthropic.com).

## 6. Deploy the Edge Function

```bash
npm run functions:deploy
```

## 7. Update `.env` with your credentials

In [Dashboard → Project Settings → API](https://supabase.com/dashboard/project/_/settings/api):

- **Project URL** → `VITE_SUPABASE_URL`
- **anon public** key → `VITE_SUPABASE_ANON_KEY`

Edit `.env` and paste your real values.

## 8. Configure Auth redirect URLs

In [Dashboard → Authentication → URL Configuration](https://supabase.com/dashboard/project/_/auth/url-configuration):

Add to **Redirect URLs**:
- `http://localhost:5173`
- `http://127.0.0.1:5173`
- (Add your production URL when you deploy)

## 9. Run the app

```bash
npm run dev
```

Open http://localhost:5173 → sign in with magic link → generate a workout.
