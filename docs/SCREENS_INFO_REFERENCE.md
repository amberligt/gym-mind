# Screen-by-screen: what information appears where

Use this as the single source of truth for **workout flow** screens. Order of sections is consistent: **Header → Progress → Main content → Actions**.

---

## 1. Workout Preview (before starting)

**When:** After generating or loading a workout, before "Start Session".

| Section | What appears |
|--------|----------------|
| **Header** | Workout title; optional streak badge; optional "last time" delta (e.g. "Squat +2.5 kg"). |
| **Progress** | None (no exercise index here). |
| **Main** | List of **blocks** (e.g. Warm-up, Strength). Each block: label + list of exercises with prescription (sets×reps, duration, distance, weight). Per-exercise actions: Replace / Edit / Remove. Optional "Adjust workout" text input. |
| **Actions** | **Start Session** (primary). Regenerate workout. |

**Data shown:** Block names, exercise names, prescriptions (e.g. 3×8, 60s, 2.5 km, 65 kg). No "Exercise X of Y" or "Set X of Y".

---

## 2. Active — Weight (standard strength)

**When:** During a reps + weight exercise (e.g. Bench Press).

| Section | What appears |
|--------|----------------|
| **Header** | None (no "Rest" / "Exercise" title). |
| **Progress** | **ProgressBar:** horizontal bar (orange fill to current exercise); left: **block name**; right: **"X of Y"** (exercise index, e.g. "1 of 8"). **SetTracker:** dots (completed = orange, current = peachy, upcoming = gray) + **"Set X of Y"** (set index). |
| **Main** | **Exercise name** (large, centered). **Target reps** (e.g. "8 reps"). **Weight (kg)** input (large). **Actual reps** label + − / number / +. **Difficulty:** "How was that set?" + 3 card-style blocks (Easy / Good / Hard), each with icon + label. |
| **Actions** | **Done** (primary). |

**Data shown:** Block name, Exercise X of Y, Set X of Y, exercise name, target reps, weight, actual reps, difficulty.

---

## 3. Active — Superset

**When:** During a paired exercise (e.g. Push-ups + Bent-over Row).

| Section | What appears |
|--------|----------------|
| **Header** | None. |
| **Progress** | **ProgressBar:** bar + **block name** + **"X of Y"** (exercise index). **"Superset"** label + **SetTracker** (dots + **"Set X of Y"**). |
| **Main** | Two **cards:** Exercise A name, target reps, weight input; divider "then"; Exercise B name, target reps, weight input. No difficulty strip on this screen. |
| **Actions** | **Done — both exercises** (primary). |

**Data shown:** Block name, Exercise X of Y, Set X of Y, two exercise names, two weights. No "How was that set?" here.

---

## 4. Active — Timed

**When:** During a time-based exercise (e.g. Plank 45s).

| Section | What appears |
|--------|----------------|
| **Header** | None. |
| **Progress** | **Custom bar:** thin bar (orange gradient by % of workout progress); under it: **block name**; under that: **"Exercise X of Y"**. **SetTracker** (if sets > 1): dots + **"Set X of Y"**. |
| **Main** | **Exercise name.** Big **timer** (MM:SS) with circular progress ring; label "remaining" or "Complete!". |
| **Actions** | **Start / Pause / Resume / Next** (primary, with icon). **Skip** (secondary). |

**Data shown:** Block name, Exercise X of Y, Set X of Y (if multiple sets), exercise name, time remaining.

**Inconsistency:** Progress is a **custom bar** (block name + "Exercise X of Y") instead of shared **ProgressBar** (bar + block name + "X of Y"). SetTracker is inline here; wording "Exercise 5 of 8" vs elsewhere "3 of 8".

---

## 5. Active — Cardio

**When:** During a cardio exercise (e.g. Treadmill). Has setup → running → paused and optional stop-early modal.

| Section | What appears |
|--------|----------------|
| **Header** | None. |
| **Progress** | **ProgressBar:** bar + **block name** + **"X of Y"** (exercise index). |
| **Main (setup)** | **Exercise name.** Editable **Duration** card (M:SS, minutes). Editable **Distance** card (km/m). Or "Complete when ready" if neither. |
| **Main (running/paused)** | Big **timer** (remaining or elapsed) + circular progress ring. **Distance progress** "x.x / y.y km" + progress bar; optional ±0.1 km. |
| **Actions (setup)** | **Start**, **Skip**. |
| **Actions (running)** | **Pause**, **Finish**. |
| **Actions (paused)** | **Resume**, **Stop workout**. |
| **Modal (stop early)** | "Stop workout early?" + completed time + distance. **Log progress** / **Continue workout** / **Discard**. |

**Data shown:** Block name, Exercise X of Y, exercise name, duration/distance (target and actual). No "Set X of Y" on cardio.

---

## 6. Difficulty Rating (standalone screen)

**When:** After completing a set (weight or superset), before rest.

| Section | What appears |
|--------|----------------|
| **Header** | None. |
| **Progress** | **ProgressBar:** bar + **block name** + **"X of Y"** (exercise index). |
| **Main** | **"Just completed"** label. **Exercise name(s)** (e.g. "Bench Press" or "Push-ups + Bent-over Row"). **"How was that set?"** + 3 card-style blocks (Easy / Good / Hard), each with icon + label. |
| **Actions** | **Skip** (text link). |

**Data shown:** Block name, Exercise X of Y, name of what was just completed, difficulty choice.

---

## 7. Rest Timer

**When:** Between sets or between exercises (rest period).

| Section | What appears |
|--------|----------------|
| **Header** | **"Rest Timer"** (title). **"Recovery time,"** (subtitle). No block name, no "Set X of Y", no "Exercise X of Y" here. |
| **Progress** | None (no bar, no exercise index, no set dots). |
| **Main** | Big **seconds remaining** number + "seconds". **Circular progress ring** (orange). **"Up next" card:** next exercise name + prescription (e.g. "3 x 8-10 reps • 65 kg" or "1 x 0:45"). |
| **Actions** | **Skip rest** (text link). |

**Data shown:** Rest title, recovery subtitle, seconds left, next exercise name, next exercise prescription. **Not shown on Rest:** current block name, "Exercise X of Y", "Set X of Y", set dots.

**Inconsistency:** Active screens show block + "Exercise X of Y" + (where relevant) "Set X of Y". Rest does not show which exercise you just did or which set you’re in; it only shows "Up next". So "set in workout" context is on active/rating, not on rest.

---

## 8. Workout Complete

**When:** After the last exercise (or last set) is done.

| Section | What appears |
|--------|----------------|
| **Header** | Orange checkmark. **"Workout Complete!"** **"Great work today"**. Optional streak badge. |
| **Progress** | None. |
| **Main** | **Summary card:** Total Time | X min; Exercises Completed | N; Avg Difficulty | X.X/5. **Coach's Notes** card (if loaded): icon + "Coach's Notes", paragraph. **Recommended Next Session** card: title, workout name, "X min • Weekday, Month Day", optional orange tagline (e.g. "Building on…"). |
| **Actions** | **Return to Dashboard**, **View history**. |

**Data shown:** Session duration, exercise count, average difficulty, coaching text, next session suggestion. No block or set index.

---

# Inconsistencies to fix (summary)

1. **Progress area**
   - **Weight, Superset, Cardio, Difficulty:** Use **ProgressBar**: bar + **block name** + **"X of Y"** (exercise index).
   - **Timed:** Uses its own bar with **block name** + **"Exercise X of Y"** (same idea, different label).
   - **Rest:** No progress area; no block, no exercise index, no set index.

2. **Set indicator (Set X of Y + dots)**
   - **Weight:** ProgressBar then **SetTracker** (dots + "Set X of Y") in main content.
   - **Superset:** ProgressBar then "Superset" + **SetTracker** in header area.
   - **Timed:** Shown only if sets > 1; same dots + "Set X of Y".
   - **Cardio:** No set indicator (single "set").
   - **Difficulty:** No set indicator (you just finished a set).
   - **Rest:** No set indicator (only "Up next").

3. **Block name**
   - Shown on: Weight, Superset, Timed, Cardio, Difficulty (via ProgressBar or custom bar).
   - Not shown on: Preview (blocks are the sections), Rest, Workout Complete.

4. **Exercise index ("X of Y")**
   - Shown on: Weight, Superset, Timed, Cardio, Difficulty.
   - Not shown on: Rest (only "Up next" with next exercise name + prescription).

5. **Naming**
   - **Timed:** "Exercise 5 of 8" (word "Exercise").
   - **ProgressBar:** "3 of 8" (no word "Exercise"). Decide one format and use it everywhere.

Recommendation: use one **progress block** for all active + rating screens: **block name** (left) + **"Exercise X of Y"** (right) + optional **SetTracker** (dots + "Set X of Y") when the exercise has multiple sets. Rest stays as-is (no progress block). Then align Timed to use that same progress block instead of its custom bar.
