import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import * as SplashScreen from "expo-splash-screen";

import Logo from "./Logo";
import { BRAND } from "../theme";

const MIN_VISIBLE_MS = 1700;

// Draws the branded launch animation on top of the app until the saved data
// has loaded (and the animation has had time to play), then fades away.
// The native splash uses the same background + logo, so the hand-off is seamless.
export default function AnimatedSplash({ ready, children }) {
  const [done, setDone] = useState(false);
  const [minTimePassed, setMinTimePassed] = useState(false);

  const logoScale = useRef(new Animated.Value(0.82)).current;
  const logoTilt = useRef(new Animated.Value(0)).current;
  const wordOpacity = useRef(new Animated.Value(0)).current;
  const wordShift = useRef(new Animated.Value(10)).current;
  const overlayOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 6,
        tension: 70,
        useNativeDriver: true,
      }),
      Animated.timing(logoTilt, {
        toValue: 1,
        duration: 900,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(350),
        Animated.parallel([
          Animated.timing(wordOpacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(wordShift, {
            toValue: 0,
            duration: 500,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start();

    const timer = setTimeout(() => setMinTimePassed(true), MIN_VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [logoScale, logoTilt, wordOpacity, wordShift]);

  useEffect(() => {
    if (ready && minTimePassed) {
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 380,
        useNativeDriver: true,
      }).start(() => setDone(true));
    }
  }, [ready, minTimePassed, overlayOpacity]);

  function hideNativeSplash() {
    SplashScreen.hideAsync().catch(() => {});
  }

  const tilt = logoTilt.interpolate({
    inputRange: [0, 1],
    outputRange: ["-14deg", "0deg"],
  });

  return (
    <View style={{ flex: 1 }}>
      {children}

      {!done ? (
        <Animated.View
          pointerEvents="auto"
          onLayout={hideNativeSplash}
          style={[styles.overlay, { opacity: overlayOpacity }]}
        >
          <Animated.View
            style={{ transform: [{ scale: logoScale }, { rotate: tilt }] }}
          >
            <Logo size={160} />
          </Animated.View>

          <Animated.View
            style={{
              alignItems: "center",
              gap: 6,
              opacity: wordOpacity,
              transform: [{ translateY: wordShift }],
            }}
          >
            <Text style={styles.name}>{BRAND.name}</Text>
            <Text style={styles.tagline}>{BRAND.tagline}</Text>
          </Animated.View>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: BRAND.splashBackground,
    alignItems: "center",
    justifyContent: "center",
    gap: 28,
    zIndex: 100,
  },
  name: {
    color: "#F4F7F4",
    fontSize: 40,
    fontWeight: "800",
    letterSpacing: -1,
  },
  tagline: {
    color: "#9AA79E",
    fontSize: 15,
    letterSpacing: 0.3,
  },
});