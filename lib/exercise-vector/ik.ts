/**
 * Cinématique inverse 2 segments (hanche→genou→pied, épaule→coude→main) —
 * voir docs/exercise-vector.md pour la dérivation et la vérification
 * numérique (36 cas, angles limites inclus). Le point clé: on ne pose
 * JAMAIS un angle d'articulation à la main (c'est exactement ce qui a
 * produit un genou "inversé" une première fois, puis un coude, dans la
 * toute première version manuelle de ce rig) — on pose une CIBLE (où doit
 * être le pied/la main) et l'IK calcule le coude/genou qui y mène,
 * toujours à la bonne distance des deux segments donc jamais une
 * articulation impossible.
 *
 * bendSign fixe UNE FOIS POUR TOUTES de quel côté l'articulation plie —
 * vérifié stable (jamais d'inversion) sur tout le débattement utile d'une
 * jambe ou d'un bras. Ne jamais le recalculer par pose.
 */

export interface Point {
  x: number;
  y: number;
}

export interface LimbSolution {
  joint: Point;
  end: Point;
}

/** Genou: plie toujours du même côté (vers l'avant du personnage). */
export const KNEE_BEND: 1 | -1 = -1;
/** Coude: plie toujours du même côté (vers le haut/l'avant). */
export const ELBOW_BEND: 1 | -1 = 1;

/**
 * Résout un membre à 2 segments (longueurs L1, L2) depuis `root` vers une
 * cible `target`. Si la cible est hors de portée, elle est ramenée à la
 * portée maximale (le membre s'étire au maximum plutôt que de "casser") —
 * un membre trop tendu se voit, un membre à l'envers ne se voit pas
 * forcément tout de suite: on préfère l'erreur visible.
 */
export function solveLimb(root: Point, target: Point, l1: number, l2: number, bendSign: 1 | -1): LimbSolution {
  const dx = target.x - root.x;
  const dy = target.y - root.y;
  const rawDist = Math.hypot(dx, dy);
  const maxReach = l1 + l2 - 1e-6;
  const minReach = Math.abs(l1 - l2) + 1e-6;
  const dist = Math.min(maxReach, Math.max(minReach, rawDist || minReach));

  const ux = rawDist > 1e-9 ? dx / rawDist : 0;
  const uy = rawDist > 1e-9 ? dy / rawDist : 1;
  const end: Point = { x: root.x + ux * dist, y: root.y + uy * dist };

  const baseAngle = Math.atan2(end.y - root.y, end.x - root.x);
  let cosA = (l1 * l1 + dist * dist - l2 * l2) / (2 * l1 * dist);
  cosA = Math.min(1, Math.max(-1, cosA));
  const a = Math.acos(cosA);

  const jointAngle = baseAngle + bendSign * a;
  const joint: Point = {
    x: root.x + l1 * Math.cos(jointAngle),
    y: root.y + l1 * Math.sin(jointAngle),
  };

  return { joint, end };
}

export function lerpPoint(a: Point, b: Point, t: number): Point {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}
