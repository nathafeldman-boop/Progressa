"use client";

import { useEffect, useRef, useState } from "react";
import type { PlayerCardStats } from "@/lib/player-card";
import { STAT_LABELS, STAT_SHORT_LABELS } from "@/lib/brian/types";
import { rankStyleFor } from "@/lib/card/rank-styles";
import type { StatAxis } from "@prisma/client";

const STAT_ORDER: StatAxis[] = ["VITESSE", "TIR", "PASSE", "CONDUITE", "DEFENSE", "PHYSIQUE"];

function useCountUp(target: number, from: number | null) {
  const [value, setValue] = useState(() => from ?? target);
  const raf = useRef<number | null>(null);
  const shouldAnimate = from != null && from !== target;

  useEffect(() => {
    if (!shouldAnimate) return;
    const start = performance.now();
    const durationMs = 900;
    const startValue = from as number;

    function tick(now: number) {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(startValue + (target - startValue) * eased));
      if (t < 1) raf.current = requestAnimationFrame(tick);
    }
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [shouldAnimate, target, from]);

  return shouldAnimate ? value : target;
}

export function PlayerCardView({
  firstName,
  positionLabel,
  ageCategoryLabel,
  country,
  department,
  niveauLabel,
  stats,
  animateFromOverall = null,
}: {
  firstName: string;
  positionLabel: string;
  ageCategoryLabel: string | null;
  country?: string | null;
  department?: string | null;
  niveauLabel?: string | null;
  stats: PlayerCardStats;
  /** Note générale précédente — si fournie et différente, la note s'anime de cette valeur vers stats.overall. */
  animateFromOverall?: number | null;
}) {
  const style = rankStyleFor(stats.rankKey);
  const overall = useCountUp(stats.overall, animateFromOverall);
  const displayedRank = stats.rankTier ?? "Débutant";

  return (
    <div
      className="relative mx-auto w-full max-w-sm overflow-hidden rounded-[1.75rem] p-6 text-center"
      style={{
        background: `linear-gradient(165deg, ${style.gradient[0]}, ${style.gradient[1]})`,
        border: `2px solid ${style.border}`,
        boxShadow: `0 0 0 1px rgba(255,255,255,0.04) inset, 0 20px 45px -18px ${style.border}66`,
      }}
    >
      {style.premium && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: "radial-gradient(120% 60% at 50% -10%, rgba(212,175,55,0.25), transparent 60%)",
          }}
          aria-hidden
        />
      )}

      <div className="relative">
        <span
          className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-[0.65rem] font-extrabold uppercase tracking-widest"
          style={{ background: style.accent, color: style.onAccent }}
        >
          {displayedRank}
        </span>

        <p
          className="font-display mt-3 text-7xl font-extrabold leading-none tabular-nums"
          style={{ color: style.accent, textShadow: `0 0 24px ${style.border}55` }}
        >
          {overall}
        </p>
        <p className="mt-1 text-[0.65rem] font-bold uppercase tracking-[0.2em]" style={{ color: `${style.accent}99` }}>
          Note générale
        </p>

        <div
          className="mx-auto mt-4 flex h-16 w-16 items-center justify-center rounded-full text-2xl font-extrabold"
          style={{ background: `${style.accent}22`, color: style.accent, border: `1px solid ${style.border}` }}
          aria-hidden
        >
          {firstName.charAt(0).toUpperCase() || "?"}
        </div>
        <h2 className="font-display mt-2 text-xl font-extrabold uppercase tracking-wide text-white">{firstName}</h2>
        <p className="text-xs font-semibold uppercase tracking-wide text-white/60">
          {[ageCategoryLabel, positionLabel].filter(Boolean).join(" · ")}
        </p>

        {(country || department || niveauLabel) && (
          <div className="mt-2 flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 text-[0.7rem] font-medium text-white/50">
            {country && <span>📍 {country}</span>}
            {department && <span>· {department}</span>}
            {niveauLabel && <span>· {niveauLabel}</span>}
          </div>
        )}

        <div className="mt-5 grid grid-cols-3 gap-x-2 gap-y-3 border-t border-white/10 pt-4">
          {STAT_ORDER.map((axis) => (
            <div key={axis}>
              <p className="font-display text-lg font-extrabold tabular-nums" style={{ color: style.accent }}>
                {stats.skills[STAT_LABELS[axis]] ?? "—"}
              </p>
              <p className="text-[0.6rem] font-bold uppercase tracking-widest text-white/45">
                {STAT_SHORT_LABELS[axis]}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
