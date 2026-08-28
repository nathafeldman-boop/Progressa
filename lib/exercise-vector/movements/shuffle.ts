import { alternatingCycle } from "../mirror";
import type { Movement, Pose } from "../types";

/** Pas chassés / repli défensif: position basse (genoux fléchis en
 * permanence), déplacement latéral — vue de face. Jambe B écartée large
 * (le pas), jambe A qui suit plus proche du centre. */
function shufflePeak(): Pose {
  return {
    hip: { x: 136, y: 224 },
    shoulder: { x: 130, y: 146 },
    handA: { x: 84, y: 208 },
    handB: { x: 188, y: 196 },
    footA: { x: 104, y: 286 },
    footB: { x: 178, y: 291 },
  };
}
export const LATERAL_SHUFFLE: Movement = alternatingCycle(shufflePeak(), 0.75);

/** Bondissements latéraux: même principe mais amplitude plus grande et
 * hanche qui remonte franchement entre deux appuis (impulsion). */
function bondPeak(): Pose {
  return {
    hip: { x: 150, y: 210 },
    shoulder: { x: 144, y: 130 },
    handA: { x: 88, y: 181 },
    handB: { x: 202, y: 179 },
    footA: { x: 96, y: 282 },
    footB: { x: 196, y: 291 },
  };
}
export const LATERAL_BOUND: Movement = alternatingCycle(bondPeak(), 0.85);
