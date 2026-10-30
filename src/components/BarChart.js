import React from "react";
import { View } from "react-native";

import { useApp } from "../context/AppContext";
import { AppText } from "./UI";

// data: [{ label, value, highlight }]
export default function BarChart({ data, height = 110, valueSuffix = "" }) {
  const { theme } = useApp();
  const max = Math.max(1, ...data.map((item) => item.value));

  return (
    <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 8 }}>
      {data.map((item, index) => {
        const barHeight =
          item.value > 0 ? Math.max(6, (item.value / max) * height) : 4;

        return (
          <View key={`${item.label}-${index}`} style={{ flex: 1, gap: 6 }}>
            <View style={{ height: height + 16, justifyContent: "flex-end" }}>
              {item.value > 0 ? (
                <AppText
                  size={10}
                  weight="700"
                  color={theme.muted}
                  align="center"
                  style={{ marginBottom: 3 }}
                >
                  {item.value}
                  {valueSuffix}
                </AppText>
              ) : null}
              <View
                style={{
                  height: barHeight,
                  borderRadius: 6,
                  backgroundColor:
                    item.value === 0
                      ? theme.surfaceAlt
                      : item.highlight
                        ? theme.primary
                        : theme.primaryDark,
                  opacity: item.value === 0 || item.highlight ? 1 : 0.65,
                }}
              />
            </View>
            <AppText
              size={11}
              align="center"
              weight={item.highlight ? "700" : "400"}
              color={item.highlight ? theme.text : theme.muted}
            >
              {item.label}
            </AppText>
          </View>
        );
      })}
    </View>
  );
}