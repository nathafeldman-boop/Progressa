import type { EvaluationResult } from "@prisma/client";
import { EvaluationTestType } from "@prisma/client";

/**
 * Bornes indicatives (à recalibrer avec des données réelles) pour convertir
 * une mesure brute en note /100, façon carte de jeu vidéo (section 6.6).
 */
const RANGES: Record<EvaluationTestType, { min: number; max: number; lowerIsBetter: boolean; skill: string }> = {
  JUGGLING: { min: 5, max: 150, lowerIsBetter: false, skill: "Technique" },
  SHUTTLE_5X10: { min: 14, max: 22, lowerIsBetter: true, skill: "Agilité" },
  PLANK: { min: 20, max: 180, lowerIsBetter: false, skill: "Gainage" },
  SPRINT_20M: { min: 2.6, max: 4.5, lowerIsBetter: true, skill: "Vitesse" },
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
