import type { DailyObjective, ObjectiveKey, StatAxis } from "@prisma/client";
import { prisma } from "@/lib/prisma";

function todayDateOnly(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

const AXIS_OBJECTIVE: Partial<Record<StatAxis, { key: ObjectiveKey; label: string }>> = {
  VITESSE: { key: "WORK_ON_SPEED", label: "Travailler ta vitesse" },
  TECHNIQUE: { key: "WORK_ON_TECHNIQUE", label: "Travailler ta technique" },
  ENDURANCE: { key: "WORK_ON_ENDURANCE", label: "Travailler ton endurance" },
};

const BASE_OBJECTIVES: { key: ObjectiveKey; label: string }[] = [
  { key: "COMPLETE_SESSION", label: "Terminer ta séance du jour" },
  { key: "NO_ABANDON", label: "Terminer sans abandonner" },
];

const STRETCH_OBJECTIVE: { key: ObjectiveKey; label: string } = {
  key: "BEAT_RECORD",
  label: "Battre un record personnel",
};

/**
 * Crée les objectifs du jour s'ils n'existent pas encore (idempotent — safe
 * à appeler à chaque chargement du dashboard). Personnalisé: un des
 * objectifs cible toujours l'axe le plus faible du joueur du moment.
 */
export async function ensureTodayObjectives(userId: string): Promise<DailyObjective[]> {
  const date = todayDateOnly();
  const existing = await prisma.dailyObjective.findMany({ where: { userId, date } });
  if (existing.length > 0) return existing;

  const stats = await prisma.playerStatState.findUnique({ where: { userId } });
  const weakestAxis = stats ? findWeakestAxis(stats) : null;
  const weakestObjective = weakestAxis ? AXIS_OBJECTIVE[weakestAxis] : null;

  const objectives = [...BASE_OBJECTIVES, weakestObjective ?? STRETCH_OBJECTIVE, STRETCH_OBJECTIVE].filter(
    (o, i, arr) => arr.findIndex((x) => x.key === o.key) === i
  );

  await prisma.dailyObjective.createMany({
    data: objectives.map((o) => ({ userId, date, key: o.key, label: o.label })),
    skipDuplicates: true,
  });

  return prisma.dailyObjective.findMany({ where: { userId, date } });
}

function findWeakestAxis(stats: { vitesse: number; technique: number; conduite: number; endurance: number; physique: number; mental: number }): StatAxis {
  const entries: [StatAxis, number][] = [
    ["VITESSE", stats.vitesse],
    ["TECHNIQUE", stats.technique],
    ["CONDUITE", stats.conduite],
    ["ENDURANCE", stats.endurance],
    ["PHYSIQUE", stats.physique],
    ["MENTAL", stats.mental],
  ];
  return entries.reduce((min, cur) => (cur[1] < min[1] ? cur : min))[0];
}

export async function markObjectiveDone(userId: string, key: ObjectiveKey): Promise<void> {
  const date = todayDateOnly();
  await prisma.dailyObjective.updateMany({
    where: { userId, date, key, done: false },
    data: { done: true, completedAt: new Date() },
  });
}
