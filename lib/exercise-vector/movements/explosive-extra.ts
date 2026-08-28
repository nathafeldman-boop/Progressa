import type { Movement, Pose } from "../types";
import type { Point } from "../ik";

/**
 * Cinquième vague — deux derniers cas "approx" où le mouvement réutilisé
 * montrait une mécanique clairement différente du geste réel (un ballon
 * au sol pour une volée en l'air, un saut vertical pur pour un bond vers
 * l'avant avec réception amortie).
 */

/** Volée: jambe de frappe déjà levée en préparation, contact haut, le
 * ballon reste en l'air (jamais au niveau du sol comme SHOT_STRIKE). */
const VOLLEY_WINDUP: Pose = {
  hip: { x: 115, y: 182 },
  shoulder: { x: 112, y: 102 },
  handA: { x: 150, y: 112 },
  handB: { x: 76, y: 140 },
  footA: { x: 100, y: 290 },
  footB: { x: 85, y: 235 },
};
const VOLLEY_CONTACT: Pose = {
  hip: { x: 120, y: 178 },
  shoulder: { x: 122, y: 98 },
  handA: { x: 90, y: 148 },
  handB: { x: 158, y: 120 },
  footA: { x: 100, y: 290 },
  footB: { x: 170, y: 210 },
};
const VOLLEY_FOLLOW: Pose = {
  hip: { x: 122, y: 174 },
  shoulder: { x: 128, y: 92 },
  handA: { x: 80, y: 150 },
  handB: { x: 168, y: 105 },
  footA: { x: 100, y: 290 },
  footB: { x: 196, y: 190 },
};
const VOLLEY_BALL: Point = { x: 172, y: 205 };
export const VOLLEY_STRIKE: Movement = {
  loopSeconds: 1.2,
  keyframes: [
    { t: 0, pose: VOLLEY_WINDUP, ball: VOLLEY_BALL },
    { t: 0.35, pose: VOLLEY_CONTACT, ball: VOLLEY_BALL },
    { t: 0.65, pose: VOLLEY_FOLLOW, ball: VOLLEY_BALL },
    { t: 1, pose: VOLLEY_WINDUP, ball: VOLLEY_BALL },
  ],
};

/**
 * Bondissement avant avec réception amortie: contrairement à
 * VERTICAL_JUMP (saut pur vers le haut, retour à la même place), ici le
 * corps part explosivement vers l'avant ET vers le haut, puis la
 * réception est large et fléchie (absorption), tenue un instant avant de
 * revenir en position de départ pour le bond suivant.
 */
const BOUND_READY: Pose = {
  hip: { x: 120, y: 215 },
  shoulder: { x: 128, y: 140 },
  handA: { x: 100, y: 208 },
  handB: { x: 148, y: 208 },
  footA: { x: 105, y: 290 },
  footB: { x: 135, y: 290 },
};
const BOUND_AIRBORNE: Pose = {
  hip: { x: 150, y: 168 },
  shoulder: { x: 158, y: 95 },
  handA: { x: 130, y: 120 },
  handB: { x: 178, y: 110 },
  footA: { x: 140, y: 255 },
  footB: { x: 165, y: 250 },
};
const BOUND_LANDING: Pose = {
  hip: { x: 150, y: 222 },
  shoulder: { x: 155, y: 150 },
  handA: { x: 125, y: 215 },
  handB: { x: 178, y: 208 },
  footA: { x: 130, y: 292 },
  footB: { x: 172, y: 290 },
};
export const FORWARD_BOUND: Movement = {
  loopSeconds: 1.5,
  keyframes: [
    { t: 0, pose: BOUND_READY },
    { t: 0.35, pose: BOUND_AIRBORNE },
    { t: 0.55, pose: BOUND_LANDING },
    { t: 0.85, pose: BOUND_LANDING },
    { t: 1, pose: BOUND_READY },
  ],
};
