"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Revalidation automatique des pages admin — sans ça, "en ligne
 * maintenant" (fenêtre glissante de 5 min) et le parcours d'un joueur
 * restent figés sur l'état au moment du chargement jusqu'au prochain
 * rechargement manuel, ce qui donnait l'impression d'un délai bien plus
 * long que la réalité. router.refresh() relance les Server Components
 * sans perdre l'état client (scroll, formulaires ouverts).
 */
export function AutoRefresh({ intervalMs = 15000 }: { intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    const id = window.setInterval(() => router.refresh(), intervalMs);
    return () => window.clearInterval(id);
  }, [router, intervalMs]);

  return null;
}
