import { cookies } from "next/headers";

// Volontairement minimal (section 8: "protégé par un secret, pas d'auth
// complexe nécessaire pour un usage solo/équipe restreinte"). Le cookie
// httpOnly contient directement le secret partagé — suffisant pour un
// dashboard interne à faible surface d'attaque, pas pour des données
// sensibles côté utilisateur final.
export const ADMIN_COOKIE_NAME = "admin_secret";

export async function isAdminAuthenticated(): Promise<boolean> {
  const secret = process.env.ADMIN_DASHBOARD_SECRET;
  if (!secret) return false;
  const store = await cookies();
  return store.get(ADMIN_COOKIE_NAME)?.value === secret;
}
