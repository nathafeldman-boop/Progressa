"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function RegenerateButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleClick() {
    setPending(true);
    setMessage(null);
    try {
      const res = await fetch("/api/program/regenerate", { method: "POST" });
      if (res.status === 429) {
        setMessage("Tu as déjà régénéré ton programme récemment — réessaie un peu plus tard.");
      } else if (!res.ok) {
        setMessage("Impossible de régénérer pour le moment.");
      } else {
        router.refresh();
      }
    } catch {
      setMessage("Impossible de régénérer pour le moment.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <Button variant="secondary" onClick={handleClick} disabled={pending}>
        {pending ? "Régénération..." : "🔄 Régénérer mon programme"}
      </Button>
      {message && <p className="mt-2 text-xs text-[var(--color-text-muted)]">{message}</p>}
    </div>
  );
}
