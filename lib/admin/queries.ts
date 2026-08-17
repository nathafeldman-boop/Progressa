import { prisma } from "@/lib/prisma";

const ONLINE_WINDOW_MS = 5 * 60 * 1000;

export async function getOnlineNow() {
  const since = new Date(Date.now() - ONLINE_WINDOW_MS);
  const views = await prisma.pageView.findMany({
    where: { createdAt: { gte: since } },
    orderBy: { createdAt: "desc" },
    include: { user: { select: { firstName: true } } },
    take: 200,
  });

  const byVisitor = new Map<string, { label: string; path: string; at: Date }>();
  for (const view of views) {
    const key = view.userId ?? view.anonId;
    if (!byVisitor.has(key)) {
      byVisitor.set(key, {
        label: view.user?.firstName ?? `anonyme·${view.anonId.slice(0, 6)}`,
        path: view.path,
        at: view.createdAt,
      });
    }
  }
  return Array.from(byVisitor.values());
}

export async function getGlobalStats() {
  const [totalUsers, activeSubs, bonusSubsRaw, totalSessions, completedSessions] = await Promise.all([
    prisma.user.count(),
    prisma.subscription.count({ where: { status: "ACTIVE" } }),
    prisma.subscription.findMany({ where: { bonusPremiumUntil: { gt: new Date() } }, select: { userId: true, status: true } }),
    prisma.programSession.count(),
    prisma.programSession.count({ where: { status: "COMPLETED" } }),
  ]);

  const bonusOnlyPremium = bonusSubsRaw.filter((s) => s.status !== "ACTIVE").length;
  const premiumCount = activeSubs + bonusOnlyPremium;

  return {
    totalUsers,
    premiumCount,
    freeCount: Math.max(totalUsers - premiumCount, 0),
    totalSessions,
    completedSessions,
    completionRate: totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0,
  };
}

export async function getOnboardingFunnel() {
  const events = await prisma.onboardingFunnelEvent.groupBy({
    by: ["screen", "screenKey", "action"],
    _count: { _all: true },
  });

  const screens = new Map<number, { screenKey: string; viewed: number; completed: number; skipped: number }>();
  for (const e of events) {
    const entry = screens.get(e.screen) ?? { screenKey: e.screenKey, viewed: 0, completed: 0, skipped: 0 };
    if (e.action === "VIEWED") entry.viewed += e._count._all;
    if (e.action === "COMPLETED") entry.completed += e._count._all;
    if (e.action === "SKIPPED") entry.skipped += e._count._all;
    screens.set(e.screen, entry);
  }

  return Array.from(screens.entries())
    .sort(([a], [b]) => a - b)
    .map(([screen, data]) => ({ screen, ...data }));
}

export async function getFeatureUsage() {
  const [evaluationResults, testimonials, matchLogs, checkins, badges] = await Promise.all([
    prisma.evaluationResult.count(),
    prisma.testimonial.count(),
    prisma.matchLog.count(),
    prisma.dailyCheckin.count(),
    prisma.userBadge.count(),
  ]);
  return { evaluationResults, testimonials, matchLogs, checkins, badges };
}
