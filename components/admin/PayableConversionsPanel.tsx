"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardSubtitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export interface PayableConversion {
  id: string;
  commissionCents: number;
  payableAt: Date;
  affiliate: { name: string; email: string };
}

function formatEuros(cents: number): string {
  return (cents / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

/** Commissions dont le délai de 5 jours Stripe est passé — à virer à la main, puis à marquer payées. */
export function PayableConversionsPanel({ conversions }: { conversions: PayableConversion[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function markPaid(id: string) {
    setPendingId(id);
    try {
      await fetch("/api/admin/affiliate-conversions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      router.refresh();
    } finally {
      setPendingId(null);
    }
  }

  if (conversions.length === 0) {
    return (
      <Card>
        <CardSubtitle>Rien à payer pour l&apos;instant.</CardSubtitle>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {conversions.map((c) => (
        <Card key={c.id} className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold">{c.affiliate.name}</p>
            <p className="text-xs text-[var(--color-text-muted)]">{c.affiliate.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-display text-lg font-extrabold">{formatEuros(c.commissionCents)}</span>
            <Button disabled={pendingId === c.id} onClick={() => markPaid(c.id)}>
              {pendingId === c.id ? "..." : "Marquer payé"}
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
