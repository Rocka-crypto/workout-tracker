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
  IconButton,
  Screen,
  SearchField,
  Tag,
} from "../components/UI";
import { estimateMinutes, uid } from "../utils";

export default function PlansScreen({ navigation }) {
  const { theme, plans, clients, role, savePlan, deletePlan } = useApp();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  const isTrainer = role === "trainer";
  const categories = ["All", ...Array.from(new Set(plans.map((p) => p.category)))];

  const filtered = plans.filter(
    (plan) =>
      (category === "All" || plan.category === category) &&
      plan.title.toLowerCase().includes(query.trim().toLowerCase())
  );

  function duplicate(plan) {
    savePlan({
      ...plan,
      id: uid("plan"),
      title: `${plan.title} copy`,
      exercises: plan.exercises.map((ex) => ({ ...ex, id: uid("pe") })),
    });
  }

  function confirmDelete(plan) {
    const assigned = clients.filter((c) => c.planId === plan.id).length;
    Alert.alert(
      `Delete "${plan.title}"?`,
      assigned > 0
        ? `${assigned} ${assigned === 1 ? "client is" : "clients are"} using this plan and will be left without one.`
        : "This can't be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deletePlan(plan.id) },
      ]
    );
  }

  return (
    <Screen>
      <View style={{ gap: 4 }}>
        <AppText size={28} weight="800">
          Workout plans
        </AppText>
        <AppText color={theme.muted}>
          {isTrainer
            ? "Build plans, then assign them to clients."
            : "Pick a routine or build your own."}
        </AppText>
      </View>

      <AppButton
        title="Create a plan"
        icon="add"
        onPress={() => navigation.navigate("PlanEditor")}
      />

      <SearchField value={query} onChangeText={setQuery} placeholder="Search plans" />

      {categories.length > 2 ? (
        <ChipRow scroll>
          {categories.map((name) => (
            <Chip
              key={name}
              label={name}
              active={category === name}
              onPress={() => setCategory(name)}
            />
          ))}
        </ChipRow>
      ) : null}

      {filtered.map((plan) => {
        const assigned = clients.filter((c) => c.planId === plan.id).length;

        return (
          <Card key={plan.id}>
            <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 8 }}>
              <View style={{ flex: 1, gap: 8 }}>
                <AppText size={18} weight="700">
                  {plan.title}
                </AppText>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                  <Tag label={plan.category} />
                  <Tag label={plan.level} />
                  <Tag label={`${estimateMinutes(plan)} min`} icon="time-outline" />
                  {isTrainer && assigned > 0 ? (
                    <Tag
                      label={`${assigned} ${assigned === 1 ? "client" : "clients"}`}
                      icon="people-outline"
                      color={theme.primary}
                    />
                  ) : null}
                </View>
              </View>

              <IconButton
                name="copy-outline"
                onPress={() => duplicate(plan)}
                label="Duplicate plan"
              />
              <IconButton
                name="create-outline"
                onPress={() => navigation.navigate("PlanEditor", { planId: plan.id })}
                label="Edit plan"
              />
              <IconButton
                name="trash-outline"
                color={theme.danger}
                onPress={() => confirmDelete(plan)}
                label="Delete plan"
              />
            </View>

            <AppText color={theme.muted} numberOfLines={2}>
              {plan.exercises.map((item) => item.name).join(", ")}
            </AppText>

            {!isTrainer ? (
              <AppButton
                title="Start plan"
                icon="play"
                onPress={() => navigation.navigate("Workout", { planId: plan.id })}
              />
            ) : null}
          </Card>
        );
      })}

      {plans.length === 0 ? (
        <EmptyState
          title="No plans yet"
          message="Create your first plan to organise your training."
          actionTitle="Create a plan"
          onAction={() => navigation.navigate("PlanEditor")}
        />
      ) : null}

      {plans.length > 0 && filtered.length === 0 ? (
        <EmptyState
          icon="search"
          title="No matching plans"
          message="Try a different search or category."
        />
      ) : null}
    </Screen>
  );
}