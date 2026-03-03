# Pre-Supabase Structural Cleanup Summary

## ✅ Completed

### 1. Centralized Workout State
- **Single source of truth** in `useWorkout()` hook via reducer
- **WorkoutProvider** context wraps the app; `useWorkoutContext()` provides state
- State keys: `currentWorkout` (as `workout`), `currentExerciseIndex`, `currentSetIndex`, `workoutStatus`, `sessionLog`
- No duplicated state across components

### 2. Refactored Logging to Pure Data
- **sessionLog** structure:
```js
{
  workout_id: null,        // placeholder for Supabase
  started_at: "ISO8601",
  exercises: [{
    name: string,
    block: string,
    sets: [{
      set_number: number,
      target_reps: string,
      actual_reps: number | null,
      weight_kg: number,
      difficulty: number | null
    }]
  }]
}
```
- No UI-derived values, no temporary flags
- Backward compatible with existing saved history via `formatExerciseForHistory()` in workoutService

### 3. Separated UI State from Workout Data
- **WorkoutPreview**: `selectedBlockIndex`, `replaceFor`, `alternatives`, `editFor`, `editValues`, `menuOpen`, `adjustmentInput`, etc. — all local component state
- **ActiveExercise**: `weight`, `actualReps`, `difficulty` (WeightView), `weightA`/`weightB` (SupersetView), `remaining`/`running` (TimedView) — local only
- Workout JSON never contains UI state

### 4. Removed localStorage Coupling
- **storageService.js** wraps all storage:
  - `getWorkouts()`
  - `saveWorkout(session)`
  - `getRecentHistory(limit)`
- Components and services import from `services/storageService`
- Swappable to Supabase later by changing storageService implementation

### 5. Normalized API Calls
- **workoutService.js** holds all Claude calls:
  - `generateWorkout(userInput)`
  - `analyseWorkoutHistory(session)`
  - `getExerciseAlternatives(exercise, blockType, goal, equipment)`
  - `adjustWorkout(workout, instruction)`
- Components do not call `fetch` directly

### 6. Clear Screen Modes
- Screens explicitly separated in `App.jsx`:
  - `input` / `loading` → ChatInput
  - `preview` → WorkoutPreview
  - `active` → ActiveExercise
  - `rating` → DifficultyRating
  - `rest` → RestTimer
  - `complete` → WorkoutComplete
  - `history` → History
- No mixed rendering in one component

### 7. Safe Area & Layout Consistency
- Execution screen (ActiveExercise): `min-h-0 overflow-hidden` — does not scroll
- Bottom CTAs: `pb-[calc(16px+env(safe-area-inset-bottom))]`
- No absolute positioning hacks
- Flex layout with `min-h-0` to prevent overflow

### 8. Removed Dead Code
- **Deleted**: `src/hooks/useStorage.js` (replaced by storageService)
- **Deleted**: `src/services/claudeApi.js` (replaced by workoutService)

---

## Updated Folder Structure

```
src/
├── components/
│   ├── ActiveExercise.jsx
│   ├── ChatInput.jsx
│   ├── DifficultyRating.jsx
│   ├── History.jsx
│   ├── RestTimer.jsx
│   ├── WorkoutComplete.jsx
│   └── WorkoutPreview.jsx
├── context/
│   └── WorkoutContext.jsx       ← NEW
├── data/
│   └── mockWorkouts.js
├── hooks/
│   └── useWorkout.js            ← updated
├── services/
│   ├── storageService.js        ← NEW (replaces useStorage)
│   └── workoutService.js        ← NEW (replaces claudeApi)
├── utils/
│   └── parseWorkout.js
├── App.jsx
├── main.jsx
└── index.css
```

---

## Final Workout State Shape (useWorkout reducer)

```js
{
  screen: 'input' | 'loading' | 'preview' | 'active' | 'rating' | 'rest' | 'complete' | 'history',
  workout: object | null,
  flatExercises: array,
  currentExerciseIndex: number,
  currentSetIndex: number,
  sessionLog: {
    workout_id: null,
    started_at: string | null,
    exercises: array
  },
  workoutStatus: 'preview' | 'active' | 'rest' | 'complete',
  startTime: number | null,
  error: string | null,
  lastInput: string,
  analysis: object | null,
  analysisLoading: boolean,
  // Internal (not part of persisted/API data):
  setWeights, supersetWeights, _currentExerciseSets, _partnerWeights, _nextIndex,
  pendingLog, pendingSupersetLog
}
```

---

## Removed Files

| File | Reason |
|------|--------|
| `src/hooks/useStorage.js` | Replaced by `services/storageService.js` |
| `src/services/claudeApi.js` | Replaced by `services/workoutService.js` |

---

## Confirmation

- **Build**: `npm run build` succeeds
- **Dev server**: `npm run dev` runs
- **Lint**: No linter errors
- **Visual design**: Unchanged
- **No new features**: Structural only
