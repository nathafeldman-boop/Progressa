import type { Metadata } from "next";

// Sans slash final — toutes les URLs construites ici en ajoutent un elles-mêmes.
export const SITE_URL = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Metadata par page publique — juste titre + description + URL canonique.
 * Le reste (OG/Twitter, image par défaut) hérite du layout racine: pas
 * besoin de le redéclarer à chaque page pour un gain marginal, le vrai
 * signal SEO (titre + description uniques par page, avant cette fonction
 * identiques sur tout le site) est déjà couvert par ces trois champs.
 */
export function pageMetadata(title: string, description: string, path: string): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
  };
}
