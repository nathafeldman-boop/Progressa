"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { Button } from "@/components/ui/Button";

/**
 * Connexion unifiée: email + code à 6 chiffres, ou Google. Pas de mot de
 * passe, pas d'écran "créer un compte" séparé — avec l'OTP, se connecter
 * pour la première fois EST la création de compte.
 */
export function EmailAuthForm({ redirectTo }: { redirectTo: string }) {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resent, setResent] = useState(false);
  const [awaitingCode, setAwaitingCode] = useState(false);

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const supabase = createClient();
    if (!supabase) {
      setError("Connexion indisponible pour le moment.");
      return;
    }
    setLoading(true);
    const { error: otpError } = await supabase.auth.signInWithOtp({ email });
    setLoading(false);
    if (otpError) {
      setError("Impossible d'envoyer le code pour l'instant.");
      return;
    }
    setAwaitingCode(true);
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const supabase = createClient();
    if (!supabase) {
      setError("Vérification indisponible pour le moment.");
      return;
    }
    setLoading(true);
    const { error: verifyError } = await supabase.auth.verifyOtp({ email, token: code, type: "email" });
    setLoading(false);
    if (verifyError) {
      setError("Code invalide ou expiré.");
      return;
    }
    window.location.href = redirectTo;
  }

  async function handleResend() {
    setError(null);
    const supabase = createClient();
    if (!supabase) return;
    const { error: resendError } = await supabase.auth.signInWithOtp({ email });
    if (resendError) {
      setError("Impossible de renvoyer le code pour l'instant.");
      return;
    }
    setResent(true);
  }

  if (awaitingCode) {
    return (
      <div className="w-full max-w-sm space-y-4">
        <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-sm">
          On vient de t&apos;envoyer un code à 6 chiffres à <strong>{email}</strong>.
        </div>
        <form onSubmit={handleVerify} className="space-y-3">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            required
            autoFocus
            placeholder="000000"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
            className="w-full rounded-[var(--radius-control)] border border-[var(--color-border)] px-4 py-3 text-center text-2xl font-bold tracking-[0.5em]"
          />
          {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading || code.length !== 6}>
            {loading ? "Vérification..." : "Valider le code"}
          </Button>
        </form>
        <button
          type="button"
          onClick={handleResend}
          className="w-full text-center text-sm font-semibold text-[var(--color-text-muted)] underline"
        >
          {resent ? "Code renvoyé ✓" : "Je n'ai pas reçu de code"}
        </button>
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

      <form onSubmit={handleSendCode} className="space-y-3">
        <input
          type="email"
          required
          autoFocus
          placeholder="Ton email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-[var(--radius-control)] border border-[var(--color-border)] px-4 py-2"
        />
        {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Envoi..." : "Recevoir mon code"}
        </Button>
      </form>
    </div>
  );
}
