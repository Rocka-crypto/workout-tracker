import React from "react";
import { Alert, View } from "react-native";

import { useApp } from "../context/AppContext";
import {
  AppButton,
  AppText,
  Card,
  Chip,
  ChipRow,
  Field,
  Screen,
  Stepper,
} from "../components/UI";
import Logo from "../components/Logo";
import { BRAND } from "../theme";
import { GOALS, LEVELS } from "../data/exercises";

export default function ProfileScreen() {
  const {
    theme,
    themeMode,
    toggleTheme,
    role,
    setRole,
    profile,
    updateProfile,
    resetDemoData,
  } = useApp();

  const isTrainer = role === "trainer";

  function confirmReset() {
    Alert.alert(
      "Reset demo data?",
      "This restores the sample plans, history and clients, and removes your custom exercises. Your name and settings return to defaults too.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Reset", style: "destructive", onPress: resetDemoData },
      ]
    );
  }

  return (
    <Screen>
      <AppText size={28} weight="800">
        Profile and settings
      </AppText>

      <Card style={{ alignItems: "center", paddingVertical: 24, gap: 6 }}>
        <View
          style={{
            width: 76,
            height: 76,
            borderRadius: 26,
            backgroundColor: theme.primarySoft,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 6,
          }}
        >
          <AppText size={32} weight="800" color={theme.primary}>
            {(profile.name || "?").charAt(0).toUpperCase()}
          </AppText>
        </View>
        <AppText size={21} weight="800">
          {profile.name || "Your name"}
        </AppText>
        <AppText color={theme.muted}>
          {isTrainer ? "Trainer mode" : profile.goal}
        </AppText>
      </Card>

      <Card style={{ gap: 14 }}>
        <AppText size={17} weight="700">
          About you
        </AppText>

        <Field
          label="Name"
          value={profile.name}
          onChangeText={(name) => updateProfile({ name })}
          placeholder="Your name"
          maxLength={30}
        />

        {!isTrainer ? (
          <>
            <View style={{ gap: 8 }}>
              <AppText size={13} weight="600" color={theme.muted}>
                Goal
              </AppText>
              <ChipRow>
                {GOALS.map((goal) => (
                  <Chip
                    key={goal}
                    label={goal}
                    active={profile.goal === goal}
                    onPress={() => updateProfile({ goal })}
                  />
                ))}
              </ChipRow>
            </View>

            <View style={{ gap: 8 }}>
              <AppText size={13} weight="600" color={theme.muted}>
                Experience
              </AppText>
              <ChipRow>
                {LEVELS.map((level) => (
                  <Chip
                    key={level}
                    label={level}
                    active={profile.level === level}
                    onPress={() => updateProfile({ level })}
                  />
                ))}
              </ChipRow>
            </View>

            <Stepper
              label="Weekly workout goal"
              value={Number(profile.weeklyGoal) || 1}
              min={1}
              max={7}
              onChange={(weeklyGoal) => updateProfile({ weeklyGoal })}
            />
          </>
        ) : null}
      </Card>

      {!isTrainer ? (
        <Card style={{ gap: 14 }}>
          <AppText size={17} weight="700">
            Workout preferences
          </AppText>

          <Stepper
            label="Rest timer (0 turns it off)"
            value={Number(profile.restSeconds) || 0}
            min={0}
            max={300}
            step={15}
            suffix="s"
            onChange={(restSeconds) => updateProfile({ restSeconds })}
          />

          <View style={{ gap: 8 }}>
            <AppText size={13} weight="600" color={theme.muted}>
              Weight unit
            </AppText>
            <ChipRow>
              {["kg", "lb"].map((unit) => (
                <Chip
                  key={unit}
                  label={unit}
                  active={(profile.unit || "kg") === unit}
                  onPress={() => updateProfile({ unit })}
                />
              ))}
            </ChipRow>
            <AppText size={12} color={theme.muted}>
              Switching units changes labels only. Existing entries aren't converted.
            </AppText>
          </View>
        </Card>
      ) : null}

      <Card>
        <AppText size={17} weight="700">
          Appearance
        </AppText>
        <AppButton
          title={`Switch to ${themeMode === "dark" ? "light" : "dark"} mode`}
          icon={themeMode === "dark" ? "sunny-outline" : "moon-outline"}
          variant="outline"
          onPress={toggleTheme}
        />
      </Card>

      <Card>
        <AppText size={17} weight="700">
          App mode
        </AppText>
        <AppText color={theme.muted}>
          You're using {BRAND.name} as {isTrainer ? "a trainer" : "an individual"}.
        </AppText>
        <AppButton
          title="Change mode"
          icon="swap-horizontal"
          variant="outline"
          onPress={() => setRole(null)}
        />
      </Card>

      <Card>
        <AppText size={17} weight="700">
          Demo data
        </AppText>
        <AppText color={theme.muted}>
          Restore the original sample plans, workout history and clients.
        </AppText>
        <AppButton title="Reset app data" variant="danger" onPress={confirmReset} />
      </Card>

      <View style={{ alignItems: "center", gap: 8, paddingTop: 8 }}>
        <Logo size={36} />
        <AppText color={theme.muted} size={12} align="center">
          {BRAND.name} 1.0. Everything is stored on this device, with no account or sync.
        </AppText>
      </View>
    </Screen>
  );
}