import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useApp } from "../context/AppContext";
import {
  Screen,
  AppText,
  AppButton,
  Card,
  Tag,
  StatCard,
  SectionHeader,
  ProgressBar,
  EmptyState,
} from "../components/UI";
import BarChart from "../components/BarChart";
import {
  QUOTES,
  computeStreak,
  estimateMinutes,
  greeting,
  lastSevenDays,
  relativeDay,
  workoutsThisWeek,
} from "../utils";

export default function HomeScreen({ navigation }) {
  const { theme, profile, plans, history } = useApp();

  const completed = history.filter((item) => item.completed);
  const week = workoutsThisWeek(completed);
  const weekMinutes = week.reduce((sum, item) => sum + Number(item.duration || 0), 0);
  const streak = computeStreak(completed);
  const days = lastSevenDays(completed);
  const trainedToday = days[days.length - 1].count > 0;

  const goal = Math.max(1, Number(profile.weeklyGoal) || 1);
  const remaining = Math.max(0, goal - week.length);

  // Suggest something different from the most recent session
  const lastTitle = completed[0] ? completed[0].title : null;
  const featured = plans.find((plan) => plan.title !== lastTitle) || plans[0];

  const quote = QUOTES[new Date().getDate() % QUOTES.length];
  const firstName = (profile.name || "there").split(" ")[0];

  return (
    <Screen>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1, gap: 4 }}>
          <AppText color={theme.muted}>{greeting()}</AppText>
          <AppText size={28} weight="800">
            {firstName}
          </AppText>
        </View>

        <Pressable
          onPress={() => navigation.navigate("Profile")}
          style={[styles.avatar, { backgroundColor: theme.primarySoft }]}
          accessibilityLabel="Open profile"
        >
          <AppText size={20} weight="800" color={theme.primary}>
            {firstName.charAt(0).toUpperCase()}
          </AppText>
        </Pressable>
      </View>

      {/* Hero */}
      <Card style={[styles.hero, { backgroundColor: theme.surfaceAlt, borderColor: theme.primary }]}>
        <View style={{ gap: 6 }}>
          <AppText size={24} weight="800">
            {trainedToday ? "You trained today." : "Ready to move?"}
          </AppText>
          <AppText color={theme.muted}>
            {trainedToday
              ? "Great work. Rest up, or add a bonus session."
              : quote}
          </AppText>
        </View>

        <View style={{ gap: 10 }}>
          <AppButton
            title={trainedToday ? "Start another workout" : "Start a quick workout"}
            icon="play"
            onPress={() => navigation.navigate("Workout")}
          />
          <AppButton
            title="Choose a plan"
            variant="outline"
            onPress={() => navigation.navigate("Plans")}
          />
        </View>
      </Card>

      {/* Stats */}
      <View style={styles.stats}>
        <StatCard
          label="Day streak"
          value={`${streak}`}
          icon="flame-outline"
        />
        <StatCard
          label="Minutes this week"
          value={`${weekMinutes}`}
          icon="time-outline"
        />
      </View>

      {/* Weekly goal */}
      <View style={{ gap: 12 }}>
        <SectionHeader title="Weekly goal" />
        <Card>
          <View style={styles.rowBetween}>
            <AppText color={theme.muted}>Workouts this week</AppText>
            <AppText weight="800">
              {week.length} of {goal}
            </AppText>
          </View>
          <ProgressBar progress={week.length / goal} />
          <AppText color={theme.muted} size={12}>
            {remaining === 0
              ? "Goal reached. Anything extra is a bonus."
              : `${remaining} more ${remaining === 1 ? "workout" : "workouts"} to hit your goal.`}
          </AppText>
        </Card>
      </View>

      {/* Last 7 days */}
      <View style={{ gap: 12 }}>
        <SectionHeader title="Last 7 days" />
        <Card>
          <BarChart data={days} valueSuffix="m" />
        </Card>
      </View>

      {/* Recommended plan */}
      <View style={{ gap: 12 }}>
        <SectionHeader
          title="Up next"
          action="All plans"
          onAction={() => navigation.navigate("Plans")}
        />

        {featured ? (
          <Card>
            <View style={styles.planRow}>
              <View style={[styles.planIcon, { backgroundColor: theme.primarySoft }]}>
                <Ionicons name="barbell-outline" size={26} color={theme.primary} />
              </View>

              <View style={{ flex: 1, gap: 6 }}>
                <AppText weight="700" size={17}>
                  {featured.title}
                </AppText>
                <View style={styles.tags}>
                  <Tag label={featured.category} />
                  <Tag label={`${estimateMinutes(featured)} min`} icon="time-outline" />
                  <Tag label={`${featured.exercises.length} exercises`} />
                </View>
              </View>
            </View>

            <AppButton
              title="Start this plan"
              variant="soft"
              icon="play"
              onPress={() => navigation.navigate("Workout", { planId: featured.id })}
            />
          </Card>
        ) : (
          <Card>
            <EmptyState
              title="No plans yet"
              message="Create a plan to see it here."
              actionTitle="Create a plan"
              onAction={() => navigation.navigate("PlanEditor")}
            />
          </Card>
        )}
      </View>

      {/* Recent activity */}
      <View style={{ gap: 12 }}>
        <SectionHeader
          title="Recent activity"
          action={history.length ? "See all" : undefined}
          onAction={() => navigation.navigate("History")}
        />

        {history.slice(0, 3).map((item) => (
          <Card
            key={item.id}
            style={styles.activityRow}
            onPress={() => navigation.navigate("HistoryDetail", { id: item.id })}
          >
            <Ionicons name="checkmark-circle" size={24} color={theme.primary} />

            <View style={{ flex: 1, gap: 3 }}>
              <AppText weight="700">{item.title}</AppText>
              <AppText color={theme.muted} size={12}>
                {relativeDay(item.date)}
              </AppText>
            </View>

            <AppText color={theme.muted}>{item.duration} min</AppText>
          </Card>
        ))}

        {history.length === 0 ? (
          <Card>
            <EmptyState
              icon="calendar-outline"
              title="Nothing logged yet"
              message="Finish your first workout and it will show up here."
            />
          </Card>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  hero: { padding: 20, gap: 20 },
  stats: { flexDirection: "row", gap: 12 },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  planRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  planIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  activityRow: { flexDirection: "row", alignItems: "center", gap: 12 },
});