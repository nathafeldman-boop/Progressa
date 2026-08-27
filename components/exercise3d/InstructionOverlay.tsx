"use client";

import { BrianAvatar } from "@/components/brian/BrianAvatar";

/**
 * Incrustation HTML (jamais du texte planté dans la scène 3D — reste net
 * quel que soit l'angle caméra). Chrono + répétitions + légende de phase +
 * repère technique court. Reste minimal (§9/§23): pas d'interface surchargée.
 */
export function InstructionOverlay({
  caption,
  cue,
  elapsedSeconds,
  totalSeconds,
  repLabel,
}: {
  caption: string;
  cue?: string;
  elapsedSeconds: number;
  totalSeconds?: number;
  repLabel?: string;
}) {
  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="rounded-full bg-[var(--color-text)]/85 px-3 py-1 font-display text-lg font-extrabold tabular-nums text-white">
          {formatMmSs(elapsedSeconds)}
          {totalSeconds ? <span className="ml-1 text-xs font-semibold opacity-70">/ {formatMmSs(totalSeconds)}</span> : null}
        </div>
        {repLabel && (
          <div className="rounded-full bg-[var(--color-primary)]/90 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-white">
            {repLabel}
          </div>
        )}
      </div>

      <div className="flex items-end gap-2">
        <BrianAvatar state="talking" size={40} className="ring-2 ring-white/70" />
        <div className="max-w-[75%] rounded-2xl rounded-bl-sm bg-[var(--color-text)]/85 px-3 py-2 text-sm text-white">
          {caption}
          {cue && (
            <div className="mt-1 text-[0.68rem] font-extrabold uppercase tracking-wide text-[var(--color-primary-light,#7cf0ac)]">
              {cue}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatMmSs(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, "0")}`;
}
