import { prisma } from "@/lib/prisma";
import { affiliateEarningsSummary } from "@/lib/affiliate";

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

export interface UserDirectoryEntry {
  id: string;
  email: string;
  firstName: string;
  createdAt: Date;
  isPremium: boolean;
  ltvCents: number;
  affiliateName: string | null;
  onlineNow: boolean;
}

/** Annuaire visiteurs pour le drill-down admin: email, LTV réelle, attribution affilié, présence en ligne. */
export async function getUserDirectory(): Promise<UserDirectoryEntry[]> {
  const since = new Date(Date.now() - ONLINE_WINDOW_MS);
  const [users, onlineUserIds, payments, conversions] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { subscription: true },
    }),
    prisma.pageView.findMany({
      where: { createdAt: { gte: since }, userId: { not: null } },
      select: { userId: true },
      distinct: ["userId"],
    }),
    prisma.payment.groupBy({ by: ["userId"], _sum: { amountCents: true } }),
    prisma.affiliateConversion.findMany({ select: { userId: true, affiliate: { select: { name: true } } } }),
  ]);

  const onlineSet = new Set(onlineUserIds.map((v) => v.userId));
  const ltvByUser = new Map(payments.map((p) => [p.userId, p._sum.amountCents ?? 0]));
  const affiliateByUser = new Map(conversions.map((c) => [c.userId, c.affiliate.name]));

  return users.map((u) => ({
    id: u.id,
    email: u.email,
    firstName: u.firstName,
    createdAt: u.createdAt,
    isPremium:
      u.subscription?.status === "ACTIVE" || (!!u.subscription?.bonusPremiumUntil && u.subscription.bonusPremiumUntil > new Date()),
    ltvCents: ltvByUser.get(u.id) ?? 0,
    affiliateName: affiliateByUser.get(u.id) ?? null,
    onlineNow: onlineSet.has(u.id),
  }));
}

export interface AffiliateDirectoryEntry {
  id: string;
  code: string;
  name: string;
  email: string;
  active: boolean;
  clickCount: number;
  conversionCount: number;
  pendingCents: number;
  payableCents: number;
  paidCents: number;
  bonusCents: number;
}

export async function getAffiliateDirectory(): Promise<AffiliateDirectoryEntry[]> {
  const affiliates = await prisma.affiliate.findMany({ orderBy: { createdAt: "desc" } });
  return Promise.all(
    affiliates.map(async (a) => {
      const summary = await affiliateEarningsSummary(a.id);
      return {
        id: a.id,
        code: a.code,
        name: a.name,
        email: a.email,
        active: a.active,
        clickCount: summary.clickCount,
        conversionCount: summary.conversionCount,
        pendingCents: summary.pendingCents,
        payableCents: summary.payableCents,
        paidCents: summary.paidCents,
        bonusCents: summary.bonusCents,
      };
    })
  );
}

export async function getAccessCodes() {
  return prisma.accessCode.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { affiliate: { select: { name: true } }, usedByUser: { select: { firstName: true, email: true } } },
  });
}

export async function getPayableConversions() {
  return prisma.affiliateConversion.findMany({
    where: { paidAt: null, payableAt: { lte: new Date() }, amountCents: { gt: 0 } },
    orderBy: { payableAt: "asc" },
    include: { affiliate: { select: { name: true, email: true } } },
  });
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
