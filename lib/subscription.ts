import type { Subscription } from "@prisma/client";

/**
 * Hard paywall: un seul palier (6,99 €/mois), pas de compte gratuit.
 * L'accès à l'application (dashboard, séances, progression, carte...) est
 * entièrement conditionné à un abonnement Stripe actif — voir le check
 * `if (!premium) redirect("/paywall")` répété dans chaque page de
 * app/(app)/. Avant le test initial et le paywall, le joueur n'a jamais
 * besoin de cette fonction (onboarding + tests restent hors du groupe
 * (app), donc jamais bloqués par elle).
 */
export function isPremiumActive(subscription: Subscription | null | undefined): boolean {
  if (!subscription) return false;
  if (subscription.status === "ACTIVE") return true;
  // Premium offert par le parrainage (viral loop), indépendant de Stripe.
  if (subscription.bonusPremiumUntil && subscription.bonusPremiumUntil.getTime() > Date.now()) return true;
  return false;
}

/** Nombre de séances/semaine — palier unique, pas de dégradé freemium. */
export function sessionCountForTier(subscription: Subscription | null | undefined): number {
  return isPremiumActive(subscription) ? 3 : 0;
}
