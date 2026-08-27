"use client";

import type { GroundPoint } from "@/lib/exercise3d/types";

/** Plot — géométrie procédurale, pas d'asset GLB nécessaire (voir §32: ne dupliquer aucun asset inutilement, ici il n'y en a même pas besoin). */
export function Cone({ at, rotationDeg = 0 }: { at: GroundPoint; rotationDeg?: number }) {
  return (
    <group position={[at.x, 0, at.z]} rotation={[0, (rotationDeg * Math.PI) / 180, 0]}>
      <mesh position={[0, 0.14, 0]} castShadow>
        <coneGeometry args={[0.11, 0.28, 16]} />
        <meshStandardMaterial color="#e2622a" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.14, 0.14, 0.03, 16]} />
        <meshStandardMaterial color="#c94e1c" roughness={0.7} />
      </mesh>
    </group>
  );
}

/** But simplifié — cadre seul, pas de filet détaillé (rester neutre, §5: ne jamais distraire du geste). */
export function Goal({ at, rotationDeg = 0, width = 2.4, height = 1.3 }: { at: GroundPoint; rotationDeg?: number; width?: number; height?: number }) {
  const postR = 0.035;
  return (
    <group position={[at.x, 0, at.z]} rotation={[0, (rotationDeg * Math.PI) / 180, 0]}>
      <mesh position={[-width / 2, height / 2, 0]} castShadow>
        <cylinderGeometry args={[postR, postR, height, 10]} />
        <meshStandardMaterial color="#eef6f0" roughness={0.5} />
      </mesh>
      <mesh position={[width / 2, height / 2, 0]} castShadow>
        <cylinderGeometry args={[postR, postR, height, 10]} />
        <meshStandardMaterial color="#eef6f0" roughness={0.5} />
      </mesh>
      <mesh position={[0, height, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[postR, postR, width, 10]} />
        <meshStandardMaterial color="#eef6f0" roughness={0.5} />
      </mesh>
    </group>
  );
}

/** Échelle de rythme — barreaux au sol, purement procédural. */
export function Ladder({ at, rotationDeg = 0, rungs = 8 }: { at: GroundPoint; rotationDeg?: number; rungs?: number }) {
  const rungSpacing = 0.42;
  return (
    <group position={[at.x, 0.005, at.z]} rotation={[0, (rotationDeg * Math.PI) / 180, 0]}>
      {Array.from({ length: rungs }).map((_, i) => (
        <mesh key={i} position={[0, 0, i * rungSpacing]}>
          <boxGeometry args={[0.5, 0.02, 0.05]} />
          <meshStandardMaterial color="#e2a542" roughness={0.6} />
        </mesh>
      ))}
      {[-0.25, 0.25].map((x) => (
        <mesh key={x} position={[x, 0, ((rungs - 1) * rungSpacing) / 2]}>
          <boxGeometry args={[0.04, 0.02, (rungs - 1) * rungSpacing + 0.3]} />
          <meshStandardMaterial color="#e2a542" roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
}
