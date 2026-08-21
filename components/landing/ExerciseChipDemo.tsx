"use client";

import { ExerciseFrameLoop } from "@/components/exercises/ExerciseFrameLoop";
import { EXERCISE_FRAMES } from "@/lib/exercises/exercise-frames";

const sequence = EXERCISE_FRAMES["squats-poids-du-corps"]!;

/** Aperçu réel (pas une icône) de la démonstration Coach Brian pose-par-pose, pour la landing page. */
export function ExerciseChipDemo() {
  return (
    <span className="relative inline-block h-7 w-7 shrink-0 overflow-hidden rounded-full bg-[var(--lp-surface-2)]" aria-hidden>
      <ExerciseFrameLoop sequence={sequence} />
    </span>
  );
}
