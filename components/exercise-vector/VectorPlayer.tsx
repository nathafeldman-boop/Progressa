"use client";

import { useEffect, useRef, useState } from "react";
import type { Movement, Pose, PoseKeyframe } from "@/lib/exercise-vector/types";
import { solveLimb, lerpPoint, KNEE_BEND, ELBOW_BEND, type Point } from "@/lib/exercise-vector/ik";
import { THIGH, SHIN, UPPER_ARM, FOREARM, HEAD_R, NECK, LIMB_W_LEG, LIMB_W_ARM, VIEWBOX_W, VIEWBOX_H } from "@/lib/exercise-vector/constants";
import { OUTFIELD_KIT, type VectorKit } from "@/lib/exercise-vector/kits";

export { OUTFIELD_KIT, GOALKEEPER_KIT, type VectorKit } from "@/lib/exercise-vector/kits";

function findFrame(keyframes: PoseKeyframe[], t: number): { a: PoseKeyframe; b: PoseKeyframe; localT: number } {
  let i = 0;
  while (i < keyframes.length - 1 && keyframes[i + 1].t < t) i++;
  const a = keyframes[i];
  const b = keyframes[Math.min(i + 1, keyframes.length - 1)];
  const span = b.t - a.t;
  const localT = span > 0 ? (t - a.t) / span : 0;
  return { a, b, localT };
}

function lerpPose(a: Pose, b: Pose, t: number): Pose {
  return {
    hip: lerpPoint(a.hip, b.hip, t),
    shoulder: lerpPoint(a.shoulder, b.shoulder, t),
    handA: lerpPoint(a.handA, b.handA, t),
    handB: lerpPoint(a.handB, b.handB, t),
    footA: lerpPoint(a.footA, b.footA, t),
    footB: lerpPoint(a.footB, b.footB, t),
  };
}

/** Ligne épaisse à bouts ronds ("capsule"), toujours doublée d'un contour
 * plus large en dessous — même contour net que le reste de l'UI, jamais un
 * bord flou ni un chemin SVG compliqué à maintenir. */
function CapsuleLine({ from, to, width, color, outline }: { from: Point; to: Point; width: number; color: string; outline: string }) {
  return (
    <>
      <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={outline} strokeWidth={width + 4} strokeLinecap="round" />
      <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={color} strokeWidth={width} strokeLinecap="round" />
    </>
  );
}

function Limb({ root, target, l1, l2, bend, width, color, outline }: { root: Point; target: Point; l1: number; l2: number; bend: 1 | -1; width: number; color: string; outline: string }) {
  const { joint, end } = solveLimb(root, target, l1, l2, bend);
  return (
    <g>
      <CapsuleLine from={root} to={joint} width={width} color={color} outline={outline} />
      <CapsuleLine from={joint} to={end} width={width * 0.86} color={color} outline={outline} />
    </g>
  );
}

function Foot({ end, from, kit }: { end: Point; from: Point; kit: VectorKit }) {
  const dx = end.x - from.x;
  const dy = end.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  const fx = dx / len;
  const fy = dy / len;
  const toe: Point = { x: end.x + fx * 20, y: end.y + fy * 20 };
  return (
    <g>
      <CapsuleLine from={end} to={toe} width={15} color={kit.boot} outline={kit.outline} />
    </g>
  );
}

function Ball({ point }: { point: Point }) {
  return (
    <g>
      <circle cx={point.x} cy={point.y} r={11} fill="#fff" stroke="#11151d" strokeWidth={2} />
      <path d={`M ${point.x} ${point.y - 5} l 4.2 3 -1.6 4.9 h -5.2 l -1.6 -4.9 Z`} fill="#11151d" stroke="none" />
    </g>
  );
}

export function VectorPlayer({
  movement,
  kit = OUTFIELD_KIT,
  showBall = false,
  className,
  playing = true,
}: {
  movement: Movement;
  kit?: VectorKit;
  showBall?: boolean;
  className?: string;
  playing?: boolean;
}) {
  const [t, setT] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (!playing) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    function tick(now: number) {
      if (startRef.current == null) startRef.current = now;
      const elapsed = (now - startRef.current) / 1000;
      const cycle = (elapsed % movement.loopSeconds) / movement.loopSeconds;
      setT(cycle);
      if (!reduceMotion) rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      startRef.current = null;
    };
  }, [movement, playing]);

  const { a, b, localT } = findFrame(movement.keyframes, t);
  const pose = lerpPose(a.pose, b.pose, localT);
  const ball = a.ball && b.ball ? lerpPoint(a.ball, b.ball, localT) : (a.ball ?? b.ball);

  const neckDx = pose.shoulder.x - pose.hip.x;
  const neckDy = pose.shoulder.y - pose.hip.y;
  const neckLen = Math.hypot(neckDx, neckDy) || 1;
  const head: Point = {
    x: pose.shoulder.x + (neckDx / neckLen) * NECK,
    y: pose.shoulder.y + (neckDy / neckLen) * NECK,
  };

  const shadowCx = (pose.footA.x + pose.footB.x) / 2;

  const legA = solveLimb(pose.hip, pose.footA, THIGH, SHIN, KNEE_BEND);
  const legB = solveLimb(pose.hip, pose.footB, THIGH, SHIN, KNEE_BEND);

  return (
    <svg viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`} className={className} xmlns="http://www.w3.org/2000/svg">
      <ellipse cx={shadowCx} cy={318} rx={44} ry={9} fill="rgba(16,23,36,.16)" />

      {/* jambe arrière */}
      <Limb root={pose.hip} target={pose.footA} l1={THIGH} l2={SHIN} bend={KNEE_BEND} width={LIMB_W_LEG} color={kit.skinShade} outline={kit.outline} />
      <Foot end={legA.end} from={legA.joint} kit={kit} />

      {/* bras arrière */}
      <Limb root={pose.shoulder} target={pose.handA} l1={UPPER_ARM} l2={FOREARM} bend={ELBOW_BEND} width={LIMB_W_ARM} color={kit.jersey} outline={kit.outline} />
      <circle cx={pose.handA.x} cy={pose.handA.y} r={7} fill={kit.skin} stroke={kit.outline} strokeWidth={2} />

      {/* torse + short */}
      <CapsuleLine from={pose.hip} to={pose.shoulder} width={44} color={kit.jersey} outline={kit.outline} />
      <ellipse cx={pose.hip.x} cy={pose.hip.y} rx={26} ry={16} fill={kit.shorts} stroke={kit.outline} strokeWidth={2} />

      {/* tête */}
      <g stroke={kit.outline} strokeWidth={2} strokeLinejoin="round">
        <circle cx={head.x} cy={head.y} r={HEAD_R} fill={kit.skin} />
        <path
          d={`M ${head.x - HEAD_R + 2} ${head.y - 4} Q ${head.x - HEAD_R + 4} ${head.y - HEAD_R - 3} ${head.x + 2} ${head.y - HEAD_R} Q ${head.x + HEAD_R + 2} ${head.y - HEAD_R + 1} ${head.x + HEAD_R - 1} ${head.y - 6} Q ${head.x + HEAD_R - 8} ${head.y - HEAD_R + 10} ${head.x} ${head.y - HEAD_R + 10} Q ${head.x - HEAD_R + 10} ${head.y - HEAD_R + 10} ${head.x - HEAD_R + 2} ${head.y - 4} Z`}
          fill={kit.hair}
        />
      </g>

      {/* bras avant */}
      <Limb root={pose.shoulder} target={pose.handB} l1={UPPER_ARM} l2={FOREARM} bend={ELBOW_BEND} width={LIMB_W_ARM} color={kit.jersey} outline={kit.outline} />
      <circle cx={pose.handB.x} cy={pose.handB.y} r={7} fill={kit.skin} stroke={kit.outline} strokeWidth={2} />

      {/* jambe avant */}
      <Limb root={pose.hip} target={pose.footB} l1={THIGH} l2={SHIN} bend={KNEE_BEND} width={LIMB_W_LEG} color={kit.skin} outline={kit.outline} />
      <Foot end={legB.end} from={legB.joint} kit={kit} />

      {showBall && ball && <Ball point={ball} />}
    </svg>
  );
}
