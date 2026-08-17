import type { Subscription } from "@prisma/client";
import { isInFuture } from "@/lib/time";

export function isPremiumActive(subscription: Subscription | null | undefined): boolean {
  if (!subscription) return false;
  if (subscription.status === "ACTIVE") return true;
  return isInFuture(subscription.bonusPremiumUntil);
}

/** Nombre de séances/semaine selon le palier (section 3). */
export function sessionCountForTier(subscription: Subscription | null | undefined): number {
  return isPremiumActive(subscription) ? 3 : 1;
}
