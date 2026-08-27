"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Mesh } from "three";
import { Vector3 } from "three";
import type { BallKick, GroundPoint } from "@/lib/exercise3d/types";
import { activeKickAt, ballAtFeet, ballPositionAt } from "@/lib/exercise3d/ball";

/** Ballon — suit une frappe (parabole) si une kick est active à l'instant t, sinon reste "au pied" du joueur (position courante, pas figée: suit un joueur qui se déplace en dribble). */
export function Ball({
  getPlayerPos,
  kicks,
  getT,
  getPlayerFacingRad,
}: {
  getPlayerPos: () => GroundPoint;
  kicks: BallKick[];
  getT: () => number;
  getPlayerFacingRad?: () => number;
}) {
  const ref = useRef<Mesh>(null);
  const spin = useRef(0);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const t = getT();
    const active = activeKickAt(kicks, t);
    let pos: Vector3;
    if (active) {
      pos = ballPositionAt(active.kick, active.localT);
    } else {
      pos = ballAtFeet(getPlayerPos(), getPlayerFacingRad?.() ?? 0);
    }
    ref.current.position.copy(pos);
    spin.current += delta * (active ? 14 : 4);
    ref.current.rotation.x = spin.current;
    ref.current.rotation.z = spin.current * 0.6;
  });

  return (
    <mesh ref={ref} castShadow>
      <sphereGeometry args={[0.11, 20, 20]} />
      <meshStandardMaterial color="#eef6f0" roughness={0.5} />
    </mesh>
  );
}
