"use client";

import { useFrame } from "@react-three/fiber";
import { PerspectiveCamera, Vector3 } from "three";
import { CAMERA_PRESETS } from "@/lib/exercise3d/cameras";
import type { CameraPresetId, GroundPoint } from "@/lib/exercise3d/types";

const _pos = new Vector3();
const _look = new Vector3();

/**
 * Positionne la caméra selon le preset choisi par l'exercice, centrée sur
 * un pivot (par défaut l'origine, ou la position courante du joueur pour
 * un exercice qui se déplace — FOLLOW). Ne choisit jamais un angle qui
 * cache le geste (§6): chaque preset est pré-validé, un Exercise3D ne
 * fait QUE sélectionner lequel utiliser.
 *
 * Mutation impérative de la caméra via le `state` fourni en argument du
 * callback useFrame (hors du cycle de rendu React) plutôt que la valeur
 * renvoyée par le hook `useThree()` en haut du composant — muter
 * directement la valeur d'un hook est interdit par les règles de pureté
 * React 19, alors que muter un objet Three.js à chaque frame est
 * précisément ce pour quoi useFrame existe.
 */
export function CameraRig({ preset, getPivot }: { preset: CameraPresetId; getPivot?: () => GroundPoint }) {
  const cfg = CAMERA_PRESETS[preset];

  useFrame((state) => {
    const camera = state.camera;
    const pivot = getPivot?.() ?? { x: 0, z: 0 };
    _pos.set(cfg.offset.x + pivot.x, cfg.offset.y, cfg.offset.z + pivot.z);
    _look.set(cfg.lookAtOffset.x + pivot.x, cfg.lookAtOffset.y, cfg.lookAtOffset.z + pivot.z);
    camera.position.lerp(_pos, preset === "FOLLOW" ? 0.06 : 1);
    camera.lookAt(_look);
    if (camera instanceof PerspectiveCamera) {
      camera.fov = cfg.fov;
      camera.updateProjectionMatrix();
    }
  });

  return null;
}
