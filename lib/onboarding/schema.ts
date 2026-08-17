import { z } from "zod";
import { Equipment, Objective, Position, Weekday } from "@prisma/client";

export const onboardingPayloadSchema = z.object({
  firstName: z.string().min(1).max(60),
  birthYear: z.number().int().min(1940).max(new Date().getFullYear()),
  position: z.enum(Position),
  country: z.string().min(2).max(10),
  ligue: z.string().nullable().optional(),
  district: z.string().nullable().optional(),
  levelLabel: z.string().min(1),
  heightCm: z.number().int().positive().nullable().optional(),
  weightKg: z.number().int().positive().nullable().optional(),
  clubSessionsPerWeek: z.number().int().min(0).max(14).nullable().optional(),
  matchDay: z.enum(Weekday).nullable().optional(),
  equipment: z.array(z.enum(Equipment)).min(1),
  objective: z.enum(Objective),
  weakPointNote: z.string().max(280).optional().default(""),
});

export type OnboardingPayload = z.infer<typeof onboardingPayloadSchema>;
