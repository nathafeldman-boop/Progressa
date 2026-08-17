import type { Country, Equipment, Objective, Position, Weekday } from "@prisma/client";

export interface OnboardingData {
  firstName: string;
  birthYear: number | null;
  position: Position | null;
  country: Country;
  ligue: string | null; // France uniquement
  district: string | null; // France uniquement
  levelLabel: string | null;
  heightCm: number | null;
  weightKg: number | null;
  clubSessionsPerWeek: number | null;
  matchDay: Weekday | null;
  equipment: Equipment[];
  otherEquipmentNote: string;
  objective: Objective | null;
  weakPointNote: string;
}

export const EMPTY_ONBOARDING_DATA: OnboardingData = {
  firstName: "",
  birthYear: null,
  position: null,
  country: "FR",
  ligue: null,
  district: null,
  levelLabel: null,
  heightCm: null,
  weightKg: null,
  clubSessionsPerWeek: null,
  matchDay: null,
  equipment: [],
  otherEquipmentNote: "",
  objective: null,
  weakPointNote: "",
};

export const ONBOARDING_SCREEN_KEYS = [
  "prenom",
  "annee_naissance",
  "poste",
  "pays_niveau",
  "gabarit_rythme",
  "materiel",
  "objectif",
  "revelation",
] as const;

export type OnboardingScreenKey = (typeof ONBOARDING_SCREEN_KEYS)[number];
