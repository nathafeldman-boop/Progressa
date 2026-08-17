import { NextResponse } from "next/server";
import { z } from "zod";
import { EvaluationTestType } from "@prisma/client";
import { getCurrentInternalUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { nextEligibleDate, TEST_PROTOCOLS } from "@/lib/evaluation-tests";
import { computePlayerCardStats } from "@/lib/player-card";

const bodySchema = z.object({
  testType: z.enum(EvaluationTestType),
  value: z.number().positive(),
});

function randomShareSlug(): string {
  return Math.random().toString(36).slice(2, 10);
}

export async function POST(request: Request) {
  const user = await getCurrentInternalUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "invalid_payload" }, { status: 400 });

  const previousResults = await prisma.evaluationResult.findMany({
    where: { userId: user.id, testType: parsed.data.testType },
    orderBy: { recordedAt: "desc" },
  });

  const lastResult = previousResults[0];
  if (lastResult) {
    const eligibleAt = nextEligibleDate(lastResult.recordedAt);
    if (eligibleAt.getTime() > Date.now()) {
      return NextResponse.json({ error: "cooldown", eligibleAt }, { status: 429 });
    }
  }

  const protocol = TEST_PROTOCOLS[parsed.data.testType];

  await prisma.evaluationResult.create({
    data: { userId: user.id, testType: parsed.data.testType, value: parsed.data.value, unit: protocol.unit },
  });

  const isFirstTestEver = (await prisma.evaluationResult.count({ where: { userId: user.id } })) === 1;
  const awardedBadges: string[] = [];

  if (isFirstTestEver) {
    try {
      const badge = await prisma.badge.findUnique({ where: { slug: "premier-test" } });
      if (badge) {
        await prisma.userBadge.create({ data: { userId: user.id, badgeId: badge.id } });
        awardedBadges.push("premier-test");
      }
    } catch {
      // déjà attribué
    }
  } else if (lastResult) {
    const improved = protocol.lowerIsBetter ? parsed.data.value < lastResult.value : parsed.data.value > lastResult.value;
    if (improved) {
      try {
        const badge = await prisma.badge.findUnique({ where: { slug: "progression-mesuree" } });
        if (badge) {
          await prisma.userBadge.create({ data: { userId: user.id, badgeId: badge.id } });
          awardedBadges.push("progression-mesuree");
        }
      } catch {
        // déjà attribué
      }
    }
  }

  const allResults = await prisma.evaluationResult.findMany({ where: { userId: user.id } });
  const stats = computePlayerCardStats(allResults);
  const statsJson = JSON.parse(JSON.stringify(stats));

  const existingCard = await prisma.playerCard.findUnique({ where: { userId: user.id } });
  await prisma.playerCard.upsert({
    where: { userId: user.id },
    create: { userId: user.id, stats: statsJson, shareSlug: existingCard?.shareSlug ?? randomShareSlug() },
    update: { stats: statsJson },
  });

  return NextResponse.json({ ok: true, awardedBadges, stats });
}
