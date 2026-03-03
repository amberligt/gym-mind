## Sessions API

Sessions are **concrete executions** of a workout by a user. They power the **Active Exercise**, **Rest**, **Completion**, and **History** screens.

RLS ensures `sessions.user_id = auth.uid()`.

---

### `POST /sessions`

**Purpose**: Start a new session from a workout (Dashboard “Start Workout” or Workout Overview “Start Session”).

**Request body**

```json
{
  "workout_id": "uuid",
  "started_at": "2025-01-01T10:00:00Z"
}
```

**Response 201**

```json
{
  "id": "uuid",
  "user_id": "uuid",
  "workout_id": "uuid",
  "status": "in_progress",
  "started_at": "2025-01-01T10:00:00Z",
  "ended_at": null,
  "total_volume": 0,
  "created_at": "2025-01-01T10:00:00Z"
}
```

---

### `GET /sessions/{id}`

**Purpose**: Fetch a session and its associated sets to drive the Active Exercise flow.

**Response 200**

```json
{
  "id": "uuid",
  "workout_id": "uuid",
  "status": "in_progress",
  "started_at": "2025-01-01T10:00:00Z",
  "ended_at": null,
  "sets": [
    {
      "id": "uuid",
      "exercise_name": "Barbell Bench Press",
      "order_index": 1,
      "set_number": 1,
      "target_reps": 5,
      "actual_reps": null,
      "weight": null,
      "difficulty": null,
      "completion_status": null
    }
  ]
}
```

---

### `PATCH /sessions/{id}`

**Purpose**: Update high-level session status and derived metrics (for Completion screen, History summaries).

**Request body (partial allowed)**

```json
{
  "status": "completed",
  "ended_at": "2025-01-01T10:45:00Z",
  "total_volume": 15400
}
```

**Response 200**

```json
{
  "id": "uuid",
  "status": "completed",
  "started_at": "2025-01-01T10:00:00Z",
  "ended_at": "2025-01-01T10:45:00Z",
  "total_volume": 15400
}
```

---

### `GET /sessions`

**Purpose**: Paginated list of sessions, used by History and analytics.

**Request query params (optional)**

- `limit` (number, default 20)
- `offset` (number, default 0)
- `from` (ISO date, optional)
- `to` (ISO date, optional)

**Response 200**

```json
{
  "data": [
    {
      "id": "uuid",
      "workout_name": "Upper Body Strength",
      "status": "completed",
      "started_at": "2025-01-01T10:00:00Z",
      "ended_at": "2025-01-01T10:45:00Z",
      "duration_minutes": 45,
      "total_volume": 15400,
      "key_deltas": [
        "Bench +5 lbs",
        "Volume +6%"
      ]
    }
  ]
}
```

