import type { DailyObjective } from "@prisma/client";

export function DailyObjectives({ objectives }: { objectives: DailyObjective[] }) {
  if (objectives.length === 0) return null;

  return (
    <div className="rounded-[var(--radius-card)] bg-[var(--color-primary-soft)] p-4">
      <p className="text-xs font-extrabold uppercase tracking-widest text-[var(--color-primary-strong)]">
        Objectifs du jour
      </p>
      <ul className="mt-3 space-y-2">
        {objectives.map((o) => (
          <li key={o.id} className="flex items-center gap-2 text-sm">
            <span
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs ${
                o.done ? "bg-[var(--color-primary)] text-[var(--color-on-primary)]" : "bg-white/60 text-transparent"
              }`}
            >
              ✓
            </span>
            <span className={o.done ? "text-[var(--color-primary-strong)] line-through" : "text-[var(--color-text)]"}>
              {o.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
