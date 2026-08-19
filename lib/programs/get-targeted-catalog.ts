import { prisma } from "@/lib/prisma";
import { filterCatalogForProfile } from "@/lib/ai/catalog-filter";
import { isPremiumActive } from "@/lib/subscription";
import { estimateDifficulty, difficultyBandForRankKey } from "@/lib/exercises/difficulty";
import { THEME_MAIN_CATEGORIES, type TrainingTheme } from "@/lib/programs/build-targeted-session";

export interface TargetedCatalogEntry {
  slug: string;
  name: string;
  emoji: string;
  description: string;
  difficulty: number;
}

/**
 * 5 exercices proposés pour un thème, choisis dans la plage de difficulté
 * du rang actuel de la carte joueur (section carte joueur: "un joueur
 * Espoir pioche parmi des exercices dosés pour son niveau, pas trop
 * durs"). Retourne null si le profil n'existe pas encore.
 */
export async function getTargetedCatalog(userId: string, theme: TrainingTheme): Promise<TargetedCatalogEntry[] | null> {
  const [profile, subscription, card] = await Promise.all([
    prisma.playerProfile.findUnique({ where: { userId } }),
    prisma.subscription.findUnique({ where: { userId } }),
    prisma.playerCard.findUnique({ where: { userId } }),
  ]);
  if (!profile) return null;

  const premium = isPremiumActive(subscription);
  const catalog = filterCatalogForProfile({
    birthYear: profile.birthYear,
    position: profile.position,
    equipment: profile.equipment,
    isPremium: premium,
  });

  const mainCategories = THEME_MAIN_CATEGORIES[theme];
  const pool = catalog.filter((e) => mainCategories.includes(e.category));
  if (pool.length === 0) return [];

  const rankKey = (card?.stats as { rankKey?: string } | null)?.rankKey ?? null;
  const [minDifficulty, maxDifficulty] = difficultyBandForRankKey(rankKey);
  const center = (minDifficulty + maxDifficulty) / 2;

  const scored = pool
    .map((e) => ({ ...e, difficulty: estimateDifficulty(e) }))
    .sort((a, b) => Math.abs(a.difficulty - center) - Math.abs(b.difficulty - center));

  return scored.slice(0, 5).map((e) => ({
    slug: e.slug,
    name: e.name,
    emoji: e.emoji,
    description: e.description,
    difficulty: e.difficulty,
  }));
}
