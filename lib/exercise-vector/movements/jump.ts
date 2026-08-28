import type { Movement, Pose } from "../types";

const CROUCH: Pose = {
  hip: { x: 120, y: 215 },
  shoulder: { x: 120, y: 138 },
  handA: { x: 96, y: 210 },
  handB: { x: 144, y: 210 },
  footA: { x: 105, y: 290 },
  footB: { x: 135, y: 290 },
};

const AIRBORNE: Pose = {
  hip: { x: 120, y: 162 },
  shoulder: { x: 120, y: 84 },
  handA: { x: 96, y: 108 },
  handB: { x: 144, y: 108 },
  footA: { x: 108, y: 268 },
  footB: { x: 132, y: 268 },
};

export const VERTICAL_JUMP: Movement = {
  loopSeconds: 1.1,
  keyframes: [
    { t: 0, pose: CROUCH },
    { t: 0.45, pose: AIRBORNE },
    { t: 1, pose: CROUCH },
  ],
};

/** Corde à sauter: petits sauts, les mains restent basses et tournent
 * plutôt que de balancer haut. */
const ROPE_CROUCH: Pose = { ...CROUCH, handA: { x: 108, y: 213 }, handB: { x: 132, y: 213 } };
const ROPE_AIR: Pose = { ...AIRBORNE, hip: { x: 120, y: 168 }, shoulder: { x: 120, y: 90 }, handA: { x: 109, y: 165 }, handB: { x: 131, y: 165 }, footA: { x: 112, y: 268 }, footB: { x: 128, y: 268 } };
export const ROPE_JUMP: Movement = {
  loopSeconds: 0.6,
  keyframes: [
    { t: 0, pose: ROPE_CROUCH },
    { t: 0.45, pose: ROPE_AIR },
    { t: 1, pose: ROPE_CROUCH },
  ],
};
