"use client";

import { useRef, useState } from "react";

type Orientation = "horizontal" | "vertical";

const HOLD_MS = 350;

/**
 * Champ numérique tactile: appui long pour activer un curseur (horizontal
 * ou vertical), puis on glisse pour ajuster la valeur — pas de saisie clavier.
 */
export function DragSliderField({
  label,
  unit,
  value,
  onChange,
  min,
  max,
  orientation,
}: {
  label: string;
  unit: string;
  value: number | null;
  onChange: (v: number) => void;
  min: number;
  max: number;
  orientation: Orientation;
}) {
  const [active, setActive] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const holdTimer = useRef<number | null>(null);
  const display = value ?? Math.round((min + max) / 2);

  function valueFromPointer(clientX: number, clientY: number) {
    const el = trackRef.current;
    if (!el) return display;
    const rect = el.getBoundingClientRect();
    const ratio =
      orientation === "horizontal"
        ? (clientX - rect.left) / rect.width
        : 1 - (clientY - rect.top) / rect.height;
    const clamped = Math.min(1, Math.max(0, ratio));
    return Math.round(min + clamped * (max - min));
  }

  function clearHoldTimer() {
    if (holdTimer.current !== null) {
      window.clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
  }

  function endDrag() {
    setActive(false);
    window.removeEventListener("pointermove", onPointerMoveWindow);
    window.removeEventListener("pointerup", endDrag);
    window.removeEventListener("pointercancel", endDrag);
  }

  function onPointerMoveWindow(e: PointerEvent) {
    onChange(valueFromPointer(e.clientX, e.clientY));
  }

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    const clientX = e.clientX;
    const clientY = e.clientY;
    clearHoldTimer();
    holdTimer.current = window.setTimeout(() => {
      setActive(true);
      onChange(valueFromPointer(clientX, clientY));
      window.addEventListener("pointermove", onPointerMoveWindow);
      window.addEventListener("pointerup", endDrag);
      window.addEventListener("pointercancel", endDrag);
    }, HOLD_MS);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "ArrowUp" || e.key === "ArrowRight") {
      e.preventDefault();
      onChange(Math.min(max, display + 1));
    } else if (e.key === "ArrowDown" || e.key === "ArrowLeft") {
      e.preventDefault();
      onChange(Math.max(min, display - 1));
    }
  }

  const ratio = (display - min) / (max - min);

  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-[var(--color-text-muted)]">{label}</label>
      <div
        ref={trackRef}
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={display}
        onPointerDown={handlePointerDown}
        onPointerUp={clearHoldTimer}
        onPointerLeave={clearHoldTimer}
        onKeyDown={handleKeyDown}
        className={`relative select-none overflow-hidden rounded-[var(--radius-control)] border bg-[var(--color-surface)] outline-none transition-colors ${
          active ? "border-[var(--color-primary)]" : "border-[var(--color-border)]"
        } ${orientation === "horizontal" ? "h-16" : "h-44"}`}
        style={{ touchAction: "none" }}
      >
        <div
          className="absolute bg-[var(--color-primary-soft)] transition-[width,height]"
          style={
            orientation === "horizontal"
              ? { left: 0, top: 0, bottom: 0, width: `${ratio * 100}%` }
              : { left: 0, right: 0, bottom: 0, height: `${ratio * 100}%` }
          }
        />
        <div className="relative flex h-full flex-col items-center justify-center gap-1">
          <span className="font-display text-2xl font-extrabold text-[var(--color-text)]">
            {display}
            <span className="ml-1 text-sm font-semibold text-[var(--color-text-muted)]">{unit}</span>
          </span>
          {!active && (
            <span className="text-[0.6rem] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
              Appui long pour ajuster
            </span>
          )}
        </div>
      </div>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={value ?? ""}
        onChange={(e) => {
          const digits = e.target.value.replace(/[^0-9]/g, "").slice(0, 3);
          if (digits === "") return;
          onChange(Math.min(max, Math.max(min, Number(digits))));
        }}
        placeholder="ou tape la valeur"
        className="mt-2 w-full rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-center text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
      />
    </div>
  );
}
