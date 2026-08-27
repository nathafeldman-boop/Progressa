import { Bone, Quaternion, Vector3 } from "three";

/**
 * Pose procédurale rig-agnostique: au lieu de tourner un os sur un axe
 * LOCAL nommé (X/Y/Z) — dont le sens dépend entièrement de la convention
 * de l'artiste qui a rigué le modèle, imprévisible sans l'ouvrir dans
 * Blender — on pose une flexion comme un angle autour d'un axe MONDE
 * (ex: "axe horizontal gauche-droite" pour une flexion de genou), converti
 * dans l'espace local de l'os via conjugaison par le quaternion monde du
 * parent. Résultat identique quel que soit le rig source (celui-ci ou un
 * futur Mixamo custom), tant que la hiérarchie d'os est cohérente.
 *
 * newLocal = (axisWorld exprimé dans le repère du parent, angle) * bindLocal
 */
export function applyWorldBend(bone: Bone, bindLocal: Quaternion, worldAxis: Vector3, angleRad: number) {
  const parent = bone.parent;
  if (!parent) {
    bone.quaternion.copy(bindLocal);
    return;
  }
  const parentWorldQuat = parent.getWorldQuaternion(_q1);
  const localAxis = worldAxis.clone().applyQuaternion(_q1.copy(parentWorldQuat).invert()).normalize();
  const bendQuat = _q2.setFromAxisAngle(localAxis, angleRad);
  bone.quaternion.copy(bendQuat).multiply(bindLocal);
}

const _q1 = new Quaternion();
const _q2 = new Quaternion();

/**
 * Axes monde de référence pour un joueur qui fait face à +Z (convention du
 * moteur, voir cameras.ts): X = gauche/droite (axe de flexion
 * genou/coude/hanche), Y = vertical (axe de rotation "tourner sur soi"),
 * Z = axe face/dos.
 */
export const WORLD_AXIS = {
  leftRight: new Vector3(1, 0, 0),
  up: new Vector3(0, 1, 0),
  faceBack: new Vector3(0, 0, 1),
};

/**
 * Noms de bones mixamorig. Le ":" de la convention Mixamo standard
 * ("mixamorig:Hips") ne survit pas à l'export/import GLB de cet asset —
 * les noms réels dans la scène chargée sont collés ("mixamorigHips"). Si
 * un futur GLB Mixamo custom est branché ici, vérifier ses noms de bones
 * réels (Player onReady logue `bones.keys()`) avant de supposer qu'ils
 * gardent le ":" — c'est un détail d'export, pas une garantie de l'API.
 */
export const BONE = {
  hips: "mixamorigHips",
  spine: "mixamorigSpine",
  spine1: "mixamorigSpine1",
  spine2: "mixamorigSpine2",
  neck: "mixamorigNeck",
  head: "mixamorigHead",
  leftUpLeg: "mixamorigLeftUpLeg",
  leftLeg: "mixamorigLeftLeg",
  leftFoot: "mixamorigLeftFoot",
  rightUpLeg: "mixamorigRightUpLeg",
  rightLeg: "mixamorigRightLeg",
  rightFoot: "mixamorigRightFoot",
  leftArm: "mixamorigLeftArm",
  leftForeArm: "mixamorigLeftForeArm",
  rightArm: "mixamorigRightArm",
  rightForeArm: "mixamorigRightForeArm",
  leftShoulder: "mixamorigLeftShoulder",
  rightShoulder: "mixamorigRightShoulder",
} as const;
