import Link from "next/link";
import { redirect } from "next/navigation";
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
import { DashboardHero } from "@/components/dashboard/DashboardHero";
import { POSITION_LABELS } from "@/lib/labels";
import { getAgeCategory } from "@/lib/age-category";
import { ensureTodayObjectives } from "@/lib/brian/daily-objectives";
import { RankCardBadge } from "@/components/card/RankCardBadge";
import { todayAsWeekday } from "@/lib/week";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ erreur?: string }> }) {
  const { erreur } = await searchParams;
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

  const profile = await prisma.playerProfile.findUnique({ where: { userId: user.id } });
  // Un compte authentifié sans profil est un onboarding abandonné en cours
  // de route (ex: session coupée avant la fin) — le renvoyer ici plutôt
  // que de lui montrer un tableau de bord vide (pas de test, pas de carte)
  // qui l'amenait jusqu'au paywall sans jamais avoir vu la valeur du produit.
  if (!profile) redirect("/onboarding");

  const [subscription, streak, program, playerCard, objectives] = await Promise.all([
    prisma.subscription.findUnique({ where: { userId: user.id } }),
    prisma.streakState.findUnique({ where: { userId: user.id } }),
    getCurrentWeeklyProgram(user.id),
    prisma.playerCard.findUnique({ where: { userId: user.id } }),
    ensureTodayObjectives(user.id),
  ]);

  const premium = isPremiumActive(subscription);
  // Hard paywall: un profil sans abonnement actif n'accède pas au tableau de bord.
  if (!premium) redirect("/paywall");
  const ageCategory = getAgeCategory(profile.birthYear);
  const cardStats = playerCard?.stats as { overall: number; rankTier?: string; rankKey?: string } | undefined;
  const todaySession = program?.sessions.find((s) => s.dayOfWeek === todayAsWeekday()) ?? null;
  const isMatchDayToday = !!profile.matchDay && profile.matchDay === todayAsWeekday();

  return (
    <div className="mx-auto max-w-md space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-base font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
          Salut {user.firstName}
        </h1>
        <div className="flex flex-wrap gap-1.5">
          <Chip>{ageCategory.label}</Chip>
          <Chip>{POSITION_LABELS[profile.position]}</Chip>
        </div>
      </div>

      <DashboardHero
        todaySession={todaySession}
        cardStats={cardStats ? { overall: cardStats.overall, rankTier: cardStats.rankTier } : null}
        streakCount={streak?.currentStreak ?? 0}
        hasProgram={!!program}
        firstName={user.firstName}
        isMatchDayToday={isMatchDayToday}
      />

      <div className="flex items-center justify-between px-1">
        <div className="flex gap-4">
          {cardStats && (
            <Link href="/progression" className="flex items-center gap-1.5 text-sm font-semibold text-[var(--color-text)]">
              <RankCardBadge rankKey={cardStats.rankKey} size={18} />
              Ma carte
            </Link>
          )}
          <Link href="/classement" className="flex items-center gap-1.5 text-sm font-semibold text-[var(--color-text)]">
            <span aria-hidden className="h-[18px] w-[18px] rounded-full bg-[var(--color-primary-soft)]" />
            Classement
          </Link>
        </div>
        <RegenerateButton />
      </div>

      {erreur === "entrainement-cible-indisponible" && (
        <Card className="border-[var(--color-danger)] bg-[var(--color-danger)]/5">
          <CardSubtitle className="text-[var(--color-danger)]">
            Pas assez d&apos;exercices disponibles pour ce besoin avec ton profil actuel (poste, matériel) —
            essaie un autre thème d&apos;entraînement ciblé, ou{" "}
            <Link href="/parametres/materiel" className="underline">
              mets à jour ton matériel
            </Link>
            .
          </CardSubtitle>
        </Card>
      )}

      <DailyObjectives objectives={objectives} />

      <TargetedTrainingPicker position={profile.position} />

      <Link href="/exercices" className="block">
        <Card className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base">Bibliothèque d&apos;exercices</CardTitle>
            <CardSubtitle className="mt-0.5">Tout le catalogue, classé par catégorie.</CardSubtitle>
          </div>
          <span className="text-[var(--color-text-muted)]">→</span>
        </Card>
      </Link>
    </div>
  );
}
