import { BlockPhase, ExerciseCategory, Weekday, type Objective } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { filterCatalogForProfile } from "@/lib/ai/catalog-filter";
import { isPremiumActive } from "@/lib/subscription";
import type { ExerciseSeed } from "@/lib/exercises/catalog-data";
import { getCurrentWeekStart } from "@/lib/week";

export const TRAINING_THEMES = ["motricite", "ballon", "muscu"] as const;
export type TrainingTheme = (typeof TRAINING_THEMES)[number];

export const THEME_LABELS: Record<TrainingTheme, string> = {
  motricite: "Motricité",
  ballon: "Travail avec ballon",
  muscu: "Musculation",
};

export const THEME_EMOJI: Record<TrainingTheme, string> = {
  motricite: "🏃",
  ballon: "⚽",
  muscu: "💪",
};

const THEME_MAIN_CATEGORIES: Record<TrainingTheme, ExerciseCategory[]> = {
  motricite: [ExerciseCategory.EXPLOSIVENESS, ExerciseCategory.CARDIO],
  ballon: [ExerciseCategory.TECHNIQUE],
  muscu: [ExerciseCategory.STRENGTH],
};

const THEME_OBJECTIVE: Record<TrainingTheme, Objective> = {
  motricite: "SPEED_EXPLOSIVENESS",
  ballon: "TECHNIQUE_DRIBBLING",
  muscu: "PHYSICAL_DUELS",
};

const WEEK_ORDER: Weekday[] = [
  Weekday.MONDAY,
  Weekday.TUESDAY,
  Weekday.WEDNESDAY,
  Weekday.THURSDAY,
  Weekday.FRIDAY,
  Weekday.SATURDAY,
  Weekday.SUNDAY,
];

function todayAsWeekday(referenceDate: Date = new Date()): Weekday {
  return WEEK_ORDER[(referenceDate.getDay() + 6) % 7];
}

function pick(pool: ExerciseSeed[], exclude: Set<string>): ExerciseSeed | null {
  const candidate = pool.find((e) => !exclude.has(e.slug));
  return candidate ?? null;
}

function genericInstruction(exercise: ExerciseSeed): string {
  return `Fais "${exercise.name}" en respectant les étapes indiquées.`;
}

/**
 * Séance ciblée sur un seul thème (motricité / ballon / musculation),
 * à la demande du joueur — distincte du programme hebdomadaire généré
 * automatiquement. Sélection déterministe (pas d'appel IA: c'est un choix
 * explicite du joueur, pas une génération à personnaliser).
 */
export async function buildTargetedSession(userId: string, theme: TrainingTheme) {
  const [profile, subscription] = await Promise.all([
    prisma.playerProfile.findUnique({ where: { userId } }),
    prisma.subscription.findUnique({ where: { userId } }),
  ]);
  if (!profile) return null;

  const premium = isPremiumActive(subscription);
  const catalog = filterCatalogForProfile({
    birthYear: profile.birthYear,
    position: profile.position,
    equipment: profile.equipment,
    isPremium: premium,
  });

  const mainCategories = THEME_MAIN_CATEGORIES[theme];
  const mainPool = catalog.filter((e) => mainCategories.includes(e.category));
  const warmupPool = catalog.filter((e) => e.category === ExerciseCategory.CARDIO || e.category === ExerciseCategory.EXPLOSIVENESS);
  const cooldownPool = catalog.filter((e) => e.category === ExerciseCategory.PREVENTION);

  if (mainPool.length === 0) return null;

  const used = new Set<string>();
  const blocks: {
    exerciseId: string;
    order: number;
    phase: BlockPhase;
    sets: number | null;
    reps: string | null;
    restSeconds: number | null;
    customInstruction: string;
  }[] = [];

  const warmup = pick(warmupPool, used);
  if (warmup) used.add(warmup.slug);

  const mainExercises: ExerciseSeed[] = [];
  for (const exercise of mainPool) {
    if (mainExercises.length >= 4) break;
    if (used.has(exercise.slug)) continue;
    mainExercises.push(exercise);
    used.add(exercise.slug);
  }

  const cooldown = pick(cooldownPool, used);

  const slugs = [warmup, ...mainExercises, cooldown].filter((e): e is ExerciseSeed => !!e).map((e) => e.slug);
  const dbExercises = await prisma.exercise.findMany({ where: { slug: { in: slugs } } });
  const idBySlug = new Map(dbExercises.map((e) => [e.slug, e.id]));

  let order = 0;
  if (warmup && idBySlug.has(warmup.slug)) {
    blocks.push({
      exerciseId: idBySlug.get(warmup.slug)!,
      order: order++,
      phase: "WARMUP",
      sets: null,
      reps: null,
      restSeconds: 30,
      customInstruction: genericInstruction(warmup),
    });
  }
  for (const exercise of mainExercises) {
    if (!idBySlug.has(exercise.slug)) continue;
    blocks.push({
      exerciseId: idBySlug.get(exercise.slug)!,
      order: order++,
      phase: "MAIN",
      sets: 3,
      reps: null,
      restSeconds: 45,
      customInstruction: genericInstruction(exercise),
    });
  }
  if (cooldown && idBySlug.has(cooldown.slug)) {
    blocks.push({
      exerciseId: idBySlug.get(cooldown.slug)!,
      order: order++,
      phase: "COOLDOWN",
      sets: null,
      reps: null,
      restSeconds: 0,
      customInstruction: genericInstruction(cooldown),
    });
  }

  if (blocks.length === 0) return null;

  const weekStartDate = getCurrentWeekStart();
  const weeklyProgram = await prisma.weeklyProgram.upsert({
    where: { userId_weekStartDate: { userId, weekStartDate } },
    create: { userId, weekStartDate, source: "MANUAL_REGEN" },
    update: {},
  });

  const existingCount = await prisma.programSession.count({ where: { weeklyProgramId: weeklyProgram.id } });

  const session = await prisma.programSession.create({
    data: {
      weeklyProgramId: weeklyProgram.id,
      dayOfWeek: todayAsWeekday(),
      order: existingCount,
      title: `Séance ciblée : ${THEME_LABELS[theme]}`,
      focusObjective: THEME_OBJECTIVE[theme],
      isMatchAdjacent: false,
      blocks: { create: blocks },
    },
  });

  return session;
}
