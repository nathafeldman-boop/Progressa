import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentInternalUser } from "@/lib/auth";
import { isPremiumActive } from "@/lib/subscription";
import { getAgeCategory } from "@/lib/age-category";
import { POSITION_LABELS } from "@/lib/labels";
import { Card, CardSubtitle, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PlayerCardView } from "@/components/card/PlayerCardView";
import { ShareCardButton } from "@/components/card/ShareCardButton";
import type { PlayerCardStats } from "@/lib/player-card";

export default async function CartePage() {
  const user = await getCurrentInternalUser();
  if (!user) return null;

  const [profile, subscription, card] = await Promise.all([
    prisma.playerProfile.findUnique({ where: { userId: user.id } }),
    prisma.subscription.findUnique({ where: { userId: user.id } }),
    prisma.playerCard.findUnique({ where: { userId: user.id } }),
  ]);

  const premium = isPremiumActive(subscription);

  if (!premium) {
    return (
      <div className="mx-auto max-w-md p-4">
        <Card className="p-6 text-center">
          <CardTitle>La carte joueur est une fonctionnalité Premium</CardTitle>
          <CardSubtitle className="mt-2">
            Passe tes tests d&apos;évaluation et débloque une vraie carte de stats à partager, façon jeu vidéo.
          </CardSubtitle>
          <Link href="/parametres/abonnement" className="mt-4 block">
            <Button className="w-full">Découvrir Premium</Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="mx-auto max-w-md p-4">
        <Card className="p-6 text-center">
          <CardTitle>Passe au moins un test</CardTitle>
          <CardSubtitle className="mt-2">Ta carte se débloque dès ton premier test d&apos;évaluation.</CardSubtitle>
          <Link href="/tests" className="mt-4 block">
            <Button className="w-full">Passer un test</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const ageCategory = profile ? getAgeCategory(profile.birthYear) : null;

  return (
    <div className="mx-auto max-w-md space-y-4 p-4">
      <PlayerCardView
        firstName={user.firstName}
        positionLabel={profile ? POSITION_LABELS[profile.position] : ""}
        ageCategoryLabel={ageCategory?.label ?? null}
        stats={card.stats as unknown as PlayerCardStats}
      />
      <ShareCardButton shareSlug={card.shareSlug} firstName={user.firstName} />
    </div>
  );
}
