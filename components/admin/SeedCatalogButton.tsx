"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardSubtitle } from "@/components/ui/Card";

export function SeedCatalogButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/seed-catalog", { method: "POST" });
      if (!res.ok) {
        setResult("Échec de la synchronisation.");
        return;
      }
      const data = await res.json();
      setResult(`${data.exercisesSynced} exercices et ${data.badgesSynced} badges synchronisés.`);
    } catch {
      setResult("Échec de la synchronisation.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardSubtitle>
        Recopie en base le catalogue d&apos;exercices et de badges défini dans le code. À relancer après chaque
        déploiement qui modifie le catalogue — plus besoin de toucher Supabase à la main.
      </CardSubtitle>
      <Button className="mt-3" onClick={run} disabled={loading}>
        {loading ? "Synchronisation…" : "Synchroniser le catalogue"}
      </Button>
      {result && <p className="mt-2 text-sm text-[var(--color-text-muted)]">{result}</p>}
    </Card>
  );
}
