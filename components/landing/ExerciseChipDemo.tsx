"use client";

import { ExerciseFrameLoop } from "@/components/exercises/ExerciseFrameLoop";
import { EXERCISE_FRAMES } from "@/lib/exercises/exercise-frames";
import { EXERCISE_VIDEO } from "@/lib/exercises/exercise-media";

const SLUG = "squats-poids-du-corps";
const video = EXERCISE_VIDEO[SLUG];
const sequence = EXERCISE_FRAMES[SLUG]!;

/** Aperçu réel (pas une icône) d'une démonstration d'exercice, pour la landing page. */
export function ExerciseChipDemo() {
  return (
    <span className="relative inline-block h-7 w-7 shrink-0 overflow-hidden rounded-full bg-[var(--lp-surface-2)]" aria-hidden>
      {video ? (
        <video src={video} className="h-full w-full object-cover" autoPlay muted loop playsInline />
      ) : (
        <ExerciseFrameLoop sequence={sequence} />
      )}
    </span>
  );
}
