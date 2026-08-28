import type { Movement, Pose } from "../types";

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

/** Montées sur pointes: debout, les pieds se soulèvent légèrement du sol
 * (pas de point "talon" séparé dans ce rig — le pied entier qui monte est
 * le proxy le plus lisible), buste et hanche stables. */
export const CALF_RAISES: Movement = {
  loopSeconds: 1.6,
  keyframes: [
    { t: 0, pose: { hip: { x: 120, y: 175 }, shoulder: { x: 120, y: 96 }, handA: { x: 107, y: 172 }, handB: { x: 133, y: 172 }, footA: { x: 110, y: 293 }, footB: { x: 130, y: 293 } } },
    { t: 0.5, pose: { hip: { x: 120, y: 175 }, shoulder: { x: 120, y: 96 }, handA: { x: 107, y: 172 }, handB: { x: 133, y: 172 }, footA: { x: 110, y: 283 }, footB: { x: 130, y: 283 } } },
    { t: 1, pose: { hip: { x: 120, y: 175 }, shoulder: { x: 120, y: 96 }, handA: { x: 107, y: 172 }, handB: { x: 133, y: 172 }, footA: { x: 110, y: 293 }, footB: { x: 130, y: 293 } } },
  ],
};

/** Gainage rotatif anti-rotation (type pallof press): appuis larges et
 * stables, un "poids" tenu à deux mains est poussé et résisté d'un côté à
 * l'autre — le tronc, lui, reste face à l'avant. */
export const ANTI_ROTATION_PRESS: Movement = {
  loopSeconds: 2.6,
  keyframes: [
    { t: 0, pose: { hip: { x: 120, y: 178 }, shoulder: { x: 120, y: 100 }, handA: { x: 146, y: 142 }, handB: { x: 154, y: 138 }, footA: { x: 100, y: 293 }, footB: { x: 140, y: 293 } } },
    { t: 0.5, pose: { hip: { x: 120, y: 178 }, shoulder: { x: 120, y: 100 }, handA: { x: 86, y: 142 }, handB: { x: 94, y: 138 }, footA: { x: 100, y: 293 }, footB: { x: 140, y: 293 } } },
    { t: 1, pose: { hip: { x: 120, y: 178 }, shoulder: { x: 120, y: 100 }, handA: { x: 146, y: 142 }, handB: { x: 154, y: 138 }, footA: { x: 100, y: 293 }, footB: { x: 140, y: 293 } } },
  ],
};

/** Tirage élastique pour le dos: bras tendus vers l'avant (élastique
 * tendu), puis tirés vers les côtes, coudes qui reculent — buste et
 * hanche stables, appuis fixes. */
export const BAND_ROW: Movement = {
  loopSeconds: 1.8,
  keyframes: [
    { t: 0, pose: { hip: { x: 120, y: 178 }, shoulder: { x: 120, y: 100 }, handA: { x: 170, y: 140 }, handB: { x: 170, y: 150 }, footA: { x: 108, y: 293 }, footB: { x: 132, y: 293 } } },
    { t: 0.5, pose: { hip: { x: 120, y: 178 }, shoulder: { x: 120, y: 100 }, handA: { x: 95, y: 140 }, handB: { x: 95, y: 150 }, footA: { x: 108, y: 293 }, footB: { x: 132, y: 293 } } },
    { t: 1, pose: { hip: { x: 120, y: 178 }, shoulder: { x: 120, y: 100 }, handA: { x: 170, y: 140 }, handB: { x: 170, y: 150 }, footA: { x: 108, y: 293 }, footB: { x: 132, y: 293 } } },
  ],
};

/**
 * Nordic curl assisté: le vrai geste est à genoux, chevilles bloquées,
 * qui n'a pas d'équivalent direct dans ce rig (pensé pour des jambes qui
 * portent le poids, pas pour des appuis genoux au sol). Proxy honnête le
 * plus proche avec les points existants: un hip-hinge debout où le buste
 * part loin en avant et revient, jambes fixes — même charge/contrôle des
 * ischios que le vrai mouvement, juste debout plutôt qu'à genoux.
 */
/** Jumping jacks: bras et jambes s'ouvrent ensemble puis se referment —
 * repère cardio le plus reconnaissable pour un circuit combiné ou un HIIT
 * léger, bien plus lisible qu'un jogging sur place. */
export const JUMPING_JACKS: Movement = {
  loopSeconds: 0.9,
  keyframes: [
    { t: 0, pose: { hip: { x: 120, y: 175 }, shoulder: { x: 120, y: 96 }, handA: { x: 110, y: 173 }, handB: { x: 130, y: 173 }, footA: { x: 110, y: 293 }, footB: { x: 130, y: 293 } } },
    { t: 0.5, pose: { hip: { x: 120, y: 175 }, shoulder: { x: 120, y: 96 }, handA: { x: 85, y: 40 }, handB: { x: 155, y: 40 }, footA: { x: 90, y: 290 }, footB: { x: 150, y: 290 } } },
    { t: 1, pose: { hip: { x: 120, y: 175 }, shoulder: { x: 120, y: 96 }, handA: { x: 110, y: 173 }, handB: { x: 130, y: 173 }, footA: { x: 110, y: 293 }, footB: { x: 130, y: 293 } } },
  ],
};

const GROUND_VIEWBOX: [number, number] = [340, 260];

/** Auto-massage quadriceps au rouleau: allongé face contre terre, appui
 * avant-bras, le corps avance et recule sur le rouleau (offset constant
 * mains<->épaule, donc portée de bras toujours identique). */
function quadFoamRollPose(dx: number): Pose {
  return {
    shoulder: { x: 110 + dx, y: 140 },
    hip: { x: 200 + dx, y: 150 },
    handA: { x: 95 + dx, y: 190 },
    handB: { x: 102 + dx, y: 192 },
    footA: { x: 300, y: 158 },
    footB: { x: 300, y: 172 },
  };
}
export const QUAD_FOAM_ROLL: Movement = {
  loopSeconds: 2,
  viewBox: GROUND_VIEWBOX,
  keyframes: [
    { t: 0, pose: quadFoamRollPose(12) },
    { t: 0.5, pose: quadFoamRollPose(-12) },
    { t: 1, pose: quadFoamRollPose(12) },
  ],
};

export const NORDIC_CURL_APPROX: Movement = {
  loopSeconds: 2.4,
  keyframes: [
    { t: 0, pose: { hip: { x: 120, y: 180 }, shoulder: { x: 120, y: 105 }, handA: { x: 100, y: 175 }, handB: { x: 140, y: 175 }, footA: { x: 95, y: 293 }, footB: { x: 145, y: 293 } } },
    { t: 0.5, pose: { hip: { x: 120, y: 180 }, shoulder: { x: 175, y: 150 }, handA: { x: 200, y: 160 }, handB: { x: 210, y: 170 }, footA: { x: 95, y: 293 }, footB: { x: 145, y: 293 } } },
    { t: 1, pose: { hip: { x: 120, y: 180 }, shoulder: { x: 120, y: 105 }, handA: { x: 100, y: 175 }, handB: { x: 140, y: 175 }, footA: { x: 95, y: 293 }, footB: { x: 145, y: 293 } } },
  ],
};
