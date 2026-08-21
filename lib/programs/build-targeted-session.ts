import { BlockPhase, type Objective } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { filterCatalogForProfile } from "@/lib/ai/catalog-filter";
import { isPremiumActive } from "@/lib/subscription";
import {
  TRAINING_NEEDS,
  NEED_LABELS,
  NEED_EMOJI,
  NEED_INTRO,
  exercisesForNeed,
  warmupPoolForNeed,
  cooldownPoolForNeed,
  instructionForNeed,
  type TrainingNeed,
} from "@/lib/exercises/needs";
import { getCurrentWeekStart, todayAsWeekday } from "@/lib/week";

// Alias conservés pour ne pas casser les imports existants (page,
// composant dashboard, route API) — "thème" et "besoin" désignent la même
// chose ici, le vocabulaire produit est "besoin" depuis la refonte.
export const TRAINING_THEMES = TRAINING_NEEDS;
export type TrainingTheme = TrainingNeed;
export const THEME_LABELS = NEED_LABELS;
export const THEME_EMOJI = NEED_EMOJI;

const NEED_OBJECTIVE: Record<TrainingNeed, Objective> = {
  pied_faible: "TECHNIQUE_DRIBBLING",
  dribble: "TECHNIQUE_DRIBBLING",
  tir: "SHOOTING",
  vitesse: "SPEED_EXPLOSIVENESS",
  cardio: "ENDURANCE",
  muscu: "PHYSICAL_DUELS",
  prevention: "ALL_ROUND",
  gardien: "ALL_ROUND",
};

// Une vraie séance de coach privé, pas un menu à picorer: on vise au moins
// 10 exercices (échauffement + corps de séance + retour au calme), pas les
// 4-5 blocs d'avant qui ne menaient nulle part. Certains besoins ont un
// corps de séance naturellement plus étroit (ex: "tir", 5 exercices dans
// tout le catalogue) — l'échauffement et le retour au calme se
// rallongent alors pour que la séance reste consistante, plutôt que de
// livrer une séance courte sur les besoins les plus spécialisés.
const TARGET_TOTAL_BLOCKS = 10;
const MAX_MAIN_EXERCISES = 9;
const MIN_WARMUP = 2;
const MAX_WARMUP = 4;
const MIN_COOLDOWN = 1;
const MAX_COOLDOWN = 3;

function pickMany<T extends { slug: string }>(pool: T[], exclude: Set<string>, count: number): T[] {
  const picked: T[] = [];
  for (const item of pool) {
    if (picked.length >= count) break;
    if (exclude.has(item.slug)) continue;
    picked.push(item);
    exclude.add(item.slug);
  }
  return picked;
}

/**
 * Séance ciblée sur un besoin précis (pied faible, cardio, vitesse...), à
 * la demande du joueur — distincte du programme hebdomadaire généré
 * automatiquement. Sélection déterministe (pas d'appel IA: c'est un choix
 * explicite du joueur, pas une génération à personnaliser). Construit
 * directement une séance complète et jouable — le joueur ne pioche plus
 * un exercice dans une liste, le coach construit la séance pour lui.
 */
export async function buildTargetedSession(userId: string, need: TrainingNeed) {
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

  const mainPool = exercisesForNeed(catalog, need);
  const warmupPool = warmupPoolForNeed(catalog, need);
  const cooldownPool = cooldownPoolForNeed(catalog);

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

  // Le corps de séance vise MAX_MAIN_EXERCISES, mais un compte gratuit n'a
  // que ~1-2 exercices débloqués par catégorie (freemium ~15% du
  // catalogue), et certains besoins spécialisés (ex: "tir") ont un pool
  // naturellement plus étroit: la séance reste réellement jouable, juste
  // plus courte sur le corps de séance, plutôt que de tronquer
  // silencieusement ou d'inventer des blocs verrouillés non jouables.
  const mainCount = Math.min(MAX_MAIN_EXERCISES, mainPool.length);
  const mainExercises = pickMany(mainPool, used, mainCount);

  // Comble l'écart jusqu'à TARGET_TOTAL_BLOCKS en allongeant échauffement
  // puis retour au calme (dans cet ordre), bornés par MAX_WARMUP/MAX_COOLDOWN
  // et par ce que le pool filtré permet réellement.
  const shortfall = Math.max(0, TARGET_TOTAL_BLOCKS - mainExercises.length - MIN_WARMUP - MIN_COOLDOWN);
  const warmupCount = Math.min(MAX_WARMUP, MIN_WARMUP + shortfall);
  const remainingShortfall = Math.max(0, shortfall - (warmupCount - MIN_WARMUP));
  const cooldownCount = Math.min(MAX_COOLDOWN, MIN_COOLDOWN + remainingShortfall);

  const warmup = pickMany(warmupPool, used, warmupCount);
  const cooldown = pickMany(cooldownPool, used, cooldownCount);

  const slugs = [...warmup, ...mainExercises, ...cooldown].map((e) => e.slug);
  const dbExercises = await prisma.exercise.findMany({ where: { slug: { in: slugs } } });
  const idBySlug = new Map(dbExercises.map((e) => [e.slug, e.id]));

  let order = 0;
  for (const exercise of warmup) {
    if (!idBySlug.has(exercise.slug)) continue;
    blocks.push({
      exerciseId: idBySlug.get(exercise.slug)!,
      order: order++,
      phase: "WARMUP",
      sets: null,
      reps: null,
      restSeconds: 30,
      customInstruction: instructionForNeed(exercise, need),
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
      customInstruction: instructionForNeed(exercise, need),
    });
  }
  for (const exercise of cooldown) {
    if (!idBySlug.has(exercise.slug)) continue;
    blocks.push({
      exerciseId: idBySlug.get(exercise.slug)!,
      order: order++,
      phase: "COOLDOWN",
      sets: null,
      reps: null,
      restSeconds: 0,
      customInstruction: instructionForNeed(exercise, need),
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
      title: `Séance ciblée : ${NEED_LABELS[need]}`,
      focusObjective: NEED_OBJECTIVE[need],
      isMatchAdjacent: false,
      blocks: { create: blocks },
    },
  });

  return session;
}

export { NEED_INTRO };
