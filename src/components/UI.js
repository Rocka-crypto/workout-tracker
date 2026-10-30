import React from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "../context/AppContext";
import { radius } from "../theme";
import { tap } from "../utils";

/* ------------------------------------------------------------------ */
/* Layout                                                              */
/* ------------------------------------------------------------------ */

// inStack: screen sits under a navigation header (no top safe-area padding)
// footer:  content pinned to the bottom (e.g. a primary action)
export function Screen({
  children,
  scroll = true,
  inStack = false,
  style,
  footer,
}) {
  const { theme } = useApp();
  const insets = useSafeAreaInsets();

  const paddingTop = inStack ? 14 : insets.top + 14;
  const paddingBottom = inStack ? 32 + (footer ? 0 : insets.bottom) : 32;
  const content = [styles.screen, { paddingTop, paddingBottom }, style];

  const body = scroll ? (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={content}
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[{ flex: 1 }, content]}>{children}</View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {body}
      {footer ? (
        <View
          style={[
            styles.footer,
            {
              backgroundColor: theme.surface,
              borderTopColor: theme.border,
              paddingBottom: insets.bottom + 12,
            },
          ]}
        >
          {footer}
        </View>
      ) : null}
    </View>
  );
}

export function Card({ children, style, onPress, onLongPress }) {
  const { theme } = useApp();

  const cardStyle = [
    styles.card,
    { backgroundColor: theme.surface, borderColor: theme.border },
    style,
  ];

  if (onPress || onLongPress) {
    return (
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        style={({ pressed }) => [cardStyle, pressed && { opacity: 0.78 }]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}

export function SectionHeader({ title, action, onAction }) {
  const { theme } = useApp();

  return (
    <View style={styles.sectionHeader}>
      <AppText size={18} weight="700">
        {title}
      </AppText>

      {action ? (
        <Pressable onPress={onAction} hitSlop={10}>
          <AppText color={theme.primary} weight="600">
            {action}
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Text                                                                */
/* ------------------------------------------------------------------ */

export function AppText({
  children,
  size = 14,
  weight = "400",
  color,
  align,
  style,
  numberOfLines,
}) {
  const { theme } = useApp();

  return (
    <Text
      numberOfLines={numberOfLines}
      style={[
        {
          color: color || theme.text,
          fontSize: size,
          fontWeight: weight,
          textAlign: align,
          letterSpacing: size >= 24 ? -0.4 : 0,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

export function Tag({ label, icon, color }) {
  const { theme } = useApp();
  const tint = color || theme.muted;

  return (
    <View style={[styles.tag, { backgroundColor: theme.surfaceAlt }]}>
      {icon ? <Ionicons name={icon} size={12} color={tint} /> : null}
      <AppText size={12} weight="600" color={tint}>
        {label}
      </AppText>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Buttons                                                             */
/* ------------------------------------------------------------------ */

export function AppButton({
  title,
  onPress,
  variant = "primary", // primary | outline | danger | ghost | soft
  icon, // Ionicons name
  disabled = false,
  loading = false,
  small = false,
  style,
}) {
  const { theme } = useApp();

  const palette = {
    primary: { bg: theme.primary, fg: theme.onPrimary, border: theme.primary },
    danger: { bg: theme.danger, fg: "#FFFFFF", border: theme.danger },
    outline: { bg: "transparent", fg: theme.text, border: theme.border },
    ghost: { bg: "transparent", fg: theme.primary, border: "transparent" },
    soft: { bg: theme.primarySoft, fg: theme.primary, border: theme.primarySoft },
  }[variant];

  return (
    <Pressable
      disabled={disabled || loading}
      onPress={() => {
        tap();
        if (onPress) onPress();
      }}
      style={({ pressed }) => [
        styles.button,
        small && styles.buttonSmall,
        {
          backgroundColor: palette.bg,
          borderColor: palette.border,
          opacity: disabled ? 0.45 : pressed ? 0.8 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={palette.fg} />
      ) : (
        <View style={styles.buttonContent}>
          {icon ? (
            <Ionicons name={icon} size={small ? 16 : 19} color={palette.fg} />
          ) : null}
          <Text
            style={{
              color: palette.fg,
              fontWeight: "700",
              fontSize: small ? 13 : 15,
            }}
          >
            {title}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

export function IconButton({
  name,
  onPress,
  color,
  size = 22,
  style,
  disabled,
  label,
}) {
  const { theme } = useApp();

  return (
    <Pressable
      onPress={() => {
        tap();
        if (onPress) onPress();
      }}
      disabled={disabled}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.iconButton,
        { opacity: disabled ? 0.4 : pressed ? 0.6 : 1 },
        style,
      ]}
    >
      <Ionicons name={name} size={size} color={color || theme.muted} />
    </Pressable>
  );
}

export function Chip({ label, active, onPress, icon }) {
  const { theme } = useApp();

  return (
    <Pressable
      onPress={() => {
        tap();
        if (onPress) onPress();
      }}
      style={[
        styles.chip,
        {
          backgroundColor: active ? theme.primary : theme.surfaceAlt,
          borderColor: active ? theme.primary : theme.border,
        },
      ]}
    >
      {icon ? (
        <Ionicons
          name={icon}
          size={14}
          color={active ? theme.onPrimary : theme.muted}
        />
      ) : null}
      <AppText
        size={13}
        weight="600"
        color={active ? theme.onPrimary : theme.text}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

// scroll = single horizontal row, otherwise chips wrap onto new lines
export function ChipRow({ children, scroll = false }) {
  if (scroll) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    );
  }
  return <View style={[styles.chipRow, { flexWrap: "wrap" }]}>{children}</View>;
}

/* ------------------------------------------------------------------ */
/* Inputs                                                              */
/* ------------------------------------------------------------------ */

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  multiline = false,
  error,
  maxLength,
  autoFocus,
  style,
}) {
  const { theme } = useApp();

  return (
    <View style={{ gap: 6 }}>
      {label ? (
        <AppText size={13} weight="600" color={theme.muted}>
          {label}
        </AppText>
      ) : null}

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.muted}
        keyboardType={keyboardType}
        multiline={multiline}
        maxLength={maxLength}
        autoFocus={autoFocus}
        selectionColor={theme.primary}
        style={[
          styles.input,
          multiline && { minHeight: 90, textAlignVertical: "top" },
          {
            color: theme.text,
            backgroundColor: theme.surfaceAlt,
            borderColor: error ? theme.danger : theme.border,
          },
          style,
        ]}
      />

      {error ? (
        <AppText size={12} color={theme.danger}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

export function SearchField({ value, onChangeText, placeholder }) {
  const { theme } = useApp();

  return (
    <View
      style={[
        styles.search,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
    >
      <Ionicons name="search" size={18} color={theme.muted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.muted}
        selectionColor={theme.primary}
        style={{ flex: 1, color: theme.text, fontSize: 15, paddingVertical: 12 }}
      />
      {value ? (
        <IconButton name="close-circle" size={18} onPress={() => onChangeText("")} />
      ) : null}
    </View>
  );
}

export function Stepper({
  label,
  value,
  onChange,
  min = 0,
  max = 999,
  step = 1,
  suffix,
}) {
  const { theme } = useApp();
  const dec = () => onChange(Math.max(min, value - step));
  const inc = () => onChange(Math.min(max, value + step));

  return (
    <View style={styles.stepperRow}>
      <AppText color={theme.muted} size={13} weight="600" style={{ flex: 1 }}>
        {label}
      </AppText>

      <View
        style={[
          styles.stepper,
          { backgroundColor: theme.surfaceAlt, borderColor: theme.border },
        ]}
      >
        <IconButton
          name="remove"
          color={theme.text}
          size={18}
          onPress={dec}
          disabled={value <= min}
          label={`Decrease ${label}`}
        />
        <AppText weight="700" style={{ minWidth: 44, textAlign: "center" }}>
          {value}
          {suffix ? ` ${suffix}` : ""}
        </AppText>
        <IconButton
          name="add"
          color={theme.text}
          size={18}
          onPress={inc}
          disabled={value >= max}
          label={`Increase ${label}`}
        />
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Feedback & data display                                             */
/* ------------------------------------------------------------------ */

export function ProgressBar({ progress, height = 8 }) {
  const { theme } = useApp();
  const pct = Math.max(0, Math.min(1, progress || 0)) * 100;

  return (
    <View
      style={{
        height,
        borderRadius: height,
        overflow: "hidden",
        backgroundColor: theme.surfaceAlt,
      }}
    >
      <View
        style={{
          width: `${pct}%`,
          height: "100%",
          borderRadius: height,
          backgroundColor: theme.primary,
        }}
      />
    </View>
  );
}

export function StatCard({ label, value, icon, subtitle, style }) {
  const { theme } = useApp();

  return (
    <Card style={[styles.statCard, style]}>
      <View style={[styles.iconCircle, { backgroundColor: theme.primarySoft }]}>
        <Ionicons name={icon} size={20} color={theme.primary} />
      </View>

      <View>
        <AppText size={26} weight="800">
          {value}
        </AppText>
        <AppText color={theme.muted} size={12}>
          {label}
          {subtitle ? `, ${subtitle}` : ""}
        </AppText>
      </View>
    </Card>
  );
}

export function EmptyState({ icon = "barbell-outline", title, message, actionTitle, onAction }) {
  const { theme } = useApp();

  return (
    <View style={styles.empty}>
      <View style={[styles.emptyIcon, { backgroundColor: theme.surfaceAlt }]}>
        <Ionicons name={icon} size={30} color={theme.primary} />
      </View>
      <AppText size={17} weight="700" align="center">
        {title}
      </AppText>
      {message ? (
        <AppText color={theme.muted} align="center">
          {message}
        </AppText>
      ) : null}
      {actionTitle ? (
        <AppButton title={actionTitle} onPress={onAction} small style={{ marginTop: 6 }} />
      ) : null}
    </View>
  );
}

// Bottom sheet. tall = fixed 85% height with a flexible body (for lists).
export function Sheet({ visible, onClose, title, children, tall = false }) {
  const { theme } = useApp();
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View
          style={[
            styles.sheet,
            tall && { height: "85%" },
            { backgroundColor: theme.surface, paddingBottom: insets.bottom + 16 },
          ]}
        >
          <View style={styles.sheetHeader}>
            <AppText size={18} weight="800">
              {title}
            </AppText>
            <IconButton name="close" color={theme.text} onPress={onClose} label="Close" />
          </View>

          {tall ? (
            <View style={{ flex: 1, gap: 12 }}>{children}</View>
          ) : (
            <ScrollView
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ gap: 14 }}
              showsVerticalScrollIndicator={false}
            >
              {children}
            </ScrollView>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  screen: {
    paddingHorizontal: 20,
    gap: 18,
  },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 10,
  },
  card: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: 16,
    gap: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  button: {
    minHeight: 50,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonSmall: {
    minHeight: 38,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.sm,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipRow: {
    flexDirection: "row",
    gap: 8,
    paddingRight: 20,
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: 14,
  },
  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: radius.md,
  },
  statCard: {
    flex: 1,
    minWidth: 140,
    gap: 14,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  empty: {
    alignItems: "center",
    gap: 8,
    paddingVertical: 36,
    paddingHorizontal: 24,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  sheet: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: 20,
    paddingTop: 18,
    maxHeight: "92%",
    gap: 14,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});