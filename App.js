import React from "react";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AppProvider, useApp } from "./src/context/AppContext";
import AppNavigator from "./src/navigation/AppNavigator";
import AnimatedSplash from "./src/components/AnimatedSplash";

// Keep the native splash up until our animated splash is on screen
SplashScreen.preventAutoHideAsync().catch(() => {});

function AppContent() {
  const { themeMode, ready } = useApp();

  return (
    <AnimatedSplash ready={ready}>
      <StatusBar style={themeMode === "dark" ? "light" : "dark"} />
      <AppNavigator />
    </AnimatedSplash>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </SafeAreaProvider>
  );
}