import type { DailyObjective } from "@prisma/client";

function formatTime(date: Date): string {
  return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

export function DailyObjectives({ objectives }: { objectives: DailyObjective[] }) {
  if (objectives.length === 0) return null;

  return (
    <div>
      <p className="font-display text-xl font-extrabold uppercase tracking-wide text-[var(--color-text)]">
        Objectifs du jour
      </p>
      <ul className="mt-2.5 flex flex-col gap-2">
        {objectives.map((o) => (
          <li
            key={o.id}
            className="flex items-center gap-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3.5"
          >
            <span
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] text-xs ${
                o.done
                  ? "border border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-on-primary)]"
                  : "border border-[var(--color-border)] bg-[var(--color-surface)] text-transparent"
              }`}
            >
              ✓
            </span>
            <span className="flex-1 text-sm font-medium text-[var(--color-text)]">{o.label}</span>
            {o.done && o.completedAt && (
              <span className="font-mono text-[0.625rem] text-[var(--color-text-muted)]">{formatTime(o.completedAt)}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
