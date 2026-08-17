import { prisma } from "@/lib/prisma";
import type { PreviousWeekSummary } from "@/lib/ai/user-prompt";

export async function getPreviousWeekSummary(userId: string, previousWeekStart: Date): Promise<PreviousWeekSummary | null> {
  const program = await prisma.weeklyProgram.findUnique({
    where: { userId_weekStartDate: { userId, weekStartDate: previousWeekStart } },
    include: { sessions: true },
  });
  if (!program || program.sessions.length === 0) return null;

  const completed = program.sessions.filter((s) => s.status === "COMPLETED");
  const skipped = program.sessions.filter((s) => s.status === "SKIPPED");
  const ratings = completed.map((s) => s.difficultyRating).filter((r): r is number => r != null);

  return {
    sessionsPlanned: program.sessions.length,
    sessionsCompleted: completed.length,
    sessionsSkipped: skipped.length,
    averageDifficulty: ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null,
  };
}
