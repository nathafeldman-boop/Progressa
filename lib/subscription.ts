import type { Subscription } from "@prisma/client";

/**
 * Application en phase freemium totale: toutes les fonctionnalités
 * (carte joueur, classement, catalogue complet, 3 séances/semaine) sont
 * débloquées pour tout le monde, sans abonnement. L'infra Stripe/
 * Subscription reste en place telle quelle (rien de supprimé) pour
 * pouvoir réactiver un vrai palier payant plus tard — il suffira de
 * remettre la logique ci-dessous.
 */
export function isPremiumActive(_subscription: Subscription | null | undefined): boolean {
  return true;
}

/** Nombre de séances/semaine selon le palier (section 3). */
export function sessionCountForTier(subscription: Subscription | null | undefined): number {
  return isPremiumActive(subscription) ? 3 : 1;
}
