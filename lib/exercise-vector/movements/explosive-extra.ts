import type { Movement, Pose } from "../types";
import type { Point } from "../ik";
import { JUMPING_JACKS } from "./mobility";
import { SQUAT_UP, SQUAT_DOWN } from "./squat";
import { HIGH_KNEES } from "./run";

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

/**
 * Sixième vague — les 3 derniers cas "approx" qui pouvaient vraiment être
 * améliorés sans casser un mouvement existant déjà validé (le sprint
 * 5-10-5 est un tout nouveau mouvement, pas une modification de SPRINT).
 */

/** Sprint 5-10-5: course, plantage large pour freiner et changer de
 * direction, puis relance de l'autre côté — le "changement de direction"
 * est justement ce que SPRINT seul (ligne droite) ne montre pas. */
const COD_RUN_A: Pose = {
  hip: { x: 115, y: 190 },
  shoulder: { x: 125, y: 112 },
  handA: { x: 145, y: 140 },
  handB: { x: 85, y: 155 },
  footA: { x: 95, y: 285 },
  footB: { x: 150, y: 275 },
};
const COD_PLANT: Pose = {
  hip: { x: 122, y: 205 },
  shoulder: { x: 140, y: 155 },
  handA: { x: 165, y: 175 },
  handB: { x: 90, y: 165 },
  footA: { x: 70, y: 290 },
  footB: { x: 175, y: 282 },
};
const COD_RUN_B: Pose = {
  hip: { x: 125, y: 190 },
  shoulder: { x: 105, y: 112 },
  handA: { x: 75, y: 140 },
  handB: { x: 155, y: 150 },
  footA: { x: 150, y: 275 },
  footB: { x: 95, y: 285 },
};
export const CHANGE_OF_DIRECTION_SPRINT: Movement = {
  loopSeconds: 1.3,
  keyframes: [
    { t: 0, pose: COD_RUN_A },
    { t: 0.35, pose: COD_PLANT },
    { t: 0.65, pose: COD_RUN_B },
    { t: 1, pose: COD_RUN_A },
  ],
};

/**
 * Circuit cardio combiné: jumping jacks -> squat -> genoux hauts, plutôt
 * qu'un seul mouvement répété — c'est justement le principe d'un circuit
 * "combiné". Réutilise les poses déjà vérifiées de JUMPING_JACKS, SQUAT
 * et HIGH_KNEES plutôt que d'en écrire de nouvelles.
 */
const CIRCUIT_STAND = JUMPING_JACKS.keyframes[0].pose;
const CIRCUIT_JACK_OPEN = JUMPING_JACKS.keyframes[1].pose;
const CIRCUIT_HIGH_KNEE = HIGH_KNEES.keyframes[0].pose;
export const CARDIO_CIRCUIT_COMBO: Movement = {
  loopSeconds: 3.6,
  keyframes: [
    { t: 0, pose: CIRCUIT_STAND },
    { t: 0.12, pose: CIRCUIT_JACK_OPEN },
    { t: 0.24, pose: CIRCUIT_STAND },
    { t: 0.4, pose: SQUAT_DOWN },
    { t: 0.55, pose: SQUAT_UP },
    { t: 0.7, pose: CIRCUIT_HIGH_KNEE },
    { t: 0.85, pose: CIRCUIT_STAND },
    { t: 1, pose: CIRCUIT_STAND },
  ],
};

/**
 * Jonglage en déplacement: même bond de jonglage que JUGGLING, mais tout
 * le corps (et le ballon avec lui) se décale d'un côté puis de l'autre —
 * translation rigide, donc les distances internes restent identiques à
 * JUGGLING, déjà validé.
 */
const JUGGLE_MOVE_REST: Pose = {
  hip: { x: 120, y: 186 },
  shoulder: { x: 120, y: 106 },
  handA: { x: 100, y: 172 },
  handB: { x: 140, y: 172 },
  footA: { x: 112, y: 290 },
  footB: { x: 134, y: 288 },
};
const JUGGLE_MOVE_CONTACT: Pose = { ...JUGGLE_MOVE_REST, footB: { x: 138, y: 260 } };
function juggleTravelPose(dx: number, contact: boolean): { pose: Pose; ball: Point } {
  const base = contact ? JUGGLE_MOVE_CONTACT : JUGGLE_MOVE_REST;
  const ballY = contact ? 232 : 96;
  return {
    pose: {
      hip: { x: base.hip.x + dx, y: base.hip.y },
      shoulder: { x: base.shoulder.x + dx, y: base.shoulder.y },
      handA: { x: base.handA.x + dx, y: base.handA.y },
      handB: { x: base.handB.x + dx, y: base.handB.y },
      footA: { x: base.footA.x + dx, y: base.footA.y },
      footB: { x: base.footB.x + dx, y: base.footB.y },
    },
    ball: { x: 132 + dx, y: ballY },
  };
}
export const JUGGLE_ON_THE_MOVE: Movement = {
  loopSeconds: 1.8,
  keyframes: [
    { t: 0, ...juggleTravelPose(-15, false) },
    { t: 0.25, ...juggleTravelPose(0, true) },
    { t: 0.5, ...juggleTravelPose(15, false) },
    { t: 0.75, ...juggleTravelPose(0, true) },
    { t: 1, ...juggleTravelPose(-15, false) },
  ],
};
