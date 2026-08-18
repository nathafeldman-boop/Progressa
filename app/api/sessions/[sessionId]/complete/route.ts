import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentInternalUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateStreakOnCompletion } from "@/lib/streak";
import { awardCompletionBadges } from "@/lib/badges";
import { recordSessionSummary } from "@/lib/brian/service";
import { POSITION_LABELS } from "@/lib/labels";

const bodySchema = z.object({
  difficultyRating: z.number().int().min(1).max(5),
  recoveryNote: z.string().max(500).optional(),
});

export async function POST(request: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  const user = await getCurrentInternalUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const { sessionId } = await params;
  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "invalid_payload" }, { status: 400 });

  const session = await prisma.programSession.findUnique({
    where: { id: sessionId },
    include: { weeklyProgram: true },
  });
  if (!session || session.weeklyProgram.userId !== user.id) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const completedAt = new Date();
  await prisma.programSession.update({
    where: { id: sessionId },
    data: {
      status: "COMPLETED",
      completedAt,
      difficultyRating: parsed.data.difficultyRating,
      recoveryNote: parsed.data.recoveryNote,
    },
  });

  const streak = await updateStreakOnCompletion(user.id, completedAt);

  const totalCompleted = await prisma.programSession.count({
    where: { status: "COMPLETED", weeklyProgram: { userId: user.id } },
  });
  const awardedBadges = await awardCompletionBadges(user.id, totalCompleted, streak.currentStreak);
  const summary = await recordSessionSummary({ userId: user.id, sessionId });

  // recordBlockTelemetry a déjà resynchronisé PlayerCard après chaque bloc de
  // cette séance — on relit juste l'état final, pas de recalcul ici.
  const [card, profile] = await Promise.all([
    prisma.playerCard.findUnique({ where: { userId: user.id } }),
    prisma.playerProfile.findUnique({ where: { userId: user.id } }),
  ]);

  return NextResponse.json({
    streak,
    awardedBadges,
    totalCompleted,
    summary,
    card: card?.stats ?? null,
    firstName: user.firstName,
    positionLabel: profile ? POSITION_LABELS[profile.position] : "",
  });
}
