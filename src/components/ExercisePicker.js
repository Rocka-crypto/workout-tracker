import React, { useMemo, useState } from "react";
import { FlatList, Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useApp } from "../context/AppContext";
import { MUSCLES } from "../data/exercises";
import {
  AppButton,
  AppText,
  Chip,
  ChipRow,
  EmptyState,
  SearchField,
  Sheet,
  Tag,
} from "./UI";
import { tap } from "../utils";

// Multi-select exercise browser shown in a bottom sheet.
export default function ExercisePicker({ visible, onClose, onConfirm }) {
  const { theme, allExercises } = useApp();
  const [query, setQuery] = useState("");
  const [muscle, setMuscle] = useState("All");
  const [selected, setSelected] = useState([]);

  const filtered = useMemo(
    () =>
      allExercises.filter(
        (item) =>
          (muscle === "All" || item.muscle === muscle) &&
          item.name.toLowerCase().includes(query.trim().toLowerCase())
      ),
    [allExercises, query, muscle]
  );

  function toggle(id) {
    tap();
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }

  function close() {
    setSelected([]);
    setQuery("");
    setMuscle("All");
    onClose();
  }

  function confirm() {
    const chosen = selected
      .map((id) => allExercises.find((item) => item.id === id))
      .filter(Boolean);
    onConfirm(chosen);
    close();
  }

  return (
    <Sheet visible={visible} onClose={close} title="Add exercises" tall>
      <SearchField
        value={query}
        onChangeText={setQuery}
        placeholder="Search exercises"
      />

      <View style={{ height: 40 }}>
        <ChipRow scroll>
          {["All", ...MUSCLES].map((name) => (
            <Chip
              key={name}
              label={name}
              active={muscle === name}
              onPress={() => setMuscle(name)}
            />
          ))}
        </ChipRow>
      </View>

      <FlatList
        style={{ flex: 1 }}
        data={filtered}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="search"
            title="No matches"
            message="Try a different search or muscle group."
          />
        }
        renderItem={({ item }) => {
          const active = selected.includes(item.id);

          return (
            <Pressable
              onPress={() => toggle(item.id)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: theme.border,
              }}
            >
              <Ionicons
                name={active ? "checkmark-circle" : "ellipse-outline"}
                size={24}
                color={active ? theme.primary : theme.muted}
              />
              <View style={{ flex: 1, gap: 2 }}>
                <AppText weight="600">{item.name}</AppText>
                <AppText size={12} color={theme.muted}>
                  {item.muscle}, {item.equipment}
                </AppText>
              </View>
              {item.custom ? <Tag label="Custom" /> : null}
            </Pressable>
          );
        }}
      />

      <AppButton
        title={
          selected.length
            ? `Add ${selected.length} exercise${selected.length > 1 ? "s" : ""}`
            : "Select exercises"
        }
        disabled={!selected.length}
        onPress={confirm}
      />
    </Sheet>
  );
}