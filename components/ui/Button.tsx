import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const variants: Record<Variant, string> = {
  primary:
    "bg-[var(--color-primary)] text-[var(--color-on-primary)] hover:bg-[var(--color-primary-strong)]",
  secondary:
    "bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)] hover:bg-[var(--color-primary-soft)]/70",
  ghost: "bg-transparent text-[var(--color-text)] hover:bg-[var(--color-surface-alt)]",
  danger: "bg-[var(--color-danger)] text-white hover:opacity-90",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "font-display inline-flex items-center justify-center gap-2 rounded-[var(--radius-control)] px-5 py-3 text-base font-bold uppercase tracking-wide transition-[background-color,transform] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
