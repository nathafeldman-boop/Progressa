"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { BrianAvatar } from "@/components/brian/BrianAvatar";

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
        const data = await res.json().catch(() => ({}));
        const retryAfterMs: number | undefined = data.retryAfterMs;
        const unlockLabel =
          typeof retryAfterMs === "number"
            ? new Date(Date.now() + retryAfterMs).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
            : null;
        setMessage(
          unlockLabel
            ? `Une seule régénération par jour — reviens à ${unlockLabel}.`
            : "Une seule régénération par jour — réessaie demain à partir de 8h."
        );
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
      <Button variant="secondary" onClick={handleClick} disabled={pending} className="flex items-center gap-2">
        <BrianAvatar state="thinking" size={22} />
        {pending ? "Régénération..." : "Régénérer ma séance du jour"}
      </Button>
      {message && <p className="mt-2 text-xs text-[var(--color-text-muted)]">{message}</p>}
    </div>
  );
}
