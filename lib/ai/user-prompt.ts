import type { Position, Objective, Weekday } from "@prisma/client";
import type { ExerciseSeed } from "@/lib/exercises/catalog-data";

export interface PreviousWeekSummary {
  sessionsPlanned: number;
  sessionsCompleted: number;
  sessionsSkipped: number;
  /** Moyenne des ressentis de difficulté (1-5) sur les séances complétées. */
  averageDifficulty: number | null;
}

export interface UserPromptInput {
  firstName: string;
  position: Position;
  country: string;
  levelLabel: string;
  heightCm?: number | null;
  weightKg?: number | null;
  clubSessionsPerWeek?: number | null;
  matchDay?: Weekday | null;
  objective: Objective;
  weakPointNote?: string | null;
  unresolvedPain: { bodyPart: string; note?: string | null }[];
  previousWeek?: PreviousWeekSummary | null;
  filteredCatalog: ExerciseSeed[];
  targetWeekDays: Weekday[]; // jours proposés pour placer les séances, hors veille/jour de match
  matchAdjacentDays: Weekday[];
}

function catalogForPrompt(catalog: ExerciseSeed[]) {
  return catalog.map((e) => ({
    slug: e.slug,
    name: e.name,
    category: e.category,
    objectives: e.objectives,
    equipment: e.equipment,
    durationMinutes: e.durationMinutes,
    spaceFriendly: e.spaceFriendly,
    shortDescription: e.description,
  }));
}

export function buildUserPrompt(input: UserPromptInput): string {
  const profile = {
    firstName: input.firstName,
    position: input.position,
    country: input.country,
    levelLabel: input.levelLabel,
    heightCm: input.heightCm ?? null,
    weightKg: input.weightKg ?? null,
    clubSessionsPerWeek: input.clubSessionsPerWeek ?? null,
    matchDay: input.matchDay ?? null,
    objective: input.objective,
    weakPointNote: input.weakPointNote ?? null,
  };

  const parts = [
    `Profil joueur:\n${JSON.stringify(profile, null, 2)}`,
    `Douleurs/gênes non résolues (à exclure absolument):\n${JSON.stringify(input.unresolvedPain, null, 2)}`,
    input.previousWeek
      ? `Bilan de la semaine précédente:\n${JSON.stringify(input.previousWeek, null, 2)}\nAjuste la charge à la hausse si le ressenti était facile (1-2) et les séances complétées, à la baisse si difficile (4-5) ou beaucoup de séances sautées.`
      : `Pas de semaine précédente (premier programme du joueur).`,
    `Jours envisageables pour placer les séances: ${input.targetWeekDays.join(", ")}.`,
    `Jours veille/jour de match (INTERDITS pour tout bloc intense, marquer isMatchAdjacent=true si utilisés): ${
      input.matchAdjacentDays.length ? input.matchAdjacentDays.join(", ") : "aucun"
    }.`,
    `Catalogue d'exercices disponibles pour ce joueur (choisis UNIQUEMENT parmi ces slugs):\n${JSON.stringify(
      catalogForPrompt(input.filteredCatalog),
      null,
      2
    )}`,
  ];

  return parts.join("\n\n");
}
