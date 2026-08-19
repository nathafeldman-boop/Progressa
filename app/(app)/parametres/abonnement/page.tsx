import { prisma } from "@/lib/prisma";
import { getCurrentInternalUser } from "@/lib/auth";
import { isPremiumActive } from "@/lib/subscription";
import { isInFuture } from "@/lib/time";
import { Card, CardSubtitle, CardTitle } from "@/components/ui/Card";
import { SubscriptionActions } from "@/components/billing/SubscriptionActions";

export default async function AbonnementPage() {
  const user = await getCurrentInternalUser();
  if (!user) return null;

  const subscription = await prisma.subscription.findUnique({ where: { userId: user.id } });
  const premium = isPremiumActive(subscription);

  return (
    <div className="mx-auto max-w-md space-y-4 p-4">
      <h1 className="font-display text-2xl font-extrabold uppercase tracking-wide">Abonnement</h1>

      <Card>
        <CardTitle>{premium ? "Tu es Premium 🎉" : "Compte gratuit"}</CardTitle>
        <CardSubtitle className="mt-1">
          {premium
            ? "Programme 100% personnalisé, jusqu'à 3 séances/semaine, bibliothèque complète."
            : "1 séance générique par semaine, accès limité à la bibliothèque d'exercices."}
        </CardSubtitle>
        {subscription?.bonusPremiumUntil && isInFuture(subscription.bonusPremiumUntil) && (
          <p className="mt-2 text-xs font-semibold text-[var(--color-primary-strong)]">
            🎁 Premium offert par le parrainage jusqu&apos;au {subscription.bonusPremiumUntil.toLocaleDateString("fr-FR")}
          </p>
        )}
      </Card>

      <SubscriptionActions hasStripeCustomer={!!subscription?.stripeCustomerId} />

      <p className="text-center text-xs text-[var(--color-text-muted)]">
        Paiement direct, sans essai gratuit. Renouvellement automatique. Résiliation en 1 clic.
      </p>
    </div>
  );
}
