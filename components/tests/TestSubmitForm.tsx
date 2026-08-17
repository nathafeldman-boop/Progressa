"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function TestSubmitForm({ testType, unit }: { testType: string; unit: string }) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    const numeric = Number(value.replace(",", "."));
    if (!numeric || numeric <= 0) {
      setError("Entre une valeur valide.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/tests/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testType, value: numeric }),
      });
      if (res.status === 429) {
        setError("Tu as déjà passé ce test récemment — réessaie dans quelques semaines.");
      } else if (!res.ok) {
        setError("Impossible d'enregistrer ce résultat.");
      } else {
        setValue("");
        router.refresh();
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-3 flex items-center gap-2">
      <input
        type="text"
        inputMode="decimal"
        className="w-24 rounded-[var(--radius-control)] border border-[var(--color-border)] px-3 py-2 text-sm"
        placeholder={unit}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <Button onClick={submit} disabled={submitting}>
        {submitting ? "..." : "Enregistrer"}
      </Button>
      {error && <p className="text-xs text-[var(--color-danger)]">{error}</p>}
    </div>
  );
}
