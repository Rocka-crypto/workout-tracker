import React, { useState } from "react";
import { Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useApp } from "../context/AppContext";
import {
  AppButton,
  AppText,
  Card,
  Chip,
  ChipRow,
  Field,
  IconButton,
  Screen,
  Stepper,
} from "../components/UI";
import Logo from "../components/Logo";
import { GOALS, LEVELS } from "../data/exercises";
import { success, tap } from "../utils";

const SPECIALTIES = [
  "Strength",
  "Weight loss",
  "Endurance",
  "Mobility",
  "Bodybuilding",
  "HIIT",
  "Yoga",
  "Rehab",
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Label({ children }) {
  const { theme } = useApp();
  return (
    <AppText size={13} weight="600" color={theme.muted}>
      {children}
    </AppText>
  );
}

export default function RegisterScreen() {
  const { theme, role, setRole, accounts, registerAccount } = useApp();

  const isTrainer = role === "trainer";

  // If the person already registered in the other mode, reuse their details
  const other = accounts.individual || accounts.trainer;

  // Shared
  const [name, setName] = useState(other ? other.name : "");
  const [email, setEmail] = useState(other ? other.email : "");
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState({});

  // Member
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [goal, setGoal] = useState(GOALS[0]);
  const [level, setLevel] = useState(LEVELS[0]);
  const [weeklyGoal, setWeeklyGoal] = useState(4);

  // Trainer
  const [phone, setPhone] = useState("");
  const [specialties, setSpecialties] = useState([]);
  const [years, setYears] = useState(1);
  const [certification, setCertification] = useState("");
  const [bio, setBio] = useState("");

  function clearError(key) {
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function toggleSpecialty(item) {
    clearError("specialties");
    setSpecialties((current) =>
      current.includes(item)
        ? current.filter((value) => value !== item)
        : [...current, item]
    );
  }

  function validate() {
    const next = {};

    if (name.trim().length < 2) next.name = "Enter your full name.";
    if (!EMAIL_PATTERN.test(email.trim())) {
      next.email = "Enter a valid email address.";
    }

    if (isTrainer) {
      if (specialties.length === 0) {
        next.specialties = "Pick at least one specialty.";
      }
      if (phone && phone.replace(/\D/g, "").length < 7) {
        next.phone = "Enter a valid phone number.";
      }
    } else {
      if (age && (Number(age) < 13 || Number(age) > 100)) {
        next.age = "Age must be between 13 and 100.";
      }
      if (height && (Number(height) < 80 || Number(height) > 250)) {
        next.height = "Enter your height in cm (80 to 250).";
      }
      if (weight && (Number(weight) < 25 || Number(weight) > 400)) {
        next.weight = "Enter your weight in kg (25 to 400).";
      }
    }

    if (!agree) next.agree = "Please accept the terms to continue.";

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function submit() {
    if (!validate()) return;

    const common = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
    };

    if (isTrainer) {
      registerAccount("trainer", {
        ...common,
        phone: phone.trim(),
        specialties,
        years,
        certification: certification.trim(),
        bio: bio.trim(),
      });
    } else {
      registerAccount("individual", {
        ...common,
        age: age ? Number(age) : null,
        height: height ? Number(height) : null,
        weight: weight ? Number(weight) : null,
        goal,
        level,
        weeklyGoal,
      });
    }

    success();
  }

  return (
    <Screen
      footer={
        <AppButton
          title={isTrainer ? "Create trainer account" : "Create my account"}
          icon="checkmark"
          onPress={submit}
        />
      }
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        <IconButton
          name="arrow-back"
          color={theme.text}
          onPress={() => setRole(null)}
          label="Choose a different mode"
        />
        <AppText color={theme.muted}>Choose a different mode</AppText>
      </View>

      <View style={{ gap: 14 }}>
        <Logo size={52} />
        <View style={{ gap: 6 }}>
          <AppText size={30} weight="800">
            {isTrainer ? "Set up your coach profile" : "Create your account"}
          </AppText>
          <AppText color={theme.muted} size={15}>
            {isTrainer
              ? "Tell clients who you are and what you specialise in."
              : "A few details so Forma can tailor your plans and goals."}
          </AppText>
        </View>
      </View>

      <Card style={{ gap: 14 }}>
        <AppText size={17} weight="700">
          Your details
        </AppText>

        <Field
          label="Full name"
          value={name}
          onChangeText={(text) => {
            setName(text);
            clearError("name");
          }}
          placeholder="e.g. Sam Rivera"
          maxLength={40}
          error={errors.name}
        />

        <Field
          label="Email"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            clearError("email");
          }}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          maxLength={80}
          error={errors.email}
        />

        {isTrainer ? (
          <Field
            label="Phone (optional)"
            value={phone}
            onChangeText={(text) => {
              setPhone(text);
              clearError("phone");
            }}
            placeholder="e.g. 555 123 4567"
            keyboardType="phone-pad"
            maxLength={20}
            error={errors.phone}
          />
        ) : null}
      </Card>

      {!isTrainer ? (
        <>
          <Card style={{ gap: 14 }}>
            <AppText size={17} weight="700">
              About your body
            </AppText>
            <AppText size={12} color={theme.muted}>
              Optional. Used only on this device.
            </AppText>

            <View style={{ flexDirection: "row", gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Field
                  label="Age"
                  value={age}
                  onChangeText={(text) => {
                    setAge(text.replace(/[^0-9]/g, ""));
                    clearError("age");
                  }}
                  placeholder="25"
                  keyboardType="number-pad"
                  maxLength={3}
                  error={errors.age}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Field
                  label="Height (cm)"
                  value={height}
                  onChangeText={(text) => {
                    setHeight(text.replace(/[^0-9]/g, ""));
                    clearError("height");
                  }}
                  placeholder="175"
                  keyboardType="number-pad"
                  maxLength={3}
                  error={errors.height}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Field
                  label="Weight (kg)"
                  value={weight}
                  onChangeText={(text) => {
                    setWeight(text.replace(/[^0-9]/g, ""));
                    clearError("weight");
                  }}
                  placeholder="70"
                  keyboardType="number-pad"
                  maxLength={3}
                  error={errors.weight}
                />
              </View>
            </View>
          </Card>

          <Card style={{ gap: 14 }}>
            <AppText size={17} weight="700">
              Your training
            </AppText>

            <View style={{ gap: 8 }}>
              <Label>Main goal</Label>
              <ChipRow>
                {GOALS.map((item) => (
                  <Chip
                    key={item}
                    label={item}
                    active={goal === item}
                    onPress={() => setGoal(item)}
                  />
                ))}
              </ChipRow>
            </View>

            <View style={{ gap: 8 }}>
              <Label>Experience</Label>
              <ChipRow>
                {LEVELS.map((item) => (
                  <Chip
                    key={item}
                    label={item}
                    active={level === item}
                    onPress={() => setLevel(item)}
                  />
                ))}
              </ChipRow>
            </View>

            <Stepper
              label="Workouts per week"
              value={weeklyGoal}
              min={1}
              max={7}
              onChange={setWeeklyGoal}
            />
          </Card>
        </>
      ) : (
        <Card style={{ gap: 14 }}>
          <AppText size={17} weight="700">
            Your coaching
          </AppText>

          <View style={{ gap: 8 }}>
            <Label>Specialties</Label>
            <ChipRow>
              {SPECIALTIES.map((item) => (
                <Chip
                  key={item}
                  label={item}
                  active={specialties.includes(item)}
                  onPress={() => toggleSpecialty(item)}
                />
              ))}
            </ChipRow>
            {errors.specialties ? (
              <AppText size={12} color={theme.danger}>
                {errors.specialties}
              </AppText>
            ) : null}
          </View>

          <Stepper
            label="Years of experience"
            value={years}
            min={0}
            max={40}
            onChange={setYears}
          />

          <Field
            label="Certification (optional)"
            value={certification}
            onChangeText={setCertification}
            placeholder="e.g. NASM-CPT"
            maxLength={60}
          />

          <Field
            label="Short bio (optional)"
            value={bio}
            onChangeText={setBio}
            placeholder="How do you like to coach?"
            multiline
            maxLength={300}
          />
        </Card>
      )}

      <View style={{ gap: 6 }}>
        <Pressable
          onPress={() => {
            tap();
            setAgree((value) => !value);
            clearError("agree");
          }}
          style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
        >
          <Ionicons
            name={agree ? "checkbox" : "square-outline"}
            size={26}
            color={agree ? theme.primary : theme.muted}
          />
          <AppText style={{ flex: 1 }} color={theme.muted}>
            I agree to the terms and understand my data is stored only on this
            device.
          </AppText>
        </Pressable>
        {errors.agree ? (
          <AppText size={12} color={theme.danger}>
            {errors.agree}
          </AppText>
        ) : null}
      </View>
    </Screen>
  );
}