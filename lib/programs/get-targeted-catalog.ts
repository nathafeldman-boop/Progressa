import { Equipment } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { EXERCISE_CATALOG } from "@/lib/exercises/catalog-data";
import { meetsMinAge } from "@/lib/age-category";
import { isPremiumActive } from "@/lib/subscription";
import { estimateDifficulty, difficultyBandForRankKey } from "@/lib/exercises/difficulty";
import { THEME_MAIN_CATEGORIES, type TrainingTheme } from "@/lib/programs/build-targeted-session";

export interface TargetedCatalogEntry {
  slug: string;
  name: string;
  emoji: string;
  description: string;
  difficulty: number;
  /** true si le joueur ne peut pas encore lancer cet exercice tel quel (matériel manquant ou Premium requis). */
  locked: boolean;
  lockReason: "premium" | "equipment" | null;
}

/**
 * 5 exercices proposés pour un thème. On part des exercices réellement
 * disponibles (âge, poste, matériel, Premium), et on complète avec des
 * exercices "verrouillés" (matériel manquant ou Premium) si le sous-ensemble
 * strict est trop petit — jamais moins de 5 propositions visibles quand le
 * thème en contient assez, plutôt qu'une liste maigre à 2-3 exercices.
 * Les exercices verrouillés restent non-sélectionnables (build-targeted-session
 * revalide côté serveur avec les mêmes règles strictes).
 */
export async function getTargetedCatalog(userId: string, theme: TrainingTheme): Promise<TargetedCatalogEntry[] | null> {
  const [profile, subscription, card] = await Promise.all([
    prisma.playerProfile.findUnique({ where: { userId } }),
    prisma.subscription.findUnique({ where: { userId } }),
    prisma.playerCard.findUnique({ where: { userId } }),
  ]);
  if (!profile) return null;

  const premium = isPremiumActive(subscription);
  const available = new Set(profile.equipment.length ? profile.equipment : [Equipment.NONE]);

  const mainCategories = THEME_MAIN_CATEGORIES[theme];
  const pool = EXERCISE_CATALOG.filter((e) => {
    if (!mainCategories.includes(e.category)) return false;
    if (!meetsMinAge(profile.birthYear, e.minAge)) return false;
    if (e.positions.length > 0 && !e.positions.includes(profile.position)) return false;
    return true;
  });
  if (pool.length === 0) return [];

  const rankKey = (card?.stats as { rankKey?: string } | null)?.rankKey ?? null;
  const [minDifficulty, maxDifficulty] = difficultyBandForRankKey(rankKey);
  const center = (minDifficulty + maxDifficulty) / 2;

  const withMeta = pool.map((e) => {
    const equipmentOk = e.equipment.every((eq) => eq === Equipment.NONE || available.has(eq));
    const premiumOk = premium || e.isFreeTier;
    const lockReason: "premium" | "equipment" | null = !premiumOk ? "premium" : !equipmentOk ? "equipment" : null;
    return { ...e, difficulty: estimateDifficulty(e), locked: lockReason !== null, lockReason };
  });

  const scored = withMeta.sort((a, b) => {
    if (a.locked !== b.locked) return a.locked ? 1 : -1;
    return Math.abs(a.difficulty - center) - Math.abs(b.difficulty - center);
  });

  return scored.slice(0, 5).map((e) => ({
    slug: e.slug,
    name: e.name,
    emoji: e.emoji,
    description: e.description,
    difficulty: e.difficulty,
    locked: e.locked,
    lockReason: e.lockReason,
  }));
}
