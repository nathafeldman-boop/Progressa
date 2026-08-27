"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import { Bone, Group, Object3D, Quaternion } from "three";
import { SkeletonUtils } from "three-stdlib";

const PLAYER_MODEL_URL = "/models/player-placeholder.glb";

export interface PlayerHandle {
  bones: Map<string, Bone>;
  bindLocal: Map<string, Quaternion>;
  /** Racine du joueur — pour un déplacement (trajectoire) muté impérativement à chaque frame plutôt que via des props React recalculées (voir Exercise3D.tsx). */
  root: Group;
}

/**
 * Joueur 3D — charge le rig partagé (voir docs/exercise3d.md: un seul GLB,
 * jamais dupliqué), et expose sa map d'os + leurs quaternions de bind pose
 * via `onReady`, pour que le mouvement procédural (lib/exercise3d/rig.ts)
 * puisse poser chaque frame sans jamais deviner la convention locale du
 * rig. `clipName` joue un clip existant du rig (Idle/Walk/Run) — laisser
 * vide pour un mouvement 100% procédural (squat, gainage).
 */
export function Player({
  clipName,
  onReady,
  onFrame,
  position,
  rotationY = 0,
  extraRotationDeg,
}: {
  clipName?: "Idle" | "Walk" | "Run" | "TPose";
  onReady?: (handle: PlayerHandle) => void;
  onFrame?: (handle: PlayerHandle, elapsed: number, delta: number) => void;
  position?: [number, number, number];
  rotationY?: number;
  /** Réorientation rigide additionnelle (degrés, [x,y,z]) — voir Exercise3D.restRotationDeg. */
  extraRotationDeg?: [number, number, number];
}) {
  const { scene, animations } = useGLTF(PLAYER_MODEL_URL);
  // useGLTF met en cache une seule instance de scène — SkeletonUtils.clone
  // (contrairement à Object3D.clone) recrée correctement les bindings
  // squelette/skin pour que plusieurs <Player> ne partagent pas leur pose.
  const cloned = useMemo(() => SkeletonUtils.clone(scene) as Group, [scene]);
  const { actions, mixer } = useAnimations(animations, cloned);
  const handleRef = useRef<PlayerHandle | null>(null);

  useEffect(() => {
    const bones = new Map<string, Bone>();
    const bindLocal = new Map<string, Quaternion>();
    cloned.traverse((obj: Object3D) => {
      if ((obj as Bone).isBone) {
        const bone = obj as Bone;
        bones.set(bone.name, bone);
        bindLocal.set(bone.name, bone.quaternion.clone());
      }
    });
    const handle: PlayerHandle = { bones, bindLocal, root: cloned };
    handleRef.current = handle;
    onReady?.(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cloned]);

  useEffect(() => {
    Object.values(actions).forEach((a) => a?.stop());
    if (clipName && actions[clipName]) {
      actions[clipName]!.reset().fadeIn(0.15).play();
    }
    return () => {
      if (clipName && actions[clipName]) actions[clipName]!.fadeOut(0.15);
    };
  }, [clipName, actions]);

  useFrame((_, delta) => {
    mixer.update(delta);
    if (handleRef.current) onFrame?.(handleRef.current, mixer.time, delta);
  });

  const [ex, ey, ez] = extraRotationDeg ?? [0, 0, 0];
  // Le GLB porte déjà sa propre échelle/correction d'axe sur le noeud
  // racine "Character" (cm -> m, Z-up -> Y-up) — ne jamais la resurcharger
  // ici, sous peine de composer les deux et obtenir un personnage
  // minuscule ou démesuré.
  return (
    <primitive
      object={cloned}
      position={position}
      rotation={[(ex * Math.PI) / 180, rotationY + (ey * Math.PI) / 180, (ez * Math.PI) / 180]}
    />
  );
}

useGLTF.preload(PLAYER_MODEL_URL);
