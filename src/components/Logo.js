import React from "react";
import { View } from "react-native";

import { BRAND } from "../theme";

// The Forma mark: a dumbbell on a green tile. Drawn with plain Views so it
// needs no image or SVG dependency. Proportions match assets/icon.png.
export default function Logo({
  size = 96,
  background = BRAND.green,
  ink = BRAND.ink,
  tile = true,
}) {
  const S = size;

  const plate = (w, h) => ({
    width: w * S,
    height: h * S,
    borderRadius: 0.03 * S,
    backgroundColor: ink,
  });

  return (
    <View
      style={{
        width: S,
        height: S,
        borderRadius: tile ? S * 0.225 : 0,
        backgroundColor: tile ? background : "transparent",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 0.02 * S,
          transform: [{ rotate: "-45deg" }],
        }}
      >
        <View style={plate(0.07, 0.36)} />
        <View style={plate(0.08, 0.26)} />
        <View
          style={{
            width: 0.22 * S,
            height: 0.06 * S,
            borderRadius: 0.02 * S,
            backgroundColor: ink,
          }}
        />
        <View style={plate(0.08, 0.26)} />
        <View style={plate(0.07, 0.36)} />
      </View>
    </View>
  );
}