"use client";

/** Terrain minimal — plan vert + lignes blanches, assez neutre pour ne jamais distraire du geste (voir §5 de la spec). */
export function Field({ size = 20 }: { size?: number }) {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial color="#1c5c3a" roughness={0.95} />
      </mesh>
      {/* Ligne centrale + cercle, repères discrets pour donner une échelle sans surcharger. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
        <ringGeometry args={[1.8, 1.86, 48]} />
        <meshBasicMaterial color="#eef6f0" transparent opacity={0.35} />
      </mesh>
    </group>
  );
}
