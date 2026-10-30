import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { themes } from "../theme";
import { EXERCISES } from "../data/exercises";
import {
  initialPlans,
  initialHistory,
  initialClients,
  defaultProfile,
} from "../data/seed";
import { uid } from "../utils";

const AppContext = createContext(null);
const STORAGE_KEY = "@forma_state_v2";
const emptyAccounts = { individual: null, trainer: null };

export function AppProvider({ children }) {
  // role === null means "show the role picker"
  const [role, setRole] = useState(null);
  const [themeMode, setThemeMode] = useState("dark");
  const [plans, setPlans] = useState(initialPlans);
  const [history, setHistory] = useState(initialHistory);
  const [clients, setClients] = useState(initialClients);
  const [customExercises, setCustomExercises] = useState([]);
  const [profile, setProfile] = useState(defaultProfile);
  const [accounts, setAccounts] = useState(emptyAccounts);
  const [ready, setReady] = useState(false);

  /* ---------- Load ---------- */
  useEffect(() => {
    let active = true;

    async function loadState() {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);

        if (saved && active) {
          const data = JSON.parse(saved);

          if (data.role === "individual" || data.role === "trainer") {
            setRole(data.role);
          }
          if (data.themeMode === "dark" || data.themeMode === "light") {
            setThemeMode(data.themeMode);
          }
          if (Array.isArray(data.plans)) setPlans(data.plans);
          if (Array.isArray(data.history)) setHistory(data.history);
          if (Array.isArray(data.clients)) setClients(data.clients);
          if (Array.isArray(data.customExercises)) {
            setCustomExercises(data.customExercises);
          }
          if (data.accounts && typeof data.accounts === "object") {
            setAccounts({ ...emptyAccounts, ...data.accounts });
          }
          if (data.profile) {
            setProfile((current) => ({ ...current, ...data.profile }));
          }
        }
      } catch (error) {
        console.warn("Could not load saved app data:", error);
      } finally {
        if (active) setReady(true);
      }
    }

    loadState();

    return () => {
      active = false;
    };
  }, []);

  /* ---------- Save ---------- */
  useEffect(() => {
    if (!ready) return;

    const data = {
      role,
      themeMode,
      plans,
      history,
      clients,
      customExercises,
      profile,
      accounts,
    };

    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data)).catch((error) =>
      console.warn("Could not save app data:", error)
    );
  }, [ready, role, themeMode, plans, history, clients, customExercises, profile, accounts]);

  const theme = themes[themeMode] || themes.dark;

  const allExercises = useMemo(
    () => [...EXERCISES, ...customExercises],
    [customExercises]
  );

  /* ---------- Theme / profile ---------- */
  function toggleTheme() {
    setThemeMode((current) => (current === "dark" ? "light" : "dark"));
  }

  function updateProfile(patch) {
    setProfile((current) => ({ ...current, ...patch }));
  }

  /* ---------- Accounts (stored on this device only) ---------- */
  // kind: "individual" | "trainer"
  function registerAccount(kind, details) {
    setAccounts((current) => ({
      ...current,
      [kind]: { ...details, createdAt: new Date().toISOString() },
    }));

    setProfile((current) => ({
      ...current,
      name: details.name,
      ...(kind === "individual"
        ? {
            goal: details.goal,
            level: details.level,
            weeklyGoal: details.weeklyGoal,
          }
        : {}),
    }));

    setRole(kind);
  }

  /* ---------- Plans ---------- */
  function savePlan(plan) {
    setPlans((current) => {
      const exists = current.some((item) => item.id === plan.id);
      return exists
        ? current.map((item) => (item.id === plan.id ? plan : item))
        : [plan, ...current];
    });
  }

  function deletePlan(planId) {
    setPlans((current) => current.filter((item) => item.id !== planId));
    setClients((current) =>
      current.map((client) =>
        client.planId === planId ? { ...client, planId: null } : client
      )
    );
  }

  /* ---------- Exercises ---------- */
  function addCustomExercise(exercise) {
    const created = { ...exercise, id: uid("custom"), custom: true };
    setCustomExercises((current) => [created, ...current]);
    return created;
  }

  function deleteCustomExercise(exerciseId) {
    setCustomExercises((current) =>
      current.filter((item) => item.id !== exerciseId)
    );
  }

  /* ---------- History ---------- */
  function finishWorkout(workout) {
    const entry = {
      ...workout,
      id: uid("history"),
      date: new Date().toISOString(),
      completed: true,
    };
    setHistory((current) => [entry, ...current]);
    return entry.id;
  }

  function deleteHistory(entryId) {
    setHistory((current) => current.filter((item) => item.id !== entryId));
  }

  /* ---------- Clients ---------- */
  function addClient(client) {
    const created = { ...client, id: uid("client") };
    setClients((current) => [created, ...current]);
    return created.id;
  }

  function updateClient(clientId, patch) {
    setClients((current) =>
      current.map((client) =>
        client.id === clientId ? { ...client, ...patch } : client
      )
    );
  }

  function deleteClient(clientId) {
    setClients((current) => current.filter((client) => client.id !== clientId));
  }

  /* ---------- Reset ---------- */
  function resetDemoData() {
    setPlans(initialPlans);
    setHistory(initialHistory);
    setClients(initialClients);
    setCustomExercises([]);
    setProfile(defaultProfile);
  }

  const value = {
    ready,
    role,
    setRole,
    themeMode,
    toggleTheme,
    theme,
    profile,
    updateProfile,
    accounts,
    registerAccount,
    plans,
    savePlan,
    deletePlan,
    allExercises,
    customExercises,
    addCustomExercise,
    deleteCustomExercise,
    history,
    finishWorkout,
    deleteHistory,
    clients,
    addClient,
    updateClient,
    deleteClient,
    resetDemoData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useApp must be used inside AppProvider");
  }

  return context;
}