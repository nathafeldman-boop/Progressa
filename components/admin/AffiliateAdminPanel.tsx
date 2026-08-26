"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardSubtitle, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { AffiliateDirectoryEntry } from "@/lib/admin/queries";

function formatEuros(cents: number): string {
  return (cents / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

export function AffiliateAdminPanel({ affiliates }: { affiliates: AffiliateDirectoryEntry[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function createAffiliate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/affiliates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      if (!res.ok) {
        setError("Email déjà utilisé ou requête invalide.");
        return;
      }
      setName("");
      setEmail("");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-3">
      <Card>
        <CardTitle className="text-base">Créer un affilié (ex: toi, Marsau...)</CardTitle>
        <form onSubmit={createAffiliate} className="mt-2 flex flex-wrap gap-2">
          <input
            type="text"
            required
            placeholder="Nom"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="min-w-32 flex-1 rounded-[var(--radius-control)] border border-[var(--color-border)] px-3 py-2 text-sm"
          />
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="min-w-40 flex-1 rounded-[var(--radius-control)] border border-[var(--color-border)] px-3 py-2 text-sm"
          />
          <Button type="submit" disabled={submitting}>
            {submitting ? "..." : "Créer"}
          </Button>
        </form>
        {error && <p className="mt-2 text-xs text-[var(--color-danger)]">{error}</p>}
      </Card>

      {affiliates.length === 0 ? (
        <Card>
          <CardSubtitle>Aucun affilié pour l&apos;instant.</CardSubtitle>
        </Card>
      ) : (
        affiliates.map((a) => (
          <Card key={a.id}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold">{a.name}</p>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {a.email} · code {a.code}
                </p>
              </div>
              {!a.active && <span className="text-xs font-semibold text-[var(--color-danger)]">Inactif</span>}
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <p className="font-bold">{a.clickCount}</p>
                <p className="text-[var(--color-text-muted)]">Clics</p>
              </div>
              <div>
                <p className="font-bold">{a.conversionCount}</p>
                <p className="text-[var(--color-text-muted)]">Conversions</p>
              </div>
              <div>
                <p className="font-bold">{formatEuros(a.pendingCents + a.payableCents + a.paidCents + a.bonusCents)}</p>
                <p className="text-[var(--color-text-muted)]">Total dû/versé</p>
              </div>
            </div>
            <p className="mt-2 text-xs text-[var(--color-text-muted)]">
              Payable maintenant: <strong>{formatEuros(a.payableCents)}</strong> · En attente (5j):{" "}
              {formatEuros(a.pendingCents)} · Déjà versé: {formatEuros(a.paidCents)} · Bonus: {formatEuros(a.bonusCents)}
            </p>
          </Card>
        ))
      )}
    </div>
  );
}
