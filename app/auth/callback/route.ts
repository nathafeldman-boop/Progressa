import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { syncInternalUser } from "@/lib/auth";

/** Échange le code PKCE (OAuth Google, ou lien magique de confirmation email) contre une session. */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    if (supabase) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        // Crée la ligne User interne tout de suite — sans ça, ce joueur
        // reste invisible pour le reste de l'app tant qu'il n'a pas fini
        // l'onboarding, et se retrouve renvoyé sur la landing page.
        await syncInternalUser();
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/connexion`);
}
