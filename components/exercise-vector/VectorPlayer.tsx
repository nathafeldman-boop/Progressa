"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { Movement, Pose, PoseKeyframe } from "@/lib/exercise-vector/types";
import { solveLimb, lerpPoint, KNEE_BEND, ELBOW_BEND, type Point } from "@/lib/exercise-vector/ik";
import { THIGH, SHIN, UPPER_ARM, FOREARM, HEAD_R, NECK, LIMB_W_LEG, LIMB_W_ARM, VIEWBOX_W, VIEWBOX_H } from "@/lib/exercise-vector/constants";
import { OUTFIELD_KIT, type VectorKit } from "@/lib/exercise-vector/kits";

export { OUTFIELD_KIT, GOALKEEPER_KIT, type VectorKit } from "@/lib/exercise-vector/kits";

/** Éclaircit une couleur hex vers le blanc d'une fraction `amount` (0-1) —
 * sert à dériver un ton clair de reflet à partir de la couleur de base du
 * kit, pour un dégradé "lumière du haut" plutôt qu'un aplat plat. */
function lighten(hex: string, amount: number): string {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = (n >> 16) & 0xff;
  const g = (n >> 8) & 0xff;
  const b = n & 0xff;
  const mix = (c: number) => Math.min(255, Math.round(c + (255 - c) * amount));
  return `#${((1 << 24) + (mix(r) << 16) + (mix(g) << 8) + mix(b)).toString(16).slice(1)}`;
}

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
  const uid = useId();
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
  const shadowCy = Math.max(pose.footA.y, pose.footB.y) + 14;

  const legA = solveLimb(pose.hip, pose.footA, THIGH, SHIN, KNEE_BEND);
  const legB = solveLimb(pose.hip, pose.footB, THIGH, SHIN, KNEE_BEND);

  const [vbW, vbH] = movement.viewBox ?? [VIEWBOX_W, VIEWBOX_H];

  // Dégradés "lumière du haut" (au lieu d'aplats plats) pour donner du
  // volume à la peau/au maillot — plus proche d'une vraie texture de peau
  // qu'un remplissage uni, sans dépendre d'un outil de rendu externe. Id
  // unique par instance (useId) car la galerie admin affiche des dizaines
  // de VectorPlayer sur la même page — des ids <defs> partagés casseraient
  // le rendu des uns ou des autres.
  const gid = uid.replace(/:/g, "");

  return (
    <svg viewBox={`0 0 ${vbW} ${vbH}`} className={className} xmlns="http://www.w3.org/2000/svg">
      {/*
        gradientUnits="userSpaceOnUse" avec des coordonnées fixes, PAS
        objectBoundingBox (le défaut): un membre parfaitement vertical ou
        horizontal (ex. le torse en position debout/squat, hanche et épaule
        à la même abscisse) donne une bounding box de largeur ou hauteur
        nulle — un cas dégénéré du spec SVG où Chromium rend le dégradé en
        aplat noir/invisible au lieu de la couleur prévue. Des coordonnées
        fixes sur tout le canvas évitent ce piège quelle que soit
        l'orientation du membre.
      */}
      <defs>
        <linearGradient id={`${gid}-skin`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={vbW * 0.15} y2={vbH}>
          <stop offset="0%" stopColor={lighten(kit.skin, 0.35)} />
          <stop offset="100%" stopColor={kit.skinShade} />
        </linearGradient>
        <linearGradient id={`${gid}-skin-back`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={vbW * 0.15} y2={vbH}>
          <stop offset="0%" stopColor={lighten(kit.skinShade, 0.2)} />
          <stop offset="100%" stopColor={kit.skinShade} />
        </linearGradient>
        <linearGradient id={`${gid}-jersey`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={vbW * 0.17} y2={vbH}>
          <stop offset="0%" stopColor={lighten(kit.jersey, 0.3)} />
          <stop offset="100%" stopColor={kit.jerseyTrim} />
        </linearGradient>
        <radialGradient id={`${gid}-head`} gradientUnits="userSpaceOnUse" cx={head.x - HEAD_R * 0.25} cy={head.y - HEAD_R * 0.4} r={HEAD_R * 1.5}>
          <stop offset="0%" stopColor={lighten(kit.skin, 0.4)} />
          <stop offset="100%" stopColor={kit.skinShade} />
        </radialGradient>
      </defs>

      <ellipse cx={shadowCx} cy={shadowCy} rx={44} ry={9} fill="rgba(16,23,36,.16)" />

      {/* jambe arrière */}
      <Limb root={pose.hip} target={pose.footA} l1={THIGH} l2={SHIN} bend={KNEE_BEND} width={LIMB_W_LEG} color={`url(#${gid}-skin-back)`} outline={kit.outline} />
      <Foot end={legA.end} from={legA.joint} kit={kit} />

      {/* bras arrière */}
      <Limb root={pose.shoulder} target={pose.handA} l1={UPPER_ARM} l2={FOREARM} bend={ELBOW_BEND} width={LIMB_W_ARM} color={`url(#${gid}-jersey)`} outline={kit.outline} />
      <circle cx={pose.handA.x} cy={pose.handA.y} r={7} fill={`url(#${gid}-skin)`} stroke={kit.outline} strokeWidth={2} />

      {/* torse + short — l'ellipse du short pivote toujours pour rester
          "en travers" du buste (court dans l'axe du corps, large en
          travers), qu'on soit debout ou allongé. Sans ça elle s'étire dans
          le sens du buste en position couchée et devient un blob confus au
          milieu du torse plutôt qu'un short reconnaissable. */}
      <CapsuleLine from={pose.hip} to={pose.shoulder} width={44} color={`url(#${gid}-jersey)`} outline={kit.outline} />
      <ellipse
        cx={pose.hip.x}
        cy={pose.hip.y}
        rx={16}
        ry={26}
        fill={kit.shorts}
        stroke={kit.outline}
        strokeWidth={2}
        transform={`rotate(${(Math.atan2(pose.shoulder.y - pose.hip.y, pose.shoulder.x - pose.hip.x) * 180) / Math.PI} ${pose.hip.x} ${pose.hip.y})`}
      />

      {/* tête — visage minimal (deux yeux) pour que ça se lise comme un
          vrai personnage plutôt qu'un rond vide. */}
      <g stroke={kit.outline} strokeWidth={2} strokeLinejoin="round">
        <circle cx={head.x} cy={head.y} r={HEAD_R} fill={`url(#${gid}-head)`} />
        <path
          d={`M ${head.x - HEAD_R + 2} ${head.y - 4} Q ${head.x - HEAD_R + 4} ${head.y - HEAD_R - 3} ${head.x + 2} ${head.y - HEAD_R} Q ${head.x + HEAD_R + 2} ${head.y - HEAD_R + 1} ${head.x + HEAD_R - 1} ${head.y - 6} Q ${head.x + HEAD_R - 8} ${head.y - HEAD_R + 10} ${head.x} ${head.y - HEAD_R + 10} Q ${head.x - HEAD_R + 10} ${head.y - HEAD_R + 10} ${head.x - HEAD_R + 2} ${head.y - 4} Z`}
          fill={kit.hair}
        />
        <circle cx={head.x - 6} cy={head.y + 4} r={2.1} fill={kit.outline} stroke="none" />
        <circle cx={head.x + 7} cy={head.y + 4} r={2.1} fill={kit.outline} stroke="none" />
      </g>

      {/* bras avant */}
      <Limb root={pose.shoulder} target={pose.handB} l1={UPPER_ARM} l2={FOREARM} bend={ELBOW_BEND} width={LIMB_W_ARM} color={`url(#${gid}-jersey)`} outline={kit.outline} />
      <circle cx={pose.handB.x} cy={pose.handB.y} r={7} fill={`url(#${gid}-skin)`} stroke={kit.outline} strokeWidth={2} />

      {/* jambe avant */}
      <Limb root={pose.hip} target={pose.footB} l1={THIGH} l2={SHIN} bend={KNEE_BEND} width={LIMB_W_LEG} color={`url(#${gid}-skin)`} outline={kit.outline} />
      <Foot end={legB.end} from={legB.joint} kit={kit} />

      {showBall && ball && <Ball point={ball} />}
    </svg>
  );
}
