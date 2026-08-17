import { prisma } from "@/lib/prisma";

export async function getProgramSessionForUser(sessionId: string, userId: string) {
  const session = await prisma.programSession.findUnique({
    where: { id: sessionId },
    include: {
      weeklyProgram: true,
      blocks: {
        orderBy: { order: "asc" },
        include: { exercise: true },
      },
    },
  });

  if (!session || session.weeklyProgram.userId !== userId) return null;
  return session;
}
