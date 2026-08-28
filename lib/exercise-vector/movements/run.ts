import { alternatingCycle, mirrorAB } from "../mirror";
import { lerpPoint } from "../ik";
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

/**
 * Sprint: vraie phase de "vol" — jambe avant (B) genou haut comme la
 * montée de genoux (même écart hanche→pied que highKneesPeak, qui a été
 * vérifié), jambe arrière (A) tendue loin derrière après la poussée, les
 * deux pieds décollés du sol. Buste nettement penché en avant.
 */
function sprintPeak(): Pose {
  return {
    hip: { x: 130, y: 165 },
    shoulder: { x: 155, y: 88 },
    handA: { x: 105, y: 150 },
    handB: { x: 205, y: 130 },
    // jambe arrière: cible loin et presque à pleine portée pour lire comme
    // une jambe tendue en poussée, pas repliée (un genou bien plié se
    // confond visuellement avec la jambe avant, l'ensemble ne se lit plus
    // comme une foulée).
    footA: { x: 40, y: 240 },
    footB: { x: 181, y: 211 },
  };
}

/**
 * Position de "vol/récupération" à mi-cycle — sans elle, alternatingCycle
 * (interpolation linéaire à 2 keyframes) fait passer les deux pieds
 * directement l'un vers l'autre près du sol au milieu de la transition
 * (les cibles pied A et pied B se croisent), ce qui se lit comme un
 * personnage accroupi/assis plutôt qu'en pleine foulée. Deux tentatives
 * avec une cible "repliée sous/derrière la hanche" (proche de la racine,
 * ou dans une direction opposée à la cible du pic) ont produit un défaut
 * différent mais tout aussi confus: solveLimb à bendSign fixe ne garantit
 * un genou/coude visuellement cohérent que quand la cible reste dans la
 * MÊME direction générale que d'habitude et suffisamment étendue —
 * l'angle interne (l1,d,l2) grandit fortement quand la cible se rapproche
 * de la racine, et jointAngle = baseAngle - a peut alors dépasser 90° et
 * faire pivoter le genou du côté visuellement opposé à la cible ("jambes
 * en X"), un comportement propre à cette famille d'IK qui n'apparaît
 * jamais sur les cibles bien étendues (proches de la portée max) déjà
 * utilisées ailleurs dans le catalogue. On reste donc ici dans le
 * PROLONGEMENT de la direction de chaque jambe au pic — juste moins
 * étendue — plutôt que dans une direction ou à une distance nouvelle.
 */
function sprintRecover(): Pose {
  const peak = sprintPeak();
  return {
    ...peak,
    // même direction hanche→pied qu'au pic, ~80% de la distance — assez
    // court pour se lire comme "en cours de repliement", assez long pour
    // rester dans la portée où l'IK suit fidèlement la direction visée.
    footA: lerpPoint(peak.hip, peak.footA, 0.8),
    footB: lerpPoint(peak.hip, peak.footB, 0.82),
  };
}

export const SPRINT: Movement = {
  loopSeconds: 0.7,
  keyframes: [
    { t: 0, pose: sprintPeak() },
    // Tenue brève sur le pic (jambe tendue bien visible) avant la
    // transition — sans ça, la pose la plus lisible du cycle ne dure
    // qu'un instant et la silhouette repliée (recovery) domine visuellement
    // la boucle alors qu'elle n'est qu'une étape de passage.
    { t: 0.12, pose: sprintPeak() },
    { t: 0.25, pose: sprintRecover() },
    { t: 0.5, pose: mirrorAB(sprintPeak()) },
    { t: 0.62, pose: mirrorAB(sprintPeak()) },
    { t: 0.75, pose: mirrorAB(sprintRecover()) },
    { t: 1, pose: sprintPeak() },
  ],
};
