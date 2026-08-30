import Link from "next/link";
import { Card } from "@/components/ui/Card";
import type { UserDirectoryEntry } from "@/lib/admin/queries";

function formatEuros(cents: number): string {
  return (cents / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

// Sans timeZone explicite, toLocaleDateString formate dans le fuseau du
// serveur (UTC) — une inscription juste après minuit heure française
// pouvait afficher la veille.
function formatDate(d: Date): string {
  return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Europe/Paris" });
}

/** Point de vérité "qui, depuis quand, combien il a rapporté, via qui" — le drill-down demandé pour le dashboard admin. */
export function UserDirectoryTable({ users }: { users: UserDirectoryEntry[] }) {
  return (
    <Card className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-sm">
        <thead>
          <tr className="text-left text-[var(--color-text-muted)]">
            <th className="pb-2"></th>
            <th className="pb-2">Email</th>
            <th className="pb-2">Inscrit le</th>
            <th className="pb-2">Statut</th>
            <th className="pb-2">LTV</th>
            <th className="pb-2">Affilié</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-t border-[var(--color-border)]">
              <td className="py-2">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ background: u.onlineNow ? "#22c55e" : "var(--color-border)" }}
                  title={u.onlineNow ? "En ligne" : "Hors ligne"}
                />
              </td>
              <td className="py-2">
                <Link href={`/admin/users/${u.id}`} className="underline decoration-dotted hover:text-[var(--color-primary-strong)]">
                  {u.email}
                </Link>
              </td>
              <td className="py-2">{formatDate(u.createdAt)}</td>
              <td className="py-2">{u.isPremium ? "Premium" : "Gratuit"}</td>
              <td className="py-2">{formatEuros(u.ltvCents)}</td>
              <td className="py-2 text-[var(--color-text-muted)]">{u.affiliateName ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
