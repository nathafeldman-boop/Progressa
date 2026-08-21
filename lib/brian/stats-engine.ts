import type { BlockPhase, BlockStatus, Exercise, ExerciseCategory, FeltDifficulty, Objective, StatAxis } from "@prisma/client";
import { STAT_AXES } from "./types";
import type { StatAxisValues } from "./types";

/**
 * Comment un delta se répartit entre les 6 axes de la carte (VIT/TIR/PAS/
 * DRI/DEF/PHY) selon la catégorie de l'exercice — c'est la seule source de
 * "quel exercice muscle quelle stat" (section 5 du cahier des charges
 * carte joueur). Étendre cette table est le seul endroit à toucher pour
 * faire contribuer une nouvelle catégorie d'exercice à un axe.
 */
export const CATEGORY_WEIGHTS: Record<ExerciseCategory, Partial<Record<StatAxis, number>>> = {
  TECHNIQUE: { CONDUITE: 0.7, PASSE: 0.3 },
  STRENGTH: { PHYSIQUE: 1 },
  EXPLOSIVENESS: { VITESSE: 0.8, PHYSIQUE: 0.2 },
  CARDIO: { PHYSIQUE: 1 },
  PREVENTION: { PHYSIQUE: 1 },
  GOALKEEPER: { DEFENSE: 0.5, CONDUITE: 0.3, PHYSIQUE: 0.2 },
};

export const OBJECTIVE_WEIGHTS: Record<Objective, Partial<Record<StatAxis, number>>> = {
  SPEED_EXPLOSIVENESS: { VITESSE: 1 },
  TECHNIQUE_DRIBBLING: { CONDUITE: 0.7, PASSE: 0.3 },
  PHYSICAL_DUELS: { PHYSIQUE: 0.6, DEFENSE: 0.4 },
  ENDURANCE: { PHYSIQUE: 1 },
  SHOOTING: { TIR: 1 },
  ALL_ROUND: { VITESSE: 1 / 6, TIR: 1 / 6, PASSE: 1 / 6, CONDUITE: 1 / 6, DEFENSE: 1 / 6, PHYSIQUE: 1 / 6 },
};

const PHASE_BASE_DELTA: Record<BlockPhase, number> = {
  MAIN: 3,
  WARMUP: 1,
  COOLDOWN: 1,
};

const DIFFICULTY_MULTIPLIER: Record<FeltDifficulty, number> = {
  VERY_EASY: 0.85,
  EASY: 0.95,
  MEDIUM: 1,
  HARD: 1.15,
  VERY_HARD: 1.25,
};

/**
 * Un abandon (quitte en cours) ne doit jamais rapporter autant qu'une
 * exécution complète — sinon rien ne distingue un joueur sérieux d'un
 * joueur qui saute tout. Un skip pur ne rapporte rien.
 */
export function qualityMultiplier(
  status: BlockStatus,
  feltDifficulty: FeltDifficulty | null,
  actualDurationSeconds: number | null,
  expectedDurationSeconds: number
): number {
  if (status === "SKIPPED") return 0;
  if (status === "ABANDONED") return 0.15;

  let multiplier = DIFFICULTY_MULTIPLIER[feltDifficulty ?? "MEDIUM"];

  // Complété mais anormalement vite par rapport au temps prévu, sans
  // ressenti "facile" déclaré: traité comme suspect plutôt que comme une
  // performance brillante, pour ne pas récompenser un exercice bâclé.
  if (actualDurationSeconds != null && expectedDurationSeconds > 0) {
    const ratio = actualDurationSeconds / expectedDurationSeconds;
    const declaredEasy = feltDifficulty === "VERY_EASY" || feltDifficulty === "EASY";
    if (ratio < 0.4 && !declaredEasy) {
      multiplier = Math.min(multiplier, 0.6);
    }
  }

  return multiplier;
}

/**
 * Petit bonus PHYSIQUE pour la discipline (aller au bout d'un exercice
 * difficile plutôt que le fuir) — l'ancien axe MENTAL (retiré des 6 axes de
 * la carte) jouait ce rôle ; on le replie sur PHYSIQUE plutôt que de perdre
 * l'incitatif.
 */
const DISCIPLINE_BONUS_BY_DIFFICULTY: Partial<Record<FeltDifficulty, number>> = {
  HARD: 2,
  VERY_HARD: 3,
};

export interface BlockDeltaInput {
  category: ExerciseCategory;
  objectives: Objective[];
  phase: BlockPhase;
  status: BlockStatus;
  feltDifficulty: FeltDifficulty | null;
  actualDurationSeconds: number | null;
  expectedDurationSeconds: number;
}

/** Répartit un delta de base entre les axes concernés, pondéré par la qualité réelle de l'exécution. Fonction pure — aucun accès DB. */
export function computeBlockStatDeltas(input: BlockDeltaInput): Partial<Record<StatAxis, number>> {
  const quality = qualityMultiplier(
    input.status,
    input.feltDifficulty,
    input.actualDurationSeconds,
    input.expectedDurationSeconds
  );
  if (quality <= 0) return {};

  const categoryWeights = CATEGORY_WEIGHTS[input.category];
  const objectiveWeights = input.objectives.length
    ? averageWeights(input.objectives.map((o) => OBJECTIVE_WEIGHTS[o]))
    : null;

  const combined = objectiveWeights ? mergeWeights(categoryWeights, objectiveWeights, 0.7) : categoryWeights;
  const normalized = normalizeWeights(combined);

  const baseDelta = PHASE_BASE_DELTA[input.phase] * quality;

  const deltas: Partial<Record<StatAxis, number>> = {};
  for (const axis of STAT_AXES) {
    const weight = normalized[axis];
    if (!weight) continue;
    const value = Math.round(baseDelta * weight);
    if (value > 0) deltas[axis] = value;
  }

  if (input.status === "COMPLETED") {
    const disciplineBonus = DISCIPLINE_BONUS_BY_DIFFICULTY[input.feltDifficulty ?? "MEDIUM"];
    if (disciplineBonus) deltas.PHYSIQUE = (deltas.PHYSIQUE ?? 0) + disciplineBonus;
  }

  return deltas;
}

function averageWeights(list: Partial<Record<StatAxis, number>>[]): Partial<Record<StatAxis, number>> {
  const sum: Partial<Record<StatAxis, number>> = {};
  for (const weights of list) {
    for (const axis of STAT_AXES) {
      const w = weights[axis];
      if (w) sum[axis] = (sum[axis] ?? 0) + w / list.length;
    }
  }
  return sum;
}

function mergeWeights(
  a: Partial<Record<StatAxis, number>>,
  b: Partial<Record<StatAxis, number>>,
  weightA: number
): Partial<Record<StatAxis, number>> {
  const merged: Partial<Record<StatAxis, number>> = {};
  for (const axis of STAT_AXES) {
    const va = (a[axis] ?? 0) * weightA;
    const vb = (b[axis] ?? 0) * (1 - weightA);
    if (va + vb > 0) merged[axis] = va + vb;
  }
  return merged;
}

function normalizeWeights(weights: Partial<Record<StatAxis, number>>): Partial<Record<StatAxis, number>> {
  const total = STAT_AXES.reduce((sum, axis) => sum + (weights[axis] ?? 0), 0);
  if (total <= 0) return {};
  const normalized: Partial<Record<StatAxis, number>> = {};
  for (const axis of STAT_AXES) {
    const w = weights[axis];
    if (w) normalized[axis] = w / total;
  }
  return normalized;
}

export function applyDeltas(current: StatAxisValues, deltas: Partial<Record<StatAxis, number>>): StatAxisValues {
  const next = { ...current };
  for (const axis of STAT_AXES) {
    const delta = deltas[axis];
    if (!delta) continue;
    next[axis] = Math.max(0, Math.min(99, next[axis] + delta));
  }
  return next;
}

export function computeOverall(stats: StatAxisValues): number {
  const total = STAT_AXES.reduce((sum, axis) => sum + stats[axis], 0);
  return Math.round(total / STAT_AXES.length);
}

export interface RankTier {
  key: string;
  min: number;
  label: string;
}

/**
 * Les 8 rangs de la carte joueur (section 9 du cahier des charges).
 * Seuils centralisés ICI et nulle part ailleurs — un composant qui a
 * besoin du rang d'un joueur appelle rankTierForOverall(), il ne
 * recalcule jamais un seuil lui-même. `key` est stable (utilisé par
 * l'identité visuelle de la carte, cf. lib/card/rank-styles.ts) — `label`
 * peut changer sans casser le style associé.
 */
export const RANK_TIERS: RankTier[] = [
  { key: "elite_supreme", min: 90, label: "Élite Suprême" },
  { key: "elite", min: 80, label: "Élite" },
  { key: "pro", min: 70, label: "Pro" },
  { key: "espoir", min: 60, label: "Espoir" },
  { key: "confirme", min: 50, label: "Confirmé" },
  { key: "avance", min: 40, label: "Avancé" },
  { key: "intermediaire", min: 30, label: "Intermédiaire" },
  { key: "debutant", min: 0, label: "Débutant" },
];

export function rankTierForOverall(overall: number): RankTier {
  return RANK_TIERS.find((tier) => overall >= tier.min) ?? RANK_TIERS[RANK_TIERS.length - 1];
}

/** Progression réelle (0-100) vers le rang suivant — null au rang maximum (rien au-dessus). */
export function nextRankProgress(overall: number): { percent: number; nextLabel: string; pointsToGo: number } | null {
  const currentIndex = RANK_TIERS.findIndex((tier) => overall >= tier.min);
  const current = RANK_TIERS[currentIndex];
  const next = RANK_TIERS[currentIndex - 1];
  if (!next) return null;
  const span = next.min - current.min;
  const percent = span > 0 ? Math.min(100, Math.max(0, ((overall - current.min) / span) * 100)) : 100;
  return { percent, nextLabel: next.label, pointsToGo: Math.max(0, next.min - overall) };
}

export function expectedDurationSeconds(exercise: Pick<Exercise, "durationMinutes">): number {
  return exercise.durationMinutes * 60;
}
