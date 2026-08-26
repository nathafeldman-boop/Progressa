import type { ExerciseCategory } from "@prisma/client";

/**
 * Temps moyen réaliste par répétition selon la catégorie d'exercice — sert
 * uniquement à empêcher de valider un bloc à répétitions en quelques
 * secondes (ex: "45 abdos" ne peut pas être marqué terminé après 3
 * secondes). Volontairement approximatif: c'est un plancher anti-triche,
 * pas une estimation de performance.
 */
const SECONDS_PER_REP: Partial<Record<ExerciseCategory, number>> = {
  STRENGTH: 0.6,
  EXPLOSIVENESS: 0.8,
  TECHNIQUE: 1,
  GOALKEEPER: 1,
};

const REST_BETWEEN_SETS_SECONDS = 3;
const MINIMUM_FLOOR_SECONDS = 8;

/**
 * Estime un temps minimum réaliste (en secondes) pour un bloc, à partir du
 * texte libre `reps` (ex: "15", "3x12", "30 secondes") et du nombre de
 * séries. Repli sur `fallbackSeconds` (durée globale de l'exercice) si le
 * texte ne contient aucun nombre exploitable — un format non reconnu ne doit
 * jamais bloquer le joueur plus que l'estimation déjà utilisée ailleurs.
 */
export function estimateMinimumSeconds(
  reps: string | null,
  sets: number | null,
  category: ExerciseCategory,
  fallbackSeconds: number
): number {
  if (!reps) return fallbackSeconds;

  const setCount = sets && sets > 0 ? sets : 1;

  // Répétitions chronométrées ("30 secondes", "20 sec par côté"): le nombre
  // trouvé EST déjà une durée par série.
  const secondsMatch = reps.match(/(\d+)\s*(?:secondes?|sec\b|s\b)/i);
  if (secondsMatch) {
    const perSet = Number(secondsMatch[1]);
    return Math.max(MINIMUM_FLOOR_SECONDS, Math.round(perSet * setCount + REST_BETWEEN_SETS_SECONDS * (setCount - 1)));
  }

  // Répétitions comptées ("15", "3x12", "10 par jambe"): premier nombre = répétitions par série.
  const repsMatch = reps.match(/(\d+)/);
  if (!repsMatch) return fallbackSeconds;

  const perSet = Number(repsMatch[1]);
  const perRep = SECONDS_PER_REP[category] ?? 0.7;
  const totalReps = perSet * setCount;
  const estimated = totalReps * perRep + REST_BETWEEN_SETS_SECONDS * (setCount - 1);

  return Math.max(MINIMUM_FLOOR_SECONDS, Math.round(estimated));
}
