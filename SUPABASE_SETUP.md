# Supabase Setup for GYMmind

## 1. Environment Variables

Create `.env` from `.env.example`:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Get these from Supabase Dashboard → Project Settings → API.

## 2. Database Schema

Run the SQL in order:

1. `supabase/migrations/001_schema.sql` — creates `workouts`, `sessions`, `sets`
2. `supabase/migrations/002_rls.sql` — enables RLS and policies

Supabase Dashboard → SQL Editor → paste and run each file.

## 3. Claude API Secret

Store your Claude API key in Supabase secrets (never in frontend):

```bash
supabase secrets set CLAUDE_API_KEY=your-anthropic-api-key
```

Or: Supabase Dashboard → Edge Functions → claude-workout → Settings → Secrets.

## 4. Deploy Edge Function

```bash
supabase functions deploy claude-workout
```

## 5. Auth Configuration

In Supabase Dashboard → Authentication → Providers:

- Enable Email provider
- Enable "Confirm email" if desired (magic links work either way)
- Add your site URL under Authentication → URL Configuration

## 6. Files Created

| File | Purpose |
|------|---------|
| `src/lib/supabase.ts` | Supabase client init |
| `src/context/AuthContext.jsx` | AuthProvider, useAuth, magic link |
| `src/components/Auth.jsx` | Magic link login screen |
| `src/services/storageService.js` | Supabase-backed storage (no localStorage) |
| `supabase/migrations/001_schema.sql` | Tables |
| `supabase/migrations/002_rls.sql` | RLS policies |
| `supabase/functions/claude-workout/index.ts` | Claude API Edge Function |

## 7. Secrets Confirmation

- **CLAUDE_API_KEY**: Stored only in Supabase Edge Function secrets. Never in `.env`, never in frontend code.
- **VITE_SUPABASE_ANON_KEY**: Safe to expose (designed for client). RLS enforces data access.
- **VITE_SUPABASE_URL**: Public project URL. No secrets.
