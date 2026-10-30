import React from "react";
import { View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useApp } from "../context/AppContext";
import { Screen, AppText } from "../components/UI";
import Logo from "../components/Logo";
import { BRAND, radius } from "../theme";
import { tap } from "../utils";

function RoleOption({ icon, title, message, onPress }) {
  const { theme } = useApp();

  return (
    <Pressable
      onPress={() => {
        tap();
        onPress();
      }}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
        padding: 18,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: theme.border,
        backgroundColor: theme.surface,
        opacity: pressed ? 0.8 : 1,
      })}
    >
      <View
        style={{
          width: 52,
          height: 52,
          borderRadius: 16,
          backgroundColor: theme.primarySoft,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name={icon} size={26} color={theme.primary} />
      </View>

      <View style={{ flex: 1, gap: 3 }}>
        <AppText size={18} weight="700">
          {title}
        </AppText>
        <AppText color={theme.muted}>{message}</AppText>
      </View>

      <Ionicons name="chevron-forward" size={20} color={theme.muted} />
    </Pressable>
  );
}

export default function RoleSelectScreen() {
  const { theme, setRole } = useApp();

  return (
    <Screen style={{ flexGrow: 1, justifyContent: "center", gap: 28 }}>
      <View style={{ gap: 18 }}>
        <Logo size={64} />

        <View style={{ gap: 8 }}>
          <AppText size={34} weight="800">
            Welcome to {BRAND.name}.
          </AppText>
          <AppText color={theme.muted} size={16}>
            How would you like to use the app? You can switch any time from
            your profile.
          </AppText>
        </View>
      </View>

      <View style={{ gap: 12 }}>
        <RoleOption
          icon="fitness"
          title="Train myself"
          message="Log workouts, build routines and watch your progress."
          onPress={() => setRole("individual")}
        />
        <RoleOption
          icon="people"
          title="Coach clients"
          message="Manage clients and assign them workout plans."
          onPress={() => setRole("trainer")}
        />
      </View>
    </Screen>
  );
}