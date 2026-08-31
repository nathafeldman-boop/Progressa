import { prisma } from "@/lib/prisma";

export const FREE_DAILY_BASE = 5;
export const BONUS_PER_AD = 5;
const PARIS_TZ = "Europe/Paris";

/** Minuit Europe/Paris du jour courant — même piste que le reset horaire admin (jamais le fuseau serveur, UTC sur Vercel). */
export function startOfTodayParis(now: Date): Date {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: PARIS_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const year = parts.find((p) => p.type === "year")!.value;
  const month = parts.find((p) => p.type === "month")!.value;
  const day = parts.find((p) => p.type === "day")!.value;
  // Construit minuit Paris en calculant l'offset réel du jour (gère
  // l'heure d'été/hiver) plutôt qu'un décalage fixe UTC+1/+2 codé en dur.
  const noonUtcGuess = new Date(`${year}-${month}-${day}T12:00:00Z`);
  const parisHourAtNoonUtc = Number(
    new Intl.DateTimeFormat("en-US", { timeZone: PARIS_TZ, hour: "2-digit", hour12: false }).format(noonUtcGuess)
  );
  const offsetHours = parisHourAtNoonUtc - 12;
  const midnightUtcGuess = new Date(`${year}-${month}-${day}T00:00:00Z`).getTime();
  return new Date(midnightUtcGuess - offsetHours * 60 * 60 * 1000);
}

export interface BrianMessageQuota {
  unlimited: boolean;
  used: number;
  limit: number;
  remaining: number;
  adsWatchedToday: number;
}

/** Calcul pur (aucun accès DB) — isolé pour être testé directement (voir tests/rewarded-ads.test.ts). */
export function computeBrianMessageQuota(used: number, adsWatchedToday: number, isPremium: boolean): BrianMessageQuota {
  if (isPremium) return { unlimited: true, used: 0, limit: Infinity, remaining: Infinity, adsWatchedToday: 0 };
  const limit = FREE_DAILY_BASE + BONUS_PER_AD * adsWatchedToday;
  return { unlimited: false, used, limit, remaining: Math.max(0, limit - used), adsWatchedToday };
}

/**
 * Quota journalier de messages Coach Brian pour un joueur gratuit
 * (isPremiumActive=false). Calculé à partir des lignes réellement
 * persistées (BrianMessage, RewardedAdEvent) — jamais un compteur à part
 * qui pourrait désynchroniser: `used` recompté à chaque appel, donc
 * toujours exact même après un refresh ou un redémarrage serveur.
 */
export async function getBrianMessageQuota(userId: string, isPremium: boolean): Promise<BrianMessageQuota> {
  if (isPremium) return computeBrianMessageQuota(0, 0, true);

  const since = startOfTodayParis(new Date());
  const [used, adsWatchedToday] = await Promise.all([
    prisma.brianMessage.count({ where: { userId, fromPlayer: true, createdAt: { gte: since } } }),
    prisma.rewardedAdEvent.count({ where: { userId, kind: "BRIAN_MESSAGES", grantedAt: { gte: since } } }),
  ]);

  return computeBrianMessageQuota(used, adsWatchedToday, false);
}
