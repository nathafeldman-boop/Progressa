"use client";

import { useMemo, useState } from "react";
import { VectorPlayer } from "@/components/exercise-vector/VectorPlayer";
import { EXERCISE_VISUALS, type MatchQuality } from "@/lib/exercise-vector/catalog-map";

const QUALITY_LABEL: Record<MatchQuality, string> = {
  exact: "Exact",
  approx: "Approximatif",
  generic: "Générique",
  missing: "Manquant",
};
const QUALITY_COLOR: Record<MatchQuality, string> = {
  exact: "border-[var(--color-primary)] bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)]",
  approx: "border-amber-300 bg-amber-50 text-amber-700",
  generic: "border-orange-300 bg-orange-50 text-orange-700",
  missing: "border-red-300 bg-red-50 text-red-700",
};

const FILTERS: (MatchQuality | "all")[] = ["all", "exact", "approx", "generic", "missing"];

export function ExerciseVectorGallery() {
  const [filter, setFilter] = useState<MatchQuality | "all">("all");

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: EXERCISE_VISUALS.length };
    for (const e of EXERCISE_VISUALS) c[e.quality] = (c[e.quality] ?? 0) + 1;
    return c;
  }, []);

  const visible = filter === "all" ? EXERCISE_VISUALS : EXERCISE_VISUALS.filter((e) => e.quality === filter);

  return (
    <div className="mx-auto max-w-6xl space-y-4 p-4">
      <div>
        <h1 className="font-display text-2xl font-extrabold uppercase tracking-wide">Rig vectoriel IK — catalogue complet</h1>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          {EXERCISE_VISUALS.length} exercices. Genou/coude résolus par cinématique inverse (2 segments, voir
          lib/exercise-vector/ik.ts) — une articulation ne peut pas être &laquo;&nbsp;à l&apos;envers&nbsp;&raquo; par construction.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-full border px-3 py-1.5 text-sm font-semibold ${
              filter === f ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)]" : "border-[var(--color-border)] text-[var(--color-text)]"
            }`}
          >
            {f === "all" ? "Tout" : QUALITY_LABEL[f]} ({counts[f] ?? 0})
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {visible.map((e) => (
          <div key={e.slug} className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)]">
            <div className="aspect-[3/4] bg-[var(--color-surface-alt)]">
              {e.movement ? (
                <VectorPlayer movement={e.movement} kit={e.kit} showBall={e.showBall} className="h-full w-full" />
              ) : (
                <div className="flex h-full items-center justify-center p-3 text-center text-xs text-[var(--color-text-muted)]">
                  Pas de visuel — mouvement pas encore construit
                </div>
              )}
            </div>
            <div className="p-2">
              <p className="truncate text-xs font-semibold text-[var(--color-text)]">{e.name}</p>
              <span className={`mt-1 inline-block rounded-full border px-2 py-0.5 text-[0.6rem] font-bold uppercase ${QUALITY_COLOR[e.quality]}`}>
                {QUALITY_LABEL[e.quality]}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
