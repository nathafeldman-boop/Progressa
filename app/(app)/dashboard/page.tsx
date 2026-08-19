import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentInternalUser } from "@/lib/auth";
import { getCurrentWeeklyProgram } from "@/lib/programs/get-current-program";
import { isPremiumActive } from "@/lib/subscription";
import { Card, CardSubtitle, CardTitle } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { RegenerateButton } from "@/components/dashboard/RegenerateButton";
import { DailyObjectives } from "@/components/dashboard/DailyObjectives";
import { TargetedTrainingPicker } from "@/components/dashboard/TargetedTrainingPicker";
import { POSITION_LABELS } from "@/lib/labels";
import { getAgeCategory } from "@/lib/age-category";
import { ensureTodayObjectives } from "@/lib/brian/daily-objectives";
import { BrianAvatar } from "@/components/brian/BrianAvatar";
import { BrianTip } from "@/components/brian/BrianTip";
import { todayAsWeekday } from "@/lib/week";

export default async function DashboardPage() {
  const user = await getCurrentInternalUser();

  if (!user) {
    return (
      <div className="mx-auto max-w-md p-4">
        <Card className="p-6 text-center">
          <CardTitle>Bienvenue !</CardTitle>
          <CardSubtitle className="mt-2">Finalise ton profil pour débloquer ton premier programme.</CardSubtitle>
          <Link href="/onboarding" className="mt-4 block">
            <Button className="w-full">Compléter mon profil</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const [profile, subscription, streak, program, playerCard, objectives] = await Promise.all([
    prisma.playerProfile.findUnique({ where: { userId: user.id } }),
    prisma.subscription.findUnique({ where: { userId: user.id } }),
    prisma.streakState.findUnique({ where: { userId: user.id } }),
    getCurrentWeeklyProgram(user.id),
    prisma.playerCard.findUnique({ where: { userId: user.id } }),
    ensureTodayObjectives(user.id),
  ]);

  const premium = isPremiumActive(subscription);
  const ageCategory = profile ? getAgeCategory(profile.birthYear) : null;
  const cardStats = playerCard?.stats as { overall: number; rankTier?: string } | undefined;
  const todaySession = program?.sessions.find((s) => s.dayOfWeek === todayAsWeekday()) ?? null;

  return (
    <div className="mx-auto max-w-md space-y-4 p-4">
      <div>
        <h1 className="flex items-center gap-2 font-display text-2xl font-extrabold uppercase tracking-wide">
          Salut {user.firstName} <BrianAvatar state="happy" size={28} />
        </h1>
        {profile && (
          <div className="mt-2 flex flex-wrap gap-2">
            {ageCategory && <Chip>{ageCategory.label}</Chip>}
            <Chip>{POSITION_LABELS[profile.position]}</Chip>
            {streak && streak.currentStreak > 0 && <Chip>🔥 Série de {streak.currentStreak}</Chip>}
          </div>
        )}
      </div>

      {cardStats && (
        <div className="grid grid-cols-2 gap-3">
          <Link href="/progression">
            <Card className="flex h-full items-center justify-between gap-2 border-[var(--color-primary)]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">Carte</p>
                <p className="font-display text-xl font-extrabold text-[var(--color-primary-strong)]">
                  {cardStats.overall} OVR
                </p>
              </div>
              <span className="text-2xl">🃏</span>
            </Card>
          </Link>
          <Link href="/classement">
            <Card className="flex h-full items-center justify-between gap-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                  Classement
                </p>
                <p className="font-display text-sm font-bold text-[var(--color-text)]">Voir</p>
              </div>
              <BrianAvatar state="confident" size={32} />
            </Card>
          </Link>
        </div>
      )}

      <BrianTip
        tipKey="dashboard-intro"
        text="Ta séance du jour est ici, adaptée à ce que tu dois travailler. Une nouvelle génération se débloque chaque jour à 8h si tu veux la changer."
      />

      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold uppercase tracking-wide">Aujourd&apos;hui</h2>
        <RegenerateButton />
      </div>

      {!todaySession ? (
        <Card className="p-6 text-center">
          <CardSubtitle>
            {program ? "Pas de séance prévue aujourd'hui — jour de repos." : "Aucun programme généré pour l'instant."}
          </CardSubtitle>
        </Card>
      ) : (
        <Link href={`/seance/${todaySession.id}`}>
          <Card className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base">{todaySession.title}</CardTitle>
              <div className="mt-1 flex flex-wrap gap-1">
                {todaySession.isMatchAdjacent && <Chip>🩹 Séance légère</Chip>}
                {todaySession.status === "COMPLETED" && <Chip>✅ Terminée</Chip>}
                {todaySession.status === "SKIPPED" && <Chip>⏭️ Sautée</Chip>}
              </div>
            </div>
            <BrianAvatar state="motivated" size={32} />
          </Card>
        </Link>
      )}

      <DailyObjectives objectives={objectives} />

      <TargetedTrainingPicker />

      {!premium && (
        <Card className="border-[var(--color-primary)] bg-[var(--color-primary-soft)]">
          <CardTitle className="text-[var(--color-primary-strong)]">Passe Premium</CardTitle>
          <CardSubtitle className="mt-1 text-[var(--color-primary-strong)]">
            Jusqu&apos;à 3 séances/semaine, programme 100% personnalisé, tests d&apos;évaluation et carte joueur.
          </CardSubtitle>
          <Link href="/parametres/abonnement" className="mt-3 block">
            <Button className="w-full">Découvrir Premium</Button>
          </Link>
        </Card>
      )}
    </div>
  );
}
