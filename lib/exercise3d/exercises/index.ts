import { SQUAT } from "./squat";
import { SPRINT_10_20 } from "./sprint";
import { BALL_DRIBBLE } from "./dribble";
import { SHOT } from "./shot";
import { SIDE_PLANK } from "./side-plank";
import type { Exercise3D } from "../types";

/** Les 5 exercices de démonstration du prototype (voir docs/exercise3d.md). */
export const DEMO_EXERCISES: Exercise3D[] = [SQUAT, SPRINT_10_20, BALL_DRIBBLE, SHOT, SIDE_PLANK];

export { SQUAT, SPRINT_10_20, BALL_DRIBBLE, SHOT, SIDE_PLANK };
