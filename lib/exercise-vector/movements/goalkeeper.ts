import type { Movement, Pose } from "../types";

const GK_READY: Pose = {
  hip: { x: 120, y: 216 },
  shoulder: { x: 120, y: 144 },
  handA: { x: 96, y: 220 },
  handB: { x: 144, y: 220 },
  footA: { x: 102, y: 288 },
  footB: { x: 138, y: 288 },
};

/** Plongeon latéral: corps étiré vers le côté et vers le bas, mains
 * tendues vers le ballon — vue de face. */
const GK_DIVE: Pose = {
  hip: { x: 140, y: 255 },
  shoulder: { x: 170, y: 233 },
  handA: { x: 162, y: 252 },
  // main de parade tendue vers le haut plutôt que vers le côté, pour
  // rester loin de la tête (même axe que le cou) sans sortir du cadre.
  handB: { x: 195, y: 158 },
  footA: { x: 94, y: 290 },
  footB: { x: 150, y: 266 },
};
export const GK_LATERAL_DIVE: Movement = {
  loopSeconds: 1.5,
  keyframes: [
    { t: 0, pose: GK_READY },
    { t: 0.5, pose: GK_DIVE },
    { t: 1, pose: GK_READY },
  ],
};

/** Prise de balle haute: saut, bras tendus au-dessus de la tête. */
const GK_CATCH: Pose = {
  hip: { x: 120, y: 175 },
  shoulder: { x: 120, y: 95 },
  // mains écartées et hautes pour rester loin de la tête (qui remonte
  // aussi le long de l'axe hanche→épaule) sans sortir du cadre.
  handA: { x: 85, y: 50 },
  handB: { x: 155, y: 46 },
  footA: { x: 110, y: 248 },
  footB: { x: 130, y: 248 },
};
export const GK_HIGH_CATCH: Movement = {
  loopSeconds: 1.3,
  keyframes: [
    { t: 0, pose: GK_READY, ball: { x: 120, y: 100 } },
    { t: 0.5, pose: GK_CATCH, ball: { x: 120, y: 38 } },
    { t: 1, pose: GK_READY, ball: { x: 120, y: 100 } },
  ],
};

/** Parade basse: accroupi, une main balaie près du sol. */
const GK_LOW_BLOCK: Pose = {
  hip: { x: 132, y: 246 },
  shoulder: { x: 152, y: 222 },
  handA: { x: 168, y: 210 },
  handB: { x: 118, y: 274 },
  footA: { x: 104, y: 290 },
  footB: { x: 158, y: 288 },
};
export const GK_LOW_BLOCK_MOVE: Movement = {
  loopSeconds: 1.4,
  keyframes: [
    { t: 0, pose: GK_READY },
    { t: 0.5, pose: GK_LOW_BLOCK },
    { t: 1, pose: GK_READY },
  ],
};

/** Relance / distribution: bras qui arme puis lance vers l'avant. */
const GK_THROW_WINDUP: Pose = {
  hip: { x: 120, y: 200 },
  shoulder: { x: 118, y: 122 },
  handA: { x: 96, y: 130 },
  handB: { x: 152, y: 176 },
  footA: { x: 104, y: 290 },
  footB: { x: 140, y: 288 },
};
const GK_THROW_RELEASE: Pose = {
  ...GK_THROW_WINDUP,
  shoulder: { x: 126, y: 118 },
  handB: { x: 199, y: 98 },
  handA: { x: 88, y: 168 },
};
export const GK_DISTRIBUTION: Movement = {
  loopSeconds: 1.2,
  keyframes: [
    { t: 0, pose: GK_THROW_WINDUP },
    { t: 0.5, pose: GK_THROW_RELEASE },
    { t: 1, pose: GK_THROW_WINDUP },
  ],
};
