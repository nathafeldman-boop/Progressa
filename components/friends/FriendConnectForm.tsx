"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

// Pour les potes qui reçoivent le code à l'oral ou par SMS plutôt que via
// le lien /r/<code> cliquable (même code personnel, saisi à la main ici).
export function FriendConnectForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim() || busy) return;
    setBusy(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/friends/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback(data.error === "self" ? "C'est ton propre code !" : "Code invalide.");
        return;
      }
      setFeedback(
        data.status === "already_friends" ? `Déjà ami avec ${data.friendName}.` : `Ajouté : ${data.friendName} !`
      );
      setCode("");
      router.refresh();
    } catch {
      setFeedback("Erreur réseau, réessaie.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-3">
      <div className="flex items-center gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Code d'un pote"
          maxLength={16}
          className="flex-1 rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-3 py-2 text-sm uppercase"
        />
        <Button type="submit" variant="secondary" disabled={busy || !code.trim()}>
          {busy ? "…" : "Ajouter"}
        </Button>
      </div>
      {feedback && <p className="mt-2 text-xs text-[var(--color-text-muted)]">{feedback}</p>}
    </form>
  );
}
