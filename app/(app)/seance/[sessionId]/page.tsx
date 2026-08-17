import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentInternalUser } from "@/lib/auth";
import { getProgramSessionForUser } from "@/lib/programs/get-session";
import { isPremiumActive } from "@/lib/subscription";
import { getAgeCategory } from "@/lib/age-category";
import { POSITION_LABELS, WEEKDAY_LABELS } from "@/lib/labels";
import { SessionPlayer, type SessionBlockView } from "@/components/session/SessionPlayer";

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

  const premium = isPremiumActive(subscription);
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
    exercise: {
      name: block.exercise.name,
      emoji: block.exercise.emoji,
      description: block.exercise.description,
      matchBenefit: block.exercise.matchBenefit,
      steps: block.exercise.steps,
      commonMistakes: block.exercise.commonMistakes,
      easyVariant: block.exercise.easyVariant,
      hardVariant: block.exercise.hardVariant,
      durationMinutes: block.exercise.durationMinutes,
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
    />
  );
}
