
import React from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "../src/context/ThemeContext";

export default function ProfileScreen() {
  const { theme, mode, toggleTheme } = useAppTheme();

  const settings = [
    {
      icon: "person-outline",
      title: "Personal information",
      subtitle: "Manage your fitness profile",
    },
    {
      icon: "notifications-outline",
      title: "Notifications",
      subtitle: "Workout reminders and updates",
    },
    {
      icon: "scale-outline",
      title: "Measurement units",
      subtitle: "Metric (kg, km)",
    },
    {
      icon: "shield-checkmark-outline",
      title: "Privacy and security",
      subtitle: "Account and data protection",
    },
  ];

  return (
    <ScrollView
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={styles.container}
    >
      <Text style={[styles.heading, { color: theme.text }]}>
        My profile
      </Text>
      <Text style={{ color: theme.secondaryText, marginTop: 6 }}>
        Manage your account and preferences.
      </Text>

      <View
        style={[
          styles.profileCard,
          {
            backgroundColor: theme.card,
            borderColor: theme.border,
          },
        ]}
      >
        <View
          style={[
            styles.avatar,
            { backgroundColor: theme.primaryLight },
          ]}
        >
          <Ionicons name="person" size={36} color={theme.primary} />
        </View>

        <Text style={[styles.name, { color: theme.text }]}>
          Fitness Member
        </Text>
        <Text style={{ color: theme.secondaryText, marginTop: 5 }}>
          Individual account
        </Text>

        <View
          style={[
            styles.levelBadge,
            { backgroundColor: theme.primaryLight },
          ]}
        >
          <Text style={{ color: theme.primary, fontWeight: "700" }}>
            Fitness journey started
          </Text>
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: theme.text }]}>
        Appearance
      </Text>

      <View
        style={[
          styles.settingRow,
          {
            backgroundColor: theme.card,
            borderColor: theme.border,
          },
        ]}
      >
        <View
          style={[
            styles.settingIcon,
            { backgroundColor: theme.primaryLight },
          ]}
        >
          <Ionicons
            name={mode === "dark" ? "moon-outline" : "sunny-outline"}
            size={22}
            color={theme.primary}
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={[styles.settingTitle, { color: theme.text }]}>
            Dark mode
          </Text>
          <Text style={{ color: theme.secondaryText, fontSize: 12 }}>
            Switch the app's appearance
          </Text>
        </View>

        <Switch
          value={mode === "dark"}
          onValueChange={toggleTheme}
          trackColor={{
            false: theme.border,
            true: theme.primary,
          }}
          thumbColor="#FFFFFF"
          accessibilityLabel="Toggle dark mode"
        />
      </View>

      <Text style={[styles.sectionTitle, { color: theme.text }]}>
        Account settings
      </Text>

      {settings.map((item) => (
        <Pressable
          key={item.title}
          onPress={() => {
            // These settings screens will be implemented in later phases.
          }}
          style={[
            styles.settingRow,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
            },
          ]}
        >
          <View
            style={[
              styles.settingIcon,
              { backgroundColor: theme.primaryLight },
            ]}
          >
            <Ionicons
              name={item.icon}
              size={22}
              color={theme.primary}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={[styles.settingTitle, { color: theme.text }]}>
              {item.title}
            </Text>
            <Text style={{ color: theme.secondaryText, fontSize: 12 }}>
              {item.subtitle}
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={19}
            color={theme.secondaryText}
          />
        </Pressable>
      ))}

      <View style={styles.footer}>
        <Ionicons name="fitness-outline" size={24} color={theme.primary} />
        <Text style={[styles.brand, { color: theme.text }]}>
          FitTrack
        </Text>
        <Text style={{ color: theme.secondaryText, fontSize: 12 }}>
          Your fitness journey, tracked.
        </Text>
        <Text style={{ color: theme.secondaryText, fontSize: 11, marginTop: 9 }}>
          Version 1.0.0 · Development
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 18,
    paddingTop: 58,
    paddingBottom: 35,
  },
  heading: {
    fontSize: 27,
    fontWeight: "800",
  },
  profileCard: {
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 21,
    padding: 24,
    marginTop: 24,
    marginBottom: 27,
  },
  avatar: {
    width: 82,
    height: 82,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  name: {
    fontSize: 20,
    fontWeight: "800",
  },
  levelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 13,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 16,
    padding: 13,
    gap: 12,
    marginBottom: 10,
  },
  settingIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  settingTitle: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 4,
  },
  footer: {
    alignItems: "center",
    marginTop: 35,
    gap: 7,
  },
  brand: {
    fontSize: 17,
    fontWeight: "800",
  },
});
