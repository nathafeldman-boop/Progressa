import Link from "next/link";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import {
  getFeatureUsage,
  getGlobalStats,
  getOnboardingFunnel,
  getOnlineNow,
  getUserDirectory,
  getAffiliateDirectory,
  getAccessCodes,
  getPayableConversions,
  getSignupsTimeseries,
  getReviewsSummary,
  getPreviousPeriodSignupCount,
  getWeekdayActivity,
} from "@/lib/admin/queries";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { AutoRefresh } from "@/components/admin/AutoRefresh";
import { TestimonialModeration } from "@/components/admin/TestimonialModeration";
import { SeedCatalogButton } from "@/components/admin/SeedCatalogButton";
import { UserDirectoryTable } from "@/components/admin/UserDirectoryTable";
import { AffiliateAdminPanel } from "@/components/admin/AffiliateAdminPanel";
import { AccessCodeAdminPanel } from "@/components/admin/AccessCodeAdminPanel";
import { PayableConversionsPanel } from "@/components/admin/PayableConversionsPanel";
import { SignupsChart } from "@/components/admin/SignupsChart";
import { WeekdayActivityChart } from "@/components/admin/WeekdayActivityChart";
import { Card, CardSubtitle, CardTitle } from "@/components/ui/Card";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/cn";

const RANGE_OPTIONS = [
  { key: "7", label: "7 jours", days: 7 },
  { key: "30", label: "30 jours", days: 30 },
  { key: "90", label: "90 jours", days: 90 },
  { key: "all", label: "Tout", days: null as number | null },
];

function formatEuros(cents: number): string {
  return (cents / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) return <AdminLoginForm />;

  const { range } = await searchParams;
  const selectedRange = RANGE_OPTIONS.find((r) => r.key === range) ?? RANGE_OPTIONS[1];
  const rangeDays = selectedRange.days;

  const [online, stats, funnel, usage, pendingTestimonials, users, affiliates, accessCodes, payableConversions, signups, reviews, weekdayActivity] =
    await Promise.all([
      getOnlineNow(),
      getGlobalStats(),
      getOnboardingFunnel(),
      getFeatureUsage(),
      prisma.testimonial.findMany({ where: { status: "PENDING" }, orderBy: { createdAt: "asc" } }),
      getUserDirectory(),
      getAffiliateDirectory(),
      getAccessCodes(),
      getPayableConversions(),
      getSignupsTimeseries(rangeDays),
      getReviewsSummary(rangeDays),
      getWeekdayActivity(rangeDays),
    ]);

  const periodSignups = signups.reduce((sum, d) => sum + d.free + d.premium, 0);
  const prevPeriodSignups = rangeDays ? await getPreviousPeriodSignupCount(rangeDays) : null;
  const signupsDeltaPct =
    prevPeriodSignups != null && prevPeriodSignups > 0 ? Math.round(((periodSignups - prevPeriodSignups) / prevPeriodSignups) * 100) : null;

  const firstScreenViews = funnel[0]?.viewed ?? 0;
  const totalConversions = affiliates.reduce((sum, a) => sum + a.conversionCount, 0);
  const totalPayable = affiliates.reduce((sum, a) => sum + a.payableCents, 0);
  const totalPaid = affiliates.reduce((sum, a) => sum + a.paidCents, 0);

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4">
      <AutoRefresh />
      <div>
        <h1 className="font-display text-2xl font-extrabold uppercase tracking-wide">Dashboard admin</h1>
        <p className="mt-0.5 text-sm text-[var(--color-text-muted)]">Vue d&apos;ensemble</p>
      </div>

      <section>
        <h2 className="mb-2 font-display text-sm font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
          Catalogue
        </h2>
        <SeedCatalogButton />
      </section>

      <section>
        <h2 className="mb-2 font-display text-sm font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
          En ligne maintenant ({online.length})
        </h2>
        <Card>
          {online.length === 0 ? (
            <CardSubtitle>Personne en ligne actuellement.</CardSubtitle>
          ) : (
            <ul className="space-y-1 text-sm">
              {online.map((v, i) => (
                <li key={i} className="flex justify-between">
                  <span>{v.label}</span>
                  <span className="text-[var(--color-text-muted)]">{v.path}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <StatCard label="Joueurs" value={stats.totalUsers} />
        <StatCard label="Premium (avec bonus)" value={stats.premiumCount} />
        <StatCard
          label="Dont payant réel"
          value={`${stats.realPremiumCount} (${stats.totalUsers > 0 ? Math.round((stats.realPremiumCount / stats.totalUsers) * 100) : 0}%)`}
        />
        <StatCard label="Gratuit" value={stats.freeCount} />
        <StatCard label="Taux de complétion séances" value={`${stats.completionRate}%`} />
      </section>
      <p className="-mt-2 text-xs text-[var(--color-text-muted)]">
        « Payant réel » = abonnement Stripe actif uniquement — exclut les codes d&apos;accès et bonus de parrainage.
      </p>

      {/* Toute la section ci-dessous se filtre sur la période choisie — même
          principe qu'un sélecteur de dates Google Ads: une seule rangée de
          préréglages, tout ce qui suit se recalcule dessus. */}
      <div className="flex gap-1 rounded-[var(--radius-control)] bg-[var(--color-surface-alt)] p-1 text-sm font-bold">
        {RANGE_OPTIONS.map((opt) => (
          <Link
            key={opt.key}
            href={`/admin?range=${opt.key}`}
            className={cn(
              "flex-1 rounded-[calc(var(--radius-control)-4px)] py-1.5 text-center transition-colors",
              opt.key === selectedRange.key
                ? "bg-[var(--color-primary)] text-[var(--color-on-primary)]"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            )}
          >
            {opt.label}
          </Link>
        ))}
      </div>

      <section>
        <Card>
          <div className="flex items-baseline justify-between">
            <CardTitle className="text-base">Inscriptions</CardTitle>
            <div className="text-right">
              <p className="font-display text-2xl font-extrabold">{periodSignups}</p>
              {signupsDeltaPct != null && (
                <p
                  className={cn(
                    "text-xs font-bold",
                    signupsDeltaPct >= 0 ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"
                  )}
                >
                  {signupsDeltaPct >= 0 ? "▲" : "▼"} {Math.abs(signupsDeltaPct)}% vs période précédente
                </p>
              )}
            </div>
          </div>
          <div className="mt-3">
            <SignupsChart data={signups} />
          </div>
        </Card>
      </section>

      <section>
        <Card>
          <CardTitle className="text-base">Jours avec le plus de monde</CardTitle>
          <CardSubtitle className="mt-0.5">Visiteurs distincts par jour de la semaine, sur la période sélectionnée.</CardSubtitle>
          <div className="mt-3">
            <WeekdayActivityChart data={weekdayActivity} />
          </div>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Card>
          <CardTitle className="text-base">Affiliation</CardTitle>
          <div className="mt-3 grid grid-cols-2 gap-3 text-center">
            <MiniStat label="Affiliés" value={affiliates.length} />
            <MiniStat label="Conversions" value={totalConversions} />
            <MiniStat label="À verser" value={formatEuros(totalPayable)} />
            <MiniStat label="Déjà versé" value={formatEuros(totalPaid)} />
          </div>
        </Card>
        <Card>
          <CardTitle className="text-base">Avis ({reviews.totalCount})</CardTitle>
          <div className="mt-3 grid grid-cols-2 gap-3 text-center">
            <MiniStat label="Note moyenne" value={reviews.totalCount > 0 ? reviews.avgRating.toFixed(1) : "—"} />
            <MiniStat label="Bons avis (≥4/5)" value={reviews.goodCount} />
          </div>
        </Card>
      </section>

      <section>
        <h2 className="mb-2 font-display text-sm font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
          Funnel onboarding
        </h2>
        <p className="mb-2 text-xs text-[var(--color-text-muted)]">
          Ne compte que les visiteurs qui se sont un jour connectés — filtre les robots (Google et autres) qui
          chargent /onboarding sans jamais créer de compte.
        </p>
        <Card>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[var(--color-text-muted)]">
                <th className="pb-2">Écran</th>
                <th className="pb-2">Vus</th>
                <th className="pb-2">Terminés</th>
                <th className="pb-2">Abandon</th>
              </tr>
            </thead>
            <tbody>
              {funnel.map((f) => {
                const dropoffPct = firstScreenViews > 0 ? Math.round(100 - (f.viewed / firstScreenViews) * 100) : 0;
                return (
                  <tr key={f.screen} className="border-t border-[var(--color-border)]">
                    <td className="py-2">
                      {f.screen + 1}. {f.screenKey}
                    </td>
                    <td>{f.viewed}</td>
                    <td>{f.completed}</td>
                    <td>{dropoffPct}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      </section>

      <section>
        <h2 className="mb-2 font-display text-sm font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
          Avis en attente de modération ({pendingTestimonials.length})
        </h2>
        <TestimonialModeration testimonials={pendingTestimonials} />
      </section>

      <section>
        <h2 className="mb-2 font-display text-sm font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
          Visiteurs ({users.length} derniers inscrits)
        </h2>
        <UserDirectoryTable users={users} />
      </section>

      <section>
        <h2 className="mb-2 font-display text-sm font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
          Commissions à verser ({payableConversions.length})
        </h2>
        <PayableConversionsPanel
          conversions={payableConversions.map((c) => ({
            id: c.id,
            commissionCents: c.commissionCents,
            payableAt: c.payableAt,
            affiliate: c.affiliate,
          }))}
        />
      </section>

      <section>
        <h2 className="mb-2 font-display text-sm font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
          Affiliés ({affiliates.length})
        </h2>
        <AffiliateAdminPanel affiliates={affiliates} />
      </section>

      <section>
        <h2 className="mb-2 font-display text-sm font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
          Codes d&apos;accès ({accessCodes.length})
        </h2>
        <AccessCodeAdminPanel
          codes={accessCodes}
          affiliates={affiliates.map((a) => ({ id: a.id, name: a.name }))}
        />
      </section>

      <section>
        <h2 className="mb-2 font-display text-sm font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
          Usage des fonctionnalités
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <StatCard label="Tests" value={usage.evaluationResults} />
          <StatCard label="Avis" value={usage.testimonials} />
          <StatCard label="Matchs logués" value={usage.matchLogs} />
          <StatCard label="Check-ins" value={usage.checkins} />
          <StatCard label="Badges gagnés" value={usage.badges} />
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <Card className="text-center">
      <p className="font-display text-2xl font-extrabold text-[var(--color-primary-strong)]">{value}</p>
      <CardTitle className="text-xs">{label}</CardTitle>
    </Card>
  );
}

function MiniStat({ label, value }: { label: string; value: number | string }) {
  return (
    <div>
      <p className="font-display text-xl font-extrabold text-[var(--color-primary-strong)]">{value}</p>
      <p className="text-[0.65rem] font-bold uppercase tracking-wide text-[var(--color-text-muted)]">{label}</p>
    </div>
  );
}
