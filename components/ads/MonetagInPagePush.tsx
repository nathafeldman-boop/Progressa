"use client";

import Script from "next/script";

const ZONE_ID = "11697940";

/**
 * Bannière "In-Page Push" Monetag (publicité classique, non-intrusive —
 * section 6 du cahier des charges) — jamais rendue pour un joueur Premium
 * (voir les points d'appel: chaque page décide elle-même en fonction de
 * son propre `premium` déjà calculé côté serveur, jamais recalculé ici).
 * Le tag Monetag s'injecte et gère lui-même son propre affichage — on se
 * contente de le charger une fois par page.
 */
export function MonetagInPagePush() {
  return (
    <Script
      id="monetag-in-page-push"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `(function(s){s.dataset.zone='${ZONE_ID}',s.src='https://nap5k.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`,
      }}
    />
  );
}
