/** Dimensions fixes du personnage — mêmes proportions que le prototype
 * "montée de genoux" validé (voir historique). Ne jamais varier ces
 * longueurs par pose: c'est justement ce qui permet à l'IK de garantir
 * une articulation toujours physiquement possible. */
export const VIEWBOX_W = 240;
export const VIEWBOX_H = 340;

export const THIGH = 62;
export const SHIN = 58;
export const UPPER_ARM = 42;
export const FOREARM = 38;
export const HEAD_R = 25;
/**
 * Distance épaule → centre de la tête, le long de l'axe hanche→épaule.
 * Le trait épais du torse a un bout arrondi (strokeLinecap="round") qui
 * dépasse le point "épaule" d'environ largeur/2 = 22px dans CETTE MÊME
 * direction — sans un cou assez long, la tête chevauche ce bout arrondi.
 * Visible seulement en position allongée (torse ~horizontal, le
 * chevauchement se voit de face) — d'où NECK bien plus grand que
 * HEAD_R + 22 pour garder une marge dans tous les cas.
 */
export const NECK = 54;

export const LIMB_W_LEG = 24;
export const LIMB_W_ARM = 18;
