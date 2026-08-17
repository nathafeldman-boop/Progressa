import { BlockPhase, ExerciseCategory, type Objective, type Weekday } from "@prisma/client";
import type { ExerciseSeed } from "@/lib/exercises/catalog-data";
import type { ProgramOutput } from "@/lib/ai/program-schema";

export interface FallbackTemplateInput {
  sessionCount: number;
  targetWeekDays: Weekday[];
  matchAdjacentDays: Weekday[];
  filteredCatalog: ExerciseSeed[];
  objective: Objective;
  weekSeed?: number; // fait varier le choix d'une semaine à l'autre (ex: numéro de semaine ISO)
}

const WARMUP_CATEGORIES: ExerciseCategory[] = [ExerciseCategory.CARDIO, ExerciseCategory.EXPLOSIVENESS];
const COOLDOWN_CATEGORIES: ExerciseCategory[] = [ExerciseCategory.PREVENTION];
const LIGHT_MAIN_CATEGORIES: ExerciseCategory[] = [ExerciseCategory.TECHNIQUE, ExerciseCategory.PREVENTION];

function rotate<T>(items: T[], offset: number): T[] {
  if (items.length === 0) return items;
  const i = ((offset % items.length) + items.length) % items.length;
  return [...items.slice(i), ...items.slice(0, i)];
}

function pickOne(catalog: ExerciseSeed[], categories: ExerciseCategory[], seed: number, exclude: Set<string>): ExerciseSeed | null {
  const pool = rotate(
    catalog.filter((e) => categories.includes(e.category) && !exclude.has(e.slug)),
    seed
  );
  return pool[0] ?? null;
}

function genericInstruction(exercise: ExerciseSeed): string {
  return `Fais "${exercise.name}" en respectant les étapes indiquées. Programme de repli généré automatiquement — sera personnalisé dès la prochaine génération IA réussie.`;
}

/**
 * Programme-template déterministe, construit uniquement à partir du
 * catalogue validé — jamais d'appel IA. Utilisé quand la génération IA
 * échoue deux fois de suite (invalide ou service indisponible), pour ne
 * JAMAIS laisser le joueur sans programme ni écran d'erreur.
 */
export function buildFallbackProgram(input: FallbackTemplateInput): ProgramOutput {
  const seed = input.weekSeed ?? 0;
  const days = rotate(input.targetWeekDays, 0).slice(0, input.sessionCount);
  const objectiveExercise = rotate(
    input.filteredCatalog.filter((e) => e.objectives.includes(input.objective)),
    seed
  )[0];

  const sessions = days.map((dayOfWeek, index) => {
    const isMatchAdjacent = input.matchAdjacentDays.includes(dayOfWeek);
    const used = new Set<string>();

    const warmup = pickOne(input.filteredCatalog, WARMUP_CATEGORIES, seed + index, used);
    if (warmup) used.add(warmup.slug);

    const mainCategories = isMatchAdjacent ? LIGHT_MAIN_CATEGORIES : [ExerciseCategory.TECHNIQUE, ExerciseCategory.STRENGTH, ExerciseCategory.EXPLOSIVENESS, ExerciseCategory.CARDIO];
    const mainExercises: ExerciseSeed[] = [];

    // Sur la première séance de la semaine, on garantit un bloc sur
    // l'objectif principal du joueur (règle non négociable).
    if (index === 0 && objectiveExercise && !used.has(objectiveExercise.slug) && (!isMatchAdjacent || LIGHT_MAIN_CATEGORIES.includes(objectiveExercise.category))) {
      mainExercises.push(objectiveExercise);
      used.add(objectiveExercise.slug);
    }

    for (let i = 0; i < 2; i++) {
      const pick = pickOne(input.filteredCatalog, mainCategories, seed + index + i + 1, used);
      if (pick) {
        mainExercises.push(pick);
        used.add(pick.slug);
      }
    }

    const cooldown = pickOne(input.filteredCatalog, COOLDOWN_CATEGORIES, seed + index, used);
    if (cooldown) used.add(cooldown.slug);

    const blocks: ProgramOutput["sessions"][number]["blocks"] = [];
    if (warmup) {
      blocks.push({
        exerciseSlug: warmup.slug,
        phase: BlockPhase.WARMUP,
        sets: null,
        reps: null,
        restSeconds: 30,
        customInstruction: genericInstruction(warmup),
      });
    }
    for (const exercise of mainExercises) {
      blocks.push({
        exerciseSlug: exercise.slug,
        phase: BlockPhase.MAIN,
        sets: 3,
        reps: null,
        restSeconds: 45,
        customInstruction: genericInstruction(exercise),
      });
    }
    if (cooldown) {
      blocks.push({
        exerciseSlug: cooldown.slug,
        phase: BlockPhase.COOLDOWN,
        sets: null,
        reps: null,
        restSeconds: 0,
        customInstruction: genericInstruction(cooldown),
      });
    }

    return {
      dayOfWeek,
      title: isMatchAdjacent ? "Séance légère (veille/jour de match)" : `Séance ${index + 1}`,
      focusObjective: index === 0 ? input.objective : null,
      isMatchAdjacent,
      blocks,
    };
  });

  return { sessions };
}
