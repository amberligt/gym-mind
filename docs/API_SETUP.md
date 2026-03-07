# API setup (Claude workout)

The app calls `/api/claude-workout`, which needs these **server-side** environment variables (never put them in frontend code):

| Variable | Where to set it | Description |
|----------|-----------------|-------------|
| `CLAUDE_API_KEY` | Vercel → Project → Settings → Environment Variables | Your Anthropic API key |
| `SUPABASE_URL` | Same as above | Same value as `VITE_SUPABASE_URL` |
| `SUPABASE_ANON_KEY` | Same as above | Same value as `VITE_SUPABASE_ANON_KEY` |

## If you deploy on Vercel

1. Open your project on [vercel.com](https://vercel.com) → **Settings** → **Environment Variables**.
2. Add `CLAUDE_API_KEY`, `SUPABASE_URL`, and `SUPABASE_ANON_KEY` for **Production** (and Preview if you use it).
3. Redeploy (e.g. push a commit or **Redeploy** from the Deployments tab) so the new vars are applied.

## If you run the API locally

Create a `.env` in the project root (or use a tool that runs the API and loads env). Include:

```bash
CLAUDE_API_KEY=sk-ant-...
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
```

The Vite dev server does **not** run the `api/` folder. To test the API locally you need either:

- A separate process that runs the API (e.g. a small Express server that imports the handler), or
- Deploy to Vercel and test against the deployed `/api/claude-workout` URL.

## Common errors

- **"CLAUDE_API_KEY is not set"** → The variable is missing or not loaded. Set it in Vercel env vars (or your API server’s env) and redeploy.
- **"Invalid Claude API key"** → The key is wrong or expired. Create a new key in [Anthropic Console](https://console.anthropic.com/) and update `CLAUDE_API_KEY`.
- **"Session error" / "Not signed in"** → User auth issue: sign out and sign in again.
