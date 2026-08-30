import { timingSafeEqual } from "node:crypto";

/** Comparaison en temps constant — même raison que safeEqual dans lib/admin/auth.ts. */
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/** Vercel Cron envoie `Authorization: Bearer <CRON_SECRET>` automatiquement. */
export function isAuthorizedCronRequest(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = request.headers.get("authorization");
  if (!header) return false;
  return safeEqual(header, `Bearer ${secret}`);
}
