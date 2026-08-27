"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Player } from "@/components/exercise3d/Player";
import { Field } from "@/components/exercise3d/Field";
import { Cone, Goal, Ladder } from "@/components/exercise3d/Equipment";
import { Marker, TrajectoryArrow } from "@/components/exercise3d/Guides";
import { Ball } from "@/components/exercise3d/Ball";
import { CameraRig } from "@/components/exercise3d/CameraRig";
import { InstructionOverlay } from "@/components/exercise3d/InstructionOverlay";
import { PROCEDURAL_POSES } from "@/lib/exercise3d/movements";
import type { Exercise3D as Exercise3DData, GroundPoint } from "@/lib/exercise3d/types";

const CLIP_MOVEMENTS = new Set(["RUN", "WALK", "IDLE"]);
const CLIP_BY_MOVEMENT: Record<string, "Idle" | "Walk" | "Run"> = { RUN: "Run", WALK: "Walk", IDLE: "Idle" };

// Le rig placeholder (voir docs/exercise3d.md) fait face à -Z en bind pose,
// pas +Z comme la convention du moteur (WORLD_AXIS.faceBack) — vérifié par
// rendu (une caméra FRONT montrait le dos, pas le visage). Se recalibrer
// si un futur GLB custom est branché (voir Player onFrame/onReady pour
// vérifier les noms de bones ET le sens de face avant de réutiliser cette
// constante telle quelle).
const MODEL_FACING_OFFSET = Math.PI;

function lerpPoint(path: GroundPoint[], t: number): { point: GroundPoint; facingRad: number } {
  if (path.length < 2) return { point: path[0] ?? { x: 0, z: 0 }, facingRad: MODEL_FACING_OFFSET };
  const segCount = path.length - 1;
  const segF = t * segCount;
  const i = Math.min(segCount - 1, Math.floor(segF));
  const localT = segF - i;
  const a = path[i];
  const b = path[i + 1];
  const point = { x: a.x + (b.x - a.x) * localT, z: a.z + (b.z - a.z) * localT };
  const facingRad = Math.atan2(b.x - a.x, b.z - a.z) + MODEL_FACING_OFFSET;
  return { point, facingRad };
}

/**
 * Anime le joueur/la caméra/le ballon à l'intérieur du Canvas — toute la
 * position/rotation qui change à chaque frame est mutée IMPÉRATIVEMENT ici
 * (jamais via des props React recalculées au rendu: un ref lu pendant le
 * rendu casse les règles de pureté React 19 et, de toute façon, ce n'est
 * pas ce pour quoi useFrame existe).
 */
function TimedRig({ exercise, playing }: { exercise: Exercise3DData; playing: boolean }) {
  const tRef = useRef(0);
  const posRef = useRef<GroundPoint>({ x: 0, z: 0 });
  const facingRef = useRef(MODEL_FACING_OFFSET);

  const isClip = CLIP_MOVEMENTS.has(exercise.movement);
  const proceduralFn = PROCEDURAL_POSES[exercise.movement];

  return (
    <group>
      <Player
        clipName={isClip ? CLIP_BY_MOVEMENT[exercise.movement] : undefined}
        onFrame={(h, _elapsed, delta) => {
          if (playing) tRef.current = (tRef.current + delta / exercise.loopSeconds) % 1;
          if (exercise.playerTrajectory) {
            const { point, facingRad } = lerpPoint(exercise.playerTrajectory, tRef.current);
            posRef.current = point;
            facingRef.current = facingRad;
            h.root.position.set(point.x, 0, point.z);
            h.root.rotation.set(0, facingRad, 0);
          }
          if (proceduralFn) proceduralFn(h, tRef.current);
        }}
        position={exercise.playerTrajectory ? undefined : (exercise.restPosition ?? [0, 0, 0])}
        rotationY={exercise.playerTrajectory ? undefined : MODEL_FACING_OFFSET}
        extraRotationDeg={exercise.restRotationDeg}
      />
      <CameraRig preset={exercise.camera} getPivot={() => posRef.current} />
      {exercise.ball && (
        <Ball
          getPlayerPos={() => (exercise.playerTrajectory ? posRef.current : exercise.ball!.start)}
          kicks={exercise.ball.kicks}
          getT={() => tRef.current}
          getPlayerFacingRad={() => facingRef.current}
        />
      )}
    </group>
  );
}

function currentPhase(exercise: Exercise3DData, t: number) {
  let active = exercise.phases[0];
  for (const p of exercise.phases) {
    if (p.startAt <= t) active = p;
  }
  return active;
}

/** Composant public — voir docs/exercise3d.md. Usage: `<Exercise3D exercise={SQUAT} />`. */
export function Exercise3D({ exercise }: { exercise: Exercise3DData }) {
  const [startedAt] = useState(() => performance.now());
  // Ticker HTML hors Canvas (chrono affiché, légende de phase) — mis à
  // jour ~4x/s via un effet, jamais en lisant performance.now() pendant le
  // rendu (règle de pureté React 19).
  const [now, setNow] = useState(startedAt);
  useEffect(() => {
    const id = window.setInterval(() => setNow(performance.now()), 250);
    return () => window.clearInterval(id);
  }, []);

  const elapsed = (now - startedAt) / 1000;
  const loopT = exercise.loopSeconds > 0 ? (elapsed % exercise.loopSeconds) / exercise.loopSeconds : 0;
  const phase = currentPhase(exercise, loopT);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-[var(--radius-card)]">
      <Canvas shadows camera={{ position: [0, 1.5, 4.2], fov: 32 }} dpr={[1, 1.5]}>
        <color attach="background" args={["#0e1a15"]} />
        <fog attach="fog" args={["#0e1a15", 8, 22]} />
        <ambientLight intensity={0.55} />
        <directionalLight position={[3, 6, 3]} intensity={1.4} castShadow shadow-mapSize={[1024, 1024]} />
        <Suspense fallback={null}>
          <Field />
          {exercise.equipment.map((e, i) =>
            e.kind === "cone" ? (
              <Cone key={i} at={e.at} rotationDeg={e.rotationDeg} />
            ) : e.kind === "goal" ? (
              <Goal key={i} at={e.at} rotationDeg={e.rotationDeg} />
            ) : e.kind === "ladder" ? (
              <Ladder key={i} at={e.at} rotationDeg={e.rotationDeg} />
            ) : null
          )}
          {exercise.setup.map((m, i) => (
            <Marker key={i} marker={m} />
          ))}
          {exercise.arrows.map((a, i) => (
            <TrajectoryArrow key={i} arrow={a} />
          ))}
          <TimedRig exercise={exercise} playing />
        </Suspense>
      </Canvas>
      <InstructionOverlay
        caption={phase?.caption ?? exercise.title}
        cue={phase?.cue}
        elapsedSeconds={elapsed}
        totalSeconds={exercise.durationSeconds}
        repLabel={exercise.repetitions ? `${exercise.repetitions} rép.` : undefined}
      />
    </div>
  );
}
