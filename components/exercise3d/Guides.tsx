"use client";

import { useMemo } from "react";
import { CatmullRomCurve3, Vector3 } from "three";
import type { DirectionArrow, SetupMarker } from "@/lib/exercise3d/types";

const COLOR = { accent: "#3fd383", amber: "#e2a542" };

/** Flèche de trajectoire au sol — jamais un simple décor: encode la direction du déplacement ou du geste (§9). Tube courbé + tête de flèche. */
export function TrajectoryArrow({ arrow }: { arrow: DirectionArrow }) {
  const color = COLOR[arrow.color ?? "accent"];
  const curve = useMemo(() => {
    const mid = new Vector3((arrow.from.x + arrow.to.x) / 2, arrow.curveHeight ?? 0, (arrow.from.z + arrow.to.z) / 2);
    return new CatmullRomCurve3([
      new Vector3(arrow.from.x, 0.02, arrow.from.z),
      mid,
      new Vector3(arrow.to.x, 0.02, arrow.to.z),
    ]);
  }, [arrow]);

  const headAngle = Math.atan2(arrow.to.x - arrow.from.x, arrow.to.z - arrow.from.z);

  return (
    <group>
      <mesh>
        <tubeGeometry args={[curve, 24, 0.02, 8, false]} />
        <meshBasicMaterial color={color} transparent opacity={0.85} />
      </mesh>
      <mesh position={[arrow.to.x, 0.02, arrow.to.z]} rotation={[Math.PI / 2, 0, -headAngle]}>
        <coneGeometry args={[0.06, 0.16, 12]} />
        <meshBasicMaterial color={color} transparent opacity={0.9} />
      </mesh>
    </group>
  );
}

const MARKER_COLOR: Record<SetupMarker["kind"], string> = {
  footPlacement: "#3fd383",
  startZone: "#3fd383",
  targetZone: "#e2a542",
  forbiddenZone: "#c9432c",
  point: "#eef6f0",
};

/** Zone/point au sol — placement des pieds, zone cible, zone interdite (§9). Anneau translucide, pas un aplat opaque: reste lisible sans cacher le sol. */
export function Marker({ marker }: { marker: SetupMarker }) {
  const color = MARKER_COLOR[marker.kind];
  const radius = marker.radius ?? 0.18;
  return (
    <group position={[marker.at.x, 0.015, marker.at.z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius * 0.7, radius, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.9} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[radius * 0.7, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.18} />
      </mesh>
    </group>
  );
}
