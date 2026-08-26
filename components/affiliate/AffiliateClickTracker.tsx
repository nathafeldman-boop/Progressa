"use client";

import { useEffect } from "react";
import { getOrCreateAnonId } from "@/lib/onboarding/storage";
import { storeAffCode } from "@/lib/affiliate-client";

/**
 * Capture ?aff=CODE sur n'importe quelle page (lien mis en bio par un
 * affilié), enregistre le clic et mémorise le code 30 jours pour
 * l'attribuer à un futur paiement — jamais bloquant, silencieux si absent.
 * Lit directement window.location plutôt que useSearchParams() pour ne pas
 * forcer un Suspense boundary sur tout l'arbre (composant purement
 * best-effort, sans rendu).
 */
export function AffiliateClickTracker() {
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("aff");
    if (!code) return;
    storeAffCode(code);
    fetch("/api/affiliate/click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, anonId: getOrCreateAnonId() }),
    }).catch(() => {});
  }, []);

  return null;
}
