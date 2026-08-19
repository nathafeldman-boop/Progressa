import type { ExerciseSeed } from "./catalog-data";

const HARD_KEYWORDS = [
  "bulgare",
  "nordic",
  "diamant",
  "déclinée",
  "1 jambe",
  "une jambe",
  "explosif",
  "explosive",
  "sauté",
  "sautée",
  "sauts",
  "burpee",
  "1v1",
  "1 contre 1",
  "puissance",
  "volée",
  "pistol",
];
const EASY_KEYWORDS = [
  "toe taps",
  "footing",
  "respiration",
  "étirement",
  "mobilité",
  "équilibre",
  "marche",
  "genoux hauts",
  "gammes",
  "auto-massage",
];

/**
 * Estime une difficulté 1-10 à partir des champs déjà présents dans le
 * catalogue (âge minimum, durée, mots-clés du nom/de la description) —
 * volontairement sans nouveau champ dédié, pour ne pas exiger une nouvelle
 * migration de base de données pour un simple tri.
 */
export function estimateDifficulty(exercise: ExerciseSeed): number {
  let score = 5;
  if (exercise.minAge === 15) score += 1;
  const haystack = `${exercise.name} ${exercise.description}`.toLowerCase();
  if (HARD_KEYWORDS.some((k) => haystack.includes(k))) score += 2;
  if (EASY_KEYWORDS.some((k) => haystack.includes(k))) score -= 2;
  if (exercise.durationMinutes >= 10) score += 1;
  return Math.max(1, Math.min(10, score));
}

/** Plage de difficulté cible par rang de carte (section carte joueur). */
const RANK_DIFFICULTY_BAND: Record<string, [number, number]> = {
  debutant: [1, 3],
  intermediaire: [2, 4],
  avance: [3, 5],
  confirme: [4, 6],
  espoir: [5, 7],
  pro: [6, 8],
  elite: [7, 9],
  elite_supreme: [8, 10],
};

export function difficultyBandForRankKey(rankKey: string | null | undefined): [number, number] {
  return RANK_DIFFICULTY_BAND[rankKey ?? "debutant"] ?? [1, 5];
}
