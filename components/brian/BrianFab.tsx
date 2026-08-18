"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrianAvatar } from "./BrianAvatar";

/**
 * Coach Brian visible sur chaque page de l'app (pas seulement listé dans la
 * nav) — un petit avatar flottant qui ramène vers la discussion complète.
 * Masqué sur /coach lui-même, redondant avec l'écran déjà affiché.
 */
export function BrianFab() {
  const pathname = usePathname();
  if (pathname === "/coach") return null;

  return (
    <Link
      href="/coach"
      aria-label="Parler à Coach Brian"
      className="fixed bottom-[5.5rem] right-4 z-20 rounded-full shadow-[0_8px_20px_-6px_rgba(16,35,26,0.35)] ring-2 ring-[var(--color-surface)]"
    >
      <BrianAvatar state="idle" size={48} />
    </Link>
  );
}
