import type { DailyObjective } from "@prisma/client";
import { Card, CardTitle } from "@/components/ui/Card";

export function DailyObjectives({ objectives }: { objectives: DailyObjective[] }) {
  if (objectives.length === 0) return null;

  return (
    <Card>
      <CardTitle className="text-base">🎯 Objectifs du jour</CardTitle>
      <ul className="mt-3 space-y-2">
        {objectives.map((o) => (
          <li key={o.id} className="flex items-center gap-2 text-sm">
            <span
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs ${
                o.done
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-on-primary)]"
                  : "border-[var(--color-border)]"
              }`}
            >
              {o.done ? "✓" : ""}
            </span>
            <span className={o.done ? "text-[var(--color-text-muted)] line-through" : "text-[var(--color-text)]"}>
              {o.label}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
