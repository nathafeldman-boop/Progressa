import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentInternalUser } from "@/lib/auth";
import { isPremiumActive } from "@/lib/subscription";
import { getAgeCategory } from "@/lib/age-category";
import { POSITION_LABELS } from "@/lib/labels";
import { Card, CardSubtitle, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PlayerCardWidget } from "@/components/card/PlayerCardWidget";
import { CalibratingCardTeaser } from "@/components/card/CalibratingCardTeaser";
import { TargetedTrainingPicker } from "@/components/dashboard/TargetedTrainingPicker";
import { PerformanceTrends } from "@/components/progression/PerformanceTrends";
import { TrainingLog } from "@/components/progression/TrainingLog";
import { BrianMessageCard } from "@/components/brian/BrianMessageCard";
import { BrianAvatar } from "@/components/brian/BrianAvatar";
import { composeZeroOverallMessage } from "@/lib/brian/messages";
import type { PlayerCardStats } from "@/lib/player-card";
import type { EvaluationTestType } from "@prisma/client";

/**
 * "Progression": tout ce qui montre où en est le joueur au même endroit.
 * La carte est réduite à un résumé compact par défaut (elle ne doit plus
 * monopoliser l'écran) — le vrai centre de la page est l'activité réelle
 * du joueur: tendances de performance (tests) et journal de bord (séances).
 */
export default async function ProgressionPage() {
  const user = await getCurrentInternalUser();
  if (!user) return null;

  const [profile, subscription, streak, card, completedSessions, testResults, badgeCount] = await Promise.all([
    prisma.playerProfile.findUnique({ where: { userId: user.id } }),
    prisma.subscription.findUnique({ where: { userId: user.id } }),
    prisma.streakState.findUnique({ where: { userId: user.id } }),
    prisma.playerCard.findUnique({ where: { userId: user.id } }),
    prisma.programSession.findMany({
      where: { status: "COMPLETED", weeklyProgram: { userId: user.id } },
      orderBy: { completedAt: "desc" },
      take: 5,
      select: { id: true, title: true, completedAt: true, difficultyRating: true },
    }),
    prisma.evaluationResult.findMany({ where: { userId: user.id }, orderBy: { recordedAt: "asc" } }),
    prisma.userBadge.count({ where: { userId: user.id } }),
  ]);

  const premium = isPremiumActive(subscription);
  if (profile && !premium) redirect("/paywall");
  const ageCategory = profile ? getAgeCategory(profile.birthYear) : null;
  const stats = card ? (card.stats as unknown as PlayerCardStats) : null;
  const completedCount = await prisma.programSession.count({
    where: { status: "COMPLETED", weeklyProgram: { userId: user.id } },
  });

  const resultsByType: Partial<Record<EvaluationTestType, { value: number; recordedAt: Date }[]>> = {};
  for (const r of testResults) {
    (resultsByType[r.testType] ??= []).push({ value: r.value, recordedAt: r.recordedAt });
  }

  return (
    <div className="mx-auto max-w-md space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-extrabold uppercase tracking-wide">Progression</h1>
        <div className="flex gap-3 text-right">
          <div>
            <p className="font-display text-lg font-extrabold text-[var(--color-primary-strong)]">{completedCount}</p>
            <p className="text-[0.6rem] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">Séances</p>
          </div>
          <div>
            <p className="font-display text-lg font-extrabold text-[var(--color-primary-strong)]">
              {streak?.currentStreak ?? 0}🔥
            </p>
            <p className="text-[0.6rem] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">Série</p>
          </div>
          <div>
            <p className="font-display text-lg font-extrabold text-[var(--color-primary-strong)]">{badgeCount}</p>
            <p className="text-[0.6rem] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">Badges</p>
          </div>
        </div>
      </div>

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
        <PlayerCardWidget
          firstName={user.firstName}
          positionLabel={profile ? POSITION_LABELS[profile.position] : ""}
          ageCategoryLabel={ageCategory?.label ?? null}
          country={profile?.country ?? null}
          department={profile?.district ?? null}
          niveauLabel={profile?.levelLabel ?? null}
          stats={stats}
          photoUrl={user.photoUrl}
          shareSlug={card!.shareSlug}
        />
      ) : (
        <div className="space-y-3">
          <BrianMessageCard category="RETENTION" text={composeZeroOverallMessage(user.firstName)} />
          <CalibratingCardTeaser firstName={user.firstName} />
          <Link href="/tests">
            <Button className="w-full">Passer mon test de départ</Button>
          </Link>
        </div>
      )}

      <TrainingLog entries={completedSessions} />

      <PerformanceTrends resultsByType={resultsByType} />

      <Link href="/dashboard" className="block">
        <Button variant="secondary" className="w-full">
          Retour à mes séances
        </Button>
      </Link>

      <TargetedTrainingPicker position={profile?.position ?? null} />

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
            <CardSubtitle className="text-xs">{testResults.length > 0 ? `${testResults.length} passés` : "Aucun test"}</CardSubtitle>
          </Card>
        </Link>
      </div>
    </div>
  );
}
