import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentInternalUser } from "@/lib/auth";
import { getProgramSessionForUser } from "@/lib/programs/get-session";
import { isPremiumActive, hasSkippedPaywall } from "@/lib/subscription";
import { getAgeCategory } from "@/lib/age-category";
import { POSITION_LABELS, WEEKDAY_LABELS } from "@/lib/labels";
import { SessionPlayer, type SessionBlockView } from "@/components/session/SessionPlayer";
import { getPersonalBests } from "@/lib/brian/service";
import { estimateMinimumSeconds } from "@/lib/pacing";

export default async function SeancePage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const user = await getCurrentInternalUser();
  if (!user) notFound();

  const [session, profile, subscription] = await Promise.all([
    getProgramSessionForUser(sessionId, user.id),
    prisma.playerProfile.findUnique({ where: { userId: user.id } }),
    prisma.subscription.findUnique({ where: { userId: user.id } }),
  ]);

  if (!session) notFound();

  const personalBests = await getPersonalBests(
    user.id,
    session.blocks.map((b) => b.exercise.id)
  );

  const premium = isPremiumActive(subscription);
  // Une séance appartenant déjà à ce joueur (getProgramSessionForUser scope
  // sur user.id) est jouable dès que le compte a dépassé le paywall — y
  // compris une séance ciblée gratuite (1/48h, voir entrainement-cible):
  // un joueur "Payer ultérieurement" doit pouvoir jouer la séance qu'il
  // vient de lancer, pas être renvoyé au paywall juste après.
  if (!premium && !hasSkippedPaywall(subscription)) redirect("/paywall");
  const ageCategory = profile ? getAgeCategory(profile.birthYear) : null;

  const chips = [
    profile ? POSITION_LABELS[profile.position] : null,
    ageCategory?.label ?? null,
    WEEKDAY_LABELS[session.dayOfWeek],
    profile?.matchDay === session.dayOfWeek ? "🚩 Jour de match — séance allégée" : null,
  ].filter((c): c is string => !!c);

  const blocks: SessionBlockView[] = session.blocks.map((block) => ({
    id: block.id,
    phase: block.phase,
    sets: block.sets,
    reps: block.reps,
    restSeconds: block.restSeconds,
    customInstruction: block.customInstruction,
    status: block.status,
    minimumSeconds: estimateMinimumSeconds(
      block.reps,
      block.sets,
      block.exercise.category,
      block.exercise.durationMinutes * 60
    ),
    exercise: {
      id: block.exercise.id,
      slug: block.exercise.slug,
      name: block.exercise.name,
      emoji: block.exercise.emoji,
      description: block.exercise.description,
      matchBenefit: block.exercise.matchBenefit,
      steps: block.exercise.steps,
      commonMistakes: block.exercise.commonMistakes,
      easyVariant: block.exercise.easyVariant,
      hardVariant: block.exercise.hardVariant,
      durationMinutes: block.exercise.durationMinutes,
      equipment: block.exercise.equipment,
      requiresPartner: block.exercise.requiresPartner,
      personalBest: (() => {
        const best = personalBests.get(block.exercise.id);
        return best ? { seconds: best.actualDurationSeconds, feltDifficulty: best.feltDifficulty } : null;
      })(),
    },
  }));

  return (
    <SessionPlayer
      sessionId={session.id}
      title={session.title}
      chips={chips}
      blocks={blocks}
      alreadyCompleted={session.status === "COMPLETED"}
      showPremiumBanner={!premium}
      defaultEquipment={profile?.equipment ?? []}
    />
  );
}
