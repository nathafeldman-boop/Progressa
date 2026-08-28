import type { Pose, Movement } from "./types";

/** Échange les rôles A/B (arrière/avant) — sert à dériver la moitié
 * symétrique d'un cycle alterné (course, fentes, pas chassés...) à partir
 * d'une seule pose "pic" plutôt que d'en écrire deux à la main. */
export function mirrorAB(pose: Pose): Pose {
  return { ...pose, handA: pose.handB, handB: pose.handA, footA: pose.footB, footB: pose.footA };
}

/**
 * Construit un cycle à 3 keyframes (pic B / pic A / retour) à partir d'une
 * seule pose "pic" (bras/jambe B en action) — la moitié symétrique est
 * déduite par mirrorAB, jamais réécrite à la main. C'est le schéma de
 * toutes les locomotions alternées du catalogue (course, montée de
 * genoux, fentes, pas chassés, dribble en foulées).
 */
export function alternatingCycle(peak: Pose, loopSeconds: number): Movement {
  const kf0 = peak;
  const kf1 = mirrorAB(peak);
  return {
    loopSeconds,
    keyframes: [
      { t: 0, pose: kf0 },
      { t: 0.5, pose: kf1 },
      { t: 1, pose: kf0 },
    ],
  };
}

export function holdMovement(pose: Pose, breatheSeconds = 3): Movement {
  return {
    isHold: true,
    loopSeconds: breatheSeconds,
    keyframes: [
      { t: 0, pose },
      { t: 0.5, pose: breathe(pose) },
      { t: 1, pose },
    ],
  };
}

/** Léger mouvement de respiration pour une tenue statique — jamais un vrai déplacement de membre. */
function breathe(pose: Pose): Pose {
  const dy = 2;
  return {
    hip: pose.hip,
    shoulder: { x: pose.shoulder.x, y: pose.shoulder.y - dy },
    handA: pose.handA,
    handB: pose.handB,
    footA: pose.footA,
    footB: pose.footB,
  };
}
