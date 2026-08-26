"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardSubtitle, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export interface AccessCodeEntry {
  id: string;
  code: string;
  grantsDays: number;
  usedAt: Date | null;
  affiliate: { name: string } | null;
  usedByUser: { firstName: string; email: string } | null;
}

export function AccessCodeAdminPanel({
  codes,
  affiliates,
}: {
  codes: AccessCodeEntry[];
  affiliates: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [grantsDays, setGrantsDays] = useState(30);
  const [affiliateId, setAffiliateId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [justCreated, setJustCreated] = useState<string | null>(null);

  async function createCode(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/access-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grantsDays, affiliateId: affiliateId || null }),
      });
      if (res.ok) {
        const data = await res.json();
        setJustCreated(data.accessCode.code);
        router.refresh();
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-3">
      <Card>
        <CardTitle className="text-base">Créer un code d&apos;accès (Premium instantané)</CardTitle>
        <form onSubmit={createCode} className="mt-2 flex flex-wrap items-center gap-2">
          <input
            type="number"
            min={1}
            max={365}
            value={grantsDays}
            onChange={(e) => setGrantsDays(Number(e.target.value))}
            className="w-24 rounded-[var(--radius-control)] border border-[var(--color-border)] px-3 py-2 text-sm"
          />
          <span className="text-xs text-[var(--color-text-muted)]">jours</span>
          <select
            value={affiliateId}
            onChange={(e) => setAffiliateId(e.target.value)}
            className="rounded-[var(--radius-control)] border border-[var(--color-border)] px-3 py-2 text-sm"
          >
            <option value="">Aucun affilié</option>
            {affiliates.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
          <Button type="submit" disabled={submitting}>
            {submitting ? "..." : "Générer"}
          </Button>
        </form>
        {justCreated && (
          <p className="mt-2 text-sm font-bold text-[var(--color-primary-strong)]">Code créé: {justCreated}</p>
        )}
      </Card>

      {codes.length === 0 ? (
        <Card>
          <CardSubtitle>Aucun code créé pour l&apos;instant.</CardSubtitle>
        </Card>
      ) : (
        <Card>
          <ul className="space-y-1.5 text-sm">
            {codes.map((c) => (
              <li key={c.id} className="flex items-center justify-between border-b border-[var(--color-border)] pb-1.5 last:border-none">
                <span className="font-mono font-bold">{c.code}</span>
                <span className="text-xs text-[var(--color-text-muted)]">
                  {c.grantsDays}j{c.affiliate ? ` · ${c.affiliate.name}` : ""}
                </span>
                <span className="text-xs">
                  {c.usedAt ? `Utilisé par ${c.usedByUser?.firstName ?? "?"}` : "Disponible"}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
