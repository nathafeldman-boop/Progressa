import { ExerciseCategory } from "@prisma/client";

/**
 * Nombre de répétitions par défaut quand un bloc a des séries (sets) mais
 * aucune consigne de reps précise (générateurs déterministes: séance
 * ciblée, programme de repli). Un joueur ne doit jamais voir "3 séries"
 * sans savoir combien de répétitions faire par série.
 */
const DEFAULT_REPS_BY_CATEGORY: Record<ExerciseCategory, string> = {
  TECHNIQUE: "10 répétitions",
  STRENGTH: "12 répétitions",
  EXPLOSIVENESS: "8 répétitions",
  CARDIO: "30 secondes",
  PREVENTION: "12 répétitions",
  GOALKEEPER: "8 répétitions",
};

export function defaultRepsForCategory(category: ExerciseCategory): string {
  return DEFAULT_REPS_BY_CATEGORY[category];
}
