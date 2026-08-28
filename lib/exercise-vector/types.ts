import type { Point } from "./ik";

/**
 * Les 6 points de contrôle d'une pose — tout le reste (genoux, coudes) se
 * déduit par IK (voir ik.ts). Coordonnées absolues dans le viewBox du rig
 * (voir constants.ts) : poser une pose, c'est juste dire "où sont la main
 * et le pied", jamais un angle. C'est ce qui rend "allongé" (planche,
 * plongeon gardien) aussi simple à écrire que "debout" — pas de rotation
 * globale à appliquer, seulement d'autres coordonnées.
 */
export interface Pose {
  hip: Point;
  shoulder: Point;
  /** Bras/jambe arrière (dessiné en premier, légèrement en retrait). */
  handA: Point;
  footA: Point;
  /** Bras/jambe avant (dessiné en dernier, au premier plan). */
  handB: Point;
  footB: Point;
}

export interface PoseKeyframe {
  /** 0 à 1, fraction du cycle. Le premier et le dernier keyframe doivent
   * décrire la même pose pour une boucle sans à-coup. */
  t: number;
  pose: Pose;
  /** Position du ballon si l'exercice en utilise un — absent sinon. */
  ball?: Point;
}

export interface Movement {
  keyframes: PoseKeyframe[];
  loopSeconds: number;
  /** true pour une tenue statique (gainage, étirement) — la boucle existe
   * seulement pour une respiration très légère, jamais un vrai mouvement. */
  isHold?: boolean;
  /**
   * [largeur, hauteur] du viewBox — par défaut le cadre portrait standard
   * (voir constants.ts). Une pose allongée (planche, pompes, hip thrust)
   * a besoin d'un corps étiré sur ~190-210px de large; le cadre portrait
   * de 240px ne laisse quasiment aucune marge pour la tête et force soit
   * un rognage soit une jambe trop pliée pour tenir dans le cadre. Un
   * cadre plus large dédié à ces mouvements règle ça à la racine plutôt
   * que de rogner sur la pose elle-même.
   */
  viewBox?: [number, number];
}
