import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

/**
 * Tout ce qui exige une connexion (proxy.ts fait déjà foi de ce qui est
 * réellement public) n'a aucune valeur à être indexé — un crawler non
 * authentifié y voit de toute façon un renvoi vers /connexion. Réaffirmé
 * ici explicitement plutôt que de compter sur ce seul fait, et /carte est
 * bloqué même publique (cartes joueur potentiellement de mineurs — pas de
 * raison qu'elles soient cherchables par nom sur Google).
 */
const DISALLOWED = [
  "/admin",
  "/api/",
  "/onboarding",
  "/connexion",
  "/auth/",
  "/affiliation",
  "/r/",
  "/carte",
  "/ouvrir-dans-navigateur",
  "/dashboard",
  "/seance",
  "/classement",
  "/progression",
  "/parametres",
  "/coach",
  "/entrainement-cible",
  "/exercices",
  "/journal",
  "/paywall",
  "/tests",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: DISALLOWED,
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
