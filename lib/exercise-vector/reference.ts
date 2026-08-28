import type { Point } from "./ik";
import type { Pose } from "./types";

/** Pose neutre debout — point de départ de toute pose écrite à la main. */
export const HIP: Point = { x: 120, y: 175 };
export const SHOULDER: Point = { x: 120, y: 96 };

export const STAND: Pose = {
  hip: HIP,
  shoulder: SHOULDER,
  handA: { x: 110, y: 173 },
  handB: { x: 130, y: 173 },
  footA: { x: 110, y: 293 },
  footB: { x: 130, y: 293 },
};

export function withHip(pose: Pose, hip: Point): Pose {
  return { ...pose, hip };
}
