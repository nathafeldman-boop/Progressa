import type { StatAxis } from "@prisma/client";

/**
 * Schéma de données du moteur 3D — voir docs/exercise3d.md pour le guide
 * "comment ajouter un exercice". Un exercice est décrit par des données,
 * jamais par une scène codée à la main: la même poignée de composants
 * (Player, Ball, Field, Cone, Goal, CameraRig, InstructionOverlay) rejoue
 * n'importe quel Exercise3D.
 */

export type CameraPresetId =
  | "FRONT"
  | "FRONT_45"
  | "SIDE"
  | "SIDE_45"
  | "BACK"
  | "TOP"
  | "CLOSE"
  | "FOLLOW";

export type MovementId =
  | "IDLE"
  | "WALK"
  | "RUN"
  | "SQUAT"
  | "SIDE_PLANK"
  | "KICK"
  | "DRIBBLE_TOUCH"
  | "TURN";

/** Un mouvement du catalogue: soit un clip existant du rig, soit une pose/anim procédurale (fonction pure de bones -> rotations). Voir lib/exercise3d/movements.ts. */
export type MovementSource =
  | { kind: "clip"; clipName: "Idle" | "Walk" | "Run" }
  | { kind: "procedural"; proceduralId: MovementId };

/** Un point au sol, en mètres, origine au centre de la scène. z+ = vers la caméra par défaut. */
export interface GroundPoint {
  x: number;
  z: number;
}

export type MarkerKind = "footPlacement" | "startZone" | "targetZone" | "forbiddenZone" | "point";

export interface SetupMarker {
  kind: MarkerKind;
  at: GroundPoint;
  radius?: number;
  label?: string;
}

export type EquipmentKind = "cone" | "goal" | "ladder" | "wall";

export interface EquipmentPlacement {
  kind: EquipmentKind;
  at: GroundPoint;
  rotationDeg?: number;
}

/** Flèche au sol (direction du déplacement ou du geste) — jamais un simple décor, toujours une info de trajectoire. */
export interface DirectionArrow {
  from: GroundPoint;
  to: GroundPoint;
  curveHeight?: number;
  color?: "accent" | "amber";
}

/** Une phase de la séquence (voir §12/18 spec): objectif pédagogique + ce que fait le joueur + ce qu'on affiche. */
export interface ExercisePhase {
  id: string;
  /** Fraction du cycle [0,1] où cette phase commence — les phases d'un exercice cyclique (squat, sprint) se répètent en boucle sur `loopSeconds`. */
  startAt: number;
  caption: string;
  /** Repère technique court affiché en incrustation pendant cette phase (ex: "DOS DROIT"). */
  cue?: string;
}

export interface BallKick {
  /** Instant du cycle [0,1] où le contact a lieu. */
  at: number;
  from: GroundPoint;
  to: GroundPoint;
  /** Hauteur max de la trajectoire, mètres. */
  apex: number;
  curve?: number;
}

export interface Exercise3D {
  id: string;
  slug: string;
  title: string;
  category: "technique" | "speed" | "strength" | "cardio" | "mobility" | "goalkeeper";

  durationSeconds?: number;
  repetitions?: number;
  restSeconds?: number;

  /** Durée d'un cycle de mouvement en boucle (secondes) — indépendante de durationSeconds (temps total de la série). */
  loopSeconds: number;

  movement: MovementId;
  /** Déplacement du joueur pendant un cycle — absent = sur place (squat, gainage). */
  playerTrajectory?: GroundPoint[];
  /**
   * Réorientation rigide de TOUT le joueur (degrés, [x,y,z]) — pour poser
   * un mouvement déjà validé debout dans une autre orientation (ex:
   * gainage latéral = joueur allongé). Toujours une rotation rigide du
   * groupe entier, jamais une recomposition articulation par articulation
   * (le seul moyen fiable de changer l'orientation sans tout re-calibrer).
   */
  restRotationDeg?: [number, number, number];
  /** Position de repos quand il n'y a pas de playerTrajectory (mètres, [x,y,z]) — sert à soulever le joueur après une réorientation rigide (ex: gainage latéral) pour qu'il ne traverse pas le sol. Défaut [0,0,0]. */
  restPosition?: [number, number, number];

  setup: SetupMarker[];
  equipment: EquipmentPlacement[];
  arrows: DirectionArrow[];
  ball?: { start: GroundPoint; kicks: BallKick[] };

  phases: ExercisePhase[];
  camera: CameraPresetId;

  /** Deltas de stats appliqués en fin de série — alimente lib/player-card.ts. */
  statImpact: Partial<Record<StatAxis, number>>;

  difficulty: 1 | 2 | 3 | 4 | 5;
}
