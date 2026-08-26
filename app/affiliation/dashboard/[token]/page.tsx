import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { affiliateEarningsSummary, BONUS_TIER_CENTS } from "@/lib/affiliate";
import { Card, CardSubtitle, CardTitle } from "@/components/ui/Card";
import { CopyLinkButton } from "@/components/affiliate/CopyLinkButton";

function formatEuros(cents: number): string {
  return (cents / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

export default async function AffiliateDashboardPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const affiliate = await prisma.affiliate.findUnique({ where: { dashboardToken: token } });
  if (!affiliate) notFound();

  const [summary, conversions] = await Promise.all([
    affiliateEarningsSummary(affiliate.id),
    prisma.affiliateConversion.findMany({
      where: { affiliateId: affiliate.id },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { user: { select: { firstName: true, email: true } } },
    }),
  ]);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const shareLink = `${appUrl}/?aff=${affiliate.code}`;
  const progressToBonus = ((summary.pendingCents + summary.payableCents + summary.paidCents) % BONUS_TIER_CENTS) / BONUS_TIER_CENTS;

  return (
    <div className="mx-auto max-w-md space-y-4 p-4 py-10">
      <div>
        <h1 className="font-display text-2xl font-extrabold uppercase tracking-wide">Salut {affiliate.name} 👋</h1>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">Ton tableau de bord d&apos;affilié, mets ce lien en sécurité (bookmark).</p>
      </div>

      <Card className="space-y-2">
        <CardTitle className="text-base">Ton lien à partager</CardTitle>
        <p className="break-all rounded-[var(--radius-control)] bg-[var(--color-surface-alt)] px-3 py-2 text-sm">{shareLink}</p>
        <CopyLinkButton link={shareLink} />
        <CardSubtitle>Commission: {Math.round(affiliate.commissionRate * 100)}%</CardSubtitle>
      </Card>

      <Card className="space-y-2 border-2 border-[var(--color-primary)]">
        <CardTitle className="text-base">Ton code d&apos;accès Premium</CardTitle>
        <CardSubtitle>
          Donne ce code à un joueur : il l&apos;entre dans &quot;J&apos;ai un code d&apos;accès&quot; sur la page d&apos;abonnement pour débloquer 30 jours de Premium gratuits, sans payer.
        </CardSubtitle>
        <p className="rounded-[var(--radius-control)] bg-[var(--color-surface-alt)] px-3 py-3 text-center font-display text-2xl font-extrabold uppercase tracking-widest">
          {affiliate.code}
        </p>
        <CopyLinkButton link={affiliate.code} label="Copier le code" />
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card className="text-center">
          <p className="font-display text-2xl font-extrabold text-[var(--color-primary-strong)]">{summary.clickCount}</p>
          <CardTitle className="text-xs">Clics sur ton lien</CardTitle>
        </Card>
        <Card className="text-center">
          <p className="font-display text-2xl font-extrabold text-[var(--color-primary-strong)]">{summary.conversionCount}</p>
          <CardTitle className="text-xs">Joueurs abonnés</CardTitle>
        </Card>
      </div>

      <Card className="space-y-2">
        <CardTitle className="text-base">Tes commissions</CardTitle>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-[var(--color-text-muted)]">En attente (moins de 5 jours)</span>
            <span className="font-semibold">{formatEuros(summary.pendingCents)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--color-text-muted)]">Payable maintenant</span>
            <span className="font-semibold">{formatEuros(summary.payableCents)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--color-text-muted)]">Déjà versé</span>
            <span className="font-semibold">{formatEuros(summary.paidCents)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--color-text-muted)]">Bonus de palier (500€ → +50€)</span>
            <span className="font-semibold">{formatEuros(summary.bonusCents)}</span>
          </div>
          <div className="mt-2 flex justify-between border-t border-[var(--color-border)] pt-2 font-bold">
            <span>Total</span>
            <span>{formatEuros(summary.totalEarnedCents)}</span>
          </div>
        </div>
        <div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--color-surface-alt)]">
            <div
              className="h-full rounded-full bg-[var(--color-primary)]"
              style={{ width: `${Math.round(progressToBonus * 100)}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">Prochain bonus de 50€ à {formatEuros(BONUS_TIER_CENTS)} de commissions cumulées.</p>
        </div>
      </Card>

      <Card>
        <CardTitle className="text-base">Joueurs venus grâce à toi</CardTitle>
        {conversions.length === 0 ? (
          <CardSubtitle className="mt-1">Encore aucun abonnement — partage ton lien !</CardSubtitle>
        ) : (
          <ul className="mt-2 space-y-1.5 text-sm">
            {conversions.map((c) => (
              <li key={c.id} className="flex justify-between">
                <span>{c.user.firstName}</span>
                <span className="text-[var(--color-text-muted)]">{formatEuros(c.commissionCents)}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
