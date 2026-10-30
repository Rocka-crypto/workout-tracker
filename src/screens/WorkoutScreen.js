import React, { useEffect, useRef, useState } from "react";
import { Alert, Pressable, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useApp } from "../context/AppContext";
import {
  AppButton,
  AppText,
  Card,
  EmptyState,
  Field,
  IconButton,
  Screen,
  StatCard,
  Tag,
} from "../components/UI";
import ExercisePicker from "../components/ExercisePicker";
import { radius } from "../theme";
import {
  defaultTarget,
  formatClock,
  personalRecords,
  success,
  tap,
  uid,
  unitLabel,
} from "../utils";

/* ---------- Builders ---------- */

function newSet(kind, weight = "", reps) {
  return {
    id: uid("set"),
    weight,
    reps: reps !== undefined ? String(reps) : String(defaultTarget(kind)),
    done: false,
  };
}

function fromPlan(plan) {
  return plan.exercises.map((ex) => ({
    key: uid("ex"),
    exerciseId: ex.exerciseId,
    name: ex.name,
    kind: ex.kind,
    muscle: ex.muscle,
    sets: Array.from({ length: Number(ex.sets) || 1 }, () =>
      newSet(ex.kind, ex.weight ? String(ex.weight) : "", ex.reps)
    ),
  }));
}

function fromEntry(entry) {
  return (entry.exercises || []).map((ex) => ({
    key: uid("ex"),
    name: ex.name,
    kind: ex.kind,
    muscle: ex.muscle,
    sets: ex.sets.map((s) =>
      newSet(ex.kind, s.weight ? String(s.weight) : "", s.reps)
    ),
  }));
}

function fromLibrary(list) {
  return list.map((item) => ({
    key: uid("ex"),
    exerciseId: item.id,
    name: item.name,
    kind: item.kind,
    muscle: item.muscle,
    sets: Array.from({ length: item.kind === "cardio" ? 1 : 3 }, () =>
      newSet(item.kind)
    ),
  }));
}

/* ---------- Set row ---------- */

function SetRow({ index, set, kind, onChange, onToggle }) {
  const { theme } = useApp();

  const inputStyle = {
    flex: 1,
    minHeight: 44,
    borderRadius: 10,
    backgroundColor: set.done ? theme.primarySoft : theme.surfaceAlt,
    color: theme.text,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
    paddingHorizontal: 6,
  };

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <AppText color={theme.muted} weight="700" style={{ width: 22 }}>
        {index + 1}
      </AppText>

      {kind === "weighted" ? (
        <TextInput
          value={set.weight}
          onChangeText={(text) =>
            onChange({ weight: text.replace(/[^0-9.]/g, "") })
          }
          keyboardType="decimal-pad"
          placeholder="0"
          placeholderTextColor={theme.muted}
          selectionColor={theme.primary}
          style={inputStyle}
        />
      ) : null}

      <TextInput
        value={set.reps}
        onChangeText={(text) => onChange({ reps: text.replace(/[^0-9]/g, "") })}
        keyboardType="number-pad"
        placeholder="0"
        placeholderTextColor={theme.muted}
        selectionColor={theme.primary}
        style={inputStyle}
      />

      <Pressable
        onPress={onToggle}
        accessibilityLabel={set.done ? "Mark set not done" : "Mark set done"}
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: set.done ? theme.primary : theme.surfaceAlt,
        }}
      >
        <Ionicons
          name="checkmark"
          size={22}
          color={set.done ? theme.onPrimary : theme.muted}
        />
      </Pressable>
    </View>
  );
}

/* ---------- Screen ---------- */

export default function WorkoutScreen({ route, navigation }) {
  const { theme, plans, history, profile, finishWorkout } = useApp();

  const params = route.params || {};
  const plan = plans.find((item) => item.id === params.planId);
  const source = params.fromHistoryId
    ? history.find((item) => item.id === params.fromHistoryId)
    : null;

  const [title, setTitle] = useState(
    (plan && plan.title) || (source && source.title) || "Quick workout"
  );
  const [exercises, setExercises] = useState(() =>
    plan ? fromPlan(plan) : source ? fromEntry(source) : []
  );
  const [pickerOpen, setPickerOpen] = useState(false);
  const [summary, setSummary] = useState(null);

  const startRef = useRef(Date.now());
  const leaveRef = useRef(false);
  const [now, setNow] = useState(Date.now());
  const [restEnd, setRestEnd] = useState(null);

  const unit = profile.unit || "kg";

  /* Clock: derive from timestamps so it stays right if the app is backgrounded */
  useEffect(() => {
    if (summary) return undefined;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [summary]);

  const elapsed = Math.floor((now - startRef.current) / 1000);
  const restLeft = restEnd ? Math.max(0, Math.ceil((restEnd - now) / 1000)) : 0;

  useEffect(() => {
    if (restEnd && now >= restEnd) {
      setRestEnd(null);
      success();
    }
  }, [now, restEnd]);

  /* Totals */
  const totalSets = exercises.reduce((n, ex) => n + ex.sets.length, 0);
  const doneSets = exercises.reduce(
    (n, ex) => n + ex.sets.filter((s) => s.done).length,
    0
  );
  const volume = exercises.reduce((sum, ex) => {
    if (ex.kind !== "weighted") return sum;
    return (
      sum +
      ex.sets.reduce(
        (v, s) => (s.done ? v + (Number(s.weight) || 0) * (Number(s.reps) || 0) : v),
        0
      )
    );
  }, 0);

  /* Confirm before throwing away logged sets */
  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (event) => {
      if (leaveRef.current || summary || doneSets === 0) return;

      event.preventDefault();
      Alert.alert(
        "Discard this workout?",
        "The sets you've logged won't be saved.",
        [
          { text: "Keep training", style: "cancel" },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => {
              leaveRef.current = true;
              navigation.dispatch(event.data.action);
            },
          },
        ]
      );
    });

    return unsubscribe;
  }, [navigation, summary, doneSets]);

  /* ---------- Editing ---------- */

  function updateSet(exKey, setId, patch) {
    setExercises((current) =>
      current.map((ex) =>
        ex.key !== exKey
          ? ex
          : {
              ...ex,
              sets: ex.sets.map((s) => (s.id === setId ? { ...s, ...patch } : s)),
            }
      )
    );
  }

  function toggleSet(ex, set) {
    if (!set.done && !(Number(set.reps) > 0)) {
      Alert.alert(
        "Add a value first",
        `Enter the ${unitLabel(ex.kind)} before checking off the set.`
      );
      return;
    }

    updateSet(ex.key, set.id, { done: !set.done });

    if (!set.done) {
      success();
      const isLastSet = doneSets + 1 >= totalSets;
      if (profile.restSeconds > 0 && !isLastSet) {
        setRestEnd(Date.now() + profile.restSeconds * 1000);
      }
    } else {
      tap();
    }
  }

  function addSet(exKey) {
    setExercises((current) =>
      current.map((ex) => {
        if (ex.key !== exKey) return ex;
        const last = ex.sets[ex.sets.length - 1];
        return {
          ...ex,
          sets: [
            ...ex.sets,
            newSet(ex.kind, last ? last.weight : "", last ? last.reps : undefined),
          ],
        };
      })
    );
  }

  function removeSet(exKey) {
    setExercises((current) =>
      current.map((ex) =>
        ex.key !== exKey || ex.sets.length <= 1
          ? ex
          : { ...ex, sets: ex.sets.slice(0, -1) }
      )
    );
  }

  function removeExercise(ex) {
    Alert.alert(`Remove ${ex.name}?`, "Its sets will be removed from this session.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () =>
          setExercises((current) => current.filter((item) => item.key !== ex.key)),
      },
    ]);
  }

  /* ---------- Finish ---------- */

  function save() {
    const logged = exercises
      .map((ex) => ({
        name: ex.name,
        kind: ex.kind,
        muscle: ex.muscle,
        sets: ex.sets
          .filter((s) => s.done)
          .map((s) => ({
            weight: Number(s.weight) || 0,
            reps: Number(s.reps) || 0,
          })),
      }))
      .filter((ex) => ex.sets.length > 0);

    const entry = {
      title: title.trim() || "Workout",
      planId: plan ? plan.id : null,
      duration: Math.max(1, Math.round(elapsed / 60)),
      volume: Math.round(volume),
      exercises: logged,
    };

    // Compare against records from before this session
    const previous = {};
    personalRecords(history).forEach((r) => {
      previous[r.name] = r.weight;
    });
    const newPRs = personalRecords([
      { completed: true, date: new Date().toISOString(), exercises: logged },
    ]).filter(
      (r) => previous[r.name] !== undefined && r.weight > previous[r.name]
    );

    const id = finishWorkout(entry);
    success();
    setRestEnd(null);
    setSummary({ id, entry, newPRs, sets: doneSets });
  }

  function onFinishPress() {
    if (doneSets === 0) {
      Alert.alert(
        "Nothing logged yet",
        "Check off at least one set to save this workout.",
        [
          { text: "Keep training", style: "cancel" },
          {
            text: "Discard workout",
            style: "destructive",
            onPress: () => {
              leaveRef.current = true;
              navigation.goBack();
            },
          },
        ]
      );
      return;
    }

    if (doneSets < totalSets) {
      const left = totalSets - doneSets;
      Alert.alert(
        "Finish workout?",
        `${left} unchecked ${left === 1 ? "set" : "sets"} won't be saved.`,
        [
          { text: "Keep training", style: "cancel" },
          { text: "Finish and save", onPress: save },
        ]
      );
      return;
    }

    save();
  }

  /* ---------- Summary ---------- */

  if (summary) {
    return (
      <Screen inStack style={{ gap: 20 }}>
        <View style={{ alignItems: "center", gap: 10, paddingVertical: 16 }}>
          <View
            style={{
              width: 84,
              height: 84,
              borderRadius: 28,
              backgroundColor: theme.primarySoft,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="trophy" size={40} color={theme.primary} />
          </View>
          <AppText size={28} weight="800" align="center">
            Workout saved
          </AppText>
          <AppText color={theme.muted} align="center">
            {summary.entry.title}
          </AppText>
        </View>

        <View style={{ flexDirection: "row", gap: 12 }}>
          <StatCard label="Minutes" value={`${summary.entry.duration}`} icon="time-outline" />
          <StatCard label="Sets" value={`${summary.sets}`} icon="layers-outline" />
        </View>

        {summary.entry.volume > 0 ? (
          <Card>
            <AppText color={theme.muted}>Total volume</AppText>
            <AppText size={28} weight="800">
              {summary.entry.volume.toLocaleString()} {unit}
            </AppText>
          </Card>
        ) : null}

        {summary.newPRs.length > 0 ? (
          <Card style={{ borderColor: theme.primary }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Ionicons name="ribbon" size={20} color={theme.primary} />
              <AppText weight="700">New personal records</AppText>
            </View>
            {summary.newPRs.map((r) => (
              <AppText key={r.name} color={theme.muted}>
                {r.name}: {r.weight} {unit} x {r.reps}
              </AppText>
            ))}
          </Card>
        ) : null}

        <View style={{ gap: 10 }}>
          <AppButton title="Done" onPress={() => navigation.goBack()} />
          <AppButton
            title="View workout details"
            variant="outline"
            onPress={() => navigation.replace("HistoryDetail", { id: summary.id })}
          />
        </View>
      </Screen>
    );
  }

  /* ---------- Active session ---------- */

  const footer = (
    <>
      {restLeft > 0 ? (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            padding: 12,
            borderRadius: radius.md,
            backgroundColor: theme.primarySoft,
          }}
        >
          <Ionicons name="hourglass-outline" size={22} color={theme.primary} />
          <View style={{ flex: 1 }}>
            <AppText size={12} color={theme.muted}>
              Rest
            </AppText>
            <AppText size={22} weight="800" color={theme.primary}>
              {formatClock(restLeft)}
            </AppText>
          </View>
          <AppButton
            title="+15s"
            variant="outline"
            small
            onPress={() => setRestEnd((end) => (end ? end + 15000 : end))}
          />
          <AppButton title="Skip" variant="soft" small onPress={() => setRestEnd(null)} />
        </View>
      ) : null}

      <AppButton title="Finish workout" icon="flag" onPress={onFinishPress} />
    </>
  );

  return (
    <Screen inStack footer={footer}>
      <Card>
        <Field
          label="Workout name"
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. Upper body"
          maxLength={40}
        />

        <View style={{ flexDirection: "row", marginTop: 4 }}>
          {[
            { label: "Time", value: formatClock(elapsed) },
            { label: "Sets", value: `${doneSets}/${totalSets}` },
            { label: `Volume (${unit})`, value: Math.round(volume).toLocaleString() },
          ].map((item) => (
            <View key={item.label} style={{ flex: 1, gap: 2 }}>
              <AppText size={12} color={theme.muted}>
                {item.label}
              </AppText>
              <AppText size={20} weight="800">
                {item.value}
              </AppText>
            </View>
          ))}
        </View>
      </Card>

      {exercises.length === 0 ? (
        <Card>
          <EmptyState
            icon="barbell-outline"
            title="Build your session"
            message="Add the exercises you want to do, then check off each set as you go."
          />
        </Card>
      ) : null}

      {exercises.map((ex) => (
        <Card key={ex.key}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View style={{ flex: 1, gap: 6 }}>
              <AppText size={17} weight="700">
                {ex.name}
              </AppText>
              <View style={{ flexDirection: "row" }}>
                <Tag label={ex.muscle || "Custom"} />
              </View>
            </View>
            <IconButton
              name="trash-outline"
              onPress={() => removeExercise(ex)}
              label={`Remove ${ex.name}`}
            />
          </View>

          <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
            <View style={{ width: 22 }} />
            {ex.kind === "weighted" ? (
              <AppText size={12} color={theme.muted} align="center" style={{ flex: 1 }}>
                {unit}
              </AppText>
            ) : null}
            <AppText size={12} color={theme.muted} align="center" style={{ flex: 1 }}>
              {unitLabel(ex.kind)}
            </AppText>
            <View style={{ width: 44 }} />
          </View>

          {ex.sets.map((set, index) => (
            <SetRow
              key={set.id}
              index={index}
              set={set}
              kind={ex.kind}
              onChange={(patch) => updateSet(ex.key, set.id, patch)}
              onToggle={() => toggleSet(ex, set)}
            />
          ))}

          <View style={{ flexDirection: "row", gap: 8, marginTop: 4 }}>
            <AppButton
              title="Add set"
              icon="add"
              variant="soft"
              small
              onPress={() => addSet(ex.key)}
            />
            {ex.sets.length > 1 ? (
              <AppButton
                title="Remove set"
                variant="ghost"
                small
                onPress={() => removeSet(ex.key)}
              />
            ) : null}
          </View>
        </Card>
      ))}

      <AppButton
        title="Add exercises"
        icon="add-circle-outline"
        variant="outline"
        onPress={() => setPickerOpen(true)}
      />

      <ExercisePicker
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onConfirm={(list) => setExercises((current) => [...current, ...fromLibrary(list)])}
      />
    </Screen>
  );
}