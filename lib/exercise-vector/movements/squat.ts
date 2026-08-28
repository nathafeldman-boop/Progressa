import type { Movement, Pose } from "../types";

const UP: Pose = {
  hip: { x: 120, y: 175 },
  shoulder: { x: 120, y: 96 },
  handA: { x: 108, y: 172 },
  handB: { x: 132, y: 172 },
  footA: { x: 100, y: 293 },
  footB: { x: 140, y: 293 },
};

const DOWN: Pose = {
  hip: { x: 120, y: 233 },
  shoulder: { x: 120, y: 150 },
  handA: { x: 168, y: 152 },
  handB: { x: 168, y: 190 },
  footA: { x: 100, y: 293 },
  footB: { x: 140, y: 293 },
};

export const SQUAT: Movement = {
  loopSeconds: 2.4,
  keyframes: [
    { t: 0, pose: UP },
    { t: 0.45, pose: DOWN },
    { t: 1, pose: UP },
  ],
};

/** Squat jump: même amplitude mais plus rapide, et le haut du cycle
 * "décolle" légèrement (hanche/épaule remontent au-dessus de la position
 * debout de référence) pour lire comme un saut. */
const JUMP_TOP: Pose = {
  hip: { x: 120, y: 165 },
  shoulder: { x: 120, y: 84 },
  handA: { x: 104, y: 150 },
  handB: { x: 136, y: 150 },
  footA: { x: 106, y: 283 },
  footB: { x: 134, y: 283 },
};

export const SQUAT_JUMP: Movement = {
  loopSeconds: 1.1,
  keyframes: [
    { t: 0, pose: JUMP_TOP },
    { t: 0.55, pose: DOWN },
    { t: 1, pose: JUMP_TOP },
  ],
};
