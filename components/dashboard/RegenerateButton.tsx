"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

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
    <div className="text-right">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className="text-xs font-semibold text-[var(--color-text-muted)] underline disabled:opacity-50"
      >
        {pending ? "Régénération..." : "Régénérer"}
      </button>
      {message && <p className="mt-1 max-w-[10rem] text-[0.65rem] text-[var(--color-text-muted)]">{message}</p>}
    </div>
  );
}
