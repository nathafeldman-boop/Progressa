import { Card } from "@/components/ui/Card";
import type { PlayerCardStats } from "@/lib/player-card";

export function PlayerCardView({
  firstName,
  positionLabel,
  ageCategoryLabel,
  stats,
}: {
  firstName: string;
  positionLabel: string;
  ageCategoryLabel: string | null;
  stats: PlayerCardStats;
}) {
  return (
    <Card className="overflow-hidden border-2 border-[var(--color-primary)] bg-gradient-to-b from-[var(--color-primary-soft)] to-[var(--color-surface)] p-6 text-center">
      <p className="font-display text-xs font-bold uppercase tracking-widest text-[var(--color-primary-strong)]">
        {ageCategoryLabel ?? ""} · {positionLabel}
      </p>
      <h2 className="mt-1 font-display text-3xl font-extrabold uppercase tracking-wide">{firstName}</h2>
      <p className="mt-2 font-display text-6xl font-extrabold text-[var(--color-primary-strong)]">{stats.overall}</p>
      <p className="text-xs uppercase tracking-widest text-[var(--color-text-muted)]">Note globale</p>

      <div className="mt-6 grid grid-cols-2 gap-3">
        {Object.entries(stats.skills).map(([skill, score]) => (
          <div key={skill} className="rounded-[var(--radius-control)] bg-[var(--color-surface)] p-3">
            <p className="font-display text-2xl font-extrabold text-[var(--color-primary-strong)]">{score}</p>
            <p className="text-xs font-semibold text-[var(--color-text-muted)]">{skill}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
