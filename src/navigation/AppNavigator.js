import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import {
  NavigationContainer,
  DarkTheme,
  DefaultTheme,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import { useApp } from "../context/AppContext";
import { AppText } from "../components/UI";

import RoleSelectScreen from "../screens/RoleSelectScreen";
import HomeScreen from "../screens/HomeScreen";
import PlansScreen from "../screens/PlansScreen";
import PlanEditorScreen from "../screens/PlanEditorScreen";
import LibraryScreen from "../screens/LibraryScreen";
import ProgressScreen from "../screens/ProgressScreen";
import ProfileScreen from "../screens/ProfileScreen";
import WorkoutScreen from "../screens/WorkoutScreen";
import { HistoryScreen, HistoryDetailScreen } from "../screens/HistoryScreens";
import {
  TrainerDashboardScreen,
  ClientsScreen,
  ClientDetailScreen,
  ClientFormScreen,
} from "../screens/TrainerScreens";

const Root = createNativeStackNavigator();
const MemberStackNav = createNativeStackNavigator();
const TrainerStackNav = createNativeStackNavigator();
const MemberTabNav = createBottomTabNavigator();
const TrainerTabNav = createBottomTabNavigator();

/* ---------- Shared options ---------- */

function stackOptions(theme) {
  return {
    headerStyle: { backgroundColor: theme.background },
    headerTintColor: theme.text,
    headerTitleStyle: { fontWeight: "700" },
    headerShadowVisible: false,
    headerBackButtonDisplayMode: "minimal",
    contentStyle: { backgroundColor: theme.background },
  };
}

// icons: { RouteName: [focusedIcon, unfocusedIcon] }
function tabOptions(theme, icons) {
  return ({ route }) => ({
    headerShown: false,
    tabBarStyle: {
      backgroundColor: theme.tabBar,
      borderTopColor: theme.border,
    },
    tabBarActiveTintColor: theme.primary,
    tabBarInactiveTintColor: theme.muted,
    tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
    tabBarIcon: ({ color, size, focused }) => {
      const pair = icons[route.name] || ["ellipse", "ellipse-outline"];
      return <Ionicons name={focused ? pair[0] : pair[1]} color={color} size={size} />;
    },
  });
}

// Screens that both roles use (fragments are fine inside navigators)
function sharedScreens(Stack) {
  return (
    <>
      <Stack.Screen
        name="PlanEditor"
        component={PlanEditorScreen}
        options={({ route }) => ({
          title: route.params && route.params.planId ? "Edit plan" : "New plan",
        })}
      />
      <Stack.Screen name="History" component={HistoryScreen} options={{ title: "History" }} />
      <Stack.Screen
        name="HistoryDetail"
        component={HistoryDetailScreen}
        options={{ title: "Workout" }}
      />
    </>
  );
}

/* ---------- Individual ---------- */

function MemberTabs() {
  const { theme } = useApp();

  return (
    <MemberTabNav.Navigator
      screenOptions={tabOptions(theme, {
        Home: ["home", "home-outline"],
        Plans: ["albums", "albums-outline"],
        Library: ["library", "library-outline"],
        Progress: ["stats-chart", "stats-chart-outline"],
        Profile: ["person", "person-outline"],
      })}
    >
      <MemberTabNav.Screen name="Home" component={HomeScreen} />
      <MemberTabNav.Screen name="Plans" component={PlansScreen} />
      <MemberTabNav.Screen name="Library" component={LibraryScreen} />
      <MemberTabNav.Screen name="Progress" component={ProgressScreen} />
      <MemberTabNav.Screen name="Profile" component={ProfileScreen} />
    </MemberTabNav.Navigator>
  );
}

function MemberStack() {
  const { theme } = useApp();

  return (
    <MemberStackNav.Navigator screenOptions={stackOptions(theme)}>
      <MemberStackNav.Screen
        name="MemberTabs"
        component={MemberTabs}
        options={{ headerShown: false }}
      />
      <MemberStackNav.Screen
        name="Workout"
        component={WorkoutScreen}
        options={{ title: "Workout" }}
      />
      {sharedScreens(MemberStackNav)}
    </MemberStackNav.Navigator>
  );
}

/* ---------- Trainer ---------- */

function TrainerTabs() {
  const { theme } = useApp();

  return (
    <TrainerTabNav.Navigator
      screenOptions={tabOptions(theme, {
        Dashboard: ["grid", "grid-outline"],
        Clients: ["people", "people-outline"],
        Plans: ["albums", "albums-outline"],
        Profile: ["person", "person-outline"],
      })}
    >
      <TrainerTabNav.Screen name="Dashboard" component={TrainerDashboardScreen} />
      <TrainerTabNav.Screen name="Clients" component={ClientsScreen} />
      <TrainerTabNav.Screen name="Plans" component={PlansScreen} />
      <TrainerTabNav.Screen name="Profile" component={ProfileScreen} />
    </TrainerTabNav.Navigator>
  );
}

function TrainerStack() {
  const { theme } = useApp();

  return (
    <TrainerStackNav.Navigator screenOptions={stackOptions(theme)}>
      <TrainerStackNav.Screen
        name="TrainerTabs"
        component={TrainerTabs}
        options={{ headerShown: false }}
      />
      <TrainerStackNav.Screen
        name="ClientDetail"
        component={ClientDetailScreen}
        options={{ title: "Client" }}
      />
      <TrainerStackNav.Screen
        name="ClientForm"
        component={ClientFormScreen}
        options={({ route }) => ({
          title: route.params && route.params.clientId ? "Edit client" : "New client",
        })}
      />
      {sharedScreens(TrainerStackNav)}
    </TrainerStackNav.Navigator>
  );
}

/* ---------- Root ---------- */

export default function AppNavigator() {
  const { theme, themeMode, ready, role } = useApp();

  if (!ready) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <AppText>Loading your workouts...</AppText>
      </View>
    );
  }

  const base = themeMode === "dark" ? DarkTheme : DefaultTheme;

  return (
    <NavigationContainer
      theme={{
        ...base,
        colors: {
          ...base.colors,
          primary: theme.primary,
          background: theme.background,
          card: theme.surface,
          text: theme.text,
          border: theme.border,
        },
      }}
    >
      {/*
        The visible stack is driven entirely by `role`, so switching modes
        swaps screens automatically. No manual navigate()/replace() is needed.
      */}
      <Root.Navigator screenOptions={{ headerShown: false }}>
        {role === null ? (
          <Root.Screen name="RoleSelect" component={RoleSelectScreen} />
        ) : role === "trainer" ? (
          <Root.Screen name="TrainerApp" component={TrainerStack} />
        ) : (
          <Root.Screen name="MemberApp" component={MemberStack} />
        )}
      </Root.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
  },
});