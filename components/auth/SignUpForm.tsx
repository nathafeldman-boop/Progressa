"use client";

import { useState } from "react";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { Button } from "@/components/ui/Button";

export function SignUpForm({ redirectTo }: { redirectTo: string }) {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Phase design: on ne crée pas encore de vrai compte Supabase ici — on
  // veut pouvoir juger l'expérience de bout en bout sans backend d'auth.
  // À remplacer par le vrai supabase.auth.signUp() quand l'auth reviendra
  // au premier plan.
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    window.location.href = redirectTo;
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
        <Button type="submit" className="w-full">
          Créer mon compte
        </Button>
      </form>
    </div>
  );
}
