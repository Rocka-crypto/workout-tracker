import React from "react";
import { Alert, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useApp } from "../context/AppContext";
import {
  AppButton,
  AppText,
  Card,
  EmptyState,
  IconButton,
  Screen,
  StatCard,
  Tag,
} from "../components/UI";
import { countSets, formatDateLong, relativeDay, unitLabel } from "../utils";

export function HistoryScreen({ navigation }) {
  const { theme, history, role, deleteHistory } = useApp();

  function confirmDelete(item) {
    Alert.alert(`Delete "${item.title}"?`, "This removes it from your stats too.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteHistory(item.id) },
    ]);
  }

  return (
    <Screen inStack>
      <View style={{ gap: 4 }}>
        <AppText size={28} weight="800">
          Workout history
        </AppText>
        <AppText color={theme.muted}>
          {history.length} {history.length === 1 ? "session" : "sessions"} logged.
        </AppText>
      </View>

      {history.map((item) => (
        <Card
          key={item.id}
          onPress={() => navigation.navigate("HistoryDetail", { id: item.id })}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View style={{ flex: 1, gap: 8 }}>
              <AppText size={17} weight="700">
                {item.title}
              </AppText>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                <Tag label={relativeDay(item.date)} icon="calendar-outline" />
                <Tag label={`${item.duration} min`} icon="time-outline" />
                {countSets(item) > 0 ? <Tag label={`${countSets(item)} sets`} /> : null}
              </View>
            </View>
            <IconButton
              name="trash-outline"
              color={theme.danger}
              onPress={() => confirmDelete(item)}
              label="Delete workout"
            />
          </View>
        </Card>
      ))}

      {history.length === 0 ? (
        <EmptyState
          icon="calendar-outline"
          title="No workouts yet"
          message="Your completed sessions will appear here."
          actionTitle={role === "trainer" ? undefined : "Start a workout"}
          onAction={() => navigation.navigate("Workout")}
        />
      ) : null}
    </Screen>
  );
}

export function HistoryDetailScreen({ route, navigation }) {
  const { theme, history, plans, profile, role, deleteHistory } = useApp();

  const entry = history.find((item) => item.id === (route.params && route.params.id));
  const unit = profile.unit || "kg";

  if (!entry) {
    return (
      <Screen inStack>
        <EmptyState
          title="Workout not found"
          message="It may have been deleted."
          actionTitle="Go back"
          onAction={() => navigation.goBack()}
        />
      </Screen>
    );
  }

  const planStillExists = entry.planId && plans.some((p) => p.id === entry.planId);
  const hasDetails = (entry.exercises || []).length > 0;

  function remove() {
    Alert.alert(`Delete "${entry.title}"?`, "This removes it from your stats too.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteHistory(entry.id);
          navigation.goBack();
        },
      },
    ]);
  }

  return (
    <Screen inStack>
      <View style={{ gap: 4 }}>
        <AppText size={26} weight="800">
          {entry.title}
        </AppText>
        <AppText color={theme.muted}>{formatDateLong(entry.date)}</AppText>
      </View>

      <View style={{ flexDirection: "row", gap: 12 }}>
        <StatCard label="Minutes" value={`${entry.duration}`} icon="time-outline" />
        <StatCard
          label={entry.volume > 0 ? `Volume (${unit})` : "Sets"}
          value={entry.volume > 0 ? entry.volume.toLocaleString() : `${countSets(entry)}`}
          icon={entry.volume > 0 ? "barbell-outline" : "layers-outline"}
        />
      </View>

      {(entry.exercises || []).map((ex, index) => (
        <Card key={`${ex.name}-${index}`}>
          <AppText size={16} weight="700">
            {ex.name}
          </AppText>

          {ex.sets.map((set, i) => (
            <View
              key={i}
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              <Ionicons name="checkmark-circle" size={18} color={theme.primary} />
              <AppText color={theme.muted} style={{ width: 48 }}>
                Set {i + 1}
              </AppText>
              <AppText weight="600">
                {ex.kind === "weighted" && set.weight > 0
                  ? `${set.weight} ${unit} x ${set.reps}`
                  : `${set.reps} ${unitLabel(ex.kind)}`}
              </AppText>
            </View>
          ))}
        </Card>
      ))}

      {!hasDetails ? (
        <Card>
          <AppText color={theme.muted}>
            This session was saved without exercise details.
          </AppText>
        </Card>
      ) : null}

      <View style={{ gap: 10 }}>
        {role !== "trainer" && hasDetails ? (
          <AppButton
            title="Repeat this workout"
            icon="refresh"
            onPress={() =>
              navigation.navigate(
                "Workout",
                planStillExists
                  ? { planId: entry.planId }
                  : { fromHistoryId: entry.id }
              )
            }
          />
        ) : null}
        <AppButton title="Delete workout" variant="outline" icon="trash-outline" onPress={remove} />
      </View>
    </Screen>
  );
}