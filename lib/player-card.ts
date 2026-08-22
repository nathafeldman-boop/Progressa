import type { EvaluationResult, PlayerStatState } from "@prisma/client";
import { EvaluationTestType, type StatAxis } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { STAT_AXES, STAT_LABELS, type StatAxisValues } from "@/lib/brian/types";
import { computeOverall, rankTierForOverall } from "@/lib/brian/stats-engine";

/**
 * Bornes indicatives (à recalibrer avec des données réelles) pour convertir
 * une mesure brute en note /100, façon carte de jeu vidéo (section 6.6).
 */
const RANGES: Record<EvaluationTestType, { min: number; max: number; lowerIsBetter: boolean; skill: string }> = {
  JUGGLING: { min: 5, max: 150, lowerIsBetter: false, skill: "Technique" },
  SHUTTLE_5X10: { min: 14, max: 22, lowerIsBetter: true, skill: "Agilité" },
  PLANK: { min: 20, max: 180, lowerIsBetter: false, skill: "Gainage" },
  SPRINT_20M: { min: 2.6, max: 4.5, lowerIsBetter: true, skill: "Vitesse" },
  TIR_PRECISION: { min: 1, max: 9, lowerIsBetter: false, skill: "Tir" },
  PASSE_PRECISION: { min: 1, max: 9, lowerIsBetter: false, skill: "Passe" },
};

function normalize(value: number, type: EvaluationTestType): number {
  const { min, max, lowerIsBetter } = RANGES[type];
  const clamped = Math.min(Math.max(value, Math.min(min, max)), Math.max(min, max));
  const ratio = lowerIsBetter ? (max - clamped) / (max - min) : (clamped - min) / (max - min);
  return Math.round(Math.min(Math.max(ratio, 0), 1) * 100);
}

export interface PlayerCardStats {
  overall: number;
  skills: Record<string, number>;
  // Absents sur les cartes créées avant l'introduction de Coach Brian —
  // toujours présents sur toute carte recalculée via syncPlayerCard().
  rankTier?: string;
  rankKey?: string;
  lastUpdated: string;
}

/** Prend le meilleur résultat de chaque type de test pour construire la carte. */
export function computePlayerCardStats(results: EvaluationResult[]): PlayerCardStats {
  const bestByType = new Map<EvaluationTestType, EvaluationResult>();
  for (const result of results) {
    const current = bestByType.get(result.testType);
    if (!current) {
      bestByType.set(result.testType, result);
      continue;
    }
    const { lowerIsBetter } = RANGES[result.testType];
    const better = lowerIsBetter ? result.value < current.value : result.value > current.value;
    if (better) bestByType.set(result.testType, result);
  }

  const skills: Record<string, number> = {};
  for (const [type, result] of bestByType.entries()) {
    skills[RANGES[type].skill] = normalize(result.value, type);
  }

  const scores = Object.values(skills);
  const overall = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  return { overall, skills, lastUpdated: new Date().toISOString() };
}

const DEFAULT_STAT_VALUES: StatAxisValues = {
  VITESSE: 50,
  TIR: 50,
  PASSE: 50,
  CONDUITE: 50,
  DEFENSE: 50,
  PHYSIQUE: 50,
  TECHNIQUE: 50,
  ENDURANCE: 50,
  MENTAL: 50,
};

/**
 * Quel axe carte un test d'évaluation vient affiner — les 6 tests couvrent
 * désormais les 6 axes de la carte, un par un. Ajouter un test pour un axe
 * non couvert est le seul endroit à toucher ici.
 */
const TEST_AXIS: Partial<Record<EvaluationTestType, StatAxis>> = {
  SPRINT_20M: "VITESSE",
  JUGGLING: "CONDUITE",
  SHUTTLE_5X10: "DEFENSE",
  PLANK: "PHYSIQUE",
  TIR_PRECISION: "TIR",
  PASSE_PRECISION: "PASSE",
};

function statStateToAxisValues(statState: PlayerStatState | null): StatAxisValues {
  if (!statState) return { ...DEFAULT_STAT_VALUES };
  return {
    VITESSE: statState.vitesse,
    TIR: statState.tir,
    PASSE: statState.passe,
    CONDUITE: statState.conduite,
    DEFENSE: statState.defense,
    PHYSIQUE: statState.physique,
    TECHNIQUE: statState.technique,
    ENDURANCE: statState.endurance,
    MENTAL: statState.mental,
  };
}

/**
 * La carte unifiée: base = progression réelle issue des séances (Coach
 * Brian), affinée par les tests d'évaluation formels quand ils existent
 * (un sprint chronométré en dit plus sur l'axe Vitesse qu'une estimation
 * dérivée des séances seules). C'est cette fonction, et elle seule, qui
 * doit alimenter PlayerCard — jamais une valeur inventée.
 */
export function buildUnifiedPlayerCardStats(
  statState: PlayerStatState | null,
  evaluationResults: EvaluationResult[]
): PlayerCardStats {
  const base = statStateToAxisValues(statState);

  const bestByType = new Map<EvaluationTestType, EvaluationResult>();
  for (const result of evaluationResults) {
    const current = bestByType.get(result.testType);
    if (!current) {
      bestByType.set(result.testType, result);
      continue;
    }
    const { lowerIsBetter } = RANGES[result.testType];
    const better = lowerIsBetter ? result.value < current.value : result.value > current.value;
    if (better) bestByType.set(result.testType, result);
  }

  const blended = { ...base };
  for (const [type] of bestByType) {
    const axis = TEST_AXIS[type];
    if (!axis) continue;
    const testScore = normalize(bestByType.get(type)!.value, type);
    blended[axis] = Math.round(blended[axis] * 0.6 + testScore * 0.4);
  }

  const skills: Record<string, number> = {};
  for (const axis of STAT_AXES) skills[STAT_LABELS[axis]] = blended[axis];

  const overall = computeOverall(blended);
  const tier = rankTierForOverall(overall);

  return { overall, skills, rankTier: tier.label, rankKey: tier.key, lastUpdated: new Date().toISOString() };
}

function randomShareSlug(): string {
  return Math.random().toString(36).slice(2, 10);
}

/** Point d'écriture unique de PlayerCard — appelé après un test ET après une séance. */
export async function syncPlayerCard(userId: string): Promise<PlayerCardStats> {
  const [statState, evaluationResults, existingCard] = await Promise.all([
    prisma.playerStatState.findUnique({ where: { userId } }),
    prisma.evaluationResult.findMany({ where: { userId } }),
    prisma.playerCard.findUnique({ where: { userId } }),
  ]);

  const stats = buildUnifiedPlayerCardStats(statState, evaluationResults);
  const statsJson = JSON.parse(JSON.stringify(stats));

  await prisma.playerCard.upsert({
    where: { userId },
    create: { userId, stats: statsJson, shareSlug: existingCard?.shareSlug ?? randomShareSlug() },
    update: { stats: statsJson },
  });

  return stats;
}
