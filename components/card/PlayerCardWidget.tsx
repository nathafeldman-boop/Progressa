"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PlayerCardView } from "@/components/card/PlayerCardView";
import { ShareCardButton } from "@/components/card/ShareCardButton";
import { RankCardBadge } from "@/components/card/RankCardBadge";
import { rankStyleFor } from "@/lib/card/rank-styles";
import { uploadProfilePhoto } from "@/lib/client/profile-photo";
import type { PlayerCardStats } from "@/lib/player-card";

/**
 * La carte occupait tout l'écran en permanence. Par défaut on montre un
 * résumé compact (OVR + rang) — la carte complète ne s'affiche que si le
 * joueur la demande, en tapant dessus.
 */
export function PlayerCardWidget({
  firstName,
  positionLabel,
  ageCategoryLabel,
  country,
  department,
  niveauLabel,
  stats,
  photoUrl,
  shareSlug,
}: {
  firstName: string;
  positionLabel: string;
  ageCategoryLabel: string | null;
  country?: string | null;
  department?: string | null;
  niveauLabel?: string | null;
  stats: PlayerCardStats;
  photoUrl: string | null;
  shareSlug: string;
}) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [photo, setPhoto] = useState(photoUrl);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const style = rankStyleFor(stats.rankKey);

  async function handlePhotoFile(file: File) {
    setPhotoBusy(true);
    setPhotoError(null);
    try {
      const dataUrl = await uploadProfilePhoto(file);
      setPhoto(dataUrl);
      router.refresh();
    } catch {
      setPhotoError("La photo n'a pas pu être envoyée. Réessaie avec une autre image.");
    } finally {
      setPhotoBusy(false);
    }
  }

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="flex w-full items-center gap-3 rounded-[var(--radius-card)] p-3 text-left"
        style={{
          background: `linear-gradient(135deg, ${style.gradient[0]}, ${style.gradient[1]})`,
          boxShadow: `0 10px 24px -12px ${style.border}88`,
        }}
      >
        <RankCardBadge rankKey={stats.rankKey} size={34} />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-2xl font-extrabold tabular-nums text-white">{stats.overall}</span>
            <span className="text-[0.6rem] font-bold uppercase tracking-widest" style={{ color: `${style.accent}cc` }}>
              OVR
            </span>
          </div>
          <p className="text-xs font-bold uppercase tracking-wide" style={{ color: style.accent }}>
            {stats.rankTier ?? "Débutant"}
          </p>
        </div>
        <span className="shrink-0 text-xs font-semibold text-white/70">Voir la carte →</span>
      </button>
    );
  }

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handlePhotoFile(file);
          e.target.value = "";
        }}
      />
      <PlayerCardView
        firstName={firstName}
        positionLabel={positionLabel}
        ageCategoryLabel={ageCategoryLabel}
        country={country}
        department={department}
        niveauLabel={niveauLabel}
        stats={stats}
        photoUrl={photo}
        onPhotoClick={() => inputRef.current?.click()}
        photoBusy={photoBusy}
      />
      {photoError && <p className="text-center text-xs text-[var(--color-danger)]">{photoError}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="flex-1 rounded-[var(--radius-control)] border border-[var(--color-border)] py-2.5 text-center text-sm font-semibold text-[var(--color-text-muted)]"
        >
          Réduire
        </button>
        <div className="flex-1">
          <ShareCardButton shareSlug={shareSlug} firstName={firstName} />
        </div>
      </div>
    </div>
  );
}
