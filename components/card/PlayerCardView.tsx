"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
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

function CrownIcon({ color, size = 18 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size * 0.75} viewBox="0 0 24 18" fill="none" aria-hidden>
      <path
        d="M2 6L7 10L12 2L17 10L22 6L20 15H4L2 6Z"
        fill={color}
        stroke={color}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StarRow({ count, color }: { count: number; color: string }) {
  return (
    <div className="flex items-center justify-center gap-1" aria-label={`${count} sur 5 étoiles`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} width="12" height="12" viewBox="0 0 24 24" aria-hidden>
          <path
            d="M12 1.5l3.09 6.26 6.91 1-5 4.87 1.18 6.87L12 17.27l-6.18 3.23L7 13.63l-5-4.87 6.91-1L12 1.5z"
            fill={i < count ? color : "transparent"}
            stroke={color}
            strokeWidth="1.2"
          />
        </svg>
      ))}
    </div>
  );
}

export function PlayerCardView({
  firstName,
  positionLabel,
  ageCategoryLabel,
  country,
  department,
  niveauLabel,
  stats,
  photoUrl = null,
  animateFromOverall = null,
  onPhotoClick,
  photoBusy = false,
  statsClickable = false,
}: {
  firstName: string;
  positionLabel: string;
  ageCategoryLabel: string | null;
  country?: string | null;
  department?: string | null;
  niveauLabel?: string | null;
  stats: PlayerCardStats;
  photoUrl?: string | null;
  /** Note générale précédente — si fournie et différente, la note s'anime de cette valeur vers stats.overall. */
  animateFromOverall?: number | null;
  /** Quand fourni, la photo devient cliquable (changement de photo directement depuis la carte) — sur les cartes publiques/partagées, ne pas le passer. */
  onPhotoClick?: () => void;
  photoBusy?: boolean;
  /** Quand vrai, chaque stat renvoie vers son analyse détaillée — jamais sur les cartes publiques/partagées. */
  statsClickable?: boolean;
}) {
  const style = rankStyleFor(stats.rankKey);
  const overall = useCountUp(stats.overall, animateFromOverall);
  const displayedRank = stats.rankTier ?? "Débutant";

  return (
    <div
      className="relative mx-auto w-full max-w-sm pb-8 pt-6 text-center"
      style={{
        background: `linear-gradient(165deg, ${style.gradient[0]}, ${style.gradient[1]})`,
        border: `2px solid ${style.border}`,
        borderRadius: "1.75rem 1.75rem 0 0",
        clipPath: "polygon(0% 0%, 100% 0%, 100% 88%, 50% 100%, 0% 88%)",
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
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: `radial-gradient(70% 45% at 50% 8%, ${style.border}33, transparent 70%)` }}
        aria-hidden
      />

      <div className="relative px-6">
        <span className="absolute left-1 top-0 text-left">
          <span className="font-display block text-2xl font-extrabold tabular-nums" style={{ color: style.accent }}>
            {overall}
          </span>
          <span className="text-[0.55rem] font-bold uppercase tracking-widest" style={{ color: `${style.accent}99` }}>
            OVR
          </span>
        </span>

        <CrownIcon color={style.accent} />
        <p
          className="font-display mt-1 text-lg font-extrabold uppercase tracking-widest"
          style={{ color: style.accent, textShadow: `0 0 18px ${style.border}55` }}
        >
          {displayedRank}
        </p>

        <div className="relative mx-auto mt-4 h-24 w-24">
          <div
            className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full text-3xl font-extrabold"
            style={{ background: `${style.accent}1a`, color: style.accent, border: `2px solid ${style.border}`, boxShadow: `0 0 24px -4px ${style.border}88` }}
            aria-hidden={!onPhotoClick}
          >
            {photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- data URL, pas un asset optimisable par next/image
              <img src={photoUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              firstName.charAt(0).toUpperCase() || "?"
            )}
          </div>
          {onPhotoClick && (
            <button
              type="button"
              onClick={onPhotoClick}
              disabled={photoBusy}
              aria-label="Changer la photo de profil"
              className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 transition-colors hover:bg-black/35 active:bg-black/45"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs shadow-md">
                {photoBusy ? "…" : "📷"}
              </span>
            </button>
          )}
        </div>
        <h2 className="font-display mt-2 text-xl font-extrabold uppercase tracking-wide text-white">{firstName}</h2>
        <p className="text-xs font-semibold uppercase tracking-wide text-white/60">
          {[ageCategoryLabel, positionLabel].filter(Boolean).join(" · ")}
        </p>

        {(country || department || niveauLabel) && (
          <div className="mt-3 space-y-1 border-t border-white/10 pt-3">
            {(country || department) && (
              <p className="text-[0.7rem] font-medium text-white/50">
                {[country, department].filter(Boolean).join(" · ")}
              </p>
            )}
            {niveauLabel && <p className="text-[0.7rem] font-medium text-white/50">{niveauLabel}</p>}
          </div>
        )}

        <div className="mt-4 grid grid-cols-3 gap-x-2 gap-y-3 border-t border-white/10 pt-4">
          {STAT_ORDER.map((axis) => {
            const value = (
              <>
                <p className="font-display text-lg font-extrabold tabular-nums" style={{ color: style.accent }}>
                  {stats.skills[STAT_LABELS[axis]] ?? "—"}
                </p>
                <p className="text-[0.6rem] font-bold uppercase tracking-widest text-white/45">
                  {STAT_SHORT_LABELS[axis]}
                </p>
              </>
            );
            return statsClickable ? (
              <Link key={axis} href={`/progression/stat/${axis.toLowerCase()}`} className="block rounded-lg active:opacity-70">
                {value}
              </Link>
            ) : (
              <div key={axis}>{value}</div>
            );
          })}
        </div>

        <div className="mt-4 border-t border-white/10 pt-3">
          <StarRow count={style.stars} color={style.accent} />
        </div>
      </div>
    </div>
  );
}
