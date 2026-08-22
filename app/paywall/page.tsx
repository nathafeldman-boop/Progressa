import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentInternalUser } from "@/lib/auth";
import { isPremiumActive } from "@/lib/subscription";
import { HardPaywall } from "@/components/paywall/HardPaywall";
import type { PlayerCardStats } from "@/lib/player-card";

/**
 * Hard paywall — palier unique (6,99 €/mois), pas de compte gratuit.
 * Un abonné actif ne voit jamais cet écran (redirigé direct vers l'app).
 */
export default async function PaywallPage() {
  const user = await getCurrentInternalUser();
  if (!user) redirect("/connexion");

  const [subscription, card] = await Promise.all([
    prisma.subscription.findUnique({ where: { userId: user.id } }),
    prisma.playerCard.findUnique({ where: { userId: user.id } }),
  ]);

  if (isPremiumActive(subscription)) redirect("/dashboard");

  const stats = card ? (card.stats as unknown as PlayerCardStats) : null;

  return <HardPaywall firstName={user.firstName} overall={stats?.overall ?? null} />;
}
