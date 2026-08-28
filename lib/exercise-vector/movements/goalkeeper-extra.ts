import type { Movement, Pose } from "../types";

/**
 * Quatrième vague — la famille gardien: 4 exercices différents
 * (réflexes mains rapprochées, duel face à face, réduction d'angle,
 * réflexes sur frappes rapprochées) partageaient tous GK_LOW_BLOCK_MOVE
 * (une parade basse plongée), qui ne représente vraiment qu'un seul de
 * ces gestes. Les deux "réflexes" (mains rapprochées / frappes
 * rapprochées) sont volontairement le même mouvement: ce sont deux noms
 * de séance pour le même geste réel (parade réflexe à bout portant).
 */

const GK_READY: Pose = {
  hip: { x: 120, y: 216 },
  shoulder: { x: 120, y: 144 },
  handA: { x: 96, y: 220 },
  handB: { x: 144, y: 220 },
  footA: { x: 102, y: 288 },
  footB: { x: 138, y: 288 },
};

/** Réflexes à bout portant: les mains claquent vite d'un côté puis de
 * l'autre à hauteur de poitrine — jamais une pleine parade plongée,
 * juste un réflexe court. */
export const GK_REFLEX_SAVE: Movement = {
  loopSeconds: 1,
  keyframes: [
    { t: 0, pose: GK_READY },
    { t: 0.25, pose: { hip: { x: 120, y: 216 }, shoulder: { x: 122, y: 142 }, handA: { x: 65, y: 165 }, handB: { x: 125, y: 205 }, footA: { x: 102, y: 288 }, footB: { x: 138, y: 288 } } },
    { t: 0.5, pose: GK_READY },
    { t: 0.75, pose: { hip: { x: 120, y: 216 }, shoulder: { x: 118, y: 142 }, handA: { x: 115, y: 205 }, handB: { x: 175, y: 165 }, footA: { x: 102, y: 288 }, footB: { x: 138, y: 288 } } },
    { t: 1, pose: GK_READY },
  ],
};

/** Duel face à face (1 contre 1): le gardien "reste grand", bras et
 * appuis écartés symétriquement pour couvrir large — une position tenue,
 * pas une plongée d'un côté. */
export const GK_ENGAGE_1V1: Movement = {
  loopSeconds: 1.6,
  keyframes: [
    { t: 0, pose: GK_READY },
    { t: 0.5, pose: { hip: { x: 120, y: 225 }, shoulder: { x: 120, y: 165 }, handA: { x: 75, y: 210 }, handB: { x: 165, y: 210 }, footA: { x: 90, y: 290 }, footB: { x: 150, y: 290 } } },
    { t: 1, pose: GK_READY },
  ],
};

/** Réduction d'angle: le gardien sort de sa ligne vers l'avant pour
 * fermer l'angle, puis revient — translation rigide (tout le corps se
 * décale ensemble), donc aucune distance interne ne change. */
function narrowAnglePose(dy: number): Pose {
  return {
    hip: { x: 120, y: 216 + dy },
    shoulder: { x: 120, y: 144 + dy },
    handA: { x: 96, y: 220 + dy },
    handB: { x: 144, y: 220 + dy },
    footA: { x: 102, y: 288 + dy },
    footB: { x: 138, y: 288 + dy },
  };
}
export const GK_NARROW_ANGLE: Movement = {
  loopSeconds: 1.8,
  keyframes: [
    { t: 0, pose: narrowAnglePose(0) },
    { t: 0.5, pose: narrowAnglePose(-35) },
    { t: 1, pose: narrowAnglePose(0) },
  ],
};
