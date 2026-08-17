import type { Subscription } from "@prisma/client";

export function isPremiumActive(subscription: Subscription | null | undefined): boolean {
  if (!subscription) return false;
  if (subscription.status === "ACTIVE") return true;
  return !!subscription.bonusPremiumUntil && subscription.bonusPremiumUntil.getTime() > Date.now();
}

/** Nombre de séances/semaine selon le palier (section 3). */
export function sessionCountForTier(subscription: Subscription | null | undefined): number {
  return isPremiumActive(subscription) ? 3 : 1;
}
