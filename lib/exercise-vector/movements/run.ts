import { alternatingCycle } from "../mirror";
import { HIP, SHOULDER } from "../reference";
import type { Movement, Pose } from "../types";

/**
 * Course en foulées hautes ("montée de genoux") — géométrie validée à la
 * main (voir historique): cuisse avant proche de l'horizontale, tibia
 * pendant depuis le genou plutôt que projeté vers le haut. Le pied B
 * (avant) est la cible pic, le pied A (arrière) reste au sol en appui —
 * alternatingCycle déduit la moitié symétrique.
 */
function highKneesPeak(): Pose {
  return {
    hip: HIP,
    shoulder: SHOULDER,
    // bras arrière (A) part en avant, opposé à la jambe B qui monte
    handA: { x: 172, y: 68 },
    handB: { x: 96, y: 150 },
    footA: { x: 100, y: 293 },
    footB: { x: 171, y: 216 },
  };
}

export const HIGH_KNEES: Movement = alternatingCycle(highKneesPeak(), 0.9);

/** Talons-fesses: même principe mais le tibia remonte vers l'arrière au
 * lieu de la cuisse vers l'avant — cible pied nettement plus proche de la
 * hanche, derrière. */
function heelKickPeak(): Pose {
  return {
    hip: HIP,
    shoulder: SHOULDER,
    handA: { x: 172, y: 68 },
    handB: { x: 96, y: 150 },
    footA: { x: 108, y: 293 },
    footB: { x: 108, y: 210 },
  };
}
export const HEEL_KICKS: Movement = alternatingCycle(heelKickPeak(), 0.85);

/** Course sur place, foulée normale (pas de montée de genou marquée) —
 * pour footing / sprint / navettes où c'est l'allure qui compte, pas la
 * forme du genou. Jambe arrière tendue derrière (poussée), jambe avant
 * repliée devant à hauteur modérée. */
function jogPeak(): Pose {
  return {
    hip: HIP,
    shoulder: { x: 126, y: 94 },
    handA: { x: 168, y: 100 },
    handB: { x: 93, y: 162 },
    footA: { x: 82, y: 270 },
    footB: { x: 158, y: 250 },
  };
}
export const JOG: Movement = alternatingCycle(jogPeak(), 1.1);

/** Sprint: même schéma que le jog mais foulée plus ample, buste penché en
 * avant, bras plus dynamiques. */
function sprintPeak(): Pose {
  return {
    hip: { x: 120, y: 172 },
    shoulder: { x: 138, y: 92 },
    handA: { x: 184, y: 84 },
    handB: { x: 92, y: 153 },
    footA: { x: 68, y: 268 },
    footB: { x: 176, y: 232 },
  };
}
export const SPRINT: Movement = alternatingCycle(sprintPeak(), 0.7);
