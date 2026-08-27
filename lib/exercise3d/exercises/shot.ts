import type { Exercise3D } from "../types";

// Joueur immobile à l'origine (pas de playerTrajectory) — tout le reste
// est positionné relativement, devant lui (+Z).
const BALL_START = { x: 0.1, z: 0.45 };
const GOAL_POS = { x: 0, z: 5 };
const TARGET = { x: 0.7, z: 4.85 };

export const SHOT: Exercise3D = {
  id: "shot",
  slug: "frappe-cadree-zones",
  title: "Frappe cadrée",
  category: "technique",
  repetitions: 8,
  restSeconds: 30,
  loopSeconds: 3,
  movement: "KICK",
  setup: [
    { kind: "footPlacement", at: { x: -0.28, z: 0.25 }, radius: 0.14, label: "Pied d'appui" },
    { kind: "targetZone", at: TARGET, radius: 0.4, label: "Cible" },
  ],
  equipment: [{ kind: "goal", at: GOAL_POS }],
  arrows: [{ from: BALL_START, to: TARGET, curveHeight: 0.9, color: "amber" }],
  ball: { start: BALL_START, kicks: [{ at: 0.6, from: BALL_START, to: TARGET, apex: 1.1, curve: 0.35 }] },
  phases: [
    { id: "approach", startAt: 0, caption: "Approche en angle, yeux sur le ballon." },
    { id: "plant", startAt: 0.35, caption: "Pose le pied d'appui à côté du ballon, pointé vers la cible.", cue: "Pied d'appui" },
    { id: "strike", startAt: 0.55, caption: "Frappe du cou-de-pied verrouillé, cheville ferme.", cue: "Frappe" },
    { id: "follow", startAt: 0.78, caption: "Termine le geste, jambe qui accompagne vers la cible." },
  ],
  camera: "SIDE_45",
  statImpact: { TIR: 3 },
  difficulty: 3,
};
