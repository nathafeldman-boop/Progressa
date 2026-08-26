import Link from "next/link";
import { notFound } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { getUserDetail } from "@/lib/admin/queries";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { Card, CardSubtitle, CardTitle } from "@/components/ui/Card";
import { POSITION_LABELS, OBJECTIVE_LABELS, EQUIPMENT_LABELS } from "@/lib/labels";

function formatEuros(cents: number): string {
  return (cents / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

function formatDateTime(d: Date): string {
  return new Date(d).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) return <AdminLoginForm />;

  const { id } = await params;
  const detail = await getUserDetail(id);
  if (!detail) notFound();

  const { user, onlineNow, ltvCents, sessions, completedSessions, evaluationResults, payments, affiliateConversion, timeline } = detail;
  const isPremium =
    user.subscription?.status === "ACTIVE" || (!!user.subscription?.bonusPremiumUntil && user.subscription.bonusPremiumUntil > new Date());

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4">
      <Link href="/admin" className="text-sm text-[var(--color-text-muted)] underline">
        ← Retour au dashboard
      </Link>

      <div>
        <h1 className="font-display text-2xl font-extrabold uppercase tracking-wide">{user.firstName}</h1>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">{user.email}</p>
      </div>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Statut" value={isPremium ? "Premium" : "Gratuit"} />
        <StatCard label="LTV" value={formatEuros(ltvCents)} />
        <StatCard label="Séances terminées" value={`${completedSessions}/${sessions.length}`} />
        <StatCard label="En ligne" value={onlineNow ? "Oui" : "Non"} />
      </section>

      <Card className="space-y-1.5 text-sm">
        <CardTitle className="text-base">Infos compte</CardTitle>
        <Row label="Inscrit le" value={formatDateTime(user.createdAt)} />
        <Row label="Compte lié (auth)" value={user.externalAuthId ? "Oui" : "Non — compte partiel"} />
        <Row label="Abonnement" value={user.subscription?.status ?? "Aucun"} />
        {user.subscription?.currentPeriodEnd && (
          <Row label="Renouvellement" value={formatDateTime(user.subscription.currentPeriodEnd)} />
        )}
        {user.subscription?.bonusPremiumUntil && (
          <Row label="Premium offert jusqu'au" value={formatDateTime(user.subscription.bonusPremiumUntil)} />
        )}
        {affiliateConversion && (
          <Row label="Venu via l'affilié" value={`${affiliateConversion.affiliate.name} (${affiliateConversion.affiliate.code})`} />
        )}
      </Card>

      {user.profile ? (
        <Card className="space-y-1.5 text-sm">
          <CardTitle className="text-base">Réponses d&apos;onboarding</CardTitle>
          <Row label="Poste" value={POSITION_LABELS[user.profile.position]} />
          <Row label="Objectif" value={OBJECTIVE_LABELS[user.profile.objective]} />
          <Row label="Niveau" value={user.profile.levelLabel} />
          <Row label="Année de naissance" value={String(user.profile.birthYear)} />
          <Row label="Pays" value={user.profile.country} />
          {user.profile.district && <Row label="Département" value={user.profile.district} />}
          <Row label="Équipement" value={user.profile.equipment.map((e) => EQUIPMENT_LABELS[e]).join(", ") || "—"} />
          {user.profile.club && <Row label="Club" value={user.profile.club} />}
          {user.profile.weakPointNote && <Row label="Point faible noté" value={user.profile.weakPointNote} />}
        </Card>
      ) : (
        <Card>
          <CardSubtitle>Onboarding jamais terminé — pas de profil joueur.</CardSubtitle>
        </Card>
      )}

      <section>
        <h2 className="mb-2 font-display text-sm font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
          Tests d&apos;évaluation ({evaluationResults.length})
        </h2>
        <Card>
          {evaluationResults.length === 0 ? (
            <CardSubtitle>Aucun test passé.</CardSubtitle>
          ) : (
            <ul className="space-y-1 text-sm">
              {evaluationResults.map((r) => (
                <li key={r.id} className="flex justify-between border-t border-[var(--color-border)] py-1.5 first:border-t-0 first:pt-0">
                  <span>{r.testType}</span>
                  <span className="text-[var(--color-text-muted)]">
                    {r.value} {r.unit} · {formatDateTime(r.recordedAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>

      {payments.length > 0 && (
        <section>
          <h2 className="mb-2 font-display text-sm font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
            Paiements ({payments.length})
          </h2>
          <Card>
            <ul className="space-y-1 text-sm">
              {payments.map((p) => (
                <li key={p.id} className="flex justify-between border-t border-[var(--color-border)] py-1.5 first:border-t-0 first:pt-0">
                  <span>{formatDateTime(p.createdAt)}</span>
                  <span className="font-semibold">{formatEuros(p.amountCents)}</span>
                </li>
              ))}
            </ul>
          </Card>
        </section>
      )}

      <section>
        <h2 className="mb-2 font-display text-sm font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
          Parcours complet ({timeline.length} événements)
        </h2>
        <Card className="max-h-[28rem] overflow-y-auto">
          {timeline.length === 0 ? (
            <CardSubtitle>Aucune page vue ou clic enregistré pour ce compte.</CardSubtitle>
          ) : (
            <ul className="space-y-1 text-sm">
              {timeline.map((e, i) => (
                <li key={i} className="flex items-center justify-between gap-2 border-t border-[var(--color-border)] py-1.5 first:border-t-0 first:pt-0">
                  <span className="flex items-center gap-2">
                    <span
                      className="rounded px-1.5 py-0.5 text-[0.65rem] font-bold uppercase"
                      style={{
                        background: e.type === "click" ? "var(--color-primary-soft)" : "var(--color-surface-alt)",
                        color: e.type === "click" ? "var(--color-primary-strong)" : "var(--color-text-muted)",
                      }}
                    >
                      {e.type === "click" ? "clic" : "page"}
                    </span>
                    {e.label}
                  </span>
                  <span className="shrink-0 text-xs text-[var(--color-text-muted)]">{formatDateTime(e.at)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <Card className="text-center">
      <p className="font-display text-xl font-extrabold text-[var(--color-primary-strong)]">{value}</p>
      <CardTitle className="text-xs">{label}</CardTitle>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-[var(--color-text-muted)]">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
