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
    // Abonnement Stripe ACTIVE uniquement — exclut tout premium obtenu via
    // bonusPremiumUntil (code d'accès, code d'affilié utilisé comme code
    // d'accès, bonus de parrainage). `premiumCount` reste utile pour "qui a
    // accès à premium en ce moment", mais ce n'est jamais une conversion
    // payante réelle — les deux métriques répondent à des questions différentes.
    realPremiumCount: activeSubs,
    freeCount: Math.max(totalUsers - premiumCount, 0),
    totalSessions,
    completedSessions,
    completionRate: totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0,
  };
}

/**
 * anonId ayant un jour été rattachés à un compte connecté (PageView avec
 * userId non nul pour ce même anonId, stocké côté client en localStorage —
 * stable d'une page à l'autre, y compris avant/après connexion). Un
 * crawler (Googlebot et consorts exécutent le JS d'/onboarding, route
 * publique) génère un anonId neuf à chaque passage qui ne se connecte
 * jamais à rien — sans ce filtre, le funnel confond le vrai abandon humain
 * avec du bruit de robots.
 */
async function getRegisteredAnonIds(): Promise<string[]> {
  const rows = await prisma.pageView.findMany({
    where: { userId: { not: null } },
    select: { anonId: true },
    distinct: ["anonId"],
  });
  return rows.map((r) => r.anonId);
}

export async function getOnboardingFunnel() {
  const registeredAnonIds = await getRegisteredAnonIds();

  const events = await prisma.onboardingFunnelEvent.groupBy({
    by: ["screen", "screenKey", "action"],
    where: { anonId: { in: registeredAnonIds } },
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

/**
 * Vue détaillée d'un joueur pour le drill-down admin: parcours complet
 * (pages vues + clics, dans l'ordre), réponses d'onboarding, séances,
 * tests, paiements — tout ce qui répond à "je clique sur lui, je veux
 * tout voir".
 */
export async function getUserDetail(userId: string) {
  const [user, pageViews, clickEvents, sessions, evaluationResults, payments, affiliateConversion] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true, subscription: true, playerCard: true },
    }),
    prisma.pageView.findMany({ where: { userId }, orderBy: { createdAt: "asc" }, take: 300 }),
    prisma.clickEvent.findMany({ where: { userId }, orderBy: { createdAt: "asc" }, take: 200 }),
    prisma.programSession.findMany({
      where: { weeklyProgram: { userId } },
      orderBy: { dayOfWeek: "asc" },
      include: { _count: { select: { blocks: true } } },
    }),
    prisma.evaluationResult.findMany({ where: { userId }, orderBy: { recordedAt: "desc" } }),
    prisma.payment.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }),
    prisma.affiliateConversion.findFirst({ where: { userId }, include: { affiliate: { select: { name: true, code: true } } } }),
  ]);

  if (!user) return null;

  const since = new Date(Date.now() - ONLINE_WINDOW_MS);
  const onlineNow = pageViews.some((v) => v.createdAt >= since);
  const completedSessions = sessions.filter((s) => s.status === "COMPLETED").length;
  const ltvCents = payments.reduce((sum, p) => sum + p.amountCents, 0);

  // Fusionne pages vues et clics en une seule timeline chronologique — c'est
  // le "je vois tout ce qu'ils vont faire depuis la LP" demandé.
  const timeline = [
    ...pageViews.map((v) => ({ type: "view" as const, at: v.createdAt, label: v.path, referrer: v.referrer })),
    ...clickEvents.map((c) => ({ type: "click" as const, at: c.createdAt, label: c.label, referrer: c.path })),
  ].sort((a, b) => a.at.getTime() - b.at.getTime());

  return {
    user,
    onlineNow,
    ltvCents,
    sessions,
    completedSessions,
    evaluationResults,
    payments,
    affiliateConversion,
    timeline,
  };
}

export interface SignupDayBucket {
  date: string;
  free: number;
  premium: number;
}

/**
 * Inscriptions par jour sur la fenêtre choisie, réparties gratuit/premium
 * selon le statut ACTUEL de l'abonné (pas son statut au jour J — la
 * question posée est "sur les gens inscrits ce jour-là, combien sont
 * premium aujourd'hui", cohérent avec le compte premium/gratuit affiché
 * ailleurs dans ce dashboard). `rangeDays` null = depuis l'inscription la
 * plus ancienne (case "Tout").
 */
export async function getSignupsTimeseries(rangeDays: number | null): Promise<SignupDayBucket[]> {
  const now = new Date();
  let since: Date;
  if (rangeDays) {
    since = new Date(now.getTime() - rangeDays * 24 * 60 * 60 * 1000);
  } else {
    const earliest = await prisma.user.findFirst({ orderBy: { createdAt: "asc" }, select: { createdAt: true } });
    since = earliest?.createdAt ?? now;
  }
  since.setHours(0, 0, 0, 0);

  const users = await prisma.user.findMany({
    where: { createdAt: { gte: since } },
    select: { createdAt: true, subscription: { select: { status: true, bonusPremiumUntil: true } } },
  });

  const buckets = new Map<string, { free: number; premium: number }>();
  for (const u of users) {
    const key = u.createdAt.toISOString().slice(0, 10);
    const isPremium = u.subscription?.status === "ACTIVE" || (!!u.subscription?.bonusPremiumUntil && u.subscription.bonusPremiumUntil > now);
    const entry = buckets.get(key) ?? { free: 0, premium: 0 };
    if (isPremium) entry.premium += 1;
    else entry.free += 1;
    buckets.set(key, entry);
  }

  // Comble les jours sans inscription avec 0 — une vraie courbe continue,
  // jamais des points reliés en sautant des jours silencieux.
  const days: SignupDayBucket[] = [];
  const cursor = new Date(since);
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  while (cursor <= today) {
    const key = cursor.toISOString().slice(0, 10);
    const entry = buckets.get(key) ?? { free: 0, premium: 0 };
    days.push({ date: key, ...entry });
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

export interface ReviewsSummary {
  avgRating: number;
  goodCount: number;
  totalCount: number;
}

/** "Bon avis" = note >= 4/5. Toutes soumissions confondues (pas seulement approuvées) — le signal compte même avant modération. */
export async function getReviewsSummary(rangeDays: number | null): Promise<ReviewsSummary> {
  const since = rangeDays ? new Date(Date.now() - rangeDays * 24 * 60 * 60 * 1000) : undefined;
  const testimonials = await prisma.testimonial.findMany({
    where: since ? { createdAt: { gte: since } } : undefined,
    select: { rating: true },
  });

  const totalCount = testimonials.length;
  const goodCount = testimonials.filter((t) => t.rating >= 4).length;
  const avgRating = totalCount > 0 ? testimonials.reduce((sum, t) => sum + t.rating, 0) / totalCount : 0;

  return { avgRating, goodCount, totalCount };
}

/** Inscriptions sur la période équivalente immédiatement précédente — pour la variation affichée à côté du total de la période choisie. */
export async function getPreviousPeriodSignupCount(rangeDays: number): Promise<number> {
  const now = Date.now();
  return prisma.user.count({
    where: {
      createdAt: {
        gte: new Date(now - rangeDays * 2 * 24 * 60 * 60 * 1000),
        lt: new Date(now - rangeDays * 24 * 60 * 60 * 1000),
      },
    },
  });
}

const PARIS_TZ = "Europe/Paris";
const WEEKDAY_LABELS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const SHORT_WEEKDAY_TO_INDEX: Record<string, number> = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 };
const dayKeyFormatter = new Intl.DateTimeFormat("en-CA", { timeZone: PARIS_TZ, year: "numeric", month: "2-digit", day: "2-digit" });
const weekdayFormatter = new Intl.DateTimeFormat("en-US", { timeZone: PARIS_TZ, weekday: "short" });

/** Lundi=0 … Dimanche=6, dans le fuseau Europe/Paris (jamais le fuseau serveur — UTC sur Vercel, décalerait le jour affiché). */
function parisWeekdayIndex(date: Date): number {
  return SHORT_WEEKDAY_TO_INDEX[weekdayFormatter.format(date)];
}

/** Clé de jour calendaire Europe/Paris ("YYYY-MM-DD") — pour ne compter qu'une fois un visiteur déjà vu le même jour. */
function parisDayKey(date: Date): string {
  return dayKeyFormatter.format(date);
}

export interface WeekdayActivityBucket {
  weekday: number;
  label: string;
  avgVisitors: number;
  totalVisitors: number;
}

/**
 * Affluence par jour de la semaine (section "Jours"): pour chaque jour
 * calendaire Europe/Paris de la période, compte les visiteurs distincts
 * (anonId, ou userId une fois connecté) ayant eu au moins une PageView —
 * un même visiteur actif plusieurs fois le même jour ne compte qu'une fois.
 * Le total par jour de semaine est ensuite divisé par le nombre
 * d'occurrences de ce jour dans la période (ex: 4 lundis sur 30 jours) pour
 * obtenir une moyenne comparable entre jours — sans ça, un mois avec un
 * lundi de plus que les dimanches biaiserait la comparaison.
 */
export async function getWeekdayActivity(rangeDays: number | null): Promise<WeekdayActivityBucket[]> {
  const now = new Date();
  let since: Date;
  if (rangeDays) {
    since = new Date(now.getTime() - rangeDays * 24 * 60 * 60 * 1000);
  } else {
    const earliest = await prisma.pageView.findFirst({ orderBy: { createdAt: "asc" }, select: { createdAt: true } });
    since = earliest?.createdAt ?? now;
  }

  const views = await prisma.pageView.findMany({
    where: { createdAt: { gte: since } },
    select: { createdAt: true, anonId: true, userId: true },
  });

  const seenVisitorDay = new Set<string>();
  const visitorsByWeekday = new Array(7).fill(0) as number[];
  for (const v of views) {
    const dayKey = `${v.userId ?? v.anonId}|${parisDayKey(v.createdAt)}`;
    if (seenVisitorDay.has(dayKey)) continue;
    seenVisitorDay.add(dayKey);
    visitorsByWeekday[parisWeekdayIndex(v.createdAt)] += 1;
  }

  const occurrencesByWeekday = new Array(7).fill(0) as number[];
  const totalDays = Math.max(1, Math.ceil((now.getTime() - since.getTime()) / (24 * 60 * 60 * 1000)));
  for (let offset = 0; offset < totalDays; offset++) {
    const day = new Date(since.getTime() + offset * 24 * 60 * 60 * 1000);
    occurrencesByWeekday[parisWeekdayIndex(day)] += 1;
  }

  return WEEKDAY_LABELS.map((label, weekday) => ({
    weekday,
    label,
    totalVisitors: visitorsByWeekday[weekday],
    avgVisitors: occurrencesByWeekday[weekday] > 0 ? visitorsByWeekday[weekday] / occurrencesByWeekday[weekday] : 0,
  }));
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
