import { prisma } from "@/lib/prisma";

/**
 * Attribution automatique après chaque séance loguée (section 6.5).
 * Idempotent: s'appuie sur la contrainte unique (userId, badgeId).
 */
/** Pure — quels badges un état (total séances, série) débloque, indépendamment de la DB. */
export function badgeSlugsToAward(totalCompletedSessions: number, currentStreak: number): string[] {
  const slugsToAward: string[] = [];
  if (totalCompletedSessions === 1) slugsToAward.push("premiere-seance");
  if (currentStreak === 3) slugsToAward.push("serie-3");
  if (currentStreak === 7) slugsToAward.push("serie-7");
  if (totalCompletedSessions === 10) slugsToAward.push("dix-seances");
  if (totalCompletedSessions === 25) slugsToAward.push("vingt-cinq-seances");
  return slugsToAward;
}

export async function awardCompletionBadges(userId: string, totalCompletedSessions: number, currentStreak: number) {
  const slugsToAward = badgeSlugsToAward(totalCompletedSessions, currentStreak);

  if (slugsToAward.length === 0) return [];

  const badges = await prisma.badge.findMany({ where: { slug: { in: slugsToAward } } });
  const awarded: string[] = [];

  for (const badge of badges) {
    try {
      await prisma.userBadge.create({ data: { userId, badgeId: badge.id } });
      awarded.push(badge.slug);
    } catch {
      // déjà attribué (contrainte unique) — on ignore
    }
  }

  return awarded;
}
