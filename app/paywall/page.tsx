import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentInternalUser } from "@/lib/auth";
import { isPremiumActive } from "@/lib/subscription";
import { getAgeCategory } from "@/lib/age-category";
import { POSITION_LABELS } from "@/lib/labels";
import { HardPaywall } from "@/components/paywall/HardPaywall";
import type { PlayerCardStats } from "@/lib/player-card";

/**
 * Hard paywall — palier unique (6,99 €/mois), pas de compte gratuit.
 * Un abonné actif ne voit jamais cet écran (redirigé direct vers l'app).
 */
export default async function PaywallPage() {
  const user = await getCurrentInternalUser();
  if (!user) redirect("/connexion");

  const [profile, subscription, card] = await Promise.all([
    prisma.playerProfile.findUnique({ where: { userId: user.id } }),
    prisma.subscription.findUnique({ where: { userId: user.id } }),
    prisma.playerCard.findUnique({ where: { userId: user.id } }),
  ]);

  if (isPremiumActive(subscription)) redirect("/dashboard");

  const stats = card ? (card.stats as unknown as PlayerCardStats) : null;
  const ageCategory = profile ? getAgeCategory(profile.birthYear) : null;

  return (
    <HardPaywall
      firstName={user.firstName}
      cardStats={stats}
      positionLabel={profile ? POSITION_LABELS[profile.position] : null}
      ageCategoryLabel={ageCategory?.label ?? null}
      country={profile?.country ?? null}
      department={profile?.district ?? null}
      niveauLabel={profile?.levelLabel ?? null}
      photoUrl={user.photoUrl}
    />
  );
}
