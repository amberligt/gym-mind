export const DEV_MODE = true;

const mockWorkouts = [
  {
    "title": "Upper Body Strength",
    "estimated_duration_minutes": 60,
    "blocks": [
      {
        "label": "A",
        "name": "Skill/Activation",
        "duration_minutes": 10,
        "type": "straight",
        "rounds": null,
        "rest_between_rounds_seconds": null,
        "exercises": [
          { "id": "A1", "name": "Scapula Pull-ups", "superset_with": null, "sets": 3, "reps": "10", "duration_seconds": null, "distance_meters": null, "suggested_weight_kg": null, "rest_seconds": 60, "notes": null },
          { "id": "A2", "name": "Wall Handstand Hold", "superset_with": null, "sets": 3, "reps": null, "duration_seconds": 25, "distance_meters": null, "suggested_weight_kg": null, "rest_seconds": 30, "notes": null },
          { "id": "A3", "name": "Dead Hang Shrugs", "superset_with": null, "sets": 3, "reps": "8", "duration_seconds": null, "distance_meters": null, "suggested_weight_kg": null, "rest_seconds": 60, "notes": null }
        ]
      },
      {
        "label": "B",
        "name": "Push/Pull Strength",
        "duration_minutes": 30,
        "type": "superset",
        "rounds": 4,
        "rest_between_rounds_seconds": 90,
        "exercises": [
          { "id": "B1a", "name": "Floor Press", "superset_with": "B1b", "sets": 4, "reps": "6", "duration_seconds": null, "distance_meters": null, "suggested_weight_kg": 13.5, "rest_seconds": null, "notes": "+0.5kg from last session" },
          { "id": "B1b", "name": "Chest-Supported DB Row", "superset_with": "B1a", "sets": 4, "reps": "8", "duration_seconds": null, "distance_meters": null, "suggested_weight_kg": 12.5, "rest_seconds": null, "notes": null },
          { "id": "B2a", "name": "Pike Push-up", "superset_with": "B2b", "sets": 3, "reps": "8-10", "duration_seconds": null, "distance_meters": null, "suggested_weight_kg": null, "rest_seconds": null, "notes": "Feet elevated" },
          { "id": "B2b", "name": "Single-Arm Cable Row", "superset_with": "B2a", "sets": 3, "reps": "10", "duration_seconds": null, "distance_meters": null, "suggested_weight_kg": null, "rest_seconds": 60, "notes": "Per side, moderate load" }
        ]
      },
      {
        "label": "C",
        "name": "Accessory",
        "duration_minutes": 12,
        "type": "circuit",
        "rounds": 3,
        "rest_between_rounds_seconds": 30,
        "exercises": [
          { "id": "C1", "name": "Band Pull-Apart", "superset_with": null, "sets": 3, "reps": "15", "duration_seconds": null, "distance_meters": null, "suggested_weight_kg": null, "rest_seconds": null, "notes": null },
          { "id": "C2", "name": "Incline DB Curl", "superset_with": null, "sets": 3, "reps": "10", "duration_seconds": null, "distance_meters": null, "suggested_weight_kg": 9, "rest_seconds": null, "notes": null },
          { "id": "C3", "name": "Tricep Overhead Extension", "superset_with": null, "sets": 3, "reps": "10", "duration_seconds": null, "distance_meters": null, "suggested_weight_kg": 8, "rest_seconds": null, "notes": null }
        ]
      },
      {
        "label": "D",
        "name": "Core Finisher",
        "duration_minutes": 8,
        "type": "tabata",
        "rounds": 4,
        "rest_between_rounds_seconds": 10,
        "exercises": [
          { "id": "D1", "name": "Dead Bug", "superset_with": null, "sets": null, "reps": null, "duration_seconds": 20, "distance_meters": null, "suggested_weight_kg": null, "rest_seconds": 10, "notes": null },
          { "id": "D2", "name": "Plank Shoulder Taps", "superset_with": null, "sets": null, "reps": null, "duration_seconds": 20, "distance_meters": null, "suggested_weight_kg": null, "rest_seconds": 10, "notes": null }
        ]
      }
    ]
  },
  {
    "title": "Upper Body Superset Session",
    "estimated_duration_minutes": 60,
    "blocks": [
      {
        "label": "A",
        "name": "Skill/Activation",
        "duration_minutes": 8,
        "type": "superset",
        "rounds": 3,
        "rest_between_rounds_seconds": 30,
        "exercises": [
          { "id": "A1a", "name": "Scapula Pull-ups", "superset_with": "A1b", "sets": 3, "reps": "10", "duration_seconds": null, "distance_meters": null, "suggested_weight_kg": null, "rest_seconds": null, "notes": null },
          { "id": "A1b", "name": "Wall Handstand Hold", "superset_with": "A1a", "sets": 3, "reps": null, "duration_seconds": 25, "distance_meters": null, "suggested_weight_kg": null, "rest_seconds": 30, "notes": null }
        ]
      },
      {
        "label": "B",
        "name": "Push/Pull Supersets",
        "duration_minutes": 30,
        "type": "superset",
        "rounds": null,
        "rest_between_rounds_seconds": null,
        "exercises": [
          { "id": "B1a", "name": "Floor Press", "superset_with": "B1b", "sets": 4, "reps": "6", "duration_seconds": null, "distance_meters": null, "suggested_weight_kg": 13.5, "rest_seconds": null, "notes": null },
          { "id": "B1b", "name": "Chest-Supported DB Row", "superset_with": "B1a", "sets": 4, "reps": "8", "duration_seconds": null, "distance_meters": null, "suggested_weight_kg": 12.5, "rest_seconds": 75, "notes": null },
          { "id": "B2a", "name": "Pike Push-up", "superset_with": "B2b", "sets": 3, "reps": "8-10", "duration_seconds": null, "distance_meters": null, "suggested_weight_kg": null, "rest_seconds": null, "notes": "Feet elevated" },
          { "id": "B2b", "name": "Single-Arm Cable Row", "superset_with": "B2a", "sets": 3, "reps": "10", "duration_seconds": null, "distance_meters": null, "suggested_weight_kg": null, "rest_seconds": 60, "notes": "Per side" },
          { "id": "B3a", "name": "Band Pull-Apart", "superset_with": "B3b", "sets": 3, "reps": "15", "duration_seconds": null, "distance_meters": null, "suggested_weight_kg": null, "rest_seconds": null, "notes": null },
          { "id": "B3b", "name": "Dead Hang Shrug", "superset_with": "B3a", "sets": 3, "reps": "8", "duration_seconds": null, "distance_meters": null, "suggested_weight_kg": null, "rest_seconds": 45, "notes": null }
        ]
      },
      {
        "label": "C",
        "name": "Accessory Supersets",
        "duration_minutes": 12,
        "type": "superset",
        "rounds": null,
        "rest_between_rounds_seconds": null,
        "exercises": [
          { "id": "C1a", "name": "Incline DB Curl", "superset_with": "C1b", "sets": 3, "reps": "10", "duration_seconds": null, "distance_meters": null, "suggested_weight_kg": 9, "rest_seconds": null, "notes": null },
          { "id": "C1b", "name": "Tricep Overhead Extension", "superset_with": "C1a", "sets": 3, "reps": "10", "duration_seconds": null, "distance_meters": null, "suggested_weight_kg": 8, "rest_seconds": 45, "notes": null },
          { "id": "C2a", "name": "Band Pull-Apart", "superset_with": "C2b", "sets": 3, "reps": "15", "duration_seconds": null, "distance_meters": null, "suggested_weight_kg": null, "rest_seconds": null, "notes": null },
          { "id": "C2b", "name": "Plank Shoulder Taps", "superset_with": "C2a", "sets": 3, "reps": "20 taps", "duration_seconds": null, "distance_meters": null, "suggested_weight_kg": null, "rest_seconds": 30, "notes": null }
        ]
      },
      {
        "label": "D",
        "name": "Core Finisher",
        "duration_minutes": 8,
        "type": "tabata",
        "rounds": 4,
        "rest_between_rounds_seconds": 10,
        "exercises": [
          { "id": "D1", "name": "Dead Bug", "superset_with": null, "sets": null, "reps": null, "duration_seconds": 20, "distance_meters": null, "suggested_weight_kg": null, "rest_seconds": 10, "notes": null },
          { "id": "D2", "name": "Hollow Body Hold", "superset_with": null, "sets": null, "reps": null, "duration_seconds": 20, "distance_meters": null, "suggested_weight_kg": null, "rest_seconds": 10, "notes": null }
        ]
      }
    ]
  },
  {
    "title": "30-Min HIIT",
    "estimated_duration_minutes": 30,
    "blocks": [
      {
        "label": "Warm-up",
        "name": "Warm-up",
        "duration_minutes": 5,
        "type": "warmup",
        "rounds": 1,
        "rest_between_rounds_seconds": null,
        "exercises": [
          { "id": "W1", "name": "Arm Circles", "superset_with": null, "sets": 1, "reps": null, "duration_seconds": 30, "distance_meters": null, "suggested_weight_kg": null, "rest_seconds": null, "notes": null },
          { "id": "W2", "name": "Hip Circles", "superset_with": null, "sets": 1, "reps": null, "duration_seconds": 30, "distance_meters": null, "suggested_weight_kg": null, "rest_seconds": null, "notes": null },
          { "id": "W3", "name": "Inchworm Walkout", "superset_with": null, "sets": 1, "reps": null, "duration_seconds": 30, "distance_meters": null, "suggested_weight_kg": null, "rest_seconds": null, "notes": null },
          { "id": "W4", "name": "Lateral Shuffle", "superset_with": null, "sets": 1, "reps": null, "duration_seconds": 30, "distance_meters": null, "suggested_weight_kg": null, "rest_seconds": null, "notes": null },
          { "id": "W5", "name": "Jumping Jacks", "superset_with": null, "sets": 1, "reps": null, "duration_seconds": 30, "distance_meters": null, "suggested_weight_kg": null, "rest_seconds": null, "notes": null }
        ]
      },
      {
        "label": "A",
        "name": "Power Circuit",
        "duration_minutes": 10,
        "type": "circuit",
        "rounds": 3,
        "rest_between_rounds_seconds": 60,
        "exercises": [
          { "id": "A1", "name": "Burpee", "superset_with": null, "sets": 3, "reps": null, "duration_seconds": 40, "distance_meters": null, "suggested_weight_kg": null, "rest_seconds": 20, "notes": "Step-back if shoulders fatigued" },
          { "id": "A2", "name": "Jump Squat", "superset_with": null, "sets": 3, "reps": null, "duration_seconds": 40, "distance_meters": null, "suggested_weight_kg": null, "rest_seconds": 20, "notes": null },
          { "id": "A3", "name": "Mountain Climbers", "superset_with": null, "sets": 3, "reps": null, "duration_seconds": 40, "distance_meters": null, "suggested_weight_kg": null, "rest_seconds": 20, "notes": null },
          { "id": "A4", "name": "Plank to Downward Dog", "superset_with": null, "sets": 3, "reps": null, "duration_seconds": 40, "distance_meters": null, "suggested_weight_kg": null, "rest_seconds": 20, "notes": null }
        ]
      },
      {
        "label": "B",
        "name": "Cardio Intervals",
        "duration_minutes": 8,
        "type": "intervals",
        "rounds": 8,
        "rest_between_rounds_seconds": 30,
        "exercises": [
          { "id": "B1", "name": "High Knees", "superset_with": null, "sets": null, "reps": null, "duration_seconds": 30, "distance_meters": null, "suggested_weight_kg": null, "rest_seconds": null, "notes": "Max effort" },
          { "id": "B2", "name": "Lateral Bounds", "superset_with": null, "sets": null, "reps": null, "duration_seconds": 30, "distance_meters": null, "suggested_weight_kg": null, "rest_seconds": null, "notes": "Keep moving on off rounds" }
        ]
      },
      {
        "label": "C",
        "name": "Bodyweight Burnout",
        "duration_minutes": 5,
        "type": "circuit",
        "rounds": 1,
        "rest_between_rounds_seconds": null,
        "exercises": [
          { "id": "C1", "name": "Push-up to T Rotation", "superset_with": null, "sets": 1, "reps": null, "duration_seconds": 45, "distance_meters": null, "suggested_weight_kg": null, "rest_seconds": 15, "notes": null },
          { "id": "C2", "name": "Reverse Lunge with Knee Drive", "superset_with": null, "sets": 1, "reps": null, "duration_seconds": 45, "distance_meters": null, "suggested_weight_kg": null, "rest_seconds": 15, "notes": null },
          { "id": "C3", "name": "Bear Crawl Forward + Back", "superset_with": null, "sets": 1, "reps": null, "duration_seconds": 45, "distance_meters": null, "suggested_weight_kg": null, "rest_seconds": 15, "notes": null },
          { "id": "C4", "name": "Tricep Dip", "superset_with": null, "sets": 1, "reps": null, "duration_seconds": 45, "distance_meters": null, "suggested_weight_kg": null, "rest_seconds": 15, "notes": "Use chair or bench" },
          { "id": "C5", "name": "Skater Jumps", "superset_with": null, "sets": 1, "reps": null, "duration_seconds": 45, "distance_meters": null, "suggested_weight_kg": null, "rest_seconds": 15, "notes": null }
        ]
      },
      {
        "label": "Cool-down",
        "name": "Cool-down",
        "duration_minutes": 2,
        "type": "cooldown",
        "rounds": 1,
        "rest_between_rounds_seconds": null,
        "exercises": [
          { "id": "CD1", "name": "Standing Quad Stretch", "superset_with": null, "sets": 1, "reps": null, "duration_seconds": 30, "distance_meters": null, "suggested_weight_kg": null, "rest_seconds": null, "notes": "Per side" },
          { "id": "CD2", "name": "Child's Pose", "superset_with": null, "sets": 1, "reps": null, "duration_seconds": 30, "distance_meters": null, "suggested_weight_kg": null, "rest_seconds": null, "notes": null },
          { "id": "CD3", "name": "Thread the Needle", "superset_with": null, "sets": 1, "reps": null, "duration_seconds": 20, "distance_meters": null, "suggested_weight_kg": null, "rest_seconds": null, "notes": "Per side" }
        ]
      }
    ]
  }
];

export default mockWorkouts;
