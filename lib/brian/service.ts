import type { BlockStatus, FeltDifficulty, StatAxis } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { syncPlayerCard } from "@/lib/player-card";
import { STAT_AXES, STAT_LABELS, type StatAxisValues } from "./types";
import { applyDeltas, computeBlockStatDeltas, computeOverall, expectedDurationSeconds, rankTierForOverall } from "./stats-engine";
import { composeExerciseMessage, composeSessionSummaryMessage, pickExerciseCategory } from "./messages";
import { markObjectiveDone } from "./daily-objectives";

const DEFAULT_STATS: StatAxisValues = {
  VITESSE: 50,
  TECHNIQUE: 50,
  CONDUITE: 50,
  ENDURANCE: 50,
  PHYSIQUE: 50,
  MENTAL: 50,
};

function toAxisValues(state: { vitesse: number; technique: number; conduite: number; endurance: number; physique: number; mental: number }): StatAxisValues {
  return {
    VITESSE: state.vitesse,
    TECHNIQUE: state.technique,
    CONDUITE: state.conduite,
    ENDURANCE: state.endurance,
    PHYSIQUE: state.physique,
    MENTAL: state.mental,
  };
}

const OBJECTIVE_KEY_FOR_AXIS: Partial<Record<StatAxis, "WORK_ON_SPEED" | "WORK_ON_TECHNIQUE" | "WORK_ON_ENDURANCE">> = {
  VITESSE: "WORK_ON_SPEED",
  TECHNIQUE: "WORK_ON_TECHNIQUE",
  ENDURANCE: "WORK_ON_ENDURANCE",
};

export interface BlockTelemetryResult {
  deltas: Partial<Record<StatAxis, number>>;
  isPersonalRecord: boolean;
  brianMessage: { category: string; text: string };
  overall: number;
  rankTier: string;
}

/**
 * Enregistre la vraie performance d'un joueur sur un exercice (temps, statut,
 * ressenti), en déduit les gains de stats et la réaction de Coach Brian, et
 * persiste tout: SessionBlock, PlayerStatState, StatDelta (historique),
 * BrianMessage. Point d'entrée unique — jamais de note attribuée au hasard.
 */
export async function recordBlockTelemetry(input: {
  userId: string;
  blockId: string;
  status: BlockStatus;
  feltDifficulty: FeltDifficulty | null;
  actualDurationSeconds: number | null;
}): Promise<BlockTelemetryResult | null> {
  const block = await prisma.sessionBlock.findUnique({
    where: { id: input.blockId },
    include: { exercise: true, programSession: { include: { weeklyProgram: true } } },
  });
  if (!block || block.programSession.weeklyProgram.userId !== input.userId) return null;

  const expected = expectedDurationSeconds(block.exercise);

  let isPersonalRecord = false;
  if (input.status === "COMPLETED" && input.actualDurationSeconds != null) {
    const previousBest = await prisma.sessionBlock.findFirst({
      where: {
        exerciseId: block.exerciseId,
        id: { not: block.id },
        status: "COMPLETED",
        actualDurationSeconds: { not: null },
        programSession: { weeklyProgram: { userId: input.userId } },
      },
      orderBy: { actualDurationSeconds: "asc" },
    });
    isPersonalRecord = !!previousBest && input.actualDurationSeconds < (previousBest.actualDurationSeconds ?? Infinity);
  }

  const deltas = computeBlockStatDeltas({
    category: block.exercise.category,
    objectives: block.exercise.objectives,
    phase: block.phase,
    status: input.status,
    feltDifficulty: input.feltDifficulty,
    actualDurationSeconds: input.actualDurationSeconds,
    expectedDurationSeconds: expected,
  });

  const currentState = await prisma.playerStatState.upsert({
    where: { userId: input.userId },
    create: { userId: input.userId, ...toFieldObject(DEFAULT_STATS) },
    update: {},
  });
  const updated = applyDeltas(toAxisValues(currentState), deltas);

  await prisma.$transaction([
    prisma.sessionBlock.update({
      where: { id: block.id },
      data: {
        status: input.status,
        feltDifficulty: input.feltDifficulty,
        actualDurationSeconds: input.actualDurationSeconds,
        startedAt: block.startedAt ?? new Date(),
        completedAt: input.status === "PLANNED" ? null : new Date(),
      },
    }),
    prisma.playerStatState.update({ where: { userId: input.userId }, data: toFieldObject(updated) }),
    ...STAT_AXES.filter((axis) => deltas[axis]).map((axis) =>
      prisma.statDelta.create({
        data: {
          userId: input.userId,
          axis,
          delta: deltas[axis]!,
          blockId: block.id,
          sessionId: block.programSessionId,
        },
      })
    ),
  ]);

  const category = pickExerciseCategory({
    status: input.status,
    feltDifficulty: input.feltDifficulty,
    isPersonalRecord,
  });
  const text = composeExerciseMessage({ category, deltas });

  await prisma.brianMessage.create({
    data: {
      userId: input.userId,
      category,
      text,
      relatedSessionId: block.programSessionId,
      relatedBlockId: block.id,
    },
  });

  for (const axis of STAT_AXES) {
    const key = OBJECTIVE_KEY_FOR_AXIS[axis];
    if (key && deltas[axis]) await markObjectiveDone(input.userId, key);
  }
  if (isPersonalRecord) await markObjectiveDone(input.userId, "BEAT_RECORD");

  await syncPlayerCard(input.userId);

  const overall = computeOverall(updated);
  return { deltas, isPersonalRecord, brianMessage: { category, text }, overall, rankTier: rankTierForOverall(overall) };
}

function toFieldObject(values: StatAxisValues) {
  return {
    vitesse: values.VITESSE,
    technique: values.TECHNIQUE,
    conduite: values.CONDUITE,
    endurance: values.ENDURANCE,
    physique: values.PHYSIQUE,
    mental: values.MENTAL,
  };
}

export interface SessionSummaryResult {
  totalDeltas: Partial<Record<StatAxis, number>>;
  exercisesCompleted: number;
  exercisesTotal: number;
  brianMessage: { category: string; text: string };
}

/** Bilan de fin de séance: agrège les gains de tous les blocs de la séance et fait réagir Brian sur l'ensemble. */
export async function recordSessionSummary(input: { userId: string; sessionId: string }): Promise<SessionSummaryResult> {
  const [blocks, deltaRows] = await Promise.all([
    prisma.sessionBlock.findMany({ where: { programSessionId: input.sessionId } }),
    prisma.statDelta.findMany({ where: { userId: input.userId, sessionId: input.sessionId } }),
  ]);

  const totalDeltas: Partial<Record<StatAxis, number>> = {};
  for (const row of deltaRows) totalDeltas[row.axis] = (totalDeltas[row.axis] ?? 0) + row.delta;

  const exercisesCompleted = blocks.filter((b) => b.status === "COMPLETED").length;
  const exercisesTotal = blocks.length;
  const hasAbandonOrSkip = blocks.some((b) => b.status === "ABANDONED" || b.status === "SKIPPED");

  const sortedAxes = STAT_AXES.filter((axis) => totalDeltas[axis]).sort((a, b) => totalDeltas[b]! - totalDeltas[a]!);
  const strongestAxisLabel = sortedAxes[0] ? STAT_LABELS[sortedAxes[0]] : null;
  const weakestAxisLabel = sortedAxes.length > 1 ? STAT_LABELS[sortedAxes[sortedAxes.length - 1]] : null;

  const text = composeSessionSummaryMessage({
    exercisesCompleted,
    exercisesTotal,
    totalMinutes: 0,
    strongestAxisLabel,
    weakestAxisLabel,
  });

  await prisma.brianMessage.create({
    data: { userId: input.userId, category: "SESSION_SUMMARY", text, relatedSessionId: input.sessionId },
  });

  await markObjectiveDone(input.userId, "COMPLETE_SESSION");
  if (!hasAbandonOrSkip && exercisesTotal > 0) {
    await markObjectiveDone(input.userId, "NO_ABANDON");
    await markObjectiveDone(input.userId, "COMPLETE_ALL_BLOCKS");
  }

  return { totalDeltas, exercisesCompleted, exercisesTotal, brianMessage: { category: "SESSION_SUMMARY", text } };
}
