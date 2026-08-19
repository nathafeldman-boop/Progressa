"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { BrianAvatar } from "@/components/brian/BrianAvatar";
import { Button } from "@/components/ui/Button";
import type { ExerciseFrameSequence } from "@/lib/exercises/exercise-frames";

const COUNTDOWN_START = 3;

/**
 * Explication d'un exercice pose par pose avant de le démarrer: on avance/
 * recule dans les poses avec les flèches milieu-gauche/milieu-droite, puis
 * un écran "Prêt ?" avant un compte à rebours annulable. `onReady` est
 * appelé une fois le compte à rebours écoulé — le parent bascule alors sur
 * la phase active (chrono + boucle des poses en fond).
 */
export function ExerciseFrameViewer({
  sequence,
  onReady,
}: {
  sequence: ExerciseFrameSequence;
  onReady: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const total = sequence.poses.length;
  const onReadyScreen = index >= total;

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      onReady();
      return;
    }
    const id = window.setTimeout(() => setCountdown((c) => (c ?? 1) - 1), 1000);
    return () => window.clearTimeout(id);
  }, [countdown, onReady]);

  if (countdown !== null) {
    return (
      <div className="flex flex-col items-center gap-4 py-6">
        <p className="font-display text-7xl font-extrabold tabular-nums text-[var(--color-primary-strong)]">
          {countdown}
        </p>
        <Button variant="ghost" onClick={() => setCountdown(null)}>
          Annuler
        </Button>
      </div>
    );
  }

  if (onReadyScreen) {
    return (
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        <BrianAvatar state="confident" size={72} />
        <p className="text-sm font-semibold text-[var(--color-text)]">C&apos;est bon, tu as compris ?</p>
        <div className="flex w-full gap-2">
          <Button variant="ghost" className="flex-1" onClick={() => setIndex(total - 1)}>
            Revoir
          </Button>
          <Button className="flex-1" onClick={() => setCountdown(COUNTDOWN_START)}>
            Prêt
          </Button>
        </div>
      </div>
    );
  }

  const pose = sequence.poses[index];

  return (
    <div>
      <div className="relative aspect-square w-full overflow-hidden rounded-[var(--radius-card)] bg-[var(--color-surface-alt)]">
        <Image src={pose.image} alt="" fill className="object-contain" unoptimized />
        {index > 0 && (
          <button
            type="button"
            onClick={() => setIndex((i) => i - 1)}
            aria-label="Pose précédente"
            className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--color-text)]/70 text-xl text-white"
          >
            ←
          </button>
        )}
        <button
          type="button"
          onClick={() => setIndex((i) => i + 1)}
          aria-label="Pose suivante"
          className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--color-primary)] text-xl text-white"
        >
          →
        </button>
        <span className="absolute bottom-2 right-2 rounded-full bg-[var(--color-text)]/70 px-2 py-0.5 text-[0.65rem] font-bold text-white">
          {index + 1}/{total}
        </span>
      </div>
      <p className="mt-3 text-center text-sm text-[var(--color-text)]">{pose.caption}</p>
    </div>
  );
}
