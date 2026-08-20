"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { BrianAvatar, type BrianState } from "@/components/brian/BrianAvatar";
import { Button } from "@/components/ui/Button";

interface TourStep {
  state: BrianState;
  eyebrow: string;
  title: string;
  text: string;
}

function buildSteps(firstName: string): TourStep[] {
  return [
    {
      state: "celebrating",
      eyebrow: "Ta carte",
      title: "Ta carte est prête, " + firstName + " !",
      text: "Tes stats sont calculées à partir de tes résultats aux tests. Elle évolue à chaque entraînement — reviens la voir régulièrement.",
    },
    {
      state: "motivated",
      eyebrow: "Séances",
      title: "Ton entraînement du jour",
      text: "Un programme généré chaque jour, adapté à ton niveau. Je te montre chaque exercice pose par pose avant que tu le fasses.",
    },
    {
      state: "idle",
      eyebrow: "Coach",
      title: "Parle-moi",
      text: "Pose-moi n'importe quelle question sur ton entraînement — je réponds en fonction de tes vraies stats, pas de généralités.",
    },
    {
      state: "confident",
      eyebrow: "Progression",
      title: "Ta progression",
      text: "Ta carte, tes courbes de performance et ton journal d'entraînement, au même endroit.",
    },
    {
      state: "thinking",
      eyebrow: "Réglages",
      title: "Et le reste",
      text: "Ton profil, ton abonnement, tout ce qui te concerne, toujours accessible depuis l'onglet Réglages.",
    },
  ];
}

export function AppTour({ firstName }: { firstName: string }) {
  const router = useRouter();
  const steps = buildSteps(firstName);
  const [index, setIndex] = useState(0);
  const step = steps[index];
  const isLast = index === steps.length - 1;

  function finish() {
    router.replace("/dashboard");
  }

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-md flex-col p-4">
      <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
        <BrianAvatar state={step.state} size={96} />
        <div className="space-y-2">
          <p className="text-xs font-extrabold uppercase tracking-widest text-[var(--color-primary-strong)]">
            {step.eyebrow}
          </p>
          <h1 className="font-display text-xl font-extrabold uppercase tracking-wide text-[var(--color-text)]">
            {step.title}
          </h1>
          <p className="mx-auto max-w-xs text-sm text-[var(--color-text-muted)]">{step.text}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-center gap-1.5" aria-hidden="true">
          {steps.map((_, i) => (
            <span
              key={i}
              className="h-1.5 w-1.5 rounded-full transition-colors duration-300"
              style={{ background: i === index ? "var(--color-primary)" : "var(--color-border)" }}
            />
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={finish}
            className="text-xs font-semibold text-[var(--color-text-muted)] underline"
          >
            Passer
          </button>
          <Button className="flex-1" onClick={isLast ? finish : () => setIndex((i) => i + 1)}>
            {isLast ? "C'est parti !" : "Suivant"}
          </Button>
        </div>
      </div>
    </div>
  );
}
