import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthorizedCronRequest } from "@/lib/cron-auth";
import { getCurrentWeekStart } from "@/lib/week";
import { getPreviousWeekSummary } from "@/lib/programs/get-previous-week-summary";
import { pickTargetWeekDays } from "@/lib/scheduling";
import { sessionCountForTier, isPremiumActive } from "@/lib/subscription";
import { generateWeeklyProgram } from "@/lib/ai/generate-program";
import { persistWeeklyProgram } from "@/lib/programs/persist-weekly-program";

/**
 * Génération hebdomadaire automatique (section 6.2). Traite chaque joueur
 * indépendamment: l'échec d'un joueur ne doit jamais bloquer les autres.
 */
export async function GET(request: Request) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const weekStartDate = getCurrentWeekStart();
  const previousWeekStart = new Date(weekStartDate.getTime() - 7 * 24 * 60 * 60 * 1000);

  const profiles = await prisma.playerProfile.findMany({ include: { user: true } });

  let generated = 0;
  let skipped = 0;
  let failed = 0;

  for (const profile of profiles) {
    try {
      const already = await prisma.weeklyProgram.findUnique({
        where: { userId_weekStartDate: { userId: profile.userId, weekStartDate } },
      });
      if (already) {
        skipped++;
        continue;
      }

      const [subscription, unresolvedPain, previousWeek] = await Promise.all([
        prisma.subscription.findUnique({ where: { userId: profile.userId } }),
        prisma.painLog.findMany({ where: { userId: profile.userId, status: "UNRESOLVED" } }),
        getPreviousWeekSummary(profile.userId, previousWeekStart),
      ]);

      const sessionCount = sessionCountForTier(subscription);
      const { targetWeekDays, matchAdjacentDays } = pickTargetWeekDays(sessionCount, profile.matchDay);

      const result = await generateWeeklyProgram({
        firstName: profile.user.firstName,
        birthYear: profile.birthYear,
        position: profile.position,
        country: profile.country,
        levelLabel: profile.levelLabel,
        heightCm: profile.heightCm,
        weightKg: profile.weightKg,
        clubSessionsPerWeek: profile.clubSessionsPerWeek,
        matchDay: profile.matchDay,
        equipment: profile.equipment,
        objective: profile.objective,
        weakPointNote: profile.weakPointNote,
        unresolvedPain: unresolvedPain.map((p) => ({ bodyPart: p.bodyPart, note: p.note })),
        previousWeek,
        sessionCount,
        targetWeekDays,
        matchAdjacentDays,
        isPremium: isPremiumActive(subscription),
      });

      await persistWeeklyProgram(profile.userId, weekStartDate, result.program, result.source, result.rawModelOutput);
      generated++;
    } catch (err) {
      failed++;
      console.error(`[cron/weekly-programs] failed for user ${profile.userId}`, err);
    }
  }

  return NextResponse.json({ generated, skipped, failed, total: profiles.length });
}
