## API specification overview

This folder describes the **client-facing API surface** for the iOS app, aligned with the current Supabase schema (`workouts`, `sessions`, `sets`) and planned features (completion status, adaptive logic).

- **Auth** is handled by Supabase; all endpoints assume an authenticated user and automatically scope by `auth.uid()` via RLS.
- All examples here are written as **REST-style routes** the mobile client can call (whether via Supabase edge functions or a backend service).

### Core domains

- `workouts`: User-defined or program-generated workouts (templates).
- `sessions`: Concrete workout sessions a user performs.
- `sets`: Individual exercise sets logged inside a session (including future `completion_status`).
- `history`: Aggregated views over `sessions` and `sets`.
- `profile`: User training preferences and strength numbers (can be a `profiles` table or view).

Individual files in this folder define each domain in more detail.

