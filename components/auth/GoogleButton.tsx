"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

function GoogleLogo() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M19.6 10.23c0-.68-.06-1.36-.18-2.02H10v3.83h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.24c1.9-1.75 2.98-4.34 2.98-7.33Z"
      />
      <path
        fill="#34A853"
        d="M10 20c2.7 0 4.96-.89 6.62-2.42l-3.24-2.5c-.9.6-2.05.96-3.38.96-2.6 0-4.8-1.75-5.59-4.11H1.06v2.59A10 10 0 0 0 10 20Z"
      />
      <path fill="#FBBC05" d="M4.41 11.93a5.99 5.99 0 0 1 0-3.86V5.48H1.06a10 10 0 0 0 0 9.04l3.35-2.59Z" />
      <path
        fill="#EA4335"
        d="M10 3.96c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.94 9.94 0 0 0 10 0 10 10 0 0 0 1.06 5.48l3.35 2.59C5.2 5.71 7.4 3.96 10 3.96Z"
      />
    </svg>
  );
}

/**
 * Bouton principal de la page: le funnel s'appuie sur Google (zéro
 * friction, pas d'étape "attends ton code par email") — l'email OTP reste
 * en repli secondaire. Rendu volontairement au format bouton natif Google
 * (fond blanc, contour, logo) pour rester immédiatement reconnaissable et
 * ressortir par contraste face au reste de l'UI.
 */
export function GoogleButton({ redirectTo }: { redirectTo: string }) {
  const [loading, setLoading] = useState(false);

  async function signInWithGoogle() {
    const supabase = createClient();
    if (!supabase) return;
    setLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}` },
    });
    // La redirection vers Google prend le relais — pas besoin de désactiver
    // le loading, la page va naviguer.
  }

  return (
    <button
      type="button"
      onClick={signInWithGoogle}
      disabled={loading}
      className="flex w-full items-center justify-center gap-3 rounded-[var(--radius-control)] border-2 border-[var(--color-border)] bg-white px-5 py-3.5 text-base font-bold text-[#1f1f1f] shadow-[0_2px_10px_rgba(0,0,0,0.08)] transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <GoogleLogo />
      {loading ? "Connexion..." : "Continuer avec Google"}
    </button>
  );
}
