"use client";

import Link from "next/link";
import { useState } from "react";
import { BrianAvatar } from "@/components/brian/BrianAvatar";

const STORAGE_KEY = "progressa:coach-last-viewed";

/**
 * Badge rouge tant que Brian a envoyé un message depuis la dernière visite
 * de /coach. Initialisation paresseuse (pas d'effet) — même pattern que
 * BrianTip. Le badge se retire au clic sur l'onglet.
 */
export function CoachNavLink({ latestBrianMessageAt }: { latestBrianMessageAt: string | null }) {
  const [unread, setUnread] = useState(() => {
    if (typeof window === "undefined" || !latestBrianMessageAt) return false;
    const lastViewed = window.localStorage.getItem(STORAGE_KEY);
    return !lastViewed || new Date(latestBrianMessageAt).getTime() > new Date(lastViewed).getTime();
  });

  function markRead() {
    window.localStorage.setItem(STORAGE_KEY, new Date().toISOString());
    setUnread(false);
  }

  return (
    <Link
      href="/coach"
      onClick={markRead}
      className="flex flex-col items-center gap-0.5 px-2 py-1 text-xs font-semibold text-[var(--color-text-muted)]"
    >
      <span className="relative">
        <BrianAvatar state="idle" size={22} />
        {unread && (
          <span className="absolute -right-1.5 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[0.6rem] font-bold leading-none text-white">
            1
          </span>
        )}
      </span>
      Coach
    </Link>
  );
}
