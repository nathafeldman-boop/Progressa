import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

/**
 * Uniquement les pages publiques ET destinées à être trouvées via une
 * recherche (voir proxy.ts PUBLIC_PREFIXES pour ce qui est *accessible*
 * sans connexion — un sous-ensemble plus large que ce qui mérite d'être
 * indexé: /r/, /carte/, /connexion n'ont rien à faire ici).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/tarifs"), lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: absoluteUrl("/inscription"), lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/avis"), lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: absoluteUrl("/ressources"), lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: absoluteUrl("/ressources/nutrition"), lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: absoluteUrl("/ressources/mental"), lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: absoluteUrl("/ressources/filiere-pro"), lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: absoluteUrl("/contact"), lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: absoluteUrl("/cgu"), lastModified: now, changeFrequency: "yearly", priority: 0.1 },
    { url: absoluteUrl("/cgv"), lastModified: now, changeFrequency: "yearly", priority: 0.1 },
    { url: absoluteUrl("/confidentialite"), lastModified: now, changeFrequency: "yearly", priority: 0.1 },
    { url: absoluteUrl("/mentions-legales"), lastModified: now, changeFrequency: "yearly", priority: 0.1 },
  ];
}
