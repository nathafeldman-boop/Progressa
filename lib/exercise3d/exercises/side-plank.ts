import type { Exercise3D } from "../types";

export const SIDE_PLANK: Exercise3D = {
  id: "side_plank",
  slug: "gainage-lateral",
  title: "Gainage latéral",
  category: "strength",
  durationSeconds: 30,
  repetitions: 3,
  restSeconds: 20,
  // Pose statique: loopSeconds sert seulement à faire respirer légèrement
  // la pose (pas de vrai cycle de mouvement) — voir movements.ts poseSidePlank.
  loopSeconds: 3,
  movement: "SIDE_PLANK",
  // Debout, pose validée, PUIS rotation rigide de tout le corps à
  // l'horizontale (voir types.ts restRotationDeg) — jamais recalculée
  // articulation par articulation pour cette nouvelle orientation.
  restRotationDeg: [0, 0, 90],
  // Après rotation rigide de 90° en Z, le corps (debout de 0 à ~1.8m en Y)
  // s'étend maintenant en X négatif depuis les pieds (restés à l'origine)
  // — décalé pour recentrer le corps sous la caméra plutôt que de le
  // laisser filer hors cadre.
  restPosition: [0.9, 0.7, 0],
  setup: [],
  equipment: [],
  arrows: [],
  phases: [
    { id: "setup", startAt: 0, caption: "Allongé sur le côté, coude placé exactement sous l'épaule." },
    { id: "lift", startAt: 0.25, caption: "Soulève le bassin, corps parfaitement aligné.", cue: "Tête-épaules-hanches-chevilles" },
    { id: "hold", startAt: 0.5, caption: "Maintiens la position sans laisser tomber la hanche." },
  ],
  camera: "SIDE",
  statImpact: { PHYSIQUE: 2 },
  difficulty: 2,
};
