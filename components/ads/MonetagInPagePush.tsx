"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

const ZONE_ID = "11697940";

/**
 * Bannière "In-Page Push" Monetag (publicité classique, non-intrusive —
 * section 6 du cahier des charges) — jamais rendue pour un joueur Premium
 * (voir les points d'appel: chaque page décide elle-même en fonction de
 * son propre `premium` déjà calculé côté serveur, jamais recalculé ici).
 * Le tag Monetag s'injecte et gère lui-même son propre affichage.
 *
 * L'id inclut le chemin de la page: Next.js dédoublonne les <Script> par
 * id, donc un id fixe ne se rechargeait qu'une seule fois par session de
 * navigation (App Router ne fait pas de vrai rechargement entre les pages)
 * — un joueur qui fermait la pub sur /coach n'en revoyait plus jamais,
 * même en visitant /entrainement-cible ensuite. Avec le chemin dans l'id,
 * chaque page réellement différente redéclenche l'injection une fois —
 * ni plus (retourner sur une page déjà vue ne la relance pas), ni moins.
 */
export function MonetagInPagePush() {
  const pathname = usePathname();
  return (
    <Script
      key={pathname}
      id={`monetag-in-page-push-${pathname}`}
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `(function(s){s.dataset.zone='${ZONE_ID}',s.src='https://nap5k.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`,
      }}
    />
  );
}
