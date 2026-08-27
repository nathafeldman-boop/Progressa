import { Vector3 } from "three";
import type { BallKick, GroundPoint } from "./types";

/**
 * Trajectoire procédurale du ballon — pas de simulation physique, une
 * parabole (arc) entre deux points au sol avec une hauteur max donnée,
 * plus une courbe latérale optionnelle. Voir §21/§8 de la spec: "visuellement
 * crédible" suffit, pas un vrai moteur physique.
 */
export function ballPositionAt(kick: BallKick, tWithinKick: number): Vector3 {
  const t = Math.max(0, Math.min(1, tWithinKick));
  const x = lerp(kick.from.x, kick.to.x, t);
  const z = lerp(kick.from.z, kick.to.z, t);
  // Arc parabolique: 0 aux extrémités, `apex` au milieu.
  const y = 4 * kick.apex * t * (1 - t);
  // Courbe latérale (frappe enroulée): décalage perpendiculaire à la trajectoire, max au 2/3 du vol.
  const curveOffset = (kick.curve ?? 0) * Math.sin(Math.PI * t) * easeOutCurve(t);
  const dx = kick.to.x - kick.from.x;
  const dz = kick.to.z - kick.from.z;
  const len = Math.hypot(dx, dz) || 1;
  const perpX = -dz / len;
  const perpZ = dx / len;
  return new Vector3(x + perpX * curveOffset, y + 0.11, z + perpZ * curveOffset);
}

function easeOutCurve(t: number) {
  return t * t;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/** Position du ballon "au pied" du joueur (dribble) — suit un offset constant devant les appuis. */
export function ballAtFeet(playerPos: GroundPoint, facingRad: number, leadDistance = 0.55): Vector3 {
  return new Vector3(playerPos.x + Math.sin(facingRad) * leadDistance, 0.11, playerPos.z + Math.cos(facingRad) * leadDistance);
}

/** Trouve la frappe (kick) active à l'instant t du cycle [0,1], et sa progression locale [0,1] — null si le ballon est au sol/au pied entre deux frappes. */
export function activeKickAt(kicks: BallKick[], t: number, kickDuration = 0.35): { kick: BallKick; localT: number } | null {
  for (const kick of kicks) {
    const localT = (t - kick.at) / kickDuration;
    if (localT >= 0 && localT <= 1) return { kick, localT };
  }
  return null;
}
