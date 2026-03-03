## Workouts API

Workouts are **templates** that define the planned structure of a training session (e.g., “Upper Body Strength”), which the user can start to create concrete `sessions`.

All routes are **scoped to the authenticated user** via Supabase RLS (`workouts.user_id = auth.uid()`).

---

### `GET /workouts`

**Purpose**: List the current user’s workouts (for Dashboard and History).

**Request**

- Query params (optional):
  - `limit` (number, default 20)
  - `offset` (number, default 0)

**Response 200**

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Upper Body Strength",
      "description": "Heavy bench, rows, accessories",
      "duration_minutes": 45,
      "exercise_count": 7,
      "last_session_delta": "+5 lbs bench",
      "created_at": "2025-01-01T10:00:00Z",
      "updated_at": "2025-01-02T10:00:00Z"
    }
  ]
}
```

Key fields:

- `last_session_delta` can be computed server-side based on latest `sessions` and `sets`.

---

### `GET /workouts/{id}`

**Purpose**: Fetch a single workout to show **Workout Overview**.

**Response 200**

```json
{
  "id": "uuid",
  "name": "Upper Body Strength",
  "description": "Heavy bench, rows, accessories",
  "duration_minutes": 45,
  "exercise_count": 7,
  "sections": [
    {
      "id": "warmup",
      "name": "Warm-up",
      "exercises": [
        {
          "id": "uuid",
          "name": "Tempo Push-ups",
          "target_sets": 3,
          "target_reps": 12
        }
      ]
    },
    {
      "id": "main",
      "name": "Main",
      "exercises": [
        {
          "id": "uuid",
          "name": "Barbell Bench Press",
          "target_sets": 5,
          "target_reps": 5
        }
      ]
    }
  ],
  "last_session_delta": "+5 lbs bench",
  "created_at": "2025-01-01T10:00:00Z",
  "updated_at": "2025-01-02T10:00:00Z"
}
```

Sections should align with UI rules: **Warm-up / Main / Accessory**, each with a blue accent in the Overview screen.

---

### `POST /workouts`

**Purpose**: Create a new workout template (from a Plan builder or “Generate Workout” flow).

**Request body**

```json
{
  "name": "Upper Body Strength",
  "description": "Heavy bench, rows, accessories",
  "duration_minutes": 45,
  "sections": [
    {
      "id": "warmup",
      "name": "Warm-up",
      "exercises": [
        {
          "name": "Tempo Push-ups",
          "target_sets": 3,
          "target_reps": 12
        }
      ]
    },
    {
      "id": "main",
      "name": "Main",
      "exercises": [
        {
          "name": "Barbell Bench Press",
          "target_sets": 5,
          "target_reps": 5
        }
      ]
    }
  ]
}
```

**Response 201**

```json
{
  "id": "uuid",
  "name": "Upper Body Strength",
  "duration_minutes": 45,
  "exercise_count": 7,
  "created_at": "2025-01-01T10:00:00Z"
}
```

---

### `PATCH /workouts/{id}`

**Purpose**: Edit a workout template.

**Request body (partial allowed)**

```json
{
  "name": "Upper Body Strength v2",
  "duration_minutes": 50,
  "sections": [
    {
      "id": "main",
      "name": "Main",
      "exercises": [
        {
          "id": "uuid",
          "name": "Barbell Bench Press",
          "target_sets": 4,
          "target_reps": 6
        }
      ]
    }
  ]
}
```

**Response 200**

```json
{
  "id": "uuid",
  "name": "Upper Body Strength v2",
  "duration_minutes": 50,
  "exercise_count": 7,
  "updated_at": "2025-01-02T10:00:00Z"
}
```

---

### `DELETE /workouts/{id}`

**Purpose**: Soft-delete or hard-delete a workout template.

**Response 204**

No body.

