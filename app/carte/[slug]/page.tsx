import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAgeCategory } from "@/lib/age-category";
import { POSITION_LABELS } from "@/lib/labels";
import { PlayerCardView } from "@/components/card/PlayerCardView";
import type { PlayerCardStats } from "@/lib/player-card";
import { APP_NAME } from "@/lib/app-config";

export default async function PublicPlayerCardPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const card = await prisma.playerCard.findUnique({
    where: { shareSlug: slug },
    include: { user: { include: { profile: true } } },
  });
  if (!card) notFound();

  const profile = card.user.profile;
  const ageCategory = profile ? getAgeCategory(profile.birthYear) : null;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
      <PlayerCardView
        firstName={card.user.firstName}
        positionLabel={profile ? POSITION_LABELS[profile.position] : ""}
        ageCategoryLabel={ageCategory?.label ?? null}
        stats={card.stats as unknown as PlayerCardStats}
      />
      <p className="text-xs text-[var(--color-text-muted)]">Carte joueur générée sur {APP_NAME}</p>
    </div>
  );
}
