import type { StatAxis } from "@prisma/client";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { STAT_AXES, STAT_LABELS } from "@/lib/brian/types";
import { BrianAvatar, type BrianState } from "./BrianAvatar";

export function stateForCategory(category: string): BrianState {
  if (category === "EXERCISE_EXCELLENT" || category === "EXERCISE_PERSONAL_RECORD") return "celebrating";
  if (category === "EXERCISE_HARD" || category === "EXERCISE_ABANDONED") return "encouraging";
  return "talking";
}

export function BrianMessageCard({
  category,
  text,
  deltas,
  className,
}: {
  category: string;
  text: string;
  deltas?: Partial<Record<StatAxis, number>>;
  className?: string;
}) {
  const hasDeltas = deltas && STAT_AXES.some((axis) => deltas[axis]);

  return (
    <Card className={className}>
      <div className="flex gap-3">
        <BrianAvatar state={stateForCategory(category)} size={44} />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--color-primary-strong)]">Coach Brian</p>
          <p className="mt-1 text-sm text-[var(--color-text)]">{text}</p>
          {hasDeltas && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {STAT_AXES.filter((axis) => deltas![axis]).map((axis) => (
                <Chip key={axis} className="border-[var(--color-primary)] text-[var(--color-primary-strong)]">
                  +{deltas![axis]} {STAT_LABELS[axis]}
                </Chip>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
