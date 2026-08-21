import { ExerciseCategory, Objective } from "@prisma/client";
import type { ExerciseSeed } from "./catalog-data";

/**
 * "Besoins" concrets qu'un joueur peut vouloir travailler — dérivés
 * uniquement de category/objectives déjà présents sur chaque exercice
 * (aucune nouvelle donnée à maintenir en double avec le catalogue).
 * "pied_faible" est un cas particulier: ce n'est pas un sous-ensemble
 * d'exercices différent de "dribble", c'est la même gamme technique avec
 * une contrainte imposée à l'exécution (voir weakFootInstruction).
 */
export const TRAINING_NEEDS = [
  "pied_faible",
  "dribble",
  "tir",
  "defense",
  "vitesse",
  "cardio",
  "muscu",
  "prevention",
  "gardien",
] as const;
export type TrainingNeed = (typeof TRAINING_NEEDS)[number];

export const NEED_LABELS: Record<TrainingNeed, string> = {
  pied_faible: "Pied faible",
  dribble: "Dribble & conduite de balle",
  tir: "Frappe & finition",
  defense: "Défense & duels",
  vitesse: "Vitesse & explosivité",
  cardio: "Cardio",
  muscu: "Renforcement musculaire",
  prevention: "Prévention & récupération",
  gardien: "Gardien de but",
};

export const NEED_EMOJI: Record<TrainingNeed, string> = {
  pied_faible: "🦶",
  dribble: "🌀",
  tir: "🥅",
  defense: "🛡️",
  vitesse: "💨",
  cardio: "🫀",
  muscu: "🏋️",
  prevention: "🧘",
  gardien: "🧤",
};

export const NEED_INTRO: Record<TrainingNeed, string> = {
  pied_faible:
    "Ton pied faible, c'est la moitié de ton jeu que tu n'exploites pas encore. Cette séance reprend les gammes techniques, mais tout se joue de ce pied-là — sans exception.",
  dribble: "Le ballon collé au pied, la tête relevée, l'adversaire dans le vent. Cette séance muscle ta technique de conduite et d'élimination.",
  tir: "Une occasion qui ne se transforme pas, c'est un but perdu. Cette séance travaille ta frappe sous toutes ses formes: puissance, précision, volée.",
  defense: "Un bon défenseur ne subit pas le jeu, il l'anticipe. Cette séance travaille ton placement, tes duels et ton timing défensif.",
  vitesse: "Les matchs se gagnent souvent sur les 5 premiers mètres. Cette séance travaille ton explosivité et ta vitesse de réaction.",
  cardio: "Un joueur qui tient physiquement jusqu'à la 90e, c'est un joueur qui pèse sur le match jusqu'au bout. Cette séance construit ton endurance.",
  muscu: "Gagner tes duels commence par être plus fort. Cette séance renforce les appuis et le gainage dont tu as besoin sur le terrain.",
  prevention: "Le meilleur entraînement, c'est celui que tu ne rates pas à cause d'une blessure. Cette séance protège tes chevilles, genoux et ischios.",
  gardien: "Une séance pensée spécifiquement pour ton poste: réflexes, prises de balle, relances.",
};

/** Pool d'exercices pour un besoin donné, à partir du catalogue déjà filtré (âge/poste/matériel/Premium). */
export function exercisesForNeed(catalog: ExerciseSeed[], need: TrainingNeed): ExerciseSeed[] {
  switch (need) {
    case "dribble":
    case "pied_faible":
      return catalog.filter(
        (e) => e.category === ExerciseCategory.TECHNIQUE && e.objectives.includes(Objective.TECHNIQUE_DRIBBLING)
      );
    case "tir":
      return catalog.filter((e) => e.category === ExerciseCategory.TECHNIQUE && e.objectives.includes(Objective.SHOOTING));
    case "defense":
      return catalog.filter((e) => e.category === ExerciseCategory.TECHNIQUE && e.objectives.includes(Objective.PHYSICAL_DUELS));
    case "vitesse":
      return catalog.filter((e) => e.category === ExerciseCategory.EXPLOSIVENESS);
    case "cardio":
      return catalog.filter((e) => e.category === ExerciseCategory.CARDIO);
    case "muscu":
      return catalog.filter((e) => e.category === ExerciseCategory.STRENGTH);
    case "prevention":
      return catalog.filter((e) => e.category === ExerciseCategory.PREVENTION);
    case "gardien":
      return catalog.filter((e) => e.category === ExerciseCategory.GOALKEEPER);
  }
}

/** Catégories d'échauffement/retour au calme cohérentes avec un besoin (jamais gardien/prévention en warmup d'une séance prévention par ex). */
export function warmupPoolForNeed(catalog: ExerciseSeed[], need: TrainingNeed): ExerciseSeed[] {
  if (need === "gardien") return catalog.filter((e) => e.category === ExerciseCategory.GOALKEEPER);
  return catalog.filter((e) => e.category === ExerciseCategory.CARDIO || e.category === ExerciseCategory.EXPLOSIVENESS);
}

export function cooldownPoolForNeed(catalog: ExerciseSeed[]): ExerciseSeed[] {
  return catalog.filter((e) => e.category === ExerciseCategory.PREVENTION);
}

/** Consigne réécrite pour imposer le pied faible, sans dupliquer l'exercice dans le catalogue. */
export function instructionForNeed(exercise: ExerciseSeed, need: TrainingNeed): string {
  if (need === "pied_faible") {
    return `${exercise.name} — fais tout l'exercice avec ton pied faible uniquement, même si c'est plus dur au début.`;
  }
  return `Fais "${exercise.name}" en respectant les étapes indiquées.`;
}
