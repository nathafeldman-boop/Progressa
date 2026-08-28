import type { Movement, Pose } from "../types";
import type { Point } from "../ik";

/**
 * Frappe / passe: pied d'appui (A) fixe à côté du ballon, jambe de frappe
 * (B) qui arme puis balaie à travers le ballon puis termine le geste.
 * Le ballon reste fixe (repère visuel de la zone de contact, pas une
 * simulation de trajectoire) — cohérent avec une boucle continue.
 */
export const PLANT: Point = { x: 100, y: 290 };

export const WINDUP: Pose = {
  hip: { x: 115, y: 182 },
  shoulder: { x: 112, y: 102 },
  handA: { x: 150, y: 112 },
  handB: { x: 76, y: 140 },
  footA: PLANT,
  footB: { x: 72, y: 252 },
};

export const CONTACT: Pose = {
  hip: { x: 120, y: 180 },
  shoulder: { x: 122, y: 100 },
  handA: { x: 92, y: 150 },
  handB: { x: 156, y: 122 },
  footA: PLANT,
  footB: { x: 172, y: 268 },
};

export const FOLLOW_THROUGH: Pose = {
  hip: { x: 122, y: 176 },
  shoulder: { x: 128, y: 96 },
  handA: { x: 80, y: 158 },
  handB: { x: 166, y: 108 },
  footA: PLANT,
  footB: { x: 196, y: 226 },
};

export const BALL: Point = { x: 152, y: 298 };

export const SHOT_STRIKE: Movement = {
  loopSeconds: 1.3,
  keyframes: [
    { t: 0, pose: WINDUP, ball: BALL },
    { t: 0.38, pose: CONTACT, ball: BALL },
    { t: 0.68, pose: FOLLOW_THROUGH, ball: BALL },
    { t: 1, pose: WINDUP, ball: BALL },
  ],
};

/** Passe: même schéma, geste plus court (moins d'amplitude, moins de recul). */
export const PASS_WINDUP: Pose = { ...WINDUP, footB: { x: 86, y: 268 }, handB: { x: 90, y: 158 } };
export const PASS_CONTACT: Pose = { ...CONTACT, footB: { x: 160, y: 276 } };
export const PASS_FOLLOW: Pose = { ...FOLLOW_THROUGH, footB: { x: 180, y: 250 }, handA: { x: 94, y: 164 } };
export const PASS_STRIKE: Movement = {
  loopSeconds: 1.1,
  keyframes: [
    { t: 0, pose: PASS_WINDUP, ball: BALL },
    { t: 0.4, pose: PASS_CONTACT, ball: BALL },
    { t: 0.7, pose: PASS_FOLLOW, ball: BALL },
    { t: 1, pose: PASS_WINDUP, ball: BALL },
  ],
};
