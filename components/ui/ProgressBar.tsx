import { cn } from "@/lib/cn";

export function ProgressBar({ value, className }: { value: number; className?: string }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-[var(--color-surface-alt)]", className)}>
      <div
        className="h-full rounded-full bg-[var(--color-primary)] transition-[width]"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
