import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Chip({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-[var(--color-border)]/70 bg-transparent px-3 py-1 text-[0.7rem] font-medium tracking-wide text-[var(--color-text-muted)]",
        className
      )}
      {...props}
    />
  );
}
