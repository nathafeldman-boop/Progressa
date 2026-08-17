import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Chip({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-3 py-1 text-xs font-semibold text-[var(--color-text-muted)]",
        className
      )}
      {...props}
    />
  );
}
