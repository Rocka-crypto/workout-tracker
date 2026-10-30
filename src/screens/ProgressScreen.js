import React from "react";
import { View } from "react-native";

import { useApp } from "../context/AppContext";
import {
  AppButton,
  AppText,
  Card,
  EmptyState,
  ProgressBar,
  Screen,
  SectionHeader,
  StatCard,
} from "../components/UI";
import BarChart from "../components/BarChart";
import {
  computeStreak,
  lastSevenDays,
  lastWeeks,
  personalRecords,
  relativeDay,
  workoutsThisWeek,
} from "../utils";

export default function ProgressScreen({ navigation }) {
  const { theme, history, profile } = useApp();

  const completed = history.filter((item) => item.completed);
  const minutes = completed.reduce((sum, item) => sum + Number(item.duration || 0), 0);
  const volume = completed.reduce((sum, item) => sum + Number(item.volume || 0), 0);
  const streak = computeStreak(completed);
  const week = workoutsThisWeek(completed);
  const goal = Math.max(1, Number(profile.weeklyGoal) || 1);
  const unit = profile.unit || "kg";
  const records = personalRecords(completed).slice(0, 5);

  return (
    <Screen>
      <View style={{ gap: 4 }}>
        <AppText size={28} weight="800">
          Your progress
        </AppText>
        <AppText color={theme.muted}>Built from the workouts you've logged.</AppText>
      </View>

      {completed.length === 0 ? (
        <Card>
          <EmptyState
            icon="stats-chart-outline"
            title="No data yet"
            message="Finish a workout and your stats, streaks and records will appear here."
            actionTitle="Start a workout"
            onAction={() => navigation.navigate("Workout")}
          />
        </Card>
      ) : (
        <>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <StatCard label="Workouts" value={`${completed.length}`} icon="checkmark-done-outline" />
            <StatCard label="Day streak" value={`${streak}`} icon="flame-outline" />
          </View>

          <View style={{ flexDirection: "row", gap: 12 }}>
            <StatCard label="Minutes trained" value={minutes.toLocaleString()} icon="time-outline" />
            <StatCard
              label={`Volume (${unit})`}
              value={volume.toLocaleString()}
              icon="barbell-outline"
            />
          </View>

          <Card>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <AppText color={theme.muted}>This week's goal</AppText>
              <AppText weight="800">
                {week.length} of {goal}
              </AppText>
            </View>
            <ProgressBar progress={week.length / goal} />
          </Card>

          <View style={{ gap: 12 }}>
            <SectionHeader title="Minutes per day" />
            <Card>
              <BarChart data={lastSevenDays(completed)} valueSuffix="m" />
            </Card>
          </View>

          <View style={{ gap: 12 }}>
            <SectionHeader title="Workouts per week" />
            <Card>
              <BarChart data={lastWeeks(completed, 8)} height={90} />
            </Card>
          </View>

          <View style={{ gap: 12 }}>
            <SectionHeader title="Personal records" />
            {records.length === 0 ? (
              <Card>
                <AppText color={theme.muted}>
                  Log weights on lifts like bench press or squats and your best sets show up here.
                </AppText>
              </Card>
            ) : (
              <Card style={{ gap: 14 }}>
                {records.map((record) => (
                  <View
                    key={record.name}
                    style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
                  >
                    <View style={{ flex: 1, gap: 2 }}>
                      <AppText weight="700">{record.name}</AppText>
                      <AppText size={12} color={theme.muted}>
                        {relativeDay(record.date)}
                      </AppText>
                    </View>
                    <AppText weight="800" color={theme.primary}>
                      {record.weight} {unit} x {record.reps}
                    </AppText>
                  </View>
                ))}
              </Card>
            )}
          </View>

          <View style={{ gap: 12 }}>
            <SectionHeader
              title="Recent workouts"
              action="See all"
              onAction={() => navigation.navigate("History")}
            />
            {completed.slice(0, 3).map((item) => (
              <Card
                key={item.id}
                onPress={() => navigation.navigate("HistoryDetail", { id: item.id })}
              >
                <AppText weight="700">{item.title}</AppText>
                <AppText color={theme.muted} size={12}>
                  {relativeDay(item.date)}, {item.duration} min
                </AppText>
              </Card>
            ))}
          </View>

          <AppButton
            title="View full history"
            variant="outline"
            onPress={() => navigation.navigate("History")}
          />
        </>
      )}
    </Screen>
  );
}