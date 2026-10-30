import * as Haptics from "expo-haptics";

export const DAY_MS = 86400000;

/* ---------- Haptics (never throw, even on web) ---------- */

export function tap() {
  try {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  } catch (e) {
    // ignore
  }
}

export function success() {
  try {
    Haptics.notificationAsync(
      Haptics.NotificationFeedbackType.Success
    ).catch(() => {});
  } catch (e) {
    // ignore
  }
}

/* ---------- IDs ---------- */

export function uid(prefix = "id") {
  return `${prefix}-${Date.now().toString(36)}${Math.random()
    .toString(36)
    .slice(2, 7)}`;
}

/* ---------- Dates ---------- */

export function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Weeks start on Monday
export function startOfWeek(date = new Date()) {
  const d = startOfDay(date);
  const offset = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - offset);
  return d;
}

export function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function formatDateLong(iso) {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function relativeDay(iso) {
  const diff = Math.round(
    (startOfDay(new Date()) - startOfDay(iso)) / DAY_MS
  );
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return formatDate(iso);
}

export function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function formatClock(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(r)}` : `${pad(m)}:${pad(r)}`;
}

/* ---------- Exercise helpers ---------- */

export function unitLabel(kind, weightUnit = "kg") {
  if (kind === "timed") return "sec";
  if (kind === "cardio") return "min";
  return "reps";
}

export function defaultTarget(kind) {
  if (kind === "weighted") return 10;
  if (kind === "timed") return 30;
  if (kind === "cardio") return 20;
  return 12;
}

export function estimateMinutes(plan) {
  const total = (plan.exercises || []).reduce((sum, ex) => {
    const sets = Number(ex.sets) || 1;
    const reps = Number(ex.reps) || 0;
    if (ex.kind === "cardio") return sum + sets * reps;
    if (ex.kind === "timed") return sum + sets * (reps / 60 + 1);
    return sum + sets * 2;
  }, 0);
  return Math.max(5, Math.round(total));
}

/* ---------- History stats ---------- */

export function countSets(entry) {
  return (entry.exercises || []).reduce(
    (n, ex) => n + (ex.sets ? ex.sets.length : 0),
    0
  );
}

export function workoutsThisWeek(history) {
  const start = startOfWeek().getTime();
  return history.filter(
    (h) => h.completed && new Date(h.date).getTime() >= start
  );
}

export function computeStreak(history) {
  const days = new Set(
    history
      .filter((h) => h.completed)
      .map((h) => startOfDay(h.date).getTime())
  );

  const cursor = startOfDay(new Date());
  // A streak is still alive if you trained yesterday but not yet today.
  if (!days.has(cursor.getTime())) cursor.setDate(cursor.getDate() - 1);

  let streak = 0;
  while (days.has(cursor.getTime())) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function lastSevenDays(history) {
  const out = [];
  for (let i = 6; i >= 0; i--) {
    const day = startOfDay(new Date());
    day.setDate(day.getDate() - i);
    const next = new Date(day);
    next.setDate(next.getDate() + 1);

    const items = history.filter((h) => {
      const t = new Date(h.date).getTime();
      return h.completed && t >= day.getTime() && t < next.getTime();
    });

    out.push({
      label: day.toLocaleDateString(undefined, { weekday: "narrow" }),
      value: items.reduce((s, h) => s + Number(h.duration || 0), 0),
      count: items.length,
      highlight: i === 0,
    });
  }
  return out;
}

export function lastWeeks(history, n = 8) {
  const thisWeek = startOfWeek();
  const out = [];
  for (let i = n - 1; i >= 0; i--) {
    const start = new Date(thisWeek);
    start.setDate(start.getDate() - i * 7);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);

    const count = history.filter((h) => {
      const t = new Date(h.date).getTime();
      return h.completed && t >= start.getTime() && t < end.getTime();
    }).length;

    out.push({
      label: `${start.getMonth() + 1}/${start.getDate()}`,
      value: count,
      highlight: i === 0,
    });
  }
  return out;
}

// Best weighted set per exercise, heaviest first
export function personalRecords(history) {
  const best = {};
  history.forEach((h) => {
    (h.exercises || []).forEach((ex) => {
      if (ex.kind !== "weighted") return;
      (ex.sets || []).forEach((s) => {
        const w = Number(s.weight);
        const r = Number(s.reps);
        if (!(w > 0 && r > 0)) return;
        const cur = best[ex.name];
        if (!cur || w > cur.weight || (w === cur.weight && r > cur.reps)) {
          best[ex.name] = { name: ex.name, weight: w, reps: r, date: h.date };
        }
      });
    });
  });
  return Object.values(best).sort((a, b) => b.weight - a.weight);
}

export const QUOTES = [
  "Small steps. Stronger you.",
  "Consistency beats intensity.",
  "Show up, then let momentum do the rest.",
  "One more set than last time.",
  "Rest is part of the program.",
  "You don't need a perfect day, just a started one.",
  "Progress is quiet until it isn't.",
];