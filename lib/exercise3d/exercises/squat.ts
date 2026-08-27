import type { Exercise3D } from "../types";

export const SQUAT: Exercise3D = {
  id: "squat",
  slug: "squats-poids-du-corps",
  title: "Squat",
  category: "strength",
  repetitions: 12,
  restSeconds: 30,
  loopSeconds: 2.6,
  movement: "SQUAT",
  setup: [
    { kind: "footPlacement", at: { x: -0.24, z: 0 }, radius: 0.16, label: "Pied gauche" },
    { kind: "footPlacement", at: { x: 0.24, z: 0 }, radius: 0.16, label: "Pied droit" },
  ],
  equipment: [],
  // Pas de flèche au sol ici: le squat n'a pas de déplacement horizontal à
  // indiquer — la légende de phase + le repère ("Dos droit", "Genoux dans
  // l'axe") suffisent, une flèche forcée sur un geste vertical serait
  // moins claire qu'un vrai indicateur, pas plus.
  arrows: [],
  phases: [
    { id: "up", startAt: 0, caption: "Pieds largeur épaules, dos droit, regard devant toi." },
    { id: "down", startAt: 0.2, caption: "Descends en poussant les fesses en arrière.", cue: "Dos droit" },
    { id: "bottom", startAt: 0.45, caption: "Cuisses parallèles au sol, genoux dans l'axe des pieds.", cue: "Genoux dans l'axe" },
    { id: "up2", startAt: 0.75, caption: "Remonte en poussant sur les talons." },
  ],
  camera: "FRONT_45",
  statImpact: { PHYSIQUE: 2 },
  difficulty: 2,
};
