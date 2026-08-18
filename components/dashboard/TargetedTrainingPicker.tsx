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
      <div className="mt-3 grid grid-cols-3 gap-2">
        {TRAINING_THEMES.map((theme) => (
          <button
            key={theme}
            type="button"
            disabled={loading !== null}
            onClick={() => pick(theme)}
            className="flex flex-col items-center gap-1 rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-center disabled:opacity-50"
          >
            <span className="text-xl">{loading === theme ? "…" : THEME_EMOJI[theme]}</span>
            <span className="text-xs font-semibold text-[var(--color-text)]">{THEME_LABELS[theme]}</span>
          </button>
        ))}
      </div>
      {error && <p className="mt-2 text-xs text-[var(--color-danger)]">{error}</p>}
    </Card>
  );
}
