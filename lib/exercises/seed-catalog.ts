import { prisma } from "@/lib/prisma";
import { EXERCISE_CATALOG } from "./catalog-data";
import { BADGE_CATALOG } from "@/lib/badges-data";

export interface SeedCatalogResult {
  exercisesSynced: number;
  badgesSynced: number;
  skipped: boolean;
}

/**
 * Recopie en base le catalogue d'exercices et de badges défini dans le code
 * (upsert par slug, idempotent). Utilisé par trois points d'entrée:
 * - instrumentation.ts: auto-exécuté à chaque démarrage d'instance serveur,
 *   donc plus jamais besoin de repasser par l'éditeur SQL Supabase à la main.
 * - prisma/seed.ts: script de seed local pour le dev.
 * - app/api/admin/seed-catalog: re-synchronisation manuelle immédiate
 *   (force=true) sans attendre le prochain cold start.
 *
 * Sans `force`, saute le travail si la base semble déjà à jour (comptage
 * rapide) — évite de refaire ~70 upserts séquentiels à chaque cold start.
 */
export async function seedCatalog(options?: { force?: boolean }): Promise<SeedCatalogResult> {
  if (!options?.force) {
    const [exerciseCount, badgeCount] = await Promise.all([prisma.exercise.count(), prisma.badge.count()]);
    if (exerciseCount >= EXERCISE_CATALOG.length && badgeCount >= BADGE_CATALOG.length) {
      return { exercisesSynced: 0, badgesSynced: 0, skipped: true };
    }
  }

  for (const exercise of EXERCISE_CATALOG) {
    await prisma.exercise.upsert({ where: { slug: exercise.slug }, create: exercise, update: exercise });
  }
  for (const badge of BADGE_CATALOG) {
    await prisma.badge.upsert({ where: { slug: badge.slug }, create: badge, update: badge });
  }

  return { exercisesSynced: EXERCISE_CATALOG.length, badgesSynced: BADGE_CATALOG.length, skipped: false };
}
