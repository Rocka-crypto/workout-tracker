// kind:
//   weighted -> weight + reps
//   reps     -> reps only
//   timed    -> seconds
//   cardio   -> minutes

export const MUSCLES = [
  "Chest",
  "Back",
  "Legs",
  "Shoulders",
  "Arms",
  "Core",
  "Cardio",
];

export const EQUIPMENT = [
  "Bodyweight",
  "Dumbbell",
  "Barbell",
  "Machine",
  "Cable",
  "Other",
];

export const KINDS = [
  { id: "weighted", label: "Weight & reps" },
  { id: "reps", label: "Reps only" },
  { id: "timed", label: "Timed (sec)" },
  { id: "cardio", label: "Cardio (min)" },
];

export const PLAN_CATEGORIES = [
  "Strength",
  "Cardio",
  "Home",
  "Mobility",
  "Mixed",
];

export const LEVELS = ["Beginner", "Intermediate", "Advanced"];

export const GOALS = [
  "Build strength",
  "Lose weight",
  "Improve endurance",
  "Stay active",
  "Build consistency",
];

const e = (id, name, muscle, equipment, kind = "reps") => ({
  id,
  name,
  muscle,
  equipment,
  kind,
});

export const EXERCISES = [
  // Chest
  e("bench-press", "Bench Press", "Chest", "Barbell", "weighted"),
  e("incline-db-press", "Incline Dumbbell Press", "Chest", "Dumbbell", "weighted"),
  e("cable-fly", "Cable Fly", "Chest", "Cable", "weighted"),
  e("push-up", "Push-ups", "Chest", "Bodyweight"),
  e("dip", "Dips", "Chest", "Bodyweight"),

  // Back
  e("deadlift", "Deadlift", "Back", "Barbell", "weighted"),
  e("bent-row", "Bent-over Row", "Back", "Barbell", "weighted"),
  e("lat-pulldown", "Lat Pulldown", "Back", "Machine", "weighted"),
  e("seated-row", "Seated Cable Row", "Back", "Cable", "weighted"),
  e("pull-up", "Pull-ups", "Back", "Bodyweight"),

  // Legs
  e("squat", "Squats", "Legs", "Bodyweight"),
  e("back-squat", "Barbell Back Squat", "Legs", "Barbell", "weighted"),
  e("leg-press", "Leg Press", "Legs", "Machine", "weighted"),
  e("rdl", "Romanian Deadlift", "Legs", "Barbell", "weighted"),
  e("lunge", "Lunges", "Legs", "Bodyweight"),
  e("glute-bridge", "Glute Bridge", "Legs", "Bodyweight"),
  e("calf-raise", "Calf Raises", "Legs", "Bodyweight"),

  // Shoulders
  e("overhead-press", "Overhead Press", "Shoulders", "Barbell", "weighted"),
  e("lateral-raise", "Lateral Raise", "Shoulders", "Dumbbell", "weighted"),
  e("face-pull", "Face Pull", "Shoulders", "Cable", "weighted"),
  e("pike-push-up", "Pike Push-ups", "Shoulders", "Bodyweight"),

  // Arms
  e("bicep-curl", "Bicep Curl", "Arms", "Dumbbell", "weighted"),
  e("hammer-curl", "Hammer Curl", "Arms", "Dumbbell", "weighted"),
  e("tricep-pushdown", "Tricep Pushdown", "Arms", "Cable", "weighted"),
  e("skull-crusher", "Skull Crushers", "Arms", "Barbell", "weighted"),
  e("diamond-push-up", "Diamond Push-ups", "Arms", "Bodyweight"),

  // Core
  e("plank", "Plank", "Core", "Bodyweight", "timed"),
  e("side-plank", "Side Plank", "Core", "Bodyweight", "timed"),
  e("crunch", "Crunches", "Core", "Bodyweight"),
  e("russian-twist", "Russian Twists", "Core", "Bodyweight"),
  e("leg-raise", "Leg Raises", "Core", "Bodyweight"),
  e("mountain-climber", "Mountain Climbers", "Core", "Bodyweight"),

  // Cardio
  e("jogging", "Jogging", "Cardio", "Other", "cardio"),
  e("cycling", "Cycling", "Cardio", "Machine", "cardio"),
  e("rowing", "Rowing Machine", "Cardio", "Machine", "cardio"),
  e("jump-rope", "Jump Rope", "Cardio", "Other", "cardio"),
  e("jumping-jacks", "Jumping Jacks", "Cardio", "Bodyweight"),
  e("burpee", "Burpees", "Cardio", "Bodyweight"),
];

export function findExercise(id) {
  return EXERCISES.find((item) => item.id === id);
}