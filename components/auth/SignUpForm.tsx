"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { Button } from "@/components/ui/Button";

export function SignUpForm({ redirectTo }: { redirectTo: string }) {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const supabase = createClient();
    if (!supabase) {
      setError("Création de compte indisponible pour le moment.");
      return;
    }
    setLoading(true);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { first_name: firstName },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
      },
    });
    setLoading(false);
    if (signUpError) {
      setError(signUpError.message === "User already registered" ? "Un compte existe déjà avec cet email." : "Impossible de créer le compte.");
      return;
    }
    // Si la confirmation email est désactivée, une session est déjà ouverte.
    if (data.session) {
      window.location.href = redirectTo;
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="w-full max-w-sm rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-sm">
        Un email de confirmation vient de t&apos;être envoyé. Clique sur le lien pour activer ton compte.
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm space-y-4">
      <GoogleButton redirectTo={redirectTo} />

      <div className="flex items-center gap-3 text-xs text-[var(--color-text-muted)]">
        <span className="h-px flex-1 bg-[var(--color-border)]" />
        ou
        <span className="h-px flex-1 bg-[var(--color-border)]" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          required
          placeholder="Prénom"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="w-full rounded-[var(--radius-control)] border border-[var(--color-border)] px-4 py-2"
        />
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-[var(--radius-control)] border border-[var(--color-border)] px-4 py-2"
        />
        <input
          type="password"
          required
          minLength={8}
          placeholder="Mot de passe (8 caractères min.)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-[var(--radius-control)] border border-[var(--color-border)] px-4 py-2"
        />
        {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Création..." : "Créer mon compte"}
        </Button>
      </form>
    </div>
  );
}
