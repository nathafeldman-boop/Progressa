"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardTitle, CardSubtitle } from "@/components/ui/Card";
import { THEME_EMOJI, THEME_LABELS, TRAINING_THEMES, type TrainingTheme } from "@/lib/programs/build-targeted-session";

export function TargetedTrainingPicker() {
  const router = useRouter();
  const [loading, setLoading] = useState<TrainingTheme | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function pick(theme: TrainingTheme) {
    setError(null);
    setLoading(theme);
    try {
      const res = await fetch("/api/sessions/targeted", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme }),
      });
      if (!res.ok) {
        setError("Pas assez d'exercices disponibles pour ce thème avec ton matériel actuel.");
        return;
      }
      const data = await res.json();
      router.push(`/seance/${data.sessionId}`);
    } finally {
      setLoading(null);
    }
  }

  return (
    <Card>
      <CardTitle className="text-base">Entraînement ciblé</CardTitle>
      <CardSubtitle className="mt-0.5">Choisis ce que tu veux travailler aujourd&apos;hui.</CardSubtitle>
      <div className="mt-3 grid grid-cols-3 gap-2.5">
        {TRAINING_THEMES.map((theme) => (
          <button
            key={theme}
            type="button"
            disabled={loading !== null}
            onClick={() => pick(theme)}
            className="group relative flex aspect-square flex-col items-center justify-center gap-1.5 overflow-hidden rounded-2xl border-2 border-[var(--color-primary-strong)] bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-strong)] p-2 text-center shadow-[0_6px_16px_-4px_rgba(14,122,60,0.45)] transition-transform disabled:opacity-50 active:scale-95"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.12] [background-image:repeating-linear-gradient(0deg,#fff_0,#fff_2px,transparent_2px,transparent_10px),repeating-linear-gradient(90deg,#fff_0,#fff_2px,transparent_2px,transparent_10px)]"
            />
            <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white text-lg shadow-inner">
              {loading === theme ? "…" : THEME_EMOJI[theme]}
            </span>
            <span className="relative text-[0.7rem] font-extrabold uppercase leading-tight tracking-wide text-white">
              {THEME_LABELS[theme]}
            </span>
          </button>
        ))}
      </div>
      {error && <p className="mt-2 text-xs text-[var(--color-danger)]">{error}</p>}
    </Card>
  );
}
