"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { ExerciseFrameSequence } from "@/lib/exercises/exercise-frames";

const FRAME_INTERVAL_MS = 450;

/** Fait défiler les poses en boucle (façon "vidéo" en stop-motion) pendant que le joueur exécute réellement l'exercice. */
export function ExerciseFrameLoop({ sequence }: { sequence: ExerciseFrameSequence }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % sequence.poses.length);
    }, FRAME_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [sequence]);

  return <Image src={sequence.poses[index].image} alt="" fill className="object-contain" unoptimized />;
}
