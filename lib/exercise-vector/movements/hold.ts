import { holdMovement } from "../mirror";
import { STAND } from "../reference";
import type { Movement, Pose } from "../types";

/** Debout relâché — retour au calme, respiration, mobilité d'épaules. */
export const RELAXED_STAND: Movement = holdMovement({ ...STAND, handA: { x: 102, y: 170 }, handB: { x: 138, y: 170 } });

/** Équilibre unipodal: appui sur une jambe, genou opposé plié, bras
 * écartés pour l'équilibre. */
const BALANCE: Pose = {
  hip: { x: 120, y: 178 },
  shoulder: { x: 120, y: 98 },
  handA: { x: 82, y: 160 },
  handB: { x: 158, y: 160 },
  footA: { x: 120, y: 293 },
  footB: { x: 150, y: 232 },
};
export const SINGLE_LEG_BALANCE: Movement = holdMovement(BALANCE);

/** Buste penché en avant, mains vers le pied opposé — ischios, mollets. */
const FORWARD_HINGE: Pose = {
  hip: { x: 128, y: 210 },
  shoulder: { x: 158, y: 202 },
  handA: { x: 205, y: 248 },
  handB: { x: 215, y: 252 },
  footA: { x: 100, y: 292 },
  footB: { x: 172, y: 292 },
};
export const FORWARD_HINGE_STRETCH: Movement = holdMovement(FORWARD_HINGE);

/** Grand écart latéral tenu — adducteurs, hanches. */
const WIDE_SIDE_LEAN: Pose = {
  hip: { x: 150, y: 214 },
  shoulder: { x: 158, y: 138 },
  handA: { x: 118, y: 170 },
  handB: { x: 186, y: 172 },
  footA: { x: 58, y: 282 },
  footB: { x: 172, y: 292 },
};
export const WIDE_SIDE_LEAN_STRETCH: Movement = holdMovement(WIDE_SIDE_LEAN);

/** Position basse au sol (pigeon / auto-massage) — assis, une jambe
 * repliée devant, l'autre tendue derrière. */
const FLOOR_SEATED: Pose = {
  hip: { x: 140, y: 268 },
  shoulder: { x: 140, y: 188 },
  handA: { x: 112, y: 244 },
  handB: { x: 168, y: 244 },
  footA: { x: 216, y: 280 },
  footB: { x: 96, y: 268 },
};
export const FLOOR_SEATED_STRETCH: Movement = holdMovement(FLOOR_SEATED);
