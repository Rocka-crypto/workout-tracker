import React, { useState } from "react";
import { Alert, Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useApp } from "../context/AppContext";
import {
  AppButton,
  AppText,
  Card,
  Chip,
  ChipRow,
  EmptyState,
  Field,
  Screen,
  SearchField,
  SectionHeader,
  StatCard,
  Tag,
} from "../components/UI";
import { GOALS, LEVELS } from "../data/exercises";
import { estimateMinutes, greeting, relativeDay, success, tap, workoutsThisWeek } from "../utils";

function Avatar({ name, size = 46 }) {
  const { theme } = useApp();
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.35,
        backgroundColor: theme.primarySoft,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <AppText size={size * 0.42} weight="800" color={theme.primary}>
        {(name || "?").charAt(0).toUpperCase()}
      </AppText>
    </View>
  );
}

/* ------------------------------------------------------------------ */

export function TrainerDashboardScreen({ navigation }) {
  const { theme, profile, clients, plans, history } = useApp();

  const unassigned = clients.filter((client) => !client.planId);
  const thisWeek = workoutsThisWeek(history);

  return (
    <Screen>
      <View style={{ gap: 4 }}>
        <AppText color={theme.muted}>{greeting()}</AppText>
        <AppText size={28} weight="800">
          Coach {(profile.name || "").split(" ")[0] || "dashboard"}
        </AppText>
      </View>

      <View style={{ flexDirection: "row", gap: 12 }}>
        <StatCard label="Clients" value={`${clients.length}`} icon="people-outline" />
        <StatCard label="Plans" value={`${plans.length}`} icon="barbell-outline" />
      </View>

      <View style={{ flexDirection: "row", gap: 12 }}>
        <StatCard label="Sessions this week" value={`${thisWeek.length}`} icon="checkmark-done-outline" />
        <StatCard label="Need a plan" value={`${unassigned.length}`} icon="alert-circle-outline" />
      </View>

      {unassigned.length > 0 ? (
        <View style={{ gap: 12 }}>
          <SectionHeader title="Waiting for a plan" />
          {unassigned.map((client) => (
            <Card
              key={client.id}
              style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
              onPress={() => navigation.navigate("ClientDetail", { clientId: client.id })}
            >
              <Avatar name={client.name} />
              <View style={{ flex: 1, gap: 2 }}>
                <AppText weight="700">{client.name}</AppText>
                <AppText size={12} color={theme.muted}>
                  {client.goal}
                </AppText>
              </View>
              <AppButton
                title="Assign"
                small
                variant="soft"
                onPress={() => navigation.navigate("ClientDetail", { clientId: client.id })}
              />
            </Card>
          ))}
        </View>
      ) : null}

      <Card style={{ gap: 12 }}>
        <AppText size={17} weight="700">
          Quick actions
        </AppText>
        <AppButton
          title="Add a client"
          icon="person-add-outline"
          onPress={() => navigation.navigate("ClientForm")}
        />
        <AppButton
          title="Build a plan"
          icon="create-outline"
          variant="outline"
          onPress={() => navigation.navigate("PlanEditor")}
        />
        <AppButton
          title="Review workout history"
          icon="time-outline"
          variant="outline"
          onPress={() => navigation.navigate("History")}
        />
      </Card>

      <View style={{ gap: 12 }}>
        <SectionHeader
          title="Recent sessions"
          action={history.length ? "See all" : undefined}
          onAction={() => navigation.navigate("History")}
        />
        {history.slice(0, 3).map((item) => (
          <Card
            key={item.id}
            onPress={() => navigation.navigate("HistoryDetail", { id: item.id })}
            style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
          >
            <Ionicons name="checkmark-circle" size={24} color={theme.primary} />
            <View style={{ flex: 1, gap: 2 }}>
              <AppText weight="700">{item.title}</AppText>
              <AppText size={12} color={theme.muted}>
                {relativeDay(item.date)}
              </AppText>
            </View>
            <AppText color={theme.muted}>{item.duration} min</AppText>
          </Card>
        ))}
        {history.length === 0 ? (
          <AppText color={theme.muted}>No sessions recorded yet.</AppText>
        ) : null}
      </View>
    </Screen>
  );
}

/* ------------------------------------------------------------------ */

export function ClientsScreen({ navigation }) {
  const { theme, clients, plans } = useApp();
  const [query, setQuery] = useState("");

  const filtered = clients.filter((client) =>
    client.name.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <Screen>
      <View style={{ gap: 4 }}>
        <AppText size={28} weight="800">
          Clients
        </AppText>
        <AppText color={theme.muted}>
          {clients.length} {clients.length === 1 ? "client" : "clients"} in your roster.
        </AppText>
      </View>

      <AppButton
        title="Add a client"
        icon="person-add-outline"
        onPress={() => navigation.navigate("ClientForm")}
      />

      {clients.length > 0 ? (
        <SearchField value={query} onChangeText={setQuery} placeholder="Search clients" />
      ) : null}

      {filtered.map((client) => {
        const plan = plans.find((item) => item.id === client.planId);

        return (
          <Card
            key={client.id}
            style={{ flexDirection: "row", alignItems: "center", gap: 14 }}
            onPress={() => navigation.navigate("ClientDetail", { clientId: client.id })}
          >
            <Avatar name={client.name} />
            <View style={{ flex: 1, gap: 6 }}>
              <AppText size={17} weight="700">
                {client.name}
              </AppText>
              <AppText size={12} color={theme.muted}>
                {client.goal}, {client.level}
              </AppText>
              <View style={{ flexDirection: "row" }}>
                <Tag
                  label={plan ? plan.title : "No plan assigned"}
                  icon={plan ? "barbell-outline" : "alert-circle-outline"}
                  color={plan ? theme.primary : theme.warning}
                />
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.muted} />
          </Card>
        );
      })}

      {clients.length === 0 ? (
        <EmptyState
          icon="people-outline"
          title="No clients yet"
          message="Add your first client to start assigning plans."
          actionTitle="Add a client"
          onAction={() => navigation.navigate("ClientForm")}
        />
      ) : null}

      {clients.length > 0 && filtered.length === 0 ? (
        <EmptyState icon="search" title="No matching clients" message="Check the spelling or try another name." />
      ) : null}
    </Screen>
  );
}

/* ------------------------------------------------------------------ */

export function ClientDetailScreen({ route, navigation }) {
  const { theme, clients, plans, updateClient, deleteClient } = useApp();

  const client = clients.find(
    (item) => item.id === (route.params && route.params.clientId)
  );

  if (!client) {
    return (
      <Screen inStack>
        <EmptyState
          title="Client not found"
          message="They may have been removed."
          actionTitle="Go back"
          onAction={() => navigation.goBack()}
        />
      </Screen>
    );
  }

  function assign(planId) {
    tap();
    updateClient(client.id, { planId });
    if (planId) success();
  }

  function confirmDelete() {
    Alert.alert(`Remove ${client.name}?`, "This can't be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          deleteClient(client.id);
          navigation.goBack();
        },
      },
    ]);
  }

  return (
    <Screen inStack>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
        <Avatar name={client.name} size={64} />
        <View style={{ flex: 1, gap: 4 }}>
          <AppText size={24} weight="800">
            {client.name}
          </AppText>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
            <Tag label={client.goal} />
            <Tag label={client.level} />
          </View>
        </View>
      </View>

      {client.notes ? (
        <Card>
          <AppText size={13} weight="600" color={theme.muted}>
            Notes
          </AppText>
          <AppText>{client.notes}</AppText>
        </Card>
      ) : null}

      <SectionHeader title="Assigned plan" />

      {plans.map((plan) => {
        const active = client.planId === plan.id;

        return (
          <Pressable
            key={plan.id}
            onPress={() => assign(plan.id)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              padding: 14,
              borderRadius: 16,
              borderWidth: 1.5,
              borderColor: active ? theme.primary : theme.border,
              backgroundColor: active ? theme.primarySoft : theme.surface,
            }}
          >
            <Ionicons
              name={active ? "radio-button-on" : "radio-button-off"}
              size={22}
              color={active ? theme.primary : theme.muted}
            />
            <View style={{ flex: 1, gap: 2 }}>
              <AppText weight="700">{plan.title}</AppText>
              <AppText size={12} color={theme.muted}>
                {plan.category}, {plan.level}, {estimateMinutes(plan)} min
              </AppText>
            </View>
          </Pressable>
        );
      })}

      {plans.length === 0 ? (
        <EmptyState
          title="No plans to assign"
          message="Build a plan first, then come back."
          actionTitle="Build a plan"
          onAction={() => navigation.navigate("PlanEditor")}
        />
      ) : null}

      {client.planId ? (
        <AppButton title="Unassign plan" variant="ghost" onPress={() => assign(null)} />
      ) : null}

      <View style={{ gap: 10, marginTop: 8 }}>
        <AppButton
          title="Edit client"
          icon="create-outline"
          variant="outline"
          onPress={() => navigation.navigate("ClientForm", { clientId: client.id })}
        />
        <AppButton title="Remove client" icon="trash-outline" variant="danger" onPress={confirmDelete} />
      </View>
    </Screen>
  );
}

/* ------------------------------------------------------------------ */

export function ClientFormScreen({ route, navigation }) {
  const { theme, clients, addClient, updateClient } = useApp();

  const clientId = route.params ? route.params.clientId : undefined;
  const existing = clients.find((item) => item.id === clientId);

  const [name, setName] = useState(existing ? existing.name : "");
  const [goal, setGoal] = useState(existing ? existing.goal : GOALS[0]);
  const [level, setLevel] = useState(existing ? existing.level : LEVELS[0]);
  const [notes, setNotes] = useState(existing ? existing.notes || "" : "");
  const [error, setError] = useState(null);

  function save() {
    if (!name.trim()) {
      setError("Enter the client's name.");
      return;
    }

    const data = { name: name.trim(), goal, level, notes: notes.trim() };

    if (existing) {
      updateClient(existing.id, data);
    } else {
      addClient({ ...data, planId: null });
    }
    success();
    navigation.goBack();
  }

  return (
    <Screen
      inStack
      footer={<AppButton title={existing ? "Save changes" : "Add client"} onPress={save} />}
    >
      <Field
        label="Name"
        value={name}
        onChangeText={(text) => {
          setName(text);
          setError(null);
        }}
        placeholder="e.g. Sam Rivera"
        maxLength={40}
        error={error}
      />

      <View style={{ gap: 8 }}>
        <AppText size={13} weight="600" color={theme.muted}>
          Goal
        </AppText>
        <ChipRow>
          {GOALS.map((item) => (
            <Chip key={item} label={item} active={goal === item} onPress={() => setGoal(item)} />
          ))}
        </ChipRow>
      </View>

      <View style={{ gap: 8 }}>
        <AppText size={13} weight="600" color={theme.muted}>
          Experience
        </AppText>
        <ChipRow>
          {LEVELS.map((item) => (
            <Chip key={item} label={item} active={level === item} onPress={() => setLevel(item)} />
          ))}
        </ChipRow>
      </View>

      <Field
        label="Notes (optional)"
        value={notes}
        onChangeText={setNotes}
        placeholder="Injuries, schedule, preferences"
        multiline
        maxLength={300}
      />
    </Screen>
  );
}