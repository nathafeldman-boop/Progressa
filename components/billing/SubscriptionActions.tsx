"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function SubscriptionActions({ hasStripeCustomer }: { hasStripeCustomer: boolean }) {
  const [loading, setLoading] = useState<string | null>(null);

  async function startCheckout(plan: "MONTHLY" | "ANNUAL") {
    setLoading(plan);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setLoading(null);
    }
  }

  async function openPortal() {
    setLoading("portal");
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setLoading(null);
    }
  }

  if (hasStripeCustomer) {
    return (
      <Button className="w-full" onClick={openPortal} disabled={loading === "portal"}>
        Gérer mon abonnement
      </Button>
    );
  }

  return (
    <Card className="space-y-3">
      <Button className="w-full" onClick={() => startCheckout("ANNUAL")} disabled={!!loading}>
        {loading === "ANNUAL" ? "..." : "Annuel (2 mois offerts)"}
      </Button>
      <Button variant="secondary" className="w-full" onClick={() => startCheckout("MONTHLY")} disabled={!!loading}>
        {loading === "MONTHLY" ? "..." : "Mensuel"}
      </Button>
    </Card>
  );
}
