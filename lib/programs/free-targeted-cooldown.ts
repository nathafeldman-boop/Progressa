import { prisma } from "@/lib/prisma";

export const FREE_COOLDOWN_MS = 48 * 60 * 60 * 1000;
export const AD_REDUCTION_MS = 5 * 60 * 60 * 1000;

export interface FreeTargetedSessionStatus {
  eligible: boolean;
  /** null si déjà éligible. */
  nextEligibleAt: Date | null;
  /** Nombre de pubs déjà comptabilisées pour réduire l'attente en cours. */
  adsWatchedForReduction: number;
}

/**
 * Calcul pur (aucun accès DB) — isolé pour être testé directement (voir
 * tests/rewarded-ads.test.ts) sans base de données. `lastUsedAt` null
 * signifie qu'aucune séance gratuite n'a encore été utilisée.
 */
export function computeFreeTargetedSessionStatus(
  lastUsedAt: Date | null,
  adsWatchedForReduction: number,
  now: number
): FreeTargetedSessionStatus {
  if (!lastUsedAt) return { eligible: true, nextEligibleAt: null, adsWatchedForReduction: 0 };

  const baseNextEligibleAt = lastUsedAt.getTime() + FREE_COOLDOWN_MS;
  const reducedNextEligibleAt = baseNextEligibleAt - adsWatchedForReduction * AD_REDUCTION_MS;

  if (reducedNextEligibleAt <= now) return { eligible: true, nextEligibleAt: null, adsWatchedForReduction };
  return { eligible: false, nextEligibleAt: new Date(reducedNextEligibleAt), adsWatchedForReduction };
}

/**
 * Statut du cooldown de 48h entre séances ciblées gratuites (joueur non
 * premium ayant sauté le paiement). Chaque pub récompensée SESSION_TIMER
 * validée APRÈS `lastUsedAt` retranche 5h à l'attente — recalculé à chaque
 * appel à partir des lignes réelles, jamais un minuteur côté client.
 */
export async function getFreeTargetedSessionStatus(userId: string): Promise<FreeTargetedSessionStatus> {
  const usage = await prisma.freeTargetedSessionUsage.findUnique({ where: { userId } });
  if (!usage) return { eligible: true, nextEligibleAt: null, adsWatchedForReduction: 0 };

  const adsWatchedForReduction = await prisma.rewardedAdEvent.count({
    where: { userId, kind: "SESSION_TIMER", grantedAt: { gte: usage.lastUsedAt } },
  });

  return computeFreeTargetedSessionStatus(usage.lastUsedAt, adsWatchedForReduction, Date.now());
}

/** Enregistre l'usage d'une séance ciblée gratuite — redémarre la fenêtre de 48h. */
export async function recordFreeTargetedSessionUsage(userId: string): Promise<void> {
  await prisma.freeTargetedSessionUsage.upsert({
    where: { userId },
    create: { userId, lastUsedAt: new Date() },
    update: { lastUsedAt: new Date(), useCount: { increment: 1 } },
  });
}
