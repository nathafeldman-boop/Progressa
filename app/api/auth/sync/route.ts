import { NextResponse } from "next/server";
import { syncInternalUser } from "@/lib/auth";

/**
 * Crée/retrouve la ligne User interne juste après l'authentification
 * Supabase — sans ça, un joueur connecté via OTP mais qui n'a jamais fini
 * l'onboarding (seul endroit qui appelait syncInternalUser() avant) reste
 * invisible pour le reste de l'app (getCurrentInternalUser() renvoie
 * null partout), ce qui le renvoie sur la landing page au lieu de son
 * compte. Idempotent — sans risque d'appeler plusieurs fois.
 */
export async function POST() {
  const user = await syncInternalUser();
  if (!user) return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  return NextResponse.json({ ok: true });
}
