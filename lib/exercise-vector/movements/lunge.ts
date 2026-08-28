import { alternatingCycle } from "../mirror";
import type { Movement, Pose } from "../types";

/** Fente avant alternée: jambe B loin devant et pliée (genou ~90°), jambe
 * A tendue derrière sur l'avant-pied — alternatingCycle échange A/B pour
 * l'autre jambe. */
function forwardLungePeak(): Pose {
  return {
    hip: { x: 133, y: 218 },
    shoulder: { x: 133, y: 138 },
    handA: { x: 100, y: 190 },
    handB: { x: 168, y: 190 },
    footA: { x: 96, y: 288 },
    footB: { x: 172, y: 293 },
  };
}
export const FORWARD_LUNGE: Movement = alternatingCycle(forwardLungePeak(), 1.4);

/**
 * Fente latérale: vue de face (pas de profil) — le rig n'encode pas
 * d'angle caméra, donc un mouvement latéral se pose exactement comme un
 * mouvement avant/arrière mais interprété comme gauche/droite. Jambe B
 * pliée sous la hanche décalée, jambe A tendue loin sur le côté.
 */
function lateralLungePeak(): Pose {
  return {
    hip: { x: 152, y: 214 },
    shoulder: { x: 148, y: 134 },
    handA: { x: 118, y: 168 },
    handB: { x: 176, y: 168 },
    footA: { x: 58, y: 278 },
    footB: { x: 158, y: 293 },
  };
}
export const LATERAL_LUNGE: Movement = alternatingCycle(lateralLungePeak(), 1.6);
