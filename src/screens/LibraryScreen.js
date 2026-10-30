import React, { useMemo, useState } from "react";
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
  SearchField,
  Sheet,
  Tag,
} from "../components/UI";
import { EQUIPMENT, KINDS, MUSCLES } from "../data/exercises";
import { personalRecords, success } from "../utils";

function NewExerciseSheet({ visible, onClose }) {
  const { theme, addCustomExercise } = useApp();
  const [name, setName] = useState("");
  const [muscle, setMuscle] = useState("Chest");
  const [equipment, setEquipment] = useState("Bodyweight");
  const [kind, setKind] = useState("weighted");
  const [error, setError] = useState(null);

  function reset() {
    setName("");
    setMuscle("Chest");
    setEquipment("Bodyweight");
    setKind("weighted");
    setError(null);
  }

  function close() {
    reset();
    onClose();
  }

  function save() {
    if (!name.trim()) {
      setError("Enter a name for the exercise.");
      return;
    }
    addCustomExercise({ name: name.trim(), muscle, equipment, kind });
    success();
    close();
  }

  return (
    <Sheet visible={visible} onClose={close} title="New exercise">
      <Field
        label="Name"
        value={name}
        onChangeText={(text) => {
          setName(text);
          setError(null);
        }}
        placeholder="e.g. Kettlebell swing"
        maxLength={40}
        error={error}
      />

      <View style={{ gap: 8 }}>
        <AppText size={13} weight="600" color={theme.muted}>
          Muscle group
        </AppText>
        <ChipRow>
          {MUSCLES.map((item) => (
            <Chip key={item} label={item} active={muscle === item} onPress={() => setMuscle(item)} />
          ))}
        </ChipRow>
      </View>

      <View style={{ gap: 8 }}>
        <AppText size={13} weight="600" color={theme.muted}>
          Equipment
        </AppText>
        <ChipRow>
          {EQUIPMENT.map((item) => (
            <Chip key={item} label={item} active={equipment === item} onPress={() => setEquipment(item)} />
          ))}
        </ChipRow>
      </View>

      <View style={{ gap: 8 }}>
        <AppText size={13} weight="600" color={theme.muted}>
          How you track it
        </AppText>
        <ChipRow>
          {KINDS.map((item) => (
            <Chip key={item.id} label={item.label} active={kind === item.id} onPress={() => setKind(item.id)} />
          ))}
        </ChipRow>
      </View>

      <AppButton title="Save exercise" onPress={save} />
    </Sheet>
  );
}

export default function LibraryScreen() {
  const { theme, allExercises, history, profile, deleteCustomExercise } = useApp();
  const [query, setQuery] = useState("");
  const [muscle, setMuscle] = useState("All");
  const [sheetOpen, setSheetOpen] = useState(false);

  const records = useMemo(() => {
    const map = {};
    personalRecords(history).forEach((r) => {
      map[r.name] = r;
    });
    return map;
  }, [history]);

  const filtered = allExercises.filter(
    (item) =>
      (muscle === "All" || item.muscle === muscle) &&
      item.name.toLowerCase().includes(query.trim().toLowerCase())
  );

  function confirmDelete(item) {
    Alert.alert(`Delete "${item.name}"?`, "Plans that already use it keep their copy.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteCustomExercise(item.id) },
    ]);
  }

  return (
    <Screen>
      <View style={{ gap: 4 }}>
        <AppText size={28} weight="800">
          Exercise library
        </AppText>
        <AppText color={theme.muted}>
          {allExercises.length} exercises across {MUSCLES.length} muscle groups.
        </AppText>
      </View>

      <SearchField value={query} onChangeText={setQuery} placeholder="Search exercises" />

      <ChipRow scroll>
        {["All", ...MUSCLES].map((name) => (
          <Chip key={name} label={name} active={muscle === name} onPress={() => setMuscle(name)} />
        ))}
      </ChipRow>

      <AppButton
        title="Add your own exercise"
        icon="add"
        variant="soft"
        onPress={() => setSheetOpen(true)}
      />

      {filtered.map((item) => {
        const record = records[item.name];

        return (
          <Card key={item.id} style={{ gap: 8 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <View style={{ flex: 1, gap: 8 }}>
                <AppText size={16} weight="700">
                  {item.name}
                </AppText>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                  <Tag label={item.muscle} />
                  <Tag label={item.equipment} />
                  {item.custom ? <Tag label="Custom" color={theme.primary} /> : null}
                </View>
              </View>

              {item.custom ? (
                <IconButton
                  name="trash-outline"
                  color={theme.danger}
                  onPress={() => confirmDelete(item)}
                  label={`Delete ${item.name}`}
                />
              ) : null}
            </View>

            {record ? (
              <AppText size={12} color={theme.primary} weight="600">
                Your best: {record.weight} {profile.unit || "kg"} x {record.reps}
              </AppText>
            ) : null}
          </Card>
        );
      })}

      {filtered.length === 0 ? (
        <EmptyState
          icon="search"
          title="No matching exercises"
          message="Try another search, or add your own."
        />
      ) : null}

      <NewExerciseSheet visible={sheetOpen} onClose={() => setSheetOpen(false)} />
    </Screen>
  );
}