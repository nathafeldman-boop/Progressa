import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentInternalUser } from "@/lib/auth";
import { getAgeCategory } from "@/lib/age-category";
import { POSITION_LABELS } from "@/lib/labels";
import { STAT_AXES, STAT_LABELS } from "@/lib/brian/types";
import type { PlayerCardStats } from "@/lib/player-card";
import { CardRevealSequence } from "@/components/onboarding/CardRevealSequence";

/**
 * Moment émotionnel principal du funnel: le joueur vient de finir son test
 * initial, on révèle sa toute première carte avant de l'amener au paywall.
 * Jamais atteint sans stats réelles — un joueur qui arrive ici sans test
 * complet est renvoyé le repasser plutôt que de voir une carte vide.
 */
export default async function CardRevealPage() {
  const user = await getCurrentInternalUser();
  if (!user) redirect("/connexion");

  const [profile, card] = await Promise.all([
    prisma.playerProfile.findUnique({ where: { userId: user.id } }),
    prisma.playerCard.findUnique({ where: { userId: user.id } }),
  ]);

  if (!profile || !card) redirect("/onboarding/brian");

  const stats = card.stats as unknown as PlayerCardStats;
  if (!stats.skills || Object.keys(stats.skills).length === 0) redirect("/tests");

  const ageCategory = getAgeCategory(profile.birthYear);

  let strongestAxis = STAT_AXES[0];
  let weakestAxis = STAT_AXES[0];
  for (const axis of STAT_AXES) {
    const label = STAT_LABELS[axis];
    const value = stats.skills[label] ?? 0;
    if (value > (stats.skills[STAT_LABELS[strongestAxis]] ?? 0)) strongestAxis = axis;
    if (value < (stats.skills[STAT_LABELS[weakestAxis]] ?? 0)) weakestAxis = axis;
  }

  return (
    <CardRevealSequence
      firstName={user.firstName}
      positionLabel={POSITION_LABELS[profile.position]}
      ageCategoryLabel={ageCategory.label}
      country={profile.country}
      department={profile.district}
      niveauLabel={profile.levelLabel}
      photoUrl={user.photoUrl}
      stats={stats}
      strongestLabel={STAT_LABELS[strongestAxis]}
      strongestValue={stats.skills[STAT_LABELS[strongestAxis]] ?? 0}
      weakestLabel={STAT_LABELS[weakestAxis]}
    />
  );
}
