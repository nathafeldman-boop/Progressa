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
} from "@/lib/admin/queries";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { TestimonialModeration } from "@/components/admin/TestimonialModeration";
import { SeedCatalogButton } from "@/components/admin/SeedCatalogButton";
import { UserDirectoryTable } from "@/components/admin/UserDirectoryTable";
import { AffiliateAdminPanel } from "@/components/admin/AffiliateAdminPanel";
import { AccessCodeAdminPanel } from "@/components/admin/AccessCodeAdminPanel";
import { PayableConversionsPanel } from "@/components/admin/PayableConversionsPanel";
import { Card, CardSubtitle, CardTitle } from "@/components/ui/Card";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) return <AdminLoginForm />;

  const [online, stats, funnel, usage, pendingTestimonials, users, affiliates, accessCodes, payableConversions] =
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
    ]);

  const firstScreenViews = funnel[0]?.viewed ?? 0;

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4">
      <h1 className="font-display text-2xl font-extrabold uppercase tracking-wide">Dashboard admin</h1>

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

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Joueurs" value={stats.totalUsers} />
        <StatCard label="Premium" value={stats.premiumCount} />
        <StatCard label="Gratuit" value={stats.freeCount} />
        <StatCard label="Taux de complétion séances" value={`${stats.completionRate}%`} />
      </section>

      <section>
        <h2 className="mb-2 font-display text-sm font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
          Funnel onboarding
        </h2>
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
