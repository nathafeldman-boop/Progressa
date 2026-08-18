import type { StatAxis } from "@prisma/client";

export type StatAxisValues = Record<StatAxis, number>;

/**
 * Les 6 axes affichés sur la carte joueur. TECHNIQUE / ENDURANCE / MENTAL
 * restent dans l'enum Prisma pour compat avec d'anciens StatDelta, mais ne
 * sont plus jamais écrits ni affichés — voir le commentaire "déprécié" dans
 * schema.prisma. Étendre ce tableau (+ STAT_LABELS/STAT_SHORT_LABELS) est le
 * seul endroit à toucher pour ajouter un nouvel axe.
 */
export const STAT_AXES: StatAxis[] = ["VITESSE", "TIR", "PASSE", "CONDUITE", "DEFENSE", "PHYSIQUE"];

export const STAT_LABELS: Record<StatAxis, string> = {
  VITESSE: "Vitesse",
  TIR: "Tir",
  PASSE: "Passe",
  CONDUITE: "Dribble",
  DEFENSE: "Défense",
  PHYSIQUE: "Physique",
  TECHNIQUE: "Technique",
  ENDURANCE: "Endurance",
  MENTAL: "Mental",
};

/** Abréviations 3 lettres façon carte joueur (VIT/TIR/PAS/DRI/DEF/PHY). */
export const STAT_SHORT_LABELS: Record<StatAxis, string> = {
  VITESSE: "VIT",
  TIR: "TIR",
  PASSE: "PAS",
  CONDUITE: "DRI",
  DEFENSE: "DEF",
  PHYSIQUE: "PHY",
  TECHNIQUE: "TEC",
  ENDURANCE: "END",
  MENTAL: "MEN",
};
