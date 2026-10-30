import React, { useState } from "react";
import { Alert, View } from "react-native";

import { useApp } from "../context/AppContext";
import {
  AppButton,
  AppText,
  Card,
  Chip,
  ChipRow,
  EmptyState,
  Field,
  IconButton,
  Screen,
  Stepper,
  Tag,
} from "../components/UI";
import ExercisePicker from "../components/ExercisePicker";
import { LEVELS, PLAN_CATEGORIES } from "../data/exercises";
import { defaultTarget, estimateMinutes, success, uid, unitLabel } from "../utils";

export default function PlanEditorScreen({ route, navigation }) {
  const { theme, plans, profile, savePlan, deletePlan } = useApp();

  const planId = route.params ? route.params.planId : undefined;
  const existing = plans.find((item) => item.id === planId);
  const unit = profile.unit || "kg";

  const [title, setTitle] = useState(existing ? existing.title : "");
  const [category, setCategory] = useState(existing ? existing.category : "Strength");
  const [level, setLevel] = useState(existing ? existing.level : "Beginner");
  const [exercises, setExercises] = useState(
    existing ? existing.exercises.map((ex) => ({ ...ex })) : []
  );
  const [pickerOpen, setPickerOpen] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  const titleError = showErrors && !title.trim() ? "Give your plan a name." : null;
  const exerciseError =
    showErrors && exercises.length === 0 ? "Add at least one exercise." : null;

  function patch(id, changes) {
    setExercises((current) =>
      current.map((ex) => (ex.id === id ? { ...ex, ...changes } : ex))
    );
  }

  function move(index, direction) {
    const target = index + direction;
    if (target < 0 || target >= exercises.length) return;
    setExercises((current) => {
      const copy = [...current];
      const [item] = copy.splice(index, 1);
      copy.splice(target, 0, item);
      return copy;
    });
  }

  function addFromLibrary(list) {
    setExercises((current) => [
      ...current,
      ...list.map((item) => ({
        id: uid("pe"),
        exerciseId: item.id,
        name: item.name,
        kind: item.kind,
        muscle: item.muscle,
        sets: item.kind === "cardio" ? 1 : 3,
        reps: defaultTarget(item.kind),
        weight: 0,
      })),
    ]);
  }

  function save() {
    setShowErrors(true);
    if (!title.trim() || exercises.length === 0) return;

    savePlan({
      id: existing ? existing.id : uid("plan"),
      title: title.trim(),
      category,
      level,
      exercises,
    });
    success();
    navigation.goBack();
  }

  function remove() {
    Alert.alert(`Delete "${existing.title}"?`, "This can't be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deletePlan(existing.id);
          navigation.goBack();
        },
      },
    ]);
  }

  if (planId && !existing) {
    return (
      <Screen inStack>
        <EmptyState
          title="Plan not found"
          message="It may have been deleted."
          actionTitle="Go back"
          onAction={() => navigation.goBack()}
        />
      </Screen>
    );
  }

  return (
    <Screen
      inStack
      footer={<AppButton title={existing ? "Save changes" : "Create plan"} onPress={save} />}
    >
      <Field
        label="Plan name"
        value={title}
        onChangeText={setTitle}
        placeholder="e.g. Leg day"
        maxLength={40}
        error={titleError}
      />

      <View style={{ gap: 8 }}>
        <AppText size={13} weight="600" color={theme.muted}>
          Category
        </AppText>
        <ChipRow>
          {PLAN_CATEGORIES.map((name) => (
            <Chip key={name} label={name} active={category === name} onPress={() => setCategory(name)} />
          ))}
        </ChipRow>
      </View>

      <View style={{ gap: 8 }}>
        <AppText size={13} weight="600" color={theme.muted}>
          Level
        </AppText>
        <ChipRow>
          {LEVELS.map((name) => (
            <Chip key={name} label={name} active={level === name} onPress={() => setLevel(name)} />
          ))}
        </ChipRow>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <AppText size={18} weight="700">
          Exercises
        </AppText>
        <Tag label={`About ${estimateMinutes({ exercises })} min`} icon="time-outline" />
      </View>

      {exerciseError ? (
        <AppText size={12} color={theme.danger}>
          {exerciseError}
        </AppText>
      ) : null}

      {exercises.length === 0 ? (
        <Card>
          <EmptyState
            title="No exercises yet"
            message="Add exercises from the library, then set your target sets and reps."
          />
        </Card>
      ) : null}

      {exercises.map((ex, index) => (
        <Card key={ex.id}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{ flex: 1, gap: 2 }}>
              <AppText size={16} weight="700">
                {ex.name}
              </AppText>
              <AppText size={12} color={theme.muted}>
                {ex.muscle || "Custom"}
              </AppText>
            </View>
            <IconButton
              name="arrow-up"
              onPress={() => move(index, -1)}
              disabled={index === 0}
              label="Move up"
            />
            <IconButton
              name="arrow-down"
              onPress={() => move(index, 1)}
              disabled={index === exercises.length - 1}
              label="Move down"
            />
            <IconButton
              name="trash-outline"
              color={theme.danger}
              onPress={() => setExercises((cur) => cur.filter((item) => item.id !== ex.id))}
              label={`Remove ${ex.name}`}
            />
          </View>

          <Stepper
            label="Sets"
            value={Number(ex.sets) || 1}
            min={1}
            max={12}
            onChange={(v) => patch(ex.id, { sets: v })}
          />
          <Stepper
            label={`Target ${unitLabel(ex.kind)}`}
            value={Number(ex.reps) || 0}
            min={1}
            max={ex.kind === "timed" ? 600 : 300}
            step={ex.kind === "timed" ? 5 : 1}
            onChange={(v) => patch(ex.id, { reps: v })}
          />
          {ex.kind === "weighted" ? (
            <Stepper
              label={`Start weight (${unit})`}
              value={Number(ex.weight) || 0}
              min={0}
              max={999}
              step={2.5}
              onChange={(v) => patch(ex.id, { weight: v })}
            />
          ) : null}
        </Card>
      ))}

      <AppButton
        title="Add exercises"
        icon="add-circle-outline"
        variant="outline"
        onPress={() => setPickerOpen(true)}
      />

      {existing ? (
        <AppButton title="Delete plan" variant="danger" icon="trash-outline" onPress={remove} />
      ) : null}

      <ExercisePicker
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onConfirm={addFromLibrary}
      />
    </Screen>
  );
}