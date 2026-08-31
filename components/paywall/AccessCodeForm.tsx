"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/** Champ discret, replié par défaut — le paiement Stripe reste le chemin principal. */
export function AccessCodeForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/access-code/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });
      if (!res.ok) {
        setError("Code invalide ou déjà utilisé.");
        return;
      }
      router.push("/onboarding/brian?success=1");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mx-auto block text-center text-xs font-semibold text-[var(--color-text-muted)] underline"
      >
        J&apos;ai un code d&apos;accès
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          // Les codes sont toujours en majuscules — on affiche exactement ce
          // qui sera comparé côté serveur, pour éviter tout code "invalide"
          // à cause d'une casse différente entre ce que le joueur voit et
          // ce qui est réellement envoyé.
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Code d'accès"
          autoFocus
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
          className="w-full rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-3 py-2 text-sm uppercase tracking-widest text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] placeholder:normal-case placeholder:tracking-normal"
        />
        <button
          type="submit"
          disabled={submitting || !code.trim()}
          className="shrink-0 rounded-[var(--radius-control)] bg-[var(--color-surface-alt)] px-3 py-2 text-xs font-bold uppercase tracking-wide text-[var(--color-text)] disabled:opacity-50"
        >
          {submitting ? "..." : "Valider"}
        </button>
      </div>
      {error && <p className="text-center text-xs text-[var(--color-danger)]">{error}</p>}
    </form>
  );
}
