import { Vector3 } from "three";
import type { CameraPresetId } from "./types";

/**
 * Position/cible caméra par preset, relative à un pivot (en général le
 * centre du joueur). Un exercice choisit UN preset (jamais une caméra
 * codée à la main) — voir la règle §6 du brief: la caméra ne doit jamais
 * cacher le mouvement.
 *
 * Convention: le joueur fait face à +Z par défaut (la caméra par défaut
 * regarde depuis -Z vers +Z... voir `offset`/`lookAtOffset` ci-dessous,
 * exprimés en mètres autour du pivot).
 */
export interface CameraPreset {
  id: CameraPresetId;
  /** Position de la caméra, relative au pivot. */
  offset: Vector3;
  /** Point regardé, relatif au pivot (en général un peu au-dessus du sol, hauteur du bassin/torse). */
  lookAtOffset: Vector3;
  fov: number;
}

export const CAMERA_PRESETS: Record<CameraPresetId, CameraPreset> = {
  FRONT: { id: "FRONT", offset: new Vector3(0, 1.5, 4.2), lookAtOffset: new Vector3(0, 1, 0), fov: 32 },
  FRONT_45: { id: "FRONT_45", offset: new Vector3(2.8, 1.6, 3.2), lookAtOffset: new Vector3(0, 1, 0), fov: 32 },
  SIDE: { id: "SIDE", offset: new Vector3(4.6, 1.3, 0), lookAtOffset: new Vector3(0, 0.9, 0), fov: 30 },
  SIDE_45: { id: "SIDE_45", offset: new Vector3(3.6, 1.5, 2.2), lookAtOffset: new Vector3(0, 1, 0), fov: 30 },
  BACK: { id: "BACK", offset: new Vector3(0, 1.5, -4.2), lookAtOffset: new Vector3(0, 1, 0), fov: 32 },
  TOP: { id: "TOP", offset: new Vector3(0, 6.5, 0.8), lookAtOffset: new Vector3(0, 0, 0), fov: 40 },
  CLOSE: { id: "CLOSE", offset: new Vector3(1.4, 1.1, 1.6), lookAtOffset: new Vector3(0, 0.9, 0), fov: 26 },
  FOLLOW: { id: "FOLLOW", offset: new Vector3(0, 1.6, 4), lookAtOffset: new Vector3(0, 1, 0), fov: 34 },
};

/**
 * Choix par défaut recommandé par mouvement — voir §6 de la spec (exemples
 * sprint -> SIDE, dribble -> 45, squat -> FRONT_45, frappe -> SIDE_45).
 * Un Exercise3D peut toujours surcharger avec son propre `camera`.
 */
export const DEFAULT_CAMERA_FOR_MOVEMENT: Record<string, CameraPresetId> = {
  SQUAT: "FRONT_45",
  SIDE_PLANK: "CLOSE",
  RUN: "SIDE",
  DRIBBLE_TOUCH: "FRONT_45",
  KICK: "SIDE_45",
};
