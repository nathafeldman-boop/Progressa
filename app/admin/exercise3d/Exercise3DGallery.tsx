"use client";

import { useState } from "react";
import { Exercise3D } from "@/components/exercise3d/Exercise3D";
import { DEMO_EXERCISES } from "@/lib/exercise3d/exercises";

/**
 * Revue interne du prototype de moteur 3D — 5 exercices de démonstration
 * (voir docs/exercise3d.md). Pas encore branché dans /seance: c'est un
 * banc d'essai pour valider l'architecture avant de couvrir davantage
 * d'exercices.
 */
export function Exercise3DGallery() {
  const [activeId, setActiveId] = useState(DEMO_EXERCISES[0].id);
  const active = DEMO_EXERCISES.find((e) => e.id === activeId)!;

  return (
    <div className="mx-auto max-w-4xl space-y-4 p-4">
      <div>
        <h1 className="font-display text-2xl font-extrabold uppercase tracking-wide">Moteur 3D — prototype</h1>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          5 exercices de démonstration du moteur (React Three Fiber). Personnage temporaire (rig au format Mixamo,
          pas encore Coach Brian) — voir docs/exercise3d.md.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {DEMO_EXERCISES.map((e) => (
          <button
            key={e.id}
            type="button"
            onClick={() => setActiveId(e.id)}
            className={`rounded-full border px-3 py-1.5 text-sm font-semibold ${
              e.id === activeId
                ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)]"
                : "border-[var(--color-border)] text-[var(--color-text)]"
            }`}
          >
            {e.title}
          </button>
        ))}
      </div>

      <div className="h-[560px] w-full overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)]">
        <Exercise3D key={active.id} exercise={active} />
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-[var(--color-text-muted)] sm:grid-cols-4">
        <div>Catégorie: {active.category}</div>
        <div>Caméra: {active.camera}</div>
        <div>Mouvement: {active.movement}</div>
        <div>Difficulté: {active.difficulty}/5</div>
      </div>
    </div>
  );
}
