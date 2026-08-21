import type { StatAxis } from "@prisma/client";
import type { ExerciseSeed } from "@/lib/exercises/catalog-data";
import { CATEGORY_WEIGHTS, OBJECTIVE_WEIGHTS } from "./stats-engine";

/**
 * Combien un exercice contribue à un axe donné — mêmes pondérations que le
 * calcul réel de gain de stats (CATEGORY_WEIGHTS/OBJECTIVE_WEIGHTS de
 * stats-engine.ts), pour ne jamais recommander un exercice qui ne fait en
 * réalité rien pour cet axe.
 */
export function exerciseWeightForAxis(exercise: ExerciseSeed, axis: StatAxis): number {
  const categoryWeight = CATEGORY_WEIGHTS[exercise.category]?.[axis] ?? 0;
  if (exercise.objectives.length === 0) return categoryWeight;

  const objectiveWeight =
    exercise.objectives.reduce((sum, o) => sum + (OBJECTIVE_WEIGHTS[o]?.[axis] ?? 0), 0) / exercise.objectives.length;

  return categoryWeight * 0.3 + objectiveWeight * 0.7;
}

/** Exercices les plus pertinents pour progresser sur un axe donné, triés par pertinence décroissante. */
export function recommendExercisesForAxis(catalog: ExerciseSeed[], axis: StatAxis, limit = 6): ExerciseSeed[] {
  return catalog
    .map((exercise) => ({ exercise, weight: exerciseWeightForAxis(exercise, axis) }))
    .filter((e) => e.weight > 0)
    .sort((a, b) => b.weight - a.weight)
    .slice(0, limit)
    .map((e) => e.exercise);
}
