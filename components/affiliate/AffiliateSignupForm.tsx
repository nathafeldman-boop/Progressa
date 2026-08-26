"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardSubtitle, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export function AffiliateSignupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/affiliate/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(
          data.error === "already_registered"
            ? "Cet email a déjà un compte affilié — contacte-nous si tu as perdu ton lien."
            : "Impossible de créer ton compte pour l'instant."
        );
        return;
      }
      router.push(`/affiliation/dashboard/${data.dashboardToken}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="space-y-3">
      <CardTitle className="text-base">Devenir affilié</CardTitle>
      <CardSubtitle>Ton nom et ton email suffisent — pas de mot de passe, juste un lien personnel à garder précieusement.</CardSubtitle>
      <form onSubmit={submit} className="space-y-3">
        <input
          type="text"
          required
          placeholder="Ton nom (ou pseudo)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-[var(--radius-control)] border border-[var(--color-border)] px-3 py-2 text-sm"
        />
        <input
          type="email"
          required
          placeholder="Ton email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-[var(--radius-control)] border border-[var(--color-border)] px-3 py-2 text-sm"
        />
        {error && <p className="text-xs text-[var(--color-danger)]">{error}</p>}
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "..." : "Créer mon lien d'affiliation"}
        </Button>
      </form>
    </Card>
  );
}
