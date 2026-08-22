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
 *
 * Le cadre occupe l'essentiel de l'écran (visuel = ce qu'on doit voir),
 * avec la légende incrustée directement sur l'image plutôt qu'en dessous.
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

  const frameClass =
    "relative flex h-[62vh] min-h-[420px] w-full items-center justify-center overflow-hidden rounded-[var(--radius-card)] bg-[var(--color-surface-alt)]";

  if (countdown !== null) {
    return (
      <div className={frameClass}>
        <div className="flex flex-col items-center gap-4">
          <p className="font-display text-8xl font-extrabold tabular-nums text-[var(--color-primary-strong)]">
            {countdown}
          </p>
          <Button variant="ghost" onClick={() => setCountdown(null)}>
            Annuler
          </Button>
        </div>
      </div>
    );
  }

  if (onReadyScreen) {
    return (
      <div className={frameClass}>
        <div className="flex flex-col items-center gap-3 px-8 text-center">
          <BrianAvatar state="confident" size={88} />
          <p className="text-base font-semibold text-[var(--color-text)]">C&apos;est bon, tu as compris ?</p>
          <div className="flex w-full gap-2">
            <Button variant="ghost" className="flex-1" onClick={() => setIndex(total - 1)}>
              Revoir
            </Button>
            <Button className="flex-1" onClick={() => setCountdown(COUNTDOWN_START)}>
              Prêt
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const pose = sequence.poses[index];

  return (
    <div className={frameClass}>
      <Image src={pose.image} alt="" fill className="object-contain" unoptimized />
      {index > 0 && (
        <button
          type="button"
          onClick={() => setIndex((i) => i - 1)}
          aria-label="Pose précédente"
          className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--color-text)]/70 text-2xl text-white"
        >
          ←
        </button>
      )}
      <button
        type="button"
        onClick={() => setIndex((i) => i + 1)}
        aria-label="Pose suivante"
        className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--color-primary)] text-2xl text-white"
      >
        →
      </button>
      <span className="absolute left-3 top-3 rounded-full bg-[var(--color-text)]/70 px-2.5 py-1 text-xs font-bold text-white">
        {index + 1}/{total}
      </span>

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/40 to-transparent px-4 pb-4 pt-12">
        <div className="flex items-end justify-between gap-3">
          <p className="min-w-0 flex-1 text-base font-bold leading-snug text-white [text-shadow:0_1px_4px_rgba(0,0,0,0.6)]">
            {pose.caption}
          </p>
          <BrianAvatar state="talking" size={48} className="shrink-0 ring-2 ring-white/80" />
        </div>
      </div>
    </div>
  );
}
