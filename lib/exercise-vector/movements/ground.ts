import type { Movement, Pose } from "../types";
import { holdMovement } from "../mirror";

/** Planche ventrale (avant-bras au sol): position allongée, tenue statique. */
const PLANK_FRONT: Pose = {
  hip: { x: 155, y: 224 },
  shoulder: { x: 85, y: 222 },
  handA: { x: 66, y: 258 },
  handB: { x: 74, y: 258 },
  footA: { x: 260, y: 240 },
  footB: { x: 266, y: 246 },
};
export const PLANK_FRONT_HOLD: Movement = holdMovement(PLANK_FRONT);

/** Gainage dynamique (mountain climbers): jambe B qui vient ramener le
 * genou sous la hanche pendant que le corps reste en position de planche
 * haute (bras tendus) — alterne A/B. */
const CLIMBER_UP: Pose = {
  hip: { x: 150, y: 220 },
  shoulder: { x: 80, y: 200 },
  handA: { x: 68, y: 268 },
  handB: { x: 76, y: 268 },
  footA: { x: 258, y: 236 },
  footB: { x: 158, y: 244 },
};
const CLIMBER_DOWN_B: Pose = { ...CLIMBER_UP, footB: { x: 258, y: 236 } };
export const MOUNTAIN_CLIMBERS: Movement = {
  loopSeconds: 0.8,
  keyframes: [
    { t: 0, pose: CLIMBER_UP },
    { t: 0.5, pose: CLIMBER_DOWN_B },
    { t: 1, pose: CLIMBER_UP },
  ],
};

/** Planche latérale: appui sur un avant-bras, corps de profil gerbé vers
 * le haut, bras libre tendu au plafond — vue de face pour bien lire
 * l'alignement. */
const PLANK_SIDE: Pose = {
  hip: { x: 150, y: 220 },
  shoulder: { x: 90, y: 196 },
  handA: { x: 74, y: 236 },
  handB: { x: 90, y: 140 },
  footA: { x: 254, y: 232 },
  footB: { x: 254, y: 244 },
};
export const PLANK_SIDE_HOLD: Movement = holdMovement(PLANK_SIDE);

/** Oiseau-chien: à quatre pattes, bras et jambe opposés tendus — tenue,
 * alterne les côtés par mirrorAB entre deux tenues successives (pas une
 * boucle rapide, un vrai changement de côté). */
const BIRD_DOG_B: Pose = {
  hip: { x: 170, y: 205 },
  shoulder: { x: 100, y: 185 },
  // main d'appui, sous l'épaule
  handA: { x: 98, y: 258 },
  // bras tendu vers l'avant (bas, pour ne pas croiser la tête)
  handB: { x: 35, y: 225 },
  // genou d'appui, sous la hanche
  footA: { x: 168, y: 275 },
  // jambe tendue vers l'arrière
  footB: { x: 232, y: 210 },
};
const BIRD_DOG_A: Pose = { ...BIRD_DOG_B, handA: BIRD_DOG_B.handB, handB: BIRD_DOG_B.handA, footA: BIRD_DOG_B.footB, footB: BIRD_DOG_B.footA };
export const BIRD_DOG: Movement = {
  loopSeconds: 3.6,
  keyframes: [
    { t: 0, pose: BIRD_DOG_B },
    { t: 0.5, pose: BIRD_DOG_A },
    { t: 1, pose: BIRD_DOG_B },
  ],
};

/** Pompes: mains fixes au sol, tout le corps (épaule+hanche) descend et
 * remonte, jambes tendues derrière. */
const PUSHUP_UP: Pose = {
  hip: { x: 150, y: 224 },
  shoulder: { x: 85, y: 222 },
  handA: { x: 70, y: 295 },
  handB: { x: 80, y: 295 },
  footA: { x: 258, y: 242 },
  footB: { x: 264, y: 248 },
};
const PUSHUP_DOWN: Pose = { ...PUSHUP_UP, shoulder: { x: 85, y: 252 }, hip: { x: 150, y: 254 } };
export const PUSHUP: Movement = {
  loopSeconds: 1.6,
  keyframes: [
    { t: 0, pose: PUSHUP_UP },
    { t: 0.5, pose: PUSHUP_DOWN },
    { t: 1, pose: PUSHUP_UP },
  ],
};

/** Hip thrust: épaules fixes au sol/banc, hanche qui monte et descend,
 * pieds à plat au sol genoux fléchis. */
const THRUST_SHOULDER = { x: 95, y: 250 };
const THRUST_FOOT = { x: 217, y: 290 };
const THRUST_DOWN: Pose = {
  hip: { x: 155, y: 276 },
  shoulder: THRUST_SHOULDER,
  handA: { x: 143, y: 262 },
  handB: { x: 167, y: 262 },
  footA: { x: 211, y: 290 },
  footB: THRUST_FOOT,
};
const THRUST_UP: Pose = { ...THRUST_DOWN, hip: { x: 155, y: 234 } };
export const HIP_THRUST: Movement = {
  loopSeconds: 1.5,
  keyframes: [
    { t: 0, pose: THRUST_DOWN },
    { t: 0.5, pose: THRUST_UP },
    { t: 1, pose: THRUST_DOWN },
  ],
};
