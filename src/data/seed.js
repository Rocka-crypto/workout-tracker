import { findExercise } from "./exercises";

function pe(planId, exerciseId, sets, reps, weight = 0) {
  const ex = findExercise(exerciseId);
  return {
    id: `${planId}-${exerciseId}`,
    exerciseId,
    name: ex.name,
    kind: ex.kind,
    muscle: ex.muscle,
    sets,
    reps,
    weight,
  };
}

export const initialPlans = [
  {
    id: "plan-1",
    title: "Full Body Strength",
    category: "Strength",
    level: "Beginner",
    exercises: [
      pe("plan-1", "squat", 3, 12),
      pe("plan-1", "push-up", 3, 10),
      pe("plan-1", "plank", 3, 30),
    ],
  },
  {
    id: "plan-2",
    title: "Cardio & Endurance",
    category: "Cardio",
    level: "Intermediate",
    exercises: [
      pe("plan-2", "jogging", 1, 20),
      pe("plan-2", "jumping-jacks", 3, 30),
    ],
  },
  {
    id: "plan-3",
    title: "Home Bodyweight",
    category: "Home",
    level: "Beginner",
    exercises: [
      pe("plan-3", "lunge", 3, 12),
      pe("plan-3", "push-up", 3, 10),
      pe("plan-3", "glute-bridge", 3, 15),
      pe("plan-3", "crunch", 3, 15),
    ],
  },
  {
    id: "plan-4",
    title: "Push Day",
    category: "Strength",
    level: "Intermediate",
    exercises: [
      pe("plan-4", "bench-press", 4, 8, 40),
      pe("plan-4", "overhead-press", 3, 8, 30),
      pe("plan-4", "incline-db-press", 3, 10, 14),
      pe("plan-4", "tricep-pushdown", 3, 12, 20),
    ],
  },
];

const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString();

export const initialHistory = [
  {
    id: "history-1",
    title: "Full Body Strength",
    planId: "plan-1",
    date: daysAgo(0),
    duration: 32,
    volume: 0,
    completed: true,
    exercises: [
      {
        name: "Squats",
        kind: "reps",
        sets: [
          { weight: 0, reps: 12 },
          { weight: 0, reps: 12 },
          { weight: 0, reps: 10 },
        ],
      },
      {
        name: "Push-ups",
        kind: "reps",
        sets: [
          { weight: 0, reps: 10 },
          { weight: 0, reps: 9 },
          { weight: 0, reps: 8 },
        ],
      },
    ],
  },
  {
    id: "history-2",
    title: "Cardio & Endurance",
    planId: "plan-2",
    date: daysAgo(1),
    duration: 25,
    volume: 0,
    completed: true,
    exercises: [
      { name: "Jogging", kind: "cardio", sets: [{ weight: 0, reps: 20 }] },
    ],
  },
];

export const initialClients = [
  {
    id: "client-1",
    name: "Alex Morgan",
    goal: "Build strength",
    level: "Beginner",
    planId: "plan-1",
    notes: "Prefers morning sessions. Watch left knee on lunges.",
  },
  {
    id: "client-2",
    name: "Jordan Lee",
    goal: "Improve endurance",
    level: "Intermediate",
    planId: "plan-2",
    notes: "",
  },
];

export const defaultProfile = {
  name: "Fitness Member",
  goal: "Build consistency",
  level: "Beginner",
  weeklyGoal: 4,
  restSeconds: 60,
  unit: "kg",
};