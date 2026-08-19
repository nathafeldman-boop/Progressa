import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentInternalUser } from "@/lib/auth";
import { isPremiumActive } from "@/lib/subscription";
import { getAgeCategory } from "@/lib/age-category";
import { POSITION_LABELS } from "@/lib/labels";
import { Card, CardSubtitle, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PlayerCardView } from "@/components/card/PlayerCardView";
import { CalibratingCardTeaser } from "@/components/card/CalibratingCardTeaser";
import { ShareCardButton } from "@/components/card/ShareCardButton";
import { TargetedTrainingPicker } from "@/components/dashboard/TargetedTrainingPicker";
import { BrianMessageCard } from "@/components/brian/BrianMessageCard";
import { BrianAvatar } from "@/components/brian/BrianAvatar";
import { composeZeroOverallMessage } from "@/lib/brian/messages";
import type { PlayerCardStats } from "@/lib/player-card";

/**
 * "Progression": tout ce qui montre où en est le joueur au même endroit —
 * nombre d'entraînements, série, carte joueur complète — plutôt qu'éclaté
 * entre plusieurs onglets (Carte/Tests/Journal fusionnés ici, section 13
 * du cahier des charges carte joueur: "la carte comme élément central").
 */
export default async function ProgressionPage() {
  const user = await getCurrentInternalUser();
  if (!user) return null;

  const [profile, subscription, streak, card, completedCount, testCount, badgeCount] = await Promise.all([
    prisma.playerProfile.findUnique({ where: { userId: user.id } }),
    prisma.subscription.findUnique({ where: { userId: user.id } }),
    prisma.streakState.findUnique({ where: { userId: user.id } }),
    prisma.playerCard.findUnique({ where: { userId: user.id } }),
    prisma.programSession.count({ where: { status: "COMPLETED", weeklyProgram: { userId: user.id } } }),
    prisma.evaluationResult.count({ where: { userId: user.id } }),
    prisma.userBadge.count({ where: { userId: user.id } }),
  ]);

  const premium = isPremiumActive(subscription);
  const ageCategory = profile ? getAgeCategory(profile.birthYear) : null;
  const stats = card ? (card.stats as unknown as PlayerCardStats) : null;

  return (
    <div className="mx-auto max-w-md space-y-4 p-4">
      <h1 className="font-display text-2xl font-extrabold uppercase tracking-wide">Progression</h1>

      <div className="grid grid-cols-3 gap-2">
        <Card className="p-3 text-center">
          <p className="font-display text-xl font-extrabold text-[var(--color-primary-strong)]">{completedCount}</p>
          <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
            Séances
          </p>
        </Card>
        <Card className="p-3 text-center">
          <p className="font-display text-xl font-extrabold text-[var(--color-primary-strong)]">
            {streak?.currentStreak ?? 0}🔥
          </p>
          <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">Série</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="font-display text-xl font-extrabold text-[var(--color-primary-strong)]">{badgeCount}</p>
          <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
            Badges
          </p>
        </Card>
      </div>

      <div>
        {!premium ? (
          <Card className="p-6 text-center">
            <CardTitle>La carte joueur est une fonctionnalité Premium</CardTitle>
            <CardSubtitle className="mt-2">
              Passe tes tests d&apos;évaluation et débloque une vraie carte de stats à partager, façon jeu vidéo.
            </CardSubtitle>
            <Link href="/parametres/abonnement" className="mt-4 block">
              <Button className="w-full">Découvrir Premium</Button>
            </Link>
          </Card>
        ) : stats ? (
          <div className="space-y-3">
            <PlayerCardView
              firstName={user.firstName}
              positionLabel={profile ? POSITION_LABELS[profile.position] : ""}
              ageCategoryLabel={ageCategory?.label ?? null}
              country={profile?.country ?? null}
              department={profile?.district ?? null}
              niveauLabel={profile?.levelLabel ?? null}
              stats={stats}
              photoUrl={user.photoUrl}
            />
            <ShareCardButton shareSlug={card!.shareSlug} firstName={user.firstName} />
          </div>
        ) : (
          <div className="space-y-3">
            <BrianMessageCard category="RETENTION" text={composeZeroOverallMessage(user.firstName)} />
            <CalibratingCardTeaser firstName={user.firstName} />
            <Link href="/tests">
              <Button className="w-full">Passer mon test de départ</Button>
            </Link>
          </div>
        )}
      </div>

      <Link href="/dashboard" className="block">
        <Button className="w-full">Retour à mes séances</Button>
      </Link>

      <TargetedTrainingPicker />

      <div className="grid grid-cols-2 gap-3">
        <Link href="/classement">
          <Card className="flex h-full flex-col items-center gap-1 p-4 text-center">
            <BrianAvatar state="confident" size={40} />
            <CardTitle className="text-sm">Classement</CardTitle>
            <CardSubtitle className="text-xs">Vs. les autres joueurs</CardSubtitle>
          </Card>
        </Link>
        <Link href="/tests">
          <Card className="flex h-full flex-col items-center gap-1 p-4 text-center">
            <BrianAvatar state="thinking" size={40} />
            <CardTitle className="text-sm">Tests</CardTitle>
            <CardSubtitle className="text-xs">{testCount > 0 ? `${testCount} passés` : "Aucun test"}</CardSubtitle>
          </Card>
        </Link>
      </div>

      <Link href="/journal" className="block">
        <Card className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BrianAvatar state="idle" size={28} />
            <div>
              <CardTitle className="text-base">Journal</CardTitle>
              <CardSubtitle>Check-in, blessures, matchs, objectifs</CardSubtitle>
            </div>
          </div>
          <span className="text-xl">→</span>
        </Card>
      </Link>
    </div>
  );
}
