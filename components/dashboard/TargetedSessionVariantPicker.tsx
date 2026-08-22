"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BrianAvatar, type BrianState } from "@/components/brian/BrianAvatar";
import { BrianTip } from "@/components/brian/BrianTip";
import { Card, CardTitle } from "@/components/ui/Card";
import type { TargetedSessionVariantPreview } from "@/lib/programs/build-targeted-session";

export function TargetedSessionVariantPicker({
  theme,
  label,
  emoji,
  intro,
  brianState,
  variants,
}: {
  theme: string;
  label: string;
  emoji: string;
  intro: string;
  brianState: BrianState;
  variants: TargetedSessionVariantPreview[];
}) {
  const router = useRouter();
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);
  const [error, setError] = useState(false);

  async function pick(variantIndex: number) {
    setLoadingIndex(variantIndex);
    setError(false);
    try {
      const res = await fetch(`/api/entrainement-cible/${theme}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantIndex }),
      });
      if (!res.ok) {
        setError(true);
        setLoadingIndex(null);
        return;
      }
      const data = await res.json();
      router.push(`/seance/${data.sessionId}`);
    } catch {
      setError(true);
      setLoadingIndex(null);
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-4 p-4">
      <div className="flex items-start gap-2">
        <BrianAvatar state={brianState} size={44} />
        <div>
          <h1 className="font-display text-xl font-extrabold uppercase tracking-wide">
            {emoji} {label}
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">{intro}</p>
        </div>
      </div>

      <BrianTip
        tipKey="entrainement-cible-variantes"
        text="Choisis la séance qui te tente le plus — elles travaillent toutes le même besoin, avec des exercices différents."
      />

      <div className="space-y-3">
        {variants.map((v) => (
          <button
            key={v.variantIndex}
            type="button"
            onClick={() => pick(v.variantIndex)}
            disabled={loadingIndex !== null}
            className="block w-full text-left disabled:opacity-60"
          >
            <Card className="transition-transform active:scale-[0.98]">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base">Séance {v.variantIndex + 1}</CardTitle>
                <span className="text-xs font-semibold text-[var(--color-text-muted)]">{v.totalBlocks} exercices</span>
              </div>
              {v.mainExerciseNames.length > 0 && (
                <p className="mt-1.5 text-sm text-[var(--color-text-muted)]">{v.mainExerciseNames.join(" · ")}...</p>
              )}
              <p className="mt-2 text-xs font-bold uppercase tracking-wide text-[var(--color-primary-strong)]">
                {loadingIndex === v.variantIndex ? "Préparation..." : "Lancer cette séance →"}
              </p>
            </Card>
          </button>
        ))}
      </div>

      {error && (
        <p className="text-center text-sm text-[var(--color-danger)]">
          Impossible de préparer cette séance, réessaie.
        </p>
      )}
    </div>
  );
}
