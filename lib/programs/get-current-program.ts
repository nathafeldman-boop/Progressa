import { prisma } from "@/lib/prisma";
import { getCurrentWeekStart } from "@/lib/week";

export async function getCurrentWeeklyProgram(userId: string) {
  const weekStartDate = getCurrentWeekStart();
  return prisma.weeklyProgram.findUnique({
    where: { userId_weekStartDate: { userId, weekStartDate } },
    include: {
      sessions: {
        orderBy: { order: "asc" },
        include: {
          blocks: {
            orderBy: { order: "asc" },
            include: { exercise: true },
          },
        },
      },
    },
  });
}
