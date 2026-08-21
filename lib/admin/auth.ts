import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";

// Volontairement minimal (section 8: "protégé par un secret, pas d'auth
// complexe nécessaire pour un usage solo/équipe restreinte") — mais le
// cookie ne contient jamais le secret en clair: c'est un jeton signé
// (HMAC) avec expiration, comparé en temps constant. Suffisant pour un
// dashboard interne à faible surface d'attaque, pas pour des données
// sensibles côté utilisateur final.
export const ADMIN_COOKIE_NAME = "admin_session";
export const ADMIN_SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12h

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/** Génère un jeton `expiresAt.hmac` signé avec le secret admin — jamais le secret lui-même. */
export function createAdminToken(secret: string, ttlMs: number = ADMIN_SESSION_TTL_MS): string {
  const payload = String(Date.now() + ttlMs);
  const mac = createHmac("sha256", secret).update(payload).digest("hex");
  return `${payload}.${mac}`;
}

function verifyAdminToken(secret: string, token: string): boolean {
  const [payload, mac] = token.split(".");
  if (!payload || !mac) return false;
  const expectedMac = createHmac("sha256", secret).update(payload).digest("hex");
  if (!safeEqual(mac, expectedMac)) return false;
  const expiresAt = Number(payload);
  return Number.isFinite(expiresAt) && Date.now() < expiresAt;
}

/** Comparaison en temps constant du secret saisi au login. */
export function verifyAdminSecret(candidate: string, secret: string): boolean {
  return safeEqual(candidate, secret);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const secret = process.env.ADMIN_DASHBOARD_SECRET;
  if (!secret) return false;
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return false;
  return verifyAdminToken(secret, token);
}
