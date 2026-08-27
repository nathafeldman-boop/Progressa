import type { Exercise3D } from "../types";

const START = { x: 0, z: -5 };
const FINISH = { x: 0, z: 5 };

export const SPRINT_10_20: Exercise3D = {
  id: "sprint_10_20",
  slug: "sprints-courts-10m",
  title: "Sprint 10m",
  category: "speed",
  repetitions: 5,
  restSeconds: 45,
  loopSeconds: 2.4,
  movement: "RUN",
  playerTrajectory: [START, FINISH],
  setup: [
    { kind: "startZone", at: START, radius: 0.3, label: "Départ" },
    { kind: "targetZone", at: FINISH, radius: 0.3, label: "Arrivée" },
  ],
  equipment: [],
  arrows: [{ from: START, to: FINISH, color: "accent" }],
  phases: [
    { id: "ready", startAt: 0, caption: "Position d'attente, derrière la ligne de départ." },
    { id: "explode", startAt: 0.08, caption: "Explose vers l'avant, appuis courts et puissants.", cue: "Reste bas" },
    { id: "accel", startAt: 0.35, caption: "Accélère, allonge progressivement la foulée." },
    { id: "finish", startAt: 0.8, caption: "Passe la ligne d'arrivée à pleine vitesse, ne ralentis pas avant." },
  ],
  camera: "SIDE",
  statImpact: { VITESSE: 3 },
  difficulty: 3,
};
