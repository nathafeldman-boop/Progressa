import type { Exercise3D } from "../types";

const PATH = [
  { x: -0.6, z: -4 },
  { x: 0.6, z: -2 },
  { x: -0.6, z: 0 },
  { x: 0.6, z: 2 },
  { x: 0, z: 4 },
];

export const BALL_DRIBBLE: Exercise3D = {
  id: "ball_dribble",
  slug: "slalom-plots-serre",
  title: "Conduite de balle en slalom",
  category: "technique",
  repetitions: 4,
  restSeconds: 30,
  loopSeconds: 4.4,
  movement: "DRIBBLE_TOUCH",
  playerTrajectory: PATH,
  setup: [{ kind: "startZone", at: PATH[0], radius: 0.28, label: "Départ" }],
  equipment: PATH.slice(1, -1).map((at) => ({ kind: "cone" as const, at })),
  arrows: PATH.slice(0, -1).map((from, i) => ({ from, to: PATH[i + 1], color: "accent" as const })),
  ball: {
    start: PATH[0],
    kicks: [],
  },
  phases: [
    { id: "start", startAt: 0, caption: "Ballon collé au pied, petites touches, tête relevée." },
    { id: "change1", startAt: 0.2, caption: "Change de direction avec l'extérieur du pied à chaque plot.", cue: "Petites touches" },
    { id: "mid", startAt: 0.5, caption: "Garde le ballon proche, ne le laisse jamais s'échapper." },
    { id: "exit", startAt: 0.85, caption: "Accélère en sortant du dernier plot." },
  ],
  camera: "FRONT_45",
  statImpact: { CONDUITE: 3 },
  difficulty: 3,
};
