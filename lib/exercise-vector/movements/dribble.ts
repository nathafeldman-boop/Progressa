import { mirrorAB } from "../mirror";
import type { Movement, Pose } from "../types";

/** Conduite de balle: touches alternées, ballon collé aux pieds — le
 * ballon suit le pied qui touche (footB), pas la boucle générique
 * alternatingCycle (elle ne sait pas déplacer le ballon), donc écrit ici
 * à la main. */
const TOUCH_B: Pose = {
  hip: { x: 122, y: 188 },
  shoulder: { x: 122, y: 108 },
  handA: { x: 98, y: 176 },
  handB: { x: 150, y: 150 },
  footA: { x: 104, y: 290 },
  footB: { x: 150, y: 282 },
};
const TOUCH_A: Pose = mirrorAB(TOUCH_B);

export const BALL_DRIBBLE: Movement = {
  loopSeconds: 1.2,
  keyframes: [
    { t: 0, pose: TOUCH_B, ball: { x: 154, y: 300 } },
    { t: 0.5, pose: TOUCH_A, ball: { x: 90, y: 300 } },
    { t: 1, pose: TOUCH_B, ball: { x: 154, y: 300 } },
  ],
};

/** Jonglages: ballon qui monte et descend devant le personnage, pied qui
 * vient le relancer — position quasi statique, seule la jambe B se lève
 * légèrement à l'impact. */
const JUGGLE_CONTACT: Pose = {
  hip: { x: 120, y: 186 },
  shoulder: { x: 120, y: 106 },
  handA: { x: 100, y: 172 },
  handB: { x: 140, y: 172 },
  footA: { x: 112, y: 290 },
  footB: { x: 138, y: 260 },
};
const JUGGLE_REST: Pose = { ...JUGGLE_CONTACT, footB: { x: 134, y: 288 } };
export const JUGGLING: Movement = {
  loopSeconds: 0.9,
  keyframes: [
    { t: 0, pose: JUGGLE_REST, ball: { x: 132, y: 96 } },
    { t: 0.5, pose: JUGGLE_CONTACT, ball: { x: 132, y: 232 } },
    { t: 1, pose: JUGGLE_REST, ball: { x: 132, y: 96 } },
  ],
};
