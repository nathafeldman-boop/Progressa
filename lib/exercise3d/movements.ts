import { Vector3 } from "three";
import type { PlayerHandle } from "@/components/exercise3d/Player";
import { applyWorldBend, BONE, WORLD_AXIS } from "./rig";
import type { MovementId } from "./types";

/**
 * Bibliothèque de mouvements procéduraux — chaque fonction pose le rig à
 * un instant t du cycle [0,1[. Convention de signe (validée visuellement
 * sur ce rig, voir docs/exercise3d.md — identique à celle déjà validée
 * pour le système CSS 2D):
 * - Hanche/épaule (segment qui PEND depuis son pivot — cuisse, bras):
 *   angle POSITIF autour de l'axe gauche-droite fait avancer l'extrémité
 *   vers l'avant.
 * - Torse/colonne (part vers le HAUT depuis son pivot): c'est l'inverse —
 *   angle NÉGATIF le fait pencher vers l'avant. Un pivot qui pointe dans
 *   le sens opposé de la rotation inverse mécaniquement le signe "avant".
 * - Genou/coude: TOUJOURS négatif pour une flexion normale, quel que soit
 *   le signe du parent (même axe, la rotation s'additionne).
 */

function ease(t: number): number {
  return 0.5 - 0.5 * Math.cos(Math.PI * 2 * t);
}

function pose(h: PlayerHandle, boneName: string, deg: number, axis: Vector3 = WORLD_AXIS.leftRight) {
  const bone = h.bones.get(boneName);
  const bind = h.bindLocal.get(boneName);
  if (bone && bind) applyWorldBend(bone, bind, axis, (deg * Math.PI) / 180);
}

/** SQUAT — cycle complet descente/remontée, bras tendus devant pour l'équilibre. */
function poseSquat(h: PlayerHandle, t: number) {
  const k = ease(t);
  pose(h, BONE.leftUpLeg, 52 * k);
  pose(h, BONE.rightUpLeg, 52 * k);
  pose(h, BONE.leftLeg, -92 * k);
  pose(h, BONE.rightLeg, -92 * k);
  pose(h, BONE.spine, -14 * k);
  pose(h, BONE.leftArm, 50 * k);
  pose(h, BONE.rightArm, 50 * k);
  pose(h, BONE.leftForeArm, -20 * k);
  pose(h, BONE.rightForeArm, -20 * k);
}

/** SIDE_PLANK — pose statique (pas de cycle): jambes serrées tendues, bras porteur fléchi, bras libre tendu vers le haut. Le passage "debout -> allongé sur le côté" est une rotation rigide de TOUT le groupe joueur (voir Exercise3D), jamais recalculée par articulation. */
function poseSidePlank(h: PlayerHandle) {
  pose(h, BONE.leftUpLeg, 0);
  pose(h, BONE.rightUpLeg, 0);
  pose(h, BONE.leftArm, 85, WORLD_AXIS.up);
  pose(h, BONE.leftForeArm, -90);
  pose(h, BONE.rightArm, 175, WORLD_AXIS.faceBack);
}

/** KICK — jambe d'appui fixe, jambe frappeuse qui arme puis frappe (contact ballon au pic du mouvement), bras qui contrebalancent. */
function poseKick(h: PlayerHandle, t: number) {
  // Arme (recul) de 0 à 0.55, frappe (extension rapide) de 0.55 à 0.75, retour 0.75 à 1.
  let swing: number;
  if (t < 0.55) swing = -60 * ease(t / 0.55) * 0.5;
  else if (t < 0.75) swing = -30 + 110 * ((t - 0.55) / 0.2);
  else swing = 80 * (1 - (t - 0.75) / 0.25);
  pose(h, BONE.rightUpLeg, swing);
  pose(h, BONE.rightLeg, t < 0.55 ? -70 * ease(t / 0.55) : -20 * Math.max(0, 1 - (t - 0.55) / 0.15));
  pose(h, BONE.leftUpLeg, 8);
  pose(h, BONE.leftLeg, -12);
  pose(h, BONE.spine, -8 * ease(Math.min(1, t / 0.75)));
  pose(h, BONE.leftArm, 35);
  pose(h, BONE.rightArm, -25);
}

/** DRIBBLE_TOUCH — course légère avec touches de balle alternées (léger swing de jambe/bras type light-jog). */
function poseDribble(h: PlayerHandle, t: number) {
  const phase = (t * 2) % 1;
  const lead = t < 0.5 ? phase : 0;
  const trail = t >= 0.5 ? phase : 0;
  pose(h, BONE.leftUpLeg, 30 * ease(lead) - 15 * ease(trail));
  pose(h, BONE.rightUpLeg, 30 * ease(trail) - 15 * ease(lead));
  pose(h, BONE.leftLeg, -40 * ease(lead));
  pose(h, BONE.rightLeg, -40 * ease(trail));
  pose(h, BONE.leftArm, -25 * ease(lead) + 15 * ease(trail));
  pose(h, BONE.rightArm, -25 * ease(trail) + 15 * ease(lead));
  pose(h, BONE.leftForeArm, -35);
  pose(h, BONE.rightForeArm, -35);
}

export const PROCEDURAL_POSES: Partial<Record<MovementId, (h: PlayerHandle, t: number) => void>> = {
  SQUAT: poseSquat,
  SIDE_PLANK: poseSidePlank,
  KICK: poseKick,
  DRIBBLE_TOUCH: poseDribble,
};
