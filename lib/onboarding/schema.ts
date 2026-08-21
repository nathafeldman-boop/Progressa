import { z } from "zod";
import { Equipment, Objective, Position, Weekday } from "@prisma/client";

// Public cible: 16-30 ans. Seule source de vérité pour la borne d'âge à
// l'inscription — le client (OnboardingWizard) réutilise ces mêmes valeurs
// pour son UI, mais c'est CETTE validation serveur qui fait foi.
export const MIN_SIGNUP_AGE = 16;
export const MAX_SIGNUP_AGE = 30;

export const onboardingPayloadSchema = z.object({
  firstName: z.string().min(1).max(60),
  birthYear: z
    .number()
    .int()
    .min(new Date().getFullYear() - MAX_SIGNUP_AGE)
    .max(new Date().getFullYear() - MIN_SIGNUP_AGE),
  position: z.enum(Position),
  country: z.string().min(2).max(60),
  ligue: z.string().nullable().optional(),
  district: z.string().nullable().optional(),
  levelLabel: z.string().min(1),
  heightCm: z.number().int().positive().nullable().optional(),
  weightKg: z.number().int().positive().nullable().optional(),
  clubSessionsPerWeek: z.number().int().min(0).max(14).nullable().optional(),
  matchDay: z.enum(Weekday).nullable().optional(),
  equipment: z.array(z.enum(Equipment)).default([]),
  objective: z.enum(Objective),
  weakPointNote: z.string().max(280).optional().default(""),
});

export type OnboardingPayload = z.infer<typeof onboardingPayloadSchema>;
