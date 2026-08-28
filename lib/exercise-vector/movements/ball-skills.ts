import type { Movement, Pose } from "../types";
import type { Point } from "../ik";
import { WINDUP, CONTACT, FOLLOW_THROUGH, PASS_WINDUP, PASS_CONTACT, PASS_FOLLOW, BALL, PLANT } from "./kick";

/**
 * Troisième vague de mouvements dédiés — la famille "technique ballon"
 * réutilisait toutes le même dribble générique (BALL_DRIBBLE) pour des
 * gestes réellement différents (feinte sur place, crochet vers
 * l'intérieur, débordement vers l'extérieur, contrôle orienté). Réutilise
 * les poses de frappe déjà vérifiées de kick.ts pour la partie
 * "frappe/centre" plutôt que d'en réinventer une nouvelle — seule la
 * touche d'amorce (nouvelle) a besoin d'être vérifiée.
 */

/** Feinte de corps devant un piquet: le ballon reste quasi immobile, ce
 * qui bouge c'est le buste qui bascule fort d'un côté puis de l'autre
 * pour "vendre" le déséquilibre — jamais un vrai déplacement en ligne
 * comme le dribble. */
export const BODY_FEINT: Movement = {
  loopSeconds: 1.4,
  keyframes: [
    { t: 0, pose: { hip: { x: 113, y: 186 }, shoulder: { x: 88, y: 100 }, handA: { x: 58, y: 128 }, handB: { x: 128, y: 165 }, footA: { x: 104, y: 290 }, footB: { x: 148, y: 284 } }, ball: { x: 128, y: 296 } },
    { t: 0.5, pose: { hip: { x: 130, y: 184 }, shoulder: { x: 158, y: 98 }, handA: { x: 118, y: 162 }, handB: { x: 186, y: 130 }, footA: { x: 104, y: 290 }, footB: { x: 148, y: 284 } }, ball: { x: 124, y: 296 } },
    { t: 1, pose: { hip: { x: 113, y: 186 }, shoulder: { x: 88, y: 100 }, handA: { x: 58, y: 128 }, handB: { x: 128, y: 165 }, footA: { x: 104, y: 290 }, footB: { x: 148, y: 284 } }, ball: { x: 128, y: 296 } },
  ],
};

/**
 * Crochet vers l'intérieur + frappe: le pied ramène le ballon depuis
 * l'extérieur vers l'axe du corps (touche d'amorce, nouvelle), puis
 * enchaîne directement sur le cycle de frappe déjà vérifié de
 * SHOT_STRIKE (WINDUP -> CONTACT -> FOLLOW_THROUGH).
 */
const CUT_INSIDE_REACH: Pose = {
  hip: { x: 115, y: 182 },
  shoulder: { x: 105, y: 108 },
  handA: { x: 150, y: 118 },
  handB: { x: 65, y: 155 },
  footA: PLANT,
  footB: { x: 55, y: 270 },
};
const CUT_INSIDE_BALL_WIDE: Point = { x: 58, y: 292 };

export const BALL_CUT_INSIDE: Movement = {
  loopSeconds: 1.6,
  keyframes: [
    { t: 0, pose: CUT_INSIDE_REACH, ball: CUT_INSIDE_BALL_WIDE },
    { t: 0.28, pose: WINDUP, ball: BALL },
    { t: 0.5, pose: CONTACT, ball: BALL },
    { t: 0.75, pose: FOLLOW_THROUGH, ball: BALL },
    { t: 1, pose: CUT_INSIDE_REACH, ball: CUT_INSIDE_BALL_WIDE },
  ],
};

/**
 * Débordement extérieur + centre: le pied pousse le ballon vers
 * l'extérieur (touche d'amorce, nouvelle), puis enchaîne sur le cycle de
 * centre déjà vérifié de PASS_STRIKE.
 */
const CUT_OUTSIDE_REACH: Pose = {
  hip: { x: 122, y: 180 },
  shoulder: { x: 120, y: 100 },
  handA: { x: 95, y: 150 },
  handB: { x: 150, y: 140 },
  footA: { x: 105, y: 290 },
  footB: { x: 175, y: 278 },
};
const CUT_OUTSIDE_BALL_WIDE: Point = { x: 180, y: 285 };

export const BALL_CUT_OUTSIDE: Movement = {
  loopSeconds: 1.6,
  keyframes: [
    { t: 0, pose: CUT_OUTSIDE_REACH, ball: CUT_OUTSIDE_BALL_WIDE },
    { t: 0.28, pose: PASS_WINDUP, ball: BALL },
    { t: 0.5, pose: PASS_CONTACT, ball: BALL },
    { t: 0.75, pose: PASS_FOLLOW, ball: BALL },
    { t: 1, pose: CUT_OUTSIDE_REACH, ball: CUT_OUTSIDE_BALL_WIDE },
  ],
};

/**
 * Contrôle avec orientation du corps: premier contact qui amortit un
 * ballon arrivant de face, buste et hanche qui pivotent pour orienter la
 * touche vers le côté — différent du dribble (touches alternées en
 * ligne): ici une seule grosse touche d'orientation, buste qui tourne.
 */
export const ORIENTED_CONTROL: Movement = {
  loopSeconds: 1.6,
  keyframes: [
    { t: 0, pose: { hip: { x: 120, y: 182 }, shoulder: { x: 120, y: 102 }, handA: { x: 100, y: 155 }, handB: { x: 140, y: 155 }, footA: { x: 110, y: 290 }, footB: { x: 130, y: 288 } }, ball: { x: 120, y: 230 } },
    { t: 0.4, pose: { hip: { x: 128, y: 180 }, shoulder: { x: 148, y: 96 }, handA: { x: 108, y: 150 }, handB: { x: 178, y: 128 }, footA: { x: 108, y: 290 }, footB: { x: 165, y: 275 } }, ball: { x: 172, y: 288 } },
    { t: 0.7, pose: { hip: { x: 128, y: 180 }, shoulder: { x: 148, y: 96 }, handA: { x: 108, y: 150 }, handB: { x: 178, y: 128 }, footA: { x: 108, y: 290 }, footB: { x: 165, y: 275 } }, ball: { x: 172, y: 288 } },
    { t: 1, pose: { hip: { x: 120, y: 182 }, shoulder: { x: 120, y: 102 }, handA: { x: 100, y: 155 }, handB: { x: 140, y: 155 }, footA: { x: 110, y: 290 }, footB: { x: 130, y: 288 } }, ball: { x: 120, y: 230 } },
  ],
};
