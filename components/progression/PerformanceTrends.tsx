import { TEST_PROTOCOLS } from "@/lib/evaluation-tests";
import type { EvaluationTestType } from "@prisma/client";

interface ResultPoint {
  value: number;
  recordedAt: Date;
}

function Sparkline({ points, lowerIsBetter }: { points: ResultPoint[]; lowerIsBetter: boolean }) {
  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const w = 200;
  const h = 44;
  const stepX = points.length > 1 ? w / (points.length - 1) : 0;

  const coords = points.map((p, i) => {
    const x = i * stepX;
    const y = h - ((p.value - min) / span) * (h - 8) - 4;
    return [x, y] as const;
  });

  const first = points[0].value;
  const last = points[points.length - 1].value;
  const improved = lowerIsBetter ? last < first : last > first;
  const stroke = improved ? "var(--color-primary)" : "var(--color-text-muted)";

  const path = coords.map(([x, y]) => `${x},${y}`).join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-11 w-full" preserveAspectRatio="none">
      <polyline points={path} fill="none" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={coords[coords.length - 1][0]} cy={coords[coords.length - 1][1]} r="3.5" fill={stroke} />
    </svg>
  );
}

/**
 * Courbes de tendance basées sur l'historique réel des tests d'évaluation
 * (EvaluationResult) — pas de donnée inventée. N'affiche que les tests
 * pour lesquels le joueur a au moins 2 mesures (sinon rien à comparer).
 */
export function PerformanceTrends({
  resultsByType,
}: {
  resultsByType: Partial<Record<EvaluationTestType, ResultPoint[]>>;
}) {
  const entries = Object.entries(resultsByType).filter(([, pts]) => pts && pts.length >= 2) as [
    EvaluationTestType,
    ResultPoint[],
  ][];

  if (entries.length === 0) return null;

  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <p className="text-xs font-extrabold uppercase tracking-widest text-[var(--color-text-muted)]">
        Évolution de la performance
      </p>
      <div className="mt-3 space-y-4">
        {entries.map(([type, points]) => {
          const protocol = TEST_PROTOCOLS[type];
          const sorted = [...points].sort((a, b) => a.recordedAt.getTime() - b.recordedAt.getTime());
          const last = sorted[sorted.length - 1];
          return (
            <div key={type}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-[var(--color-text)]">{protocol.name}</span>
                <span className="font-display text-sm font-extrabold text-[var(--color-primary-strong)]">
                  {last.value} {protocol.unit}
                </span>
              </div>
              <Sparkline points={sorted} lowerIsBetter={protocol.lowerIsBetter} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
