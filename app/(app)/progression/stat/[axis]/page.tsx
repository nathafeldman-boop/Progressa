import { notFound } from "next/navigation";
import Link from "next/link";
import type { StatAxis } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentInternalUser } from "@/lib/auth";
import { isPremiumActive } from "@/lib/subscription";
import { filterCatalogForProfile } from "@/lib/ai/catalog-filter";
import { toAxisValues } from "@/lib/brian/service";
import { recommendExercisesForAxis } from "@/lib/brian/stat-recommendations";
import { STAT_AXES, STAT_LABELS } from "@/lib/brian/types";
import { THEME_LABELS, type TrainingTheme } from "@/lib/programs/build-targeted-session";
import { isNeedAvailableForPosition } from "@/lib/exercises/needs";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const NEED_FOR_AXIS: Partial<Record<StatAxis, TrainingTheme>> = {
  VITESSE: "vitesse",
  TIR: "tir",
  PASSE: "dribble",
  CONDUITE: "dribble",
  DEFENSE: "defense",
  PHYSIQUE: "muscu",
};

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

function thirtyDaysAgo(): Date {
  return new Date(Date.now() - THIRTY_DAYS_MS);
}

export default async function StatDetailPage({ params }: { params: Promise<{ axis: string }> }) {
  const { axis: rawAxis } = await params;
  const axis = rawAxis.toUpperCase() as StatAxis;
  if (!STAT_AXES.includes(axis)) notFound();

  const user = await getCurrentInternalUser();
  if (!user) notFound();

  const [profile, subscription, statState, recentDeltas] = await Promise.all([
    prisma.playerProfile.findUnique({ where: { userId: user.id } }),
    prisma.subscription.findUnique({ where: { userId: user.id } }),
    prisma.playerStatState.findUnique({ where: { userId: user.id } }),
    prisma.statDelta.findMany({
      where: { userId: user.id, axis, createdAt: { gte: thirtyDaysAgo() } },
      select: { delta: true },
    }),
  ]);

  if (!profile || !statState) notFound();

  const value = toAxisValues(statState)[axis];
  const trend = recentDeltas.reduce((sum, d) => sum + d.delta, 0);

  const premium = isPremiumActive(subscription);
  const catalog = filterCatalogForProfile({
    birthYear: profile.birthYear,
    position: profile.position,
    equipment: profile.equipment,
    isPremium: premium,
  });
  const recommended = recommendExercisesForAxis(catalog, axis);

  const need = NEED_FOR_AXIS[axis];
  const needAvailable = need ? isNeedAvailableForPosition(need, profile.position) : false;

  return (
    <div className="mx-auto max-w-md space-y-4 p-4 pb-10">
      <Link href="/progression" className="text-sm font-semibold text-[var(--color-text-muted)] underline">
        ← Retour
      </Link>

      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-primary-strong)]">Analyse de stat</p>
        <h1 className="mt-1 font-display text-3xl font-extrabold uppercase tracking-wide">{STAT_LABELS[axis]}</h1>
      </div>

      <Card className="text-center">
        <p className="font-display text-5xl font-extrabold text-[var(--color-primary-strong)]">{value}</p>
        <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">sur 99</p>
        <p className="mt-3 text-sm text-[var(--color-text)]">
          {trend > 0
            ? `+${trend} sur les 30 derniers jours — tu progresses vraiment sur cet axe.`
            : trend < 0
              ? `${trend} sur les 30 derniers jours — normal après une pause ou une séance ratée, ça se rattrape vite.`
              : "Aucun changement mesuré ces 30 derniers jours. C'est peut-être le moment de cibler cet axe."}
        </p>
      </Card>

      {need && needAvailable && (
        <Link href={`/entrainement-cible/${need}`} className="block">
          <Button className="w-full">Lancer une séance {THEME_LABELS[need].toLowerCase()}</Button>
        </Link>
      )}

      <div>
        <CardTitle className="text-base">Les exercices qui font vraiment progresser cet axe</CardTitle>
        <div className="mt-3 space-y-2">
          {recommended.length === 0 ? (
            <Card>
              <p className="text-sm text-[var(--color-text-muted)]">
                Aucun exercice débloqué pour ce profil ne contribue directement à cet axe pour l&apos;instant.
              </p>
            </Card>
          ) : (
            recommended.map((exercise) => (
              <Card key={exercise.slug}>
                <p className="font-semibold">
                  {exercise.emoji} {exercise.name}
                </p>
                <p className="mt-1 text-sm text-[var(--color-text-muted)]">{exercise.matchBenefit}</p>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
