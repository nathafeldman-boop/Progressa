import type { BrianState } from "@/components/brian/BrianAvatar";

/**
 * Une pose + une phrase Coach Brian par type de test, jamais par position —
 * si `eligible` ne contient qu'une partie des 6 tests (cooldown en cours),
 * ces phrases restent valides. Déterministe (cf. règle générale sur
 * BrianAvatar) : jamais de tirage aléatoire.
 */
export const BRIAN_STATE_FOR_TEST: Partial<Record<string, BrianState>> = {
  PLANK: "motivated",
  SHUTTLE_5X10: "encouraging",
  SPRINT_20M: "confident",
  JUGGLING: "surprised",
  TIR_PRECISION: "thinking",
  PASSE_PRECISION: "happy",
};

export const COACH_LINE_FOR_TEST: Partial<Record<string, string>> = {
  PLANK: "On commence par ton physique. 💪",
  SHUTTLE_5X10: "Bien. Voyons ton repli défensif.",
  SPRINT_20M: "Maintenant, voyons ta vitesse. ⚡",
  JUGGLING: "Intéressant… continuons.",
  TIR_PRECISION: "Encore quelques statistiques.",
  PASSE_PRECISION: "J'ai presque terminé ton analyse. 👀",
};

export const DEFAULT_BRIAN_STATE: BrianState = "confident";
export const DEFAULT_COACH_LINE = "Continuons ton évaluation.";
