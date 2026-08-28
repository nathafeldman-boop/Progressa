import type { Movement } from "../types";

/**
 * Mobilité articulaire en cercles (cheville, hanche, épaule) — un vrai
 * mouvement continu, pas une tenue (`isHold`): contrairement à un
 * étirement ou un gainage, ces exercices SONT le mouvement, jamais figés.
 * Chaque cercle est construit pour rester loin des bords d'amplitude du
 * membre concerné (rayons choisis avec marge sous la portée max
 * cuisse+tibia=120 / bras+avant-bras=80) — voir constants.ts.
 */

/** Cercles de cheville: en appui sur une jambe, l'autre pied trace un
 * petit cercle juste au-dessus du sol. */
export const ANKLE_CIRCLES: Movement = {
  loopSeconds: 2.2,
  keyframes: [
    { t: 0, pose: { hip: { x: 120, y: 175 }, shoulder: { x: 120, y: 96 }, handA: { x: 96, y: 168 }, handB: { x: 144, y: 168 }, footA: { x: 104, y: 292 }, footB: { x: 150, y: 265 } } },
    { t: 0.25, pose: { hip: { x: 120, y: 175 }, shoulder: { x: 120, y: 96 }, handA: { x: 96, y: 168 }, handB: { x: 144, y: 168 }, footA: { x: 104, y: 292 }, footB: { x: 140, y: 255 } } },
    { t: 0.5, pose: { hip: { x: 120, y: 175 }, shoulder: { x: 120, y: 96 }, handA: { x: 96, y: 168 }, handB: { x: 144, y: 168 }, footA: { x: 104, y: 292 }, footB: { x: 130, y: 265 } } },
    { t: 0.75, pose: { hip: { x: 120, y: 175 }, shoulder: { x: 120, y: 96 }, handA: { x: 96, y: 168 }, handB: { x: 144, y: 168 }, footA: { x: 104, y: 292 }, footB: { x: 140, y: 275 } } },
    { t: 1, pose: { hip: { x: 120, y: 175 }, shoulder: { x: 120, y: 96 }, handA: { x: 96, y: 168 }, handB: { x: 144, y: 168 }, footA: { x: 104, y: 292 }, footB: { x: 150, y: 265 } } },
  ],
};

/** Cercles de hanches: appuis larges, genoux légèrement fléchis pour
 * laisser de la marge au bassin, qui trace le cercle sous un buste
 * relativement stable — mains posées sur les hanches. */
export const HIP_CIRCLES: Movement = {
  loopSeconds: 2.4,
  keyframes: [
    { t: 0, pose: { hip: { x: 128, y: 190 }, shoulder: { x: 120, y: 108 }, handA: { x: 98, y: 175 }, handB: { x: 142, y: 175 }, footA: { x: 100, y: 293 }, footB: { x: 140, y: 293 } } },
    { t: 0.25, pose: { hip: { x: 120, y: 182 }, shoulder: { x: 120, y: 108 }, handA: { x: 98, y: 175 }, handB: { x: 142, y: 175 }, footA: { x: 100, y: 293 }, footB: { x: 140, y: 293 } } },
    { t: 0.5, pose: { hip: { x: 112, y: 190 }, shoulder: { x: 120, y: 108 }, handA: { x: 98, y: 175 }, handB: { x: 142, y: 175 }, footA: { x: 100, y: 293 }, footB: { x: 140, y: 293 } } },
    { t: 0.75, pose: { hip: { x: 120, y: 198 }, shoulder: { x: 120, y: 108 }, handA: { x: 98, y: 175 }, handB: { x: 142, y: 175 }, footA: { x: 100, y: 293 }, footB: { x: 140, y: 293 } } },
    { t: 1, pose: { hip: { x: 128, y: 190 }, shoulder: { x: 120, y: 108 }, handA: { x: 98, y: 175 }, handB: { x: 142, y: 175 }, footA: { x: 100, y: 293 }, footB: { x: 140, y: 293 } } },
  ],
};

/** Cercles d'épaules: les mains gardent un écart constant avec l'épaule
 * (donc une portée de bras toujours identique, jamais proche de la limite)
 * pendant que l'épaule elle-même — et les bras relâchés qui la suivent —
 * décrivent le cercle. */
const SHOULDER_HAND_OFFSET_A = { x: -10, y: 77 };
const SHOULDER_HAND_OFFSET_B = { x: 10, y: 77 };
function shoulderCirclePose(shoulder: { x: number; y: number }) {
  return {
    hip: { x: 120, y: 175 },
    shoulder,
    handA: { x: shoulder.x + SHOULDER_HAND_OFFSET_A.x, y: shoulder.y + SHOULDER_HAND_OFFSET_A.y },
    handB: { x: shoulder.x + SHOULDER_HAND_OFFSET_B.x, y: shoulder.y + SHOULDER_HAND_OFFSET_B.y },
    footA: { x: 110, y: 293 },
    footB: { x: 130, y: 293 },
  };
}
export const SHOULDER_CIRCLES: Movement = {
  loopSeconds: 2,
  keyframes: [
    { t: 0, pose: shoulderCirclePose({ x: 130, y: 96 }) },
    { t: 0.25, pose: shoulderCirclePose({ x: 120, y: 86 }) },
    { t: 0.5, pose: shoulderCirclePose({ x: 110, y: 96 }) },
    { t: 0.75, pose: shoulderCirclePose({ x: 120, y: 106 }) },
    { t: 1, pose: shoulderCirclePose({ x: 130, y: 96 }) },
  ],
};
