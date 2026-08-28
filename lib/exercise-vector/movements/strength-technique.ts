import type { Movement, Pose } from "../types";

/**
 * Deuxième vague de mouvements dédiés — cible les cas "approx" où le
 * mouvement réutilisé montrait quelque chose de nettement différent du
 * vrai geste (une tenue statique pour un exercice répété, un dribble
 * générique pour une protection de balle dos au défenseur...), pas juste
 * une approximation raisonnable. Mêmes garde-fous que les vagues
 * précédentes: marges sous la portée max jambe (120) / bras (80), jamais
 * de cible retenue à la main sans vérification géométrique.
 */

const GROUND_VIEWBOX: [number, number] = [340, 260];

/**
 * Soulevé de terre jambe tendue (RDL unijambiste): en appui sur une
 * jambe, le buste bascule en avant pendant que la jambe libre part en
 * arrière pour l'équilibre, puis retour. Remplace FORWARD_HINGE_STRETCH
 * (une TENUE statique) — cet exercice est une répétition, jamais figé.
 */
export const SINGLE_LEG_RDL: Movement = {
  loopSeconds: 2.2,
  keyframes: [
    { t: 0, pose: { hip: { x: 120, y: 180 }, shoulder: { x: 120, y: 105 }, handA: { x: 100, y: 175 }, handB: { x: 140, y: 175 }, footA: { x: 108, y: 293 }, footB: { x: 150, y: 265 } } },
    { t: 0.5, pose: { hip: { x: 120, y: 180 }, shoulder: { x: 178, y: 150 }, handA: { x: 205, y: 165 }, handB: { x: 215, y: 175 }, footA: { x: 108, y: 293 }, footB: { x: 195, y: 225 } } },
    { t: 1, pose: { hip: { x: 120, y: 180 }, shoulder: { x: 120, y: 105 }, handA: { x: 100, y: 175 }, handB: { x: 140, y: 175 }, footA: { x: 108, y: 293 }, footB: { x: 150, y: 265 } } },
  ],
};

/**
 * Auto-massage mollets au rouleau: assis au sol, jambes tendues sur le
 * rouleau, mains derrière pour porter le poids — tout le corps glisse
 * ensemble d'avant en arrière (translation rigide: toutes les distances
 * internes restent identiques quel que soit le décalage, donc aucun
 * risque de cible hors de portée).
 */
function calfFoamRollPose(dx: number): Pose {
  return {
    hip: { x: 160 + dx, y: 225 },
    shoulder: { x: 160 + dx, y: 165 },
    handA: { x: 130 + dx, y: 220 },
    handB: { x: 137 + dx, y: 223 },
    footA: { x: 265 + dx, y: 245 },
    footB: { x: 268 + dx, y: 258 },
  };
}
export const CALF_FOAM_ROLL: Movement = {
  loopSeconds: 2,
  viewBox: GROUND_VIEWBOX,
  keyframes: [
    { t: 0, pose: calfFoamRollPose(10) },
    { t: 0.5, pose: calfFoamRollPose(-10) },
    { t: 1, pose: calfFoamRollPose(10) },
  ],
};

/**
 * Protection de balle dos à l'adversaire: appuis stables, corps
 * légèrement tourné, un bras écarté bas pour tenir la distance, ballon
 * gardé tout près du pied côté bras tendu — léger balancement du poids
 * plutôt qu'un dribble en ligne droite (qui suggère l'inverse: avancer
 * vite, pas protéger sur place).
 */
export const BALL_SHIELD: Movement = {
  loopSeconds: 1.8,
  keyframes: [
    { t: 0, pose: { hip: { x: 120, y: 180 }, shoulder: { x: 115, y: 100 }, handA: { x: 82, y: 170 }, handB: { x: 138, y: 148 }, footA: { x: 102, y: 290 }, footB: { x: 152, y: 283 } }, ball: { x: 88, y: 272 } },
    { t: 0.5, pose: { hip: { x: 128, y: 178 }, shoulder: { x: 123, y: 98 }, handA: { x: 90, y: 168 }, handB: { x: 146, y: 146 }, footA: { x: 110, y: 290 }, footB: { x: 152, y: 283 } }, ball: { x: 96, y: 271 } },
    { t: 1, pose: { hip: { x: 120, y: 180 }, shoulder: { x: 115, y: 100 }, handA: { x: 82, y: 170 }, handB: { x: 138, y: 148 }, footA: { x: 102, y: 290 }, footB: { x: 152, y: 283 } }, ball: { x: 88, y: 272 } },
  ],
};

/**
 * Squats bulgares: pied arrière surélevé (banc), le poids part
 * essentiellement sur la jambe avant qui plie en profondeur — silhouette
 * différente d'une fente classique (FORWARD_LUNGE), où les deux pieds
 * restent au sol.
 */
export const BULGARIAN_SPLIT_SQUAT: Movement = {
  loopSeconds: 2,
  keyframes: [
    { t: 0, pose: { hip: { x: 120, y: 172 }, shoulder: { x: 120, y: 90 }, handA: { x: 105, y: 165 }, handB: { x: 135, y: 165 }, footA: { x: 110, y: 290 }, footB: { x: 160, y: 250 } } },
    { t: 0.5, pose: { hip: { x: 125, y: 205 }, shoulder: { x: 122, y: 125 }, handA: { x: 107, y: 195 }, handB: { x: 137, y: 195 }, footA: { x: 110, y: 290 }, footB: { x: 163, y: 248 } } },
    { t: 1, pose: { hip: { x: 120, y: 172 }, shoulder: { x: 120, y: 90 }, handA: { x: 105, y: 165 }, handB: { x: 135, y: 165 }, footA: { x: 110, y: 290 }, footB: { x: 160, y: 250 } } },
  ],
};
