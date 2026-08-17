"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

export function GoogleButton({ redirectTo }: { redirectTo: string }) {
  const [loading, setLoading] = useState(false);

  async function signInWithGoogle() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}` },
    });
    // La redirection vers Google prend le relais — pas besoin de désactiver
    // le loading, la page va naviguer.
  }

  return (
    <Button variant="secondary" className="w-full" onClick={signInWithGoogle} disabled={loading}>
      Continuer avec Google
    </Button>
  );
}
