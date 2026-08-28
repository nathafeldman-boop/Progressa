"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BrianAvatar } from "./BrianAvatar";

const STORAGE_KEY = "progressa:coach-last-viewed";

/**
 * Coach Brian visible sur chaque page de l'app (pas seulement listé dans la
 * nav) — un petit avatar flottant qui ramène vers la discussion complète.
 * Masqué sur /coach lui-même, redondant avec l'écran déjà affiché.
 *
 * Porte aussi le badge "nouveau message" — Coach Brian n'est plus un onglet
 * de la barre basse depuis la refonte (design_handoff_progressa_ui) : ce
 * FAB (+ la carte message du dashboard) est désormais le seul accès
 * permanent à la discussion, donc le badge devait migrer ici pour ne pas
 * perdre le signal.
 */
export function BrianFab({ latestBrianMessageAt }: { latestBrianMessageAt: string | null }) {
  const pathname = usePathname();
  const [unread, setUnread] = useState(() => {
    if (typeof window === "undefined" || !latestBrianMessageAt) return false;
    const lastViewed = window.localStorage.getItem(STORAGE_KEY);
    return !lastViewed || new Date(latestBrianMessageAt).getTime() > new Date(lastViewed).getTime();
  });

  if (pathname === "/coach") return null;

  function markRead() {
    window.localStorage.setItem(STORAGE_KEY, new Date().toISOString());
    setUnread(false);
  }

  return (
    <Link
      href="/coach"
      onClick={markRead}
      aria-label="Parler à Coach Brian"
      className="fixed bottom-[5.5rem] right-4 z-20 rounded-full shadow-[0_8px_20px_-6px_rgba(16,35,26,0.35)] ring-2 ring-[var(--color-surface)]"
    >
      <span className="relative block">
        <BrianAvatar state="idle" size={48} />
        {unread && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[0.65rem] font-bold leading-none text-white ring-2 ring-[var(--color-surface)]">
            1
          </span>
        )}
      </span>
    </Link>
  );
}
