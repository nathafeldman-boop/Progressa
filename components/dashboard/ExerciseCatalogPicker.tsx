"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardSubtitle } from "@/components/ui/Card";
import { BrianTip } from "@/components/brian/BrianTip";
import { THEME_LABELS, type TrainingTheme } from "@/lib/programs/build-targeted-session";
import type { TargetedCatalogEntry } from "@/lib/programs/get-targeted-catalog";

function intensityLabel(value: number): string {
  if (value <= 3) return "Faible";
  if (value <= 6) return "Modérée";
  return "Élevée";
}

function IntensityBadge({ value }: { value: number }) {
  return (
    <span className="inline-block rounded-full border border-[var(--color-border)] px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
      Intensité : {intensityLabel(value)}
    </span>
  );
}

function ChooseButton({ onClick, disabled, loading }: { onClick: () => void; disabled: boolean; loading: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label="Choisir cet exercice"
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-[var(--color-on-primary)] transition-transform disabled:opacity-50 active:scale-95"
    >
      {loading ? (
        <span className="text-xs">…</span>
      ) : (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}

export function ExerciseCatalogPicker({ theme }: { theme: TrainingTheme }) {
  const router = useRouter();
  const [entries, setEntries] = useState<TargetedCatalogEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [picking, setPicking] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/sessions/targeted/catalog?theme=${theme}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data) => {
        if (!cancelled) setEntries(data.entries);
      })
      .catch(() => {
        if (!cancelled) setError("Impossible de charger le catalogue pour l'instant.");
      });
    return () => {
      cancelled = true;
    };
  }, [theme]);

  async function choose(exerciseSlug: string) {
    setPicking(exerciseSlug);
    setError(null);
    try {
      const res = await fetch("/api/sessions/targeted", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme, exerciseSlug }),
      });
      if (!res.ok) {
        setError("Cet exercice n'est plus disponible, choisis-en un autre.");
        return;
      }
      const data = await res.json();
      router.push(`/seance/${data.sessionId}`);
    } finally {
      setPicking(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="pb-1">
        <h1 className="font-display text-2xl font-extrabold uppercase tracking-wide">{THEME_LABELS[theme]}</h1>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          5 exercices dosés pour ton niveau actuel. Choisis celui que tu veux travailler.
        </p>
      </div>

      <BrianTip
        tipKey="entrainement-cible-catalogue"
        text="J'ai choisi ces 5 exercices en fonction de ta carte — ni trop faciles, ni trop durs pour toi. Prends celui qui te motive le plus."
      />

      {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}

      {entries === null && !error && (
        <Card className="p-6 text-center">
          <CardSubtitle>Chargement du catalogue…</CardSubtitle>
        </Card>
      )}

      {entries?.length === 0 && (
        <Card className="p-6 text-center">
          <CardSubtitle>Pas assez d&apos;exercices disponibles pour ce thème avec ton matériel actuel.</CardSubtitle>
        </Card>
      )}

      {entries?.map((entry) => (
        <div
          key={entry.slug}
          className="flex items-center gap-3 rounded-[var(--radius-card)] border border-[var(--color-border)]/70 bg-[var(--color-surface)] p-4"
        >
          <div className="min-w-0 flex-1 space-y-1.5">
            <h3 className="font-display text-sm font-bold uppercase tracking-wide text-[var(--color-text)]">
              {entry.name}
            </h3>
            <p className="line-clamp-2 text-sm text-[var(--color-text-muted)]">{entry.description}</p>
            <IntensityBadge value={entry.difficulty} />
          </div>
          <ChooseButton
            onClick={() => choose(entry.slug)}
            disabled={picking !== null}
            loading={picking === entry.slug}
          />
        </div>
      ))}
    </div>
  );
}
