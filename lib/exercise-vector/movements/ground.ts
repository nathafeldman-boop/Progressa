import type { Movement, Pose } from "../types";
import { holdMovement } from "../mirror";

/**
 * Toutes les poses allongées partagent un cadre plus large que le
 * standard (340×260 au lieu de 240×340) — un corps étiré à l'horizontale
 * a besoin de ~200px de large pour tenir sans jambe trop pliée ni tête
 * hors cadre ; le cadre portrait standard ne laissait quasiment aucune
 * marge une fois la tête posée. Voir Movement.viewBox.
 */
const GROUND_VIEWBOX: [number, number] = [340, 260];

/** Planche ventrale (avant-bras au sol): position allongée, tenue statique. */
const PLANK_FRONT: Pose = {
  shoulder: { x: 110, y: 140 },
  hip: { x: 200, y: 150 },
  handA: { x: 95, y: 190 },
  handB: { x: 102, y: 192 },
  footA: { x: 300, y: 158 },
  footB: { x: 300, y: 172 },
};
export const PLANK_FRONT_HOLD: Movement = { ...holdMovement(PLANK_FRONT), viewBox: GROUND_VIEWBOX };

/** Gainage dynamique (mountain climbers): planche haute, un genou qui
 * vient se rapprocher de la hanche puis reparts. */
const CLIMBER_UP: Pose = {
  shoulder: { x: 105, y: 130 },
  hip: { x: 195, y: 145 },
  handA: { x: 92, y: 195 },
  handB: { x: 100, y: 197 },
  footA: { x: 298, y: 155 },
  footB: { x: 210, y: 180 },
};
const CLIMBER_DOWN: Pose = { ...CLIMBER_UP, footB: { x: 292, y: 170 } };
export const MOUNTAIN_CLIMBERS: Movement = {
  loopSeconds: 0.8,
  viewBox: GROUND_VIEWBOX,
  keyframes: [
    { t: 0, pose: CLIMBER_UP },
    { t: 0.5, pose: CLIMBER_DOWN },
    { t: 1, pose: CLIMBER_UP },
  ],
};

/** Planche latérale: appui sur un avant-bras, corps aligné, bras libre
 * tendu vers le haut. */
const PLANK_SIDE: Pose = {
  shoulder: { x: 120, y: 125 },
  hip: { x: 195, y: 150 },
  handA: { x: 100, y: 175 },
  handB: { x: 120, y: 60 },
  footA: { x: 298, y: 155 },
  footB: { x: 298, y: 170 },
};
export const PLANK_SIDE_HOLD: Movement = { ...holdMovement(PLANK_SIDE), viewBox: GROUND_VIEWBOX };

/** Oiseau-chien: à quatre pattes, bras et jambe opposés tendus — tenue,
 * change de côté d'une répétition à l'autre. */
const BIRD_DOG_B: Pose = {
  shoulder: { x: 115, y: 140 },
  hip: { x: 210, y: 150 },
  // main d'appui, sous l'épaule
  handA: { x: 112, y: 210 },
  // bras tendu vers l'avant
  handB: { x: 48, y: 183 },
  // genou d'appui, sous la hanche
  footA: { x: 207, y: 225 },
  // jambe tendue vers l'arrière
  footB: { x: 310, y: 165 },
};
const BIRD_DOG_A: Pose = { ...BIRD_DOG_B, handA: BIRD_DOG_B.handB, handB: BIRD_DOG_B.handA, footA: BIRD_DOG_B.footB, footB: BIRD_DOG_B.footA };
export const BIRD_DOG: Movement = {
  loopSeconds: 3.6,
  viewBox: GROUND_VIEWBOX,
  keyframes: [
    { t: 0, pose: BIRD_DOG_B },
    { t: 0.5, pose: BIRD_DOG_A },
    { t: 1, pose: BIRD_DOG_B },
  ],
};

/** Pompes: mains fixes au sol, tout le corps (épaule+hanche) descend et
 * remonte, jambes tendues derrière. */
const PUSHUP_UP: Pose = {
  shoulder: { x: 110, y: 140 },
  hip: { x: 200, y: 148 },
  handA: { x: 90, y: 205 },
  handB: { x: 98, y: 207 },
  footA: { x: 300, y: 158 },
  footB: { x: 300, y: 172 },
};
const PUSHUP_DOWN: Pose = { ...PUSHUP_UP, shoulder: { x: 110, y: 170 }, hip: { x: 200, y: 178 } };
export const PUSHUP: Movement = {
  loopSeconds: 1.6,
  viewBox: GROUND_VIEWBOX,
  keyframes: [
    { t: 0, pose: PUSHUP_UP },
    { t: 0.5, pose: PUSHUP_DOWN },
    { t: 1, pose: PUSHUP_UP },
  ],
};

/** Hip thrust: épaules fixes au sol/banc, hanche qui monte et descend,
 * pieds à plat au sol genoux fléchis. */
const THRUST_SHOULDER = { x: 95, y: 190 };
const THRUST_FOOT = { x: 280, y: 240 };
const THRUST_DOWN: Pose = {
  hip: { x: 185, y: 220 },
  shoulder: THRUST_SHOULDER,
  handA: { x: 155, y: 200 },
  handB: { x: 173, y: 198 },
  footA: { x: 262, y: 226 },
  footB: THRUST_FOOT,
};
const THRUST_UP: Pose = { ...THRUST_DOWN, hip: { x: 185, y: 175 } };
export const HIP_THRUST: Movement = {
  loopSeconds: 1.5,
  viewBox: GROUND_VIEWBOX,
  keyframes: [
    { t: 0, pose: THRUST_DOWN },
    { t: 0.5, pose: THRUST_UP },
    { t: 1, pose: THRUST_DOWN },
  ],
};
